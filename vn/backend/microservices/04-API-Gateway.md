# API Gateway - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [API Gateway Pattern](#api-gateway-pattern)
2. [Routing và Load Balancing](#routing-và-load-balancing)
3. [Authentication và Authorization](#authentication-và-authorization)
4. [Rate Limiting](#rate-limiting)
5. [API Gateway Implementations](#api-gateway-implementations)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## API Gateway Pattern

### What is API Gateway?

**API Gateway** là single entry point cho tất cả client requests, routing requests đến appropriate microservices.

### Architecture

```
┌─────────┐
│ Clients │
└────┬────┘
     │
┌────▼──────────────┐
│   API Gateway     │
└────┬──────────────┘
     │
  ┌──┴──┬────────┬────────┐
  │     │        │        │
┌─▼──┐ ┌▼──┐  ┌──▼──┐  ┌──▼──┐
│User│ │Ord│ │Pay │ │Prod │
│Svc │ │Svc│ │Svc │ │Svc │
└────┘ └───┘  └────┘  └────┘
```

### Benefits

1. **Single Entry Point**: Clients chỉ cần biết API Gateway
2. **Routing**: Route requests đến appropriate services
3. **Authentication**: Centralized authentication
4. **Rate Limiting**: Protect services
5. **Load Balancing**: Distribute load
6. **Monitoring**: Centralized logging và metrics

---

## Routing và Load Balancing

### Spring Cloud Gateway

```java
// Spring Cloud Gateway Configuration
@Configuration
public class GatewayConfig {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("lb://user-service"))
            .route("order-service", r -> r
                .path("/api/orders/**")
                .uri("lb://order-service"))
            .build();
    }
}

// application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
```

### Load Balancing

```java
// Load balancing strategies:
// 1. Round-robin (default)
// 2. Least connections
// 3. Weighted round-robin

// Ribbon (Spring Cloud)
user-service:
  ribbon:
    listOfServers: http://user-service-1:8080,http://user-service-2:8080
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RoundRobinRule
```

---

## Authentication và Authorization

### JWT Authentication

```java
// API Gateway validates JWT
@Component
public class JwtAuthenticationFilter implements GatewayFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = extractToken(exchange.getRequest());
        
        if (token != null && validateToken(token)) {
            // Add user info to headers
            ServerHttpRequest request = exchange.getRequest().mutate()
                .header("X-User-Id", getUserId(token))
                .build();
            return chain.filter(exchange.mutate().request(request).build());
        }
        
        return unauthorized(exchange);
    }
}

// Route configuration
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          filters:
            - name: JwtAuthenticationFilter
```

### OAuth 2.0

```java
// OAuth 2.0 với API Gateway
// 1. Client requests token from Authorization Server
// 2. Client includes token in requests
// 3. API Gateway validates token
// 4. API Gateway forwards request với user info
```

---

## Rate Limiting

### Rate Limiting Implementation

```java
// Rate limiting với Redis
@Component
public class RateLimitFilter implements GatewayFilter {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientId = getClientId(exchange.getRequest());
        String key = "rate_limit:" + clientId;
        
        String count = redisTemplate.opsForValue().get(key);
        if (count == null) {
            redisTemplate.opsForValue().set(key, "1", Duration.ofMinutes(1));
            return chain.filter(exchange);
        }
        
        int currentCount = Integer.parseInt(count);
        if (currentCount >= 100) {  // Max 100 requests per minute
            return tooManyRequests(exchange);
        }
        
        redisTemplate.opsForValue().increment(key);
        return chain.filter(exchange);
    }
}
```

---

## API Gateway Implementations

### Spring Cloud Gateway

```java
// Spring Cloud Gateway
// - Reactive, non-blocking
// - Built on Spring WebFlux
// - Route predicates và filters

@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

### Kong

```yaml
# Kong: API Gateway
# Features:
# - Routing
# - Authentication
# - Rate limiting
# - Plugins

# Service definition
services:
  - name: user-service
    url: http://user-service:8080
    routes:
      - name: user-route
        paths:
          - /api/users
```

### AWS API Gateway

```java
// AWS API Gateway
// - Managed service
// - Integration với AWS services
// - Authentication, throttling, caching
```

---

## Câu hỏi thường gặp

### Q1: API Gateway vs Service Mesh?

```java
// API Gateway:
// - North-south traffic (client to services)
// - Single entry point
// - Authentication, rate limiting

// Service Mesh:
// - East-west traffic (service to service)
// - Service-to-service communication
// - mTLS, observability
```

### Q2: Single vs Multiple API Gateways?

```java
// Single API Gateway:
// - Simpler
// - Single point of failure
// - Use for: Small to medium systems

// Multiple API Gateways:
// - Better scalability
// - More complex
// - Use for: Large systems, different client types
```

---

## Best Practices

1. **Single entry point**: All clients through gateway
2. **Authentication**: Centralized at gateway
3. **Rate limiting**: Protect services
4. **Monitoring**: Log all requests
5. **Caching**: Cache responses when appropriate

---

## Tổng kết

- **API Gateway**: Single entry point
- **Routing**: Route to services
- **Authentication**: JWT, OAuth 2.0
- **Rate Limiting**: Protect services
- **Implementations**: Spring Cloud Gateway, Kong, AWS API Gateway
