# 🎓 Hướng Dẫn Toàn Diện Thi Chứng Chỉ CSA (ServiceNow Certified System Administrator)

> Tài liệu lộ trình, kiến thức cốt lõi, và chiến lược ôn thi cho chứng chỉ CSA.
> Ngôn ngữ: Tiếng Việt | Cập nhật: 04/2026

---

## Mục Lục

1. [Tổng Quan Chứng Chỉ CSA](#1-tổng-quan-chứng-chỉ-csa)
2. [Thông Tin Kỳ Thi](#2-thông-tin-kỳ-thi)
3. [Lộ Trình Ôn Thi (Roadmap)](#3-lộ-trình-ôn-thi-roadmap)
4. [Domain 1: Platform Overview & Navigation (7%)](#domain-1-platform-overview--navigation-7)
5. [Domain 2: Instance Configuration (10%)](#domain-2-instance-configuration-10)
6. [Domain 3: Collaboration & Task Management (20%)](#domain-3-collaboration--task-management-20)
7. [Domain 4: Database Management & Platform Security (30%)](#domain-4-database-management--platform-security-30)
8. [Domain 5: Self-Service & Automation (20%)](#domain-5-self-service--automation-20)
9. [Domain 6: Introduction to Development (13%)](#domain-6-introduction-to-development-13)
10. [Mẹo Thi & Câu Hỏi Mẫu](#10-mẹo-thi--câu-hỏi-mẫu)

---

## 1. Tổng Quan Chứng Chỉ CSA

### CSA là gì?

**CSA (Certified System Administrator)** là chứng chỉ nền tảng đầu tiên trong hệ thống chứng nhận của ServiceNow. Nó xác nhận bạn có đủ kiến thức và kỹ năng để **cấu hình, triển khai và bảo trì** hệ thống ServiceNow.

### Vị trí CSA trong hệ thống chứng chỉ

```
                    ┌─────────────────────────────┐
                    │   Certified Master Architect │ ← Cao nhất
                    └──────────────┬──────────────┘
              ┌────────────────────┼────────────────────┐
     ┌────────┴────────┐  ┌───────┴───────┐   ┌────────┴────────┐
     │ Certified       │  │ Certified     │   │ Certified       │
     │ Implementation  │  │ Application   │   │ Technical       │
     │ Specialist (CIS)│  │ Developer (CAD│   │ Architect (CTA) │
     └────────┬────────┘  └───────┬───────┘   └─────────────────┘
              │                   │
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              │    ★ CSA ★         │ ← BẠN Ở ĐÂY
              │ Certified System  │
              │ Administrator     │
              └───────────────────┘
```

### Ai nên thi CSA?

| Đối tượng | Lý do |
|---|---|
| **System Administrator** | Quản trị instance ServiceNow hàng ngày |
| **Developer** | Nền tảng bắt buộc trước khi thi CAD/CIS |
| **IT Consultant** | Chứng minh năng lực khi tư vấn dự án |
| **Người chuyển ngành** | Bước đệm vào ngành ServiceNow (lương cao, nhu cầu lớn) |

### Giá trị chứng chỉ

- ✅ **Điều kiện tiên quyết** cho tất cả chứng chỉ ServiceNow nâng cao
- ✅ Được công nhận toàn cầu bởi các nhà tuyển dụng
- ✅ Mức lương trung bình ServiceNow Admin tại Mỹ: **$80,000 - $120,000/năm**
- ✅ Tại Việt Nam (remote & các công ty quốc tế): **$1,500 - $3,500/tháng**

---

## 2. Thông Tin Kỳ Thi

### Chi tiết kỳ thi

| Hạng mục | Chi tiết |
|---|---|
| **Tên đầy đủ** | ServiceNow Certified System Administrator (CSA) |
| **Số câu hỏi** | ~60 câu |
| **Thời gian** | 90 phút |
| **Loại câu hỏi** | Multiple-choice (chọn 1) + Multiple-select (chọn nhiều) |
| **Điểm đậu** | **70%** (≈ 42/60 câu đúng) |
| **Phí thi** | **$300 USD** (+ thuế tùy khu vực) |
| **Nền tảng đăng ký** | **Pearson VUE** (qua ServiceNow Certification Portal) |
| **Hình thức thi** | Online proctored hoặc Test center |
| **Hiệu lực** | Phải thi lại (delta exam) khi có phiên bản mới |
| **Ngôn ngữ** | Tiếng Anh |

### Quy trình đăng ký thi

```
Bước 1                Bước 2                Bước 3              Bước 4
┌──────────┐     ┌──────────────┐     ┌──────────────┐    ┌─────────────┐
│ Hoàn thành│     │ Đăng nhập     │     │ Chọn kỳ thi  │    │ Thanh toán  │
│ khóa      │ ──→ │ Certification│ ──→ │ CSA + hình    │──→ │ $300 USD    │
│ Fundament-│     │ Portal       │     │ thức thi      │    │ + chọn ngày │
│ als       │     │              │     │ (online/      │    │             │
│           │     │              │     │  test center) │    │             │
└──────────┘     └──────────────┘     └──────────────┘    └─────────────┘
```

### Chính sách thi lại

- **Lần 1 trượt:** Phải đợi **tuân theo waiting period** trước khi đăng ký lại
- **Phí thi lại:** Trả lại $300 USD cho mỗi lần thi
- **Không giới hạn** số lần thi lại

### Phân bổ trọng số theo Domain

```
┌────────────────────────────────────────────────────────────────┐
│  Domain 4: Database & Security          ████████████████ 30%   │
│  Domain 3: Collaboration & Tasks        ██████████      20%   │
│  Domain 5: Self-Service & Automation    ██████████      20%   │
│  Domain 6: Intro to Development         ████████        13%   │
│  Domain 2: Instance Configuration       ██████          10%   │
│  Domain 1: Platform & Navigation        ████             7%   │
└────────────────────────────────────────────────────────────────┘
```

> **⚠️ Quan trọng:** Domain 4 (Database & Security) chiếm **30%** — tập trung ôn kỹ phần này!

---

## 3. Lộ Trình Ôn Thi (Roadmap)

### Timeline đề xuất: 6 - 8 tuần

```
Tuần 1-2          Tuần 3-4          Tuần 5-6          Tuần 7-8
┌──────────┐    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
│ NỀN TẢNG │    │ KIẾN THỨC    │   │ THỰC HÀNH    │  │ ÔN TẬP &    │
│           │    │ CHUYÊN SÂU   │   │ CHUYÊN SÂU   │  │ THI THỬ     │
├──────────┤    ├──────────────┤   ├──────────────┤  ├──────────────┤
│• Hoàn    │    │• Domain 3:   │   │• PDI hands-on│  │• Ôn lại     │
│  thành   │    │  Collaboration│   │  labs        │  │  domains yếu│
│  Fundamen│    │• Domain 4:   │   │• Import Sets │  │• Thi thử    │
│  tals    │    │  Database    │   │• ACLs        │  │  simulation │
│  course  │    │  & Security  │   │• Flow        │  │• Đọc lại    │
│• Setup   │    │• Domain 5:   │   │  Designer    │  │  docs       │
│  PDI     │    │  Self-Service│   │• Service     │  │• Đăng ký thi│
│• Domain  │    │• Domain 6:   │   │  Catalog     │  │             │
│  1 & 2   │    │  Development │   │              │  │             │
└──────────┘    └──────────────┘   └──────────────┘  └──────────────┘
```

### Tài nguyên học tập

| Tài nguyên | Link/Mô tả | Bắt buộc? |
|---|---|---|
| **ServiceNow Fundamentals** | Now Learning (khóa chính thức) | ✅ Bắt buộc |
| **Personal Developer Instance (PDI)** | developer.servicenow.com → request PDI | ✅ Bắt buộc |
| **ServiceNow Docs** | docs.servicenow.com | ✅ Tra cứu |
| **Now Learning Practice Labs** | lab.servicenow.com | Khuyến khích |
| **Community Forums** | community.servicenow.com | Hữu ích |
| **YouTube - ServiceNow** | Kênh chính thức ServiceNow | Tham khảo |

### PDI (Personal Developer Instance)

PDI là một instance ServiceNow **miễn phí** dành cho developer/learner thực hành:

1. Truy cập: https://developer.servicenow.com
2. Đăng ký tài khoản
3. Click **Request Instance**
4. Chọn phiên bản (Utah/Vancouver/Washington/Zurich)
5. Chờ ~5 phút để instance sẵn sàng
6. Đăng nhập với kredentials được cung cấp

> **Lưu ý:** PDI sẽ tự động đóng (hibernate) sau 10 ngày không sử dụng. Chỉ cần wake up lại.

---

## Domain 1: Platform Overview & Navigation (7%)

### Những gì cần nắm:

### 1.1 Giao diện ServiceNow (Next Experience UI)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 All    ⭐ Favorites    📋 History    Admin ▼          [Profile] │ ← Banner
├──────────┬───────────────────────────────────────────────────────────┤
│          │                                                           │
│ All menu │              Content Frame                                │
│ ├ Self-  │         (Form / List / Homepage / Dashboard)              │
│ │ Service│                                                           │
│ ├ Incident│                                                          │
│ │ ├ Create│                                                          │
│ │ ├ Open  │                                                          │
│ │ └ All   │                                                          │
│ ├ Change  │                                                          │
│ └ ...     │                                                          │
│           │                                                          │
│ Filter ▼  │                                                          │
│           │                                                          │
└──────────┴───────────────────────────────────────────────────────────┘
```

**Thành phần chính:**
- **Banner:** Chứa All menu, Favorites, History, Profile menu
- **All menu (Application Navigator):** Menu điều hướng chính, có thể lọc (filter)
- **Content frame:** Hiển thị nội dung (forms, lists, dashboards)
- **Favorites:** Đánh dấu truy cập nhanh các module thường dùng
- **History:** Lịch sử các trang đã truy cập gần đây

### 1.2 Lists & Filters

**Khái niệm cần biết:**
- **List View:** Hiển thị nhiều bản ghi dạng bảng
- **Filter Builder:** Công cụ tạo điều kiện lọc (AND/OR)
- **Breadcrumbs:** Hiển thị các điều kiện lọc đang áp dụng
- **Encoded Query:** Chuỗi mã hóa conditions, dùng trong script
- **Column configuration:** Tùy chỉnh cột hiển thị (Configure → List Layout)
- **Personalize List:** Mỗi user tùy chỉnh cột cho riêng mình
- **Group by:** Nhóm bản ghi theo trường
- **List Editor/List editing:** Double-click để sửa tức thì trên list

### 1.3 Forms

**Khái niệm cần biết:**
- **Form Layout:** Bố cục trường trên form
- **Form Designer:** Công cụ kéo-thả thiết kế form
- **Views:** Các bố cục khác nhau cho cùng bảng (Default, Mobile, ITIL...)
- **Sections:** Phân chia form thành các nhóm trường
- **Related Lists:** Hiển thị bản ghi liên quan ở cuối form
- **Context menu:** Click chuột phải vào label trường → xem dictionary, configure...
- **Activity Stream:** Timeline Work notes + Additional comments
- **Templates:** Điền sẵn giá trị trường khi tạo bản ghi mới

### 1.4 Tags & Bookmarks

- **Tags:** Nhãn tùy chỉnh gán cho bản ghi, chỉ hiển thị cho cá nhân
- **Favorites:** Bookmark module/list/form để truy cập nhanh

---

## Domain 2: Instance Configuration (10%)

### 2.1 Branding & Theming

- **Logo:** Thay đổi logo hiển thị trên banner
- **Banner text:** Tùy chỉnh văn bản banner
- **Colors:** Đổi màu sắc giao diện
- **System Properties:** `Cấu hình qua System Properties > UI Properties`
- **Themes:** ServiceNow hỗ trợ themes cho Next Experience UI

### 2.2 User Administration

**Quản lý người dùng:**

| Thành phần | Bảng | Mô tả |
|---|---|---|
| **Users** | `sys_user` | Tất cả người dùng trong hệ thống |
| **Groups** | `sys_user_group` | Nhóm người dùng (VD: IT Support, HR) |
| **Roles** | `sys_user_role` | Vai trò quyền hạn (admin, itil, etc.) |
| **User Has Role** | `sys_user_has_role` | Bảng gán role cho user |
| **Group Has Role** | `sys_group_has_role` | Bảng gán role cho group |

**Phân cấp Role:**
```
admin (quyền cao nhất)
  └── itil (ITSM user)
      ├── incident_manager
      ├── change_manager
      └── problem_manager
  └── catalog_admin
  └── knowledge_admin
  └── approver_user
```

- **Impersonation:** Admin giả lập đăng nhập user khác để kiểm tra quyền hạn.
- **Delegation:** User ủy quyền approvals cho người khác khi vắng mặt.

### 2.3 Email Configuration

- **Inbound Email:** Nhận email → tạo/cập nhật bản ghi tự động
- **Outbound Email:** Gửi email thông báo từ hệ thống
- **Email Accounts:** Cấu hình tài khoản email (POP/IMAP/SMTP)
- **Email Properties:** System Properties → Email

### 2.4 Application Scope

- **Global scope:** Ảnh hưởng toàn bộ instance
- **Application scope:** Giới hạn trong ứng dụng cụ thể
- **Scope isolation:** Ứng dụng scoped không truy cập được dữ liệu ngoài scope (trừ khi cho phép)

---

## Domain 3: Collaboration & Task Management (20%)

### 3.1 Task Management

**Task là gì?** Bất cứ đơn vị công việc nào cần theo dõi và hoàn thành.

```
                         task (parent)
                            │
          ┌─────────┬───────┼───────┬──────────┐
          │         │       │       │          │
      incident  problem  change  sc_task   custom_task
                         _request
```

**Vòng đời Task (Task Lifecycle):**

```
  New → In Progress → On Hold → Resolved → Closed
   1        2            -1        6          7
```

**Khái niệm quan trọng:**
- **Assignment Rules:** Tự động gán task cho user/group phù hợp
- **SLA (Service Level Agreement):** Thời gian cam kết hoàn thành task
- **Approval Rules:** Quy tắc phê duyệt trước khi task được thực hiện
- **Visual Task Board (VTB):** Bảng Kanban quản lý task trực quan

### 3.2 Notifications

**Email Notifications:**
- **When to send:** Điều kiện khi nào gửi (Insert, Update, Conditions)
- **Who will receive:** Ai nhận (User/Group/Email fields)
- **What it will contain:** Nội dung email (Template + Variables)

**Notification Variables:** `${field_name}` → chèn giá trị trường vào email

```
Ví dụ template:
  Incident ${number} has been assigned to you.
  Short description: ${short_description}
  Priority: ${priority}
```

**Events:**
- Event là tín hiệu hệ thống phát ra (VD: incident.created)
- Notification phản hồi Event để gửi email

### 3.3 Reporting & Dashboards

**Reports:**
- **Types:** Bar, Pie, Line, List, Pivot Table, Single Score, Funnel, Map...
- **Data source:** Bảng + Filter conditions
- **Scheduling:** Gửi report qua email theo lịch
- **Sharing:** Chia sẻ report cho user/group

**Dashboards:**
- Trang tổng hợp chứa nhiều widgets (reports, links, custom HTML)
- **Tabs:** Phân chia dashboard thành các tab
- **Widget types:** Report, Performance Analytics, Custom

### 3.4 Visual Task Board (VTB)

- **Lanes:** Cột dọc đại diện cho trạng thái (New, In Progress, Complete)
- **Cards:** Thẻ đại diện cho bản ghi task
- **Freeform Board:** Board tự do tạo lane bằng tay
- **Data-driven Board:** Tự động tạo lane từ giá trị trường (VD: State)
- **Context menu:** Click phải card để cập nhật, gán, comment

---

## Domain 4: Database Management & Platform Security (30%)

> ⚠️ **ĐÂY LÀ DOMAIN QUAN TRỌNG NHẤT — CHIẾM 30% BÀI THI**

### 4.1 Tables & Schema

**Đã covered chi tiết trong file `ServiceNow-KhaiNiem-CoSo_VN.md`.**

Tóm tắt cần nhớ:
- Table Hierarchy: Task → Incident/Change/Problem/sc_task
- Custom tables: Kế thừa từ Task hoặc độc lập
- System tables: sys_user, sys_user_group, sys_choice, sys_dictionary
- **sys_id:** GUID 32 ký tự, ID duy nhất cho mọi bản ghi

### 4.2 Data Schema & Dictionary

- **Dictionary:** Bảng `sys_dictionary` chứa metadata tất cả trường
- **Dictionary Override:** Thay đổi thuộc tính trường trên bảng con
- **Field Types:** String, Integer, Reference, Choice, Date/Time, Boolean...
- **Display value:** Giá trị hiển thị cho người dùng (VD: tên user, không phải sys_id)

### 4.3 Access Controls (ACLs) ⭐ QUAN TRỌNG

**ACL (Access Control List)** kiểm soát ai được phép làm gì với dữ liệu.

**Các loại operation:**

| Operation | Ý nghĩa |
|---|---|
| **Create** | Tạo bản ghi mới |
| **Read** | Xem bản ghi |
| **Write** | Sửa bản ghi |
| **Delete** | Xóa bản ghi |

**Cấp độ ACL:**

```
Table level  →  incident.*       (toàn bộ bảng)
Field level  →  incident.state   (từng trường cụ thể)
Row level    →  Conditions        (điều kiện theo bản ghi)
```

**ACL Evaluation Order:**

```
1. Role Check     → User có role cần thiết?
2. Condition      → Bản ghi thỏa điều kiện?
3. Script         → Script trả về true?

→ TẤT CẢ phải true thì mới được phép.
```

**Ví dụ ACL:**

| ACL | Giải thích |
|---|---|
| `incident.* → read → role: itil` | User phải có role `itil` để xem Incident |
| `incident.state → write → role: admin` | Chỉ admin mới sửa được trường State |
| `incident.* → delete → condition: assigned_to = current user` | Chỉ xóa nếu là người được gán |

**⚠️ Câu hỏi thi thường hỏi:**
- Thứ tự đánh giá ACL (Role → Condition → Script)
- Khi nào ACL áp dụng mặc định (không cần tạo)
- Sự khác biệt Table ACL vs Field ACL
- ACL wildcard (`*`)
- `high_security` plugin

### 4.4 Import Sets & Transform Maps ⭐ QUAN TRỌNG

**Import Set** là quy trình nhập dữ liệu bên ngoài (CSV, Excel, JDBC...) vào ServiceNow.

**Quy trình:**

```
┌─────────────┐     ┌───────────────┐     ┌───────────────┐     ┌──────────────┐
│ Nguồn dữ liệu│     │ Import Set    │     │ Transform Map │     │ Bảng đích    │
│ (CSV/Excel/  │ ──→ │ Table         │ ──→ │ (Mapping)     │ ──→ │ (Target)     │
│  JDBC/LDAP)  │     │ (staging)     │     │               │     │ VD: sys_user │
└─────────────┘     └───────────────┘     └───────────────┘     └──────────────┘
                    Bảng tạm chứa         Ánh xạ cột           Bảng thật trong
                    dữ liệu thô           nguồn → đích          ServiceNow
```

**Khái niệm quan trọng:**

| Khái niệm | Mô tả |
|---|---|
| **Import Set Table** | Bảng staging (tạm) chứa dữ liệu thô |
| **Transform Map** | Quy tắc ánh xạ cột Import → cột Target |
| **Field Map** | Ánh xạ từng cột cụ thể (source → target) |
| **Coalesce** | Trường dùng để xác định bản ghi đã tồn tại (tránh trùng lặp) |
| **Transform Script** | Script chạy trong quá trình transform |
| **Data Source** | Kết nối đến nguồn dữ liệu (file, JDBC, LDAP...) |
| **Scheduled Import** | Import tự động theo lịch |

**Coalesce — khái niệm hay bị hỏi:**

```
Ví dụ: Import danh sách user từ Excel
  Coalesce field: "email"

  → Khi import, hệ thống kiểm tra:
    - Email đã tồn tại? → UPDATE bản ghi hiện có
    - Email chưa tồn tại? → INSERT bản ghi mới
```

### 4.5 CMDB (Configuration Management Database) ⭐

**CMDB** lưu trữ thông tin về tất cả Configuration Items (CIs) trong tổ chức.

**CI (Configuration Item):** Bất kỳ tài sản nào cần được quản lý — server, laptop, phần mềm, dịch vụ...

**Phân tầng bảng CMDB:**

```
                    cmdb
                     │
                  cmdb_ci
                     │
        ┌────────────┼────────────┐
        │            │            │
   cmdb_ci_      cmdb_ci_     cmdb_ci_
   computer     server        service
        │
   ┌────┼────┐
   │         │
 cmdb_ci_  cmdb_ci_
 pc_       laptop
 hardware
```

**CSDM (Common Service Data Model):**
- Framework chuẩn hóa cách tổ chức dữ liệu trong CMDB
- Gồm: Business Services, Technical Services, Application Services

**Discovery:**
- Tự động quét mạng để phát hiện và cập nhật CIs trong CMDB

---

## Domain 5: Self-Service & Automation (20%)

### 5.1 Knowledge Management

**Knowledge Base:** Thư viện bài viết giúp user tự giải quyết vấn đề.

**Vòng đời Knowledge Article:**

```
Draft → Review → Published → Retired
  │        │          │          │
  └── Tác giả viết    │     Hết hạn sử dụng
           └── Reviewer phê duyệt
                       └── User có thể xem
```

**Khái niệm cần biết:**
- **Knowledge Base:** Nhóm các bài viết (VD: IT Knowledge, HR Policies)
- **Knowledge Category:** Phân loại bài viết trong base
- **Article template:** Mẫu bài viết chuẩn
- **Feedback:** User đánh giá bài viết (helpful/not helpful)
- **Search:** Tìm kiếm bài viết từ portal hoặc nội bộ

### 5.2 Service Catalog ⭐

**Service Catalog** cho phép user đặt hàng dịch vụ và mặt hàng (giống shopping online).

**Thành phần:**

```
┌── Service Catalog ──────────────────────────────────────────┐
│                                                              │
│  ┌── Category ──────┐   ┌── Category ──────┐               │
│  │ Hardware          │   │ Software         │               │
│  │  ├─ Laptop        │   │  ├─ VPN Access   │               │
│  │  ├─ Monitor       │   │  ├─ Office 365   │               │
│  │  └─ Headset       │   │  └─ Adobe CC     │               │
│  └──────────────────┘   └──────────────────┘               │
│                                                              │
│  ┌── Catalog Items ─────────────────────────────────────┐   │
│  │  - Record Producer (tạo bản ghi từ form)             │   │
│  │  - Order Guide (đặt nhiều item cùng lúc)             │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

**Quy trình Order:**

```
User đặt hàng → Request (REQ) → Requested Item (RITM) → Catalog Task (SCTASK)
                                → Approval (nếu có)
```

**So sánh các loại Catalog Item:**

| Loại | Mục đích | Ví dụ |
|---|---|---|
| **Catalog Item** | Đặt dịch vụ/sản phẩm tiêu chuẩn | Yêu cầu laptop mới |
| **Record Producer** | Tạo bản ghi trên bảng bất kỳ thông qua form | Báo cáo Incident từ portal |
| **Order Guide** | Đặt nhiều items liên quan cùng lúc | Onboarding (laptop + email + VPN) |

**Variables:**
- Trường tùy chỉnh trên form catalog item
- Types: Single-line text, Select box, Check box, Reference...
- Variable Sets: Nhóm variables tái sử dụng

### 5.3 Flow Designer ⭐

**Flow Designer** là công cụ **low-code/no-code** tự động hóa quy trình.

**Thành phần:**

| Thành phần | Vai trò | Ví dụ |
|---|---|---|
| **Trigger** | Điều kiện khởi chạy flow | Record Created, Schedule, SLA Breach |
| **Action** | Bước thực thi | Create Record, Send Email, Update Record |
| **Flow Logic** | Điều kiện nhánh | If/Else, For Each, Wait For Condition |

**Ví dụ Flow:**

```
Trigger: Incident được tạo với Priority = 1 - Critical
  │
  ├── Action 1: Gửi email cho Assignment Group Manager
  │
  ├── Flow Logic: IF Assignment Group = "Network"
  │     ├── TRUE:  Action 2: Tạo Change Request tự động
  │     └── FALSE: Action 3: Gửi notification cho IT Director
  │
  └── Action 4: Cập nhật trường "Notified" = true
```

**So sánh Flow Designer vs Workflow:**

| Tiêu chí | Flow Designer | Workflow (legacy) |
|---|---|---|
| Giao diện | Low-code, kéo-thả hiện đại | Kéo-thả cũ |
| Reusability | Actions tái sử dụng | Phải tạo lại |
| Maintenance | Dễ bảo trì | Phức tạp |
| Hướng phát triển | ✅ ServiceNow khuyến khích | Đang bị thay thế |
| Trigger types | Nhiều loại | Giới hạn hơn |

### 5.4 Virtual Agent

- **Chatbot** hỗ trợ user tự phục vụ qua cuộc hội thoại
- **Topics:** Chủ đề hội thoại (VD: "Reset Password", "Report Incident")
- **NLU (Natural Language Understanding):** Hiểu ý định người dùng

---

## Domain 6: Introduction to Development (13%)

### 6.1 UI Policies

**Đã covered chi tiết trong file `ServiceNow-BaiTap-LoiGiai_VN.md`.**

Tóm tắt:
- UI Policies kiểm soát thuộc tính trường form: **Mandatory, Visible, Read-only**
- Có **conditions** (khi nào áp dụng)
- **Reverse if false**: Đảo ngược khi điều kiện sai
- **UI Policy Actions**: Không cần code
- **UI Policy Scripts**: Execute if true / Execute if false
- Thực thi **sau** Client Scripts → ưu tiên cao hơn

### 6.2 Business Rules (Cơ bản)

- **When:** before / after / async / display
- **Operations:** Insert / Update / Delete / Query
- **Conditions:** Điều kiện khi nào rule chạy
- `current` object: Bản ghi hiện tại
- `previous` object: Bản ghi trước khi thay đổi (chỉ cho Update)
- `gs.addInfoMessage()` / `gs.addErrorMessage()`
- `current.setAbortAction(true)` — ngăn DB operation

### 6.3 Client Scripts (Cơ bản)

- **Types:** onLoad, onChange, onSubmit, onCellEdit
- **APIs:** g_form (GlideForm), g_user (GlideUser)
- Thực thi **trên browser** (client-side)

### 6.4 Data Policies vs UI Policies

| Tiêu chí | UI Policy | Data Policy |
|---|---|---|
| Thực thi trên | Client (browser) | Server (database) |
| Enforced via | Form UI | Tất cả (UI, API, Import, Web Service...) |
| Mandatory/Visible/Read-only | ✅ Cả ba | ✅ Mandatory & Read-only (không Visible) |
| Use case | Trải nghiệm UI | Bảo toàn tính toàn vẹn dữ liệu |

> **Câu hỏi hay gặp:** "Khi nào dùng Data Policy thay vì UI Policy?"
> → Khi bạn muốn enforce rule **ở mọi nơi** (không chỉ UI), VD: yêu cầu trường bắt buộc cả khi tạo bản ghi qua API.

### 6.5 Update Sets

**Đã covered chi tiết trong file `ServiceNow-KhaiNiem-CoSo_VN.md`.**

Tóm tắt cho thi:
- Update Set = gói đóng gói thay đổi cấu hình
- Chỉ track **customization**, KHÔNG track **data**
- Quy trình: Create → In Progress → Complete → Export → Import → Preview → Commit
- **Default Update Set:** Không nên dùng cho công việc thật
- Collision handling: Khi artifact đã bị sửa trên instance đích

---

## 10. Mẹo Thi & Câu Hỏi Mẫu

### Chiến lược làm bài

| Mẹo | Chi tiết |
|---|---|
| **Biết thời gian** | 90 phút / 60 câu = ~1.5 phút/câu |
| **Đọc kỹ đề** | Chú ý từ khóa: "BEST", "MOST", "FIRST", "NOT" |
| **Loại trừ** | Loại 1-2 đáp án sai rõ → tăng xác suất |
| **Flag & Move** | Không biết? Flag lại, làm câu khác trước |
| **Multiple-select** | Đề nói "select all that apply" → có thể >1 đáp án |
| **Scenario-based** | Hiểu tình huống, không chỉ định nghĩa |

### Câu hỏi mẫu & Giải thích

---

**Câu 1.** An administrator needs to ensure that the Priority field on the Incident form is mandatory. What is the BEST approach?

A) Create an onLoad Client Script
B) Create a UI Policy with an Action
C) Modify the Dictionary Entry
D) Create a Business Rule

**Đáp án: B)** — UI Policy Action cho phép đặt Mandatory mà không cần code. Đây là cách tốt nhất (best practice) vì dễ bảo trì hơn Dictionary Entry (C) và không cần code như (A).

---

**Câu 2.** What order does ServiceNow use to evaluate ACL rules?

A) Script → Condition → Role
B) Condition → Role → Script
C) Role → Condition → Script
D) Role → Script → Condition

**Đáp án: C)** — ACL được đánh giá theo thứ tự: Role → Condition → Script. Tất cả phải true.

---

**Câu 3.** An organization imports user data from a CSV file weekly. They want to avoid creating duplicate records. What field property must be configured in the Transform Map?

A) Mandatory
B) Display value
C) Coalesce
D) Reference qualifier

**Đáp án: C)** — Coalesce xác định trường dùng để "khớp" bản ghi đã tồn tại (VD: email). Nếu khớp → update; nếu không → insert.

---

**Câu 4.** A user reports they cannot see a field on a form that other users can see. What could cause this? (Select all that apply)

A) An ACL restricts the field based on the user's role
B) A UI Policy hides the field based on a condition
C) The field is not on the user's form view
D) The user's browser cache is outdated

**Đáp án: A, B, C** — Tất cả 3 lý do đều hợp lệ. ACL field-level (A), UI Policy with condition (B), và form View khác (C) đều có thể khiến trường bị ẩn. Browser cache (D) không ảnh hưởng đến việc hiển thị trường.

---

**Câu 5.** Which of the following is NOT tracked by Update Sets?

A) Business Rules
B) UI Policies
C) Incident records
D) ACL rules

**Đáp án: C)** — Incident records là **data** (dữ liệu nghiệp vụ), không phải customization. Update Sets chỉ track customizations (A, B, D).

---

**Câu 6.** A developer wants to enforce that the "Description" field is mandatory when creating records through both the UI and web services. What should they use?

A) UI Policy
B) Client Script
C) Data Policy
D) Business Rule

**Đáp án: C)** — Data Policy enforce ở server level, áp dụng cho tất cả: UI, API, Web Services, Import. UI Policy (A) và Client Script (B) chỉ hoạt động trên browser.

---

**Câu 7.** In Flow Designer, what determines when a flow starts executing?

A) Action
B) Flow Logic
C) Trigger
D) Subflow

**Đáp án: C)** — Trigger xác định điều kiện khởi chạy flow (VD: Record Created, Schedule...).

---

**Câu 8.** What is the purpose of the CMDB in ServiceNow?

A) Store user login credentials
B) Track all configuration items and their relationships
C) Manage email notifications
D) Store update set data

**Đáp án: B)** — CMDB lưu trữ Configuration Items (CIs) và relationships (mối quan hệ giữa các CIs).

---

**Câu 9.** An administrator impersonates a user. What happens?

A) The admin permanently becomes that user
B) The admin can see the system as that user would, including their roles and permissions
C) The user receives a notification
D) The admin loses their admin role

**Đáp án: B)** — Impersonation cho phép admin xem hệ thống qua góc nhìn người dùng khác (bao gồm roles & permissions). Đây là công cụ kiểm tra quyền hạn.

---

**Câu 10.** In the Service Catalog, what is the difference between a Catalog Item and a Record Producer?

A) Catalog Items create tasks; Record Producers create incidents
B) Catalog Items create requests; Record Producers create records on any table
C) They are the same thing
D) Record Producers are for admins only

**Đáp án: B)** — Catalog Items tạo Request → RITM → SCTASK (quy trình đặt hàng). Record Producers tạo bản ghi trực tiếp trên bảng bất kỳ (VD: Incident, Problem...).

---

### Checklist trước ngày thi

- [ ] Hoàn thành khóa **ServiceNow Fundamentals**
- [ ] Thực hành tối thiểu **30 giờ** trên PDI
- [ ] Nắm vững **ACLs** (thứ tự đánh giá, table vs field level)
- [ ] Nắm vững **Import Sets** (staging table, transform map, coalesce)
- [ ] Hiểu rõ **Flow Designer** (trigger, action, flow logic)
- [ ] Phân biệt **UI Policy vs Data Policy vs Client Script**
- [ ] Hiểu **Service Catalog** (Catalog Item, Record Producer, Order Guide)
- [ ] Hiểu **Update Sets** (quy trình, collision, scope)
- [ ] Hiểu **CMDB** (CI, relationships, CSDM)
- [ ] Hiểu **Notification** (events, email templates, variables)
- [ ] Hiểu **Knowledge Management** (lifecycle, bases, categories)
- [ ] Làm tối thiểu **2-3 bộ đề thi thử**
- [ ] Đọc lại tài liệu các domain có trọng số cao (Domain 4: 30%)
- [ ] Kiểm tra kết nối internet ổn định (nếu thi online)
- [ ] Chuẩn bị chứng minh thư/hộ chiếu (yêu cầu khi thi)

---

> **📌 Lời khuyên cuối:**
> - **Đừng học vẹt.** Bài thi thiên về **scenario-based** — bạn cần hiểu "khi nào dùng gì" chứ không phải "định nghĩa X là gì".
> - **Thực hành > Lý thuyết.** PDI là vũ khí quan trọng nhất. Hãy tự tay tạo ACL, Import Set, Flow, Catalog Item.
> - **Domain 4 = 30%.** Đầu tư thời gian cho Database Management & Security tỷ lệ thuận với điểm thi.
> - **Không dùng brain dump.** ServiceNow cập nhật đề thi thường xuyên, brain dump cũ sẽ gây hiểu sai.
>
> **Chúc bạn thi đậu CSA! 🎉**
