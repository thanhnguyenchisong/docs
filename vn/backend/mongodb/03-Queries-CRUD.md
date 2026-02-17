# Queries & CRUD - Câu hỏi phỏng vấn MongoDB

## Mục lục
1. [CRUD cơ bản](#crud-cơ-bản)
2. [Query operators](#query-operators)
3. [Projection và Sort](#projection-và-sort)
4. [Update operators](#update-operators)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## CRUD cơ bản

```javascript
// Create
db.users.insertOne({ name: "Alice", age: 30 });
db.users.insertMany([{ name: "Bob" }, { name: "Carol" }]);

// Read
db.users.findOne({ name: "Alice" });
db.users.find({ age: { $gte: 18 } });

// Update
db.users.updateOne({ name: "Alice" }, { $set: { age: 31 } });
db.users.updateMany({ status: "active" }, { $set: { verified: true } });

// Delete
db.users.deleteOne({ _id: id });
db.users.deleteMany({ status: "inactive" });
```

- **insertOne/insertMany**: Thêm document; có thể chỉ định _id.
- **find/findOne**: filter (query); có thể thêm projection, sort, limit, skip.
- **updateOne/updateMany**: filter + update document ($set, $inc, $push, ...); upsert: true để tạo mới nếu không có.
- **deleteOne/deleteMany**: Xóa theo filter.

---

## Query operators

- **So sánh**: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin.
- **Logic**: $and, $or, $not, $nor.
- **Element**: $exists, $type.
- **Array**: $elemMatch, $all, $size.
- **String**: $regex.
- **Geospatial**: $geoWithin, $near.

```javascript
db.users.find({ age: { $gte: 18, $lte: 65 } });
db.users.find({ $or: [{ role: "admin" }, { vip: true }] });
db.users.find({ "address.city": "HCM" });
db.products.find({ tags: { $all: ["sale", "electronics"] } });
```

---

## Projection và Sort

```javascript
// Chỉ lấy một số field (1 = include, 0 = exclude; _id mặc định có)
db.users.find({}, { name: 1, email: 1, _id: 0 });

// Sort, limit, skip
db.users.find({}).sort({ createdAt: -1 }).limit(10).skip(20);
```

- **Projection**: Giảm dữ liệu trả về; hỗ trợ nested (e.g. "address.city": 1).
- **sort**: 1 tăng dần, -1 giảm dần; có thể sort nhiều field.
- **limit/skip**: Phân trang (skip chậm khi offset lớn; cursor/range tốt hơn cho production).

---

## Update operators

- **$set**: Gán giá trị (field hoặc nested).
- **$unset**: Xóa field.
- **$inc**: Cộng/trừ số.
- **$push / $addToSet**: Thêm vào array ($addToSet không trùng).
- **$pull**: Xóa phần tử array thỏa điều kiện.
- **$rename**: Đổi tên field.

```javascript
db.users.updateOne(
  { _id: id },
  { $set: { "address.city": "HN" }, $inc: { loginCount: 1 } }
);
```

---

## Câu hỏi thường gặp

### find vs findOne?

- **find**: Trả về cursor (nhiều document); có thể .limit(), .sort().
- **findOne**: Trả về một document hoặc null.

### Pagination tốt hơn skip?

- **skip(n)** chậm khi n lớn (server vẫn scan n document). Nên dùng **cursor-based**: sort theo _id hoặc field unique, điều kiện `_id > lastSeenId` + limit.

---

**Tiếp theo:** [04-Indexes-Performance.md](./04-Indexes-Performance.md)
