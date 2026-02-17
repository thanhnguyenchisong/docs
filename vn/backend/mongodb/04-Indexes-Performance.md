# Indexes & Performance - Câu hỏi phỏng vấn MongoDB

## Mục lục
1. [Index là gì?](#index-là-gì)
2. [Single field và Compound index](#single-field-và-compound-index)
3. [Multikey, Text, Geospatial](#multikey-text-geospatial)
4. [Explain và tối ưu](#explain-và-tối-ưu)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Index là gì?

- **Index** giúp tìm document nhanh hơn thay vì scan toàn bộ collection (collection scan).
- Không có index phù hợp → **COLLSCAN**; có index → **IXSCAN**.
- **Trade-off**: Index tăng tốc đọc nhưng tốn dung lượng và chậm ghi (phải cập nhật index).

### Tạo index

```javascript
db.users.createIndex({ email: 1 });           // unique
db.users.createIndex({ email: 1 }, { unique: true });
db.orders.createIndex({ userId: 1, createdAt: -1 });
```

---

## Single field và Compound index

- **Single field**: Một field; thứ tự 1 (tăng) hoặc -1 (giảm); với single field 1 và -1 đều dùng được cho sort.
- **Compound index**: Nhiều field; thứ tự field quan trọng (left-prefix rule: query/sort dùng prefix của index thì mới dùng được).

**Quy tắc left-prefix**: Index `{ a: 1, b: 1, c: 1 }` dùng được cho query/sort: `{a}`, `{a, b}`, `{a, b, c}`; không nhất thiết dùng cho chỉ `{b}` hoặc `{c}`.

```javascript
db.orders.createIndex({ userId: 1, createdAt: -1 });
// Tốt: find({ userId: 1 }).sort({ createdAt: -1 })
// Tốt: find({ userId: 1, createdAt: { $gte: ... } })
```

---

## Multikey, Text, Geospatial

- **Multikey index**: Index trên **array**; mỗi phần tử array một entry index. Một compound index chỉ có tối đa một field là array.
- **Text index**: Full-text search; một collection tối đa một text index (có thể nhiều field).
- **Geospatial**: 2dsphere (WGS84), 2d (flat); dùng cho $geoWithin, $near.

---

## Explain và tối ưu

```javascript
db.users.find({ email: "a@b.com" }).explain("executionStats");
```

- **winningPlan.stage**: IXSCAN = dùng index; COLLSCAN = full scan.
- **executionStats**: totalDocsExamined, totalKeysExamined, nReturned. NReturned gần totalKeysExamined = index hiệu quả.
- **Covered query**: Query + projection chỉ dùng field có trong index → không cần đọc document (index only).

### Best practices

- Index field thường dùng trong filter và sort.
- Compound index: đặt equality trước, sort sau; theo left-prefix.
- Tránh quá nhiều index (ảnh hưởng write).
- Monitor slow query log và explain.

---

## Câu hỏi thường gặp

### Khi nào dùng compound index?

- Query/sort nhiều field; thứ tự field theo left-prefix và theo độ chọn lọc (selective field trước thường tốt).

### _id có index không?

- Có. Collection mặc định có unique index trên _id.

---

**Tiếp theo:** [05-Aggregation-Framework.md](./05-Aggregation-Framework.md)
