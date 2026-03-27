# Quarkus Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Quarkus là gì?](#quarkus-là-gì)
2. [Quarkus vs Spring Boot](#quarkus-vs-spring-boot)
3. [Architecture & Extensions](#architecture-&-extensions)
4. [Continuous Testing & Dev Mode](#continuous-testing-&-dev-mode)
5. [Configuration](#configuration)
6. [Build và Runtime](#build-và-runtime)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)
8. [Reflection & Dynamic Code trong Java — Ảnh hưởng tới Quarkus](#reflection--dynamic-code-trong-java--ảnh-hưởng-tới-quarkus)
9. [Hạn chế của Native Image](#hạn-chế-của-native-image)

---

## Quarkus là gì?

### Định nghĩa

**Quarkus** là Kubernetes-native Java framework được thiết kế cho cloud-native applications với focus vào:
- **Fast Startup Time**: Milliseconds
- **Low Memory Footprint**: Minimal RAM usage
- **Developer Joy**: Great developer experience
- **Container First**: Optimized for containerso

### Key Features

1. **Supersonic**: Fast startup time
2. **Subatomic**: Low memory footprint
3. **Developer Joy**: Hot reload, unified configuration
4. **Standards-Based**: JAX-RS, CDI, JPA, etc.
5. **Native Image**: GraalVM native compilation

### Tại sao cần Quarkus? (Why need Quarkus?)

- **Microservices & Containers**: Mỗi service khởi động nhanh (vài chục ms) → scale nhanh, tiết kiệm tài nguyên so với JVM truyền thống (vài giây startup).
- **Serverless / FaaS**: Cold start phải rất thấp; Native Image giảm thời gian và memory so với JVM.
- **Chi phí hạ tầng**: Ít RAM hơn → chạy nhiều pod hơn trên cùng máy; startup nhanh → scale-to-zero khả thi.
- **Developer experience**: Dev Mode (hot reload), Dev Services (DB/Kafka tự start), Continuous Testing → vòng lặp phát triển nhanh.
- **Cloud-Native & Kubernetes-first**: Thiết kế cho môi trường cloud và Kubernetes: health probes, config từ ConfigMap/Secret, resource limits, scale từ 0 (với Knative). Framework ưu tiên container và orchestration thay vì máy truyền thống.

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
- **Hot Reload**: Tự động nạp lại thay đổi (code, config, resource) ngay lập tức mà không cần khởi động lại toàn ứng dụng (zero restart). Giúp tối ưu thời gian, developer nhận được quick response và tập trung hoàn toàn vào business logic.
- **Error Page**: Hiển thị stacktrace chi tiết và gợi ý sửa lỗi ngay trên trình duyệt.
- **Dev UI** (`/q/dev`): Giao diện quản lý extensions, xem config, log, beans...

### Continuous Testing
- Tích hợp sẵn trong dev mode (Bấm `r` trong terminal để chạy lại test).
- Tự động phát hiện và chạy lại **chỉ các test bị ảnh hưởng** khi sửa code.
- Mang lại feedback loop cực nhanh, hỗ trợ mạnh mẽ TDD (Test-Driven Development).

---

## Configuration

### Profiles
Quarkus hỗ trợ các profile khác nhau (`dev`, `test`, `prod`) để linh hoạt quản lý các môi trường.
Chạy ứng dụng với specific profile: `java -Dquarkus.profile=dev -jar app.jar`

### Xử lý lặp cấu hình giữa các Profile
Khi có nhiều profile, việc cấu hình lặp lại rất dễ xảy ra. Cách tối ưu:
1. **Sử dụng cấu hình chung (Global Config)**: Đặt các giá trị dùng chung ở ngoài, chỉ override trong profile khi có thay đổi.
2. **Sử dụng Biến môi trường (Environment Variables)**: Rất hữu ích cho các thông tin nhạy cảm hoặc thay đổi động theo môi trường thực tế (giúp hạn chế hard-code).

```properties
# application.properties

# Global config (Dùng chung cho mọi profile)
quarkus.http.port=8080
quarkus.datasource.username=common_user

# Sử dụng biến môi trường cho bảo mật và chống lặp
quarkus.datasource.password=${DB_PASSWORD}

# Dev profile
%dev.quarkus.log.level=DEBUG
%dev.quarkus.datasource.db-kind=h2

# Prod profile (Chỉ định sự khác biệt)
%prod.quarkus.datasource.db-kind=postgresql
%prod.quarkus.datasource.username=${DB_USER}
```

---

## Build-time vs Runtime Configuration

Quarkus phân biệt rõ **Build-time** và **Runtime** config — quan trọng cho Native Image và tối ưu.

### Build-time properties

- **Đọc và xử lý lúc build** (khi chạy `./mvnw package`). Giá trị có thể được "bake" vào bytecode hoặc native binary.
- **Ví dụ**: `quarkus.datasource.db-kind`, `quarkus.hibernate-orm.database.generation`, extension config (port mặc định, features bật/tắt).
- **Đặc điểm**: Thay đổi giá trị thường **yêu cầu build lại** (đặc biệt với Native Image).

### Runtime properties

- **Đọc lúc ứng dụng khởi động** (khi chạy `java -jar ...` hoặc native binary). Có thể override bằng biến môi trường, `-D`, hoặc config file bên ngoài.
- **Ví dụ**: `quarkus.datasource.jdbc.url`, `quarkus.datasource.username`, `quarkus.http.port`, `${ENV_VAR}`.
- **Đặc điểm**: Có thể thay đổi **không cần build lại** (trừ khi extension chỉ hỗ trợ build-time).

### Cách xác định và best practice

```properties
# Build-time: db-kind quyết định driver/extension được load
quarkus.datasource.db-kind=postgresql

# Runtime: URL/user/password thay đổi theo môi trường
quarkus.datasource.jdbc.url=jdbc:postgresql://${DB_HOST:localhost}:5432/${DB_NAME:quarkus}
quarkus.datasource.username=${DB_USER}
quarkus.datasource.password=${DB_PASSWORD}

# Native Image: Build-time config bị "bake" vào binary
# → Đổi DB từ PostgreSQL sang MySQL cần build lại native
```

**Quy tắc**: Cấu hình **phụ thuộc môi trường** (URL, credentials, feature flags theo env) nên dùng **runtime** (biến môi trường, profile). Cấu hình **kiến trúc ứng dụng** (loại DB, bật extension nào) thường là **build-time**.

---

## Build và Runtime

### Các lệnh cơ bản (Maven)

```bash
# 1. Chạy ứng dụng ở chế độ Dev Mode (hỗ trợ Hot Reload)
./mvnw compile quarkus:dev

# 2. Build ứng dụng JVM truyền thống (tạo ra thư mục target/quarkus-app)
./mvnw package
java -jar target/quarkus-app/quarkus-run.jar

# 3. Build ứng dụng Native Image (yêu cầu GraalVM)
./mvnw package -Pnative
./target/my-app-1.0.0-runner
```

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

## Reflection & Dynamic Code trong Java — Ảnh hưởng tới Quarkus

Đây là một trong những chủ đề **quan trọng nhất** khi làm việc với Quarkus, đặc biệt khi build **Native Image (GraalVM)**. Hiểu rõ phần này giúp bạn tránh hàng loạt lỗi runtime khó debug.

### Closed World Assumption — Nguyên lý nền tảng

Khi GraalVM build Native Image, nó áp dụng **Closed World Assumption**:

```
JVM truyền thống (Open World):
  → Mọi class đều có thể được load bất kỳ lúc nào
  → ClassLoader có thể load class từ network, file, byte[]
  → Reflection truy cập bất kỳ class/method/field nào
  → Rất linh hoạt, nhưng tốn RAM và khởi động chậm

GraalVM Native Image (Closed World):
  → Phân tích TOÀN BỘ code lúc build
  → Chỉ giữ lại code THỰC SỰ được gọi (reachability analysis)
  → Code không reachable → bị LOẠI BỎ hoàn toàn
  → Kết quả: file nhỏ, startup nhanh, RAM thấp
  → Nhưng: dynamic code bị phá vỡ!
```

### 6 Cơ Chế Dynamic Code trong Java

#### ① Java Reflection API (`java.lang.reflect`)

```java
// Tạo instance mà không cần biết class lúc compile
Class<?> clazz = Class.forName("com.example.MyService");      // ❌ GraalVM không biết "MyService" lúc build
Object obj = clazz.getDeclaredConstructor().newInstance();

// Truy cập field private
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);                                     // ❌ Bypass encapsulation
field.set(obj, "Hello");

// Gọi method dynamic
Method method = clazz.getMethod("process", String.class);
method.invoke(obj, "data");                                    // ❌ GraalVM không biết method nào cần giữ
```

**Ai dùng?** Hầu hết mọi Java framework: Jackson (JSON ↔ Object), Hibernate (entity mapping), CDI (bean instantiation), JAX-RS (resource injection).

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| JVM mode | ✅ Hoạt động bình thường |
| Native Image | ❌ **CRASH** — `ClassNotFoundException`, `NoSuchMethodException` nếu không đăng ký |

#### ② Dynamic Proxy (`java.lang.reflect.Proxy`)

```java
// Tạo proxy object implement interface tại runtime
MyService proxy = (MyService) Proxy.newProxyInstance(
    MyService.class.getClassLoader(),
    new Class<?>[]{ MyService.class },
    (proxyObj, method, args) -> {
        System.out.println("Before: " + method.getName());
        Object result = realService.process((String) args[0]);  // delegate
        System.out.println("After: " + method.getName());
        return result;
    }
);
```

**Ai dùng?** AOP (Aspect-Oriented Programming): `@Transactional`, `@Cacheable`, `@RolesAllowed`, `@Retry`.

**Hạn chế:** Chỉ proxy được **Interface**, không proxy được **Class** (cần CGLIB cho class).

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| JVM mode | ✅ Hoạt động bình thường |
| Native Image | ⚠️ Cần đăng ký proxy interfaces trong `reflect-config.json` hoặc `@RegisterForReflection` |

#### ③ Bytecode Generation (CGLIB, ByteBuddy, ASM, Javassist)

```java
// CGLIB: Tạo subclass proxy cho CLASS (không cần interface)
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(MyService.class);
enhancer.setCallback((MethodInterceptor) (obj, method, args, proxy) -> {
    System.out.println("Intercepted: " + method.getName());
    return proxy.invokeSuper(obj, args);
});
MyService proxy = (MyService) enhancer.create();   // ❌ Tạo CLASS MỚI lúc runtime

// ByteBuddy: Tạo class mới hoàn toàn
Class<?> dynamicType = new ByteBuddy()
    .subclass(Object.class)
    .method(named("toString")).intercept(FixedValue.value("Hello!"))
    .make()
    .load(getClass().getClassLoader())             // ❌ Load class mới vào JVM
    .getLoaded();
```

**Ai dùng?**
- **Spring**: CGLIB proxy cho `@Service`, `@Configuration` class (không có interface)
- **Hibernate**: ByteBuddy tạo lazy-loading entity proxies
- **Mockito**: ByteBuddy tạo mock objects

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| JVM mode | ✅ Hoạt động (nhưng Quarkus không dùng) |
| Native Image | ❌ **BỊ CẤM HOÀN TOÀN** — Native Image không cho phép sinh bytecode mới lúc runtime |

> **Đây là lý do lớn nhất tại sao Spring Boot khó build Native!** Spring dựa rất nhiều vào CGLIB proxies. Quarkus thay thế bằng **Gizmo** — sinh bytecode lúc BUILD, không phải runtime.

#### ④ MethodHandles (`java.lang.invoke`)

```java
// MethodHandle: cách hiện đại (Java 7+), nhanh hơn Reflection
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle handle = lookup.findVirtual(MyService.class, "process", 
    MethodType.methodType(String.class, String.class));
String result = (String) handle.invoke(service, "data");
```

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| JVM mode | ✅ |
| Native Image | ⚠️ Hỗ trợ tốt hơn Reflection nhưng vẫn cần reachability analysis |

#### ⑤ ServiceLoader (`java.util.ServiceLoader`)

```java
// SPI (Service Provider Interface): load implementations lúc runtime
ServiceLoader<MyPlugin> plugins = ServiceLoader.load(MyPlugin.class);
for (MyPlugin plugin : plugins) {
    plugin.execute();  // ❌ GraalVM không biết implementations nào có trong classpath
}

// File: META-INF/services/com.example.MyPlugin
// ↓
// com.example.PluginA
// com.example.PluginB
```

**Ai dùng?** JDBC drivers, SLF4J, CDI portable extensions, nhiều thư viện Java.

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| Native Image | ⚠️ GraalVM hỗ trợ nếu file `META-INF/services` có mặt lúc build |

#### ⑥ Serialization (`java.io.Serializable`)

```java
// Java native serialization dùng reflection để read/write fields
ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("data.ser"));
out.writeObject(myObject);   // ❌ Reflection vào mọi field

ObjectInputStream in = new ObjectInputStream(new FileInputStream("data.ser"));
MyClass obj = (MyClass) in.readObject();  // ❌ Tạo instance bằng reflection
```

| Ảnh hưởng Quarkus | Mức độ |
|-------------------|--------|
| Native Image | ❌ Cần đăng ký class. Khuyến khích dùng JSON (Jackson/Jsonb) thay thế |

### Bảng Tổng Hợp — Ảnh Hưởng Tới Quarkus

| # | Cơ chế | JVM Mode | Native Image | Quarkus giải quyết bằng |
|---|--------|----------|-------------|------------------------|
| ① | Reflection API | ✅ OK | ❌ Crash | `@RegisterForReflection`, Jandex, build-time wiring |
| ② | Dynamic Proxy | ✅ OK | ⚠️ Cần đăng ký | ArC proxy tại build-time |
| ③ | CGLIB/ByteBuddy | ✅ OK | ❌ **BỊ CẤM** | **Gizmo** — sinh bytecode lúc build |
| ④ | MethodHandles | ✅ OK | ⚠️ Phần lớn OK | Hỗ trợ tốt hơn Reflection |
| ⑤ | ServiceLoader | ✅ OK | ⚠️ Cần services file | Quarkus Extensions thay thế SPI |
| ⑥ | Serialization | ✅ OK | ❌ Cần đăng ký | Jackson/JSON-B (không dùng Java serialization) |

### Cách Quarkus Giải Quyết Vấn Đề Reflection

#### Giải pháp 1: `@RegisterForReflection`

Đăng ký class cần reflection với GraalVM:

```java
// Đăng ký class hiện tại
@RegisterForReflection
public class ProductDTO {
    public String name;
    public BigDecimal price;
}

// Đăng ký class của thư viện ngoài (không sửa được source code)
@RegisterForReflection(targets = {
    com.external.library.ExternalModel.class,
    com.external.library.ExternalConfig.class
})
public class ReflectionRegistration { }

// Đăng ký FULL PACKAGE (tất cả class trong package)
@RegisterForReflection(targets = {}, classNames = {
    "com.external.library.model.OrderResponse",
    "com.external.library.model.PaymentResult"
})
public class ExternalReflectionConfig { }
```

#### Giải pháp 2: Build-time Bytecode Generation (Gizmo)

Thay vì CGLIB/ByteBuddy tạo proxy lúc runtime, Quarkus dùng **Gizmo** tạo bytecode lúc build:

```
Spring Boot:                           Quarkus:
┌────────────────────────┐           ┌────────────────────────┐
│ App starts             │           │ Build (mvnw package)   │
│ ↓                      │           │ ↓                      │
│ Scan classpath (slow)  │           │ Jandex index scan      │
│ ↓                      │           │ ↓                      │
│ CGLIB: create proxies  │           │ Gizmo: create proxies  │ ← Proxy đã có sẵn
│ ↓                      │           │ ↓                      │
│ Reflection: wire beans │           │ ArC: wire beans        │ ← Wiring đã xong
│ ↓                      │           │ Generated code saved   │
│ Ready (2-5 seconds)    │           │                        │
│                        │           │ App starts             │
│                        │           │ ↓                      │
│                        │           │ Load pre-built beans   │
│                        │           │ ↓                      │
│                        │           │ Ready (50ms!)          │
└────────────────────────┘           └────────────────────────┘
```

#### Giải pháp 3: Jandex Index (Thay thế Runtime Classpath Scan)

```xml
<!-- Thư viện ngoài không có Jandex index → Quarkus có thể bỏ sót beans -->
<!-- Thêm Jandex plugin để tạo index lúc build -->
<plugin>
    <groupId>io.smallrye</groupId>
    <artifactId>jandex-maven-plugin</artifactId>
    <executions>
        <execution>
            <id>make-index</id>
            <goals><goal>jandex</goal></goals>
        </execution>
    </executions>
</plugin>

<!-- Hoặc trong application.properties -->
<!-- quarkus.index-dependency.my-lib.group-id=com.external
     quarkus.index-dependency.my-lib.artifact-id=my-library -->
```

#### Giải pháp 4: Quarkus Extension BuildItem (cho Extension authors)

```java
// Trong Deployment module của Quarkus Extension
@BuildStep
ReflectiveClassBuildItem registerReflection() {
    // Đăng ký class cho reflection (GraalVM sẽ giữ lại)
    return new ReflectiveClassBuildItem(true, true, 
        "com.external.ExternalModel",
        "com.external.ExternalConfig"
    );  // (methods, fields, classNames...)
}

@BuildStep
NativeImageProxyDefinitionBuildItem registerProxy() {
    // Đăng ký dynamic proxy interface
    return new NativeImageProxyDefinitionBuildItem(
        "com.example.MyService",
        "com.example.AnotherInterface"
    );
}
```

#### Giải pháp 5: `reflect-config.json` (Manual — last resort)

```json
// src/main/resources/META-INF/native-image/reflect-config.json
[
  {
    "name": "com.external.library.SomeClass",
    "allDeclaredConstructors": true,
    "allPublicMethods": true,
    "allDeclaredFields": true
  },
  {
    "name": "com.external.library.AnotherClass",
    "methods": [
      { "name": "getValue", "parameterTypes": [] },
      { "name": "setValue", "parameterTypes": ["java.lang.String"] }
    ]
  }
]
```

### Checklist — "Code Này Chạy Native Được Không?"

```
Khi review code Quarkus, hãy kiểm tra:

✅ Không dùng Class.forName(variable)    → dùng CDI inject
✅ Không dùng field.setAccessible(true)  → dùng constructor/setter
✅ Không dùng CGLIB/ByteBuddy runtime   → Quarkus dùng Gizmo
✅ DTO cho JSON dùng @RegisterForReflection (nếu cần)
✅ Thư viện ngoài có Quarkus Extension?  → Ưu tiên dùng extension
✅ Thư viện ngoài cần Jandex index?      → Thêm quarkus.index-dependency
✅ Test native: ./mvnw verify -Pnative   → Chạy test trên native image
```

### So Sánh: Spring Boot vs Quarkus — Cách Xử Lý Dynamic Code

| Vấn đề | Spring Boot | Quarkus |
|--------|-------------|--------|
| **Bean Discovery** | Runtime classpath scan | Build-time Jandex index |
| **Proxy Creation** | Runtime CGLIB/ByteBuddy | Build-time Gizmo |
| **DI Wiring** | Runtime reflection | Build-time ArC wiring |
| **Config Processing** | Runtime `@Value`, `@ConfigurationProperties` | Build-time config recording |
| **Entity Scan** | Runtime Hibernate scan | Build-time entity/persistence recording |
| **Startup Time** | 2-5 giây (do reflection heavy) | 50-100ms (pre-built code) |
| **Native Image** | Spring Native (phức tạp, nhiều hints) | Built-in support (đơn giản) |

### Câu Hỏi Phỏng Vấn — Reflection & Quarkus

**Q: Tại sao Quarkus khởi động nhanh hơn Spring Boot?**
> Quarkus di chuyển toàn bộ công việc nặng (classpath scan, proxy creation, DI wiring, config processing) về **build-time**. Spring Boot làm tất cả việc này lúc **runtime** bằng reflection + CGLIB → chậm. Quarkus lúc startup chỉ cần load code đã sinh sẵn → nhanh.

**Q: `@RegisterForReflection` dùng khi nào?**
> Khi class cần được truy cập bằng reflection trong Native Image mà Quarkus không tự nhận ra (thường là DTO cho JSON serialization, class từ thư viện ngoài, class dùng trong `Class.forName`). Không cần nếu class đã được Quarkus Extension quản lý (entity JPA, resource JAX-RS, CDI bean).

**Q: Tại sao CGLIB bị cấm trong Native Image?**
> CGLIB tạo class mới bằng cách sinh bytecode lúc runtime → load vào JVM. Native Image **không có JVM classloader**, không cho phép tạo class mới lúc runtime. Quarkus giải quyết bằng Gizmo: sinh bytecode lúc build → compile sẵn vào binary.

**Q: Thư viện Java cũ dùng reflection nhiều (ví dụ GSON), chạy Quarkus native được không?**
> JVM mode: chạy bình thường. Native mode: phải đăng ký tất cả class GSON sẽ serialize/deserialize bằng `@RegisterForReflection` hoặc `reflect-config.json`. Recommendations: (1) Đổi sang Jackson/JSON-B vì Quarkus Extension đã xử lý reflection, (2) Nếu phải dùng, đăng ký manual.

**Q: Jandex là gì và tại sao Quarkus cần nó?**
> Jandex là **offline annotation index** — quét toàn bộ class và tạo file index lúc build. Quarkus dùng Jandex thay cho runtime classpath scan (nhanh hơn gấp nhiều lần). Nếu thư viện ngoài không có Jandex index, Quarkus có thể bỏ sót beans → cần `quarkus.index-dependency` trong `application.properties`.

---

## Hạn chế của Native Image

Mặc dù Native Image mang lại nhiều lợi thế, nhưng nó cũng có những hạn chế:

1. **Thời gian và tài nguyên build cao**:
   - Build Native Image mất nhiều thời gian hơn so với build JAR truyền thống (thường 3-10 phút).
   - Tiêu tốn nhiều tài nguyên: cần 6-8GB RAM, CPU intensive.

2. **Hạn chế với Reflection và Dynamic Code**:
   - Native Image không hỗ trợ đầy đủ Reflection runtime. Xem phần [Reflection & Dynamic Code](#reflection--dynamic-code-trong-java--ảnh-hưởng-tới-quarkus) ở trên để hiểu chi tiết và cách giải quyết.

3. **Kích thước file nhị phân lớn**:
   - File binary đầu ra có thể lớn hơn file JAR thông thường (50-100MB) vì tích hợp sẵn SubstrateVM và toàn bộ dependencies.

4. **Thiếu tối ưu lâu dài (No JIT) — Giải thích chi tiết**:

   **JIT (Just-In-Time) Compiler hoạt động như thế nào?**

   Khi app chạy trên JVM (HotSpot), JIT compiler quan sát code **đang chạy thực tế** và tối ưu dần theo thời gian:

   ```
   Giai đoạn 1 — Interpreter (0-vài giây đầu):
     → JVM chạy bytecode trực tiếp, CHẬM
     → Đồng thời thu thập profiling data:
        - Method nào được gọi nhiều nhất? (hot method)
        - Branch nào (if/else) đi vào nhánh nào thường xuyên?
        - Type nào thực sự được truyền vào method?
        - Loop nào chạy nhiều iterations?

   Giai đoạn 2 — C1 Compiler (sau vài trăm lần gọi):
     → Compile hot methods thành machine code (nhanh, tối ưu nhẹ)
     → Inline small methods, loại dead code
     → Tốc độ tăng ~5-10x so với interpreter

   Giai đoạn 3 — C2 Compiler (sau vài ngàn lần gọi):
     → Compile lại bằng aggressive optimizations dựa trên
        PROFILING DATA THỰ TẾ từ giai đoạn 1-2:

     Optimizations C2 thực hiện:
     ┌─────────────────────────────────────────────────────────┐
     │ • Method Inlining: copy body của method vào caller      │
     │   → loại bỏ overhead gọi method, mở ra thêm tối ưu    │
     │                                                         │
     │ • Escape Analysis: object không thoát khỏi method?      │
     │   → allocate trên STACK (không heap) → không cần GC!    │
     │                                                         │
     │ • Loop Unrolling: "bung" loop ra để giảm branch/jump    │
     │                                                         │
     │ • Speculative Optimization: "method này luôn nhận       │
     │   type A" → generate code CHỈ cho type A (nhanh hơn)   │
     │   → Nếu sai, deoptimize và compile lại (hiếm xảy ra)   │
     │                                                         │
     │ • Dead Code Elimination: code không bao giờ chạy → bỏ  │
     │                                                         │
     │ • Constant Folding: 2 + 3 → 5 (tính trước)             │
     │                                                         │
     │ • Vectorization: dùng SIMD instructions (CPU-specific)  │
     │   → xử lý nhiều data cùng lúc                           │
     └─────────────────────────────────────────────────────────┘
   ```

   **Tại sao AOT (Native Image) không làm được điều này?**

   ```
   AOT (Ahead-Of-Time — GraalVM Native Image):
     → Compile TOÀN BỘ code thành machine code LÚC BUILD
     → KHÔNG CÓ profiling data thực tế (chưa chạy, chưa biết hot path)
     → Phải compile cho MỌI trường hợp, KHÔNG speculative optimize
     → Không biết type thực tế → không inline aggressively
     → Không biết branch pattern → không optimize branches
     → Kết quả: machine code "generic", chạy ổn nhưng KHÔNG tối ưu nhất

   JIT (Just-In-Time — HotSpot JVM):
     → Compile CHỈ hot methods (20% code chiếm 80% runtime)
     → CÓ profiling data thực tế (type, branch, loop count)
     → Speculative: "99% cases type = String" → optimize cho String
     → Kết quả: machine code CHUYÊN BIỆT cho workload thực tế
   ```

   **So sánh throughput theo thời gian (ví dụ REST API):**

   ```
                  Throughput (requests/sec)
                  │
            3000  │                          ┌──────── JVM (sau warmup)
                  │                     ╱────┘
            2500  │                ╱───╱
                  │           ╱───╱
            2000  │      ╱───╱─────────────── ─ ─ ─ Native Image (ổn định)
                  │  ╱──╱
            1500  │╱──╱
                  │╱
            1000  │
                  │─── JVM (cold start, interpreter)
             500  │
                  │
               0  ├────┬────┬────┬────┬────┬────┬── Thời gian
                  0   10s  30s  1m   5m   10m  30m

   ← Vùng này: Native thắng ──→│←── Vùng này: JVM thắng (throughput cao hơn) ──→
         (startup nhanh)                    (JIT đã optimize xong)
   ```

   | Thời điểm | Native Image | JVM (HotSpot) |
   |-----------|-------------|---------------|
   | **0-1 giây** | ✅ Đã sẵn sàng, 2000 rps | ❌ Đang start (0 rps) |
   | **1-10 giây** | 2000 rps (ổn định) | 500 rps (interpreter) |
   | **10-60 giây** | 2000 rps | 1500 rps (C1 compiling) |
   | **1-5 phút** | 2000 rps | 2500 rps (C2 optimizing) |
   | **5+ phút** | 2000 rps | **3000 rps** ← JIT vượt AOT |
   | **24 giờ+** | 2000 rps | **3000+ rps** (fully optimized) |

   **Ví dụ cụ thể — Escape Analysis (JIT-only):**

   ```java
   // Method được gọi 100,000 lần/giây
   public int calculateTotal(List<OrderItem> items) {
       // JIT thấy: object Point KHÔNG escape khỏi method
       var summary = new OrderSummary();  // ← Escape Analysis
       for (var item : items) {
           summary.addItem(item);
       }
       return summary.getTotal();
   }

   // AOT: allocate OrderSummary trên HEAP → GC phải thu hồi cần
   // JIT: allocate OrderSummary trên STACK → KHÔNG tốn GC, free tự động
   //      → giảm GC pause, tăng throughput đáng kể
   ```

   **Khi nào chọn cái nào?**

   | Scenario | Chọn | Lý do |
   |---------|------|-------|
   | **Serverless / FaaS** (Lambda) | ✅ Native | Cold start < 100ms, chạy ngắn |
   | **Scale-to-zero** (Knative) | ✅ Native | Khởi động nhanh khi có request |
   | **CLI tools** | ✅ Native | Chạy → xong → tắt |
   | **Microservices (nhiều pods)** | ✅ Native | RAM thấp → chạy nhiều pods hơn |
   | **Monolith / long-running API** | ✅ JVM | JIT optimize → throughput cao nhất |
   | **Cần max throughput** | ✅ JVM | JIT C2 vượt trội sau warmup |
   | **Batch processing (chạy giờ)** | ✅ JVM | JIT optimize loop/hotpath |
   | **Dev / Debug** | ✅ JVM | Hot reload, debugger, JMX, JFR |

   **Rule of thumb**: Native cho **short-lived, scale-sensitive**. JVM cho **long-running, throughput-sensitive**.

5. **Debug khó hơn**:
   - Stack traces ngắn hơn, một số tool (JMX, JFR) hạn chế hoặc không available.
   - Không attach debugger dễ dàng như JVM.

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