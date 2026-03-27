# Docker Compose

## Mục lục
1. [Docker Compose là gì?](#docker-compose-là-gì)
2. [docker-compose.yml cơ bản](#docker-composeyml-cơ-bản)
3. [Services, Networks, Volumes](#services-networks-volumes)
4. [Environment & Secrets](#environment--secrets)
5. [Ví dụ thực tế](#ví-dụ-thực-tế)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Docker Compose là gì?

**Docker Compose** = tool định nghĩa và chạy **multi-container** app. Thay vì `docker run` từng container, dùng **YAML file** mô tả toàn bộ stack → `docker compose up`.

```bash
docker compose up -d        # Start all services (detached)
docker compose down         # Stop and remove
docker compose logs -f      # Follow logs tất cả services
docker compose ps           # List services
docker compose build        # Build images
docker compose exec api sh  # Shell vào service "api"
```

---

## docker-compose.yml Cơ Bản

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## Services, Networks, Volumes

### Networks (tự động)

Docker Compose tự tạo network cho stack. Services gọi nhau bằng **tên service**:

```yaml
services:
  web:
    image: nginx
    depends_on: [api]
    # Gọi API: http://api:3000

  api:
    build: .
    # Gọi DB: postgres://db:5432
    # Gọi Redis: redis://cache:6379

  db:
    image: postgres:16-alpine

  cache:
    image: redis:7-alpine
```

### Custom networks

```yaml
services:
  frontend:
    networks: [frontend-net]
  api:
    networks: [frontend-net, backend-net]
  db:
    networks: [backend-net]

networks:
  frontend-net:
  backend-net:
```

### Volumes

```yaml
services:
  db:
    volumes:
      - pgdata:/var/lib/postgresql/data    # Named volume (persist)
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # Bind mount

  api:
    volumes:
      - ./src:/app/src                     # Bind mount (hot reload dev)
      - /app/node_modules                  # Anonymous volume (exclude)

volumes:
  pgdata:                                  # Named volume definition
```

---

## Environment & Secrets

### Environment variables

```yaml
services:
  api:
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgres://user:pass@db:5432/mydb

    # Hoặc dùng env_file:
    env_file:
      - .env
      - .env.production
```

### Docker secrets (Compose v2)

```yaml
services:
  api:
    secrets:
      - db_password
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## Ví Dụ Thực Tế

### Full-stack: React + Node.js + PostgreSQL + Redis

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on: [api]

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:3000"
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/appdb
      REDIS_URL: redis://cache:6379
      JWT_SECRET: my-jwt-secret
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    command: redis-server --maxmemory 128mb --maxmemory-policy allkeys-lru

  adminer:
    image: adminer
    ports:
      - "8081:8080"
    depends_on: [db]

volumes:
  pgdata:
```

### Dev mode (hot reload)

```yaml
# docker-compose.dev.yml
services:
  api:
    build:
      context: ./backend
      target: builder          # Dùng build stage (có devDeps)
    command: npm run dev       # Override CMD
    volumes:
      - ./backend/src:/app/src # Hot reload
      - /app/node_modules
    ports:
      - "3000:3000"
      - "9229:9229"           # Debug port
```

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

---

## Câu hỏi thường gặp

### depends_on đảm bảo gì?
- Chỉ đảm bảo **thứ tự start** container, KHÔNG đảm bảo service **ready**. Dùng `condition: service_healthy` + healthcheck.

### Compose v1 vs v2?
- v1: `docker-compose` (binary riêng, Python). v2: `docker compose` (plugin Go, tích hợp Docker CLI). Dùng v2.

### restart policy?
- `no`: không restart. `always`: luôn restart. `unless-stopped`: restart trừ khi bị stop thủ công. `on-failure`: restart khi exit code ≠ 0.

---

**Tiếp theo:** [04-Networking-Volumes.md](./04-Networking-Volumes.md)
