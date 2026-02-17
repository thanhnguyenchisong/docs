package vn.docs.example;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String QUEUE = "demo-queue";

    @Bean
    public Queue queue() {
        return new Queue(QUEUE, false);
    }
}
