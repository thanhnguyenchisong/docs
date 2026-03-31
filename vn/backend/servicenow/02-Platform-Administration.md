# Bài 2: Platform Administration

## Mục lục
- [1. User Management](#1-user-management)
- [2. Groups & Roles](#2-groups--roles)
- [3. Access Control Lists (ACLs)](#3-access-control-lists-acls)
- [4. Security Rules & Policies](#4-security-rules--policies)
- [5. Instance Configuration](#5-instance-configuration)
- [6. Email Configuration](#6-email-configuration)
- [7. Notifications](#7-notifications)
- [8. Import Sets & Data Loading](#8-import-sets--data-loading)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. User Management

### 1.1 User Record (sys_user)

Mỗi người dùng trong ServiceNow được lưu trong bảng `sys_user`.

```
sys_user table
├── user_name       → Login ID (unique)
├── first_name      → Tên
├── last_name       → Họ
├── email           → Email
├── active          → Active/Inactive
├── locked_out      → Account bị khóa
├── department      → Phòng ban (Reference)
├── company         → Công ty (Reference)
├── manager         → Quản lý (Reference → sys_user)
├── location        → Vị trí (Reference)
├── title           → Chức danh
├── phone           → Số điện thoại
├── vip             → VIP user flag
├── time_zone       → Múi giờ
├── date_format     → Format ngày
└── roles           → Danh sách roles (Related List)
```

### 1.2 Tạo User mới

```
1. Filter Navigator: "sys_user.list"
2. Click "New"
3. Điền thông tin:
   - User ID: nguyen.thanh
   - First name: Thanh
   - Last name: Nguyen
   - Email: thanh.nguyen@company.com
   - Active: true
   - Time zone: Asia/Ho_Chi_Minh
4. Click "Submit"
```

### 1.3 User Deprovisioning (Vô hiệu hóa)

```
⚠️ KHÔNG BAO GIỜ xóa user — chỉ set active = false

Lý do:
- Lịch sử ticket, audit trail vẫn cần reference đến user
- Xóa user → broken references
- Set inactive → user không login được nhưng data vẫn còn
```

---

## 2. Groups & Roles

### 2.1 Groups (sys_user_group)

Groups dùng để gom users theo team/chức năng. Groups thường gắn với **Assignment**.

```
Groups phổ biến trong ITSM:
├── Service Desk         → Tuyến 1 (Level 1)
├── IT Support           → Tuyến 2 (Level 2)  
├── Network Team         → Chuyên mạng
├── Database Team        → Chuyên database
├── Application Team     → Chuyên ứng dụng
├── Security Team        → Chuyên bảo mật
├── Change Advisory Board → CAB (phê duyệt change)
└── Management           → Quản lý
```

### 2.2 Roles (sys_user_role)

Roles quyết định **user có quyền làm gì** trong hệ thống.

**Roles quan trọng:**

| Role | Mô tả | Quyền |
|------|--------|-------|
| `admin` | System Administrator | Full access mọi thứ |
| `itil` | ITSM User | Tạo/sửa Incident, Problem, Change |
| `catalog_admin` | Catalog Admin | Quản lý Service Catalog |
| `knowledge_admin` | Knowledge Admin | Quản lý Knowledge Base |
| `change_manager` | Change Manager | Phê duyệt Change Requests |
| `problem_manager` | Problem Manager | Quản lý Problems |
| `asset` | Asset Manager | Quản lý tài sản |
| `cmdb_admin` | CMDB Admin | Quản lý CMDB |
| `sn_customerservice_agent` | CSM Agent | Customer Service |
| `security_admin` | Security Admin | Quản lý ACLs, Security |

### 2.3 Role Inheritance

```
admin
├── itil                    → Mọi admin đều có quyền itil
│   ├── sn_incident_write   → itil users có thể write incidents
│   └── sn_change_write     → itil users có thể write changes
├── security_admin          → Admin có thể quản lý security
└── personalize             → Quyền customize UI

# Role "contains" relationship cho phép kế thừa
```

### 2.4 Best Practice: Assign Role to Group, NOT User

```
❌ Sai: Assign role "itil" trực tiếp cho user "Nguyen Thanh"
✅ Đúng: 
   1. Tạo group "Service Desk"
   2. Assign role "itil" cho group "Service Desk"
   3. Add user "Nguyen Thanh" vào group "Service Desk"
   
Lợi ích:
- Quản lý tập trung
- Dễ audit
- User rời team → chỉ cần remove khỏi group
- Onboarding nhanh — add vào group là có đủ quyền
```

---

## 3. Access Control Lists (ACLs)

### 3.1 ACL là gì?

**ACL (Access Control List)** là cơ chế security chính của ServiceNow, kiểm soát **ai** có thể **làm gì** với **dữ liệu nào**.

```
ACL Rule Structure:
┌─────────────────────────────────────────────┐
│ ACL Rule                                     │
│                                              │
│ Type:       Record / Field                   │
│ Operation:  Create / Read / Write / Delete   │
│ Table:      incident                          │
│ Field:      * (all) hoặc specific field      │
│                                              │
│ Requires:                                    │
│   Role:     itil                             │
│   Condition: active = true                   │
│   Script:   (optional advanced logic)        │
│                                              │
│ → GRANT or DENY access                       │
└─────────────────────────────────────────────┘
```

### 3.2 ACL Evaluation Order

ACLs được evaluate **từ cụ thể nhất đến tổng quát nhất**:

```
Evaluation Order (Most → Least Specific):
1. Table.Field (ví dụ: incident.priority)     → Cụ thể nhất
2. Table.* (ví dụ: incident.*)                → Level bảng
3. *.Field (ví dụ: *.priority)                → Cross-table field
4. *.* (global)                                → Tổng quát nhất

Nếu KHÔNG có ACL nào match → ACCESS DENIED (secure by default)
```

### 3.3 ACL Operations

| Operation | Mô tả | Ví dụ |
|-----------|--------|-------|
| `create` | Tạo record mới | Tạo incident mới |
| `read` | Xem record | Xem danh sách incidents |
| `write` | Sửa record | Cập nhật state của incident |
| `delete` | Xóa record | Xóa incident |
| `execute` | Chạy Processor/UI Page | Chạy background script |

### 3.4 Ví dụ ACL thực tế

```javascript
// ACL: Chỉ cho phép assignment_group members xem incidents của group mình

// Condition:
// Table: incident
// Operation: read
// Field: *

// Script:
answer = (function() {
    // Admin can see everything
    if (gs.hasRole('admin')) return true;
    
    // User must be in the assignment group
    var grp = current.assignment_group;
    if (grp.nil()) return true; // No group assigned → visible
    
    return gs.getUser().isMemberOf(grp);
})();
```

### 3.5 ACL Debugging

```
Cách debug ACL:
1. Filter Navigator: "sys_security_acl.list" → xem tất cả ACLs
2. Impersonate user → test quyền truy cập
3. Session Debug:
   - System Diagnostics > Session Debug > Security
   - Bật "Debug Security" → xem ACL evaluation trong logs
4. Elevate Roles:
   - Click user avatar > Elevate Roles > Security Admin
   - Cần thiết để sửa ACLs
```

---

## 4. Security Rules & Policies

### 4.1 Data Policies

Data Policies enforce field requirements **regardless** of how data is submitted (UI, API, Import Set).

```
Data Policy vs UI Policy:

┌──────────────┬─────────────────┬──────────────────┐
│              │   UI Policy     │   Data Policy    │
├──────────────┼─────────────────┼──────────────────┤
│ Scope        │ UI only         │ UI + API + Import│
│ Enforcement  │ Client-side     │ Server-side      │
│ Mandate field│ ✅              │ ✅               │
│ Hide field   │ ✅              │ ❌               │
│ Set read-only│ ✅              │ ✅               │
│ Bypass       │ API can bypass  │ Cannot bypass    │
│ Best for     │ UI cosmetics    │ Data integrity   │
└──────────────┴─────────────────┴──────────────────┘
```

### 4.2 Password Policies

```
System Properties → Password Policy:

glide.security.password.min_length       = 8
glide.security.password.require_upper    = true
glide.security.password.require_lower    = true  
glide.security.password.require_digit    = true
glide.security.password.require_special  = true
glide.security.password.max_age_days     = 90
glide.security.password.min_age_days     = 1
glide.security.password.history_count    = 12
```

### 4.3 IP Access Controls

```
System Properties > IP Address Access Control:

# Whitelist IP ranges cho admin access
# Useful cho: VPN-only access, office-only access

glide.ip.access.control.enabled = true
glide.ip.whitelist = 10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

---

## 5. Instance Configuration

### 5.1 Company Information

```
Filter Navigator: "sys_properties.list"

# Thông tin công ty
glide.product.description     = "ServiceNow - MyCompany"
glide.ui.banner_text          = "MyCompany ServiceNow"
glide.product.name            = "ServiceNow"
```

### 5.2 Date/Time Settings

```
# Date và Time format
glide.sys.date_format          = yyyy-MM-dd
glide.sys.time_format          = HH:mm:ss  
glide.sys.date_time_format     = yyyy-MM-dd HH:mm:ss

# Timezone
glide.sys.default.tz           = Asia/Ho_Chi_Minh
```

### 5.3 System Plugins

```
Plugins cho phép bật/tắt các tính năng bổ sung.

Filter Navigator: "System Definition > Plugins"

Plugins thường dùng:
├── com.snc.knowledge_management    → Knowledge Base
├── com.snc.change_management       → Change Management
├── com.snc.problem_management      → Problem Management
├── com.glide.request_management    → Service Catalog
├── com.snc.cmdb                    → CMDB
├── com.snc.service_mapping         → Service Mapping (ITOM)
├── com.snc.discovery               → Discovery (ITOM)
└── com.glide.performance_analytics → Performance Analytics
```

---

## 6. Email Configuration

### 6.1 Outbound Email

```
System Mailboxes > Outbound > Email Accounts

# SMTP Configuration
Type:       SMTP
Server:     smtp.office365.com
Port:       587
TLS:        true
User:       servicenow@company.com
Password:   ****

# Test: System Mailboxes > Email > Emails > Send Test Email
```

### 6.2 Inbound Email

```
System Mailboxes > Inbound > Email Accounts  

# Inbound email tạo/cập nhật records
# POP3 hoặc IMAP configuration

Inbound Actions:
├── Create Incident from Email
├── Update Incident from Reply
├── Create Request from Email
└── Create Knowledge Article from Email
```

### 6.3 Email Properties

```
glide.email.smtp.active           = true     # Bật outbound email
glide.email.read.active           = true     # Bật inbound email  
glide.email.test.user             = admin    # Test recipient
glide.email.notification.max_retry = 3       # Retry count
```

---

## 7. Notifications

### 7.1 Notification Structure

```
Notification (sysevent_email_action)
├── When to send:
│   ├── Table:     incident
│   ├── Event:     incident.updated (hoặc conditions)
│   ├── Conditions: priority = 1 AND state = 1
│   └── Weight:    0 (higher = higher priority)
│
├── Who will receive:
│   ├── Users:     assigned_to
│   ├── Groups:    assignment_group
│   ├── Additional: caller_id, watch_list
│   └── Exclude:   (users to exclude)
│
└── What it will contain:
    ├── Subject:   "P1 Incident: ${number} - ${short_description}"
    ├── Body:      HTML template with variables
    └── SMS:       (optional SMS text)
```

### 7.2 Notification Variables

```html
<!-- Trong email template, dùng ${field_name} để insert giá trị -->

Subject: [${action}] ${number} - ${short_description}

Body:
<p>Xin chào ${assigned_to.name},</p>
<p>Bạn được assign incident mới:</p>
<ul>
    <li><b>Number:</b> ${number}</li>
    <li><b>Priority:</b> ${priority}</li>
    <li><b>Description:</b> ${short_description}</li>
    <li><b>Caller:</b> ${caller_id.name}</li>
    <li><b>Category:</b> ${category}</li>
</ul>
<p><a href="${instance.name}/${URI_REF}">Xem chi tiết</a></p>
```

---

## 8. Import Sets & Data Loading

### 8.1 Import Set Overview

Import Sets cho phép load dữ liệu từ bên ngoài vào ServiceNow.

```
Data Source (CSV, Excel, JDBC, LDAP)
        │
        ▼
Import Set Table (staging table)
        │
        ▼
Transform Map (mapping rules)
        │
        ▼
Target Table (sys_user, cmdb_ci, etc.)
```

### 8.2 Transform Map

```
Transform Map Example: Import Users from CSV

Source Column (CSV)     →    Target Field (sys_user)
─────────────────           ───────────────────────
employee_id             →    employee_number
first_name              →    first_name
last_name               →    last_name
email_address           →    email  
department_name         →    department (coalesce lookup)
manager_email           →    manager (coalesce lookup)
is_active               →    active (transform script)

Coalesce Field: employee_number
→ Nếu employee_number đã tồn tại → UPDATE
→ Nếu chưa có → INSERT
```

### 8.3 Scheduled Import

```
# Tự động import hàng ngày
Scheduled Import:
├── Data Source: LDAP / JDBC / File
├── Schedule: Daily at 02:00 AM
├── Transform Map: User Import Map
└── Notifications: On error → admin@company.com
```

---

## FAQ & Best Practices

### Q1: Khi nào dùng UI Policy vs Data Policy?
**A:** 
- **UI Policy**: Khi chỉ cần thay đổi giao diện form (ẩn field, set mandatory trên UI)
- **Data Policy**: Khi cần enforce data integrity từ MỌI nguồn (UI + API + Import)

### Q2: Tại sao không nên assign role trực tiếp cho user?
**A:** Vì quản lý role qua Group dễ hơn: 
- User thay đổi team → chỉ cần move group
- Audit dễ hơn: xem group membership
- Onboarding/offboarding nhanh hơn

### Q3: ACL script chạy bao nhiêu lần?
**A:** ACL script chạy **mỗi lần user truy cập record**. Nên tối ưu performance — tránh GlideRecord queries nặng trong ACL scripts.

### Q4: Làm sao test ACLs?
**A:**
1. Impersonate user khác (Ctrl + Alt + G)
2. Bật Debug Security: System Diagnostics > Session Debug
3. Kiểm tra log: System Logs > Security

### Best Practices

1. **Principle of Least Privilege**: Chỉ cấp quyền tối thiểu cần thiết
2. **Role → Group → User**: Assign roles cho groups, users thuộc groups
3. **Không sửa OOB ACLs**: Tạo ACL mới thay vì sửa ACL có sẵn
4. **Data Policy > UI Policy** cho data integrity
5. **Scheduled import cho LDAP**: Sync user hàng đêm
6. **Test notifications trên sub-production** trước khi bật trên PROD

---

## Bài tập thực hành

### Bài 1: User & Group Management
1. Tạo 5 users mới trong PDI
2. Tạo 2 groups: "IT Support L1" và "IT Support L2"
3. Add users vào groups
4. Assign role `itil` cho group "IT Support L1"
5. Impersonate 1 user trong group → verify quyền

### Bài 2: ACL Configuration
1. Tạo ACL mới: chỉ cho `itil` users đọc incidents
2. Tạo ACL: chỉ cho `admin` xóa incidents
3. Test bằng impersonation
4. Bật Debug Security → xem evaluation log

### Bài 3: Notifications
1. Tạo notification mới: gửi email khi P1 incident được tạo
2. Subject: "[P1 ALERT] ${number} - ${short_description}"
3. Recipients: assignment_group members
4. Test bằng cách tạo P1 incident

### Bài 4: Import Set
1. Tạo file CSV với 10 user records
2. Load data vào import set table
3. Tạo Transform Map → map columns to sys_user
4. Set coalesce on "email" field
5. Run transform và verify data trong sys_user table

---

**Tiếp theo:** [Bài 3: ITSM — IT Service Management →](./03-ITSM.md)
