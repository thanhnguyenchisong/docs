## Phần 1: Cơ bản về Jenkins

### Jenkins là gì
- CI server chạy jobs/pipelines; có thể mở rộng cao qua plugins.
- Khái niệm cốt lõi: **controller** (master), **agents** (workers), **jobs/pipelines**, **credentials**, **artifacts**.

### Tùy chọn cài đặt
- Docker quickstart:
```bash
docker run -u 0 --rm -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```
- Native install: packages cho Debian/Ubuntu/RHEL, hoặc war file.
- Kubernetes: sử dụng official Helm chart (bao gồm controller và dynamic agents qua K8s plugin).

### Login đầu tiên
- Mở khóa với admin password in trong logs (`initialAdminPassword`).
- Cài đặt recommended plugins khi được prompt.
- Tạo user admin; cấu hình URL trong **Manage Jenkins → Configure System**.

### Vùng UI chính
- Manage Jenkins: plugins, nodes, credentials, global tool config (JDK, Maven, Git, Node).
- Nodes: thêm static agents hoặc cấu hình K8s/cloud cho dynamic agents.
- Credentials: lưu trữ secrets (SSH keys, tokens, passwords) scoped globally hoặc per folder.

### Quick freestyle job (baseline)
1) New Item → Freestyle.
2) Source Code Management: Git repo URL.
3) Build: ví dụ: `mvn test` hoặc `./gradlew test`.
4) Post-build: archive artifacts (`target/*.jar`) hoặc JUnit reports (`**/surefire-reports/*.xml`).

### Tại sao pipelines (phần tiếp theo)
- Pipelines (Jenkinsfile) là code, versioned với app, reproducible, và hỗ trợ stages/parallelism/agents.

Tiếp tục đến Phần 2 cho patterns Declarative/Scripted pipeline.