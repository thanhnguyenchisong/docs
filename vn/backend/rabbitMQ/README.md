# Tài liệu Luyện Phỏng vấn RabbitMQ

Chào mừng đến với bộ tài liệu luyện phỏng vấn RabbitMQ! Bộ tài liệu này bao gồm các chủ đề quan trọng nhất thường được hỏi trong các cuộc phỏng vấn về RabbitMQ Message Broker.

## 📚 Mục lục

### Core RabbitMQ

1. **[RabbitMQ Fundamentals](./01-RabbitMQ-Fundamentals.md)**
   - RabbitMQ là gì?
   - AMQP Protocol
   - RabbitMQ Architecture
   - RabbitMQ vs Other Message Brokers

2. **[Exchanges và Routing](./02-Exchanges-Routing.md)**
   - Exchange Types (Direct, Topic, Fanout, Headers)
   - Routing Keys
   - Bindings
   - Message Routing

3. **[Queues](./03-Queues.md)**
   - Queue Declaration
   - Queue Properties
   - Dead Letter Queues
   - Priority Queues

4. **[Producers](./04-Producers.md)**
   - Publishing Messages
   - Message Properties
   - Publisher Confirms
   - Message Persistence

5. **[Consumers](./05-Consumers.md)**
   - Consuming Messages
   - Acknowledgment (ACK/NACK)
   - Consumer Prefetch
   - Consumer Tags

6. **[Spring AMQP](./06-Spring-AMQP.md)**
   - Spring AMQP Configuration
   - RabbitTemplate
   - @RabbitListener
   - Message Converters

7. **[Advanced Topics](./07-Advanced-Topics.md)**
   - Clustering và High Availability
   - Performance Tuning
   - Monitoring
   - Best Practices

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Nắm vững AMQP và architecture
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

### Core RabbitMQ
- ✅ AMQP Protocol và Architecture
- ✅ Exchange Types và Routing
- ✅ Queues và Bindings
- ✅ Message Acknowledgment

### Advanced
- ✅ Dead Letter Queues
- ✅ Publisher Confirms
- ✅ Clustering và HA
- ✅ Performance Tuning

## 💡 Tips cho Phỏng vấn

1. **Hiểu sâu AMQP**: Biết rõ cách RabbitMQ hoạt động
2. **Exchange Types**: Hiểu các loại exchanges và khi nào dùng
3. **Message Flow**: Hiểu flow từ producer → exchange → queue → consumer
4. **Reliability**: Hiểu acknowledgment, persistence, confirms
5. **Thực hành**: Setup RabbitMQ local và thực hành

## 📖 Tài liệu tham khảo

- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [AMQP Specification](https://www.rabbitmq.com/amqp-0-9-1-reference.html)
- [Spring AMQP Documentation](https://spring.io/projects/spring-amqp)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)

## 🚀 Lộ trình học

### Beginner → Intermediate
1. RabbitMQ Fundamentals
2. Exchanges và Routing
3. Queues
4. Producers và Consumers

### Intermediate → Advanced
5. Spring AMQP
6. Advanced Topics
7. Performance Tuning
8. Best Practices

## ✅ Checklist trước Phỏng vấn

- [ ] Nắm vững AMQP Protocol
- [ ] Hiểu Exchange Types và Routing
- [ ] Biết cách configure Queues
- [ ] Hiểu Message Acknowledgment
- [ ] Biết cách sử dụng Spring AMQP
- [ ] Hiểu Dead Letter Queues
- [ ] Biết Publisher Confirms
- [ ] Có thể design message routing

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc pull request.

---

**Chúc bạn thành công trong các cuộc phỏng vấn! 🎉**
