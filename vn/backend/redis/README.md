# Tài liệu Luyện Phỏng vấn Redis

Chào mừng đến với bộ tài liệu luyện phỏng vấn Redis! Bộ tài liệu này bao gồm các chủ đề quan trọng nhất thường được hỏi trong các cuộc phỏng vấn về Redis (cache, in-memory data store).

## 📚 Mục lục

### Core Redis

1. **[Redis Fundamentals](./01-Redis-Fundamentals.md)**
   - Redis là gì?
   - In-Memory Data Store
   - Redis vs Memcached vs Database
   - Use cases

2. **[Data Structures](./02-Data-Structures.md)**
   - String, List, Set, Sorted Set, Hash
   - Bitmap, HyperLogLog, Streams
   - Khi nào dùng cấu trúc nào

3. **[Persistence và Replication](./03-Persistence-Replication.md)**
   - RDB (snapshot) vs AOF (append-only file)
   - Replication: master-replica
   - Failover

4. **[Caching Patterns](./04-Caching-Patterns.md)**
   - Cache-aside, Write-through, Write-behind
   - Cache invalidation, TTL
   - Thundering herd, stampede

5. **[Spring Data Redis](./05-Spring-Data-Redis.md)**
   - RedisTemplate, StringRedisTemplate
   - Spring Cache với Redis
   - Serialization, Connection pool

6. **[Clustering và Sentinel](./06-Clustering-Sentinel.md)**
   - Redis Cluster: sharding, hash slot
   - Redis Sentinel: HA, auto failover
   - Khi nào dùng Cluster vs Sentinel

7. **[Advanced Topics](./07-Advanced-Topics.md)**
   - Pub/Sub, Lua scripting
   - Transactions, Pipeline
   - Performance tuning, best practices

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Nắm vững in-memory store và use cases
2. **Thực hành Data Structures**: Mỗi type có use case riêng
3. **Ôn Caching Patterns**: Cache-aside, invalidation — rất hay hỏi phỏng vấn
4. **Spring Data Redis**: Tích hợp với Spring Boot

## 📝 Cấu trúc mỗi file

Mỗi file tài liệu bao gồm:

- **Lý thuyết**: Giải thích chi tiết các khái niệm
- **Ví dụ code / CLI**: Minh họa bằng redis-cli hoặc Java
- **So sánh**: So sánh các approaches khác nhau
- **Best Practices**: Các thực hành tốt nhất
- **Câu hỏi thường gặp**: FAQ với câu trả lời chi tiết

## 🔥 Chủ đề Hot trong Phỏng vấn

### Core Redis
- ✅ Redis vs Memcached vs DB
- ✅ Data structures và khi nào dùng
- ✅ RDB vs AOF
- ✅ Cache-aside, cache invalidation

### Advanced
- ✅ Redis Cluster (hash slot, sharding)
- ✅ Sentinel vs Cluster
- ✅ Cache stampede / thundering herd
- ✅ Spring Cache với Redis

## 💡 Tips cho Phỏng vấn

1. **Hiểu use case**: Cache, session, rate limit, pub/sub — Redis dùng ở đâu
2. **Data structures**: String (cache), Hash (object), Set (unique), Sorted Set (ranking)
3. **Persistence**: RDB nhanh restore, AOF durability; có thể dùng cả hai
4. **Scalability**: Sentinel cho HA đơn giản, Cluster cho scale ngang
5. **Thực hành**: Chạy Redis local, dùng redis-cli, tích hợp Spring Boot

## 📖 Tài liệu tham khảo

- [Redis Documentation](https://redis.io/docs/)
- [Redis Commands](https://redis.io/commands/)
- [Spring Data Redis](https://spring.io/projects/spring-data-redis)
- [Redis University](https://university.redis.com/)

## 🚀 Lộ trình học

### Beginner → Intermediate
1. Redis Fundamentals
2. Data Structures
3. Persistence và Replication
4. Caching Patterns

### Intermediate → Advanced
5. Spring Data Redis
6. Clustering và Sentinel
7. Advanced Topics

## ✅ Checklist trước Phỏng vấn

- [ ] Redis là gì, khác Memcached thế nào
- [ ] Các data structures và use case
- [ ] RDB vs AOF
- [ ] Cache-aside, cache invalidation
- [ ] Spring Data Redis / Spring Cache
- [ ] Redis Cluster (hash slot)
- [ ] Sentinel: auto failover
- [ ] Cache stampede và cách giảm thiểu

---

**Chúc bạn thành công trong các cuộc phỏng vấn! 🎉**
