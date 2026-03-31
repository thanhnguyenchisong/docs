# Tài liệu tiếng Việt

Tài liệu được tổ chức theo bốn nhóm: **Web** (CSS, SCSS, Responsive, Reactive, A11y, Performance, Security), **Frontend** (Angular, ReactJS, ReactTS, TypeScript, UI), **Backend** (phát triển ứng dụng, ngôn ngữ, database, auth) và **DevOps** (CI/CD, Docker, hạ tầng, observability).

---

## Cấu trúc tài liệu

```
docs/vn/
├── README.md                      ← Bạn đang ở đây
├── frontend/
│   ├── README.md
│   ├── MASTER-FRONTEND-CHECKLIST.md  ← Checklist phỏng vấn master frontend
│   ├── web/                       ← CSS, SCSS, Responsive, A11y, Performance, Security (10 bài)
│   ├── angular/                   ← Angular từ zero đến master (23 bài)
│   ├── reactjs/                   ← ReactJS từ zero đến master (28 bài)
│   └── reactts/                   ← React + TypeScript (8 bài)
├── backend/
│   ├── README.md
│   ├── MASTER-BACKEND-CHECKLIST.md
│   ├── java/                      ← Java 8–21, OOP, Spring, JVM (11 bài)
│   ├── jpa/                       ← JPA, Hibernate (7 bài)
│   ├── spring-jpa/                ← Spring Data JPA (5 bài)
│   ├── relational-database/       ← SQL, Design, ACID (7 bài)
│   ├── postgresSQL/               ← PostgreSQL chuyên sâu (9 bài)
│   ├── sql/                       ← SQL queries (6 bài)
│   ├── mongodb/                   ← MongoDB (7 bài)
│   ├── redis/                     ← Redis (9 bài)
│   ├── kafka/                     ← Kafka (7 bài)
│   ├── rabbitMQ/                  ← RabbitMQ (10 bài)
│   ├── microservices/             ← Microservices (9 bài)
│   ├── nodejs/                    ← Node.js từ zero đến master (17 bài)
│   ├── nestjs/                    ← NestJS enterprise (11 bài)
│   ├── prisma/                    ← Prisma ORM (7 bài)
│   ├── quarkus/                   ← Quarkus (13 bài)
│   ├── maven/                     ← Maven
│   ├── harbor/                    ← Harbor container registry (5 bài)
│   ├── jfrog/                     ← JFrog Artifactory (5 bài)
│   ├── sso/                       ← SSO, OAuth2, OIDC, JWT (6 bài)
│   ├── high-scale-system/         ← 🔥 Xử lý 5-10 triệu request (10 bài)
│   ├── servicenow/                ← 🔧 ServiceNow IT Professional (15 bài)
│   ├── AI/                        ← 🤖 AI từ zero đến production (15 bài)
│   └── ai-company-agent/          ← 🏢 AI Multi-Agent Company System (9 bài)
└── devops/
    ├── README.md
    ├── MASTER-DEVOPS-CHECKLIST.md
    ├── git/                       ← Git (6 bài)
    ├── gitlab/                    ← GitLab CI/CD
    ├── jenkins/                   ← Jenkins CI/CD
    ├── docker/                    ← Docker & Docker Compose (5 bài)
    ├── k8s/                       ← Kubernetes cho production (6 bài)
    ├── k8s-udemy/                 ← Kubernetes chi tiết (18 bài)
    ├── helm/                      ← Helm (5 bài)
    ├── terraform/                 ← Terraform (5 bài)
    └── bottleneck-resolve/        ← Profiling, JMeter, Prometheus/Grafana (7 bài)
```

---

## Web

Tài liệu **nền tảng web** (không phụ thuộc framework): **CSS**, **SCSS**, **Responsive Web Design**, **Reactive Programming**, **Accessibility**, **Performance**, **Browser/DOM**, **Security**. Có **Checklist Senior Web** (bài 10) để tự kiểm tra.

| # | Nội dung |
|---|----------|
| 01–02 | CSS Fundamentals, Layout (Flexbox & Grid) |
| 03–04 | SCSS/Sass, Responsive Web Design |
| 05–07 | Reactive Programming, Accessibility, Web Performance |
| 08–09 | Browser/DOM/Event Loop, Web Security |
| 10 | **Checklist Senior Web** — câu hỏi phỏng vấn |

→ Xem [web/README.md](frontend/web/README.md) để có mục lục chi tiết và lộ trình đọc.

---

## Frontend

Tài liệu frontend đầy đủ với ba framework/library: **Angular**, **ReactJS** và **React + TypeScript**.

### Angular (23 bài)

| Nội dung | File |
|----------|------|
| TypeScript, Angular căn bản, Components & Templates | [01–03](./frontend/angular/) |
| Directives, Pipes, Services & DI, Routing | [04–06](./frontend/angular/) |
| Forms, HTTP Client, RxJS trong Angular | [07–09](./frontend/angular/) |
| State & kiến trúc, UI & Styling, Testing, Build & Deploy | [10–13](./frontend/angular/) |
| NgRx, Master Angular, AG-Grid | [14–16](./frontend/angular/) |
| @defer, Authentication, PWA, Micro-frontend | [17–20](./frontend/angular/) |
| Signals & Zoneless, SSR, Design Patterns | [21–23](./frontend/angular/) |

### ReactJS (28 bài — từ zero đến master)

| Nội dung | File |
|----------|------|
| Giới thiệu, JSX, Components, Props, State | [01–05](./frontend/reactjs/) |
| Events, Conditional Rendering, Lists & Keys, Forms | [06–09](./frontend/reactjs/) |
| Hooks cơ bản & nâng cao, Lifecycle, Context API | [10–13](./frontend/reactjs/) |
| React Router, API Integration, State Management | [14–16](./frontend/reactjs/) |
| Performance, Testing, Advanced Patterns, TypeScript | [17–20](./frontend/reactjs/) |
| SSR, Server Components, Architecture, DevOps | [21–24](./frontend/reactjs/) |
| React Internals, Best Practices, Dự án thực tế, Interview | [25–28](./frontend/reactjs/) |

### ReactTS — React + TypeScript (8 bài)

| Nội dung | File |
|----------|------|
| ReactTS vs ReactJS, Setup & Conventions | [01–02](./frontend/reactts/) |
| Typing Props & Events, Typing Hooks | [03–04](./frontend/reactts/) |
| Forms & API, Generic Components | [05–06](./frontend/reactts/) |
| Advanced Patterns, Migration & Interview | [07–08](./frontend/reactts/) |

→ Xem [frontend/README.md](./frontend/README.md) để có mục lục chi tiết và lộ trình đọc.
→ Xem [**MASTER-FRONTEND-CHECKLIST.md**](./frontend/MASTER-FRONTEND-CHECKLIST.md) — checklist phỏng vấn master frontend.

---

## Backend

Tài liệu luyện phỏng vấn và tham khảo cho lập trình backend: Java, framework, database, message queue, SSO.

| Folder | Nội dung |
|--------|----------|
| [**backend/java**](./backend/java/) | Java 8–21, OOP, Collections, Concurrency, JVM, Spring, REST API |
| [**backend/jpa**](./backend/jpa/) | JPA, Entity, Queries, Spring Data JPA, Transactions |
| [**backend/spring-jpa**](./backend/spring-jpa/) | Spring Data JPA: Repository, Query methods, custom queries |
| [**backend/relational-database**](./backend/relational-database/) | SQL, thiết kế DB, index, ACID, administration |
| [**backend/postgresSQL**](./backend/postgresSQL/) | PostgreSQL: types, performance, backup, security |
| [**backend/sql**](./backend/sql/) | SQL: SELECT, JOIN, subquery, CTE, aggregation, optimization |
| [**backend/mongodb**](./backend/mongodb/) | MongoDB: document model, queries, aggregation, Spring Data, replica set |
| [**backend/redis**](./backend/redis/) | Redis: data structures, cache patterns, Spring Data Redis, Cluster, Sentinel |
| [**backend/kafka**](./backend/kafka/) | Kafka: topics, producers, consumers, Streams |
| [**backend/rabbitMQ**](./backend/rabbitMQ/) | RabbitMQ: exchanges, queues, Spring AMQP |
| [**backend/microservices**](./backend/microservices/) | Microservices: communication, discovery, gateway, patterns |
| [**backend/quarkus**](./backend/quarkus/) | Quarkus: REST, DI, reactive, native image, Virtual Threads |
| [**backend/maven**](./backend/maven/) | Maven: POM, lifecycle, dependencies, multi-module |
| [**backend/nodejs**](./backend/nodejs/) | **Node.js**: 17 bài từ zero đến master |
| [**backend/nestjs**](./backend/nestjs/) | **NestJS**: 11 bài — enterprise framework |
| [**backend/prisma**](./backend/prisma/) | **Prisma**: 7 bài — ORM hiện đại |
| [**backend/harbor**](./backend/harbor/) | Harbor: container registry, scan CVE, replication, CI/CD |
| [**backend/jfrog**](./backend/jfrog/) | JFrog Artifactory: artifact repository, Maven/npm/Docker |
| [**backend/sso**](./backend/sso/) | SSO: SAML, OAuth2, OIDC, JWT |
| [**backend/high-scale-system**](./backend/high-scale-system/) | 🔥 **Xử lý 5-10 triệu request đồng thời** — kiến trúc, caching, DB sharding, Kafka, rate limiting, case studies (10 bài) |
| [**backend/design-patterns**](./backend/design-patterns/) | 🎨 **Design Patterns**: SOLID, GoF, Clean Architecture, DDD, Anti-patterns (8 bài) |
| [**backend/testing**](./backend/testing/) | 🧪 **Testing**: JUnit 5, Mockito, Testcontainers, Contract Testing, Performance (6 bài) |
| [**backend/software-engineering**](./backend/software-engineering/) | 📐 Code Review, Tech Debt, ADR/RFC, Estimation, Leadership (5 bài) |
| [**backend/graphql**](./backend/graphql/) | GraphQL: Schema, Resolvers, DataLoader, Federation (4 bài) |
| [**backend/elasticsearch**](./backend/elasticsearch/) | Elasticsearch: Full-text search, Query DSL, Spring Data (3 bài) |
| [**backend/grpc**](./backend/grpc/) | gRPC: Protobuf, Streaming, Spring Boot (3 bài) |
| [**backend/aws-cloud**](./backend/aws-cloud/) | ☁️ AWS: EC2, S3, RDS, Lambda, EKS, Architecture Patterns (5 bài) |
| [**backend/servicenow**](./backend/servicenow/) | 🔧 **ServiceNow**: Platform, ITSM, CMDB, Scripting, JavaScript ES5, AngularJS, Flow Designer, ITOM, Integration, Certification (17 bài) |
| [**backend/AI**](./backend/AI/) | 🤖 **AI**: ML Fundamentals, Deep Learning, NLP, Transformer, LLMs, Prompt Engineering, RAG, Agentic AI, Generative AI, Computer Vision, Vector DB, Fine-tuning, MLOps, Safety, Interview (15 bài) |
| [**backend/ai-company-agent**](./backend/ai-company-agent/) | 🏢 **AI Company Agent**: Multi-Agent Theory, Architecture Patterns, Communication, LangGraph, CrewAI, Memory/RAG, Company Blueprint, Deployment (9 bài) |

→ Xem [backend/README.md](./backend/README.md) để có mục lục chi tiết và lộ trình đọc.
→ Xem [**MASTER-BACKEND-CHECKLIST.md**](./backend/MASTER-BACKEND-CHECKLIST.md) — checklist phỏng vấn master backend.

---

## DevOps

Tài liệu CI/CD, Docker, container, Kubernetes, IaC và điều tra hiệu suất.

| Folder | Nội dung |
|--------|----------|
| [**devops/git**](./devops/git/) | Git: fundamentals, branching, remote, workflow, troubleshooting |
| [**devops/gitlab**](./devops/gitlab/) | GitLab CI/CD: pipelines, `.gitlab-ci.yml`, file mẫu |
| [**devops/jenkins**](./devops/jenkins/) | Jenkins: pipelines, Jenkinsfile mẫu, so sánh với GitLab |
| [**devops/docker**](./devops/docker/) | **Docker**: image, Dockerfile, Compose, networking, security (5 bài) |
| [**devops/k8s**](./devops/k8s/) | Kubernetes: deploy app, observability, scaling, profiling trên K8s |
| [**devops/k8s-udemy**](./devops/k8s-udemy/) | Kubernetes chi tiết: manifest, networking, security, Kustomize |
| [**devops/helm**](./devops/helm/) | Helm: chart, values, templating, release |
| [**devops/terraform**](./devops/terraform/) | Terraform: state, modules, testing, security |
| [**devops/bottleneck-resolve**](./devops/bottleneck-resolve/) | **Demo app**: JMeter, Async Profiler, Prometheus/Grafana |

→ Mỗi folder có `README.md` với thứ tự đọc và mô tả ngắn.
→ Xem [**MASTER-DEVOPS-CHECKLIST.md**](./devops/MASTER-DEVOPS-CHECKLIST.md) — checklist phỏng vấn master DevOps.

---

## 📁 Project minh họa (example)

Mỗi phần tài liệu có thư mục **`example/`** chứa project **hoàn chỉnh, chạy được** để test và học:

- **frontend/web/example** — Trang tĩnh HTML/CSS/JS (Flexbox, Grid, Responsive, A11y)
- **frontend/angular/example** — Ứng dụng Angular (TypeScript, Routing, Forms, NgRx)
- **frontend/reactjs/reactjs-demo** — Ứng dụng ReactJS demo
- **backend/…/example** — Theo từng topic: Java, JPA, Spring JPA, Maven, Kafka, RabbitMQ, Redis, Quarkus, PostgreSQL, Microservices, …
- **devops/…/example** — Git repo mẫu, GitLab/Jenkins pipeline, K8s manifest, Helm chart, Terraform, bottleneck-resolve

Vào từng `example/` và đọc **README.md** trong đó để biết cách chạy.

---

## Demo: Cải thiện hiệu suất (bottleneck-resolve)

Ứng dụng Spring Boot dùng để học **kiểm thử tải** và **phân tích điểm nghẽn**:

- **Tạo tải**: JMeter  
- **Phân tích CPU**: Async Profiler (flame graph)  
- **Số liệu**: Micrometer → Prometheus → Grafana  

Endpoint mẫu: `GET /work?n=10000` (thuật toán cố ý chậm). Hướng dẫn từng bước nằm trong [devops/bottleneck-resolve](./devops/bottleneck-resolve/).
