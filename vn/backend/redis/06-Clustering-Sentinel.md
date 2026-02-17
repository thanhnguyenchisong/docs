# Clustering và Sentinel - Câu hỏi phỏng vấn Redis

## Mục lục
1. [Redis Cluster](#redis-cluster)
2. [Hash Slot và Sharding](#hash-slot-và-sharding)
3. [Redis Sentinel](#redis-sentinel)
4. [Cluster vs Sentinel](#cluster-vs-sentinel)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Redis Cluster

### Mục đích

- **Scale ngang**: Data chia trên nhiều node (sharding); mỗi node phục vụ một phần key.
- **High availability**: Mỗi shard có thể có replica; failover trong từng shard.

### Số node

- Tối thiểu **6 node** cho production (3 master + 3 replica); có thể ít hơn cho dev (ví dụ 3 master).
- Client kết nối bất kỳ node; node redirect (MOVED/ASK) đến node đúng nếu key không thuộc node đó.

### Đặc điểm

- **Không proxy**: Client giao tiếp trực tiếp với từng master/replica.
- **Multi-key commands**: Chỉ dùng được khi các key cùng **hash slot** (ví dụ hash tag: `user:{id}`).
- **Transaction**: Chỉ support khi tất cả key trong transaction cùng slot.

---

## Hash Slot và Sharding

### Hash slot

- Redis Cluster có **16384 slot** (0–16383).
- **Key → slot**: `CRC16(key) % 16384`.
- Mỗi **master** nắm một subset slot (ví dụ node1: 0–5460, node2: 5461–10922, node3: 10923–16383).

### Hash tag

- Để nhiều key cùng slot (cho multi-key op hoặc transaction): dùng **hash tag** — phần trong `{}` mới dùng để tính slot.
- Ví dụ: `user:{1001}:profile`, `user:{1001}:settings` → cùng slot vì cùng `user:1001` (tag = 1001).

```bash
# Cùng slot
SET user:{1001}:name "Alice"
SET user:{1001}:age 30
MGET user:{1001}:name user:{1001}:age  # OK

# Khác slot → MGET có thể redirect từng key (client thường hỗ trợ)
```

### Resharding

- Có thể di chuyển slot giữa các master (add/remove node); cluster rebalance slot; trong lúc di chuyển client có thể nhận **ASK** redirect.

---

## Redis Sentinel

### Mục đích

- **High availability** cho cấu hình **một master + nhiều replica** (không shard).
- Sentinel: monitor master/replica; phát hiện master down; **bầu** một replica lên làm master mới và cập nhật cấu hình; client hỏi Sentinel để biết địa chỉ **master hiện tại**.

### Thành phần

- **Sentinel** (nhiều instance, thường ≥3): Quorum để bầu master mới, tránh split-brain.
- **Master**: Nhận write.
- **Replica(s)**: Nhận replication từ master; một replica được promote khi master fail.

### Client

- Client kết nối đến **Sentinel** (hoặc danh sách Sentinel) để lấy địa chỉ master; sau khi có địa chỉ thì kết nối trực tiếp master/replica.
- Khi failover xong, Sentinel cập nhật master mới; client reconnect hoặc Sentinel trả địa chỉ mới tùy driver.

### Cấu hình (ví dụ Sentinel)

```conf
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
```

- **2**: Số Sentinel đồng ý mới coi master down và tiến hành failover.
- **down-after-milliseconds**: Sau bao lâu không nhận được PING/PONG từ master thì coi subjectively down.

---

## Cluster vs Sentinel

| Tiêu chí | Redis Cluster | Redis Sentinel |
|----------|----------------|----------------|
| **Mục đích** | Sharding + HA (scale data) | HA (1 master, nhiều replica) |
| **Số master** | Nhiều (mỗi shard 1 master) | 1 master |
| **Data** | Chia theo slot trên nhiều node | Toàn bộ data trên 1 master (+ replica copy) |
| **Scale** | Scale ngang (thêm node, reshard) | Scale đọc (thêm replica) |
| **Độ phức tạp** | Cao (multi-key, transaction giới hạn) | Thấp hơn |
| **Khi nào dùng** | Data lớn, cần shard | Data vừa, cần HA, không cần shard |

---

## Câu hỏi thường gặp

### Redis Cluster có cần Sentinel không?

- Không. Cluster tự quản lý failover trong từng shard (master/replica trong shard). Sentinel dùng cho **non-cluster** (single master + replicas).

### Multi-key command trong Cluster?

- Chỉ chạy được nếu tất cả key thuộc **cùng hash slot**. Dùng **hash tag** `key:{tag}` để đưa nhiều key vào cùng slot. Nếu key khác slot, client phải gửi từng key đúng node (hoặc dùng CROSSSLOT error để biết).

### Quorum Sentinel là gì?

- Số Sentinel tối thiểu đồng ý rằng master down thì mới bắt đầu failover. Ví dụ 3 Sentinel, quorum 2 → cần 2 Sentinel đồng ý. Quorum thường > một nửa số Sentinel để tránh split-brain.

---

**Tiếp theo:** [07-Advanced-Topics.md](./07-Advanced-Topics.md) — Pub/Sub, Lua, Pipeline, best practices.
