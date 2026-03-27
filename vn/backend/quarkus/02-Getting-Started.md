# Getting Started - Câu hỏi phỏng vấn Quarkus

## Mục lục
1. [Project Setup](#project-setup)
2. [Project Structure](#project-structure)
3. [Development Mode](#development-mode)
4. [Dev UI (/q/dev)](#dev-ui-qdev)
5. [Dev Services (auto start Postgres/Kafka/Keycloak…)](#dev-services-auto-start-postgreskafkakeycloak)
6. [Hot Reload](#hot-reload)
7. [Profiles (dev, test, prod)](#profiles-dev-test-prod)
8. [Configuration](#configuration)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Project Setup

### Quarkus CLI

```bash
# Install Quarkus CLI
# Using SDKMAN
sdk install quarkus

# Create project
quarkus create app com.example:quarkus-app

# Add extensions
quarkus add resteasy-reactive
quarkus add hibernate-orm-panache
quarkus add jdbc-postgresql
```

### Maven

```bash
# Create project với Maven
mvn io.quarkus.platform:quarkus-maven-plugin:3.6.0:create \
    -DprojectGroupId=com.example \
    -DprojectArtifactId=quarkus-app \
    -DclassName="com.example.GreetingResource" \
    -Dpath="/hello"
```

### Project Structure

```
quarkus-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── GreetingResource.java
│   │   │       └── GreetingService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── META-INF/
│   │           └── resources/
│   │               └── index.html
│   └── test/
│       └── java/
│           └── com/example/
│               └── GreetingResourceTest.java
├── pom.xml
└── README.md
```

---

## Development Mode

### Run Development Mode

```bash
# Development mode với hot reload
./mvnw quarkus:dev

# Hoặc
quarkus dev
```

### Features

```java
// Development mode features:
// 1. Hot reload: Code changes reflected immediately
// 2. Continuous testing: Tests run automatically
// 3. Dev UI: http://localhost:8080/q/dev/
// 4. Live coding: No restart needed
```

---

## Dev UI (/q/dev)

**Dev UI** là giao diện web quản lý ứng dụng trong lúc development, truy cập tại `http://localhost:8080/q/dev/` (chỉ có khi chạy `quarkus dev`).

### Chức năng chính

| Trang / Tính năng | Mô tả |
| :--- | :--- |
| **Extensions** | Xem danh sách extensions đã cài, gỡ cài, thêm extension |
| **Configuration** | Xem toàn bộ config (application.properties + overrides), filter theo key |
| **Logging** | Xem log real-time, thay đổi log level tại runtime |
| **Beans** | Xem CDI beans (ArC), scope, dependencies |
| **Config Editor** | Sửa một số config và apply ngay không cần restart |
| **Database** | (Khi dùng Dev Services DB) Thông tin datasource, có thể mở H2 console |

### Ví dụ sử dụng

- Bật/tắt SQL logging: Dev UI → Configuration → tìm `quarkus.hibernate-orm.log.sql` → bật.
- Kiểm tra bean nào được inject: Dev UI → Beans → tìm `UserService`.
- Chạy test nhanh: Dev UI → Continuous Testing (nếu bật).

---

## Dev Services (auto start Postgres/Kafka/Keycloak…)

**Dev Services** cho phép Quarkus **tự động khởi động** database, message broker, hoặc auth server trong môi trường dev/test mà **không cần cài sẵn** hoặc config URL.

### Cách hoạt động

1. Bạn thêm extension (ví dụ `quarkus-jdbc-postgresql`, `quarkus-smallrye-reactive-messaging-kafka`).
2. **Không** set `quarkus.datasource.jdbc.url` (hoặc tương đương cho Kafka).
3. Khi chạy `quarkus dev` hoặc `@QuarkusTest`, Quarkus phát hiện thiếu config → tự start container (Docker).
4. Quarkus inject URL/port vào config cho ứng dụng → app kết nối được ngay.

### Các Dev Services hỗ trợ

| Dịch vụ | Extension | Container mặc định |
| :--- | :--- | :--- |
| **PostgreSQL** | `quarkus-jdbc-postgresql` | PostgreSQL |
| **MySQL** | `quarkus-jdbc-mysql` | MySQL |
| **MariaDB** | `quarkus-jdbc-mariadb` | MariaDB |
| **MongoDB** | `quarkus-mongodb-client` | MongoDB |
| **Kafka** | `quarkus-smallrye-reactive-messaging-kafka` | Redpanda (tương thích Kafka) |
| **RabbitMQ** | `quarkus-smallrye-reactive-messaging-amqp` | RabbitMQ |
| **Redis** | `quarkus-redis-client` | Redis |
| **Keycloak** | `quarkus-oidc` | Keycloak (OIDC/OAuth2) |
| **Elasticsearch** | `quarkus-elasticsearch-rest-client` | Elasticsearch |

### Cấu hình Dev Services

```properties
# application.properties

# ===== Bật/tắt Dev Services =====
# Mặc định: true nếu không có config URL
quarkus.datasource.devservices.enabled=true

# ===== PostgreSQL Dev Services =====
quarkus.datasource.db-kind=postgresql
# Không set quarkus.datasource.jdbc.url → Dev Services tự start container
quarkus.datasource.devservices.image-name=postgres:16-alpine
quarkus.datasource.devservices.port=5432

# Init script (chạy khi container start)
quarkus.datasource.devservices.init-script-path=init-dev.sql

# ===== Kafka Dev Services =====
quarkus.kafka.devservices.enabled=true
quarkus.kafka.devservices.image-name=apache/kafka:3.6
# Hoặc Redpanda (nhẹ hơn): vectorized/redpanda:latest

# ===== Keycloak Dev Services (OIDC) =====
%dev.quarkus.oidc.devservices.enabled=true
%dev.quarkus.oidc.devservices.realm-path=realm-config.json
```

### Lưu ý

- **Docker** phải đang chạy trên máy (Dev Services dùng Testcontainers/Docker).
- Nếu bạn **đã set** URL (ví dụ `quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/mydb`), Dev Services **không** start; app dùng DB của bạn.
- Trong **test** (`@QuarkusTest`), Dev Services cũng tự start → test dùng DB/Kafka thật trong container, không cần H2 in-memory.

---

## Hot Reload

### How it works

```java
// Hot Reload: Automatic reload khi code changes
// 1. File changed
// 2. Quarkus detects change
// 3. Recompiles changed classes
// 4. Restarts application
// 5. No manual restart needed

// Example:
@Path("/hello")
public class GreetingResource {
    @GET
    public String hello() {
        return "Hello";  // Change to "Hello World" → Auto reload
    }
}
```

---

## Configuration

### application.properties

```properties
# application.properties
# Server configuration
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# Database configuration
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=quarkus
quarkus.datasource.password=quarkus
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/quarkus

# Logging
quarkus.log.level=INFO
quarkus.log.console.enable=true
```

### Profiles (dev, test, prod)

Quarkus có **profiles** để tách cấu hình theo môi trường: `dev`, `test`, `prod` (và tên tùy chỉnh).

```properties
# application.properties (default - dùng khi không set profile)
quarkus.http.port=8080

# %dev.xxx → Chỉ áp dụng khi chạy quarkus dev
%dev.quarkus.http.port=8080
%dev.quarkus.log.level=DEBUG
%dev.quarkus.datasource.jdbc.url=jdbc:h2:mem:default

# %test.xxx → Chỉ áp dụng khi chạy test (@QuarkusTest)
%test.quarkus.hibernate-orm.database.generation=drop-and-create
%test.quarkus.log.level=INFO

# %prod.xxx → Chỉ áp dụng khi chạy JAR/native (production)
%prod.quarkus.http.port=80
%prod.quarkus.log.level=WARN
%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://prod-db:5432/app
```

Chạy với profile cụ thể:

```bash
# Dev (mặc định khi quarkus dev)
./mvnw quarkus:dev

# Test: profile "test" tự động dùng khi chạy test
./mvnw test

# Prod (khi chạy JAR)
java -Dquarkus.profile=prod -jar target/quarkus-app/quarkus-run.jar
```

**Cấu hình theo file từng profile (tùy chọn):** Có thể tách config ra file riêng `application-{profile}.properties`.

```properties
# application-dev.properties (profile "dev")
quarkus.http.port=8081
quarkus.log.level=DEBUG

# application-prod.properties (profile "prod")
quarkus.http.port=80
quarkus.log.level=WARN
```

---

## Câu hỏi thường gặp

### Q1: Hot reload hoạt động như thế nào?

```java
// Hot reload process:
// 1. File watcher monitors source files
// 2. On change: Recompile changed classes
// 3. Restart application context
// 4. Preserve application state when possible
```

---

## Best Practices

1. **Use development mode**: For development
2. **Configure properly**: Use profiles
3. **Hot reload**: Leverage hot reload
4. **Dev UI**: Use Dev UI for debugging

---

## Tổng kết

- **Project Setup**: CLI, Maven, Gradle
- **Development Mode**: Hot reload, continuous testing
- **Configuration**: application.properties, profiles
- **Best Practices**: Use dev mode, configure properly
