# Quarkus Common Configurations — Tổng Hợp

> Tất cả config thông dụng cho production Quarkus app. Copy → paste → chỉnh sửa theo project.
> Mỗi section gồm: **config properties** + **Maven dependency** + **giải thích** + **tips**.

## Mục lục

1. [HTTP Server & SSL](#1-http-server--ssl)
2. [Datasource (JDBC)](#2-datasource-jdbc)
3. [Hibernate ORM / JPA](#3-hibernate-orm--jpa)
4. [Reactive SQL (Reactive Datasource)](#4-reactive-sql)
5. [Redis](#5-redis)
6. [MongoDB](#6-mongodb)
7. [Kafka (Messaging)](#7-kafka)
8. [RabbitMQ / AMQP](#8-rabbitmq--amqp)
9. [OIDC (OpenID Connect / Keycloak)](#9-oidc)
10. [JWT (SmallRye JWT)](#10-jwt)
11. [REST Client](#11-rest-client)
12. [Logging](#12-logging)
13. [Health Check & Readiness](#13-health-check)
14. [Metrics (Micrometer)](#14-metrics)
15. [OpenAPI / Swagger](#15-openapi--swagger)
16. [Cache](#16-cache)
17. [Scheduler (Cron Jobs)](#17-scheduler)
18. [Mailer (Email)](#18-mailer)
19. [Flyway / Liquibase (DB Migration)](#19-flyway--liquibase)
20. [CORS](#20-cors)
21. [gRPC](#21-grpc)
22. [WebSocket](#22-websocket)
23. [Kubernetes / Container](#23-kubernetes--container)
24. [Profile-Specific Config](#24-profile-specific-config)
25. [Environment Variables & Secrets](#25-environment-variables--secrets)

---

## 1. HTTP Server & SSL

### Dependency
```xml
<!-- Có sẵn trong quarkus-resteasy-reactive -->
```

### Config

```properties
# ═══════════════════════════════════════════
# HTTP SERVER
# ═══════════════════════════════════════════

quarkus.http.port=8080                          # Port HTTP chính (mặc định 8080)
%dev.quarkus.http.port=8080                     # Port riêng cho dev mode
%test.quarkus.http.port=8081                    # Port riêng cho test (tránh conflict)

quarkus.http.host=0.0.0.0                       # Bind tất cả interfaces (cần cho Docker/K8s)

# ──── SSL / HTTPS ────
quarkus.http.ssl-port=8443                      # Port HTTPS
quarkus.http.ssl.certificate.files=/path/to/cert.pem       # File certificate PEM
quarkus.http.ssl.certificate.key-files=/path/to/key.pem    # File private key PEM
# quarkus.http.ssl.certificate.key-store-file=/path/to/keystore.jks  # Hoặc dùng Java Keystore
# quarkus.http.ssl.certificate.key-store-password=changeit           # Password Keystore

%prod.quarkus.http.insecure-requests=redirect   # Production: tự redirect HTTP → HTTPS

# ──── Request Limits ────
quarkus.http.limits.max-body-size=10M           # Giới hạn body size (tránh upload quá lớn)
quarkus.http.limits.max-header-size=16K         # Giới hạn header size (tránh header injection)

# ──── Timeout ────
quarkus.http.read-timeout=30s                   # Thời gian tối đa đọc request body
quarkus.http.idle-timeout=300s                  # Thời gian giữ connection idle (keep-alive)

quarkus.http.enable-compression=true            # Bật gzip response (giảm bandwidth)

# ──── Access Log ────
quarkus.http.access-log.enabled=true            # Bật log truy cập HTTP (giống Nginx access log)
quarkus.http.access-log.pattern=%h %l %u %t "%r" %s %b "%{i,Referer}" "%{i,User-Agent}" %D  # Format: IP, time, request, status, size, user-agent, duration(ms)
quarkus.http.access-log.log-to-file=true        # Ghi log ra file (thay vì chỉ stdout)
```

> **Tip**: Trong Kubernetes, SSL thường được ALB/Ingress xử lý → app chỉ cần HTTP port 8080.

---

## 2. Datasource (JDBC)

### Dependency
```xml
<!-- PostgreSQL -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-postgresql</artifactId>
</dependency>

<!-- MySQL -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-mysql</artifactId>
</dependency>

<!-- Oracle -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-oracle</artifactId>
</dependency>

<!-- MSSQL -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-jdbc-mssql</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# DATASOURCE (JDBC) — PostgreSQL
# ═══════════════════════════════════════════

# ──── DB Kind (⚠️ BUILD-TIME — đổi cần rebuild native!) ────
quarkus.datasource.db-kind=postgresql                      # Loại DB: postgresql, mysql, oracle, mssql, h2, db2

# ──── Connection (RUNTIME — đổi bằng env var, không cần rebuild) ────
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mydb}  # JDBC URL, ${VAR:default}
quarkus.datasource.username=${DB_USER:admin}               # DB username (nên lấy từ env/secret)
quarkus.datasource.password=${DB_PASSWORD:secret}           # DB password (KHÔNG hardcode production!)

# ──── Connection Pool (Agroal) ────
quarkus.datasource.jdbc.min-size=5                         # Số connection TỐI THIỂU giữ sẵn trong pool
quarkus.datasource.jdbc.max-size=20                        # Số connection TỐI ĐA (vượt → chờ hoặc lỗi)
quarkus.datasource.jdbc.initial-size=5                     # Số connection tạo ngay lúc startup
quarkus.datasource.jdbc.acquisition-timeout=30s            # Thời gian chờ lấy connection từ pool (hết → exception)
quarkus.datasource.jdbc.idle-removal-interval=5m           # Mỗi 5 phút kiểm tra và đóng connection idle
quarkus.datasource.jdbc.max-lifetime=30m                   # Connection sống tối đa 30 phút (tránh stale connection)
quarkus.datasource.jdbc.leak-detection-interval=1m         # Phát hiện connection leak (giữ quá lâu không trả pool)

quarkus.datasource.jdbc.transaction-isolation-level=read-committed  # Isolation level: read-uncommitted, read-committed, repeatable-read, serializable

# ──── DEV MODE (Dev Services — tự start DB container) ────
%dev.quarkus.datasource.devservices.enabled=true           # Tự khởi PostgreSQL container bằng Testcontainers
%dev.quarkus.datasource.devservices.image-name=postgres:16-alpine  # Docker image dùng cho dev
%dev.quarkus.datasource.devservices.port=5432              # Port map ra host

# ──── MULTIPLE DATASOURCES (tên = "reporting") ────
quarkus.datasource.reporting.db-kind=postgresql            # DB thứ 2 cho reporting
quarkus.datasource.reporting.jdbc.url=jdbc:postgresql://reporting-host:5432/reports  # URL riêng
quarkus.datasource.reporting.username=${REPORTING_DB_USER}  # User riêng
quarkus.datasource.reporting.password=${REPORTING_DB_PASSWORD}
quarkus.datasource.reporting.jdbc.max-size=5               # Pool nhỏ hơn (ít query hơn)
```

> **Tip**: `quarkus.datasource.db-kind` là **build-time** → đổi từ PostgreSQL sang MySQL cần rebuild. URL/user/password là **runtime** → đổi bằng env var.

---

## 3. Hibernate ORM / JPA

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-hibernate-orm-panache</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# HIBERNATE ORM
# ═══════════════════════════════════════════

# DDL Strategy (BUILD-TIME)
#   none        = không tạo/sửa table
#   validate    = chỉ kiểm tra schema (production!)
#   update      = tự sửa schema (KHÔNG DÙNG production)
#   create      = drop + create (test only)
#   drop-and-create = drop + create (test only)
quarkus.hibernate-orm.database.generation=validate
%dev.quarkus.hibernate-orm.database.generation=update
%test.quarkus.hibernate-orm.database.generation=drop-and-create

# SQL logging
quarkus.hibernate-orm.log.sql=false
%dev.quarkus.hibernate-orm.log.sql=true
%dev.quarkus.hibernate-orm.log.format-sql=true
%dev.quarkus.hibernate-orm.log.bind-parameters=true

# Batch operations (PERFORMANCE)
quarkus.hibernate-orm.jdbc.statement-batch-size=25
quarkus.hibernate-orm.order-inserts=true
quarkus.hibernate-orm.order-updates=true

# Second-level cache
quarkus.hibernate-orm.cache."com.example.Product".expiration.max-idle=1h
quarkus.hibernate-orm.cache."com.example.Category".memory.object-count=200

# Timezone
quarkus.hibernate-orm.jdbc.timezone=UTC

# Entity packages (BUILD-TIME)
# quarkus.hibernate-orm.packages=com.example.entity

# ──── MULTIPLE PERSISTENCE UNITS ────
# quarkus.hibernate-orm."reporting".datasource=reporting
# quarkus.hibernate-orm."reporting".packages=com.example.reporting.entity
```

---

## 4. Reactive SQL

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-reactive-pg-client</artifactId>
</dependency>
<!-- Hoặc: quarkus-reactive-mysql-client, quarkus-reactive-mssql-client -->
```

### Config

```properties
# ═══════════════════════════════════════════
# REACTIVE DATASOURCE
# ═══════════════════════════════════════════

quarkus.datasource.reactive.url=postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mydb}  # URL reactive (KHÔNG có jdbc: prefix)
quarkus.datasource.reactive.max-size=20            # Số connection tối đa trong pool reactive
quarkus.datasource.reactive.idle-timeout=PT5M      # Đóng connection idle sau 5 phút (ISO 8601 duration)
quarkus.datasource.reactive.trust-all=false         # false = verify SSL cert (production). true = bỏ qua (dev only!)

# quarkus.datasource.reactive.trust-certificate-pem.certs=/path/to/cert.pem  # CA cert cho SSL
```

---

## 5. Redis

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-redis-client</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# REDIS
# ═══════════════════════════════════════════

# ──── Single host ────
quarkus.redis.hosts=redis://${REDIS_HOST:localhost}:${REDIS_PORT:6379}   # URL Redis (redis:// hoặc rediss:// cho SSL)
# quarkus.redis.hosts=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:6379      # Kèm password trong URL

# ──── Connection Pool ────
quarkus.redis.max-pool-size=8              # Số connection tối đa tới Redis
quarkus.redis.max-pool-waiting=24          # Số request tối đa chờ connection (vượt → lỗi)
quarkus.redis.reconnect-attempts=5         # Số lần retry khi mất kết nối
quarkus.redis.reconnect-interval=1s        # Khoảng cách giữa các lần retry

# quarkus.redis.tls.enabled=true           # Bật SSL/TLS (bắt buộc cho ElastiCache, Azure Redis...)
# quarkus.redis.tls.trust-all=false        # false = verify cert (production)

# ──── Redis Cluster (nhiều node, auto-sharding) ────
# quarkus.redis.hosts=redis://node1:6379,redis://node2:6379,redis://node3:6379  # Danh sách nodes
# quarkus.redis.client-type=cluster        # Bật cluster mode

# ──── Redis Sentinel (HA — auto failover) ────
# quarkus.redis.hosts=redis://sentinel1:26379,redis://sentinel2:26379  # Sentinel nodes
# quarkus.redis.client-type=sentinel       # Bật sentinel mode
# quarkus.redis.master-name=mymaster       # Tên master group trong Sentinel

%dev.quarkus.redis.devservices.enabled=true          # Dev: tự start Redis container
%dev.quarkus.redis.devservices.image-name=redis:7-alpine  # Docker image cho dev
```

---

## 6. MongoDB

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-mongodb-panache</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# MONGODB
# ═══════════════════════════════════════════

quarkus.mongodb.connection-string=mongodb://${MONGO_HOST:localhost}:${MONGO_PORT:27017}  # MongoDB connection string
quarkus.mongodb.database=${MONGO_DB:mydb}          # Tên database mặc định

# ──── Authentication ────
# quarkus.mongodb.credentials.username=${MONGO_USER}       # Username
# quarkus.mongodb.credentials.password=${MONGO_PASSWORD}   # Password
# quarkus.mongodb.credentials.auth-source=admin            # Database chứa user (thường là "admin")

# ──── Connection Pool ────
quarkus.mongodb.max-pool-size=20               # Connection tối đa
quarkus.mongodb.min-pool-size=5                # Connection giữ sẵn tối thiểu
quarkus.mongodb.connect-timeout=10s            # Timeout khi tạo connection mới
quarkus.mongodb.socket-timeout=30s             # Timeout khi chờ response từ MongoDB

# ──── Replica Set (HA) ────
# quarkus.mongodb.connection-string=mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0  # Nhiều nodes

# quarkus.mongodb.tls=true                     # Bật SSL (bắt buộc cho Atlas, DocumentDB)
# quarkus.mongodb.tls-insecure=false           # false = verify cert

%dev.quarkus.mongodb.devservices.enabled=true             # Dev: tự start MongoDB container
%dev.quarkus.mongodb.devservices.image-name=mongo:7       # Docker image cho dev
```

---

## 7. Kafka

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-reactive-messaging-kafka</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# KAFKA
# ═══════════════════════════════════════════

# ──── Bootstrap servers ────
kafka.bootstrap.servers=${KAFKA_BOOTSTRAP:localhost:9092}

# ──── PRODUCER (Outgoing) ────
# Channel name = "order-events-out"
mp.messaging.outgoing.order-events-out.connector=smallrye-kafka       # Connector type: smallrye-kafka
mp.messaging.outgoing.order-events-out.topic=order-events              # Tên Kafka topic gửi tới
mp.messaging.outgoing.order-events-out.value.serializer=io.quarkus.kafka.client.serialization.ObjectMapperSerializer  # Serialize value bằng Jackson
mp.messaging.outgoing.order-events-out.key.serializer=org.apache.kafka.common.serialization.StringSerializer          # Serialize key bằng String
mp.messaging.outgoing.order-events-out.acks=all                        # all = tất cả replicas phải confirm (an toàn nhất, chậm hơn)
mp.messaging.outgoing.order-events-out.retries=3                       # Số lần retry khi gửi thất bại

# ──── CONSUMER (Incoming — channel "order-events-in") ────
mp.messaging.incoming.order-events-in.connector=smallrye-kafka         # Connector type
mp.messaging.incoming.order-events-in.topic=order-events               # Topic đọc từ
mp.messaging.incoming.order-events-in.group.id=order-service           # Consumer group ID (mỗi service 1 group)
mp.messaging.incoming.order-events-in.value.deserializer=io.quarkus.kafka.client.serialization.ObjectMapperDeserializer  # Deserialize value bằng Jackson
mp.messaging.incoming.order-events-in.auto.offset.reset=earliest       # earliest = đọc từ đầu nếu chưa có offset. latest = chỉ đọc message mới
mp.messaging.incoming.order-events-in.commit-strategy=throttled        # throttled = batch commit (hiệu năng tốt hơn)
mp.messaging.incoming.order-events-in.throttled.unprocessed-record-max-age.ms=60000  # Commit offset chậm nhất sau 60s
mp.messaging.incoming.order-events-in.partitions=3                     # Số partitions xử lý song song (= số threads)

# ──── Dead Letter Queue (DLQ — xử lý message lỗi) ────
mp.messaging.incoming.order-events-in.failure-strategy=dead-letter-queue  # Message lỗi → chuyển sang DLQ topic
mp.messaging.incoming.order-events-in.dead-letter-queue.topic=order-events-dlq  # Tên DLQ topic

# ──── Kafka SSL/SASL (Production — MSK, Confluent Cloud) ────
# kafka.security.protocol=SASL_SSL                 # Giao thức bảo mật
# kafka.sasl.mechanism=PLAIN                       # Cơ chế auth: PLAIN, SCRAM-SHA-256, SCRAM-SHA-512
# kafka.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
#   username="${KAFKA_USER}" password="${KAFKA_PASSWORD}";  # Credentials

# ──── Schema Registry (Avro — type-safe messaging) ────
# mp.messaging.outgoing.order-events-out.value.serializer=io.confluent.kafka.serializers.KafkaAvroSerializer  # Dùng Avro thay JSON
# mp.messaging.outgoing.order-events-out.schema.registry.url=http://schema-registry:8081  # URL Schema Registry

%dev.quarkus.kafka.devservices.enabled=true         # Dev: tự start Kafka container
%dev.quarkus.kafka.devservices.image-name=confluentinc/cp-kafka:7.5.0  # Docker image cho dev
```

### Code Example

```java
// Producer
@ApplicationScoped
public class OrderEventProducer {
    @Inject
    @Channel("order-events-out")
    Emitter<OrderEvent> emitter;
    
    public void send(OrderEvent event) {
        emitter.send(Message.of(event)
            .withMetadata(OutgoingKafkaRecordMetadata.<String>builder()
                .withKey(event.getOrderId())
                .withHeaders(new RecordHeaders()
                    .add("source", "order-service".getBytes()))
                .build()));
    }
}

// Consumer
@ApplicationScoped
public class OrderEventConsumer {
    @Incoming("order-events-in")
    public CompletionStage<Void> consume(Message<OrderEvent> message) {
        OrderEvent event = message.getPayload();
        // process event...
        return message.ack();
    }
}
```

---

## 8. RabbitMQ / AMQP

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-reactive-messaging-rabbitmq</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# RABBITMQ
# ═══════════════════════════════════════════

# ──── Connection ────
rabbitmq-host=${RABBITMQ_HOST:localhost}            # RabbitMQ hostname
rabbitmq-port=${RABBITMQ_PORT:5672}                # AMQP port (5672=plain, 5671=SSL)
rabbitmq-username=${RABBITMQ_USER:guest}            # Username (đổi khỏi guest cho production!)
rabbitmq-password=${RABBITMQ_PASSWORD:guest}        # Password
rabbitmq-virtual-host=/                             # Virtual host ("namespace" cho multi-tenant)

# rabbitmq-ssl=true                                 # Bật SSL (bắt buộc cho AmazonMQ, CloudAMQP)

# ──── PRODUCER (channel "notifications-out") ────
mp.messaging.outgoing.notifications-out.connector=smallrye-rabbitmq          # Connector type
mp.messaging.outgoing.notifications-out.exchange.name=notifications          # Exchange name (message router)
mp.messaging.outgoing.notifications-out.exchange.type=topic                  # topic = route theo pattern, direct = exact match, fanout = broadcast
mp.messaging.outgoing.notifications-out.default-routing-key=notification.email  # Default routing key khi gửi

# ──── CONSUMER (channel "notifications-in") ────
mp.messaging.incoming.notifications-in.connector=smallrye-rabbitmq           # Connector type
mp.messaging.incoming.notifications-in.queue.name=email-notifications        # Tên queue đọc từ
mp.messaging.incoming.notifications-in.exchange.name=notifications            # Exchange bind tới
mp.messaging.incoming.notifications-in.routing-keys=notification.email,notification.sms  # Nhận messages match routing keys này
mp.messaging.incoming.notifications-in.auto-acknowledgement=false            # false = manual ack (an toàn hơn, tránh mất message)
mp.messaging.incoming.notifications-in.max-outstanding-messages=10           # Prefetch: số message tối đa xử lý đồng thời
mp.messaging.incoming.notifications-in.auto-bind-dlq=true                    # Tự tạo Dead Letter Queue
mp.messaging.incoming.notifications-in.dead-letter-exchange=notifications-dlx  # Exchange cho DLQ
mp.messaging.incoming.notifications-in.dead-letter-routing-key=failed        # Routing key cho failed messages

%dev.quarkus.rabbitmq.devservices.enabled=true                # Dev: tự start RabbitMQ container
%dev.quarkus.rabbitmq.devservices.image-name=rabbitmq:3-management-alpine  # Có management UI (:15672)
```

---

## 9. OIDC

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-oidc</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# OIDC (OpenID Connect — Keycloak / Auth0 / Okta)
# ═══════════════════════════════════════════

# ──── Keycloak Example ────
quarkus.oidc.auth-server-url=http://${KEYCLOAK_HOST:localhost}:8180/realms/${KEYCLOAK_REALM:my-realm}
quarkus.oidc.client-id=${OIDC_CLIENT_ID:my-app}
quarkus.oidc.credentials.secret=${OIDC_CLIENT_SECRET:my-secret}

# Application type
#   service     = Backend API (bearer token validation only) — PHỔI BIẾN NHẤT
#   web-app     = Server-side rendered (authorization code flow)
#   hybrid      = Cả hai
quarkus.oidc.application-type=service

# Token validation
quarkus.oidc.token.issuer=http://keycloak:8180/realms/my-realm
quarkus.oidc.token.audience=my-app
# quarkus.oidc.token.principal-claim=preferred_username

# Roles mapping
quarkus.oidc.roles.role-claim-path=realm_access/roles
# Hoặc cho client roles:
# quarkus.oidc.roles.role-claim-path=resource_access/${quarkus.oidc.client-id}/roles

# JWKS cache
quarkus.oidc.token.forced-jwk-refresh-interval=10m

# ──── Auth0 Example ────
# quarkus.oidc.auth-server-url=https://your-tenant.auth0.com/
# quarkus.oidc.client-id=your-client-id
# quarkus.oidc.token.audience=https://your-api-identifier

# ──── Okta Example ────
# quarkus.oidc.auth-server-url=https://your-org.okta.com/oauth2/default
# quarkus.oidc.client-id=your-client-id

# Dev Services (Keycloak container tự khởi)
%dev.quarkus.oidc.devservices.enabled=true
%dev.quarkus.oidc.devservices.image-name=quay.io/keycloak/keycloak:23.0
%dev.quarkus.oidc.devservices.realm-path=dev-realm.json
```

### Role-Based Access

```java
@Path("/api/admin")
@RolesAllowed("admin")              // Cần role "admin" trong JWT
public class AdminResource {

    @GET
    @Path("/users")
    @RolesAllowed({"admin", "manager"})
    public List<User> listUsers() { ... }

    @DELETE
    @Path("/users/{id}")
    @RolesAllowed("admin")           // Chỉ admin
    public void deleteUser(@PathParam("id") Long id) { ... }

    @GET
    @Path("/public")
    @PermitAll                        // Public — không cần auth
    public String publicEndpoint() { ... }
}
```

---

## 10. JWT

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-jwt-build</artifactId>  <!-- Tạo JWT -->
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# JWT (SmallRye JWT)
# ═══════════════════════════════════════════

# Public key để VERIFY token (PEM hoặc JWKS URL)
mp.jwt.verify.publickey.location=publicKey.pem
# Hoặc JWKS endpoint:
# mp.jwt.verify.publickey.location=https://auth-server/.well-known/jwks.json

# Issuer validation
mp.jwt.verify.issuer=https://my-auth-server.com

# Token expiration
quarkus.smallrye-jwt.expiration.grace=60

# Private key để SIGN token (chỉ cần nếu app tự tạo JWT)
smallrye.jwt.sign.key.location=privateKey.pem
smallrye.jwt.new-token.lifespan=3600
smallrye.jwt.new-token.issuer=https://my-auth-server.com
```

### Code — Tạo và Đọc JWT

```java
// Tạo JWT
@ApplicationScoped
public class JwtService {
    public String generateToken(User user) {
        return Jwt.issuer("https://my-auth-server.com")
            .subject(user.getId().toString())
            .upn(user.getEmail())
            .groups(Set.of(user.getRole()))
            .claim("name", user.getName())
            .expiresIn(Duration.ofHours(1))
            .sign();
    }
}

// Đọc JWT trong Resource
@Path("/me")
@Authenticated
public class MeResource {
    @Inject JsonWebToken jwt;

    @GET
    public Map<String, Object> me() {
        return Map.of(
            "sub", jwt.getSubject(),
            "email", jwt.getClaim("upn"),
            "name", jwt.getClaim("name"),
            "roles", jwt.getGroups(),
            "exp", jwt.getExpirationTime()
        );
    }
}
```

---

## 11. REST Client

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-rest-client-reactive-jackson</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# REST CLIENT
# ═══════════════════════════════════════════

# Mỗi @RegisterRestClient(configKey="user-api") tương ứng 1 block config
quarkus.rest-client.user-api.url=https://api.example.com       # Base URL của service gọi tới
quarkus.rest-client.user-api.connect-timeout=5000              # Timeout tạo TCP connection (ms)
quarkus.rest-client.user-api.read-timeout=10000                # Timeout chờ response (ms). Vượt → ReadTimeoutException

quarkus.rest-client.user-api.max-retries=3                     # Số lần retry khi request thất bại

# quarkus.rest-client.user-api.trust-store=/path/to/truststore.jks  # Java TrustStore cho mTLS / custom CA
# quarkus.rest-client.user-api.trust-store-password=changeit        # TrustStore password

# ──── Multiple REST Clients (mỗi service 1 config block) ────
quarkus.rest-client.payment-api.url=https://payment.example.com    # Payment service
quarkus.rest-client.payment-api.connect-timeout=3000               # Timeout ngắn hơn cho payment

quarkus.rest-client.notification-api.url=https://notify.example.com  # Notification service
quarkus.rest-client.notification-api.connect-timeout=2000            # Timeout ngắn (fire-and-forget)

# quarkus.rest-client.user-api.providers=com.example.AuthHeaderProvider  # Class tự thêm header (VD: forward JWT)
```

### Code

```java
@RegisterRestClient(configKey = "user-api")
@Path("/users")
public interface UserApiClient {
    @GET
    @Path("/{id}")
    Uni<UserDTO> getById(@PathParam("id") Long id);

    @POST
    Uni<UserDTO> create(CreateUserRequest request);
}

// Inject
@Inject @RestClient
UserApiClient userApi;
```

---

## 12. Logging

### Config

```properties
# ═══════════════════════════════════════════
# LOGGING
# ═══════════════════════════════════════════

# Global log level
quarkus.log.level=INFO
%dev.quarkus.log.level=DEBUG

# Category-specific levels
quarkus.log.category."com.example".level=DEBUG
quarkus.log.category."org.hibernate.SQL".level=DEBUG
quarkus.log.category."io.quarkus".level=INFO
quarkus.log.category."org.apache.kafka".level=WARN

# Console format
quarkus.log.console.format=%d{yyyy-MM-dd HH:mm:ss.SSS} %-5p [%c{3.}] (%t) %s%e%n
quarkus.log.console.color=true
%prod.quarkus.log.console.color=false

# ──── JSON Logging (Production — cho ELK/CloudWatch) ────
%prod.quarkus.log.console.json=true
%prod.quarkus.log.console.json.additional-field.service.value=order-service
%prod.quarkus.log.console.json.additional-field.environment.value=${ENV:production}
# Cần dependency: quarkus-logging-json

# ──── File Logging ────
quarkus.log.file.enable=true
quarkus.log.file.path=/var/log/app/application.log
quarkus.log.file.level=INFO
quarkus.log.file.rotation.max-file-size=10M
quarkus.log.file.rotation.max-backup-index=5
quarkus.log.file.rotation.rotate-on-boot=true

# ──── Sentry (Error Tracking) ────
# quarkus.log.sentry=true
# quarkus.log.sentry.dsn=https://key@sentry.io/project
# quarkus.log.sentry.level=ERROR
```

---

## 13. Health Check

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-health</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════

# Endpoints (tự động enable)
# /q/health          → Overall
# /q/health/live     → Liveness (app còn sống?)
# /q/health/ready    → Readiness (app sẵn sàng nhận request?)
# /q/health/started  → Startup (app đã khởi động xong?)

# Root path
quarkus.smallrye-health.root-path=/q/health

# Tự động check datasource, kafka, redis...
quarkus.health.extensions.enabled=true
```

### Custom Health Check

```java
@Liveness
@ApplicationScoped
public class AppLivenessCheck implements HealthCheck {
    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.up("app-alive");
    }
}

@Readiness
@ApplicationScoped
public class DatabaseReadinessCheck implements HealthCheck {
    @Inject AgroalDataSource dataSource;

    @Override
    public HealthCheckResponse call() {
        try (Connection conn = dataSource.getConnection()) {
            conn.createStatement().execute("SELECT 1");
            return HealthCheckResponse.up("database");
        } catch (Exception e) {
            return HealthCheckResponse.down("database");
        }
    }
}
```

---

## 14. Metrics

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-micrometer-registry-prometheus</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# METRICS (Micrometer + Prometheus)
# ═══════════════════════════════════════════

# Endpoint: /q/metrics
quarkus.micrometer.enabled=true                               # Bật Micrometer metrics
quarkus.micrometer.export.prometheus.enabled=true              # Expose metrics dạng Prometheus format
quarkus.micrometer.export.prometheus.path=/q/metrics            # Endpoint Prometheus scrape (GET /q/metrics)

# ──── Auto-collect metrics ────
quarkus.micrometer.binder.http-server.enabled=true             # Tự đo HTTP request (count, latency, status)
quarkus.micrometer.binder.http-client.enabled=true             # Tự đo outgoing HTTP calls
quarkus.micrometer.binder.jvm=true                             # JVM metrics (heap, GC, threads, classes)
quarkus.micrometer.binder.system=true                          # System metrics (CPU, memory, uptime)

quarkus.micrometer.export.prometheus.default-registry=true     # Dùng default registry (cho custom metrics inject)

# quarkus.micrometer.export.prometheus.histogram-expiry=1m     # Histogram bucket expiry (latency percentile)
```

### Custom Metrics

```java
@ApplicationScoped
public class OrderService {
    @Inject MeterRegistry registry;

    public void createOrder(Order order) {
        Timer.Sample sample = Timer.start(registry);
        try {
            // process...
            registry.counter("orders.created", "type", order.getType()).increment();
        } finally {
            sample.stop(registry.timer("orders.creation.time"));
        }
    }
}
```

---

## 15. OpenAPI / Swagger

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-smallrye-openapi</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# OPENAPI / SWAGGER UI
# ═══════════════════════════════════════════

# OpenAPI spec: /q/openapi
# Swagger UI:   /q/swagger-ui

quarkus.smallrye-openapi.path=/q/openapi
quarkus.swagger-ui.path=/q/swagger-ui
quarkus.swagger-ui.always-include=true  # Bật cho production (mặc định chỉ dev)

# API info
quarkus.smallrye-openapi.info-title=My API
quarkus.smallrye-openapi.info-version=1.0.0
quarkus.smallrye-openapi.info-description=Order Management API
quarkus.smallrye-openapi.info-contact-name=Dev Team
quarkus.smallrye-openapi.info-contact-email=dev@example.com

# Security scheme
quarkus.smallrye-openapi.security-scheme=jwt
quarkus.smallrye-openapi.security-scheme-name=bearerAuth
```

---

## 16. Cache

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cache</artifactId>
</dependency>
<!-- Hoặc Redis-backed cache: -->
<!-- <dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-cache-redis</artifactId>
</dependency> -->
```

### Config

```properties
# ═══════════════════════════════════════════
# CACHE
# ═══════════════════════════════════════════

# Default (Caffeine — in-memory)
quarkus.cache.enabled=true
quarkus.cache.caffeine."products".maximum-size=500
quarkus.cache.caffeine."products".expire-after-write=10m
quarkus.cache.caffeine."users".maximum-size=1000
quarkus.cache.caffeine."users".expire-after-write=5m

# Redis-backed cache
# quarkus.cache.redis."products".ttl=10m
# quarkus.cache.redis."products".prefix=cache:products
```

### Code

```java
@ApplicationScoped
public class ProductService {
    @CacheResult(cacheName = "products")
    public Product getById(Long id) {
        return productRepo.findById(id);  // Chỉ gọi DB lần đầu
    }

    @CacheInvalidate(cacheName = "products")
    public void update(Long id, Product product) {
        productRepo.update(id, product);
    }

    @CacheInvalidateAll(cacheName = "products")
    public void clearCache() { }
}
```

---

## 17. Scheduler

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-scheduler</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# SCHEDULER
# ═══════════════════════════════════════════

# Bật/tắt scheduler
quarkus.scheduler.enabled=true
%test.quarkus.scheduler.enabled=false

# Cron từ config (thay đổi mà không cần rebuild)
my.cleanup.cron=0 0 2 * * ?
my.report.cron=0 0 8 * * MON-FRI
```

### Code

```java
@ApplicationScoped
public class ScheduledJobs {

    // Chạy mỗi 30 giây
    @Scheduled(every = "30s")
    void checkHealth() {
        // health check logic
    }

    // Cron: 2 AM hàng ngày
    @Scheduled(cron = "{my.cleanup.cron}")   // Đọc từ config
    void cleanupExpiredSessions() {
        sessionRepo.deleteExpired();
    }

    // Mỗi 5 phút, delay 1 phút sau startup
    @Scheduled(every = "5m", delayed = "1m")
    void syncData() {
        // sync logic
    }

    // Timezone specific
    @Scheduled(cron = "0 0 9 * * ?", timeZone = "Asia/Ho_Chi_Minh")
    void morningReport() {
        // 9 AM Vietnam time
    }
}
```

---

## 18. Mailer

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-mailer</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# MAILER
# ═══════════════════════════════════════════

quarkus.mailer.from=noreply@example.com                # Địa chỉ gửi mặc định (From header)
quarkus.mailer.host=${SMTP_HOST:smtp.gmail.com}        # SMTP server hostname
quarkus.mailer.port=${SMTP_PORT:587}                   # SMTP port: 587 (STARTTLS) hoặc 465 (SSL)
quarkus.mailer.username=${SMTP_USER}                   # SMTP auth username
quarkus.mailer.password=${SMTP_PASSWORD}               # SMTP auth password
quarkus.mailer.start-tls=REQUIRED                      # REQUIRED = bắt buộc TLS, OPTIONAL = nếu có, DISABLED = tắt
quarkus.mailer.auth-methods=LOGIN                      # Auth method: LOGIN, PLAIN, XOAUTH2

%dev.quarkus.mailer.mock=true                          # Dev: KHÔNG gửi email thật, log ra console
%test.quarkus.mailer.mock=true                         # Test: KHÔNG gửi email thật
```

### Code

```java
@ApplicationScoped
public class EmailService {
    @Inject Mailer mailer;
    
    public void sendWelcome(String to, String name) {
        mailer.send(Mail.withHtml(to, 
            "Welcome " + name,
            "<h1>Chào mừng " + name + "!</h1><p>Cảm ơn bạn đã đăng ký.</p>"));
    }
}
```

---

## 19. Flyway / Liquibase

### Dependency
```xml
<!-- Flyway -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-flyway</artifactId>
</dependency>

<!-- Hoặc Liquibase -->
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-liquibase</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# FLYWAY (DB Migration)
# ═══════════════════════════════════════════

quarkus.flyway.migrate-at-start=true               # Tự chạy migration khi app startup
quarkus.flyway.locations=db/migration               # Thư mục chứa SQL migration files (src/main/resources/db/migration/)
quarkus.flyway.baseline-on-migrate=true             # Cho phép baseline nếu DB đã có data (migration từ giữa chừng)
quarkus.flyway.baseline-version=0                   # Version baseline bắt đầu

# ⚠️ Clean = DROP toàn bộ tables! NGUY HIỂM!
%dev.quarkus.flyway.clean-at-start=false            # Dev: không tự clean
%test.quarkus.flyway.clean-at-start=true            # Test: clean → tạo lại fresh DB
%prod.quarkus.flyway.clean-disabled=true            # Production: CẤM clean hoàn toàn (an toàn)

quarkus.flyway.validate-on-migrate=true             # Kiểm tra migration files chưa bị sửa (checksum)

# ──── Multiple datasources ────
# quarkus.flyway.reporting.migrate-at-start=true    # Migration cho datasource "reporting"
# quarkus.flyway.reporting.locations=db/reporting-migration  # Folder riêng

# ═══════════════════════════════════════════
# LIQUIBASE (Alternative cho Flyway)
# ═══════════════════════════════════════════

# quarkus.liquibase.migrate-at-start=true                              # Tự chạy changeset khi startup
# quarkus.liquibase.change-log=db/changelog/db.changelog-master.xml   # File changeset chính
```

> **Tip**: Khi dùng Flyway, set `quarkus.hibernate-orm.database.generation=validate` — Flyway quản lý schema, Hibernate chỉ validate.

---

## 20. CORS

### Config

```properties
# ═══════════════════════════════════════════
# CORS (Cross-Origin Resource Sharing)
# ═══════════════════════════════════════════

quarkus.http.cors=true                                     # Bật CORS handling
quarkus.http.cors.origins=https://myapp.com,https://admin.myapp.com  # Danh sách origin được phép (exact match)
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS      # HTTP methods được phép
quarkus.http.cors.headers=Content-Type,Authorization,X-Requested-With  # Request headers được phép gửi
quarkus.http.cors.exposed-headers=X-Total-Count,X-Page     # Response headers client được phép đọc
quarkus.http.cors.access-control-max-age=24H               # Cache preflight (OPTIONS) response trong 24 giờ
quarkus.http.cors.access-control-allow-credentials=true     # Cho phép gửi cookies/auth headers cross-origin

%dev.quarkus.http.cors.origins=/.*/                         # Dev: regex cho phép TẤT CẢ origins
```

---

## 21. gRPC

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-grpc</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# gRPC
# ═══════════════════════════════════════════

# ──── gRPC Server ────
quarkus.grpc.server.port=9000                              # Port gRPC server (tách biệt với HTTP port)
quarkus.grpc.server.host=0.0.0.0                           # Bind tất cả interfaces

# quarkus.grpc.server.ssl.certificate=/path/to/cert.pem    # TLS cert cho gRPC (bắt buộc production)
# quarkus.grpc.server.ssl.key=/path/to/key.pem             # TLS private key

# ──── gRPC Client (gọi service khác) ────
quarkus.grpc.clients.user-service.host=user-service        # Hostname service khác (K8s service name)
quarkus.grpc.clients.user-service.port=9000                # Port gRPC của service khác
# quarkus.grpc.clients.user-service.tls.enabled=true       # Bật TLS cho client

quarkus.grpc.server.health.enabled=true                    # Expose gRPC health check endpoint

%dev.quarkus.grpc.server.enable-reflection-service=true    # Dev: bật reflection (dùng grpcurl, Postman gRPC)
```

---

## 22. WebSocket

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-websockets-next</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# WEBSOCKET
# ═══════════════════════════════════════════

quarkus.websocket.max-frame-size=65536         # Max frame size (bytes) — 64KB. Tăng nếu gửi data lớn
quarkus.websocket.dispatch-to-worker=true       # true = xử lý message trên worker thread (blocking OK)
```

### Code

```java
@WebSocket(path = "/chat/{room}")
public class ChatWebSocket {
    @OnOpen
    public String onOpen(@PathParam String room) {
        return "Joined room: " + room;
    }

    @OnTextMessage
    public String onMessage(String message, @PathParam String room) {
        return "[" + room + "] " + message;
    }

    @OnClose
    public void onClose(@PathParam String room) {
        // cleanup
    }
}
```

---

## 23. Kubernetes / Container

### Dependency
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-kubernetes</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-container-image-jib</artifactId>
</dependency>
```

### Config

```properties
# ═══════════════════════════════════════════
# KUBERNETES & CONTAINER
# ═══════════════════════════════════════════

# ──── Container Image (Jib — build image không cần Docker daemon) ────
quarkus.container-image.group=my-company                   # Docker image group/org (= DockerHub username hoặc ECR prefix)
quarkus.container-image.name=order-service                 # Image name
quarkus.container-image.tag=${quarkus.application.version}  # Image tag (lấy từ pom version)
quarkus.container-image.registry=123456789.dkr.ecr.ap-southeast-1.amazonaws.com  # Registry URL (ECR, GCR, DockerHub)
# quarkus.container-image.build=true                       # true = build image khi chạy mvn package
# quarkus.container-image.push=true                        # true = push image lên registry sau build

# ──── Kubernetes Manifest Generation (tự tạo k8s YAML) ────
quarkus.kubernetes.namespace=production                    # Namespace deploy vào
quarkus.kubernetes.replicas=3                              # Số pod replicas
quarkus.kubernetes.image-pull-policy=always                 # always = luôn pull mới. IfNotPresent = dùng cache

# ──── Resource Limits (QoS) ────
quarkus.kubernetes.resources.requests.cpu=250m             # CPU request (scheduler dùng để schedule pod)
quarkus.kubernetes.resources.requests.memory=256Mi         # Memory request
quarkus.kubernetes.resources.limits.cpu=500m               # CPU limit (vượt → throttle)
quarkus.kubernetes.resources.limits.memory=512Mi           # Memory limit (vượt → OOMKilled)

# ──── Health Probes (K8s dùng để kiểm tra pod health) ────
quarkus.kubernetes.liveness-probe.http-action-path=/q/health/live      # Liveness: pod còn sống? Fail → restart pod
quarkus.kubernetes.readiness-probe.http-action-path=/q/health/ready    # Readiness: pod sẵn sàng nhận traffic? Fail → remove khỏi Service
quarkus.kubernetes.startup-probe.http-action-path=/q/health/started    # Startup: pod đã start xong? (tránh restart khi startup chậm)

# ──── Service ────
quarkus.kubernetes.service-type=ClusterIP                  # ClusterIP = internal only. LoadBalancer = external (tốn $)
quarkus.kubernetes.ports.http.container-port=8080          # Port container expose

# ──── Environment Variables từ ConfigMap/Secret ────
quarkus.kubernetes.env.configmaps=order-service-config     # Mount toàn bộ ConfigMap thành env vars
quarkus.kubernetes.env.secrets=order-service-secrets        # Mount toàn bộ Secret thành env vars
# quarkus.kubernetes.env.vars.DB_HOST=postgres-service     # Env var cố định
# quarkus.kubernetes.env.mapping.DB_PASSWORD.from-secret=db-credentials  # 1 key từ Secret
# quarkus.kubernetes.env.mapping.DB_PASSWORD.with-key=password           # Key name trong Secret
```

---

## 24. Profile-Specific Config

```properties
# ═══════════════════════════════════════════
# PROFILE-SPECIFIC CONFIGURATION
# ═══════════════════════════════════════════

# Quarkus profiles: dev, test, prod (hoặc custom)
# Prefix: %profile.property=value

# ──── Dev (%dev) — khi chạy `quarkus dev` ────
%dev.quarkus.log.level=DEBUG                               # Log chi tiết cho debug
%dev.quarkus.http.port=8080                                # Port dev server
%dev.quarkus.datasource.devservices.enabled=true           # Tự start DB container
%dev.quarkus.hibernate-orm.database.generation=update      # Tự update schema (tiện nhưng KHÔNG an toàn)
%dev.quarkus.hibernate-orm.log.sql=true                    # In SQL queries ra console
%dev.quarkus.mailer.mock=true                              # Không gửi email thật

# ──── Test (%test) — khi chạy `mvn test` ────
%test.quarkus.http.port=8081                               # Port riêng (tránh conflict với dev)
%test.quarkus.datasource.db-kind=h2                        # Dùng H2 in-memory (nhanh)
%test.quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb       # H2 memory URL
%test.quarkus.hibernate-orm.database.generation=drop-and-create  # Drop + tạo lại schema mỗi test run
%test.quarkus.scheduler.enabled=false                      # Tắt scheduler (tránh side-effects)

# ──── Production (%prod) — khi chạy `java -jar` hoặc native ────
%prod.quarkus.log.level=INFO                               # Chỉ log INFO+ (giảm noise)
%prod.quarkus.log.console.json=true                        # JSON format (cho ELK, CloudWatch)
%prod.quarkus.http.insecure-requests=redirect              # Ép HTTPS
%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}  # URL từ env var
%prod.quarkus.hibernate-orm.database.generation=validate   # CHỈ validate schema (Flyway quản lý)
%prod.quarkus.flyway.migrate-at-start=true                 # Tự migrate khi startup

# ──── Staging (Custom profile — %staging) ────
%staging.quarkus.log.level=DEBUG                           # Staging cần debug nhiều hơn prod
%staging.quarkus.datasource.jdbc.url=jdbc:postgresql://staging-db:5432/mydb  # DB staging riêng

# Chạy với custom profile:
# java -Dquarkus.profile=staging -jar app.jar              # Qua JVM argument
# QUARKUS_PROFILE=staging ./app-runner                     # Qua env var (native)
```

---

## 25. Environment Variables & Secrets

```properties
# ═══════════════════════════════════════════
# ENVIRONMENT VARIABLES & SECRETS
# ═══════════════════════════════════════════

# Quarkus tự map env vars:
#   Property: quarkus.datasource.password
#   Env var:  QUARKUS_DATASOURCE_PASSWORD (uppercase, dots → underscores)

# ──── Default values ────
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mydb}
#                                              ↑ env var      ↑ default value

# ──── Kubernetes Secrets ────
# Cách 1: Env var từ Secret (Kubernetes)
# quarkus.kubernetes.env.mapping.DB_PASSWORD.from-secret=db-credentials
# quarkus.kubernetes.env.mapping.DB_PASSWORD.with-key=password

# Cách 2: File-based secrets (Kubernetes volume mount)
# Mount secret to /etc/secrets/db-password
# quarkus.datasource.password=${file:/etc/secrets/db-password}

# ──── HashiCorp Vault ────
# quarkus.vault.url=https://vault:8200
# quarkus.vault.authentication.userpass.username=admin
# quarkus.vault.authentication.userpass.password=secret
# quarkus.vault.secret-config-kv-path=myapp/config
# quarkus.vault.kv-secret-engine-mount-path=secret

# ──── AWS Secrets Manager ────
# Dùng quarkus-amazon-secretsmanager extension
# Hoặc init container đọc secret → inject env var
```

---

## Template: Production `application.properties`

```properties
# ═══════════════════════════════════════════════════════════
# PRODUCTION TEMPLATE — Copy và chỉnh sửa cho project mới
# ═══════════════════════════════════════════════════════════

# ── App ──
quarkus.application.name=order-service             # Tên app (xuất hiện trong health, metrics, logs)
quarkus.application.version=1.0.0                  # Version app

# ── HTTP ──
quarkus.http.port=8080                             # Port chính
quarkus.http.enable-compression=true               # Gzip response
quarkus.http.limits.max-body-size=10M              # Giới hạn body upload
%prod.quarkus.http.access-log.enabled=true         # Production: bật access log
%prod.quarkus.http.insecure-requests=redirect      # Production: ép HTTPS

# ── CORS ──
quarkus.http.cors=true                             # Bật CORS
quarkus.http.cors.origins=https://myapp.com        # Origin được phép
quarkus.http.cors.methods=GET,POST,PUT,DELETE      # Methods được phép

# ── Database ──
quarkus.datasource.db-kind=postgresql              # Loại DB (BUILD-TIME)
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:orderdb}  # JDBC URL
quarkus.datasource.username=${DB_USER:admin}       # DB user
quarkus.datasource.password=${DB_PASSWORD}         # DB password (từ env var)
quarkus.datasource.jdbc.max-size=20                # Max connections

# ── Hibernate ──
quarkus.hibernate-orm.database.generation=validate # CHỈ validate schema (Flyway quản lý DDL)
quarkus.hibernate-orm.jdbc.statement-batch-size=25 # Batch insert/update (hiệu năng)
quarkus.hibernate-orm.jdbc.timezone=UTC            # Timezone cho date/time

# ── Flyway ──
quarkus.flyway.migrate-at-start=true               # Tự migrate startup
%prod.quarkus.flyway.clean-disabled=true           # CẤM clean production

# ── Redis ──
quarkus.redis.hosts=redis://${REDIS_HOST:localhost}:6379  # Redis URL
quarkus.redis.max-pool-size=8                      # Max connections Redis

# ── Kafka ──
kafka.bootstrap.servers=${KAFKA_BOOTSTRAP:localhost:9092}  # Kafka brokers

# ── OIDC ──
quarkus.oidc.auth-server-url=${OIDC_SERVER_URL}    # OIDC server (Keycloak/Auth0)
quarkus.oidc.client-id=${OIDC_CLIENT_ID}           # Client ID
quarkus.oidc.application-type=service              # Backend API mode (bearer token)

# ── Logging ──
quarkus.log.level=INFO                             # Global log level
%dev.quarkus.log.level=DEBUG                       # Dev: verbose logging
%prod.quarkus.log.console.json=true                # Prod: JSON logs (ELK/CloudWatch)

# ── Health & Metrics ──
quarkus.smallrye-health.root-path=/q/health        # Health endpoint
quarkus.micrometer.export.prometheus.enabled=true  # Prometheus metrics endpoint

# ── Cache ──
quarkus.cache.caffeine."products".expire-after-write=10m  # Cache products 10 phút

# ── Dev Services (dev mode tự start containers) ──
%dev.quarkus.datasource.devservices.enabled=true   # Auto-start PostgreSQL
%dev.quarkus.redis.devservices.enabled=true        # Auto-start Redis
%dev.quarkus.kafka.devservices.enabled=true        # Auto-start Kafka
%dev.quarkus.hibernate-orm.log.sql=true            # In SQL queries
%dev.quarkus.mailer.mock=true                      # Mock email
%test.quarkus.scheduler.enabled=false              # Tắt scheduler trong test
```

**Quay lại:** [README.md](./README.md)
