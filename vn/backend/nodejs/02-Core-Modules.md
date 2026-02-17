# Core Modules

## Mục lục
1. [Tổng quan Core Modules](#tổng-quan-core-modules)
2. [fs — File System](#fs--file-system)
3. [path](#path)
4. [http / https](#http--https)
5. [os](#os)
6. [events — EventEmitter](#events--eventemitter)
7. [url & querystring](#url--querystring)
8. [crypto](#crypto)
9. [child_process](#child_process)
10. [util](#util)
11. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tổng quan Core Modules

Core modules là các module **built-in** của Node.js — không cần cài qua npm. Import bằng tên module (không cần path):

```javascript
const fs = require('fs');            // CommonJS
import fs from 'fs';                 // ESM
import { readFile } from 'fs/promises'; // ESM named
```

Danh sách core modules quan trọng: `fs`, `path`, `http`, `https`, `os`, `events`, `url`, `crypto`, `stream`, `buffer`, `child_process`, `util`, `net`, `dns`, `cluster`, `worker_threads`.

---

## fs — File System

Module quan trọng nhất — đọc/ghi file, quản lý thư mục.

### Đọc file

```javascript
const fs = require('fs');

// ❌ Synchronous — BLOCK thread (chỉ dùng khi app khởi động)
const data = fs.readFileSync('file.txt', 'utf-8');

// ✅ Asynchronous — callback
fs.readFile('file.txt', 'utf-8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// ✅ Promise-based (khuyến nghị)
const { readFile, writeFile } = require('fs/promises');

async function main() {
  const data = await readFile('file.txt', 'utf-8');
  console.log(data);
}
main();
```

### Ghi file

```javascript
const { writeFile, appendFile } = require('fs/promises');

// Ghi đè toàn bộ
await writeFile('output.txt', 'Hello Node.js', 'utf-8');

// Ghi thêm (append)
await appendFile('log.txt', 'New line\n', 'utf-8');
```

### Thao tác file & thư mục

```javascript
const fs = require('fs/promises');

// Kiểm tra tồn tại
try {
  await fs.access('file.txt');
  console.log('File tồn tại');
} catch {
  console.log('File không tồn tại');
}

// Tạo thư mục (recursive)
await fs.mkdir('a/b/c', { recursive: true });

// Danh sách file trong thư mục
const files = await fs.readdir('.', { withFileTypes: true });
files.forEach(f => {
  console.log(f.name, f.isDirectory() ? '(dir)' : '(file)');
});

// Thông tin file
const stat = await fs.stat('file.txt');
console.log(stat.size, stat.mtime);

// Xóa file
await fs.unlink('temp.txt');

// Xóa thư mục
await fs.rm('folder', { recursive: true, force: true });

// Copy file
await fs.copyFile('src.txt', 'dest.txt');

// Rename / Move
await fs.rename('old.txt', 'new.txt');
```

### Watch file changes

```javascript
const { watch } = require('fs');

watch('.', { recursive: true }, (eventType, filename) => {
  console.log(`${eventType}: ${filename}`);
});
```

---

## path

Xử lý đường dẫn file — **cross-platform** (Windows dùng `\`, Unix dùng `/`).

```javascript
const path = require('path');

// Ghép path (an toàn)
path.join('/users', 'john', 'docs', 'file.txt');
// → '/users/john/docs/file.txt'

// Resolve (absolute path)
path.resolve('src', 'index.js');
// → '/home/user/project/src/index.js'

// Lấy từng phần
path.basename('/a/b/file.txt');      // 'file.txt'
path.basename('/a/b/file.txt', '.txt'); // 'file'
path.dirname('/a/b/file.txt');       // '/a/b'
path.extname('/a/b/file.txt');       // '.txt'

// Parse & Format
const parsed = path.parse('/a/b/file.txt');
// { root: '/', dir: '/a/b', base: 'file.txt', ext: '.txt', name: 'file' }
path.format(parsed); // '/a/b/file.txt'

// Normalize (dọn dẹp path)
path.normalize('/a/b/../c/./d'); // '/a/c/d'

// Relative path
path.relative('/a/b/c', '/a/d/e'); // '../../d/e'

// Separator & Delimiter
path.sep;       // '/' (Unix) hoặc '\\' (Windows)
path.delimiter; // ':' (Unix) hoặc ';' (Windows — PATH)
```

---

## http / https

Tạo HTTP server / gửi HTTP request.

### Tạo HTTP Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // req: IncomingMessage (method, url, headers)
  // res: ServerResponse
  
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello' }));
  } else if (req.url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ received: data }));
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Gửi HTTP Request (client)

```javascript
const https = require('https');

// GET request
https.get('https://jsonplaceholder.typicode.com/todos/1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
});

// Hoặc dùng fetch (Node.js 18+)
const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
const json = await response.json();
```

---

## os

Thông tin hệ điều hành.

```javascript
const os = require('os');

console.log(os.platform());    // 'linux', 'darwin', 'win32'
console.log(os.arch());        // 'x64', 'arm64'
console.log(os.cpus().length); // số CPU cores
console.log(os.totalmem());    // RAM tổng (bytes)
console.log(os.freemem());     // RAM trống
console.log(os.homedir());     // '/home/user'
console.log(os.tmpdir());      // '/tmp'
console.log(os.hostname());    // tên máy
console.log(os.uptime());      // thời gian chạy (giây)
console.log(os.networkInterfaces()); // thông tin mạng
console.log(os.EOL);           // '\n' (Unix) hoặc '\r\n' (Windows)
```

---

## events — EventEmitter

Mô hình **Pub/Sub** (Publisher–Subscriber) cốt lõi của Node.js. Nhiều module built-in (http, stream, fs) đều kế thừa EventEmitter.

```javascript
const EventEmitter = require('events');

// Tạo emitter
const emitter = new EventEmitter();

// Đăng ký listener
emitter.on('order', (data) => {
  console.log('Đơn hàng mới:', data);
});

// Listener chạy 1 lần
emitter.once('startup', () => {
  console.log('App đã khởi động');
});

// Phát event
emitter.emit('startup');
emitter.emit('order', { id: 1, total: 100 });
emitter.emit('order', { id: 2, total: 200 });

// Hủy listener
const handler = () => {};
emitter.on('test', handler);
emitter.off('test', handler); // hoặc removeListener

// Số listener tối đa (mặc định 10, cảnh báo memory leak)
emitter.setMaxListeners(20);
```

### Kế thừa EventEmitter

```javascript
class OrderService extends EventEmitter {
  createOrder(order) {
    // ... xử lý tạo đơn hàng ...
    this.emit('order:created', order);
  }
}

const service = new OrderService();
service.on('order:created', (order) => {
  console.log('Gửi email xác nhận:', order.id);
});
service.on('order:created', (order) => {
  console.log('Ghi log:', order.id);
});
service.createOrder({ id: 1 });
```

---

## url & querystring

```javascript
const { URL, URLSearchParams } = require('url');

// Parse URL (WHATWG API — khuyến nghị)
const url = new URL('https://example.com:8080/api/users?page=1&limit=10#section');
console.log(url.protocol);  // 'https:'
console.log(url.hostname);  // 'example.com'
console.log(url.port);      // '8080'
console.log(url.pathname);  // '/api/users'
console.log(url.search);    // '?page=1&limit=10'
console.log(url.hash);      // '#section'

// Query params
const params = url.searchParams;
console.log(params.get('page'));    // '1'
console.log(params.has('limit'));   // true
params.set('page', '2');
params.append('sort', 'name');
console.log(params.toString()); // 'page=2&limit=10&sort=name'

// Build URL
const newUrl = new URL('/api/products', 'https://example.com');
newUrl.searchParams.set('category', 'books');
console.log(newUrl.href); // 'https://example.com/api/products?category=books'
```

---

## crypto

Mã hóa, hash, random — dùng cho password, token, checksum.

```javascript
const crypto = require('crypto');

// ---- Hash ----
const hash = crypto.createHash('sha256')
  .update('password123')
  .digest('hex');
console.log(hash); // '...' (64 chars)

// ---- HMAC ----
const hmac = crypto.createHmac('sha256', 'secret-key')
  .update('data')
  .digest('hex');

// ---- Random bytes ----
const token = crypto.randomBytes(32).toString('hex'); // token 64 chars

// ---- UUID (Node.js 19+) ----
const uuid = crypto.randomUUID();

// ---- AES Encrypt/Decrypt ----
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

const enc = encrypt('Hello');
console.log(decrypt(enc)); // 'Hello'

// ---- Scrypt (hash password — an toàn) ----
const { scryptSync, timingSafeEqual } = crypto;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashBuf = Buffer.from(hash, 'hex');
  const newHash = scryptSync(password, salt, 64);
  return timingSafeEqual(hashBuf, newHash);
}
```

---

## child_process

Chạy process con — gọi lệnh hệ thống, script bên ngoài.

```javascript
const { exec, execFile, spawn, fork } = require('child_process');

// ---- exec: chạy lệnh shell (buffer toàn bộ output) ----
exec('ls -la', (err, stdout, stderr) => {
  console.log(stdout);
});

// Promise version
const { promisify } = require('util');
const execP = promisify(exec);
const { stdout } = await execP('git status');

// ---- spawn: stream output (file lớn, realtime) ----
const child = spawn('find', ['.', '-name', '*.js']);
child.stdout.on('data', data => process.stdout.write(data));
child.on('close', code => console.log('Exit:', code));

// ---- fork: chạy file Node.js riêng (IPC channel) ----
// parent.js
const worker = fork('./worker.js');
worker.send({ task: 'compute', n: 1000000 });
worker.on('message', result => console.log('Result:', result));

// worker.js
process.on('message', (msg) => {
  // CPU-intensive task
  const result = heavyComputation(msg.n);
  process.send(result);
});

// ---- execFile: chạy executable (không qua shell, an toàn hơn) ----
execFile('node', ['--version'], (err, stdout) => {
  console.log(stdout); // v20.x.x
});
```

---

## util

Utilities hữu ích.

```javascript
const util = require('util');

// Promisify callback-based functions
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const data = await readFile('file.txt', 'utf-8');

// Format strings
util.format('Hello %s, you are %d', 'An', 25);
// 'Hello An, you are 25'

// Inspect objects (chi tiết hơn JSON.stringify)
const obj = { a: { b: { c: { d: 1 } } } };
console.log(util.inspect(obj, { depth: null, colors: true }));

// Type checking
util.types.isDate(new Date());     // true
util.types.isPromise(Promise.resolve()); // true
util.types.isRegExp(/abc/);        // true
```

---

## Câu hỏi phỏng vấn

**Q: Sự khác nhau giữa `fs.readFile` và `fs.createReadStream`?**

> `readFile` đọc toàn bộ file vào memory (buffer) → tốn RAM với file lớn. `createReadStream` đọc file theo từng chunk (stream) → tiết kiệm RAM, phù hợp file lớn.

**Q: EventEmitter có phải pattern nào?**

> Observer pattern (Pub/Sub). Emitter là subject, listeners là observers. Nhiều core module kế thừa: http.Server, Stream, net.Socket.

**Q: Khi nào dùng `exec` vs `spawn`?**

> `exec` buffer toàn bộ output → phù hợp lệnh nhỏ (ls, git status). `spawn` stream output → phù hợp output lớn, realtime (log, find). `exec` chạy qua shell → có thể dùng pipe (`|`), `spawn` mặc định không qua shell → an toàn hơn.

**Q: Cách hash password an toàn trong Node.js?**

> Dùng `bcrypt` (thư viện) hoặc `crypto.scrypt` (built-in). Luôn dùng salt. **Không bao giờ** dùng MD5/SHA trực tiếp cho password (quá nhanh, dễ brute-force).

---

**Tiếp theo**: [03 - NPM & Package Management](./03-NPM-Package-Management.md)
