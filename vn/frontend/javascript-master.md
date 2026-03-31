# Master JavaScript — Từ Zero đến Expert

## Mục lục
- [1. JavaScript Engine & Runtime](#1-javascript-engine--runtime)
- [2. Variables, Data Types & Type Coercion](#2-variables-data-types--type-coercion)
- [3. Functions Deep Dive](#3-functions-deep-dive)
- [4. Objects & Prototypes](#4-objects--prototypes)
- [5. Scope, Closure & Hoisting](#5-scope-closure--hoisting)
- [6. this Keyword](#6-this-keyword)
- [7. Asynchronous JavaScript](#7-asynchronous-javascript)
- [8. ES6+ Features](#8-es6-features)
- [9. Array & Object Methods](#9-array--object-methods)
- [10. Error Handling](#10-error-handling)
- [11. DOM Manipulation](#11-dom-manipulation)
- [12. Event System](#12-event-system)
- [13. Design Patterns](#13-design-patterns)
- [14. Modules](#14-modules)
- [15. Memory Management & Performance](#15-memory-management--performance)
- [16. Interview Questions](#16-interview-questions)

---

## 1. JavaScript Engine & Runtime

### 1.1 JS Engine (V8)

```
JavaScript Runtime Architecture:

┌─────────────────────────────────────────────────────┐
│              JavaScript Runtime (Browser/Node.js)    │
│                                                      │
│  ┌───────────────── JS ENGINE (V8) ───────────────┐ │
│  │                                                 │ │
│  │  ┌─────────────┐    ┌──────────────────────┐   │ │
│  │  │  CALL STACK │    │      MEMORY HEAP     │   │ │
│  │  │             │    │                      │   │ │
│  │  │ main()      │    │  Objects allocated   │   │ │
│  │  │ greet()     │    │  here dynamically    │   │ │
│  │  │ sayHi()     │    │                      │   │ │
│  │  └─────────────┘    └──────────────────────┘   │ │
│  └─────────────────────────────────────────────────┘ │
│                      │                               │
│  ┌───────────────────┴─────────────────────────────┐ │
│  │                WEB APIs / Node APIs              │ │
│  │  setTimeout, fetch, DOM, HTTP, File System       │ │
│  └───────────────────┬─────────────────────────────┘ │
│                      │                               │
│  ┌───────────────────┴─────────────────────────────┐ │
│  │   CALLBACK QUEUE          MICROTASK QUEUE       │ │
│  │   (setTimeout, events)    (Promises, queueMicro)│ │
│  └───────────────────┬─────────────────────────────┘ │
│                      │                               │
│  ┌───────────────────┴─────────────────────────────┐ │
│  │              EVENT LOOP                          │ │
│  │  Liên tục kiểm tra: Call Stack trống?            │ │
│  │  → Lấy task từ Microtask Queue trước              │ │
│  │  → Sau đó lấy từ Callback Queue                  │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 1.2 Event Loop — Ví dụ kinh điển

```javascript
console.log('1');                          // Sync → Call Stack

setTimeout(() => console.log('2'), 0);     // Macro task → Callback Queue

Promise.resolve().then(() => console.log('3')); // Micro task → Microtask Queue

console.log('4');                          // Sync → Call Stack

// Output: 1, 4, 3, 2
// Giải thích:
// 1. Sync code chạy trước: 1, 4
// 2. Microtask (Promise) chạy trước Macrotask: 3
// 3. Macrotask (setTimeout) chạy cuối: 2
```

### 1.3 Execution Context

```javascript
// Mỗi function call tạo một Execution Context mới trên Call Stack

var name = 'Global';

function outer() {
    var name = 'Outer';
    
    function inner() {
        var name = 'Inner';
        console.log(name);  // 'Inner' — tìm trong scope hiện tại
    }
    
    inner();
}

outer();

// Call Stack flow:
// 1. Global Execution Context (created when script starts)
// 2. outer() Execution Context (push)
// 3. inner() Execution Context (push)
// 4. inner() completes → pop
// 5. outer() completes → pop
// 6. Global still running until script ends
```

---

## 2. Variables, Data Types & Type Coercion

### 2.1 var vs let vs const

```javascript
// ═══════════════════════════════════════
// var — Function scoped, hoisted (legacy)
// ═══════════════════════════════════════
console.log(a); // undefined (hoisted declaration, not value)
var a = 10;

for (var i = 0; i < 3; i++) {
    // i "leaks" out of the loop block
}
console.log(i); // 3 — vẫn accessible!

// ═══════════════════════════════════════
// let — Block scoped, NOT hoisted (usable)
// ═══════════════════════════════════════
// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 20;

for (let j = 0; j < 3; j++) {
    // j only exists inside this block
}
// console.log(j); // ReferenceError: j is not defined

// ═══════════════════════════════════════
// const — Block scoped, cannot reassign
// ═══════════════════════════════════════
const PI = 3.14159;
// PI = 3.14; // TypeError: Assignment to constant variable

// NHƯNG: const object/array vẫn có thể mutate!
const user = { name: 'Thanh' };
user.name = 'John';  // ✅ OK — mutate property
// user = {};         // ❌ Error — cannot reassign

const arr = [1, 2, 3];
arr.push(4);          // ✅ OK — mutate array
// arr = [];           // ❌ Error — cannot reassign
```

### 2.2 Primitive vs Reference Types

```javascript
// 7 Primitive types
typeof undefined   // "undefined"
typeof true        // "boolean"
typeof 42          // "number"
typeof 'hello'     // "string"
typeof 42n         // "bigint"
typeof Symbol()    // "symbol"
typeof null        // "object" ← BUG lịch sử! null là primitive

// Reference types
typeof {}          // "object"
typeof []          // "object"  ← Array is object!
typeof function(){} // "function"

// Primitive: copy by VALUE
let x = 10;
let y = x;
y = 20;
console.log(x); // 10 (không bị ảnh hưởng)

// Reference: copy by REFERENCE
let obj1 = { name: 'A' };
let obj2 = obj1;           // obj2 trỏ vào CÙNG object
obj2.name = 'B';
console.log(obj1.name);    // 'B' — bị ảnh hưởng!

// Deep copy solutions:
let clone1 = { ...obj1 };                  // Shallow copy
let clone2 = JSON.parse(JSON.stringify(obj1)); // Deep copy (hạn chế)
let clone3 = structuredClone(obj1);         // Deep copy (modern)
```

### 2.3 Type Coercion (Ép kiểu ngầm)

```javascript
// JavaScript tự động convert types — nguồn gốc nhiều bug!

// ═══ String coercion (+ with string)
'5' + 3        // '53'  (number → string)
'5' + true     // '5true'
'5' + null     // '5null'
'5' + undefined // '5undefined'

// ═══ Number coercion (-, *, /)
'5' - 3        // 2  (string → number)
'5' * '3'      // 15
'abc' - 1      // NaN

// ═══ Boolean coercion
// Falsy values: false, 0, -0, 0n, "", null, undefined, NaN
// Truthy: mọi thứ khác (bao gồm "0", [], {}, "false")

Boolean('')        // false
Boolean('0')       // true  ← cẩn thận!
Boolean([])        // true  ← cẩn thận!
Boolean({})        // true

// ═══ Equality
'5' == 5           // true  (coerces type)
'5' === 5          // false (strict, no coercion) ← luôn dùng ===
null == undefined  // true
null === undefined // false
NaN == NaN         // false ← NaN không bằng chính nó!
Number.isNaN(NaN)  // true  ← cách đúng để check NaN
```

---

## 3. Functions Deep Dive

### 3.1 Function Declaration vs Expression vs Arrow

```javascript
// ═══ Function Declaration — hoisted, có tên
greet(); // ✅ Works — hoisted
function greet() { return 'Hello'; }

// ═══ Function Expression — NOT hoisted
// sayHi(); // ❌ ReferenceError
const sayHi = function() { return 'Hi'; };

// ═══ Named Function Expression
const factorial = function fact(n) {
    return n <= 1 ? 1 : n * fact(n - 1); // có thể đệ quy bằng tên 'fact'
};

// ═══ Arrow Function (ES6)
const add = (a, b) => a + b;
const square = x => x * x;        // 1 param → bỏ ()
const getObj = () => ({ key: 1 }); // return object → dùng ()

// Arrow vs Regular — KHÁC BIỆT QUAN TRỌNG:
// 1. Arrow KHÔNG có `this` riêng (kế thừa from enclosing scope)
// 2. Arrow KHÔNG có `arguments` object
// 3. Arrow KHÔNG thể dùng làm constructor (new)
// 4. Arrow KHÔNG có `prototype` property
```

### 3.2 Higher-Order Functions

```javascript
// Higher-Order Function = function nhận hoặc trả về function

// Nhận function làm argument
function operate(a, b, operation) {
    return operation(a, b);
}
operate(5, 3, (a, b) => a + b); // 8
operate(5, 3, (a, b) => a * b); // 15

// Trả về function (Factory)
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}
const double = multiplier(2);
const triple = multiplier(3);
double(5);  // 10
triple(5);  // 15

// Currying
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return (...moreArgs) => curried(...args, ...moreArgs);
    };
}

const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(1)(2)(3);     // 6
curriedAdd(1, 2)(3);     // 6
curriedAdd(1)(2, 3);     // 6
```

### 3.3 IIFE, Arguments, Rest/Spread

```javascript
// IIFE — Immediately Invoked Function Expression
(function() {
    var private = 'cannot access from outside';
    console.log('runs immediately');
})();

// arguments object (chỉ regular function)
function sum() {
    let total = 0;
    for (let i = 0; i < arguments.length; i++) {
        total += arguments[i];
    }
    return total;
}
sum(1, 2, 3, 4); // 10

// Rest parameters (modern, works with arrow too)
const sumModern = (...numbers) => numbers.reduce((a, b) => a + b, 0);
sumModern(1, 2, 3, 4); // 10

// Spread operator
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }
```

---

## 4. Objects & Prototypes

### 4.1 Object Basics

```javascript
// Object creation
const user = { name: 'Thanh', age: 25 };

// Property access
user.name;        // dot notation
user['name'];     // bracket notation (dynamic keys)

// Dynamic keys
const key = 'age';
user[key];        // 25

// Computed property names (ES6)
const prop = 'email';
const obj = { [prop]: 'thanh@example.com' }; // { email: 'thanh@example.com' }

// Property descriptors
Object.defineProperty(user, 'id', {
    value: 1,
    writable: false,      // cannot change
    enumerable: false,     // won't show in for...in
    configurable: false    // cannot delete or reconfigure
});

// Freeze / Seal
Object.freeze(user);  // No add, delete, or modify
Object.seal(user);    // No add or delete, CAN modify existing
Object.isFrozen(user);
```

### 4.2 Prototype Chain

```javascript
// Mọi object trong JS đều có [[Prototype]]
// Prototype chain = cơ chế kế thừa trong JS

function Animal(name) {
    this.name = name;
}
Animal.prototype.speak = function() {
    return `${this.name} makes a sound`;
};

function Dog(name, breed) {
    Animal.call(this, name);  // Super constructor
    this.breed = breed;
}

// Kế thừa prototype
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
    return `${this.name} barks!`;
};

const dog = new Dog('Rex', 'Labrador');
dog.bark();   // 'Rex barks!'   — from Dog.prototype
dog.speak();  // 'Rex makes a sound' — from Animal.prototype (chain)

// Prototype chain:
// dog → Dog.prototype → Animal.prototype → Object.prototype → null
```

### 4.3 ES6 Classes (syntactic sugar)

```javascript
class Animal {
    #secret = 'hidden'; // Private field (ES2022)
    
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        return `${this.name} makes a sound`;
    }
    
    get info() {  // Getter
        return `Animal: ${this.name}`;
    }
    
    static create(name) {  // Static method
        return new Animal(name);
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // MUST call super() before using 'this'
        this.breed = breed;
    }
    
    speak() {  // Override
        return `${this.name} barks!`;
    }
}

const dog = new Dog('Rex', 'Labrador');
dog.speak();       // 'Rex barks!'
dog instanceof Dog;    // true
dog instanceof Animal; // true
```

---

## 5. Scope, Closure & Hoisting

### 5.1 Scope

```javascript
// Global Scope
var globalVar = 'global';

// Function Scope
function myFunc() {
    var funcVar = 'function';
    // globalVar accessible here ✅
}
// funcVar NOT accessible here ❌

// Block Scope (let, const)
if (true) {
    let blockLet = 'block';
    const blockConst = 'block';
    var blockVar = 'leaked'; // var ignores block scope!
}
// blockLet ❌
// blockConst ❌
// blockVar ✅ — leaked!

// Lexical Scope (Static Scope)
function outer() {
    const message = 'Hello';
    function inner() {
        console.log(message); // Accesses outer's variable
    }
    inner();
}
```

### 5.2 Closure — Concept quan trọng nhất

```javascript
// Closure = function "nhớ" scope nơi nó được tạo ra

function createCounter() {
    let count = 0; // Private variable — "enclosed"
    
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// count variable is NOT accessible directly!
// Nhưng các methods vẫn "nhớ" nó qua closure

// Closure classic bug (var in loop)
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 — vì var là function-scoped, 
// khi setTimeout chạy, i đã = 3

// Fix 1: let (block scope)
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

// Fix 2: IIFE (tạo closure mới mỗi iteration)
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(() => console.log(j), 100);
    })(i);
}
// Output: 0, 1, 2
```

### 5.3 Hoisting

```javascript
// JS "nâng" declarations lên đầu scope (nhưng KHÔNG nâng assignment)

// var hoisting:
console.log(x); // undefined (declaration hoisted, not value)
var x = 5;

// function declaration hoisting:
greet(); // ✅ "Hello" — entire function is hoisted
function greet() { console.log('Hello'); }

// let/const hoisting (TDZ — Temporal Dead Zone):
// console.log(y); // ❌ ReferenceError
let y = 10;
// let IS hoisted, but in TDZ until declaration line

// function expression NOT hoisted:
// myFunc(); // ❌ TypeError: myFunc is not a function
var myFunc = function() { console.log('Hi'); };
```

---

## 6. this Keyword

```javascript
// "this" refers to the EXECUTION CONTEXT, not the definition context

// 1. Global context
console.log(this); // Window (browser) / global (Node)

// 2. Object method
const user = {
    name: 'Thanh',
    greet() {
        console.log(this.name); // 'Thanh' — this = user
    }
};

// 3. Regular function
function show() {
    console.log(this); // Window (non-strict) / undefined (strict)
}

// 4. Arrow function — KHÔNG CÓ this riêng
const user2 = {
    name: 'Thanh',
    greet: () => {
        console.log(this.name); // undefined! — this = enclosing scope (global)
    },
    greetDelay() {
        setTimeout(() => {
            console.log(this.name); // 'Thanh'! — arrow inherits this from greetDelay
        }, 100);
    }
};

// 5. Explicit binding: call, apply, bind
function greet(greeting) {
    console.log(`${greeting}, ${this.name}`);
}
const person = { name: 'Thanh' };

greet.call(person, 'Hello');     // 'Hello, Thanh'
greet.apply(person, ['Hello']);  // 'Hello, Thanh'
const bound = greet.bind(person); // Returns new function
bound('Hi');                      // 'Hi, Thanh'

// 6. new keyword
function User(name) {
    this.name = name; // this = newly created object
}
const u = new User('Thanh'); // u.name = 'Thanh'

// Priority: new > bind > call/apply > object method > default
```

---

## 7. Asynchronous JavaScript

### 7.1 Callbacks

```javascript
// Callback = function passed as argument, called later

function fetchData(callback) {
    setTimeout(() => {
        callback(null, { id: 1, name: 'Data' });
    }, 1000);
}

fetchData((error, data) => {
    if (error) return console.error(error);
    console.log(data);
});

// Callback Hell (pyramid of doom)
getUser(userId, (err, user) => {
    getOrders(user.id, (err, orders) => {
        getItems(orders[0].id, (err, items) => {
            getDetails(items[0].id, (err, details) => {
                // 😱 Nightmare to read and maintain
            });
        });
    });
});
```

### 7.2 Promises

```javascript
// Promise = object đại diện cho giá trị tương lai
// States: pending → fulfilled (resolved) | rejected

const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        const success = true;
        if (success) resolve({ id: 1, name: 'Data' });
        else reject(new Error('Something went wrong'));
    }, 1000);
});

promise
    .then(data => console.log(data))
    .catch(err => console.error(err))
    .finally(() => console.log('Done'));

// Promise chaining (giải quyết callback hell)
getUser(userId)
    .then(user => getOrders(user.id))
    .then(orders => getItems(orders[0].id))
    .then(items => getDetails(items[0].id))
    .then(details => console.log(details))
    .catch(err => console.error(err));

// Promise utilities
Promise.all([p1, p2, p3]);      // ALL must resolve (fail-fast)
Promise.allSettled([p1, p2]);    // Wait all, regardless of result
Promise.race([p1, p2, p3]);     // First to settle (resolve OR reject)
Promise.any([p1, p2, p3]);      // First to RESOLVE (ignore rejections)
```

### 7.3 async/await

```javascript
// async/await = sugar syntax cho Promise

async function fetchUserData(userId) {
    try {
        const user = await getUser(userId);
        const orders = await getOrders(user.id);
        const items = await getItems(orders[0].id);
        return items;
    } catch (error) {
        console.error('Error:', error.message);
        throw error; // Re-throw nếu caller cần handle
    }
}

// Parallel async operations
async function fetchAll() {
    // ❌ Sequential (chậm)
    const users = await getUsers();
    const products = await getProducts(); // Chờ users xong mới chạy

    // ✅ Parallel (nhanh)
    const [users2, products2] = await Promise.all([
        getUsers(),
        getProducts()
    ]);
}

// Top-level await (ES2022, in modules)
const data = await fetch('/api/data');
```

---

## 8. ES6+ Features

```javascript
// ═══════════════════════════════════════
// Destructuring
// ═══════════════════════════════════════
const { name, age, email = 'N/A' } = user;        // Object
const [first, second, ...rest] = [1, 2, 3, 4, 5]; // Array
const { address: { city } } = user;                // Nested

// ═══════════════════════════════════════
// Template Literals
// ═══════════════════════════════════════
const greeting = `Hello, ${name}! You are ${age} years old.`;
const multiline = `
    Line 1
    Line 2
`;

// Tagged template literals
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) =>
        `${result}${str}<b>${values[i] || ''}</b>`, '');
}
highlight`Hello ${name}, age ${age}`; // "Hello <b>Thanh</b>, age <b>25</b>"

// ═══════════════════════════════════════
// Optional Chaining (?.)
// ═══════════════════════════════════════
const city = user?.address?.city;          // undefined nếu null/undefined
const firstOrder = user?.orders?.[0];      // Array element
const result = user?.greet?.();            // Method call

// ═══════════════════════════════════════
// Nullish Coalescing (??)
// ═══════════════════════════════════════
const value = null ?? 'default';   // 'default'
const value2 = 0 ?? 'default';    // 0 (!! khác ||)
const value3 = 0 || 'default';   // 'default' (|| treats 0 as falsy)

// ═══════════════════════════════════════
// Map, Set, WeakMap, WeakSet
// ═══════════════════════════════════════
const map = new Map();
map.set('key', 'value');
map.set(42, 'number key');     // Key có thể là bất kỳ type
map.get('key');                // 'value'
map.has('key');                // true
map.size;                      // 2

const set = new Set([1, 2, 2, 3, 3]); // {1, 2, 3} — unique values
set.add(4);
set.has(2);    // true
set.delete(2);

// ═══════════════════════════════════════
// Symbol
// ═══════════════════════════════════════
const id = Symbol('id');
const obj = { [id]: 123, name: 'Thanh' };
obj[id];  // 123
Object.keys(obj); // ['name'] — Symbol keys hidden from iteration

// ═══════════════════════════════════════
// Proxy & Reflect
// ═══════════════════════════════════════
const handler = {
    get(target, prop) {
        return prop in target ? target[prop] : `Property "${prop}" not found`;
    },
    set(target, prop, value) {
        if (typeof value !== 'string') throw new TypeError('Only strings!');
        target[prop] = value;
        return true;
    }
};
const proxy = new Proxy({}, handler);
proxy.name = 'Thanh';     // ✅
proxy.hello;              // 'Property "hello" not found'
// proxy.age = 25;        // ❌ TypeError: Only strings!

// ═══════════════════════════════════════
// Iterator & Generator
// ═══════════════════════════════════════
function* fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}
const fib = fibonacci();
fib.next().value; // 0
fib.next().value; // 1
fib.next().value; // 1
fib.next().value; // 2
```

---

## 9. Array & Object Methods

```javascript
// ═══════════════════════════════════════
// ARRAY METHODS — Immutable (return new array)
// ═══════════════════════════════════════
const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);           // [2, 4, 6, 8, 10]
nums.filter(n => n > 3);        // [4, 5]
nums.reduce((sum, n) => sum + n, 0); // 15
nums.find(n => n > 3);          // 4
nums.findIndex(n => n > 3);     // 3
nums.some(n => n > 4);          // true
nums.every(n => n > 0);         // true
nums.flat();                    // Flatten nested arrays
nums.flatMap(n => [n, n * 2]);  // [1,2, 2,4, 3,6, 4,8, 5,10]
nums.includes(3);               // true
nums.at(-1);                    // 5 (last element, ES2022)

// ═══════════════════════════════════════
// ARRAY METHODS — Mutable (modify original)
// ═══════════════════════════════════════
nums.push(6);      // Add to end
nums.pop();        // Remove from end
nums.unshift(0);   // Add to start
nums.shift();      // Remove from start
nums.splice(1,1);  // Remove at index
nums.sort((a,b) => a - b); // Sort (MUTATES!)
nums.reverse();    // Reverse (MUTATES!)

// Immutable sort (ES2023)
const sorted = nums.toSorted((a, b) => a - b);
const reversed = nums.toReversed();
const spliced = nums.toSpliced(1, 1);

// ═══════════════════════════════════════
// OBJECT METHODS
// ═══════════════════════════════════════
const user = { name: 'Thanh', age: 25, role: 'dev' };

Object.keys(user);      // ['name', 'age', 'role']
Object.values(user);    // ['Thanh', 25, 'dev']
Object.entries(user);   // [['name','Thanh'], ['age',25], ['role','dev']]
Object.fromEntries([['a',1],['b',2]]); // { a: 1, b: 2 }
Object.assign({}, user, { age: 26 });  // Merge/clone
Object.hasOwn(user, 'name');           // true (ES2022)
```

---

## 10. Error Handling

```javascript
// try / catch / finally
try {
    const data = JSON.parse(invalidJson);
} catch (error) {
    console.error(error.message);
    console.error(error.stack);
} finally {
    // Always runs (cleanup)
}

// Custom Error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
    }
}

class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}

throw new NotFoundError('User');
// Error: User not found (statusCode: 404)
```

---

## 11. DOM Manipulation

```javascript
// ═══ Selecting elements
document.getElementById('app');
document.querySelector('.btn');          // First match
document.querySelectorAll('.item');      // All matches (NodeList)
document.getElementsByClassName('item'); // HTMLCollection (live)

// ═══ Creating & modifying
const div = document.createElement('div');
div.textContent = 'Hello';
div.innerHTML = '<span>Hello</span>';   // XSS risk!
div.classList.add('active');
div.classList.remove('hidden');
div.classList.toggle('open');
div.setAttribute('data-id', '42');
div.style.color = 'red';

// ═══ DOM tree manipulation
parent.appendChild(div);
parent.removeChild(div);
parent.insertBefore(newNode, referenceNode);
element.remove();  // Modern
element.replaceWith(newElement);

// ═══ Performance: Document Fragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const li = document.createElement('li');
    li.textContent = `Item ${i}`;
    fragment.appendChild(li); // No reflow per item
}
document.getElementById('list').appendChild(fragment); // Single reflow
```

---

## 12. Event System

```javascript
// ═══ Event Listeners
element.addEventListener('click', handler);
element.addEventListener('click', handler, { 
    once: true,     // Remove after first trigger
    passive: true,  // Won't call preventDefault (scroll perf)
    capture: true   // Capture phase instead of bubble
});

// ═══ Event Propagation (Bubbling & Capturing)
// Capturing: document → html → body → parent → target (top-down)
// Bubbling:  target → parent → body → html → document (bottom-up)

parent.addEventListener('click', (e) => {
    console.log('Parent clicked');
    e.stopPropagation(); // Stop bubbling
});

// ═══ Event Delegation — Pattern quan trọng
// Thay vì 1000 listeners trên 1000 items → 1 listener trên parent
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.matches('.item')) {
        console.log('Item clicked:', e.target.dataset.id);
    }
});

// ═══ Custom Events
const event = new CustomEvent('userLoggedIn', {
    detail: { userId: 42, name: 'Thanh' }
});
element.dispatchEvent(event);
element.addEventListener('userLoggedIn', (e) => {
    console.log(e.detail.name); // 'Thanh'
});
```

---

## 13. Design Patterns

```javascript
// ═══ Module Pattern
const UserModule = (() => {
    let users = []; // Private
    return {
        add: (user) => users.push(user),
        getAll: () => [...users],
        count: () => users.length
    };
})();

// ═══ Singleton
class Database {
    static #instance = null;
    static getInstance() {
        if (!Database.#instance) {
            Database.#instance = new Database();
        }
        return Database.#instance;
    }
}

// ═══ Observer Pattern (Pub/Sub)
class EventEmitter {
    #events = {};
    on(event, cb)  { (this.#events[event] ??= []).push(cb); }
    off(event, cb) { this.#events[event] = this.#events[event]?.filter(f => f !== cb); }
    emit(event, ...args) { this.#events[event]?.forEach(cb => cb(...args)); }
}

// ═══ Factory Pattern
class UserFactory {
    static create(type, data) {
        switch (type) {
            case 'admin': return new AdminUser(data);
            case 'guest': return new GuestUser(data);
            default:      return new RegularUser(data);
        }
    }
}
```

---

## 14. Modules

```javascript
// ═══ ES Modules (ESM) — Modern standard
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator { /* ... */ }

// app.js
import Calculator, { PI, add } from './math.js';
import * as MathUtils from './math.js';

// Dynamic import (code splitting)
const module = await import('./heavy-module.js');

// ═══ CommonJS (Node.js legacy)
// math.js
module.exports = { PI: 3.14, add: (a, b) => a + b };
// app.js
const { PI, add } = require('./math');
```

---

## 15. Memory Management & Performance

```javascript
// ═══ Memory Leaks — Common patterns
// 1. Forgotten event listeners
element.addEventListener('click', handler);
// Fix: element.removeEventListener('click', handler);

// 2. Closures holding references
function createLeak() {
    const bigData = new Array(1000000).fill('x');
    return () => bigData.length; // Closure keeps bigData alive
}

// 3. Detached DOM nodes
const node = document.getElementById('item');
document.body.removeChild(node);
// If 'node' variable still exists → memory leak

// ═══ Performance Patterns
// Debounce — Chờ user ngừng hành động rồi mới chạy
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}
window.addEventListener('resize', debounce(handleResize, 300));

// Throttle — Chạy tối đa 1 lần mỗi khoảng thời gian
function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
window.addEventListener('scroll', throttle(handleScroll, 100));
```

---

## 16. Interview Questions

### Quick Reference

```
JavaScript Interview Cheat Sheet:

CORE:
├── var vs let vs const?         → scope, hoisting, TDZ
├── == vs ===?                   → coercion vs strict
├── null vs undefined?           → intentional absence vs not assigned
├── Closure là gì?               → function nhớ scope nơi nó tạo ra
├── Hoisting?                    → declarations moved to top, not values
├── Prototype chain?              → lookup chain for properties
├── this?                        → depends on HOW function is called

ASYNC:
├── Event loop?                  → call stack + micro/macro queues
├── Promise states?              → pending, fulfilled, rejected
├── async/await vs Promise?      → syntax sugar, same mechanism
├── Promise.all vs allSettled?   → fail-fast vs wait all

PATTERNS:
├── Event delegation?            → 1 listener on parent vs N on children
├── Debounce vs throttle?        → wait-then-run vs max-once-per-interval
├── Memoization?                 → cache function results
├── Observer pattern?            → pub/sub decoupling
├── Module pattern?              → encapsulation via IIFE/closure

PERFORMANCE:
├── Memory leaks?                → listeners, closures, detached DOM
├── DOM reflow/repaint?          → minimize direct DOM manipulation
├── requestAnimationFrame?       → smooth 60fps animations
├── Web Workers?                 → heavy computation off main thread
```

---

**Tiếp theo:** [AngularJS Master →](./angularjs-master.md)
