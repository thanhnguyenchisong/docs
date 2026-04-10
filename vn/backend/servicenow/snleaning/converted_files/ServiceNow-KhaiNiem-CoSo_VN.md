# 📘 ServiceNow — Khái Niệm Cơ Sở: Lý Thuyết & Ví Dụ Chi Tiết

> Tài liệu tham khảo dành cho Developer mới làm quen với nền tảng ServiceNow.
> Ngôn ngữ: Tiếng Việt | Phiên bản tham chiếu: Utah / Zurich

---

## Mục Lục

1. [Tables (Bảng dữ liệu)](#1-tables-bảng-dữ-liệu)
2. [Fields & Field Types (Trường và kiểu dữ liệu)](#2-fields--field-types)
3. [Dictionary Entries](#3-dictionary-entries)
4. [Reference Fields & Relationships (Trường tham chiếu & quan hệ)](#4-reference-fields--relationships)
5. [Forms vs Lists (Form và Danh sách)](#5-forms-vs-lists)
6. [Update Sets](#6-update-sets)
7. [Access Control Lists — ACLs (Bảo mật)](#7-access-control-lists--acls)
8. [User Administration (Quản trị người dùng)](#8-user-administration)
9. [Notifications & Events (Thông báo & Sự kiện)](#9-notifications--events)
10. [CMDB & Configuration Items](#10-cmdb--configuration-items)
11. [Import Sets & Transform Maps (Nhập dữ liệu)](#11-import-sets--transform-maps)
12. [Application Scope (Phạm vi ứng dụng)](#12-application-scope)
13. [SLA — Service Level Agreements](#13-sla--service-level-agreements)

---

## 1. Tables (Bảng dữ liệu)

### 1.1 Khái niệm

Trong ServiceNow, **Table** (bảng) là đơn vị lưu trữ dữ liệu cơ bản — tương đương một bảng trong cơ sở dữ liệu quan hệ (RDBMS). Mỗi bảng chứa các **cột** (fields/columns) và các **hàng** (records/rows).

ServiceNow sử dụng một cơ sở dữ liệu duy nhất (single database) và tất cả dữ liệu — từ Incident, Change Request, đến User — đều nằm trong hệ thống bảng này.

> **Điểm khác biệt:** Không giống database truyền thống, ServiceNow cho phép tạo, sửa, xóa bảng và cột trực tiếp qua giao diện web mà không cần viết SQL.

### 1.2 Hệ thống phân cấp bảng (Table Hierarchy)

ServiceNow sử dụng mô hình **kế thừa bảng** (Table Inheritance). Một bảng con (child table) kế thừa tất cả các trường từ bảng cha (parent table) và có thể thêm các trường riêng.

```
                        ┌──────────────┐
                        │     Task     │  ← Bảng cha gốc
                        │  (task)      │
                        └──────┬───────┘
               ┌───────────────┼───────────────┐
               │               │               │
        ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
        │  Incident   │ │  Change     │ │  Problem    │
        │ (incident)  │ │  Request    │ │ (problem)   │
        └─────────────┘ │(change_     │ └─────────────┘
                        │ request)    │
                        └─────────────┘
```

### 1.3 Các bảng quan trọng

#### 1.3.1 Task (`task`)

**Bảng Task** là bảng cha (parent table) cho hầu hết các bảng liên quan đến quy trình công việc trong ServiceNow. Nó định nghĩa các trường chung mà tất cả "tác vụ" đều cần.

**Các trường chính của Task:**

| Trường | Tên kỹ thuật | Kiểu | Mô tả |
|---|---|---|---|
| Number | `number` | String | Mã định danh duy nhất (VD: `INC0010001`) |
| Short description | `short_description` | String | Mô tả ngắn gọn |
| Description | `description` | String (Multi-line) | Mô tả chi tiết |
| State | `state` | Integer (Choice) | Trạng thái: New, In Progress, Closed... |
| Priority | `priority` | Integer (Choice) | Mức ưu tiên: 1-Critical → 5-Planning |
| Assigned to | `assigned_to` | Reference → sys_user | Người được gán |
| Assignment group | `assignment_group` | Reference → sys_user_group | Nhóm được gán |
| Opened by | `opened_by` | Reference → sys_user | Người tạo |
| Opened at | `opened_at` | Date/Time | Thời điểm tạo |
| Active | `active` | True/False | Bản ghi còn active? |
| sys_id | `sys_id` | GUID (32 ký tự) | ID duy nhất toàn cục |

**Ví dụ — Truy vấn tất cả task active:**

```javascript
var gr = new GlideRecord('task');
gr.addQuery('active', true);
gr.query();
gs.info('Tổng số Task active: ' + gr.getRowCount());
```

> **Lưu ý:** Khi truy vấn bảng `task`, kết quả bao gồm **tất cả** bản ghi từ bảng con (Incident, Change, Problem...) vì chúng kế thừa từ Task.

---

#### 1.3.2 Incident (`incident`)

**Bảng Incident** kế thừa từ Task và thêm các trường riêng cho quản lý sự cố IT.

**Các trường riêng của Incident (ngoài những trường kế thừa từ Task):**

| Trường | Tên kỹ thuật | Kiểu | Mô tả |
|---|---|---|---|
| Category | `category` | Choice | Danh mục: Hardware, Software, Network... |
| Subcategory | `subcategory` | Choice | Danh mục con |
| Impact | `impact` | Integer (Choice) | Mức ảnh hưởng: 1-High, 2-Medium, 3-Low |
| Urgency | `urgency` | Integer (Choice) | Mức khẩn cấp |
| Caller | `caller_id` | Reference → sys_user | Người báo cáo sự cố |
| Resolved by | `resolved_by` | Reference → sys_user | Người giải quyết |
| Resolution code | `close_code` | Choice | Mã giải quyết |
| Resolve time | `resolved_at` | Date/Time | Thời điểm giải quyết |

**Ví dụ — Tạo Incident mới bằng script:**

```javascript
var inc = new GlideRecord('incident');
inc.initialize();
inc.short_description = 'Máy in tầng 3 không hoạt động';
inc.category = 'hardware';
inc.impact = 2;        // Medium
inc.urgency = 2;       // Medium
inc.caller_id.setDisplayValue('Abel Tuter');
inc.assignment_group.setDisplayValue('Hardware');
var sysId = inc.insert();
gs.info('Incident mới: ' + inc.number + ' (sys_id: ' + sysId + ')');
```

**Chuỗi gán số tự động (Number prefix):**

| Bảng | Prefix | Ví dụ |
|---|---|---|
| Incident | INC | INC0010045 |
| Change Request | CHG | CHG0030012 |
| Problem | PRB | PRB0040003 |
| Service Catalog Task | SCTASK | SCTASK0010008 |

---

#### 1.3.3 Catalog Task (`sc_task`)

**Bảng sc_task** kế thừa từ Task và được dùng trong quy trình Service Catalog — khi người dùng đặt hàng mặt hàng hoặc dịch vụ, hệ thống tạo ra các task nhỏ để fulfillment team hoàn thành.

**Chuỗi liên quan Service Catalog:**

```
Người dùng đặt hàng
        │
        ▼
  ┌─────────────┐     ┌──────────────┐     ┌──────────────┐
  │  Request     │ ──→ │  Requested   │ ──→ │  Catalog     │
  │  (sc_request)│     │  Item        │     │  Task        │
  │  REQ0010001  │     │  (sc_req_    │     │  (sc_task)   │
  └─────────────┘     │   item)      │     │  SCTASK00100 │
                      │  RITM0010001 │     └──────────────┘
                      └──────────────┘
```

| Bảng | Prefix | Vai trò |
|---|---|---|
| `sc_request` | REQ | Đơn hàng tổng — chứa 1+ requested items |
| `sc_req_item` | RITM | Mặt hàng cụ thể trong đơn |
| `sc_task` | SCTASK | Tác vụ cần hoàn thành để fulfill mặt hàng |

**Ví dụ — Truy vấn Catalog Tasks chưa hoàn thành:**

```javascript
var gr = new GlideRecord('sc_task');
gr.addQuery('active', true);
gr.addQuery('state', '!=', 3); // Khác Closed Complete
gr.orderBy('priority');
gr.query();

while (gr.next()) {
  gs.info(gr.number + ' | ' + gr.short_description +
          ' | Priority: ' + gr.priority.getDisplayValue());
}
```

---

#### 1.3.4 Custom Tables (Bảng tùy chỉnh)

Developers có thể tạo bảng riêng cho ứng dụng. Có hai lựa chọn:

**Tùy chọn 1: Kế thừa từ Task**

Khi bảng mới là một dạng "công việc", nên kế thừa từ Task để tận dụng các trường có sẵn (State, Priority, Assigned to...).

```
Ví dụ: Bảng "NeedIt" kế thừa Task
→ Tự động có: Number, State, Priority, Assigned to, Description...
→ Chỉ cần thêm trường riêng: Request type, What needed, When needed
```

**Tùy chọn 2: Bảng độc lập**

Khi dữ liệu không phải "công việc", tạo bảng không kế thừa.

```
Ví dụ: Bảng "Note" (x_snc_createnotes_note)
→ Không kế thừa Task
→ Tự định nghĩa: Title, Description, User, Created on
```

**Quy ước đặt tên Custom Table:**

Bảng trong ứng dụng scoped có prefix tự động:

```
x_<company_code>_<app_scope>_<table_name>

Ví dụ:
  x_snc_createnotes_note      → Bảng Note trong app CreateNotes
  x_58872_needit_needit       → Bảng NeedIt trong app NeedIt
```

**Tạo Custom Table trong Studio:**

1. Mở **Studio** → Click **Create Application File**
2. Chọn **Data Model > Table**
3. Cấu hình:
   - **Label:** Note
   - **Name:** (tự động điền với prefix scope)
   - **Extends table:** -- None -- (hoặc chọn Task nếu muốn kế thừa)
   - **Auto-number prefix:** NOTE
4. Click **Submit**

**Ví dụ script tạo bản ghi trên custom table:**

```javascript
var note = new GlideRecord('x_snc_createnotes_note');
note.initialize();
note.u_title = 'Ghi chú họp sprint';
note.u_description = 'Các task cần hoàn thành trong sprint này...';
note.u_user = gs.getUserID();
note.insert();
```

---

### 1.4 Bảng hệ thống quan trọng

Ngoài bảng nghiệp vụ, ServiceNow có các bảng hệ thống cốt lõi:

| Bảng | Tên kỹ thuật | Mô tả |
|---|---|---|
| Users | `sys_user` | Tất cả người dùng |
| Groups | `sys_user_group` | Các nhóm người dùng |
| Roles | `sys_user_role` | Các vai trò |
| User Has Role | `sys_user_has_role` | Gán vai trò cho người dùng |
| Tables | `sys_db_object` | Metadata tất cả bảng |
| Dictionary | `sys_dictionary` | Định nghĩa tất cả trường |
| Choice | `sys_choice` | Giá trị danh sách lựa chọn |
| Update Sets | `sys_update_set` | Tập hợp thay đổi cấu hình |
| Attachments | `sys_attachment` | File đính kèm |
| Audit | `sys_audit` | Lịch sử thay đổi |

---

## 2. Fields & Field Types

### 2.1 Khái niệm

Mỗi **Field** (trường) là một cột trong bảng. Mỗi trường có:
- **Label**: Tên hiển thị trên giao diện (VD: "Short description")
- **Name**: Tên kỹ thuật dùng trong script (VD: `short_description`)
- **Type**: Kiểu dữ liệu quy định dữ liệu được lưu trữ

> **Quy tắc quan trọng:**
> - **Label** = Title Case, hiển thị trên form
> - **Name** = snake_case, dùng trong code
> - Custom fields có prefix `u_` (VD: `u_requested_for`)

### 2.2 Tìm Name và Label của trường

**Cách nhanh nhất:** Trên form, nhấp chuột phải vào Label của trường:

```
┌──────────────────────────────────────────────┐
│  Short description ▸  (click phải vào đây)   │
│  ┌──────────────────────────────────────┐    │
│  │ Máy in tầng 3 không hoạt động       │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Menu hiện ra sẽ hiển thị:                    │
│    → Label: "Short description"              │
│    → Name:  "short_description"              │
└──────────────────────────────────────────────┘
```

### 2.3 Các kiểu trường phổ biến

#### Nhóm Text (Văn bản)

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| **String** | Chuỗi ký tự, mặc định max 40 ký tự | Short description, Name |
| **String (Full UTF-8)** | Chuỗi hỗ trợ Unicode đầy đủ | Nội dung đa ngôn ngữ |
| **Multi-line Text** | Chuỗi nhiều dòng, max 4000 ký tự | Description, Work notes |
| **Journal** | Văn bản nhiều dòng, append-only (chỉ thêm) | Additional comments |
| **Journal Input** | Trường nhập journal (UI hiển thị lịch sử) | Work notes |
| **HTML** | Nội dung HTML | Email body, KB articles |
| **URL** | Đường dẫn web | Website link |
| **Email** | Địa chỉ email | Contact email |
| **Phone Number** | Số điện thoại (có định dạng) | Business phone |
| **IP Address** | Địa chỉ IP | Server IP |

#### Nhóm Number (Số)

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| **Integer** | Số nguyên | Priority (1,2,3), Count |
| **Long** | Số nguyên lớn | Large counters |
| **Decimal** | Số thập phân | Cost, price |
| **Float** | Số thực dấu phẩy động | Percentages |
| **Currency** | Tiền tệ (có format) | Item price |
| **Percent Complete** | Phần trăm (0-100) + progress bar | Task completion |

#### Nhóm Date/Time (Ngày giờ)

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| **Date/Time** | Ngày + giờ đầy đủ | Opened at, Resolved at |
| **Date** | Chỉ ngày (không có giờ) | Due date |
| **Time** | Chỉ giờ (không có ngày) | Start time |
| **Duration** | Khoảng thời gian (days hh:mm:ss) | Business duration |
| **Due Date** | Ngày đến hạn (có cảnh báo) | Task due date |

#### Nhóm Selection (Lựa chọn)

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| **Choice** | Dropdown chọn 1 giá trị | State, Priority, Category |
| **True/False** | Checkbox boolean | Active, Mandatory |
| **Reference** | Tham chiếu đến bản ghi bảng khác | Assigned to → sys_user |
| **List** | Chọn nhiều giá trị (danh sách) | Watch list |
| **Lookup Select Box** | Reference với giao diện dropdown | Small reference tables |

#### Nhóm khác

| Kiểu | Mô tả | Ví dụ |
|---|---|---|
| **Image** | Hình ảnh | Company logo |
| **Conditions** | Biểu thức điều kiện | Filter conditions |
| **Script** | Code JavaScript | Business Rule script |
| **sys_id (GUID)** | ID hệ thống 32 ký tự | Mọi bản ghi đều có |
| **Document ID** | Tham chiếu đến bảng bất kỳ | Task reference |

### 2.4 Ví dụ — Tạo trường mới trên form

**Tình huống:** Thêm trường "Requested for email" kiểu String vào bảng NeedIt.

**Cách 1: Qua Form Designer**

1. Mở **Studio** → Application Explorer → **Forms & UI > Forms > NeedIt [Default view]**
2. Trong **Field Navigator** → tab **Field Types**
3. Kéo **String** vào form, thả giữa "Requested for" và "When needed"
4. Hover trường mới → click **Edit Properties** (⚙️)
5. Cấu hình:
   - Label: `Requested for email`
   - Name: `u_requested_for_email` (tự động thêm prefix `u_`)
   - Max length: `40`
   - Mandatory: ✅
6. Click Save

**Cách 2: Qua bảng sys_dictionary (nâng cao)**

Điều hướng đến **System Definition > Dictionary** và tạo bản ghi mới:
- Table: NeedIt
- Column label: Requested for email
- Column name: u_requested_for_email
- Type: String
- Max length: 40

### 2.5 Trường hệ thống (System Fields)

Mọi bảng trong ServiceNow đều tự động có các trường hệ thống sau:

| Trường | Name | Mô tả |
|---|---|---|
| Sys ID | `sys_id` | GUID duy nhất 32 ký tự, không bao giờ thay đổi |
| Created | `sys_created_on` | Thời điểm bản ghi được tạo |
| Created by | `sys_created_by` | Ai tạo bản ghi |
| Updated | `sys_updated_on` | Thời điểm cập nhật cuối |
| Updated by | `sys_updated_by` | Ai cập nhật cuối |
| Updates | `sys_mod_count` | Số lần bản ghi được cập nhật |
| Domain | `sys_domain` | Domain separation (enterprise) |

**Ví dụ — Truy cập system fields:**

```javascript
var gr = new GlideRecord('incident');
gr.get('sys_id', 'a1b2c3d4e5f6...'); // Lấy bản ghi theo sys_id

gs.info('Tạo bởi: ' + gr.sys_created_by);
gs.info('Ngày tạo: ' + gr.sys_created_on);
gs.info('Cập nhật lần cuối: ' + gr.sys_updated_on);
gs.info('Số lần cập nhật: ' + gr.sys_mod_count);
```

---

## 3. Dictionary Entries

### 3.1 Khái niệm

**Dictionary** (bảng `sys_dictionary`) là "sổ từ điển" chứa metadata về **mọi trường** trong **mọi bảng** của ServiceNow. Mỗi bản ghi Dictionary Entry mô tả một trường: tên, kiểu dữ liệu, độ dài, giá trị mặc định, v.v.

Bạn có thể coi Dictionary là **"bản thiết kế" (schema)** của cơ sở dữ liệu ServiceNow.

### 3.2 Cấu trúc Dictionary Entry

Mỗi Dictionary Entry chứa các thông tin sau:

| Thuộc tính | Mô tả | Ví dụ |
|---|---|---|
| **Table** | Bảng chứa trường này | incident |
| **Column label** | Label hiển thị trên UI | Short description |
| **Column name** | Tên kỹ thuật | short_description |
| **Type** | Kiểu dữ liệu | String |
| **Max length** | Độ dài tối đa (cho String) | 160 |
| **Default value** | Giá trị mặc định | (trống) |
| **Active** | Trường có đang hoạt động | true |
| **Read only** | Chỉ đọc hay không | false |
| **Mandatory** | Bắt buộc hay không | false |
| **Display** | Có phải trường hiển thị (display value) | true/false |
| **Reference** | Bảng tham chiếu (nếu kiểu Reference) | sys_user |
| **Dependent** | Trường phụ thuộc | Subcategory phụ thuộc Category |
| **Calculation** | Công thức tính toán | Priority = f(Impact, Urgency) |
| **Reference qual** | Điều kiện lọc reference | active=true |

### 3.3 Truy cập Dictionary

**Cách 1: Từ form — Click phải vào Label trường**

1. Mở bất kỳ form nào (VD: Incident form)
2. Click chuột phải vào label "Short description"
3. Chọn **Configure Dictionary**
4. → Mở Dictionary Entry cho trường `short_description` trên bảng `incident`

**Cách 2: Từ Navigation**

Điều hướng: **System Definition > Dictionary**

**Cách 3: Bằng script**

```javascript
// Truy vấn Dictionary để tìm tất cả trường bắt buộc trên bảng Incident
var dict = new GlideRecord('sys_dictionary');
dict.addQuery('name', 'incident');         // Bảng = incident
dict.addQuery('mandatory', true);          // Chỉ trường bắt buộc
dict.query();

while (dict.next()) {
  gs.info('Trường bắt buộc: ' + dict.column_label +
          ' (' + dict.element + ') - Kiểu: ' + dict.internal_type);
}
```

### 3.4 Dictionary Overrides

Khi bảng con kế thừa trường từ bảng cha, Dictionary Override cho phép thay đổi thuộc tính của trường đó **chỉ trên bảng con**.

**Ví dụ thực tế:**

```
Bảng Task:     Trường "Priority" → Mandatory: false
Bảng Incident: Trường "Priority" → Mandatory: true  ← Dictionary Override
```

Incident kế thừa trường Priority từ Task, nhưng sử dụng Override để đặt nó thành bắt buộc **chỉ trên form Incident** mà không ảnh hưởng bảng Task hoặc bảng con khác.

**Tạo Dictionary Override:**
1. Điều hướng: **System Definition > Dictionary Overrides**
2. Click **New**
3. Cấu hình:
   - Base table: `task`
   - Table: `incident`
   - Element: `priority`
   - Mandatory: ✅ true
4. **Save**

### 3.5 Ví dụ nâng cao — Tạo trường calculated

**Tình huống:** Tạo trường "Full Name" tự động nối First name + Last name trên bảng sys_user.

Trong Dictionary Entry:
- Column label: Full Name
- Column name: u_full_name
- Type: String
- **Calculation:** ✅ Checked

```javascript
// Script trong trường Calculated value (Dictionary)
(function calculatedFieldValue(current) {
  return current.first_name + ' ' + current.last_name;
})(current);
```

---

## 4. Reference Fields & Relationships

### 4.1 Reference Field là gì?

**Reference Field** là trường kiểu "Reference" tạo mối quan hệ giữa hai bảng. Trường này lưu trữ `sys_id` của bản ghi ở bảng được tham chiếu.

Trên giao diện, Reference Field hiển thị **display value** (giá trị hiển thị) thay vì sys_id thô.

```
┌─ Bảng Incident ─────────────────────┐      ┌─ Bảng sys_user ──────────────┐
│                                      │      │                              │
│  Number: INC0010045                  │      │  sys_id: a1b2c3d4e5...       │
│  Assigned to: [Fred Luddy    🔍]  ──────→   │  Name: Fred Luddy            │
│               ↑                      │      │  Email: fred@example.com     │
│               Hiển thị: "Fred Luddy" │      │  Department: Engineering     │
│               Lưu trữ: sys_id       │      └──────────────────────────────┘
└──────────────────────────────────────┘
```

### 4.2 Display Value vs Actual Value

| Khái niệm | Mô tả | Ví dụ |
|---|---|---|
| **Actual Value** | Giá trị thực sự lưu trong DB (sys_id) | `6816f79cc0a8016401c5a33be04be441` |
| **Display Value** | Giá trị hiển thị cho người dùng | `Fred Luddy` |

**Trong script:**

```javascript
var gr = new GlideRecord('incident');
gr.get('number', 'INC0010045');

// Lấy actual value (sys_id)
var userId = gr.getValue('assigned_to');
gs.info('sys_id: ' + userId);
// → "6816f79cc0a8016401c5a33be04be441"

// Lấy display value (tên hiển thị)
var userName = gr.getDisplayValue('assigned_to');
gs.info('Tên: ' + userName);
// → "Fred Luddy"

// Truy cập trường qua dot-walking (xem phần 4.3)
var email = gr.assigned_to.email;
gs.info('Email: ' + email);
// → "fred@example.com"
```

### 4.3 Dot-Walking (Duyệt qua trường tham chiếu)

**Dot-walking** cho phép truy cập trường của bản ghi ở bảng tham chiếu bằng cách dùng dấu chấm (`.`).

```
incident.assigned_to.email
   │         │          │
   │         │          └── Trường "email" trên bảng sys_user
   │         └── Reference field "assigned_to" trỏ đến sys_user
   └── Bắt đầu từ bảng incident
```

**Ví dụ — Dot-walking nhiều cấp:**

```javascript
var gr = new GlideRecord('incident');
gr.addActiveQuery();
gr.query();

while (gr.next()) {
  // Cấp 1: Trường trực tiếp trên incident
  var number = gr.getValue('number');

  // Cấp 2: Qua reference field assigned_to → sys_user
  var assignee = gr.assigned_to.getDisplayValue();
  var email = gr.assigned_to.email;

  // Cấp 3: Qua assigned_to → department → name
  var dept = gr.assigned_to.department.getDisplayValue();

  // Cấp 2: Qua reference field assignment_group → sys_user_group
  var groupName = gr.assignment_group.getDisplayValue();
  var groupManager = gr.assignment_group.manager.getDisplayValue();

  gs.info(number + ' | ' + assignee + ' | ' + email +
          ' | Phòng: ' + dept + ' | Nhóm: ' + groupName);
}
```

> **⚠️ Lưu ý hiệu suất:** Dot-walking qua nhiều cấp tạo thêm truy vấn database. Hạn chế dot-walking > 3 cấp. Trên **client-side**, dot-walking **không khả dụng** — phải dùng GlideAjax hoặc `g_form.getReference()`.

### 4.4 Các loại quan hệ bảng

#### 4.4.1 One-to-Many (1:N)

Quan hệ phổ biến nhất. Một bản ghi ở bảng A liên kết với nhiều bản ghi ở bảng B.

```
┌── sys_user_group ──┐         ┌── incident (nhiều) ────────┐
│                    │         │                             │
│  Database Team     │ ──1:N─→ │  INC001: assigned to DB     │
│  (1 nhóm)          │         │  INC002: assigned to DB     │
│                    │         │  INC003: assigned to DB     │
└────────────────────┘         └─────────────────────────────┘
```

Được hiện thực bằng **Reference field** trên bảng có N bản ghi (incident.assignment_group → sys_user_group).

#### 4.4.2 Many-to-Many (M:N)

Một bản ghi ở bảng A liên kết với nhiều bản ghi ở bảng B, và ngược lại.

```
┌── sys_user ────┐              ┌── sys_user_group ──┐
│                │              │                    │
│  Fred Luddy    │ ──M:N──→     │  Database Team     │
│  Beth Anglin   │              │  Network Team      │
│  Abel Tuter    │              │  Hardware Team     │
└────────────────┘              └────────────────────┘

Fred thuộc: Database, Network
Beth thuộc: Network, Hardware
Abel thuộc: Database, Hardware
```

Được hiện thực bằng **bảng trung gian** `sys_user_grmember`:

| User | Group |
|---|---|
| Fred | Database |
| Fred | Network |
| Beth | Network |
| Beth | Hardware |

#### 4.4.3 Table Inheritance (Kế thừa)

Đã đề cập ở Phần 1.2. Bảng con kế thừa tất cả trường từ bảng cha.

```javascript
// Kiểm tra bảng cha của incident
var td = new GlideRecord('sys_db_object');
td.addQuery('name', 'incident');
td.query();
if (td.next()) {
  gs.info('Bảng cha của incident: ' + td.super_class.name);
  // → "task"
}
```

### 4.5 Related Lists (Danh sách liên quan)

Related Lists hiển thị các bản ghi từ bảng khác có tham chiếu đến bản ghi hiện tại.

**Ví dụ:** Trên form Incident, Related Lists có thể bao gồm:
- **Activities** — Lịch sử hoạt động
- **Affected CIs** — Configuration Items bị ảnh hưởng
- **Child Incidents** — Incident con
- **Attachments** — File đính kèm

**Cấu hình Related Lists:**
1. Click chuột phải vào header form
2. Chọn **Configure > Related Lists**
3. Thêm/bớt related lists cần thiết
4. Save

### 4.6 Reference Qualifier

**Reference Qualifier** lọc bản ghi hiển thị trong lookup của Reference field.

**Ví dụ:** Trường `Assigned to` trên Incident chỉ hiển thị user active:

```
Reference qualifier (simple): active=true
```

**Nâng cao — Dynamic Reference Qualifier:**

```javascript
// Chỉ hiển thị user thuộc cùng assignment_group
javascript: 'sys_idIN' +
  new GlideRecord('sys_user_grmember')
    .addQuery('group', current.assignment_group)
    .query() + '';
```

---

## 5. Forms vs Lists

### 5.1 Forms (Biểu mẫu)

**Form** hiển thị chi tiết **một bản ghi** để xem, tạo, hoặc chỉnh sửa.

```
┌─────────────────────────────────────────────────────────┐
│  Incident: INC0010045                          [Update] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Number:            INC0010045                          │
│  Caller:            [Abel Tuter        🔍]              │
│  Category:          [Hardware          ▼]              │
│  Short description: Máy in tầng 3 không hoạt động       │
│  ─────────────────────────────────────────              │
│  State:             [In Progress       ▼]              │
│  Priority:          [2 - High          ▼]              │
│  Assigned to:       [Fred Luddy        🔍]              │
│  Assignment group:  [Hardware          🔍]              │
│  ─────────────────────────────────────────              │
│  Description:                                           │
│  ┌───────────────────────────────────────┐              │
│  │ Máy in HP LaserJet tầng 3 khu vực A  │              │
│  │ không in được, đèn báo lỗi đỏ.       │              │
│  └───────────────────────────────────────┘              │
│                                                         │
│  ═══════ Related Lists ════════════════════             │
│  📝 Activities (3)    📎 Attachments (1)                │
└─────────────────────────────────────────────────────────┘
```

**Thành phần chính của Form:**
- **Header**: Number, nút Save/Update/Submit
- **Sections**: Nhóm trường theo logic (Details, Additional Info...)
- **Fields**: Các trường dữ liệu
- **Related Lists**: Bản ghi liên quan ở cuối form
- **Activity stream**: Timeline hoạt động (Work notes, Comments)

**Form Views:**

Mỗi form có thể có nhiều **Views** — bố cục trường khác nhau cho mục đích khác nhau.

| View | Mục đích |
|---|---|
| Default | Bố cục chuẩn cho mọi người |
| Self-service | Bố cục đơn giản cho end-user |
| ITIL | Bố cục chi tiết cho ITIL users |
| Mobile | Bố cục cho thiết bị di động |

**Tùy chỉnh Form Layout:**

1. Click chuột phải vào header form → **Configure > Form Layout**
2. Hoặc mở **Form Designer** trong Studio

### 5.2 Lists (Danh sách)

**List** hiển thị **nhiều bản ghi** ở dạng bảng, cho phép xem nhanh, lọc, sắp xếp, và thao tác hàng loạt.

```
┌─────────────────────────────────────────────────────────────┐
│  Incidents - Active                          [New] [Filter] │
├────┬────────────┬──────────────────┬──────────┬─────────────┤
│ ☐  │ Number     │ Short desc       │ Priority │ Assigned to │
├────┼────────────┼──────────────────┼──────────┼─────────────┤
│ ☐  │ INC0010045 │ Máy in tầng 3... │ 2-High   │ Fred Luddy  │
│ ☐  │ INC0010044 │ VPN không kết... │ 3-Mod    │ Beth Anglin │
│ ☐  │ INC0010043 │ Email chậm...    │ 4-Low    │ Abel Tuter  │
│ ☐  │ INC0010042 │ SAP lỗi đăng...  │ 1-Crit   │ Fred Luddy  │
├────┴────────────┴──────────────────┴──────────┴─────────────┤
│  1-4 of 4                         ◀ ▶    Actions on rows ▼  │
└─────────────────────────────────────────────────────────────┘
```

**Tính năng List:**

| Tính năng | Mô tả |
|---|---|
| **Column sort** | Click header cột để sắp xếp |
| **Column filter** | Click ▼ ở header cột để lọc |
| **Breadcrumbs** | Hiển thị điều kiện lọc hiện tại |
| **List editing** | Double-click ô để chỉnh sửa tại chỗ |
| **Row selection** | Checkbox để chọn nhiều bản ghi |
| **Actions** | Thao tác hàng loạt (Update, Delete, Export...) |
| **Personalize** | Tùy chỉnh cột hiển thị cho cá nhân |
| **Group by** | Nhóm bản ghi theo trường |
| **Export** | Xuất Excel, CSV, PDF |

**Tùy chỉnh List Layout:**

1. Click chuột phải vào header cột → **Configure > List Layout**
2. Thêm/bớt/sắp xếp cột

### 5.3 So sánh Form vs List

| Đặc điểm | Form | List |
|---|---|---|
| Hiển thị | 1 bản ghi chi tiết | Nhiều bản ghi dạng bảng |
| Tương tác | Xem/Tạo/Sửa/Xóa 1 bản ghi | Xem/Lọc/Sắp xếp/Thao tác hàng loạt |
| URL | `/<table>.do?sys_id=<id>` | `/<table>_list.do` |
| Client Scripts | onLoad, onChange, onSubmit | onCellEdit (Client Script type) |
| UI Policies | ✅ Hoạt động | ❌ Không áp dụng |
| Related Lists | ✅ Hiển thị ở cuối form | ❌ Không có |

### 5.4 Filter & Breadcrumbs

**Tạo filter trên List:**

1. Click biểu tượng **Filter** (🔍) → mở **Filter Builder**
2. Xây điều kiện, VD: `[Active] [is] [true] AND [Priority] [is] [1 - Critical]`
3. Click **Run**

**Encoded Query:**

Mỗi filter tạo ra một **encoded query** — chuỗi mã hóa điều kiện, dùng được trong script.

```
active=true^priority=1^assignment_group.name=Database
  ↑           ↑                    ↑
 AND         AND            Dot-walking trong query
```

**Lấy Encoded Query:** Click chuột phải vào breadcrumbs → **Copy query**

**Sử dụng trong script:**

```javascript
var gr = new GlideRecord('incident');
gr.addEncodedQuery('active=true^priority=1^assignment_group.name=Database');
gr.query();

gs.info('Số Incident P1 active nhóm Database: ' + gr.getRowCount());
```

---

## 6. Update Sets

### 6.1 Khái niệm

**Update Set** là cơ chế trong ServiceNow để **theo dõi và đóng gói các thay đổi cấu hình** (customizations) giữa các môi trường (instance).

Hãy tưởng tượng Update Set như một **"hộp chứa"** — tất cả thay đổi bạn thực hiện (tạo Business Rule, sửa UI Policy, thêm trường...) được tự động ghi lại vào Update Set đang active.

```
┌── Development Instance ──┐      ┌── Test Instance ──────┐     ┌── Production ──────┐
│                          │      │                       │     │                    │
│  Update Set:             │      │  Import               │     │  Import            │
│  "Sprint 5 Changes"     │ ───→ │  & Preview             │ ──→ │  & Commit          │
│                          │      │  & Commit              │     │                    │
│  Chứa:                  │      │                       │     │                    │
│  - Business Rule mới    │      │  Kiểm thử → OK        │     │  Đưa ra production │
│  - UI Policy sửa        │      │                       │     │                    │
│  - Trường mới            │      │                       │     │                    │
└──────────────────────────┘      └───────────────────────┘     └────────────────────┘
```

### 6.2 Loại thay đổi & Update Sets

| Loại thay đổi | Tracked bởi Update Set? | Ví dụ |
|---|---|---|
| **Customization** (cấu hình) | ✅ Có | Business Rule, UI Policy, Script Include, Form layout, ACL |
| **Data** (dữ liệu) | ❌ Không | Incident records, User records, CMDB data |

> **Quy tắc vàng:** Update Sets chỉ theo dõi **thay đổi cấu hình hệ thống**, không theo dõi **dữ liệu nghiệp vụ**.

### 6.3 Trạng thái Update Set

```
  ┌───────────┐     ┌──────────────┐     ┌───────────┐
  │  In       │ ──→ │  Complete    │ ──→ │ Exported/ │
  │  Progress │     │              │     │ Retrieved │
  └───────────┘     └──────────────┘     └───────────┘
       ↑                                       │
       │              (trên instance đích)     │
       │                                       ▼
       │            ┌──────────────┐     ┌───────────┐
       └────────── │  Previewed   │ ←── │ Retrieved │
                    │  (kiểm tra)  │     └───────────┘
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Committed   │ ← Đã áp dụng thay đổi
                    └──────────────┘
```

| Trạng thái | Mô tả |
|---|---|
| **In Progress** | Đang active, mọi thay đổi ghi vào đây |
| **Complete** | Hoàn tất, sẵn sàng export |
| **Exported / Retrieved** | Đã chuyển đến instance khác |
| **Previewed** | Đã xem trước trên instance đích |
| **Committed** | Đã áp dụng thay đổi trên instance đích |

### 6.4 Quy trình làm việc với Update Sets

#### Bước 1: Tạo Update Set mới

1. Điều hướng: **System Update Sets > Local Update Sets**
2. Click **New**
3. Cấu hình:
   - **Name:** Sprint 5 - NeedIt Client Scripts
   - **Description:** Các thay đổi Client-side Scripting cho ứng dụng NeedIt
   - **Application:** NeedIt (hoặc Global)
4. Click **Submit**

#### Bước 2: Chọn Update Set active

1. Trong **System Update Set** picker ở header ServiceNow, click tên Update Set hiện tại
2. Chọn Update Set "Sprint 5 - NeedIt Client Scripts"

> **Từ giờ, mọi thay đổi cấu hình đều được ghi vào Update Set này.**

#### Bước 3: Thực hiện thay đổi

Tạo Business Rule, UI Policy, Script Include... như bình thường. ServiceNow tự động ghi lại.

#### Bước 4: Xem nội dung Update Set

1. Mở Update Set
2. Xem **Update Set Preview** (Related list) — danh sách tất cả thay đổi
3. Mỗi bản ghi Customer Update chứa:
   - **Name:** Tên artifact (VD: "Business Rule: NeedIt Date Validation")
   - **Type:** Loại (sys_script, sys_ui_policy...)
   - **Action:** INSERT / UPDATE / DELETE
   - **Target name:** Tên kỹ thuật

**Ví dụ — Xem Update Set bằng script:**

```javascript
// Liệt kê tất cả updates trong Update Set hiện tại
var us = new GlideRecord('sys_update_xml');
us.addQuery('update_set', gs.getPreference('sys_update_set'));
us.query();

gs.info('=== Nội dung Update Set ===');
while (us.next()) {
  gs.info(us.action + ' | ' + us.type + ' | ' + us.name);
}
gs.info('Tổng: ' + us.getRowCount() + ' thay đổi');
```

#### Bước 5: Đóng Update Set

1. Mở Update Set
2. Đổi **State** thành **Complete**
3. Click **Update**

#### Bước 6: Di chuyển đến instance khác

**Trên instance nguồn (Development):**
1. Mở Update Set đã Complete
2. Click **Export to XML** → tải file XML

**Trên instance đích (Test/Production):**
1. Điều hướng: **System Update Sets > Retrieved Update Sets**
2. Click **Import Update Set from XML**
3. Tải lên file XML
4. Click **Preview** — kiểm tra xung đột
5. Nếu OK, click **Commit** — áp dụng thay đổi

### 6.5 Xử lý xung đột (Conflicts)

Khi Preview, ServiceNow phát hiện xung đột nếu:
- Artifact đã bị sửa trên instance đích (khác bản gốc)
- Artifact không tồn tại trên instance đích
- Dependency thiếu (bảng/trường cần thiết chưa có)

**Các loại xung đột:**

| Loại | Mô tả | Hành động |
|---|---|---|
| **Collision** | Artifact đã được sửa ở cả 2 nơi | Chọn: Skip hoặc Accept (ghi đè) |
| **Data Loss** | Ghi đè sẽ mất dữ liệu | Xem xét kỹ trước khi Accept |
| **Missing Dependency** | Cần artifact khác chưa có | Import dependency trước |

### 6.6 Best Practices

| Thực hành | Mô tả |
|---|---|
| **Một Update Set = một feature** | Không trộn nhiều feature vào cùng Update Set |
| **Đặt tên có ý nghĩa** | VD: `Sprint5_NeedIt_ClientScripts_v1` |
| **Kiểm tra trước khi Complete** | Xem lại danh sách updates, xóa thay đổi thử nghiệm |
| **Không bao giờ sửa Default Update Set** | Luôn tạo Update Set riêng cho công việc |
| **Preview trước Commit** | Luôn Preview trên instance đích để phát hiện xung đột |
| **Backup trước Commit** | Tạo bản sao dự phòng trước khi Commit trên Production |

### 6.7 Update Sets vs Source Control (Studio)

| Tiêu chí | Update Sets | Source Control (Studio/GitHub) |
|---|---|---|
| Đơn vị | Tập hợp thay đổi XML | Git repository |
| Theo dõi | Tự động (tất cả customizations) | Theo ứng dụng (Scoped App) |
| Versioning | Không có lịch sử phiên bản | Git history, branches, tags |
| Hợp tác | Khó (merge thủ công) | Dễ (Git merge, branch) |
| Rollback | Phải revert từng update | Git revert/reset |
| Use case | Global changes, small fixes | Ứng dụng lớn, team development |

**Khi nào dùng gì:**
- **Update Sets:** Thay đổi nhỏ trong Global scope, hotfix nhanh
- **Source Control:** Phát triển ứng dụng scoped, team nhiều người, cần versioning

---

## 7. Access Control Lists — ACLs

### 7.1 Khái niệm

**ACL (Access Control List)** là cơ chế bảo mật cốt lõi của ServiceNow, kiểm soát **ai** được phép **làm gì** với **dữ liệu nào**. ACLs bảo vệ dữ liệu ở mọi tầng: bảng, trường, và bản ghi.

> **Nguyên tắc:** Mặc định, ServiceNow **từ chối** truy cập. ACL phải **cho phép** một cách tường minh.

### 7.2 Các loại Operation

| Operation | Ý nghĩa | Ví dụ |
|---|---|---|
| **create** | Tạo bản ghi mới | User có thể tạo Incident? |
| **read** | Xem bản ghi | User có thể xem Incident? |
| **write** | Sửa bản ghi | User có thể cập nhật Incident? |
| **delete** | Xóa bản ghi | User có thể xóa Incident? |

### 7.3 Cấp độ ACL

```
Cấp Table:   incident.*              → Toàn bộ bảng Incident
Cấp Field:   incident.state          → Chỉ trường State trên Incident
Cấp Row:     Kết hợp Condition/Script → Lọc theo giá trị bản ghi cụ thể
```

**Ví dụ phân cấp:**

```
                  ┌─────────────────────┐
                  │  incident.* (read)  │  ← User phải pass ACL này trước
                  │  Role: itil         │
                  └──────────┬──────────┘
                             │
                  ┌──────────┴──────────┐
                  │  incident.state     │  ← Sau đó kiểm tra ACL cấp field
                  │  (write)            │
                  │  Role: admin        │
                  └─────────────────────┘
```

> Để **đọc** trường `state` trên Incident, user cần pass CẢ HAI: ACL table-level `incident.* read` VÀ nếu có ACL field-level `incident.state read`.

### 7.4 Thứ tự đánh giá ACL

Mỗi ACL có 3 thành phần đánh giá, kiểm tra **theo thứ tự**:

```
1. ROLE        →  User có role cần thiết?
     │ true
     ▼
2. CONDITION   →  Bản ghi thỏa điều kiện?
     │ true
     ▼
3. SCRIPT      →  Script trả về true?
     │ true
     ▼
   ✅ GRANTED     (cả 3 phải true)
```

- Nếu **bất kỳ bước nào** trả về false → **DENIED**
- Nếu ACL **để trống** một bước (VD: không có script) → bước đó mặc định **true**

### 7.5 Ví dụ ACL thực tế

**ACL 1 — Chỉ user có role `itil` mới đọc được Incident:**

| Thuộc tính | Giá trị |
|---|---|
| Type | Record |
| Operation | read |
| Name | incident.* |
| Role | itil |
| Condition | (trống) |
| Script | (trống) |

**ACL 2 — Chỉ user được gán mới sửa được Incident:**

| Thuộc tính | Giá trị |
|---|---|
| Type | Record |
| Operation | write |
| Name | incident.* |
| Role | itil |
| Condition | `assigned_to = (current user)` |

**ACL 3 — Admin mới xóa được Incident, kèm script log:**

| Thuộc tính | Giá trị |
|---|---|
| Operation | delete |
| Name | incident.* |
| Role | admin |
| Script | `gs.info('Delete attempt on ' + current.number); answer = true;` |

### 7.6 Debugging ACLs

- **System Diagnostics > Security Rules**: Kiểm tra ACL nào đang áp dụng cho session hiện tại.
- **Impersonation**: Đăng nhập giả lập user khác để kiểm tra quyền.
- **Debug Security Rules**: `System Diagnostics > Session Debug > Debug Security Rules` → bật log chi tiết.

---

## 8. User Administration

### 8.1 Users (sys_user)

Bảng `sys_user` chứa tất cả người dùng. Mỗi user có:

| Trường | Mô tả | Ví dụ |
|---|---|---|
| User ID | Tên đăng nhập | `fred.luddy` |
| First name / Last name | Họ tên | Fred / Luddy |
| Email | Địa chỉ email | fred@example.com |
| Active | Tài khoản có hoạt động | true/false |
| Department | Phòng ban | IT, HR |
| Manager | Quản lý trực tiếp | Reference → sys_user |
| Time zone | Múi giờ | Asia/Ho_Chi_Minh |
| VIP | Người dùng ưu tiên | true/false |

### 8.2 Groups (sys_user_group)

**Group** tập hợp nhiều user theo chức năng hoặc tổ chức:

```
┌── IT Support ──────────┐     ┌── Network Team ──────────┐
│  Members:              │     │  Members:                │
│  - Fred Luddy          │     │  - Beth Anglin           │
│  - Abel Tuter          │     │  - Abel Tuter            │
│  Manager: Fred Luddy   │     │  Manager: Beth Anglin    │
│  Roles: itil           │     │  Roles: itil, network    │
└────────────────────────┘     └──────────────────────────┘
```

**Bảng trung gian:** `sys_user_grmember` — lưu quan hệ User ↔ Group.

### 8.3 Roles (sys_user_role)

**Role** là tập hợp quyền hạn gán cho user hoặc group.

**Các role quan trọng:**

| Role | Mô tả |
|---|---|
| `admin` | Toàn quyền trên instance |
| `itil` | ITSM user — truy cập Incident, Change, Problem... |
| `catalog_admin` | Quản trị Service Catalog |
| `knowledge_admin` | Quản trị Knowledge Base |
| `approver_user` | Phê duyệt request/change |
| `snc_internal` | Nội bộ ServiceNow |

**Kế thừa role:**

```
Group "IT Support" có role "itil"
     │
     ▼
Tất cả thành viên của IT Support TỰ ĐỘNG có role "itil"
(không cần gán riêng cho từng user)
```

**Role "contains" role:**

```
manager_role
  ├── contains: approver_user
  └── contains: report_admin

→ User có role "manager_role" TỰ ĐỘNG có cả "approver_user" và "report_admin"
```

### 8.4 Impersonation & Delegation

**Impersonation:**
- Admin có thể **giả lập** đăng nhập người dùng khác
- Mục đích: kiểm tra quyền hạn, debug vấn đề user gặp
- Cách dùng: Click avatar → Impersonate User → chọn user

**Delegation:**
- User ủy quyền **phê duyệt** cho người khác khi vắng mặt
- Cấu hình: Self-Service → My Delegations

### 8.5 Ví dụ — Tìm tất cả user có role admin

```javascript
var gr = new GlideRecord('sys_user_has_role');
gr.addQuery('role.name', 'admin');
gr.addQuery('state', 'active');
gr.query();

while (gr.next()) {
  gs.info('Admin: ' + gr.user.getDisplayValue() +
          ' (' + gr.user.user_name + ')');
}
```

---

## 9. Notifications & Events

### 9.1 Events (Sự kiện)

**Event** là tín hiệu mà hệ thống phát ra khi điều gì đó xảy ra. Events hoạt động như **"cầu nối"** giữa hành động và phản hồi.

```
Hành động             Event                    Phản hồi
┌────────────┐     ┌───────────────┐     ┌──────────────────┐
│ Incident   │ ──→ │ incident      │ ──→ │ Send Email       │
│ được tạo   │     │ .created      │     │ Ghi log          │
└────────────┘     └───────────────┘     │ Trigger Flow     │
                                          └──────────────────┘
```

**Bảng Event Registry:** `sysevent_register` — đăng ký tất cả events.

**Ví dụ events quan trọng:**

| Event | Trigger khi |
|---|---|
| `incident.created` | Incident mới được tạo |
| `incident.assigned` | Incident được gán cho user |
| `sc_request.approved` | Request được phê duyệt |
| `sla.breached` | SLA bị vi phạm |

### 9.2 Notifications (Email Notifications)

**Notification** là email tự động gửi khi điều kiện được thỏa mãn.

**3 câu hỏi cấu hình:**

```
1. WHEN?   → Khi nào gửi? (Insert, Update, Condition)
2. WHO?    → Gửi cho ai? (Users, Groups, Email fields)
3. WHAT?   → Nội dung gì? (Subject, Body, Template)
```

**Cấu hình Notification:**

| Tab | Nội dung |
|---|---|
| **When to send** | Bảng, Insert/Update, Conditions (VD: Priority = 1) |
| **Who will receive** | Users/Groups cụ thể, hoặc trường reference trên bản ghi (VD: Assigned to) |
| **What it will contain** | Subject line, Email body template |

### 9.3 Email Template Variables

Trong nội dung email, dùng `${field_name}` để chèn giá trị trường:

```
Subject: Incident ${number} cần sự chú ý của bạn

Body:
Xin chào ${assigned_to.first_name},

Incident ${number} đã được gán cho bạn.

Mô tả: ${short_description}
Mức ưu tiên: ${priority}
Người báo cáo: ${caller_id.name}

Vui lòng xử lý trong vòng ${sla.breach_time}.

Trân trọng,
IT Service Desk
```

**Dot-walking trong template:** `${assigned_to.department.name}` → tên phòng ban người được gán.

### 9.4 Notification Preferences

Mỗi user có thể tùy chỉnh notification preferences:
- **Opt-in / Opt-out:** Bật/tắt loại notification cụ thể
- **Channel:** Email, SMS, Push notification
- **Schedule:** Chỉ nhận notification trong giờ làm việc

**Quản lý:** System Notification > Email > Notifications

### 9.5 Ví dụ — Kiểm tra notification log

```javascript
// Xem notification nào đã gửi cho 1 Incident
var gr = new GlideRecord('sys_email');
gr.addQuery('instance', 'INC0010045'); // Number hoặc sys_id
gr.orderByDesc('sys_created_on');
gr.query();

while (gr.next()) {
  gs.info('Email gửi: ' + gr.recipients + ' | Subject: ' + gr.subject +
          ' | Status: ' + gr.type);
}
```

---

## 10. CMDB & Configuration Items

### 10.1 CMDB là gì?

**CMDB (Configuration Management Database)** là cơ sở dữ liệu trung tâm lưu trữ thông tin về tất cả **tài sản IT** (Configuration Items) và **mối quan hệ** giữa chúng.

> **Mục đích:** Hiểu tác động của sự cố, lên kế hoạch thay đổi, quản lý tài sản.

### 10.2 CI (Configuration Item)

**CI** là bất kỳ tài sản nào cần được quản lý: server, laptop, phần mềm, dịch vụ, hợp đồng...

**Phân cấp bảng CMDB:**

```
                         cmdb
                          │
                       cmdb_ci ← (bảng gốc cho tất cả CIs)
                          │
        ┌─────────┬───────┼────────┬──────────────┐
        │         │       │        │              │
   cmdb_ci_   cmdb_ci_  cmdb_ci_ cmdb_ci_    cmdb_ci_
   computer   server    service  app_server   network_gear
        │
   ┌────┼────────┐
   │             │
 cmdb_ci_     cmdb_ci_
 pc_hardware  laptop
```

### 10.3 CI Relationships

CIs không tồn tại độc lập — chúng có **mối quan hệ** với nhau:

```
┌── Email Service ──────┐
│  (Business Service)   │
│                       │
│  Depends on:          │
│  ├── Exchange Server  │──→ CI: cmdb_ci_server
│  ├── Active Directory │──→ CI: cmdb_ci_app_server
│  └── Network VLAN 10  │──→ CI: cmdb_ci_network_gear
└───────────────────────┘

→ Khi Exchange Server gặp sự cố, ta biết ngay Email Service bị ảnh hưởng.
```

**Các loại relationship:**

| Loại | Ý nghĩa | Ví dụ |
|---|---|---|
| **Depends on** | CI này phụ thuộc CI kia | App depends on Database |
| **Used by** | CI này được sử dụng bởi | Server used by HR Team |
| **Runs on** | CI chạy trên CI | App runs on Server |
| **Contains** | CI chứa CI khác | Rack contains Servers |

### 10.4 CSDM (Common Service Data Model)

**CSDM** là framework chuẩn hóa cách tổ chức dữ liệu trong CMDB:

```
               ┌─────────────────────┐
               │  Business Service   │  VD: Email cho toàn công ty
               └──────────┬──────────┘
                          │
               ┌──────────┴──────────┐
               │ Technical Service   │  VD: Microsoft Exchange
               └──────────┬──────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
   │ Application │ │ Server      │ │ Database    │
   │ Service     │ │             │ │             │
   └─────────────┘ └─────────────┘ └─────────────┘
```

### 10.5 Discovery

**ServiceNow Discovery** tự động quét mạng để:
- Phát hiện CIs mới
- Cập nhật thông tin CIs hiện có
- Xác định relationships
- Lên lịch quét định kỳ

### 10.6 Ví dụ — Truy vấn CMDB

```javascript
// Tìm tất cả server Linux đang active
var gr = new GlideRecord('cmdb_ci_server');
gr.addQuery('os', 'CONTAINS', 'Linux');
gr.addQuery('operational_status', 1); // Operational
gr.query();

while (gr.next()) {
  gs.info('Server: ' + gr.name +
          ' | OS: ' + gr.os +
          ' | IP: ' + gr.ip_address +
          ' | Location: ' + gr.location.getDisplayValue());
}
```

---

## 11. Import Sets & Transform Maps

### 11.1 Khái niệm

**Import Set** là quy trình nhập dữ liệu từ nguồn bên ngoài vào ServiceNow. Dữ liệu **không đi thẳng** vào bảng đích mà đi qua **bảng tạm** (staging table).

### 11.2 Quy trình Import

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  NGUỒN       │     │  IMPORT SET      │     │  TRANSFORM MAP   │     │  BẢNG ĐÍCH   │
│              │     │  TABLE           │     │                  │     │  (TARGET)    │
│  CSV         │     │  (Staging)       │     │  Ánh xạ cột     │     │              │
│  Excel       │ ──→ │                  │ ──→ │  Source → Target │ ──→ │  sys_user    │
│  JDBC        │     │  Chứa dữ liệu   │     │  + Coalesce      │     │  incident    │
│  LDAP        │     │  thô, chưa xử lý │     │  + Scripts       │     │  cmdb_ci     │
│  JSON/XML    │     │                  │     │                  │     │              │
└──────────────┘     └──────────────────┘     └──────────────────┘     └──────────────┘
```

### 11.3 Các thành phần

#### Import Set Table (Bảng staging)

- Bảng tạm tự động tạo khi import lần đầu
- Chứa dữ liệu thô từ nguồn, chưa ánh xạ
- Tên format: `u_imp_<name>` hoặc tự động

#### Transform Map

Quy tắc ánh xạ cột từ Import Set Table → Target Table:

```
Import Set Table            Transform Map              Target Table
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│ first_name      │ ──→ │ first_name → first_  │ ──→ │ first_name       │
│ last_name       │ ──→ │ last_name → last_    │ ──→ │ last_name        │
│ email_address   │ ──→ │ email_address → email│ ──→ │ email            │
│ dept_code       │ ──→ │ (Script: lookup)     │ ──→ │ department (ref) │
│ phone           │ ──→ │ phone → phone        │ ──→ │ phone            │
└─────────────────┘     └─────────────────────┘     └──────────────────┘
```

#### Coalesce Field ⭐

**Coalesce** xác định trường dùng để tìm bản ghi đã tồn tại → **tránh trùng lặp**.

```
Ví dụ: Import user, coalesce field = "email"

Dữ liệu import: { name: "Fred Luddy", email: "fred@example.com" }

→ Hệ thống kiểm tra: email "fred@example.com" đã tồn tại trong sys_user?
  ├── CÓ  → UPDATE bản ghi hiện có
  └── KHÔNG → INSERT bản ghi mới
```

> **⚠️ Nếu không set Coalesce**, mỗi lần import sẽ tạo bản ghi MỚI → dữ liệu bị trùng lặp.

### 11.4 Data Sources

| Loại | Mô tả | Ví dụ |
|---|---|---|
| **File** | Upload file trực tiếp | CSV, Excel, XML, JSON |
| **JDBC** | Kết nối database bên ngoài | Oracle, SQL Server, MySQL |
| **LDAP** | Kết nối thư mục LDAP | Active Directory |
| **Custom** | Script tùy chỉnh | REST API, FTP |

### 11.5 Scheduled Import

Tự động import dữ liệu theo lịch:
- **Daily:** Đồng bộ user từ Active Directory hàng ngày
- **Weekly:** Cập nhật CMDB từ asset management tool
- **On demand:** Import khi cần

### 11.6 Ví dụ — Import CSV vào sys_user

**File users.csv:**
```
first_name,last_name,email,department
Nguyễn,Văn A,nguyenvana@company.com,IT
Trần,Thị B,tranthib@company.com,HR
Lê,Văn C,levanc@company.com,Finance
```

**Bước thực hiện:**
1. Điều hướng: **System Import Sets > Load Data**
2. Chọn **Import Set Table**: Create new
3. **Source**: Upload file `users.csv`
4. Click **Submit** → dữ liệu vào staging table
5. Tạo **Transform Map**: ánh xạ cột
   - `first_name` → `first_name`
   - `last_name` → `last_name`
   - `email` → `email` (**Coalesce: ✅**)
   - `department` → `department` (Reference lookup)
6. Click **Transform** → dữ liệu chuyển vào `sys_user`

### 11.7 Transform Event Scripts

Chạy logic tùy chỉnh trong quá trình transform:

| Event | Khi nào chạy | Ví dụ |
|---|---|---|
| **onBefore** | Trước khi transform mỗi row | Validate dữ liệu, set giá trị mặc định |
| **onAfter** | Sau khi transform mỗi row | Gán role, gửi notification |
| **onStart** | Trước khi transform bắt đầu | Khởi tạo biến |
| **onComplete** | Sau khi transform kết thúc | Gửi report, cleanup |
| **onForeignInsert** | Khi tạo bản ghi ở bảng tham chiếu | Tạo department nếu chưa tồn tại |

```javascript
// Ví dụ Transform Script — onBefore
// Tự động tạo User ID từ email
(function runTransformScript(source, map, log, target) {
  // Lấy phần trước @ của email làm user_name
  var email = source.u_email + '';
  if (email) {
    target.user_name = email.split('@')[0];
  }
})(source, map, log, target);
```

---

## 12. Application Scope

### 12.1 Khái niệm

**Application Scope** là ranh giới logic phân tách các ứng dụng trong ServiceNow, bảo vệ dữ liệu và code khỏi sự can thiệp lẫn nhau.

### 12.2 Global Scope vs Application Scope

| Đặc điểm | Global Scope | Scoped Application |
|---|---|---|
| **Prefix bảng** | Không có prefix | `x_<company>_<app>_` |
| **Prefix trường** | `u_` | `u_` |
| **Truy cập dữ liệu** | Truy cập mọi thứ | Chỉ trong scope + được cấp quyền |
| **Quản lý code** | Ai có quyền đều sửa được | Chỉ developer trong scope |
| **Application** | Không thuộc app cụ thể | Đóng gói trong 1 ứng dụng |
| **Source Control** | Dùng Update Sets | Dùng Git qua Studio |
| **Publish** | Không thể | Có thể publish lên Store |

### 12.3 Scoped Application

**Scoped App** là ứng dụng có phạm vi riêng (scope), bao gồm:

```
┌── Scoped App: NeedIt (x_58872_needit) ──────────────┐
│                                                       │
│  📦 Tables: x_58872_needit_needit                    │
│  📝 Business Rules: NeedIt Date Validation           │
│  🖥️ Client Scripts: NeedIt Welcome Message           │
│  📋 UI Policies: NeedIt Show/Hide Other              │
│  🔧 Script Includes: NeedItUtils                     │
│  📄 Service Portal Widgets                           │
│                                                       │
│  → Tất cả nằm trong scope, được đóng gói cùng nhau  │
└───────────────────────────────────────────────────────┘
```

### 12.4 Cross-Scope Access

Khi scoped app cần truy cập dữ liệu ngoài scope:

```
┌── Scoped App: NeedIt ──┐       ┌── Global ──────────────┐
│                         │       │                        │
│  Script Include:        │ ───→  │  GlideRecord('incident')│
│  NeedItUtils            │  ❓   │                        │
│                         │       │  → Cần Cross-Scope     │
└─────────────────────────┘       │    Access Permission   │
                                   └────────────────────────┘
```

**Cấu hình Cross-Scope Access:**
- **Application Cross-Scope Access**: `System Applications > Application Cross-Scope Access`
- Admin phê duyệt hoặc từ chối yêu cầu cross-scope
- Hiển thị popup xác nhận lần đầu truy cập cross-scope

### 12.5 Chuyển đổi Scope

**Application Picker** trong banner cho phép chuyển scope:

1. Click biểu tượng **Application Scope** (🔧) trong banner
2. Chọn scope (Global hoặc Scoped App khác)
3. Mọi thay đổi cấu hình sẽ thuộc về scope đã chọn

> **⚠️ Lưu ý:** Nếu tạo Business Rule khi scope đang là "NeedIt", rule đó thuộc về NeedIt scope. Nếu quên chuyển scope, có thể tạo nhầm artifacts ở scope sai.

---

## 13. SLA — Service Level Agreements

### 13.1 Khái niệm

**SLA (Service Level Agreement)** là cam kết thời gian phục vụ giữa đội IT và khách hàng — ví dụ: "Incident Priority 1 phải được giải quyết trong 4 giờ".

ServiceNow theo dõi SLA tự động và cảnh báo khi gần hoặc đã vi phạm.

### 13.2 Thành phần SLA

```
┌── SLA Definition ──────────────────────────────────────────────┐
│                                                                 │
│  Name: P1 Resolution SLA                                        │
│  Table: Incident                                                │
│  Duration: 4 hours (thời gian cam kết)                          │
│                                                                 │
│  Start condition:   Priority = 1 AND State = New                │
│  Stop condition:    State = Resolved OR State = Closed           │
│  Pause condition:   State = On Hold (tạm dừng đếm giờ)          │
│  Reset condition:   Priority changes from 1 to other            │
│                                                                 │
│  Schedule: 8-5 weekdays (chỉ đếm giờ làm việc)                 │
└─────────────────────────────────────────────────────────────────┘
```

### 13.3 Trạng thái SLA

```
  ┌─────────┐     ┌───────────┐     ┌───────────┐
  │  In      │ ──→ │  Paused   │ ──→ │  Achieved │ ✅
  │ Progress │     │  (On Hold)│     │  (đúng hạn)│
  └────┬─────┘     └───────────┘     └───────────┘
       │
       └──────────────────────────→  ┌───────────┐
                                     │  Breached  │ ❌ Vi phạm
                                     └───────────┘
```

| Trạng thái | Ý nghĩa |
|---|---|
| **In Progress** | SLA đang đếm thời gian |
| **Paused** | Tạm dừng (VD: chờ phản hồi khách hàng) |
| **Achieved** | Hoàn thành đúng hạn ✅ |
| **Breached** | Vi phạm — quá thời gian cam kết ❌ |

### 13.4 SLA Timeline trên form

Trên form Incident, **SLA Timeline** hiển thị trực quan:

```
┌─────────────────────────────────────────────────────────────┐
│  P1 Resolution SLA                                          │
│  ████████████████████████░░░░░░░░  60% (2h24m / 4h00m)     │
│  ──────────────────────────────────────────────              │
│  Started: 10:00 AM  |  Breach at: 2:00 PM  |  Time left: 1h36m  │
└─────────────────────────────────────────────────────────────┘
```

### 13.5 Schedules (Lịch làm việc)

SLA thường chỉ đếm thời gian **trong giờ làm việc**:

| Schedule | Mô tả | Ví dụ |
|---|---|---|
| **8-5 weekdays** | Thứ 2-6, 8h-17h | 4h SLA = 4 giờ làm việc (có thể trải qua > 1 ngày) |
| **24x7** | Liên tục, kể cả cuối tuần | 4h SLA = đúng 4 tiếng |
| **Custom** | Tùy chỉnh theo tổ chức | Bao gồm/loại trừ ngày lễ |

**Ví dụ:**
- Incident tạo lúc **16:00 thứ 6**, SLA = 4 giờ, schedule = 8-5 weekdays
- 16:00 → 17:00 = 1 giờ (thứ 6)
- Thứ 7, Chủ nhật: KHÔNG ĐẾM
- 8:00 → 11:00 thứ 2 = 3 giờ
- **Breach time: 11:00 thứ 2** (tổng cộng 4 giờ làm việc)

### 13.6 SLA Notifications

SLA tự động gửi thông báo tại các mốc:

| Mốc | Ý nghĩa | Hành động |
|---|---|---|
| **50% elapsed** | Đã dùng 50% thời gian | Email nhắc nhở |
| **75% elapsed** | Đã dùng 75% thời gian | Escalation — thông báo manager |
| **100% (Breach)** | Vi phạm SLA | Alert toàn bộ chain |

### 13.7 Ví dụ — Truy vấn SLA vi phạm

```javascript
// Tìm tất cả Incident đang bị vi phạm SLA
var gr = new GlideRecord('task_sla');
gr.addQuery('task.sys_class_name', 'incident');
gr.addQuery('stage', 'breached');
gr.addQuery('active', true);
gr.query();

gs.info('=== SLA Vi Phạm ===');
while (gr.next()) {
  gs.info(gr.task.number + ' | SLA: ' + gr.sla.getDisplayValue() +
          ' | Breach time: ' + gr.breach_time +
          ' | Business % elapsed: ' + gr.business_percentage);
}
gs.info('Tổng: ' + gr.getRowCount() + ' Incident vi phạm SLA');
```

---

## Phụ Lục: Bảng Tham Chiếu Nhanh

### A. Các bảng phổ biến

| Label | Table name | Extends | Prefix |
|---|---|---|---|
| Task | `task` | — | TASK |
| Incident | `incident` | task | INC |
| Problem | `problem` | task | PRB |
| Change Request | `change_request` | task | CHG |
| Change Task | `change_task` | task | CTASK |
| Request | `sc_request` | task | REQ |
| Requested Item | `sc_req_item` | task | RITM |
| Catalog Task | `sc_task` | task | SCTASK |
| Knowledge | `kb_knowledge` | — | KB |
| User | `sys_user` | — | — |
| Group | `sys_user_group` | — | — |
| CMDB CI | `cmdb_ci` | cmdb | — |
| Application | `sys_app` | — | — |

### B. Cú pháp GlideRecord thường dùng

```javascript
// === TRUY VẤN ===
var gr = new GlideRecord('incident');

// Query đơn giản
gr.addQuery('active', true);
gr.addQuery('priority', '<=', 2);

// Encoded query
gr.addEncodedQuery('active=true^priority<=2^assigned_to.department.name=IT');

// OR condition
var orCond = gr.addQuery('state', 1);
orCond.addOrCondition('state', 2);

// Sắp xếp & giới hạn
gr.orderBy('priority');
gr.setLimit(10);

// Thực thi
gr.query();
while (gr.next()) {
  gs.info(gr.number + ': ' + gr.short_description);
}

// === TẠO ===
var newGr = new GlideRecord('incident');
newGr.initialize();
newGr.short_description = 'Sự cố mới';
newGr.insert();

// === CẬP NHẬT ===
var upGr = new GlideRecord('incident');
upGr.get('number', 'INC0010045');
upGr.state = 2; // In Progress
upGr.update();

// === XÓA ===
var delGr = new GlideRecord('incident');
delGr.get('number', 'INC0099999');
delGr.deleteRecord();
```

### C. Điều hướng nhanh trong ServiceNow

| Mục đích | Đường dẫn |
|---|---|
| Xem tất cả bảng | System Definition > Tables |
| Dictionary | System Definition > Dictionary |
| Update Sets | System Update Sets > Local Update Sets |
| Studio | System Applications > Studio |
| Scripts - Background | System Definition > Scripts - Background |
| Form Designer | (click phải header form) > Configure > Form Design |
| List Layout | (click phải header cột) > Configure > List Layout |
| ACL | System Security > Access Control (ACL) |

---

> **📌 Ghi chú cuối:** Tài liệu này tập trung vào lý thuyết nền tảng. Để thực hành, tham khảo file bài tập `ServiceNow-BaiTap-LoiGiai_VN.md` trong cùng thư mục.
>
> **Tài liệu tham khảo chính thức:**
> - [ServiceNow Docs](https://docs.servicenow.com)
> - [ServiceNow Developer](https://developer.servicenow.com)
> - [API Reference](https://developer.servicenow.com/dev.do#!/reference)
