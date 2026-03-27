# Creational Patterns — Patterns Tạo Object

## Mục lục
1. [Singleton](#singleton)
2. [Factory Method](#factory-method)
3. [Abstract Factory](#abstract-factory)
4. [Builder](#builder)
5. [Prototype](#prototype)
6. [Khi nào dùng pattern nào?](#khi-nào-dùng-pattern-nào)

---

## Singleton

> Đảm bảo class chỉ có **một instance** duy nhất và cung cấp global access point.

```java
// Thread-safe Singleton (Java)
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;

    private DatabaseConnection() {} // private constructor

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }
}

// Modern: Enum singleton (thread-safe, serialization-safe)
public enum AppConfig {
    INSTANCE;
    private final Map<String, String> config = new HashMap<>();
    public String get(String key) { return config.get(key); }
}

// Spring: @Component/@Service mặc định là Singleton (scope=singleton)
@Service  // Singleton by default trong Spring IoC container
public class UserService { ... }
```

**Khi nào dùng**: Connection pool, config, logger, cache manager.
**Spring**: Hầu hết beans là Singleton — Spring quản lý lifecycle.

---

## Factory Method

> Định nghĩa interface tạo object, **subclass quyết định** loại object nào.

```java
// Interface
public interface Notification {
    void send(String to, String message);
}

// Concrete implementations
public class EmailNotification implements Notification {
    public void send(String to, String message) {
        System.out.println("Email to " + to + ": " + message);
    }
}

public class SmsNotification implements Notification {
    public void send(String to, String message) {
        System.out.println("SMS to " + to + ": " + message);
    }
}

public class PushNotification implements Notification {
    public void send(String to, String message) {
        System.out.println("Push to " + to + ": " + message);
    }
}

// Factory
public class NotificationFactory {
    public static Notification create(String channel) {
        return switch (channel) {
            case "email" -> new EmailNotification();
            case "sms"   -> new SmsNotification();
            case "push"  -> new PushNotification();
            default -> throw new IllegalArgumentException("Unknown channel: " + channel);
        };
    }
}

// Spring: dùng Map injection thay Factory
@Service
public class NotificationService {
    private final Map<String, Notification> notifications;

    // Spring tự inject tất cả Notification beans, key = bean name
    public NotificationService(Map<String, Notification> notifications) {
        this.notifications = notifications;
    }

    public void notify(String channel, String to, String msg) {
        Notification n = notifications.get(channel);
        if (n == null) throw new IllegalArgumentException("Unknown: " + channel);
        n.send(to, msg);
    }
}
```

---

## Abstract Factory

> Tạo **family of related objects** mà không chỉ rõ concrete class.

```java
// Abstract products
public interface Button { void render(); }
public interface Input  { void render(); }

// Concrete families — Material Design
public class MaterialButton implements Button {
    public void render() { System.out.println("<md-button>"); }
}
public class MaterialInput implements Input {
    public void render() { System.out.println("<md-input>"); }
}

// Concrete families — Ant Design
public class AntButton implements Button {
    public void render() { System.out.println("<a-button>"); }
}
public class AntInput implements Input {
    public void render() { System.out.println("<a-input>"); }
}

// Abstract Factory
public interface UIFactory {
    Button createButton();
    Input createInput();
}

public class MaterialUIFactory implements UIFactory {
    public Button createButton() { return new MaterialButton(); }
    public Input createInput()   { return new MaterialInput(); }
}

public class AntUIFactory implements UIFactory {
    public Button createButton() { return new AntButton(); }
    public Input createInput()   { return new AntInput(); }
}
```

---

## Builder

> Xây dựng object phức tạp **từng bước**, tách construction khỏi representation.

```java
// Lombok @Builder — phổ biến nhất trong Java
@Builder
@Getter
public class UserCreateRequest {
    private final String name;
    private final String email;
    private final String phone;
    private final String address;
    private final Role role;
}

// Sử dụng
UserCreateRequest request = UserCreateRequest.builder()
    .name("Alice")
    .email("alice@example.com")
    .role(Role.ADMIN)
    .build();

// Manual Builder pattern
public class HttpRequest {
    private final String url;
    private final String method;
    private final Map<String, String> headers;
    private final String body;
    private final Duration timeout;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.headers = Map.copyOf(builder.headers);
        this.body = builder.body;
        this.timeout = builder.timeout;
    }

    public static class Builder {
        private final String url;     // required
        private String method = "GET";
        private Map<String, String> headers = new HashMap<>();
        private String body;
        private Duration timeout = Duration.ofSeconds(30);

        public Builder(String url) { this.url = url; }

        public Builder method(String method) { this.method = method; return this; }
        public Builder header(String key, String value) { headers.put(key, value); return this; }
        public Builder body(String body) { this.body = body; return this; }
        public Builder timeout(Duration timeout) { this.timeout = timeout; return this; }

        public HttpRequest build() { return new HttpRequest(this); }
    }
}

HttpRequest req = new HttpRequest.Builder("https://api.example.com/users")
    .method("POST")
    .header("Authorization", "Bearer token")
    .header("Content-Type", "application/json")
    .body("{\"name\":\"Alice\"}")
    .timeout(Duration.ofSeconds(5))
    .build();
```

**Khi nào dùng**: Object có nhiều fields (> 4), nhiều optional, immutable objects.

---

## Prototype

> Tạo object mới bằng cách **clone** object hiện có.

```java
public class ReportTemplate implements Cloneable {
    private String title;
    private String layout;
    private List<String> sections;

    @Override
    public ReportTemplate clone() {
        try {
            ReportTemplate cloned = (ReportTemplate) super.clone();
            cloned.sections = new ArrayList<>(this.sections); // Deep copy
            return cloned;
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }
}

// Sử dụng: clone template → customize
ReportTemplate monthly = templateRegistry.get("monthly");
ReportTemplate myReport = monthly.clone();
myReport.setTitle("Revenue Report - March 2026");
```

---

## Khi Nào Dùng Pattern Nào?

| Pattern | Khi nào dùng | Ví dụ |
|---------|-------------|-------|
| **Singleton** | 1 instance duy nhất, global state | Config, Logger, ConnectionPool |
| **Factory** | Tạo object dựa trên input/condition | NotificationFactory, PaymentFactory |
| **Abstract Factory** | Family of related objects | UI themes, DB driver families |
| **Builder** | Object phức tạp, nhiều optional params | Request builder, Query builder |
| **Prototype** | Clone object đắt tạo mới | Template, cache object |

---

**Tiếp theo:** [03-Structural-Patterns.md](./03-Structural-Patterns.md)
