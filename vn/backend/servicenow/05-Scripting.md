# Bài 5: ServiceNow Scripting

## Mục lục
- [1. JavaScript trong ServiceNow](#1-javascript-trong-servicenow)
- [2. Server-side vs Client-side](#2-server-side-vs-client-side)
- [3. GlideRecord API](#3-gliderecord-api)
- [4. GlideSystem (gs)](#4-glidesystem-gs)
- [5. GlideAjax](#5-glideajax)
- [6. GlideAggregate](#6-glideaggregate)
- [7. GlideDateTime](#7-glidedatetime)
- [8. Scoped vs Global APIs](#8-scoped-vs-global-apis)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. JavaScript trong ServiceNow

### 1.1 ServiceNow sử dụng JavaScript

ServiceNow scripting dựa trên **JavaScript (ECMAScript 5)** — cả server-side lẫn client-side.

```
⚠️ Lưu ý quan trọng:
- ServiceNow dùng ES5 (KHÔNG phải ES6+)
- KHÔNG có let, const, arrow functions, template literals
- KHÔNG có class syntax, destructuring, spread operator
- Dùng var, function, string concatenation
```

### 1.2 Nơi viết Script trong ServiceNow

```
Server-side Scripts:
├── Business Rules         → sys_script
├── Script Includes        → sys_script_include
├── Scheduled Jobs         → sysauto_script
├── Fix Scripts            → sys_script_fix
├── UI Actions (server)    → sys_ui_action
├── Transform Map Scripts  → sys_transform_script
├── Before Query BR        → sys_script (advanced query)
└── Background Script      → (console cho admin)

Client-side Scripts:
├── Client Scripts         → sys_script_client
├── UI Policies            → sys_ui_policy
├── UI Actions (client)    → sys_ui_action
├── Catalog Client Scripts → catalog_script_client
└── Service Portal Widgets → sp_widget
```

---

## 2. Server-side vs Client-side

### 2.1 So sánh

| Feature | Server-side | Client-side |
|---------|------------|-------------|
| **Chạy ở** | Server (application layer) | Browser (user's machine) |
| **API chính** | GlideRecord, GlideSystem | g_form, g_list, g_user |
| **Performance** | Nhanh (truy cập DB trực tiếp) | Chậm hơn (qua network) |
| **Security** | An toàn (server-controlled) | Không an toàn (user có thể bypass) |
| **DB Access** | ✅ Trực tiếp (GlideRecord) | ❌ Không (phải qua GlideAjax) |
| **Scope** | Tất cả tables, records | Chỉ current form/list |
| **Ví dụ** | Business Rules, Script Includes | Client Scripts, UI Policies |

### 2.2 Quy tắc vàng

```
🔴 KHÔNG BAO GIỜ dùng GlideRecord trong Client Script!

Tại sao?
1. Client Script chạy SYNCHRONOUS → block UI → user đợi
2. Mỗi GlideRecord call = 1 HTTP request → slow
3. Security risk → expose table data cho client

✅ ĐÚNG: Dùng GlideAjax để gọi server-side Script Include từ client
```

---

## 3. GlideRecord API

### 3.1 GlideRecord — Query Records

```javascript
// Querying incidents
var gr = new GlideRecord('incident');
gr.addQuery('priority', 1);                    // priority = 1 (Critical)
gr.addQuery('state', '!=', 7);                 // state != 7 (not Closed)
gr.addQuery('assignment_group.name', 'IT Support'); // dot-walking
gr.orderByDesc('sys_created_on');              // sort descending
gr.setLimit(10);                               // max 10 records
gr.query();                                     // execute query

while (gr.next()) {
    gs.info('Incident: ' + gr.number + ' - ' + gr.short_description);
    gs.info('Assigned to: ' + gr.assigned_to.getDisplayValue());
    gs.info('Priority: ' + gr.priority.getDisplayValue());
    gs.info('Created: ' + gr.sys_created_on);
    gs.info('---');
}
```

### 3.2 GlideRecord — Get Single Record

```javascript
// Get by sys_id
var gr = new GlideRecord('incident');
if (gr.get('a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p')) {
    gs.info('Found: ' + gr.number);
}

// Get by field value
var gr = new GlideRecord('incident');
if (gr.get('number', 'INC0010001')) {
    gs.info('Found: ' + gr.short_description);
}
```

### 3.3 GlideRecord — Insert

```javascript
// Tạo incident mới
var gr = new GlideRecord('incident');
gr.initialize();
gr.caller_id.setDisplayValue('Nguyen Thanh');
gr.short_description = 'Email server is down';
gr.description = 'Users cannot send/receive emails since 09:00 AM';
gr.priority = 1;
gr.impact = 1;
gr.urgency = 1;
gr.category = 'Software';
gr.subcategory = 'Email';
gr.assignment_group.setDisplayValue('Email Support');
var incSysId = gr.insert();

gs.info('Created incident: ' + gr.number + ' (sys_id: ' + incSysId + ')');
```

### 3.4 GlideRecord — Update

```javascript
// Update single record
var gr = new GlideRecord('incident');
if (gr.get('number', 'INC0010001')) {
    gr.state = 2;                           // In Progress
    gr.assigned_to.setDisplayValue('Tran Van A');
    gr.work_notes = 'Investigating the issue. Checking email server logs.';
    gr.update();
    gs.info('Updated: ' + gr.number);
}

// Bulk update (cẩn thận!)
var gr = new GlideRecord('incident');
gr.addQuery('priority', 4);
gr.addQuery('state', 1);  // New
gr.query();
while (gr.next()) {
    gr.assignment_group.setDisplayValue('IT Support L1');
    gr.update();
}
```

### 3.5 GlideRecord — Delete

```javascript
// ⚠️ CẨN THẬN: Xóa dữ liệu không khôi phục được!

// Delete single record
var gr = new GlideRecord('incident');
if (gr.get('number', 'INC0099999')) {
    gr.deleteRecord();
    gs.info('Deleted incident');
}

// ⚠️ NGUY HIỂM — Delete multiple records
var gr = new GlideRecord('incident');
gr.addQuery('state', 7);  // Closed
gr.addQuery('sys_created_on', '<', gs.daysAgo(365)); // Older than 1 year
gr.query();
while (gr.next()) {
    gr.deleteRecord();
}
// → Nên dùng deleteMultiple() cho bulk nhưng cẩn thận
```

### 3.6 Encoded Queries

```javascript
// Encoded Query — cách đọc filter conditions từ list view
var gr = new GlideRecord('incident');
gr.addEncodedQuery('priority=1^state=2^assignment_group.name=IT Support');
gr.query();

// Cách lấy encoded query:
// 1. Mở incident list
// 2. Tạo filter conditions
// 3. Right-click breadcrumb → "Copy query"
// 4. Paste vào script

// Complex encoded queries:
// ^: AND
// ^OR: OR
// ^NQ: New Query (nested)

var gr = new GlideRecord('incident');
gr.addEncodedQuery(
    'priority=1^state=2' +       // P1 AND In Progress
    '^ORpriority=2^state=1'      // OR P2 AND New
);
gr.query();
```

### 3.7 GlideRecord Methods Reference

| Method | Mô tả |
|--------|--------|
| `addQuery(field, value)` | Thêm filter condition |
| `addQuery(field, operator, value)` | Filter với operator (!=, >, <, CONTAINS) |
| `addEncodedQuery(query)` | Filter bằng encoded query string |
| `addNotNullQuery(field)` | Field không rỗng |
| `addNullQuery(field)` | Field rỗng |
| `query()` | Thực thi query |
| `next()` | Di chuyển đến record tiếp theo |
| `hasNext()` | Kiểm tra còn record không |
| `get(sysId)` | Lấy record bằng sys_id |
| `get(field, value)` | Lấy record bằng field value |
| `insert()` | Tạo record mới, trả về sys_id |
| `update()` | Cập nhật record hiện tại |
| `deleteRecord()` | Xóa record hiện tại |
| `deleteMultiple()` | Xóa tất cả matching records |
| `getRowCount()` | Số records (chậm — tránh dùng) |
| `setLimit(n)` | Giới hạn số records |
| `orderBy(field)` | Sort ascending |
| `orderByDesc(field)` | Sort descending |
| `getValue(field)` | Lấy raw value |
| `getDisplayValue()` | Lấy display value |
| `getUniqueValue()` | Lấy sys_id của record hiện tại |
| `isValidRecord()` | Record có hợp lệ không |
| `initialize()` | Khởi tạo record mới (trước insert) |
| `setWorkflow(false)` | Tắt Business Rules khi update |
| `autoSysFields(false)` | Không cập nhật sys fields |
| `canRead() / canWrite()` | Kiểm tra quyền |

---

## 4. GlideSystem (gs)

### 4.1 gs — System Information

```javascript
// Current user info
gs.getUserID();            // sys_id của current user
gs.getUserName();          // username
gs.getUserDisplayName();   // "Nguyen Thanh"
gs.getUser().getEmail();   // email

// Role check
gs.hasRole('admin');       // true/false
gs.hasRole('itil');        // true/false

// Group membership
gs.getUser().isMemberOf('IT Support');  // true/false

// Logging
gs.info('Info message');
gs.warn('Warning message');
gs.error('Error message');
gs.debug('Debug message');  // Chỉ hiện khi debug enabled

// Date/Time helpers
gs.now();                  // Current date-time
gs.nowDateTime();          // Current date-time (detailed)
gs.daysAgo(7);             // Date 7 ngày trước
gs.daysAgo(-3);            // Date 3 ngày sau
gs.beginningOfLastMonth(); // Đầu tháng trước
gs.endOfLastMonth();       // Cuối tháng trước

// System properties
gs.getProperty('glide.ui.date_format');  // Lấy system property

// Generate event
gs.eventQueue('incident.updated', current, gs.getUserID(), gs.getUserName());

// URL
gs.getProperty('glide.servlet.uri'); // Instance URL
```

### 4.2 gs — Session & Message

```javascript
// Add info/error message cho user
gs.addInfoMessage('Incident đã được cập nhật thành công!');
gs.addErrorMessage('Lỗi: Không thể cập nhật incident.');

// Session variables
gs.getSession().putClientData('custom_key', 'custom_value');
var val = gs.getSession().getClientData('custom_key');

// Include script
gs.include('MyScriptInclude');  // Load script include trong global scope
```

---

## 5. GlideAjax

### 5.1 GlideAjax Pattern (Client ↔ Server)

```
Client Script ──GlideAjax call──→ Script Include (Server)
                                        │
                                        ▼
Client Script ←──callback response──── Answer
```

### 5.2 Server-side: Script Include

```javascript
// Script Include: UserInfoAjax
// Name: UserInfoAjax
// Client callable: ✅ (checked)
// Extends: AbstractAjaxProcessor (important!)

var UserInfoAjax = Class.create();
UserInfoAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
    // Method 1: Get user email by sys_id
    getUserEmail: function() {
        var userId = this.getParameter('sysparm_user_id');
        var gr = new GlideRecord('sys_user');
        if (gr.get(userId)) {
            return gr.getValue('email');
        }
        return '';
    },
    
    // Method 2: Get active incident count for user
    getIncidentCount: function() {
        var userId = this.getParameter('sysparm_user_id');
        var gr = new GlideAggregate('incident');
        gr.addQuery('caller_id', userId);
        gr.addQuery('state', '!=', 7); // Not closed
        gr.addAggregate('COUNT');
        gr.query();
        if (gr.next()) {
            return gr.getAggregate('COUNT');
        }
        return '0';
    },
    
    type: 'UserInfoAjax'
});
```

### 5.3 Client-side: GlideAjax Call

```javascript
// Client Script — gọi UserInfoAjax từ server

function getUserInfo() {
    var ga = new GlideAjax('UserInfoAjax');
    ga.addParam('sysparm_name', 'getUserEmail');    // Method to call
    ga.addParam('sysparm_user_id', g_form.getValue('caller_id'));
    ga.getXMLAnswer(function(answer) {
        // Callback — chạy khi server trả kết quả
        if (answer) {
            g_form.setValue('u_caller_email', answer);
            g_form.addInfoMessage('Email: ' + answer);
        }
    });
}

// Gọi từ onChange client script khi caller_id thay đổi
// type: onChange
// table: incident
// field: caller_id
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') return;
    getUserInfo();
}
```

---

## 6. GlideAggregate

### 6.1 Khi nào dùng GlideAggregate?

```
✅ Dùng GlideAggregate khi cần: COUNT, SUM, AVG, MIN, MAX
❌ KHÔNG dùng GlideRecord loop + manual count!

// ❌ SAI — chậm, tốn tài nguyên
var count = 0;
var gr = new GlideRecord('incident');
gr.addQuery('priority', 1);
gr.query();
while (gr.next()) {
    count++;
}

// ✅ ĐÚNG — nhanh, chỉ 1 query
var ga = new GlideAggregate('incident');
ga.addQuery('priority', 1);
ga.addAggregate('COUNT');
ga.query();
if (ga.next()) {
    var count = ga.getAggregate('COUNT');
}
```

### 6.2 GlideAggregate Examples

```javascript
// COUNT incidents by priority
var ga = new GlideAggregate('incident');
ga.addAggregate('COUNT');
ga.groupBy('priority');
ga.query();
while (ga.next()) {
    gs.info('Priority ' + ga.priority + ': ' + ga.getAggregate('COUNT') + ' incidents');
}
// Output:
// Priority 1: 5 incidents
// Priority 2: 12 incidents
// Priority 3: 45 incidents

// AVG resolution time
var ga = new GlideAggregate('incident');
ga.addQuery('state', 7); // Closed
ga.addAggregate('AVG', 'calendar_duration');
ga.query();
if (ga.next()) {
    var avgDuration = ga.getAggregate('AVG', 'calendar_duration');
    gs.info('Average resolution time: ' + avgDuration + ' seconds');
}

// SUM with GROUP BY
var ga = new GlideAggregate('sc_req_item');
ga.addAggregate('SUM', 'price');
ga.groupBy('cat_item');
ga.query();
while (ga.next()) {
    gs.info(ga.cat_item.getDisplayValue() + ': $' + ga.getAggregate('SUM', 'price'));
}
```

---

## 7. GlideDateTime

### 7.1 Working with Dates

```javascript
// Current date-time
var gdt = new GlideDateTime();
gs.info('Now: ' + gdt.getDisplayValue());       // "2026-03-31 10:30:00"
gs.info('UTC: ' + gdt.getValue());              // "2026-03-31 03:30:00" (UTC)

// Create specific date
var gdt = new GlideDateTime('2026-12-31 23:59:59');

// Date arithmetic
var gdt = new GlideDateTime();
gdt.addDaysUTC(7);          // Add 7 days
gdt.addMonthsUTC(1);        // Add 1 month
gdt.addYearsUTC(1);         // Add 1 year
gdt.addSeconds(3600);       // Add 1 hour (3600 seconds)

// Compare dates
var date1 = new GlideDateTime('2026-01-01 00:00:00');
var date2 = new GlideDateTime('2026-12-31 00:00:00');

if (date1.before(date2)) {
    gs.info('date1 is before date2');
}

// Date difference
var dur = GlideDateTime.subtract(date1, date2);
gs.info('Difference: ' + dur.getDisplayValue());  // "364 Days"

// Get parts
var gdt = new GlideDateTime();
gs.info('Year: ' + gdt.getYearUTC());
gs.info('Month: ' + gdt.getMonthUTC());
gs.info('Day: ' + gdt.getDayOfMonthUTC());
```

---

## 8. Scoped vs Global APIs

### 8.1 API Differences

```
Global Scope API:
├── new GlideRecord('incident')       ✅
├── gs.info('message')                ✅
├── gs.sleep(1000)                    ✅ (KHÔNG có trong scoped)
├── GlideRecordSecure                 ✅ (enforces ACLs)
├── JSUtil                            ✅
└── GlideEvaluator                    ✅

Scoped Application API:
├── new GlideRecord('incident')       ✅ (có giới hạn cross-scope)
├── gs.info('message')                ✅
├── gs.sleep()                        ❌ (không có)
├── GlideRecordSecure                 ❌ (không có)
├── sn_ws (REST)                      ✅
├── sn_fd (Flow Designer)             ✅
└── sn_impex (Import/Export)          ✅
```

### 8.2 Cross-Scope Access

```javascript
// Scoped app truy cập table ngoài scope:
// Cần "Can read" / "Can create" / etc. permission trên table

// Application Access:
// Settings → Application Access → 
//   ✅ Can read    → cho phép GlideRecord.query()
//   ✅ Can create  → cho phép GlideRecord.insert()  
//   ✅ Can update  → cho phép GlideRecord.update()
//   ✅ Can delete  → cho phép GlideRecord.deleteRecord()
```

---

## FAQ & Best Practices

### Q1: Tại sao không dùng getRowCount()?
**A:** `getRowCount()` chạy **full table scan** — rất chậm trên bảng lớn. Dùng `GlideAggregate` với `COUNT` thay thế.

### Q2: `getValue()` vs truy cập trực tiếp field?
**A:**
```javascript
gr.priority          // → GlideElement object
gr.getValue('priority')  // → String value ("1")
gr.priority.getDisplayValue()  // → Display value ("1 - Critical")

// Luôn dùng getValue() khi cần so sánh giá trị
if (gr.getValue('priority') == '1') { ... }  // ✅
if (gr.priority == 1) { ... }                // ⚠️ Type coercion issues
```

### Q3: setWorkflow(false) dùng khi nào?
**A:** Khi update record mà KHÔNG muốn trigger Business Rules. Useful cho bulk updates, data migration. **Cẩn thận** — có thể skip important logic.

### Best Practices

1. **KHÔNG dùng GlideRecord trong Client Script** → dùng GlideAjax
2. **Always addQuery** trước query() → never query entire table
3. **setLimit()** khi chỉ cần N records
4. **GlideAggregate** cho COUNT/SUM/AVG — không GlideRecord loop
5. **getValue()** thay vì truy cập trực tiếp field
6. **Script Include** cho reusable logic — không copy-paste code
7. **gc.info/warn/error** cho logging — tránh gs.print()
8. **Comment code** giải thích WHY, không chỉ WHAT

---

## Bài tập thực hành

### Bài 1: GlideRecord Basics
1. Viết script query tất cả P1 incidents đang Active
2. Viết script tạo 3 incidents mới
3. Viết script update tất cả P4 incidents → assign cho group "IT Support"
4. Viết script đếm incidents theo priority (dùng GlideAggregate)

### Bài 2: GlideAjax
1. Tạo Script Include `IncidentHelper` (Client Callable)
2. Method `getAssignedCount(userId)` → đếm incidents assigned cho user
3. Tạo Client Script onChange → khi assigned_to thay đổi → hiện message "User has X active incidents"

### Bài 3: Advanced Queries
1. Encoded query: lấy incidents created trong 7 ngày qua, P1 hoặc P2, chưa resolved
2. GlideAggregate: đếm incidents theo assignment_group, sort descending
3. GlideDateTime: tìm incidents created trước 30 ngày và chưa closed → update work_notes cảnh báo

---

**Tiếp theo:** [Bài 6: Business Rules & Client Scripts →](./06-Business-Rules-Client-Scripts.md)
