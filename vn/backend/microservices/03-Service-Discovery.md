# Service Discovery - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Service Discovery là gì?](#service-discovery-là-gì)
2. [Client-side Discovery](#client-side-discovery)
3. [Server-side Discovery](#server-side-discovery)
4. [Service Registry](#service-registry)
5. [Service Mesh](#service-mesh)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Service Discovery là gì?

### Problem

```java
// Problem: Services need to find each other
// Hard-coded URLs don't work in dynamic environments

// ❌ Bad: Hard-coded
String userServiceUrl = "http://user-service:8080";

// ✅ Good: Service Discovery
UserServiceClient client = serviceDiscovery.getService("user-service");
```

### Solution

**Service Discovery** cho phép services tự động discover và communicate với nhau mà không cần hard-coded URLs.

---

## Client-side Discovery

### How it works

```java
// Client-side Discovery:
// 1. Service registers với Service Registry
// 2. Client queries Service Registry
// 3. Client chooses service instance
// 4. Client calls service directly

Service Registry
    ↑
    │ Query
    │
Client → Service Instance
```

### Implementation

```java
// Eureka Client (Spring Cloud)
@SpringBootApplication
@EnableEurekaClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// Service Registration
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    hostname: order-service
    port: 8080

// Service Discovery
@Service
public class UserServiceClient {
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private DiscoveryClient discoveryClient;
    
    public User getUser(Long id) {
        // Discover service
        List<ServiceInstance> instances = discoveryClient.getInstances("user-service");
        ServiceInstance instance = instances.get(0);  // Load balance
        
        String url = "http://" + instance.getHost() + ":" + instance.getPort() + "/api/users/" + id;
        return restTemplate.getForObject(url, User.class);
    }
}
```

---

## Server-side Discovery

### How it works

```java
// Server-side Discovery:
// 1. Service registers với Service Registry
// 2. Client calls Load Balancer
// 3. Load Balancer queries Service Registry
// 4. Load Balancer routes to service instance

Client → Load Balancer → Service Registry
                          ↓
                    Service Instance
```

### Implementation

```java
// Kubernetes Service Discovery
// Service automatically registered
// DNS-based discovery

// Service definition
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080

// Client calls via service name
String url = "http://user-service/api/users/" + id;
// Kubernetes DNS resolves to service instances
```

---

## Service Registry

### Eureka (Netflix)

```java
// Eureka Server
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}

// Configuration
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false

// Eureka Client
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    lease-renewal-interval-in-seconds: 30
    lease-expiration-duration-in-seconds: 90
```

### Consul

```java
// Consul: Service discovery và configuration
// Features:
// - Service discovery
// - Health checking
// - Key-value store
// - Multi-datacenter

// Service Registration
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
    
    @Bean
    public ConsulServiceRegistry consulServiceRegistry(ConsulClient consulClient) {
        return new ConsulServiceRegistry(consulClient, new ConsulRegistration());
    }
}
```

### Zookeeper

```java
// Zookeeper: Distributed coordination
// Used by: Kafka, etc.

// Service Registration
CuratorFramework client = CuratorFrameworkFactory.newClient("localhost:2181", ...);
client.start();

// Register service
ServiceDiscovery<ServiceDetails> serviceDiscovery = ServiceDiscoveryBuilder
    .builder(ServiceDetails.class)
    .client(client)
    .basePath("services")
    .build();
serviceDiscovery.start();
```

---

## Service Mesh

### What is Service Mesh?

**Service Mesh** là infrastructure layer để handle service-to-service communication.

### Istio

```yaml
# Istio: Service mesh
# Features:
# - Traffic management
# - Security
# - Observability

# VirtualService
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
    - user-service
  http:
    - route:
        - destination:
            host: user-service
            subset: v1
          weight: 90
        - destination:
            host: user-service
            subset: v2
          weight: 10
```

### Linkerd

```yaml
# Linkerd: Lightweight service mesh
# Automatic mTLS
# Observability
# Traffic splitting
```

---

## Câu hỏi thường gặp

### Q1: Client-side vs Server-side Discovery?

```java
// Client-side:
// - Client queries registry
// - Client chooses instance
// - More complex client
// - Better performance (no proxy)

// Server-side:
// - Load balancer queries registry
// - Simpler client
// - Additional hop (load balancer)
// - Better for polyglot environments
```

### Q2: Service Registry patterns?

```java
// Pattern 1: Self-registration
// Service registers itself
// Pros: Simple
// Cons: Coupling với registry

// Pattern 2: Third-party registration
// External service registers
// Pros: Decoupling
// Cons: More complex
```

### Q3: Health Checks?

```java
// Health checks để:
// - Remove unhealthy instances
// - Prevent routing to failed services

// Eureka health check
eureka:
  instance:
    health-check-url-path: /actuator/health
    health-check-url: http://localhost:8080/actuator/health
```

---

## Best Practices

1. **Use service discovery**: Don't hard-code URLs
2. **Health checks**: Remove unhealthy instances
3. **Load balancing**: Distribute load evenly
4. **Circuit breaker**: Prevent cascading failures
5. **Service mesh**: For complex environments

---

## Tổng kết

- **Service Discovery**: Auto-discover services
- **Client-side**: Client queries registry
- **Server-side**: Load balancer queries registry
- **Service Registry**: Eureka, Consul, Zookeeper
- **Service Mesh**: Istio, Linkerd
- **Best Practices**: Health checks, load balancing
