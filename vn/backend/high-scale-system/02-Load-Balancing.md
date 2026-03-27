# Load Balancing & Reverse Proxy — High Scale

## Mục lục
1. [Tại sao Load Balancing là tầng đầu tiên?](#tại-sao-load-balancing-là-tầng-đầu-tiên)
2. [L4 vs L7 Load Balancing](#l4-vs-l7-load-balancing)
3. [Thuật toán Load Balancing](#thuật-toán-load-balancing)
4. [Nginx cấu hình high-scale](#nginx-cấu-hình-high-scale)
5. [HAProxy cho triệu connections](#haproxy-cho-triệu-connections)
6. [CDN — Tầng cache đầu tiên](#cdn--tầng-cache-đầu-tiên)
7. [DNS Load Balancing & GeoDNS](#dns-load-balancing--geodns)
8. [Kinh nghiệm thực tế](#kinh-nghiệm-thực-tế)
9. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Tại Sao Load Balancing Là Tầng Đầu Tiên?

Một server vật lý tốt nhất xử lý **~50,000-100,000 concurrent connections**. Muốn 5-10M → phải phân phối ra **hàng trăm servers**.

```
Không có LB:
  Client → 1 Server (50K connections max) → CHẾT

Có LB:
  Client → LB → 200 Servers (50K × 200 = 10M connections)
```

### Kiến trúc LB nhiều tầng

```
                    GeoDNS
                   /      \
            LB-US          LB-EU          ← DNS-level (continent)
           /    \          /    \
      LB-1    LB-2    LB-3    LB-4       ← L4 (transport, TCP/UDP)
     / | \   / | \   / | \   / | \
   App servers (K8s pods)                 ← L7 routing đến service cụ thể
```

---

## L4 vs L7 Load Balancing

| Tiêu chí | L4 (Transport) | L7 (Application) |
|----------|----------------|-------------------|
| **Layer** | TCP/UDP | HTTP/HTTPS/gRPC |
| **Xử lý** | Forward packet, không đọc content | Parse HTTP headers, URL, cookies |
| **Tốc độ** | Rất nhanh (kernel-level) | Chậm hơn (userspace parsing) |
| **Tính năng** | IP+port based routing | URL path, header, cookie routing |
| **SSL termination** | Passthrough hoặc terminate | Terminate (decrypt + re-encrypt) |
| **Throughput** | **1M+ connections/server** | **100K-500K connections/server** |
| **Use case** | Tầng ngoài cùng, scale raw traffic | Routing thông minh, A/B testing |
| **Tool** | HAProxy (mode tcp), LVS, IPVS | Nginx, HAProxy (mode http), Envoy |

### Khi nào dùng gì?

```
Internet → L4 LB (HAProxy TCP) → L7 LB (Nginx/Envoy) → App servers
           ↑ Phân phối raw TCP      ↑ Route theo URL, header
           ↑ Không decrypt SSL      ↑ SSL termination
           ↑ 1M+ conn/server        ↑ 200K conn/server
```

---

## Thuật Toán Load Balancing

| Thuật toán | Mô tả | Use case |
|-----------|--------|----------|
| **Round Robin** | Lần lượt từng server | Servers đồng đều |
| **Weighted Round Robin** | Có trọng số (server mạnh nhận nhiều) | Servers không đồng đều |
| **Least Connections** | Gửi đến server có ít connection nhất | Long-lived connections |
| **IP Hash** | Hash IP client → fixed server | Session affinity |
| **Consistent Hashing** | Hash ring, thêm/bớt server ảnh hưởng ít | Cache servers, stateful services |
| **Random** | Chọn ngẫu nhiên | Đơn giản, surprisingly effective |
| **Least Response Time** | Server response nhanh nhất | Heterogeneous servers |
| **Power of Two Choices** | Random 2 servers, chọn ít load hơn | Tốt hơn random, ít overhead |

### Consistent Hashing — quan trọng cho cache

```
Hash ring:
  0 ──── Server A ──── Server B ──── Server C ──── 2^32
         │                │              │
    key1 → A         key2 → B       key3 → C

Thêm Server D:
  0 ── A ── D ── B ── C ── 2^32
       │    │    │    │
  key1→A key4→D key2→B key3→C
  
→ Chỉ key4 bị ảnh hưởng (di chuyển từ B → D)
→ Không cần rebalance toàn bộ
```

---

## Nginx Cấu Hình High-Scale

### Nginx tối ưu cho triệu connections

```nginx
# /etc/nginx/nginx.conf

# === Worker processes ===
worker_processes auto;       # = số CPU cores
worker_rlimit_nofile 1048576;  # Max file descriptors per worker

events {
    worker_connections 65536;  # Max connections per worker
    use epoll;                 # Linux epoll (high performance)
    multi_accept on;           # Accept nhiều connection cùng lúc
}

http {
    # === Keepalive ===
    keepalive_timeout 65;
    keepalive_requests 10000;   # Requests per keepalive connection

    # === Buffer sizes ===
    client_body_buffer_size 16k;
    client_max_body_size 10m;
    proxy_buffer_size 4k;
    proxy_buffers 8 16k;

    # === TCP optimization ===
    tcp_nopush on;
    tcp_nodelay on;
    sendfile on;               # Zero-copy file serving

    # === Gzip ===
    gzip on;
    gzip_comp_level 4;
    gzip_types text/plain application/json application/javascript text/css;
    gzip_min_length 256;

    # === Rate limiting ===
    limit_req_zone $binary_remote_addr zone=api:10m rate=1000r/s;

    # === Upstream ===
    upstream api_servers {
        least_conn;            # Thuật toán: least connections
        keepalive 512;         # Connection pool đến backend

        server 10.0.1.1:8080 weight=5 max_fails=3 fail_timeout=30s;
        server 10.0.1.2:8080 weight=5 max_fails=3 fail_timeout=30s;
        server 10.0.1.3:8080 weight=3 max_fails=3 fail_timeout=30s;
        # ... 100+ servers
    }

    server {
        listen 80;
        listen 443 ssl http2;

        # === Cache static content ===
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
            expires 365d;
            add_header Cache-Control "public, immutable";
        }

        # === API proxy ===
        location /api/ {
            limit_req zone=api burst=2000 nodelay;

            proxy_pass http://api_servers;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            # Timeout
            proxy_connect_timeout 5s;
            proxy_read_timeout 30s;
            proxy_send_timeout 10s;

            # Caching (tùy API)
            proxy_cache api_cache;
            proxy_cache_valid 200 10s;
            proxy_cache_use_stale error timeout updating;
        }
    }

    # === Proxy cache zone ===
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:100m
                     max_size=10g inactive=60m use_temp_path=off;
}
```

### OS-level tuning (Linux)

```bash
# /etc/sysctl.conf — kernel tuning cho millions of connections
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 10
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
fs.file-max = 2097152
fs.nr_open = 2097152

# /etc/security/limits.conf
* soft nofile 1048576
* hard nofile 1048576
```

---

## HAProxy cho Triệu Connections

```haproxy
# /etc/haproxy/haproxy.cfg
global
    maxconn 1000000
    nbthread 16              # Số CPU cores
    tune.ssl.default-dh-param 2048

defaults
    mode http
    timeout connect 5s
    timeout client 30s
    timeout server 30s
    option httplog
    option dontlognull
    option http-server-close
    option forwardfor

frontend http_front
    bind *:80
    bind *:443 ssl crt /etc/haproxy/certs/

    # Rate limiting
    stick-table type ip size 1m expire 30s store http_req_rate(10s)
    http-request deny if { src_http_req_rate(10s) gt 1000 }

    # Route by path
    acl is_api path_beg /api
    acl is_static path_end .js .css .png .jpg

    use_backend static_servers if is_static
    use_backend api_servers if is_api
    default_backend api_servers

backend api_servers
    balance leastconn
    option httpchk GET /health

    server api1 10.0.1.1:8080 check maxconn 10000
    server api2 10.0.1.2:8080 check maxconn 10000
    server api3 10.0.1.3:8080 check maxconn 10000

backend static_servers
    balance roundrobin
    server static1 10.0.2.1:80 check
```

---

## CDN — Tầng Cache Đầu Tiên

### CDN giải quyết 60-70% traffic

```
Không CDN:                     Có CDN:
Client (VN) → Server (US)     Client (VN) → CDN edge (VN) → Server (US)
RTT: 200ms                    RTT: 5ms (cache hit) / 200ms (miss)
```

### Cấu hình CDN cache cho API

```
# Cloudflare Page Rules hoặc Cache Rules
/api/products              → Cache 60s (ttl=60)
/api/products/{id}         → Cache 300s
/api/categories            → Cache 3600s (ít thay đổi)
/api/user/profile          → NO cache (private)
/api/search?q=*            → Cache 30s per query
/static/*                  → Cache 365 days

# HTTP Headers từ backend
Cache-Control: public, max-age=60, s-maxage=300
Vary: Accept-Encoding
ETag: "abc123"
```

### Edge computing

```javascript
// Cloudflare Worker — xử lý logic tại edge
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Rate limiting tại edge
  const ip = request.headers.get('CF-Connecting-IP');
  const rateKey = `rate:${ip}`;

  // Serve cached response
  const cache = caches.default;
  let response = await cache.match(request);
  if (response) return response;

  // Forward to origin
  response = await fetch(request);
  
  // Cache at edge
  if (response.ok) {
    const cloned = response.clone();
    event.waitUntil(cache.put(request, cloned));
  }
  return response;
}
```

---

## DNS Load Balancing & GeoDNS

### GeoDNS — route theo vị trí

```
User tại Việt Nam → DNS resolve → IP của server Singapore (gần nhất)
User tại Mỹ      → DNS resolve → IP của server US-East

# AWS Route 53 Geolocation Routing
mydomain.com:
  Vietnam  → 13.213.x.x (ap-southeast-1)
  Japan    → 54.168.x.x (ap-northeast-1)
  US-East  → 3.236.x.x (us-east-1)
  Default  → 18.185.x.x (eu-west-1)
```

---

## Kinh Nghiệm Thực Tế

### 1. Connection reuse là vua

```
Mở connection mới: ~3ms (TCP) + ~10ms (TLS) = ~13ms overhead

Ở 1M RPS:
  - Không reuse: 1M × 13ms = 13,000 CPU-seconds/s → CHẾT
  - Có keepalive: amortize overhead, ~0.1ms/request

→ BẮT BUỘC: keepalive giữa LB → backend, backend → Redis, backend → DB
```

### 2. Health check đúng cách

```
# ❌ Sai: health check quá đơn giản
GET /health → 200 OK (chỉ check app alive)

# ✅ Đúng: check cả dependencies
GET /health → {
  "status": "UP",
  "db": "UP" (test connection),
  "redis": "UP" (PING),
  "disk": "OK" (>10% free)
}

# ⚠️ Lưu ý: health check interval = 5-10s, không quá thường xuyên
# Nếu 200 backend servers, 1s interval = 200 health checks/s → tốn tài nguyên
```

### 3. Graceful shutdown

```yaml
# K8s: đảm bảo LB ngừng gửi traffic TRƯỚC khi pod shutdown
spec:
  terminationGracePeriodSeconds: 60
  containers:
    - lifecycle:
        preStop:
          exec:
            command: ["sh", "-c", "sleep 15"]
            # Đợi 15s để LB remove pod khỏi pool
            # Rồi mới shutdown gracefully
```

---

## Câu Hỏi Phỏng Vấn

### L4 vs L7 LB — khi nào dùng gì?
> L4: tầng ngoài cùng, raw TCP, nhanh, triệu connections. L7: routing thông minh (URL, header), SSL termination, caching. Thường dùng **cả hai**: L4 phía trước phân phối → L7 phía sau route.

### Consistent Hashing dùng khi nào?
> Khi cần **sticky routing** (cùng key luôn đến cùng server): cache server, session server, sharded database. Thêm/bớt server chỉ ảnh hưởng ~1/N keys.

### Nginx có xử lý được 1M RPS không?
> Được. Nginx dùng **event-driven, non-blocking** (epoll). Một server Nginx tốt: ~100K-500K RPS (HTTP proxy), ~1M+ connections concurrent. Cần tuning OS (file descriptors, TCP buffers).

---

**Tiếp theo:** [03-Caching-Strategy.md](./03-Caching-Strategy.md)
