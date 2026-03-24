# Tài liệu Luyện Phỏng vấn PostgreSQL

Chào mừng đến với bộ tài liệu luyện phỏng vấn PostgreSQL! Bộ tài liệu này bao gồm các chủ đề quan trọng nhất thường được hỏi trong các cuộc phỏng vấn về PostgreSQL database.

## 📚 Mục lục

### Lộ trình tổng quan (khuyên đọc trước)

0. **[PostgreSQL Zero to Master - Interview Guide](./00-PostgreSQL-Zero-to-Master-Interview-Guide.md)**
   - Tại sao dùng PostgreSQL trong thực tế
   - Lộ trình học từ chưa biết gì đến mức master
   - Toàn bộ chủ đề phỏng vấn từ cơ bản -> chuyên sâu
   - Bộ câu hỏi trọng điểm kèm ý trả lời
   - Checklist năng lực cho cấp độ senior

### Core PostgreSQL

1. **[PostgreSQL Fundamentals](./01-PostgreSQL-Fundamentals.md)**
   - PostgreSQL là gì?
   - Installation và Setup
   - Configuration
   - psql Command Line
   - Database và Schema
   - Basic Operations

2. **[Data Types và Features](./02-Data-Types-and-Features.md)**
   - Standard Data Types
   - Advanced Types (JSON, JSONB, Array, UUID)
   - Custom Types
   - Extensions
   - Sequences
   - Constraints

3. **[Advanced Features](./03-Advanced-Features.md)**
   - JSON và JSONB
   - Arrays
   - Full-Text Search
   - CTEs (Common Table Expressions)
   - Window Functions
   - Stored Procedures và Functions
   - Triggers

4. **[Performance Tuning](./04-Performance-Tuning.md)**
   - Indexes (B-Tree, Hash, GIN, GiST)
   - Query Optimization
   - EXPLAIN và EXPLAIN ANALYZE
   - VACUUM và ANALYZE
   - Connection Pooling
   - Partitioning
   - Query Performance

5. **[Administration](./05-Administration.md)**
   - User và Role Management
   - Permissions và Privileges
   - Database Maintenance
   - Monitoring và Logging
   - Configuration Tuning
   - Extensions Management

6. **[Backup và Recovery](./06-Backup-and-Recovery.md)**
   - Backup Strategies
   - pg_dump và pg_restore
   - Point-in-Time Recovery (PITR)
   - WAL Archiving
   - Replication (Streaming, Logical)
   - Disaster Recovery

7. **[Security](./07-Security.md)**
   - Authentication Methods
   - Authorization và Roles
   - Row-Level Security
   - Encryption (at rest, in transit)
   - SSL/TLS Configuration
   - Best Practices

8. **[Mock Interview 100 Questions](./08-Mock-Interview-100-Questions.md)**
   - 100 câu hỏi từ Beginner -> Production
   - Ý chính cần trả lời cho từng câu
   - Đáp án mẫu ngắn để luyện phản xạ
   - Script tự luyện 7 ngày

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Nắm vững các khái niệm cơ bản trước
2. **Thực hành SQL**: Mỗi file có ví dụ SQL
3. **Ôn tập theo chủ đề**: Tập trung vào các chủ đề bạn còn yếu
4. **Làm bài tập**: Hoàn thành các bài tập ở cuối mỗi file

## 📝 Cấu trúc mỗi file

Mỗi file tài liệu bao gồm:

- **Lý thuyết**: Giải thích chi tiết các khái niệm
- **Ví dụ SQL**: SQL examples minh họa
- **So sánh**: So sánh các approaches khác nhau
- **Best Practices**: Các thực hành tốt nhất
- **Câu hỏi thường gặp**: FAQ với câu trả lời chi tiết
- **Bài tập thực hành**: Exercises để luyện tập

## 🔥 Chủ đề Hot trong Phỏng vấn

### Core PostgreSQL
- ✅ PostgreSQL vs MySQL vs other databases
- ✅ ACID compliance
- ✅ MVCC (Multi-Version Concurrency Control)
- ✅ Data types (JSONB, Arrays, UUID)
- ✅ Extensions

### Advanced Features
- ✅ JSON/JSONB operations
- ✅ Full-text search
- ✅ Window functions
- ✅ CTEs và recursive queries
- ✅ Stored procedures và functions

### Performance
- ✅ Index types (B-Tree, GIN, GiST)
- ✅ Query optimization
- ✅ EXPLAIN ANALYZE
- ✅ VACUUM và ANALYZE
- ✅ Partitioning

### Administration
- ✅ User và role management
- ✅ Backup và recovery
- ✅ Replication
- ✅ Monitoring
- ✅ Security

## 💡 Tips cho Phỏng vấn

1. **Hiểu sâu PostgreSQL internals**: MVCC, WAL, VACUUM
2. **Nắm vững advanced features**: JSONB, arrays, full-text search
3. **Performance**: Biết cách optimize queries và sử dụng indexes
4. **Administration**: Hiểu backup, recovery, replication
5. **Thực hành**: Sử dụng PostgreSQL thực tế quan trọng hơn lý thuyết

## 📖 Tài liệu tham khảo

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)

## 🚀 Lộ trình học

### Beginner → Intermediate
1. PostgreSQL Fundamentals
2. Data Types và Basic Operations
3. SQL Basics (SELECT, INSERT, UPDATE, DELETE)
4. Indexes cơ bản

### Intermediate → Advanced
5. Advanced Features (JSON, Arrays)
6. Full-Text Search
7. Performance Tuning
8. Administration

### Advanced
9. Backup và Recovery
10. Replication
11. Security
12. Best Practices

## ✅ Checklist trước Phỏng vấn

- [ ] Nắm vững PostgreSQL fundamentals
- [ ] Hiểu MVCC và WAL
- [ ] Biết các data types (JSONB, Arrays)
- [ ] Hiểu index types (B-Tree, GIN, GiST)
- [ ] Biết cách optimize queries
- [ ] Hiểu backup và recovery
- [ ] Biết replication strategies
- [ ] Hiểu security best practices

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc pull request.

---

**Chúc bạn thành công trong các cuộc phỏng vấn! 🎉**
