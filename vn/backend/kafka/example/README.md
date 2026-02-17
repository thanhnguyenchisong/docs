# Example — Project minh họa Kafka

Spring Boot + Kafka: Producer, Consumer. Chạy được khi đã có Kafka (Docker).

## 1. Chạy Kafka

```bash
docker compose up -d
```

## 2. Chạy ứng dụng

```bash
mvn spring-boot:run
```

## 3. Test

```bash
curl "http://localhost:8083/api/send?message=Hello+Kafka"
```

Xem log ứng dụng để thấy consumer in "Received: Hello Kafka". Đọc kèm [../README.md](../README.md) và các file trong backend/kafka.
