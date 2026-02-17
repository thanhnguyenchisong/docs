# Async Programming

## Mục lục
1. [Tại sao Async?](#tại-sao-async)
2. [Callbacks](#callbacks)
3. [Promises](#promises)
4. [async / await](#async--await)
5. [Event Loop chi tiết](#event-loop-chi-tiết)
6. [Parallel, Sequential, Race](#parallel-sequential-race)
7. [Error Handling trong Async](#error-handling-trong-async)
8. [Common Pitfalls](#common-pitfalls)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại sao Async?

Node.js chạy trên **1 thread**. Nếu block thread (đọc file, query DB, HTTP call), toàn bộ app bị đứng. Async cho phép:

```
Request A → Gửi query DB (không chờ) → Xử lý Request B
                                         ↓
                        DB trả về → Callback A chạy
```

---

## Callbacks

**Callback** = function được truyền làm argument, gọi khi operation hoàn thành.

### Error-first callback (Node.js convention)

```javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('Lỗi:', err.message);
    return;
  }
  console.log(data);
});
```

### Callback Hell

```javascript
// ❌ Pyramid of doom
getUser(userId, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getProducts(orders[0].id, (err, products) => {
      if (err) return handleError(err);
      // ... tiếp tục lồng ...
    });
  });
});
```

Giải pháp: **Promise** hoặc **async/await**.

---

## Promises

**Promise** = object đại diện cho giá trị sẽ có trong tương lai.

### 3 trạng thái

```
┌──────────┐     resolve(value)     ┌───────────┐
│ Pending  │ ─────────────────────▶ │ Fulfilled │
│          │                        └───────────┘
│          │     reject(error)      ┌───────────┐
│          │ ─────────────────────▶ │ Rejected  │
└──────────┘                        └───────────┘
```

### Tạo Promise

```javascript
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Sử dụng
readFileAsync('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err))
  .finally(() => console.log('Done'));
```

### Promise chaining

```javascript
// ✅ Flat chain — không lồng nhau
getUser(userId)
  .then(user => getOrders(user.id))
  .then(orders => getProducts(orders[0].id))
  .then(products => console.log(products))
  .catch(err => console.error(err)); // bắt lỗi ở bất kỳ bước nào
```

### Static methods

```javascript
// Promise.all — chạy song song, fail nếu 1 fail
const [users, posts] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
]);

// Promise.allSettled — chạy song song, KHÔNG fail
const results = await Promise.allSettled([
  fetch('/api/users'),
  fetch('/api/broken'), // lỗi
]);
// results: [{status:'fulfilled', value:...}, {status:'rejected', reason:...}]

// Promise.race — trả về promise đầu tiên settle (fulfil/reject)
const fastest = await Promise.race([
  fetch('/api/primary'),
  fetch('/api/mirror'),
]);

// Promise.any — trả về promise đầu tiên FULFILLED (bỏ qua reject)
const first = await Promise.any([
  fetch('/api/server1'),
  fetch('/api/server2'),
]);

// Tạo nhanh
Promise.resolve(42);       // fulfilled với value 42
Promise.reject(new Error('fail'));
```

---

## async / await

**Syntax sugar** trên Promise — code async trông như sync.

```javascript
// ✅ Sạch, dễ đọc, dễ debug
async function main() {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const products = await getProducts(orders[0].id);
    console.log(products);
  } catch (err) {
    console.error('Lỗi:', err.message);
  }
}
main();
```

### Quy tắc

1. `await` chỉ dùng **trong** `async function` (hoặc top-level ESM module).
2. `async function` luôn trả về **Promise**.
3. `await` "pause" function tại dòng đó cho đến khi Promise resolve.

```javascript
async function fetchData() {
  return 42; // tương đương return Promise.resolve(42)
}

const result = await fetchData(); // 42
```

### Top-level await (ESM)

```javascript
// package.json: "type": "module"
// Hoặc file .mjs

const data = await fetch('https://api.example.com/data').then(r => r.json());
console.log(data);
```

---

## Event Loop chi tiết

### Thứ tự ưu tiên thực thi

```
1. Synchronous code (call stack)
2. process.nextTick() — microtask
3. Promise callbacks (.then, .catch) — microtask
4. timers (setTimeout, setInterval) — macrotask
5. I/O callbacks
6. setImmediate() — check phase
```

### Ví dụ phức tạp

```javascript
console.log('1 - sync');

setTimeout(() => console.log('2 - timeout 0'), 0);
setTimeout(() => console.log('3 - timeout 100'), 100);

setImmediate(() => console.log('4 - immediate'));

Promise.resolve()
  .then(() => console.log('5 - promise 1'))
  .then(() => console.log('6 - promise 2'));

process.nextTick(() => {
  console.log('7 - nextTick');
  process.nextTick(() => console.log('8 - nextTick nested'));
});

console.log('9 - sync end');
```

**Output:**
```
1 - sync
9 - sync end
7 - nextTick
8 - nextTick nested
5 - promise 1
6 - promise 2
2 - timeout 0
4 - immediate
3 - timeout 100
```

### Starvation cảnh báo

```javascript
// ❌ Starvation — nextTick recursive block Event Loop
function recursive() {
  process.nextTick(recursive); // timers, I/O sẽ KHÔNG BAO GIỜ chạy
}
recursive();

// ✅ Dùng setImmediate thay thế
function safeRecursive() {
  setImmediate(safeRecursive); // cho phép I/O chạy giữa các iteration
}
```

---

## Parallel, Sequential, Race

### Sequential (tuần tự)

```javascript
// Mỗi request chờ cái trước xong — CHẬM
async function sequential() {
  const user = await getUser(1);       // 200ms
  const posts = await getPosts(1);     // 300ms
  const comments = await getComments(1); // 150ms
  // Tổng: 650ms
  return { user, posts, comments };
}
```

### Parallel (song song)

```javascript
// Chạy đồng thời — NHANH
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    getUser(1),       // 200ms
    getPosts(1),      // 300ms  ← tất cả chạy cùng lúc
    getComments(1),   // 150ms
  ]);
  // Tổng: ~300ms (max)
  return { user, posts, comments };
}
```

### Parallel với giới hạn (concurrency limit)

```javascript
// Xử lý 1000 items, nhưng tối đa 5 cùng lúc
async function parallelLimit(items, limit, fn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = fn(item).then(result => {
      executing.delete(p);
      return result;
    });
    executing.add(p);
    results.push(p);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(results);
}

// Sử dụng
const urls = [...]; // 1000 URLs
const data = await parallelLimit(urls, 5, url => fetch(url).then(r => r.json()));
```

---

## Error Handling trong Async

### try/catch

```javascript
async function main() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (err) {
    console.error('Error:', err.message);
    throw err; // re-throw nếu cần
  } finally {
    console.log('Cleanup');
  }
}
```

### Unhandled Promise Rejection

```javascript
// ❌ Promise reject mà không catch → crash (Node 15+)
doSomething(); // trả về rejected Promise, không có .catch()

// ✅ Luôn catch
doSomething().catch(err => console.error(err));

// Global handler (safety net)
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Ghi log, gửi alert
});
```

---

## Common Pitfalls

### 1. await trong loop (tuần tự không chủ ý)

```javascript
// ❌ CHẬM — tuần tự
for (const id of ids) {
  const user = await getUser(id); // chờ từng cái
}

// ✅ NHANH — song song
const users = await Promise.all(ids.map(id => getUser(id)));
```

### 2. Quên return trong .then()

```javascript
// ❌ Promise chain bị đứt
promise
  .then(data => {
    processData(data); // quên return
  })
  .then(result => {
    console.log(result); // undefined!
  });

// ✅
promise
  .then(data => processData(data)) // return ngầm
  .then(result => console.log(result));
```

### 3. Mixing callback và Promise

```javascript
// ❌ Callback bên trong async function
async function bad() {
  fs.readFile('file.txt', (err, data) => {
    // err ở đây KHÔNG được try/catch bắt
  });
}

// ✅ Dùng Promise version
const { readFile } = require('fs/promises');
async function good() {
  const data = await readFile('file.txt', 'utf-8');
}
```

---

## Câu hỏi phỏng vấn

**Q: Callback, Promise, async/await khác gì nhau?**

> Callback: function truyền vào, dễ bị callback hell. Promise: object đại diện giá trị tương lai, chainable. async/await: syntax sugar trên Promise, code dễ đọc như sync. Tất cả dùng cùng Event Loop mechanism.

**Q: `Promise.all` vs `Promise.allSettled` vs `Promise.race`?**

> `.all`: chờ tất cả resolve, reject ngay nếu 1 fail. `.allSettled`: chờ tất cả settle (kể cả reject). `.race`: trả về cái đầu tiên settle.

**Q: `async function` return gì?**

> Luôn return Promise. `return 42` → `Promise.resolve(42)`. `throw err` → rejected Promise.

**Q: Cách xử lý nhiều request mà không quá tải server?**

> Dùng concurrency limiter: chạy Promise song song nhưng giới hạn số lượng đồng thời (ví dụ tối đa 5). Dùng `p-limit`, `p-queue`, hoặc tự implement.

---

**Tiếp theo**: [05 - HTTP & Express.js](./05-HTTP-Express.md)
