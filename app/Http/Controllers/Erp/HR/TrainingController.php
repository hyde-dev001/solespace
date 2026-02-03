<?php

namespace App\Http\Controllers\ERP\HR;

use App\Http\Controllers\Controller;
use App\Models\TrainingProgram;
use App\Models\TrainingSession;
use App\Models\TrainingEnrollment;
use App\Models\Certification;
use App\Models\Employee;
use App\Services\HR\TrainingService;
use App\Notifications\HR\TrainingEnrolled;
use App\Notifications\HR\TrainingSessionScheduled;
use App\Notifications\HR\TrainingCompleted;
use App\Notifications\HR\CertificationIssued;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TrainingController extends Controller
{
    protected TrainingService $trainingService;

    public function __construct(TrainingService $trainingService)
    {
        $this->trainingService = $trainingService;
    }
    /**
     * Get all training programs
     */
    public function index(Request $request)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;
            $perPage = $request->input('per_page', 20);

            $query = TrainingProgram::where('shop_owner_id', $shopOwnerId);

            // Filters
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('is_mandatory')) {
                $query->where('is_mandatory', $request->boolean('is_mandatory'));
            }

            if ($request->has('search')) {
                $query->where(function ($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
                });
            }

            $programs = $query->withCount(['enrollments', 'activeEnrollments', 'completedEnrollments'])
                             ->orderBy('created_at', 'desc')
                             ->paginate($perPage);

            return response()->json([
                'success' => true,
                'programs' => $programs->items(),
                'pagination' => [
                    'current_page' => $programs->currentPage(),
                    'per_page' => $programs->perPage(),
                    'total' => $programs->total(),
                    'last_page' => $programs->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch training programs', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch programs'], 500);
        }
    }

    /**
     * Store new training program
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'category' => 'required|in:technical,soft_skills,compliance,leadership,safety,product,other',
                'delivery_method' => 'required|in:classroom,online,hybrid,workshop,seminar,self_paced',
                'duration_hours' => 'nullable|integer|min:1',
                'cost' => 'nullable|numeric|min:0',
                'max_participants' => 'nullable|integer|min:1',
                'prerequisites' => 'nullable|string',
                'learning_objectives' => 'nullable|string',
                'instructor_name' => 'nullable|string|max:255',
                'instructor_email' => 'nullable|email',
                'is_mandatory' => 'boolean',
                'is_active' => 'boolean',
                'issues_certificate' => 'boolean',
                'certificate_validity_months' => 'nullable|integer|min:1',
            ]);

            $validated['shop_owner_id'] = auth()->user()->shop_owner_id;

            $program = TrainingProgram::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Training program created successfully',
                'program' => $program,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create training program', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to create program'], 500);
        }
    }

    /**
     * Get specific training program
     */
    public function show($id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $program = TrainingProgram::where('shop_owner_id', $shopOwnerId)
                                     ->with(['sessions', 'enrollments.employee'])
                                     ->withCount(['enrollments', 'activeEnrollments', 'completedEnrollments'])
                                     ->findOrFail($id);

            return response()->json([
                'success' => true,
                'program' => $program,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch training program', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Program not found'], 404);
        }
    }

    /**
     * Update training program
     */
    public function update(Request $request, $id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $program = TrainingProgram::where('shop_owner_id', $shopOwnerId)->findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'category' => 'sometimes|in:technical,soft_skills,compliance,leadership,safety,product,other',
                'delivery_method' => 'sometimes|in:classroom,online,hybrid,workshop,seminar,self_paced',
                'duration_hours' => 'nullable|integer|min:1',
                'cost' => 'nullable|numeric|min:0',
                'max_participants' => 'nullable|integer|min:1',
                'prerequisites' => 'nullable|string',
                'learning_objectives' => 'nullable|string',
                'instructor_name' => 'nullable|string|max:255',
                'instructor_email' => 'nullable|email',
                'is_mandatory' => 'boolean',
                'is_active' => 'boolean',
                'issues_certificate' => 'boolean',
                'certificate_validity_months' => 'nullable|integer|min:1',
            ]);

            $program->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Training program updated successfully',
                'program' => $program->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update training program', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to update program'], 500);
        }
    }

    /**
     * Delete training program
     */
    public function destroy($id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $program = TrainingProgram::where('shop_owner_id', $shopOwnerId)->findOrFail($id);

            // Check if there are active enrollments
            $activeEnrollments = $program->activeEnrollments()->count();
            if ($activeEnrollments > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete program with {$activeEnrollments} active enrollments",
                ], 400);
            }

            $program->delete();

            return response()->json([
                'success' => true,
                'message' => 'Training program deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete training program', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to delete program'], 500);
        }
    }

    /**
     * Get all training sessions
     */
    public function sessions(Request $request)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $query = TrainingSession::where('shop_owner_id', $shopOwnerId)
                                   ->with('program');

            // Filters
            if ($request->has('program_id')) {
                $query->where('training_program_id', $request->program_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('upcoming')) {
                $query->upcoming();
            }

            $sessions = $query->orderBy('start_date', 'asc')->get();

            return response()->json([
                'success' => true,
                'sessions' => $sessions,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch training sessions', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch sessions'], 500);
        }
    }

    /**
     * Create training session
     */
    public function storeSession(Request $request)
    {
        try {
            $validated = $request->validate([
                'training_program_id' => 'required|exists:hr_training_programs,id',
                'session_name' => 'required|string|max:255',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after_or_equal:start_date',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
                'location' => 'nullable|string',
                'online_meeting_link' => 'nullable|url',
                'available_seats' => 'nullable|integer|min:1',
                'instructor_name' => 'nullable|string',
                'session_notes' => 'nullable|string',
            ]);

            $shopOwnerId = auth()->user()->shop_owner_id;

            // Verify program belongs to this shop
            $program = TrainingProgram::where('shop_owner_id', $shopOwnerId)
                                     ->findOrFail($validated['training_program_id']);

            $validated['shop_owner_id'] = $shopOwnerId;
            $validated['status'] = 'scheduled';
            $validated['enrolled_count'] = 0;

            $session = TrainingSession::create($validated);

            // Notify enrolled employees about the session
            try {
                if (isset($validated['training_session_id'])) {
                    $enrollments = TrainingEnrollment::where('training_session_id', $session->id)
                                                    ->with('employee.user')
                                                    ->get();
                    
                    foreach ($enrollments as $enrollment) {
                        if ($enrollment->employee && $enrollment->employee->user) {
                            $enrollment->employee->user->notify(new TrainingSessionScheduled($session, $program));
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to send session scheduled notifications', [
                    'session_id' => $session->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Training session created successfully',
                'session' => $session->load('program'),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create training session', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to create session'], 500);
        }
    }

    /**
     * Update training session
     */
    public function updateSession(Request $request, $id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $session = TrainingSession::where('shop_owner_id', $shopOwnerId)->findOrFail($id);

            $validated = $request->validate([
                'session_name' => 'sometimes|string|max:255',
                'start_date' => 'sometimes|date',
                'end_date' => 'sometimes|date|after_or_equal:start_date',
                'start_time' => 'nullable|date_format:H:i',
                'end_time' => 'nullable|date_format:H:i',
                'location' => 'nullable|string',
                'online_meeting_link' => 'nullable|url',
                'available_seats' => 'nullable|integer|min:1',
                'status' => 'sometimes|in:scheduled,ongoing,completed,cancelled',
                'instructor_name' => 'nullable|string',
                'session_notes' => 'nullable|string',
            ]);

            $session->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Session updated successfully',
                'session' => $session->fresh()->load('program'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update session', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to update session'], 500);
        }
    }

    /**
     * Delete training session
     */
    public function destroySession($id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $session = TrainingSession::where('shop_owner_id', $shopOwnerId)->findOrFail($id);

            if ($session->enrolled_count > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete session with {$session->enrolled_count} enrollments",
                ], 400);
            }

            $session->delete();

            return response()->json([
                'success' => true,
                'message' => 'Session deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete session', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to delete session'], 500);
        }
    }

    /**
     * Get all enrollments
     */
    public function enrollments(Request $request)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;
            $perPage = $request->input('per_page', 20);

            $query = TrainingEnrollment::where('shop_owner_id', $shopOwnerId)
                                      ->with(['program', 'employee', 'session']);

            // Filters
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('program_id')) {
                $query->where('training_program_id', $request->program_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $enrollments = $query->orderBy('created_at', 'desc')
                                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'enrollments' => $enrollments->items(),
                'pagination' => [
                    'current_page' => $enrollments->currentPage(),
                    'per_page' => $enrollments->perPage(),
                    'total' => $enrollments->total(),
                    'last_page' => $enrollments->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch enrollments', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch enrollments'], 500);
        }
    }

    /**
     * Enroll employee in training
     */
    public function enroll(Request $request)
    {
        try {
            $validated = $request->validate([
                'training_program_id' => 'required|exists:hr_training_programs,id',
                'employee_id' => 'required|exists:employees,id',
                'training_session_id' => 'nullable|exists:hr_training_sessions,id',
            ]);

            $shopOwnerId = auth()->user()->shop_owner_id;

            // Verify program and employee belong to this shop
            $program = TrainingProgram::where('shop_owner_id', $shopOwnerId)
                                     ->findOrFail($validated['training_program_id']);

            $employee = Employee::where('shop_owner_id', $shopOwnerId)
                               ->findOrFail($validated['employee_id']);

            // Get session if specified
            $session = null;
            if (isset($validated['training_session_id'])) {
                $session = TrainingSession::findOrFail($validated['training_session_id']);
            }

            // Use service to handle enrollment logic
            $enrollment = $this->trainingService->enrollEmployee(
                $employee,
                $program,
                $session,
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'Employee enrolled successfully',
                'enrollment' => $enrollment->load(['program', 'employee', 'session']),
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Failed to enroll employee', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update enrollment status
     */
    public function updateEnrollment(Request $request, $id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $enrollment = TrainingEnrollment::where('shop_owner_id', $shopOwnerId)->findOrFail($id);

            $validated = $request->validate([
                'status' => 'sometimes|in:enrolled,in_progress,completed,failed,cancelled,no_show',
                'progress_percentage' => 'sometimes|integer|min:0|max:100',
                'assessment_score' => 'nullable|numeric|min:0|max:100',
                'passed' => 'nullable|boolean',
                'feedback' => 'nullable|string',
                'attendance_hours' => 'sometimes|integer|min:0',
                'completion_notes' => 'nullable|string',
            ]);

            $enrollment->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Enrollment updated successfully',
                'enrollment' => $enrollment->fresh()->load(['program', 'employee']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update enrollment', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to update enrollment'], 500);
        }
    }

    /**
     * Mark enrollment as completed
     */
    public function completeEnrollment(Request $request, $id)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $enrollment = TrainingEnrollment::where('shop_owner_id', $shopOwnerId)
                                           ->with(['program', 'employee'])
                                           ->findOrFail($id);

            $validated = $request->validate([
                'assessment_score' => 'nullable|numeric|min:0|max:100',
                'passed' => 'required|boolean',
                'completion_notes' => 'nullable|string',
            ]);

            // Use service to handle completion logic
            $result = $this->trainingService->completeTraining(
                $enrollment,
                $validated['assessment_score'] ?? null,
                $validated['passed'],
                $validated['completion_notes'] ?? null
            );

            return response()->json([
                'success' => true,
                'message' => 'Training completed successfully',
                'enrollment' => $result['enrollment'],
                'certificate' => $result['certificate']
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to complete enrollment', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get employee certifications
     */
    public function certifications(Request $request)
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $query = Certification::where('shop_owner_id', $shopOwnerId)
                                 ->with(['employee', 'enrollment.program']);

            // Filters
            if ($request->has('employee_id')) {
                $query->where('employee_id', $request->employee_id);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('expiring_soon')) {
                $query->expiringSoon(30);
            }

            $certifications = $query->orderBy('issue_date', 'desc')->get();

            return response()->json([
                'success' => true,
                'certifications' => $certifications,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch certifications', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch certifications'], 500);
        }
    }

    /**
     * Get training statistics
     */
    public function statistics()
    {
        try {
            $shopOwnerId = auth()->user()->shop_owner_id;

            $stats = [
                'total_programs' => TrainingProgram::where('shop_owner_id', $shopOwnerId)->count(),
                'active_programs' => TrainingProgram::where('shop_owner_id', $shopOwnerId)->active()->count(),
                'mandatory_programs' => TrainingProgram::where('shop_owner_id', $shopOwnerId)->mandatory()->count(),
                'total_enrollments' => TrainingEnrollment::where('shop_owner_id', $shopOwnerId)->count(),
                'active_enrollments' => TrainingEnrollment::where('shop_owner_id', $shopOwnerId)->active()->count(),
                'completed_enrollments' => TrainingEnrollment::where('shop_owner_id', $shopOwnerId)->completed()->count(),
                'completion_rate' => 0,
                'total_certifications' => Certification::where('shop_owner_id', $shopOwnerId)->count(),
                'active_certifications' => Certification::where('shop_owner_id', $shopOwnerId)->active()->count(),
                'expiring_soon' => Certification::where('shop_owner_id', $shopOwnerId)->expiringSoon(30)->count(),
                'upcoming_sessions' => TrainingSession::where('shop_owner_id', $shopOwnerId)->upcoming()->count(),
                'by_category' => [],
                'by_delivery_method' => [],
            ];

            // Calculate completion rate
            $totalEnrollments = $stats['total_enrollments'];
            if ($totalEnrollments > 0) {
                $stats['completion_rate'] = round(($stats['completed_enrollments'] / $totalEnrollments) * 100, 2);
            }

            // Stats by category
            $stats['by_category'] = TrainingProgram::where('shop_owner_id', $shopOwnerId)
                                                  ->select('category', DB::raw('count(*) as count'))
                                                  ->groupBy('category')
                                                  ->pluck('count', 'category');

            // Stats by delivery method
            $stats['by_delivery_method'] = TrainingProgram::where('shop_owner_id', $shopOwnerId)
                                                         ->select('delivery_method', DB::raw('count(*) as count'))
                                                         ->groupBy('delivery_method')
                                                         ->pluck('count', 'delivery_method');

            return response()->json([
                'success' => true,
                'statistics' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch training statistics', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to fetch statistics'], 500);
        }
    }
}
