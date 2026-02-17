# CI/CD Integration - Câu hỏi phỏng vấn JFrog

## Mục lục
1. [Luồng build → Artifactory](#luồng-build--artifactory)
2. [Jenkins](#jenkins)
3. [GitLab CI / GitHub Actions](#gitlab-ci--github-actions)
4. [Build info và promotion](#build-info-và-promotion)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Luồng build → Artifactory

1. **CI trigger**: Commit/tag, merge, schedule.
2. **Build**: Compile, test, package (JAR, image, npm package).
3. **Publish**: Push artifact lên Artifactory (Maven deploy, docker push, npm publish) với **version** và (tùy tool) **build number**.
4. **Deploy**: Stage/prod pipeline **pull** artifact từ Artifactory theo version/tag rồi deploy (Kubernetes, VM, …).

→ Artifactory là **single source of truth**: mọi môi trường dùng cùng artifact đã được lưu và (tùy quy trình) đã scan/approve.

---

## Jenkins

- **Jenkins** gọi Maven/npm/Docker với cấu hình trỏ Artifactory (settings.xml, .npmrc, docker registry).
- **JFrog Plugin** (Artifactory Plugin): Cấu hình Artifactory server + repo trong job; **publishBuildInfo** upload build info (dependency, env) lên Artifactory; **promotion** (staging → release) qua REST/UI.
- Pipeline (Jenkinsfile): `artifactory.upload()`, `artifactory.download()`, hoặc shell `mvn deploy`, `docker push` với credentials từ Jenkins.

```groovy
// Ví dụ ý tưởng
steps {
  sh 'mvn clean deploy -DskipTests'
  artifactoryUpload spec: '...', serverId: 'artifactory'
}
```

---

## GitLab CI / GitHub Actions

- **GitLab CI**: Job build chạy `mvn deploy` / `docker push` / `npm publish`; credentials (user + token hoặc API key) lưu trong CI/CD variables (masked). Artifact version có thể từ CI_COMMIT_TAG hoặc version trong file.
- **GitHub Actions**: Tương tự; secret cho Artifactory URL + token; step chạy Maven/Docker/npm với env hoặc config file được inject.
- **JFrog CLI** (jfrog rt): Dùng trong script để upload, download, promotion từ bất kỳ CI nào (jfrog rt upload, jfrog rt build-publish, jfrog rt build-promote).

---

## Build info và promotion

- **Build info**: Metadata gắn với một lần build (dependency list, env, git commit, …). Artifactory lưu build info; dùng cho traceability (artifact nào từ build nào) và **Xray** (scan dependency của build).
- **Promotion**: Chuyển artifact từ repo “staging” sang “release” (hoặc channel) khi đã qua test/approval. Có thể bằng UI, REST API, hoặc JFrog CLI (jfrog rt build-promote). Pipeline prod chỉ pull từ repo release.

---

## Câu hỏi thường gặp

### Version artifact lấy từ đâu?

- **Maven**: pom.xml (version); SNAPSHOT thường kèm build number (Jenkins BUILD_NUMBER, GitLab CI_JOB_ID). **Docker**: tag từ git tag (v1.0.0) hoặc commit SHA. **npm**: package.json version. Quy ước do team (semver, date, build id).

### Promotion bắt buộc không?

- Không bắt buộc; tùy quy trình. Có team deploy thẳng từ repo “release” (CI push vào đó khi tag); có team push vào staging rồi promote sang release sau khi test. Promotion giúp tách rõ “đã test/approved” vs “mới build”.

---

**Tiếp theo:** [05-Security-Best-Practices.md](./05-Security-Best-Practices.md)
