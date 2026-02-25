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
└───────────────────────────────
