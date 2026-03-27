# Security trong Microservices - Câu hỏi phỏng vấn

## Mục lục
1. [Security Challenges trong Microservices](#security-challenges-trong-microservices)
2. [Authentication & Authorization](#authentication--authorization)
3. [Service-to-Service Authentication](#service-to-service-authentication)
4. [API Gateway Security](#api-gateway-security)
5. [mTLS — Mutual TLS](#mtls--mutual-tls)
6. [Service Mesh Security](#service-mesh-security)
7. [Secrets Management](#secrets-management)
8. [Best Practices & Checklist](#best-practices--checklist)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Security Challenges trong Microservices

| Challenge | Monolith | Microservices |
|-----------|---------|---------------|
| **Attack surface** | 1 entry point | Nhiều services, nhiều endpoints |
| **Network** | In-process calls | Network calls (có thể bị intercept) |
| **Auth** | 1 session store | Token-based, mỗi service verify |
| **Secrets** | 1 config file | Nhiều services cần secrets riêng |
| **Trust** | All code trusted | Service-to-service cần auth |

---

## Authentication & Authorization

### JWT Token Flow

```
┌──────┐    ┌───────────┐    ┌──────────────┐    ┌──────────────┐
│Client│───→│API Gateway │───→│Order Service │───→│Payment       │
│      │    │(verify JWT)│    │(extract user)│    │Service       │
└──────┘    └───────────┘    └──────────────┘    └──────────────┘
  │              │
  │ 1. Login     │
  │─────────────→│─→ Auth Service (issue JWT)
  │←─────────────│←─ JWT token
  │              │
  │ 2. Request   │
  │ + JWT header │
  │─────────────→│ verify JWT → extract claims → forward to service
```

### Spring Security + JWT

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/**").authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter()))
            )
            .build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withJwkSetUri("http://auth-service/.well-known/jwks.json").build();
    }
}
```

### Role-Based Access Control (RBAC)

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<OrderDto> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return orderService.getOrdersByUser(userId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @orderSecurity.isOwner(#id, authentication)")
    public void deleteOrder(@PathVariable Long id) {
        orderService.delete(id);
    }
}

@Component("orderSecurity")
public class OrderSecurity {
    @Autowired
    private OrderRepository orderRepository;

    public boolean isOwner(Long orderId, Authentication auth) {
        return orderRepository.findById(orderId)
            .map(order -> order.getUserId().equals(auth.getName()))
            .orElse(false);
    }
}
```

---

## Service-to-Service Authentication

### Cách 1: JWT Token Propagation

```java
// Service A → Service B: forward JWT token
@FeignClient(name = "payment-service", configuration = FeignAuthConfig.class)
public interface PaymentClient {
    @PostMapping("/api/payments")
    PaymentResponse charge(@RequestBody PaymentRequest request);
}

@Configuration
public class FeignAuthConfig {
    @Bean
    public RequestInterceptor authInterceptor() {
        return template -> {
            // Lấy JWT từ SecurityContext và forward
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth instanceof JwtAuthenticationToken jwtAuth) {
                template.header("Authorization", "Bearer " + jwtAuth.getToken().getTokenValue());
            }
        };
    }
}
```

### Cách 2: Service Account (Client Credentials)

```java
// Service lấy token riêng (không phải user token) để gọi service khác
@Service
public class ServiceTokenProvider {
    private final WebClient authClient;

    public String getServiceToken() {
        return authClient.post()
            .uri("/oauth/token")
            .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                .with("client_id", "order-service")
                .with("client_secret", "${service.secret}"))
            .retrieve()
            .bodyToMono(TokenResponse.class)
            .map(TokenResponse::getAccessToken)
            .block();
    }
}
```

---

## API Gateway Security

```yaml
# Spring Cloud Gateway — rate limiting + auth
spring:
  cloud:
    gateway:
      routes:
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter:
                  replenishRate: 100      # 100 req/s
                  burstCapacity: 200
            - RemoveRequestHeader=Cookie
            - StripPrefix=1
```

```java
// Rate limiting per user
@Bean
public KeyResolver userKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getHeaders().getFirst("X-User-Id") != null
            ? exchange.getRequest().getHeaders().getFirst("X-User-Id")
            : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
    );
}
```

---

## mTLS — Mutual TLS

### mTLS là gì?

**Mutual TLS** = cả client lẫn server đều xác thực certificate của nhau. Trong microservices: service A gọi service B → cả hai verify certificate → đảm bảo không bị man-in-the-middle.

```
Service A ──── mTLS ────→ Service B
  │ (client cert)           │ (server cert)
  │ Verify B's cert         │ Verify A's cert
  └─────────────────────────┘
  Encrypted + Authenticated both ways
```

### Spring Boot mTLS Config

```yaml
server:
  ssl:
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    # mTLS: yêu cầu client certificate
    client-auth: need
    trust-store: classpath:truststore.p12
    trust-store-password: ${SSL_TRUSTSTORE_PASSWORD}
```

---

## Service Mesh Security

### Istio — Automatic mTLS

```yaml
# Istio PeerAuthentication — bật mTLS tự động
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT   # Tất cả traffic phải mTLS
```

```yaml
# Istio AuthorizationPolicy — RBAC cho services
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: order-service-policy
spec:
  selector:
    matchLabels:
      app: order-service
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/api-gateway"]
            principals: ["cluster.local/ns/production/sa/payment-service"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/orders/*"]
```

### Lợi ích Service Mesh cho Security

| Feature | Không Service Mesh | Có Service Mesh (Istio) |
|---------|-------------------|------------------------|
| **mTLS** | Tự cấu hình mỗi service | Tự động, transparent |
| **AuthZ** | Trong code mỗi service | Policy tập trung (YAML) |
| **Traffic** | Không kiểm soát | Network policies |
| **Cert rotation** | Manual | Tự động |

---

## Secrets Management

### Kubernetes Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: order-service-secrets
type: Opaque
data:
  db-password: cGFzc3dvcmQ=   # base64
  jwt-secret: bXktc2VjcmV0     # base64
```

### HashiCorp Vault (production)

```java
// Spring Cloud Vault
@Configuration
@VaultPropertySource("secret/order-service")
public class VaultConfig {
    @Value("${db.password}")
    private String dbPassword;  // Đọc từ Vault, không hardcode
}
```

```yaml
# application.yml
spring:
  cloud:
    vault:
      uri: https://vault.internal:8200
      authentication: KUBERNETES
      kubernetes:
        role: order-service
        service-account-token-file: /var/run/secrets/kubernetes.io/serviceaccount/token
```

---

## Best Practices & Checklist

- [ ] **JWT** cho user authentication; verify tại Gateway hoặc mỗi service
- [ ] **mTLS** giữa services (dùng service mesh nếu có thể)
- [ ] **RBAC** cho authorization; principle of least privilege
- [ ] **API Gateway** rate limiting, DDoS protection
- [ ] **Secrets** trong Vault hoặc K8s Secrets (không trong code/image)
- [ ] **Input validation** tại mỗi service (đừng trust service khác)
- [ ] **Audit logging** ghi lại mọi action quan trọng
- [ ] **Network policies** giới hạn service nào gọi service nào
- [ ] **Dependency scanning** (CVE) + container image scanning
- [ ] **CORS** chỉ cho phép origins cần thiết

---

## Câu hỏi thường gặp

### Sự khác nhau giữa Authentication và Authorization?
> **Authentication** = xác thực DANH TÍNH (bạn là ai? → JWT, username/password). **Authorization** = xác thực QUYỀN (bạn được làm gì? → RBAC, policies).

### JWT vs Session trong microservices?
> **JWT** phù hợp microservices: stateless, mỗi service tự verify (không cần shared session store). **Session** cần centralized store (Redis) → thêm dependency, single point of failure.

### Service Mesh có bắt buộc không?
> Không. Hệ thống nhỏ (< 10 services) có thể dùng mTLS thủ công. Khi > 20 services → service mesh giảm complexity và centralize security policies.

### Zero Trust Architecture là gì?
> Mô hình security **không tin bất kỳ ai** — kể cả internal network. Mọi request phải authenticated + authorized. Microservices **nên** theo Zero Trust: mTLS + JWT + network policies.

---

**Tiếp theo:** [09-Deployment-DevOps.md](./09-Deployment-DevOps.md)
