# Monitoring và Observability - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Distributed Tracing](#distributed-tracing)
2. [Logging Aggregation](#logging-aggregation)
3. [Metrics và Monitoring](#metrics-và-monitoring)
4. [Health Checks](#health-checks)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Distributed Tracing

### What is Distributed Tracing?

**Distributed Tracing** tracks requests across multiple services để understand system behavior.

### OpenTelemetry

```java
// OpenTelemetry: Distributed tracing
@Configuration
public class TracingConfig {
    @Bean
    public Tracer tracer() {
        return OpenTelemetry.getGlobalTracer("order-service");
    }
}

// Usage
@Service
public class OrderService {
    @Autowired
    private Tracer tracer;
    
    public Order createOrder(OrderRequest request) {
        Span span = tracer.nextSpan().name("create-order").start();
        try {
            // Business logic
            return orderRepository.save(order);
        } finally {
            span.end();
        }
    }
}
```

### Zipkin

```java
// Zipkin: Distributed tracing system
// Configuration
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0
```

---

## Logging Aggregation

### ELK Stack

```java
// ELK: Elasticsearch, Logstash, Kibana
// 1. Services send logs to Logstash
// 2. Logstash processes và sends to Elasticsearch
// 3. Kibana visualizes logs

// Logback configuration
<appender name="STASH" class="net.logstash.logback.appender.LogstashTcpSocketAppender">
    <destination>localhost:5000</destination>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>
```

### Centralized Logging

```java
// Structured logging
logger.info("Order created", 
    kv("orderId", order.getId()),
    kv("userId", order.getUserId()),
    kv("amount", order.getAmount())
);
```

---

## Metrics và Monitoring

### Prometheus

```java
// Prometheus: Metrics collection
@RestController
public class OrderController {
    private final Counter orderCounter = Counter.build()
        .name("orders_created_total")
        .help("Total orders created")
        .register();
    
    @PostMapping("/orders")
    public Order createOrder(@RequestBody OrderRequest request) {
        orderCounter.inc();
        return orderService.createOrder(request);
    }
}
```

### Grafana

```java
// Grafana: Metrics visualization
// Connect to Prometheus
// Create dashboards
// Alert on metrics
```

---

## Health Checks

### Spring Boot Actuator

```java
// Health checks
@RestController
public class HealthController {
    @GetMapping("/actuator/health")
    public ResponseEntity<Health> health() {
        Health health = Health.up()
            .withDetail("database", "UP")
            .withDetail("cache", "UP")
            .build();
        return ResponseEntity.ok(health);
    }
}
```

---

## Câu hỏi thường gặp

### Q1: Distributed Tracing benefits?

```java
// Benefits:
// - Understand request flow
// - Identify bottlenecks
// - Debug issues
// - Performance analysis
```

---

## Best Practices

1. **Distributed Tracing**: Track requests across services
2. **Centralized Logging**: Aggregate all logs
3. **Metrics**: Monitor key metrics
4. **Health Checks**: Monitor service health
5. **Alerting**: Alert on issues

---

## Tổng kết

- **Distributed Tracing**: Track requests across services
- **Logging Aggregation**: Centralized logging
- **Metrics**: Prometheus, Grafana
- **Health Checks**: Monitor service health
