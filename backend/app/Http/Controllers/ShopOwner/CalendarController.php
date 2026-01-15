<?php

namespace App\Http\Controllers\ShopOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ShopOwner\CalendarEvent;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CalendarController extends Controller
{
    /**
     * Display a listing of calendar events.
     */
    public function index()
    {
        $events = CalendarEvent::where('shop_owner_id', Auth::id())
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'events' => $events
        ]);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'calendar' => 'required|in:Danger,Success,Primary,Warning',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $event = CalendarEvent::create([
            'shop_owner_id' => Auth::id(),
            'title' => $request->title,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?? $request->start_date,
            'calendar' => $request->calendar,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event created successfully',
            'event' => $event
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show($id)
    {
        $event = CalendarEvent::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'event' => $event
        ]);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'calendar' => 'required|in:Danger,Success,Primary,Warning',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $event = CalendarEvent::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $event->update([
            'title' => $request->title,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date ?? $request->start_date,
            'calendar' => $request->calendar,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Event updated successfully',
            'event' => $event
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy($id)
    {
        $event = CalendarEvent::where('shop_owner_id', Auth::id())
            ->findOrFail($id);

        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }
}
