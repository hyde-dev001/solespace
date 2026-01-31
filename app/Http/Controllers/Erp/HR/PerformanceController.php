<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\PerformanceReview;
use App\Models\HR\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PerformanceController extends Controller
{
    /**
     * Display a listing of performance reviews.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee:id,firstName,lastName,department');

        // Apply filters
        if ($request->filled('employee_id')) {
            $query->forEmployee($request->employee_id);
        }

        if ($request->filled('status')) {
            $query->withStatus($request->status);
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
            $query->where('reviewerName', 'like', '%' . $request->reviewer . '%');
        }

        $reviews = $query->orderBy('reviewDate', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($reviews);
    }

    /**
     * Store a newly created performance review.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_id' => 'required|exists:employees,id',
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

        $data = $validator->validated();
        $data['shop_owner_id'] = $user->shop_owner_id;

        $review = PerformanceReview::create($data);

        return response()->json([
            'message' => 'Performance review created successfully',
            'review' => $review->load('employee')
        ], 201);
    }

    /**
     * Display the specified performance review.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
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
        
        if ($user->role !== 'HR') {
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
        
        if ($user->role !== 'HR') {
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
     */
    public function submit(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        if ($review->status !== 'draft') {
            return response()->json([
                'error' => 'Performance review is not in draft status'
            ], 422);
        }

        $review->submit();

        return response()->json([
            'message' => 'Performance review submitted successfully',
            'review' => $review->load('employee')
        ]);
    }

    /**
     * Complete a performance review.
     */
    public function complete(Request $request, $id): JsonResponse
    {
        $user = Auth::guard('user')->user();
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $review = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->findOrFail($id);

        if ($review->status !== 'submitted') {
            return response()->json([
                'error' => 'Performance review is not submitted'
            ], 422);
        }

        $review->complete();

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
        
        if ($user->role !== 'HR') {
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
        
        if ($user->role !== 'HR') {
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
        
        if ($user->role !== 'HR') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $period = $request->get('period');
        $department = $request->get('department');

        $query = PerformanceReview::forShopOwner($user->shop_owner_id)
            ->with('employee:id,firstName,lastName,department')
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
}