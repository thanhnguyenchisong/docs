package vn.docs.example.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Query method — Spring Data JPA
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByPriceLessThan(java.math.BigDecimal price);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByName(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
