# Build & Containerization - Quarkus

## Mục lục
1. [Fast-jar structure](#fast-jar-structure)
2. [Layered builds (JAR)](#layered-builds-jar)
3. [Dockerfile JVM](#dockerfile-jvm)
4. [Dockerfile Native](#dockerfile-native)
5. [Image size & runtime optimization](#image-size--runtime-optimization)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Fast-jar structure

Quarkus mặc định build ra **fast-jar** (quarkus.package.type=fast-jar): cấu trúc thư mục tối ưu cho **startup nhanh** thay vì một file JAR đơn lẻ.

### Cấu trúc thư mục

```
target/quarkus-app/
├── quarkus-run.jar          # Bootstrap jar (main, Quarkus runtime)
├── app/                      # Application classes & resources
│   ├── *.jar
│   └── ...
├── lib/                      # Dependencies (many jars)
│   ├── main/
│   └── ...
└── quarkus/                  # Quarkus generated (bytecode, config)
    ├── generated-bytecode.jar
    └── ...
```

### Tại sao fast-jar?

- **Class loading**: JVM chỉ load class khi cần; với nhiều JAR nhỏ, class loader tìm nhanh hơn so với một uber-jar lớn.
- **Dev mode**: Hot reload chỉ copy thay đổi vào `app/` thay vì đóng gói lại toàn bộ.
- **Layered builds**: Có thể tách `lib/` và `app/` thành layers Docker riêng → cache layer tốt hơn.

### So với uber-jar

```properties
# Mặc định: fast-jar
quarkus.package.type=fast-jar

# Uber-jar (một file duy nhất, dễ deploy nhưng startup có thể chậm hơn)
quarkus.package.type=uber-jar
```

---

## Layered builds (JAR)

**Layered JAR** tách nội dung thành các layer: layer chứa dependency ít thay đổi, layer chứa code app thay đổi thường xuyên → Docker build cache hiệu quả.

### Bật layered build

```properties
quarkus.package.type=fast-jar
quarkus.package.jar.layered=true
```

### Cấu trúc layer (trong quarkus-app)

- **Layer 1**: Dependencies (lib/) — thay đổi ít.
- **Layer 2**: Application (app/, quarkus-run.jar, quarkus/) — thay đổi mỗi lần build code.

Dockerfile có thể COPY từng layer riêng; khi chỉ sửa code, chỉ layer app bị invalidate.

---

## Dockerfile JVM

Build image chạy trên JVM (OpenJDK).

### Single-stage

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/quarkus-app/lib/ /app/lib/
COPY target/quarkus-app/app/ /app/app/
COPY target/quarkus-app/quarkus/ /app/quarkus/
COPY target/quarkus-app/quarkus-run.jar /app/

EXPOSE 8080
USER 185
ENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]
```

### Multi-stage (build trong Docker)

```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw -B package -DskipTests -Dquarkus.package.type=fast-jar

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /build/target/quarkus-app/lib/ /app/lib/
COPY --from=build /build/target/quarkus-app/app/ /app/app/
COPY --from=build /build/target/quarkus-app/quarkus/ /app/quarkus/
COPY --from=build /build/target/quarkus-app/quarkus-run.jar /app/

EXPOSE 8080
USER 185
ENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]
```

### Layered Docker build (copy từng layer)

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/quarkus-app/lib/ /app/lib/
COPY target/quarkus-app/quarkus-run.jar /app/
COPY target/quarkus-app/app/ /app/app/
COPY target/quarkus-app/quarkus/ /app/quarkus/
# Thứ tự COPY: layer ít thay đổi trước → cache tốt
EXPOSE 8080
USER 185
ENTRYPOINT ["java", "-jar", "/app/quarkus-run.jar"]
```

### Quarkus generated Dockerfile

Quarkus có thể generate sẵn Dockerfile:

```bash
./mvnw package
# Tạo Dockerfile.jvm (và Dockerfile.native nếu build native)
```

File nằm trong `target/` hoặc `src/main/docker/`. Có thể copy vào project và chỉnh sửa.

---

## Dockerfile Native

Chạy native executable (không cần JVM).

### Build native trong Docker

```dockerfile
# Stage 1: Build native
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build
WORKDIR /build
COPY --chown=quarkus:quarkus mvnw .
COPY --chown=quarkus:quarkus .mvn .mvn
COPY --chown=quarkus:quarkus pom.xml .
COPY --chown=quarkus:quarkus src src
RUN ./mvnw -B package -DskipTests -Pnative -Dquarkus.native.container-build=true

# Stage 2: Runtime (minimal)
FROM quay.io/quarkus/quarkus-micro-image:2.0
WORKDIR /work
COPY --from=build /build/target/*-runner /work/application
RUN chmod 775 /work
EXPOSE 8080
USER 1001
ENTRYPOINT ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

**quarkus-micro-image**: Image rất nhỏ (distroless-style), chỉ chứa native binary và libc.

### Chạy local

```bash
# Build native (cần GraalVM hoặc container)
./mvnw package -Pnative -Dquarkus.native.container-build=true

# Build image
docker build -f src/main/docker/Dockerfile.native -t myapp:native .
docker run -p 8080:8080 myapp:native
```

---

## Image size & runtime optimization

### So sánh kích thước

| Package | Image base | Kích thước ước lượng |
| :--- | :--- | :--- |
| **JVM (Alpine)** | eclipse-temurin:21-jre-alpine | ~200–300 MB |
| **JVM (distroless)** | gcr.io/distroless/java21 | ~250 MB+ |
| **Native** | quarkus-micro-image | ~50–100 MB |

### Runtime optimization (JVM)

```dockerfile
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/quarkus-run.jar"]
```

- **UseContainerSupport**: JVM đọc memory limit từ container (cgroup).
- **MaxRAMPercentage / InitialRAMPercentage**: Tránh set -Xmx cố định; thích ứng theo container memory.

### Native

- Không cần JAVA_OPTS; memory do OS quản lý.
- Startup rất nhanh → phù hợp scale-to-zero (Knative, Lambda).

---

## Câu hỏi thường gặp

### Q1: Fast-jar vs uber-jar?

- **Fast-jar**: Nhiều file, startup tối ưu, phù hợp container + layered build.
- **Uber-jar**: Một file, dễ copy/deploy đơn giản; phù hợp khi không dùng Docker hoặc tool chỉ nhận 1 JAR.

### Q2: Khi nào dùng JVM image vs Native image?

- **JVM**: Tương thích tốt hơn (reflection, JNI), debug dễ, throughput lâu dài có thể tốt hơn (JIT). Phù hợp microservice chạy lâu.
- **Native**: Startup nhanh, memory thấp; phù hợp serverless, scale-to-zero, số instance rất nhiều.

### Q3: Layered build có bắt buộc không?

- Không. Bật khi dùng Docker và muốn tận dụng cache: chỉ layer app thay đổi khi sửa code, layer lib giữ nguyên.

---

## Tổng kết

- **Fast-jar**: Cấu trúc thư mục tối ưu startup; **layered** = tách layer cho Docker cache.
- **Dockerfile JVM**: Multi-stage build, copy `lib/`, `app/`, `quarkus/`, `quarkus-run.jar`.
- **Dockerfile Native**: Build trong container (Mandrel), runtime image nhỏ (quarkus-micro-image).
- **Optimization**: JVM dùng MaxRAMPercentage; Native ưu tiên khi cần startup nhanh và memory thấp.
