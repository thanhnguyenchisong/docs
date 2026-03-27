# Tài liệu Luyện Phỏng vấn Quarkus

Chào mừng đến với bộ tài liệu luyện phỏng vấn Quarkus! Bộ tài liệu này bao gồm các chủ đề quan trọng nhất thường được hỏi trong các cuộc phỏng vấn về Quarkus Framework.

## 📚 Mục lục

### Core Quarkus

1. **[Quarkus Fundamentals](./01-Quarkus-Fundamentals.md)**
   - Quarkus là gì?
   - Quarkus vs Spring Boot
   - Supersonic Subatomic Java
   - Build và Runtime

2. **[Getting Started](./02-Getting-Started.md)**
   - Project Setup
   - Project Structure
   - Development Mode
   - Hot Reload

3. **[REST APIs với Quarkus](./03-REST-APIs.md)**
   - RESTEasy Reactive
   - JAX-RS Annotations
   - JSON Serialization
   - Exception Handling
   - @RunOnVirtualThread, @ServerExceptionMapper

4. **[Dependency Injection](./04-Dependency-Injection.md)**
   - CDI (Contexts and Dependency Injection)
   - Bean Scopes
   - Qualifiers
   - Events

5. **[Data Access](./05-Data-Access.md)**
   - Hibernate ORM
   - Panache
   - Reactive SQL Clients
   - Transactions

6. **[Reactive Programming](./06-Reactive-Programming.md)**
   - Mutiny
   - Reactive Streams
   - Reactive REST APIs
   - Non-blocking I/O

7. **[Testing](./07-Testing.md)**
   - Unit Testing
   - Integration Testing
   - Test Resources, Testcontainers
   - Contract Testing, Mocking

8. **[Native Image](./08-Native-Image.md)**
   - GraalVM Native Image
   - Build Native Executable
   - Native Image Limitations
   - Performance

9. **[Advanced Topics](./09-Advanced-Topics.md)**
   - Security (OIDC, JWT)
   - Messaging (Kafka, AMQP)
   - Monitoring (Metrics, Health)
   - Configuration
   - Token propagation, LangChain4j, Jakarta Data

10. **[Build & Containerization](./10-Build-Containerization.md)**
   - Fast-jar structure
   - Layered builds
   - Dockerfile JVM / Native
   - Image size & optimization

11. **[Kubernetes & Cloud Native](./11-Kubernetes-CloudNative.md)**
   - K8s manifests
   - Health probes (Liveness, Readiness, Startup)
   - ConfigMaps & Secrets
   - HPA & resource tuning

### Modern & Master-Level

12. **[Virtual Threads (Project Loom)](./12-Virtual-Threads.md)**
   - Virtual Thread vs Platform Thread vs Reactive
   - @RunOnVirtualThread trong Quarkus
   - Pinning, ThreadLocal, ScopedValue
   - Migration Guide (Blocking → VT, Reactive → VT)
   - Performance Benchmarks

13. **[Performance Tuning & Benchmarking](./13-Performance-Tuning.md)**
   - JVM Tuning (Heap, GC, Metaspace)
   - Connection Pool Sizing (HikariCP/Agroal)
   - Hibernate / JPA Optimization (N+1, Batch, Indexing)
   - Profiling (async-profiler, JFR, Flame Graph)
   - Load Testing (wrk, k6, Gatling)
   - Production Monitoring (Prometheus, Grafana)

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Nắm vững kiến trúc và core concepts
2. **Thực hành code**: Mỗi file có code examples
3. **Ôn tập theo chủ đề**: Tập trung vào các chủ đề bạn còn yếu
4. **Làm bài tập**: Hoàn thành các bài tập ở cuối mỗi file

## 📝 Cấu trúc mỗi file

Mỗi file tài liệu bao gồm:

- **Lý thuyết**: Giải thích chi tiết các khái niệm
- **Ví dụ code**: Code examples minh họa
- **So sánh**: So sánh các approaches khác nhau
- **Best Practices**: Các thực hành tốt nhất
- **Câu hỏi thường gặp**: FAQ với câu trả lời chi tiết
- **Bài tập thực hành**: Exercises để luyện tập

## 🔥 Chủ đề Hot trong Phỏng vấn

### Core Quarkus
- ✅ Quarkus vs Spring Boot
- ✅ Supersonic Subatomic Java
- ✅ Native Image và GraalVM
- ✅ Reactive Programming với Mutiny

### Advanced
- ✅ CDI và Dependency Injection
- ✅ Panache cho Data Access
- ✅ Security và OIDC
- ✅ Performance Optimization

## 💡 Tips cho Phỏng vấn

1. **Hiểu sâu Architecture**: Biết rõ cách Quarkus hoạt động
2. **Native Image**: Hiểu GraalVM và native compilation
3. **Reactive**: Nắm vững Mutiny và reactive programming
4. **Performance**: Biết cách optimize startup time và memory
5. **Thực hành**: Setup Quarkus project và thực hành

## 📖 Tài liệu tham khảo

- [Quarkus Documentation](https://quarkus.io/guides/)
- [Quarkus Guides](https://quarkus.io/guides/)
- [GraalVM Documentation](https://www.graalvm.org/docs/)
- [CDI Specification](https://jakarta.ee/specifications/cdi/)

## 🚀 Lộ trình học

### Beginner → Intermediate
1. Quarkus Fundamentals
2. Getting Started
3. REST APIs
4. Dependency Injection

### Intermediate → Advanced
5. Data Access với Panache
6. Reactive Programming
7. Testing
8. Native Image
9. Build & Containerization

### Advanced → Master
10. Advanced Topics (Security, Messaging, gRPC, GraphQL)
11. Kubernetes & Cloud Native
12. Virtual Threads (Java 21+ / Project Loom)
13. Performance Tuning & Benchmarking

## ✅ Checklist trước Phỏng vấn

### Core
- [ ] Quarkus Architecture (Build-time vs Runtime, ArC, Extensions)
- [ ] RESTEasy Reactive (Smart Dispatching, Filters, Exception Mappers)
- [ ] CDI (Scopes, Client Proxy, Qualifiers, Events, Interceptors, Decorators)
- [ ] Panache (Active Record vs Repository, Projections, Transactions)

### Reactive & Threading
- [ ] Mutiny (Uni/Multi, Error handling, Combining, Threading)
- [ ] Vert.x Event Loop (emitOn vs runSubscriptionOn, Context Propagation)
- [ ] Virtual Threads (Pinning, Migration, VT vs Reactive vs Platform)

### Data & Messaging
- [ ] Hibernate (N+1, Batch, L2 cache, Locking, Multi-tenancy)
- [ ] Kafka/AMQP (SmallRye Reactive Messaging, Dead Letter Queue)
- [ ] Database Migration (Flyway/Liquibase)

### Security
- [ ] OIDC/JWT (Keycloak, SecurityIdentity, Token propagation)
- [ ] Authorization (@RolesAllowed, RBAC, ABAC, Programmatic check)

### Production
- [ ] Native Image (GraalVM, Reflection, PGO, Troubleshooting)
- [ ] Build & Container (Fast-jar, Layered builds, Dockerfile)
- [ ] Kubernetes (Manifests, Probes, ConfigMap/Secret, HPA)
- [ ] Performance Tuning (JVM, GC, Connection Pool, Profiling)
- [ ] Observability (Metrics, Tracing, Health checks)
- [ ] Testing (QuarkusTest, Dev Services, Contract Testing, Security Testing)

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc pull request.

---

**Chúc bạn thành công trong các cuộc phỏng vấn! 🎉**
