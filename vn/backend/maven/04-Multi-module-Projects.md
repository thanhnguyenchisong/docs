# Multi-module Projects - Câu hỏi phỏng vấn

## Mục lục
1. [Multi-module là gì?](#multi-module-là-gì)
2. [Parent POM](#parent-pom)
3. [Module Structure](#module-structure)
4. [Dependency Management](#dependency-management)
5. [Aggregator POM](#aggregator-pom)
6. [Building Multi-module Projects](#building-multi-module-projects)
7. [Best Practices](#best-practices)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Multi-module là gì?

### Multi-module Project

**Định nghĩa:**
- Project containing multiple modules
- Modules are separate projects
- Share common configuration
- Built together

### Benefits

1. **Code Organization**: Logical separation
2. **Reusability**: Share code between modules
3. **Centralized Configuration**: Parent POM
4. **Faster Builds**: Build only changed modules
5. **Dependency Management**: Centralized versions

### Example Structure

```
parent-project/
├── pom.xml (parent POM)
├── module-a/
│   ├── pom.xml
│   └── src/
├── module-b/
│   ├── pom.xml
│   └── src/
└── module-c/
    ├── pom.xml
    └── src/
```

---

## Parent POM

### Parent POM là gì?

**Định nghĩa:**
- POM that other modules inherit from
- Contains common configuration
- Defines dependency management
- Defines plugin management

### Parent POM Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>parent-project</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>
    
    <name>Parent Project</name>
    
    <!-- Properties -->
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <spring.version>5.3.21</spring.version>
    </properties>
    
    <!-- Modules -->
    <modules>
        <module>module-a</module>
        <module>module-b</module>
        <module>module-c</module>
    </modules>
    
    <!-- Dependency Management -->
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework</groupId>
                <artifactId>spring-core</artifactId>
                <version>${spring.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
    
    <!-- Plugin Management -->
    <build>
        <pluginManagement>
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
        </pluginManagement>
    </build>
</project>
```

### Key Points

1. **packaging**: Must be `pom`
2. **modules**: List of child modules
3. **dependencyManagement**: Centralize dependency versions
4. **pluginManagement**: Centralize plugin versions

---

## Module Structure

### Child Module POM

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <!-- Parent Reference -->
    <parent>
        <groupId>com.example</groupId>
        <artifactId>parent-project</artifactId>
        <version>1.0.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>
    
    <!-- Module Coordinates -->
    <artifactId>module-a</artifactId>
    <packaging>jar</packaging>
    
    <name>Module A</name>
    
    <!-- Dependencies (version inherited from parent) -->
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <!-- version not needed - inherited from parent -->
        </dependency>
        
        <!-- Module dependency -->
        <dependency>
            <groupId>com.example</groupId>
            <artifactId>module-b</artifactId>
            <version>${project.version}</version>
        </dependency>
    </dependencies>
</project>
```

### Key Points

1. **parent**: Reference to parent POM
2. **relativePath**: Path to parent POM (optional)
3. **artifactId**: Module identifier (groupId và version inherited)
4. **Dependencies**: Can reference other modules

---

## Dependency Management

### Centralized Versions

**Parent POM:**
```xml
<dependencyManagement>
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
        </dependency>
    </dependencies>
</dependencyManagement>
```

**Child Module:**
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <!-- version inherited from parent -->
    </dependency>
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <scope>test</scope>
        <!-- version inherited from parent -->
    </dependency>
</dependencies>
```

### Module Dependencies

**Reference other modules:**
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-b</artifactId>
    <version>${project.version}</version>
</dependency>
```

**Note:** Use `${project.version}` for same version as parent.

---

## Aggregator POM

### Aggregator là gì?

**Định nghĩa:**
- POM that aggregates multiple modules
- Builds all modules together
- May or may not be parent POM

### Aggregator vs Parent

**Aggregator:**
- Contains `<modules>` section
- Builds all modules
- May not have parent configuration

**Parent:**
- Contains `<dependencyManagement>`
- Contains `<pluginManagement>`
- Modules inherit configuration

**Can be both:**
- Same POM can be aggregator và parent

---

## Building Multi-module Projects

### Build from Parent

```bash
# Build all modules
mvn clean install

# Build specific module
cd module-a
mvn clean install

# Build from parent (builds all)
cd parent-project
mvn clean install
```

### Build Order

**Maven determines build order:**
- Based on module dependencies
- Builds dependencies first
- Then builds dependent modules

**Example:**
```
module-a depends on module-b
Build order: module-b → module-a
```

### Reactor Build

**Reactor:**
- Maven's multi-module build system
- Determines build order
- Builds modules in correct order

```bash
# View reactor plan
mvn help:effective-pom

# Build with reactor
mvn clean install -rf :module-a  # Resume from module-a
```

---

## Best Practices

### 1. Structure

- Keep parent POM at root
- Each module in separate directory
- Clear module names

### 2. Version Management

- Use properties for versions
- Centralize in parent POM
- Use `${project.version}` for module dependencies

### 3. Dependency Management

- Define versions in parent
- Don't repeat versions in children
- Use dependencyManagement

### 4. Plugin Management

- Define plugin versions in parent
- Configure plugins in parent
- Children inherit configuration

### 5. Module Dependencies

- Use `${project.version}` for same-version modules
- Avoid circular dependencies
- Keep dependencies minimal

---

## Câu hỏi thường gặp

### Q1: Multi-module project là gì?

**Multi-module:**
- Project with multiple modules
- Modules are separate projects
- Share common configuration
- Built together

### Q2: Parent POM là gì?

**Parent POM:**
- POM that modules inherit from
- Contains common configuration
- Defines dependency management
- Packaging must be `pom`

### Q3: Aggregator vs Parent?

**Aggregator:**
- Contains `<modules>`
- Builds all modules

**Parent:**
- Contains `<dependencyManagement>`
- Modules inherit configuration

**Can be both.**

### Q4: Module dependencies?

**Reference other modules:**
```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>module-b</artifactId>
    <version>${project.version}</version>
</dependency>
```

### Q5: Build order?

**Maven determines:**
- Based on module dependencies
- Builds dependencies first
- Then dependent modules

### Q6: Version management?

**Best practice:**
- Use properties in parent
- Centralize in dependencyManagement
- Children inherit versions

---

## Best Practices

1. **Clear Structure**: Logical module organization
2. **Centralize Configuration**: Use parent POM
3. **Version Management**: Properties và dependencyManagement
4. **Avoid Circular Dependencies**: Keep dependencies clean
5. **Document Modules**: Clear module purposes

---

## Bài tập thực hành

### Bài 1: Multi-module Setup

```bash
# Yêu cầu:
# 1. Create parent POM
# 2. Create multiple modules
# 3. Configure parent-child relationship
# 4. Add module dependencies
# 5. Build project
```

### Bài 2: Dependency Management

```xml
<!-- Yêu cầu:
     1. Define versions in parent
     2. Use dependencyManagement
     3. Reference in child modules
     4. Add module dependencies -->
```

---

## Tổng kết

- **Multi-module**: Multiple modules in one project
- **Parent POM**: Common configuration, packaging=pom
- **Module Structure**: Parent reference, inherited coordinates
- **Dependency Management**: Centralized versions
- **Aggregator**: Builds all modules
- **Build Order**: Based on dependencies
