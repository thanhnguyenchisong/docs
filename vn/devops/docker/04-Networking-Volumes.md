# Docker Networking & Volumes

## Mục lục
1. [Docker Networking](#docker-networking)
2. [Network Drivers](#network-drivers)
3. [Docker Volumes](#docker-volumes)
4. [Bind Mounts vs Volumes](#bind-mounts-vs-volumes)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Docker Networking

### Default networks

```bash
docker network ls
# NETWORK ID    NAME      DRIVER    SCOPE
# xxx           bridge    bridge    local    ← Default, container giao tiếp qua IP
# yyy           host      host      local    ← Container dùng network host trực tiếp
# zzz           none      null      local    ← Không có network
```

### User-defined bridge (khuyến nghị)

```bash
docker network create my-network
docker run -d --name api --network my-network my-api
docker run -d --name db  --network my-network postgres

# Containers cùng network gọi nhau bằng TÊN:
# Trong api container: postgres://db:5432
```

**Lợi ích so với default bridge:**
- DNS resolution tự động (gọi bằng tên container)
- Isolation tốt hơn
- Connect/disconnect container khi đang chạy

---

## Network Drivers

| Driver | Mô tả | Use case |
|--------|--------|----------|
| **bridge** | Network riêng trên host, NAT | Default, single host |
| **host** | Container dùng network host | Performance (không NAT overhead) |
| **overlay** | Network chéo nhiều Docker hosts | Docker Swarm, multi-host |
| **macvlan** | Container có MAC address riêng | Legacy app cần network access trực tiếp |
| **none** | Không network | Container cần isolation hoàn toàn |

### Port mapping

```bash
docker run -p 8080:3000 my-app      # host:container
docker run -p 127.0.0.1:8080:3000   # Chỉ bind localhost
docker run -P my-app                # Auto map EXPOSE ports
```

---

## Docker Volumes

### Tại sao cần volume?

Container filesystem là **ephemeral** — khi container bị xóa, data mất. Volume giữ data **persist** ngoài container lifecycle.

### Tạo và sử dụng

```bash
# Tạo named volume
docker volume create pgdata

# Mount volume vào container
docker run -v pgdata:/var/lib/postgresql/data postgres

# List volumes
docker volume ls

# Inspect
docker volume inspect pgdata

# Cleanup
docker volume rm pgdata
docker volume prune    # Xóa tất cả unused volumes
```

---

## Bind Mounts vs Volumes

| Tiêu chí | Named Volume | Bind Mount |
|----------|-------------|------------|
| **Quản lý** | Docker quản lý | User chỉ định path |
| **Cú pháp** | `-v mydata:/data` | `-v /host/path:/container/path` |
| **Location** | `/var/lib/docker/volumes/` | Bất kỳ path nào trên host |
| **Backup** | `docker volume` commands | Manual (cp, rsync) |
| **Use case** | Database, persistent data | Config files, source code (dev) |
| **Production** | ✅ Khuyến nghị | ⚠️ Hạn chế (security, path dependency) |

### Ví dụ

```bash
# Named volume — production
docker run -v pgdata:/var/lib/postgresql/data postgres

# Bind mount — development (hot reload)
docker run -v $(pwd)/src:/app/src -v /app/node_modules my-app

# Read-only bind mount — config
docker run -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf:ro nginx
```

### tmpfs mount — in-memory

```bash
# Data chỉ tồn tại khi container chạy, không persist
docker run --tmpfs /tmp my-app
```

---

## Câu hỏi thường gặp

### Container cùng network gọi nhau bằng gì?
- **User-defined bridge**: bằng container name (DNS auto-resolve).
- **Default bridge**: bằng IP (không có DNS).
- → Luôn dùng user-defined bridge.

### Volume data nằm ở đâu trên host?
- `/var/lib/docker/volumes/<volume-name>/_data` (Linux).
- Docker Desktop (Mac/Windows): trong VM của Docker.

### Backup volume thế nào?
```bash
docker run --rm -v pgdata:/data -v $(pwd):/backup alpine \
  tar czf /backup/pgdata-backup.tar.gz -C /data .
```

---

**Tiếp theo:** [05-Security-Production.md](./05-Security-Production.md)
