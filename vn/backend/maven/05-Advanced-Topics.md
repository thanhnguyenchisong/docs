# Advanced Topics - Câu hỏi phỏng vấn

## Mục lục
1. [Profiles](#profiles)
2. [Properties](#properties)
3. [Inheritance](#inheritance)
4. [Resource Filtering](#resource-filtering)
5. [Environment-specific Configuration](#environment-specific-configuration)
6. [Maven Wrapper](#maven-wrapper)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Profiles

### Profile là gì?

**Định nghĩa:**
- Set of configuration values
- Activated based on conditions
- Different builds for different environments
- Override default configuration

### Profile Structure

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <env>development</env>
        </properties>
        <dependencies>
            <!-- Dev-specific dependencies -->
        </dependencies>
        <build>
            <!-- Dev-specific build config -->
        </build>
    </profile>
    
    <profile>
        <id>prod</id>
        <properties>
            <env>production</env>
        </properties>
        <dependencies>
            <!-- Prod-specific dependencies -->
        </dependencies>
    </profile>
</profiles>
```

### Activating Profiles

#### 1. Command Line

```bash
# Activate specific profile
mvn clean install -Pdev

# Activate multiple profiles
mvn clean install -Pdev,prod

# Deactivate profile
mvn clean install -P!dev
```

#### 2. Settings.xml

```xml
<settings>
    <activeProfiles>
        <activeProfile>dev</activeProfile>
    </activeProfiles>
</settings>
```

#### 3. Activation Conditions

```xml
<profile>
    <id>dev</id>
    <activation>
        <activeByDefault>true</activeByDefault>
    </activation>
</profile>

<profile>
    <id>prod</id>
    <activation>
        <property>
            <name>env</name>
            <value>production</value>
        </property>
    </activation>
</profile>

<profile>
    <id>jdk11</id>
    <activation>
        <jdk>11</jdk>
    </activation>
</profile>

<profile>
    <id>os-windows</id>
    <activation>
        <os>
            <family>windows</family>
        </os>
    </activation>
</profile>
```

### Profile Use Cases

**Environment-specific:**
```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <db.url>jdbc:mysql://localhost:3306/devdb</db.url>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <db.url>jdbc:mysql://prod-server:3306/proddb</db.url>
        </properties>
    </profile>
</profiles>
```

**Feature flags:**
```xml
<profiles>
    <profile>
        <id>feature-x</id>
        <dependencies>
            <dependency>
                <groupId>com.example</groupId>
                <artifactId>feature-x</artifactId>
            </dependency>
        </dependencies>
    </profile>
</profiles>
```

---

## Properties

### Properties là gì?

**Định nghĩa:**
- Variables in POM
- Reusable values
- Can be overridden
- Used in configuration

### Defining Properties

```xml
<properties>
    <!-- Project properties -->
    <maven.compiler.source>11</maven.compiler.source>
    <maven.compiler.target>11</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    
    <!-- Custom properties -->
    <spring.version>5.3.21</spring.version>
    <junit.version>4.13.2</junit.version>
    <app.name>My Application</app.name>
</properties>
```

### Using Properties

```xml
<!-- In dependencies -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>${spring.version}</version>
</dependency>

<!-- In plugins -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.11.0</version>
    <configuration>
        <source>${maven.compiler.source}</source>
        <target>${maven.compiler.target}</target>
    </configuration>
</plugin>

<!-- In resources -->
<resources>
    <resource>
        <directory>src/main/resources</directory>
        <filtering>true</filtering>
    </resource>
</resources>
```

### Built-in Properties

```xml
<!-- Project properties -->
${project.groupId}
${project.artifactId}
${project.version}
${project.name}
${project.basedir}
${project.build.directory}
${project.build.outputDirectory}
${project.build.sourceDirectory}
${project.build.testSourceDirectory}

<!-- Settings properties -->
${settings.localRepository}

<!-- Environment properties -->
${env.JAVA_HOME}
${env.PATH}
```

---

## Inheritance

### Inheritance là gì?

**Định nghĩa:**
- Child POM inherits from parent POM
- Inherits configuration, dependencies, plugins
- Override when needed

### Parent POM

```xml
<project>
    <groupId>com.example</groupId>
    <artifactId>parent</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    
    <properties>
        <java.version>11</java.version>
    </properties>
    
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-core</artifactId>
                <version>5.3.21</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

### Child POM

```xml
<project>
    <parent>
        <groupId>com.example</groupId>
        <artifactId>parent</artifactId>
        <version>1.0.0</version>
    </parent>
    
    <artifactId>child</artifactId>
    
    <!-- Inherits groupId và version from parent -->
    <!-- Can override properties -->
    <properties>
        <java.version>17</java.version>  <!-- Override -->
    </properties>
    
    <!-- Inherits dependencyManagement -->
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <!-- version inherited -->
        </dependency>
    </dependencies>
</project>
```

---

## Resource Filtering

### Resource Filtering là gì?

**Định nghĩa:**
- Replace placeholders in resources
- Use properties in resource files
- Environment-specific configuration

### Enable Filtering

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

### Using in Resources

**application.properties:**
```properties
app.name=${project.name}
app.version=${project.version}
db.url=${db.url}
db.username=${db.username}
```

**After filtering:**
```properties
app.name=My Application
app.version=1.0.0
db.url=jdbc:mysql://localhost:3306/mydb
db.username=admin
```

### Profile-based Filtering

```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <db.url>jdbc:mysql://localhost:3306/devdb</db.url>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <db.url>jdbc:mysql://prod-server:3306/proddb</db.url>
        </properties>
    </profile>
</profiles>
```

---

## Environment-specific Configuration

### Configuration per Environment

**Using Profiles:**
```xml
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <env>development</env>
            <db.url>jdbc:mysql://localhost:3306/devdb</db.url>
            <log.level>DEBUG</log.level>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <env>production</env>
            <db.url>jdbc:mysql://prod-server:3306/proddb</db.url>
            <log.level>INFO</log.level>
        </properties>
    </profile>
</profiles>
```

**Using Resource Filtering:**
```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

---

## Maven Wrapper

### Maven Wrapper là gì?

**Định nghĩa:**
- Scripts to run Maven without installation
- Ensures consistent Maven version
- Includes Maven distribution

### Setup Maven Wrapper

```bash
# Install wrapper
mvn wrapper:wrapper

# Or specify version
mvn wrapper:wrapper -Dmaven=3.9.5
```

**Creates:**
- `mvnw` (Unix/macOS)
- `mvnw.cmd` (Windows)
- `.mvn/wrapper/maven-wrapper.jar`
- `.mvn/wrapper/maven-wrapper.properties`

### Using Wrapper

```bash
# Unix/macOS
./mvnw clean install

# Windows
mvnw.cmd clean install
```

### Benefits

1. **Consistent Version**: Same Maven version for all
2. **No Installation**: Don't need Maven installed
3. **CI/CD Friendly**: Works in containers
4. **Version Control**: Wrapper in repository

---

## Câu hỏi thường gặp

### Q1: Profiles là gì?

**Profiles:**
- Set of configuration values
- Activated based on conditions
- Different builds for different environments

**Activate:**
```bash
mvn clean install -Pdev
```

### Q2: Properties?

**Properties:**
- Variables in POM
- Reusable values
- Used in configuration

**Define:**
```xml
<properties>
    <spring.version>5.3.21</spring.version>
</properties>
```

**Use:**
```xml
<version>${spring.version}</version>
```

### Q3: Inheritance?

**Inheritance:**
- Child inherits from parent
- Inherits configuration, dependencies
- Can override when needed

### Q4: Resource filtering?

**Resource filtering:**
- Replace placeholders in resources
- Use properties in resource files
- Enable với `<filtering>true</filtering>`

### Q5: Maven Wrapper?

**Maven Wrapper:**
- Scripts to run Maven without installation
- Ensures consistent version
- Use `./mvnw` instead of `mvn`

---

## Best Practices

1. **Use Profiles**: For environment-specific config
2. **Use Properties**: For reusable values
3. **Resource Filtering**: For environment config
4. **Maven Wrapper**: For consistent builds
5. **Document Profiles**: Clear profile purposes

---

## Bài tập thực hành

### Bài 1: Profiles

```xml
<!-- Yêu cầu:
     1. Create dev và prod profiles
     2. Define different properties
     3. Activate profiles
     4. Use in build -->
```

### Bài 2: Resource Filtering

```xml
<!-- Yêu cầu:
     1. Enable resource filtering
     2. Create properties file với placeholders
     3. Use properties in resources
     4. Build với different profiles -->
```

---

## Tổng kết

- **Profiles**: Environment-specific configuration
- **Properties**: Reusable variables
- **Inheritance**: Parent-child POM relationship
- **Resource Filtering**: Replace placeholders
- **Maven Wrapper**: Consistent Maven version
