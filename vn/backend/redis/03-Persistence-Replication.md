# Persistence và Replication - Câu hỏi phỏng vấn Redis

## Mục lục
1. [RDB (Snapshot)](#rdb-snapshot)
2. [AOF (Append-Only File)](#aof-append-only-file)
3. [RDB vs AOF](#rdb-vs-aof)
4. [Replication (Master-Replica)](#replication-master-replica)
5. [Failover](#failover)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## RDB (Snapshot)

### Cơ chế

- **RDB** là snapshot toàn bộ dataset tại một thời điểm, ghi ra file (ví dụ `dump.rdb`).
- Có thể trigger: **SAVE** (blocking), **BGSAVE** (fork, không block), hoặc theo **schedule** (save 900 1 = sau 900s nếu có ≥1 thay đổi).

### Ưu điểm

- **Restore nhanh**: Load một file binary, phù hợp disaster recovery.
- **Compact**: Một file, dễ backup, copy.
- **Ít ảnh hưởng**: BGSAVE fork process, main thread không block (trên Unix).

### Nhược điểm

- **Mất data giữa hai lần snapshot**: Crash sau lần save cuối → mất thay đổi từ lúc đó.
- **Fork có thể chậm**: Dataset lớn → fork tốn thời gian và memory (copy-on-write).

### Cấu hình ví dụ

```conf
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /var/lib/redis
```

---

## AOF (Append-Only File)

### Cơ chế

- **AOF** ghi lại mỗi **write command** (SET, DEL, ...) dưới dạng log append-only.
- Restart thì replay AOF để khôi phục state.
- **fsync**: always / everysec / no — quyết định độ bền vs throughput.

### Ưu điểm

- **Durability tốt hơn RDB**: everysec → mất tối đa ~1s data; always → mất tối đa 1 command (nếu fsync thành công).
- **Log dạng text**: Có thể xem, sửa (cẩn thận).

### Nhược điểm

- **File lớn hơn RDB**: Nhiều lệnh, có thể có lệnh “gộp” (AOF rewrite).
- **Restore chậm hơn RDB**: Phải replay từng lệnh.
- **Throughput**: always fsync → chậm hơn everysec/no.

### AOF Rewrite

- AOF có thể rất dài → **BGREWRITEAOF** tạo file AOF mới gọn (chỉ còn lệnh cần thiết để tái tạo state hiện tại). Redis có thể tự rewrite khi vượt ngưỡng.

### Cấu hình ví dụ

```conf
appendonly yes
appendfsync everysec
appendfilename "appendonly.aof"
```

---

## RDB vs AOF

| Tiêu chí | RDB | AOF |
|----------|-----|-----|
| **Durability** | Mất data từ lần snapshot cuối | Tốt hơn (everysec/always) |
| **Restore** | Nhanh (load 1 file) | Chậm (replay log) |
| **Kích thước** | Nhỏ gọn | Thường lớn hơn (có rewrite) |
| **Performance** | BGSAVE fork, ít ảnh hưởng | fsync ảnh hưởng write |
| **Use case** | Backup, snapshot định kỳ | Cần giảm mất data |

**Thực tế**: Có thể **bật cả hai**; restart ưu tiên AOF nếu có (Redis load AOF trước, không có mới dùng RDB).

---

## Replication (Master-Replica)

### Cơ chế

- **Master**: Nhận write, replicate sang replica(s).
- **Replica**: Nhận bản sao data từ master (full sync hoặc incremental), chỉ đọc (read-only), không ghi (trừ khi cấu hình cho phép).
- **Async replication**: Master không đợi replica ack mới trả lời client → có thể mất vài lệnh nếu master chết trước khi replica nhận đủ.

### Full sync vs Partial (PSYNC)

- **Full resync**: Replica mới hoặc lệch quá → master gửi RDB snapshot rồi stream AOF/commands.
- **Partial resync (PSYNC)**: Replica chỉ thiếu một đoạn → master gửi lại từ replication backlog → nhanh hơn.

### Use case

- **Read scaling**: Đọc từ replica(s), ghi vào master.
- **Disaster recovery**: Promote replica lên master khi master lỗi (thường dùng Sentinel hoặc orchestration).

### Cấu hình (replica)

```conf
replicaof <masterip> <masterport>
replica-read-only yes
```

---

## Failover

- **Thủ công**: Tắt master, trên một replica chạy **REPLICAOF NO ONE** → replica thành master mới; các replica khác trỏ về master mới.
- **Tự động**: Dùng **Redis Sentinel** — Sentinel quản lý master/replica, phát hiện master down, bầu replica mới và cập nhật cấu hình; client hỏi Sentinel để biết địa chỉ master hiện tại.

---

## Câu hỏi thường gặp

### Nên dùng RDB hay AOF?

- **Cache thuần**: Có thể chỉ RDB hoặc tắt persistence.
- **Cần giảm mất data**: Bật AOF (everysec là cân bằng tốt); có thể bật cả RDB để backup/restore nhanh.

### Replication có đảm bảo không mất data không?

- Không đảm bảo strong consistency: master trả lời client trước khi replica ack → có thể mất vài lệnh nếu master fail. Cần durability mạnh thì dùng AOF (everysec/always) trên master.

### Replica có thể ghi không?

- Mặc định **read-only**. Cấu hình cho phép ghi (replica-read-only no) chỉ dùng trong trường hợp đặc biệt (ví dụ temporary local write), không dùng cho consistency chuẩn.

---

**Tiếp theo:** [04-Caching-Patterns.md](./04-Caching-Patterns.md) — Cache-aside, invalidation, stampede.
