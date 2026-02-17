# Build Lifecycle và Plugins - Câu hỏi phỏng vấn

## Mục lục
1. [Build Lifecycle](#build-lifecycle)
2. [Lifecycle Phases](#lifecycle-phases)
3. [Plugins](#plugins)
4. [Common Plugins](#common-plugins)
5. [Plugin Configuration](#plugin-configuration)
6. [Custom Goals](#custom-goals)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Build Lifecycle

### Lifecycle là gì?

**Định nghĩa:**
- Sequence of phases executed in order
- Standardized build process
- Three built-in lifecycles: default, clean, site

### Lifecycle Types

#### 1. default

**Định nghĩa:**
- Main lifecycle
- Handles project deployment

**Phases:**
- validate, compile, test, package, verify, install, deploy

#### 2. clean

**Định nghĩa:**
- Cleans project
- Removes build artifacts

**Phases:**
- pre-clean, clean, post-clean

#### 3. site

**Định nghĩa:**
- Generates project documentation

**Phases:**
- pre-site, site, post-site, site-deploy

---

## Lifecycle Phases

### default Lifecycle Phases

#### 1. validate

**Định nghĩa:**
- Validate project is correct
- Check POM is valid

```bash
mvn validate
```

#### 2. compile

**Định nghĩa:**
- Compile source code
- Output: `target/classes`

```bash
mvn compile
```

#### 3. test

**Định nghĩa:**
- Compile và run tests
- Output: `target/test-classes`, test reports

```bash
mvn test
```

#### 4. package

**Định nghĩa:**
- Package compiled code
- Creates JAR/WAR in `target/`

```bash
mvn package
```

#### 5. verify

**Định nghĩa:**
- Run integration tests
- Verify package quality

```bash
mvn verify
```

#### 6. install

**Định nghĩa:**
- Install package to local repository
- Available for other projects

```bash
mvn install
```

#### 7. deploy

**Định nghĩa:**
- Copy package to remote repository
- For sharing với team

```bash
mvn deploy
```

### Phase Execution

**Important:**
- Executing a phase executes all previous phases
- Example: `mvn package` executes validate, compile, test, package

```bash
# Executes: validate, compile, test, package
mvn package

# Executes: validate, compile, test, package, install
mvn install
```

---

## Plugins

### Plugin là gì?

**Định nghĩa:**
- Provide goals (tasks) to execute
- Bound to lifecycle phases
- Extend Maven functionality

### Plugin Structure

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <!-- Plugin configuration -->
    </configuration>
    <executions>
        <!-- Bind goals to phases -->
    </executions>
</plugin>
```

### Plugin vs Goal

**Plugin:**
- Container for goals
- Example: `maven-compiler-plugin`

**Goal:**
- Specific task
- Example: `compile`, `testCompile`

**Execute goal:**
```bash
# Execute specific goal
mvn compiler:compile

# Format: plugin:goal
mvn plugin-groupId:plugin-artifactId:version:goal
```

---

## Common Plugins

### 1. maven-compiler-plugin

**Purpose:**
- Compile Java source code
- Configure Java version

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <source>11</source>
        <target>11</target>
        <encoding>UTF-8</encoding>
    </configuration>
</plugin>
```

### 2. maven-surefire-plugin

**Purpose:**
- Run unit tests
- Generate test reports

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.0.0</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
        </includes>
        <excludes>
            <exclude>**/*IntegrationTest.java</exclude>
        </excludes>
    </configuration>
</plugin>
```

### 3. maven-jar-plugin

**Purpose:**
- Create JAR files
- Configure manifest

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <archive>
            <manifest>
                <mainClass>com.example.Main</mainClass>
            </manifest>
        </archive>
    </configuration>
</plugin>
```

### 4. maven-war-plugin

**Purpose:**
- Create WAR files
- Configure web.xml

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-war-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <warSourceDirectory>src/main/webapp</warSourceDirectory>
        <webXml>src/main/webapp/WEB-INF/web.xml</webXml>
    </configuration>
</plugin>
```

### 5. maven-clean-plugin

**Purpose:**
- Clean build directory
- Remove generated files

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-clean-plugin</artifactId>
    <version>3.2.0</version>
    <configuration>
        <filesets>
            <fileset>
                <directory>target</directory>
            </fileset>
        </filesets>
    </configuration>
</plugin>
```

### 6. maven-resources-plugin

**Purpose:**
- Copy resources to output directory
- Filter resources

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <version>3.3.1</version>
    <configuration>
        <encoding>UTF-8</encoding>
        <resources>
            <resource>
                <directory>src/main/resources</directory>
                <filtering>true</filtering>
            </resource>
        </resources>
    </configuration>
</plugin>
```

---

## Plugin Configuration

### Basic Configuration

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
            <configuration>
                <source>11</source>
                <target>11</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### Plugin Executions

**Định nghĩa:**
- Bind goals to phases
- Execute goals at specific phases

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <executions>
        <execution>
            <id>compile-sources</id>
            <phase>compile</phase>
            <goals>
                <goal>compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### Plugin Management

**Định nghĩa:**
- Centralize plugin versions
- Used in parent POMs
- Children inherit versions

```xml
<!-- Parent POM -->
<pluginManagement>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.11.0</version>
        </plugin>
    </plugins>
</pluginManagement>
```

---

## Custom Goals

### Execute Specific Goal

```bash
# Execute goal directly
mvn compiler:compile

# Execute multiple goals
mvn clean compiler:compile surefire:test

# Execute goal with parameters
mvn compiler:compile -Dmaven.compiler.source=11
```

### Skip Goals

```bash
# Skip tests
mvn package -DskipTests

# Skip tests và compile
mvn package -Dmaven.test.skip=true
```

---

## Câu hỏi thường gặp

### Q1: Build lifecycle là gì?

**Lifecycle:**
- Sequence of phases executed in order
- Three lifecycles: default, clean, site
- Standardized build process

### Q2: Lifecycle phases?

**default phases:**
- validate, compile, test, package, verify, install, deploy

**Execution:**
- Executing phase executes all previous phases

### Q3: Plugin vs Goal?

**Plugin:**
- Container for goals
- Example: `maven-compiler-plugin`

**Goal:**
- Specific task
- Example: `compile`

**Execute:**
```bash
mvn plugin:goal
```

### Q4: Common plugins?

**Common plugins:**
- `maven-compiler-plugin`: Compile Java
- `maven-surefire-plugin`: Run tests
- `maven-jar-plugin`: Create JAR
- `maven-war-plugin`: Create WAR
- `maven-clean-plugin`: Clean build

### Q5: Plugin configuration?

**Configuration:**
- In `<configuration>` section
- Plugin-specific parameters
- Can be in POM hoặc command line

### Q6: Skip tests?

**Skip tests:**
```bash
# Skip tests
mvn package -DskipTests

# Skip tests và compile
mvn package -Dmaven.test.skip=true
```

---

## Best Practices

1. **Use Plugin Management**: Centralize plugin versions
2. **Configure Plugins**: Set appropriate versions và config
3. **Use Standard Phases**: Follow Maven conventions
4. **Document Custom Goals**: Document custom executions
5. **Version Plugins**: Always specify plugin versions

---

## Bài tập thực hành

### Bài 1: Build Lifecycle

```bash
# Yêu cầu:
# 1. Execute different phases
# 2. Observe execution order
# 3. Check output directories
# 4. Understand phase dependencies
```

### Bài 2: Plugin Configuration

```xml
<!-- Yêu cầu: Configure plugins -->
<!-- 1. maven-compiler-plugin (Java 11)
     2. maven-surefire-plugin (test configuration)
     3. maven-jar-plugin (manifest)
     4. Execute goals directly -->
```

---

## Tổng kết

- **Build Lifecycle**: Sequence of phases
- **Phases**: validate, compile, test, package, install, deploy
- **Plugins**: Provide goals
- **Common Plugins**: compiler, surefire, jar, war
- **Configuration**: Plugin-specific settings
- **Executions**: Bind goals to phases
