## Phần 2: Pipelines (Declarative và Scripted)

### Declarative vs Scripted
- Declarative: opinionated, cú pháp đơn giản hơn, validation, khuyến nghị cho hầu hết trường hợp.
- Scripted: full Groovy; linh hoạt hơn, khó maintain hơn. Chỉ sử dụng khi cần thiết.

### Minimal Declarative Jenkinsfile
```groovy
pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Build') {
      steps { sh 'mvn -B clean package' }
    }
    stage('Test') {
      steps { sh 'mvn -B test' }
    }
    stage('Archive') {
      steps { archiveArtifacts artifacts: 'target/*.jar', fingerprint: true }
    }
  }
}
```

### Agents
- `agent any` sử dụng bất kỳ executor nào.
- Agent per-stage (ví dụ: Docker):
```groovy
stage('Build') {
  agent { docker { image 'maven:3.9-eclipse-temurin-17' } }
  steps { sh 'mvn -B clean package' }
}
```
- Kubernetes agents với Jenkins K8s plugin (khái niệm):
```groovy
podTemplate(containers: [
  containerTemplate(name: 'maven', image: 'maven:3.9-eclipse-temurin-17', ttyEnabled: true, command: 'cat')
]) {
  node(POD_LABEL) {
    stage('Build') { container('maven') { sh 'mvn -B clean package' } }
  }
}
```

### Environment và credentials
```groovy
environment {
  JAVA_HOME = tool 'jdk17'
  REGISTRY = 'thanhncs'
}
pipeline {
  agent any
  stages {
    stage('Login') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
          sh 'echo "$PASS" | docker login -u "$USER" --password-stdin'
        }
      }
    }
  }
}
```

### Post actions
```groovy
post {
  always { junit '**/target/surefire-reports/*.xml' }
  success { echo 'Build passed' }
  failure { echo 'Build failed' }
}
```

### Shared libraries (khi pipelines phát triển)
- Lưu trữ common steps trong shared library repo; load với `@Library('my-shared-lib') _`.
- Định nghĩa vars (ví dụ: `vars/buildJava.groovy`) để encapsulate logic lặp lại.

### Scripted pipeline snippet (chỉ khi cần)
```groovy
node {
  stage('Build') { sh 'mvn -B clean package' }
}
```

Tiếp tục đến Phần 3 cho CI/CD practices, agents, caching, và security.