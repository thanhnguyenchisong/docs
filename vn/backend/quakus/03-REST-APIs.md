# REST APIs - Câu hỏi phỏng vấn Quarkus

## Mục lục
1. [RESTEasy Reactive & Smart Dispatching](#resteasy-reactive)
2. [JAX-RS Annotations](#jax-rs-annotations)
3. [Filters & Interceptors](#filters-&-interceptors)
4. [Validation](#validation)
5. [REST Client](#rest-client)
6. [Exception Handling](#exception-handling)
7. [Reactive REST](#reactive-rest)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

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
