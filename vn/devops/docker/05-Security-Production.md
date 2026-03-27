# Docker Security & Production

## Mục lục
1. [Non-Root User](#non-root-user)
2. [Image Security](#image-security)
3. [Secrets Management](#secrets-management)
4. [Health Checks](#health-checks)
5. [Logging & Monitoring](#logging--monitoring)
6. [Production Checklist](#production-checklist)

---

## Non-Root User

### Tại sao không chạy root?

Container mặc định chạy với **root**. Nếu attacker escape container → có root trên host. Chạy non-root giảm blast radius.

```dockerfile
# ✅ Node.js — user "node" có sẵn
FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --only=production
USER node
CMD ["node", "dist/main.js"]

# ✅ Custom user
FROM alpine
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -D appuser
COPY --chown=appuser:appgroup . /app
USER appuser

# ✅ Java — dùng numeric UID
FROM eclipse-temurin:21-jre-alpine
COPY app.jar /app/app.jar
USER 1001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

---

## Image Security

### Scan CVE

```bash
# Docker Scout (built-in)
docker scout cves my-app:1.0

# Trivy (open source)
trivy image my-app:1.0

# Trong CI/CD
docker build -t my-app:$CI_COMMIT_SHA .
trivy image --exit-code 1 --severity HIGH,CRITICAL my-app:$CI_COMMIT_SHA
```

### Base image best practices

```dockerfile
# ✅ Dùng Alpine (nhỏ, ít CVE)
FROM node:20-alpine

# ✅ Dùng specific version (không :latest)
FROM postgres:16.2-alpine

# ✅ Distroless (không shell, ít attack surface)
FROM gcr.io/distroless/nodejs20-debian12

# ❌ Không dùng :latest
FROM node:latest
```

### Filesystem readonly

```dockerfile
# Dockerfile
FROM node:20-alpine
RUN chmod -R a-w /app   # Make app readonly

# docker-compose.yml
services:
  api:
    read_only: true
    tmpfs:
      - /tmp
```

---

## Secrets Management

### Không lưu secrets trong image

```dockerfile
# ❌ KHÔNG BAO GIỜ
ENV DB_PASSWORD=my-secret-password
COPY .env /app/.env

# ✅ Truyền qua environment (runtime)
# docker run -e DB_PASSWORD=xxx my-app

# ✅ Docker secrets (Compose / Swarm)
# Đọc từ file /run/secrets/db_password
```

### Docker Compose secrets

```yaml
services:
  api:
    secrets:
      - db_password
      - jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    environment: JWT_SECRET    # Từ host env
```

### BuildKit secrets (build-time)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci
# Secret chỉ tồn tại trong build step, không nằm trong image
```

```bash
docker build --secret id=npmrc,src=.npmrc .
```

---

## Health Checks

### Trong Dockerfile

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Hoặc dùng curl
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

### Trong docker-compose.yml

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 5
```

---

## Logging & Monitoring

### Logging best practices

```yaml
services:
  api:
    logging:
      driver: json-file
      options:
        max-size: "10m"      # Max log file size
        max-file: "3"        # Keep 3 files

    # Hoặc gửi log tới centralized logging
    logging:
      driver: fluentd
      options:
        fluentd-address: "localhost:24224"
```

### Resource limits

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
        reservations:
          cpus: "0.5"
          memory: 256M
```

---

## Production Checklist

### Image
- [ ] Multi-stage build — tách build khỏi runtime
- [ ] Specific base image tag (không `:latest`)
- [ ] Alpine hoặc distroless base
- [ ] Scan CVE trước khi deploy (Trivy/Scout)
- [ ] .dockerignore đầy đủ

### Security
- [ ] Chạy **non-root** (`USER node` hoặc `USER 1001`)
- [ ] Không lưu secrets trong image
- [ ] Read-only filesystem (nếu có thể)
- [ ] Drop capabilities không cần thiết

### Runtime
- [ ] Health check configured
- [ ] Log rotation (max-size, max-file)
- [ ] Resource limits (CPU, memory)
- [ ] Restart policy (`unless-stopped`)
- [ ] Named volumes cho persistent data

### CI/CD
- [ ] Build trong CI, push lên registry (Harbor, ECR, GCR)
- [ ] Immutable tags (commit SHA hoặc semver, không `:latest`)
- [ ] Scan image trong pipeline → block nếu HIGH/CRITICAL
- [ ] Cache Docker layers trong CI

---

**Quay lại:** [README](./README.md)
