# PostgreSQL Zero to Master - Interview Guide

Tài liệu này được thiết kế để một người bắt đầu từ con số 0 có thể đi đến mức "master PostgreSQL" theo góc nhìn phỏng vấn và triển khai thực tế.

## 1) Tại sao cần dùng PostgreSQL?

### PostgreSQL giải quyết bài toán gì?
- Lưu trữ dữ liệu có cấu trúc với tính toàn vẹn cao (quan hệ, ràng buộc, transaction).
- Xử lý đồng thời nhiều người dùng mà vẫn nhất quán dữ liệu.
- Cung cấp hệ sinh thái mạnh cho báo cáo, analytics nhẹ, full-text search, JSON, geospatial.

### Vì sao PostgreSQL được ưa chuộng trong công ty sản phẩm?
- **Chuẩn SQL mạnh**: hỗ trợ tốt nhiều tính năng SQL nâng cao.
- **ACID + MVCC chuẩn chỉnh**: an toàn dữ liệu trong môi trường nhiều transaction.
- **Extensible**: extensions rất mạnh (`pg_stat_statements`, `postgis`, `pgcrypto`, ...).
- **Hybrid relational + document**: vừa bảng quan hệ, vừa JSONB hiệu quả.
- **Mature và ổn định**: cộng đồng lớn, tài liệu chính thức cực tốt.
- **Chi phí**: open-source, tránh lock-in license đắt.

### PostgreSQL vs MySQL (trả lời phỏng vấn ngắn)
- PostgreSQL mạnh hơn ở SQL nâng cao, concurrency model (MVCC sâu), extensibility, JSONB.
- MySQL phổ biến, dễ bắt đầu, tốt cho nhiều workload OLTP phổ thông.
- Chọn theo use case: nếu cần truy vấn phức tạp, integrity cao, mở rộng tính năng DB -> PostgreSQL thường là lựa chọn tốt.

---

## 2) Nền tảng bắt buộc phải hiểu

### 2.1 Database, schema, table, index
- **Database**: không gian logic lớn nhất.
- **Schema**: namespace trong database (thường `public`).
- **Table**: lưu dữ liệu theo dòng/cột.
- **Index**: cấu trúc giúp giảm chi phí tìm kiếm.

### 2.2 ACID
- **Atomicity**: transaction hoặc thành công toàn bộ, hoặc rollback.
- **Consistency**: luôn bảo toàn ràng buộc dữ liệu.
- **Isolation**: transaction không "dẫm chân" nhau theo mức cô lập.
- **Durability**: commit xong phải bền vững (WAL/fsync).

Cách database biết dữ liệu đã commit hay chưa
 - Mỗi transaction khi thực hiện thay đổi sẽ ghi log và giữ dữ liệu tạm thời trong buffer/memory.
 - Database engine có cơ chế transaction ID (XID) và visibility rules:
 - Mỗi row trong PostgreSQL, chẳng hạn, có thông tin về transaction nào đã tạo/đã xóa nó.
 - Khi một transaction khác đọc dữ liệu, engine sẽ kiểm tra xem transaction đó đã commit hay chưa. Nếu chưa commit, dữ liệu bị coi là “uncommitted” và sẽ không được hiển thị ở mức cô lập cao hơn.
 - Khi transaction commit, hệ thống ghi thông tin vào Write-Ahead Log (WAL) và đánh dấu transaction là “committed”. Từ đó, các transaction khác có thể thấy dữ liệu này tùy theo isolation level.

Tóm tắt các mức độ cô lập for  **Isolation**
 - Read Uncommitted: có thể thấy dữ liệu chưa commit (dirty read).
 - Read Committed: chỉ thấy dữ liệu đã commit tại thời điểm đọc.
 - Repeatable Read: đảm bảo cùng một truy vấn trong transaction sẽ luôn thấy cùng kết quả, tránh non-repeatable read.
 - Serializable: mô phỏng như các transaction chạy tuần tự, loại bỏ cả phantom read.

👉 Nói cách khác, database engine quản lý “ai được thấy cái gì” bằng cách kiểm tra trạng thái commit của transaction và áp dụng quy tắc tương ứng với isolation level.

### 2.3 MVCC (trái tim PostgreSQL)
- Mỗi `UPDATE/DELETE` tạo version tuple mới/cũ, không ghi đè trực tiếp.
- Reader thấy snapshot phù hợp transaction của mình.
- Writer không chặn reader theo cách lock đọc truyền thống.
- Đổi lại: phát sinh dead tuples -> cần `VACUUM`.

### 2.4 WAL (Write-Ahead Logging)
- Trước khi ghi data file, thay đổi được ghi vào WAL.
- WAL giúp:
  - Crash recovery.
  - Replication.
  - Point-in-time recovery (PITR).

---

## 3) SQL cốt lõi cho phỏng vấn

### 3.1 DDL/DML căn bản
- DDL: `CREATE`, `ALTER`, `DROP`.
- DML: `INSERT`, `UPDATE`, `DELETE`, `SELECT`.
- TCL: `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`.

### 3.2 JOIN, GROUP BY, HAVING
- Nắm rõ `INNER/LEFT/RIGHT/FULL JOIN`.
- Đọc execution logic: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT.

### 3.3 Subquery, CTE, Window Functions
- **CTE** dùng để tách query phức tạp cho dễ đọc.
- **Window** (`row_number`, `rank`, `lag`, `lead`, running total) là chủ đề phỏng vấn cực hay.

### 3.4 Transaction isolation levels
- `READ COMMITTED` (mặc định trong PostgreSQL).
- `REPEATABLE READ`.
- `SERIALIZABLE`.
- Hiểu các anomaly: dirty read, non-repeatable read, phantom read.

---

## 4) Data modeling (thiết kế dữ liệu đúng từ đầu)

### 4.1 Chuẩn hóa và phi chuẩn hóa
- Chuẩn hóa để giảm trùng lặp, tăng integrity.
- Phi chuẩn hóa có kiểm soát để tối ưu đọc.

### 4.2 Keys và constraints
- `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`.
- Có thể dùng `DEFERRABLE` cho một số workflow transaction phức tạp.

### 4.3 Chọn data type đúng
- Số tiền: `numeric`.
- Timestamp: ưu tiên `timestamptz` khi hệ thống đa múi giờ.
- ID phân tán: `uuid` (cân nhắc index size).
- Semi-structured: `jsonb` + index phù hợp.

### 4.4 Soft delete, audit, multi-tenant
- Soft delete: cột `deleted_at`.
- Audit: trigger/log table hoặc CDC.
- Multi-tenant: shared table + `tenant_id` + RLS khi cần phân tách mạnh.

---

## 5) Indexing và tối ưu truy vấn

### 5.1 Loại index cần nhớ
- **B-Tree**: mặc định, hầu hết điều kiện so sánh/sắp xếp.
- **GIN**: tốt cho `jsonb`, array, full-text.
- **GiST/SP-GiST/BRIN**: dùng cho bài toán chuyên biệt.
- **Hash**: ít phổ biến hơn B-Tree.

### 5.2 Kỹ thuật index thực chiến
- Composite index: quan tâm thứ tự cột.
- Partial index: chỉ index tập con dữ liệu hay truy vấn.
- Expression index: index theo biểu thức, ví dụ `lower(email)`.
- Tránh index thừa (write chậm, tốn RAM/disk).

### 5.3 Đọc `EXPLAIN (ANALYZE, BUFFERS)`
- Biết đọc:
  - Seq Scan vs Index Scan vs Bitmap Heap Scan.
  - Nested Loop vs Hash Join vs Merge Join.
  - Estimated rows vs actual rows (cardinality misestimate).
- Đây là kỹ năng phân biệt junior/senior trong phỏng vấn.

### 5.4 Thống kê và planner
- `ANALYZE` cập nhật statistics.
- `autovacuum` vừa dọn dead tuples vừa hỗ trợ thống kê.
- Query chậm nhiều khi do stats cũ/chệch.

---

## 6) Internals quan trọng (mức senior)

### 6.1 Storage layout cơ bản
- Page/block (mặc định 8KB), tuple header, visibility info (`xmin`, `xmax`).
- TOAST cho dữ liệu lớn (TEXT/JSONB lớn).

### 6.2 VACUUM, autovacuum, bloat
- Dead tuples không được dọn sẽ gây bloat.
- Bloat làm query chậm và tốn IO.
- Cần tuning autovacuum theo workload write nặng.

### 6.3 HOT update
- Khi update không đụng cột indexed, PostgreSQL có thể tối ưu bằng HOT chain.
- Giảm overhead index update.

### 6.4 Checkpoint và background writer
- Checkpoint quá dày gây IO spike.
- Cần cân bằng durability, recovery time, IO ổn định.

---

## 7) Concurrency và locking

### 7.1 Lock types
- Row-level lock (`FOR UPDATE`, `FOR SHARE`).
- Table-level lock (DDL/maintenance).
- Advisory lock (app-defined locking).

### 7.2 Deadlock
- PostgreSQL tự phát hiện deadlock và kill 1 transaction.
- Cách tránh:
  - Thống nhất thứ tự truy cập tài nguyên.
  - Giữ transaction ngắn.
  - Tránh "interactive transaction" kéo dài.

### 7.3 Idempotency và retry
- Trong distributed system, cần cơ chế retry + idempotency key.
- Khi gặp serialization failure/deadlock -> retry theo backoff.

---

## 8) JSONB, Full-text search, extensions

### 8.1 JSONB
- Dùng khi schema linh hoạt, metadata thay đổi nhanh.
- Nên kết hợp cột quan trọng dạng relational để query hiệu quả.
- Index GIN cho truy vấn containment/path phổ biến.

### 8.2 Full-text search
- `to_tsvector`, `to_tsquery`, `ts_rank`.
- Có thể thay thế Elasticsearch cho use case vừa/nhỏ.

### 8.3 Extensions nên biết
- `pg_stat_statements`: theo dõi query tốn tài nguyên.
- `pgcrypto`: crypto/hash.
- `uuid-ossp` hoặc `pgcrypto` cho UUID.
- `postgis`: geospatial.

---

## 9) High Availability, Replication, Backup

### 9.1 Replication
- **Streaming replication (physical)**: standby gần như bản sao vật lý.
- **Logical replication**: replicate theo table/publication/subscription.
- Read replica để scale read và giảm tải primary.

### 9.2 Failover
- Mô hình primary-standby.
- Cần orchestration (Patroni/repmgr/cloud managed service).
- Biết khái niệm RPO/RTO khi thiết kế DR.

### 9.3 Backup strategy
- Logical backup: `pg_dump` (linh hoạt, chậm hơn với DB lớn).
- Physical/base backup + WAL archiving: phục vụ PITR.
- Luôn test restore định kỳ, không chỉ test backup.

---

## 10) Security trong PostgreSQL

### 10.1 Authentication và authorization
- `pg_hba.conf`, password auth, cert auth.
- Role-based access control theo nguyên tắc least privilege.

### 10.2 Bảo mật dữ liệu
- TLS in-transit.
- Encryption at rest (disk/cloud level hoặc app level).
- Masking/column-level protection cho PII.

### 10.3 SQL injection và hardening
- Luôn dùng prepared statements.
- Giới hạn quyền account ứng dụng.
- Tách role migration và role runtime.

---

## 11) Vận hành và quan sát hệ thống

### 11.1 Monitoring bắt buộc
- Connections, TPS, latency, locks, deadlocks.
- Checkpoint timing, WAL generation rate.
- Table/index bloat, autovacuum lag.

### 11.2 View hệ thống cần thuộc
- `pg_stat_activity`
- `pg_locks`
- `pg_stat_user_tables`
- `pg_stat_statements` (qua extension)

### 11.3 Connection pooling
- `PgBouncer` thường dùng để giảm overhead kết nối.
- Cần hiểu session pooling vs transaction pooling.

---

## 12) Các lỗi thiết kế phổ biến (và cách trả lời phỏng vấn)

1. **Thiếu index cho FK và điều kiện truy vấn chính**  
   -> Chậm khi join/filter, lock kéo dài.

2. **Lạm dụng index**  
   -> Ghi chậm, bloat tăng, tốn bộ nhớ.

3. **Transaction quá dài**  
   -> Giữ snapshot cũ, cản trở vacuum.

4. **Dùng JSONB thay toàn bộ relational model**  
   -> Khó tối ưu truy vấn và integrity.

5. **Không có chiến lược backup/restore đã kiểm chứng**  
   -> Backup "đẹp" nhưng restore fail khi có sự cố thật.

---

## 13) Lộ trình học Zero -> Master (12 tuần)

### Tuần 1-2: Foundation
- Cài đặt, psql, SQL căn bản, schema/table/constraints.
- Bài tập CRUD + join + transaction cơ bản.

### Tuần 3-4: Modeling + Query
- Data modeling, normalization, anti-pattern.
- CTE, window functions, subquery nâng cao.

### Tuần 5-6: Index + Performance
- B-Tree/GIN/GiST, composite/partial/expression index.
- Đọc `EXPLAIN ANALYZE` mỗi ngày với query thật.

### Tuần 7-8: Internals + Concurrency
- MVCC, vacuum/autovacuum, lock/deadlock.
- Lab xử lý deadlock, isolation anomaly.

### Tuần 9-10: HA + Backup + Security
- Replication, failover, PITR.
- Roles, RLS, TLS, hardening.

### Tuần 11-12: Production mindset
- Monitoring dashboard, alerting, runbook sự cố.
- Mock interview + giải thích kiến trúc end-to-end.

---

## 14) Bộ câu hỏi phỏng vấn trọng điểm (kèm ý trả lời)

### Câu 1: Tại sao hệ thống của bạn chọn PostgreSQL?
- Vì cần integrity mạnh, query phức tạp, transaction an toàn.
- Hệ sinh thái extension phù hợp use case.
- Tối ưu tổng chi phí và khả năng vận hành lâu dài.

### Câu 2: MVCC hoạt động thế nào và ảnh hưởng gì?
- Mỗi update tạo row version mới, reader đọc snapshot.
- Ít block đọc/ghi, nhưng sinh dead tuples.
- Cần autovacuum tốt để tránh bloat.

### Câu 3: Khi nào query không dùng index?
- Cardinality thấp, planner thấy seq scan rẻ hơn.
- Hàm trên cột làm mất khả năng dùng index (nếu không có expression index).
- Stats cũ khiến planner ước lượng sai.

### Câu 4: Bạn xử lý query chậm như thế nào?
- Lấy query từ `pg_stat_statements`/log.
- Chạy `EXPLAIN (ANALYZE, BUFFERS)`.
- Kiểm tra plan, rows estimate, IO, index fit.
- Chỉnh query/index/schema; đo lại bằng benchmark.

### Câu 5: Phân biệt physical và logical replication?
- Physical: sao chép mức WAL/block, phù hợp HA.
- Logical: sao chép mức dữ liệu logic, linh hoạt cho migration/tích hợp.

### Câu 6: Backup tốt là backup như thế nào?
- Có đầy đủ full + WAL (hoặc chiến lược phù hợp RPO/RTO).
- Tự động hóa, mã hóa, lưu đa vùng.
- Quan trọng nhất: restore drill định kỳ thành công.

---

## 15) Checklist "đạt mức master"

- Giải thích rõ ACID, MVCC, WAL, VACUUM bằng ví dụ thực tế.
- Đọc và tối ưu query bằng `EXPLAIN ANALYZE` thành thạo.
- Thiết kế index đúng cho workload read/write cụ thể.
- Thiết kế backup/restore + replication theo RPO/RTO.
- Xử lý được lock contention/deadlock trong production.
- Thiết lập monitoring và incident response cơ bản.
- Trả lời được trade-off kỹ thuật thay vì chỉ định nghĩa.

---

## 16) Cách sử dụng bộ tài liệu hiện có trong thư mục này

Để học hiệu quả, đi theo thứ tự:
1. `01-PostgreSQL-Fundamentals.md`
2. `02-Data-Types-and-Features.md`
3. `03-Advanced-Features.md`
4. `04-Performance-Tuning.md`
5. `05-Administration.md`
6. `06-Backup-and-Recovery.md`
7. `07-Security.md`

Sau mỗi phần:
- Tự viết 5 câu hỏi phỏng vấn + tự trả lời.
- Viết ít nhất 3 truy vấn tối ưu bằng `EXPLAIN ANALYZE`.
- Ghi lại "trade-off" cho mọi quyết định thiết kế.

Nếu bạn làm được đều đặn, bạn sẽ đi từ "biết SQL" sang "tư duy vận hành PostgreSQL ở production".
