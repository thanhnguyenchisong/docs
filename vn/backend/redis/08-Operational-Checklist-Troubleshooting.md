# Operational Checklist và Troubleshooting - Redis thực chiến

## Mục lục
1. [Checklist cấu hình production](#checklist-cấu-hình-production)
2. [Monitoring và alert tối thiểu](#monitoring-và-alert-tối-thiểu)
3. [Runbook sự cố thường gặp](#runbook-sự-cố-thường-gặp)
4. [Backup, restore, DR drill](#backup-restore-dr-drill)
5. [Checklist go-live nhanh](#checklist-go-live-nhanh)
6. [Câu hỏi phỏng vấn mở rộng](#câu-hỏi-phỏng-vấn-mở-rộng)

---

## Checklist cấu hình production

### 1) Memory và eviction

- Bắt buộc đặt `maxmemory` để tránh Redis ăn hết RAM máy.
- Chọn `maxmemory-policy` theo use case:
  - `allkeys-lru`: cache thuần, không quan trọng key nào cũng có thể bị evict.
  - `volatile-ttl`: chỉ evict key có TTL, ưu tiên key sắp hết hạn.
  - `noeviction`: phù hợp khi Redis là store quan trọng, muốn write fail thay vì mất data.
- Theo dõi `evicted_keys`; nếu tăng liên tục, cần tăng RAM/giảm key size/rà soát TTL.

### 2) Persistence

- Cache thuần có thể nhẹ persistence, nhưng production nên có ít nhất một phương án backup.
- Với data quan trọng:
  - AOF `everysec` để giảm mất data.
  - Kết hợp RDB snapshot để restore nhanh và lưu backup off-host.
- Kiểm tra định kỳ thời gian restart + restore thực tế (không chỉ cấu hình trên giấy).

### 3) Security cơ bản

- Không expose Redis public internet.
- Bật auth/ACL (Redis 6+), giới hạn network bằng firewall/VPC.
- Bật TLS nếu đi qua network không tin cậy.
- Đặt tên command nguy hiểm qua ACL thay vì chỉ dựa vào `rename-command`.

### 4) Connection và timeout

- Dùng connection pooling từ app (`Lettuce` trong Spring Boot).
- Tránh timeout quá ngắn gây retry storm; tránh quá dài gây treo thread.
- Thiết lập retry có backoff + jitter ở phía client.

### 5) Key design

- Quy ước key rõ ràng: `service:entity:id[:field]`.
- Đặt TTL cho cache key; tránh key sống vĩnh viễn ngoài chủ đích.
- Tránh value quá lớn; tách key nếu object quá nặng.

---

## Monitoring và alert tối thiểu

### Nhóm chỉ số nên theo dõi

- **Hiệu năng**: `latency`, `instantaneous_ops_per_sec`, `slowlog`.
- **Bộ nhớ**: `used_memory`, `used_memory_rss`, `mem_fragmentation_ratio`.
- **Cache quality**: `keyspace_hits`, `keyspace_misses`, hit ratio.
- **Ổn định**: `connected_clients`, `rejected_connections`, `blocked_clients`.
- **Replication/HA**: replication lag, failover event, role switch.
- **Eviction/expiry**: `evicted_keys`, `expired_keys`.

### Gợi ý cảnh báo

- Hit ratio giảm mạnh so với baseline trong 5-15 phút.
- `evicted_keys` tăng nhanh liên tục.
- p95/p99 Redis latency tăng đột biến.
- Replication lag vượt ngưỡng SLO.
- `blocked_clients` > 0 kéo dài (có thể có lệnh block lâu hoặc nghẽn I/O).

---

## Runbook sự cố thường gặp

### 1) Memory full / OOM / write fail

**Dấu hiệu**:
- App báo lỗi `OOM command not allowed...` hoặc timeout tăng.
- `evicted_keys` tăng hoặc policy `noeviction` khiến write fail.

**Xử lý nhanh**:
1. Kiểm tra `INFO memory`, `INFO stats`.
2. Xác định hot key/big key (`SCAN` + sampling, không dùng `KEYS *`).
3. Giảm TTL key dài bất thường, xóa key không còn dùng.
4. Tăng `maxmemory` (nếu còn RAM) hoặc scale-out.
5. Đánh giá lại eviction policy theo use case.

### 2) Cache stampede khi key nóng hết hạn

**Dấu hiệu**:
- DB QPS tăng đột biến cùng lúc cache miss tăng.

**Xử lý nhanh**:
1. Bật lock ngắn hạn cho key nóng.
2. Thêm TTL jitter.
3. Warm-up hoặc refresh nền cho top key.
4. Cân nhắc cache null ngắn TTL để giảm penetration.

### 3) Replication lag cao

**Dấu hiệu**:
- Replica trả dữ liệu cũ, độ trễ đọc tăng.

**Xử lý nhanh**:
1. Kiểm tra network giữa master-replica.
2. Rà soát command nặng (slowlog, big payload).
3. Tăng backlog hợp lý để giảm full resync.
4. Giảm read từ replica khi lag vượt ngưỡng.

### 4) Failover xong app vẫn lỗi kết nối

**Dấu hiệu**:
- Redis đã promote master mới nhưng app chưa reconnect đúng node.

**Xử lý nhanh**:
1. Kiểm tra cấu hình client dùng Sentinel/Cluster đúng driver.
2. Giảm DNS cache TTL hoặc dùng endpoint theo role.
3. Bật reconnect strategy có backoff.
4. Test failover định kỳ để xác nhận ứng dụng tự phục hồi.

---

## Backup, restore, DR drill

### Nguyên tắc

- Backup phải lưu ngoài host Redis (object storage/NAS).
- Mã hóa backup và giới hạn quyền truy cập.
- Có retention rõ ràng (daily/weekly/monthly).

### DR drill tối thiểu hàng tháng

1. Khôi phục từ backup gần nhất lên môi trường staging.
2. Chạy smoke test nghiệp vụ đọc/ghi.
3. Đo thời gian RTO (thời gian phục hồi dịch vụ).
4. Đo RPO (mức mất data thực tế).
5. Ghi lại kết quả và hành động cải thiện.

---

## Checklist go-live nhanh

- [ ] Đặt `maxmemory` và policy eviction phù hợp.
- [ ] Thiết lập TTL cho cache key quan trọng.
- [ ] Bật auth/ACL, khóa truy cập mạng ngoài.
- [ ] Có monitor + alert cho latency, hit ratio, eviction, replication lag.
- [ ] Có backup định kỳ và test restore gần đây.
- [ ] Có runbook stampede, OOM, failover.
- [ ] App đã test failover Sentinel/Cluster.

---

## Câu hỏi phỏng vấn mở rộng

### Nếu hit ratio thấp nhưng memory vẫn cao thì nghĩ gì đầu tiên?

- Có thể key design không tốt, nhiều key ít tái sử dụng; hoặc TTL quá dài với data ít được truy cập lại. Cần phân tích top keyspace, vòng đời key và phân bố truy cập (Pareto hot/cold).

### Khi nào chọn `noeviction` thay vì LRU?

- Khi Redis giữ dữ liệu quan trọng hơn việc đáp ứng mọi write. `noeviction` giúp fail-fast để app xử lý fallback thay vì âm thầm làm mất dữ liệu cũ do evict.

### Tại sao phải diễn tập failover/restore nếu đã có Sentinel/Cluster?

- Vì cấu hình đúng chưa chắc ứng dụng xử lý đúng (reconnect, DNS, retry storm, timeout chain). Drill định kỳ giúp phát hiện lỗ hổng vận hành trước khi sự cố thật xảy ra.

---

**Tiếp theo:** Quay lại [README](./README.md) để ôn theo lộ trình đầy đủ.
