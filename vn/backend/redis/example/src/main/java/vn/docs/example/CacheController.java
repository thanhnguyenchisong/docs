package vn.docs.example;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CacheController {

    private final StringRedisTemplate redis;

    public CacheController(StringRedisTemplate redis) {
        this.redis = redis;
    }

    @PostMapping("/set")
    public String set(@RequestParam String key, @RequestParam String value) {
        redis.opsForValue().set(key, value);
        return "OK";
    }

    @GetMapping("/get")
    public String get(@RequestParam String key) {
        String v = redis.opsForValue().get(key);
        return v != null ? v : "(null)";
    }
}
