# Quarkus Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Quarkus là gì?](#quarkus-là-gì)
2. [Quarkus vs Spring Boot](#quarkus-vs-spring-boot)
3. [Architecture & Extensions](#architecture-&-extensions)
4. [Continuous Testing & Dev Mode](#continuous-testing-&-dev-mode)
5. [Configuration](#configuration)
6. [Build và Runtime](#build-và-runtime)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
8. [Hạn chế của Native Image](#hạn-chế-của-native-image)

---

## Quarkus là gì?

### Định nghĩa

**Quarkus** là Kubernetes-native Java framework được thiết kế cho cloud-native applications với focus vào:
- **Fast Startup Time**: Milliseconds
- **Low Memory Footprint**: Minimal RAM usage
- **Developer Joy**: Great developer experience
- **Container First**: Optimized for containers

### Key Features

1. **Supersonic**: Fast startup time
2. **Subatomic**: Low memory footprint
3. **Developer Joy**: Hot reload, unified configuration
4. **Standards-Based**: JAX-RS, CDI, JPA, etc.
5. **Native Image**: GraalVM native compilation

---

## Quarkus vs Spring Boot

### Performance Comparison

| Metric | Spring Boot | Quarkus |
|--------|-------------|---------|
| **Startup Time** | 2-3 seconds | 50-100ms |
| **Memory Usage** | 150-300 MB | 50-100 MB |
| **Native Image** | Limited | Full support |
| **Reactive** | WebFlux | Mutiny (built-in) |

### Code Comparison

```java
// Spring Boot
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping
    public List<User> getUsers() {
        return userService.findAll();
    }
}

// Quarkus
@Path("/users")
public class UserResource {
    @Inject
    UserService userService;
    
    @GET
    public List<User> getUsers() {
        return userService.findAll();
    }
}
```

### When to use Quarkus?

**Use Quarkus khi:**
- Need fast startup (serverless, containers)
- Low memory footprint required
- Cloud-native applications
- Microservices
- Native image support needed

**Use Spring Boot khi:**
- Large ecosystem needed
- Team familiar with Spring
- Enterprise features required
- Mature ecosystem

---

## Architecture & Extensions

### How Extensions Work
Khác với thư viện thường, **Quarkus Extensions** có 2 phần:
1.  **Runtime**: Code chạy trong ứng dụng (như thư viện thường).
2.  **Deployment (Build-time)**: Code chạy lúc build để cấu hình framework, bytecode recording, tối ưu hóa.

Ví dụ: `quarkus-hibernate-orm` sẽ scan entity, cấu hình session factory ngay lúc build, giúp startup nhanh.

### Build-Time Optimization in Detail
Quarkus tận dụng Build-time optimization với các bước chính như:

1. **Classpath Scanning:**
   - Dò tìm tất cả các class và annotations trong ứng dụng. Điều này giúp xác định trước các dependencies, entities cần dùng.

2. **Framework Configuration:**
   - Cấu hình các framework cần thiết (như JAX-RS, Hibernate, CDI) ngay từ build-time.

3. **Session Factory Initialization:**
   - Đối với Hibernate ORM, session factory được khởi tạo trong build-time để giảm thời gian khởi động.

4. **Bytecode Optimization:**
   - Tối ưu bytecode để chỉ giữ lại các thành phần cần thiết và loại bỏ các phần không được sử dụng.

Cách tiếp cận này giúp giảm tải đáng kể cho runtime, làm cho ứng dụng Quarkus có khả năng khởi động nhanh và sử dụng ít tài nguyên hơn.

---

## Continuous Testing & Dev Mode

### Dev Mode (`quarkus dev`)
- **Hot Reload**: Live coding, thay đổi Java/Config/Resource apply ngay lập tức.
- **Error Page**: Hiển thị stacktrace chi tiết và gợi ý sửa lỗi ngay trên trình duyệt.
- **Dev UI** (`/q/dev`): Giao diện quản lý extensions, xem config, log, beans...

### Continuous Testing
- Bấm `r` trong terminal dev mode để chạy lại test.
- Tự động chạy lại các test bị ảnh hưởng khi sửa code.
- Feedback loop cực nhanh.

---

## Configuration

### Profiles
Quarkus hỗ trợ các profile khác nhau (`dev`, `test`, `prod`).

```properties
# application.properties

# Global
quarkus.http.port=8080

# Dev profile
%dev.quarkus.log.level=DEBUG
%dev.quarkus.datasource.db-kind=h2

# Prod profile
%prod.quarkus.datasource.db-kind=postgresql
%prod.quarkus.datasource.username=${DB_USER}
```

---

## Build và Runtime

### Maven Project

```xml
<!-- pom.xml -->
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>quarkus-app</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <quarkus.platform.version>3.6.0</quarkus.platform.version>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.quarkus</groupId>
                <artifactId>quarkus-bom</artifactId>
                <version>${quarkus.platform.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <dependencies>
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-resteasy-reactive</artifactId>
        </dependency>
        <dependency>
            <groupId>io.quarkus</groupId>
            <artifactId>quarkus-arc</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>io.quarkus</groupId>
                <artifactId>quarkus-maven-plugin</artifactId>
                <version>${quarkus.platform.version}</version>
                <executions>
                    <execution>
                        <goals>
                            <goal>build</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

### Gradle Project

```gradle
// build.gradle
plugins {
    id 'java'
    id 'io.quarkus' version '3.6.0'
}

dependencies {
    implementation 'io.quarkus:quarkus-resteasy-reactive'
    implementation 'io.quarkus:quarkus-arc'
}
```

---

## Câu hỏi thường gặp

### Q1: Tại sao Quarkus nhanh?

```java
// Reasons:
// 1. Build-time optimization
//    - Classpath scanning at build time
//    - Metadata generation
//    - Code generation

// 2. GraalVM Native Image
//    - Ahead-of-time compilation
//    - No JIT warmup
//    - Lower memory

// 3. Reactive by default
//    - Non-blocking I/O
//    - Event loop
//    - Better resource utilization
```

### Q2: Quarkus có thể dùng với Spring không?

```java
// ✅ Yes: Quarkus có Spring compatibility layer
// - Spring DI
// - Spring Web
// - Spring Data JPA

// Dependencies
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-spring-di</artifactId>
</dependency>
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-spring-web</artifactId>
</dependency>
```

### Q3: Native Image là gì?

```java
// Native Image: Compile Java to native executable
// - No JVM needed
// - Fast startup
// - Low memory
// - Single executable file

// Build native image
./mvnw package -Pnative

// Result: executable file (no JVM)
```

---

## Hạn chế của Native Image

Mặc dù Native Image mang lại nhiều lợi thế, nhưng nó cũng có những hạn chế:

1. **Thời gian và tài nguyên build cao**:
   - Build Native Image mất nhiều thời gian hơn so với build JAR truyền thống do phải thực hiện tối ưu hóa phức tạp.
   - Tiêu tốn nhiều tài nguyên (CPU và RAM) trong quá trình build.

2. **Hạn chế với Reflection và Dynamic Code**:
   - Native Image không hỗ trợ đầy đủ Reflection runtime, cần cấu hình hoặc thay thế các thư viện sử dụng reflection nhiều.

3. **Kích thước file nhị phân lớn**:
   - File binary đầu ra có thể lớn hơn file JAR thông thường vì tích hợp sẵn các thành phần cần thiết dưới dạng static.

4. **Thiếu tối ưu lâu dài**:
   - Không tận dụng được JIT Compiler để tối ưu runtime, hiệu năng có thể không tốt bằng ứng dụng chạy trên JVM được tối ưu hóa lâu dài.

---

## Best Practices

1. **Use build-time optimization**: Leverage Quarkus build-time features
2. **Prefer CDI**: Use CDI instead of Spring DI
3. **Use Panache**: For data access
4. **Go native**: Use native image for containers
5. **Reactive first**: Use reactive APIs

---

## Tổng kết

- **Quarkus**: Kubernetes-native Java framework
- **vs Spring Boot**: Faster startup, lower memory
- **Supersonic Subatomic**: Build-time optimization
- **Native Image**: GraalVM compilation
- **Best Practices**: Build-time optimization, reactive first