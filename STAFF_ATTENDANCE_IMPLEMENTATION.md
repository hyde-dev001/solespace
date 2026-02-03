# Staff/Manager Attendance Implementation

## Overview
Successfully implemented database-connected attendance tracking for staff and managers. Their attendance is now automatically saved to the `attendance_records` table and can be viewed by HR.

## Implementation Date
February 1, 2026

## What Was Implemented

### 1. Backend API Routes (`routes/api.php`)
Added new routes for staff/manager self-service attendance:

```php
Route::middleware(['role:STAFF,MANAGER,shop_owner'])->prefix('staff')->group(function () {
    Route::post('attendance/check-in', [AttendanceController::class, 'selfCheckIn']);
    Route::post('attendance/check-out', [AttendanceController::class, 'selfCheckOut']);
    Route::get('attendance/my-records', [AttendanceController::class, 'myRecords']);
    Route::get('attendance/status', [AttendanceController::class, 'checkStatus']);
});
```

**Endpoints:**
- `POST /api/staff/attendance/check-in` - Staff/manager can clock in
- `POST /api/staff/attendance/check-out` - Staff/manager can clock out
- `GET /api/staff/attendance/my-records` - Get their attendance history
- `GET /api/staff/attendance/status` - Check today's attendance status

### 2. Backend Controller Methods (`app/Http/Controllers/Erp/HR/AttendanceController.php`)
Added 4 new methods:

#### `selfCheckIn()`
- Allows staff/managers to check themselves in
- Automatically creates attendance record in `attendance_records` table
- Links to employee record via email match
- Determines status (present/late) based on 8:00 AM standard time
- Returns check-in confirmation with time

#### `selfCheckOut()`
- Allows staff/managers to check themselves out
- Calculates working hours automatically
- Updates existing attendance record
- Returns check-out confirmation with total hours worked

#### `myRecords()`
- Returns paginated attendance history for the logged-in user
- Supports date filtering (date range or month)
- Defaults to current month if no filter specified

#### `checkStatus()`
- Checks if user has already checked in/out today
- Returns current attendance status
- Used on page load to restore state

### 3. Frontend Integration (`resources/js/components/ERP/STAFF/timeIn.tsx`)
Updated the Staff attendance page to connect to the database:

**Features Added:**
- ✅ Auto-load attendance status on page load
- ✅ Fetch and display attendance history from database
- ✅ Clock in saves to database
- ✅ Clock out saves to database with automatic working hours calculation
- ✅ Loading states during API calls
- ✅ Success/error notifications using SweetAlert2
- ✅ Real-time status updates

**Key Functions:**
- `checkAttendanceStatus()` - Loads today's status on mount
- `fetchAttendanceRecords()` - Gets attendance history
- `handleClockIn()` - Sends check-in request to API
- `handleClockOut()` - Sends check-out request to API

## Database Table Structure

**Table:** `attendance_records`

| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| employee_id | bigint | Foreign key to employees table |
| shop_owner_id | bigint | Shop isolation |
| date | date | Attendance date |
| check_in_time | time | Clock in time (HH:MM) |
| check_out_time | time | Clock out time (HH:MM) |
| status | enum | 'present', 'absent', 'late', 'half_day' |
| working_hours | decimal(4,2) | Total hours worked |
| overtime_hours | decimal(4,2) | Overtime hours |
| biometric_id | varchar | Optional biometric ID |
| notes | text | Optional notes |
| created_at | timestamp | Record creation |
| updated_at | timestamp | Last update |

## How It Works

### Flow Diagram

```
Staff/Manager Page Load
    ↓
Check Attendance Status (GET /api/staff/attendance/status)
    ↓
Restore Clock In/Out State if Exists
    ↓
Fetch Attendance History (GET /api/staff/attendance/my-records)
    ↓
Display Current Status & History

User Clicks "Clock In"
    ↓
Send Check-In Request (POST /api/staff/attendance/check-in)
    ↓
Controller finds Employee by email
    ↓
Creates/Updates Record in attendance_records table
    ↓
Returns Success with Check-In Time
    ↓
Update UI & Show Success Message

User Clicks "Clock Out"
    ↓
Send Check-Out Request (POST /api/staff/attendance/check-out)
    ↓
Controller finds today's attendance record
    ↓
Calculates working hours
    ↓
Updates Record in attendance_records table
    ↓
Returns Success with Total Hours
    ↓
Update UI & Show Success Message
```

## Security Features

1. **Role-Based Access Control**
   - Only STAFF, MANAGER, and shop_owner roles can access endpoints
   - Middleware: `role:STAFF,MANAGER,shop_owner`

2. **Shop Isolation**
   - Users can only see/modify their own shop's data
   - Employee lookup by email within same shop_owner_id

3. **Employee Record Requirement**
   - Staff/managers must have an employee record with matching email
   - Prevents unauthorized attendance recording

4. **Duplicate Prevention**
   - Check-in: Prevents multiple check-ins per day
   - Check-out: Prevents multiple check-outs per day

## HR Integration

**HR Can View All Attendance:**
The existing HR attendance page (`/api/hr/attendance`) can fetch all attendance records including those created by staff/managers.

**Query Example:**
```php
// HR can see all attendance for their shop
GET /api/hr/attendance?employee_id=123&date_from=2026-02-01&date_to=2026-02-28
```

**Benefits for HR:**
- ✅ Real-time attendance tracking
- ✅ Automatic working hours calculation
- ✅ All records in one place (attendance_records table)
- ✅ Can filter by employee, date, department, status
- ✅ Can generate reports and statistics

## Testing Checklist

### Staff/Manager Side:
- [x] Can access attendance page at `/erp/staff/attendance`
- [x] Page loads attendance status on mount
- [x] Clock In button works and saves to database
- [x] Clock Out button works and saves to database
- [x] Attendance history displays correctly
- [x] Error messages show for invalid actions (e.g., double check-in)
- [x] Loading states appear during API calls

### HR Side:
- [x] HR can view staff/manager attendance in their attendance page
- [x] Attendance records show correct employee names
- [x] Working hours are calculated correctly
- [x] Status (present/late) is set correctly
- [x] Can filter by employee, date, department

### Database:
- [x] Records are created with correct shop_owner_id
- [x] Records link to correct employee_id
- [x] Check-in times are saved correctly
- [x] Check-out times are saved correctly
- [x] Working hours are calculated correctly

## API Response Examples

### Check-In Success
```json
{
  "message": "Checked in successfully",
  "attendance": {
    "id": 123,
    "date": "2026-02-01",
    "check_in_time": "08:15",
    "status": "late",
    "employee_name": "John Doe"
  }
}
```

### Check-Out Success
```json
{
  "message": "Checked out successfully",
  "attendance": {
    "id": 123,
    "date": "2026-02-01",
    "check_in_time": "08:15",
    "check_out_time": "17:30",
    "working_hours": 9.25,
    "status": "late"
  }
}
```

### My Records Response
```json
{
  "data": [
    {
      "id": 123,
      "employee_id": 45,
      "date": "2026-02-01",
      "check_in_time": "08:15",
      "check_out_time": "17:30",
      "working_hours": 9.25,
      "status": "late"
    }
  ],
  "current_page": 1,
  "per_page": 30,
  "total": 20
}
```

## Configuration

### Standard Work Time
Currently set to **8:00 AM**
- Clock in before 8:00 AM = Status: "present"
- Clock in after 8:00 AM = Status: "late"

**To Change:** Edit `selfCheckIn()` method in AttendanceController.php:
```php
$standardTime = Carbon::parse('08:00:00'); // Change this time
```

### Work Hours Calculation
Automatically calculated as:
```php
$workingHours = checkout_time - checkin_time
```

**Note:** Lunch breaks are tracked in the frontend but not yet deducted from working hours. To implement, add lunch duration tracking to the database.

## Future Enhancements

### Potential Features:
1. **Lunch Break Tracking**
   - Add lunch_start_time and lunch_end_time to attendance_records
   - Deduct lunch duration from working hours

2. **Overtime Tracking**
   - Automatic overtime calculation (hours > 8)
   - Save to overtime_hours field

3. **GPS Location**
   - Add location tracking for remote check-ins
   - Store lat/long in attendance_records

4. **Biometric Integration**
   - Support for fingerprint/face recognition
   - Save biometric_id field

5. **Notifications**
   - Email/SMS reminders to clock out
   - Notifications for late check-ins

6. **Mobile App**
   - React Native mobile app for on-the-go attendance

## Troubleshooting

### Issue: "No employee record found"
**Solution:** Ensure the user's email in the `users` table matches an email in the `employees` table for the same shop_owner_id.

### Issue: "You have already checked in today"
**Solution:** This is expected behavior. Users can only check in once per day. Check the attendance_records table to verify.

### Issue: Check-in/out not saving
**Solutions:**
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify CSRF token is present in the page
3. Check user has correct role (STAFF, MANAGER, or shop_owner)
4. Verify database connection

### Issue: HR can't see staff attendance
**Solution:** 
1. Verify records exist in attendance_records table
2. Check shop_owner_id matches between user and employee
3. Refresh HR attendance page
4. Check date filters

## Files Modified

1. `routes/api.php` - Added staff attendance routes
2. `app/Http/Controllers/Erp/HR/AttendanceController.php` - Added 4 new methods
3. `resources/js/components/ERP/STAFF/timeIn.tsx` - Connected to API

## Related Documentation

- [HR_MODULE_COMPREHENSIVE_ANALYSIS.md](HR_MODULE_COMPREHENSIVE_ANALYSIS.md) - Complete HR module overview
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Full API reference
- [EMPLOYEE_ACCOUNT_CREATION_COMPLETE.md](EMPLOYEE_ACCOUNT_CREATION_COMPLETE.md) - Employee setup guide

## Support

For issues or questions:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify database connections
4. Review this documentation

---

**Status:** ✅ Fully Implemented and Working
**Last Updated:** February 1, 2026
