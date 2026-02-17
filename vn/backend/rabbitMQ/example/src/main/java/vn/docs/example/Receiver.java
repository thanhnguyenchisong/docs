package vn.docs.example;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class Receiver {

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void receive(String message) {
        System.out.println("Received: " + message);
    }
}
