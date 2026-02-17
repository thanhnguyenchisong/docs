# Deployment và DevOps - Câu hỏi phỏng vấn Microservices

## Mục lục
1. [Containerization](#containerization)
2. [Orchestration](#orchestration)
3. [CI/CD Pipelines](#cicd-pipelines)
4. [Deployment Strategies](#deployment-strategies)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Containerization

### Docker

```dockerfile
# Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  user-service:
    image: user-service:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
  order-service:
    image: order-service:latest
    ports:
      - "8081:8080"
```

---

## Orchestration

### Kubernetes

```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 8080
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
    - port: 80
      targetPort: 8080
```

---

## CI/CD Pipelines

### Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        stage('Docker Build') {
            steps {
                sh 'docker build -t user-service:${BUILD_NUMBER} .'
            }
        }
        stage('Deploy') {
            steps {
                sh 'kubectl set image deployment/user-service user-service=user-service:${BUILD_NUMBER}'
            }
        }
    }
}
```

---

## Deployment Strategies

### Blue-Green Deployment

```java
// Blue-Green: Two identical environments
// Switch traffic from blue to green

Blue (v1) → Deploy Green (v2) → Switch traffic → Green (v2)
```

### Canary Deployment

```java
// Canary: Gradual rollout
// 10% → 50% → 100%

v1 (90%) → v2 (10%) → v2 (50%) → v2 (100%)
```

---

## Câu hỏi thường gặp

### Q1: Docker vs Virtual Machines?

```java
// Docker:
// - Lightweight
// - Fast startup
// - Shared OS kernel

// VMs:
// - Heavier
// - Slower startup
// - Isolated OS
```

---

## Best Practices

1. **Containerize**: Use Docker
2. **Orchestrate**: Use Kubernetes
3. **Automate**: CI/CD pipelines
4. **Monitor**: Track deployments
5. **Rollback**: Plan rollback strategy

---

## Tổng kết

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: Jenkins, GitLab CI
- **Deployment**: Blue-Green, Canary
- **Best Practices**: Automate, monitor, rollback
