# Native Image - Từ Zero đến Master Quarkus

## Mục lục
1. [Tổng quan Native Image](#tổng-quan-native-image)
2. [GraalVM & Closed World Assumption](#graalvm--closed-world-assumption)
3. [Build Native Executable](#build-native-executable)
4. [Quarkus Build Process chi tiết](#quarkus-build-process-chi-tiết)
5. [Reflection & Dynamic Features](#reflection--dynamic-features)
6. [Resource Inclusion](#resource-inclusion)
7. [Serialization & JNI](#serialization--jni)
8. [Container Images](#container-images)
9. [Multi-stage Docker Build](#multi-stage-docker-build)
10. [Debugging Native Images](#debugging-native-images)
11. [Performance Comparison](#performance-comparison)
12. [PGO (Profile-Guided Optimization)](#pgo-profile-guided-optimization)
13. [Common Errors & Troubleshooting](#common-errors--troubleshooting)
14. [CI/CD cho Native Build](#cicd-cho-native-build)
15. [Native vs JVM - Khi nào dùng cái nào?](#native-vs-jvm---khi-nào-dùng-cái-nào)
16. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Tổng quan Native Image
Spring (Spring Native):

Vốn được thiết kế để chạy trên JVM, nên nhiều cơ chế của Spring dựa vào reflection và runtime scanning.

Khi build Native Image, Spring phải bổ sung thêm cấu hình, metadata để GraalVM biết trước những gì cần giữ lại.

Điều này khiến việc build native phức tạp hơn và đôi khi không tương thích với một số thư viện.

Quarkus:

Ngay từ đầu đã được thiết kế để tối ưu cho Native Image.

Thực hiện augmentation ở build time, ghi lại metadata, loại bỏ reflection và runtime scanning.

Nhờ vậy, quá trình build Native Image đơn giản hơn, startup nhanh hơn và footprint nhỏ hơn.

### Native Image là gì?

**GraalVM Native Image** là công nghệ **AOT (Ahead-of-Time)** compilation, biến ứng dụng Java thành **native executable** - file thực thi chạy trực tiếp trên OS mà **không cần JVM**.

```
┌─────────────────────────────────────────────────────────────┐
│                    JVM Mode (Truyền thống)                   │
│                                                              │
│  .java → .class → JVM load → Interpret → JIT compile → Run  │
│                                                              │
│  Startup: 2-5 giây | Memory: 150-300 MB | Cần cài JVM       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Native Image (AOT)                        │
│                                                              │
│  .java → .class → GraalVM AOT compile → native binary → Run │
│                                                              │
│  Startup: 10-100ms | Memory: 30-100 MB | KHÔNG cần JVM      │
└─────────────────────────────────────────────────────────────┘
```

### Tại sao cần Native Image?

| Use Case | Lý do |
| :--- | :--- |
| **Serverless (AWS Lambda, Azure Functions)** | Cold start phải < 1 giây, pay-per-invocation |
| **Kubernetes / Containers** | Image nhỏ hơn, startup nhanh → scale nhanh |
| **Microservices** | Hàng trăm services → tiết kiệm memory tổng thể |
| **CLI tools** | Chạy ngay lập tức, không chờ JVM warm up |
| **Edge computing / IoT** | Resource hạn chế (ít RAM, CPU yếu) |

---

## GraalVM & Closed World Assumption

### Closed World Assumption

Native Image dựa trên **Closed World Assumption** (Giả định thế giới đóng):

> **Tất cả code có thể chạy phải được biết TẠI THỜI ĐIỂM BUILD.**

Nghĩa là:
- **Không** dynamic class loading tại runtime
- **Không** reflection tự do (phải đăng ký trước)
- **Không** runtime bytecode generation
- **Không** JIT compilation

### Hệ quả

```
┌───────────────────────────────────────────┐
│          Reachability Analysis             │
│                                           │
│  GraalVM phân tích từ main() method       │
│  → Tìm tất cả class/method có thể gọi    │
│  → Loại bỏ code KHÔNG BAO GIỜ chạy       │
│  → Compile chỉ code CẦN THIẾT            │
│                                           │
│  Kết quả: Binary nhỏ hơn, nhanh hơn      │
│  Nhưng: Không chấp nhận dynamic features  │
└───────────────────────────────────────────┘
```

### Dynamic Features bị hạn chế

| Feature | JVM Mode | Native Image |
| :--- | :--- | :--- |
| **Reflection** | Tự do | Phải đăng ký trước |
| **Dynamic Proxy** | Tự do | Phải đăng ký trước |
| **Class.forName()** | OK | Phải đăng ký |
| **JNI** | OK | Phải đăng ký |
| **Serialization** | OK | Phải đăng ký |
| **Resources** | Auto-include | Phải khai báo |
| **Security Providers** | Auto-load | Phải đăng ký |

**Quarkus giải quyết 90% vấn đề này tại build-time!**

---

## Build Native Executable

### Cách 1: Local GraalVM

```bash
# ===== Bước 1: Cài GraalVM =====
# Dùng SDKMAN (khuyến nghị)
sdk install java 21.0.2-graalce  # GraalVM CE (Community Edition)
sdk use java 21.0.2-graalce

# Verify
java -version
# openjdk version "21.0.2" ... GraalVM CE
native-image --version
# GraalVM ...

# ===== Bước 2: Build =====
./mvnw package -Pnative

# Kết quả: target/quarkus-app-runner (native binary)
# Chạy:
./target/quarkus-app-runner
# Started in 0.025s ← 25 milliseconds!
```

### Cách 2: Container Build (Không cần GraalVM local)

```bash
# Build native image TRONG Docker container
# → Không cần cài GraalVM trên máy local
./mvnw package -Pnative -Dquarkus.native.container-build=true

# Custom builder image
./mvnw package -Pnative \
    -Dquarkus.native.container-build=true \
    -Dquarkus.native.builder-image=quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21
```

### Cách 3: Gradle

```bash
# Gradle
./gradlew build -Dquarkus.native.enabled=true
```

### Build Options

```properties
# application.properties

# ===== Build configuration =====
# Dùng container để build (không cần local GraalVM)
quarkus.native.container-build=true

# Builder image
quarkus.native.builder-image=quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21

# ===== Optimization =====
# Enable HTTPS support
quarkus.ssl.native=true

# Additional native arguments
quarkus.native.additional-build-args=-H:+ReportExceptionStackTraces

# ===== Debug =====
# Include debug symbols
quarkus.native.debug.enabled=true

# ===== Memory =====
# Max memory cho native build process
quarkus.native.native-image-xmx=8g
```

---

## Quarkus Build Process chi tiết

### Build-Time vs Runtime

```
┌────────────────────────── BUILD TIME ──────────────────────────┐
│                                                                 │
│  1. Classpath Scanning                                          │
│     → Scan tất cả annotations (@Entity, @Path, @Inject...)     │
│                                                                 │
│  2. Configuration Processing                                    │
│     → Đọc application.properties                                │
│     → Resolve config values                                     │
│                                                                 │
│  3. Bytecode Recording                                          │
│     → Generate bytecode thay thế cho reflection                 │
│     → Pre-create CDI beans metadata                             │
│                                                                 │
│  4. Dead Code Elimination                                       │
│     → Loại bỏ code không dùng                                   │
│                                                                 │
│  5. Static Initialization                                       │
│     → Init singletons, caches                                   │
│     → Serialize vào image heap                                  │
│                                                                 │
│  6. Native Image Compilation (GraalVM)                          │
│     → AOT compile → native binary                               │
│                                                                 │
└───────────────────────────────

```

### Runtime

```
┌────────────────────────── RUNTIME ─────────────────────────┐
│                                                              │
│  1. Load native binary (mmap)                                │
│     → Không cần class loading, bytecode verification         │
│                                                              │
│  2. Restore image heap                                       │
│     → Singletons, caches đã init sẵn                        │
│                                                              │
│  3. Execute main()                                           │
│     → Start HTTP server, connect DB                          │
│     → Tổng: 10-100ms (thay vì 2-5 giây trên JVM)           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Reflection & Dynamic Features

### Vấn đề

Native Image không hỗ trợ reflection tự do. Nếu code dùng `Class.forName()`, `Method.invoke()`, `Field.get()` → GraalVM **không biết** class nào cần giữ → runtime error.

### Quarkus giải quyết tự động

Quarkus extension (ArC, Hibernate, Jackson, etc.) **đăng ký reflection tự động** lúc build. Bạn **không cần** cấu hình cho:
- CDI beans (`@ApplicationScoped`, `@Inject`)
- JPA Entities (`@Entity`)
- JAX-RS Resources (`@Path`)
- Jackson/JSON-B serialization

### Khi cần đăng ký thủ công

Với thư viện third-party hoặc code custom dùng reflection:

```java
// Cách 1: @RegisterForReflection trên class
@RegisterForReflection
public class MyDTO {
    public String name;
    public int age;
}

// Cách 2: Đăng ký class khác (không sửa source)
@RegisterForReflection(targets = {
    ExternalLib.class,
    com.thirdparty.Response.class
})
public class ReflectionConfig {}

// Cách 3: Đăng ký cả package
@RegisterForReflection(targets = {}, classNames = {
    "com.thirdparty.model.User",
    "com.thirdparty.model.Order"
})
public class ReflectionConfig {}
```

### Cấu hình qua file JSON (GraalVM native)

```json
// src/main/resources/META-INF/native-image/reflect-config.json
[
  {
    "name": "com.example.ExternalDTO",
    "allDeclaredConstructors": true,
    "allPublicMethods": true,
    "allDeclaredFields": true
  }
]
```

### Dynamic Proxy

```java
// Đăng ký dynamic proxy
@RegisterForReflection(targets = {})
@io.quarkus.runtime.annotations.RegisterForProxy(targets = {
    MyInterface.class,
    AnotherInterface.class
})
public class ProxyConfig {}
```

---

## Resource Inclusion

Mặc định, Native Image **không include** tất cả resource files. Cần khai báo:

```properties
# application.properties
quarkus.native.resources.includes=META-INF/resources/**,templates/**,*.xml
quarkus.native.resources.excludes=**/test/**
```

```java
// Hoặc qua annotation
@RegisterForReflection
@io.quarkus.runtime.annotations.NativeImageResource("my-config.json")
public class ResourceConfig {}
```

### Các resource tự động include

Quarkus tự include:
- `application.properties` / `application.yaml`
- Files trong `META-INF/resources/` (static web resources)
- Hibernate `META-INF/persistence.xml`
- Qute templates (`src/main/resources/templates/`)

---

## Serialization & JNI

### Serialization

```properties
# Đăng ký class cho Java Serialization trong native
quarkus.native.additional-build-args=\
    --initialize-at-run-time=org.apache.kafka.common.security.authenticator.SaslClientAuthenticator,\
    -H:SerializationConfigurationFiles=serialization-config.json
```

```json
// serialization-config.json
[
  { "name": "com.example.MySerializableClass" },
  { "name": "java.util.ArrayList" }
]
```

### JNI (Java Native Interface)

```json
// jni-config.json
[
  {
    "name": "com.example.NativeLib",
    "methods": [
      { "name": "nativeMethod", "parameterTypes": ["int", "java.lang.String"] }
    ]
  }
]
```

---

## Container Images

### Quarkus tự build container image

```properties
# Dùng Jib (không cần Docker daemon)
quarkus.container-image.build=true
quarkus.container-image.builder=jib
quarkus.container-image.image=registry.example.com/my-app:latest
quarkus.container-image.push=true

# Hoặc Docker
quarkus.container-image.builder=docker
```

```bash
# Build image
./mvnw package -Dquarkus.container-image.build=true

# Build native image
./mvnw package -Pnative -Dquarkus.container-image.build=true
```

---

## Multi-stage Docker Build

### Native multi-stage (production-ready)

```dockerfile
# Stage 1: Build native
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build
WORKDIR /build
COPY --chown=quarkus:quarkus . .
RUN ./mvnw -B package -DskipTests -Pnative \
    -Dquarkus.native.native-image-xmx=8g

# Stage 2: Runtime (distroless-style, ~50MB)
FROM quay.io/quarkus/quarkus-micro-image:2.0
WORKDIR /work
COPY --from=build /build/target/*-runner /work/application
RUN chmod 775 /work
EXPOSE 8080
USER 1001
CMD ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

### JVM multi-stage (layered)

```dockerfile
# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build
COPY . .
RUN ./mvnw -B package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Layer 1: Dependencies (ít thay đổi)
COPY --from=build /build/target/quarkus-app/lib/ ./lib/
# Layer 2: App code (thay đổi thường xuyên)
COPY --from=build /build/target/quarkus-app/app/ ./app/
COPY --from=build /build/target/quarkus-app/quarkus/ ./quarkus/
COPY --from=build /build/target/quarkus-app/quarkus-run.jar ./

EXPOSE 8080
USER 1001
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "/app/quarkus-run.jar"]
```

---

## Debugging Native Images

### Build với debug info

```properties
quarkus.native.debug.enabled=true
quarkus.native.additional-build-args=-H:+ReportExceptionStackTraces
```

### Kiểm tra class nào được include

```bash
# Liệt kê tất cả classes trong native image
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=-H:+PrintAnalysisCallTree

# Report đầy đủ
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=-H:+DashboardAll
```

### GraalVM Dashboard

GraalVM Enterprise cung cấp **GraalVM Dashboard** (web UI) để xem:
- Code reach (class nào được include)
- Heap snapshot (object nào trong image heap)
- Compilation graph

---

## Performance Comparison

### Benchmark thực tế (Quarkus REST API + PostgreSQL)

| Metric | JVM (OpenJDK 21) | Native (GraalVM CE) | Native (Mandrel) |
| :--- | :--- | :--- | :--- |
| **Startup time** | 1.5-2.5s | 20-80ms | 15-60ms |
| **RSS Memory (idle)** | 150-250 MB | 30-80 MB | 25-70 MB |
| **RSS Memory (load)** | 300-500 MB | 80-150 MB | 70-130 MB |
| **Request latency (p50)** | 2-5ms | 3-8ms | 3-7ms |
| **Request latency (p99)** | 10-30ms | 15-40ms | 12-35ms |
| **Throughput (req/s, 100 concurrent)** | 15,000-25,000 | 10,000-18,000 | 11,000-19,000 |
| **Build time** | 5-15s | 3-10 min | 2-8 min |
| **Binary size** | ~20 MB (JAR) | 50-100 MB | 45-90 MB |

### Nhận xét

- **Startup & Memory**: Native thắng áp đảo (10-50x nhanh hơn, 3-5x ít memory hơn).
- **Throughput lâu dài**: JVM có thể **nhanh hơn** sau vài phút nhờ JIT (C2 compiler tối ưu hot paths). Native không có JIT.
- **Latency tail (p99)**: JVM có thể có GC pause spikes; Native GC (Serial/G1) cũng pause nhưng trên dataset nhỏ hơn.

---

## PGO (Profile-Guided Optimization)

### PGO là gì?

**Profile-Guided Optimization** (GraalVM Enterprise/Oracle GraalVM) cho phép:
1. Build native image **lần 1** (instrumented)
2. Chạy workload thực tế → thu thập profile data
3. Build native image **lần 2** với profile → GraalVM tối ưu dựa trên dữ liệu thật

### Kết quả

- Throughput tăng **15-30%** so với native không PGO
- Latency giảm **10-20%**
- Gần bằng JVM throughput sau JIT warmup

### Cách dùng

```bash
# Bước 1: Build instrumented binary
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=--pgo-instrument

# Bước 2: Chạy workload
./target/*-runner
# Gửi traffic thực tế (wrk, hey, vegeta)
wrk -t4 -c100 -d60s http://localhost:8080/api/products
# Dừng app → file default.iprof được tạo

# Bước 3: Build optimized binary
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=--pgo=default.iprof
```

---

## Common Errors & Troubleshooting

### 1. ClassNotFoundException / NoSuchMethodException

**Nguyên nhân**: Class hoặc method bị GraalVM loại bỏ (không đăng ký reflection).

```java
// Fix: Thêm @RegisterForReflection
@RegisterForReflection
public class MyDTO { ... }
```

### 2. UnsupportedFeatureError: Proxy class defined by interfaces

```java
// Fix: Đăng ký proxy
@RegisterForReflection
@io.quarkus.runtime.annotations.RegisterForProxy(targets = { MyInterface.class })
public class ProxyConfig {}
```

### 3. Substitution required for XXX

**Nguyên nhân**: Class dùng feature không hỗ trợ native (ví dụ: AWT, Swing).

```properties
# Fix: Exclude hoặc substitute
quarkus.native.additional-build-args=\
    --initialize-at-run-time=java.awt
```

### 4. Build chậm / hết memory

```properties
# Tăng memory cho build
quarkus.native.native-image-xmx=8g

# Dùng container build (tránh ảnh hưởng máy local)
quarkus.native.container-build=true
```

### 5. Test pass trên JVM nhưng fail trên Native

```bash
# Chạy test trên native executable
./mvnw verify -Pnative
# Dùng @QuarkusIntegrationTest thay vì @QuarkusTest
```

---

## CI/CD cho Native Build

### GitHub Actions

```yaml
name: Native Build
on: [push]
jobs:
  native:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup GraalVM
        uses: graalvm/setup-graalvm@v1
        with:
          java-version: '21'
          distribution: 'graalce'

      - name: Build native
        run: ./mvnw package -Pnative -DskipTests

      - name: Test native
        run: ./mvnw verify -Pnative

      - name: Build container
        run: |
          docker build -f src/main/docker/Dockerfile.native \
            -t my-app:${{ github.sha }} .
```

### Container-based build (không cần GraalVM trên CI)

```yaml
      - name: Build native in container
        run: |
          ./mvnw package -Pnative \
            -Dquarkus.native.container-build=true \
            -Dquarkus.native.builder-image=quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21
```

### Caching

```yaml
      - name: Cache Maven
        uses: actions/cache@v3
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
```

---

## Native vs JVM - Khi nào dùng cái nào?

| Tiêu chí | ✅ Native | ✅ JVM |
| :--- | :--- | :--- |
| **Startup** | 10-100ms | 1-5 giây |
| **Memory** | 30-100 MB | 150-500 MB |
| **Throughput lâu dài** | Tốt nhưng không tối ưu theo thời gian | Tốt hơn nhờ JIT (sau warmup) |
| **Build time** | 3-10 phút | 5-15 giây |
| **Debugging** | Khó (hạn chế) | Dễ (full JVM tools) |
| **Reflection** | Phải đăng ký | Tự do |
| **Third-party libs** | Có thể không tương thích | Tương thích tốt |

### Dùng Native khi

- **Serverless / FaaS**: Cold start phải < 1 giây
- **Kubernetes scale-to-zero**: Startup nhanh để scale nhanh
- **CLI tools**: Chạy ngay, không chờ JVM
- **Edge / IoT**: Resource hạn chế
- **Nhiều microservices**: Tiết kiệm memory tổng thể

### Dùng JVM khi

- **Long-running services**: JIT tối ưu throughput tốt hơn
- **Complex dependencies**: Nhiều lib reflection-heavy
- **Development / staging**: Build nhanh, debug dễ
- **CPU-bound**: JIT optimize hot loops tốt hơn
- **Team chưa quen**: JVM an toàn hơn, ít surprises

### Hybrid approach

```properties
# Dev & Test: JVM (nhanh, debug dễ)
%dev.quarkus.package.type=fast-jar
%test.quarkus.package.type=fast-jar

# Production: Native (startup nhanh, ít memory)
%prod.quarkus.package.type=native
```

---

## Câu hỏi thường gặp

**Q1: Native build mất bao lâu?**
3-10 phút tùy project size và RAM. CI/CD nên cache Maven dependencies. Container build có thể nhanh hơn nếu dùng image có sẵn GraalVM.

**Q2: Có cần GraalVM trên máy local không?**
Không bắt buộc. Dùng `quarkus.native.container-build=true` để build trong Docker container (cần Docker).

**Q3: Tất cả extensions đều hỗ trợ native không?**
Hầu hết extension chính thức (Quarkus Platform) đều hỗ trợ. Check: `quarkus extension list` → cột "Native". Extension community có thể không hỗ trợ.

**Q4: Native có nhanh hơn JVM không?**
Startup: Có (10-50x). Throughput lâu dài: Không nhất thiết — JVM JIT có thể nhanh hơn 10-30% sau warmup. Memory: Native luôn ít hơn 3-5x.

**Q5: PGO có đáng dùng không?**
Nếu throughput quan trọng hơn startup → PGO rất đáng. Tăng 15-30% throughput, gần bằng JVM. Cần GraalVM Enterprise/Oracle GraalVM.

---

## Tổng kết

- **Native Image**: AOT compilation → binary chạy không cần JVM
- **Closed World**: Tất cả code phải biết lúc build; Quarkus giải quyết 90%
- **Reflection**: Dùng `@RegisterForReflection` cho class custom
- **Build**: Local GraalVM hoặc container build; CI/CD dùng container
- **Performance**: Startup 10-100ms, memory 30-100MB; throughput thua JVM 10-20%
- **PGO**: Profile-guided optimization cho native gần bằng JVM throughput
- **Chọn Native vs JVM**: Native cho serverless/scale-to-zero; JVM cho long-running/complex
