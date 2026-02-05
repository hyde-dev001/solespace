<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\PerformanceReview;
use App\Models\HR\PerformanceCycle;
use App\Models\HR\PerformanceGoal;
use App\Models\HR\CompetencyEvaluation;
use App\Models\Employee;
use App\Models\HR\AuditLog;
use App\Traits\HR\LogsHRActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PerformanceController extends Controller
{
    use LogsHRActivity;
    /**
     * Display a listing of performance reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee:id,first_name,last_name,department,position');

        // Apply search filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('review_period', 'like', "%{$searchTerm}%")
                  ->orWhere('reviewer_name', 'like', "%{$searchTerm}%")
                  ->orWhereHas('employee', function ($empQuery) use ($searchTerm) {
                      $empQuery->where('first_name', 'like', "%{$searchTerm}%")
                               ->orWhere('last_name', 'like', "%{$searchTerm}%")
                               ->orWhere('department', 'like', "%{$searchTerm}%")
                               ->orWhere('position', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('period')) {
            $query->forPeriod($request->period);
        }

        if ($request->filled('department')) {
            $query->whereHas('employee', function ($q) use ($request) {
                $q->where('department', $request->department);
            });
        }

        if ($request->filled('reviewer')) {
            $query->where('reviewer_name', 'like', '%' . $request->reviewer . '%');
        }

        $reviews = $query->orderBy('review_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($reviews);
    }

    /**
     * Store a newly created performance review.
     * 
     * Security: Validates reviewer authority
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
            'reviewer_id' => 'required|exists:employees,id',
            'reviewerName' => 'required|string|max:100',
            'reviewDate' => 'required|date',
            'reviewPeriod' => 'required|string|max:50',
            'rating' => 'required|integer|min:1|max:5',
            'communication' => 'required|integer|min:1|max:5',
            'teamwork' => 'required|integer|min:1|max:5',
            'reliability' => 'required|integer|min:1|max:5',
            'productivity' => 'required|integer|min:1|max:5',
            'comments' => 'required|string|max:2000',
            'goals' => 'nullable|string|max:1000',
            'improvementAreas' => 'nullable|string|max:1000',
            'status' => 'required|in:draft,submitted,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->employee_id);

        // Check if reviewer belongs to the same shop owner
        $reviewer = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($request->reviewer_id);

        // Security Check: Validate reviewer authority
        if (!$this->canReviewEmployee($reviewer, $employee)) {
            \Log::warning('Unauthorized review assignment attempt', [
                'creator_id' => $user->id,
                'reviewer_id' => $request->reviewer_id,
                'employee_id' => $request->employee_id
            ]);
            return response()->json([
                'error' => 'The selected reviewer does not have authority to review this employee. Reviewer must be the employee\'s direct manager, HR staff, or senior management.'
            ], 403);
        }

        // Check for duplicate review in same period
        $existingReview = PerformanceReview::forEmployee($request->employee_id)
            ->forPeriod($request->reviewPeriod)
            ->first();

        if ($existingReview) {
            return response()->json([
                'error' => 'A performance review already exists for this employee in this period.'
            ], 422);
        }

        $data = $validator->validated();
        $data['shop_owner_id'] = $user->shop_owner_id;

        $review = PerformanceReview::create($data);

        // Audit logging
        \Log::info('Performance review created', [
            'creator_id' => $user->id,
            'reviewer_id' => $request->reviewer_id,
            'employee_id' => $request->employee_id,
            'review_id' => $review->id,
            'period' => $request->reviewPeriod
        ]);

        return response()->json([
            'message' => 'Performance review created successfully',
            'review' => $review->load('employee')
        ], 201);
    }

    /**
     * Validate if a reviewer can review a specific employee.
     * Returns true if:
     * 1. Reviewer is the employee's direct manager
     * 2. Reviewer is in HR department
     * 3. Reviewer is senior management
     */
    private function canReviewEmployee($reviewer, $employee): bool
    {
        // Check 1: Direct manager
        if ($employee->manager_id === $reviewer->id) {
            return true;
        }

        // Check 2: HR department
        if ($reviewer->department === 'HR' || $reviewer->position === 'HR Manager') {
            return true;
        }

        // Check 3: Senior management positions
        $seniorPositions = ['CEO', 'COO', 'Director', 'VP', 'General Manager'];
        foreach ($seniorPositions as $position) {
            if (stripos($reviewer->position, $position) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Display the specified performance review.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        return response()->json($review);
    }

    /**
     * Update the specified performance review.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        // Only allow updates if status is draft or submitted
        if ($review->status === 'completed') {
            return response()->json([
                'error' => 'Cannot update completed performance review'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'reviewerName' => 'sometimes|required|string|max:100',
            'reviewDate' => 'sometimes|required|date',
            'reviewPeriod' => 'sometimes|required|string|max:50',
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'communication' => 'sometimes|required|integer|min:1|max:5',
            'teamwork' => 'sometimes|required|integer|min:1|max:5',
            'reliability' => 'sometimes|required|integer|min:1|max:5',
            'productivity' => 'sometimes|required|integer|min:1|max:5',
            'comments' => 'sometimes|required|string|max:2000',
            'goals' => 'nullable|string|max:1000',
            'improvementAreas' => 'nullable|string|max:1000',
            'status' => 'sometimes|required|in:draft,submitted,completed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review->update($validator->validated());

        return response()->json([
            'message' => 'Performance review updated successfully',
            'review' => $review->load('employee')
        ]);
    }

    /**
     * Remove the specified performance review.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        // Only allow deletion if status is draft
        if ($review->status !== 'draft') {
            return response()->json([
                'error' => 'Cannot delete performance review that is not draft'
            ], 422);
        }

        $review->delete();

        return response()->json(['message' => 'Performance review deleted successfully']);
    }

    /**
     * Submit a performance review.
     * 
     * Security: Validates that submitter is the assigned reviewer or HR/shop_owner
     */
    public function submit(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        $isAuthorized = $user->hasRole('Manager') || $user->can('view-employees') || $user->can('view-attendance') || $user->can('view-payroll');

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        // Security Check: Validate submitter is the assigned reviewer (if not HR/shop_owner)
        if (!$isAuthorized) {
            $reviewerEmployee = Employee::where('email', $user->email)
                ->where('shop_owner_id', $user->shop_owner_id)
                ->first();

            if (!$reviewerEmployee || $review->reviewer_id != $reviewerEmployee->id) {
                \Log::warning('Unauthorized performance review submission attempt', [
                    'user_id' => $user->id,
                    'review_id' => $id,
                    'assigned_reviewer_id' => $review->reviewer_id
                ]);
                return response()->json([
                    'error' => 'Unauthorized. Only the assigned reviewer can submit this performance review.'
                ], 403);
            }
        }

        // Business Logic: Check status
        if ($review->status !== 'draft') {
            return response()->json([
                'error' => 'Performance review is not in draft status'
            ], 422);
        }

        // Validate all ratings are within range
        $ratings = [
            $review->rating,
            $review->communication,
            $review->teamwork,
            $review->reliability,
            $review->productivity
        ];

        foreach ($ratings as $rating) {
            if ($rating < 1 || $rating > 5) {
                return response()->json([
                    'error' => 'All ratings must be between 1 and 5'
                ], 422);
            }
        }

        $review->update([
            'status' => 'submitted',
            'submitted_by' => $user->id,
            'submitted_at' => now()
        ]);

        // Audit logging
        \Log::info('Performance review submitted', [
            'submitter_id' => $user->id,
            'submitter_role' => $user->getRoleNames()->first(),
            'review_id' => $id,
            'employee_id' => $review->employee_id,
            'reviewer_id' => $review->reviewer_id,
            'rating' => $review->rating
        ]);

        return response()->json([
            'message' => 'Performance review submitted successfully',
            'review' => $review->load('employee')
        ]);
    }

    /**
     * Complete a performance review (final approval by HR/shop_owner).
     * 
     * Security: Only HR or shop_owner can mark reviews as completed
     */
    public function complete(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            \Log::warning('Unauthorized performance review completion attempt', [
                'user_id' => $user->id,
                'user_role' => $user->getRoleNames()->first(),
                'review_id' => $id
            ]);
            return response()->json([
                'error' => 'Unauthorized. Only Managers or users with HR permissions can complete performance reviews.'
            ], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee')
            ->findOrFail($id);

        // Business Logic: Check status
        if ($review->status !== 'submitted') {
            return response()->json([
                'error' => 'Performance review must be submitted before it can be completed'
            ], 422);
        }

        $review->update([
            'status' => 'completed',
            'completed_by' => $user->id,
            'completed_at' => now()
        ]);

        // Audit logging
        \Log::info('Performance review completed', [
            'completer_id' => $user->id,
            'completer_role' => $user->getRoleNames()->first(),
            'review_id' => $id,
            'employee_id' => $review->employee_id
        ]);

        return response()->json([
            'message' => 'Performance review completed successfully',
            'review' => $review->load('employee')
        ]);
    }

    /**
     * Get performance statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $totalReviews = PerformanceReview::forShopOwner($user->shop_owner_id)->count();
        $draftReviews = PerformanceReview::forShopOwner($user->shop_owner_id)->draft()->count();
        $submittedReviews = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->withStatus('submitted')->count();
        $completedReviews = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()->count();

        // Average ratings
        $avgRating = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->avg('rating');

        $avgCommunication = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->avg('communication');

        $avgTeamwork = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->avg('teamwork');

        $avgReliability = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->avg('reliability');

        $avgProductivity = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->avg('productivity');

        // Performance distribution
        $performanceDistribution = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->completed()
            ->selectRaw('
                SUM(CASE WHEN rating >= 4.5 THEN 1 ELSE 0 END) as exceptional,
                SUM(CASE WHEN rating >= 4.0 AND rating < 4.5 THEN 1 ELSE 0 END) as excellent,
                SUM(CASE WHEN rating >= 3.5 AND rating < 4.0 THEN 1 ELSE 0 END) as good,
                SUM(CASE WHEN rating >= 3.0 AND rating < 3.5 THEN 1 ELSE 0 END) as satisfactory,
                SUM(CASE WHEN rating >= 2.0 AND rating < 3.0 THEN 1 ELSE 0 END) as needs_improvement,
                SUM(CASE WHEN rating < 2.0 THEN 1 ELSE 0 END) as poor
            ')
            ->first();

        return response()->json([
            'totalReviews' => $totalReviews,
            'draftReviews' => $draftReviews,
            'submittedReviews' => $submittedReviews,
            'completedReviews' => $completedReviews,
            'averageRatings' => [
                'overall' => round($avgRating, 2),
                'communication' => round($avgCommunication, 2),
                'teamwork' => round($avgTeamwork, 2),
                'reliability' => round($avgReliability, 2),
                'productivity' => round($avgProductivity, 2),
            ],
            'performanceDistribution' => $performanceDistribution,
        ]);
    }

    /**
     * Get performance trend for an employee.
     */
    public function trend(Request $request, $employeeId): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if employee belongs to the same shop owner
        $employee = Employee::forShopOwner($user->shop_owner_id)
            ->findOrFail($employeeId);

        $limit = $request->get('limit', 5);
        $trend = PerformanceReview::getPerformanceTrend($employeeId, $limit);

        return response()->json([
            'employee' => $employee,
            'trend' => $trend
        ]);
    }

    /**
     * Get performance report.
     */
    public function report(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $period = $request->get('period');
        $department = $request->get('department');

        $query = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee:id,first_name,last_name,department')
            ->completed();

        if ($period) {
            $query->forPeriod($period);
        }

        if ($department) {
            $query->whereHas('employee', function ($q) use ($department) {
                $q->where('department', $department);
            });
        }

        $reviews = $query->orderBy('rating', 'desc')->get();

        // Group by department
        $byDepartment = $reviews->groupBy('employee.department')->map(function ($deptReviews) {
            return [
                'count' => $deptReviews->count(),
                'avgRating' => round($deptReviews->avg('rating'), 2),
                'avgCommunication' => round($deptReviews->avg('communication'), 2),
                'avgTeamwork' => round($deptReviews->avg('teamwork'), 2),
                'avgReliability' => round($deptReviews->avg('reliability'), 2),
                'avgProductivity' => round($deptReviews->avg('productivity'), 2),
            ];
        });

        // Top performers
        $topPerformers = $reviews->sortByDesc('rating')->take(10)->values();

        // Improvement needed
        $improvementNeeded = $reviews->where('rating', '<', 3.0)->sortBy('rating')->values();

        return response()->json([
            'totalReviews' => $reviews->count(),
            'byDepartment' => $byDepartment,
            'topPerformers' => $topPerformers,
            'improvementNeeded' => $improvementNeeded,
            'overallAverage' => round($reviews->avg('rating'), 2),
        ]);
    }

    /**
     * ==========================================
     * PERFORMANCE CYCLE MANAGEMENT
     * ==========================================
     */

    /**
     * Get all performance cycles
     */
    public function getCycles(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        // Check if user is Manager or has any HR-related permissions
        if (!$user->hasRole('Manager') && !$user->can('view-employees') && !$user->can('view-attendance') && !$user->can('view-payroll')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = PerformanceCycle::forShopOwner($user->shop_owner_id);

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        $cycles = $query->orderBy('start_date', 'desc')->get();

        return response()->json($cycles);
    }

    /**
     * Create a new performance cycle
     */
    public function createCycle(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'cycle_type' => 'required|in:annual,quarterly,monthly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'self_review_deadline' => 'required|date|after:start_date|before:end_date',
            'manager_review_deadline' => 'required|date|after:self_review_deadline|before_or_equal:end_date',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cycle = PerformanceCycle::create([
            'shop_owner_id' => $user->shop_owner_id,
            'name' => $request->name,
            'cycle_type' => $request->cycle_type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'self_review_deadline' => $request->self_review_deadline,
            'manager_review_deadline' => $request->manager_review_deadline,
            'description' => $request->description,
            'status' => 'draft',
        ]);

        $this->logActivity('create', 'PerformanceCycle', $cycle->id, "Created performance cycle: {$cycle->name}");

        return response()->json([
            'message' => 'Performance cycle created successfully',
            'cycle' => $cycle,
        ], 201);
    }

    /**
     * Update performance cycle
     */
    public function updateCycle(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cycle = PerformanceCycle::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'self_review_deadline' => 'sometimes|date',
            'manager_review_deadline' => 'sometimes|date',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $cycle->update($request->only([
            'name', 'start_date', 'end_date', 
            'self_review_deadline', 'manager_review_deadline', 
            'description'
        ]));

        $this->logActivity('update', 'PerformanceCycle', $cycle->id, "Updated performance cycle: {$cycle->name}");

        return response()->json([
            'message' => 'Performance cycle updated successfully',
            'cycle' => $cycle,
        ]);
    }

    /**
     * Activate performance cycle
     */
    public function activateCycle($id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cycle = PerformanceCycle::forShopOwner($user->shop_owner_id)->findOrFail($id);

        if ($cycle->activate()) {
            $this->logActivity('update', 'PerformanceCycle', $cycle->id, "Activated performance cycle: {$cycle->name}");
            
            return response()->json([
                'message' => 'Performance cycle activated successfully',
                'cycle' => $cycle,
            ]);
        }

        return response()->json(['error' => 'Cannot activate cycle'], 400);
    }

    /**
     * Complete performance cycle
     */
    public function completeCycle($id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cycle = PerformanceCycle::forShopOwner($user->shop_owner_id)->findOrFail($id);

        if ($cycle->complete()) {
            $this->logActivity('update', 'PerformanceCycle', $cycle->id, "Completed performance cycle: {$cycle->name}");
            
            return response()->json([
                'message' => 'Performance cycle completed successfully',
                'cycle' => $cycle,
            ]);
        }

        return response()->json(['error' => 'Cannot complete cycle'], 400);
    }

    /**
     * ==========================================
     * PERFORMANCE GOALS MANAGEMENT
     * ==========================================
     */

    /**
     * Get goals for an employee in a cycle
     */
    public function getGoals(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();

        $query = PerformanceGoal::forShopOwner($user->shop_owner_id);

        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('cycle_id')) {
            $query->forCycle($request->cycle_id);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
        }

        $goals = $query->with(['employee', 'cycle'])->get();

        return response()->json($goals);
    }

    /**
     * Create a performance goal
     */
    public function createGoal(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if (!in_array($user->role, ['HR', 'shop_owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'cycle_id' => 'required|exists:hr_performance_cycles,id',
            'employee_id' => 'required|exists:employees,id',
            'goal_description' => 'required|string',
            'target_value' => 'nullable|string|max:100',
            'weight' => 'required|numeric|min:0|max:100',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $goal = PerformanceGoal::create([
            'shop_owner_id' => $user->shop_owner_id,
            'cycle_id' => $request->cycle_id,
            'employee_id' => $request->employee_id,
            'goal_description' => $request->goal_description,
            'target_value' => $request->target_value,
            'weight' => $request->weight,
            'due_date' => $request->due_date,
            'status' => 'not_started',
        ]);

        $this->logActivity('create', 'PerformanceGoal', $goal->id, "Created performance goal for employee ID: {$goal->employee_id}");

        return response()->json([
            'message' => 'Performance goal created successfully',
            'goal' => $goal,
        ], 201);
    }

    /**
     * Update goal progress
     */
    public function updateGoalProgress(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();

        $goal = PerformanceGoal::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'progress_notes' => 'required|string',
            'actual_value' => 'nullable|numeric',
            'status' => 'sometimes|in:not_started,in_progress,achieved,not_achieved',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $goal->updateProgress(
            $request->progress_notes,
            $request->actual_value
        );

        if ($request->filled('status')) {
            $goal->status = $request->status;
            $goal->save();
        }

        $this->logActivity('update', 'PerformanceGoal', $goal->id, "Updated goal progress");

        return response()->json([
            'message' => 'Goal progress updated successfully',
            'goal' => $goal,
        ]);
    }

    /**
     * Rate a goal (self or manager)
     */
    public function rateGoal(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();

        $goal = PerformanceGoal::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rating_type' => 'required|in:self,manager',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->rating_type === 'self') {
            $goal->submitSelfRating($request->rating);
        } else {
            $goal->submitManagerRating($request->rating);
        }

        $this->logActivity('update', 'PerformanceGoal', $goal->id, "Submitted {$request->rating_type} rating");

        return response()->json([
            'message' => 'Goal rating submitted successfully',
            'goal' => $goal,
        ]);
    }

    /**
     * ==========================================
     * COMPETENCY EVALUATIONS MANAGEMENT
     * ==========================================
     */

    /**
     * Get competency evaluations for a review
     */
    public function getCompetencies(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();

        $query = CompetencyEvaluation::forShopOwner($user->shop_owner_id);

        if ($request->filled('review_id')) {
            $query->forReview($request->review_id);
        }

        if ($request->filled('cycle_id')) {
            $query->forCycle($request->cycle_id);
        }

        $competencies = $query->with(['review', 'cycle'])->get();

        return response()->json($competencies);
    }

    /**
     * Create competency evaluation
     */
    public function createCompetency(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if (!in_array($user->role, ['HR', 'shop_owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'review_id' => 'required|exists:performance_reviews,id',
            'cycle_id' => 'nullable|exists:hr_performance_cycles,id',
            'competency_name' => 'required|string|max:100',
            'competency_description' => 'nullable|string',
            'weight' => 'required|numeric|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $competency = CompetencyEvaluation::create([
            'shop_owner_id' => $user->shop_owner_id,
            'review_id' => $request->review_id,
            'cycle_id' => $request->cycle_id,
            'competency_name' => $request->competency_name,
            'competency_description' => $request->competency_description,
            'weight' => $request->weight,
        ]);

        $this->logActivity('create', 'CompetencyEvaluation', $competency->id, "Created competency evaluation: {$competency->competency_name}");

        return response()->json([
            'message' => 'Competency evaluation created successfully',
            'competency' => $competency,
        ], 201);
    }

    /**
     * Rate a competency
     */
    public function rateCompetency(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();

        $competency = CompetencyEvaluation::forShopOwner($user->shop_owner_id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rating_type' => 'required|in:self,manager,calibrated',
            'rating' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->rating_type === 'self') {
            $competency->submitSelfRating($request->rating, $request->comments);
        } elseif ($request->rating_type === 'manager') {
            $competency->submitManagerRating($request->rating, $request->comments);
        } elseif ($request->rating_type === 'calibrated') {
            $competency->calibrate($request->rating);
        }

        $this->logActivity('update', 'CompetencyEvaluation', $competency->id, "Submitted {$request->rating_type} rating");

        return response()->json([
            'message' => 'Competency rating submitted successfully',
            'competency' => $competency,
        ]);
    }

    /**
     * Get cycle statistics
     */
    public function getCycleStatistics($cycleId): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if (!in_array($user->role, ['HR', 'shop_owner'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cycle = PerformanceCycle::forShopOwner($user->shop_owner_id)->findOrFail($cycleId);

        $goalStats = PerformanceGoal::getCycleStatistics($cycleId);
        $competencyAverages = CompetencyEvaluation::getCycleCompetencyAverages($cycleId);

        return response()->json([
            'cycle' => $cycle,
            'goal_statistics' => $goalStats,
            'competency_averages' => $competencyAverages,
            'progress_percentage' => $cycle->getProgressPercentage(),
        ]);
    }
}