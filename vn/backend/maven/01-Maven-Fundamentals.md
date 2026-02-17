# Maven Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Maven là gì?](#maven-là-gì)
2. [Installation và Setup](#installation-và-setup)
3. [POM (Project Object Model)](#pom-project-object-model)
4. [Maven Directory Structure](#maven-directory-structure)
5. [Basic Commands](#basic-commands)
6. [Maven Coordinates](#maven-coordinates)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Maven là gì?

### Maven

**Định nghĩa:**
- Maven là **build automation tool** và **dependency management tool**
- Primarily for Java projects
- Uses **Project Object Model (POM)** XML file
- Manages project build, reporting, và documentation

### Key Features

1. **Dependency Management**: Automatic dependency resolution
2. **Build Lifecycle**: Standardized build process
3. **Project Structure**: Convention over configuration
4. **Plugins**: Extensible với plugins
5. **Repositories**: Central repository for dependencies

### Maven vs Other Build Tools

| Feature | Maven | Gradle | Ant |
|---------|-------|--------|-----|
| **Configuration** | XML (POM) | Groovy/Kotlin DSL | XML |
| **Dependency Management** | Built-in | Built-in | Manual |
| **Build Lifecycle** | Standard | Flexible | Manual |
| **Performance** | Slower | Faster | Fast |
| **Learning Curve** | Medium | Steeper | Easy |

---

## Installation và Setup

### Prerequisites

- **Java JDK**: Java 8 or higher
- **JAVA_HOME**: Environment variable set

### Installation

#### Windows

1. Download Maven from [maven.apache.org](https://maven.apache.org/download.cgi)
2. Extract to directory (e.g., `C:\Program Files\Apache\maven`)
3. Add to PATH:
   - Add `C:\Program Files\Apache\maven\bin` to PATH
4. Verify:
```bash
mvn -version
```

#### Linux/macOS

```bash
# Using package manager (Ubuntu/Debian)
sudo apt install maven

# Or download và extract
wget https://downloads.apache.org/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.tar.gz
tar -xzf apache-maven-3.9.5-bin.tar.gz
sudo mv apache-maven-3.9.5 /opt/maven

# Add to PATH
export PATH=/opt/maven/bin:$PATH
echo 'export PATH=/opt/maven/bin:$PATH' >> ~/.bashrc

# Verify
mvn -version
```

### Configuration

**settings.xml** (optional):
- Location: `~/.m2/settings.xml` (user) hoặc `$MAVEN_HOME/conf/settings.xml` (global)
- Configure repositories, mirrors, profiles

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings>
    <localRepository>/path/to/local/repo</localRepository>
    <mirrors>
        <mirror>
            <id>aliyun</id>
            <mirrorOf>central</mirrorOf>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

---

## POM (Project Object Model)

### POM là gì?

**Định nghĩa:**
- POM là XML file describing project
- Located at `pom.xml` in project root
- Contains project information, dependencies, build configuration

### Basic POM Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Maven Coordinates -->
    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <!-- Project Information -->
    <name>My Application</name>
    <description>My application description</description>
    
    <!-- Properties -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <!-- Dependencies -->
    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.13.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <!-- Build Configuration -->
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
</project>
```

### POM Elements

**Required Elements:**
- `modelVersion`: POM model version (4.0.0)
- `groupId`: Group/Organization identifier
- `artifactId`: Artifact/Project identifier
- `version`: Project version

**Common Elements:**
- `packaging`: Packaging type (jar, war, pom)
- `name`: Project name
- `description`: Project description
- `properties`: Project properties
- `dependencies`: Project dependencies
- `build`: Build configuration
- `parent`: Parent POM reference

---

## Maven Directory Structure

### Standard Directory Layout

```
project-root/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/          # Main Java source code
│   │   ├── resources/     # Main resources
│   │   └── webapp/        # Web application (for war)
│   └── test/
│       ├── java/          # Test Java source code
│       └── resources/     # Test resources
└── target/                # Build output (generated)
    ├── classes/
    ├── test-classes/
    └── my-app-1.0.0.jar
```

### Directory Conventions

- **src/main/java**: Main source code
- **src/main/resources**: Main resources (config files, etc.)
- **src/test/java**: Test source code
- **src/test/resources**: Test resources
- **target**: Build output (excluded from version control)

---

## Basic Commands

### mvn compile

**Định nghĩa:**
- Compile source code
- Output: `target/classes`

```bash
mvn compile
```

### mvn test

**Định nghĩa:**
- Compile và run tests
- Output: `target/test-classes`, test reports

```bash
mvn test
```

### mvn package

**Định nghĩa:**
- Compile, test, và package
- Creates JAR/WAR file in `target/`

```bash
mvn package
```

### mvn install

**Định nghĩa:**
- Package và install to local repository
- Available for other projects

```bash
mvn install
```

### mvn clean

**Định nghĩa:**
- Clean build directory (`target/`)

```bash
mvn clean
```

### mvn deploy

**Định nghĩa:**
- Install và deploy to remote repository

```bash
mvn deploy
```

### Combined Commands

```bash
# Clean và compile
mvn clean compile

# Clean, compile, test, package
mvn clean package

# Clean, compile, test, package, install
mvn clean install
```

---

## Maven Coordinates

### Coordinates là gì?

**Định nghĩa:**
- Unique identifiers for artifacts
- Consist of: groupId, artifactId, version
- Format: `groupId:artifactId:version`

### groupId

**Định nghĩa:**
- Group/Organization identifier
- Usually reverse domain name
- Example: `com.example`, `org.apache`

### artifactId

**Định nghĩa:**
- Artifact/Project identifier
- Usually project name
- Example: `my-app`, `spring-boot-starter-web`

### version

**Định nghĩa:**
- Project version
- Examples: `1.0.0`, `2.1.3-SNAPSHOT`

### Example

```xml
<groupId>com.example</groupId>
<artifactId>my-app</artifactId>
<version>1.0.0</version>
```

**Coordinate:** `com.example:my-app:1.0.0`

---

## Câu hỏi thường gặp

### Q1: Maven là gì?

**Maven:**
- Build automation tool
- Dependency management tool
- Uses POM XML file
- Standardized build lifecycle

### Q2: Maven vs Gradle?

| Feature | Maven | Gradle |
|---------|-------|--------|
| **Config** | XML | Groovy/Kotlin DSL |
| **Performance** | Slower | Faster |
| **Flexibility** | Less | More |
| **Learning** | Easier | Steeper |

### Q3: POM là gì?

**POM (Project Object Model):**
- XML file describing project
- Contains project info, dependencies, build config
- Located at `pom.xml` in project root

### Q4: Maven directory structure?

**Standard structure:**
- `src/main/java`: Main source
- `src/main/resources`: Main resources
- `src/test/java`: Test source
- `src/test/resources`: Test resources
- `target`: Build output

### Q5: Maven coordinates?

**Coordinates:**
- `groupId`: Organization identifier
- `artifactId`: Project identifier
- `version`: Project version
- Format: `groupId:artifactId:version`

### Q6: Basic Maven commands?

**Commands:**
- `mvn compile`: Compile source
- `mvn test`: Run tests
- `mvn package`: Create JAR/WAR
- `mvn install`: Install to local repo
- `mvn clean`: Clean build directory

### Q7: Packaging types?

**Types:**
- `jar`: Java archive (default)
- `war`: Web application archive
- `pom`: Parent POM
- `ear`: Enterprise archive

---

## Best Practices

1. **Follow Directory Structure**: Use standard Maven layout
2. **Use Properties**: Define versions, encoding in properties
3. **Version Management**: Use consistent versioning
4. **Dependency Management**: Manage versions in parent POM
5. **Plugin Management**: Configure plugins in parent POM
6. **Clean Builds**: Use `mvn clean` before builds

---

## Bài tập thực hành

### Bài 1: Create Project

```bash
# Yêu cầu:
# 1. Create Maven project structure
# 2. Create pom.xml
# 3. Add dependencies
# 4. Compile project
# 5. Run tests
# 6. Package project
```

### Bài 2: POM Configuration

```xml
<!-- Yêu cầu: Tạo POM với -->
<!-- 1. Maven coordinates
     2. Properties (Java version, encoding)
     3. Dependencies
     4. Build plugins
     5. Project information -->
```

---

## Tổng kết

- **Maven**: Build automation và dependency management tool
- **POM**: Project Object Model XML file
- **Directory Structure**: Standard Maven layout
- **Commands**: compile, test, package, install, clean
- **Coordinates**: groupId:artifactId:version
- **Packaging**: jar, war, pom, ear
