# Microservices với Node.js

## Mục lục
1. [Monolith vs Microservices](#monolith-vs-microservices)
2. [Communication Patterns](#communication-patterns)
3. [REST + HTTP](#rest--http)
4. [Message Queue (Kafka / RabbitMQ)](#message-queue)
5. [gRPC](#grpc)
6. [API Gateway](#api-gateway)
7. [Service Discovery](#service-discovery)
8. [Docker & Docker Compose](#docker)
9. [Patterns quan trọng](#patterns)
10. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## Monolith vs Microservices

| | Monolith | Microservices |
|---|----------|---------------|
| Deploy | 1 unit | Từng service riêng |
| Scale | Toàn bộ app | Chỉ service cần |
| Tech stack | 1 | Đa dạng (polyglot) |
| Database | 1 DB | DB per service |
| Complexity | Code lớn | Distributed system |
| Team | 1 team lớn | Nhiều team nhỏ |

### Khi nào dùng Microservices?

- App đủ lớn, team đủ đông.
- Cần scale từng phần riêng.
- Cần deploy độc lập, CI/CD riêng.
- **Không** dùng cho MVP, team nhỏ, startup giai đoạn đầu.

---

## Communication Patterns

```
┌─────────┐                      ┌─────────┐
│ Service │  ── Synchronous ──▶  │ Service │
│    A    │     (REST/gRPC)      │    B    │
└─────────┘                      └─────────┘

┌─────────┐     ┌──────────┐     ┌─────────┐
│ Service │ ──▶ │  Message │ ──▶ │ Service │
│    A    │     │  Queue   │     │    B    │
└─────────┘     └──────────┘     └─────────┘
                Asynchronous (Kafka/RabbitMQ)
```

| | Synchronous | Asynchronous |
|---|------------|--------------|
| Latency | Thấp | Cao hơn |
| Coupling | Cao (cần service online) | Thấp |
| Use case | Query, real-time | Events, background tasks |

---

## REST + HTTP

```javascript
// Service A gọi Service B qua HTTP
const axios = require('axios');

async function getUserOrders(userId) {
  // Gọi Order Service
  const { data } = await axios.get(`http://order-service:3001/api/orders?userId=${userId}`, {
    timeout: 5000,
  });
  return data;
}
```

---

## Message Queue

### RabbitMQ (amqplib)

```javascript
const amqp = require('amqplib');

// Producer
async function publishOrder(order) {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  await channel.assertQueue('orders');
  channel.sendToQueue('orders', Buffer.from(JSON.stringify(order)));
}

// Consumer
async function consumeOrders() {
  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();
  await channel.assertQueue('orders');
  channel.consume('orders', (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log('Processing order:', order);
    channel.ack(msg);
  });
}
```

### Kafka (kafkajs)

```javascript
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ brokers: ['localhost:9092'] });

// Producer
const producer = kafka.producer();
await producer.connect();
await producer.send({
  topic: 'order-events',
  messages: [{ key: 'order-1', value: JSON.stringify({ id: 1, total: 100 }) }],
});

// Consumer
const consumer = kafka.consumer({ groupId: 'order-processor' });
await consumer.connect();
await consumer.subscribe({ topic: 'order-events', fromBeginning: true });
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const order = JSON.parse(message.value.toString());
    console.log('Received:', order);
  },
});
```

---

## gRPC

Giao tiếp nhanh hơn REST (binary protocol, HTTP/2, schema-based).

```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

```protobuf
// user.proto
syntax = "proto3";
service UserService {
  rpc GetUser (GetUserRequest) returns (User);
}
message GetUserRequest { int32 id = 1; }
message User { int32 id = 1; string name = 2; string email = 3; }
```

```javascript
// gRPC Server
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const def = protoLoader.loadSync('user.proto');
const proto = grpc.loadPackageDefinition(def);

const server = new grpc.Server();
server.addService(proto.UserService.service, {
  getUser: (call, callback) => {
    callback(null, { id: call.request.id, name: 'An', email: 'an@x.com' });
  },
});
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => server.start());

// gRPC Client
const client = new proto.UserService('localhost:50051', grpc.credentials.createInsecure());
client.getUser({ id: 1 }, (err, user) => console.log(user));
```

---

## API Gateway

```
Client → API Gateway → Service A
                     → Service B
                     → Service C
```

Vai trò: routing, auth, rate limiting, load balancing, response aggregation.

Công cụ: **Kong**, **Express Gateway**, **nginx**, hoặc tự viết bằng Express + http-proxy-middleware.

```javascript
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/api/users', createProxyMiddleware({ target: 'http://user-service:3001' }));
app.use('/api/orders', createProxyMiddleware({ target: 'http://order-service:3002' }));
app.use('/api/products', createProxyMiddleware({ target: 'http://product-service:3003' }));
```

---

## Service Discovery

Các service tìm nhau qua **registry** thay vì hardcode URL.

- **DNS-based**: Docker Compose, Kubernetes (service name → IP).
- **Registry**: Consul, etcd.
- **Kubernetes**: Service + DNS tự động.

---

## Docker

### Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### Docker Compose (multi-service)

```yaml
version: '3.8'
services:
  user-service:
    build: ./user-service
    ports: ["3001:3000"]
    environment:
      - MONGO_URI=mongodb://mongo:27017/users
    depends_on: [mongo]

  order-service:
    build: ./order-service
    ports: ["3002:3000"]
    environment:
      - MONGO_URI=mongodb://mongo:27017/orders
    depends_on: [mongo, rabbitmq]

  mongo:
    image: mongo:7
    ports: ["27017:27017"]

  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
```

---

## Patterns

### Circuit Breaker

```javascript
// Tránh gọi service đang down → fail fast
const CircuitBreaker = require('opossum');

const breaker = new CircuitBreaker(callExternalService, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

breaker.fallback(() => ({ error: 'Service unavailable' }));
breaker.on('open', () => console.log('Circuit OPEN'));

const result = await breaker.fire(params);
```

### Saga Pattern

Distributed transactions: mỗi service thực hiện local transaction + publish event → service tiếp theo xử lý. Nếu fail → compensating transactions.

### CQRS (Command Query Responsibility Segregation)

Tách read (query) và write (command) thành hai models/databases khác nhau → tối ưu riêng cho từng loại.

---

## Câu hỏi phỏng vấn

**Q: REST vs gRPC cho inter-service communication?**

> REST: dễ debug, human-readable (JSON), phổ biến. gRPC: nhanh hơn (binary/HTTP2, streaming), schema-based (protobuf), type-safe. Dùng gRPC cho internal, REST cho external/public API.

**Q: Database per service nghĩa là gì?**

> Mỗi microservice có DB riêng → loose coupling. Service khác không truy cập trực tiếp DB → chỉ qua API hoặc events. Thách thức: distributed transactions, data consistency.

**Q: Circuit Breaker pattern giải quyết vấn đề gì?**

> Tránh cascading failure: khi service B down, service A không gọi liên tục (timeout chậm) mà fail fast. Sau thời gian reset, thử lại. Ba trạng thái: Closed → Open → Half-Open.

---

**Tiếp theo**: [14 - Master Node.js](./14-Master-Nodejs.md)
