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
