# REST APIs - Câu hỏi phỏng vấn Quarkus

## Mục lục
1. [RESTEasy Reactive & Smart Dispatching](#resteasy-reactive)
2. [JAX-RS Annotations](#jax-rs-annotations)
3. [Filters & Interceptors](#filters-&-interceptors)
4. [@Provider — JAX-RS Extension Registration](#provider--jax-rs-extension-registration)
5. [Validation](#validation)
6. [REST Client](#rest-client)
7. [Exception Handling](#exception-handling)
8. [Reactive REST](#reactive-rest)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## RESTEasy Reactive

### Architecture & Smart Dispatching

**RESTEasy Reactive** không chỉ là JAX-RS implementation mà còn có cơ chế **Smart Dispatching**:

- **Non-blocking code** (trả về `Uni`, `Multi`): Chạy trực tiếp trên **IO Thread** (Event Loop). Hiệu năng cực cao.
- **Blocking code** (trả về Object, `void`, JPA operations): Tự động chuyển sang **Worker Thread**.
- **@Blocking / @NonBlocking**: Annotation để override hành vi mặc định.

```java
@Path("/hello")
public class HelloResource {

    // Chạy trên Worker Thread (vì trả về String - sync)
    @GET
    public String hello() {
        return "Hello world";
    }

    // Chạy trên IO Thread (vì trả về Uni - async)
    @GET
    @Path("/async")
    public Uni<String> helloAsync() {
        return Uni.createFrom().item("Hello async");
    }
    
    // Ép chạy trên Worker Thread (dù trả về Uni)
    @GET
    @Path("/force-blocking")
    @Blocking
    public Uni<String> heavyTask() {
        return heavyProcessing();
    }
}
```

### Basic REST Resource

```java
// REST Resource
@Path("/users")
public class UserResource {
    @Inject
    UserService userService;
    
    @GET
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    
    @GET
    @Path("/{id}")
    public User getUser(@PathParam("id") Long id) {
        return userService.findById(id);
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser(User user) {
        User created = userService.create(user);
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
    
    @PUT
    @Path("/{id}")
    @Consumes(MediaType.APPLICATION_JSON)
    public User updateUser(@PathParam("id") Long id, User user) {
        return userService.update(id, user);
    }
    
    @DELETE
    @Path("/{id}")
    @Produces(Response.Status.NO_CONTENT)
    public void deleteUser(@PathParam("id") Long id) {
        userService.delete(id);
    }
}
```

---

## JAX-RS Annotations

### Path Annotations

```java
@Path("/api/users")  // Base path
public class UserResource {
    
    @GET
    @Path("/{id}")  // Path parameter
    public User getUser(@PathParam("id") Long id) { }
    
    @GET
    @Path("/search")
    public List<User> searchUsers(@QueryParam("name") String name) { }
    
    @POST
    @Path("/{id}/orders")
    public Order createOrder(@PathParam("id") Long userId, Order order) { }
}
```

### HTTP Methods

```java
@GET      // GET request
@POST     // POST request
@PUT      // PUT request
@DELETE   // DELETE request
@PATCH    // PATCH request
@HEAD     // HEAD request
@OPTIONS  // OPTIONS request
```

### Content Types

```java
@Consumes(MediaType.APPLICATION_JSON)  // Accept JSON input
@Produces(MediaType.APPLICATION_JSON)  // Return JSON output

@Consumes({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
@Produces({MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML})
```

### Context Injection

```java
@GET
public Response get(@Context UriInfo uriInfo, @Context HttpHeaders headers) {
    String path = uriInfo.getPath();
    String auth = headers.getHeaderString("Authorization");
    return Response.ok(path).build();
}
```

---

## Filters & Interceptors

### Server Request/Response Filter

```java
// ContainerRequestFilter: Chạy trước khi vào Resource
@Provider
public class LoggingFilter implements ContainerRequestFilter {
    @Override
    public void filter(ContainerRequestContext context) {
        System.out.println("Request: " + context.getUriInfo().getPath());
    }
}

// ContainerResponseFilter: Chạy sau khi Resource trả về
@Provider
public class HeaderFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        res.getHeaders().add("X-Powered-By", "Quarkus");
    }
}
```

### `@Provider` — JAX-RS Extension Registration

#### `@Provider` là gì?

`@Provider` là annotation của JAX-RS đánh dấu một class là **extension point** — mở rộng hành vi của JAX-RS runtime. Class nào implement một JAX-RS contract (Filter, Interceptor, ExceptionMapper, MessageBodyReader/Writer...) **phải** được đánh dấu `@Provider` để JAX-RS runtime nhận diện và đăng ký.

```java
// KHÔNG có @Provider → JAX-RS KHÔNG biết class này → KHÔNG hoạt động
public class MyFilter implements ContainerRequestFilter { }  // ❌ Bị bỏ qua!

// CÓ @Provider → JAX-RS tự đăng ký
@Provider
public class MyFilter implements ContainerRequestFilter { }  // ✅ Được đăng ký
```

#### 6 Loại Provider trong JAX-RS

| # | Interface | Vai trò | Khi nào chạy |
|---|-----------|---------|-------------|
| ① | `ContainerRequestFilter` | Filter request trước khi vào Resource | Nhận request |
| ② | `ContainerResponseFilter` | Filter response trước khi trả về client | Trả response |
| ③ | `ExceptionMapper<T>` | Chuyển Exception thành HTTP Response | Exception xảy ra |
| ④ | `MessageBodyReader<T>` | Deserialize request body → Java object | `@Consumes` |
| ⑤ | `MessageBodyWriter<T>` | Serialize Java object → response body | `@Produces` |
| ⑥ | `ContextResolver<T>` | Cung cấp context objects (ObjectMapper...) | Framework cần config |

#### Thứ tự thực thi (Execution Pipeline)

```
Client Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│ ① ContainerRequestFilter (@PreMatching)                 │ ← Trước route matching
│    → Authentication, Rate limiting, Logging             │
└────────────────────────┬────────────────────────────────┘
                         │
                    Route Matching (JAX-RS match @Path + @GET/POST)
                         │
┌────────────────────────┴────────────────────────────────┐
│ ① ContainerRequestFilter (post-matching)                │ ← Sau route matching
│    → Authorization, Input validation                    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│ ④ MessageBodyReader                                     │ ← Deserialize JSON → Object
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│ 🎯 Resource Method thực thi                             │ ← Business logic
└────────────────────────┬────────────────────────────────┘
                         │ (nếu Exception → ③ ExceptionMapper)
                         │
┌────────────────────────┴────────────────────────────────┐
│ ⑤ MessageBodyWriter                                     │ ← Serialize Object → JSON
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│ ② ContainerResponseFilter                               │ ← Headers, logging
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
                   Client Response
```

#### Ví dụ chi tiết — Request Filter (Authentication)

```java
@Provider
@Priority(Priorities.AUTHENTICATION)  // Chạy sớm nhất
public class JwtAuthFilter implements ContainerRequestFilter {
    
    @Inject
    JwtService jwtService;

    @Override
    public void filter(ContainerRequestContext ctx) throws IOException {
        // Bỏ qua public endpoints
        if (isPublicPath(ctx.getUriInfo().getPath())) return;

        String token = ctx.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (token == null || !token.startsWith("Bearer ")) {
            // abortWith: DỪNG pipeline, KHÔNG vào Resource
            ctx.abortWith(Response.status(401)
                .entity(new ErrorResponse(401, "Missing token")).build());
            return;
        }
        
        try {
            var claims = jwtService.verify(token.substring(7));
            ctx.setProperty("userId", claims.getSubject());
        } catch (Exception e) {
            ctx.abortWith(Response.status(401)
                .entity(new ErrorResponse(401, "Invalid token")).build());
        }
    }
}
```

#### @PreMatching — Filter trước Route Matching

```java
@Provider
@PreMatching  // Chạy TRƯỚC khi JAX-RS match route → có thể thay đổi method/path
public class MethodOverrideFilter implements ContainerRequestFilter {
    @Override
    public void filter(ContainerRequestContext ctx) {
        // Cho phép client gửi POST với header X-HTTP-Method-Override: DELETE
        String override = ctx.getHeaderString("X-HTTP-Method-Override");
        if (override != null) {
            ctx.setMethod(override);  // POST → DELETE
        }
    }
}
```

#### Response Filter — Security Headers

```java
@Provider
public class SecurityHeadersFilter implements ContainerResponseFilter {
    @Override
    public void filter(ContainerRequestContext req, ContainerResponseContext res) {
        res.getHeaders().add("X-Content-Type-Options", "nosniff");
        res.getHeaders().add("X-Frame-Options", "DENY");
        res.getHeaders().add("X-XSS-Protection", "1; mode=block");
        res.getHeaders().add("Strict-Transport-Security", "max-age=31536000");
        
        // Request timing
        Long startTime = (Long) req.getProperty("startTime");
        if (startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            res.getHeaders().add("X-Response-Time", duration + "ms");
        }
    }
}
```

#### MessageBodyReader — Custom Deserializer (CSV)

```java
@Provider
@Consumes("text/csv")  // Đọc CSV body → List<Product>
public class CsvProductReader implements MessageBodyReader<List<Product>> {

    @Override
    public boolean isReadable(Class<?> type, Type genericType, 
                               Annotation[] annotations, MediaType mediaType) {
        return List.class.isAssignableFrom(type);
    }

    @Override
    public List<Product> readFrom(Class<List<Product>> type, Type genericType,
                                   Annotation[] annotations, MediaType mediaType,
                                   MultivaluedMap<String, String> headers,
                                   InputStream stream) throws IOException {
        return new BufferedReader(new InputStreamReader(stream))
            .lines()
            .skip(1)  // skip header row
            .map(line -> {
                String[] parts = line.split(",");
                return new Product(parts[0], new BigDecimal(parts[1]));
            })
            .toList();
    }
}

// Sử dụng:
@POST
@Consumes("text/csv")
public Response importProducts(List<Product> products) { ... }
```

#### ContextResolver — Custom ObjectMapper (Jackson)

```java
@Provider
public class JacksonConfig implements ContextResolver<ObjectMapper> {
    @Override
    public ObjectMapper getContext(Class<?> type) {
        return new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .setSerializationInclusion(JsonInclude.Include.NON_NULL)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
```

#### @Priority — Điều khiển thứ tự thực thi

```java
// Priorities constants (jakarta.annotation.Priority):
//   AUTHENTICATION   = 1000   ← Chạy đầu tiên
//   AUTHORIZATION    = 2000
//   HEADER_DECORATOR = 3000
//   ENTITY_CODER     = 4000
//   USER             = 5000   ← Chạy cuối cùng

// Số NHỎ hơn → chạy TRƯỚC (RequestFilter)
// Số NHỎ hơn → chạy SAU  (ResponseFilter — ngược lại!)

@Provider
@Priority(Priorities.AUTHENTICATION)     // 1000 — chạy đầu tiên
public class AuthFilter implements ContainerRequestFilter { }

@Provider
@Priority(Priorities.AUTHORIZATION)      // 2000 — chạy thứ hai
public class RoleFilter implements ContainerRequestFilter { }

@Provider
@Priority(Priorities.USER)               // 5000 — chạy cuối
public class LoggingFilter implements ContainerRequestFilter { }
```

#### @NameBinding — Apply Filter cho specific Resources

```java
// 1. Tạo custom annotation
@NameBinding
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Authenticated { }

// 2. Filter CHỈ apply cho resources có @Authenticated
@Provider
@Authenticated  // ← Gắn NameBinding
@Priority(Priorities.AUTHENTICATION)
public class AuthFilter implements ContainerRequestFilter {
    @Override
    public void filter(ContainerRequestContext ctx) {
        // Verify JWT token...
    }
}

// 3. Resource: CHỈ endpoint có @Authenticated mới qua AuthFilter
@Path("/orders")
public class OrderResource {
    
    @GET
    public List<Order> publicList() { ... }          // ← KHÔNG qua AuthFilter
    
    @POST
    @Authenticated                                    // ← CÓ qua AuthFilter
    public Response createOrder(Order order) { ... }
    
    @DELETE
    @Path("/{id}")
    @Authenticated                                    // ← CÓ qua AuthFilter  
    public void deleteOrder(@PathParam("id") Long id) { ... }
}

// Hoặc apply cho TOÀN BỘ class:
@Path("/admin")
@Authenticated      // ← Tất cả endpoints đều qua AuthFilter
public class AdminResource { ... }
```

#### Quarkus vs Standard JAX-RS — Auto Discovery

```
Standard JAX-RS (Tomcat, WildFly...):
  → @Provider phải đăng ký trong Application class hoặc web.xml
  → Một số server yêu cầu đăng ký thủ công

Quarkus:
  → @Provider AUTO-DISCOVER qua Jandex index lúc build
  → KHÔNG cần đăng ký thủ công, KHÔNG cần Application class
  → Chỉ cần @Provider → done!
  
  ⚠️ Nếu @Provider nằm trong thư viện ngoài (jar):
     → Cần thêm Jandex index cho thư viện đó:
     quarkus.index-dependency.my-lib.group-id=com.example
     quarkus.index-dependency.my-lib.artifact-id=my-lib
```

#### Lỗi thường gặp

```java
// ❌ Lỗi 1: Quên @Provider → Filter không hoạt động
public class MyFilter implements ContainerRequestFilter { }
// Fix: Thêm @Provider

// ❌ Lỗi 2: ExceptionMapper<Exception> chặn TẤT CẢ exceptions
@Provider
public class CatchAll implements ExceptionMapper<Exception> { }
// → Chặn luôn 404 NotFound, 405 MethodNotAllowed, validation errors!
// Fix: Dùng @Priority thấp (fallback), HOẶC catch specific exceptions trước

// ❌ Lỗi 3: RequestFilter blocking trên IO thread (Quarkus Reactive)
@Provider
public class SlowFilter implements ContainerRequestFilter {
    public void filter(ContainerRequestContext ctx) {
        Thread.sleep(1000);  // ❌ Block IO thread → app chậm/treo
    }
}
// Fix: Dùng @Blocking annotation, hoặc async filter

// ❌ Lỗi 4: Filter không được CDI inject
@Provider
public class MyFilter implements ContainerRequestFilter {
    @Inject
    MyService service;  // ← NULL nếu class không được CDI quản lý
}
// Fix: Đảm bảo class có @Provider VÀ nằm trong Jandex index
```

#### Câu hỏi phỏng vấn

**Q: `@Provider` dùng để làm gì?**
> Đánh dấu class là JAX-RS extension point. Bất kỳ class nào implement `ContainerRequestFilter`, `ExceptionMapper`, `MessageBodyReader/Writer`... phải có `@Provider` để JAX-RS runtime nhận diện và đăng ký. Trong Quarkus, `@Provider` được auto-discover qua Jandex lúc build.

**Q: Làm sao để Filter chỉ apply cho một số endpoints?**
> Dùng `@NameBinding`: (1) Tạo custom annotation đánh dấu `@NameBinding`, (2) Gắn annotation đó lên cả Filter và Resource/method cần áp dụng. Filter sẽ chỉ chạy cho endpoints có annotation tương ứng.

**Q: Thứ tự thực thi các Filter?**
> Dùng `@Priority(value)`. Số nhỏ chạy trước cho RequestFilter (AUTHENTICATION=1000 → AUTHORIZATION=2000 → USER=5000). ResponseFilter ngược lại (số nhỏ chạy SAU). Nếu không có `@Priority`, thứ tự là undefined.

---

## Validation

Sử dụng Hibernate Validator (Bean Validation).

```java
public class User {
    @NotBlank(message = "Name cannot be empty")
    public String name;
    
    @Min(value = 18, message = "Age must be >= 18")
    public int age;
}

// Resource
@POST
public Response create(@Valid User user) {
    // Tự động validate, ném ConstraintViolationException nếu lỗi
    return Response.ok().build();
}
```

---

## REST Client

Gọi external APIs theo kiểu declarative (interface).

```java
// 1. Định nghĩa Interface
@RegisterRestClient(baseUri = "https://api.example.com")
@Path("/users")
public interface UserClient {
    @GET
    @Path("/{id}")
    Uni<User> getById(@PathParam("id") Long id);
}

// 2. Inject và sử dụng
@ApplicationScoped
public class GatewayService {
    @Inject
    @RestClient
    UserClient userClient;
    
    public Uni<User> fetchRemoteUser(Long id) {
        return userClient.getById(id);
    }
}
```

---

## JSON Serialization

### Jackson

```java
// Jackson: Default JSON serializer
// Automatic serialization/deserialization

@Path("/users")
public class UserResource {
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public User getUser() {
        return new User(1L, "John", "john@example.com");
        // Automatically serialized to JSON
    }
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createUser(User user) {
        // Automatically deserialized from JSON
        return Response.ok().build();
    }
}
```

### Custom Serialization

```java
// Custom serializer
public class UserSerializer extends JsonSerializer<User> {
    @Override
    public void serialize(User user, JsonGenerator gen, SerializerProvider serializers) {
        gen.writeStartObject();
        gen.writeNumberField("id", user.getId());
        gen.writeStringField("name", user.getName());
        gen.writeEndObject();
    }
}

// Register
@Provider
public class UserSerializerProvider implements ContextResolver<ObjectMapper> {
    @Override
    public ObjectMapper getContext(Class<?> type) {
        ObjectMapper mapper = new ObjectMapper();
        SimpleModule module = new SimpleModule();
        module.addSerializer(User.class, new UserSerializer());
        mapper.registerModule(module);
        return mapper;
    }
}
```

---

## Exception Handling

### Exception Mapper

```java
// Exception Mapper
@Provider
public class UserNotFoundExceptionMapper implements ExceptionMapper<UserNotFoundException> {
    @Override
    public Response toResponse(UserNotFoundException exception) {
        ErrorResponse error = new ErrorResponse(
            Response.Status.NOT_FOUND.getStatusCode(),
            exception.getMessage()
        );
        return Response.status(Response.Status.NOT_FOUND).entity(error).build();
    }
}

// Usage
@GET
@Path("/{id}")
public User getUser(@PathParam("id") Long id) {
    return userService.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
}
```

### @ServerExceptionMapper (Quarkus Reactive)

Trong RESTEasy Reactive có thể dùng **@ServerExceptionMapper** — gọn hơn cho từng exception type:

```java
@Path("/users")
public class UserResource {

    @ServerExceptionMapper
    public Response mapNotFound(UserNotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(new ErrorResponse(404, e.getMessage())).build();
    }

    @ServerExceptionMapper
    public Response mapValidation(ConstraintViolationException e) {
        return Response.status(422)
            .entity(new ErrorResponse(422, e.getMessage())).build();
    }
}
```

### Global Exception Handler

```java
// Global exception handler
@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {
    @Override
    public Response toResponse(Exception exception) {
        ErrorResponse error = new ErrorResponse(
            Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(),
            "Internal server error"
        );
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
    }
}
```

---

## Reactive REST

### Reactive Endpoints

```java
// Reactive: Return Uni (Mutiny)
@Path("/users")
public class UserResource {
    @Inject
    UserService userService;
    
    @GET
    @Path("/{id}")
    public Uni<User> getUser(@PathParam("id") Long id) {
        return userService.findByIdAsync(id);
    }
    
    @GET
    public Multi<User> getAllUsers() {
        return userService.findAllAsync();
    }
    
    @POST
    public Uni<Response> createUser(User user) {
        return userService.createAsync(user)
            .map(created -> Response.status(Response.Status.CREATED).entity(created).build());
    }
}
```

### @RunOnVirtualThread (Project Loom)

Java 21+ Virtual Threads cho phép blocking code chạy trên thread ảnh (rất nhiều concurrent) mà không cần chuyển sang reactive. Quarkus hỗ trợ qua **@RunOnVirtualThread**:

```java
@Path("/users")
public class UserResource {

    // Blocking code chạy trên Virtual Thread — không block platform thread
    @GET
    @Path("/{id}")
    @RunOnVirtualThread
    public User getUser(@PathParam("id") Long id) {
        return userService.findById(id);  // Blocking JDBC OK
    }

    @POST
    @RunOnVirtualThread
    @Transactional
    public Response create(User user) {
        userService.create(user);
        return Response.status(201).entity(user).build();
    }
}
```

**Khi nào dùng**: Blocking I/O (JDBC, legacy lib) nhưng cần nhiều concurrent request. **So với Reactive**: Đơn giản hơn (code imperative), phù hợp khi không cần backpressure/streaming.

### Uni và Multi

```java
// Uni: Single value (like Mono in Reactor)
Uni<User> user = userService.findByIdAsync(id);

// Multi: Multiple values (like Flux in Reactor)
Multi<User> users = userService.findAllAsync();

// Chaining
Uni<String> result = userService.findByIdAsync(id)
    .map(User::getName)
    .onFailure().recoverWithItem("Unknown");
```

---

## Câu hỏi thường gặp

### Q1: RESTEasy Reactive vs RESTEasy Classic?

```java
// RESTEasy Reactive:
// - Built on Vert.x
// - Non-blocking I/O
// - Better performance
// - Default in Quarkus

// RESTEasy Classic:
// - Traditional blocking
// - Legacy support
// - Use when: Need blocking behavior
```

### Q2: Khi nào dùng Reactive REST?

```java
// Use Reactive khi:
// - High concurrency
// - I/O-bound operations
// - Non-blocking needed
// - Better resource utilization

// Use Blocking khi:
// - CPU-bound operations
// - Simple CRUD
// - Legacy code
```

---

## Best Practices

1. **Use RESTEasy Reactive**: Default, better performance
2. **Proper exception handling**: Exception mappers
3. **Use reactive**: For I/O-bound operations
4. **Validate input**: Use Bean Validation
5. **Document APIs**: OpenAPI/Swagger

---

## Tổng kết

- **RESTEasy Reactive**: Reactive JAX-RS implementation
- **JAX-RS**: Standard annotations
- **JSON**: Jackson serialization
- **Exception Handling**: Exception mappers
- **Reactive**: Uni và Multi
- **Best Practices**: Reactive first, proper error handling
