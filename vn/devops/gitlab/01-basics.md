## Phần 1: Cơ bản về GitLab CI/CD

### GitLab CI là gì
- CI/CD tích hợp sẵn gắn với repo của bạn; pipelines được định nghĩa trong `.gitlab-ci.yml`.
- Chạy jobs trên **runners** (chia sẻ, project, group, hoặc tự host).

### Quickstart `.gitlab-ci.yml`
```yaml
stages: [test, build]

test:
  stage: test
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn -B test
  artifacts:
    when: always
    reports:
      junit: **/target/surefire-reports/*.xml

build:
  stage: build
  image: maven:3.9-eclipse-temurin-17
  script:
    - mvn -B package
  artifacts:
    paths: [target/*.jar]
```

### Runners
- Shared runners: được cung cấp bởi GitLab (phụ thuộc vào plan).
- Specific runners: được đăng ký cho một project/group.
- Chọn executor: shell, docker, docker+machine, kubernetes.

### Cú pháp chính
- `stages`: thứ tự pipeline.
- `script`: lệnh cho mỗi job.
- `image`: ảnh container cho job; ghi đè mặc định.
- `artifacts`: giữ outputs/reports giữa các jobs.
- `cache`: tăng tốc builds (ví dụ: `.m2/repository`).
- `only`/`except` hoặc `rules`: kiểm soát khi nào jobs chạy.

### Biến
- Định nghĩa trong UI (masked/protected) hoặc trong `.gitlab-ci.yml` dưới `variables:`.
- Truy cập trong jobs dưới dạng env vars, ví dụ: `$CI_PROJECT_NAME`.

### Xem pipelines
- Pipelines → chọn run → xem logs cho mỗi job; artifacts có thể tải xuống từ UI.

Tiếp tục đến Phần 2 để cấu hình pipeline sâu hơn, rules, caching, và templates.