# Advanced Topics - Câu hỏi phỏng vấn Kafka

## Mục lục
1. [Schema Registry](#schema-registry)
2. [Security](#security)
3. [Multi-tenancy](#multi-tenancy)
4. [Exactly-Once Semantics](#exactly-once-semantics)
5. [Disaster Recovery](#disaster-recovery)
6. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Schema Registry

### What is Schema Registry?

**Schema Registry** là service để store và manage schemas cho Kafka messages.

### Benefits

- **Schema Evolution**: Handle schema changes
- **Compatibility**: Ensure compatibility between versions
- **Validation**: Validate messages against schema

### Usage

```java
// Producer với Schema Registry
props.put("value.serializer", "io.confluent.kafka.serializers.KafkaAvroSerializer");
props.put("schema.registry.url", "http://localhost:8081");

// Consumer với Schema Registry
props.put("value.deserializer", "io.confluent.kafka.serializers.KafkaAvroDeserializer");
props.put("schema.registry.url", "http://localhost:8081");
```

---

## Security

### SASL Authentication

```properties
# SASL configuration
security.protocol=SASL_SSL
sasl.mechanism=PLAIN
sasl.jaas.config=org.apache.kafka.common.security.plain.PlainLoginModule required \
  username="user" \
  password="password";
```

### SSL Encryption

```properties
# SSL configuration
security.protocol=SSL
ssl.truststore.location=/path/to/truststore
ssl.truststore.password=password
ssl.keystore.location=/path/to/keystore
ssl.keystore.password=password
```

### ACLs (Access Control Lists)

```bash
# Create ACL
kafka-acls.sh --authorizer-properties zookeeper.connect=localhost:2181 \
  --add --allow-principal User:producer \
  --operation Write --topic user-events
```

---

## Multi-tenancy

### Topic Naming

```java
// Namespace topics by tenant
// tenant1-user-events
// tenant2-user-events

String topic = tenantId + "-" + "user-events";
```

### ACLs per Tenant

```bash
# Tenant-specific ACLs
kafka-acls.sh --add \
  --allow-principal User:tenant1 \
  --operation Read --topic tenant1-*
```

---

## Exactly-Once Semantics

### Producer Idempotence

```java
// Enable idempotence
props.put("enable.idempotence", "true");
props.put("acks", "all");
props.put("max.in.flight.requests.per.connection", "5");
```

### Transactions

```java
// Transactional producer
props.put("transactional.id", "unique-id");
producer.initTransactions();

try {
    producer.beginTransaction();
    producer.send(record1);
    producer.send(record2);
    producer.commitTransaction();
} catch (Exception e) {
    producer.abortTransaction();
}
```

---

## Disaster Recovery

### Replication

```java
// High replication factor
replication.factor=5

// Min in-sync replicas
min.insync.replicas=3
```

### Backup và Restore

```bash
# Backup topic
kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic user-events --from-beginning > backup.txt

# Restore topic
kafka-console-producer.sh --bootstrap-server localhost:9092 \
  --topic user-events < backup.txt
```

---

## Câu hỏi thường gặp

### Q1: Schema evolution strategies?

```java
// Backward compatible: New schema can read old data
// Forward compatible: Old schema can read new data
// Full compatible: Both directions

// Compatibility modes:
// - BACKWARD
// - FORWARD
// - FULL
// - NONE
```

### Q2: Security best practices?

```java
// 1. Use SASL for authentication
// 2. Use SSL for encryption
// 3. Use ACLs for authorization
// 4. Rotate credentials regularly
// 5. Monitor access logs
```

---

## Best Practices

1. **Use Schema Registry**: Manage schema evolution
2. **Enable Security**: SASL, SSL, ACLs
3. **Plan Multi-tenancy**: Namespace, ACLs
4. **Enable Exactly-Once**: For critical applications
5. **Plan Disaster Recovery**: Replication, backups

---

## Tổng kết

- **Schema Registry**: Schema management và evolution
- **Security**: SASL, SSL, ACLs
- **Multi-tenancy**: Namespace, tenant isolation
- **Exactly-Once**: Idempotence, transactions
- **Disaster Recovery**: Replication, backups
