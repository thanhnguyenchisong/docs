# Example — Project minh họa Maven

Multi-module Maven: parent POM, module `core` và `app` (app phụ thuộc core). Chạy được để **test và học** lifecycle, dependencies.

## Chạy

```bash
# Build toàn bộ (compile, test, package các module)
mvn clean install

# Chạy app (dùng class từ core)
cd app && mvn exec:java
```

Hoặc từ thư mục gốc:

```bash
mvn clean install -pl app -am exec:java
```

Đọc kèm [../README.md](../README.md) và các file trong backend/maven.
