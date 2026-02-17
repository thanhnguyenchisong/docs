# Spring Data JPA - Tài liệu chi tiết

## Tổng quan

Spring Data JPA là một phần của Spring Data project, cung cấp abstraction layer cho JPA (Java Persistence API) để giảm boilerplate code và đơn giản hóa việc truy cập database.

## Mục lục

1. [Spring Data JPA Fundamentals](./01-Spring-Data-JPA-Fundamentals.md)
   - Giới thiệu Spring Data JPA
   - Configuration và Setup
   - Dependencies
   - Basic Concepts

2. [Repository Pattern](./02-Repository-Pattern.md)
   - Repository Interfaces
   - JpaRepository, CrudRepository, PagingAndSortingRepository
   - Custom Repository Implementation
   - Repository Composition

3. [Query Methods](./03-Query-Methods.md)
   - Method Naming Conventions
   - Query Keywords
   - Return Types
   - Query Creation

4. [Custom Queries](./04-Custom-Queries.md)
   - @Query với JPQL
   - @Query với Native SQL
   - @Modifying Queries
   - Named Queries

5. [Specifications](./05-Specifications.md)
   - Dynamic Queries
   - Specification API
   - Combining Specifications
   - Advanced Usage

6. [Projections](./06-Projections.md)
   - Interface Projections
   - Class-based Projections (DTO)
   - Dynamic Projections
   - Closed vs Open Projections

7. [Pagination và Sorting](./07-Pagination-Sorting.md)
   - Pagination với Page và Slice
   - Sorting
   - Pageable và Sort
   - Best Practices

8. [Entity Graphs](./08-Entity-Graphs.md)
   - N+1 Problem
   - @EntityGraph Annotation
   - Named Entity Graphs
   - Fetch Strategies

9. [Auditing](./09-Auditing.md)
   - @CreatedDate, @LastModifiedDate
   - @CreatedBy, @LastModifiedBy
   - JpaAuditing Configuration
   - Custom Auditors

10. [Performance Optimization](./10-Performance-Optimization.md)
    - N+1 Problem Solutions
    - Batch Operations
    - Lazy vs Eager Loading
    - Query Optimization

11. [Testing](./11-Testing.md)
    - @DataJpaTest
    - TestEntityManager
    - Repository Testing
    - Integration Testing

12. [Advanced Topics](./12-Advanced-Topics.md)
    - Multi-tenancy
    - Custom Query DSL
    - Multiple Data Sources
    - Spring Data JPA với Spring Boot

## Tài liệu tham khảo

- [Spring Data JPA Official Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [JPA Specification](https://jakarta.ee/specifications/persistence/)
- [Hibernate Documentation](https://hibernate.org/orm/documentation/)

## Yêu cầu kiến thức

Trước khi học Spring Data JPA, bạn nên có kiến thức về:
- Java Core
- JPA/Hibernate Fundamentals
- Spring Framework (IoC, DI)
- SQL và Database Concepts

## Cấu trúc học tập

1. Bắt đầu với **Spring Data JPA Fundamentals** để hiểu cơ bản
2. Học **Repository Pattern** để nắm vững cách sử dụng repositories
3. Thực hành với **Query Methods** và **Custom Queries**
4. Nâng cao với **Specifications**, **Projections**, và **Entity Graphs**
5. Tối ưu với **Performance Optimization**
6. Test với **Testing** chapter
7. Mở rộng với **Advanced Topics**

## Best Practices

1. **Sử dụng Query Methods** cho các queries đơn giản
2. **Sử dụng @Query** cho các queries phức tạp
3. **Sử dụng Specifications** cho dynamic queries
4. **Sử dụng Projections** để giảm data transfer
5. **Sử dụng Pagination** cho large result sets
6. **Sử dụng EntityGraph** để tránh N+1 problem
7. **Tránh N+1 queries** với JOIN FETCH
8. **Sử dụng @Transactional** đúng cách
9. **Test repositories** với @DataJpaTest
10. **Monitor performance** và optimize queries
