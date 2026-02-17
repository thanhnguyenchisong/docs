# Security - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Authentication và Authorization](#authentication-và-authorization)
2. [OAuth 2.0 và JWT](#oauth-20-và-jwt)
3. [Service-to-Service Security](#service-to-service-security)
4. [Secrets Management](#secrets-management)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Authentication và Authorization

### Authentication

```java
// Authentication: Verify identity
// Who are you?

// JWT Authentication
@Component
public class JwtAuthenticationFilter implements GatewayFilter {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = extractToken(exchange.getRequest());
        if (validateToken(token)) {
            return chain.filter(exchange);
        }
        return unauthorized(exchange);
    }
}
```

### Authorization

```java
// Authorization: Check permissions
// What can you do?

@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin/users")
public List<User> getAllUsers() {
    return userService.findAll();
}
```

---

## OAuth 2.0 và JWT

### OAuth 2.0 Flow

```java
// OAuth 2.0: Authorization framework
// 1. Client requests authorization
// 2. User authorizes
// 3. Client receives access token
// 4. Client uses token to access resources
```

### JWT

```java
// JWT: JSON Web Token
// Structure: Header.Payload.Signature

// Create JWT
String token = Jwts.builder()
    .setSubject("user123")
    .setExpiration(new Date(System.currentTimeMillis() + 3600000))
    .signWith(SignatureAlgorithm.HS512, secret)
    .compact();

// Validate JWT
Claims claims = Jwts.parser()
    .setSigningKey(secret)
    .parseClaimsJws(token)
    .getBody();
```

---

## Service-to-Service Security

### mTLS

```java
// mTLS: Mutual TLS
// Both client và server authenticate

// Configuration
security:
  protocol: SSL
  ssl:
    truststore-location: /path/to/truststore
    keystore-location: /path/to/keystore
```

---

## Secrets Management

### Vault

```java
// HashiCorp Vault: Secrets management
// Store: Passwords, API keys, certificates

// Access secrets
String password = vault.read("secret/database/password");
```

---

## Câu hỏi thường gặp

### Q1: JWT vs Session?

```java
// JWT:
// - Stateless
// - Scalable
// - No server storage

// Session:
// - Stateful
// - Server storage
// - Simpler revocation
```

---

## Best Practices

1. **Use JWT**: For stateless authentication
2. **Validate tokens**: Always validate
3. **Use HTTPS**: Encrypt communication
4. **Manage secrets**: Use secrets management
5. **Least privilege**: Minimal permissions

---

## Tổng kết

- **Authentication**: Verify identity
- **Authorization**: Check permissions
- **OAuth 2.0**: Authorization framework
- **JWT**: Stateless tokens
- **mTLS**: Service-to-service security
- **Secrets Management**: Secure secrets storage
