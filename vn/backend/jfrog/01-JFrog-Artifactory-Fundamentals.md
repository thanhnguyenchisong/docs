# JFrog & Artifactory Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Artifact repository là gì?](#artifact-repository-là-gì)
2. [JFrog Artifactory](#jfrog-artifactory)
3. [Artifactory vs Nexus](#artifactory-vs-nexus)
4. [Kiến trúc cơ bản](#kiến-trúc-cơ-bản)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Artifact repository là gì?

**Artifact repository** là nơi lưu trữ và quản lý **build artifacts**: file JAR/WAR (Java), package npm, image Docker, package Python, … Cung cấp:

- **Lưu trữ**: Single place cho artifacts từ CI build.
- **Proxy/cache**: Proxy lên Maven Central, npm registry, Docker Hub; cache để tải nhanh và ổn định.
- **Versioning**: Quản lý version (snapshot, release), retention (giữ/xóa theo chính sách).
- **Security**: Permissions, scan vulnerability (kết hợp Xray).

---

## JFrog Artifactory

- **Artifactory** là sản phẩm **universal artifact repository** của JFrog: hỗ trợ Maven, Gradle, npm, Docker, PyPI, Go, NuGet, … trong một platform.
- **JFrog Platform** gồm: Artifactory (repo), **Xray** (scan CVE, license), **Pipelines** (CI/CD), **Distribution** (phân phối release).

### Vai trò trong pipeline

1. **Build**: CI (Jenkins, GitLab CI, GitHub Actions) build và **push** artifact lên Artifactory (version, build info).
2. **Deploy**: Staging/Production pull artifact từ Artifactory (theo version/tag) rồi deploy.
3. **Dependency**: Dev/build tool (Maven, npm) cấu hình resolve dependency từ Artifactory (virtual repo) thay vì public registry.

---

## Artifactory vs Nexus

| Tiêu chí | Artifactory | Nexus (Sonatype) |
|----------|-------------|-------------------|
| **Hãng** | JFrog | Sonatype |
| **Repo types** | Rất nhiều (Maven, npm, Docker, …) | Maven, npm, Docker, … |
| **License** | Commercial (có bản free/OSS) | Có bản OSS, bản Pro |
| **Tích hợp** | Xray, Pipelines, Distribution | IQ Server (security) |
| **Virtual repo** | Có, gộp nhiều repo | Có |

→ Cả hai đều dùng làm **single source of truth** cho artifacts; lựa chọn theo stack (JFrog ecosystem vs Sonatype) và yêu cầu enterprise.

---

## Kiến trúc cơ bản

- **Artifactory** chạy dạng server (Java); lưu artifact trên filesystem hoặc object storage (S3, GCS); metadata trong DB.
- **Client**: Maven, npm, Docker, … cấu hình **repository URL** trỏ tới Artifactory (thường qua **virtual repository**).
- **CI**: Job build → publish artifact (mvn deploy, npm publish, docker push) tới URL Artifactory (repo local hoặc virtual).

```
[Developer] ──resolve──► [Artifactory Virtual Repo] ──► [Local / Remote]
[CI Build]   ──push────► [Artifactory Local Repo]
[Deploy]     ──pull────► [Artifactory] (same repo / promotion)
```

---

## Câu hỏi thường gặp

### Artifact repository khác gì Git?

- **Git**: Source code, version control (commit, branch). **Artifact repo**: Output của build (binary, package), không version control source; quản lý version release (1.0.0, 2.0.0-SNAPSHOT, …). Build push artifact; deploy pull artifact.

### Artifactory có cần cho team nhỏ không?

- Team nhỏ vẫn có lợi: dependency proxy (ổn định, cache), lưu artifact build một chỗ, dễ audit và deploy. Có thể dùng bản free/cloud.

---

**Tiếp theo:** [02-Repositories.md](./02-Repositories.md)
