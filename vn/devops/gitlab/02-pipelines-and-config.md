## Phần 2: Pipelines và cấu hình

### Stages và jobs
- Định nghĩa thứ tự `stages`; jobs khai báo một `stage`.
- Jobs chạy song song trong một stage khi có thể.

### Rules (ưu tiên) vs only/except
- Sử dụng `rules:` để kiểm soát việc thực thi job:
```yaml
rules:
  - if: '$CI_COMMIT_BRANCH == "main"'
  - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```
- Tránh `only/except` legacy khi thêm điều kiện phức tạp.

### Artifacts và dependencies
- Truyền outputs build giữa các jobs:
```yaml
artifacts:
  paths: [target/*.jar]
  expire_in: 1 week
```
- Sử dụng `needs:` để tạo DAG và tải artifacts từ dependencies:
```yaml
build:
  stage: build
  script: mvn -B package

test:
  stage: test
  needs: [build]
  script: mvn -B test
```

### Cache (tăng tốc)
- Cache Maven repo:
```yaml
cache:
  key: "$CI_PROJECT_NAME-m2"
  paths:
    - .m2/repository
```
- Sử dụng keys riêng biệt cho mỗi branch nếu cần: `key: "$CI_COMMIT_REF_SLUG-m2"`.

### Templates và includes
- Tái sử dụng snippets với anchors:
```yaml
.maven-job: &maven-job
  image: maven:3.9-eclipse-temurin-17
  before_script: ['mvn -B -q --version']
```
- Include templates remote/local:
```yaml
include:
  - local: .gitlab/ci/base.yml
  - remote: https://example.com/common.gitlab-ci.yml
```

### Biến và environments
- Định nghĩa globals:
```yaml
variables:
  MAVEN_OPTS: "-Dmaven.test.skip=false"
```
- Ghi đè per-job được cho phép.
- Environments cho deploys:
```yaml
deploy:
  stage: deploy
  environment:
    name: staging
    url: https://staging.example.com
```

### Services (cho integration tests)
- Khởi động dependencies:
```yaml
services:
  - name: postgres:15
    alias: db
variables:
  POSTGRES_HOST: db
  POSTGRES_DB: app
```

Tiếp tục đến Phần 3 cho các chủ đề nâng cao: environments, approvals, security scans, và protected variables/branches.