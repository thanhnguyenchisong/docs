# Example — Project minh họa JFrog Artifactory

JFrog Artifactory quản lý artifacts (Maven, npm, Docker). Project minh họa: cấu hình Maven dùng repository Artifactory.

## Cấu hình Maven (settings.xml)

Khi đã có Artifactory, thêm vào `~/.m2/settings.xml`:

```xml
<server>
  <id>artifactory</id>
  <username>admin</username>
  <password>***</password>
</server>
```

Và trong POM hoặc settings: `<repository>` / `<distributionManagement>` trỏ tới URL Artifactory.

## Deploy artifact

```bash
mvn deploy -DaltDeploymentRepository=artifactory::default::http://localhost:8081/artifactory/libs-release-local
```

Đọc kèm [../README.md](../README.md) và các file trong backend/jfrog.
