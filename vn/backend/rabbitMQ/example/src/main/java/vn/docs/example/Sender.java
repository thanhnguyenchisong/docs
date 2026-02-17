package vn.docs.example;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class Sender {

    private final RabbitTemplate rabbitTemplate;

    public Sender(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping("/send")
    public String send(@RequestParam String message) {
        rabbitTemplate.convertAndSend(RabbitConfig.QUEUE, message);
        return "Sent: " + message;
    }
}
