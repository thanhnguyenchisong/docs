# Document Model & Schema Design - Câu hỏi phỏng vấn MongoDB

## Mục lục
1. [Collection và Document](#collection-và-document)
2. [Embedding vs Reference](#embedding-vs-reference)
3. [Schema Design Patterns](#schema-design-patterns)
4. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Collection và Document

- **Collection**: Nhóm document (tương tự table nhưng không có schema bắt buộc).
- **Document**: BSON object; field = key, value = type (string, number, array, sub-document, ObjectId, ...).
- **Field name**: String; phân cấp bằng dot (e.g. `address.city`).

```javascript
// Ví dụ document
{
  _id: ObjectId("..."),
  name: "Alice",
  age: 30,
  address: { city: "HCM", street: "X" },
  tags: ["vip", "admin"]
}
```

---

## Embedding vs Reference

### Embedding (nhúng)

- Lưu dữ liệu liên quan **bên trong** một document (sub-document hoặc array).
- **Ưu**: Đọc một lần lấy hết; write atomic trong một document.
- **Nhược**: Document lớn; cập nhật nhiều chỗ nếu dữ liệu trùng (denormalize).

**Khi nào dùng**: Quan hệ 1-1, 1-ít (one-to-few), dữ liệu ít thay đổi, hay đọc cùng nhau.

### Reference (tham chiếu)

- Lưu **\_id** của document khác (collection khác); khi cần thì query hoặc $lookup.
- **Ưu**: Tránh trùng lặp; document nhỏ; cập nhật một nơi.
- **Nhược**: Cần thêm query hoặc aggregation ($lookup) để “join”.

**Khi nào dùng**: Quan hệ 1-nhiều (one-to-many), many-to-many; dữ liệu dùng chung hoặc cập nhật nhiều.

### So sánh nhanh

| Tiêu chí | Embedding | Reference |
|----------|-----------|-----------|
| Số lần đọc | 1 | 2+ hoặc $lookup |
| Kích thước document | Có thể lớn | Nhỏ |
| Cập nhật | Có thể nhiều document | Một document |
| Use case | One-to-few, đọc cùng nhau | One-to-many, dùng chung |

---

## Schema Design Patterns

- **Attribute pattern**: Dùng array of {k, v} cho attribute động (tránh quá nhiều field).
- **Bucket pattern**: Gom nhiều event/metric theo thời gian vào một document (time-series).
- **Extended reference**: Embed một vài field hay dùng của bảng “bên kia” để giảm $lookup.
- **Subset pattern**: Chỉ embed subset (ví dụ 5 comment gần nhất) để document không quá lớn.

---

## Câu hỏi thường gặp

### Khi nào embed, khi nào reference?

- **Embed**: Quan hệ 1-1, one-to-few, đọc cùng lúc, ít thay đổi.
- **Reference**: One-to-many, many-to-many, dữ liệu dùng chung, cập nhật thường xuyên.

### Document size limit?

- **16MB** (giới hạn BSON document). Tránh embed mảng phát triển vô hạn (dùng subset hoặc reference).

---

**Tiếp theo:** [03-Queries-CRUD.md](./03-Queries-CRUD.md)
