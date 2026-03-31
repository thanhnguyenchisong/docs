# Bài 1: ServiceNow Fundamentals

## Mục lục
- [1. ServiceNow là gì?](#1-servicenow-là-gì)
- [2. Now Platform Architecture](#2-now-platform-architecture)
- [3. Navigation & User Interface](#3-navigation--user-interface)
- [4. Data Model & Tables](#4-data-model--tables)
- [5. Lists, Forms & Fields](#5-lists-forms--fields)
- [6. Personal Developer Instance (PDI)](#6-personal-developer-instance-pdi)
- [7. Application Scope](#7-application-scope)
- [8. System Properties](#8-system-properties)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. ServiceNow là gì?

### 1.1 Tổng quan

**ServiceNow** là một nền tảng **cloud-based** (Platform-as-a-Service — PaaS) cung cấp giải pháp tự động hóa quy trình công việc cho doanh nghiệp. Được thiết kế như một **Single System of Record**, ServiceNow kết nối con người, quy trình, và hệ thống vào một nền tảng duy nhất.

```
┌─────────────────────────────────────────────┐
│              NOW PLATFORM                   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   ITSM   │ │   ITOM   │ │   HRSD   │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │   CSM    │ │  SecOps  │ │   GRC    │    │
│  └──────────┘ └──────────┘ └──────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │        CMDB (Single Source)          │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │     Workflow Engine / Flow Designer │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │     AI / Now Assist / Analytics     │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### 1.2 Các sản phẩm chính

| Sản phẩm | Mô tả | Đối tượng |
|----------|--------|-----------|
| **ITSM** | IT Service Management — quản lý dịch vụ IT | IT Support, Service Desk |
| **ITOM** | IT Operations Management — vận hành hạ tầng | NOC, Infrastructure |
| **HRSD** | HR Service Delivery — dịch vụ HR | HR Department |
| **CSM** | Customer Service Management — chăm sóc khách hàng | Customer Support |
| **SecOps** | Security Operations — bảo mật | SOC, Security |
| **GRC** | Governance, Risk & Compliance | Compliance team |
| **App Engine** | Low-code/No-code development | Developers |
| **ITBM** | IT Business Management — portfolio | IT Leaders |

### 1.3 Tại sao ServiceNow?

**Ưu điểm:**
- ✅ **Single platform**: Tất cả trong một, giảm silo giữa các phòng ban
- ✅ **Cloud-native**: Không cần quản lý infrastructure
- ✅ **Low-code/No-code**: Tạo ứng dụng nhanh với Flow Designer, App Engine
- ✅ **AI-powered**: Now Assist, Predictive Intelligence, Virtual Agent
- ✅ **Enterprise-grade**: Security, compliance, scalability
- ✅ **Ecosystem**: Marketplace, community lớn, nhiều integration

**Nhược điểm:**
- ⚠️ Licensing cost cao
- ⚠️ Learning curve khá dốc
- ⚠️ Customization quá nhiều → khó upgrade
- ⚠️ Performance issues nếu scripting không tốt

---

## 2. Now Platform Architecture

### 2.1 Kiến trúc tổng quan

ServiceNow hoạt động trên mô hình **multi-instance architecture** (không phải multi-tenant). Mỗi khách hàng có instance riêng biệt.

```
┌──────────────────────────────────────────────┐
│                   CLIENT                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Browser  │  │ Mobile   │  │  API     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼──────────────┼──────────────┼────────┘
        │              │              │
        ▼              ▼              ▼
┌──────────────────────────────────────────────┐
│              APPLICATION SERVER               │
│  ┌──────────────────────────────────────┐    │
│  │         Glide Application Engine      │    │
│  ├──────────────────────────────────────┤    │
│  │  ACL Engine │ Workflow │ Scripting   │    │
│  ├──────────────────────────────────────┤    │
│  │     Form Engine  │  List Engine      │    │
│  └──────────────────────────────────────┘    │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│              DATABASE (MariaDB/MySQL)         │
│  ┌──────────────────────────────────────┐    │
│  │   Tables │ Records │ Attachments     │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### 2.2 Instance Types

| Type | Mục đích | Ghi chú |
|------|----------|---------|
| **Production (PROD)** | Instance chính, dùng cho end-user | Không sửa trực tiếp |
| **Development (DEV)** | Phát triển, testing | Nơi làm việc chính |
| **Test (TEST/QA)** | User Acceptance Testing | Clone từ PROD |
| **Staging** | Pre-production testing | Trước khi lên PROD |
| **PDI** | Personal Developer Instance (miễn phí) | Học và thực hành |

### 2.3 Instance Strategy

```
DEV → TEST → STAGING → PROD
 │       │       │        │
 │       │       │        └── End users
 │       │       └── UAT, Performance test
 │       └── QA testing
 └── Development, Unit test
 
 Update Sets: DEV ──export──> TEST ──export──> PROD
```

---

## 3. Navigation & User Interface

### 3.1 Next Experience UI (Polaris)

ServiceNow đã chuyển từ UI16 sang **Next Experience (Polaris)** — giao diện hiện đại, responsive.

**Các thành phần chính:**

| Thành phần | Mô tả |
|------------|--------|
| **All menu** | Menu chính (hamburger) — tìm kiếm module |
| **Favorites** | ⭐ Đánh dấu module/page thường dùng |
| **History** | 🕐 Lịch sử các trang đã truy cập |
| **Filter Navigator** | Tìm kiếm module bằng text (gõ tên module) |
| **Content Frame** | Khu vực chính hiển thị forms, lists, dashboards |
| **Banner Frame** | Thanh trên cùng — user info, notifications |
| **Contextual Sidebar** | Panel bên phải — activity, related records |

### 3.2 Filter Navigator — Tìm module nhanh

```
Gõ vào Filter Navigator:

incident          → Incident > All, Incident > Create New
sys_user           → User Administration > Users
sys_properties     → System Properties
sys_script         → System Definition > Business Rules
sys_ui_policy      → System UI > UI Policies
update_set         → System Update Sets
```

### 3.3 Keyboard Shortcuts

| Phím tắt | Hành động |
|----------|-----------|
| `Ctrl + Shift + J` | Mở JavaScript executor (admin) |
| `Ctrl + Shift + O` | Mở record bằng sys_id |
| `Ctrl + Alt + G` | Mở Impersonate user |
| `Ctrl + Shift + P` | Toggle navigation pane |

---

## 4. Data Model & Tables

### 4.1 Table Structure

Mọi thứ trong ServiceNow đều là **table** (bảng). Mỗi bảng chứa các **records** (bản ghi), mỗi record có các **fields** (trường).

```
Table: incident
├── Fields:
│   ├── number (String)         → INC0010001
│   ├── short_description (String)
│   ├── description (String)
│   ├── priority (Integer)      → 1-Critical, 2-High, 3-Moderate, 4-Low
│   ├── state (Integer)         → 1-New, 2-In Progress, 3-On Hold, 6-Resolved, 7-Closed
│   ├── assignment_group (Reference → sys_user_group)
│   ├── assigned_to (Reference → sys_user)
│   ├── caller_id (Reference → sys_user)
│   ├── cmdb_ci (Reference → cmdb_ci)
│   ├── category (String)
│   ├── subcategory (String)
│   ├── impact (Integer)        → 1-High, 2-Medium, 3-Low
│   ├── urgency (Integer)       → 1-High, 2-Medium, 3-Low
│   └── sys_id (GUID)           → Unique identifier
│
├── Records:
│   ├── INC0010001: Server down in DC1
│   ├── INC0010002: Email not working
│   └── INC0010003: VPN connection issue
```

### 4.2 Các bảng quan trọng

| Table Name | Label | Mô tả |
|------------|-------|--------|
| `sys_user` | Users | Danh sách người dùng |
| `sys_user_group` | Groups | Nhóm người dùng |
| `sys_user_role` | Roles | Vai trò |
| `incident` | Incidents | Sự cố IT |
| `problem` | Problems | Vấn đề gốc |
| `change_request` | Changes | Yêu cầu thay đổi |
| `sc_request` | Requests | Yêu cầu dịch vụ |
| `sc_req_item` | Request Items | Hạng mục yêu cầu |
| `sc_cat_item` | Catalog Items | Danh mục dịch vụ |
| `cmdb_ci` | Configuration Items | Tài sản IT (CI) |
| `kb_knowledge` | Knowledge | Bài viết Knowledge Base |
| `task` | Tasks | Bảng cha của tất cả task-based tables |
| `sys_script` | Business Rules | Script chạy server-side |
| `sys_script_client` | Client Scripts | Script chạy client-side |
| `sys_update_set` | Update Sets | Quản lý thay đổi |

### 4.3 Table Inheritance (Kế thừa bảng)

ServiceNow sử dụng **table inheritance** — các bảng con kế thừa fields từ bảng cha.

```
task (Base Table)
├── incident           → Kế thừa tất cả fields từ task + fields riêng
├── problem            → Kế thừa từ task
├── change_request     → Kế thừa từ task
├── sc_request         → Kế thừa từ task
├── sc_req_item        → Kế thừa từ task
├── sc_task            → Kế thừa từ task
└── kb_submission      → Kế thừa từ task

cmdb_ci (Base Table)
├── cmdb_ci_computer   → Kế thừa từ cmdb_ci
│   ├── cmdb_ci_server → Kế thừa từ cmdb_ci_computer
│   └── cmdb_ci_pc     → Kế thừa từ cmdb_ci_computer
├── cmdb_ci_service    → Business Service
└── cmdb_ci_app_server → Application Server
```

### 4.4 Field Types

| Type | Mô tả | Ví dụ |
|------|--------|-------|
| **String** | Chuỗi text | short_description |
| **Integer** | Số nguyên | priority (1,2,3,4) |
| **True/False** | Boolean | active |
| **Reference** | FK trỏ đến bảng khác | assigned_to → sys_user |
| **Date/Time** | Ngày giờ | opened_at |
| **Journal** | Text dài, append-only | work_notes, comments |
| **Choice** | Dropdown list | state, category |
| **Glide List** | Multi-reference | watch_list |
| **Sys ID** | GUID 32 ký tự | sys_id |
| **URL** | Đường link | company_url |

### 4.5 Dot-walking

**Dot-walking** cho phép truy cập fields của bảng liên quan qua reference field:

```javascript
// Ví dụ: Lấy tên của người được assign trong incident
var inc = new GlideRecord('incident');
inc.get('INC0010001');

// Dot-walking qua reference field "assigned_to" → bảng sys_user
var assigneeName = inc.assigned_to.name;          // "John Doe"
var assigneeEmail = inc.assigned_to.email;        // "john@company.com"
var assigneeManager = inc.assigned_to.manager.name; // Manager's name (2 levels)

// Trong List view — thêm column dot-walked
// Right-click column header → Configure → Add "assigned_to.email"
```

---

## 5. Lists, Forms & Fields

### 5.1 List View

List hiển thị nhiều records cùng lúc (tương tự bảng/grid).

**Tính năng chính:**
- **Column sorting**: Click header để sort
- **Filter**: Tạo filter conditions
- **Group by**: Gom theo field
- **Personalize list**: Thêm/bớt columns
- **Export**: Excel, CSV, PDF

**Breadcrumb filter:**
```
Incident > State = Active ^Priority = 1 - Critical
                     ↑                  ↑
              Condition 1          Condition 2 (AND)
```

### 5.2 Form View

Form hiển thị chi tiết một record duy nhất.

**Tính năng chính:**
- **Sections**: Chia form thành các section
- **Related Lists**: Danh sách bản ghi liên quan ở cuối form
- **Activity Stream**: Timeline hoạt động (comments, work notes)
- **Form Layout**: Customize bằng Form Designer

### 5.3 Form Designer vs Form Layout

| Feature | Form Designer | Form Layout |
|---------|--------------|-------------|
| Giao diện | Drag & drop visual | List-based |
| Tạo field mới | ✅ Có thể | ❌ Không |
| Di chuyển field | Drag & drop | Up/Down buttons |
| Preview | Real-time | Không |
| Khuyến nghị | ✅ Dùng cái này | Legacy |

---

## 6. Personal Developer Instance (PDI)

### 6.1 Đăng ký PDI

1. Truy cập [developer.servicenow.com](https://developer.servicenow.com)
2. Tạo tài khoản (miễn phí)
3. Click **"Request Instance"**
4. Chọn release version (recommended: latest)
5. Đợi provisioning (~5 phút)
6. Nhận URL instance: `https://devXXXXX.service-now.com`

### 6.2 Lưu ý quan trọng

⚠️ **PDI sẽ bị reclaim** nếu không sử dụng trong **10 ngày**
- Login ít nhất mỗi 10 ngày
- Data sẽ mất nếu bị reclaim
- Có thể request instance mới

### 6.3 Tài khoản mặc định

| Username | Password | Role |
|----------|----------|------|
| `admin` | (set khi tạo) | System Administrator |

---

## 7. Application Scope

### 7.1 Global vs Scoped Application

| Feature | Global Scope | Scoped Application |
|---------|-------------|-------------------|
| Truy cập | Tất cả tables/records | Chỉ trong scope |
| Namespace | `global` | `x_<vendor>_<app>` |
| Update Set | Global update set | Application update set |
| API access | Full GlideRecord | Scoped GlideRecord |
| Best practice | ⚠️ Tránh dùng | ✅ Khuyến nghị |

### 7.2 Tại sao nên dùng Scoped Application?

```
✅ Isolation    → Không ảnh hưởng đến phần khác
✅ Portability  → Dễ chuyển giữa instances
✅ Security     → Access control rõ ràng
✅ Upgradability→ Không bị conflict khi upgrade
✅ Testing      → Dễ test riêng lẻ
```

---

## 8. System Properties

### 8.1 System Properties thường dùng

```
System Properties (sys_properties)

glide.ui.list_default_rows      → Số rows mặc định trong list (20)
glide.ui.date_format            → Format ngày tháng
glide.ui.session_timeout        → Session timeout (phút)
glide.email.smtp.active         → Bật/tắt outbound email
glide.email.read.active         → Bật/tắt inbound email
glide.sys.date_format           → System date format
glide.script.strict.mode        → Bật strict mode cho scripting

# Truy cập: System Properties > All Properties
# Filter Navigator: sys_properties.list
```

---

## FAQ & Best Practices

### Q1: ServiceNow là cloud hay on-premise?
**A:** ServiceNow là **cloud-only** platform. Không có option on-premise. Mỗi customer có instance riêng trên cloud infrastructure của ServiceNow.

### Q2: ServiceNow dùng database gì?
**A:** MariaDB (fork của MySQL). Tuy nhiên, bạn không cần quản lý database — ServiceNow quản lý hoàn toàn.

### Q3: Làm sao truy cập table schema?
**A:** Trong Filter Navigator, gõ `<table_name>.config` (ví dụ: `incident.config`) hoặc vào **System Definition > Tables**.

### Q4: sys_id là gì?
**A:** Mỗi record trong ServiceNow có một **sys_id** — GUID 32 ký tự, unique trên toàn instance. Ví dụ: `6816f79cc0a8016401c5a33be04be441`.

### Q5: Sự khác biệt giữa ServiceNow và các ITSM tool khác?
**A:**

| Feature | ServiceNow | Jira Service Management | BMC Remedy |
|---------|-----------|------------------------|------------|
| Deployment | Cloud only | Cloud & On-prem | Cloud & On-prem |
| Platform | Full platform (ITSM + ITOM + HR + CSM) | Chỉ ITSM/Project | ITSM |
| Low-code | Flow Designer, App Engine | Automation rules | Digital Workplace |
| AI | Now Assist, Predictive Intelligence | AI-powered (basic) | BMC Helix |
| Market share | #1 ITSM | Popular với SMB | Legacy enterprise |

### Best Practices

1. **Luôn dùng Filter Navigator** để tìm module — nhanh hơn click menu
2. **Bookmark** các module thường dùng vào Favorites ⭐
3. **Đừng sửa PROD trực tiếp** — luôn dùng DEV → TEST → PROD
4. **Hiểu Table Inheritance** trước khi tùy chỉnh
5. **Dùng Scoped Application** thay vì Global scope
6. **PDI là bạn** — thực hành mỗi ngày

---

## Bài tập thực hành

### Bài 1: Khám phá PDI
1. Đăng ký PDI tại [developer.servicenow.com](https://developer.servicenow.com)
2. Login và navigate qua các module: Incident, Problem, Change
3. Mở `incident.list` — xem danh sách incidents
4. Tạo 1 incident mới với thông tin đầy đủ
5. Tìm và mở `sys_user.list` — xem danh sách users

### Bài 2: Table Explorer
1. Mở **System Definition > Tables**
2. Tìm bảng `incident` — xem các fields
3. Xem Table Hierarchy: incident → task (parent)
4. Tìm bảng `cmdb_ci` — xem các child tables
5. Tạo list mới: gõ `sys_user_group.list` trong Filter Navigator

### Bài 3: Customize Form
1. Mở 1 incident record
2. Right-click header bar → **Configure > Form Layout**
3. Thêm field "Business Duration" vào form
4. Tạo 1 form section mới tên "Custom Info"
5. Di chuyển fields vào section mới

### Bài 4: List Customization
1. Mở `incident.list`
2. Personalize list — thêm column "Assigned to > Email"
3. Tạo filter: State = Active AND Priority = 1
4. Group by "Assignment Group"
5. Export danh sách ra Excel

---

**Tiếp theo:** [Bài 2: Platform Administration →](./02-Platform-Administration.md)
