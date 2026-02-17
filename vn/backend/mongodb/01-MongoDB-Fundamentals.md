# MongoDB Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [MongoDB là gì?](#mongodb-là-gì)
2. [NoSQL và Document Database](#nosql-và-document-database)
3. [MongoDB vs SQL (RDBMS)](#mongodb-vs-sql-rdbms)
4. [Kiến trúc cơ bản](#kiến-trúc-cơ-bản)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## MongoDB là gì?

**MongoDB** là **document-oriented NoSQL database**. Data lưu dạng **BSON** (Binary JSON): document linh hoạt, schema có thể thay đổi, scale ngang (sharding).

### Đặc điểm chính

- **Document model**: Mỗi record là một document (JSON-like), có thể lồng (embedded) hoặc tham chiếu (reference).
- **Schema flexible**: Không bắt buộc schema cố định; có thể thêm/xóa field theo document.
- **Horizontal scaling**: Sharding theo shard key; replica set cho HA.
- **Rich query**: find, filter, aggregation pipeline, index.
- **Driver**: Hỗ trợ nhiều ngôn ngữ (Java, Node, Python, ...).

---

## NoSQL và Document Database

### NoSQL

- **Not Only SQL**: Các DB không dùng mô hình quan hệ (table/row) cố định.
- Loại: **Document** (MongoDB), **Key-Value** (Redis), **Column-family** (Cassandra), **Graph** (Neo4j).

### Document Database

- Data = **document** (thường JSON/BSON). Một collection chứa nhiều document; document có thể có cấu trúc khác nhau (schema flexible).
- **Use case**: Catalog, content, profile, log, data có cấu trúc thay đổi hoặc lồng nhau.

---

## MongoDB vs SQL (RDBMS)

| Tiêu chí | MongoDB | SQL (MySQL, PostgreSQL) |
|----------|---------|---------------------------|
| **Mô hình** | Document (collection/document) | Table/row, schema cố định |
| **Schema** | Flexible, có thể khác document | Cố định, ALTER để đổi |
| **Query** | find(), aggregation | SQL (SELECT, JOIN) |
| **Transaction** | Hỗ trợ multi-document (4.0+) | ACID từ lâu |
| **Join** | $lookup (aggregation) hoặc embed | JOIN tự nhiên |
| **Scale** | Sharding (horizontal) | Thường vertical + read replica |
| **Use case** | Catalog, content, log, flexible schema | Transaction, report, quan hệ phức tạp |

→ **MongoDB** phù hợp khi schema linh hoạt, dữ liệu lồng nhau, cần scale ngang. **SQL** khi cần ACID mạnh, quan hệ nhiều bảng, report phức tạp.

---

## Kiến trúc cơ bản

- **Database** → chứa **collections**.
- **Collection** → chứa **documents** (BSON).
- **Document** → field/value; value có thể nested document hoặc array.
- **Server**: mongod (single node); **Replica Set** (1 primary + N secondary); **Sharded Cluster** (config servers + shards + mongos).

```
Database: mydb
  └── Collection: users
        └── Document: { _id: 1, name: "Alice", roles: ["admin"] }
  └── Collection: orders
        └── Document: { _id: 1, userId: 1, items: [...] }
```

---

## Câu hỏi thường gặp

### MongoDB có ACID không?

- **Single-document**: Luôn atomic.
- **Multi-document transaction**: Hỗ trợ từ 4.0 (replica set), 4.2 (sharded); dùng session + startTransaction/commitTransaction.

### _id là gì?

- Mỗi document có field **\_id** (unique trong collection). Nếu không gửi, MongoDB tự sinh ObjectId (12-byte). Có thể dùng _id làm primary key.

### Port mặc định?

- **27017** (mongod).

---

**Tiếp theo:** [02-Document-Model-Schema-Design.md](./02-Document-Model-Schema-Design.md)
