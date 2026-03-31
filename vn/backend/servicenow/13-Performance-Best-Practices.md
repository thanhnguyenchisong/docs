# Bài 13: Performance & Best Practices

## Mục lục
- [1. Performance Tuning](#1-performance-tuning)
- [2. Coding Best Practices](#2-coding-best-practices)
- [3. Debugging & Troubleshooting](#3-debugging--troubleshooting)
- [4. Instance Scan](#4-instance-scan)
- [5. Upgrade Planning](#5-upgrade-planning)
- [6. Naming Conventions](#6-naming-conventions)
- [FAQ](#faq)

---

## 1. Performance Tuning

### 1.1 Common Performance Issues

```
Performance Issues & Solutions:

1. SLOW FORM LOAD
   ├── Cause: Too many Client Scripts / UI Policies
   ├── Cause: GlideRecord in Client Scripts (!!!!)
   ├── Cause: Complex ACL scripts
   └── Fix:
       ├── Remove unnecessary Client Scripts
       ├── Use GlideAjax instead of GlideRecord
       ├── Optimize ACL conditions (use roles, not scripts)
       └── Reduce number of UI Policies

2. SLOW LIST VIEW
   ├── Cause: Too many columns
   ├── Cause: Dot-walking in list columns
   ├── Cause: Missing database indexes
   └── Fix:
       ├── Limit columns to essentials
       ├── Avoid deep dot-walking (max 2 levels)
       └── Add indexes on frequently queried fields

3. SLOW BUSINESS RULES
   ├── Cause: GlideRecord queries without filters
   ├── Cause: Unnecessary BR execution (no conditions)
   ├── Cause: current.update() in before BR
   └── Fix:
       ├── Always add conditions/filters
       ├── Use encoded queries for efficiency
       ├── Never current.update() in before BR
       └── Use async BR for heavy processing

4. SLOW SCHEDULED JOBS
   ├── Cause: Processing too many records
   ├── Cause: N+1 query pattern
   └── Fix:
       ├── Use setLimit() and pagination
       ├── Use GlideAggregate for counts
       └── Consider chunking large operations
```

### 1.2 Script Performance Tips

```javascript
// ❌ BAD: Query entire table
var gr = new GlideRecord('incident');
gr.query();  // Loads ALL incidents!
while (gr.next()) { ... }

// ✅ GOOD: Always filter
var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addQuery('priority', '<=', 2);
gr.setLimit(100);
gr.query();

// ❌ BAD: Count with GlideRecord
var count = 0;
var gr = new GlideRecord('incident');
gr.addQuery('priority', 1);
gr.query();
while (gr.next()) { count++; }  // Loads ALL records just to count

// ✅ GOOD: Count with GlideAggregate
var ga = new GlideAggregate('incident');
ga.addQuery('priority', 1);
ga.addAggregate('COUNT');
ga.query();
var count = ga.next() ? ga.getAggregate('COUNT') : 0;

// ❌ BAD: Multiple queries for same data
function getUser(userId) {
    var gr = new GlideRecord('sys_user');
    gr.get(userId);
    return gr;
}
var name = getUser(userId).name;       // Query 1
var email = getUser(userId).email;     // Query 2 (duplicate!)

// ✅ GOOD: Single query, reuse result
var user = new GlideRecord('sys_user');
if (user.get(userId)) {
    var name = user.getValue('name');
    var email = user.getValue('email');
}

// ❌ BAD: GlideRecord in Client Script
// (This makes synchronous server call from browser!)
var gr = new GlideRecord('sys_user');
gr.get(g_form.getValue('caller_id'));

// ✅ GOOD: Use GlideAjax
var ga = new GlideAjax('UserHelper');
ga.addParam('sysparm_name', 'getUserInfo');
ga.addParam('sysparm_user_id', g_form.getValue('caller_id'));
ga.getXMLAnswer(function(answer) { ... });
```

### 1.3 Database Performance

```
Database Tips:
├── INDEX frequently queried fields
│   └── Đặc biệt: fields dùng trong list filters, BR conditions
│
├── Avoid SELECT *
│   └── Dùng setFields() hoặc sysparm_fields
│
├── LIMIT results
│   └── setLimit(100) hoặc sysparm_limit=100
│
├── Encoded queries > Multiple addQuery
│   └── addEncodedQuery() compiles hiệu quả hơn
│
└── GlideAggregate > GlideRecord for aggregations
```

---

## 2. Coding Best Practices

### 2.1 Script Organization

```
Best Practices:

1. SCRIPT INCLUDES cho reusable logic
   ├── KHÔNG copy-paste code giữa Business Rules
   ├── Tạo Script Include class
   └── Gọi từ BR/Scheduled Jobs/etc.

2. COMMENT code clearly
   ├── Explain WHY, not WHAT
   ├── JSDoc format cho functions
   └── Version history in description

3. ERROR HANDLING
   ├── try-catch cho risky operations
   ├── Validate inputs
   └── Log errors with gs.error()

4. SEPARATION OF CONCERNS
   ├── Server logic → Business Rules / Script Includes
   ├── UI logic → Client Scripts / UI Policies
   ├── Automation → Flow Designer / Scheduled Jobs
   └── Integration → REST / IntegrationHub
```

### 2.2 Scripting Standards

```javascript
// ============================================
// GOOD Script Include Example
// ============================================

/**
 * IncidentUtils - Utility class for incident operations
 * 
 * @class IncidentUtils
 * @description Provides reusable methods for incident management
 * @author Nguyen Thanh
 * @version 2.0
 * @since 2026-03-31
 */
var IncidentUtils = Class.create();
IncidentUtils.prototype = {
    
    initialize: function() {
        this.LOG_PREFIX = '[IncidentUtils] ';
    },
    
    /**
     * Check if user has too many assigned incidents
     * @param {string} userId - sys_id of the user
     * @param {number} threshold - max allowed incidents (default: 10)
     * @returns {boolean} true if over threshold
     */
    isUserOverloaded: function(userId, threshold) {
        if (!userId) {
            gs.warn(this.LOG_PREFIX + 'isUserOverloaded: userId is empty');
            return false;
        }
        
        threshold = threshold || 10;
        
        var ga = new GlideAggregate('incident');
        ga.addQuery('assigned_to', userId);
        ga.addQuery('state', 'NOT IN', '6,7,8');
        ga.addAggregate('COUNT');
        ga.query();
        
        var count = 0;
        if (ga.next()) {
            count = parseInt(ga.getAggregate('COUNT'));
        }
        
        gs.debug(this.LOG_PREFIX + 'User ' + userId + 
                 ' has ' + count + ' active incidents (threshold: ' + threshold + ')');
        
        return count >= threshold;
    },
    
    type: 'IncidentUtils'
};
```

---

## 3. Debugging & Troubleshooting

### 3.1 Debugging Tools

```
Debugging Tools trong ServiceNow:

1. SYSTEM LOGS
   ├── System Logs > All → tất cả log entries
   ├── System Logs > Script Log → gs.info/warn/error output
   └── System Logs > Errors → script errors

2. SESSION DEBUG
   ├── System Diagnostics > Session Debug
   ├── Modules:
   │   ├── Debug Business Rules → Xem BR execution
   │   ├── Debug Security → Xem ACL evaluation
   │   ├── Debug SQL → Xem SQL queries
   │   ├── Debug Log → Verbose logging
   │   └── Debug Scope → Application scope tracing
   └── Output hiển thị ở banner bar

3. JAVASCRIPT DEBUGGER
   ├── System Diagnostics > Script Debugger
   ├── Set breakpoints trong Business Rules
   ├── Step through code
   └── Inspect variables

4. TRANSACTION LOG
   ├── System Logs > Transactions
   ├── Xem response time cho mỗi page/API call
   └── Identify slow transactions

5. BACKGROUND SCRIPTS
   ├── System Definition > Scripts - Background
   ├── Chạy script nhanh để test
   └── ⚠️ Admin only, cẩn thận trên PROD
```

### 3.2 Common Errors & Solutions

```
Common Errors:

1. "null" is not an object
   └── GlideRecord.get() trả về false → record không tồn tại
   └── Fix: Always check if (gr.get(sysId)) { ... }

2. "Maximum call stack size exceeded"
   └── Business Rule gọi current.update() → infinite loop
   └── Fix: Dùng before BR (không cần update()) 
             hoặc setWorkflow(false)

3. "Insufficient rights"  
   └── User không có role/ACL phù hợp
   └── Fix: Check ACLs, verify roles

4. "Record not found"
   └── sys_id không đúng hoặc record bị xóa
   └── Fix: Validate sys_id trước khi query

5. Script timeout
   └── Script chạy quá lâu (>30 seconds)
   └── Fix: Optimize queries, use setLimit(), 
             consider async/scheduled
```

---

## 4. Instance Scan

### 4.1 Instance Scan Overview

```
Instance Scan:
├── Automated tool scan instance cho:
│   ├── Performance issues
│   ├── Security vulnerabilities
│   ├── Best practice violations
│   ├── Upgrade conflicts
│   └── Code quality issues
│
├── Scan Categories:
│   ├── Performance
│   │   ├── Business Rules without conditions
│   │   ├── Client Scripts using GlideRecord
│   │   └── ACLs with expensive scripts
│   ├── Security
│   │   ├── Default admin password
│   │   ├── Weak ACLs
│   │   └── Open access
│   ├── Manageability
│   │   ├── Customized OOB records
│   │   ├── Orphaned records
│   │   └── Inactive scripts still present
│   └── Upgradability
│       ├── OOB modifications
│       ├── Deprecated APIs
│       └── Version-specific code
│
├── Filter Navigator: "Instance Scan"
└── Run: "Scan Now" → Review findings → Fix issues
```

---

## 5. Upgrade Planning

### 5.1 ServiceNow Release Cycle

```
ServiceNow Release Schedule:
├── 2 major releases per year (spring & fall)
├── Named alphabetically: Paris, Quebec, Rome, San Diego, Tokyo,
│   Utah, Vancouver, Washington DC, Xanadu, Yokohama...
│
├── Upgrade Timeline:
│   ├── Release available → N-1 instance upgrade
│   ├── 6 months → N-2 instance upgrade
│   └── EOL → Must upgrade (no more patches)

Upgrade Process:
1. Review Release Notes → new features, breaking changes
2. Clone PROD to TEST
3. Upgrade TEST instance
4. Run Instance Scan → identify issues
5. Run ATF tests → verify customizations
6. Fix issues → retest
7. UAT on TEST
8. Schedule PROD upgrade (maintenance window)
9. Upgrade PROD
10. Post-upgrade verification
```

---

## 6. Naming Conventions

### 6.1 Recommended Naming

```
Naming Conventions:

Business Rules:
├── Format: [TABLE] - [WHEN] - [DESCRIPTION]
├── Ví dụ: "Incident - Before - Set Auto Priority"
├── Ví dụ: "Change - After - Send CAB Notification"

Client Scripts:
├── Format: [TABLE] - [TYPE] - [DESCRIPTION]
├── Ví dụ: "Incident - onChange - Validate Category"
├── Ví dụ: "Incident - onLoad - Set Defaults"

Script Includes:
├── Format: PascalCase class name
├── Ví dụ: "IncidentUtils"
├── Ví dụ: "ChangeRequestHelper"

Update Sets:
├── Format: [TICKET]-[SHORT-DESC]-v[VERSION]
├── Ví dụ: "PROJ-001-P1-AutoAssign-v1"

Flows:
├── Format: [ACTION] [OBJECT] [TRIGGER]
├── Ví dụ: "Auto-assign P1 Incidents on Create"

Scoped Apps:
├── Namespace: x_[company]_[app]
├── Ví dụ: x_mycom_itsm_ext
```

---

## FAQ

### Q1: Khi nào cần optimize?
**A:** Khi form load > 3s, list load > 5s, hoặc API response > 2s. Dùng Transaction Log để measure.

### Q2: Instance Scan nên chạy bao lâu 1 lần?
**A:** **Monthly** cho routine checks. **Before upgrades** bắt buộc. **After major changes** khuyến nghị.

### Best Practices Summary

```
TOP 10 ServiceNow Best Practices:

1. ❌ GlideRecord in Client Scripts → ✅ GlideAjax
2. ❌ current.update() in Before BR → ✅ Direct field assignment
3. ❌ No conditions on BR → ✅ Always add conditions
4. ❌ Global scope for custom apps → ✅ Scoped Applications
5. ❌ Default Update Set → ✅ Named Update Sets
6. ❌ Direct PROD changes → ✅ DEV → TEST → PROD
7. ❌ Copy-paste scripts → ✅ Script Includes
8. ❌ Modify OOB records → ✅ Create new records
9. ❌ Skip testing → ✅ ATF + manual testing
10. ❌ No documentation → ✅ Document everything
```

---

## Bài tập thực hành

### Bài 1: Performance Review
1. Bật Session Debug > Business Rules
2. Mở incident form → xem BR execution log
3. Identify BRs chạy lâu nhất
4. Review Transaction Log cho slow pages

### Bài 2: Instance Scan
1. Run Instance Scan
2. Review findings by category
3. Fix top 5 critical issues
4. Re-scan → verify score improvement

### Bài 3: Code Review
1. Review 5 Business Rules → check best practices
2. Check for GlideRecord in Client Scripts
3. Verify naming conventions
4. Add missing conditions to unconditional BRs

---

**Tiếp theo:** [Bài 14: AI & Advanced Features →](./14-AI-Advanced-Features.md)
