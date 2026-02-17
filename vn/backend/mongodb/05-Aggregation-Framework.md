# Aggregation Framework - Câu hỏi phỏng vấn MongoDB

## Mục lục
1. [Pipeline là gì?](#pipeline-là-gì)
2. [Các stage thường dùng](#các-stage-thường-dùng)
3. [$lookup (join)](#lookup-join)
4. [$group và accumulator](#group-và-accumulator)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Pipeline là gì?

- **Aggregation pipeline** = chuỗi **stage** xử lý document; output stage trước là input stage sau.
- Mỗi stage: $match, $project, $group, $sort, $lookup, $unwind, ...

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$userId", total: { $sum: "$amount" } } },
  { $sort: { total: -1 } },
  { $limit: 10 }
]);
```

---

## Các stage thường dùng

- **$match**: Lọc document (như find); nên đặt sớm để giảm dữ liệu qua pipeline; có thể dùng index.
- **$project**: Chọn/đổi tên/thêm field; giảm kích thước document.
- **$sort**: Sắp xếp; có thể dùng index nếu $sort là stage đầu (sau $match dùng index).
- **$limit / $skip**: Giới hạn và bỏ qua.
- **$unwind**: Tách mảng thành từng document (mỗi phần tử một document).
- **$group**: Nhóm theo _id, dùng accumulator ($sum, $avg, $min, $max, $push, ...).
- **$lookup**: Join với collection khác (left outer join).
- **$facet**: Chạy nhiều pipeline con trên cùng input (nhiều metric trong một lần).

---

## $lookup (join)

```javascript
db.orders.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "userId",
      foreignField: "_id",
      as: "user"
    }
  },
  { $unwind: "$user" }
]);
```

- **from**: Collection nguồn.
- **localField / foreignField**: Field so khớp (hoặc dùng pipeline trong $lookup cho logic phức tạp).
- **as**: Tên field chứa kết quả (mảng); thường sau đó $unwind nếu 1-1.

---

## $group và accumulator

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$userId",
      totalAmount: { $sum: "$amount" },
      count: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
    }
  }
]);
```

- **_id**: Trường (hoặc expression) để nhóm; null = gộp tất cả.
- **Accumulator**: $sum, $avg, $min, $max, $first, $last, $push, $addToSet.

---

## Câu hỏi thường gặp

### $match đặt đâu trong pipeline?

- Đặt **sớm** (đầu pipeline hoặc ngay sau stage không làm tăng số document) để lọc bớt và tận dụng index.

### $lookup có làm chậm không?

- Có; tương tự JOIN. Nếu collection lớn nên có index trên foreignField; hoặc cân nhắc embed/reference khi thiết kế schema.

---

**Tiếp theo:** [06-Spring-Data-MongoDB.md](./06-Spring-Data-MongoDB.md)
