# Bài 16: JavaScript Chuyên Sâu cho ServiceNow

## Mục lục
- [1. JavaScript trong ServiceNow — ES5](#1-javascript-trong-servicenow--es5)
- [2. Kiểu dữ liệu & Biến](#2-kiểu-dữ-liệu--biến)
- [3. Functions — Hàm](#3-functions--hàm)
- [4. Objects & Prototypes](#4-objects--prototypes)
- [5. Arrays — Mảng](#5-arrays--mảng)
- [6. String — Chuỗi](#6-string--chuỗi)
- [7. Scope & Closures](#7-scope--closures)
- [8. this Keyword](#8-this-keyword)
- [9. Error Handling](#9-error-handling)
- [10. Regular Expressions](#10-regular-expressions)
- [11. JSON](#11-json)
- [12. Asynchronous Patterns](#12-asynchronous-patterns)
- [13. Design Patterns trong ServiceNow](#13-design-patterns-trong-servicenow)
- [14. JavaScript Pitfalls trong ServiceNow](#14-javascript-pitfalls-trong-servicenow)
- [15. Coding Standards & Conventions](#15-coding-standards--conventions)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. JavaScript trong ServiceNow — ES5

### 1.1 ServiceNow dùng ECMAScript 5 (ES5)

ServiceNow runtime sử dụng **Rhino JavaScript engine** (server-side) — chỉ hỗ trợ **ES5**. Client-side chạy trên browser nên hỗ trợ ES6+ nhưng nên viết ES5 cho consistency.

```javascript
// ╔════════════════════════════════════════════════════════╗
// ║  KHÔNG CÓ trong ServiceNow (ES6+ features):          ║
// ╠════════════════════════════════════════════════════════╣
// ║  let / const         → Dùng var                       ║
// ║  Arrow functions     → Dùng function(){}              ║
// ║  Template literals   → Dùng string concatenation      ║
// ║  class syntax         → Dùng Class.create()           ║
// ║  Destructuring       → Dùng manual assignment         ║
// ║  Spread operator     → Dùng manual copy               ║
// ║  Promise / async     → Dùng callback (GlideAjax)     ║
// ║  Map / Set           → Dùng Object / Array            ║
// ║  for...of            → Dùng for / for...in            ║
// ║  default parameters  → Dùng || pattern                ║
// ╚════════════════════════════════════════════════════════╝

// ❌ ES6 — KHÔNG hoạt động trên server-side
const name = `Hello ${user}`;
let items = [...array];
const fn = (x) => x * 2;

// ✅ ES5 — Hoạt động trong ServiceNow
var name = 'Hello ' + user;
var items = array.slice();
var fn = function(x) { return x * 2; };
```

### 1.2 ServiceNow Execution Contexts

```
┌─────────────────────────────────────────────────────────┐
│ SERVER-SIDE (Rhino Engine — ES5 only)                   │
│                                                          │
│ ├── Business Rules                                       │
│ ├── Script Includes                                      │
│ ├── Scheduled Jobs                                       │
│ ├── Fix Scripts                                          │
│ ├── Background Scripts                                   │
│ ├── Transform Map Scripts                                │
│ ├── REST API Scripts (Scripted REST)                     │
│ ├── Flow Designer Script Steps                           │
│ └── Service Portal Server Scripts                        │
│                                                          │
│ Available APIs: GlideRecord, GlideSystem, GlideElement, │
│ GlideAggregate, GlideDateTime, Class.create(), etc.     │
├─────────────────────────────────────────────────────────┤
│ CLIENT-SIDE (Browser — ES5/6 depends on browser)        │
│                                                          │
│ ├── Client Scripts                                       │
│ ├── UI Policies (script)                                 │
│ ├── UI Actions (client portion)                          │
│ ├── Catalog Client Scripts                               │
│ └── Service Portal Widget Client Scripts (AngularJS)     │
│                                                          │
│ Available APIs: g_form, g_user, g_list, GlideAjax,      │
│ $scope, $http (portal), etc.                             │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Kiểu dữ liệu & Biến

### 2.1 Primitive Types

```javascript
// ═══════════════════════════════════════
// JavaScript có 5 primitive types + 1 object
// ═══════════════════════════════════════

// 1) String
var name = 'Nguyen Thanh';
var desc = "Double quotes also work";
var multiLine = 'Line 1\n' +
                'Line 2\n' +
                'Line 3';

// 2) Number (integer + float = cùng type)
var count = 42;
var price = 19.99;
var negative = -10;
var infinity = Infinity;
var notANumber = NaN;

// 3) Boolean
var isActive = true;
var isLocked = false;

// 4) null — explicitly empty
var result = null;

// 5) undefined — not assigned
var x;  // x is undefined
var obj = {};
gs.info(obj.missing);  // undefined

// 6) Object (everything else)
var user = { name: 'Thanh', age: 30 };
var items = [1, 2, 3];
var fn = function() {};
var date = new Date();
// All of these → typeof === 'object' (except function → 'function')
```

### 2.2 Type Checking & Coercion

```javascript
// ═══════════════════════════════════════
// typeof operator
// ═══════════════════════════════════════
typeof 'hello'      // 'string'
typeof 42           // 'number'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof null         // 'object' ← ⚠️ BUG nổi tiếng của JS!
typeof {}           // 'object'
typeof []           // 'object' ← ⚠️ Array cũng là object!
typeof function(){} // 'function'

// Kiểm tra Array đúng cách:
Array.isArray([1,2,3]);  // true
Array.isArray({});       // false

// Kiểm tra null ĐÚNG cách:
var val = null;
if (val === null) { /* ... */ }  // ✅ dùng === (strict equality)

// ═══════════════════════════════════════
// == vs === (Loose vs Strict Equality)
// ═══════════════════════════════════════

// ❌ == (loose) có type coercion → BUG TIỀM ẨN
0 == ''         // true  (0 → '' → true??)
0 == false      // true
'' == false     // true
null == undefined  // true
'5' == 5        // true

// ✅ === (strict) KHÔNG có type coercion → LUÔN DÙNG CÁI NÀY
0 === ''        // false
0 === false     // false
'' === false    // false
null === undefined  // false
'5' === 5       // false

// ═══════════════════════════════════════
// Type Coercion trong ServiceNow  
// ═══════════════════════════════════════

// GlideRecord trả về GlideElement, KHÔNG phải primitive!
var gr = new GlideRecord('incident');
gr.get('number', 'INC0010001');

// ⚠️ CẢNH BÁO:
gr.priority          // → GlideElement object (NOT number/string!)
gr.priority == 1     // → Có thể true do coercion, nhưng KHÔNG đáng tin
gr.priority === 1    // → false! (GlideElement !== number)

// ✅ ĐÚNG: Dùng getValue() hoặc toString()
gr.getValue('priority') === '1'         // ✅ So sánh string
parseInt(gr.getValue('priority')) === 1  // ✅ So sánh number
gr.priority.toString() === '1'          // ✅ Explicit conversion
```

### 2.3 Truthy & Falsy Values

```javascript
// ═══════════════════════════════════════
// Falsy values (false khi dùng trong if)
// ═══════════════════════════════════════
if (false)      {}  // falsy
if (0)          {}  // falsy
if ('')         {}  // falsy (empty string)
if (null)       {}  // falsy
if (undefined)  {}  // falsy
if (NaN)        {}  // falsy

// Mọi thứ khác là truthy:
if ('hello')    {}  // truthy
if (42)         {}  // truthy
if ({})         {}  // truthy ← ⚠️ empty object = truthy!
if ([])         {}  // truthy ← ⚠️ empty array = truthy!
if (function(){}) {} // truthy

// ═══════════════════════════════════════
// ServiceNow specific: GlideElement nil() check
// ═══════════════════════════════════════
var gr = new GlideRecord('incident');
gr.get('number', 'INC0010001');

// ❌ KHÔNG đáng tin:
if (gr.assigned_to) { }  // GlideElement → truthy NGAY CẢ khi field rỗng!

// ✅ ĐÚNG: Dùng nil()
if (!gr.assigned_to.nil()) {
    gs.info('Assigned to: ' + gr.assigned_to.getDisplayValue());
}

// ✅ ĐÚNG: Dùng getValue()
var assignee = gr.getValue('assigned_to');
if (assignee) {
    gs.info('Has assignee: ' + assignee);
}
```

### 2.4 var Hoisting

```javascript
// ═══════════════════════════════════════
// var bị "hoist" lên đầu function scope
// ═══════════════════════════════════════

// Code bạn viết:
function example() {
    gs.info(x);  // undefined (KHÔNG error!)
    var x = 10;
    gs.info(x);  // 10
}

// JavaScript engine hiểu:
function example() {
    var x;        // ← Declaration hoisted lên đầu
    gs.info(x);   // undefined
    x = 10;       // ← Assignment vẫn ở chỗ cũ
    gs.info(x);   // 10
}

// ✅ Best Practice: Khai báo tất cả var ở ĐẦU function
function processIncident(incSysId) {
    var gr, count, i, result;  // ← Declare all variables at top
    
    gr = new GlideRecord('incident');
    count = 0;
    result = [];
    // ...
}
```

---

## 3. Functions — Hàm

### 3.1 Function Declaration vs Expression

```javascript
// ═══════════════════════════════════════
// 1) Function Declaration — Hoisted
// ═══════════════════════════════════════
greet('Thanh');  // ✅ Hoạt động! (hoisted)

function greet(name) {
    gs.info('Hello, ' + name + '!');
}

// ═══════════════════════════════════════
// 2) Function Expression — NOT Hoisted
// ═══════════════════════════════════════
greet2('Thanh');  // ❌ TypeError: greet2 is not a function

var greet2 = function(name) {
    gs.info('Hello, ' + name + '!');
};

// ═══════════════════════════════════════
// 3) Immediately Invoked Function Expression (IIFE)
// ═══════════════════════════════════════
// Rất phổ biến trong ServiceNow (Business Rules, Client Scripts)

(function executeRule(current, previous) {
    // Code chạy ngay lập tức
    // Tạo scope riêng → không ô nhiễm global scope
    var localVar = 'safe';  // Chỉ tồn tại trong IIFE này
})(current, previous);
```

### 3.2 Parameters & Arguments

```javascript
// ═══════════════════════════════════════
// Default Parameters (ES5 pattern)
// ═══════════════════════════════════════

// ❌ ES6 syntax — KHÔNG hoạt động server-side:
// function greet(name = 'World') { }

// ✅ ES5 pattern:
function greet(name) {
    name = name || 'World';  // Default nếu name falsy
    gs.info('Hello, ' + name);
}

// ⚠️ Cẩn thận với || pattern:
function setCount(count) {
    count = count || 10;    // BUG: count = 0 → bị thay bằng 10!
}

// ✅ An toàn hơn:
function setCount(count) {
    if (typeof count === 'undefined') {
        count = 10;
    }
    // Hoặc:
    count = (count !== undefined && count !== null) ? count : 10;
}

// ═══════════════════════════════════════
// arguments object
// ═══════════════════════════════════════
function sum() {
    var total = 0;
    for (var i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}
sum(1, 2, 3, 4);  // 10

// ═══════════════════════════════════════
// Passing by Reference vs Value
// ═══════════════════════════════════════
// Primitives → passed by value (copy)
var a = 10;
function changeValue(x) { x = 20; }
changeValue(a);
gs.info(a);  // 10 — không thay đổi

// Objects → passed by reference
var obj = { name: 'Thanh' };
function changeName(o) { o.name = 'Anh'; }
changeName(obj);
gs.info(obj.name);  // 'Anh' — ĐÃ THAY ĐỔI!
```

### 3.3 Higher-Order Functions

```javascript
// ═══════════════════════════════════════
// Functions có thể truyền như arguments
// ═══════════════════════════════════════

// Callback pattern (rất phổ biến trong ServiceNow)
function queryIncidents(callback) {
    var gr = new GlideRecord('incident');
    gr.addQuery('active', true);
    gr.setLimit(10);
    gr.query();
    
    var results = [];
    while (gr.next()) {
        results.push({
            number: gr.getValue('number'),
            description: gr.getValue('short_description')
        });
    }
    
    callback(results);  // Gọi callback với kết quả
}

// Sử dụng:
queryIncidents(function(incidents) {
    for (var i = 0; i < incidents.length; i++) {
        gs.info(incidents[i].number + ': ' + incidents[i].description);
    }
});

// ═══════════════════════════════════════
// Functions trả về functions
// ═══════════════════════════════════════
function createGreeter(greeting) {
    return function(name) {
        return greeting + ', ' + name + '!';
    };
}

var hello = createGreeter('Hello');
var xin_chao = createGreeter('Xin chào');

hello('Thanh');     // "Hello, Thanh!"
xin_chao('Thanh'); // "Xin chào, Thanh!"
```

---

## 4. Objects & Prototypes

### 4.1 Object Basics

```javascript
// ═══════════════════════════════════════
// Object Literal
// ═══════════════════════════════════════
var incident = {
    number: 'INC0010001',
    priority: 1,
    state: 'New',
    isActive: true,
    tags: ['urgent', 'server'],
    caller: {
        name: 'Nguyen Thanh',
        email: 'thanh@company.com'
    },
    
    // Method
    getDisplayName: function() {
        return this.number + ' - ' + this.state;
    }
};

// Access properties
incident.number;              // 'INC0010001'
incident['priority'];         // 1 (bracket notation)
incident.caller.name;         // 'Nguyen Thanh' (nested)
incident.getDisplayName();    // 'INC0010001 - New'

// Dynamic property access
var field = 'priority';
incident[field];              // 1

// Check property exists
'number' in incident;         // true
incident.hasOwnProperty('number');  // true

// ═══════════════════════════════════════
// Iterate over properties
// ═══════════════════════════════════════
for (var key in incident) {
    if (incident.hasOwnProperty(key)) {  // ← LUÔN check hasOwnProperty!
        gs.info(key + ': ' + incident[key]);
    }
}

// Object keys (ES5)
var keys = Object.keys(incident);  // ['number', 'priority', 'state', ...]
```

### 4.2 Object.create & Prototypal Inheritance

```javascript
// ═══════════════════════════════════════
// Prototype Chain — Nền tảng của OOP trong JavaScript
// ═══════════════════════════════════════

// Base "class"
var Animal = {
    type: 'Unknown',
    speak: function() {
        return this.type + ' makes a sound';
    }
};

// "Subclass" inherits from Animal
var Dog = Object.create(Animal);
Dog.type = 'Dog';
Dog.bark = function() {
    return 'Woof!';
};

Dog.speak();  // "Dog makes a sound" — inherited from Animal
Dog.bark();   // "Woof!" — own method

// Prototype chain:
// Dog → Animal → Object.prototype → null
```

### 4.3 Class.create() — ServiceNow Pattern

```javascript
// ═══════════════════════════════════════
// ServiceNow dùng Class.create() thay vì ES6 class
// Đây là pattern chuẩn cho Script Includes
// ═══════════════════════════════════════

var IncidentHelper = Class.create();
IncidentHelper.prototype = {
    
    // Constructor
    initialize: function(tableName) {
        this.tableName = tableName || 'incident';
        this.LOG_PREFIX = '[IncidentHelper] ';
    },
    
    // Public method
    getActiveCount: function() {
        var ga = new GlideAggregate(this.tableName);
        ga.addQuery('active', true);
        ga.addAggregate('COUNT');
        ga.query();
        return ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
    },
    
    // Another public method
    getByPriority: function(priority) {
        var results = [];
        var gr = new GlideRecord(this.tableName);
        gr.addQuery('priority', priority);
        gr.addQuery('active', true);
        gr.query();
        while (gr.next()) {
            results.push({
                sys_id: gr.getUniqueValue(),
                number: gr.getValue('number'),
                description: gr.getValue('short_description')
            });
        }
        return results;
    },
    
    // "Private" method (convention: underscore prefix)
    _log: function(message) {
        gs.info(this.LOG_PREFIX + message);
    },
    
    type: 'IncidentHelper'  // Required for ServiceNow
};

// === Usage ===
var helper = new IncidentHelper('incident');
var count = helper.getActiveCount();
var p1List = helper.getByPriority(1);

helper._log('Found ' + count + ' active incidents');
```

### 4.4 Inheritance với extendsObject

```javascript
// ═══════════════════════════════════════
// ServiceNow Inheritance Pattern
// ═══════════════════════════════════════

// Base class
var TaskHelper = Class.create();
TaskHelper.prototype = {
    initialize: function(tableName) {
        this.tableName = tableName;
    },
    
    getActive: function() {
        var gr = new GlideRecord(this.tableName);
        gr.addQuery('active', true);
        gr.query();
        return gr;
    },
    
    close: function(sysId, notes) {
        var gr = new GlideRecord(this.tableName);
        if (gr.get(sysId)) {
            gr.state = 7;
            gr.close_notes = notes;
            gr.update();
            return true;
        }
        return false;
    },
    
    type: 'TaskHelper'
};

// Child class — extends TaskHelper
var IncidentTaskHelper = Class.create();
IncidentTaskHelper.prototype = Object.extendsObject(TaskHelper, {
    
    initialize: function() {
        // Call parent constructor
        TaskHelper.prototype.initialize.call(this, 'incident');
    },
    
    // Override parent method
    close: function(sysId, notes, resolutionCode) {
        var gr = new GlideRecord(this.tableName);
        if (gr.get(sysId)) {
            gr.state = 6;  // Resolved (not Closed directly)
            gr.close_notes = notes;
            gr.close_code = resolutionCode || 'Solved (Permanently)';
            gr.update();
            return true;
        }
        return false;
    },
    
    // New method (only in child)
    escalate: function(sysId) {
        var gr = new GlideRecord(this.tableName);
        if (gr.get(sysId)) {
            gr.priority = 1;
            gr.urgency = 1;
            gr.impact = 1;
            gr.update();
            return true;
        }
        return false;
    },
    
    type: 'IncidentTaskHelper'
});

// Usage:
var helper = new IncidentTaskHelper();
helper.getActive();      // Inherited from TaskHelper
helper.escalate(sysId);  // Own method
```

---

## 5. Arrays — Mảng

### 5.1 Array Methods (ES5)

```javascript
// ═══════════════════════════════════════
// Tạo Array
// ═══════════════════════════════════════
var empty = [];
var numbers = [1, 2, 3, 4, 5];
var mixed = ['hello', 42, true, null, { name: 'test' }];
var matrix = [[1, 2], [3, 4], [5, 6]];

// ═══════════════════════════════════════
// Mutating Methods (thay đổi array gốc)
// ═══════════════════════════════════════
var arr = [1, 2, 3];

arr.push(4);           // [1,2,3,4] — thêm cuối
arr.pop();             // [1,2,3] — xóa cuối, trả về 4
arr.unshift(0);        // [0,1,2,3] — thêm đầu
arr.shift();           // [1,2,3] — xóa đầu, trả về 0
arr.splice(1, 1);      // [1,3] — xóa 1 phần tử tại index 1
arr.splice(1, 0, 2);   // [1,2,3] — chèn 2 tại index 1
arr.reverse();         // [3,2,1] — đảo ngược
arr.sort();            // [1,2,3] — sắp xếp

// Sort với comparator:
var incidents = [
    { priority: 3, number: 'INC003' },
    { priority: 1, number: 'INC001' },
    { priority: 2, number: 'INC002' }
];
incidents.sort(function(a, b) {
    return a.priority - b.priority;  // Ascending
});
// → [INC001(P1), INC002(P2), INC003(P3)]

// ═══════════════════════════════════════
// Non-mutating Methods (trả về array mới)
// ═══════════════════════════════════════
var arr = [1, 2, 3, 4, 5];

arr.slice(1, 3);       // [2, 3] — slice(start, end)
arr.concat([6, 7]);    // [1,2,3,4,5,6,7]
arr.join(', ');         // '1, 2, 3, 4, 5'
arr.indexOf(3);        // 2 — index của phần tử
arr.lastIndexOf(3);    // 2
```

### 5.2 Array Iteration Methods (ES5 — RẤT QUAN TRỌNG)

```javascript
// ═══════════════════════════════════════
// forEach — Lặp qua mỗi phần tử
// ═══════════════════════════════════════
var incidents = ['INC001', 'INC002', 'INC003'];
incidents.forEach(function(inc, index) {
    gs.info(index + ': ' + inc);
});

// ═══════════════════════════════════════
// map — Transform mỗi phần tử → trả về array mới
// ═══════════════════════════════════════
var numbers = [1, 2, 3, 4, 5];
var doubled = numbers.map(function(n) {
    return n * 2;
});
// doubled = [2, 4, 6, 8, 10]

// ServiceNow practical example:
var gr = new GlideRecord('incident');
gr.addQuery('priority', 1);
gr.query();

var sysIds = [];
while (gr.next()) {
    sysIds.push(gr.getUniqueValue());
}
// sysIds = ['abc123...', 'def456...', ...]

// ═══════════════════════════════════════
// filter — Lọc phần tử theo điều kiện
// ═══════════════════════════════════════
var items = [
    { name: 'Server A', status: 'operational' },
    { name: 'Server B', status: 'down' },
    { name: 'Server C', status: 'operational' },
    { name: 'Server D', status: 'maintenance' }
];

var operational = items.filter(function(item) {
    return item.status === 'operational';
});
// → [Server A, Server C]

var nonOperational = items.filter(function(item) {
    return item.status !== 'operational';
});
// → [Server B, Server D]

// ═══════════════════════════════════════
// reduce — Gộp mảng thành 1 giá trị
// ═══════════════════════════════════════
var numbers = [10, 20, 30, 40];
var total = numbers.reduce(function(accumulator, current) {
    return accumulator + current;
}, 0);
// total = 100

// Practical: group incidents by priority
var incidents = [
    { number: 'INC001', priority: 1 },
    { number: 'INC002', priority: 2 },
    { number: 'INC003', priority: 1 },
    { number: 'INC004', priority: 3 },
    { number: 'INC005', priority: 1 }
];

var grouped = incidents.reduce(function(groups, inc) {
    var key = 'P' + inc.priority;
    if (!groups[key]) {
        groups[key] = [];
    }
    groups[key].push(inc.number);
    return groups;
}, {});
// grouped = { P1: ['INC001','INC003','INC005'], P2: ['INC002'], P3: ['INC004'] }

// ═══════════════════════════════════════
// some / every — Boolean checks
// ═══════════════════════════════════════
var numbers = [1, 2, 3, 4, 5];

numbers.some(function(n) { return n > 3; });   // true (ít nhất 1 > 3)
numbers.every(function(n) { return n > 0; });  // true (tất cả > 0)
numbers.every(function(n) { return n > 3; });  // false (không phải tất cả > 3)
```

---

## 6. String — Chuỗi

### 6.1 String Methods

```javascript
// ═══════════════════════════════════════
// String methods thường dùng
// ═══════════════════════════════════════
var str = 'Hello, ServiceNow World!';

str.length;                       // 24
str.charAt(0);                    // 'H'
str.indexOf('ServiceNow');        // 7
str.lastIndexOf('o');             // 21
str.includes('ServiceNow');       // true (ES6 nhưng browser hỗ trợ)
str.substring(7, 17);            // 'ServiceNow'
str.slice(7, 17);                // 'ServiceNow'
str.slice(-6);                   // 'orld!'
str.toLowerCase();               // 'hello, servicenow world!'
str.toUpperCase();               // 'HELLO, SERVICENOW WORLD!'
str.trim();                      // Remove whitespace đầu/cuối
str.replace('World', 'Platform'); // 'Hello, ServiceNow Platform!'
str.split(', ');                 // ['Hello', 'ServiceNow World!']
str.startsWith('Hello');         // true (ES6)
str.endsWith('!');               // true (ES6)

// ═══════════════════════════════════════
// String concatenation (ES5 — no template literals)
// ═══════════════════════════════════════
var name = 'Thanh';
var priority = 1;

// ES5 way (ServiceNow):
var msg = 'Incident assigned to ' + name + ' with priority ' + priority;

// Multi-line string:
var html = '<div class="alert">' +
           '  <h3>' + name + '</h3>' +
           '  <p>Priority: ' + priority + '</p>' +
           '</div>';

// Array join (cleaner for long strings):
var lines = [
    'Dear ' + name + ',',
    '',
    'Your incident has been resolved.',
    'Priority: ' + priority,
    '',
    'Best regards,',
    'IT Support Team'
].join('\n');
```

---

## 7. Scope & Closures

### 7.1 Scope

```javascript
// ═══════════════════════════════════════
// ES5 chỉ có Function Scope (KHÔNG có block scope)
// ═══════════════════════════════════════

// ⚠️ var KHÔNG có block scope!
if (true) {
    var x = 10;
}
gs.info(x);  // 10 — x vẫn accessible ngoài if!

for (var i = 0; i < 5; i++) {
    // i is accessible
}
gs.info(i);  // 5 — i vẫn accessible ngoài for!

// ✅ Function scope:
function example() {
    var y = 20;
}
// gs.info(y);  // ❌ ReferenceError — y chỉ tồn tại trong function
```

### 7.2 Closures

```javascript
// ═══════════════════════════════════════
// Closure = Function "nhớ" scope nơi nó được tạo
// ═══════════════════════════════════════

function createCounter() {
    var count = 0;  // Private variable
    
    return {
        increment: function() { count++; },
        decrement: function() { count--; },
        getCount: function() { return count; }
    };
}

var counter = createCounter();
counter.increment();
counter.increment();
counter.increment();
counter.getCount();  // 3
// count không accessible trực tiếp → encapsulation!

// ═══════════════════════════════════════
// Closure trong ServiceNow — Cache pattern
// ═══════════════════════════════════════
var GroupCache = (function() {
    var cache = {};
    
    return {
        getGroupSysId: function(groupName) {
            // Return từ cache nếu có
            if (cache[groupName]) {
                return cache[groupName];
            }
            
            // Query database
            var gr = new GlideRecord('sys_user_group');
            if (gr.get('name', groupName)) {
                cache[groupName] = gr.getUniqueValue();
                return cache[groupName];
            }
            
            return null;
        },
        
        clearCache: function() {
            cache = {};
        }
    };
})();

// Usage:
var sysId = GroupCache.getGroupSysId('IT Support');  // DB query lần 1
var sysId2 = GroupCache.getGroupSysId('IT Support'); // Từ cache — nhanh!

// ═══════════════════════════════════════
// Classic Closure Bug (loop + var)
// ═══════════════════════════════════════

// ❌ BUG: i luôn = 5 trong callback
for (var i = 0; i < 5; i++) {
    setTimeout(function() {
        gs.info(i);  // In ra 5, 5, 5, 5, 5 (KHÔNG phải 0,1,2,3,4)
    }, 100);
}

// ✅ FIX: Dùng IIFE tạo closure scope riêng
for (var i = 0; i < 5; i++) {
    (function(index) {
        setTimeout(function() {
            gs.info(index);  // In ra 0, 1, 2, 3, 4 ✅
        }, 100);
    })(i);
}
```

---

## 8. this Keyword

### 8.1 this trong các contexts

```javascript
// ═══════════════════════════════════════
// "this" phụ thuộc vào CÁCH function được gọi
// ═══════════════════════════════════════

// 1) Global context:
// this → global object (window in browser, không dùng trong SN)

// 2) Object method:
var obj = {
    name: 'Thanh',
    greet: function() {
        return 'Hello, ' + this.name;  // this = obj
    }
};
obj.greet();  // "Hello, Thanh"

// 3) Constructor (new keyword):
function User(name) {
    this.name = name;  // this = new object
}
var user = new User('Thanh');
user.name;  // 'Thanh'

// 4) ⚠️ Lost context:
var obj = {
    name: 'Thanh',
    greet: function() {
        return 'Hello, ' + this.name;
    }
};

var fn = obj.greet;
fn();  // "Hello, undefined" — this lost!

// ✅ Fix với bind:
var fn = obj.greet.bind(obj);
fn();  // "Hello, Thanh"

// ═══════════════════════════════════════
// this trong ServiceNow Script Includes
// ═══════════════════════════════════════
var MyHelper = Class.create();
MyHelper.prototype = {
    initialize: function() {
        this.prefix = '[MyHelper]';  // this = instance
    },
    
    doWork: function() {
        var self = this;  // ← Save reference!
        
        var gr = new GlideRecord('incident');
        gr.query();
        while (gr.next()) {
            // ⚠️ Bên trong callback, "this" có thể thay đổi
            // → Dùng "self" thay vì "this"
            self._log('Processing: ' + gr.getValue('number'));
        }
    },
    
    _log: function(msg) {
        gs.info(this.prefix + ' ' + msg);
    },
    
    type: 'MyHelper'
};
```

---

## 9. Error Handling

### 9.1 try-catch-finally

```javascript
// ═══════════════════════════════════════
// Error handling trong ServiceNow
// ═══════════════════════════════════════

function safeUpdate(tableName, sysId, updates) {
    try {
        var gr = new GlideRecord(tableName);
        if (!gr.get(sysId)) {
            throw new Error('Record not found: ' + sysId);
        }
        
        for (var field in updates) {
            if (updates.hasOwnProperty(field)) {
                gr.setValue(field, updates[field]);
            }
        }
        
        gr.update();
        gs.info('Successfully updated ' + tableName + ': ' + sysId);
        return true;
        
    } catch (ex) {
        gs.error('Error updating record: ' + ex.message);
        gs.error('Stack: ' + ex.stack);
        return false;
        
    } finally {
        // Luôn chạy, dù có lỗi hay không
        gs.debug('Update attempt completed for: ' + sysId);
    }
}

// ═══════════════════════════════════════
// Custom Error Types
// ═══════════════════════════════════════
function ValidationError(message, field) {
    this.name = 'ValidationError';
    this.message = message;
    this.field = field;
}
ValidationError.prototype = new Error();

function validateIncident(data) {
    if (!data.short_description) {
        throw new ValidationError(
            'Short description is required',
            'short_description'
        );
    }
    if (!data.caller_id) {
        throw new ValidationError(
            'Caller is required',
            'caller_id'
        );
    }
}

try {
    validateIncident({ short_description: '' });
} catch (ex) {
    if (ex.name === 'ValidationError') {
        gs.addErrorMessage('Validation: ' + ex.message + ' (field: ' + ex.field + ')');
    } else {
        gs.error('Unexpected error: ' + ex.message);
    }
}
```

---

## 10. Regular Expressions

### 10.1 Regex Basics

```javascript
// ═══════════════════════════════════════
// RegExp trong ServiceNow
// ═══════════════════════════════════════

// Tạo regex:
var pattern1 = /INC\d{7}/;          // Literal notation
var pattern2 = new RegExp('INC\\d{7}'); // Constructor

// Test:
pattern1.test('INC0010001');  // true
pattern1.test('CHG0010001');  // false

// Match:
var str = 'Incidents: INC0010001, INC0010002, INC0010003';
var match = str.match(/INC\d{7}/g);
// match = ['INC0010001', 'INC0010002', 'INC0010003']

// Replace:
var cleaned = 'Hello  World   ServiceNow'.replace(/\s+/g, ' ');
// cleaned = 'Hello World ServiceNow'

// ═══════════════════════════════════════
// Ví dụ thực tế trong ServiceNow
// ═══════════════════════════════════════

// Validate email
function isValidEmail(email) {
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

// Extract incident number từ text
function extractIncidentNumber(text) {
    var match = text.match(/INC\d{7}/);
    return match ? match[0] : null;
}

// Sanitize input (remove HTML tags)
function stripHTML(input) {
    return input.replace(/<[^>]*>/g, '');
}

// Validate IP address
function isValidIP(ip) {
    var pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!pattern.test(ip)) return false;
    
    var parts = ip.split('.');
    for (var i = 0; i < parts.length; i++) {
        var num = parseInt(parts[i]);
        if (num < 0 || num > 255) return false;
    }
    return true;
}
```

---

## 11. JSON

### 11.1 JSON trong ServiceNow

```javascript
// ═══════════════════════════════════════
// Parse & Stringify
// ═══════════════════════════════════════

// Object → JSON String
var obj = {
    number: 'INC0010001',
    priority: 1,
    tags: ['urgent', 'server'],
    caller: { name: 'Thanh' }
};

var jsonStr = JSON.stringify(obj);
// '{"number":"INC0010001","priority":1,"tags":["urgent","server"],"caller":{"name":"Thanh"}}'

// Pretty print:
var prettyJson = JSON.stringify(obj, null, 2);
/*
{
  "number": "INC0010001",
  "priority": 1,
  ...
}
*/

// JSON String → Object
var parsed = JSON.parse(jsonStr);
parsed.number;  // 'INC0010001'

// ═══════════════════════════════════════
// Safe JSON Parse
// ═══════════════════════════════════════
function safeParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (ex) {
        gs.error('Invalid JSON: ' + ex.message);
        return null;
    }
}

// ═══════════════════════════════════════
// ServiceNow: Lưu JSON trong string field
// ═══════════════════════════════════════
// Nhiều khi cần lưu structured data trong 1 string field:
var config = {
    autoAssign: true,
    defaultGroup: 'IT Support',
    escalationTime: 30,
    notifications: {
        email: true,
        slack: true
    }
};

// Lưu vào custom field:
var gr = new GlideRecord('sys_properties');
gr.addQuery('name', 'x_myapp.config');
gr.query();
if (gr.next()) {
    gr.value = JSON.stringify(config);
    gr.update();
}

// Đọc ra:
var configStr = gs.getProperty('x_myapp.config');
var config = safeParse(configStr);
if (config) {
    gs.info('Auto assign: ' + config.autoAssign);
}
```

---

## 12. Asynchronous Patterns

### 12.1 Async trong ServiceNow

```javascript
// ═══════════════════════════════════════
// ServiceNow KHÔNG dùng Promise/async-await
// Async patterns sử dụng callbacks
// ═══════════════════════════════════════

// 1) GlideAjax (Client → Server async)
// Đã cover chi tiết trong Bài 5

// 2) Async Business Rules
// → Chạy sau transaction, không block user

// 3) Scheduled Jobs
// → Chạy theo schedule, background thread

// 4) Events & Script Actions
// → Event-driven, async processing:

// Trigger event:
gs.eventQueue('x_myapp.incident.escalated', current, 
              current.assigned_to, current.priority);

// Script Action processes event asynchronously
// → Không block main transaction
```

---

## 13. Design Patterns trong ServiceNow

### 13.1 Module Pattern

```javascript
// ═══════════════════════════════════════
// Module Pattern — Encapsulation
// ═══════════════════════════════════════
var IncidentModule = (function() {
    // Private
    var defaultPriority = 3;
    var maxRetries = 3;
    
    function validate(data) {
        return data.short_description && data.short_description.length >= 10;
    }
    
    // Public API
    return {
        create: function(data) {
            if (!validate(data)) {
                throw new Error('Validation failed');
            }
            var gr = new GlideRecord('incident');
            gr.initialize();
            gr.short_description = data.short_description;
            gr.priority = data.priority || defaultPriority;
            return gr.insert();
        },
        
        getDefaultPriority: function() {
            return defaultPriority;
        }
    };
})();

IncidentModule.create({ short_description: 'Server is down' });
IncidentModule.getDefaultPriority();  // 3
// IncidentModule.validate(...)  → ❌ private, not accessible
```

### 13.2 Strategy Pattern

```javascript
// ═══════════════════════════════════════
// Strategy Pattern — Chọn algorithm runtime
// ═══════════════════════════════════════
var AssignmentStrategies = {
    roundRobin: function(group) {
        // Logic round-robin assignment
        var members = [];
        var grm = new GlideRecord('sys_user_grmember');
        grm.addQuery('group', group);
        grm.query();
        while (grm.next()) {
            members.push(grm.getValue('user'));
        }
        // Chọn member ít incidents nhất
        var minCount = Infinity;
        var selected = null;
        for (var i = 0; i < members.length; i++) {
            var ga = new GlideAggregate('incident');
            ga.addQuery('assigned_to', members[i]);
            ga.addQuery('active', true);
            ga.addAggregate('COUNT');
            ga.query();
            var count = ga.next() ? parseInt(ga.getAggregate('COUNT')) : 0;
            if (count < minCount) {
                minCount = count;
                selected = members[i];
            }
        }
        return selected;
    },
    
    manager: function(group) {
        // Assign to group manager
        var gr = new GlideRecord('sys_user_group');
        if (gr.get(group)) {
            return gr.getValue('manager');
        }
        return null;
    },
    
    onCall: function(group) {
        // Assign to on-call person
        // ... on-call rotation logic
        return null;
    }
};

// Usage:
var strategy = 'roundRobin';  // Có thể đọc từ config
var assignee = AssignmentStrategies[strategy](groupSysId);
```

---

## 14. JavaScript Pitfalls trong ServiceNow

### 14.1 Gotchas cần nhớ

```javascript
// ═══════════════════════════════════════
// PITFALL 1: GlideElement vs String/Number
// ═══════════════════════════════════════
var gr = new GlideRecord('incident');
gr.get('number', 'INC0010001');

// ❌ Sai: so sánh trực tiếp
if (gr.priority == 1) { }  // Unreliable!

// ✅ Đúng: dùng getValue()
if (gr.getValue('priority') == '1') { }

// ═══════════════════════════════════════
// PITFALL 2: Passing GlideRecord objects
// ═══════════════════════════════════════
// ❌ Sai: GlideRecord.next() di chuyển pointer cho TẤT CẢ references
var gr = new GlideRecord('incident');
gr.query();
var results = [];
while (gr.next()) {
    results.push(gr);  // ❌ Tất cả elements trỏ đến CÙNG 1 record (cuối cùng)!
}

// ✅ Đúng: Copy data ra
while (gr.next()) {
    results.push({
        sys_id: gr.getUniqueValue(),
        number: gr.getValue('number'),
        description: gr.getValue('short_description')
    });
}

// ═══════════════════════════════════════
// PITFALL 3: typeof null === 'object'
// ═══════════════════════════════════════
var x = null;
typeof x;  // 'object' ← BUG!

// ✅ Check null properly:
if (x === null) { }

// ═══════════════════════════════════════
// PITFALL 4: parseInt() without radix
// ═══════════════════════════════════════
parseInt('08');     // 0 in some engines (octal)!
parseInt('08', 10); // 8 ← Always specify radix 10!

// ═══════════════════════════════════════
// PITFALL 5: Floating point precision
// ═══════════════════════════════════════
0.1 + 0.2 === 0.3;  // false! (0.30000000000000004)

// ✅ Fix:
Math.abs(0.1 + 0.2 - 0.3) < 0.0001;  // true
```

---

## 15. Coding Standards & Conventions

```javascript
// ═══════════════════════════════════════
// ServiceNow JavaScript Coding Standards
// ═══════════════════════════════════════

// 1. Naming: camelCase cho variables/functions, PascalCase cho classes
var incidentCount = 0;                     // ✅ camelCase
var IncidentHelper = Class.create();       // ✅ PascalCase
var INCIDENT_TABLE = 'incident';           // ✅ UPPER_SNAKE for constants

// 2. Declare all vars at function top
function processData() {
    var gr, count, i, result;  // ✅ All at top
    // ...
}

// 3. Always use === instead of ==
if (value === 'active') { }  // ✅

// 4. Always use hasOwnProperty in for...in
for (var key in obj) {
    if (obj.hasOwnProperty(key)) { }  // ✅
}

// 5. Use JSDoc comments
/**
 * Get active incidents for a user
 * @param {string} userId - sys_id of the user
 * @param {number} [limit=10] - Max records to return
 * @returns {Array} Array of incident objects
 */
function getUserIncidents(userId, limit) { }

// 6. Consistent indentation (4 spaces or 1 tab)
// 7. Semicolons at end of statements
// 8. Single quotes for strings (ServiceNow convention)
```

---

## FAQ & Best Practices

### Q1: ES6 có hoạt động trong ServiceNow không?
**A:** **Client-side**: ES6 hoạt động trên modern browsers nhưng **không khuyến nghị** vì inconsistency. **Server-side**: **KHÔNG** — Rhino engine chỉ hỗ trợ ES5.

### Q2: Nên dùng JSHint/ESLint không?
**A:** ServiceNow có **Instance Scan** kiểm tra code quality. Ngoài ra, có thể dùng ESLint với config ES5 cho IDE.

### Q3: Performance: for loop vs forEach?
**A:** `for` loop nhanh hơn chút nhưng `forEach` readable hơn. Trong ServiceNow, **bottleneck thường là GlideRecord queries**, KHÔNG phải loop performance.

---

## Bài tập thực hành

### Bài 1: Array Manipulation
Viết Script Include `ArrayUtils` với methods:
1. `unique(arr)` — loại bỏ phần tử trùng
2. `flatten(arr)` — flatten nested arrays
3. `groupBy(arr, key)` — group objects theo key
4. `chunk(arr, size)` — chia array thành chunks

### Bài 2: Object Utilities
Viết Script Include `ObjectUtils`:
1. `deepClone(obj)` — deep copy object
2. `merge(target, source)` — merge 2 objects
3. `pick(obj, keys)` — lấy subset keys
4. `omit(obj, keys)` — loại bỏ keys

### Bài 3: String Processing
Viết Script Include `StringUtils`:
1. `truncate(str, maxLen)` — cắt string + thêm "..."
2. `slugify(str)` — "Hello World" → "hello-world"
3. `extractEmails(text)` — extract emails từ text
4. `sanitizeHTML(input)` — loại bỏ HTML tags

### Bài 4: Inheritance
1. Tạo base class `RecordHelper` với methods: `getById()`, `getAll()`, `count()`
2. Tạo child class `IncidentHelper` extends `RecordHelper`
3. Override `getAll()` để thêm default filters
4. Thêm method `escalate()` chỉ cho IncidentHelper

---

**Tiếp theo:** [Bài 17: AngularJS Chuyên Sâu cho Service Portal →](./17-AngularJS-ServiceNow.md)
