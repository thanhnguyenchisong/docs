# Microservices

## Mục lục
1. [NestJS Microservices](#nestjs-microservices)
2. [TCP Transport](#tcp)
3. [Redis Transport](#redis)
4. [Kafka Transport](#kafka)
5. [RabbitMQ Transport](#rabbitmq)
6. [gRPC Transport](#grpc)
7. [Hybrid Application](#hybrid)
8. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## NestJS Microservices

NestJS có **transport layer** built-in cho inter-service communication:

```bash
npm install @nestjs/microservices
```

Hai patterns:
- **Request-Response** (MessagePattern): client gửi, đợi response.
- **Event-based** (EventPattern): fire-and-forget.

---

## TCP

### Microservice (server)

```typescript
// main.ts (order-service)
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  { transport: Transport.TCP, options: { host: '0.0.0.0', port: 3001 } },
);
await app.listen();

// orders.controller.ts
@Controller()
export class OrdersController {
  @MessagePattern({ cmd: 'get_orders' })
  getOrders(data: { userId: number }) {
    return this.ordersService.findByUser(data.userId);
  }

  @EventPattern('order_created')
  handleOrderCreated(data: any) {
    console.log('Order created:', data);
  }
}
```

### Client (caller)

```typescript
// users.module.ts
@Module({
  imports: [
    ClientsModule.register([{
      name: 'ORDER_SERVICE',
      transport: Transport.TCP,
      options: { host: 'order-service', port: 3001 },
    }]),
  ],
})
export class UsersModule {}

// users.service.ts
@Injectable()
export class UsersService {
  constructor(@Inject('ORDER_SERVICE') private orderClient: ClientProxy) {}

  async getUserOrders(userId: number) {
    return this.orderClient.send({ cmd: 'get_orders' }, { userId }).toPromise();
  }

  notifyOrderCreated(order: any) {
    this.orderClient.emit('order_created', order); // fire-and-forget
  }
}
```

---

## Redis

```bash
npm install ioredis
```

```typescript
// Server
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.REDIS,
  options: { host: 'localhost', port: 6379 },
});

// Client
ClientsModule.register([{
  name: 'REDIS_SERVICE',
  transport: Transport.REDIS,
  options: { host: 'localhost', port: 6379 },
}])
```

---

## Kafka

```bash
npm install kafkajs
```

```typescript
// Server
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.KAFKA,
  options: {
    client: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'order-consumer' },
  },
});

// Handler
@EventPattern('order-events')
handleOrderEvent(@Payload() data: any, @Ctx() context: KafkaContext) {
  const topic = context.getTopic();
  console.log(`${topic}:`, data);
}

// Client
ClientsModule.register([{
  name: 'KAFKA_SERVICE',
  transport: Transport.KAFKA,
  options: {
    client: { brokers: ['localhost:9092'] },
    consumer: { groupId: 'api-consumer' },
  },
}])
```

---

## RabbitMQ

```bash
npm install amqplib amqp-connection-manager
```

```typescript
// Server
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'orders_queue',
    queueOptions: { durable: true },
  },
});

// Client
ClientsModule.register([{
  name: 'RMQ_SERVICE',
  transport: Transport.RMQ,
  options: {
    urls: ['amqp://localhost:5672'],
    queue: 'orders_queue',
  },
}])
```

---

## gRPC

```bash
npm install @grpc/grpc-js @grpc/proto-loader
```

```protobuf
// proto/users.proto
syntax = "proto3";
package users;
service UsersService {
  rpc FindOne (UserById) returns (User);
}
message UserById { int32 id = 1; }
message User { int32 id = 1; string name = 2; string email = 3; }
```

```typescript
// Server
const app = await NestFactory.createMicroservice(AppModule, {
  transport: Transport.GRPC,
  options: {
    package: 'users',
    protoPath: join(__dirname, 'proto/users.proto'),
    url: '0.0.0.0:50051',
  },
});

// Controller
@Controller()
export class UsersController {
  @GrpcMethod('UsersService', 'FindOne')
  findOne(data: { id: number }) {
    return this.usersService.findOne(data.id);
  }
}
```

---

## Hybrid

Chạy **cả HTTP server và Microservice** trong cùng app:

```typescript
const app = await NestFactory.create(AppModule);

app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.TCP,
  options: { port: 3001 },
});

app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.KAFKA,
  options: { client: { brokers: ['localhost:9092'] } },
});

await app.startAllMicroservices();
await app.listen(3000); // HTTP
```

---

## Câu hỏi phỏng vấn

**Q: NestJS microservices transports có gì?**

> TCP, Redis, Kafka, RabbitMQ (RMQ), gRPC, MQTT, NATS. Mỗi transport có MessagePattern (request-response) và EventPattern (fire-and-forget).

**Q: MessagePattern vs EventPattern?**

> MessagePattern: client gửi message, đợi response (sync-like). EventPattern: fire-and-forget, không đợi response (async events).

**Q: Hybrid app là gì?**

> Chạy cả HTTP (REST/GraphQL) và Microservice (TCP/Kafka/RMQ) trong cùng 1 NestJS application. Dùng `connectMicroservice()` + `startAllMicroservices()`.

---

**Tiếp theo**: [10 - Swagger & OpenAPI](./10-Swagger-OpenAPI.md)
