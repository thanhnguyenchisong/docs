# PostgreSQL Mock Interview - 100 Câu Luyện Trực Tiếp

Tài liệu này giúp bạn luyện phỏng vấn PostgreSQL theo format hỏi - đáp nhanh.  
Mỗi câu gồm:
- **Câu hỏi**
- **Ý chính cần trả lời**
- **Đáp án mẫu ngắn**

---

## Cách dùng hiệu quả

1. Che phần "Đáp án mẫu", tự trả lời trong 60-90 giây/câu.
2. So sánh với "Ý chính cần trả lời".
3. Với câu chưa chắc, viết lại câu trả lời theo trải nghiệm thực tế của bạn.
4. Lặp lại theo vòng: Beginner -> Intermediate -> Advanced -> Production.

---

## A. Beginner (1-25)

### 1) PostgreSQL là gì?
- Ý chính cần trả lời: RDBMS mã nguồn mở, ACID, hỗ trợ SQL nâng cao.
- Đáp án mẫu ngắn: PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ mã nguồn mở, mạnh về tính nhất quán dữ liệu, SQL nâng cao và khả năng mở rộng bằng extension.

### 2) Vì sao chọn PostgreSQL thay vì MySQL trong một số dự án?
- Ý chính cần trả lời: SQL nâng cao, MVCC, extensibility, JSONB.
- Đáp án mẫu ngắn: PostgreSQL thường được chọn khi hệ thống cần query phức tạp, integrity cao, JSONB mạnh và nhiều extension chuyên sâu.

### 3) ACID là gì?
- Ý chính cần trả lời: Atomicity, Consistency, Isolation, Durability.
- Đáp án mẫu ngắn: ACID đảm bảo transaction an toàn: hoặc thành công toàn bộ, dữ liệu luôn hợp lệ, transaction cô lập và dữ liệu đã commit thì bền vững.

### 4) Database và schema khác nhau thế nào?
- Ý chính cần trả lời: Database là container lớn, schema là namespace bên trong.
- Đáp án mẫu ngắn: Database là không gian logic độc lập, còn schema là namespace trong database để tổ chức tables/views/functions.

### 5) `psql` dùng để làm gì?
- Ý chính cần trả lời: CLI tương tác PostgreSQL.
- Đáp án mẫu ngắn: `psql` là command-line client để kết nối, chạy SQL, quản trị và kiểm tra metadata trong PostgreSQL.

### 6) `\l`, `\dt`, `\d table_name` trong psql có ý nghĩa gì?
- Ý chính cần trả lời: list DB, list table, describe table.
- Đáp án mẫu ngắn: `\l` liệt kê database, `\dt` liệt kê table, `\d table_name` xem cấu trúc table.

### 7) Primary key là gì?
- Ý chính cần trả lời: định danh duy nhất, không null.
- Đáp án mẫu ngắn: Primary key là ràng buộc đảm bảo mỗi dòng được định danh duy nhất và không được NULL.

### 8) Foreign key là gì?
- Ý chính cần trả lời: toàn vẹn tham chiếu.
- Đáp án mẫu ngắn: Foreign key ràng buộc quan hệ giữa bảng con và bảng cha để tránh dữ liệu mồ côi.

### 9) `SERIAL` là gì? Có nên dùng không?
- Ý chính cần trả lời: shorthand sequence; hiện nay ưu tiên identity.
- Đáp án mẫu ngắn: `SERIAL` là cách tạo cột số tự tăng dựa trên sequence; với schema mới thường ưu tiên `GENERATED ... AS IDENTITY`.

### 10) `DELETE` khác gì `TRUNCATE`?
- Ý chính cần trả lời: delete theo row, truncate nhanh hơn và đặc thù lock/transaction behavior.
- Đáp án mẫu ngắn: `DELETE` xóa theo điều kiện từng dòng và linh hoạt hơn, còn `TRUNCATE` xóa nhanh toàn bảng, lock mạnh hơn và thường dùng cho dọn dữ liệu hàng loạt.

### 11) `VARCHAR` và `TEXT` khác nhau ra sao?
- Ý chính cần trả lời: gần như tương đương trong PostgreSQL, `VARCHAR(n)` có kiểm tra độ dài.
- Đáp án mẫu ngắn: Trong PostgreSQL, `TEXT` và `VARCHAR` gần tương đương về hiệu năng; `VARCHAR(n)` thêm ràng buộc độ dài.

### 12) Khi nào dùng `UUID`?
- Ý chính cần trả lời: ID phân tán, tránh đoán ID; trade-off index size.
- Đáp án mẫu ngắn: Dùng `UUID` khi cần ID toàn cục và an toàn hơn khi lộ endpoint, nhưng cần cân nhắc index lớn hơn số nguyên.

### 13) `timestamp` và `timestamptz` khác nhau thế nào?
- Ý chính cần trả lời: có/không xử lý timezone.
- Đáp án mẫu ngắn: `timestamp` không lưu/không chuẩn hóa múi giờ, còn `timestamptz` chuẩn hóa theo UTC và hiển thị theo timezone session.

### 14) Index là gì?
- Ý chính cần trả lời: tăng tốc đọc, đổi lại tốn chi phí ghi.
- Đáp án mẫu ngắn: Index là cấu trúc dữ liệu giúp truy vấn nhanh hơn, nhưng làm tăng chi phí insert/update/delete và tốn dung lượng.

### 15) B-Tree index phù hợp với truy vấn nào?
- Ý chính cần trả lời: equality, range, sort.
- Đáp án mẫu ngắn: B-Tree phù hợp nhất cho điều kiện bằng, khoảng giá trị và ORDER BY.

### 16) Tại sao query không dùng index dù đã tạo index?
- Ý chính cần trả lời: planner cost, cardinality thấp, function trên cột, stats cũ.
- Đáp án mẫu ngắn: Vì planner thấy seq scan rẻ hơn, hoặc query viết làm mất khả năng dùng index, hoặc thống kê chưa cập nhật.

### 17) `EXPLAIN` và `EXPLAIN ANALYZE` khác nhau gì?
- Ý chính cần trả lời: plan ước lượng vs chạy thật.
- Đáp án mẫu ngắn: `EXPLAIN` chỉ hiển thị kế hoạch dự kiến, còn `EXPLAIN ANALYZE` thực thi truy vấn và trả về số liệu thực tế.

### 18) `VACUUM` để làm gì?
- Ý chính cần trả lời: dọn dead tuples, hỗ trợ MVCC.
- Đáp án mẫu ngắn: `VACUUM` thu hồi không gian từ dead tuples và giúp hệ thống giữ hiệu năng ổn định.

### 19) `ANALYZE` để làm gì?
- Ý chính cần trả lời: cập nhật statistics cho planner.
- Đáp án mẫu ngắn: `ANALYZE` cập nhật thống kê dữ liệu để query planner chọn execution plan chính xác hơn.

### 20) Autovacuum là gì?
- Ý chính cần trả lời: cơ chế tự động vacuum/analyze.
- Đáp án mẫu ngắn: Autovacuum là tiến trình nền tự động dọn dead tuples và cập nhật statistics theo ngưỡng cấu hình.

### 21) `JOIN` và `LEFT JOIN` khác nhau gì?
- Ý chính cần trả lời: inner giữ bản ghi match; left giữ toàn bộ bảng trái.
- Đáp án mẫu ngắn: `JOIN` chỉ trả dòng khớp ở hai bảng, còn `LEFT JOIN` giữ toàn bộ dòng bên trái kể cả khi bên phải không khớp.

### 22) `GROUP BY` dùng để làm gì?
- Ý chính cần trả lời: gom nhóm để aggregate.
- Đáp án mẫu ngắn: `GROUP BY` gom các dòng theo khóa nhóm để áp dụng hàm tổng hợp như `COUNT`, `SUM`, `AVG`.

### 23) `HAVING` khác `WHERE` thế nào?
- Ý chính cần trả lời: WHERE trước group; HAVING sau group.
- Đáp án mẫu ngắn: `WHERE` lọc dòng trước khi nhóm, còn `HAVING` lọc kết quả sau khi đã `GROUP BY`.

### 24) Transaction là gì?
- Ý chính cần trả lời: đơn vị công việc gồm nhiều thao tác SQL.
- Đáp án mẫu ngắn: Transaction là nhóm thao tác SQL được đảm bảo tính toàn vẹn theo ACID, commit cùng nhau hoặc rollback.

### 25) `COMMIT` và `ROLLBACK` là gì?
- Ý chính cần trả lời: xác nhận hoặc hủy transaction.
- Đáp án mẫu ngắn: `COMMIT` ghi nhận vĩnh viễn thay đổi, `ROLLBACK` hủy mọi thay đổi chưa commit.

---

## B. Intermediate (26-55)

### 26) MVCC là gì?
- Ý chính cần trả lời: multi-version, snapshot, giảm block read/write.
- Đáp án mẫu ngắn: MVCC lưu nhiều phiên bản dòng để reader và writer hoạt động đồng thời, mỗi transaction đọc snapshot nhất quán.

### 27) Dead tuple hình thành như thế nào?
- Ý chính cần trả lời: update/delete tạo bản ghi cũ không còn visible.
- Đáp án mẫu ngắn: Khi update/delete, phiên bản cũ của row thành dead tuple và cần vacuum để dọn.

### 28) Isolation level mặc định của PostgreSQL là gì?
- Ý chính cần trả lời: READ COMMITTED.
- Đáp án mẫu ngắn: Mặc định PostgreSQL dùng `READ COMMITTED`, mỗi câu lệnh đọc snapshot tại thời điểm bắt đầu câu lệnh.

### 29) `REPEATABLE READ` đảm bảo gì?
- Ý chính cần trả lời: snapshot ổn định trong transaction.
- Đáp án mẫu ngắn: `REPEATABLE READ` đảm bảo các lần đọc trong cùng transaction thấy cùng một snapshot dữ liệu.

### 30) `SERIALIZABLE` khi nào nên dùng?
- Ý chính cần trả lời: nghiệp vụ cần chống anomaly tối đa; chấp nhận retry.
- Đáp án mẫu ngắn: Dùng `SERIALIZABLE` cho nghiệp vụ cực nhạy tính đúng đắn và sẵn sàng xử lý retry khi có serialization failure.

### 31) CTE dùng để làm gì?
- Ý chính cần trả lời: dễ đọc query phức tạp, tách logic.
- Đáp án mẫu ngắn: CTE (`WITH`) giúp tách query lớn thành các bước logic rõ ràng, dễ bảo trì và debug.

### 32) Recursive CTE dùng cho bài toán nào?
- Ý chính cần trả lời: dữ liệu cây/hierarchy/graph đơn giản.
- Đáp án mẫu ngắn: Recursive CTE phù hợp duyệt dữ liệu phân cấp như cây phòng ban, danh mục cha-con.

### 33) Window function khác gì GROUP BY?
- Ý chính cần trả lời: window không làm giảm số dòng.
- Đáp án mẫu ngắn: `GROUP BY` gom dòng thành ít dòng hơn, còn window function tính toán theo cửa sổ nhưng giữ nguyên số dòng kết quả.

### 34) `ROW_NUMBER`, `RANK`, `DENSE_RANK` khác nhau gì?
- Ý chính cần trả lời: cách xử lý tie.
- Đáp án mẫu ngắn: `ROW_NUMBER` luôn tăng liên tục, `RANK` bỏ số khi đồng hạng, `DENSE_RANK` không bỏ số.

### 35) Khi nào dùng `LAG`/`LEAD`?
- Ý chính cần trả lời: so sánh dòng trước/sau trong chuỗi thời gian.
- Đáp án mẫu ngắn: Dùng `LAG/LEAD` để tính chênh lệch giữa kỳ hiện tại và kỳ trước/sau mà không cần self-join phức tạp.

### 36) JSON và JSONB khác nhau gì?
- Ý chính cần trả lời: JSONB binary, index tốt, xử lý nhanh hơn đa số case.
- Đáp án mẫu ngắn: `JSONB` lưu ở dạng binary đã parse, hỗ trợ index hiệu quả nên thường ưu tiên hơn `JSON` cho truy vấn.

### 37) Khi nào không nên lạm dụng JSONB?
- Ý chính cần trả lời: cột quan trọng cần ràng buộc/query nặng nên relational.
- Đáp án mẫu ngắn: Không nên dùng JSONB cho các trường lõi cần join, filter nhiều hoặc cần constraint chặt; nên tách thành cột quan hệ.

### 38) GIN index phù hợp với trường hợp nào?
- Ý chính cần trả lời: JSONB, array, full-text.
- Đáp án mẫu ngắn: GIN phù hợp khi truy vấn containment/search trên JSONB, array và full-text search.

### 39) Partial index là gì?
- Ý chính cần trả lời: index trên tập con dữ liệu.
- Đáp án mẫu ngắn: Partial index chỉ index các dòng thỏa điều kiện `WHERE`, giúp giảm kích thước index và tăng hiệu quả cho query đặc thù.

### 40) Expression index là gì?
- Ý chính cần trả lời: index theo biểu thức/hàm.
- Đáp án mẫu ngắn: Expression index là index trên kết quả biểu thức, ví dụ `lower(email)` để tối ưu tìm kiếm không phân biệt hoa thường.

### 41) Vì sao phải index foreign key?
- Ý chính cần trả lời: tăng tốc join/check referential actions.
- Đáp án mẫu ngắn: Index foreign key giúp join nhanh và tránh chậm khi update/delete ở bảng cha do phải kiểm tra bảng con.

### 42) `pg_stat_statements` dùng làm gì?
- Ý chính cần trả lời: thống kê query tốn tài nguyên.
- Đáp án mẫu ngắn: Extension này gom và thống kê các truy vấn theo mẫu để tìm top query tốn thời gian hoặc gọi nhiều nhất.

### 43) Làm sao tìm query chậm?
- Ý chính cần trả lời: log + pg_stat_statements + explain analyze.
- Đáp án mẫu ngắn: Bật slow query log, dùng `pg_stat_statements` để ưu tiên query nóng, sau đó phân tích bằng `EXPLAIN (ANALYZE, BUFFERS)`.

### 44) `work_mem` ảnh hưởng gì?
- Ý chính cần trả lời: memory cho sort/hash mỗi node.
- Đáp án mẫu ngắn: `work_mem` là bộ nhớ cho sort/hash từng operation, đặt quá thấp gây spill disk, quá cao dễ OOM khi nhiều query đồng thời.

### 45) `shared_buffers` là gì?
- Ý chính cần trả lời: cache dữ liệu của PostgreSQL.
- Đáp án mẫu ngắn: `shared_buffers` là vùng nhớ cache page dữ liệu trong PostgreSQL trước khi đọc/ghi ra disk.

### 46) Khi nào dùng partitioning?
- Ý chính cần trả lời: bảng rất lớn, query theo key phân vùng, dễ archive/drop data cũ.
- Đáp án mẫu ngắn: Dùng partitioning khi bảng lớn và truy vấn thường lọc theo cột phân vùng như thời gian.

### 47) Partition pruning là gì?
- Ý chính cần trả lời: planner bỏ qua partition không liên quan.
- Đáp án mẫu ngắn: Partition pruning là cơ chế chỉ đọc các partition cần thiết dựa trên điều kiện truy vấn.

### 48) Trigger dùng khi nào?
- Ý chính cần trả lời: audit, enforce rule; dùng tiết chế.
- Đáp án mẫu ngắn: Trigger hữu ích cho audit hoặc rule nhất quán dữ liệu, nhưng nên hạn chế vì khó debug và dễ ẩn logic nghiệp vụ.

### 49) Function và Procedure khác gì?
- Ý chính cần trả lời: function trả về giá trị; procedure call và transaction control riêng (tùy context).
- Đáp án mẫu ngắn: Function thường dùng trong biểu thức SQL và trả về giá trị, procedure gọi bằng `CALL` cho luồng xử lý thủ tục hơn.

### 50) RLS là gì?
- Ý chính cần trả lời: lọc quyền theo dòng.
- Đáp án mẫu ngắn: Row-Level Security cho phép định nghĩa policy để mỗi role chỉ thấy/sửa các dòng được phép.

### 51) Vì sao nên dùng `scram-sha-256` thay `md5`?
- Ý chính cần trả lời: bảo mật mạnh hơn.
- Đáp án mẫu ngắn: `scram-sha-256` an toàn hơn `md5`, nên dùng làm chuẩn xác thực mật khẩu mới.

### 52) `pg_hba.conf` quản lý gì?
- Ý chính cần trả lời: luật cho phép kết nối và auth method.
- Đáp án mẫu ngắn: `pg_hba.conf` quy định client nào được kết nối vào database nào, bằng user nào và phương thức xác thực nào.

### 53) Connection pooling để làm gì?
- Ý chính cần trả lời: giảm overhead tạo kết nối.
- Đáp án mẫu ngắn: Pooling tái sử dụng kết nối DB, giảm chi phí bắt tay kết nối và tăng ổn định khi nhiều client đồng thời.

### 54) `statement_timeout` dùng làm gì?
- Ý chính cần trả lời: chặn query chạy quá lâu.
- Đáp án mẫu ngắn: `statement_timeout` tự hủy câu lệnh vượt quá ngưỡng thời gian, giúp bảo vệ hệ thống khỏi query treo lâu.

### 55) `idle_in_transaction_session_timeout` dùng làm gì?
- Ý chính cần trả lời: dọn session treo trong transaction.
- Đáp án mẫu ngắn: Tham số này ngắt session idle nhưng còn transaction mở, tránh giữ lock/snapshot quá lâu.

---

## C. Advanced (56-85)

### 56) WAL là gì và vai trò chính?
- Ý chính cần trả lời: write-ahead log cho durability/recovery/replication.
- Đáp án mẫu ngắn: WAL ghi thay đổi trước khi ghi data file, là nền tảng cho durability, crash recovery và replication.

### 57) Checkpoint ảnh hưởng hiệu năng thế nào?
- Ý chính cần trả lời: checkpoint dày gây IO spike; thưa quá tăng recovery time.
- Đáp án mẫu ngắn: Checkpoint cần cân bằng vì quá thường xuyên gây spike IO, còn quá thưa làm thời gian recovery dài hơn.

### 58) Bloat là gì?
- Ý chính cần trả lời: phình table/index do dead tuples/fragmentation.
- Đáp án mẫu ngắn: Bloat là hiện tượng bảng/index phình to so với dữ liệu thực do phiên bản cũ tích tụ và phân mảnh.

### 59) HOT update là gì?
- Ý chính cần trả lời: update không đụng indexed columns, giảm cập nhật index.
- Đáp án mẫu ngắn: HOT update là tối ưu khi cập nhật cột không nằm trong index, giúp giảm chi phí ghi index.

### 60) Lock cấp row và lock cấp table khác nhau gì?
- Ý chính cần trả lời: phạm vi tác động và mức ảnh hưởng concurrency.
- Đáp án mẫu ngắn: Row lock chỉ khóa bản ghi liên quan, table lock ảnh hưởng phạm vi lớn hơn và dễ gây chờ hàng loạt.

### 61) Deadlock là gì? PostgreSQL xử lý thế nào?
- Ý chính cần trả lời: vòng chờ lock; phát hiện và hủy một transaction.
- Đáp án mẫu ngắn: Deadlock là vòng chờ lẫn nhau giữa transaction; PostgreSQL phát hiện tự động và abort một transaction để phá vòng.

### 62) Cách giảm deadlock?
- Ý chính cần trả lời: thống nhất thứ tự lock, transaction ngắn, retry.
- Đáp án mẫu ngắn: Giảm deadlock bằng cách truy cập tài nguyên theo cùng thứ tự, giữ transaction ngắn và có cơ chế retry.

### 63) `FOR UPDATE SKIP LOCKED` dùng trong bài toán nào?
- Ý chính cần trả lời: queue worker song song.
- Đáp án mẫu ngắn: Dùng cho hàng đợi công việc để nhiều worker lấy việc mà không giẫm lock của nhau.

### 64) `UPSERT` trong PostgreSQL làm thế nào?
- Ý chính cần trả lời: `INSERT ... ON CONFLICT`.
- Đáp án mẫu ngắn: PostgreSQL hỗ trợ upsert qua `INSERT ... ON CONFLICT (...) DO UPDATE/DO NOTHING`.

### 65) Cardinality misestimate là gì?
- Ý chính cần trả lời: planner ước lượng sai số dòng -> chọn plan tệ.
- Đáp án mẫu ngắn: Đây là lúc planner đoán sai số dòng, dẫn đến chọn join/scan không tối ưu.

### 66) Làm sao xử lý misestimate?
- Ý chính cần trả lời: analyze, extended stats, rewrite query/index.
- Đáp án mẫu ngắn: Cập nhật statistics (`ANALYZE`), cân nhắc extended stats và điều chỉnh query/index để planner có dữ liệu tốt hơn.

### 67) `Index Only Scan` là gì, điều kiện để xảy ra?
- Ý chính cần trả lời: đọc từ index không chạm heap; phụ thuộc visibility map.
- Đáp án mẫu ngắn: Index Only Scan đọc dữ liệu trực tiếp từ index khi cột đủ và page đủ điều kiện visibility map.

### 68) Khi nào `EXISTS` tốt hơn `IN`?
- Ý chính cần trả lời: thường tốt với subquery lớn/correlated; tùy planner.
- Đáp án mẫu ngắn: `EXISTS` thường hiệu quả hơn khi chỉ cần kiểm tra tồn tại trên tập lớn, nhưng quyết định cuối vẫn phụ thuộc execution plan.

### 69) Tại sao `SELECT *` có thể gây hại?
- Ý chính cần trả lời: đọc dư cột, tăng IO/network, cản index-only.
- Đáp án mẫu ngắn: `SELECT *` kéo nhiều dữ liệu không cần thiết, tăng IO và có thể làm mất cơ hội dùng plan tối ưu.

### 70) Logical replication khác physical replication như thế nào?
- Ý chính cần trả lời: mức sao chép dữ liệu logic vs block/WAL.
- Đáp án mẫu ngắn: Physical replication sao chép ở mức WAL/block cho HA, còn logical replication sao chép ở mức table/publication linh hoạt cho migration/tích hợp.

### 71) Replication lag là gì?
- Ý chính cần trả lời: độ trễ giữa primary và replica.
- Đáp án mẫu ngắn: Replication lag là khoảng chênh thời gian/LSN giữa dữ liệu trên primary và replica.

### 72) PITR là gì?
- Ý chính cần trả lời: khôi phục về thời điểm bất kỳ nhờ base backup + WAL.
- Đáp án mẫu ngắn: PITR cho phép khôi phục database đến một thời điểm cụ thể bằng cách replay WAL từ base backup.

### 73) RPO và RTO là gì?
- Ý chính cần trả lời: mất dữ liệu chấp nhận được và thời gian phục hồi.
- Đáp án mẫu ngắn: RPO là mức mất dữ liệu tối đa chấp nhận, RTO là thời gian tối đa để khôi phục dịch vụ.

### 74) Vì sao "test restore" quan trọng hơn chỉ "có backup"?
- Ý chính cần trả lời: backup có thể hỏng/thiếu, restore mới là kiểm chứng thật.
- Đáp án mẫu ngắn: Backup chỉ có ý nghĩa khi restore thành công, nên cần drill định kỳ để xác nhận tính khả dụng thật.

### 75) `pg_basebackup` dùng khi nào?
- Ý chính cần trả lời: tạo physical base backup, dựng standby.
- Đáp án mẫu ngắn: `pg_basebackup` dùng để lấy bản sao vật lý cụm dữ liệu, thường phục vụ dựng standby hoặc PITR.

### 76) Khi nào cần PgBouncer transaction pooling?
- Ý chính cần trả lời: rất nhiều kết nối ngắn, giảm áp lực DB.
- Đáp án mẫu ngắn: Transaction pooling phù hợp workload nhiều request ngắn để giảm số backend connections thật trên PostgreSQL.

### 77) Rủi ro của transaction pooling?
- Ý chính cần trả lời: session state không bền giữa query.
- Đáp án mẫu ngắn: Session state như temp table/session variable có thể không giữ nguyên giữa các câu lệnh nên app cần thiết kế tương thích.

### 78) `max_connections` có nên tăng rất cao không?
- Ý chính cần trả lời: không; nên pool + kiểm soát concurrency.
- Đáp án mẫu ngắn: Tăng quá cao làm overhead context switching/memory lớn, thường nên dùng pooling và giới hạn concurrency ở app.

### 79) `pg_stat_activity` dùng để làm gì?
- Ý chính cần trả lời: quan sát session, query, state, wait events.
- Đáp án mẫu ngắn: View này giúp theo dõi session đang chạy gì, trạng thái ra sao và là điểm bắt đầu khi điều tra sự cố runtime.

### 80) `pg_locks` dùng khi nào?
- Ý chính cần trả lời: phân tích lock contention/deadlock.
- Đáp án mẫu ngắn: Dùng `pg_locks` để xác định ai đang giữ lock, ai đang chờ lock và nguyên nhân nghẽn.

### 81) Vì sao migration DDL có thể gây lock lớn?
- Ý chính cần trả lời: một số ALTER cần lock mạnh hoặc rewrite table.
- Đáp án mẫu ngắn: Nhiều thao tác DDL yêu cầu lock cấp cao hoặc rewrite dữ liệu nên có thể block traffic nếu chạy giờ cao điểm.

### 82) Cách giảm rủi ro migration trên bảng lớn?
- Ý chính cần trả lời: chia bước, backfill batch, concurrent index.
- Đáp án mẫu ngắn: Thực hiện migration theo nhiều bước nhỏ, tạo index `CONCURRENTLY`, backfill theo batch và có kế hoạch rollback rõ ràng.

### 83) `CREATE INDEX CONCURRENTLY` khác gì thường?
- Ý chính cần trả lời: giảm block write/read, đổi lại lâu hơn và không chạy trong transaction block.
- Đáp án mẫu ngắn: `CONCURRENTLY` hạn chế block nhưng tốn thời gian hơn và có ràng buộc vận hành riêng.

### 84) Khi nào dùng BRIN?
- Ý chính cần trả lời: bảng rất lớn, dữ liệu có tính tương quan vật lý cao (thời gian).
- Đáp án mẫu ngắn: BRIN phù hợp bảng cực lớn có dữ liệu sắp theo tự nhiên như timestamp, giúp index rất nhỏ.

### 85) TOAST là gì?
- Ý chính cần trả lời: cơ chế lưu dữ liệu lớn ngoài tuple chính.
- Đáp án mẫu ngắn: TOAST là cơ chế PostgreSQL nén/chuyển dữ liệu cột lớn ra vùng lưu riêng để tối ưu page chính.

---

## D. Production / System Design (86-100)

### 86) Thiết kế PostgreSQL cho hệ thống 10k RPS đọc, 1k RPS ghi như thế nào?
- Ý chính cần trả lời: primary + read replicas, pooling, cache, index theo query.
- Đáp án mẫu ngắn: Dùng primary cho write, nhiều read replica cho đọc, PgBouncer cho kết nối, cache tầng ứng dụng và thiết kế index theo truy vấn nóng.

### 87) Làm sao chọn giữa scale up và scale out?
- Ý chính cần trả lời: bắt đầu scale up, sau đó replica/sharding theo bottleneck.
- Đáp án mẫu ngắn: Thường scale up trước để đơn giản, khi chạm ngưỡng mới scale out bằng read replica hoặc phân mảnh theo domain.

### 88) Khi nào cần sharding?
- Ý chính cần trả lời: dữ liệu/quá tải vượt khả năng 1 node, domain tách rõ.
- Đáp án mẫu ngắn: Sharding cần khi một node không đáp ứng được dung lượng/thông lượng và mô hình nghiệp vụ cho phép tách dữ liệu hợp lý.

### 89) Trade-off của sharding?
- Ý chính cần trả lời: complexity cao, cross-shard query/transaction khó.
- Đáp án mẫu ngắn: Sharding tăng khả năng mở rộng nhưng làm phức tạp vận hành, routing dữ liệu và consistency xuyên shard.

### 90) Chiến lược backup production tối thiểu nên có gì?
- Ý chính cần trả lời: full + WAL, nhiều nơi lưu, mã hóa, kiểm tra restore.
- Đáp án mẫu ngắn: Tối thiểu cần base backup định kỳ + WAL archiving, lưu đa vùng, mã hóa và test restore thường xuyên.

### 91) Bạn xử lý incident "query đột ngột chậm toàn hệ thống" thế nào?
- Ý chính cần trả lời: kiểm tra saturation, lock, query nóng, rollback thay đổi gần nhất.
- Đáp án mẫu ngắn: Mình kiểm tra tài nguyên và lock trước, xác định query nóng qua stats/log, so với thay đổi gần nhất rồi áp dụng giảm tải và fix triệt để.

### 92) Khi nào kill query? Khi nào kill session?
- Ý chính cần trả lời: query runaway vs session treo giữ lock.
- Đáp án mẫu ngắn: Kill query khi câu lệnh vượt ngưỡng ảnh hưởng hệ thống; kill session khi phiên làm việc treo hoặc giữ lock gây nghẽn kéo dài.

### 93) Làm sao kiểm soát migration trong CI/CD?
- Ý chính cần trả lời: migration idempotent, backward-compatible, rollout nhiều pha.
- Đáp án mẫu ngắn: Viết migration an toàn, tương thích ngược, triển khai theo nhiều bước và quan sát metric trước/sau release.

### 94) Thiết kế multi-tenant bằng PostgreSQL có những lựa chọn nào?
- Ý chính cần trả lời: shared table + tenant_id, schema per tenant, DB per tenant.
- Đáp án mẫu ngắn: Có 3 mô hình chính là shared-table, schema-per-tenant, database-per-tenant; chọn theo isolation, chi phí và độ phức tạp vận hành.

### 95) Khi nào dùng RLS cho multi-tenant?
- Ý chính cần trả lời: cần bảo vệ tầng DB, tránh rò rỉ chéo tenant.
- Đáp án mẫu ngắn: Dùng RLS khi muốn enforce phân tách tenant ngay trong DB như lớp phòng vệ bổ sung ngoài logic ứng dụng.

### 96) Cần monitor metric nào để phòng sự cố sớm?
- Ý chính cần trả lời: latency, TPS, lock waits, replication lag, bloat, autovacuum lag, disk usage.
- Đáp án mẫu ngắn: Mình theo dõi độ trễ truy vấn, lock wait, replication lag, dead tuples/bloat, autovacuum lag và dung lượng đĩa để phát hiện sớm rủi ro.

### 97) Làm sao tối ưu cost vận hành PostgreSQL trên cloud?
- Ý chính cần trả lời: đúng kích thước máy, replica hợp lý, lifecycle backup, tối ưu query/index.
- Đáp án mẫu ngắn: Tối ưu chi phí bằng rightsizing instance, giảm query lãng phí, kiểm soát số replica và chính sách lưu backup theo vòng đời.

### 98) Blue/Green cho database có khó gì?
- Ý chính cần trả lời: đồng bộ dữ liệu, cutover, rollback phức tạp.
- Đáp án mẫu ngắn: Blue/Green DB khó ở đồng bộ dữ liệu liên tục và rollback an toàn, thường cần replication + kế hoạch cutover rất chặt.

### 99) Nói một ví dụ tối ưu query bạn từng làm?
- Ý chính cần trả lời: bối cảnh, đo lường trước/sau, hành động cụ thể.
- Đáp án mẫu ngắn: Mình mô tả query chậm, phân tích plan, thêm/chỉnh index và rewrite query, sau đó chứng minh giảm latency bằng số liệu trước/sau.

### 100) Nếu chỉ có 30 ngày để nâng hệ thống PostgreSQL lên "production-ready", bạn ưu tiên gì?
- Ý chính cần trả lời: reliability trước, sau đó performance/security/observability.
- Đáp án mẫu ngắn: Mình ưu tiên backup-restore drill, HA cơ bản, monitoring/alerting, hardening bảo mật và xử lý top query chậm trước khi mở rộng thêm tính năng.

---

## Bonus: Script tự luyện 7 ngày

- Ngày 1: Làm 25 câu Beginner.
- Ngày 2: Làm 30 câu Intermediate.
- Ngày 3: Làm 30 câu Advanced.
- Ngày 4: Làm 15 câu Production.
- Ngày 5: Tự ghi âm trả lời 20 câu bất kỳ.
- Ngày 6: Mock interview 1-1 trong 60 phút.
- Ngày 7: Ôn lại các câu trả lời yếu + bổ sung ví dụ dự án thật.

---

## Gợi ý chấm điểm nhanh mỗi câu (0-2 điểm)

- **0 điểm**: Không trả lời được hoặc trả lời sai bản chất.
- **1 điểm**: Trả lời đúng ý chính nhưng thiếu chiều sâu/trade-off.
- **2 điểm**: Trả lời đúng, có ví dụ thực tế, nêu rõ trade-off và cách đo lường.

Mục tiêu:
- 140+/200: pass vòng cơ bản.
- 170+/200: mạnh cho Mid/Senior.
- 185+/200: rất tốt cho Senior/Lead.
