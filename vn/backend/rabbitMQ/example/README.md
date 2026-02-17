# Example — Project minh họa RabbitMQ

Spring Boot + Spring AMQP: Queue, Producer, Consumer. Chạy được khi đã có RabbitMQ (Docker).

## 1. Chạy RabbitMQ

```bash
docker compose up -d
```

Management UI: http://localhost:15672 (guest/guest)

## 2. Chạy ứng dụng

```bash
mvn spring-boot:run
```

## 3. Test

```bash
curl "http://localhost:8084/api/send?message=Hello+RabbitMQ"
```

Xem log ứng dụng để thấy consumer in "Received: ...". Đọc kèm [../README.md](../README.md) và các file trong backend/rabbitMQ.
