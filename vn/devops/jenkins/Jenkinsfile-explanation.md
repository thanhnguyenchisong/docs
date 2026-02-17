# Giải thích chi tiết Jenkins Pipeline Configuration (Jenkinsfile)

File này giải thích từng phần trong file `Jenkinsfile` production-ready mẫu.

## 📋 Mục lục
1. [Cấu trúc tổng quan](#1-cấu-trúc-tổng-quan)
2. [Agent Configuration](#2-agent-configuration)
3. [Options và Pipeline Settings](#3-options-và-pipeline-settings)
4. [Environment Variables](#4-environment-variables)
5. [Parameters](#5-parameters)
6. [Stages chi tiết](#6-stages-chi-tiết)
7. [Post Actions](#7-post-actions)
8. [Credentials Management](#8-credentials-management)
9. [Parallel Execution](#9-parallel-execution)
10. [Best Practices](#10-best-practices)

---

## 1. Cấu trúc tổng quan

Jenkinsfile sử dụng **Declarative Pipeline** syntax - cách tiếp cận hiện đại và được khuyến nghị cho Jenkins pipelines.

```
Pipeline
├── Agent Configuration
├── Options
├── Environment Variables
├── Parameters
├── Stages
│   ├── Checkout
│   ├── Validate
│   ├── Build
│   ├── Unit Tests
│   ├── Integration Tests
│   ├── Code Quality
│   ├── Security Scan (parallel)
│   ├── Build Docker Image
│   ├── Container Security Scan
│   ├── Deploy to Staging
│   └── Deploy to Production
└── Post Actions
```

---

## 2. Agent Configuration

### 2.1. Pipeline-level Agent

```groovy
agent {
    docker {
        image 'maven:3.9-eclipse-temurin-21-jammy'
        args '-v /root/.m2:/root/.m2 -v /var/run/docker.sock:/var/run/docker.sock'
    }
}
```

**Giải thích:**

**`agent {}`**: Định nghĩa agent để chạy pipeline
- **Pipeline-level**: Áp dụng cho tất cả stages (trừ khi override ở stage-level)

**`docker {}`**: Sử dụng Docker agent
- **`image`**: Docker image để chạy pipeline
  - `maven:3.9-eclipse-temurin-21-jammy`: Maven với Java 21
- **`args`**: Arguments cho Docker container
  - `-v /root/.m2:/root/.m2`: Mount Maven cache directory
    - **Lợi ích**: Cache dependencies giữa các builds → tăng tốc
  - `-v /var/run/docker.sock:/var/run/docker.sock`: Mount Docker socket
    - **Lợi ích**: Cho phép build Docker images từ trong container (Docker-in-Docker)

**Các loại agent khác:**

```groovy
// Sử dụng bất kỳ agent nào available
agent any

// Sử dụng agent với label cụ thể
agent { label 'docker' }

// Sử dụng Kubernetes pod
agent {
    kubernetes {
        yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: maven
                image: maven:3.9-eclipse-temurin-21-jammy
        '''
    }
}

// Không có agent (declarative pipeline phải có agent)
agent none  // Phải định nghĩa agent ở mỗi stage
```

### 2.2. Stage-level Agent

```groovy
stage('Integration Tests') {
    agent {
        docker {
            image 'maven:3.9-eclipse-temurin-21-jammy'
            args '-v /root/.m2:/root/.m2'
        }
    }
    steps { ... }
}
```

**Giải thích:**
- Override agent cho stage cụ thể
- Hữu ích khi stage cần environment khác với pipeline-level agent

---

## 3. Options và Pipeline Settings

### 3.1. Build Discarder

```groovy
buildDiscarder(logRotator(
    numToKeepStr: '50',
    daysToKeepStr: '30',
    artifactNumToKeepStr: '10'
))
```

**Giải thích:**

**`buildDiscarder`**: Tự động xóa old builds để tiết kiệm disk space

**`logRotator`**: Rotation policy
- **`numToKeepStr: '50'`**: Giữ tối đa 50 builds
- **`daysToKeepStr: '30'`**: Giữ builds trong 30 ngày
- **`artifactNumToKeepStr: '10'`**: Giữ artifacts của 10 builds gần nhất

**Logic:**
```
Giữ builds theo:
1. Tối đa 50 builds (numToKeepStr)
2. Hoặc builds trong 30 ngày (daysToKeepStr)
3. Lấy giá trị lớn hơn

Artifacts:
- Chỉ giữ artifacts của 10 builds gần nhất
- Builds cũ hơn vẫn giữ nhưng không có artifacts
```

### 3.2. Timeout

```groovy
timeout(time: 30, unit: 'MINUTES')
```

**Giải thích:**
- Pipeline sẽ tự động fail nếu chạy quá 30 phút
- **Lợi ích**: Tránh pipeline chạy mãi mãi (ví dụ: stuck, infinite loop)
- Có thể override ở stage-level nếu cần

### 3.3. Retry

```groovy
retry(3)
```

**Giải thích:**
- Tự động retry pipeline tối đa 3 lần nếu fail
- **Lưu ý**: Chỉ retry khi có lỗi transient (network, timeout)
- Không retry khi có lỗi code (compile errors, test failures)

### 3.4. Timestamps

```groovy
timestamps()
```

**Giải thích:**
- Thêm timestamp vào mỗi dòng trong console output
- **Format**: `[2024-01-15T10:30:45.123Z] echo "Hello"`
- **Lợi ích**: Dễ debug, track thời gian thực thi từng step

### 3.5. AnsiColor

```groovy
ansiColor('xterm')
```

**Giải thích:**
- Enable màu sắc trong console output
- **Lợi ích**: Dễ đọc logs, phân biệt success/error
- **Terminal types**: `xterm`, `vt100`, `gnome-terminal`

### 3.6. Skip Stages After Unstable

```groovy
skipStagesAfterUnstable()
```

**Giải thích:**
- Skip các stages sau khi có stage unstable
- **Unstable**: Có tests fail nhưng không block pipeline
- **Lợi ích**: Tiết kiệm thời gian, không chạy stages không cần thiết

### 3.7. Disable Concurrent Builds

```groovy
disableConcurrentBuilds()
```

**Giải thích:**
- Không cho phép chạy nhiều builds cùng lúc trên cùng một branch
- **Lợi ích**: 
  - Tránh conflict khi deploy
  - Đảm bảo thứ tự thực thi
- **Alternative**: Có thể dùng `lock()` để lock resources cụ thể

---

## 4. Environment Variables

### 4.1. Basic Environment Variables

```groovy
environment {
    APP_NAME = 'bottleneck-resolve'
    APP_VERSION = '0.0.1-SNAPSHOT'
    JAVA_VERSION = '21'
}
```

**Giải thích:**
- Định nghĩa biến môi trường cho toàn bộ pipeline
- Có thể override ở stage-level hoặc step-level
- Truy cập: `${APP_NAME}` hoặc `$APP_NAME`

### 4.2. Credentials trong Environment

```groovy
DOCKER_REGISTRY = credentials('docker-registry-url')
SONAR_TOKEN = credentials('sonar-token')
```

**Giải thích:**

**`credentials('id')`**: Load credentials từ Jenkins credentials store
- **`id`**: Credential ID trong Jenkins
- **Lưu ý**: Credentials được mask trong logs (không hiển thị giá trị thực)

**Các loại credentials:**
- **Secret text**: `credentials('my-secret')`
- **Username/Password**: `credentials('my-user-pass')` → `$MY_USER_PASS_USR` và `$MY_USER_PASS_PSW`
- **SSH Private Key**: `credentials('my-ssh-key')`
- **Certificate**: `credentials('my-cert')`

**Cách tạo credentials:**
1. Jenkins UI → Manage Jenkins → Credentials
2. Add Credentials
3. Chọn loại credential
4. Nhập ID (quan trọng để reference)
5. Save

### 4.3. Dynamic Environment Variables

```groovy
DOCKER_IMAGE_TAG = "${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}"
```

**Giải thích:**
- Sử dụng string interpolation với `${}`
- **`env.BUILD_NUMBER`**: Predefined variable - build number của Jenkins
- **Predefined variables**:
  - `env.BUILD_NUMBER`: Build number
  - `env.BRANCH_NAME`: Branch name
  - `env.GIT_COMMIT`: Git commit SHA
  - `env.WORKSPACE`: Workspace path
  - `env.BUILD_URL`: URL của build

---

## 5. Parameters

### 5.1. Choice Parameter

```groovy
choice(
    name: 'DEPLOY_ENV',
    choices: ['none', 'staging', 'production'],
    description: 'Environment to deploy to'
)
```

**Giải thích:**
- Dropdown menu cho user chọn
- **`name`**: Tên parameter (truy cập: `params.DEPLOY_ENV`)
- **`choices`**: Danh sách options
- **`description`**: Mô tả hiển thị trong UI

**Sử dụng:**
```groovy
when {
    expression { params.DEPLOY_ENV == 'staging' }
}
```

### 5.2. Boolean Parameter

```groovy
booleanParam(
    name: 'SKIP_TESTS',
    defaultValue: false,
    description: 'Skip running tests'
)
```

**Giải thích:**
- Checkbox trong UI
- **`defaultValue`**: Giá trị mặc định
- **Truy cập**: `params.SKIP_TESTS` → `true` hoặc `false`

**Sử dụng:**
```groovy
when {
    not { params.SKIP_TESTS }
}
```

### 5.3. String Parameter

```groovy
string(
    name: 'CUSTOM_IMAGE_TAG',
    defaultValue: '',
    description: 'Custom Docker image tag (optional)'
)
```

**Giải thích:**
- Text input trong UI
- **`defaultValue`**: Giá trị mặc định (empty string)
- **Truy cập**: `params.CUSTOM_IMAGE_TAG`

**Lưu ý:**
- Parameters chỉ có hiệu lực khi trigger pipeline manually
- Scheduled builds hoặc webhook triggers không có parameters

---

## 6. Stages chi tiết

### 6.1. Checkout Stage

```groovy
stage('Checkout') {
    steps {
        checkout scm
        sh '''
            git log -1 --pretty=format:"%h - %an, %ar : %s"
            git show --stat
        '''
    }
}
```

**Giải thích:**

**`checkout scm`**: Checkout source code từ SCM (Git)
- **`scm`**: Predefined variable - SCM configuration từ Jenkins job
- Tự động checkout code từ repository đã cấu hình

**`sh '''...'''`**: Execute shell commands
- **Triple quotes**: Multi-line string trong Groovy
- Hiển thị thông tin git để debug

### 6.2. Build Stage

```groovy
stage('Build') {
    steps {
        sh """
            mvn ${MAVEN_CLI_OPTS} clean package \
                -DskipTests=${params.SKIP_TESTS}
        """
    }
    post {
        success { echo "✅ Build thành công!" }
        failure { echo "❌ Build thất bại!" }
    }
}
```

**Giải thích:**

**`sh """..."""`**: Execute shell với string interpolation
- **Double quotes**: Cho phép `${variable}` interpolation
- **Backslash `\`**: Line continuation

**`post {}`**: Actions sau khi stage hoàn thành
- **`success`**: Chạy khi stage thành công
- **`failure`**: Chạy khi stage fail
- **`always`**: Luôn chạy (dù success hay failure)
- **`unstable`**: Chạy khi unstable

### 6.3. Test Stage với When Condition

```groovy
stage('Unit Tests') {
    when {
        not { params.SKIP_TESTS }
    }
    steps {
        sh "mvn ${MAVEN_CLI_OPTS} test"
    }
    post {
        always {
            junit 'target/surefire-reports/TEST-*.xml'
        }
    }
}
```

**Giải thích:**

**`when {}`**: Điều kiện để chạy stage
- **`not { params.SKIP_TESTS }`**: Chỉ chạy nếu `SKIP_TESTS` = false
- **Các điều kiện khác**:
  ```groovy
  when {
      branch 'main'                    // Chỉ trên main branch
      anyOf {                          // Một trong các điều kiện
          branch 'main'
          branch 'develop'
      }
      allOf {                          // Tất cả điều kiện
          branch 'main'
          expression { params.DEPLOY_ENV == 'production' }
      }
      expression { ... }               // Custom expression
      changeset "src/**/*"             // Khi có thay đổi trong files
  }
  ```

**`junit`**: Publish JUnit test reports
- GitLab sẽ parse và hiển thị trong Tests tab
- **Pattern**: `target/surefire-reports/TEST-*.xml`

### 6.4. Integration Tests với Services

```groovy
stage('Integration Tests') {
    agent {
        docker {
            image 'maven:3.9-eclipse-temurin-21-jammy'
            args '-v /root/.m2:/root/.m2'
        }
    }
    steps {
        sh """
            mvn ${MAVEN_CLI_OPTS} verify \
                -Dspring.profiles.active=test
        """
    }
}
```

**Giải thích:**

**Services trong Jenkins:**
- Jenkins không có built-in services như GitLab CI
- Cần khởi động services manually hoặc dùng Docker Compose

**Cách khác - Docker Compose:**
```groovy
stage('Integration Tests') {
    steps {
        sh 'docker-compose up -d postgres'
        sh 'mvn verify'
        sh 'docker-compose down'
    }
}
```

**Cách khác - Kubernetes Pod:**
```groovy
agent {
    kubernetes {
        yaml '''
            apiVersion: v1
            kind: Pod
            spec:
              containers:
              - name: maven
                image: maven:3.9-eclipse-temurin-21-jammy
              - name: postgres
                image: postgres:15-alpine
                env:
                - name: POSTGRES_DB
                  value: testdb
        '''
    }
}
```

### 6.5. Code Quality với SonarQube

```groovy
stage('Code Quality') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh """
                mvn ${MAVEN_CLI_OPTS} sonar:sonar \
                    -Dsonar.projectKey=${APP_NAME}
            """
        }
    }
    post {
        success {
            timeout(time: 5, unit: 'MINUTES') {
                def qg = waitForQualityGate()
                if (qg.status != 'OK') {
                    error "Quality Gate failed: ${qg.status}"
                }
            }
        }
    }
}
```

**Giải thích:**

**`withSonarQubeEnv('SonarQube')`**: Load SonarQube configuration
- **`'SonarQube'`**: SonarQube server name trong Jenkins config
- Tự động inject `SONAR_HOST_URL` và `SONAR_AUTH_TOKEN`

**`waitForQualityGate()`**: Chờ SonarQube quality gate
- SonarQube analysis là async → cần chờ kết quả
- **`timeout`**: Fail nếu chờ quá 5 phút
- **`qg.status`**: `OK`, `WARN`, `ERROR`

**Cấu hình SonarQube:**
1. Cài SonarQube Scanner plugin
2. Manage Jenkins → Configure System → SonarQube servers
3. Add SonarQube server
4. Add SonarQube token trong Credentials

### 6.6. Security Scanning - Parallel Execution

```groovy
stage('Security Scan') {
    parallel {
        stage('Dependency Scan') {
            steps { ... }
        }
        stage('SAST') {
            steps { ... }
        }
    }
}
```

**Giải thích:**

**`parallel {}`**: Chạy các stages song song
- **Lợi ích**: Giảm thời gian pipeline
- **Lưu ý**: Stages trong `parallel` phải độc lập với nhau

**Workflow:**
```
Security Scan stage
├── Dependency Scan (chạy song song)
└── SAST (chạy song song)
    ↓
Cả 2 hoàn thành → tiếp tục stage tiếp theo
```

### 6.7. Build Docker Image

```groovy
stage('Build Docker Image') {
    steps {
        script {
            def imageTag = params.CUSTOM_IMAGE_TAG ?: env.BUILD_NUMBER
            env.DOCKER_IMAGE_TAG = "${DOCKER_IMAGE_NAME}:${imageTag}"
        }
        withCredentials([usernamePassword(...)]) {
            sh 'docker login ...'
        }
        sh 'docker build ...'
        sh 'docker push ...'
    }
}
```

**Giải thích:**

**`script {}`**: Groovy script block
- Cần khi dùng logic phức tạp (if/else, loops)
- **`?:`**: Elvis operator - dùng giá trị mặc định nếu null/empty

**`withCredentials([])`**: Load credentials trong block
- Credentials chỉ available trong block
- Tự động mask trong logs

**Docker commands:**
- `docker build`: Build image
- `docker push`: Push lên registry
- **Lưu ý**: Cần Docker socket mounted (đã config ở agent)

### 6.8. Deploy với Manual Approval

```groovy
stage('Deploy to Production') {
    when {
        expression { params.DEPLOY_ENV == 'production' }
    }
    steps {
        input message: 'Xác nhận deploy lên Production?', ok: 'Deploy'
        // Deploy steps...
    }
}
```

**Giải thích:**

**`input`**: Manual approval step
- Pipeline dừng lại, chờ user click "Proceed"
- **`message`**: Message hiển thị
- **`ok`**: Text trên button
- **Lưu ý**: Timeout mặc định 1 giờ (có thể config)

**Workflow:**
```
1. Pipeline chạy đến input step
2. Dừng lại, hiển thị message
3. User review và click "Proceed"
4. Pipeline tiếp tục với deploy steps
```

---

## 7. Post Actions

### 7.1. Pipeline-level Post

```groovy
post {
    always {
        script {
            echo "Build Status: ${currentBuild.currentResult}"
            echo "Duration: ${currentBuild.durationString}"
        }
        cleanWs()
    }
    success {
        // Send success notification
    }
    failure {
        // Send failure notification
    }
}
```

**Giải thích:**

**`post {}`**: Actions sau khi pipeline hoàn thành
- **Pipeline-level**: Chạy sau tất cả stages
- **Stage-level**: Chạy sau stage cụ thể

**Các conditions:**
- **`always`**: Luôn chạy
- **`success`**: Chỉ khi thành công
- **`failure`**: Chỉ khi fail
- **`unstable`**: Khi unstable
- **`aborted`**: Khi bị cancel
- **`cleanup`**: Chạy cuối cùng (sau tất cả post actions)

**`currentBuild`**: Predefined object
- **`currentBuild.currentResult`**: `SUCCESS`, `FAILURE`, `UNSTABLE`, `ABORTED`
- **`currentBuild.durationString`**: Duration như "5 min 30 sec"

**`cleanWs()`**: Clean workspace
- Xóa tất cả files trong workspace
- **Lợi ích**: Tiết kiệm disk space

### 7.2. Notification

```groovy
post {
    success {
        script {
            sh """
                curl -X POST ${SLACK_WEBHOOK_URL} \
                    -H 'Content-Type: application/json' \
                    -d '{"text": "✅ Pipeline thành công"}'
            """
        }
    }
}
```

**Giải thích:**
- Gửi notification đến Slack/Teams/Discord
- Có thể customize message với build info

---

## 8. Credentials Management

### 8.1. Types of Credentials

**1. Secret Text:**
```groovy
environment {
    SONAR_TOKEN = credentials('sonar-token')
}
```

**2. Username/Password:**
```groovy
withCredentials([usernamePassword(
    credentialsId: 'docker-registry-credentials',
    usernameVariable: 'DOCKER_USER',
    passwordVariable: 'DOCKER_PASS'
)]) {
    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" ...'
}
```

**3. SSH Private Key:**
```groovy
withCredentials([sshUserPrivateKey(
    credentialsId: 'ssh-key',
    keyFileVariable: 'SSH_KEY_FILE'
)]) {
    sh 'ssh -i $SSH_KEY_FILE user@server'
}
```

**4. Kubernetes Config:**
```groovy
withKubeConfig([credentialsId: 'k8s-credentials', serverUrl: '']) {
    sh 'kubectl get pods'
}
```

### 8.2. Best Practices

**1. Scope credentials:**
- Global: Dùng cho nhiều projects
- Folder: Dùng cho projects trong folder
- Project: Chỉ dùng cho project cụ thể

**2. Rotate credentials:**
- Đổi passwords/tokens định kỳ
- Update credentials trong Jenkins

**3. Never hardcode:**
```groovy
// ❌ BAD
sh 'docker login -u admin -p secret123'

// ✅ GOOD
withCredentials([usernamePassword(...)]) {
    sh 'docker login ...'
}
```

---

## 9. Parallel Execution

### 9.1. Parallel Stages

```groovy
stage('Security Scan') {
    parallel {
        stage('Dependency Scan') {
            steps { ... }
        }
        stage('SAST') {
            steps { ... }
        }
    }
}
```

**Giải thích:**
- Chạy song song để giảm thời gian
- Pipeline chỉ tiếp tục khi tất cả parallel stages hoàn thành

### 9.2. Matrix Strategy (Jenkins 2.277+)

```groovy
matrix {
    axes {
        axis {
            name 'JAVA_VERSION'
            values '17', '21'
        }
        axis {
            name 'MAVEN_VERSION'
            values '3.8', '3.9'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh "mvn -version"
            }
        }
    }
}
```

**Giải thích:**
- Chạy build với tất cả combinations
- **Ví dụ**: 2 Java versions × 2 Maven versions = 4 builds
- Hữu ích cho compatibility testing

---

## 10. Best Practices

### 10.1. Pipeline Organization

**1. Sử dụng Declarative Pipeline:**
```groovy
// ✅ GOOD - Declarative
pipeline {
    agent any
    stages { ... }
}

// ❌ BAD - Scripted (trừ khi cần thiết)
node {
    stage('Build') { ... }
}
```

**2. Tách logic phức tạp vào Shared Libraries:**
```groovy
@Library('shared-lib@main') _

pipeline {
    stages {
        stage('Build') {
            steps {
                buildJava()
            }
        }
    }
}
```

**3. Sử dụng `when` để skip stages không cần thiết:**
```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    steps { ... }
}
```

### 10.2. Performance Optimization

**1. Cache dependencies:**
```groovy
agent {
    docker {
        image 'maven:3.9-eclipse-temurin-21-jammy'
        args '-v /root/.m2:/root/.m2'  // Cache Maven repo
    }
}
```

**2. Parallel execution:**
```groovy
parallel {
    stage('Test') { ... }
    stage('Lint') { ... }
}
```

**3. Early exit:**
```groovy
stage('Validate') {
    steps {
        sh 'mvn validate || exit 1'
    }
}
```

### 10.3. Security

**1. Never hardcode secrets:**
```groovy
// ❌ BAD
def password = 'secret123'

// ✅ GOOD
withCredentials([string(credentialsId: 'password', variable: 'PASS')]) {
    sh "echo $PASS"
}
```

**2. Limit who can trigger production deploy:**
```groovy
stage('Deploy Production') {
    steps {
        input message: 'Confirm?', ok: 'Deploy'
        // Only authorized users can proceed
    }
}
```

**3. Scan dependencies và containers:**
```groovy
stage('Security') {
    parallel {
        stage('Dependency Scan') { ... }
        stage('Container Scan') { ... }
    }
}
```

### 10.4. Error Handling

**1. Retry logic:**
```groovy
retry(3) {
    sh 'curl https://api.example.com'
}
```

**2. Timeout:**
```groovy
timeout(time: 5, unit: 'MINUTES') {
    sh 'long-running-command'
}
```

**3. Try-catch:**
```groovy
script {
    try {
        sh 'risky-command'
    } catch (Exception e) {
        echo "Error: ${e.message}"
        currentBuild.result = 'UNSTABLE'
    }
}
```

### 10.5. Notifications

**1. Notify on failure:**
```groovy
post {
    failure {
        emailext(
            subject: "Pipeline Failed: ${env.JOB_NAME}",
            body: "Build ${env.BUILD_NUMBER} failed",
            to: "team@example.com"
        )
    }
}
```

**2. Slack notification:**
```groovy
post {
    success {
        slackSend(
            channel: '#deployments',
            color: 'good',
            message: "✅ Pipeline ${env.BUILD_NUMBER} succeeded"
        )
    }
}
```

---

## 📚 Tài liệu tham khảo

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkinsfile Best Practices](https://www.jenkins.io/doc/book/pipeline/jenkinsfile/)
- [Declarative Pipeline](https://www.jenkins.io/doc/book/pipeline/syntax/#declarative-pipeline)
- [Pipeline Steps Reference](https://www.jenkins.io/doc/pipeline/steps/)

---

## ❓ FAQ

**Q: Làm sao để chạy stage chỉ trên một branch cụ thể?**
```groovy
stage('Deploy') {
    when {
        branch 'main'
    }
    steps { ... }
}
```

**Q: Làm sao để cache dependencies giữa các builds?**
```groovy
agent {
    docker {
        image 'maven:3.9-eclipse-temurin-21-jammy'
        args '-v /root/.m2:/root/.m2'  // Persistent volume
    }
}
```

**Q: Làm sao để skip một stage?**
```groovy
stage('Optional Stage') {
    when {
        expression { params.RUN_OPTIONAL == 'true' }
    }
    steps { ... }
}
```

**Q: Làm sao để chạy pipeline định kỳ (schedule)?**
- Vào Jenkins UI → Job → Configure → Build Triggers
- Check "Build periodically"
- Enter cron expression: `H 2 * * *` (chạy lúc 2h sáng mỗi ngày)

**Q: Làm sao để trigger pipeline từ Git webhook?**
- Cài đặt "GitHub Plugin" hoặc "GitLab Plugin"
- Configure webhook trong Git repository
- Point đến Jenkins URL: `http://jenkins.example.com/github-webhook/`

---

**Kết luận:** File `Jenkinsfile` này cung cấp một pipeline CI/CD production-ready cho Spring Boot application với các best practices. Tùy chỉnh theo nhu cầu cụ thể của project và infrastructure.
