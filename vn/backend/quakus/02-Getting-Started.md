# Getting Started - Câu hỏi phỏng vấn Quarkus

## Mục lục
1. [Project Setup](#project-setup)
2. [Project Structure](#project-structure)
3. [Development Mode](#development-mode)
4. [Hot Reload](#hot-reload)
5. [Configuration](#configuration)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Project Setup

### Quarkus CLI

```bash
# Install Quarkus CLI
# Using SDKMAN
sdk install quarkus

# Create project
quarkus create app com.example:quarkus-app

# Add extensions
quarkus add resteasy-reactive
quarkus add hibernate-orm-panache
quarkus add jdbc-postgresql
```

### Maven

```bash
# Create project với Maven
mvn io.quarkus.platform:quarkus-maven-plugin:3.6.0:create \
    -DprojectGroupId=com.example \
    -DprojectArtifactId=quarkus-app \
    -DclassName="com.example.GreetingResource" \
    -Dpath="/hello"
```

### Project Structure

```
quarkus-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/
│   │   │       ├── GreetingResource.java
│   │   │       └── GreetingService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── META-INF/
│   │           └── resources/
│   │               └── index.html
│   └── test/
│       └── java/
│           └── com/example/
│               └── GreetingResourceTest.java
├── pom.xml
└── README.md
```

---

## Development Mode

### Run Development Mode

```bash
# Development mode với hot reload
./mvnw quarkus:dev

# Hoặc
quarkus dev
```

### Features

```java
// Development mode features:
// 1. Hot reload: Code changes reflected immediately
// 2. Continuous testing: Tests run automatically
// 3. Dev UI: http://localhost:8080/q/dev/
// 4. Live coding: No restart needed
```

---

## Hot Reload

### How it works

```java
// Hot Reload: Automatic reload khi code changes
// 1. File changed
// 2. Quarkus detects change
// 3. Recompiles changed classes
// 4. Restarts application
// 5. No manual restart needed

// Example:
@Path("/hello")
public class GreetingResource {
    @GET
    public String hello() {
        return "Hello";  // Change to "Hello World" → Auto reload
    }
}
```

---

## Configuration

### application.properties

```properties
# application.properties
# Server configuration
quarkus.http.port=8080
quarkus.http.host=0.0.0.0

# Database configuration
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=quarkus
quarkus.datasource.password=quarkus
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/quarkus

# Logging
quarkus.log.level=INFO
quarkus.log.console.enable=true
```

### Configuration Profiles

```properties
# application.properties (default)
quarkus.http.port=8080

# application-dev.properties
quarkus.http.port=8081
quarkus.log.level=DEBUG

# application-prod.properties
quarkus.http.port=80
quarkus.log.level=WARN
```

---

## Câu hỏi thường gặp

### Q1: Hot reload hoạt động như thế nào?

```java
// Hot reload process:
// 1. File watcher monitors source files
// 2. On change: Recompile changed classes
// 3. Restart application context
// 4. Preserve application state when possible
```

---

## Best Practices

1. **Use development mode**: For development
2. **Configure properly**: Use profiles
3. **Hot reload**: Leverage hot reload
4. **Dev UI**: Use Dev UI for debugging

---

## Tổng kết

- **Project Setup**: CLI, Maven, Gradle
- **Development Mode**: Hot reload, continuous testing
- **Configuration**: application.properties, profiles
- **Best Practices**: Use dev mode, configure properly
