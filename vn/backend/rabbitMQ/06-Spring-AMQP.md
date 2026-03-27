# Spring AMQP - Từ Zero đến Master RabbitMQ

## Mục lục
1. [Spring AMQP Configuration](#spring-amqp-configuration)
2. [RabbitTemplate chuyên sâu](#rabbittemplate-chuyên-sâu)
3. [@RabbitListener nâng cao](#rabbitlistener-nâng-cao)
4. [Message Converters](#message-converters)
5. [Transaction Support](#transaction-support)
6. [Connection Recovery & Retry](#connection-recovery--retry)
7. [Multi-broker Configuration](#multi-broker-configuration)
8. [Testing với Testcontainers](#testing-với-testcontainers)
9. [Spring Cloud Stream (tham khảo)](#spring-cloud-stream)
10. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Spring AMQP Configuration

### application.properties (Production)

```properties
# ===== Connection =====
spring.rabbitmq.host=rabbitmq-cluster
spring.rabbitmq.port=5672
spring.rabbitmq.username=${RABBITMQ_USER}
spring.rabbitmq.password=${RABBITMQ_PASS}
spring.rabbitmq.virtual-host=/production

# Multi-host failover
spring.rabbitmq.addresses=rabbit1:5672,rabbit2:5672,rabbit3:5672

# Connection
spring.rabbitmq.connection-timeout=5000
spring.rabbitmq.requested-heartbeat=60
spring.rabbitmq.requested-channel-max=0

# ===== Channel caching =====
spring.rabbitmq.cache.channel.size=25
spring.rabbitmq.cache.channel.checkout-timeout=1000

# ===== Publisher =====
spring.rabbitmq.publisher-confirm-type=correlated
spring.rabbitmq.publisher-returns=true
spring.rabbitmq.template.mandatory=true
spring.rabbitmq.template.reply-timeout=5000

# ===== Consumer =====
spring.rabbitmq.listener.type=simple
spring.rabbitmq.listener.simple.acknowledge-mode=auto
spring.rabbitmq.listener.simple.prefetch=25
spring.rabbitmq.listener.simple.concurrency=5
spring.rabbitmq.listener.simple.max-concurrency=10
spring.rabbitmq.listener.simple.missing-queues-fatal=false
spring.rabbitmq.listener.simple.default-requeue-rejected=false

# ===== Retry =====
spring.rabbitmq.listener.simple.retry.enabled=true
spring.rabbitmq.listener.simple.retry.initial-interval=1000
spring.rabbitmq.listener.simple.retry.max-attempts=3
spring.rabbitmq.listener.simple.retry.multiplier=2.0
spring.rabbitmq.listener.simple.retry.max-interval=10000

# ===== TLS =====
spring.rabbitmq.ssl.enabled=true
spring.rabbitmq.ssl.trust-store=classpath:truststore.jks
spring.rabbitmq.ssl.trust-store-password=${TRUSTSTORE_PASS}
spring.rabbitmq.ssl.algorithm=TLSv1.3
```

### Java Configuration

```java
@Configuration
@EnableRabbit
public class RabbitMQConfig {

    @Bean
    public CachingConnectionFactory connectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setAddresses("rabbit1:5672,rabbit2:5672,rabbit3:5672");
        factory.setUsername("admin");
        factory.setPassword("secure-password");
        factory.setVirtualHost("/production");
        
        // Channel caching
        factory.setCacheMode(CachingConnectionFactory.CacheMode.CHANNEL);
        factory.setChannelCacheSize(25);
        factory.setChannelCheckoutTimeout(1000);
        
        // Publisher confirms
        factory.setPublisherConfirmType(CachingConnectionFactory.ConfirmType.CORRELATED);
        factory.setPublisherReturns(true);
        
        // Heartbeat
        factory.setRequestedHeartBeat(60);
        factory.setConnectionTimeout(5000);
        
        return factory;
    }

    @Bean
    public RabbitTemplate rabbitTemplate(CachingConnectionFactory factory) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(messageConverter());
        template.setMandatory(true);
        template.setReplyTimeout(5000);
        
        // Confirm callback
        template.setConfirmCallback((correlationData, ack, cause) -> {
            if (!ack) {
                log.error("Message not confirmed: {} cause: {}", 
                    correlationData != null ? correlationData.getId() : "unknown", cause);
                // Retry / alert
            }
        });
        
        // Return callback (message không route được)
        template.setReturnsCallback(returned -> {
            log.warn("Message returned: exchange={}, routingKey={}, replyCode={}, replyText={}",
                returned.getExchange(), returned.getRoutingKey(),
                returned.getReplyCode(), returned.getReplyText());
        });
        
        return template;
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }

    // Consumer container factory
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            CachingConnectionFactory factory) {
        SimpleRabbitListenerContainerFactory containerFactory = 
            new SimpleRabbitListenerContainerFactory();
        containerFactory.setConnectionFactory(factory);
        containerFactory.setMessageConverter(messageConverter());
        containerFactory.setPrefetchCount(25);
        containerFactory.setConcurrentConsumers(5);
        containerFactory.setMaxConcurrentConsumers(10);
        containerFactory.setDefaultRequeueRejected(false);
        
        return containerFactory;
    }
}
```

### Declarables (Tự động khai báo Exchange, Queue, Binding)

```java
@Configuration
public class QueueDeclarationConfig {

    // ===== Exchanges =====
    @Bean
    public TopicExchange eventExchange() {
        return ExchangeBuilder.topicExchange("events")
            .durable(true)
            .withArgument("alternate-exchange", "unrouted")
            .build();
    }

    @Bean
    public DirectExchange dlx() {
        return ExchangeBuilder.directExchange("dlx").durable(true).build();
    }

    // ===== Queues =====
    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable("order-events")
            .quorum()
            .deliveryLimit(5)
            .deadLetterExchange("dlx")
            .deadLetterRoutingKey("order.dead")
            .ttl(86_400_000)  // 24h TTL
            .build();
    }

    @Bean
    public Queue orderDlq() {
        return QueueBuilder.durable("order-dlq").build();
    }

    // ===== Bindings =====
    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue())
            .to(eventExchange())
            .with("order.*");
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(orderDlq())
            .to(dlx())
            .with("order.dead");
    }

    // ===== Declarables (bulk declaration) =====
    @Bean
    public Declarables additionalQueues() {
        Queue q1 = QueueBuilder.durable("payment-events").quorum().build();
        Queue q2 = QueueBuilder.durable("notification-events").quorum().build();
        return new Declarables(
            q1, q2,
            BindingBuilder.bind(q1).to(eventExchange()).with("payment.*"),
            BindingBuilder.bind(q2).to(eventExchange()).with("notification.*")
        );
    }
}
```

---

## RabbitTemplate chuyên sâu

### Publish Patterns

```java
@Service
public class EventPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // Basic publish
    public void publishSimple(OrderEvent event) {
        rabbitTemplate.convertAndSend("events", "order.created", event);
    }

    // Publish với message properties
    public void publishWithProps(OrderEvent event) {
        rabbitTemplate.convertAndSend("events", "order.created", event, msg -> {
            msg.getMessageProperties().setMessageId(UUID.randomUUID().toString());
            msg.getMessageProperties().setTimestamp(new Date());
            msg.getMessageProperties().setContentType("application/json");
            msg.getMessageProperties().setDeliveryMode(MessageDeliveryMode.PERSISTENT);
            msg.getMessageProperties().setHeader("source", "order-service");
            msg.getMessageProperties().setHeader("version", "2.0");
            return msg;
        });
    }

    // Publish với Correlation Data (Publisher Confirms)
    public CompletableFuture<Boolean> publishWithConfirm(OrderEvent event) {
        CorrelationData correlationData = new CorrelationData(
            UUID.randomUUID().toString());
        
        rabbitTemplate.convertAndSend("events", "order.created", event,
            msg -> {
                msg.getMessageProperties().setMessageId(correlationData.getId());
                return msg;
            },
            correlationData);
        
        // Chờ confirm (async)
        return correlationData.getFuture()
            .thenApply(confirm -> {
                if (confirm.isAck()) {
                    log.info("Message confirmed: {}", correlationData.getId());
                    return true;
                } else {
                    log.error("Message NOT confirmed: {} reason: {}", 
                        correlationData.getId(), confirm.getReason());
                    return false;
                }
            });
    }

    // RPC: Send and receive
    public PricingResponse getPrice(PricingRequest request) {
        PricingResponse response = (PricingResponse) rabbitTemplate
            .convertSendAndReceive("pricing-exchange", "pricing.request", request);
        
        if (response == null) {
            throw new ServiceUnavailableException("Pricing service timeout");
        }
        return response;
    }
}
```

### RabbitTemplate vs StreamRabbitTemplate

```java
// RabbitTemplate → AMQP queues (Classic, Quorum)
// StreamRabbitTemplate → RabbitMQ Streams

@Bean
public StreamRabbitTemplate streamTemplate(Environment env) {
    StreamRabbitTemplate template = new StreamRabbitTemplate(env);
    template.setMessageConverter(new Jackson2JsonMessageConverter());
    return template;
}

// Publish to stream
streamTemplate.convertAndSend("events-stream", event);
```

---

## @RabbitListener nâng cao

### Conditional Listeners

```java
// Listener chỉ active khi property = true
@RabbitListener(queues = "order-queue", 
                autoStartup = "${app.consumer.order.enabled:true}")
public void processOrder(Order order) { ... }

// Listener ID cho management
@RabbitListener(id = "orderProcessor", queues = "order-queue")
public void processOrder(Order order) { ... }
```

### Reply (RPC Server)

```java
// @RabbitListener return value = reply message
@RabbitListener(queues = "pricing-requests")
public PricingResponse handlePricingRequest(PricingRequest request) {
    // Return value tự động gửi về reply-to queue
    BigDecimal price = pricingEngine.calculate(request);
    return new PricingResponse(request.productId(), price);
}

// Với @SendTo (explicit reply destination)
@RabbitListener(queues = "validation-requests")
@SendTo("validation-responses")
public ValidationResult validate(ValidationRequest request) {
    return validationService.validate(request);
}
```

### Batch Listener

```java
@Bean
public SimpleRabbitListenerContainerFactory batchFactory(
        CachingConnectionFactory cf) {
    SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
    factory.setConnectionFactory(cf);
    factory.setMessageConverter(new Jackson2JsonMessageConverter());
    factory.setBatchListener(true);             // Enable batch
    factory.setBatchSize(50);                   // 50 messages per batch
    factory.setConsumerBatchEnabled(true);
    factory.setReceiveTimeout(5000L);           // Chờ tối đa 5s để fill batch
    return factory;
}

@RabbitListener(queues = "bulk-events", containerFactory = "batchFactory")
public void processBatch(List<BulkEvent> events) {
    // Nhận 50 events cùng lúc → batch insert DB
    eventRepository.saveAll(events);
    log.info("Batch processed: {} events", events.size());
}
```

---

## Message Converters

### Built-in Converters

| Converter | Sử dụng |
| :--- | :--- |
| `SimpleMessageConverter` | String, byte[], Serializable (mặc định) |
| `Jackson2JsonMessageConverter` | ✅ **Khuyến nghị** — JSON via Jackson |
| `MarshallingMessageConverter` | XML (JAXB, XStream) |
| `ContentTypeDelegatingMessageConverter` | Delegate theo Content-Type |

### Type-safe JSON Converter

```java
// Vấn đề: Jackson2JsonMessageConverter cần __TypeId__ header
// để deserialize đúng type → Tight coupling giữa producer/consumer

// Fix: Custom ClassMapper
@Bean
public Jackson2JsonMessageConverter messageConverter() {
    Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
    
    // Map specific type IDs
    DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
    typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.TYPE_ID);
    
    Map<String, Class<?>> idClassMapping = new HashMap<>();
    idClassMapping.put("order", OrderEvent.class);
    idClassMapping.put("payment", PaymentEvent.class);
    idClassMapping.put("notification", NotificationEvent.class);
    typeMapper.setIdClassMapping(idClassMapping);
    
    converter.setJavaTypeMapper(typeMapper);
    return converter;
}

// Khi publish: header __TypeId__ = "order" (thay vì full class name)
// Khi consume: __TypeId__ "order" → OrderEvent.class
// → Producer và Consumer có thể khác package name
```

---

## Transaction Support

### Channel Transactions

```java
// Channel transaction: Atomic publish (tất cả hoặc không)
@Bean
public RabbitTemplate transactionalTemplate(CachingConnectionFactory factory) {
    RabbitTemplate template = new RabbitTemplate(factory);
    template.setChannelTransacted(true);  // Enable channel transactions
    return template;
}

@Transactional  // Spring @Transactional kết hợp RabbitMQ channel transaction
public void createOrder(OrderDTO dto) {
    // 1. Save to DB (managed by Spring TX)
    Order order = orderRepo.save(dto.toEntity());
    
    // 2. Publish to RabbitMQ (managed by channel TX)
    rabbitTemplate.convertAndSend("events", "order.created", 
        new OrderCreatedEvent(order));
    
    // Nếu DB commit FAIL → RabbitMQ rollback (message không gửi)
    // Nếu RabbitMQ fail → DB rollback
}
// ⚠️ CHÚ Ý: Channel transactions CHẬM (synchronous commit)
// → Cho cases cần strong consistency
// → Dùng Publisher Confirms cho performance tốt hơn
```

### Transactions vs Publisher Confirms

| | Channel Transactions | Publisher Confirms |
| :--- | :--- | :--- |
| **Performance** | Chậm (sync commit mỗi message) | Nhanh (async) |
| **Atomicity** | ✅ Batch atomic | ❌ Individual confirms |
| **DB integration** | ✅ Spring @Transactional | ❌ Không tích hợp |
| **Use case** | Critical writes, DB+MQ sync | General messaging, high throughput |

---

## Connection Recovery & Retry

### Automatic Recovery

```java
// Spring AMQP tự động recovery khi connection drop:
// 1. Reconnect to broker (hoặc next broker trong addresses list)
// 2. Re-declare exchanges, queues, bindings
// 3. Re-register consumers
// 4. Retry unconfirmed publishes

// Customize recovery
@Bean
public CachingConnectionFactory connectionFactory() {
    CachingConnectionFactory factory = new CachingConnectionFactory();
    // ...
    
    // Recovery interval
    factory.setRecoveryInterval(5000);  // Retry kết nối mỗi 5 giây
    
    // Connection listener
    factory.addConnectionListener(new ConnectionListener() {
        @Override
        public void onCreate(Connection connection) {
            log.info("RabbitMQ connection created: {}", connection);
        }
        @Override
        public void onClose(Connection connection) {
            log.warn("RabbitMQ connection closed: {}", connection);
        }
        @Override
        public void onFailed(Exception exception) {
            log.error("RabbitMQ connection failed", exception);
        }
    });
    
    return factory;
}
```

---

## Multi-broker Configuration

### Kết nối tới nhiều RabbitMQ clusters

```java
@Configuration
public class MultiBrokerConfig {

    // ===== Broker 1: Orders =====
    @Bean
    @Primary
    public CachingConnectionFactory orderConnectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setAddresses("order-rabbit1:5672,order-rabbit2:5672");
        factory.setVirtualHost("/orders");
        return factory;
    }

    @Bean
    @Primary
    public RabbitTemplate orderRabbitTemplate() {
        return new RabbitTemplate(orderConnectionFactory());
    }

    @Bean
    @Primary
    public SimpleRabbitListenerContainerFactory orderListenerFactory() {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(orderConnectionFactory());
        return factory;
    }

    // ===== Broker 2: Analytics =====
    @Bean
    public CachingConnectionFactory analyticsConnectionFactory() {
        CachingConnectionFactory factory = new CachingConnectionFactory();
        factory.setAddresses("analytics-rabbit1:5672,analytics-rabbit2:5672");
        factory.setVirtualHost("/analytics");
        return factory;
    }

    @Bean
    public RabbitTemplate analyticsRabbitTemplate(
            @Qualifier("analyticsConnectionFactory") CachingConnectionFactory factory) {
        return new RabbitTemplate(factory);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory analyticsListenerFactory(
            @Qualifier("analyticsConnectionFactory") CachingConnectionFactory factory) {
        SimpleRabbitListenerContainerFactory containerFactory = 
            new SimpleRabbitListenerContainerFactory();
        containerFactory.setConnectionFactory(factory);
        return containerFactory;
    }
}

// Sử dụng
@RabbitListener(queues = "orders", containerFactory = "orderListenerFactory")
public void processOrder(Order order) { ... }

@RabbitListener(queues = "analytics", containerFactory = "analyticsListenerFactory")
public void processAnalytics(AnalyticsEvent event) { ... }
```

---

## Testing với Testcontainers

### Integration Test

```java
@SpringBootTest
@Testcontainers
class OrderMessageIntegrationTest {

    @Container
    static RabbitMQContainer rabbitMQ = new RabbitMQContainer("rabbitmq:3.13-management")
        .withExposedPorts(5672, 15672);

    @DynamicPropertySource
    static void rabbitMQProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbitMQ::getHost);
        registry.add("spring.rabbitmq.port", rabbitMQ::getAmqpPort);
        registry.add("spring.rabbitmq.username", () -> "guest");
        registry.add("spring.rabbitmq.password", () -> "guest");
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void shouldProcessOrderMessage() throws Exception {
        // Given
        OrderEvent event = new OrderEvent("order-123", "CREATED", BigDecimal.TEN);

        // When: Publish message
        rabbitTemplate.convertAndSend("events", "order.created", event);

        // Then: Wait and verify
        await().atMost(Duration.ofSeconds(10))
            .untilAsserted(() -> {
                Order order = orderRepository.findById("order-123");
                assertThat(order).isNotNull();
                assertThat(order.getStatus()).isEqualTo("PROCESSED");
            });
    }

    @Test
    void shouldSendToDeadLetterOnFailure() throws Exception {
        // Given: Invalid event
        InvalidEvent event = new InvalidEvent(null, null);

        // When: Publish
        rabbitTemplate.convertAndSend("events", "order.created", event);

        // Then: Message should end up in DLQ
        await().atMost(Duration.ofSeconds(10))
            .untilAsserted(() -> {
                Message dlqMessage = rabbitTemplate.receive("order-dlq", 1000);
                assertThat(dlqMessage).isNotNull();
            });
    }
}
```

### Unit Test (Mock RabbitTemplate)

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void shouldPublishEventWhenOrderCreated() {
        // Given
        OrderDTO dto = new OrderDTO("product-1", BigDecimal.TEN);

        // When
        orderService.createOrder(dto);

        // Then
        verify(rabbitTemplate).convertAndSend(
            eq("events"),
            eq("order.created"),
            any(OrderCreatedEvent.class)
        );
        verify(orderRepository).save(any(Order.class));
    }
}
```

---

## Spring Cloud Stream

### Abstraction layer (tham khảo)

```java
// Spring Cloud Stream: Abstraction trên RabbitMQ/Kafka
// Ưu điểm: Switch giữa RabbitMQ ↔ Kafka không sửa code
// Nhược điểm: Mất control chi tiết, abstraction overhead

// Producer
@Bean
public Supplier<OrderEvent> orderSupplier() {
    return () -> new OrderEvent("order-123", "CREATED");
    // Tự động gửi tới binding destination
}

// Consumer
@Bean
public Consumer<OrderEvent> orderConsumer() {
    return event -> orderService.process(event);
    // Tự động subscribe từ binding
}

// application.properties
spring.cloud.stream.bindings.orderSupplier-out-0.destination=order-events
spring.cloud.stream.bindings.orderConsumer-in-0.destination=order-events
spring.cloud.stream.bindings.orderConsumer-in-0.group=order-processor

// Khi nào dùng Spring Cloud Stream:
// ✅ Cần switch giữa RabbitMQ ↔ Kafka
// ✅ Team làm việc abstract, không cần RabbitMQ-specific features
// ❌ Cần control chi tiết (ACK, prefetch, exchange types)
// ❌ Cần RabbitMQ-specific features (Quorum Queue, Streams, DLX config)
```

---

## Câu hỏi thường gặp

### Q1: RabbitTemplate thread-safe không?

**Có**, RabbitTemplate thread-safe. Nó cache channels nội bộ. Dùng 1 instance shared giữa nhiều threads.

### Q2: Jackson2JsonMessageConverter vs SimpleMessageConverter?

**Jackson2JsonMessageConverter** cho production. Serialize objects ↔ JSON. SimpleMessageConverter chỉ hỗ trợ String, byte[], java.io.Serializable (tight coupling, security risk).

### Q3: Channel Transaction vs Publisher Confirms?

**Publisher Confirms** cho hầu hết cases (async, fast). **Channel Transaction** chỉ khi cần DB + RabbitMQ atomic (chậm hơn 5-10x).

### Q4: Testcontainers hay Embedded RabbitMQ?

**Testcontainers** — chạy RabbitMQ thật trong Docker, closer to production. Embedded mock không cover hết behavior (DLQ, quorum queues).

### Q5: Spring AMQP hay Spring Cloud Stream?

**Spring AMQP** khi cần control chi tiết (exchange types, ACK, quorum queues). **Spring Cloud Stream** khi cần portability (RabbitMQ ↔ Kafka) hoặc team thích abstraction.

---

## Tổng kết

- **Config**: Dùng properties + Java config, multi-host failover
- **RabbitTemplate**: Singleton, thread-safe, confirm callback + return callback
- **@RabbitListener**: Declarative consume, batch, RPC reply, conditional
- **Converter**: Jackson2JsonMessageConverter + custom TypeMapper
- **Transactions**: Channel TX cho DB+MQ atomic, Publisher Confirms cho speed
- **Multi-broker**: @Qualifier + separate ConnectionFactory
- **Testing**: Testcontainers cho integration, Mock cho unit
- **Recovery**: Automatic reconnect, re-declare, re-register consumers
