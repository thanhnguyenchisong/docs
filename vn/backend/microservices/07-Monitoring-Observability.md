# Monitoring và Observability - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Observability là gì?](#observability-là-gì)
2. [Ba trụ cột Observability](#ba-trụ-cột-observability)
3. [Distributed Tracing](#distributed-tracing)
4. [Logging Aggregation](#logging-aggregation)
5. [Metrics và Monitoring](#metrics-và-monitoring)
6. [Health Checks](#health-checks)
7. [Alerting](#alerting)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Observability là gì?

**Observability** = khả năng hiểu **trạng thái bên trong** hệ thống từ **output bên ngoài** (logs, metrics, traces). Trong microservices, một request đi qua nhiều service → cần observability để:

- Debug khi request thất bại (service nào lỗi?)
- Tìm bottleneck (service nào chậm?)
- Phát hiện anomaly trước khi user phàn nàn
- Capacity planning (service nào cần scale?)

---

## Ba Trụ Cột Observability

| Trụ cột | Mô tả | Tool phổ biến |
|---------|--------|---------------|
| **Logs** | Sự kiện rời rạc, text: "User X đặt hàng Y" | ELK (Elasticsearch, Logstash, Kibana), Loki, Fluentd |
| **Metrics** | Số liệu time-series: CPU, request count, latency | Prometheus + Grafana, Datadog |
| **Traces** | Theo dõi request xuyên suốt nhiều service | Jaeger, Zipkin, OpenTelemetry |

```
┌──────────────────────────────────────────────────┐
│              Observability Stack                  │
├────────────┬────────────────┬─────────────────────┤
│   Logs     │   Metrics      │   Traces            │
│            │                │                     │
│ ELK/Loki   │ Prometheus     │ OpenTelemetry       │
│ Fluentd    │ Grafana        │ Jaeger / Zipkin     │
│            │                │                     │
│ "Cái gì    │ "Bao nhiêu?    │ "Request đi đâu?    │
│  xảy ra?"  │  Bao lâu?"     │  Chậm ở đâu?"      │
└────────────┴────────────────┴─────────────────────┘
```

---

## Distributed Tracing

### Tại sao cần Distributed Tracing?

Trong microservices, một request API Gateway → Order Service → Payment Service → Notification Service. Nếu chậm hoặc lỗi, cần biết **service nào** và **bước nào** gây ra.

### Khái niệm

- **Trace**: Toàn bộ hành trình của một request qua hệ thống
- **Span**: Một đơn vị công việc trong trace (ví dụ: gọi DB, gọi HTTP service khác)
- **Trace ID**: ID duy nhất theo request xuyên suốt tất cả services
- **Span ID**: ID của mỗi span trong trace
- **Parent Span ID**: Span cha → xây dựng cây trace

### OpenTelemetry (chuẩn mới — khuyến nghị)

```xml
<!-- pom.xml -->
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

```yaml
# application.yml
otel:
  exporter:
    otlp:
      endpoint: http://jaeger:4317
  resource:
    attributes:
      service.name: order-service
```

```java
@Service
public class OrderService {
    private final Tracer tracer;

    public OrderService(Tracer tracer) {
        this.tracer = tracer;
    }

    public Order createOrder(OrderRequest request) {
        Span span = tracer.spanBuilder("create-order")
            .setAttribute("order.userId", request.getUserId())
            .setAttribute("order.itemCount", request.getItems().size())
            .startSpan();

        try (Scope scope = span.makeCurrent()) {
            // Validate
            validateOrder(request);

            // Save order
            Order order = orderRepository.save(toEntity(request));

            // Gọi Payment Service — trace tự propagate qua HTTP headers
            paymentClient.charge(order.getId(), order.getTotal());

            span.setAttribute("order.id", order.getId());
            span.setStatus(StatusCode.OK);
            return order;
        } catch (Exception e) {
            span.setStatus(StatusCode.ERROR, e.getMessage());
            span.recordException(e);
            throw e;
        } finally {
            span.end();
        }
    }
}
```

### Jaeger — Trace Visualization

```yaml
# docker-compose.yml
jaeger:
  image: jaegertracing/all-in-one:1.53
  ports:
    - "16686:16686"   # UI
    - "4317:4317"     # OTLP gRPC
    - "4318:4318"     # OTLP HTTP
  environment:
    COLLECTOR_OTLP_ENABLED: true
```

### Micrometer Tracing (Spring Boot 3+)

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

```yaml
management:
  tracing:
    sampling:
      probability: 1.0   # 100% sampling (dev/staging)
    # production: 0.1 (10%) hoặc adaptive sampling
```

---

## Logging Aggregation

### Structured Logging

```java
// ✅ Structured logging (JSON) — dễ query trong Kibana/Loki
import org.slf4j.Logger;
import static net.logstash.logback.argument.StructuredArguments.*;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order createOrder(OrderRequest request) {
        log.info("Creating order",
            kv("userId", request.getUserId()),
            kv("itemCount", request.getItems().size()),
            kv("totalAmount", request.getTotal())
        );

        try {
            Order order = orderRepository.save(toEntity(request));
            log.info("Order created successfully",
                kv("orderId", order.getId()),
                kv("status", order.getStatus())
            );
            return order;
        } catch (Exception e) {
            log.error("Failed to create order",
                kv("userId", request.getUserId()),
                kv("error", e.getMessage()),
                e  // stack trace
            );
            throw e;
        }
    }
}
```

### ELK Stack Setup

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:8.12.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports: ["9200:9200"]
    volumes:
      - esdata:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.12.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on: [elasticsearch]

  kibana:
    image: kibana:8.12.0
    ports: ["5601:5601"]
    depends_on: [elasticsearch]
```

```conf
# logstash.conf
input {
  tcp {
    port => 5000
    codec => json_lines
  }
}

filter {
  mutate {
    add_field => { "environment" => "production" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
  }
}
```

### Logback config gửi log về Logstash

```xml
<!-- logback-spring.xml -->
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
  </appender>

  <appender name="LOGSTASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>logstash:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder">
      <customFields>{"service":"order-service"}</customFields>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="LOGSTASH"/>
  </root>
</configuration>
```

### Correlation ID — liên kết logs xuyên services

```java
// MDC — Mapped Diagnostic Context
@Component
public class CorrelationIdFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        String correlationId = request.getHeader("X-Correlation-ID");
        if (correlationId == null) {
            correlationId = UUID.randomUUID().toString();
        }
        MDC.put("correlationId", correlationId);
        try {
            chain.doFilter(req, res);
        } finally {
            MDC.clear();
        }
    }
}
```

---

## Metrics và Monitoring

### Prometheus + Micrometer (Spring Boot)

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
  metrics:
    tags:
      application: order-service
```

### Custom Metrics

```java
@Service
public class OrderService {
    private final Counter orderCounter;
    private final Timer orderTimer;
    private final Gauge pendingOrdersGauge;

    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.created.total")
            .description("Total orders created")
            .tag("service", "order-service")
            .register(registry);

        this.orderTimer = Timer.builder("orders.creation.duration")
            .description("Time to create an order")
            .register(registry);

        this.pendingOrdersGauge = Gauge.builder("orders.pending.count",
                orderRepository, repo -> repo.countByStatus("PENDING"))
            .register(registry);
    }

    public Order createOrder(OrderRequest request) {
        return orderTimer.record(() -> {
            Order order = orderRepository.save(toEntity(request));
            orderCounter.increment();
            return order;
        });
    }
}
```

### Prometheus config

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'order-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['order-service:8080']
    # Hoặc service discovery cho K8s:
    # kubernetes_sd_configs: [...]

  - job_name: 'payment-service'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['payment-service:8080']
```

### Grafana Dashboard

Metrics quan trọng cần monitor:

| Metric | Ý nghĩa | Alert threshold |
|--------|---------|-----------------|
| **Request rate** | Số request/giây | Spike bất thường |
| **Error rate** | % request lỗi (5xx) | > 1% |
| **Latency (p99)** | Response time 99th percentile | > 2s |
| **CPU/Memory** | Resource usage | CPU > 80%, Memory > 85% |
| **Connection pool** | Active/idle connections | Active > 80% pool size |
| **Queue depth** | Messages pending | Growing continuously |

**RED method** (cho services):
- **R**ate: Request rate
- **E**rrors: Error rate
- **D**uration: Latency

**USE method** (cho resources):
- **U**tilization: % used
- **S**aturation: Queue depth
- **E**rrors: Error count

---

## Health Checks

### Spring Boot Actuator

```java
@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    @Autowired
    private DataSource dataSource;

    @Override
    public Health health() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                return Health.up()
                    .withDetail("database", "PostgreSQL")
                    .withDetail("status", "Connected")
                    .build();
            }
        } catch (SQLException e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

```yaml
# Kubernetes liveness/readiness
management:
  endpoint:
    health:
      probes:
        enabled: true
  health:
    livenessState:
      enabled: true
    readinessState:
      enabled: true
```

```yaml
# K8s deployment
spec:
  containers:
    - name: order-service
      livenessProbe:
        httpGet:
          path: /actuator/health/liveness
          port: 8080
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /actuator/health/readiness
          port: 8080
        initialDelaySeconds: 10
        periodSeconds: 5
```

---

## Alerting

### Prometheus Alert Rules

```yaml
# alert-rules.yml
groups:
  - name: microservices
    rules:
      - alert: HighErrorRate
        expr: rate(http_server_requests_seconds_count{status=~"5.."}[5m]) / rate(http_server_requests_seconds_count[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 1% trên {{ $labels.service }}"

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 latency > 2s trên {{ $labels.service }}"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
```

---

## Câu hỏi thường gặp

### Distributed Tracing giúp gì?
> Theo dõi request xuyên services; tìm bottleneck; debug lỗi; hiểu dependency giữa services. Không có tracing trong microservices = **đi mò trong bóng tối**.

### OpenTelemetry vs Zipkin vs Jaeger?
> **OpenTelemetry** = chuẩn vendor-neutral (CNCF), hỗ trợ traces + metrics + logs. **Jaeger** và **Zipkin** = backend lưu trữ traces. Dùng OpenTelemetry SDK + Jaeger backend là tổ hợp phổ biến nhất.

### Sampling rate bao nhiêu cho production?
> 100% cho dev/staging. Production: 10-20% hoặc adaptive sampling (sample khi lỗi, skip khi bình thường). Quá nhiều trace = tốn storage.

### ELK vs Loki?
> ELK: full-text search mạnh, UI giàu tính năng; nhưng **tốn resource** (Elasticsearch cần nhiều RAM). Loki: nhẹ hơn, chỉ index labels (không full-text), tích hợp tốt với Grafana. Loki phù hợp team nhỏ/vừa.

---

**Tiếp theo:** [08-Security.md](./08-Security.md)
