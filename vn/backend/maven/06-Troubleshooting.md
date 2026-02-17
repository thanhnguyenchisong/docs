# Troubleshooting - Câu hỏi phỏng vấn

## Mục lục
1. [Common Issues](#common-issues)
2. [Dependency Conflicts](#dependency-conflicts)
3. [Build Failures](#build-failures)
4. [Performance Issues](#performance-issues)
5. [Debug Maven Builds](#debug-maven-builds)
6. [Best Practices](#best-practices)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Common Issues

### Issue 1: Dependency Not Found

**Problem:**
```
[ERROR] Failed to execute goal ...: Could not resolve dependencies
```

**Solutions:**

1. **Check Repository:**
```bash
# Verify repository access
mvn dependency:resolve

# Check if dependency exists
mvn dependency:tree
```

2. **Add Repository:**
```xml
<repositories>
    <repository>
        <id>custom-repo</id>
        <url>https://custom-repo.com/maven</url>
    </repository>
</repositories>
```

3. **Check Version:**
```xml
<!-- Verify version exists -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-lib</artifactId>
    <version>1.0.0</version>  <!-- Check if version exists -->
</dependency>
```

### Issue 2: Compilation Errors

**Problem:**
```
[ERROR] Compilation failure
```

**Solutions:**

1. **Check Java Version:**
```xml
<properties>
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
</properties>
```

2. **Clean Build:**
```bash
mvn clean compile
```

3. **Check Dependencies:**
```bash
mvn dependency:resolve
```

### Issue 3: Test Failures

**Problem:**
```
[ERROR] Tests run: 10, Failures: 2
```

**Solutions:**

1. **Skip Tests (temporary):**
```bash
mvn package -DskipTests
```

2. **Run Specific Test:**
```bash
mvn test -Dtest=MyTest
```

3. **Debug Test:**
```bash
mvn test -Dmaven.surefire.debug
```

### Issue 4: Plugin Not Found

**Problem:**
```
[ERROR] Plugin not found
```

**Solutions:**

1. **Check Plugin Version:**
```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>  <!-- Specify version -->
</plugin>
```

2. **Update Maven:**
```bash
mvn -version  # Check Maven version
```

---

## Dependency Conflicts

### Identifying Conflicts

```bash
# View dependency tree
mvn dependency:tree

# View conflicts
mvn dependency:tree -Dverbose

# Analyze dependencies
mvn dependency:analyze
```

### Resolving Conflicts

#### Method 1: Exclude Transitive Dependency

```xml
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
```

#### Method 2: Force Version

```xml
<dependencies>
    <!-- Force specific version -->
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>conflicting-lib</artifactId>
        <version>2.0</version>
    </dependency>
</dependencies>
```

#### Method 3: Use dependencyManagement

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>conflicting-lib</artifactId>
            <version>2.0</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

---

## Build Failures

### Common Build Failures

#### 1. Out of Memory

**Problem:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solution:**
```bash
# Increase heap size
export MAVEN_OPTS="-Xmx2048m -Xms1024m"
mvn clean install
```

#### 2. Port Already in Use

**Problem:**
```
Address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>
```

#### 3. Permission Denied

**Problem:**
```
Permission denied
```

**Solution:**
```bash
# Check permissions
ls -la target/

# Fix permissions
chmod -R 755 target/
```

---

## Performance Issues

### Slow Builds

**Solutions:**

1. **Use Maven Daemon:**
```bash
# Use mvnd (Maven Daemon)
mvnd clean install
```

2. **Parallel Builds:**
```bash
# Build modules in parallel
mvn clean install -T 4
```

3. **Skip Tests:**
```bash
# Skip tests during development
mvn clean install -DskipTests
```

4. **Offline Mode:**
```bash
# Use offline mode (no network checks)
mvn clean install -o
```

### Large Dependency Tree

**Solutions:**

1. **Exclude Unused Dependencies:**
```bash
# Analyze unused dependencies
mvn dependency:analyze
```

2. **Use Provided Scope:**
```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <scope>provided</scope>
</dependency>
```

---

## Debug Maven Builds

### Debug Options

#### 1. Verbose Output

```bash
# Verbose output
mvn clean install -X

# Debug output
mvn clean install -e
```

#### 2. Show Effective POM

```bash
# Show effective POM
mvn help:effective-pom

# Show effective settings
mvn help:effective-settings
```

#### 3. Dependency Information

```bash
# Dependency tree
mvn dependency:tree

# Dependency list
mvn dependency:list

# Analyze dependencies
mvn dependency:analyze
```

### Logging

**Configure Logging:**
```xml
<!-- settings.xml -->
<settings>
    <profiles>
        <profile>
            <id>debug</id>
            <properties>
                <maven.compiler.debug>true</maven.compiler.debug>
            </properties>
        </profile>
    </profiles>
</settings>
```

---

## Best Practices

### 1. Version Management

```xml
<!-- Use properties -->
<properties>
    <spring.version>5.3.21</spring.version>
</properties>

<!-- Use dependencyManagement -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. Plugin Versions

```xml
<!-- Always specify plugin versions -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
</plugin>
```

### 3. Clean Builds

```bash
# Always clean before build
mvn clean install
```

### 4. Dependency Management

```xml
<!-- Centralize versions -->
<dependencyManagement>
    <dependencies>
        <!-- Define versions here -->
    </dependencies>
</dependencyManagement>
```

### 5. Use Maven Wrapper

```bash
# Use wrapper for consistent builds
./mvnw clean install
```

---

## Câu hỏi thường gặp

### Q1: Dependency not found?

**Solutions:**
1. Check repository access
2. Add repository
3. Verify version exists
4. Check network connection

### Q2: Dependency conflicts?

**Resolve:**
1. View dependency tree: `mvn dependency:tree`
2. Exclude transitive dependency
3. Force specific version
4. Use dependencyManagement

### Q3: Build too slow?

**Optimize:**
1. Use Maven Daemon (mvnd)
2. Parallel builds: `-T 4`
3. Skip tests: `-DskipTests`
4. Offline mode: `-o`

### Q4: Out of memory?

**Solution:**
```bash
export MAVEN_OPTS="-Xmx2048m -Xms1024m"
mvn clean install
```

### Q5: Debug build?

**Debug:**
```bash
# Verbose output
mvn clean install -X

# Show effective POM
mvn help:effective-pom

# Dependency tree
mvn dependency:tree
```

---

## Best Practices

1. **Always Specify Versions**: Plugins và dependencies
2. **Use Properties**: For reusable values
3. **Clean Builds**: Use `mvn clean`
4. **Dependency Management**: Centralize versions
5. **Maven Wrapper**: For consistent builds
6. **Monitor Dependencies**: Check for updates
7. **Document Issues**: Keep troubleshooting notes

---

## Bài tập thực hành

### Bài 1: Troubleshoot Issues

```bash
# Yêu cầu:
# 1. Create dependency conflict
# 2. Identify conflict
# 3. Resolve conflict
# 4. Verify resolution
```

### Bài 2: Debug Build

```bash
# Yêu cầu:
# 1. Create build failure
# 2. Use debug options
# 3. Analyze logs
# 4. Fix issue
```

---

## Tổng kết

- **Common Issues**: Dependency not found, compilation errors, test failures
- **Dependency Conflicts**: Exclude, force version, dependencyManagement
- **Build Failures**: Memory, ports, permissions
- **Performance**: Parallel builds, skip tests, offline mode
- **Debug**: Verbose output, effective POM, dependency tree
- **Best Practices**: Version management, clean builds, wrapper
