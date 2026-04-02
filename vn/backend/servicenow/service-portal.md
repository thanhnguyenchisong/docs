# Hướng dẫn chi tiết về Service Portal (ServiceNow)

Tài liệu này được chuyển ngữ và tóm tắt từ tài liệu đào tạo chính thức của ServiceNow dành cho nhà phát triển ứng dụng (Application Developer).

---

## 1. Giới thiệu về Service Portal

### 1.1 Service Portal là gì?
**Service Portal** là một framework của ServiceNow cho phép xây dựng giao diện người dùng (UI) hiện đại, thân thiện và linh hoạt. Nó cung cấp một cách tiếp cận thay thế cho giao diện quản trị backend (Standard UI) truyền thống, giúp người dùng cuối (end-users) tương tác với nền tảng Now Platform dễ dàng hơn trên mọi thiết bị.

**Lợi ích chính:**
*   Truy cập được trên Desktop, Tablet và Smartphone.
*   Giao diện có thể tùy biến hoàn toàn theo nhận diện thương hiệu của tổ chức.
*   Tối giản hóa quy trình tự phục vụ (self-service).

### 1.2 Giải phẫu một trang Portal (Portal Anatomy)

Mỗi Portal có thể một một hoặc nhiều pages, mỗi page ko phải là duy nhất cho một Portal, nó có thể được tái sử dụng ở nhiều Portal khác nhau nếu cần.
Page chức bởi các container, mỗi container có thể chứa nhiều row và column, mỗi row có tối đa 12 colume, mỗi colume có thể chứa nhiều widget. Default khi tạo là 1 row - 3 columne.

Mỗi Portal được cấu thành từ các thành phần phân cấp:
*   **Portal (Cổng thông tin):** Cấp cao nhất, định nghĩa URL (suffix), chủ đề (theme), trang chủ (homepage).
*   **Pages (Trang):** Một Portal gồm nhiều trang (ví dụ: trang chủ, trang catalog, trang ticket). Các trang có thể tái sử dụng giữa các Portal.
*   **Containers (Thùng chứa):** Chia bố cục trang thành các vùng lớn (Sections).
*   **Rows & Columns (Hàng và Cột):** Sử dụng hệ thống **Bootstrap v3 Grid** để chia nhỏ bố cục (tối đa 12 cột mỗi hàng).
*   **Widgets:** Các thành phần chức năng hiển thị thông tin hoặc cho phép tương tác (ví dụ: Search bar, Icon link, List records).

Câu hỏi: trong page của service portail các container có thể lồng nhau được ko ? và có nên làm vậy ?
Trả lời: Có, các container có thể lồng nhau nhưng không nên làm vậy vì sẽ làm tăng độ phức tạp của trang.

Câu hỏi: Trong một colume có thể tạo 1 row được ko ? Và có nên làm vậy ?
Trả lời: Có, trong một colume có thể tạo 1 row. Tuy nhiên không nên làm vậy vì sẽ làm tăng độ phức tạp của trang.

Vậy nếu muốn chia nhỏ hơn thì mình nên dùng widget à ? giải thich giúp t tại sao lại nên dùng widget và dùng ntn ?

---

## 2. Các công cụ cấu hình chính
The Service Portal framework is a set of tools, APIs, AngularJS services and directives, and components used to create portals

ServiceNow cung cấp một bộ công cụ tập trung tại **Service Portal > Service Portal Configuration**:

1.  **Branding Editor:** Thay đổi nhanh logo, hình nền, màu sắc chủ đạo (`brand-primary`, `brand-success`, v.v.).
2.  **Designer:** Công cụ trực quan nhất để kéo và thả các Container, Layout và Widget vào trang.
3.  **Page Editor:** Hiển thị trang dưới dạng sơ đồ cây, cho phép chỉnh sửa sâu vào thuộc tính của từng thành phần.
4.  **Widget Editor:** Môi trường lập trình (IDE) để viết code (HTML, CSS, Client/Server Script) cho Widget.

---

## 3. Quản lý bố cục và tính linh hoạt (Layout & Responsiveness)

### 3.1 Containers: Fixed vs Fluid
*   **Fixed (Cố định):** Chiều rộng của nội dung trang được giữ cố định theo các mốc chuẩn của Bootstrap.
*   **Fluid (Linh hoạt):** Chiều rộng của nội dung sẽ tự động co giãn theo 100% chiều rộng màn hình.

### 3.2 Viewports & Điểm ngắt (Breakpoints)
Service Portal hỗ trợ 4 kích thước màn hình chuẩn của Bootstrap v3:
*   **Extra Small (XS):** Điện thoại di động.
*   **Small (SM):** Máy tính bảng.
*   **Medium (MD):** Laptop/Màn hình nhỏ.
*   **Large (LG):** Màn hình máy tính để bàn lớn.

### 3.3 Ẩn/Hiện thành phần theo thiết bị
Bạn có thể sử dụng các lớp CSS của Bootstrap (Helper Classes) trong trường **Parent class** của Container hoặc Widget để kiểm soát hiển thị:
*   `hidden-xs`: Ẩn trên điện thoại.
*   `visible-xs`: Chỉ hiện trên điện thoại.

---

## 4. Widget và Tùy chọn (Widget Options)

Mỗi Widget khi được đưa vào trang là một **bản thể (instance)** duy nhất. Bạn có thể cấu hình các bản thể này khác nhau thông qua **Widget Options** (biểu tượng hình bút chì trong Designer).

*Ví dụ:* Cùng sử dụng Widget "Homepage Search" nhưng trang chủ thì để tiêu đề "Chúng tôi có thể giúp gì bạn?", còn trang IT Support thì để "Tìm kiếm tài liệu kỹ thuật".

---

## 5. Phân quyền và Bảo mật cho Widget

Bạn có thể giới hạn ai được nhìn thấy một Widget cụ thể bằng cách sử dụng trường **Roles** trong thuộc tính của Widget Instance (thông qua Page Editor).
*   Nếu bỏ trống: Ai cũng có thể thấy.
*   Nếu điền một Role (ví dụ: `manager`): Chỉ những người dùng có role đó mới thấy Widget trên Portal.

---

## 6. Quy trình làm việc đề xuất (Best Practices)

1.  **Sử dụng OOB Widgets trước:** Ưu tiên dùng các Widget có sẵn của ServiceNow (Out-of-the-Box) trước khi tự viết code Widget mới.
2.  **Thiết kế Mobile-first:** Luôn kiểm tra giao diện trên chế độ Preview (Mobile/Tablet) trong Designer.
3.  **Hạn chế truy vấn Server:** Trong Server Script của Widget, hãy giới hạn số lượng bản ghi trả về (`gr.setLimit()`) để tối ưu hiệu năng trang.
4.  **Màu sắc nhất quán:** Sử dụng các biến Sass của hệ thống (ví dụ: `$brand-primary`) thay vì mã màu Hex cứng nhắc để dễ dàng thay đổi Theme sau này.

---

## 7. Các bước thực hành cơ bản (Gợi ý từ tài liệu)

1.  **Tạo Portal:** Định nghĩa URL suffix (ví dụ: `/hr_portal`).
2.  **Cấu hình Branding:** Đưa logo của công ty lên và chọn màu sắc phù hợp.
3.  **Tạo Trang mới:** Đặt ID cho trang (ví dụ: `hr_index`).
4.  **Xây dựng bố cục:** Kéo Container -> Thêm Row (12 columns hoặc 4-4-4) -> Thêm Widget vào các cột.
5.  **Thiết lập thuộc tính:** Chỉnh sửa Option cho từng Widget để hiển thị đúng dữ liệu mong muốn.
6.  **Kiểm tra (Preview):** Dùng tính năng Preview trong Designer để trải nghiệm như một người dùng cuối.

---
*Ghi chú: Tài liệu này được biên soạn lại dựa trên hướng dẫn kỹ thuật ServiceNow Developers.*
