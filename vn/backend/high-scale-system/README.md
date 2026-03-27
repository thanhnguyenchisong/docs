# High-Scale System — Xử Lý 5-10 Triệu Request Đồng Thời

> Kinh nghiệm thực tế và kỹ thuật xử lý hệ thống **5-10 triệu request/giây** (concurrent): từ kiến trúc, caching, database, message queue, đến infrastructure và monitoring.

## 📋 Mục Lục

| # | File | Nội dung |
|---|------|----------|
| 01 | [Kiến Trúc Tổng Quan](./01-Architecture-Overview.md) | Tư duy thiết kế, các tầng xử lý, capacity planning |
| 02 | [Load Balancing & Reverse Proxy](./02-Load-Balancing.md) | Nginx, HAProxy, L4/L7, DNS, CDN, thuật toán |
| 03 | [Caching Strategy](./03-Caching-Strategy.md) | Redis cluster, CDN, application cache, cache patterns |
| 04 | [Database at Scale](./04-Database-at-Scale.md) | Read replicas, sharding, connection pool, query optimization |
| 05 | [Message Queue & Async](./05-Message-Queue-Async.md) | Kafka, backpressure, event-driven, CQRS |
| 06 | [Application Optimization](./06-Application-Optimization.md) | Thread pool, connection pool, non-blocking I/O, JVM tuning |
| 07 | [Infrastructure & Auto-scaling](./07-Infrastructure-Autoscaling.md) | K8s HPA, cloud scaling, capacity planning |
| 08 | [Rate Limiting & Protection](./08-Rate-Limiting-Protection.md) | Rate limit, circuit breaker, bulkhead, DDoS |
| 09 | [Case Studies Thực Tế](./09-Case-Studies.md) | Kinh nghiệm xử lý flash sale, live streaming, payment |
| 10 | [Interview & Checklist](./10-Interview-Checklist.md) | Câu hỏi phỏng vấn system design high-scale |

## 🎯 Đối Tượng

- **Senior → Master** (3-10+ năm kinh nghiệm)
- Đã hiểu cơ bản microservices, K8s, database, message queue
- Muốn thiết kế hệ thống chịu tải **hàng triệu request đồng thời**

## 📊 Quy Mô Tham Chiếu

| Mức | Request/giây | Ví dụ |
|-----|-------------|-------|
| **Nhỏ** | < 1,000 | App nội bộ, startup MVP |
| **Trung bình** | 1,000 - 100,000 | E-commerce, SaaS |
| **Lớn** | 100,000 - 1,000,000 | Banking, social media |
| **Rất lớn** | 1,000,000 - 10,000,000 | Flash sale, live event, ad serving |
| **Cực lớn** | > 10,000,000 | Google, Cloudflare, CDN provider |

## 🗺️ Lộ Trình

1. **Bài 01**: Hiểu kiến trúc tổng quan, capacity planning
2. **Bài 02-03**: Load balancing + Caching — giải quyết 80% traffic
3. **Bài 04-05**: Database + Message Queue — xử lý data layer
4. **Bài 06-07**: App optimization + Infrastructure scaling
5. **Bài 08**: Bảo vệ hệ thống (rate limit, circuit breaker)
6. **Bài 09-10**: Case studies + Interview preparation
