# Dockerfile Best Practices

## Mục lục
1. [Dockerfile cơ bản](#dockerfile-cơ-bản)
2. [Multi-stage build](#multi-stage-build)
3. [Layer caching](#layer-caching)
4. [Giảm image size](#giảm-image-size)
5. [Best practices checklist](#best-practices-checklist)

---

## Dockerfile Cơ Bản

### Node.js (Express/NestJS)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Java (Spring Boot)

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## Multi-Stage Build

Tách build stage (có compiler, deps) khỏi runtime stage (chỉ có runtime + artifact). Giảm image size đáng kể.

### Node.js multi-stage

```dockerfile
# ========== Stage 1: Build ==========
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========== Stage 2: Runtime ==========
FROM node:20-alpine AS runtime
WORKDIR /app
# Chỉ copy production deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
# Copy build output từ stage 1
COPY --from=builder /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

### Java Spring Boot multi-stage

```dockerfile
# ========== Build ==========
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN ./mvnw dependency:resolve
COPY src ./src
RUN ./mvnw package -DskipTests

# ========== Runtime ==========
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
USER 1001
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Angular / React multi-stage

```dockerfile
# ========== Build ==========
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========== Serve ==========
FROM nginx:alpine
COPY --from=builder /app/dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## Layer Caching

### Nguyên tắc: ít thay đổi → lên trên

```dockerfile
# ✅ Tốt — COPY package.json trước → layer npm ci được cache
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./          # Layer 1: ít thay đổi
RUN npm ci                     # Layer 2: cached nếu package.json không đổi
COPY . .                       # Layer 3: thay đổi mỗi commit
RUN npm run build              # Layer 4: rebuild

# ❌ Xấu — mỗi thay đổi code → rebuild npm ci
FROM node:20-alpine
WORKDIR /app
COPY . .                       # Bất kỳ file nào đổi → invalidate layer sau
RUN npm ci                     # Luôn phải chạy lại
RUN npm run build
```

### .dockerignore

```
node_modules
dist
.git
.env
*.log
Dockerfile
docker-compose*.yml
.github
coverage
```

---

## Giảm Image Size

| Kỹ thuật | Tác dụng |
|----------|----------|
| **Alpine base** | `node:20-alpine` (~50MB) vs `node:20` (~350MB) |
| **Multi-stage** | Build stage không nằm trong final image |
| **npm ci --only=production** | Không install devDependencies |
| **.dockerignore** | Không copy node_modules, .git, ... |
| **Merge RUN** | `RUN apt-get update && apt-get install -y ... && rm -rf /var/lib/apt/lists/*` |
| **Distroless** | `gcr.io/distroless/nodejs20` — chỉ có runtime, không có shell |

---

## Best Practices Checklist

- [ ] Dùng **specific tag** (không dùng `:latest`): `node:20-alpine`, `nginx:1.25-alpine`
- [ ] Dùng **multi-stage build** — tách build khỏi runtime
- [ ] **COPY package.json trước** `COPY .` — tận dụng layer cache
- [ ] Dùng **.dockerignore** — loại node_modules, .git
- [ ] Chạy **non-root**: `USER node` hoặc `USER 1001`
- [ ] Dùng `npm ci` (không `npm install`) — deterministic, nhanh hơn
- [ ] **HEALTHCHECK** trong Dockerfile hoặc docker-compose
- [ ] **EXPOSE** đúng port
- [ ] Không lưu **secrets** trong image (dùng env, secrets mount)
- [ ] Base image **Alpine** hoặc **distroless** cho production

---

**Tiếp theo:** [03-Docker-Compose.md](./03-Docker-Compose.md)
