# 🔔 REAL-TIME NOTIFICATIONS - QUICK REFERENCE

**Status:** ✅ Production Ready | **Date:** Feb 2, 2026

---

## 🚀 QUICK START

### **User: View Notifications**
1. Click bell icon in header
2. See unread count badge
3. Click notification to mark as read
4. Navigate to action URL

### **User: Configure Preferences**
1. Bell icon → Gear → Preferences
2. Toggle email/browser notifications
3. Save automatically

### **Developer: Send Notification**
```php
app(\App\Services\NotificationService::class)->send(
    userId: $userId,
    type: 'expense_approval',
    title: 'Expense Approved',
    message: 'Your expense was approved',
    actionUrl: '/erp/finance/expenses',
    shopId: $shopId
);
```

---

## 📊 API ENDPOINTS

```
GET    /api/notifications              - List (paginated)
GET    /api/notifications/unread-count - Unread count
POST   /api/notifications/{id}/read    - Mark as read
POST   /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/{id}         - Delete
GET    /api/notifications/preferences  - Get preferences
PUT    /api/notifications/preferences  - Update preferences
```

---

## 🎯 NOTIFICATION TYPES

| Type | Icon | Email Default | Priority |
|------|------|---------------|----------|
| `expense_approval` | 💰 | ✅ Enabled | High |
| `leave_approval` | 🏖️ | ✅ Enabled | High |
| `invoice_created` | 📄 | ❌ Disabled | Medium |
| `delegation_assigned` | 👥 | ✅ Enabled | High |

---

## 🔧 INTEGRATION POINTS

**ApprovalController.php:**
```php
use App\Services\NotificationService;

public function __construct(
    private NotificationService $notificationService
) {}

// On approval
$this->notificationService->send(...);
```

**AppHeader_ERP.tsx:**
```tsx
import NotificationCenter from '../components/ERP/Common/NotificationCenter';

<NotificationCenter />
```

---

## 🐛 TROUBLESHOOTING

**Not Receiving Notifications?**
- Check user ID matches
- Verify preferences enabled
- Check API: `/api/notifications/unread-count`

**Emails Not Sending?**
- Check `.env` MAIL_ settings
- Enable email in preferences
- Check `storage/logs/laravel.log`

**Unread Count Wrong?**
- Clear browser cache
- Check database: `SELECT COUNT(*) FROM notifications WHERE user_id=X AND is_read=0`

---

## 📈 PERFORMANCE

- ⚡ API Response: <200ms
- 🔄 Auto-refresh: Every 15s
- 📊 Pagination: 20 per page
- 🗄️ Indexes: user_id, shop_id, created_at

---

## 🎓 KEY FEATURES

✅ Real-time unread count  
✅ Email fallback  
✅ User preferences (8 toggles)  
✅ Pagination & filtering  
✅ Dark mode support  
✅ Mobile responsive  
✅ Click-to-navigate  
✅ Bulk mark as read  

---

**Ready for Production** | All tests passing ✅
