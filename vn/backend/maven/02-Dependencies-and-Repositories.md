# Dependencies và Repositories - Câu hỏi phỏng vấn

## Mục lục
1. [Dependencies là gì?](#dependencies-là-gì)
2. [Dependency Scope](#dependency-scope)
3. [Repositories](#repositories)
4. [Dependency Versioning](#dependency-versioning)
5. [Transitive Dependencies](#transitive-dependencies)
6. [Dependency Exclusions](#dependency-exclusions)
7. [Dependency Management](#dependency-management)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Dependencies là gì?

### Dependency

**Định nghĩa:**
- External libraries required by project
- Declared in POM `<dependencies>` section
- Maven automatically downloads và resolves

### Adding Dependencies

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>5.3.21</version>
    </dependency>
    
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Dependency Elements

- **groupId**: Organization identifier
- **artifactId**: Library name
- **version**: Library version
- **scope**: Dependency scope (optional)
- **type**: Packaging type (optional, default: jar)
- **classifier**: Additional classifier (optional)

---

## Dependency Scope

### Scope là gì?

**Định nghĩa:**
- Defines when dependency is available
- Controls classpath inclusion
- Affects transitive dependencies

### Scope Types

#### 1. compile (Default)

**Đặc điểm:**
- Available in all classpaths
- Included in final artifact
- Transitive dependencies included

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.21</version>
    <!-- scope defaults to compile -->
</dependency>
```

#### 2. provided

**Đặc điểm:**
- Available at compile và test
- Not included in final artifact
- Expected to be provided by runtime environment

**Use cases:**
- Servlet API (provided by container)
- Java EE APIs

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>4.0.1</version>
    <scope>provided</scope>
</dependency>
```

#### 3. runtime

**Đặc điểm:**
- Not needed at compile time
- Needed at runtime
- Included in final artifact

**Use cases:**
- JDBC drivers
- Runtime libraries

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
    <scope>runtime</scope>
</dependency>
```

#### 4. test

**Đặc điểm:**
- Available only for test compilation và execution
- Not included in final artifact

**Use cases:**
- JUnit
- TestNG
- Mockito

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.13.2</version>
    <scope>test</scope>
</dependency>
```

#### 5. system

**Đặc điểm:**
- Similar to provided
- Must provide explicit path
- Not recommended (use provided instead)

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>custom-lib</artifactId>
    <version>1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/custom-lib.jar</systemPath>
</dependency>
```

#### 6. import

**Đặc điểm:**
- Only used in `<dependencyManagement>`
- Imports dependency management from other POMs

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>2.7.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Scope Comparison

| Scope | Compile | Test | Runtime | Included in Artifact |
|-------|---------|------|---------|---------------------|
| **compile** | ✅ | ✅ | ✅ | ✅ |
| **provided** | ✅ | ✅ | ❌ | ❌ |
| **runtime** | ❌ | ✅ | ✅ | ✅ |
| **test** | ❌ | ✅ | ❌ | ❌ |
| **system** | ✅ | ✅ | ❌ | ❌ |

---

## Repositories

### Repository là gì?

**Định nghĩa:**
- Storage location for artifacts
- Maven downloads dependencies from repositories
- Types: Local, Central, Remote

### Local Repository

**Định nghĩa:**
- Default location: `~/.m2/repository`
- Stores downloaded dependencies
- Cached for faster builds

**Location:**
```xml
<!-- settings.xml -->
<localRepository>/path/to/local/repo</localRepository>
```

### Central Repository

**Định nghĩa:**
- Maven Central Repository
- Default repository
- Contains most open-source libraries
- URL: https://repo1.maven.org/maven2/

### Remote Repositories

**Định nghĩa:**
- Additional repositories
- Can be public hoặc private
- Examples: JCenter, Spring Repository, Custom repositories

**Adding Remote Repository:**

```xml
<repositories>
    <repository>
        <id>spring-releases</id>
        <name>Spring Releases</name>
        <url>https://repo.spring.io/release</url>
        <releases>
            <enabled>true</enabled>
        </releases>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>
```

### Repository Mirrors

**Định nghĩa:**
- Redirect requests to another repository
- Useful for faster downloads (geographic location)
- Configured in `settings.xml`

```xml
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>central</mirrorOf>
        <name>Aliyun Maven</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

---

## Dependency Versioning

### Version Ranges

```xml
<!-- Exact version -->
<version>1.0.0</version>

<!-- Version range -->
<version>[1.0.0,2.0.0)</version>  <!-- 1.0.0 <= version < 2.0.0 -->
<version>[1.0.0,2.0.0]</version>  <!-- 1.0.0 <= version <= 2.0.0 -->
<version>(1.0.0,2.0.0)</version>  <!-- 1.0.0 < version < 2.0.0 -->

<!-- Latest version -->
<version>LATEST</version>

<!-- Release version -->
<version>RELEASE</version>
```

### SNAPSHOT Versions

**Định nghĩa:**
- Development versions
- Can change over time
- Maven checks for updates

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-lib</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

### Version Properties

**Định nghĩa:**
- Define versions in properties
- Reuse across dependencies
- Easier version management

```xml
<properties>
    <spring.version>5.3.21</spring.version>
    <junit.version>4.13.2</junit.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
</dependencies>
```

---

## Transitive Dependencies

### Transitive Dependencies là gì?

**Định nghĩa:**
- Dependencies of dependencies
- Automatically included
- Maven resolves dependency tree

**Example:**
```
Your Project
  └── spring-core (direct)
      └── commons-logging (transitive)
```

### Viewing Dependency Tree

```bash
# Show dependency tree
mvn dependency:tree

# Show dependency tree for specific dependency
mvn dependency:tree -Dincludes=org.springframework:spring-core
```

### Dependency Conflicts

**Problem:**
- Multiple versions of same dependency
- Maven uses "nearest wins" strategy

**Example:**
```
Project
  ├── A (depends on C:1.0)
  └── B (depends on C:2.0)
  
Result: C:2.0 (nearest to project)
```

**Resolving Conflicts:**
```xml
<!-- Exclude transitive dependency -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-a</artifactId>
    <version>1.0</version>
    <exclusions>
        <exclusion>
            <groupId>com.example</groupId>
            <artifactId>conflicting-lib</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<!-- Or force version -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>conflicting-lib</artifactId>
    <version>2.0</version>
</dependency>
```

---

## Dependency Exclusions

### Exclusions là gì?

**Định nghĩa:**
- Exclude transitive dependencies
- Prevent unwanted dependencies
- Resolve conflicts

### Exclude Transitive Dependency

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>5.3.21</version>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Exclude All Transitive Dependencies

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-lib</artifactId>
    <version>1.0</version>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

## Dependency Management

### dependencyManagement là gì?

**Định nghĩa:**
- Centralize dependency versions
- Used in parent POMs
- Children inherit versions
- Don't need to specify version in child POMs

### Parent POM

```xml
<!-- Parent POM -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>5.3.21</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### Child POM

```xml
<!-- Child POM - version inherited from parent -->
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <!-- version not needed -->
    </dependency>
</dependencies>
```

---

## Câu hỏi thường gặp

### Q1: Dependency scope là gì?

**Scope:**
- Defines when dependency is available
- Types: compile, provided, runtime, test, system, import
- Controls classpath inclusion

### Q2: compile vs provided?

**compile:**
- Available in all classpaths
- Included in final artifact

**provided:**
- Available at compile và test
- Not included in final artifact
- Expected from runtime environment

### Q3: Transitive dependencies?

**Transitive dependencies:**
- Dependencies of dependencies
- Automatically included
- Maven resolves dependency tree

**View tree:**
```bash
mvn dependency:tree
```

### Q4: Dependency conflicts?

**Conflicts:**
- Multiple versions of same dependency
- Maven uses "nearest wins"

**Resolve:**
- Exclude transitive dependency
- Force specific version

### Q5: SNAPSHOT versions?

**SNAPSHOT:**
- Development versions
- Can change over time
- Maven checks for updates

**Example:**
```xml
<version>1.0.0-SNAPSHOT</version>
```

### Q6: dependencyManagement?

**dependencyManagement:**
- Centralize versions in parent POM
- Children inherit versions
- Don't need version in child POMs

---

## Best Practices

1. **Use Specific Versions**: Avoid LATEST, RELEASE
2. **Use Properties**: Define versions in properties
3. **Use dependencyManagement**: Centralize versions
4. **Exclude Unused Dependencies**: Reduce artifact size
5. **Use Scopes Correctly**: Choose appropriate scope
6. **Monitor Dependencies**: Check for updates, security issues

---

## Bài tập thực hành

### Bài 1: Dependencies

```xml
<!-- Yêu cầu: Tạo POM với -->
<!-- 1. Multiple dependencies
     2. Different scopes
     3. Version properties
     4. View dependency tree -->
```

### Bài 2: Dependency Conflicts

```xml
<!-- Yêu cầu:
     1. Create conflicting dependencies
     2. View dependency tree
     3. Resolve conflicts
     4. Use exclusions -->
```

---

## Tổng kết

- **Dependencies**: External libraries
- **Scope**: compile, provided, runtime, test, system, import
- **Repositories**: Local, Central, Remote
- **Versioning**: Exact, ranges, SNAPSHOT
- **Transitive Dependencies**: Automatically included
- **Exclusions**: Exclude transitive dependencies
- **dependencyManagement**: Centralize versions
