package vn.docs.example;

import vn.docs.example.jpa.Product;
import vn.docs.example.jpa.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Product> list() {
        return repository.findAll();
    }

    @GetMapping("/search")
    public List<Product> search(@RequestParam String q) {
        return repository.findByNameContainingIgnoreCase(q);
    }

    @PostMapping
    public Product create(@RequestBody Product p) {
        return repository.save(p);
    }
}
