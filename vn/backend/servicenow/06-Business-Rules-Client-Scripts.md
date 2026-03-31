# Bài 6: Business Rules & Client Scripts

## Mục lục
- [1. Business Rules](#1-business-rules)
- [2. Client Scripts](#2-client-scripts)
- [3. UI Policies](#3-ui-policies)
- [4. UI Actions](#4-ui-actions)
- [5. Script Includes](#5-script-includes)
- [6. Scheduled Jobs & Fix Scripts](#6-scheduled-jobs--fix-scripts)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Business Rules

### 1.1 Business Rule là gì?

> **Business Rule** = Server-side script chạy khi record được **Insert, Update, Delete, hoặc Query** trên một table.

### 1.2 Business Rule Types

```
Execution Timing:

  Database Operation: INSERT / UPDATE / DELETE / QUERY
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                      │
   BEFORE              OPERATION               AFTER
(trước DB write)    (DB transaction)       (sau DB write)
      │                     │                      │
      ▼                     ▼                      ▼
  - Validate data      - Display BR           - Notifications
  - Set field values    (runs before          - Cascade updates
  - Abort if invalid     form renders)        - Event generation
  - Calculate fields                          - Logging

  ┌──────────────────┐
  │     ASYNC        │ → Chạy sau, không block transaction
  │ (background)     │   → Email, heavy processing
  └──────────────────┘
```

### 1.3 Business Rule Configuration

```
Business Rule Form:
├── Name:        "Set Priority from Impact/Urgency"
├── Table:       incident
├── Active:      ✅
├── Advanced:    ✅ (để viết script)
│
├── When to run:
│   ├── When: before
│   ├── Insert:  ✅
│   ├── Update:  ✅
│   ├── Delete:  ❌
│   ├── Query:   ❌
│   └── Order:   100 (default, lower = runs first)
│
├── Filter Conditions:
│   └── (optional — dùng để limit khi nào BR chạy)
│
└── Script:
    (function executeRule(current, previous) {
        // current  = record đang được xử lý
        // previous = record TRƯỚC khi thay đổi (chỉ có trong update)
    })(current, previous);
```

### 1.4 Business Rule Examples

```javascript
// ============================================
// BR 1: Before Insert — Auto-set Category
// ============================================
// When: before | Insert: ✅
// Table: incident
// Condition: Category is empty

(function executeRule(current, previous) {
    if (current.category.nil()) {
        current.category = 'inquiry';
        current.subcategory = 'general';
    }
})(current, previous);


// ============================================
// BR 2: Before Update — Prevent Reopen Closed
// ============================================
// When: before | Update: ✅
// Table: incident

(function executeRule(current, previous) {
    // Nếu incident đã Closed và user cố mở lại → abort
    if (previous.state == 7 && current.state != 7) {
        current.setAbortAction(true);
        gs.addErrorMessage('Không thể mở lại incident đã Closed. Hãy tạo incident mới.');
    }
})(current, previous);


// ============================================
// BR 3: After Insert — Create Task
// ============================================
// When: after | Insert: ✅
// Table: incident
// Condition: priority = 1

(function executeRule(current, previous) {
    // Auto-create task cho P1 incidents
    var task = new GlideRecord('task');
    task.initialize();
    task.short_description = 'Investigate P1: ' + current.number;
    task.description = 'Auto-created task for P1 incident ' + current.number;
    task.assigned_to = current.assigned_to;
    task.parent = current.sys_id;
    task.insert();
    
    gs.info('Auto-created task for P1 incident: ' + current.number);
})(current, previous);


// ============================================
// BR 4: Before Update — Track State Changes 
// ============================================
// When: before | Update: ✅
// Table: incident

(function executeRule(current, previous) {
    // Chỉ chạy khi state thay đổi
    if (current.state.changes()) {
        var oldState = previous.state.getDisplayValue();
        var newState = current.state.getDisplayValue();
        current.work_notes = 'State changed: ' + oldState + ' → ' + newState;
    }
})(current, previous);


// ============================================
// BR 5: Async — Heavy Processing
// ============================================
// When: async | Update: ✅
// Table: incident

(function executeRule(current, previous) {
    // Send notification to all stakeholders
    // Chạy async → không block user
    var gr = new GlideRecord('sys_user_group');
    if (gr.get(current.assignment_group)) {
        // Complex logic here...
        gs.eventQueue('incident.escalated', current, 
                      current.assigned_to, current.priority);
    }
})(current, previous);
```

### 1.5 Business Rule — current vs previous

```javascript
// current  = Record HIỆN TẠI (sau thay đổi)
// previous = Record TRƯỚC thay đổi (chỉ trong Update)

// Detect field changes:
if (current.state.changes()) {
    // state đã thay đổi
}

if (current.priority.changesTo(1)) {
    // priority vừa thay đổi THÀNH 1 (Critical)
}

if (current.priority.changesFrom(1)) {
    // priority vừa thay đổi TỪ 1 (không còn Critical)
}

// Compare old vs new
var oldPriority = previous.priority;  // Giá trị cũ
var newPriority = current.priority;   // Giá trị mới
```

---

## 2. Client Scripts

### 2.1 Client Script Types

| Type | Trigger | Mô tả |
|------|---------|--------|
| **onLoad** | Form mở | Chạy khi form load |
| **onChange** | Field thay đổi | Chạy khi user thay đổi field value |
| **onSubmit** | Form submit | Chạy khi user click Save/Update |
| **onCellEdit** | List cell edit | Chạy khi edit cell trong list view |

### 2.2 Client Script APIs

```javascript
// ==================
// g_form — Form API
// ==================
g_form.getValue('field_name');              // Lấy value
g_form.setValue('field_name', 'value');      // Set value
g_form.getDisplayValue('field_name');       // Display value (reference)
g_form.clearValue('field_name');            // Xóa value

g_form.setMandatory('field_name', true);    // Set mandatory
g_form.setReadOnly('field_name', true);     // Set read-only
g_form.setVisible('field_name', false);     // Ẩn field
g_form.setDisplay('field_name', false);     // Ẩn field (ko chiếm space)
g_form.setDisabled('field_name', true);     // Disable field

g_form.addInfoMessage('Thông báo');         // Info message
g_form.addErrorMessage('Lỗi!');            // Error message
g_form.clearMessages();                     // Xóa messages

g_form.showFieldMsg('field_name', 'msg', 'error');   // Field-level message
g_form.hideFieldMsg('field_name');                     // Hide field message

g_form.addOption('field_name', 'value', 'label');     // Add choice
g_form.removeOption('field_name', 'value');            // Remove choice
g_form.clearOptions('field_name');                     // Clear all choices

g_form.flash('field_name', 'yellow', 2);   // Flash field 2 times

// ==================
// g_user — User API
// ==================
g_user.userID;                  // Current user sys_id
g_user.userName;                // Current username
g_user.firstName;               // First name
g_user.lastName;                // Last name
g_user.hasRole('admin');        // Role check
g_user.hasRoleExactly('itil');  // Exact role check (no admin override)
```

### 2.3 Client Script Examples

```javascript
// ============================================
// CS 1: onLoad — Set default values
// ============================================
// Type: onLoad | Table: incident

function onLoad() {
    // Chỉ chạy cho form mới (không phải edit)
    if (g_form.isNewRecord()) {
        g_form.setValue('contact_type', 'self-service');
        g_form.setValue('impact', 3);
        g_form.setValue('urgency', 3);
    }
}


// ============================================
// CS 2: onChange — Dynamic mandatory
// ============================================
// Type: onChange | Table: incident | Field: state

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;
    
    // Khi state = Resolved → bắt buộc resolution fields
    if (newValue == 6) {  // Resolved
        g_form.setMandatory('close_code', true);
        g_form.setMandatory('close_notes', true);
        g_form.addInfoMessage('Vui lòng điền Resolution Code và Resolution Notes');
    } else {
        g_form.setMandatory('close_code', false);
        g_form.setMandatory('close_notes', false);
    }
}


// ============================================
// CS 3: onChange — Cascading dropdown
// ============================================
// Type: onChange | Table: incident | Field: category

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;
    
    g_form.clearOptions('subcategory');
    
    switch(newValue) {
        case 'hardware':
            g_form.addOption('subcategory', 'monitor', 'Monitor');
            g_form.addOption('subcategory', 'keyboard', 'Keyboard');
            g_form.addOption('subcategory', 'mouse', 'Mouse');
            g_form.addOption('subcategory', 'laptop', 'Laptop');
            break;
        case 'software':
            g_form.addOption('subcategory', 'email', 'Email');
            g_form.addOption('subcategory', 'vpn', 'VPN');
            g_form.addOption('subcategory', 'os', 'Operating System');
            break;
        case 'network':
            g_form.addOption('subcategory', 'connectivity', 'Connectivity');
            g_form.addOption('subcategory', 'wifi', 'WiFi');
            g_form.addOption('subcategory', 'dns', 'DNS');
            break;
    }
}


// ============================================
// CS 4: onSubmit — Validation
// ============================================
// Type: onSubmit | Table: incident

function onSubmit() {
    var shortDesc = g_form.getValue('short_description');
    
    // Validate short description length
    if (shortDesc.length < 10) {
        g_form.addErrorMessage('Short Description phải có ít nhất 10 ký tự');
        return false;  // Prevent submit
    }
    
    // Confirm P1 incidents
    var priority = g_form.getValue('priority');
    if (priority == 1) {
        return confirm('Bạn đang tạo P1 Critical Incident. Xác nhận?');
    }
    
    return true;  // Allow submit
}
```

---

## 3. UI Policies

### 3.1 UI Policy là gì?

> **UI Policy** = No-code alternative cho Client Scripts. Thay đổi giao diện form (mandatory, visible, read-only) dựa trên conditions — KHÔNG cần viết script.

### 3.2 UI Policy Configuration

```
UI Policy:
├── Table:         incident
├── Short Description: "P1 - Mandate Resolution Fields"
├── Conditions:    
│   └── State = Resolved (6)
├── On load:       ✅ (apply khi form load)
├── Reverse if false: ✅ (undo khi condition không còn đúng)
│
└── UI Policy Actions:
    ├── close_code:  Mandatory = true
    ├── close_notes: Mandatory = true
    └── resolution_code: Visible = true
```

### 3.3 UI Policy vs Client Script

| Feature | UI Policy | Client Script |
|---------|-----------|---------------|
| Cần code | ❌ No-code | ✅ JavaScript |
| Complexity | Simple conditions | Complex logic |
| Performance | Nhanh hơn | Chậm hơn |
| Maintenance | Dễ (click-configure) | Khó hơn |
| Custom logic | ❌ Hạn chế | ✅ Unlimited |
| Best for | Mandatory/Visible/ReadOnly | Complex validation |

```
✅ RULE: Dùng UI Policy TRƯỚC. 
   Chỉ dùng Client Script khi UI Policy không đáp ứng được.
```

---

## 4. UI Actions

### 4.1 UI Action là gì?

> **UI Action** = Buttons, links, context menu items trên forms/lists. Có thể chạy client-side, server-side, hoặc cả hai.

### 4.2 UI Action Examples

```javascript
// ============================================
// UI Action: "Escalate to P1" button
// ============================================
// Name: Escalate to P1
// Table: incident
// Form button: ✅
// Show insert: ❌
// Show update: ✅
// Condition: current.priority != 1

// Client Script (optional — confirmation):
function escalateConfirm() {
    return confirm('Bạn muốn escalate incident này lên P1?');
}

// Server Script:
current.priority = 1;
current.impact = 1;
current.urgency = 1;
current.work_notes = 'Escalated to P1 by ' + gs.getUserDisplayName();
current.update();
action.setRedirectURL(current);

// ============================================
// UI Action: "Assign to Me" button
// ============================================
// Name: Assign to Me
// Table: incident
// Form button: ✅
// Condition: current.assigned_to != gs.getUserID()

// Server Script:
current.assigned_to = gs.getUserID();
current.state = 2;  // In Progress
current.work_notes = 'Assigned to ' + gs.getUserDisplayName();
current.update();
action.setRedirectURL(current);
```

---

## 5. Script Includes

### 5.1 Script Include là gì?

> **Script Include** = Reusable server-side class/function. Think of it as a **utility class** có thể gọi từ Business Rules, Scheduled Jobs, và (qua GlideAjax) từ Client Scripts.

### 5.2 Script Include Types

```
Script Include Types:
├── Standard         → Server-only, callable from server scripts
├── Client Callable  → Callable from Client Scripts via GlideAjax
│   └── Extends: AbstractAjaxProcessor
└── On Demand        → Prototype-based class
```

### 5.3 Script Include Examples

```javascript
// ============================================
// Script Include: IncidentUtils
// ============================================
// Name: IncidentUtils
// Client callable: ❌ (server-only)

var IncidentUtils = Class.create();
IncidentUtils.prototype = {
    initialize: function() {
    },
    
    /**
     * Get active incident count for a user
     * @param {string} userId - sys_id of the user
     * @returns {number} count of active incidents
     */
    getActiveIncidentCount: function(userId) {
        var ga = new GlideAggregate('incident');
        ga.addQuery('assigned_to', userId);
        ga.addQuery('state', 'NOT IN', '6,7,8'); // Not Resolved/Closed/Canceled
        ga.addAggregate('COUNT');
        ga.query();
        if (ga.next()) {
            return parseInt(ga.getAggregate('COUNT'));
        }
        return 0;
    },
    
    /**
     * Auto-assign incident based on category
     * @param {GlideRecord} incGr - incident GlideRecord
     */
    autoAssign: function(incGr) {
        var categoryGroupMap = {
            'hardware': 'Hardware Support',
            'software': 'Software Support',
            'network': 'Network Team',
            'database': 'Database Team'
        };
        
        var groupName = categoryGroupMap[incGr.getValue('category')];
        if (groupName) {
            var grp = new GlideRecord('sys_user_group');
            if (grp.get('name', groupName)) {
                incGr.assignment_group = grp.getUniqueValue();
            }
        }
    },
    
    /**
     * Check if incident is breaching SLA
     * @param {string} incSysId - sys_id of the incident
     * @returns {boolean} true if breaching
     */
    isBreachingSLA: function(incSysId) {
        var sla = new GlideRecord('task_sla');
        sla.addQuery('task', incSysId);
        sla.addQuery('stage', 'breached');
        sla.query();
        return sla.hasNext();
    },
    
    type: 'IncidentUtils'
};

// === Usage in Business Rule ===
var utils = new IncidentUtils();
var count = utils.getActiveIncidentCount(current.assigned_to);
if (count > 10) {
    gs.addInfoMessage('Warning: User has ' + count + ' active incidents!');
}
```

---

## 6. Scheduled Jobs & Fix Scripts

### 6.1 Scheduled Jobs

```
Scheduled Job:
├── Name:      "Daily P4 Auto-Close"
├── Run as:    System Admin
├── Schedule:  Daily at 23:00
├── Active:    ✅
│
└── Script:
    // Auto-close P4 incidents resolved > 3 days ago
    var gr = new GlideRecord('incident');
    gr.addQuery('priority', 4);
    gr.addQuery('state', 6);  // Resolved
    gr.addQuery('resolved_at', '<', gs.daysAgo(3));
    gr.query();
    
    var count = 0;
    while (gr.next()) {
        gr.state = 7;  // Closed
        gr.close_notes = 'Auto-closed by system after 3 days in Resolved state';
        gr.update();
        count++;
    }
    gs.info('Auto-closed ' + count + ' P4 incidents');
```

### 6.2 Fix Scripts

```
Fix Script = One-time script để fix/migrate data

⚠️ CẢNH BÁO:
- Fix Script chạy 1 lần duy nhất
- Có thể thay đổi DATA hàng loạt
- LUÔN test trên sub-production trước
- LUÔN backup trước khi chạy

// Fix Script: Update all old incidents missing category
var gr = new GlideRecord('incident');
gr.addQuery('category', '');
gr.addQuery('state', 'IN', '6,7'); // Resolved or Closed
gr.setLimit(1000);  // Safety limit
gr.query();

var count = 0;
while (gr.next()) {
    gr.category = 'inquiry';
    gr.subcategory = 'general';
    gr.setWorkflow(false);     // Don't trigger BRs
    gr.autoSysFields(false);   // Don't update sys fields
    gr.update();
    count++;
}
gs.info('Updated ' + count + ' incidents');
```

---

## FAQ & Best Practices

### Q1: Business Rule order matters?
**A:** Yes! BRs cùng timing (before/after) chạy theo **Order** field (ascending). Default = 100. Đặt order thấp hơn nếu cần chạy trước.

### Q2: Khi nào dùng before vs after BR?
**A:**
- **Before**: Thay đổi field values TRÊN record hiện tại (không cần `current.update()`)
- **After**: Tạo/update records KHÁC, gửi events, notifications

### Q3: current.update() trong before BR?
**A:** **KHÔNG!** Trong before BR, ServiceNow tự save changes. Gọi `current.update()` → **infinite loop** hoặc double-save.

### Q4: UI Policy hay Client Script?
**A:** **UI Policy first.** Chỉ dùng Client Script khi cần complex logic (GlideAjax calls, conditional calculations, custom validation).

### Best Practices

1. **Before BR**: Dùng cho field manipulation, validation, abort
2. **After BR**: Dùng cho cross-table updates, events, notifications
3. **Async BR**: Dùng cho heavy processing không cần real-time
4. **KHÔNG current.update() trong before BR**
5. **Script Include cho reusable logic** — gọi từ BR
6. **UI Policy trước Client Script** cho simple UI changes
7. **Always add conditions** trên BR — giảm unnecessary execution
8. **setWorkflow(false)** trong Fix Scripts để tránh trigger BR chains

---

## Bài tập thực hành

### Bài 1: Business Rules
1. Tạo Before BR: khi incident insert, auto-set `contact_type = "self-service"` nếu trống
2. Tạo Before BR: ngăn P1 incident chuyển sang Closed nếu không có `close_notes`
3. Tạo After BR: khi incident escalate lên P1, tạo task cho "Critical Response Team"

### Bài 2: Client Scripts
1. onLoad CS: nếu user là ITIL, hiện "Welcome, ITIL User!" message
2. onChange CS: khi `category` thay đổi, auto-populate `subcategory` options
3. onSubmit CS: validate `short_description` >= 10 ký tự

### Bài 3: Script Include
1. Tạo `IncidentHelper` Script Include
2. Method: `isVIPCaller(incSysId)` → kiểm tra caller có phải VIP
3. Gọi từ Business Rule: nếu VIP caller → auto-set priority = 2

### Bài 4: Scheduled Job
1. Tạo Scheduled Job chạy mỗi ngày
2. Logic: tìm incidents "In Progress" > 7 ngày → add work_notes cảnh báo
3. Send notification cho assigned_to

---

**Tiếp theo:** [Bài 7: Flow Designer & Automation →](./07-Flow-Designer.md)
