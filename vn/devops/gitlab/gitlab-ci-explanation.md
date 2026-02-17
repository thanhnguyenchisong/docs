# Giải thích chi tiết GitLab CI/CD Pipeline Configuration

File này giải thích từng phần trong file `gitlab-ci.yml` mẫu.

## 📋 Mục lục
1. [Cấu trúc tổng quan](#1-cấu-trúc-tổng-quan)
2. [Biến toàn cục (Variables)](#2-biến-toàn-cục-variables)
3. [Stages và thứ tự thực thi](#3-stages-và-thứ-tự-thực-thi)
4. [Cache Configuration](#4-cache-configuration)
5. [Templates và YAML Anchors](#5-templates-và-yaml-anchors)
6. [Chi tiết từng Stage](#6-chi-tiết-từng-stage)
7. [Artifacts và Dependencies](#7-artifacts-và-dependencies)
8. [Rules và Conditions](#8-rules-và-conditions)
9. [Environments và Deployments](#9-environments-và-deployments)
10. [Security Scanning](#10-security-scanning)
11. [Best Practices](#11-best-practices)

---

## 1. Cấu trúc tổng quan

File `.gitlab-ci.yml` là file cấu hình chính cho GitLab CI/CD pipeline. Pipeline được chia thành các **stages** (giai đoạn), mỗi stage chứa một hoặc nhiều **jobs** (công việc).

```
Pipeline
├── Stage 1: validate
│   └── Job: validate:code-format
├── Stage 2: build
│   └── Job: build:jar
├── Stage 3: test
│   ├── Job: test:unit
│   └── Job: test:integration
├── Stage 4: security
│   ├── Job: security:dependency-scan
│   ├── Job: security:sast
│   └── Job: security:container-scan
├── Stage 5: package
│   └── Job: package:docker
├── Stage 6: deploy-staging
│   └── Job: deploy:staging
├── Stage 7: deploy-prod
│   └── Job: deploy:production
└── Stage 8: cleanup
    └── Job: cleanup:docker-images
```

---

## 2. Biến toàn cục (Variables)

### 2.1. Maven Variables

```yaml
MAVEN_OPTS: "-Dmaven.test.skip=false -Dmaven.javadoc.skip=true"
MAVEN_CLI_OPTS: "--batch-mode --errors --fail-at-end --show-version"
```

**Giải thích:**
- `MAVEN_OPTS`: Biến môi trường cho JVM khi chạy Maven
  - `-Dmaven.test.skip=false`: Không skip tests
  - `-Dmaven.javadoc.skip=true`: Skip javadoc generation để tăng tốc
- `MAVEN_CLI_OPTS`: Options cho Maven command line
  - `--batch-mode`: Chạy không tương tác (non-interactive)
  - `--errors`: Dừng ngay khi có lỗi
  - `--fail-at-end`: Chạy hết các modules rồi mới fail
  - `--show-version`: Hiển thị version của Maven

### 2.2. Docker Variables

```yaml
DOCKER_DRIVER: overlay2
DOCKER_TLS_CERTDIR: "/certs"
DOCKER_REGISTRY: "registry.gitlab.com"
DOCKER_IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
```

**Giải thích:**
- `DOCKER_DRIVER`: Storage driver cho Docker (overlay2 là mặc định và hiệu quả nhất)
- `DOCKER_TLS_CERTDIR`: Thư mục chứa TLS certificates cho Docker daemon
- `DOCKER_REGISTRY`: Registry để push images (GitLab Container Registry)
- `DOCKER_IMAGE_TAG`: Tag cho Docker image
  - `$CI_REGISTRY_IMAGE`: Predefined variable - đường dẫn đầy đủ đến registry image
  - `$CI_COMMIT_SHORT_SHA`: 7 ký tự đầu của commit SHA

### 2.3. Application Variables

```yaml
APP_NAME: "bottleneck-resolve"
APP_VERSION: "0.0.1-SNAPSHOT"
JAVA_VERSION: "21"
```

**Giải thích:**
- Các biến này giúp dễ dàng thay đổi cấu hình mà không cần sửa nhiều nơi
- `JAVA_VERSION` phải khớp với version trong `pom.xml`

---

## 3. Stages và thứ tự thực thi

```yaml
stages:
  - validate      # Kiểm tra code quality
  - build         # Build ứng dụng
  - test          # Chạy tests
  - security      # Security scanning
  - package       # Đóng gói Docker image
  - deploy-staging # Deploy staging
  - deploy-prod   # Deploy production
  - cleanup       # Dọn dẹp
```

**Giải thích:**
- Stages chạy **tuần tự** theo thứ tự định nghĩa
- Jobs trong cùng một stage chạy **song song** (parallel)
- Nếu một job trong stage fail và không có `allow_failure: true`, pipeline sẽ dừng lại

**Ví dụ thứ tự thực thi:**
```
1. validate stage chạy trước
2. Sau khi validate xong → build stage chạy
3. Sau khi build xong → test stage chạy (test:unit và test:integration chạy song song)
4. Tiếp tục các stages khác...
```

---

## 4. Cache Configuration

### 4.1. Maven Cache

```yaml
.maven_cache: &maven_cache
  cache:
    key:
      files:
        - pom.xml
      prefix: ${CI_PROJECT_NAME}
    paths:
      - .m2/repository/
    policy: pull-push
```

**Giải thích chi tiết:**

**`key:`** - Định nghĩa cache key
- `files: [pom.xml]`: Cache key dựa trên hash của file `pom.xml`
- `prefix: ${CI_PROJECT_NAME}`: Thêm prefix để tránh conflict giữa các projects
- **Kết quả**: Mỗi khi `pom.xml` thay đổi, cache key sẽ khác → cache mới được tạo

**`paths:`** - Các thư mục/file cần cache
- `.m2/repository/`: Maven local repository chứa các dependencies đã download
- **Lợi ích**: Không cần download lại dependencies mỗi lần chạy pipeline → tiết kiệm thời gian và bandwidth

**`policy: pull-push`** - Chính sách cache
- `pull`: Tải cache xuống trước khi chạy job
- `push`: Upload cache lên sau khi job hoàn thành
- **Các options khác**:
  - `pull`: Chỉ pull (dùng cho jobs chỉ đọc)
  - `push`: Chỉ push (dùng cho jobs chỉ tạo cache)

**Ví dụ:**
```
Lần chạy đầu tiên:
- Không có cache → Download tất cả dependencies từ Maven Central
- Sau khi download xong → Upload lên cache

Lần chạy thứ 2:
- Pull cache xuống → Đã có dependencies sẵn
- Chỉ download dependencies mới (nếu có)
- Tiết kiệm ~80-90% thời gian
```

---

## 5. Templates và YAML Anchors

### 5.1. YAML Anchors (`&` và `<<:`)

```yaml
.maven_job_template: &maven_job_template
  image: maven:3.9-eclipse-temurin-21-jammy
  <<: *maven_cache
  before_script:
    - mvn --version
    - java -version
```

**Giải thích:**

**`&maven_job_template`**: Định nghĩa anchor (điểm tham chiếu)
- Tên bắt đầu bằng `.` → đây là hidden job (không chạy, chỉ dùng làm template)

**`<<: *maven_cache`**: Merge cache configuration
- `<<:`: Merge operator trong YAML
- `*maven_cache`: Tham chiếu đến anchor `maven_cache`

**Sử dụng template:**

```yaml
build:jar:
  <<: *maven_job_template  # Kế thừa tất cả config từ template
  stage: build
  script:
    - mvn package
```

**Kết quả sau khi merge:**

```yaml
build:jar:
  image: maven:3.9-eclipse-temurin-21-jammy
  cache:
    key: ...
    paths: ...
  before_script:
    - mvn --version
    - java -version
  stage: build
  script:
    - mvn package
```

**Lợi ích:**
- **DRY (Don't Repeat Yourself)**: Không lặp lại code
- **Dễ bảo trì**: Sửa một chỗ, áp dụng cho tất cả jobs
- **Nhất quán**: Tất cả jobs dùng cùng image và cache config

---

## 6. Chi tiết từng Stage

### 6.1. Validate Stage

```yaml
validate:code-format:
  <<: *maven_job_template
  stage: validate
  script:
    - mvn $MAVEN_CLI_OPTS checkstyle:check || true
    - mvn $MAVEN_CLI_OPTS validate
    - mvn $MAVEN_CLI_OPTS compile
  allow_failure: true
```

**Giải thích:**
- **`checkstyle:check`**: Kiểm tra code style (nếu có plugin)
  - `|| true`: Không fail job nếu checkstyle không có hoặc fail
- **`validate`**: Validate `pom.xml` và project structure
- **`compile`**: Compile code để phát hiện syntax errors sớm
- **`allow_failure: true`**: Job này fail không làm pipeline fail

### 6.2. Build Stage

```yaml
build:jar:
  script:
    - mvn $MAVEN_CLI_OPTS clean package -DskipTests
  artifacts:
    paths:
      - target/*.jar
    expire_in: 1 week
    when: on_success
```

**Giải thích:**

**`clean package`**:
- `clean`: Xóa thư mục `target/`
- `package`: Build JAR file
- `-DskipTests`: Skip tests (sẽ chạy ở test stage)

**`artifacts:`** - Lưu outputs của job
- **`paths:`**: Các file/thư mục cần lưu
  - `target/*.jar`: Tất cả JAR files trong thư mục target
- **`expire_in:`**: Thời gian giữ artifacts
  - `1 week`: Tự động xóa sau 1 tuần
  - Các options: `1 hour`, `1 day`, `1 month`, `never`
- **`when:`**: Khi nào lưu artifacts
  - `on_success`: Chỉ lưu khi job thành công
  - `always`: Luôn lưu (kể cả khi fail)
  - `on_failure`: Chỉ lưu khi fail

**Sử dụng artifacts:**
- Jobs khác có thể download artifacts thông qua `dependencies:`

### 6.3. Test Stage

#### 6.3.1. Unit Tests

```yaml
test:unit:
  dependencies:
    - build:jar
  script:
    - mvn $MAVEN_CLI_OPTS test
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml
  coverage: '/Total.*?([0-9]{1,3})%/'
```

**Giải thích:**

**`dependencies:`**: Jobs cần download artifacts từ
- `build:jar`: Download JAR file từ build job
- **Lưu ý**: Không cần thiết nếu chỉ chạy tests, nhưng hữu ích nếu test cần JAR file

**`reports: junit:`**: Test reports cho GitLab UI
- GitLab sẽ parse file XML và hiển thị:
  - Số lượng tests passed/failed
  - Test duration
  - Test history

**`coverage:`**: Regex để extract coverage percentage
- GitLab sẽ hiển thị coverage trong pipeline view
- Ví dụ output: `Total: 85%` → GitLab hiển thị 85%

#### 6.3.2. Integration Tests

```yaml
test:integration:
  services:
    - name: postgres:15-alpine
      alias: postgres-db
  variables:
    POSTGRES_DB: testdb
    POSTGRES_USER: testuser
    POSTGRES_PASSWORD: testpass
    POSTGRES_HOST: postgres-db
```

**Giải thích:**

**`services:`**: Khởi động containers phụ trợ
- **`name:`**: Image name của service
- **`alias:`**: Tên để reference trong code
  - Code có thể connect đến `postgres-db:5432`
- **Lưu ý**: Services chạy trong cùng network với job container

**`variables:`**: Environment variables cho job
- Các biến này override global variables
- Database connection được inject vào application qua environment variables

**Workflow:**
```
1. GitLab Runner khởi động job container (Maven)
2. Đồng thời khởi động service container (PostgreSQL)
3. Cả 2 containers trong cùng Docker network
4. Application trong job container connect đến PostgreSQL qua alias
5. Chạy integration tests
6. Cleanup cả 2 containers sau khi xong
```

---

## 7. Artifacts và Dependencies

### 7.1. Artifacts Flow

```
build:jar (tạo JAR)
    ↓
    artifacts: target/*.jar
    ↓
test:unit (download JAR)
    ↓
    artifacts: test reports
    ↓
package:docker (download JAR để build image)
```

**Giải thích:**

**Artifacts được lưu ở đâu?**
- GitLab lưu artifacts trong object storage (S3, GCS, hoặc local storage)
- Mỗi job có thể upload/download artifacts

**Download artifacts:**
```yaml
test:unit:
  dependencies:
    - build:jar  # Download artifacts từ build:jar job
```

**Lưu ý:**
- Nếu không khai báo `dependencies:`, job sẽ download artifacts từ **tất cả** jobs ở stages trước
- Để tối ưu, chỉ khai báo dependencies cần thiết

### 7.2. Artifacts Reports

```yaml
artifacts:
  reports:
    junit: target/surefire-reports/TEST-*.xml
    dotenv: target/maven-build.env
    sast: gl-sast-report.json
    dependency_scanning: dependency-check-report.json
```

**Giải thích:**

Các loại reports được GitLab hỗ trợ:
- **`junit:`**: Test results → hiển thị trong Tests tab
- **`dotenv:`**: Environment variables → có thể dùng trong jobs sau
- **`sast:`**: Security scan results → hiển thị trong Security tab
- **`dependency_scanning:`**: Dependency vulnerabilities → Security tab
- **`container_scanning:`**: Container vulnerabilities → Security tab
- **`coverage:`**: Code coverage → hiển thị trong pipeline

---

## 8. Rules và Conditions

### 8.1. Rules Syntax

```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
  - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

**Giải thích:**

**`rules:`** - Modern way để control job execution (thay thế `only/except`)

**Các điều kiện phổ biến:**

```yaml
# Chạy trên branch cụ thể
- if: $CI_COMMIT_BRANCH == "main"

# Chạy trên merge request
- if: $CI_PIPELINE_SOURCE == "merge_request_event"

# Chạy khi có tag
- if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/

# Chạy khi file thay đổi
- if: $CI_COMMIT_BRANCH
  changes:
    - Dockerfile
    - pom.xml

# Không chạy (skip job)
- if: $CI_COMMIT_BRANCH == "develop"
  when: never
```

**Predefined Variables:**

| Variable | Mô tả | Ví dụ |
|----------|-------|-------|
| `$CI_COMMIT_BRANCH` | Branch name | `main`, `develop` |
| `$CI_COMMIT_TAG` | Tag name | `v1.0.0` |
| `$CI_PIPELINE_SOURCE` | Nguồn trigger | `push`, `merge_request_event`, `schedule` |
| `$CI_COMMIT_SHORT_SHA` | Short commit SHA | `a1b2c3d` |
| `$CI_PROJECT_NAME` | Project name | `bottleneck-resolve` |
| `$CI_REGISTRY_IMAGE` | Registry image path | `registry.gitlab.com/group/project` |

### 8.2. When Conditions

```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
    when: on_success  # Chạy khi jobs trước thành công
  - if: $CI_COMMIT_BRANCH == "main"
    when: manual      # Cần manual trigger
  - if: $CI_COMMIT_BRANCH == "main"
    when: delayed     # Chạy sau một khoảng thời gian
    start_in: 1 hour
```

**Các giá trị `when:`**
- `on_success`: Chạy khi jobs trước thành công (mặc định)
- `on_failure`: Chỉ chạy khi có job fail
- `always`: Luôn chạy
- `manual`: Cần click "Play" button trong GitLab UI
- `delayed`: Chạy sau một khoảng thời gian

### 8.3. Changes Keyword

```yaml
rules:
  - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    changes:
      - Dockerfile
      - pom.xml
      - src/**/*
```

**Giải thích:**
- Job chỉ chạy khi có file trong danh sách `changes:` bị thay đổi
- Hữu ích để tránh chạy jobs không cần thiết
- Hỗ trợ glob patterns: `src/**/*`, `*.java`

---

## 9. Environments và Deployments

### 9.1. Environment Configuration

```yaml
deploy:staging:
  environment:
    name: staging
    url: https://staging.example.com
    auto_stop_in: 1 week
```

**Giải thích:**

**`environment:`**: Định nghĩa deployment environment

**`name:`**: Tên environment
- Hiển thị trong GitLab UI: Operations > Environments
- Có thể track deployment history

**`url:`**: URL của environment
- Click vào environment trong GitLab UI sẽ mở URL này
- Hữu ích để quick access

**`auto_stop_in:`**: Tự động stop environment sau một khoảng thời gian
- Tiết kiệm resources
- Production thường không có auto_stop

### 9.2. Manual Deployment

```yaml
deploy:production:
  when: manual
  rules:
    - if: $CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/
```

**Giải thích:**

**`when: manual`**: Cần manual approval
- Job sẽ hiển thị "Play" button trong GitLab UI
- User phải click để trigger deployment
- **Bảo vệ**: Tránh deploy nhầm lên production

**Workflow:**
```
1. Code được merge vào main
2. Pipeline chạy đến deploy:production job
3. Job dừng lại, chờ manual trigger
4. User review và click "Play"
5. Deployment được thực thi
```

### 9.3. Kubernetes Deployment

```yaml
deploy:staging:
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/bottleneck-resolve \
        app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA \
        -n bottleneck-resolve-staging
    - kubectl rollout status deployment/bottleneck-resolve
```

**Giải thích:**

**`image: bitnami/kubectl:latest`**: Container có kubectl CLI
- Cần để chạy kubectl commands

**`kubectl set image`**: Update image trong deployment
- `deployment/bottleneck-resolve`: Tên deployment trong K8s
- `app=...`: Container name và image tag mới
- `-n bottleneck-resolve-staging`: Namespace

**`kubectl rollout status`**: Chờ deployment hoàn thành
- Sẽ fail nếu rollout không thành công
- Timeout mặc định: 5 phút

**Lưu ý:**
- Cần cấu hình Kubernetes credentials:
  - `KUBECONFIG` variable trong GitLab CI/CD settings
  - Hoặc service account với RBAC permissions

---

## 10. Security Scanning

### 10.1. Dependency Scanning

```yaml
security:dependency-scan:
  script:
    - ./dependency-check.sh --project "$CI_PROJECT_NAME" \
        --scan target --format JSON --format HTML
  artifacts:
    reports:
      dependency_scanning: dependency-check-report.json
```

**Giải thích:**

**OWASP Dependency Check**: Tool scan vulnerabilities trong dependencies
- Scan file JAR và dependencies
- So sánh với CVE database
- Tạo report JSON và HTML

**Reports**: GitLab sẽ parse JSON và hiển thị:
- List vulnerabilities
- Severity (Critical, High, Medium, Low)
- Affected dependencies
- Recommendations

### 10.2. Container Scanning

```yaml
security:container-scan:
  image:
    name: aquasec/trivy:latest
  script:
    - trivy image --exit-code 0 \
        --severity HIGH,CRITICAL \
        --format json \
        --output container-scan-report.json \
        $DOCKER_IMAGE_TAG
```

**Giải thích:**

**Trivy**: Popular container scanning tool
- Scan Docker images cho vulnerabilities
- Fast và accurate

**Options:**
- `--exit-code 0`: Không fail job nếu có vulnerabilities (để xem report)
- `--severity HIGH,CRITICAL`: Chỉ report vulnerabilities nghiêm trọng
- `--format json`: Output JSON format cho GitLab
- `--output`: Lưu report vào file

**Workflow:**
```
1. Build Docker image (package:docker job)
2. Push image lên registry
3. Scan image với Trivy
4. Upload report lên GitLab
5. GitLab hiển thị vulnerabilities trong Security tab
```

---

## 11. Best Practices

### 11.1. Performance Optimization

**1. Sử dụng cache đúng cách:**
```yaml
cache:
  key: ${CI_COMMIT_REF_SLUG}-maven  # Cache riêng cho mỗi branch
  paths:
    - .m2/repository
```

**2. Parallel jobs:**
```yaml
# Thay vì chạy tuần tự
test:unit:
  stage: test
test:integration:
  stage: test  # Chạy song song với test:unit
```

**3. Early exit:**
```yaml
# Fail sớm nếu có lỗi
script:
  - mvn validate || exit 1
  - mvn compile || exit 1
```

### 11.2. Security Best Practices

**1. Protected variables:**
- Lưu sensitive data (passwords, tokens) trong GitLab Variables
- Đánh dấu "Protected" và "Masked"

**2. Limit access:**
```yaml
deploy:production:
  when: manual
  # Chỉ maintainers có thể trigger
```

**3. Scan trước khi deploy:**
```yaml
# Security scans phải pass trước khi deploy
deploy:staging:
  needs:
    - security:dependency-scan
    - security:container-scan
```

### 11.3. Maintainability

**1. Sử dụng templates:**
```yaml
.maven_job_template: &maven_job_template
  image: maven:3.9-eclipse-temurin-21-jammy
  before_script:
    - mvn --version
```

**2. Comments:**
```yaml
# Giải thích tại sao làm như vậy
script:
  - mvn package -DskipTests  # Skip tests vì chạy riêng ở test stage
```

**3. Consistent naming:**
```yaml
# Format: stage:job-name
build:jar
test:unit
deploy:staging
```

### 11.4. Error Handling

**1. Allow failure cho optional jobs:**
```yaml
security:dependency-scan:
  allow_failure: true  # Không block pipeline nếu scan fail
```

**2. Retry logic:**
```yaml
deploy:staging:
  retry:
    max: 2  # Retry tối đa 2 lần nếu fail
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
```

**3. Notifications:**
```yaml
notify:failure:
  stage: .post
  when: on_failure
  script:
    - curl -X POST $SLACK_WEBHOOK_URL ...
```

---

## 📚 Tài liệu tham khảo

- [GitLab CI/CD YAML Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/)
- [GitLab Environments](https://docs.gitlab.com/ee/ci/environments/)
- [GitLab Security Scanning](https://docs.gitlab.com/ee/user/application_security/)
- [Maven Documentation](https://maven.apache.org/guides/)

---

## ❓ FAQ

**Q: Làm sao để chạy job chỉ trên một branch cụ thể?**
```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
```

**Q: Làm sao để cache dependencies giữa các branches?**
```yaml
cache:
  key: global-maven  # Dùng cùng key cho tất cả branches
```

**Q: Làm sao để skip một job?**
```yaml
rules:
  - if: $CI_COMMIT_BRANCH == "main"
    when: never  # Skip job này
```

**Q: Làm sao để chạy job định kỳ (schedule)?**
- Vào GitLab UI: CI/CD > Schedules > New schedule
- Pipeline sẽ có `$CI_PIPELINE_SOURCE == "schedule"`

---

**Kết luận:** File `gitlab-ci.yml` này cung cấp một pipeline CI/CD đầy đủ cho Spring Boot application với các best practices. Tùy chỉnh theo nhu cầu cụ thể của project.
