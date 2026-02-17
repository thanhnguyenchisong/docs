# Spring Framework - Câu hỏi phỏng vấn Java

## Mục lục
1. [Spring Core Concepts](#spring-core-concepts)
2. [Dependency Injection (DI)](#dependency-injection-di)
3. [IoC (Inversion of Control) - Chi tiết](#ioc-inversion-of-control---chi-tiết)
4. [IoC Container](#ioc-container)
5. [Bean Scopes](#bean-scopes)
6. [Annotations](#annotations)
7. [AOP (Aspect-Oriented Programming)](#aop-aspect-oriented-programming)
8. [Spring MVC](#spring-mvc)
9. [Spring WebFlux (Reactive)](#spring-webflux-reactive)
10. [Data Access/Integration](#data-accessintegration)
10. [Validation](#validation)
11. [Resource Management](#resource-management)
12. [Environment Abstraction](#environment-abstraction)
13. [Caching Abstraction](#caching-abstraction)
14. [Task Scheduling](#task-scheduling)
15. [Internationalization (i18n)](#internationalization-i18n)
16. [Spring Boot](#spring-boot)
17. [Testing Framework](#testing-framework)
18. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
19. [Best Practices](#best-practices)
20. [Bài tập thực hành](#bài-tập-thực-hành)
21. [Advanced Spring Topics](#advanced-spring-topics)
22. [Advanced Interview Questions](#advanced-interview-questions)
23. [Tổng kết](#tổng-kết)

---

## Spring Core Concepts

### Spring Framework là gì?

Spring là một **lightweight, inversion of control (IoC)** và **aspect-oriented (AOP)** framework cho Java.

### Core Features

- **Dependency Injection (DI)**
- **Inversion of Control (IoC)**
- **Aspect-Oriented Programming (AOP)**
- **MVC Framework**
- **Transaction Management**
- **Exception Handling**

### Spring Modules

Spring Framework được chia thành các modules chính:

```
Spring Framework
├── Core Container
│   ├── spring-core (IoC, DI)
│   ├── spring-beans (Bean Factory)
│   ├── spring-context (Application Context)
│   └── spring-expression (SpEL)
├── Data Access/Integration
│   ├── spring-jdbc (JDBC Support)
│   ├── spring-orm (ORM Integration)
│   ├── spring-tx (Transaction Management)
│   └── spring-jms (JMS Support)
├── Web
│   ├── spring-web (Web Support)
│   ├── spring-webmvc (Spring MVC)
│   └── spring-webflux (Reactive Web)
├── AOP & Aspects
│   ├── spring-aop (AOP Framework)
│   └── spring-aspects (AspectJ Integration)
├── Messaging
│   └── spring-messaging (Message Abstraction)
├── Testing
│   └── spring-test (Testing Framework)
└── Instrumentation
    └── spring-instrument (Class Instrumentation)
```

---

## Dependency Injection (DI)

### Vấn đề: Tight Coupling

```java
// ❌ Bad: Tight coupling
class UserService {
    private UserRepository userRepository = new UserRepositoryImpl();
    
    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}
```

### Giải pháp: Dependency Injection

```java
// ✅ Good: Loose coupling với DI
class UserService {
    private UserRepository userRepository;
    
    // Constructor Injection
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}
```

### Types of DI

#### 1. Constructor Injection (Recommended)

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

#### 2. Setter Injection

```java
@Service
public class UserService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

#### 3. Field Injection

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

**Lưu ý:** Field injection không recommended vì khó test và không thể make field final.

---

## IoC (Inversion of Control) - Chi tiết

### IoC là gì?

**Inversion of Control (IoC)** là một design principle trong đó việc kiểm soát luồng của ứng dụng được đảo ngược so với cách truyền thống.

#### Cách truyền thống (Traditional Control Flow):

```java
// ❌ Traditional: Object tự tạo và quản lý dependencies
class UserService {
    private UserRepository userRepository;
    
    public UserService() {
        // Object tự tạo dependency
        this.userRepository = new UserRepositoryImpl();
    }
    
    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}
```

**Vấn đề:**
- Tight coupling: `UserService` phụ thuộc trực tiếp vào `UserRepositoryImpl`
- Khó test: Không thể mock `UserRepository` trong unit test
- Khó thay đổi: Muốn đổi implementation phải sửa code
- Vi phạm Dependency Inversion Principle (SOLID)

#### Cách với IoC (Inverted Control Flow):

```java
// ✅ IoC: Framework (Spring) tạo và quản lý objects
class UserService {
    private UserRepository userRepository;
    
    // Dependency được inject từ bên ngoài
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;  // Spring inject vào đây
    }
    
    public User getUser(Long id) {
        return userRepository.findById(id);
    }
}
```

**Lợi ích:**
- Loose coupling: `UserService` chỉ phụ thuộc vào interface
- Dễ test: Có thể inject mock object
- Linh hoạt: Dễ dàng thay đổi implementation
- Tuân thủ SOLID principles

### IoC Container là gì?

**IoC Container** (còn gọi là **Dependency Injection Container**) là trái tim của Spring Framework. Nó có nhiệm vụ:

1. **Tạo và quản lý objects (Beans)**
2. **Inject dependencies** vào các objects
3. **Quản lý vòng đời** của objects (lifecycle)
4. **Cấu hình** các objects

#### Cách hoạt động:

```
1. Spring đọc configuration (XML, Java Config, hoặc Annotations)
2. Tạo các Bean definitions
3. Tạo instances của các Beans
4. Inject dependencies giữa các Beans
5. Quản lý lifecycle của Beans
```

#### Ví dụ minh họa:

```java
// Configuration
@Configuration
@ComponentScan("com.example")
public class AppConfig {
}

// Service
@Service
public class UserService {
    private final UserRepository userRepository;
    
    // Constructor injection - Spring tự động inject
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// Repository
@Repository
public class UserRepositoryImpl implements UserRepository {
    // Spring tự động tạo instance
}

// Sử dụng
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
UserService userService = context.getBean(UserService.class);
// Spring đã tự động:
// 1. Tạo UserRepositoryImpl
// 2. Tạo UserService
// 3. Inject UserRepositoryImpl vào UserService
```

### So sánh: IoC vs DI

**IoC (Inversion of Control):**
- Là một **principle/pattern** rộng hơn
- Đảo ngược quyền kiểm soát luồng của ứng dụng
- Framework kiểm soát thay vì application code

**DI (Dependency Injection):**
- Là một **cách triển khai** của IoC
- Cụ thể: Inject dependencies vào objects
- Có nhiều cách: Constructor, Setter, Field injection

**Mối quan hệ:**
- DI là một implementation của IoC
- Spring sử dụng DI để thực hiện IoC
- Không phải tất cả IoC đều dùng DI (có thể dùng Service Locator pattern)

### Các loại IoC Container trong Spring

#### 1. BeanFactory (Basic Container)

```java
// BeanFactory - Lazy loading
BeanFactory factory = new XmlBeanFactory(new ClassPathResource("beans.xml"));
UserService userService = (UserService) factory.getBean("userService");
// Bean chỉ được tạo khi getBean() được gọi
```

**Đặc điểm:**
- Basic IoC container
- **Lazy loading**: Bean chỉ được tạo khi cần
- Lightweight, ít tài nguyên
- Không hỗ trợ AOP, events, i18n
- Ít được sử dụng trong thực tế

#### 2. ApplicationContext (Advanced Container)

```java
// ApplicationContext - Eager loading
ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
UserService userService = context.getBean(UserService.class);
// Tất cả singleton beans được tạo ngay khi context khởi tạo
```

**Đặc điểm:**
- Extends BeanFactory
- **Eager loading**: Singleton beans được tạo ngay khi start
- Hỗ trợ đầy đủ: AOP, events, i18n, messaging
- Được sử dụng rộng rãi trong Spring Boot

### Các loại ApplicationContext

```java
// 1. ClassPathXmlApplicationContext - Từ classpath
ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");

// 2. FileSystemXmlApplicationContext - Từ file system
ApplicationContext context = new FileSystemXmlApplicationContext("C:/config/applicationContext.xml");

// 3. AnnotationConfigApplicationContext - Từ Java Config
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);

// 4. WebApplicationContext - Cho web applications
// Tự động được tạo bởi Spring MVC
```

### IoC Container hoạt động như thế nào?

#### Quy trình chi tiết:

```
1. LOADING PHASE (Tải cấu hình)
   ├── Đọc XML/Java Config/Annotations
   ├── Parse và tạo BeanDefinition objects
   └── Lưu vào BeanDefinitionRegistry

2. VALIDATION PHASE (Kiểm tra)
   ├── Validate BeanDefinitions
   ├── Kiểm tra circular dependencies
   └── Kiểm tra required dependencies

3. INSTANTIATION PHASE (Tạo instances)
   ├── Tạo singleton beans (nếu eager loading)
   ├── Gọi constructor
   └── Set properties

4. INITIALIZATION PHASE (Khởi tạo)
   ├── Inject dependencies
   ├── Gọi @PostConstruct
   ├── Gọi InitializingBean.afterPropertiesSet()
   └── Gọi custom init methods

5. READY PHASE (Sẵn sàng)
   └── Beans sẵn sàng để sử dụng

6. DESTRUCTION PHASE (Hủy - khi context đóng)
   ├── Gọi @PreDestroy
   ├── Gọi DisposableBean.destroy()
   └── Gọi custom destroy methods
```

#### Ví dụ minh họa chi tiết:

```java
// 1. Configuration
@Configuration
public class AppConfig {
    @Bean
    public UserRepository userRepository() {
        System.out.println("1. Creating UserRepository bean");
        return new UserRepositoryImpl();
    }
    
    @Bean
    public UserService userService(UserRepository userRepository) {
        System.out.println("2. Creating UserService bean");
        System.out.println("3. Injecting UserRepository into UserService");
        return new UserService(userRepository);
    }
}

// 2. Service với lifecycle callbacks
@Service
public class UserService implements InitializingBean, DisposableBean {
    private UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        System.out.println("4. UserService constructor called");
        this.userRepository = userRepository;
    }
    
    @PostConstruct
    public void init() {
        System.out.println("5. @PostConstruct called");
    }
    
    @Override
    public void afterPropertiesSet() {
        System.out.println("6. afterPropertiesSet() called");
    }
    
    @PreDestroy
    public void cleanup() {
        System.out.println("7. @PreDestroy called");
    }
    
    @Override
    public void destroy() {
        System.out.println("8. destroy() called");
    }
}

// 3. Sử dụng
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
// Output:
// 1. Creating UserRepository bean
// 2. Creating UserService bean
// 3. Injecting UserRepository into UserService
// 4. UserService constructor called
// 5. @PostConstruct called
// 6. afterPropertiesSet() called
```

### Lợi ích của IoC

1. **Loose Coupling**
   - Components không phụ thuộc trực tiếp vào implementations
   - Dễ dàng thay đổi và mở rộng

2. **Testability**
   - Dễ dàng inject mock objects
   - Unit testing đơn giản hơn

3. **Maintainability**
   - Code dễ đọc và dễ bảo trì
   - Tách biệt concerns

4. **Flexibility**
   - Có thể thay đổi implementation mà không sửa code
   - Configuration-driven development

5. **Reusability**
   - Components có thể tái sử dụng
   - Dễ dàng compose các components

### Câu hỏi thường gặp về IoC

#### Q1: IoC là gì? Giải thích đơn giản?

**Trả lời:**
IoC (Inversion of Control) là một nguyên tắc thiết kế trong đó:
- **Truyền thống**: Object tự tạo và quản lý dependencies của nó
- **Với IoC**: Framework (Spring) tạo và quản lý objects, inject dependencies

**Ví dụ đơn giản:**
```java
// Không có IoC: Tự tạo
UserService service = new UserService(new UserRepository());

// Có IoC: Spring tạo và inject
@Autowired
UserService service;  // Spring tự động tạo và inject dependencies
```

#### Q2: IoC và DI khác nhau như thế nào?

**Trả lời:**
- **IoC**: Là nguyên tắc/pattern rộng (đảo ngược quyền kiểm soát)
- **DI**: Là cách triển khai cụ thể của IoC (inject dependencies)

**Mối quan hệ:**
- DI là một implementation của IoC
- Spring sử dụng DI để thực hiện IoC
- Có thể có IoC mà không dùng DI (ví dụ: Service Locator pattern)

#### Q3: BeanFactory vs ApplicationContext?

**Trả lời:**

| Tiêu chí | BeanFactory | ApplicationContext |
|----------|-------------|-------------------|
| **Loading** | Lazy loading | Eager loading |
| **Features** | Basic IoC | Full features (AOP, events, i18n) |
| **Performance** | Nhẹ hơn | Nặng hơn |
| **Usage** | Ít dùng | Được dùng rộng rãi |
| **Events** | Không hỗ trợ | Hỗ trợ đầy đủ |

**Khi nào dùng gì:**
- **BeanFactory**: Khi cần lightweight container, ít tài nguyên
- **ApplicationContext**: Hầu hết các trường hợp, đặc biệt trong Spring Boot

#### Q4: IoC Container tạo beans như thế nào?

**Trả lời:**
Quy trình:
1. **Đọc configuration** (XML/Java/Annotations)
2. **Tạo BeanDefinitions** từ configuration
3. **Tạo instances** (singleton hoặc prototype)
4. **Inject dependencies** (constructor/setter/field)
5. **Initialize** (@PostConstruct, InitializingBean)
6. **Bean sẵn sàng** để sử dụng

**Ví dụ:**
```java
// Spring tự động:
// 1. Tìm @Service, @Repository, @Component
// 2. Tạo BeanDefinition
// 3. Tạo instance
// 4. Inject dependencies
// 5. Gọi @PostConstruct
// 6. Bean ready
```

#### Q5: Lazy loading vs Eager loading?

**Trả lời:**

**Eager Loading (ApplicationContext):**
- Beans được tạo ngay khi container khởi tạo
- Phát hiện lỗi sớm (startup time)
- Tốn tài nguyên hơn

**Lazy Loading (BeanFactory hoặc @Lazy):**
- Beans chỉ được tạo khi cần (lazy initialization)
- Tiết kiệm tài nguyên
- Lỗi chỉ phát hiện khi sử dụng

**Ví dụ:**
```java
// Eager (default)
@Service
public class UserService { }  // Tạo ngay khi start

// Lazy
@Service
@Lazy
public class UserService { }  // Chỉ tạo khi được inject/sử dụng
```

#### Q6: Tại sao cần IoC Container?

**Trả lời:**
1. **Quản lý dependencies tự động**: Không cần tự tạo và quản lý
2. **Lifecycle management**: Quản lý vòng đời objects
3. **Configuration centralization**: Cấu hình tập trung
4. **Cross-cutting concerns**: AOP, transactions, security
5. **Testing**: Dễ dàng mock và test

**Không có IoC:**
```java
// Phải tự quản lý tất cả
UserRepository repo = new UserRepositoryImpl();
TransactionManager tx = new TransactionManager();
UserService service = new UserService(repo, tx);
// Phức tạp và khó maintain
```

**Có IoC:**
```java
// Spring tự động quản lý
@Autowired
UserService service;  // Đơn giản!
```

---

## IoC Container

### ApplicationContext vs BeanFactory

**BeanFactory:**
- Basic IoC container
- Lazy loading
- Lightweight

**ApplicationContext:**
- Extends BeanFactory
- Eager loading
- Additional features (AOP, events, i18n)

### Configuration

#### 1. XML Configuration

```xml
<!-- applicationContext.xml -->
<beans>
    <bean id="userRepository" class="com.example.UserRepositoryImpl"/>
    <bean id="userService" class="com.example.UserService">
        <constructor-arg ref="userRepository"/>
    </bean>
</beans>
```

```java
ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
UserService userService = context.getBean(UserService.class);
```

#### 2. Java Configuration

```java
@Configuration
public class AppConfig {
    @Bean
    public UserRepository userRepository() {
        return new UserRepositoryImpl();
    }
    
    @Bean
    public UserService userService(UserRepository userRepository) {
        return new UserService(userRepository);
    }
}
```

```java
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
UserService userService = context.getBean(UserService.class);
```

#### 3. Component Scanning (Recommended)

```java
@Configuration
@ComponentScan(basePackages = "com.example")
public class AppConfig {
}

// Or in Spring Boot
@SpringBootApplication  // Includes @ComponentScan
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## Bean Scopes

Bean Scope xác định lifecycle và visibility của một bean trong Spring container. Mỗi scope có đặc điểm riêng về cách tạo, quản lý và hủy bean.

### Tổng quan các Scopes

| Scope | Mô tả | Context | Thread-safe? |
|-------|-------|---------|--------------|
| **singleton** | Một instance duy nhất per container | Tất cả | Phụ thuộc implementation |
| **prototype** | Tạo instance mới mỗi lần request | Tất cả | Mỗi instance riêng biệt |
| **request** | Một instance per HTTP request | Web | Mỗi request thread riêng |
| **session** | Một instance per HTTP session | Web | Mỗi session riêng |
| **application** | Một instance per ServletContext | Web | Shared across sessions |
| **websocket** | Một instance per WebSocket session | WebSocket | Mỗi WebSocket session riêng |

---

### 1. Singleton (Default)

**Đặc điểm:**
- **Một instance duy nhất** cho mỗi Spring IoC container
- Được tạo khi container khởi tạo (eager) hoặc khi lần đầu được request (lazy)
- Sống trong suốt lifecycle của container
- **Default scope** - không cần khai báo `@Scope`

**Khi nào dùng:**
- Services, Repositories, Controllers (stateless)
- Shared resources, utilities
- Configuration beans
- **Không dùng** cho beans có state (có thể gây race condition)

**Ví dụ:**

```java
@Component
@Scope("singleton")  // Default
public class UserService {
    // One instance per Spring container
}
```

### Prototype

```java
@Component
@Scope("prototype")
public class UserService {
    // New instance mỗi lần request
}
```

### Request (Web)

```java
@Component
@Scope("request")
public class UserService {
    // One instance per HTTP request
}
```

### Session (Web)

```java
@Component
@Scope("session")
public class UserService {
    // One instance per HTTP session
}
```

### Application (Web)

```java
@Component
@Scope("application")
public class UserService {
    // One instance per ServletContext
}
```

### WebSocket (Web)

```java
@Component
@Scope("websocket")
public class UserService {
    // One instance per WebSocket session
}
```

---

## Annotations

### Core Annotations

#### @Component

```java
@Component
public class UserService {
    // Generic Spring component
}
```

#### @Service

```java
@Service
public class UserService {
    // Service layer component
}
```

#### @Repository

```java
@Repository
public class UserRepositoryImpl implements UserRepository {
    // Data access layer component
    // Exception translation enabled
}
```

#### @Controller

```java
@Controller
public class UserController {
    // Web layer component
}
```

#### @Autowired

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    // Constructor injection (preferred)
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

#### @Qualifier

```java
interface PaymentService {}

@Service("creditCard")
class CreditCardService implements PaymentService {}

@Service("paypal")
class PayPalService implements PaymentService {}

@Service
class OrderService {
    @Autowired
    @Qualifier("creditCard")
    private PaymentService paymentService;
}
```

#### @Primary

```java
@Service
@Primary
class DefaultPaymentService implements PaymentService {}

@Service
class OrderService {
    @Autowired
    private PaymentService paymentService;  // Uses DefaultPaymentService
}
```

#### @Value

```java
@Component
public class AppConfig {
    @Value("${app.name}")
    private String appName;
    
    @Value("${app.version:1.0.0}")  // Default value
    private String appVersion;
    
    @Value("#{systemProperties['java.home']}")
    private String javaHome;
}
```

#### @Configuration và @Bean

```java
@Configuration
public class DatabaseConfig {
    @Bean
    public DataSource dataSource() {
        return new HikariDataSource();
    }
    
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new SimpleCacheManager();
    }
}
```

#### @Profile

```java
@Configuration
@Profile("dev")
public class DevConfig {
    // Configuration for development
}

@Configuration
@Profile("prod")
public class ProdConfig {
    // Configuration for production
}
```

---

## AOP (Aspect-Oriented Programming)

### Concepts

- **Aspect**: Module cross-cutting concerns
- **Join Point**: Point trong execution (method call, exception)
- **Pointcut**: Expression để match join points
- **Advice**: Action tại join point
- **Weaving**: Apply aspects to objects

### Types of Advice

- **Before**: Execute trước method
- **After**: Execute sau method (success hoặc failure)
- **AfterReturning**: Execute sau method return successfully
- **AfterThrowing**: Execute sau method throw exception
- **Around**: Execute before và after method

### Example

```java
// Aspect
@Aspect
@Component
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(LoggingAspect.class);
    
    // Pointcut: All methods in service package
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}
    
    // Before advice
    @Before("serviceMethods()")
    public void logBefore(JoinPoint joinPoint) {
        logger.info("Before: " + joinPoint.getSignature().getName());
    }
    
    // After returning
    @AfterReturning(pointcut = "serviceMethods()", returning = "result")
    public void logAfterReturning(JoinPoint joinPoint, Object result) {
        logger.info("After returning: " + result);
    }
    
    // After throwing
    @AfterThrowing(pointcut = "serviceMethods()", throwing = "exception")
    public void logAfterThrowing(JoinPoint joinPoint, Exception exception) {
        logger.error("Exception: " + exception.getMessage());
    }
    
    // Around advice
    @Around("serviceMethods()")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long executionTime = System.currentTimeMillis() - start;
        logger.info("Execution time: " + executionTime + "ms");
        return result;
    }
}
```

### Pointcut Expressions

```java
// Execution
@Pointcut("execution(* com.example.service.*.*(..))")
// Return type: *, Package: com.example.service, Method: *, Parameters: (..)

// Within
@Pointcut("within(com.example.service..*)")
// All methods in service package and subpackages

// This
@Pointcut("this(com.example.service.UserService)")
// All methods in UserService

// Target
@Pointcut("target(com.example.service.UserService)")
// All methods implementing UserService

// Args
@Pointcut("args(Long, String)")
// Methods with Long and String parameters

// Annotation
@Pointcut("@annotation(com.example.annotation.Logged)")
// Methods annotated with @Logged
```

---

## Spring MVC

### Architecture

```
Client Request
    ↓
DispatcherServlet
    ↓
HandlerMapping → Controller
    ↓
ModelAndView
    ↓
ViewResolver → View
    ↓
Response
```

### Controller

```java
@Controller
@RequestMapping("/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET /users
    @GetMapping
    public String listUsers(Model model) {
        model.addAttribute("users", userService.findAll());
        return "users/list";
    }
    
    // GET /users/{id}
    @GetMapping("/{id}")
    public String getUser(@PathVariable Long id, Model model) {
        model.addAttribute("user", userService.findById(id));
        return "users/detail";
    }
    
    // POST /users
    @PostMapping
    public String createUser(@ModelAttribute User user) {
        userService.save(user);
        return "redirect:/users";
    }
    
    // PUT /users/{id}
    @PutMapping("/{id}")
    @ResponseBody
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user);
    }
    
    // DELETE /users/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
}
```

### REST Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    
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
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

---

## Spring WebFlux (Reactive)

### Reactive Programming

Spring WebFlux là reactive web framework, sử dụng reactive streams (Reactor) thay vì servlet API.

#### Reactive vs Traditional

```java
// Traditional (Blocking)
@RestController
public class UserController {
    
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);  // Blocking call
    }
}

// Reactive (Non-blocking)
@RestController
public class UserController {
    
    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        return userService.findById(id);  // Non-blocking
    }
    
    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        return userService.findAll();  // Stream of users
    }
}
```

### Reactive Types

#### Mono và Flux

```java
@Service
public class UserService {
    
    // Mono: 0-1 element
    public Mono<User> findById(Long id) {
        return Mono.just(new User(id, "John", "john@example.com"))
            .delayElement(Duration.ofMillis(100));
    }
    
    // Flux: 0-N elements
    public Flux<User> findAll() {
        return Flux.just(
            new User(1L, "John", "john@example.com"),
            new User(2L, "Jane", "jane@example.com")
        ).delayElements(Duration.ofMillis(100));
    }
    
    // Error handling
    public Mono<User> findByIdWithError(Long id) {
        return Mono.error(new UserNotFoundException("User not found"))
            .onErrorReturn(new User(0L, "Default", "default@example.com"));
    }
}
```

### Reactive Controllers

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    // GET single resource
    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    // GET collection
    @GetMapping
    public Flux<User> getAllUsers() {
        return userService.findAll();
    }
    
    // POST
    @PostMapping
    public Mono<ResponseEntity<User>> createUser(@RequestBody Mono<User> userMono) {
        return userService.save(userMono)
            .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }
    
    // PUT
    @PutMapping("/{id}")
    public Mono<ResponseEntity<User>> updateUser(
            @PathVariable Long id,
            @RequestBody Mono<User> userMono) {
        return userService.update(id, userMono)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    // DELETE
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable Long id) {
        return userService.delete(id)
            .then(Mono.just(ResponseEntity.noContent().build()));
    }
    
    // Server-Sent Events
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<User> streamUsers() {
        return userService.findAll()
            .delayElements(Duration.ofSeconds(1));
    }
}
```

### Functional Endpoints

```java
@Configuration
public class RouterConfig {
    
    @Bean
    public RouterFunction<ServerResponse> routes(UserHandler userHandler) {
        return RouterFunctions.route()
            .GET("/api/users", userHandler::getAllUsers)
            .GET("/api/users/{id}", userHandler::getUser)
            .POST("/api/users", userHandler::createUser)
            .PUT("/api/users/{id}", userHandler::updateUser)
            .DELETE("/api/users/{id}", userHandler::deleteUser)
            .build();
    }
}

@Component
public class UserHandler {
    
    @Autowired
    private UserService userService;
    
    public Mono<ServerResponse> getAllUsers(ServerRequest request) {
        Flux<User> users = userService.findAll();
        return ServerResponse.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(users, User.class);
    }
    
    public Mono<ServerResponse> getUser(ServerRequest request) {
        Long id = Long.parseLong(request.pathVariable("id"));
        Mono<User> user = userService.findById(id);
        return user
            .flatMap(u -> ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(u))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
    
    public Mono<ServerResponse> createUser(ServerRequest request) {
        Mono<User> userMono = request.bodyToMono(User.class);
        return userMono
            .flatMap(userService::save)
            .flatMap(user -> ServerResponse.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(user));
    }
}
```

### Reactive Repository

```java
@Repository
public interface UserRepository extends ReactiveCrudRepository<User, Long> {
    Flux<User> findByName(String name);
    Mono<User> findByEmail(String email);
}

// Usage
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Mono<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Flux<User> findAll() {
        return userRepository.findAll();
    }
    
    public Mono<User> save(User user) {
        return userRepository.save(user);
    }
}
```

### WebClient (Reactive HTTP Client)

```java
@Service
public class ExternalApiService {
    
    private final WebClient webClient;
    
    public ExternalApiService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://api.example.com")
            .build();
    }
    
    public Mono<User> getUser(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(User.class);
    }
    
    public Flux<User> getAllUsers() {
        return webClient.get()
            .uri("/users")
            .retrieve()
            .bodyToFlux(User.class);
    }
    
    public Mono<User> createUser(User user) {
        return webClient.post()
            .uri("/users")
            .bodyValue(user)
            .retrieve()
            .bodyToMono(User.class);
    }
}

// Configuration
@Configuration
public class WebClientConfig {
    
    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
            .defaultHeader("Content-Type", "application/json")
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024));
    }
}
```

### Error Handling

```java
@RestControllerAdvice
public class GlobalErrorHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public Mono<ResponseEntity<ErrorResponse>> handleUserNotFound(UserNotFoundException ex) {
        ErrorResponse error = new ErrorResponse("USER_NOT_FOUND", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(error));
    }
    
    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ErrorResponse>> handleGeneric(Exception ex) {
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error));
    }
}
```

### Testing Reactive Code

```java
@SpringBootTest
@AutoConfigureWebTestClient
class UserControllerTest {
    
    @Autowired
    private WebTestClient webTestClient;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() {
        User user = new User(1L, "John", "john@example.com");
        when(userService.findById(1L)).thenReturn(Mono.just(user));
        
        webTestClient.get()
            .uri("/api/users/1")
            .exchange()
            .expectStatus().isOk()
            .expectBody(User.class)
            .value(u -> {
                assertThat(u.getId()).isEqualTo(1L);
                assertThat(u.getName()).isEqualTo("John");
            });
    }
    
    @Test
    void testGetAllUsers() {
        Flux<User> users = Flux.just(
            new User(1L, "John", "john@example.com"),
            new User(2L, "Jane", "jane@example.com")
        );
        when(userService.findAll()).thenReturn(users);
        
        webTestClient.get()
            .uri("/api/users")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(User.class)
            .hasSize(2);
    }
}
```

---

## Data Access/Integration

### Spring JDBC

Spring cung cấp abstraction layer cho JDBC, giảm boilerplate code.

#### JdbcTemplate

```java
@Repository
public class UserRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    // Query for single object
    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ?";
        return jdbcTemplate.queryForObject(sql, new UserRowMapper(), id);
    }
    
    // Query for list
    public List<User> findAll() {
        String sql = "SELECT * FROM users";
        return jdbcTemplate.query(sql, new UserRowMapper());
    }
    
    // Insert
    public void save(User user) {
        String sql = "INSERT INTO users (name, email) VALUES (?, ?)";
        jdbcTemplate.update(sql, user.getName(), user.getEmail());
    }
    
    // Update
    public void update(User user) {
        String sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
        jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getId());
    }
    
    // Delete
    public void delete(Long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}

// RowMapper
class UserRowMapper implements RowMapper<User> {
    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        return user;
    }
}
```

#### NamedParameterJdbcTemplate

```java
@Repository
public class UserRepository {
    
    private final NamedParameterJdbcTemplate namedTemplate;
    
    public UserRepository(NamedParameterJdbcTemplate namedTemplate) {
        this.namedTemplate = namedTemplate;
    }
    
    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = :id";
        Map<String, Object> params = Map.of("id", id);
        return namedTemplate.queryForObject(sql, params, new UserRowMapper());
    }
    
    public void save(User user) {
        String sql = "INSERT INTO users (name, email) VALUES (:name, :email)";
        Map<String, Object> params = Map.of(
            "name", user.getName(),
            "email", user.getEmail()
        );
        namedTemplate.update(sql, params);
    }
}
```

#### Configuration

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/mydb");
        config.setUsername("root");
        config.setPassword("password");
        return new HikariDataSource(config);
    }
    
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
    @Bean
    public NamedParameterJdbcTemplate namedParameterJdbcTemplate(DataSource dataSource) {
        return new NamedParameterJdbcTemplate(dataSource);
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

### Spring ORM Integration

#### Hibernate Integration

```java
@Configuration
@EnableTransactionManagement
public class HibernateConfig {
    
    @Bean
    public LocalSessionFactoryBean sessionFactory(DataSource dataSource) {
        LocalSessionFactoryBean sessionFactory = new LocalSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        sessionFactory.setPackagesToScan("com.example.entity");
        sessionFactory.setHibernateProperties(hibernateProperties());
        return sessionFactory;
    }
    
    private Properties hibernateProperties() {
        Properties props = new Properties();
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        props.setProperty("hibernate.show_sql", "true");
        props.setProperty("hibernate.hbm2ddl.auto", "update");
        return props;
    }
    
    @Bean
    public HibernateTransactionManager transactionManager(SessionFactory sessionFactory) {
        return new HibernateTransactionManager(sessionFactory);
    }
}

// Repository
@Repository
public class UserRepository {
    
    @Autowired
    private SessionFactory sessionFactory;
    
    public User findById(Long id) {
        return sessionFactory.getCurrentSession().get(User.class, id);
    }
    
    public void save(User user) {
        sessionFactory.getCurrentSession().save(user);
    }
}
```

#### JPA Integration

```java
@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackages = "com.example.repository")
public class JpaConfig {
    
    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.entity");
        em.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        em.setJpaProperties(jpaProperties());
        return em;
    }
    
    private Properties jpaProperties() {
        Properties props = new Properties();
        props.setProperty("hibernate.dialect", "org.hibernate.dialect.MySQLDialect");
        props.setProperty("hibernate.show_sql", "true");
        props.setProperty("hibernate.hbm2ddl.auto", "update");
        return props;
    }
    
    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}

// Repository với Spring Data JPA
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByName(String name);
    Optional<User> findByEmail(String email);
}
```

### Transaction Management (Chi tiết)

#### Declarative Transaction Management

```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Read-only transaction
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id);
    }
    
    // Transaction với rollback rules
    @Transactional(rollbackFor = {SQLException.class, DataAccessException.class})
    public User save(User user) {
        return userRepository.save(user);
    }
    
    // Nested transaction
    @Transactional(propagation = Propagation.NESTED)
    public void processWithNestedTransaction() {
        // Nested transaction logic
    }
}
```

#### Programmatic Transaction Management

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PlatformTransactionManager transactionManager;
    
    public User saveWithProgrammaticTx(User user) {
        TransactionDefinition definition = new DefaultTransactionDefinition();
        TransactionStatus status = transactionManager.getTransaction(definition);
        
        try {
            User saved = userRepository.save(user);
            transactionManager.commit(status);
            return saved;
        } catch (Exception e) {
            transactionManager.rollback(status);
            throw e;
        }
    }
}
```

---

## Validation

### Bean Validation (JSR-303/JSR-380)

Spring hỗ trợ Bean Validation thông qua annotations.

#### Validation Annotations

```java
@Entity
public class User {
    
    @NotNull(message = "ID cannot be null")
    private Long id;
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;
    
    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;
    
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 100, message = "Age must be at most 100")
    private Integer age;
    
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String phone;
    
    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;
    
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;
    
    @DecimalMin(value = "0.0", message = "Balance must be positive")
    private BigDecimal balance;
    
    // Getters and setters
}
```

#### Controller Validation

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
        // @Valid triggers validation
        // Nếu validation fails, MethodArgumentNotValidException được throw
        User created = userService.save(user);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody User user) {
        User updated = userService.update(id, user);
        return ResponseEntity.ok(updated);
    }
}

// Exception Handler
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errors);
    }
}
```

#### Service Layer Validation

```java
@Service
@Validated  // Enable method-level validation
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User save(@Valid User user) {
        // Validation happens before method execution
        return userRepository.save(user);
    }
    
    public User findById(@NotNull Long id) {
        return userRepository.findById(id);
    }
}
```

#### Custom Validator

```java
// Custom annotation
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// Validator implementation
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    
    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
    }
    
    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        if (phoneNumber == null) {
            return true;  // Use @NotNull for null check
        }
        // Custom validation logic
        return phoneNumber.matches("^\\+?[1-9]\\d{1,14}$");
    }
}

// Usage
public class User {
    @ValidPhoneNumber
    private String phone;
}
```

#### Validation Groups

```java
// Define groups
public interface CreateGroup {}
public interface UpdateGroup {}

// Entity with groups
public class User {
    
    @NotNull(groups = UpdateGroup.class)
    private Long id;
    
    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class})
    private String name;
    
    @Email(groups = {CreateGroup.class, UpdateGroup.class})
    private String email;
}

// Controller
@PostMapping
public ResponseEntity<User> createUser(
        @Validated(CreateGroup.class) @RequestBody User user) {
    // Only validates fields in CreateGroup
}

@PutMapping("/{id}")
public ResponseEntity<User> updateUser(
        @Validated(UpdateGroup.class) @RequestBody User user) {
    // Only validates fields in UpdateGroup
}
```

---

## Resource Management

### Resource Abstraction

Spring cung cấp Resource interface để truy cập resources (files, URLs, classpath).

#### Resource Types

```java
@Service
public class ResourceService {
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    public void loadResources() throws IOException {
        // Classpath resource
        Resource classpathResource = resourceLoader.getResource("classpath:config.properties");
        
        // File system resource
        Resource fileResource = resourceLoader.getResource("file:/path/to/file.txt");
        
        // URL resource
        Resource urlResource = resourceLoader.getResource("https://example.com/data.json");
        
        // Read resource
        InputStream inputStream = classpathResource.getInputStream();
        // Process input stream
    }
}

// Using @Value
@Component
public class AppConfig {
    
    @Value("classpath:config.properties")
    private Resource configFile;
    
    @Value("file:/path/to/data.txt")
    private Resource dataFile;
    
    public void loadConfig() throws IOException {
        Properties props = new Properties();
        props.load(configFile.getInputStream());
    }
}
```

#### Resource Pattern Resolution

```java
@Service
public class ResourceService {
    
    @Autowired
    private ResourcePatternResolver resourcePatternResolver;
    
    public Resource[] findResources() throws IOException {
        // Find all properties files in classpath
        Resource[] resources = resourcePatternResolver.getResources(
            "classpath*:config/*.properties"
        );
        return resources;
    }
}
```

---

## Environment Abstraction

### Profiles

Profiles cho phép cấu hình khác nhau cho các môi trường khác nhau.

#### Profile Configuration

```java
@Configuration
@Profile("dev")
public class DevConfig {
    
    @Bean
    public DataSource dataSource() {
        return new H2DataSource();  // In-memory database
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    
    @Bean
    public DataSource dataSource() {
        return new MySQLDataSource();  // Production database
    }
}

// Component with profile
@Component
@Profile("dev")
public class DevService {
    // Only created in dev profile
}
```

#### Profile Activation

```properties
# application.properties
spring.profiles.active=dev,local
```

```yaml
# application.yml
spring:
  profiles:
    active: dev,local
```

```bash
# Command line
java -jar app.jar --spring.profiles.active=prod

# Environment variable
export SPRING_PROFILES_ACTIVE=prod
```

### Property Sources

```java
@Configuration
@PropertySource("classpath:app.properties")
@PropertySource("classpath:db.properties")
public class AppConfig {
    
    @Value("${app.name}")
    private String appName;
    
    @Value("${app.version:1.0.0}")  // Default value
    private String appVersion;
}

// Multiple property sources
@PropertySources({
    @PropertySource("classpath:app.properties"),
    @PropertySource("classpath:db.properties"),
    @PropertySource(value = "file:/external/config.properties", ignoreResourceNotFound = true)
})
public class AppConfig {
}
```

#### @ConfigurationProperties

```java
@ConfigurationProperties(prefix = "app")
@Component
@Validated
public class AppProperties {
    
    @NotBlank
    private String name;
    
    @Min(1)
    private Integer version;
    
    private Database database;
    
    private List<String> features;
    
    // Getters and setters
    
    @Validated
    public static class Database {
        @NotBlank
        private String url;
        
        private String username;
        
        private String password;
        
        // Getters and setters
    }
}

// application.properties
app.name=MyApplication
app.version=2
app.database.url=jdbc:mysql://localhost:3306/mydb
app.database.username=root
app.database.password=secret
app.features[0]=feature1
app.features[1]=feature2
```

---

## Caching Abstraction

### Cache Configuration

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        cacheManager.setCaches(Arrays.asList(
            new ConcurrentMapCache("users"),
            new ConcurrentMapCache("products")
        ));
        return cacheManager;
    }
    
    // Redis Cache (with spring-boot-starter-data-redis)
    // @Bean
    // public CacheManager redisCacheManager(RedisConnectionFactory factory) {
    //     RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
    //         .entryTtl(Duration.ofHours(1));
    //     return RedisCacheManager.builder(factory)
    //         .cacheDefaults(config)
    //         .build();
    // }
}
```

### Cache Annotations

```java
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Cache result
    @Cacheable(value = "users", key = "#id")
    public User findById(Long id) {
        return userRepository.findById(id);
    }
    
    // Cache with condition
    @Cacheable(value = "users", condition = "#id > 0")
    public User findByIdConditional(Long id) {
        return userRepository.findById(id);
    }
    
    // Cache with custom key
    @Cacheable(value = "users", key = "#user.id")
    public User findByUser(User user) {
        return userRepository.findById(user.getId());
    }
    
    // Update cache
    @CachePut(value = "users", key = "#user.id")
    public User update(User user) {
        return userRepository.save(user);
    }
    
    // Evict cache
    @CacheEvict(value = "users", key = "#id")
    public void delete(Long id) {
        userRepository.deleteById(id);
    }
    
    // Evict all entries in cache
    @CacheEvict(value = "users", allEntries = true)
    public void clearCache() {
        // Clear all cache entries
    }
    
    // Multiple cache operations
    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id"),
        @CacheEvict(value = "userList", allEntries = true)
    })
    public void deleteAndClearCache(Long id) {
        userRepository.deleteById(id);
    }
}
```

---

## Task Scheduling

### @Scheduled Annotation

```java
@Configuration
@EnableScheduling
public class SchedulingConfig {
    // Enable scheduling
}

@Component
public class ScheduledTasks {
    
    private static final Logger log = LoggerFactory.getLogger(ScheduledTasks.class);
    
    // Fixed delay: Execute after previous execution completes
    @Scheduled(fixedDelay = 5000)  // 5 seconds
    public void taskWithFixedDelay() {
        log.info("Task executed with fixed delay");
    }
    
    // Fixed rate: Execute at fixed intervals
    @Scheduled(fixedRate = 5000)  // Every 5 seconds
    public void taskWithFixedRate() {
        log.info("Task executed with fixed rate");
    }
    
    // Initial delay
    @Scheduled(fixedDelay = 5000, initialDelay = 10000)
    public void taskWithInitialDelay() {
        log.info("Task executed after initial delay");
    }
    
    // Cron expression
    @Scheduled(cron = "0 0 12 * * ?")  // Every day at noon
    public void dailyTask() {
        log.info("Daily task executed");
    }
    
    // Cron examples:
    // "0 0 * * * ?" - Every hour
    // "0 0 0 * * ?" - Every day at midnight
    // "0 0 0 1 * ?" - First day of every month
    // "0 0 0 ? * MON" - Every Monday
    // "0 0/15 * * * ?" - Every 15 minutes
}
```

### TaskExecutor

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}

@Service
public class AsyncService {
    
    @Async
    public CompletableFuture<String> asyncMethod() {
        // Async execution
        return CompletableFuture.completedFuture("Result");
    }
    
    @Async("taskExecutor")
    public void asyncMethodWithExecutor() {
        // Use specific executor
    }
    
    @Async
    public CompletableFuture<User> processUser(Long id) {
        // Long-running task
        User user = processUserData(id);
        return CompletableFuture.completedFuture(user);
    }
}
```

---

## Internationalization (i18n)

### MessageSource Configuration

```java
@Configuration
public class I18nConfig {
    
    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = 
            new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:messages");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(3600);
        return messageSource;
    }
    
    @Bean
    public LocaleResolver localeResolver() {
        SessionLocaleResolver resolver = new SessionLocaleResolver();
        resolver.setDefaultLocale(Locale.US);
        return resolver;
    }
    
    @Bean
    public LocaleChangeInterceptor localeChangeInterceptor() {
        LocaleChangeInterceptor interceptor = new LocaleChangeInterceptor();
        interceptor.setParamName("lang");
        return interceptor;
    }
}
```

### Usage

```java
// messages.properties (default)
welcome.message=Welcome
user.notfound=User not found

// messages_vi.properties
welcome.message=Chào mừng
user.notfound=Không tìm thấy người dùng

// messages_fr.properties
welcome.message=Bienvenue
user.notfound=Utilisateur non trouvé

// Service
@Service
public class UserService {
    
    @Autowired
    private MessageSource messageSource;
    
    public String getWelcomeMessage(Locale locale) {
        return messageSource.getMessage("welcome.message", null, locale);
    }
    
    public String getUserNotFoundMessage(Locale locale) {
        return messageSource.getMessage("user.notfound", null, locale);
    }
    
    // With parameters
    public String getGreetingMessage(String name, Locale locale) {
        return messageSource.getMessage(
            "greeting.message", 
            new Object[]{name}, 
            locale
        );
    }
}

// Controller
@RestController
public class UserController {
    
    @Autowired
    private MessageSource messageSource;
    
    @GetMapping("/welcome")
    public String welcome(@RequestHeader("Accept-Language") String lang) {
        Locale locale = Locale.forLanguageTag(lang);
        return messageSource.getMessage("welcome.message", null, locale);
    }
}
```

---

## Spring Boot

### Features

- **Auto-configuration**
- **Starter dependencies**
- **Embedded server**
- **Production-ready features**

### Main Annotation

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

`@SpringBootApplication` includes:
- `@Configuration`
- `@EnableAutoConfiguration`
- `@ComponentScan`

### Application Properties

```properties
# application.properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

```yaml
# application.yml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: password
  jpa:
    hibernate:
      ddl-auto: update
```

### Profiles

```properties
# application-dev.properties
spring.datasource.url=jdbc:h2:mem:testdb

# application-prod.properties
spring.datasource.url=jdbc:mysql://prod-server:3306/mydb
```

```bash
# Run with profile
java -jar app.jar --spring.profiles.active=prod
```

---

## Testing Framework

### Spring Test Context

Spring cung cấp testing framework với TestContext để test Spring applications.

#### Unit Testing với @SpringBootTest

```java
@SpringBootTest
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private UserRepository userRepository;
    
    @Test
    void testFindById() {
        // Given
        User user = new User(1L, "John", "john@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // When
        User result = userService.findById(1L);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("John");
        verify(userRepository).findById(1L);
    }
}
```

#### Integration Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
class UserControllerIntegrationTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testCreateUser() throws Exception {
        // Given
        User user = new User(null, "John", "john@example.com");
        User savedUser = new User(1L, "John", "john@example.com");
        when(userService.save(any(User.class))).thenReturn(savedUser);
        
        // When & Then
        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John"));
    }
    
    @Test
    void testGetUser() throws Exception {
        // Given
        User user = new User(1L, "John", "john@example.com");
        when(userService.findById(1L)).thenReturn(user);
        
        // When & Then
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John"));
    }
}
```

#### Test Slices

```java
// Test only web layer
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void testGetUser() throws Exception {
        // Test web layer only
    }
}

// Test only data layer
@DataJpaTest
class UserRepositoryTest {
    
    @Autowired
    private TestEntityManager entityManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    void testSaveUser() {
        // Test JPA repository
        User user = new User("John", "john@example.com");
        User saved = userRepository.save(user);
        assertThat(saved.getId()).isNotNull();
    }
}

// Test only JSON serialization
@JsonTest
class UserJsonTest {
    
    @Autowired
    private JacksonTester<User> json;
    
    @Test
    void testSerialize() throws Exception {
        User user = new User(1L, "John", "john@example.com");
        assertThat(json.write(user)).isEqualToJson("user.json");
    }
}
```

#### Test Configuration

```java
@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@ActiveProfiles("test")
class UserServiceTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    void testWithTestProfile() {
        // Uses test profile configuration
    }
}

// Custom test configuration
@TestConfiguration
class TestConfig {
    
    @Bean
    @Primary
    public UserService testUserService() {
        return new TestUserService();
    }
}
```

#### Database Testing

```java
@SpringBootTest
@Sql(scripts = "/test-data.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = "/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class UserServiceDatabaseTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    @Transactional
    @Rollback  // Rollback after test
    void testSaveUser() {
        User user = new User("John", "john@example.com");
        User saved = userService.save(user);
        assertThat(saved.getId()).isNotNull();
    }
    
    @Test
    @DirtiesContext  // Reload context after test
    void testWithDirtyContext() {
        // Test that requires fresh context
    }
}
```

#### MockMvc Advanced Usage

```java
@WebMvcTest(UserController.class)
class UserControllerAdvancedTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testWithCustomRequest() throws Exception {
        mockMvc.perform(get("/api/users")
                .header("Authorization", "Bearer token")
                .param("page", "0")
                .param("size", "10")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/json"))
                .andExpect(jsonPath("$.content").isArray());
    }
    
    @Test
    void testWithFileUpload() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", "test.txt", "text/plain", "content".getBytes()
        );
        
        mockMvc.perform(multipart("/api/upload")
                .file(file))
                .andExpect(status().isOk());
    }
}
```

#### Testing Transactions

```java
@SpringBootTest
@Transactional
class TransactionalTest {
    
    @Autowired
    private UserService userService;
    
    @Test
    @Rollback  // Default: rollback after test
    void testWithRollback() {
        User user = userService.save(new User("John", "john@example.com"));
        // Changes will be rolled back
    }
    
    @Test
    @Commit  // Commit changes
    void testWithCommit() {
        User user = userService.save(new User("John", "john@example.com"));
        // Changes will be committed
    }
    
    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void testWithoutTransaction() {
        // Test without transaction
    }
}
```

---

## Câu hỏi thường gặp

### Q1: IoC là gì? Giải thích chi tiết với ví dụ?

**Trả lời:**

**IoC (Inversion of Control)** là một design principle trong đó quyền kiểm soát luồng của ứng dụng được đảo ngược - thay vì code tự tạo và quản lý dependencies, framework (Spring) sẽ làm việc đó.

**Ví dụ so sánh:**

```java
// ❌ KHÔNG có IoC: Traditional approach
class OrderService {
    private PaymentService paymentService;
    private EmailService emailService;
    
    public OrderService() {
        // Object tự tạo dependencies - TIGHT COUPLING
        this.paymentService = new CreditCardPaymentService();
        this.emailService = new SmtpEmailService();
    }
    
    public void processOrder(Order order) {
        paymentService.process(order);
        emailService.sendConfirmation(order);
    }
}

// ✅ CÓ IoC: Spring approach
@Service
class OrderService {
    private final PaymentService paymentService;
    private final EmailService emailService;
    
    // Dependencies được inject từ bên ngoài - LOOSE COUPLING
    public OrderService(PaymentService paymentService, EmailService emailService) {
        this.paymentService = paymentService;
        this.emailService = emailService;
    }
    
    public void processOrder(Order order) {
        paymentService.process(order);
        emailService.sendConfirmation(order);
    }
}

// Spring tự động:
// 1. Tạo PaymentService bean
// 2. Tạo EmailService bean
// 3. Tạo OrderService bean
// 4. Inject PaymentService và EmailService vào OrderService
```

**Lợi ích:**
- **Loose coupling**: Dễ thay đổi implementation
- **Testability**: Dễ mock dependencies
- **Maintainability**: Code dễ bảo trì
- **Flexibility**: Configuration-driven

### Q2: IoC Container là gì? Nó hoạt động như thế nào?

**Trả lời:**

**IoC Container** là trái tim của Spring Framework, có nhiệm vụ:
1. Tạo và quản lý objects (Beans)
2. Inject dependencies
3. Quản lý lifecycle của beans
4. Cấu hình beans

**Cách hoạt động:**

```
Bước 1: LOADING (Tải cấu hình)
├── Đọc XML/Java Config/Annotations
├── Parse configuration
└── Tạo BeanDefinition objects

Bước 2: VALIDATION (Kiểm tra)
├── Validate BeanDefinitions
├── Kiểm tra circular dependencies
└── Kiểm tra required dependencies

Bước 3: INSTANTIATION (Tạo instances)
├── Tạo singleton beans (eager loading)
├── Gọi constructor
└── Set properties

Bước 4: INITIALIZATION (Khởi tạo)
├── Inject dependencies
├── Gọi @PostConstruct
├── Gọi InitializingBean.afterPropertiesSet()
└── Gọi custom init methods

Bước 5: READY (Sẵn sàng)
└── Beans sẵn sàng để sử dụng
```

**Ví dụ minh họa:**

```java
@Configuration
@ComponentScan("com.example")
public class AppConfig {
    // Spring sẽ:
    // 1. Scan package "com.example"
    // 2. Tìm các @Component, @Service, @Repository
    // 3. Tạo BeanDefinitions
    // 4. Tạo instances
    // 5. Inject dependencies
}

@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        // Spring inject UserRepository vào đây
        this.userRepository = userRepository;
    }
}

@Repository
public class UserRepositoryImpl implements UserRepository {
    // Spring tự động tạo instance
}
```

### Q3: BeanFactory vs ApplicationContext - Khi nào dùng gì?

**Trả lời:**

| Tiêu chí | BeanFactory | ApplicationContext |
|----------|-------------|-------------------|
| **Interface** | Basic IoC container | Extends BeanFactory |
| **Loading Strategy** | Lazy loading | Eager loading |
| **Bean Creation** | Khi getBean() được gọi | Ngay khi container start |
| **Features** | Chỉ IoC cơ bản | Full: AOP, Events, i18n, Messaging |
| **Performance** | Nhẹ hơn, ít tài nguyên | Nặng hơn, nhiều tài nguyên |
| **Usage** | Ít dùng trong thực tế | Được dùng rộng rãi |
| **Events** | Không hỗ trợ | Hỗ trợ ApplicationEvent |
| **Internationalization** | Không hỗ trợ | Hỗ trợ MessageSource |

**Ví dụ:**

```java
// BeanFactory - Lazy loading
BeanFactory factory = new XmlBeanFactory(new ClassPathResource("beans.xml"));
// Beans chưa được tạo

UserService service = factory.getBean(UserService.class);
// Bean được tạo LÚC NÀY

// ApplicationContext - Eager loading
ApplicationContext context = new ClassPathXmlApplicationContext("beans.xml");
// Tất cả singleton beans đã được tạo NGAY BÂY GIỜ

UserService service = context.getBean(UserService.class);
// Bean đã sẵn sàng
```

**Khi nào dùng gì:**
- **BeanFactory**: Khi cần lightweight container, ít tài nguyên, mobile apps
- **ApplicationContext**: Hầu hết các trường hợp, đặc biệt Spring Boot (mặc định)

### Q4: IoC và DI khác nhau như thế nào? Mối quan hệ giữa chúng?

**Trả lời:**

**IoC (Inversion of Control):**
- Là một **design principle/pattern** rộng
- Đảo ngược quyền kiểm soát luồng của ứng dụng
- Framework kiểm soát thay vì application code
- Có nhiều cách triển khai: DI, Service Locator, Template Method, etc.

**DI (Dependency Injection):**
- Là một **cách triển khai cụ thể** của IoC
- Cụ thể: Inject dependencies vào objects
- Có 3 loại: Constructor, Setter, Field injection

**Mối quan hệ:**
```
IoC (Principle)
    └── DI (Implementation)
        ├── Constructor Injection
        ├── Setter Injection
        └── Field Injection
```

**Ví dụ:**

```java
// IoC: Framework kiểm soát
// DI: Cách triển khai IoC bằng cách inject dependencies

// Có thể có IoC mà không dùng DI:
// Service Locator Pattern (cũng là IoC nhưng không phải DI)
class ServiceLocator {
    public static PaymentService getPaymentService() {
        return new CreditCardPaymentService();
    }
}

// Spring dùng DI để thực hiện IoC:
@Service
class OrderService {
    // DI: Dependencies được inject
    public OrderService(PaymentService paymentService) {
        // IoC: Spring kiểm soát việc tạo và inject
    }
}
```

### Q5: Lazy Loading vs Eager Loading trong Spring?

**Trả lời:**

**Eager Loading (ApplicationContext - Default):**
- Beans được tạo **ngay khi container khởi tạo**
- Tất cả singleton beans được tạo ở startup
- Phát hiện lỗi sớm (configuration errors)
- Tốn tài nguyên hơn (memory, CPU)

**Lazy Loading (BeanFactory hoặc @Lazy):**
- Beans chỉ được tạo **khi cần** (lazy initialization)
- Bean được tạo lần đầu khi được inject hoặc getBean()
- Tiết kiệm tài nguyên
- Lỗi chỉ phát hiện khi sử dụng bean

**Ví dụ:**

```java
// Eager Loading (Default)
@Service
public class UserService {
    public UserService() {
        System.out.println("UserService created");  // In ngay khi start
    }
}

// Lazy Loading
@Service
@Lazy
public class UserService {
    public UserService() {
        System.out.println("UserService created");  // Chỉ in khi được sử dụng
    }
}

// Sử dụng
@RestController
public class UserController {
    @Autowired
    private UserService userService;  // Với @Lazy: UserService chưa được tạo
    
    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.findAll();  // UserService được tạo LÚC NÀY
    }
}
```

**Khi nào dùng Lazy:**
- Bean ít được sử dụng
- Bean tốn nhiều tài nguyên để khởi tạo
- Muốn giảm startup time
- Development environment (nhanh hơn)

**Khi nào dùng Eager:**
- Bean được sử dụng thường xuyên
- Muốn phát hiện lỗi sớm
- Production environment (đảm bảo tính sẵn sàng)

### Q6: Tại sao cần IoC Container? Lợi ích cụ thể?

**Trả lời:**

**1. Quản lý Dependencies Tự Động:**
```java
// Không có IoC: Phải tự quản lý
UserRepository repo = new UserRepositoryImpl();
TransactionManager tx = new TransactionManager();
Logger logger = new Logger();
UserService service = new UserService(repo, tx, logger);
// Phức tạp, khó maintain

// Có IoC: Spring tự động
@Autowired
UserService service;  // Đơn giản!
```

**2. Lifecycle Management:**
```java
@Service
public class UserService {
    @PostConstruct
    public void init() {
        // Spring tự động gọi khi bean được tạo
    }
    
    @PreDestroy
    public void cleanup() {
        // Spring tự động gọi khi bean bị destroy
    }
}
```

**3. Configuration Centralization:**
```java
// Tất cả cấu hình ở một nơi
@Configuration
public class AppConfig {
    @Bean
    public DataSource dataSource() {
        // Cấu hình database
    }
}
```

**4. Cross-cutting Concerns:**
```java
// AOP, Transactions, Security được xử lý tự động
@Transactional
public void saveUser(User user) {
    // Spring tự động quản lý transaction
}
```

**5. Testing:**
```java
// Dễ dàng mock dependencies
@SpringBootTest
class UserServiceTest {
    @MockBean
    private UserRepository userRepository;  // Mock tự động
    
    @Autowired
    private UserService userService;
}
```

**6. Flexibility:**
```java
// Có thể thay đổi implementation mà không sửa code
@Profile("dev")
@Bean
public DataSource devDataSource() { }

@Profile("prod")
@Bean
public DataSource prodDataSource() { }
```

### Q7: Các loại ApplicationContext trong Spring?

**Trả lời:**

**1. ClassPathXmlApplicationContext:**
```java
// Load từ classpath
ApplicationContext context = new ClassPathXmlApplicationContext("applicationContext.xml");
// Tìm file trong classpath (src/main/resources)
```

**2. FileSystemXmlApplicationContext:**
```java
// Load từ file system
ApplicationContext context = new FileSystemXmlApplicationContext("C:/config/applicationContext.xml");
// Tìm file trong file system
```

**3. AnnotationConfigApplicationContext:**
```java
// Load từ Java Config
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);
// Sử dụng @Configuration classes
```

**4. WebApplicationContext:**
```java
// Cho web applications (Spring MVC)
// Tự động được tạo bởi DispatcherServlet
// Không cần tạo thủ công
```

**5. GenericApplicationContext:**
```java
// Generic, có thể load từ nhiều nguồn
GenericApplicationContext context = new GenericApplicationContext();
XmlBeanDefinitionReader reader = new XmlBeanDefinitionReader(context);
reader.loadBeanDefinitions("applicationContext.xml");
context.refresh();
```

**Trong Spring Boot:**
```java
// Spring Boot tự động tạo ApplicationContext
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        // SpringApplication tự động tạo AnnotationConfigApplicationContext
        SpringApplication.run(Application.class, args);
    }
}
```

### Q8: IoC Container xử lý Circular Dependencies như thế nào?

**Trả lời:**

**Vấn đề:**
```java
@Component
class A {
    @Autowired
    private B b;  // A cần B
}

@Component
class B {
    @Autowired
    private A a;  // B cần A - CIRCULAR!
}
```

**Cách Spring xử lý:**

**1. Constructor Injection - KHÔNG THỂ:**
```java
// ❌ Lỗi: Circular dependency với constructor injection
@Component
class A {
    private B b;
    public A(B b) { this.b = b; }  // Cần B để tạo A
}

@Component
class B {
    private A a;
    public B(A a) { this.a = a; }  // Cần A để tạo B - DEADLOCK!
}
// Spring không thể giải quyết, sẽ throw BeanCurrentlyInCreationException
```

**2. Setter/Field Injection - CÓ THỂ:**
```java
// ✅ OK: Spring sử dụng 3-level cache để giải quyết
@Component
class A {
    @Autowired
    private B b;  // Field injection
}

@Component
class B {
    @Autowired
    private A a;  // Field injection
}

// Spring process:
// 1. Tạo A (chưa inject B) - Early reference
// 2. Tạo B (chưa inject A) - Early reference
// 3. Inject B vào A
// 4. Inject A vào B
```

**3. Giải pháp tốt nhất - @Lazy:**
```java
// ✅ BEST: Sử dụng @Lazy để break cycle
@Component
class A {
    @Autowired
    @Lazy
    private B b;  // B được tạo sau, break cycle
}

@Component
class B {
    @Autowired
    private A a;
}
```

**4. Refactor - Extract Common Logic:**
```java
// ✅ BEST: Refactor để tránh circular dependency
@Component
class CommonService {
    // Shared logic
}

@Component
class A {
    @Autowired
    private CommonService commonService;
}

@Component
class B {
    @Autowired
    private CommonService commonService;
}
```

### Q9: Sự khác biệt giữa @Component, @Service, @Repository, @Controller?

**Trả lời:**

Tất cả đều là `@Component`, nhưng có semantic meaning khác nhau:

- **@Component**: Generic component, dùng cho bất kỳ Spring-managed bean nào
- **@Service**: Business logic layer, semantic cho service classes
- **@Repository**: Data access layer, có exception translation (chuyển JDBC exceptions thành DataAccessException)
- **@Controller**: Web layer (MVC), xử lý HTTP requests

**Ví dụ:**

```java
// Generic component
@Component
public class UtilityService {
    // Generic Spring component
}

// Business logic
@Service
public class UserService {
    // Service layer - business logic
}

// Data access
@Repository
public class UserRepositoryImpl implements UserRepository {
    // Repository layer - data access
    // Spring tự động translate exceptions
}

// Web controller
@Controller
public class UserController {
    // Controller layer - web requests
}
```

**Lưu ý:**
- Về mặt kỹ thuật, chúng hoạt động giống nhau
- Semantic meaning giúp code dễ đọc và maintain
- `@Repository` có thêm exception translation feature

### Q10: @Autowired vs @Resource vs @Inject?

**Trả lời:**

| Annotation | Standard | Injection Strategy | Usage |
|------------|----------|-------------------|-------|
| **@Autowired** | Spring-specific | By type, sau đó by name | Phổ biến nhất trong Spring |
| **@Resource** | JSR-250 (Java EE) | By name, sau đó by type | Java EE standard |
| **@Inject** | JSR-330 (Java EE) | By type, giống @Autowired | Java EE standard, giống @Autowired |

**Chi tiết:**

**1. @Autowired (Spring):**
```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // By type
    
    @Autowired
    @Qualifier("userRepositoryImpl")
    private UserRepository repository;  // By name với @Qualifier
    
    // Constructor injection (preferred)
    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**2. @Resource (JSR-250):**
```java
@Service
public class UserService {
    @Resource(name = "userRepository")
    private UserRepository userRepository;  // By name trước
    
    @Resource
    private UserRepository repository;  // By name (field name), sau đó by type
}
```

**3. @Inject (JSR-330):**
```java
@Service
public class UserService {
    @Inject
    private UserRepository userRepository;  // By type, giống @Autowired
    
    @Inject
    @Named("userRepositoryImpl")
    private UserRepository repository;  // By name với @Named
}
```

**Khi nào dùng gì:**
- **@Autowired**: Khi dùng Spring Framework (phổ biến nhất)
- **@Resource**: Khi muốn dùng Java EE standard, hoặc cần by-name injection
- **@Inject**: Khi muốn dùng Java EE standard, portable hơn (có thể dùng với Guice, CDI)

### Q11: Singleton scope trong Spring vs Singleton pattern?

**Trả lời:**

**Spring Singleton:**
- One instance **per Spring container**
- Có thể có nhiều containers trong cùng JVM
- Mỗi container có instance riêng
- Managed bởi Spring IoC container

**Singleton Pattern (Design Pattern):**
- One instance **per JVM**
- Chỉ có một instance trong toàn bộ JVM
- Managed bởi class itself

**So sánh:**

| Tiêu chí | Spring Singleton | Singleton Pattern |
|----------|-----------------|-------------------|
| **Scope** | Per Spring container | Per JVM |
| **Instances** | Có thể có nhiều (nhiều containers) | Chỉ một |
| **Management** | Spring IoC container | Class itself |
| **Thread-safe** | Spring đảm bảo | Phải tự implement |
| **Lazy/Eager** | Có thể config | Thường eager |

**Ví dụ:**

```java
// Spring Singleton
@Service
@Scope("singleton")  // Default
public class UserService {
    // One instance per ApplicationContext
}

// Có thể có nhiều containers:
ApplicationContext ctx1 = new AnnotationConfigApplicationContext(AppConfig.class);
ApplicationContext ctx2 = new AnnotationConfigApplicationContext(AppConfig.class);
// ctx1.getBean(UserService.class) != ctx2.getBean(UserService.class)
// Hai instances khác nhau!

// Singleton Pattern
public class UserService {
    private static UserService instance;
    
    private UserService() {}
    
    public static synchronized UserService getInstance() {
        if (instance == null) {
            instance = new UserService();
        }
        return instance;
    }
    // Chỉ một instance trong toàn JVM
}
```

### Q12: Circular Dependency - Giải pháp chi tiết?

**Trả lời:**

**Vấn đề:**
```java
// Circular dependency
@Component
class A {
    @Autowired
    private B b;  // A cần B
}

@Component
class B {
    @Autowired
    private A a;  // B cần A - CIRCULAR!
}
```

**Giải pháp:**

**1. Sử dụng @Lazy (Đơn giản nhất):**
```java
@Component
class A {
    @Autowired
    @Lazy
    private B b;  // B được tạo sau, break cycle
}

@Component
class B {
    @Autowired
    private A a;
}
```

**2. Constructor Injection với @Lazy:**
```java
@Component
class A {
    private B b;
    
    public A(@Lazy B b) {
        this.b = b;  // B được tạo sau
    }
}

@Component
class B {
    private A a;
    
    public B(A a) {
        this.a = a;
    }
}
```

**3. Refactor - Extract Common Logic:**
```java
// Tách logic chung ra service riêng
@Component
class CommonService {
    // Shared logic giữa A và B
}

@Component
class A {
    @Autowired
    private CommonService commonService;
    // Không cần B nữa
}

@Component
class B {
    @Autowired
    private CommonService commonService;
    // Không cần A nữa
}
```

**4. Setter Injection (Spring có thể xử lý):**
```java
@Component
class A {
    private B b;
    
    @Autowired
    public void setB(B b) {
        this.b = b;  // Setter injection, Spring có thể xử lý
    }
}

@Component
class B {
    private A a;
    
    @Autowired
    public void setA(A a) {
        this.a = a;
    }
}
```

**5. ApplicationContextAware (Advanced):**
```java
@Component
class A implements ApplicationContextAware {
    private ApplicationContext context;
    
    @Override
    public void setApplicationContext(ApplicationContext context) {
        this.context = context;
    }
    
    public void doSomething() {
        B b = context.getBean(B.class);  // Lazy get bean
    }
}
```

**Lưu ý:**
- Constructor injection với circular dependency sẽ **FAIL**
- Setter/Field injection Spring có thể xử lý (nhưng không recommended)
- **Best practice**: Refactor để tránh circular dependency

### Q13: Bean Lifecycle - Chi tiết từng bước?

**Trả lời:**

**Bean Lifecycle trong Spring:**

```
1. INSTANTIATION (Tạo instance)
   └── Gọi constructor

2. POPULATE PROPERTIES (Điền properties)
   └── Set properties từ configuration

3. BeanNameAware.setBeanName()
   └── Nếu implement BeanNameAware

4. BeanFactoryAware.setBeanFactory()
   └── Nếu implement BeanFactoryAware

5. ApplicationContextAware.setApplicationContext()
   └── Nếu implement ApplicationContextAware

6. BeanPostProcessor.postProcessBeforeInitialization()
   └── Custom processing trước initialization

7. @PostConstruct
   └── JSR-250 annotation

8. InitializingBean.afterPropertiesSet()
   └── Nếu implement InitializingBean

9. Custom init method
   └── init-method từ XML hoặc @Bean(initMethod = "...")

10. BeanPostProcessor.postProcessAfterInitialization()
    └── Custom processing sau initialization

11. BEAN READY (Sẵn sàng sử dụng)

12. @PreDestroy (Khi context đóng)
    └── JSR-250 annotation

13. DisposableBean.destroy()
    └── Nếu implement DisposableBean

14. Custom destroy method
    └── destroy-method từ XML hoặc @Bean(destroyMethod = "...")
```

**Ví dụ minh họa:**

```java
@Component
public class UserService implements BeanNameAware, BeanFactoryAware, 
        ApplicationContextAware, InitializingBean, DisposableBean {
    
    // 1. Constructor
    public UserService() {
        System.out.println("1. Constructor called");
    }
    
    // 2. Properties được set
    @Value("${app.name}")
    private String appName;
    
    // 3. BeanNameAware
    @Override
    public void setBeanName(String name) {
        System.out.println("3. BeanNameAware: " + name);
    }
    
    // 4. BeanFactoryAware
    @Override
    public void setBeanFactory(BeanFactory beanFactory) {
        System.out.println("4. BeanFactoryAware");
    }
    
    // 5. ApplicationContextAware
    @Override
    public void setApplicationContext(ApplicationContext context) {
        System.out.println("5. ApplicationContextAware");
    }
    
    // 7. @PostConstruct
    @PostConstruct
    public void postConstruct() {
        System.out.println("7. @PostConstruct");
    }
    
    // 8. InitializingBean
    @Override
    public void afterPropertiesSet() {
        System.out.println("8. afterPropertiesSet()");
    }
    
    // 12. @PreDestroy
    @PreDestroy
    public void preDestroy() {
        System.out.println("12. @PreDestroy");
    }
    
    // 13. DisposableBean
    @Override
    public void destroy() {
        System.out.println("13. destroy()");
    }
}
```

### Q14: Transaction Management - Chi tiết?

**Trả lời:**

Spring Transaction Management cho phép quản lý transactions một cách declarative thông qua annotations hoặc programmatic.

**1. @Transactional Annotation:**

```java
@Service
@Transactional  // Áp dụng cho tất cả methods
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Read-only transaction (tối ưu performance)
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id);
    }
    
    // Write transaction với rollback rules
    @Transactional(rollbackFor = Exception.class)
    public User save(User user) {
        return userRepository.save(user);
    }
    
    // Transaction với timeout
    @Transactional(timeout = 5)
    public void longRunningOperation() {
        // Fails nếu > 5 seconds
    }
}
```

**2. Transaction Propagation:**

```java
@Service
public class OrderService {
    
    @Autowired
    private OrderService self;  // Self-injection để dùng proxy
    
    // REQUIRED (default): Join existing transaction hoặc tạo mới
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        userRepository.save(new User());
        self.method2();  // Join transaction của method1
    }
    
    // REQUIRES_NEW: Luôn tạo transaction mới
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // Transaction mới, độc lập với method1
        // Nếu method2 rollback, method1 vẫn commit
    }
    
    // SUPPORTS: Join nếu có, không tạo nếu không có
    @Transactional(propagation = Propagation.SUPPORTS)
    public void method3() {
        // Chỉ join transaction nếu đã có
    }
    
    // MANDATORY: Phải có transaction, throw exception nếu không có
    @Transactional(propagation = Propagation.MANDATORY)
    public void method4() {
        // Phải được gọi trong transaction
    }
    
    // NEVER: Không được gọi trong transaction
    @Transactional(propagation = Propagation.NEVER)
    public void method5() {
        // Throw exception nếu có transaction
    }
    
    // NOT_SUPPORTED: Suspend transaction hiện tại
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void method6() {
        // Chạy không có transaction
    }
    
    // NESTED: Nested transaction (chỉ với savepoints)
    @Transactional(propagation = Propagation.NESTED)
    public void method7() {
        // Nested transaction, có thể rollback riêng
    }
}
```

**3. Transaction Isolation Levels:**

```java
@Service
public class UserService {
    
    // READ_UNCOMMITTED: Có thể đọc uncommitted data
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public User findUser(Long id) {
        return userRepository.findById(id);
    }
    
    // READ_COMMITTED (default): Chỉ đọc committed data
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public User findUserSafe(Long id) {
        return userRepository.findById(id);
    }
    
    // REPEATABLE_READ: Đảm bảo đọc giống nhau trong transaction
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public User findUserConsistent(Long id) {
        return userRepository.findById(id);
    }
    
    // SERIALIZABLE: Highest isolation, tránh phantom reads
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public User findUserStrict(Long id) {
        return userRepository.findById(id);
    }
}
```

**4. Rollback Rules:**

```java
@Service
public class UserService {
    
    // Rollback cho tất cả exceptions
    @Transactional(rollbackFor = Exception.class)
    public void saveWithRollback() {
        // Rollback cho mọi exception
    }
    
    // Chỉ rollback cho SQLException và IOException
    @Transactional(rollbackFor = {SQLException.class, IOException.class})
    public void saveSpecific() {
        // Chỉ rollback cho các exceptions cụ thể
    }
    
    // Không rollback cho IllegalArgumentException
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void saveWithoutRollback() {
        // Không rollback cho IllegalArgumentException
    }
}
```

**5. Self-Invocation Problem:**

```java
@Service
public class UserService {
    
    @Autowired
    private UserService self;  // Self-injection để dùng proxy
    
    @Transactional
    public void method1() {
        // Transaction được tạo
        this.method2();  // ❌ KHÔNG có transaction (self-invocation)
        self.method2();  // ✅ CÓ transaction (qua proxy)
    }
    
    @Transactional
    public void method2() {
        // Transaction logic
    }
}
```

**6. Configuration:**

```java
@Configuration
@EnableTransactionManagement  // Enable @Transactional
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }
}
```

**Lưu ý quan trọng:**
- `@Transactional` chỉ hoạt động với **public methods**
- Self-invocation (gọi method trong cùng class) không trigger transaction
- Cần `@EnableTransactionManagement` để enable
- Spring sử dụng AOP proxy để implement transactions

---

## Best Practices

1. **Use constructor injection** thay vì field injection
2. **Prefer interfaces** cho dependencies
3. **Use @Service, @Repository, @Controller** thay vì generic @Component
4. **Avoid circular dependencies**
5. **Use @Transactional** appropriately
6. **Profile-specific configurations**
7. **Use @ConfigurationProperties** cho complex properties
8. **Test với @SpringBootTest**

---

## Bài tập thực hành

### Bài 1: Implement Service Layer

```java
// Yêu cầu: Tạo UserService với DI
// - Inject UserRepository
// - Implement CRUD operations
// - Add transaction management
```

### Bài 2: AOP Logging

```java
// Yêu cầu: Tạo aspect để log tất cả service methods
// - Log method name, parameters, return value
// - Log execution time
```

### Bài 3: Configuration Properties

```java
// Yêu cầu: Tạo @ConfigurationProperties cho database config
// - Load từ application.properties
// - Validate properties
```

---

## Advanced Spring Topics

### Bean Lifecycle Callbacks

```java
@Component
public class MyBean implements InitializingBean, DisposableBean {
    
    // Method 1: @PostConstruct và @PreDestroy
    @PostConstruct
    public void init() {
        System.out.println("Bean initialized");
    }
    
    @PreDestroy
    public void cleanup() {
        System.out.println("Bean destroyed");
    }
    
    // Method 2: InitializingBean và DisposableBean interfaces
    @Override
    public void afterPropertiesSet() throws Exception {
        System.out.println("After properties set");
    }
    
    @Override
    public void destroy() throws Exception {
        System.out.println("Bean destroyed");
    }
    
    // Method 3: Custom init/destroy methods
    public void customInit() {
        System.out.println("Custom init");
    }
    
    public void customDestroy() {
        System.out.println("Custom destroy");
    }
}

// Configuration
@Configuration
public class AppConfig {
    @Bean(initMethod = "customInit", destroyMethod = "customDestroy")
    public MyBean myBean() {
        return new MyBean();
    }
}
```

### Bean Post Processors

```java
@Component
public class CustomBeanPostProcessor implements BeanPostProcessor {
    
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) {
        System.out.println("Before initialization: " + beanName);
        return bean;
    }
    
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        System.out.println("After initialization: " + beanName);
        // Can return proxy
        return bean;
    }
}
```

### Conditional Bean Creation

```java
@Configuration
public class ConditionalConfig {
    
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new SimpleCacheManager();
    }
    
    @Bean
    @ConditionalOnClass(name = "com.example.ExternalService")
    public ExternalService externalService() {
        return new ExternalService();
    }
    
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager defaultCacheManager() {
        return new NoOpCacheManager();
    }
    
    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        return new H2DataSource();
    }
    
    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        return new MySQLDataSource();
    }
}
```

### @ConfigurationProperties

```java
@ConfigurationProperties(prefix = "app")
@Component
public class AppProperties {
    private String name;
    private String version;
    private Database database;
    
    // Getters and setters
    
    public static class Database {
        private String url;
        private String username;
        private String password;
        
        // Getters and setters
    }
}

// application.properties
app.name=MyApp
app.version=1.0.0
app.database.url=jdbc:mysql://localhost:3306/mydb
app.database.username=root
app.database.password=password
```

### Event Publishing

```java
// Event class
public class UserCreatedEvent extends ApplicationEvent {
    private String username;
    
    public UserCreatedEvent(Object source, String username) {
        super(source);
        this.username = username;
    }
    
    public String getUsername() {
        return username;
    }
}

// Publisher
@Service
public class UserService {
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    public void createUser(User user) {
        // Create user
        userRepository.save(user);
        
        // Publish event
        eventPublisher.publishEvent(new UserCreatedEvent(this, user.getUsername()));
    }
}

// Listener
@Component
public class UserEventListener {
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        System.out.println("User created: " + event.getUsername());
        // Send email, create audit log, etc.
    }
    
    @Async
    @EventListener
    public void handleUserCreatedAsync(UserCreatedEvent event) {
        // Async processing
    }
}
```

### Spring Expression Language (SpEL)

```java
@Component
public class SpELExample {
    @Value("#{systemProperties['java.home']}")
    private String javaHome;
    
    @Value("#{T(java.lang.Math).random() * 100}")
    private double randomNumber;
    
    @Value("#{userService.getDefaultUser().username}")
    private String defaultUsername;
    
    @Value("#{users.size() > 0 ? users[0] : null}")
    private User firstUser;
    
    @Value("#{users.?[age > 18]}")
    private List<User> adults;
    
    @Value("#{users.![username]}")
    private List<String> usernames;
}
```

### Transaction Management - Advanced

```java
@Service
public class TransactionService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TransactionService self;  // For self-invocation
    
    // Propagation: REQUIRED (default)
    @Transactional
    public void method1() {
        userRepository.save(new User());
        self.method2();  // Joins existing transaction
    }
    
    // Propagation: REQUIRES_NEW
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // New transaction, independent of method1
        userRepository.save(new User());
    }
    
    // Isolation: READ_COMMITTED
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public User findUser(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    // Timeout
    @Transactional(timeout = 5)
    public void longRunningOperation() {
        // Fails if takes more than 5 seconds
    }
    
    // Rollback rules
    @Transactional(rollbackFor = {SQLException.class, IOException.class})
    public void saveWithRollback() {
        // Rolls back on SQLException or IOException
    }
    
    @Transactional(noRollbackFor = IllegalArgumentException.class)
    public void saveWithoutRollback() {
        // Doesn't rollback on IllegalArgumentException
    }
}
```

### AOP - Advanced Pointcuts

```java
@Aspect
@Component
public class AdvancedAspect {
    
    // Execution pointcut
    @Pointcut("execution(* com.example.service.*.*(..))")
    public void serviceMethods() {}
    
    // Within pointcut
    @Pointcut("within(com.example.service..*)")
    public void inServicePackage() {}
    
    // This pointcut
    @Pointcut("this(com.example.service.UserService)")
    public void userServiceMethods() {}
    
    // Target pointcut
    @Pointcut("target(com.example.service.UserService)")
    public void userServiceTarget() {}
    
    // Args pointcut
    @Pointcut("args(Long, String)")
    public void methodsWithLongAndString() {}
    
    // Annotation pointcut
    @Pointcut("@annotation(com.example.annotation.Logged)")
    public void loggedMethods() {}
    
    // Bean pointcut
    @Pointcut("bean(userService)")
    public void userServiceBean() {}
    
    // Combined pointcuts
    @Around("serviceMethods() && !loggedMethods()")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        // Advice logic
        return joinPoint.proceed();
    }
}
```

### Spring Boot Actuator

```java
// Dependencies
// spring-boot-starter-actuator

// Endpoints
// /actuator/health - Application health
// /actuator/info - Application information
// /actuator/metrics - Application metrics
// /actuator/env - Environment properties
// /actuator/beans - All Spring beans

// Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=always
```

## Advanced Interview Questions

### Q1: Bean Scopes - Khi nào dùng gì?

```java
// Singleton (Default): One instance per Spring container
@Service
@Scope("singleton")
public class UserService {
    // Shared state across all requests
    // Use for stateless services
}

// Prototype: New instance mỗi lần request
@Component
@Scope("prototype")
public class UserValidator {
    // New instance each time
    // Use when need fresh state
}

// Request: One instance per HTTP request
@Component
@Scope("request")
public class RequestScopedBean {
    // Use for request-specific data
}

// Session: One instance per HTTP session
@Component
@Scope("session")
public class SessionScopedBean {
    // Use for session-specific data
}
```

### Q2: @Autowired vs @Resource vs @Inject?

```java
// @Autowired: Spring-specific, by type, then by name
@Autowired
private UserRepository userRepository;  // By type

@Autowired
@Qualifier("userRepositoryImpl")
private UserRepository userRepository;  // By name with qualifier

// @Resource: JSR-250, by name, then by type
@Resource(name = "userRepository")
private UserRepository userRepository;  // By name

// @Inject: JSR-330, by type (like @Autowired)
@Inject
private UserRepository userRepository;  // By type
```

### Q3: Circular Dependency - Solutions?

```java
// Problem: Circular dependency
@Component
class A {
    @Autowired
    private B b;
}

@Component
class B {
    @Autowired
    private A a;  // Circular!
}

// Solution 1: Use @Lazy
@Component
class A {
    @Autowired
    @Lazy
    private B b;  // Lazy initialization breaks cycle
}

// Solution 2: Constructor injection với @Lazy
@Component
class A {
    private B b;
    
    public A(@Lazy B b) {
        this.b = b;
    }
}

// Solution 3: Refactor - extract common logic
@Component
class CommonService {
    // Shared logic
}

@Component
class A {
    @Autowired
    private CommonService commonService;
}

@Component
class B {
    @Autowired
    private CommonService commonService;
}
```

### Q4: Spring Boot Auto-configuration - How it works?

```java
// Spring Boot uses @Conditional annotations
@Configuration
@ConditionalOnClass(DataSource.class)
@ConditionalOnProperty(name = "spring.datasource.url")
public class DataSourceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public DataSource dataSource() {
        // Auto-configure DataSource
        return DataSourceBuilder.create().build();
    }
}

// Custom auto-configuration
@Configuration
@ConditionalOnClass(MyService.class)
@AutoConfigureAfter(DataSourceAutoConfiguration.class)
public class MyServiceAutoConfiguration {
    
    @Bean
    @ConditionalOnMissingBean
    public MyService myService() {
        return new MyService();
    }
}

// META-INF/spring.factories
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.MyServiceAutoConfiguration
```

### Q5: Spring Boot Profiles - Best Practices?

```java
// application-dev.properties
spring.datasource.url=jdbc:h2:mem:testdb
logging.level.root=DEBUG

// application-prod.properties
spring.datasource.url=jdbc:mysql://prod-server:3306/mydb
logging.level.root=INFO

// application.yml với profiles
spring:
  profiles:
    active: dev
  datasource:
    url: ${DB_URL:jdbc:h2:mem:testdb}

---
spring:
  profiles: prod
  datasource:
    url: ${DB_URL}
```

### Q6: Spring Security - Basic Configuration?

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin()
            .and()
            .httpBasic();
        return http.build();
    }
    
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withDefaultPasswordEncoder()
            .username("user")
            .password("password")
            .roles("USER")
            .build();
        return new InMemoryUserDetailsManager(user);
    }
}
```

## Tổng kết

- **IoC/DI**: Inversion of Control, Dependency Injection
- **Bean Scopes**: Singleton, Prototype, Request, Session
- **Annotations**: @Component, @Service, @Repository, @Controller, @Autowired
- **AOP**: Cross-cutting concerns, aspects, advices
- **Spring MVC**: Controllers, request mapping
- **Spring Boot**: Auto-configuration, starters, embedded server
- **Advanced**: Bean lifecycle, conditional beans, events, SpEL, transactions
- **Best Practices**: Constructor injection, proper scopes, avoid circular dependencies
