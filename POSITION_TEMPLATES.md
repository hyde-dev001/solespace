# Position Templates Feature

## Overview
Position Templates is an optional enhancement to the Spatie Permission System that provides **preset permission configurations** for common job positions. This feature dramatically reduces the time needed to set up new employees by allowing shop owners to apply a complete permission set with a single click.

## Purpose
- **Streamline onboarding**: Apply 10-17 permissions in one click instead of manually checking each one
- **Standardize permissions**: Ensure consistent permission sets across employees in the same role
- **Reduce errors**: Eliminate the risk of forgetting critical permissions during employee setup
- **Save time**: What took 2-3 minutes per employee now takes 5 seconds

## Available Templates

### Finance Category (4 templates)
1. **Cashier** (7 permissions)
   - Handle daily transactions and basic finance operations
   - view-invoices, view-expenses, view-journal-entries

2. **Bookkeeper** (10 permissions)
   - Record transactions and maintain financial records
   - create-invoices, create-expenses, create-journal-entries, generate-reports

3. **Accountant** (12 permissions)
   - Full accounting operations and reconciliation
   - All bookkeeper permissions + reconcile-accounts, manage-cost-centers

4. **Finance Manager** (14 permissions)
   - Complete financial management including approval
   - All accountant permissions + approve-expenses, manage-budgets

### HR Category (3 templates)
5. **HR Assistant** (5 permissions)
   - Basic HR administrative tasks
   - view-employees, view-attendance, view-leaves

6. **HR Coordinator** (10 permissions)
   - Coordinate HR operations and process requests
   - All HR assistant permissions + manage-attendance, process-payroll

7. **HR Manager** (16 permissions)
   - Full HR management and approval authority
   - All HR coordinator permissions + approve-leaves, manage-performance, configure-hr-settings

### CRM Category (2 templates)
8. **Sales Representative** (11 permissions)
   - Manage customer relationships and sales activities
   - manage-customers, manage-leads, create-opportunities, view-sales-reports

9. **Sales Manager** (17 permissions)
   - Oversee sales team and approve deals
   - All sales rep permissions + approve-discounts, manage-sales-team, configure-crm-settings

### Management Category (2 templates)
10. **Assistant Manager** (10 permissions)
    - Support daily operations across modules
    - view-reports, manage-daily-operations, basic module access

11. **General Manager** (17 permissions)
    - Broad operational oversight and approval authority
    - All assistant manager permissions + approve-expenses, approve-leaves, manage-employees

### Operations Category (2 templates)
12. **Inventory Clerk** (6 permissions)
    - Track inventory and process stock movements
    - view-inventory, update-stock-levels, generate-inventory-reports

13. **Service Technician** (7 permissions)
    - Handle repairs and service orders
    - view-repair-jobs, update-repair-status, manage-service-orders

## How to Use

### For Shop Owners

1. **Navigate to User Access Control**
   - Go to Shop Owner Dashboard
   - Click "User Access Control" in the sidebar

2. **Select an Employee**
   - Click "Manage Permissions" (key icon) next to any employee

3. **Apply a Template**
   - In the "Quick Apply Position Template" section (purple gradient box at top)
   - Select a template from the dropdown (e.g., "Cashier (7 permissions)")
   - Choose whether to:
     - ✅ **Keep existing permissions** (merge template with current permissions)
     - ❌ **Replace all permissions** (remove existing, apply only template permissions)
   - Click "Apply Template"

4. **Review and Adjust**
   - Template permissions are now applied to the employee
   - You can still add/remove individual permissions below if needed
   - Click "Save Changes" when done

### Example Workflow

**Scenario**: Hiring a new bookkeeper named Sarah

**Old Way** (2-3 minutes):
1. Open permission modal for Sarah
2. Manually scroll through 63 permissions
3. Check 10 specific bookkeeper permissions:
   - ☑ view-invoices
   - ☑ create-invoices
   - ☑ edit-invoices
   - ☑ view-expenses
   - ☑ create-expenses
   - ☑ view-journal-entries
   - ☑ create-journal-entries
   - ☑ generate-reports
   - ☑ view-accounts
   - ☑ view-transactions
4. Save changes

**New Way** (5 seconds):
1. Open permission modal for Sarah
2. Select "Bookkeeper (10 permissions)" from dropdown
3. Click "Apply Template"
4. Done! ✅

## Technical Details

### Database Structure

```sql
-- Position templates table
CREATE TABLE position_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category ENUM('Finance', 'HR', 'CRM', 'Management', 'Operations'),
    recommended_role VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Position template permissions (many-to-many)
CREATE TABLE position_template_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    position_template_id BIGINT NOT NULL,
    permission_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (position_template_id) REFERENCES position_templates(id) ON DELETE CASCADE
);
```

### API Endpoints

```php
// Get all active position templates
GET /shop-owner/position-templates
Response: {
    templates: [
        {
            id: 1,
            name: "Cashier",
            slug: "cashier",
            description: "Handle daily transactions...",
            category: "Finance",
            recommended_role: "Staff",
            permissions: ["view-invoices", "view-expenses", ...],
            permission_count: 7,
            usage_count: 12
        },
        // ... more templates
    ],
    grouped: {
        Finance: [...],
        HR: [...],
        CRM: [...],
        Management: [...],
        Operations: [...]
    }
}

// Apply template to employee
POST /shop-owner/employees/{userId}/apply-template
Body: {
    template_id: 1,
    preserve_existing: true  // merge vs replace
}
Response: {
    success: true,
    message: "Applied 'Cashier' template to John Doe",
    template: {
        name: "Cashier",
        permissions_count: 7
    },
    allPermissions: ["view-invoices", ...],  // all permissions user now has
    directPermissions: ["view-invoices", ...]  // only direct permissions
}
```

### Model Usage

```php
use App\Models\PositionTemplate;
use App\Models\User;

// Get all active templates
$templates = PositionTemplate::active()->get();

// Get templates by category
$financeTemplates = PositionTemplate::active()
    ->category('Finance')
    ->get();

// Apply template to user (merge with existing)
$template = PositionTemplate::find(1);
$user = User::find(123);
$appliedPermissions = $template->applyToUser($user, true);

// Apply template to user (replace all)
$appliedPermissions = $template->applyToUser($user, false);
```

## Benefits

### For Shop Owners
- ⚡ **90% faster employee onboarding**
- ✅ **Consistent permission sets** across employees
- 🎯 **Fewer permission-related errors**
- 📊 **Track which templates are most used**

### For Employees
- 🚀 **Faster access** to necessary tools
- 🔒 **Appropriate permissions** from day one
- 🎓 **Clear job expectations** based on template

### For System
- 📈 **Scalable permission management**
- 🔄 **Easy to update** standard permission sets
- 📊 **Audit-friendly** with template application logs
- 🏗️ **Optional enhancement** - doesn't break existing system

## Files Created

### Backend
- `database/migrations/2026_02_05_001000_create_position_templates_table.php` - Database schema
- `app/Models/PositionTemplate.php` - Main model with applyToUser() method
- `app/Models/PositionTemplatePermission.php` - Pivot model
- `database/seeders/PositionTemplatesSeeder.php` - Seed 13 templates
- `app/Http/Controllers/ShopOwner/UserAccessControlController.php` - Added 2 methods:
  - `getPositionTemplates()` - List templates API
  - `applyPositionTemplate()` - Apply template API

### Frontend
- `resources/js/Pages/ShopOwner/UserAccessControl.tsx` - Updated with:
  - Position template state management
  - Fetch templates on component mount
  - Apply template function
  - Template selection UI in permission modal

### Routes
- `routes/web.php` - Added 2 routes:
  - `GET /shop-owner/position-templates`
  - `POST /shop-owner/employees/{userId}/apply-template`

### Documentation
- `POSITION_TEMPLATES.md` (this file)

## Usage Statistics

Track which templates are most popular:
```php
$popularTemplates = PositionTemplate::orderBy('usage_count', 'desc')->take(5)->get();
```

Each time a template is applied, `usage_count` increments automatically.

## Future Enhancements

Potential improvements:
- 🔧 **Custom templates**: Allow shop owners to create their own templates
- 📊 **Template analytics**: Show which templates lead to better employee performance
- 🔄 **Template versioning**: Track changes to template permission sets over time
- 🎨 **Template icons**: Visual indicators for quick recognition
- 🏷️ **Template tags**: Additional categorization beyond the 5 main categories
- 📤 **Template export/import**: Share templates between shops

## Maintenance

### Adding a New Template

Edit `database/seeders/PositionTemplatesSeeder.php`:

```php
[
    'name' => 'New Position',
    'description' => 'Description of the role',
    'category' => 'Finance', // or HR, CRM, Management, Operations
    'recommended_role' => 'Staff', // Suggested Spatie role
    'permissions' => [
        'permission-1',
        'permission-2',
        // ...
    ],
],
```

Then run:
```bash
php artisan db:seed --class=PositionTemplatesSeeder
```

### Updating Template Permissions

Same process - edit the seeder and re-run. The seeder uses `updateOrCreate()` so it's idempotent (safe to run multiple times).

## Testing

Test the implementation:

```bash
# 1. Verify templates exist
php artisan tinker
>>> App\Models\PositionTemplate::count()
=> 13

# 2. Check a template's permissions
>>> $cashier = App\Models\PositionTemplate::where('slug', 'cashier')->first()
>>> $cashier->templatePermissions->pluck('permission_name')
=> ["view-invoices", "view-expenses", ...]

# 3. Apply template to a user
>>> $user = App\Models\User::find(123)
>>> $cashier->applyToUser($user, true)
=> ["view-invoices", "view-expenses", ...]

# 4. Verify user has the permissions
>>> $user->getAllPermissions()->pluck('name')
=> ["view-invoices", "view-expenses", ...]
```

## Troubleshooting

### Templates Not Loading in UI
- Check console for errors: `Failed to fetch position templates`
- Verify route is accessible: Visit `/shop-owner/position-templates` directly
- Check authentication: Must be logged in as Shop Owner

### Template Not Applying
- Verify employee has a valid `userId`
- Check if employee record is linked to User model via email
- Look for validation errors in browser console
- Check CSRF token is present

### Permissions Not Showing After Template Applied
- Refresh the permission modal after applying
- Check if permissions are in `directPermissions` array
- Verify template has permissions in database

## Audit Logging

Template applications are logged in the `audit_logs` table:

```php
AuditLog::create([
    'shop_owner_id' => $shopOwner->id,
    'actor_user_id' => $shopOwner->id,
    'action' => 'position_template_applied',
    'target_type' => 'user',
    'target_id' => $user->id,
    'metadata' => [
        'template_name' => 'Cashier',
        'template_id' => 1,
        'permissions_count' => 7,
        'preserve_existing' => true,
        'user_name' => 'John Doe',
        'user_email' => 'john@example.com',
    ],
]);
```

## Compatibility

- ✅ **Laravel 11**: Uses modern migration syntax
- ✅ **Spatie Permission**: Works alongside Spatie roles/permissions
- ✅ **Optional Enhancement**: Can be disabled without breaking existing system
- ✅ **Backward Compatible**: Employees without templates still work normally

## Summary

Position Templates solve the **permission management scalability problem** by:
1. Reducing employee setup time from minutes to seconds
2. Standardizing permissions across common job positions  
3. Eliminating manual permission selection errors
4. Providing an intuitive UI for permission management

This is a **huge time saver for onboarding** and makes the Spatie Permission System much more user-friendly for shop owners managing multiple employees.
