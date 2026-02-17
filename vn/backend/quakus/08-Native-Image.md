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
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────── RUNTIME ─────────────────────────────┐
│                                                                 │
│  1. Load pre-initialized data (từ image heap)                   │
│  2. Start HTTP server                                           │
│  3. Accept requests                                             │
│                                                                 │
│  → Không cần: classpath scan, annotation processing,            │
│    config parsing, bytecode generation                          │
│  → Startup cực nhanh!                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Quarkus Extension Build Steps

```java
// Quarkus extension có 2 phần:
// 1. Deployment module (chạy lúc build)
// 2. Runtime module (chạy lúc runtime)

// ===== Deployment: Build Step =====
@BuildStep
void registerReflection(BuildProducer<ReflectiveClassBuildItem> reflective) {
    // Đăng ký class cho reflection (tự động, không cần dev làm)
    reflective.produce(new ReflectiveClassBuildItem(true, true, MyDto.class));
}

@BuildStep
void processEntities(CombinedIndexBuildItem index,
                     BuildProducer<AdditionalBeanBuildItem> beans) {
    // Scan và đăng ký beans tại build-time
}

// Kết quả: Dev KHÔNG CẦN cấu hình reflection thủ công
// cho hầu hết trường hợp khi dùng Quarkus extensions
```

---

## Reflection & Dynamic Features

### @RegisterForReflection

```java
// Khi DTO/POJO cần serialization nhưng không được Quarkus tự detect:
@RegisterForReflection  // Đăng ký class này cho reflection
public class ExternalApiResponse {
    public String status;
    public String message;
    public Map<String, Object> data;
}

// Đăng ký class từ thư viện bên ngoài
@RegisterForReflection(targets = {
    com.external.lib.ResponseDto.class,
    com.external.lib.ErrorDto.class
})
public class ReflectionConfig {
    // Class này chỉ dùng để khai báo, không có logic
}

// Đăng ký cả field và method
@RegisterForReflection(
    fields = true,   // Cho phép access fields qua reflection
    methods = true    // Cho phép access methods qua reflection
)
public class DetailedDto { }

// Đăng ký nguyên package
@RegisterForReflection(
    targets = {},
    classNames = {"com.external.lib.dto.*"}  // Wildcard (nếu hỗ trợ)
)
public class PackageReflectionConfig { }
```

### reflection-config.json (Manual)

```json
// src/main/resources/META-INF/native-image/reflect-config.json
[
    {
        "name": "com.example.dto.ExternalResponse",
        "allDeclaredFields": true,
        "allDeclaredMethods": true,
        "allDeclaredConstructors": true
    },
    {
        "name": "com.example.dto.ErrorResponse",
        "methods": [
            { "name": "getMessage", "parameterTypes": [] },
            { "name": "getCode", "parameterTypes": [] }
        ]
    }
]
```

### Dynamic Proxy

```java
// proxy-config.json
// src/main/resources/META-INF/native-image/proxy-config.json
[
    {
        "interfaces": [
            "com.example.service.UserService",
            "java.io.Serializable"
        ]
    }
]
```

### GraalVM Tracing Agent

```bash
# Chạy app trên JVM với tracing agent để TỰ ĐỘNG detect reflection usage
java -agentlib:native-image-agent=config-output-dir=src/main/resources/META-INF/native-image \
     -jar target/quarkus-app/quarkus-run.jar

# Thực hiện các operation (call API, run tests...)
# Agent sẽ ghi lại tất cả reflection, proxy, JNI, resource access
# → Tạo file config tự động:
#   reflect-config.json
#   proxy-config.json
#   jni-config.json
#   resource-config.json
#   serialization-config.json

# Merge nhiều lần chạy
java -agentlib:native-image-agent=config-merge-dir=src/main/resources/META-INF/native-image \
     -jar target/quarkus-app/quarkus-run.jar
```

---

## Resource Inclusion

### Mặc định

```
Native image KHÔNG include resource files tự động.
Quarkus extensions đã xử lý cho:
- application.properties
- META-INF/resources/* (static files)
- Hibernate mapping files
- Flyway migrations

Nhưng custom resources cần khai báo:
```

### Cấu hình

```properties
# application.properties

# Include resource files
quarkus.native.resources.includes=templates/**,i18n/**,docs/*.pdf

# Exclude resources (giảm binary size)
quarkus.native.resources.excludes=**/*.md,**/test-data/**
```

### resource-config.json (Manual)

```json
// src/main/resources/META-INF/native-image/resource-config.json
{
    "resources": {
        "includes": [
            { "pattern": "templates/.*" },
            { "pattern": "i18n/messages.*\\.properties" },
            { "pattern": "META-INF/services/.*" }
        ],
        "excludes": [
            { "pattern": "META-INF/maven/.*" }
        ]
    },
    "bundles": [
        { "name": "messages", "locales": ["en", "vi"] }
    ]
}
```

---

## Serialization & JNI

### Serialization Registration

```java
// Nếu dùng Java Serialization (ObjectInputStream/ObjectOutputStream)
@RegisterForReflection(serialization = true)
public class CacheEntry implements Serializable {
    private String key;
    private Object value;
}
```

```json
// serialization-config.json
[
    {
        "name": "com.example.CacheEntry",
        "allDeclaredFields": true,
        "allDeclaredMethods": true,
        "allPublicMethods": true
    }
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

### Quarkus Container Image Extensions

```xml
<!-- Jib (Không cần Docker daemon!) -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-container-image-jib</artifactId>
</dependency>

<!-- Hoặc Docker (cần Docker daemon) -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-container-image-docker</artifactId>
</dependency>

<!-- Hoặc Buildpack -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-container-image-buildpack</artifactId>
</dependency>
```

```properties
# application.properties

# Image config
quarkus.container-image.build=true
quarkus.container-image.push=true
quarkus.container-image.registry=docker.io
quarkus.container-image.group=mycompany
quarkus.container-image.name=my-app
quarkus.container-image.tag=1.0.0

# JVM image
quarkus.container-image.jvm.base-image=eclipse-temurin:21-jre-alpine

# Native image
quarkus.container-image.native.base-image=quay.io/quarkus/quarkus-micro-image:2.0
```

```bash
# Build JVM container image
./mvnw package -Dquarkus.container-image.build=true

# Build Native container image
./mvnw package -Pnative -Dquarkus.container-image.build=true
```

### Image Size Comparison

| Image Type | Approximate Size |
| :--- | :--- |
| JVM (full JDK) | ~400-500 MB |
| JVM (JRE Alpine) | ~200-300 MB |
| Native (UBI) | ~100-150 MB |
| Native (distroless/micro) | ~50-80 MB |
| Native (scratch/static) | ~30-50 MB |

---

## Multi-stage Docker Build

### Dockerfile cho JVM Mode

```dockerfile
# ===== Stage 1: Build =====
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Security: Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/quarkus-app/ ./

EXPOSE 8080
ENV JAVA_OPTS="-Xms64m -Xmx256m"

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]
```

### Dockerfile cho Native Mode

```dockerfile
# ===== Stage 1: Build Native =====
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build
WORKDIR /app
COPY --chown=quarkus:quarkus pom.xml .
COPY --chown=quarkus:quarkus src ./src
COPY --chown=quarkus:quarkus mvnw .
COPY --chown=quarkus:quarkus .mvn .mvn

USER quarkus
RUN ./mvnw package -Pnative -DskipTests -B

# ===== Stage 2: Runtime (Ultra-minimal) =====
FROM quay.io/quarkus/quarkus-micro-image:2.0
WORKDIR /app

COPY --from=build /app/target/*-runner /app/application

# Security
RUN chmod +x /app/application

EXPOSE 8080

ENTRYPOINT ["./application", "-Dquarkus.http.host=0.0.0.0"]
```

### Distroless (Minimal attack surface)

```dockerfile
# Native binary + distroless = siêu nhẹ, siêu bảo mật
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -Pnative -DskipTests \
    -Dquarkus.native.additional-build-args="--static","--libc=musl"

# Scratch image (chỉ chứa binary, không có shell)
FROM scratch
COPY --from=build /app/target/*-runner /application
EXPOSE 8080
ENTRYPOINT ["/application", "-Dquarkus.http.host=0.0.0.0"]
```

---

## Debugging Native Images

### Build-time Errors

```bash
# Verbose build output
./mvnw package -Pnative -Dquarkus.native.additional-build-args=-H:+ReportExceptionStackTraces

# Build report (HTML)
./mvnw package -Pnative -Dquarkus.native.additional-build-args=-H:+DashboardAll
# Mở: target/*-runner.bgv (GraalVM Dashboard)
```

### Runtime Errors

```bash
# Chạy với debug flags
./target/quarkus-app-runner \
    -Dquarkus.log.level=DEBUG \
    -Dquarkus.log.category."io.quarkus".level=TRACE

# Nếu lỗi reflection
# → Chạy trên JVM với tracing agent (xem mục GraalVM Tracing Agent ở trên)
# → Thêm class vào @RegisterForReflection
```

### GDB Debugging (Advanced)

```bash
# Build với debug symbols
./mvnw package -Pnative -Dquarkus.native.debug.enabled=true

# Debug với GDB
gdb ./target/quarkus-app-runner
(gdb) break com.example.UserService::findById
(gdb) run
```

---

## Performance Comparison

### Startup Time

| Mode | REST API đơn giản | REST + DB + Kafka |
| :--- | :--- | :--- |
| **JVM (cold)** | 1.5 - 3s | 3 - 8s |
| **JVM (warm, CDS)** | 0.8 - 1.5s | 2 - 5s |
| **Native** | 0.010 - 0.050s | 0.030 - 0.100s |
| **Improvement** | **30-100x** | **30-80x** |

### Memory Usage (RSS)

| Mode | REST API đơn giản | REST + DB + Kafka |
| :--- | :--- | :--- |
| **JVM** | 120 - 200 MB | 200 - 400 MB |
| **Native** | 20 - 40 MB | 40 - 80 MB |
| **Improvement** | **3-5x less** | **3-5x less** |

### Throughput (Requests/sec)

| Mode | Short-lived (< 1 min) | Long-running (> 10 min) |
| :--- | :--- | :--- |
| **JVM (cold)** | Thấp (JIT warming up) | Rất cao (JIT optimized) |
| **JVM (warm)** | Cao | **Rất cao** |
| **Native** | **Cao ngay lập tức** | Cao (nhưng < JVM warm) |

> **Quan trọng**: Với long-running services, JVM có JIT compiler tối ưu hot path → throughput cao hơn native. Native win ở startup + memory.

### Build Time

| Mode | Thời gian | Memory cần |
| :--- | :--- | :--- |
| **JVM** | 10 - 30s | 1 - 2 GB |
| **Native** | 2 - 10 min | 4 - 8 GB |

---

## PGO (Profile-Guided Optimization)

### PGO là gì?

**Profile-Guided Optimization** sử dụng data từ việc chạy thực tế để tối ưu native binary.

```bash
# ===== Bước 1: Build instrumented binary =====
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=--pgo-instrument

# ===== Bước 2: Chạy instrumented binary với load thực tế =====
./target/quarkus-app-runner
# Gửi traffic thực tế (hoặc load test)
# → Tạo file: default.iprof

# ===== Bước 3: Build optimized binary =====
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args=--pgo=default.iprof

# Kết quả: Binary tối ưu hơn 10-30% throughput
```

### Khi nào dùng PGO?

- Performance-critical services
- High-traffic APIs
- Khi đã tối ưu hết code-level, cần thêm improvement
- CI/CD có thể chạy load test automated

---

## Common Errors & Troubleshooting

### 1. ClassNotFoundException / NoSuchMethodException tại runtime

```
Error: com.example.dto.Response cannot be reflected
```

**Nguyên nhân**: Class không được đăng ký cho reflection.

**Fix**:
```java
@RegisterForReflection
public class Response { }
```

### 2. Resource not found

```
FileNotFoundException: templates/email.html
```

**Nguyên nhân**: Resource file không được include vào native binary.

**Fix**:
```properties
quarkus.native.resources.includes=templates/**
```

### 3. SSL/TLS errors

```
SSLHandshakeException: No appropriate protocol
```

**Nguyên nhân**: SSL không được enable trong native image.

**Fix**:
```properties
quarkus.ssl.native=true
```

### 4. OutOfMemoryError khi build

```
Error: Image build request failed with exit status 137
```

**Nguyên nhân**: Không đủ memory cho build process (cần 4-8 GB).

**Fix**:
```properties
quarkus.native.native-image-xmx=8g
```

```bash
# Docker: tăng memory limit
docker build --memory=8g .
```

### 5. Serialization issues

```
UnsupportedFeatureException: ObjectOutputStream.writeObject not supported
```

**Fix**:
```java
@RegisterForReflection(serialization = true)
public class MyCacheObject implements Serializable { }
```

### 6. Dynamic Proxy errors

```
Error: No proxy class defined for interface com.example.MyInterface
```

**Fix**:
```properties
quarkus.native.additional-build-args=\
    -H:DynamicProxyConfigurationFiles=proxy-config.json
```

### Troubleshooting Checklist

| # | Check | Action |
| :--- | :--- | :--- |
| 1 | Tất cả DTOs có `@RegisterForReflection`? | Thêm annotation |
| 2 | Custom resources included? | Config `quarkus.native.resources.includes` |
| 3 | SSL cần thiết? | `quarkus.ssl.native=true` |
| 4 | Build memory đủ? | `quarkus.native.native-image-xmx=8g` |
| 5 | 3rd-party library compatible? | Check Quarkus extensions hoặc dùng tracing agent |
| 6 | Chạy test native? | `./mvnw verify -Pnative` |
| 7 | Tracing agent đã chạy? | Dùng agent để detect dynamic features |

---

## CI/CD cho Native Build

### GitHub Actions

```yaml
# .github/workflows/native-build.yml
name: Native Build & Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  native-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup GraalVM
        uses: graalvm/setup-graalvm@v1
        with:
          java-version: '21'
          distribution: 'graalvm-community'

      - name: Cache Maven
        uses: actions/cache@v3
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}

      - name: Build Native
        run: ./mvnw package -Pnative -DskipTests -B

      - name: Test Native
        run: ./mvnw verify -Pnative -B

      - name: Build Container Image
        run: |
          docker build -f src/main/docker/Dockerfile.native-micro \
            -t myapp:native .

      - name: Push Image
        run: |
          docker tag myapp:native ghcr.io/${{ github.repository }}:native
          docker push ghcr.io/${{ github.repository }}:native

  # Hoặc dùng container build (không cần GraalVM setup)
  native-container-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Build Native (in container)
        run: ./mvnw package -Pnative -Dquarkus.native.container-build=true -DskipTests -B
```

### GitLab CI

```yaml
# .gitlab-ci.yml
native-build:
  image: quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21
  stage: build
  script:
    - ./mvnw package -Pnative -DskipTests -B
  artifacts:
    paths:
      - target/*-runner
  tags:
    - docker
  variables:
    MAVEN_OPTS: "-Xmx4g"
```

---

## Native vs JVM - Khi nào dùng cái nào?

### Decision Matrix

| Tiêu chí | Native | JVM |
| :--- | :--- | :--- |
| **Startup time quan trọng** | ✅ Win | ❌ |
| **Memory hạn chế** | ✅ Win | ❌ |
| **Serverless / FaaS** | ✅ Win | ❌ |
| **Long-running service** | ❌ | ✅ Win (JIT) |
| **Peak throughput** | ❌ | ✅ Win |
| **Build time** | ❌ Chậm (2-10 min) | ✅ Nhanh (10-30s) |
| **Dynamic features** | ❌ Hạn chế | ✅ Tự do |
| **Debug** | ❌ Khó hơn | ✅ Dễ |
| **3rd-party libs** | ❌ Có thể incompatible | ✅ Tất cả |
| **CI/CD resources** | ❌ Cần nhiều RAM | ✅ Ít |

### Khuyến nghị

```
Dùng NATIVE khi:
├── Serverless (AWS Lambda, Azure Functions, Cloud Run)
├── CLI tools
├── Short-lived processes
├── Container density quan trọng (1000+ pods)
└── Startup time < 1 giây là requirement

Dùng JVM khi:
├── Long-running services (web server chạy 24/7)
├── Cần dynamic features (plugin system, scripting)
├── 3rd-party library không compatible native
├── Peak throughput quan trọng hơn startup
└── Team không quen native debugging

Hybrid approach (khuyến nghị):
├── Dev/Test: JVM (build nhanh, debug dễ)
├── Staging: JVM + Native (test cả 2)
└── Production: Tùy service
    ├── API Gateway, Auth service: Native (nhiều instance, startup nhanh)
    └── Core business service: JVM (throughput cao, chạy lâu dài)
```

---

## Câu hỏi thường gặp

### Q1: Quarkus xử lý reflection thế nào cho Native Image?

- **Quarkus extensions** tự động đăng ký reflection cho các class liên quan (Entity, DTO, CDI beans...)
- Build-time: Quarkus scan annotations → Generate reflection config
- Dev chỉ cần `@RegisterForReflection` cho class **không** được extension quản lý (VD: DTO dùng với 3rd-party lib)
- **Rule**: Nếu dùng Quarkus extension → 99% không cần cấu hình thủ công

### Q2: Tại sao native build chậm?

- **AOT analysis**: Phân tích toàn bộ code reachable (DFS từ main())
- **Optimization**: Inline, dead code elimination, partial evaluation
- **Binary generation**: Tạo machine code cho target OS/arch
- **Tip**: Dùng container build + CI/CD, dev local dùng JVM mode

### Q3: Native Image có hỗ trợ tất cả Java libraries không?

- **Không**. Libraries dùng reflection, dynamic proxy, bytecode generation có thể không hoạt động
- **Check**: [Quarkus Extensions](https://quarkus.io/extensions/) - nếu có extension → compatible
- **Check**: [GraalVM Compatibility](https://www.graalvm.org/native-image/libraries-and-frameworks/)
- **Workaround**: Tracing agent, manual config, hoặc tìm alternative library

### Q4: Mandrel vs GraalVM CE vs GraalVM EE?

| | Mandrel | GraalVM CE | GraalVM EE |
| :--- | :--- | :--- | :--- |
| **Maintainer** | Red Hat | Oracle | Oracle |
| **License** | Free | Free (GPL2+CE) | Commercial |
| **Java support** | Chỉ Native Image | Native Image + Polyglot | Full + PGO |
| **Optimization** | Cơ bản | Cơ bản | Advanced (PGO, G1 GC) |
| **Quarkus default** | ✅ (builder image) | ✅ | ✅ |
| **Khuyến nghị** | Production (free) | Dev/local | Enterprise (paid) |

### Q5: Static vs Dynamic linking?

- **Dynamic** (default): Binary phụ thuộc system libraries (glibc) → Cần base image tương thích
- **Static (musl)**: Binary tự chứa tất cả → Chạy trên `scratch` image → Nhỏ nhất
- **Cách build static**:
```bash
./mvnw package -Pnative \
    -Dquarkus.native.additional-build-args="--static","--libc=musl"
```

### Q6: Native Image có thể debug được không?

- **Có**, nhưng khó hơn JVM
- Build với `-Dquarkus.native.debug.enabled=true` → Include debug symbols
- Dùng GDB/LLDB thay vì Java debugger
- Khuyến nghị: Debug trên JVM, chỉ test native ở cuối

---

## Best Practices

1. **Dev với JVM, deploy native**: JVM cho development speed, native cho production
2. **Test native trong CI**: `./mvnw verify -Pnative` trong CI pipeline
3. **Dùng Quarkus extensions**: Tự động xử lý reflection, resources
4. **@RegisterForReflection**: Cho DTOs, external library classes
5. **Container build**: Không cần cài GraalVM local
6. **Multi-stage Dockerfile**: Giảm image size
7. **Tracing agent**: Khi 3rd-party lib có vấn đề với native
8. **Monitor build time**: Timeout CI jobs phù hợp (native build 2-10 min)
9. **PGO**: Cho performance-critical services
10. **Mandrel**: Default builder image cho production (free, Red Hat supported)

---

## Tổng kết

- **Native Image**: AOT compilation, không cần JVM, startup milliseconds
- **Closed World Assumption**: Tất cả code phải biết lúc build
- **Quarkus Build**: Build-time optimization → Tự xử lý reflection, config
- **Reflection**: `@RegisterForReflection` hoặc tracing agent
- **Container**: Multi-stage build, micro/distroless images → 50-80 MB
- **Performance**: 30-100x faster startup, 3-5x less memory
- **Trade-off**: Build chậm, throughput lower than JVM warm, hạn chế dynamic features
- **Best for**: Serverless, containers, microservices, CLI tools
