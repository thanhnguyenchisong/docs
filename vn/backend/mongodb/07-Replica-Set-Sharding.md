# Replica Set & Sharding - Câu hỏi phỏng vấn MongoDB

## Mục lục
1. [Replica Set](#replica-set)
2. [Read Preference](#read-preference)
3. [Sharding](#sharding)
4. [Shard key](#shard-key)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Replica Set

- **Replica set** = 1 **primary** + N **secondary**. Chỉ primary nhận write; data replicate sang secondary (asynchronous).
- **Election**: Khi primary down, secondary bầu primary mới (quorum).
- **Use case**: High availability, read scaling (đọc từ secondary).

### Thành phần

- **Primary**: Nhận mọi write; replicate oplog sang secondary.
- **Secondary**: Replicate từ primary; có thể phục vụ read (tùy read preference).
- **Arbiter** (tùy chọn): Tham gia bầu, không lưu data; dùng khi muốn quorum với ít node.

---

## Read Preference

- **primary** (mặc định): Chỉ đọc từ primary — luôn data mới nhất.
- **primaryPreferred**: Đọc primary, fallback secondary nếu primary không có.
- **secondary**: Chỉ đọc từ secondary — giảm tải primary; có thể lag.
- **secondaryPreferred**: Ưu tiên secondary, fallback primary.
- **nearest**: Đọc từ node có latency thấp nhất (primary hoặc secondary).

→ Dùng **secondary** hoặc **secondaryPreferred** khi chấp nhận read stale để scale đọc.

---

## Sharding

- **Sharding** = chia data theo **shard key** lên nhiều **shard** (mỗi shard có thể là replica set).
- **mongos**: Router; client kết nối mongos; mongos route query/command tới shard đúng.
- **Config servers**: Lưu metadata (chunk distribution, shard key, ...).

### Luồng ghi/đọc

- Client → **mongos** → xác định shard theo shard key → gửi tới shard đó.
- Query có shard key → mongos gửi đúng 1 shard (targeted). Query không có shard key → scatter-gather (nhiều shard) — chậm hơn.

---

## Shard key

- **Shard key** quyết định document thuộc shard nào; không đổi được sau khi insert.
- **Chunk**: Range của shard key; MongoDB chia collection thành chunk và phân bổ chunk lên các shard (balance).
- **Chọn shard key**:
  - **High cardinality**: Giá trị đủ nhiều để phân tán đều.
  - **Low frequency thay đổi**: Tránh thay đổi shard key (jumbo chunk, di chuyển nhiều).
  - **Query pattern**: Nên có shard key trong query để targeted (tránh scatter-gather).
- **Hashed shard key**: Hash(shard key) → phân tán đều; không hỗ trợ range query hiệu quả trên shard key.
- **Range shard key**: Range query trên shard key có thể chỉ đụng một vài shard; risk hot chunk nếu key tăng đều (e.g. timestamp).

---

## Câu hỏi thường gặp

### Replica set tối thiểu bao nhiêu node?

- Thường **3** (1 primary + 2 secondary) để có quorum khi 1 node down. Có thể 1 primary + 1 secondary + 1 arbiter.

### Shard key có đổi được không?

- **Không**. Shard key không thể thay đổi sau khi document đã insert. Chọn shard key cẩn thận lúc thiết kế.

### Jumbo chunk là gì?

- Chunk **không thể di chuyển** (thường vì quá lớn hoặc có document không thể split). Ảnh hưởng balance; nên tránh shard key có ít giá trị unique (ví dụ boolean).

---

**Kết thúc MongoDB.** Quay lại [README](./README.md).
