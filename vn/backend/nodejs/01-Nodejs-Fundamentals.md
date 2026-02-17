# Node.js Fundamentals

## Mục lục
1. [Node.js là gì?](#nodejs-là-gì)
2. [V8 Engine](#v8-engine)
3. [Event Loop](#event-loop)
4. [Module System](#module-system)
5. [Global Objects](#global-objects)
6. [REPL](#repl)
7. [Node.js vs Browser](#nodejs-vs-browser)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Node.js là gì?

### Định nghĩa

**Node.js** là một **JavaScript runtime** được xây dựng trên **V8 JavaScript engine** của Chrome. Nó cho phép chạy JavaScript **bên ngoài trình duyệt** — trên server, CLI tools, desktop apps.

### Đặc điểm chính

1. **Single-threaded** — Chỉ dùng 1 thread chính (main thread), nhưng xử lý concurrency thông qua Event Loop.
2. **Non-blocking I/O** — Các thao tác I/O (đọc file, query DB, HTTP request) không block thread chính.
3. **Event-driven** — Mọi thứ hoạt động dựa trên events và callbacks.
4. **Cross-platform** — Chạy trên Windows, macOS, Linux.
5. **Ecosystem lớn** — npm là package registry lớn nhất thế giới.

### Khi nào dùng Node.js?

| Phù hợp | Không phù hợp |
|----------|---------------|
| REST API, GraphQL | Tính toán nặng CPU (ML, video encoding) |
| Real-time (chat, WebSocket) | Ứng dụng cần multi-threading chuyên sâu |
| Microservices | Heavy computational tasks |
| CLI tools | |
| Server-side rendering (SSR) | |
| Streaming data | |

### Cài đặt

```bash
# Dùng nvm (khuyến nghị) — quản lý nhiều version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20      # LTS mới nhất
nvm use 20
node -v              # v20.x.x
npm -v               # 10.x.x

# Hoặc tải trực tiếp từ https://nodejs.org
```

### Chạy file đầu tiên

```javascript
// hello.js
console.log('Hello, Node.js!');
console.log('Version:', process.version);
console.log('Platform:', process.platform);
```

```bash
node hello.js
# Hello, Node.js!
# Version: v20.x.x
# Platform: linux
```

---

## V8 Engine

### V8 là gì?

**V8** là JavaScript engine do Google phát triển (viết bằng C++), dùng trong Chrome và Node.js.

### Cách V8 hoạt động

```
JavaScript Code
      │
      ▼
┌─────────────┐
│   Parser    │  → Phân tích cú pháp → AST (Abstract Syntax Tree)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Ignition   │  → Interpreter: chạy nhanh, sinh bytecode
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ TurboFan    │  → JIT Compiler: tối ưu hot code → machine code
└─────────────┘
```

### Các khái niệm quan trọng

**1. JIT Compilation (Just-In-Time):**
- V8 không chỉ interpret mà còn compile JavaScript thành machine code khi runtime.
- "Hot code" (chạy nhiều lần) được TurboFan tối ưu hóa.

**2. Garbage Collection:**
- V8 tự động quản lý bộ nhớ.
- Sử dụng **generational GC**: Young Generation (Scavenger) và Old Generation (Mark-Sweep/Mark-Compact).

**3. Hidden Classes:**
- V8 tạo "hidden classes" cho objects để tối ưu truy cập property (giống như struct trong C).
- **Tip**: Luôn khởi tạo properties theo cùng thứ tự.

```javascript
// TỐT — cùng hidden class
function Point(x, y) {
  this.x = x;
  this.y = y;
}

// KHÔNG TỐT — thêm property sau tạo hidden class mới
const obj = {};
obj.x = 1;  // hidden class 1
obj.y = 2;  // hidden class 2 (chậm hơn)
```

---

## Event Loop

### Event Loop là gì?

Event Loop là cơ chế cho phép Node.js thực hiện **non-blocking I/O** dù chỉ có **single thread**. Nó liên tục kiểm tra xem có callback/event nào cần xử lý không.

### Kiến trúc Node.js

```
┌──────────────────────────────────┐
│         Ứng dụng Node.js         │
│      (JavaScript / V8 Engine)    │
└──────────────┬───────────────────┘
               │
┌──────────────▼───────────────────┐
│           Event Loop             │
│    (libuv — viết bằng C/C++)     │
└──────────────┬───────────────────┘
               │
     ┌─────────┼─────────┐
     ▼         ▼         ▼
  Thread    OS Kernel   Thread
   Pool     (epoll/     Pool
  (fs,      kqueue)    (DNS,
  crypto)   (network)   zlib)
```

### 6 Phases của Event Loop

```
   ┌───────────────────────────┐
┌─▶│       timers              │  ← setTimeout, setInterval
│  └────────────┬──────────────┘
│  ┌────────────▼──────────────┐
│  │   pending callbacks       │  ← I/O callbacks bị hoãn
│  └────────────┬──────────────┘
│  ┌────────────▼──────────────┐
│  │       idle, prepare       │  ← internal use
│  └────────────┬──────────────┘
│  ┌────────────▼──────────────┐
│  │         poll               │  ← I/O events (file, network)
│  └────────────┬──────────────┘
│  ┌────────────▼──────────────┐
│  │         check             │  ← setImmediate
│  └────────────┬──────────────┘
│  ┌────────────▼──────────────┐
│  │    close callbacks        │  ← socket.on('close', ...)
│  └────────────┬──────────────┘
└───────────────┘
```

### Ví dụ thứ tự thực thi

```javascript
console.log('1: Start');

setTimeout(() => console.log('2: setTimeout'), 0);

setImmediate(() => console.log('3: setImmediate'));

Promise.resolve().then(() => console.log('4: Promise (microtask)'));

process.nextTick(() => console.log('5: nextTick (microtask)'));

console.log('6: End');
```

**Output:**
```
1: Start
6: End
5: nextTick (microtask)     ← microtask queue (ưu tiên nhất)
4: Promise (microtask)       ← microtask queue
2: setTimeout                ← timers phase
3: setImmediate              ← check phase
```

### Microtask vs Macrotask

| Microtask (ưu tiên cao) | Macrotask |
|--------------------------|-----------|
| `process.nextTick()` | `setTimeout()` |
| `Promise.then()` | `setInterval()` |
| `queueMicrotask()` | `setImmediate()` |
| | I/O callbacks |

**Quy tắc**: Sau mỗi macrotask, Node.js xử lý **toàn bộ** microtask queue trước khi sang macrotask tiếp.

---

## Module System

### CommonJS (CJS) — Mặc định

```javascript
// math.js — export
function add(a, b) { return a + b; }
function sub(a, b) { return a - b; }
module.exports = { add, sub };

// Hoặc:
exports.add = (a, b) => a + b;

// app.js — import
const { add, sub } = require('./math');
console.log(add(1, 2)); // 3
```

### ES Modules (ESM) — Hiện đại

Cần `"type": "module"` trong `package.json` hoặc dùng file `.mjs`:

```javascript
// math.mjs — export
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.mjs — import
import multiply, { add } from './math.mjs';
console.log(add(1, 2));      // 3
console.log(multiply(3, 4)); // 12
```

### So sánh CJS vs ESM

| Đặc điểm | CommonJS | ES Modules |
|-----------|----------|------------|
| Cú pháp | `require()` / `module.exports` | `import` / `export` |
| Loading | **Synchronous** | **Asynchronous** |
| Top-level await | Không | Có |
| Tree-shaking | Không | Có |
| File extension | `.js`, `.cjs` | `.mjs` hoặc `"type":"module"` |
| `__dirname` | Có sẵn | Cần `import.meta.url` |
| Dynamic import | `require(expr)` | `import(expr)` |

```javascript
// ESM: thay thế __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Module Resolution

```javascript
// 1. Core module (built-in)
const fs = require('fs');

// 2. File module (relative path)
const lib = require('./lib');       // ./lib.js hoặc ./lib/index.js

// 3. node_modules
const express = require('express'); // tìm trong node_modules/
```

**Thứ tự tìm:**
1. Core module (fs, path, http, ...)
2. File/folder nếu bắt đầu bằng `./`, `../`, `/`
3. `node_modules/` — tìm từ folder hiện tại lên root

---

## Global Objects

```javascript
// ---- process ----
console.log(process.env.NODE_ENV);   // biến môi trường
console.log(process.argv);           // arguments dòng lệnh
console.log(process.cwd());          // current working directory
console.log(process.pid);            // process ID
console.log(process.memoryUsage());  // RAM usage
process.exit(0);                     // thoát

// ---- __dirname, __filename (CJS) ----
console.log(__dirname);   // thư mục chứa file hiện tại
console.log(__filename);  // đường dẫn đầy đủ file

// ---- console ----
console.log('info');
console.error('error');
console.warn('warn');
console.time('label');
// ... code ...
console.timeEnd('label'); // in thời gian

// ---- Timers ----
setTimeout(fn, ms);
setInterval(fn, ms);
setImmediate(fn);
clearTimeout(id);
clearInterval(id);

// ---- Buffer ----
const buf = Buffer.from('Hello');
console.log(buf.toString('base64')); // SGVsbG8=

// ---- global ----
global.myVar = 42;  // tương đương window trong browser (không khuyến khích)
```

---

## REPL

**REPL** = Read-Eval-Print-Loop — dùng để thử nhanh code.

```bash
$ node
> 1 + 2
3
> 'hello'.toUpperCase()
'HELLO'
> const fs = require('fs')
> fs.readdirSync('.')
[ 'hello.js', 'package.json', ... ]
> .help     # xem các lệnh REPL
> .exit     # thoát
```

---

## Node.js vs Browser

| Đặc điểm | Node.js | Browser |
|-----------|---------|---------|
| Engine | V8 | V8 (Chrome), SpiderMonkey (Firefox), ... |
| DOM | Không có | Có (`document`, `window`) |
| Global | `global`, `process` | `window`, `document` |
| Module | CommonJS, ESM | ESM |
| File system | Có (`fs`) | Không (trừ File API) |
| Network | TCP, UDP, HTTP | HTTP (fetch, XHR) |
| Thread | `worker_threads` | Web Workers |
| Package manager | npm/yarn/pnpm | Không (dùng bundler) |

---

## Câu hỏi phỏng vấn

### Cơ bản

**Q: Node.js là gì? Tại sao nó single-threaded mà vẫn xử lý được nhiều request?**

> Node.js là JavaScript runtime trên V8. Nó single-threaded nhưng dùng **Event Loop** và **non-blocking I/O** (libuv) để xử lý concurrency. Các I/O operations được giao cho OS kernel hoặc thread pool (libuv), khi xong sẽ callback lại main thread. Nên 1 thread vẫn serve được hàng nghìn concurrent connections.

**Q: Event Loop có bao nhiêu phase? Kể tên.**

> 6 phases: **timers** → **pending callbacks** → **idle/prepare** → **poll** → **check** → **close callbacks**. Giữa mỗi phase có microtask queue (process.nextTick, Promise).

**Q: Sự khác nhau giữa `process.nextTick()` và `setImmediate()`?**

> `process.nextTick()` chạy ngay sau operation hiện tại, trước khi Event Loop tiếp tục (microtask). `setImmediate()` chạy ở check phase của Event Loop tiếp theo (macrotask). `nextTick` luôn chạy trước `setImmediate`.

**Q: CommonJS vs ES Modules?**

> CJS: `require()`, synchronous, không tree-shake. ESM: `import/export`, async, tree-shakable, hỗ trợ top-level await. Node.js mặc định dùng CJS, cần `"type": "module"` trong package.json để dùng ESM.

### Nâng cao

**Q: V8 compile JavaScript như thế nào?**

> V8 dùng JIT (Just-In-Time): Parser → AST → Ignition (interpreter, sinh bytecode) → TurboFan (optimizing compiler, sinh machine code cho hot functions). Nếu assumption sai thì deoptimize quay về bytecode.

**Q: Tại sao nên tránh block Event Loop?**

> Vì Node.js single-threaded — nếu block main thread (vòng lặp nặng, sync I/O, JSON.parse file lớn), tất cả request khác phải chờ. Giải pháp: dùng async I/O, Worker Threads cho CPU-intensive tasks, chia nhỏ computation.

---

**Tiếp theo**: [02 - Core Modules](./02-Core-Modules.md) — fs, path, http, os, events, url, crypto.
