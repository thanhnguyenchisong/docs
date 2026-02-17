# Streams & Buffers

## Mục lục
1. [Buffer](#buffer)
2. [Streams là gì?](#streams-là-gì)
3. [Readable Stream](#readable-stream)
4. [Writable Stream](#writable-stream)
5. [Transform Stream](#transform-stream)
6. [Piping & Pipeline](#piping--pipeline)
7. [Backpressure](#backpressure)
8. [Ứng dụng thực tế](#ứng-dụng-thực-tế)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Buffer

Buffer = vùng nhớ chứa dữ liệu binary (trước khi xử lý).

```javascript
// Tạo Buffer
const buf1 = Buffer.from('Hello');              // từ string
const buf2 = Buffer.from([72, 101, 108]);       // từ byte array
const buf3 = Buffer.alloc(10);                  // 10 bytes, fill 0
const buf4 = Buffer.allocUnsafe(10);            // 10 bytes, không fill (nhanh hơn)

// Đọc
console.log(buf1.toString('utf-8'));  // 'Hello'
console.log(buf1.toString('base64')); // 'SGVsbG8='
console.log(buf1.toString('hex'));    // '48656c6c6f'
console.log(buf1.length);            // 5 (bytes, KHÔNG phải chars)
console.log(buf1[0]);                // 72 (byte value của 'H')

// So sánh
Buffer.compare(buf1, buf2);   // 0 nếu bằng
buf1.equals(buf2);             // boolean

// Nối
const merged = Buffer.concat([buf1, buf2]);
```

---

## Streams là gì?

Stream = dữ liệu được xử lý **từng chunk**, không cần load toàn bộ vào memory.

```
❌ readFile: [=============== 2GB file ===============] → RAM → Process
✅ stream:   [chunk1][chunk2][chunk3]... → Process từng chunk → ít RAM
```

### 4 loại Stream

| Loại | Ví dụ | Mô tả |
|------|-------|-------|
| **Readable** | `fs.createReadStream`, `http request` | Đọc dữ liệu |
| **Writable** | `fs.createWriteStream`, `http response` | Ghi dữ liệu |
| **Duplex** | `net.Socket`, `WebSocket` | Đọc + Ghi |
| **Transform** | `zlib.createGzip`, `crypto.createCipher` | Đọc → biến đổi → Ghi |

---

## Readable Stream

```javascript
const fs = require('fs');

// Tạo readable stream
const readable = fs.createReadStream('large-file.txt', {
  encoding: 'utf-8',
  highWaterMark: 64 * 1024, // 64KB mỗi chunk (mặc định)
});

// Event-based (flowing mode)
readable.on('data', (chunk) => {
  console.log(`Chunk: ${chunk.length} bytes`);
});
readable.on('end', () => console.log('Done'));
readable.on('error', (err) => console.error(err));

// Paused mode (kéo dữ liệu)
readable.on('readable', () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {
    process.stdout.write(chunk);
  }
});

// Tự tạo Readable
const { Readable } = require('stream');

const myStream = new Readable({
  read(size) {
    this.push('Hello ');
    this.push('World');
    this.push(null); // kết thúc stream
  }
});
myStream.pipe(process.stdout);
```

---

## Writable Stream

```javascript
const writable = fs.createWriteStream('output.txt');

writable.write('Hello ');
writable.write('World\n');
writable.end('Goodbye'); // ghi cuối cùng + đóng

writable.on('finish', () => console.log('Write complete'));
writable.on('error', (err) => console.error(err));

// Tự tạo Writable
const { Writable } = require('stream');

const myWritable = new Writable({
  write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    callback(); // gọi khi xử lý xong
  }
});

myWritable.write('data1');
myWritable.write('data2');
myWritable.end();
```

---

## Transform Stream

```javascript
const { Transform } = require('stream');

// Uppercase transform
const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Sử dụng
process.stdin
  .pipe(uppercase)
  .pipe(process.stdout);

// Gzip compress
const zlib = require('zlib');
const gzip = zlib.createGzip();

fs.createReadStream('input.txt')
  .pipe(gzip)
  .pipe(fs.createWriteStream('input.txt.gz'));
```

---

## Piping & Pipeline

### pipe()

```javascript
// Đọc file → transform → ghi file
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));
```

### pipeline() — An toàn hơn (auto cleanup, error handling)

```javascript
const { pipeline } = require('stream/promises');

await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
console.log('Pipeline complete');
```

---

## Backpressure

Khi writable **chậm hơn** readable → data tích tụ → RAM tăng. **Backpressure** là cơ chế tự động pause readable.

```javascript
// pipe() tự động xử lý backpressure
readable.pipe(writable); // ✅ an toàn

// Manual handling
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();                    // dừng đọc
    writable.once('drain', () => {
      readable.resume();                 // tiếp tục khi writable sẵn sàng
    });
  }
});
```

---

## Ứng dụng thực tế

### Stream file upload

```javascript
const multer = require('multer');
// hoặc dùng stream trực tiếp:
app.post('/upload', (req, res) => {
  const writable = fs.createWriteStream(`./uploads/${Date.now()}.bin`);
  req.pipe(writable);
  writable.on('finish', () => res.json({ message: 'Uploaded' }));
});
```

### Stream HTTP response (file lớn)

```javascript
app.get('/download/:file', (req, res) => {
  const filePath = `./files/${req.params.file}`;
  const stat = fs.statSync(filePath);

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stat.size,
  });

  fs.createReadStream(filePath).pipe(res);
});
```

### Stream CSV processing

```javascript
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');

const csvToJson = new Transform({
  objectMode: true,
  transform(chunk, enc, cb) {
    const lines = chunk.toString().split('\n');
    lines.forEach(line => {
      const [name, age] = line.split(',');
      if (name) this.push(JSON.stringify({ name, age }) + '\n');
    });
    cb();
  }
});

await pipeline(
  fs.createReadStream('users.csv'),
  csvToJson,
  fs.createWriteStream('users.json')
);
```

---

## Câu hỏi phỏng vấn

**Q: Khi nào dùng Stream thay vì readFile?**

> File lớn (>100MB), response lớn, real-time data. Stream xử lý từng chunk → ít RAM. readFile load toàn bộ vào RAM → tốn bộ nhớ, chậm.

**Q: Backpressure là gì?**

> Khi producer nhanh hơn consumer → data tích tụ. Backpressure tự động pause producer khi consumer chưa xử lý kịp. `pipe()` tự xử lý, manual cần check `.write()` return value.

**Q: `pipe()` vs `pipeline()`?**

> `pipe()` không tự cleanup khi error → memory leak. `pipeline()` tự destroy streams khi error, trả Promise. **Luôn dùng pipeline()** trong production.

---

**Tiếp theo**: [12 - Performance & Optimization](./12-Performance-Optimization.md)
