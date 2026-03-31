# Bài 17: AngularJS Chuyên Sâu cho ServiceNow Service Portal

## Mục lục
- [1. AngularJS Overview](#1-angularjs-overview)
- [2. Module & Dependency Injection](#2-module--dependency-injection)
- [3. Controllers & $scope](#3-controllers--scope)
- [4. Data Binding](#4-data-binding)
- [5. Directives](#5-directives)
- [6. Filters](#6-filters)
- [7. Services & Factories](#7-services--factories)
- [8. HTTP & Server Communication](#8-http--server-communication)
- [9. Routing & Navigation](#9-routing--navigation)
- [10. Widget Development](#10-widget-development)
- [11. Widget Communication](#11-widget-communication)
- [12. Service Portal Specific APIs](#12-service-portal-specific-apis)
- [13. Performance Optimization](#13-performance-optimization)
- [14. Testing & Debugging](#14-testing--debugging)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. AngularJS Overview

### 1.1 Tại sao AngularJS trong ServiceNow?

ServiceNow Service Portal sử dụng **AngularJS 1.x** (KHÔNG phải Angular 2+). Đây là framework frontend chính cho Service Portal widgets.

```
⚠️ QUAN TRỌNG:
AngularJS (1.x) ≠ Angular (2+)

ServiceNow dùng: AngularJS 1.x (legacy, nhưng still core of Service Portal)
Angular 2+ KHÔNG được dùng trong Service Portal

AngularJS đã End of Life (12/2021) nhưng ServiceNow vẫn dùng
→ Employee Center / Workspace dùng tech mới hơn
→ Service Portal vẫn active và cần AngularJS knowledge
```

### 1.2 AngularJS Architecture

```
AngularJS Architecture trong Service Portal:

┌─────────────────────────────────────────────────────┐
│                    BROWSER                           │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │            AngularJS Application              │   │
│  │                                               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │  Module   │  │  Config   │  │  Routes  │  │   │
│  │  └─────┬─────┘  └───────────┘  └──────────┘  │   │
│  │        │                                      │   │
│  │  ┌─────┴──────────────────────────────────┐   │   │
│  │  │           WIDGET (Component)            │   │   │
│  │  │                                         │   │   │
│  │  │  ┌────────────────────┐                │   │   │
│  │  │  │ HTML Template      │ ← View         │   │   │
│  │  │  │ (ng-directives)    │                │   │   │
│  │  │  └────────┬───────────┘                │   │   │
│  │  │           │ Data Binding                │   │   │
│  │  │  ┌────────┴───────────┐                │   │   │
│  │  │  │ Controller ($scope)│ ← Logic        │   │   │
│  │  │  └────────┬───────────┘                │   │   │
│  │  │           │                             │   │   │
│  │  │  ┌────────┴───────────┐                │   │   │
│  │  │  │ Server Script      │ ← Data Source  │   │   │
│  │  │  │ (GlideRecord)      │                │   │   │
│  │  │  └────────────────────┘                │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                               │   │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────┐  │   │
│  │  │ Services  │  │ Directives│  │ Filters  │  │   │
│  │  └───────────┘  └───────────┘  └──────────┘  │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 1.3 Key Concepts

```
AngularJS Core Concepts:

1. MODULE       → App container, khai báo dependencies
2. CONTROLLER   → Logic xử lý data cho view
3. $scope       → Object chia sẻ data giữa controller & view
4. DIRECTIVE    → Custom HTML elements/attributes (ng-if, ng-repeat)
5. FILTER       → Transform data display (date, currency, custom)
6. SERVICE      → Reusable business logic (singleton)
7. FACTORY      → Tạo services/objects
8. TWO-WAY BINDING → View ↔ Model sync tự động
9. DEPENDENCY INJECTION → AngularJS tự inject dependencies
10. DIGEST CYCLE → Mechanism kiểm tra thay đổi data
```

---

## 2. Module & Dependency Injection

### 2.1 AngularJS Module

```javascript
// ═══════════════════════════════════════
// Trong ServiceNow, module chính là 'portal'
// Widgets tự register vào module này
// ═══════════════════════════════════════

// ServiceNow tự quản lý module, bạn KHÔNG cần tạo module.
// Widget Client Script nhận controller function trực tiếp:

// Widget Client Script format:
function($scope, $http, spUtil) {
    // AngularJS controller logic here
    var c = this;  // "c" is convention for "controller"
    
    // c.data = data from Server Script
    // c.server = API to call Server Script
}

// ⚠️ Chú ý: KHÔNG có angular.module() trong widget scripts
// ServiceNow tự wrap widget script vào controller
```

### 2.2 Dependency Injection (DI)

```javascript
// ═══════════════════════════════════════
// AngularJS inject services qua function parameters
// ═══════════════════════════════════════

// ServiceNow Widget Client Script:
function($scope, $http, $timeout, $interval, $location, 
         $window, $uibModal, spUtil, snRecordWatcher, 
         spAriaFocusManager) {
    
    var c = this;
    
    // $scope    → Scope object (data binding)
    // $http     → HTTP requests
    // $timeout  → setTimeout wrapper (trigger digest)
    // $interval → setInterval wrapper
    // $location → URL manipulation
    // $window   → window object wrapper
    // $uibModal → Bootstrap modal dialogs
    // spUtil    → Service Portal utility service
    // snRecordWatcher → Real-time record updates
}

// ═══════════════════════════════════════
// Common ServiceNow AngularJS Services
// ═══════════════════════════════════════

// Service          │ Mô tả
// ─────────────────┼──────────────────────────────
// $scope           │ Data binding scope
// $http            │ AJAX HTTP requests
// $timeout         │ Delayed execution
// $interval        │ Repeated execution
// $location        │ URL/query params
// $window          │ Browser window
// $uibModal        │ Modal dialogs
// $rootScope       │ Global scope (use sparingly!)
// spUtil           │ ServiceNow portal utilities
// snRecordWatcher  │ Real-time record watching
// spModal          │ ServiceNow modal service
// i18n             │ Internationalization
// $sce             │ Strict contextual escaping (HTML)
```

---

## 3. Controllers & $scope

### 3.1 Controller trong Widget

```javascript
// ═══════════════════════════════════════
// Widget Client Script = Controller
// ═══════════════════════════════════════

function($scope) {
    var c = this;  // Controller instance (controllerAs syntax)
    
    // ═══════════════════════════════════════
    // c.data = Data từ Server Script
    // ═══════════════════════════════════════
    // Server Script gán data vào "data" object:
    // data.tickets = [...];
    // data.userName = 'Thanh';
    
    // Client Script truy cập qua c.data:
    console.log(c.data.tickets);
    console.log(c.data.userName);
    
    // ═══════════════════════════════════════
    // c.options = Widget instance options
    // ═══════════════════════════════════════
    console.log(c.options.title);
    console.log(c.options.table);
    
    // ═══════════════════════════════════════
    // Custom properties & methods
    // ═══════════════════════════════════════
    c.selectedTicket = null;
    c.isLoading = false;
    c.searchTerm = '';
    
    c.selectTicket = function(ticket) {
        c.selectedTicket = ticket;
    };
    
    c.clearSelection = function() {
        c.selectedTicket = null;
    };
    
    c.getFilteredTickets = function() {
        if (!c.searchTerm) return c.data.tickets;
        
        return c.data.tickets.filter(function(ticket) {
            return ticket.number.indexOf(c.searchTerm) !== -1 ||
                   ticket.description.toLowerCase().indexOf(
                       c.searchTerm.toLowerCase()) !== -1;
        });
    };
}
```

### 3.2 $scope vs controllerAs (this)

```javascript
// ═══════════════════════════════════════
// ServiceNow widgets dùng controllerAs syntax
// Controller aliased as "c" in templates
// ═══════════════════════════════════════

// ❌ $scope pattern (old way):
function($scope) {
    $scope.name = 'Thanh';
    $scope.greet = function() {
        return 'Hello, ' + $scope.name;
    };
}
// HTML: <div>{{name}}</div>

// ✅ controllerAs pattern (ServiceNow way):
function($scope) {
    var c = this;     // c = controller instance
    c.name = 'Thanh';
    c.greet = function() {
        return 'Hello, ' + c.name;
    };
}
// HTML: <div>{{c.name}}</div>

// ═══════════════════════════════════════
// Khi nào vẫn cần $scope?
// ═══════════════════════════════════════
function($scope) {
    var c = this;
    
    // $scope.$watch — theo dõi changes
    $scope.$watch('c.searchTerm', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            c.performSearch(newVal);
        }
    });
    
    // $scope.$on — listen events
    $scope.$on('ticket.updated', function(event, data) {
        c.refreshList();
    });
    
    // $scope.$emit — send event UP
    $scope.$emit('ticket.selected', c.selectedTicket);
    
    // $scope.$broadcast — send event DOWN
    $scope.$broadcast('filter.changed', c.filterValue);
    
    // $scope.$apply — trigger digest cycle (khi thay đổi ngoài Angular)
    setTimeout(function() {
        $scope.$apply(function() {
            c.data.count = 42;  // Update trong digest cycle
        });
    }, 1000);
}
```

---

## 4. Data Binding

### 4.1 Two-Way Data Binding

```html
<!-- ═══════════════════════════════════════ -->
<!-- Two-way binding: View ↔ Model sync     -->
<!-- ═══════════════════════════════════════ -->

<!-- ng-model: tạo two-way binding -->
<input type="text" ng-model="c.searchTerm" 
       placeholder="Search incidents...">

<!-- Khi user gõ → c.searchTerm tự cập nhật -->
<!-- Khi code thay đổi c.searchTerm → input tự cập nhật -->

<p>You typed: {{c.searchTerm}}</p>
<p>Length: {{c.searchTerm.length}}</p>

<!-- ═══════════════════════════════════════ -->
<!-- One-way binding (read-only, better performance) -->
<!-- ═══════════════════════════════════════ -->

<!-- {{expression}} — interpolation (one-way) -->
<h3>{{c.data.title}}</h3>

<!-- :: — one-time binding (bind once, no watches) -->
<span>Created by: {{::c.data.createdBy}}</span>

<!-- ng-bind — alternative to {{}} -->
<span ng-bind="c.data.count"></span>

<!-- ng-bind-html — render HTML (needs $sce) -->
<div ng-bind-html="c.data.htmlContent"></div>
```

### 4.2 Data Objects trong Widgets

```javascript
// ═══════════════════════════════════════
// Server Script → data object → Client Script
// ═══════════════════════════════════════

// === SERVER SCRIPT ===
(function() {
    // data object tự động populated
    data.title = 'My Active Tickets';
    data.currentUser = gs.getUserDisplayName();
    
    // Query tickets
    data.tickets = [];
    var gr = new GlideRecord('incident');
    gr.addQuery('caller_id', gs.getUserID());
    gr.addQuery('active', true);
    gr.orderByDesc('sys_created_on');
    gr.setLimit(20);
    gr.query();
    
    while (gr.next()) {
        data.tickets.push({
            sys_id: gr.getUniqueValue(),
            number: gr.getDisplayValue('number'),
            short_description: gr.getDisplayValue('short_description'),
            state: gr.getDisplayValue('state'),
            priority: gr.getDisplayValue('priority'),
            priority_value: gr.getValue('priority'),
            created: gr.getDisplayValue('sys_created_on'),
            assignment_group: gr.getDisplayValue('assignment_group')
        });
    }
    
    data.totalCount = data.tickets.length;
})();

// === CLIENT SCRIPT ===
function($scope) {
    var c = this;
    
    // c.data.title = 'My Active Tickets'
    // c.data.tickets = [{...}, {...}, ...]
    // c.data.totalCount = 20
    
    c.getTicketsByPriority = function(priority) {
        return c.data.tickets.filter(function(t) {
            return t.priority_value === priority;
        });
    };
}
```

---

## 5. Directives

### 5.1 Built-in Directives

```html
<!-- ═══════════════════════════════════════ -->
<!-- ng-if: Conditional rendering           -->
<!-- (element REMOVED from DOM if false)    -->
<!-- ═══════════════════════════════════════ -->
<div ng-if="c.data.tickets.length > 0">
    <h3>You have {{c.data.tickets.length}} active tickets</h3>
</div>
<div ng-if="c.data.tickets.length === 0">
    <p>No active tickets! 🎉</p>
</div>

<!-- ═══════════════════════════════════════ -->
<!-- ng-show / ng-hide: Toggle visibility   -->
<!-- (element stays in DOM, just hidden)    -->
<!-- ═══════════════════════════════════════ -->
<div ng-show="c.isLoading">
    <i class="fa fa-spinner fa-spin"></i> Loading...
</div>
<div ng-hide="c.isLoading">
    Content here
</div>

<!-- ng-if vs ng-show:
     ng-if:   Removes/adds DOM element → better for heavy content
     ng-show: Adds display:none → better for toggle frequently
-->

<!-- ═══════════════════════════════════════ -->
<!-- ng-repeat: Loop through items          -->
<!-- ═══════════════════════════════════════ -->
<table class="table table-hover">
    <thead>
        <tr>
            <th>Number</th>
            <th>Description</th>
            <th>Priority</th>
            <th>State</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <tr ng-repeat="ticket in c.data.tickets track by ticket.sys_id"
            ng-class="{'danger': ticket.priority_value === '1', 
                       'warning': ticket.priority_value === '2'}">
            <td>
                <a href="?id=ticket&table=incident&sys_id={{ticket.sys_id}}">
                    {{ticket.number}}
                </a>
            </td>
            <td>{{ticket.short_description}}</td>
            <td>
                <span class="label" 
                      ng-class="c.getPriorityClass(ticket.priority_value)">
                    {{ticket.priority}}
                </span>
            </td>
            <td>{{ticket.state}}</td>
            <td>
                <button class="btn btn-sm btn-info" 
                        ng-click="c.viewDetails(ticket)">
                    <i class="fa fa-eye"></i> View
                </button>
            </td>
        </tr>
    </tbody>
</table>

<!-- ng-repeat special variables:
     $index   → current index (0-based)
     $first   → true if first item
     $last    → true if last item
     $middle  → true if middle item
     $even    → true if even index
     $odd     → true if odd index
-->

<!-- ═══════════════════════════════════════ -->
<!-- ng-click: Event handling               -->
<!-- ═══════════════════════════════════════ -->
<button ng-click="c.submitForm()">Submit</button>
<button ng-click="c.deleteItem(item)" 
        ng-disabled="c.isDeleting">Delete</button>
<a href="#" ng-click="c.togglePanel($event)">Toggle</a>

<!-- Other event directives:
     ng-change, ng-submit, ng-keypress, ng-keydown,
     ng-mouseenter, ng-mouseleave, ng-focus, ng-blur
-->

<!-- ═══════════════════════════════════════ -->
<!-- ng-class: Dynamic CSS classes          -->
<!-- ═══════════════════════════════════════ -->
<!-- Object syntax: -->
<div ng-class="{
    'alert-danger': c.data.priority === '1',
    'alert-warning': c.data.priority === '2',
    'alert-info': c.data.priority === '3',
    'active': c.isSelected
}">

<!-- Array syntax: -->
<div ng-class="[c.getStatusClass(), c.getPriorityClass()]">

<!-- Expression: -->
<div ng-class="c.isActive ? 'panel-success' : 'panel-default'">

<!-- ═══════════════════════════════════════ -->
<!-- ng-style: Dynamic inline styles        -->
<!-- ═══════════════════════════════════════ -->
<div ng-style="{'background-color': c.getColor(), 'width': c.progress + '%'}">

<!-- ═══════════════════════════════════════ -->
<!-- ng-model: Form controls                -->
<!-- ═══════════════════════════════════════ -->
<form ng-submit="c.onSubmit()">
    <input type="text" ng-model="c.formData.name" 
           ng-required="true" ng-minlength="3">
    
    <select ng-model="c.formData.category"
            ng-options="cat.value as cat.label for cat in c.data.categories">
        <option value="">-- Select Category --</option>
    </select>
    
    <textarea ng-model="c.formData.description" rows="5"></textarea>
    
    <label>
        <input type="checkbox" ng-model="c.formData.urgent">
        Mark as Urgent
    </label>
    
    <button type="submit" ng-disabled="form.$invalid || c.isSubmitting">
        {{c.isSubmitting ? 'Submitting...' : 'Submit'}}
    </button>
</form>

<!-- ═══════════════════════════════════════ -->
<!-- ng-switch: Conditional blocks          -->
<!-- ═══════════════════════════════════════ -->
<div ng-switch="c.data.currentView">
    <div ng-switch-when="list">
        <!-- List view content -->
    </div>
    <div ng-switch-when="detail">
        <!-- Detail view content -->
    </div>
    <div ng-switch-when="form">
        <!-- Form view content -->
    </div>
    <div ng-switch-default>
        <!-- Default content -->
    </div>
</div>

<!-- ═══════════════════════════════════════ -->
<!-- ng-include: Include external template  -->
<!-- ═══════════════════════════════════════ -->
<div ng-include="'template_url.html'"></div>
```

---

## 6. Filters

### 6.1 Built-in Filters

```html
<!-- ═══════════════════════════════════════ -->
<!-- Syntax: {{ expression | filter:arg }}   -->
<!-- ═══════════════════════════════════════ -->

<!-- Text Filters -->
<p>{{ c.data.name | uppercase }}</p>       <!-- "NGUYEN THANH" -->
<p>{{ c.data.name | lowercase }}</p>       <!-- "nguyen thanh" -->
<p>{{ c.data.desc | limitTo:100 }}...</p>  <!-- Truncate to 100 chars -->

<!-- Number Filters -->
<p>{{ c.data.price | currency }}</p>        <!-- "$1,234.56" -->
<p>{{ c.data.price | currency:'₫' }}</p>    <!-- "₫1,234.56" -->
<p>{{ c.data.value | number:2 }}</p>        <!-- "1,234.56" -->

<!-- Date Filters -->
<p>{{ c.data.created | date:'yyyy-MM-dd' }}</p>           <!-- "2026-03-31" -->
<p>{{ c.data.created | date:'dd/MM/yyyy HH:mm' }}</p>     <!-- "31/03/2026 10:30" -->
<p>{{ c.data.created | date:'medium' }}</p>                 <!-- "Mar 31, 2026 10:30:00 AM" -->

<!-- Array Filters -->
<!-- orderBy: sort arrays -->
<tr ng-repeat="t in c.data.tickets | orderBy:'priority'">  <!-- Ascending -->
<tr ng-repeat="t in c.data.tickets | orderBy:'-priority'"> <!-- Descending -->
<tr ng-repeat="t in c.data.tickets | orderBy:['priority', '-created']"> <!-- Multi-sort -->

<!-- filter: search/filter arrays -->
<tr ng-repeat="t in c.data.tickets | filter:c.searchTerm">
<tr ng-repeat="t in c.data.tickets | filter:{state: 'New'}">

<!-- limitTo: paginate -->
<tr ng-repeat="t in c.data.tickets | limitTo:10">
<tr ng-repeat="t in c.data.tickets | limitTo:10:20"> <!-- offset 20, limit 10 -->

<!-- Chaining filters -->
<tr ng-repeat="t in c.data.tickets | filter:c.search | orderBy:'priority' | limitTo:c.pageSize">
```

### 6.2 Custom Filters (Angular Providers)

```javascript
// ═══════════════════════════════════════
// Custom filter trong ServiceNow
// Tạo Angular Provider → Type: Filter
// ═══════════════════════════════════════

// Angular Provider: "timeAgo" filter
// Type: filter
// Name: timeAgo

function(i18n) {
    return function(dateString) {
        if (!dateString) return '';
        
        var now = new Date();
        var date = new Date(dateString);
        var diff = Math.floor((now - date) / 1000);  // seconds
        
        if (diff < 60) return 'just now';
        if (diff < 3600) return Math.floor(diff / 60) + ' minutes ago';
        if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
        if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
        
        return date.toLocaleDateString();
    };
}

// Usage in HTML:
// <span>{{ ticket.created | timeAgo }}</span>
// → "2 hours ago"


// ═══════════════════════════════════════
// Another example: "priorityLabel" filter
// ═══════════════════════════════════════
function() {
    var labels = {
        '1': { text: 'Critical', class: 'label-danger' },
        '2': { text: 'High', class: 'label-warning' },
        '3': { text: 'Moderate', class: 'label-info' },
        '4': { text: 'Low', class: 'label-success' },
        '5': { text: 'Planning', class: 'label-default' }
    };
    
    return function(priority) {
        return labels[priority] || { text: 'Unknown', class: 'label-default' };
    };
}

// Usage:
// <span class="label {{ticket.priority | priorityLabel:'class'}}">
//     {{ticket.priority | priorityLabel:'text'}}
// </span>
```

---

## 7. Services & Factories

### 7.1 Angular Providers trong ServiceNow

```javascript
// ═══════════════════════════════════════
// ServiceNow tạo Angular Providers trong:
// Service Portal > Angular Providers
// ═══════════════════════════════════════

// === SERVICE (singleton) ===
// Type: service
// Name: ticketService

function($http, spUtil) {
    
    this.getTickets = function(query) {
        return $http.get('/api/now/table/incident', {
            params: {
                sysparm_query: query,
                sysparm_limit: 20,
                sysparm_display_value: true
            }
        });
    };
    
    this.updateTicket = function(sysId, data) {
        return $http.put('/api/now/table/incident/' + sysId, data);
    };
    
    this.getCount = function(query) {
        return $http.get('/api/now/stats/incident', {
            params: {
                sysparm_query: query,
                sysparm_count: true
            }
        });
    };
}

// === FACTORY (returns object) ===
// Type: factory
// Name: notificationFactory

function($timeout) {
    var notifications = [];
    
    return {
        add: function(message, type, duration) {
            type = type || 'info';
            duration = duration || 5000;
            
            var notification = {
                id: Date.now(),
                message: message,
                type: type
            };
            
            notifications.push(notification);
            
            $timeout(function() {
                var index = notifications.indexOf(notification);
                if (index !== -1) {
                    notifications.splice(index, 1);
                }
            }, duration);
            
            return notification;
        },
        
        remove: function(id) {
            for (var i = 0; i < notifications.length; i++) {
                if (notifications[i].id === id) {
                    notifications.splice(i, 1);
                    break;
                }
            }
        },
        
        getAll: function() {
            return notifications;
        }
    };
}

// Usage in Widget Client Script:
function($scope, ticketService, notificationFactory) {
    var c = this;
    
    c.loadTickets = function() {
        ticketService.getTickets('active=true^priority=1')
            .then(function(response) {
                c.data.tickets = response.data.result;
                notificationFactory.add('Tickets loaded!', 'success');
            })
            .catch(function(error) {
                notificationFactory.add('Error loading tickets', 'danger');
            });
    };
}
```

---

## 8. HTTP & Server Communication

### 8.1 c.server — Widget Server Communication

```javascript
// ═══════════════════════════════════════
// c.server.get() — Gọi Server Script từ Client
// Đây là cách phổ biến nhất trong Service Portal
// ═══════════════════════════════════════

// === SERVER SCRIPT ===
(function() {
    // Initial load
    data.tickets = [];
    loadTickets();
    
    // Handle client requests
    if (input) {
        if (input.action === 'loadMore') {
            data.offset = input.offset || 0;
            loadTickets(data.offset);
        }
        
        if (input.action === 'updateStatus') {
            var gr = new GlideRecord('incident');
            if (gr.get(input.sys_id)) {
                gr.state = input.new_state;
                gr.work_notes = input.work_notes || '';
                gr.update();
                data.updateResult = {
                    success: true,
                    number: gr.getDisplayValue('number'),
                    newState: gr.getDisplayValue('state')
                };
            } else {
                data.updateResult = { success: false, error: 'Record not found' };
            }
        }
        
        if (input.action === 'search') {
            data.tickets = [];
            var gr = new GlideRecord('incident');
            gr.addQuery('short_description', 'CONTAINS', input.searchTerm);
            gr.addQuery('active', true);
            gr.setLimit(20);
            gr.query();
            while (gr.next()) {
                data.tickets.push({
                    sys_id: gr.getUniqueValue(),
                    number: gr.getDisplayValue('number'),
                    short_description: gr.getDisplayValue('short_description'),
                    state: gr.getDisplayValue('state')
                });
            }
        }
    }
    
    function loadTickets(offset) {
        offset = offset || 0;
        var gr = new GlideRecord('incident');
        gr.addQuery('caller_id', gs.getUserID());
        gr.addQuery('active', true);
        gr.orderByDesc('sys_created_on');
        gr.chooseWindow(offset, offset + 10);
        gr.query();
        while (gr.next()) {
            data.tickets.push({
                sys_id: gr.getUniqueValue(),
                number: gr.getDisplayValue('number'),
                short_description: gr.getDisplayValue('short_description'),
                state: gr.getDisplayValue('state'),
                priority: gr.getDisplayValue('priority')
            });
        }
    }
})();

// === CLIENT SCRIPT ===
function($scope) {
    var c = this;
    c.isLoading = false;
    c.offset = 0;
    
    // Load more tickets
    c.loadMore = function() {
        c.isLoading = true;
        c.offset += 10;
        
        c.server.get({
            action: 'loadMore',
            offset: c.offset
        }).then(function(response) {
            // response.data = updated data object from server
            c.data.tickets = c.data.tickets.concat(response.data.tickets);
            c.isLoading = false;
        });
    };
    
    // Update ticket status
    c.updateStatus = function(ticket, newState) {
        c.server.get({
            action: 'updateStatus',
            sys_id: ticket.sys_id,
            new_state: newState,
            work_notes: 'Status updated via portal'
        }).then(function(response) {
            if (response.data.updateResult.success) {
                ticket.state = response.data.updateResult.newState;
                spUtil.addInfoMessage('Updated: ' + response.data.updateResult.number);
            } else {
                spUtil.addErrorMessage('Update failed');
            }
        });
    };
    
    // Search
    c.search = function() {
        if (!c.searchTerm || c.searchTerm.length < 3) return;
        
        c.isLoading = true;
        c.server.get({
            action: 'search',
            searchTerm: c.searchTerm
        }).then(function(response) {
            c.data.tickets = response.data.tickets;
            c.isLoading = false;
        });
    };
}
```

### 8.2 $http — Direct REST API Calls

```javascript
// ═══════════════════════════════════════
// $http cho truy cập REST API trực tiếp
// ═══════════════════════════════════════
function($scope, $http) {
    var c = this;
    
    // GET request
    c.loadIncidents = function() {
        $http.get('/api/now/table/incident', {
            params: {
                sysparm_query: 'active=true',
                sysparm_fields: 'number,short_description,priority,state',
                sysparm_limit: 10,
                sysparm_display_value: true
            }
        }).then(function(response) {
            c.incidents = response.data.result;
        }).catch(function(error) {
            console.error('Error:', error);
        });
    };
    
    // POST request (create)
    c.createIncident = function(data) {
        $http.post('/api/now/table/incident', {
            short_description: data.title,
            description: data.description,
            priority: data.priority,
            caller_id: c.data.userId
        }).then(function(response) {
            var newInc = response.data.result;
            spUtil.addInfoMessage('Created: ' + newInc.number);
        });
    };
}
```

---

## 9. Routing & Navigation

### 9.1 Service Portal Navigation

```javascript
// ═══════════════════════════════════════
// Navigation trong Service Portal
// ═══════════════════════════════════════
function($scope, $location, $window) {
    var c = this;
    
    // Navigate to another portal page
    c.goToPage = function(pageId, params) {
        var url = '?id=' + pageId;
        if (params) {
            for (var key in params) {
                url += '&' + key + '=' + encodeURIComponent(params[key]);
            }
        }
        $window.location.href = url;
    };
    
    // Examples:
    c.viewTicket = function(ticket) {
        c.goToPage('ticket', {
            table: 'incident',
            sys_id: ticket.sys_id
        });
        // → ?id=ticket&table=incident&sys_id=abc123...
    };
    
    c.goToKnowledge = function(articleSysId) {
        c.goToPage('kb_article', { sys_kb_id: articleSysId });
    };
    
    c.goToCatalog = function() {
        c.goToPage('sc_home');
    };
    
    // Get current URL parameters
    var params = $location.search();
    c.currentTable = params.table;
    c.currentSysId = params.sys_id;
}
```

---

## 10. Widget Development

### 10.1 Complete Widget Example

```
Widget: "Incident Dashboard"

┌─────────────────────────────────────────┐
│ Widget Record                            │
│ ├── Name: Incident Dashboard            │
│ ├── ID: incident-dashboard              │
│ ├── Internal: ❌                         │
│ ├── Public: ❌                           │
│ │                                        │
│ ├── HTML Template                        │
│ ├── CSS / SCSS                           │
│ ├── Client Script                        │
│ ├── Server Script                        │
│ │                                        │
│ ├── Option Schema (widget options)       │
│ │   ├── title (string)                   │
│ │   ├── table (string)                   │
│ │   └── max_entries (integer)            │
│ │                                        │
│ └── Dependencies                         │
│     └── Angular Providers               │
└─────────────────────────────────────────┘
```

```html
<!-- === HTML TEMPLATE === -->
<div class="incident-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
        <h2>
            <i class="fa fa-dashboard"></i> 
            {{c.options.title || 'My Incidents'}}
        </h2>
        <div class="header-actions">
            <div class="search-box">
                <i class="fa fa-search"></i>
                <input type="text" 
                       ng-model="c.searchTerm" 
                       ng-change="c.onSearch()"
                       placeholder="Search..."
                       ng-model-options="{debounce: 300}">
            </div>
            <button class="btn btn-primary btn-sm" ng-click="c.refresh()">
                <i class="fa fa-refresh" ng-class="{'fa-spin': c.isLoading}"></i>
                Refresh
            </button>
        </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="stats-row">
        <div class="stat-card" ng-repeat="stat in c.data.stats">
            <div class="stat-value" ng-style="{'color': stat.color}">
                {{stat.count}}
            </div>
            <div class="stat-label">{{stat.label}}</div>
        </div>
    </div>
    
    <!-- Loading -->
    <div class="loading-overlay" ng-show="c.isLoading">
        <i class="fa fa-spinner fa-spin fa-3x"></i>
        <p>Loading incidents...</p>
    </div>
    
    <!-- Ticket List -->
    <div class="ticket-list" ng-hide="c.isLoading">
        <div class="ticket-item" 
             ng-repeat="ticket in c.filteredTickets track by ticket.sys_id"
             ng-click="c.selectTicket(ticket)"
             ng-class="{'selected': c.selectedTicket.sys_id === ticket.sys_id}">
            
            <div class="ticket-priority">
                <span class="priority-badge priority-{{ticket.priority_value}}">
                    P{{ticket.priority_value}}
                </span>
            </div>
            
            <div class="ticket-info">
                <div class="ticket-number">{{ticket.number}}</div>
                <div class="ticket-desc">{{ticket.short_description | limitTo:80}}</div>
                <div class="ticket-meta">
                    <span><i class="fa fa-clock-o"></i> {{ticket.created}}</span>
                    <span><i class="fa fa-tag"></i> {{ticket.state}}</span>
                </div>
            </div>
        </div>
        
        <!-- Empty state -->
        <div class="empty-state" ng-if="c.filteredTickets.length === 0">
            <i class="fa fa-check-circle fa-3x"></i>
            <h4>No incidents found</h4>
            <p>Everything looks good!</p>
        </div>
    </div>
    
    <!-- Detail Panel -->
    <div class="detail-panel" ng-if="c.selectedTicket">
        <div class="detail-header">
            <h3>{{c.selectedTicket.number}}</h3>
            <button class="btn btn-sm" ng-click="c.selectedTicket = null">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="detail-body">
            <p><strong>Description:</strong> {{c.selectedTicket.short_description}}</p>
            <p><strong>Priority:</strong> {{c.selectedTicket.priority}}</p>
            <p><strong>State:</strong> {{c.selectedTicket.state}}</p>
            <p><strong>Assigned to:</strong> {{c.selectedTicket.assigned_to}}</p>
            
            <a href="?id=ticket&table=incident&sys_id={{c.selectedTicket.sys_id}}" 
               class="btn btn-primary">
                View Full Details
            </a>
        </div>
    </div>
</div>
```

```css
/* === CSS (SCSS) === */
.incident-dashboard {
    font-family: 'SourceSansPro', Arial, sans-serif;
    
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #e0e0e0;
        
        h2 {
            margin: 0;
            color: #333;
            font-size: 24px;
            
            i { color: #0073e6; margin-right: 8px; }
        }
        
        .search-box {
            display: inline-block;
            position: relative;
            margin-right: 10px;
            
            i {
                position: absolute;
                left: 10px; top: 50%;
                transform: translateY(-50%);
                color: #999;
            }
            
            input {
                padding: 6px 12px 6px 30px;
                border: 1px solid #ddd;
                border-radius: 20px;
                outline: none;
                transition: border-color 0.2s;
                
                &:focus { border-color: #0073e6; }
            }
        }
    }
    
    .stats-row {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        
        .stat-card {
            flex: 1;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            border-left: 4px solid #0073e6;
            
            .stat-value { font-size: 32px; font-weight: bold; }
            .stat-label { color: #666; font-size: 13px; margin-top: 4px; }
        }
    }
    
    .ticket-item {
        display: flex;
        padding: 12px 15px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.15s;
        
        &:hover { background-color: #f5f8ff; }
        &.selected { background-color: #e8f0fe; border-left: 3px solid #0073e6; }
    }
    
    .priority-badge {
        display: inline-block;
        width: 32px; height: 32px;
        line-height: 32px;
        text-align: center;
        border-radius: 50%;
        color: white;
        font-weight: bold;
        font-size: 12px;
        
        &.priority-1 { background: #d32f2f; }
        &.priority-2 { background: #f57c00; }
        &.priority-3 { background: #1976d2; }
        &.priority-4 { background: #388e3c; }
    }
    
    .empty-state {
        text-align: center;
        padding: 40px;
        color: #999;
        
        i { color: #4caf50; }
    }
}
```

```javascript
// === CLIENT SCRIPT ===
function($scope, $timeout, spUtil) {
    var c = this;
    
    c.isLoading = false;
    c.selectedTicket = null;
    c.searchTerm = '';
    c.filteredTickets = c.data.tickets || [];
    
    c.onSearch = function() {
        if (!c.searchTerm) {
            c.filteredTickets = c.data.tickets;
            return;
        }
        var term = c.searchTerm.toLowerCase();
        c.filteredTickets = c.data.tickets.filter(function(t) {
            return t.number.toLowerCase().indexOf(term) !== -1 ||
                   t.short_description.toLowerCase().indexOf(term) !== -1;
        });
    };
    
    c.selectTicket = function(ticket) {
        c.selectedTicket = (c.selectedTicket === ticket) ? null : ticket;
    };
    
    c.refresh = function() {
        c.isLoading = true;
        c.server.get({ action: 'refresh' }).then(function(response) {
            c.data.tickets = response.data.tickets;
            c.data.stats = response.data.stats;
            c.filteredTickets = c.data.tickets;
            c.isLoading = false;
            spUtil.addInfoMessage('Dashboard refreshed!');
        });
    };
    
    c.getPriorityClass = function(priority) {
        var classes = { '1': 'label-danger', '2': 'label-warning', 
                       '3': 'label-info', '4': 'label-success' };
        return classes[priority] || 'label-default';
    };
}
```

---

## 11. Widget Communication

### 11.1 Widget-to-Widget Communication

```javascript
// ═══════════════════════════════════════
// Widgets communicate via $rootScope events
// or shared services
// ═══════════════════════════════════════

// === Widget A (sender) ===
function($scope, $rootScope) {
    var c = this;
    
    c.selectCategory = function(category) {
        // Broadcast event to all widgets
        $rootScope.$broadcast('category.selected', {
            category: category,
            timestamp: Date.now()
        });
    };
}

// === Widget B (receiver) ===
function($scope, $rootScope) {
    var c = this;
    
    // Listen for event
    $scope.$on('category.selected', function(event, data) {
        c.currentCategory = data.category;
        c.loadItems(data.category);
    });
    
    c.loadItems = function(category) {
        c.server.get({ action: 'loadByCategory', category: category })
            .then(function(response) {
                c.data.items = response.data.items;
            });
    };
}

// ═══════════════════════════════════════
// spUtil.update() — Update widget data
// ═══════════════════════════════════════
function($scope, spUtil) {
    var c = this;
    
    // Get another widget's scope and update it
    spUtil.update($scope);  // Refresh current widget
}
```

### 11.2 snRecordWatcher — Real-time Updates

```javascript
// ═══════════════════════════════════════
// Watch records for real-time changes
// ═══════════════════════════════════════
function($scope, snRecordWatcher) {
    var c = this;
    
    // Watch incident table for changes
    snRecordWatcher.initList('incident', 'active=true^priority=1');
    
    // Listen for changes
    $scope.$on('record.updated', function(event, data) {
        // data = { sys_id: '...', table: 'incident', ... }
        c.server.get({ action: 'refresh' }).then(function(response) {
            c.data.tickets = response.data.tickets;
        });
    });
    
    $scope.$on('record.inserted', function(event, data) {
        // New record created
        spUtil.addInfoMessage('New P1 incident created!');
        c.server.get({ action: 'refresh' }).then(function(response) {
            c.data.tickets = response.data.tickets;
        });
    });
}
```

---

## 12. Service Portal Specific APIs

### 12.1 spUtil

```javascript
// ═══════════════════════════════════════
// spUtil — ServiceNow Portal Utilities
// ═══════════════════════════════════════
function($scope, spUtil) {
    var c = this;
    
    // Messages
    spUtil.addInfoMessage('Information!');
    spUtil.addErrorMessage('Error occurred!');
    spUtil.addTrivialMessage('Minor info');
    
    // Get URL parameter
    var sysId = spUtil.getParameter('sys_id');
    
    // Update widget data from server
    spUtil.update($scope);
    
    // Record watching
    spUtil.recordWatch($scope, 'incident', 'active=true^priority=1', 
        function(name, data) {
            // Called when matching record changes
            c.server.get({ action: 'refresh' });
        }
    );
    
    // Get widget by ID (to communicate)
    spUtil.get('widget-id').then(function(widgetScope) {
        // Access another widget's scope
    });
}
```

### 12.2 spModal

```javascript
// ═══════════════════════════════════════
// spModal — Modal dialogs
// ═══════════════════════════════════════
function($scope, spModal) {
    var c = this;
    
    // Confirmation dialog
    c.confirmDelete = function(ticket) {
        spModal.confirm('Are you sure you want to delete ' + ticket.number + '?')
            .then(function() {
                // User clicked OK
                c.deleteTicket(ticket);
            }, function() {
                // User clicked Cancel
            });
    };
    
    // Alert dialog
    c.showAlert = function() {
        spModal.alert('This is an important message!');
    };
    
    // Prompt dialog
    c.askForReason = function() {
        spModal.prompt('Please enter the reason:').then(function(reason) {
            c.reason = reason;
        });
    };
    
    // Custom modal (open widget as modal)
    c.openForm = function() {
        spModal.open({
            title: 'Create New Incident',
            widget: 'incident-form-widget',
            widgetInput: {
                table: 'incident',
                defaultValues: { priority: '3' }
            },
            size: 'lg'  // 'sm', 'md', 'lg'
        }).then(function(result) {
            // Modal closed with result
            if (result) {
                c.refresh();
            }
        });
    };
}
```

---

## 13. Performance Optimization

### 13.1 AngularJS Performance Tips

```javascript
// ═══════════════════════════════════════
// 1. One-time binding (::) — giảm watchers
// ═══════════════════════════════════════
// ❌ Creates watcher (updates on every digest cycle)
// <span>{{ticket.number}}</span>

// ✅ One-time binding (no watcher after initial render)
// <span>{{::ticket.number}}</span>

// Dùng :: cho data KHÔNG thay đổi sau initial load

// ═══════════════════════════════════════
// 2. track by trong ng-repeat
// ═══════════════════════════════════════
// ❌ Without track by: re-renders ALL items on change
// <div ng-repeat="item in items">

// ✅ With track by: only re-renders changed items
// <div ng-repeat="item in items track by item.sys_id">

// ═══════════════════════════════════════
// 3. ng-if vs ng-show
// ═══════════════════════════════════════
// ng-if: removes DOM element → less watchers
// ng-show: hides element → watchers still active
// → Dùng ng-if cho content ít khi hiện

// ═══════════════════════════════════════
// 4. Debounce ng-model
// ═══════════════════════════════════════
// <input ng-model="c.search" ng-model-options="{debounce: 300}">
// → Chờ 300ms sau khi user ngừng gõ mới fire change

// ═══════════════════════════════════════
// 5. Limit Server Script queries
// ═══════════════════════════════════════
// Server Script chạy MỖI lần widget render
// → Minimize GlideRecord queries
// → Sử dụng setLimit()
// → Chỉ query fields cần thiết

// ═══════════════════════════════════════
// 6. Pagination thay vì load all
// ═══════════════════════════════════════
function($scope) {
    var c = this;
    c.pageSize = 10;
    c.currentPage = 0;
    
    c.getPage = function() {
        var start = c.currentPage * c.pageSize;
        return c.data.tickets.slice(start, start + c.pageSize);
    };
    
    c.nextPage = function() {
        if ((c.currentPage + 1) * c.pageSize < c.data.tickets.length) {
            c.currentPage++;
        }
    };
    
    c.prevPage = function() {
        if (c.currentPage > 0) c.currentPage--;
    };
}
```

---

## 14. Testing & Debugging

### 14.1 Debugging Widgets

```javascript
// ═══════════════════════════════════════
// Browser DevTools
// ═══════════════════════════════════════

// 1. Console — xem errors, log output
console.log('c.data:', c.data);
console.log('tickets:', JSON.stringify(c.data.tickets, null, 2));

// 2. Network tab — xem API calls
// Watch for XHR requests to /api/ endpoints

// 3. Elements tab — inspect rendered HTML
// Check ng-repeat output, ng-class results

// 4. AngularJS Batarang extension
// Chrome extension for debugging AngularJS apps

// ═══════════════════════════════════════
// Widget URL parameters for debugging
// ═══════════════════════════════════════
// Add ?debug=true to show widget boundaries:
// https://instance.service-now.com/sp?id=index&debug=true

// ═══════════════════════════════════════  
// Log Server Script output
// ═══════════════════════════════════════
// In Server Script:
// gs.info('Widget data: ' + JSON.stringify(data));
// → View in System Logs > Script Log
```

---

## FAQ & Best Practices

### Q1: AngularJS hay Angular 2+?
**A:** Service Portal = **AngularJS 1.x**. Employee Center / Workspace = newer tech. Nếu làm Service Portal widgets → phải học AngularJS.

### Q2: Khi nào dùng c.server.get() vs $http?
**A:** 
- **c.server.get()**: Gọi widget's own Server Script (recommended)
- **$http**: Gọi REST APIs trực tiếp (Table API, Scripted REST)

### Q3: Widget performance chậm?
**A:**
1. Giảm GlideRecord queries trong Server Script
2. Dùng `::` one-time binding
3. Dùng `track by` trong ng-repeat
4. Debounce input fields
5. Pagination thay vì load tất cả

### Best Practices

1. **controllerAs** syntax (`var c = this`) thay vì `$scope` trực tiếp
2. **c.server.get()** thay vì `$http` cho widget data
3. **track by** trong mọi `ng-repeat`
4. **One-time binding** `::` cho static data
5. **Debounce** cho search/filter inputs
6. **Error handling** cho mọi server calls
7. **SCSS** thay vì inline styles
8. **Separation**: heavy logic → Server Script, UI logic → Client Script

---

## Bài tập thực hành

### Bài 1: Basic Widget
1. Tạo widget "User Profile Card"
2. Server Script: query current user info
3. HTML: hiện avatar, name, email, department
4. CSS: card layout đẹp với shadow, rounded corners

### Bài 2: Interactive List
1. Tạo widget "Knowledge Article Browser"
2. Search bar (debounced)
3. Category filter (dropdown)
4. Article list (ng-repeat + track by)
5. Click → show article detail panel

### Bài 3: Form Widget
1. Tạo widget "Quick Incident Report"
2. Form: title, description, category (dropdown), priority (radio)
3. Validation: title required, min 10 chars
4. Submit → c.server.get() → create incident
5. Success message + reset form

### Bài 4: Dashboard
1. Tạo widget "Incident Dashboard"
2. Stats cards: P1 count, P2 count, Total open, SLA breach
3. Chart/visual representation
4. Auto-refresh every 30 seconds ($interval)
5. Click stat → filter list

### Bài 5: Widget Communication
1. Widget A: Category Selector (buttons)
2. Widget B: Item List (filtered by category)
3. $rootScope.$broadcast from A
4. $scope.$on in B → reload data
5. Thêm loading state

---

**Quay lại:** [← README](./README.md)
