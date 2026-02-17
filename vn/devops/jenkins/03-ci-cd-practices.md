## Phần 3: CI/CD practices, agents, và security

### Agents và scalability
- Ưu tiên ephemeral agents (K8s plugin, cloud) để tránh snowflake nodes.
- Label agents và pin heavy stages đến matching labels (ví dụ: `agent { label 'docker' }`).
- Cache responsibly: reuse Maven/Gradle caches qua mounts hoặc persistent volumes trên dynamic agents.

### Credentials và secrets
- Lưu trữ trong Jenkins credentials store; không bao giờ hardcode trong Jenkinsfile.
- Sử dụng `withCredentials` blocks; scope tối thiểu.
- Rotate credentials định kỳ; hạn chế ai có thể xem chúng.

### Quality gates
- Thêm steps cho lint/tests/security:
```groovy
stage('Verify') {
  steps {
    sh 'mvn -B test'
    sh 'mvn -B verify'           // integration tests
    // thêm static analysis tools ở đây (spotbugs, checkstyle, etc.)
  }
}
```
- Fail fast trên unit/integration test failures; publish JUnit reports.

### Artifacts và caching
- Archive build outputs: `archiveArtifacts artifacts: 'target/*.jar', fingerprint: true`
- JUnit reports: `junit '**/target/surefire-reports/*.xml'`
- Cache package repos: sử dụng repo mirrors (Nexus/Artifactory) để tăng tốc pipelines.

### Notifications và insights
- Post đến chat/email trên failures; include links đến build, diff, và test reports.
- Sử dụng Blue Ocean hoặc pipeline visualization để spot slow stages.

### Security và hardening
- Khóa ai có thể cấu hình Jenkins và cài đặt plugins.
- Giữ Jenkins và plugins up to date; xóa unused plugins.
- Chạy controller và agents với least privilege; tránh chạy dưới dạng root khi có thể.
- Enforce CSRF và bật matrix-based security hoặc integrate với SSO/LDAP.
- Disable script approvals cho untrusted users; review Groovy sandbox requests.

### Pipeline hygiene
- Giữ Jenkinsfiles ngắn; di chuyển repetition đến shared libraries.
- Parameterize pipelines cho branch/env; tránh duplicating jobs.
- Sử dụng `when` conditions để skip stages trên docs-only changes, etc.

### Delivery patterns (examples)
- Build/test → publish artifact → deploy qua separate job với approval.
- Multibranch pipeline cho PRs: chạy tests, static analysis, và publish reports mà không deploy.

### Backup và recovery
- Backup `JENKINS_HOME` (config, jobs, credentials) định kỳ.
- Document restore steps; test recovery trên throwaway controller.

Bạn giờ đã có concise Jenkins path từ basics đến production-ready CI/CD.