# RESTful APIs và Spring Boot - Câu hỏi phỏng vấn Java

## Mục lục
1. [REST Principles](#rest-principles)
2. [HTTP Methods](#http-methods)
3. [Spring Boot REST Controller](#spring-boot-rest-controller)
4. [Request/Response Handling](#requestresponse-handling)
5. [Exception Handling](#exception-handling)
6. [Validation](#validation)
7. [Security](#security)
8. [Testing](#testing)
9. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## REST Principles

### REST là gì?

**REST (Representational State Transfer)** là architectural style cho web services.

### RESTful Principles

1. **Stateless**: Mỗi request chứa đầy đủ thông tin
2. **Resource-based**: URLs represent resources
3. **HTTP Methods**: GET, POST, PUT, DELETE, PATCH
4. **Representation**: JSON, XML, etc.
5. **Stateless communication**: Không lưu session state

### RESTful URL Design

```
GET    /api/users           # List all users
GET    /api/users/{id}      # Get user by id
POST   /api/users           # Create new user
PUT    /api/users/{id}      # Update user (full)
PATCH  /api/users/{id}      # Update user (partial)
DELETE /api/users/{id}      # Delete user
```

---

## HTTP Methods

### GET

```java
@GetMapping("/users")
public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(userService.findAll());
}

@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    return userService.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
}
```

### POST

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
    User created = userService.save(user);
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(created);
}
```

### PUT

```java
@PutMapping("/users/{id}")
public ResponseEntity<User> updateUser(
    @PathVariable Long id,
    @RequestBody @Valid User user) {
    User updated = userService.update(id, user);
    return ResponseEntity.ok(updated);
}
```

### PATCH

```java
@PatchMapping("/users/{id}")
public ResponseEntity<User> partialUpdateUser(
    @PathVariable Long id,
    @RequestBody Map<String, Object> updates) {
    User updated = userService.partialUpdate(id, updates);
    return ResponseEntity.ok(updated);
}
```

### DELETE

```java
@DeleteMapping("/users/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteUser(@PathVariable Long id) {
    userService.delete(id);
}
```

---

## Spring Boot REST Controller

### Basic Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
        User created = userService.save(user);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.getId())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
        @PathVariable Long id,
        @RequestBody @Valid User user) {
        return userService.update(id, user)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### @RestController vs @Controller

```java
// @RestController = @Controller + @ResponseBody
@RestController
public class UserController {
    // All methods return JSON/XML (not view names)
}

// @Controller returns view names
@Controller
public class UserViewController {
    @GetMapping("/users")
    public String listUsers(Model model) {
        model.addAttribute("users", userService.findAll());
        return "users/list";  // View name
    }
}
```

---

## Request/Response Handling

### Path Variables

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id).orElse(null);
}

// Multiple path variables
@GetMapping("/users/{userId}/orders/{orderId}")
public Order getOrder(
    @PathVariable Long userId,
    @PathVariable Long orderId) {
    return orderService.findByUserAndOrder(userId, orderId);
}

// Named path variable
@GetMapping("/users/{id}")
public User getUser(@PathVariable("id") Long userId) {
    return userService.findById(userId).orElse(null);
}
```

### Request Parameters

```java
@GetMapping("/users")
public List<User> getUsers(
    @RequestParam(required = false, defaultValue = "0") int page,
    @RequestParam(required = false, defaultValue = "10") int size,
    @RequestParam(required = false) String sortBy) {
    return userService.findAll(page, size, sortBy);
}

// Multiple parameters
@GetMapping("/search")
public List<User> searchUsers(
    @RequestParam String keyword,
    @RequestParam(required = false) Integer minAge,
    @RequestParam(required = false) Integer maxAge) {
    return userService.search(keyword, minAge, maxAge);
}
```

### Request Body

```java
@PostMapping("/users")
public User createUser(@RequestBody User user) {
    return userService.save(user);
}

// With validation
@PostMapping("/users")
public User createUser(@RequestBody @Valid User user) {
    return userService.save(user);
}
```

### Request Headers

```java
@GetMapping("/users")
public List<User> getUsers(@RequestHeader("Authorization") String token) {
    return userService.findAll();
}

// Multiple headers
@GetMapping("/users")
public List<User> getUsers(
    @RequestHeader("Authorization") String token,
    @RequestHeader(value = "X-Request-ID", required = false) String requestId) {
    return userService.findAll();
}
```

### Response Entity

```java
// Custom status code
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
    User created = userService.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}

// Custom headers
@GetMapping("/users/{id}")
public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id).orElse(null);
    if (user == null) {
        return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok()
        .header("X-Custom-Header", "value")
        .body(user);
}

// Location header
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
    User created = userService.save(user);
    URI location = ServletUriComponentsBuilder
        .fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(created.getId())
        .toUri();
    return ResponseEntity.created(location).body(created);
}
```

---

## Exception Handling

### @ControllerAdvice

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation failed",
            errors,
            LocalDateTime.now()
        );
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal server error",
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

### Custom Exception

```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) {
        super("User not found with id: " + id);
    }
}

// Usage
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userService.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
}
```

### Error Response DTO

```java
public class ErrorResponse {
    private int status;
    private String message;
    private Map<String, String> errors;
    private LocalDateTime timestamp;
    
    // Constructors, getters, setters
}
```

---

## Validation

### Bean Validation

```java
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 120, message = "Age must be at most 120")
    private Integer age;
    
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String phone;
}
```

### Validation trong Controller

```java
@PostMapping("/users")
public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
    User created = userService.save(user);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}

@PutMapping("/users/{id}")
public ResponseEntity<User> updateUser(
    @PathVariable Long id,
    @RequestBody @Valid User user) {
    User updated = userService.update(id, user);
    return ResponseEntity.ok(updated);
}
```

### Custom Validator

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email already exists";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        return email != null && !userRepository.existsByEmail(email);
    }
}

// Usage
@Entity
public class User {
    @UniqueEmail
    private String email;
}
```

---

## Security

### Spring Security Basic

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic();
        return http.build();
    }
}
```

### JWT Authentication

```java
@Component
public class JwtTokenProvider {
    private String secret = "secret";
    private long validityInMilliseconds = 3600000; // 1 hour
    
    public String createToken(String username, List<String> roles) {
        Claims claims = Jwts.claims().setSubject(username);
        claims.put("roles", roles);
        Date now = new Date();
        Date validity = new Date(now.getTime() + validityInMilliseconds);
        
        return Jwts.builder()
            .setClaims(claims)
            .setIssuedAt(now)
            .setExpiration(validity)
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(secret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

---

## Testing

### Unit Test

```java
@ExtendWith(MockitoExtension.class)
class UserControllerTest {
    
    @Mock
    private UserService userService;
    
    @InjectMocks
    private UserController userController;
    
    @Test
    void testGetUser() {
        User user = new User();
        user.setId(1L);
        when(userService.findById(1L)).thenReturn(Optional.of(user));
        
        ResponseEntity<User> response = userController.getUser(1L);
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1L, response.getBody().getId());
    }
}
```

### Integration Test

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testGetAllUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }
    
    @Test
    void testCreateUser() throws Exception {
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username").value("testuser"));
    }
}
```

---

## Câu hỏi thường gặp

### Q1: Sự khác biệt giữa PUT và PATCH?

- **PUT**: Update toàn bộ resource (full update)
- **PATCH**: Update một phần resource (partial update)

### Q2: HTTP Status Codes?

- **200 OK**: Success
- **201 Created**: Resource created
- **204 No Content**: Success, no response body
- **400 Bad Request**: Invalid request
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Q3: Pagination trong REST API?

```java
@GetMapping("/users")
public ResponseEntity<Page<User>> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "id") String sortBy) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
    Page<User> users = userService.findAll(pageable);
    return ResponseEntity.ok(users);
}
```

### Q4: CORS Configuration?

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## Best Practices

1. **Use proper HTTP methods** (GET, POST, PUT, DELETE, PATCH)
2. **Return appropriate status codes**
3. **Use @Valid** cho request validation
4. **Handle exceptions** với @ControllerAdvice
5. **Use DTOs** cho request/response
6. **Implement pagination** cho list endpoints
7. **Use proper HTTP headers** (Content-Type, Authorization)
8. **Document APIs** với Swagger/OpenAPI
9. **Version APIs** (/api/v1/users)
10. **Secure APIs** với authentication/authorization

---

## Bài tập thực hành

### Bài 1: CRUD REST API

```java
// Yêu cầu: Implement full CRUD REST API cho User
// - GET /api/users (list with pagination)
// - GET /api/users/{id}
// - POST /api/users
// - PUT /api/users/{id}
// - DELETE /api/users/{id}
// Include validation và error handling
```

### Bài 2: Advanced Features

```java
// Yêu cầu: Implement advanced features
// - Search và filtering
// - Sorting
// - Pagination
// - Custom exception handling
```

---

## Tổng kết

- **REST Principles**: Stateless, resource-based, HTTP methods
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Spring Boot REST**: @RestController, @RequestMapping
- **Request/Response**: Path variables, request params, request body
- **Exception Handling**: @ControllerAdvice, custom exceptions
- **Validation**: Bean Validation, @Valid
- **Security**: Spring Security, JWT
- **Testing**: Unit tests, integration tests
