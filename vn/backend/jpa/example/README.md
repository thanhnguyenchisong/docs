# Example — Project minh họa JPA

Spring Boot + JPA + H2: Entity, Repository, REST API. Chạy được để **test và học** theo tài liệu JPA.

## Chạy

```bash
mvn spring-boot:run
```

- API: http://localhost:8081/api/products  
- H2 Console: http://localhost:8081/h2-console (JDBC URL: `jdbc:h2:mem:testdb`)

## Test nhanh

```bash
curl -X POST http://localhost:8081/api/products -H "Content-Type: application/json" -d '{"name":"Sách","price":99.0}'
curl http://localhost:8081/api/products
```

Đọc kèm [../README.md](../README.md) và các file `01-*.md` … trong backend/jpa.
