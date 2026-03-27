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

# Port
quarkus.http.port=8080
%dev.quarkus.http.port=8080
%test.quarkus.http.port=8081

# Host (0.0.0.0 = accept all interfaces)
quarkus.http.host=0.0.0.0

# SSL / HTTPS
quarkus.http.ssl-port=8443
quarkus.http.ssl.certificate.files=/path/to/cert.pem
quarkus.http.ssl.certificate.key-files=/path/to/key.pem
# Hoặc dùng keystore
# quarkus.http.ssl.certificate.key-store-file=/path/to/keystore.jks
# quarkus.http.ssl.certificate.key-store-password=changeit

# Redirect HTTP → HTTPS (production)
%prod.quarkus.http.insecure-requests=redirect

# Request limits
quarkus.http.limits.max-body-size=10M
quarkus.http.limits.max-header-size=16K

# Request timeout
quarkus.http.read-timeout=30s
quarkus.http.idle-timeout=300s

# Compression
quarkus.http.enable-compression=true

# Access log (production monitoring)
quarkus.http.access-log.enabled=true
quarkus.http.access-log.pattern=%h %l %u %t "%r" %s %b "%{i,Referer}" "%{i,User-Agent}" %D
quarkus.http.access-log.log-to-file=true
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

# DB Kind (BUILD-TIME — đổi cần rebuild)
quarkus.datasource.db-kind=postgresql

# Connection URL (RUNTIME)
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mydb}
quarkus.datasource.username=${DB_USER:admin}
quarkus.datasource.password=${DB_PASSWORD:secret}

# Connection Pool (Agroal)
quarkus.datasource.jdbc.min-size=5
quarkus.datasource.jdbc.max-size=20
quarkus.datasource.jdbc.initial-size=5
quarkus.datasource.jdbc.acquisition-timeout=30s
quarkus.datasource.jdbc.idle-removal-interval=5m
quarkus.datasource.jdbc.max-lifetime=30m
quarkus.datasource.jdbc.leak-detection-interval=1m

# Transaction isolation
quarkus.datasource.jdbc.transaction-isolation-level=read-committed

# ──── DEV MODE (Dev Services) ────
# Quarkus tự khởi động PostgreSQL container (Testcontainers)
%dev.quarkus.datasource.devservices.enabled=true
%dev.quarkus.datasource.devservices.image-name=postgres:16-alpine
%dev.quarkus.datasource.devservices.port=5432

# ──── MULTIPLE DATASOURCES ────
# Datasource phụ (named)
quarkus.datasource.reporting.db-kind=postgresql
quarkus.datasource.reporting.jdbc.url=jdbc:postgresql://reporting-host:5432/reports
quarkus.datasource.reporting.username=${REPORTING_DB_USER}
quarkus.datasource.reporting.password=${REPORTING_DB_PASSWORD}
quarkus.datasource.reporting.jdbc.max-size=5
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

quarkus.datasource.reactive.url=postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:mydb}
quarkus.datasource.reactive.max-size=20
quarkus.datasource.reactive.idle-timeout=PT5M
quarkus.datasource.reactive.trust-all=false

# SSL
# quarkus.datasource.reactive.trust-certificate-pem.certs=/path/to/cert.pem
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

# Single host
quarkus.redis.hosts=redis://${REDIS_HOST:localhost}:${REDIS_PORT:6379}
# Với password
# quarkus.redis.hosts=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:6379

# Connection pool
quarkus.redis.max-pool-size=8
quarkus.redis.max-pool-waiting=24
quarkus.redis.reconnect-attempts=5
quarkus.redis.reconnect-interval=1s

# SSL
# quarkus.redis.tls.enabled=true
# quarkus.redis.tls.trust-all=false

# ──── Redis Cluster ────
# quarkus.redis.hosts=redis://node1:6379,redis://node2:6379,redis://node3:6379
# quarkus.redis.client-type=cluster

# ──── Redis Sentinel ────
# quarkus.redis.hosts=redis://sentinel1:26379,redis://sentinel2:26379
# quarkus.redis.client-type=sentinel
# quarkus.redis.master-name=mymaster

# ──── Dev Services ────
%dev.quarkus.redis.devservices.enabled=true
%dev.quarkus.redis.devservices.image-name=redis:7-alpine
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

quarkus.mongodb.connection-string=mongodb://${MONGO_HOST:localhost}:${MONGO_PORT:27017}
quarkus.mongodb.database=${MONGO_DB:mydb}
# Auth
# quarkus.mongodb.credentials.username=${MONGO_USER}
# quarkus.mongodb.credentials.password=${MONGO_PASSWORD}
# quarkus.mongodb.credentials.auth-source=admin

# Connection pool
quarkus.mongodb.max-pool-size=20
quarkus.mongodb.min-pool-size=5
quarkus.mongodb.connect-timeout=10s
quarkus.mongodb.socket-timeout=30s

# Replica set
# quarkus.mongodb.connection-string=mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs0

# SSL
# quarkus.mongodb.tls=true
# quarkus.mongodb.tls-insecure=false

# Dev Services
%dev.quarkus.mongodb.devservices.enabled=true
%dev.quarkus.mongodb.devservices.image-name=mongo:7
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
mp.messaging.outgoing.order-events-out.connector=smallrye-kafka
mp.messaging.outgoing.order-events-out.topic=order-events
mp.messaging.outgoing.order-events-out.value.serializer=io.quarkus.kafka.client.serialization.ObjectMapperSerializer
# Key serializer
mp.messaging.outgoing.order-events-out.key.serializer=org.apache.kafka.common.serialization.StringSerializer
# Acks
mp.messaging.outgoing.order-events-out.acks=all
# Retries
mp.messaging.outgoing.order-events-out.retries=3

# ──── CONSUMER (Incoming) ────
# Channel name = "order-events-in"
mp.messaging.incoming.order-events-in.connector=smallrye-kafka
mp.messaging.incoming.order-events-in.topic=order-events
mp.messaging.incoming.order-events-in.group.id=order-service
mp.messaging.incoming.order-events-in.value.deserializer=io.quarkus.kafka.client.serialization.ObjectMapperDeserializer
mp.messaging.incoming.order-events-in.auto.offset.reset=earliest
# Commit strategy
mp.messaging.incoming.order-events-in.commit-strategy=throttled
mp.messaging.incoming.order-events-in.throttled.unprocessed-record-max-age.ms=60000
# Concurrency
mp.messaging.incoming.order-events-in.partitions=3

# ──── Dead Letter Queue ────
mp.messaging.incoming.order-events-in.failure-strategy=dead-letter-queue
mp.messaging.incoming.order-events-in.dead-letter-queue.topic=order-events-dlq

# ──── Kafka SSL/SASL (Production) ────
# kafka.security.protocol=SASL_SSL
# kafka.sasl.mechanism=PLAIN
# kafka.sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
#   username="${KAFKA_USER}" password="${KAFKA_PASSWORD}";

# ──── Kafka Schema Registry (Avro) ────
# mp.messaging.outgoing.order-events-out.value.serializer=io.confluent.kafka.serializers.KafkaAvroSerializer
# mp.messaging.outgoing.order-events-out.schema.registry.url=http://schema-registry:8081

# Dev Services
%dev.quarkus.kafka.devservices.enabled=true
%dev.quarkus.kafka.devservices.image-name=confluentinc/cp-kafka:7.5.0
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

# Connection
rabbitmq-host=${RABBITMQ_HOST:localhost}
rabbitmq-port=${RABBITMQ_PORT:5672}
rabbitmq-username=${RABBITMQ_USER:guest}
rabbitmq-password=${RABBITMQ_PASSWORD:guest}
rabbitmq-virtual-host=/

# SSL
# rabbitmq-ssl=true

# ──── PRODUCER ────
mp.messaging.outgoing.notifications-out.connector=smallrye-rabbitmq
mp.messaging.outgoing.notifications-out.exchange.name=notifications
mp.messaging.outgoing.notifications-out.exchange.type=topic
mp.messaging.outgoing.notifications-out.default-routing-key=notification.email

# ──── CONSUMER ────
mp.messaging.incoming.notifications-in.connector=smallrye-rabbitmq
mp.messaging.incoming.notifications-in.queue.name=email-notifications
mp.messaging.incoming.notifications-in.exchange.name=notifications
mp.messaging.incoming.notifications-in.routing-keys=notification.email,notification.sms
# Auto-ack
mp.messaging.incoming.notifications-in.auto-acknowledgement=false
# Prefetch (concurrency control)
mp.messaging.incoming.notifications-in.max-outstanding-messages=10
# DLQ
mp.messaging.incoming.notifications-in.auto-bind-dlq=true
mp.messaging.incoming.notifications-in.dead-letter-exchange=notifications-dlx
mp.messaging.incoming.notifications-in.dead-letter-routing-key=failed

# Dev Services
%dev.quarkus.rabbitmq.devservices.enabled=true
%dev.quarkus.rabbitmq.devservices.image-name=rabbitmq:3-management-alpine
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

# Mỗi @RegisterRestClient có config riêng (key = configKey hoặc FQCN)
quarkus.rest-client.user-api.url=https://api.example.com
quarkus.rest-client.user-api.connect-timeout=5000
quarkus.rest-client.user-api.read-timeout=10000

# Retry & Circuit Breaker (SmallRye Fault Tolerance)
quarkus.rest-client.user-api.max-retries=3

# SSL
# quarkus.rest-client.user-api.trust-store=/path/to/truststore.jks
# quarkus.rest-client.user-api.trust-store-password=changeit

# ──── Multiple clients ────
quarkus.rest-client.payment-api.url=https://payment.example.com
quarkus.rest-client.payment-api.connect-timeout=3000

quarkus.rest-client.notification-api.url=https://notify.example.com
quarkus.rest-client.notification-api.connect-timeout=2000

# ──── Propagate headers ────
# quarkus.rest-client.user-api.providers=com.example.AuthHeaderProvider
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
quarkus.micrometer.enabled=true
quarkus.micrometer.export.prometheus.enabled=true
quarkus.micrometer.export.prometheus.path=/q/metrics

# Binder configs (tự động thu thập)
quarkus.micrometer.binder.http-server.enabled=true
quarkus.micrometer.binder.http-client.enabled=true
quarkus.micrometer.binder.jvm=true
quarkus.micrometer.binder.system=true

# Custom tags
quarkus.micrometer.export.prometheus.default-registry=true

# Histogram buckets (cho latency tracking)
# quarkus.micrometer.export.prometheus.histogram-expiry=1m
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

quarkus.mailer.from=noreply@example.com
quarkus.mailer.host=${SMTP_HOST:smtp.gmail.com}
quarkus.mailer.port=${SMTP_PORT:587}
quarkus.mailer.username=${SMTP_USER}
quarkus.mailer.password=${SMTP_PASSWORD}
quarkus.mailer.start-tls=REQUIRED
quarkus.mailer.auth-methods=LOGIN

# Mock (dev/test — không gửi thật, log ra console)
%dev.quarkus.mailer.mock=true
%test.quarkus.mailer.mock=true
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

quarkus.flyway.migrate-at-start=true
quarkus.flyway.locations=db/migration
quarkus.flyway.baseline-on-migrate=true
quarkus.flyway.baseline-version=0

# Clean (NGUY HIỂM — chỉ dev/test)
%dev.quarkus.flyway.clean-at-start=false
%test.quarkus.flyway.clean-at-start=true
%prod.quarkus.flyway.clean-disabled=true   # ← CHẶN clean ở production

# Validate
quarkus.flyway.validate-on-migrate=true

# Multiple datasources
# quarkus.flyway.reporting.migrate-at-start=true
# quarkus.flyway.reporting.locations=db/reporting-migration

# ═══════════════════════════════════════════
# LIQUIBASE (Alternative)
# ═══════════════════════════════════════════

# quarkus.liquibase.migrate-at-start=true
# quarkus.liquibase.change-log=db/changelog/db.changelog-master.xml
```

> **Tip**: Khi dùng Flyway, set `quarkus.hibernate-orm.database.generation=validate` — Flyway quản lý schema, Hibernate chỉ validate.

---

## 20. CORS

### Config

```properties
# ═══════════════════════════════════════════
# CORS (Cross-Origin Resource Sharing)
# ═══════════════════════════════════════════

quarkus.http.cors=true
quarkus.http.cors.origins=https://myapp.com,https://admin.myapp.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS
quarkus.http.cors.headers=Content-Type,Authorization,X-Requested-With
quarkus.http.cors.exposed-headers=X-Total-Count,X-Page
quarkus.http.cors.access-control-max-age=24H
quarkus.http.cors.access-control-allow-credentials=true

# Dev: cho phép tất cả origins
%dev.quarkus.http.cors.origins=/.*/
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

# Server
quarkus.grpc.server.port=9000
quarkus.grpc.server.host=0.0.0.0

# SSL
# quarkus.grpc.server.ssl.certificate=/path/to/cert.pem
# quarkus.grpc.server.ssl.key=/path/to/key.pem

# Client
quarkus.grpc.clients.user-service.host=user-service
quarkus.grpc.clients.user-service.port=9000
# quarkus.grpc.clients.user-service.tls.enabled=true

# Health
quarkus.grpc.server.health.enabled=true

# Reflection (dev/debug)
%dev.quarkus.grpc.server.enable-reflection-service=true
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

quarkus.websocket.max-frame-size=65536
quarkus.websocket.dispatch-to-worker=true
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

# Container image
quarkus.container-image.group=my-company
quarkus.container-image.name=order-service
quarkus.container-image.tag=${quarkus.application.version}
quarkus.container-image.registry=123456789.dkr.ecr.ap-southeast-1.amazonaws.com
# Build image khi package
# quarkus.container-image.build=true
# Push image
# quarkus.container-image.push=true

# Kubernetes manifest generation
quarkus.kubernetes.namespace=production
quarkus.kubernetes.replicas=3
quarkus.kubernetes.image-pull-policy=always

# Resources
quarkus.kubernetes.resources.requests.cpu=250m
quarkus.kubernetes.resources.requests.memory=256Mi
quarkus.kubernetes.resources.limits.cpu=500m
quarkus.kubernetes.resources.limits.memory=512Mi

# Health probes (auto-configured nếu có quarkus-smallrye-health)
quarkus.kubernetes.liveness-probe.http-action-path=/q/health/live
quarkus.kubernetes.readiness-probe.http-action-path=/q/health/ready
quarkus.kubernetes.startup-probe.http-action-path=/q/health/started

# Service
quarkus.kubernetes.service-type=ClusterIP
quarkus.kubernetes.ports.http.container-port=8080

# Environment variables from ConfigMap/Secret
quarkus.kubernetes.env.configmaps=order-service-config
quarkus.kubernetes.env.secrets=order-service-secrets
# Hoặc specific vars:
# quarkus.kubernetes.env.vars.DB_HOST=postgres-service
# quarkus.kubernetes.env.mapping.DB_PASSWORD.from-secret=db-credentials
# quarkus.kubernetes.env.mapping.DB_PASSWORD.with-key=password
```

---

## 24. Profile-Specific Config

```properties
# ═══════════════════════════════════════════
# PROFILE-SPECIFIC CONFIGURATION
# ═══════════════════════════════════════════

# Quarkus profiles: dev, test, prod (hoặc custom)
# Prefix: %profile.property=value

# ──── Dev ────
%dev.quarkus.log.level=DEBUG
%dev.quarkus.http.port=8080
%dev.quarkus.datasource.devservices.enabled=true
%dev.quarkus.hibernate-orm.database.generation=update
%dev.quarkus.hibernate-orm.log.sql=true
%dev.quarkus.mailer.mock=true

# ──── Test ────
%test.quarkus.http.port=8081
%test.quarkus.datasource.db-kind=h2
%test.quarkus.datasource.jdbc.url=jdbc:h2:mem:testdb
%test.quarkus.hibernate-orm.database.generation=drop-and-create
%test.quarkus.scheduler.enabled=false

# ──── Production ────
%prod.quarkus.log.level=INFO
%prod.quarkus.log.console.json=true
%prod.quarkus.http.insecure-requests=redirect
%prod.quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}
%prod.quarkus.hibernate-orm.database.generation=validate
%prod.quarkus.flyway.migrate-at-start=true

# ──── Staging (Custom profile) ────
%staging.quarkus.log.level=DEBUG
%staging.quarkus.datasource.jdbc.url=jdbc:postgresql://staging-db:5432/mydb

# Chạy với custom profile:
# java -Dquarkus.profile=staging -jar app.jar
# QUARKUS_PROFILE=staging ./app-runner
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
quarkus.application.name=order-service
quarkus.application.version=1.0.0

# ── HTTP ──
quarkus.http.port=8080
quarkus.http.enable-compression=true
quarkus.http.limits.max-body-size=10M
%prod.quarkus.http.access-log.enabled=true
%prod.quarkus.http.insecure-requests=redirect

# ── CORS ──
quarkus.http.cors=true
quarkus.http.cors.origins=https://myapp.com
quarkus.http.cors.methods=GET,POST,PUT,DELETE

# ── Database ──
quarkus.datasource.db-kind=postgresql
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:orderdb}
quarkus.datasource.username=${DB_USER:admin}
quarkus.datasource.password=${DB_PASSWORD}
quarkus.datasource.jdbc.max-size=20

# ── Hibernate ──
quarkus.hibernate-orm.database.generation=validate
quarkus.hibernate-orm.jdbc.statement-batch-size=25
quarkus.hibernate-orm.jdbc.timezone=UTC

# ── Flyway ──
quarkus.flyway.migrate-at-start=true
%prod.quarkus.flyway.clean-disabled=true

# ── Redis ──
quarkus.redis.hosts=redis://${REDIS_HOST:localhost}:6379
quarkus.redis.max-pool-size=8

# ── Kafka ──
kafka.bootstrap.servers=${KAFKA_BOOTSTRAP:localhost:9092}

# ── OIDC ──
quarkus.oidc.auth-server-url=${OIDC_SERVER_URL}
quarkus.oidc.client-id=${OIDC_CLIENT_ID}
quarkus.oidc.application-type=service

# ── Logging ──
quarkus.log.level=INFO
%dev.quarkus.log.level=DEBUG
%prod.quarkus.log.console.json=true

# ── Health & Metrics ──
quarkus.smallrye-health.root-path=/q/health
quarkus.micrometer.export.prometheus.enabled=true

# ── Cache ──
quarkus.cache.caffeine."products".expire-after-write=10m

# ── Dev Services ──
%dev.quarkus.datasource.devservices.enabled=true
%dev.quarkus.redis.devservices.enabled=true
%dev.quarkus.kafka.devservices.enabled=true
%dev.quarkus.hibernate-orm.log.sql=true
%dev.quarkus.mailer.mock=true
%test.quarkus.scheduler.enabled=false
```

**Quay lại:** [README.md](./README.md)
