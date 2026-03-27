# Docker Fundamentals — Câu hỏi phỏng vấn

## Mục lục
1. [Docker là gì?](#docker-là-gì)
2. [Container vs Virtual Machine](#container-vs-virtual-machine)
3. [Kiến trúc Docker](#kiến-trúc-docker)
4. [Docker CLI cơ bản](#docker-cli-cơ-bản)
5. [Image và Container](#image-và-container)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Docker là gì?

**Docker** là nền tảng container hóa: đóng gói ứng dụng + dependencies vào **container** — chạy nhất quán trên mọi môi trường (dev, staging, production).

### Lợi ích chính

- **Consistency**: "Works on my machine" → works everywhere
- **Isolation**: Mỗi container tách biệt, không conflict dependencies
- **Lightweight**: Chia sẻ kernel OS, khởi động nhanh (giây vs phút cho VM)
- **Reproducible**: Dockerfile = recipe → build lại đúng image bất kỳ lúc nào
- **Scalable**: Container nhẹ, dễ scale ngang (K8s, Docker Swarm)

---

## Container vs Virtual Machine

| Tiêu chí | Container | Virtual Machine |
|----------|-----------|-----------------|
| **OS** | Chia sẻ kernel host OS | Mỗi VM có OS riêng |
| **Khởi động** | Giây | Phút |
| **Kích thước** | MB (10-200MB) | GB (1-10GB) |
| **Overhead** | Thấp | Cao (hypervisor + OS) |
| **Isolation** | Process-level (namespace, cgroup) | Hardware-level (hypervisor) |
| **Use case** | Microservices, CI/CD, dev env | Legacy app, full OS isolation |

```
┌──────────────────────────┐  ┌──────────────────────────┐
│ Container Architecture   │  │ VM Architecture          │
├──────────────────────────┤  ├──────────────────────────┤
│ App A │ App B │ App C    │  │ App A  │ App B  │ App C  │
│ Bins  │ Bins  │ Bins     │  │ Bins   │ Bins   │ Bins   │
├──────────────────────────┤  │ OS     │ OS     │ OS     │
│ Docker Engine            │  ├────────┴────────┴────────┤
├──────────────────────────┤  │ Hypervisor               │
│ Host OS                  │  ├──────────────────────────┤
├──────────────────────────┤  │ Host OS                  │
│ Infrastructure           │  ├──────────────────────────┤
└──────────────────────────┘  │ Infrastructure           │
                              └──────────────────────────┘
```

---

## Kiến trúc Docker

### Components

- **Docker Daemon** (`dockerd`): Quản lý containers, images, networks, volumes
- **Docker Client** (`docker`): CLI gửi lệnh đến daemon (API)
- **Docker Registry** (Docker Hub, Harbor): Lưu trữ và phân phối images
- **Image**: Template read-only, chứa app + dependencies + OS filesystem
- **Container**: Instance chạy được của image (read-write layer on top)
- **Dockerfile**: File text chứa instructions để build image

### Luồng hoạt động

```
Dockerfile → docker build → Image → docker run → Container
                              │
                              ├── docker push → Registry (Docker Hub, Harbor)
                              └── docker pull ← Registry
```

---

## Docker CLI Cơ Bản

### Image

```bash
# Build image từ Dockerfile
docker build -t my-app:1.0 .
docker build -t my-app:1.0 -f Dockerfile.prod .

# List images
docker images
docker image ls

# Pull image từ registry
docker pull nginx:alpine
docker pull node:20-alpine

# Push image lên registry
docker tag my-app:1.0 registry.example.com/my-app:1.0
docker push registry.example.com/my-app:1.0

# Xóa image
docker rmi my-app:1.0
docker image prune        # Xóa dangling images
docker image prune -a     # Xóa tất cả unused images
```

### Container

```bash
# Chạy container
docker run -d --name my-app -p 8080:3000 my-app:1.0
#   -d          : detached (chạy nền)
#   --name      : đặt tên container
#   -p 8080:3000: map host:container port

# List containers
docker ps           # đang chạy
docker ps -a        # tất cả (kể cả stopped)

# Logs
docker logs my-app
docker logs -f my-app      # follow (real-time)
docker logs --tail 100 my-app  # 100 dòng cuối

# Exec — chạy lệnh trong container
docker exec -it my-app sh        # shell vào container
docker exec my-app cat /app/config.json

# Stop / Remove
docker stop my-app
docker rm my-app
docker rm -f my-app    # force stop + remove

# Resource usage
docker stats
```

### Volumes & Networks

```bash
# Volume
docker volume create my-data
docker run -v my-data:/data my-app:1.0
docker run -v $(pwd)/config:/app/config:ro my-app:1.0  # bind mount (read-only)

# Network
docker network create my-network
docker run --network my-network --name web nginx
docker run --network my-network --name api my-app:1.0
# Containers cùng network gọi nhau bằng tên: http://api:3000
```

---

## Image và Container

### Image layers

Mỗi instruction trong Dockerfile tạo một **layer**. Layers được **cached** — nếu layer không đổi, Docker dùng cache.

```dockerfile
FROM node:20-alpine         # Layer 1: base image
WORKDIR /app                # Layer 2: set working dir
COPY package*.json ./       # Layer 3: copy package files
RUN npm ci                  # Layer 4: install deps (cached nếu package.json không đổi)
COPY . .                    # Layer 5: copy source code
RUN npm run build           # Layer 6: build
```

### Container lifecycle

```
Created → Running → Paused → Stopped → Removed
docker create → docker start → docker pause → docker stop → docker rm
```

---

## Câu hỏi thường gặp

### Docker image vs container?

- **Image**: Template read-only, như class trong OOP. Chứa app + deps.
- **Container**: Instance chạy được của image, như object. Có read-write layer riêng.
- Một image tạo được nhiều containers.

### `ENTRYPOINT` vs `CMD`?

- **ENTRYPOINT**: Lệnh cố định khi container start (ít bị override).
- **CMD**: Lệnh mặc định, dễ override khi `docker run ... <command>`.
- Thường: ENTRYPOINT = executable, CMD = default arguments.

### `COPY` vs `ADD`?

- **COPY**: Copy file/folder từ host vào image. Dùng **hầu hết**.
- **ADD**: Giống COPY + auto-extract tar + hỗ trợ URL. Dùng khi cần extract.
- Khuyến nghị: **luôn dùng COPY** trừ khi cần tính năng riêng của ADD.

### Port mặc định?

- Docker daemon: TCP **2375** (unencrypted), **2376** (TLS)
- Registry: **5000** (Docker Registry), **443** (Docker Hub)

---

**Tiếp theo:** [02-Dockerfile-Best-Practices.md](./02-Dockerfile-Best-Practices.md)
