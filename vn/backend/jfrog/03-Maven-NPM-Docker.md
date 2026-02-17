# Maven / npm / Docker với Artifactory - Câu hỏi phỏng vấn

## Mục lục
1. [Maven](#maven)
2. [npm](#npm)
3. [Docker](#docker)
4. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Maven

### Resolution (download dependency)

- Cấu hình **settings.xml** (hoặc pom.xml) dùng repository URL của Artifactory (thường **virtual** repo).
- **Mirror** toàn bộ Maven repo về Artifactory virtual → `settings.xml` chỉ cần một `<mirror>` hoặc `<repository>` trỏ tới virtual.

```xml
<repository>
  <id>central</id>
  <url>https://artifactory.company.com/artifactory/libs-release-virtual</url>
</repository>
```

### Deploy (upload artifact)

- **mvn deploy** đẩy JAR/POM lên Artifactory. Cấu hình **distributionManagement** trong pom.xml (hoặc settings.xml) trỏ tới **local** repo (libs-release-local / libs-snapshot-local).
- CI build: mvn clean install (hoặc package) rồi **deploy**; artifact có version (release hoặc SNAPSHOT) và build number (nếu dùng Jenkins/plugin).

```xml
<distributionManagement>
  <repository>
    <id>artifactory</id>
    <url>https://artifactory.company.com/artifactory/libs-release-local</url>
  </repository>
  <snapshotRepository>
    <id>artifactory</id>
    <url>https://artifactory.company.com/artifactory/libs-snapshot-local</url>
  </snapshotRepository>
</distributionManagement>
```

- **Authentication**: credentials trong settings.xml (server id khớp với id trong distributionManagement).

---

## npm

### Resolution

- **.npmrc** (project hoặc global): `registry=https://artifactory.company.com/artifactory/api/npm/npm-virtual/`
- **npm install** sẽ resolve qua Artifactory; virtual repo gộp npm-local (private) và remote (registry.npmjs.org).

### Publish

- **npm publish**: Đẩy package lên npm-local (hoặc scope @company trỏ về Artifactory). CI dùng **npm publish** sau khi build; version trong package.json.

```
registry=https://artifactory.company.com/artifactory/api/npm/npm-virtual/
//artifactory.company.com/artifactory/api/npm/npm-local/:_authToken=<token>
```

---

## Docker

### Pull

- **docker pull** dùng registry URL: `artifactory.company.com/docker-virtual/<image>:<tag>`
- **docker-virtual** có thể gộp docker-local (images nội bộ) và remote (Docker Hub). Cấu hình **insecure-registries** hoặc TLS tùy môi trường.

### Push

- **docker tag** image trỏ tới registry Artifactory: `artifactory.company.com/docker-local/myapp:1.0`
- **docker login artifactory.company.com** (username + password/token).
- **docker push artifactory.company.com/docker-local/myapp:1.0**

- CI: build image → tag với version/build number → push lên docker-local. Deploy/pipeline kéo image từ Artifactory (cùng URL hoặc promotion sang repo release).

---

## Câu hỏi thường gặp

### Maven snapshot vs release repo?

- **Snapshot**: Version kết thúc -SNAPSHOT; có thể ghi đè; dùng cho build dev/CI. **Release**: Version cố định (1.0.0); không ghi đè; dùng cho release production. Artifactory tách repo (libs-snapshot-local, libs-release-local) để phân quyền và retention khác nhau.

### Docker image lưu ở đâu trong Artifactory?

- Artifactory lưu layer và manifest theo **repository layout** của Docker (blobs, manifests). Về mặt dùng thì chỉ cần biết repo key (docker-local, docker-virtual) và URL registry.

---

**Tiếp theo:** [04-CI-CD-Integration.md](./04-CI-CD-Integration.md)
