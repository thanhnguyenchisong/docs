package vn.docs.example;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

@RestController
public class ApiController {

    private final WebClient webClient = WebClient.create("http://localhost:8087");

    @GetMapping("/api/hello")
    public String hello() {
        String workerResponse = webClient.get().uri("/hello").retrieve().bodyToMono(String.class).block();
        return "API received from worker: " + workerResponse;
    }
}
