# Spring AMQP - Câu hỏi phỏng vấn RabbitMQ

## Mục lục
1. [Spring AMQP Configuration](#spring-amqp-configuration)
2. [RabbitTemplate](#rabbittemplate)
3. [@RabbitListener](#rabbitlistener)
4. [Message Converters](#message-converters)
5. [Transaction Support](#transaction-support)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Spring AMQP Configuration

### Basic Configuration

```java
// Configuration
@Configuration
@EnableRabbit
public class RabbitMQConfig {
    @Bean
    public ConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setHost("localhost");
        factory.setPort(5672);
        factory.setUsername("guest");
        factory.setPassword("guest");
        return factory;
    }
    
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(new Jackson2JsonMessageConverter());
        return template;
    }
    
    @Bean
    public RabbitListenerContainerFactory<SimpleMessageListenerContainer> rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(new Jackson2JsonMessageConverter());
        return factory;
    }
}
```

### application.properties

```properties
# RabbitMQ Configuration
spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest

# Listener configuration
spring.rabbitmq.listener.simple.prefetch=10
spring.rabbitmq.listener.simple.concurrency=5
spring.rabbitmq.listener.simple.max-concurrency=10
spring.rabbitmq.listener.simple.acknowledge-mode=auto
```

---

## RabbitTemplate

### Basic Usage

```java
// RabbitTemplate: Send messages
@Service
public class OrderService {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    
    public void createOrder(Order order) {
        orderRepository.save(order);
        
        // Send message
        rabbitTemplate.convertAndSend("order-exchange", "order.created", order);
    }
}
```

### Advanced Usage

```java
// With correlation data
CorrelationData correlationData = new CorrelationData(UUID.randomUUID().toString());
rabbitTemplate.convertAndSend("exchange", "routing.key", message, correlationData);

// With message properties
MessagePostProcessor processor = message -> {
    message.getMessageProperties().setPriority(5);
    return message;
};
rabbitTemplate.convertAndSend("exchange", "routing.key", message, processor);
```

---

## @RabbitListener

### Basic Listener

```java
// @RabbitListener
@Component
public class OrderConsumer {
    @RabbitListener(queues = "order-queue")
    public void processOrder(Order order) {
        orderService.process(order);
    }
}
```

### Advanced Listener

```java
// Multiple queues, concurrency
@RabbitListener(
    queues = {"order-queue", "payment-queue"},
    concurrency = "5-10"  // Min 5, max 10 consumers
)
public void processMessage(Message message) {
    // Process
}

// With headers
@RabbitListener(queues = "order-queue")
public void processOrder(
    Order order,
    @Header("priority") Integer priority,
    @Header(AmqpHeaders.DELIVERY_TAG) Long deliveryTag
) {
    // Process with headers
}
```

---

## Message Converters

### JSON Converter

```java
// Jackson2JsonMessageConverter
@Bean
public MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
}

// Usage
// Automatically converts objects to/from JSON
rabbitTemplate.convertAndSend("exchange", "routing.key", order);  // Order → JSON
```

### Custom Converter

```java
// Custom converter
public class CustomMessageConverter implements MessageConverter {
    @Override
    public Message toMessage(Object object, MessageProperties messageProperties) {
        // Convert to message
    }
    
    @Override
    public Object fromMessage(Message message) {
        // Convert from message
    }
}
```

---

## Transaction Support

### Transactional Publishing

```java
// Enable transactions
@Bean
public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
    RabbitTemplate template = new RabbitTemplate(connectionFactory);
    template.setChannelTransacted(true);  // Enable transactions
    return template;
}

// Transactional method
@Transactional
public void createOrder(Order order) {
    orderRepository.save(order);
    rabbitTemplate.convertAndSend("order-exchange", "order.created", order);
    // Both in same transaction
}
```

---

## Câu hỏi thường gặp

### Q1: RabbitTemplate vs @RabbitListener?

```java
// RabbitTemplate:
// - Send messages
// - Synchronous
// - Programmatic

// @RabbitListener:
// - Receive messages
// - Asynchronous
// - Declarative
```

---

## Best Practices

1. **Use RabbitTemplate**: For sending
2. **Use @RabbitListener**: For receiving
3. **JSON converter**: For object serialization
4. **Transactions**: When needed
5. **Error handling**: Retry, DLQ

---

## Tổng kết

- **Spring AMQP**: Spring integration
- **RabbitTemplate**: Send messages
- **@RabbitListener**: Receive messages
- **Message Converters**: JSON, custom
- **Transactions**: Transactional support
- **Best Practices**: Proper configuration, error handling
