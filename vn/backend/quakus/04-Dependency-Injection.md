### Vì sao Quarkus không hỗ trợ các Scope phức tạp như Spring?

#### Triết lý chính:
Quarkus ưu tiên build-time optimization và thiết kế minimal để tối ưu hóa hiệu suất khi chạy ứng dụng cloud-native. Các scope phức tạp trong Spring (như `@Prototype`, `@SessionScoped`, `@GlobalSessionScoped`) không được hỗ trợ chủ yếu do:

1. **Tối ưu hóa Build-time:**
   - Việc xác định scope lúc runtime (như request hoặc session trong Spring) thường phức tạp hơn, gây tốn tài nguyên trong môi trường cloud.
   - `@Singleton` và `@ApplicationScoped` là đủ để quản lý trạng thái dịch vụ một cách hiệu quả, trong khi các scopes ngắn hạn hơn có thể được quản lý bằng CDI `Dependent`.

2. **Cloud-native**
   - Mô hình Quarkus nhấn mạnh vào thiết kế ứng dụng không trạng thái (stateless), dễ scale theo hướng microservices.
   - Các scope như `@SessionScoped` rất hiếm khi phù hợp với mô hình serverless và ứng dụng cloud hiện đại.

3. **Proxy Pattern:**
   - Normal scopes như `@ApplicationScoped` tự động hỗ trợ lazy initialization và quản lý lifecycle thông qua Proxy trong CDI.
   - Các proxy này giải quyết tốt vấn đề tiêm phụ thuộc mà không cần phải khai sinh ra nhiều scope phức tạp.

#### Hướng thay thế:
- Sử dụng các scope chuẩn của CDI:
  - `@ApplicationScoped`, `@Dependent`, và `@RequestScoped` thường đã đủ cho hầu hết tình huống.
  - Các scope khác (nếu cần) có thể được giả lập bằng cách kết hợp CDI `Instance<T>` hoặc các cấu trúc tùy chỉnh (custom context).  
 
Tham khảo thêm: **[Quarkus CDI Guide](https://quarkus.io/guides/cdi)**
