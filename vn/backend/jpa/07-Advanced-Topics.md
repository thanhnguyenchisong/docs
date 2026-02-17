# Advanced Topics - Câu hỏi phỏng vấn JPA

## Mục lục
1. [Entity Inheritance](#entity-inheritance)
2. [Composite Keys](#composite-keys)
3. [Custom Types](#custom-types)
4. [Database Migrations](#database-migrations)
5. [Multi-tenancy](#multi-tenancy)
6. [Auditing](#auditing)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Entity Inheritance

### Single Table Strategy

```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.STRING)
public abstract class Vehicle {
    @Id
    @GeneratedValue
    private Long id;
    private String brand;
}

@Entity
@DiscriminatorValue("CAR")
public class Car extends Vehicle {
    private Integer numberOfDoors;
}

@Entity
@DiscriminatorValue("BIKE")
public class Bike extends Vehicle {
    private Integer numberOfWheels;
}

// Single table: vehicles
// Columns: id, brand, type, number_of_doors, number_of_wheels
```

### Joined Table Strategy

```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Vehicle {
    @Id
    @GeneratedValue
    private Long id;
    private String brand;
}

@Entity
public class Car extends Vehicle {
    private Integer numberOfDoors;
}

@Entity
public class Bike extends Vehicle {
    private Integer numberOfWheels;
}

// Tables:
// vehicles: id, brand
// cars: id (FK), number_of_doors
// bikes: id (FK), number_of_wheels
```

### Table Per Class Strategy

```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Vehicle {
    @Id
    @GeneratedValue
    private Long id;
    private String brand;
}

@Entity
public class Car extends Vehicle {
    private Integer numberOfDoors;
}

@Entity
public class Bike extends Vehicle {
    private Integer numberOfWheels;
}

// Tables:
// cars: id, brand, number_of_doors
// bikes: id, brand, number_of_wheels
```

### Strategy Comparison

| Strategy | Pros | Cons |
|----------|------|------|
| **SINGLE_TABLE** | Fast queries, simple | Many NULL columns, no NOT NULL on subclass columns |
| **JOINED** | Normalized, no NULLs | Slower (JOINs), more tables |
| **TABLE_PER_CLASS** | No JOINs | Polymorphic queries expensive, duplicate columns |

---

## Composite Keys

### @EmbeddedId

```java
// Composite key class
@Embeddable
public class OrderItemId implements Serializable {
    private Long orderId;
    private Long productId;
    
    // equals() and hashCode()
}

// Entity
@Entity
public class OrderItem {
    @EmbeddedId
    private OrderItemId id;
    
    private Integer quantity;
    
    @ManyToOne
    @MapsId("orderId")
    @JoinColumn(name = "order_id")
    private Order order;
    
    @ManyToOne
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;
}
```

### @IdClass

```java
// Composite key class
public class OrderItemId implements Serializable {
    private Long orderId;
    private Long productId;
    
    // equals() and hashCode()
}

// Entity
@Entity
@IdClass(OrderItemId.class)
public class OrderItem {
    @Id
    private Long orderId;
    
    @Id
    private Long productId;
    
    private Integer quantity;
    
    @ManyToOne
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
}
```

### @EmbeddedId vs @IdClass

| Feature | @EmbeddedId | @IdClass |
|---------|-------------|----------|
| **Key class** | @Embeddable | Plain class |
| **Access** | orderItem.getId().getOrderId() | orderItem.getOrderId() |
| **Use case** | Reusable key | Simple keys |

---

## Custom Types

### @Converter

```java
// Custom converter
@Converter(autoApply = true)
public class LocalDateConverter implements AttributeConverter<LocalDate, Date> {
    @Override
    public Date convertToDatabaseColumn(LocalDate localDate) {
        return localDate == null ? null : Date.valueOf(localDate);
    }
    
    @Override
    public LocalDate convertToEntityAttribute(Date date) {
        return date == null ? null : date.toLocalDate();
    }
}

// Usage
@Entity
public class User {
    @Convert(converter = LocalDateConverter.class)
    private LocalDate birthDate;
}
```

### Custom Type với UserType

```java
// Hibernate UserType
public class JsonType implements UserType {
    @Override
    public int[] sqlTypes() {
        return new int[]{Types.VARCHAR};
    }
    
    @Override
    public Class returnedClass() {
        return Map.class;
    }
    
    @Override
    public Object nullSafeGet(ResultSet rs, String[] names, SessionImplementor session, Object owner) {
        String json = rs.getString(names[0]);
        return json == null ? null : new ObjectMapper().readValue(json, Map.class);
    }
    
    @Override
    public void nullSafeSet(PreparedStatement st, Object value, int index, SessionImplementor session) {
        if (value == null) {
            st.setNull(index, Types.VARCHAR);
        } else {
            st.setString(index, new ObjectMapper().writeValueAsString(value));
        }
    }
}

// Usage
@Entity
public class User {
    @Type(type = "com.example.JsonType")
    @Column(columnDefinition = "TEXT")
    private Map<String, Object> metadata;
}
```

---

## Database Migrations

### Flyway

```java
// Configuration
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true

// Migration file: V1__Create_users_table.sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL
);

// Migration file: V2__Add_age_column.sql
ALTER TABLE users ADD COLUMN age INT;
```

### Liquibase

```java
// Configuration
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml

// changelog-master.xml
<databaseChangeLog>
    <changeSet id="1" author="developer">
        <createTable tableName="users">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true"/>
            </column>
            <column name="username" type="VARCHAR(50)">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>
</databaseChangeLog>
```

---

## Multi-tenancy

### Schema-based Multi-tenancy

```java
// Configuration
@Configuration
public class MultiTenancyConfig {
    @Bean
    public MultiTenantConnectionProvider multiTenantConnectionProvider() {
        return new SchemaMultiTenantConnectionProvider();
    }
    
    @Bean
    public CurrentTenantIdentifierResolver currentTenantIdentifierResolver() {
        return new CurrentTenantIdentifierResolver() {
            @Override
            public String resolveCurrentTenantIdentifier() {
                return TenantContext.getCurrentTenant();
            }
        };
    }
}

// Usage
TenantContext.setCurrentTenant("tenant1");
User user = userRepository.findById(1L);  // Uses tenant1 schema
```

---

## Auditing

### @CreatedDate và @LastModifiedDate

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class User {
    @Id
    @GeneratedValue
    private Long id;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    private String updatedBy;
}

// Configuration
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
```

---

## Câu hỏi thường gặp

### Q1: Khi nào dùng inheritance strategies?

**SINGLE_TABLE:**
- Few subclasses
- Simple hierarchy
- Performance critical

**JOINED:**
- Many subclasses
- Complex hierarchy
- Normalized database

**TABLE_PER_CLASS:**
- Rarely used
- When need separate tables
- Avoid polymorphic queries

### Q2: @EmbeddedId vs @IdClass?

```java
// @EmbeddedId: More object-oriented
@EmbeddedId
private OrderItemId id;
// Access: orderItem.getId().getOrderId()

// @IdClass: More database-like
@IdClass(OrderItemId.class)
private Long orderId;
// Access: orderItem.getOrderId()
```

### Q3: Custom Types use cases?

- JSON columns
- Encrypted fields
- Custom date formats
- Enum with custom storage
- Complex types

---

## Best Practices

1. **Choose right inheritance strategy** based on use case
2. **Use @EmbeddedId** for composite keys (more OO)
3. **Use @Converter** for simple type conversions
4. **Use migrations** for database schema management
5. **Enable auditing** for tracking changes
6. **Consider multi-tenancy** for SaaS applications

---

## Bài tập thực hành

### Bài 1: Entity Inheritance

```java
// Yêu cầu: Implement inheritance với different strategies
// Compare performance và structure
```

### Bài 2: Custom Types

```java
// Yêu cầu: Implement custom type cho JSON column
// Store và retrieve complex objects
```

---

## Tổng kết

- **Entity Inheritance**: SINGLE_TABLE, JOINED, TABLE_PER_CLASS
- **Composite Keys**: @EmbeddedId, @IdClass
- **Custom Types**: @Converter, UserType
- **Database Migrations**: Flyway, Liquibase
- **Multi-tenancy**: Schema-based, database-based
- **Auditing**: @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy
- **Best Practices**: Choose appropriate strategies
