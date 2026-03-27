# Performance Testing — K6, Gatling, JMeter

## K6 (JavaScript — được ưa chuộng nhất)

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 100 },    // Ramp-up 100 VUs
        { duration: '3m', target: 1000 },   // Peak 1000 VUs
        { duration: '1m', target: 0 },      // Ramp-down
    ],
    thresholds: {
        http_req_duration: ['p(95)<200', 'p(99)<500'],  // SLA
        http_req_failed: ['rate<0.01'],                  // < 1% errors
    },
};

export default function () {
    const res = http.get('http://api.example.com/products');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(1);
}
```

```bash
# Chạy
k6 run load-test.js
k6 run --vus 500 --duration 5m load-test.js
```

## Gatling (Scala/Java — enterprise)

```java
public class OrderSimulation extends Simulation {
    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://api.example.com")
        .header("Content-Type", "application/json");

    ScenarioBuilder scenario = scenario("Create Order")
        .exec(http("POST /orders")
            .post("/api/orders")
            .body(StringBody("{\"userId\":\"user-1\",\"items\":[]}"))
            .check(status().is(201)));

    { setUp(scenario.injectOpen(
        rampUsers(100).during(60),          // 100 users trong 60s
        constantUsersPerSec(50).during(180)  // 50 users/s trong 3 phút
    ).protocols(httpProtocol)); }
}
```

## Types of Performance Tests

| Loại | Mục đích | Duration |
|------|---------|----------|
| **Load test** | Test ở expected load | 5-30 phút |
| **Stress test** | Tìm breaking point | Tăng dần đến crash |
| **Soak test** | Memory leaks, degradation | 4-24 giờ |
| **Spike test** | Đột ngột tăng load | 1-5 phút spike |

## Metrics cần đo

```
- Response time: p50, p95, p99 (NOT average!)
- Throughput: requests/second
- Error rate: % failed requests
- Concurrent users: active connections
- Resource: CPU, memory, DB connections, queue depth
```
