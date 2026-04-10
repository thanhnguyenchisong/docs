# 📝 ServiceNow Developer - Bài Tập & Lời Giải Tổng Hợp

> Tài liệu bài tập thực hành bao gồm lời giải cho tất cả chủ đề trong ServiceNow Developer Learning Modules.
> Phiên bản: Zurich | Ngôn ngữ: Tiếng Việt

---

## Mục Lục

1. [Module 1: Lập Trình Phía Client (Client-side Scripting)](#module-1-lập-trình-phía-client)
2. [Module 2: Tạo Custom Widgets](#module-2-tạo-custom-widgets)
3. [Module 3: Lập Trình Phía Server (Server-side Scripting)](#module-3-lập-trình-phía-server)
4. [Module 4: Giới Thiệu Service Portal](#module-4-giới-thiệu-service-portal)
5. [Bài Tập Tổng Hợp Nâng Cao](#bài-tập-tổng-hợp-nâng-cao)

---

## Module 1: Lập Trình Phía Client

### Chủ đề 1.1: Các Loại Client Script (onLoad, onChange, onSubmit)

---

#### Bài 1.1.1 — onLoad Client Script: Hiển thị thông báo chào mừng

**Yêu cầu:** Viết onLoad Client Script hiển thị thông báo info trên form NeedIt khi form được tải, nội dung: "Chào mừng bạn đến form NeedIt! Vui lòng điền đầy đủ thông tin."

**Lời giải:**

```javascript
function onLoad() {
  // Hiển thị thông báo info trên form
  g_form.addInfoMessage('Chào mừng bạn đến form NeedIt! Vui lòng điền đầy đủ thông tin.');
}
```

**Cấu hình:**
- **Name:** NeedIt Welcome Message
- **Table:** NeedIt
- **UI Type:** All
- **Type:** onLoad
- **Active:** Checked

**Giải thích:**
- `g_form.addInfoMessage()` hiển thị thông báo dạng info (màu xanh) ở đầu form.
- onLoad scripts thực thi khi form được tải, người dùng không thể tương tác với form cho đến khi tất cả onLoad scripts hoàn tất.
- Nên sử dụng onLoad scripts một cách tiết kiệm vì chúng ảnh hưởng đến thời gian tải form.

---

#### Bài 1.1.2 — onChange Client Script: Cảnh báo khi Priority thay đổi

**Yêu cầu:** Viết onChange Client Script cho trường `Priority` trên form NeedIt. Khi người dùng thay đổi Priority thành "1 - Critical", hiển thị cảnh báo: "Bạn đã chọn Priority Critical. Ban lãnh đạo sẽ được thông báo."

**Lời giải:**

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  // Không thực thi khi form đang tải hoặc giá trị rỗng
  if (isLoading || newValue === '') {
    return;
  }

  // Kiểm tra nếu Priority = 1 (Critical)
  if (newValue == '1') {
    alert('Bạn đã chọn Priority Critical. Ban lãnh đạo sẽ được thông báo.');
  }
}
```

**Cấu hình:**
- **Name:** NeedIt Priority Critical Alert
- **Table:** NeedIt
- **Type:** onChange
- **Field name:** Priority

**Giải thích:**
- Hàm `onChange` nhận 5 tham số tự động: `control`, `oldValue`, `newValue`, `isLoading`, `isTemplate`.
- `isLoading` là `true` khi form đang tải — ta bỏ qua để tránh cảnh báo không mong muốn.
- `oldValue` giữ nguyên giá trị khi form tải, bất kể trường thay đổi bao nhiêu lần.

---

#### Bài 1.1.3 — onSubmit Client Script: Xác nhận trước khi lưu

**Yêu cầu:** Viết onSubmit Client Script ngăn người dùng lưu bản ghi NeedIt nếu trường `Short description` trống. Hiển thị thông báo lỗi.

**Lời giải:**

```javascript
function onSubmit() {
  var shortDesc = g_form.getValue('short_description');

  // Kiểm tra Short description có rỗng không
  if (shortDesc == '' || shortDesc == null) {
    g_form.addErrorMessage('Vui lòng nhập Short description trước khi lưu.');
    // Trả về false để ngăn form submit
    return false;
  }

  // Cho phép submit nếu có giá trị
  return true;
}
```

**Giải thích:**
- onSubmit scripts thực thi khi form được gửi (Save/Update/Submit).
- Trả về `false` sẽ ngăn form gửi đến server.
- Trả về `true` (hoặc không trả về gì) cho phép form gửi bình thường.
- `g_form.addErrorMessage()` hiển thị thông báo lỗi (màu đỏ) trên form.

---

### Chủ đề 1.2: GlideForm API (g_form)

---

#### Bài 1.2.1 — Sử dụng g_form để quản lý trường form

**Yêu cầu:** Viết onLoad Client Script thực hiện:
1. Đặt trường `Description` thành bắt buộc cho bản ghi mới.
2. Đặt trường `State` thành chỉ đọc.
3. Hiển thị thông báo hướng dẫn dưới trường `Short description`.

**Lời giải:**

```javascript
function onLoad() {
  // 1. Đặt Description bắt buộc cho bản ghi mới
  if (g_form.isNewRecord()) {
    g_form.setMandatory('description', true);
  }

  // 2. Đặt State chỉ đọc
  g_form.setReadOnly('state', true);

  // 3. Hiển thị thông báo dưới Short description
  g_form.showFieldMsg('short_description',
    'Nhập mô tả ngắn gọn cho yêu cầu của bạn.', 'info');
}
```

**Các phương thức g_form thường dùng:**

| Phương thức | Mô tả |
|---|---|
| `g_form.getValue(fieldName)` | Lấy giá trị trường trên form |
| `g_form.setValue(fieldName, value)` | Đặt giá trị trường |
| `g_form.setMandatory(fieldName, bool)` | Đặt trường bắt buộc |
| `g_form.setReadOnly(fieldName, bool)` | Đặt trường chỉ đọc |
| `g_form.setVisible(fieldName, bool)` | Ẩn/hiện trường |
| `g_form.showFieldMsg(field, msg, type)` | Hiển thị thông báo dưới trường |
| `g_form.hideFieldMsg(fieldName)` | Ẩn thông báo dưới trường |
| `g_form.addOption(field, value, label)` | Thêm option vào danh sách |
| `g_form.clearOptions(fieldName)` | Xóa tất cả options |
| `g_form.isNewRecord()` | Kiểm tra có phải bản ghi mới |
| `g_form.addInfoMessage(msg)` | Thông báo info trên form |
| `g_form.addErrorMessage(msg)` | Thông báo lỗi trên form |

---

#### Bài 1.2.2 — Điều khiển danh sách lựa chọn (Choice List)

**Yêu cầu:** Viết onChange Client Script cho trường `Request type`. Khi giá trị thay đổi, thay đổi danh sách lựa chọn trường `What needed` cho phù hợp:
- `hr` → "Human Resources 1", "Human Resources 2", "Other"
- `facilities` → "Facilities 1", "Facilities 2", "Other"
- `legal` → "Legal 1", "Legal 2", "Other"

**Lời giải:**

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (newValue == '') {
    return;
  }

  // Lưu giá trị hiện tại của What needed
  var whatneeded = g_form.getValue('u_what_needed');

  // Xóa tất cả lựa chọn hiện có
  g_form.clearOptions('u_what_needed');

  // Thêm lựa chọn mới dựa trên Request type
  if (newValue == 'hr') {
    g_form.addOption('u_what_needed', 'hr1', 'Human Resources 1');
    g_form.addOption('u_what_needed', 'hr2', 'Human Resources 2');
    g_form.addOption('u_what_needed', 'other', 'Other');
  } else if (newValue == 'facilities') {
    g_form.addOption('u_what_needed', 'facilities1', 'Facilities 1');
    g_form.addOption('u_what_needed', 'facilities2', 'Facilities 2');
    g_form.addOption('u_what_needed', 'other', 'Other');
  } else if (newValue == 'legal') {
    g_form.addOption('u_what_needed', 'legal1', 'Legal 1');
    g_form.addOption('u_what_needed', 'legal2', 'Legal 2');
    g_form.addOption('u_what_needed', 'other', 'Other');
  }

  // Khôi phục giá trị trước đó nếu form đang tải
  if (isLoading && !g_form.isNewRecord()) {
    g_form.setValue('u_what_needed', whatneeded);
  }
}
```

---

### Chủ đề 1.3: GlideUser API (g_user)

---

#### Bài 1.3.1 — Sử dụng g_user để kiểm tra vai trò

**Yêu cầu:** Viết onLoad Client Script kiểm tra:
1. Nếu người dùng có vai trò `admin`, hiển thị tất cả các section trên form.
2. Nếu không, ẩn section "Admin Details".
3. Hiển thị thông báo chào hỏi với tên đầy đủ của người dùng.

**Lời giải:**

```javascript
function onLoad() {
  // Hiển thị thông báo chào hỏi với tên đầy đủ
  var fullName = g_user.getFullName();
  g_form.addInfoMessage('Xin chào ' + fullName + '! Chúc bạn làm việc hiệu quả.');

  // Kiểm tra vai trò admin
  if (!g_user.hasRole('admin')) {
    // Ẩn section Admin Details bằng cách lấy danh sách sections
    var sections = g_form.getSections();
    for (var i = 0; i < sections.length; i++) {
      var sectionName = g_form.getSectionName(sections[i]);
      if (sectionName == 'admin_details') {
        g_form.setSectionDisplay(sectionName, false);
      }
    }
  }
}
```

**Các thuộc tính/phương thức g_user:**

| Thuộc tính/Phương thức | Mô tả |
|---|---|
| `g_user.firstName` | Tên người dùng |
| `g_user.lastName` | Họ người dùng |
| `g_user.userName` | Tên đăng nhập |
| `g_user.userID` | sys_id người dùng |
| `g_user.getFullName()` | Tên đầy đủ |
| `g_user.hasRole('role')` | Kiểm tra có vai trò (kể cả admin) |
| `g_user.hasRoleExactly('role')` | Kiểm tra vai trò chính xác (không kể admin) |

---

### Chủ đề 1.4: UI Policies

---

#### Bài 1.4.1 — UI Policy: Hiển thị/ẩn trường có điều kiện

**Yêu cầu:** Tạo UI Policy cho form NeedIt:
- **Điều kiện:** Khi trường `What needed` = "Other"
- **Hành động:** Hiển thị trường `Other` và đặt nó bắt buộc
- **Khi false:** Ẩn trường `Other` và bỏ bắt buộc

**Lời giải:**

**Cấu hình UI Policy:**
- **Table:** NeedIt
- **Short Description:** NeedIt hiển thị hoặc ẩn trường Other
- **Condition:** [What needed] [is] [Other]
- **Reverse if false:** ✅ Checked
- **On load:** ✅ Checked

**UI Policy Action:**
- **Field name:** Other
- **Mandatory:** True
- **Visible:** True

**UI Policy Script (Execute if true):**

```javascript
function onCondition() {
  // Hiển thị thông báo hướng dẫn dưới trường Other
  g_form.showFieldMsg('u_other', 'Vui lòng mô tả ngắn gọn yêu cầu của bạn.', 'info');
}
```

**UI Policy Script (Execute if false):**

```javascript
function onCondition() {
  // Xóa thông báo khi trường Other bị ẩn
  g_form.hideFieldMsg('u_other');
}
```

**Giải thích:**
- Khi `Reverse if false` = checked, thuộc tính sẽ đảo ngược: Mandatory True → False, Visible True → False.
- UI Policies thực thi **sau** Client Scripts — nếu có xung đột, UI Policy thắng.
- UI Policy Actions **không cần viết script** để đặt Mandatory/Visible/Read-only.

---

#### Bài 1.4.2 — So sánh Client Scripts vs UI Policies

**Câu hỏi trắc nghiệm:**

**1.** Bạn cần thực thi logic khi form được lưu (submit). Nên dùng gì?
- A) UI Policy
- B) Client Script
- C) Cả hai đều được

**Đáp án: B)** — Chỉ Client Script (onSubmit) có khả năng thực thi khi form submit. UI Policy không có trigger cho sự kiện submit.

**2.** Bạn cần đặt trường "Priority" thành read-only mà không cần viết code. Nên dùng gì?
- A) UI Policy Action
- B) onChange Client Script
- C) onLoad Client Script

**Đáp án: A)** — UI Policy Action cho phép đặt thuộc tính trường (Mandatory, Visible, Read-only) mà không cần viết code.

**3.** Client Script và UI Policy đều thay đổi thuộc tính cùng một trường. Kết quả cuối cùng là gì?
- A) Client Script thắng
- B) UI Policy thắng
- C) Tùy thứ tự

**Đáp án: B)** — UI Policies luôn thực thi sau Client Scripts, nên logic UI Policy sẽ được áp dụng cuối cùng.

**Bảng so sánh đầy đủ:**

| Tiêu chí | Client Script | UI Policy |
|---|---|---|
| Thực thi khi form tải | ✅ onLoad | ✅ On load option |
| Thực thi khi submit | ✅ onSubmit | ❌ |
| Thực thi khi trường thay đổi | ✅ onChange | ✅ Condition |
| Truy cập giá trị cũ (oldValue) | ✅ | ❌ |
| Đặt thuộc tính không cần code | ❌ | ✅ Actions |
| Thứ tự thực thi | Trước | Sau (ưu tiên cao hơn) |

---

## Module 2: Tạo Custom Widgets

### Chủ đề 2.1: Widget Editor & Clone Widget

---

#### Bài 2.1.1 — Clone và sửa đổi baseline widget

**Yêu cầu:** Clone widget "Hello World 1" thành "My Hello World 1" và thay đổi màu heading thành `#8bdb2e`.

**Lời giải:**

**Bước 1: Clone widget**
1. Mở Widget Editor → chọn Hello World 1
2. Menu Widget Editor → Clone "Hello World 1"
3. Cấu hình: Widget name: `My Hello World 1`, Widget ID: `my_hello_world_1`, Create test page: ✅

**Bước 2: Sửa CSS**

```css
h1 {
  color: #8bdb2e;
}
```

**Giải thích:**
- Baseline widgets là **chỉ đọc** — phải clone để chỉnh sửa.
- Clone tạo bản sao đầy đủ bao gồm HTML, CSS, Client Script, Server Script.
- Test page cho phép kiểm thử widget trên portal thực tế.

---

### Chủ đề 2.2: Widget Scripts (HTML Template, Client Script, Server Script)

---

#### Bài 2.2.1 — Tạo widget hiển thị danh sách bản ghi

**Yêu cầu:** Tạo widget "Notes List" hiển thị danh sách Notes thuộc người dùng đang đăng nhập, bao gồm tiêu đề và 20 ký tự đầu của mô tả.

**Lời giải:**

**Server Script:**

```javascript
(function() {
  // Lấy sys_id người dùng đang đăng nhập
  var userID = gs.getUserID();

  // Tạo GlideRecord truy vấn bảng Notes
  var noteGR = new GlideRecord('x_snc_createnotes_note');
  noteGR.addQuery('u_user', userID);
  noteGR.orderByDesc('sys_created_on');
  noteGR.query();

  // Tạo mảng chứa notes
  data.notes = [];

  while (noteGR.next()) {
    var noteObj = {};
    noteObj.title = noteGR.getValue('u_title');
    noteObj.description = noteGR.getValue('u_description');
    // Lấy 20 ký tự đầu tiên
    noteObj.shortDesc = noteGR.getValue('u_description').substring(0, 20) + '...';
    noteObj.sysId = noteGR.getUniqueValue();
    data.notes.push(noteObj);
  }
})();
```

**HTML Template:**

```html
<div class="panel panel-default">
  <div class="panel-heading">
    <h4>Danh sách Notes</h4>
  </div>
  <div class="panel-body">
    <ul class="list-group">
      <li class="list-group-item"
          ng-repeat="note in c.data.notes"
          ng-click="c.selectNote(note.sysId)">
        <strong>{{note.title}}</strong>
        <p class="text-muted">{{note.shortDesc}}</p>
      </li>
    </ul>
    <p ng-if="c.data.notes.length === 0">Không có ghi chú nào.</p>
  </div>
</div>
```

**Client Script:**

```javascript
function($scope) {
  var c = this;

  // Hàm được gọi khi nhấp vào note
  c.selectNote = function(sysId) {
    // Phát sự kiện cho widget khác
    $scope.$emit('noteSelected', {sysId: sysId});
  };
}
```

**Giải thích:**
- **Server Script** truy vấn database dùng `GlideRecord` và truyền kết quả qua đối tượng `data`.
- **HTML Template** dùng AngularJS `ng-repeat` để lặp qua mảng notes.
- **Client Script** xử lý tương tác người dùng và phát sự kiện (`$emit`) cho các widget khác.
- Đối tượng `c` (controller) được dùng để tham chiếu dữ liệu: `c.data`, `c.server`.

---

### Chủ đề 2.3: Widget Events (Emit & Receive)

---

#### Bài 2.3.1 — Giao tiếp giữa hai widgets bằng Events

**Yêu cầu:** Widget Notes List phát sự kiện khi nhấp vào note. Widget Notes Body nhận sự kiện và hiển thị chi tiết note.

**Lời giải:**

**Notes List — Client Script (Emit):**

```javascript
function($scope) {
  var c = this;

  c.selectNote = function(sysId) {
    // Phát sự kiện 'noteSelected' kèm sysId
    $scope.$emit('noteSelected', {sysId: sysId});
    console.log('Event emitted: noteSelected, sysId = ' + sysId);
  };
}
```

**Notes Body — Client Script (Receive):**

```javascript
function($scope) {
  var c = this;

  // Lắng nghe sự kiện 'noteSelected'
  $scope.$on('noteSelected', function(event, data) {
    console.log('Event received: noteSelected, sysId = ' + data.sysId);

    // Gọi server để lấy chi tiết note
    c.server.get({
      action: 'getNote',
      noteID: data.sysId
    }).then(function(response) {
      c.data.selectedNote = response.data.selectedNote;
    });
  });
}
```

**Notes Body — Server Script:**

```javascript
(function() {
  if (input && input.action == 'getNote') {
    var noteGR = new GlideRecord('x_snc_createnotes_note');
    if (noteGR.get(input.noteID)) {
      data.selectedNote = {
        title: noteGR.getValue('u_title'),
        description: noteGR.getValue('u_description'),
        createdOn: noteGR.getValue('sys_created_on'),
        sysId: noteGR.getUniqueValue()
      };
    }
  }
})();
```

**Notes Body — HTML Template:**

```html
<div class="panel panel-info" ng-if="c.data.selectedNote">
  <div class="panel-heading">
    <h4>{{c.data.selectedNote.title}}</h4>
  </div>
  <div class="panel-body">
    <p>{{c.data.selectedNote.description}}</p>
    <small class="text-muted">Tạo ngày: {{c.data.selectedNote.createdOn}}</small>
  </div>
</div>
<div class="alert alert-info" ng-if="!c.data.selectedNote">
  Chọn một note từ danh sách để xem chi tiết.
</div>
```

**Giải thích:**
- `$scope.$emit()` phát sự kiện từ widget con lên trên.
- `$scope.$on()` lắng nghe sự kiện.
- `c.server.get()` gọi Server Script với tham số tùy chỉnh và nhận phản hồi bất đồng bộ.
- `c.server.update()` gửi `c.data` hiện tại lên server.

---

### Chủ đề 2.4: Widget API, Debugging & Directives

---

#### Bài 2.4.1 — Sử dụng spModal để tạo hộp thoại xác nhận

**Yêu cầu:** Trước khi xóa note, hiển thị hộp thoại xác nhận sử dụng `spModal`.

**Lời giải:**

```javascript
function($scope, spModal) {
  var c = this;

  c.deleteNote = function(sysId) {
    // Hiển thị modal xác nhận
    spModal.confirm('Bạn có chắc chắn muốn xóa note này?').then(function(confirmed) {
      if (confirmed) {
        // Gọi server để xóa
        c.server.get({
          action: 'snDeleteNote',
          noteID: sysId
        }).then(function(response) {
          c.data.notes = response.data.notes;
        });
      }
    });
  };
}
```

**Widget API Classes:**

| Class | Side | Mô tả |
|---|---|---|
| `spUtil` | Client | Tiện ích: addInfoMessage, addErrorMessage, recordWatch |
| `spModal` | Client | Hiển thị modal: confirm, alert, open, prompt |
| `spAriaUtil` | Client | Hỗ trợ truy cập (accessibility) |
| `GlideSPScriptable` | Server | Truy vấn dữ liệu portal trên server |

---

#### Bài 2.4.2 — Tạo Directive tái sử dụng

**Yêu cầu:** Tạo AngularJS Directive render nút Delete có icon và có thể tái sử dụng giữa các widgets.

**Lời giải:**

**Directive (Angular Provider):**

```javascript
function() {
  return {
    restrict: 'E',
    replace: true,
    template: '<button class="btn btn-danger btn-sm" ng-click="onClick()">' +
              '<i class="fa fa-trash"></i> Xóa</button>',
    scope: {
      onClick: '&'
    }
  };
}
```

**Sử dụng trong HTML Template:**

```html
<delete-button on-click="c.deleteNote(note.sysId)"></delete-button>
```

**Cấu hình Directive:**
- Tạo Angular Provider trong Widget Editor
- Loại: Directive
- Name: deleteButton
- Thêm dependency trong widget Notes Body

---

### Chủ đề 2.5: Widget Options & Record Watch

---

#### Bài 2.5.1 — Tạo Widget Option Schema

**Yêu cầu:** Tạo Option Schema cho widget Notes List cho phép admin cấu hình:
1. Tiêu đề panel
2. Số bản ghi tối đa hiển thị

**Lời giải:**

**Option Schema (JSON):**

```json
[
  {
    "hint": "Tiêu đề panel ghi chú",
    "name": "panel_title",
    "default_value": "Danh sách Notes",
    "section": "Cấu hình",
    "label": "Tiêu đề Panel",
    "type": "string"
  },
  {
    "hint": "Số bản ghi tối đa hiển thị",
    "name": "max_records",
    "default_value": "10",
    "section": "Cấu hình",
    "label": "Số bản ghi tối đa",
    "type": "integer"
  }
]
```

**Sử dụng trong Server Script:**

```javascript
(function() {
  var maxRecords = options.max_records || 10;
  var noteGR = new GlideRecord('x_snc_createnotes_note');
  noteGR.addQuery('u_user', gs.getUserID());
  noteGR.setLimit(maxRecords);
  noteGR.query();

  data.panelTitle = options.panel_title || 'Danh sách Notes';
  data.notes = [];

  while (noteGR.next()) {
    data.notes.push({
      title: noteGR.getValue('u_title'),
      sysId: noteGR.getUniqueValue()
    });
  }
})();
```

---

#### Bài 2.5.2 — Record Watch: Phát hiện thay đổi bản ghi

**Yêu cầu:** Sử dụng Record Watch để tự động cập nhật widget Notes List khi có Note mới được tạo hoặc xóa từ bên ngoài Service Portal.

**Lời giải:**

```javascript
function($scope, spUtil) {
  var c = this;

  // Đăng ký Record Watch cho bảng Notes
  spUtil.recordWatch($scope, 'x_snc_createnotes_note',
    'u_user=' + window.NOW.user_id,
    function(name, data) {
      // Callback khi có thay đổi
      console.log('Record Watch event:', data.operation);

      // Gọi lại server để làm mới dữ liệu
      c.server.update().then(function(response) {
        c.data.notes = response.data.notes;
      });
    }
  );
}
```

**Giải thích:**
- `spUtil.recordWatch()` giám sát bảng để phát hiện INSERT, UPDATE, DELETE từ bên ngoài portal.
- Tham số: `$scope`, tên bảng, filter (encoded query), callback function.
- Callback nhận thông tin sự kiện gồm `operation` (insert/update/delete) và `sys_id`.

---

## Module 3: Lập Trình Phía Server

### Chủ đề 3.1: Business Rules

---

#### Bài 3.1.1 — Before Business Rule: Xác thực ngày tháng

**Yêu cầu:** Viết Before Business Rule ngăn người dùng lưu bản ghi NeedIt nếu trường `When needed` là ngày trong quá khứ.

**Lời giải:**

```javascript
(function executeRule(current, previous) {

  // Tạo đối tượng GlideDateTime cho ngày hiện tại và ngày cần kiểm tra
  var rightnow = new GlideDateTime();
  var whenNeeded = new GlideDateTime(current.u_when_needed);

  // So sánh: nếu When needed là quá khứ
  if (whenNeeded.before(rightnow)) {
    current.setAbortAction(true);
    gs.addErrorMessage('Ngày "When needed" không được trong quá khứ. Bản ghi chưa được lưu.');
  }

})(current, previous);
```

**Cấu hình:**
- **Name:** NeedIt When needed field date
- **Table:** NeedIt
- **When:** before
- **Insert:** ✅ | **Update:** ✅
- **Order:** 100

**Giải thích:**
- **Before** Business Rules thực thi trước khi database thao tác → có thể ngăn lưu bằng `setAbortAction(true)`.
- `GlideDateTime` là API server-side để làm việc với ngày giờ.
- `gs.addErrorMessage()` hiển thị lỗi trên form (server-side tương đương `g_form.addErrorMessage` ở client).

---

#### Bài 3.1.2 — After Business Rule: Ghi log và cập nhật trường

**Yêu cầu:** Viết After Business Rule: Khi bản ghi NeedIt được tạo mới, ghi log và tự động đặt trường `Approval` thành "Requested".

**Lời giải:**

```javascript
(function executeRule(current, previous) {

  // Ghi log
  gs.info('NeedIt record created: ' + current.number +
          ' by user: ' + gs.getUserDisplayName());

  // Đặt Approval thành Requested
  current.approval = 'requested';
  current.update();

})(current, previous);
```

**Cấu hình:**
- **When:** after
- **Insert:** ✅

**Các loại Business Rules:**

| Loại | Khi nào | Use case |
|---|---|---|
| **before** | Trước DB operation | Xác thực dữ liệu, đặt giá trị mặc định |
| **after** | Sau DB operation | Cập nhật bản ghi liên quan, gửi notification |
| **async** | Bất đồng bộ sau DB | Tác vụ nặng (email, tích hợp bên ngoài) |
| **display** | Khi truy vấn hiển thị | Thêm data cho form (ít dùng) |

---

### Chủ đề 3.2: GlideRecord API

---

#### Bài 3.2.1 — Truy vấn bản ghi với GlideRecord

**Yêu cầu:** Viết script server-side (Background Script) đếm số bản ghi Incident đang mở (active) được gán cho nhóm "Database".

**Lời giải:**

```javascript
var count = 0;
var gr = new GlideRecord('incident');
gr.addQuery('active', true);
gr.addQuery('assignment_group.name', 'Database');
gr.query();

while (gr.next()) {
  count++;
  gs.info('Incident: ' + gr.getValue('number') + ' - ' + gr.getValue('short_description'));
}

gs.info('Tổng số Incident active cho nhóm Database: ' + count);
```

**Hoặc dùng GlideAggregate:**

```javascript
var ga = new GlideAggregate('incident');
ga.addQuery('active', true);
ga.addQuery('assignment_group.name', 'Database');
ga.addAggregate('COUNT');
ga.query();

if (ga.next()) {
  gs.info('Tổng số Incident: ' + ga.getAggregate('COUNT'));
}
```

**Các phương thức GlideRecord chính:**

| Phương thức | Mô tả |
|---|---|
| `addQuery(field, value)` | Thêm điều kiện truy vấn |
| `addQuery(field, operator, value)` | Truy vấn với toán tử (>, <, !=,...) |
| `query()` | Thực thi truy vấn |
| `next()` | Di chuyển đến bản ghi tiếp theo |
| `get(sys_id)` | Lấy bản ghi theo sys_id |
| `getValue(field)` | Lấy giá trị trường |
| `setValue(field, value)` | Đặt giá trị trường |
| `update()` | Cập nhật bản ghi |
| `insert()` | Thêm bản ghi mới |
| `deleteRecord()` | Xóa bản ghi |
| `addEncodedQuery(query)` | Truy vấn bằng encoded query |
| `setLimit(n)` | Giới hạn số bản ghi |
| `orderBy(field)` | Sắp xếp tăng dần |
| `orderByDesc(field)` | Sắp xếp giảm dần |
| `getRowCount()` | Đếm số bản ghi (tốn tài nguyên) |

---

### Chủ đề 3.3: Script Includes

---

#### Bài 3.3.1 — On Demand (Classless) Script Include

**Yêu cầu:** Tạo Script Include `validateEmailAddress` để xác thực cú pháp email. Sử dụng trong Business Rule khi người dùng lưu bản ghi.

**Lời giải:**

**Script Include:**

```javascript
function validateEmailAddress(emailStr) {
  // Đảm bảo emailStr là string
  emailStr = emailStr + '';

  // So sánh với regex cho phép
  var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailStr.match(emailRegex)) {
    return true;
  } else {
    return false;
  }
}
```

**Cấu hình:**
- **Name:** validateEmailAddress (phải khớp tên hàm)
- **Client callable:** ❌
- **Accessible from:** All application scopes

**Business Rule sử dụng Script Include:**

```javascript
(function executeRule(current, previous) {
  // Gọi Script Include
  var isValid = validateEmailAddress(current.u_requested_for_email);

  if (isValid == false) {
    current.setAbortAction(true);
    gs.addErrorMessage(current.u_requested_for_email +
      ' không phải địa chỉ email hợp lệ. Vui lòng nhập lại.');
  }
})(current, previous);
```

**Giải thích:**
- On demand Script Include chỉ chứa **một hàm duy nhất**.
- Tên Script Include **phải khớp chính xác** tên hàm.
- **Không thể** gọi từ client-side (dù check Client callable).
- Thường dùng cho: chuẩn hóa format, xác thực dữ liệu, logic tái sử dụng.

---

#### Bài 3.3.2 — Script Include mở rộng GlideAjax (Client Callable)

**Yêu cầu:** Tạo Script Include `GetEmailAddress` mở rộng GlideAjax để trả về email từ bảng User khi client gọi.

**Lời giải:**

**Script Include (Server):**

```javascript
var GetEmailAddress = Class.create();
GetEmailAddress.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

  getEmail: function() {
    var userRecord = new GlideRecord('sys_user');
    userRecord.get(this.getParameter('sysparm_userID'));
    return userRecord.email + '';
  },

  type: 'GetEmailAddress'
});
```

**Cấu hình:**
- **Client callable:** ✅ Checked
- **Accessible from:** This application scope only

**Client Script gọi Script Include:**

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '' || newValue == oldValue) {
    return;
  }

  // Tạo GlideAjax object
  var getEmailAddr = new GlideAjax('GetEmailAddress');

  // Chỉ định method cần gọi
  getEmailAddr.addParam('sysparm_name', 'getEmail');

  // Truyền sys_id người dùng
  getEmailAddr.addParam('sysparm_userID', g_form.getValue('u_requested_for'));

  // Gửi request bất đồng bộ
  getEmailAddr.getXML(populateEmailField);

  // Callback khi có phản hồi
  function populateEmailField(response) {
    var email = response.responseXML.documentElement.getAttribute('answer');
    g_form.clearValue('u_requested_for_email');
    g_form.setValue('u_requested_for_email', email);
  }
}
```

**Giải thích:**
- `AbstractAjaxProcessor` là class cha cho AJAX Script Includes.
- `this.getParameter()` lấy tham số từ client.
- `getXML()` gửi request **bất đồng bộ** (recommend) — không đóng băng UI.
- `sysparm_name` chỉ định phương thức server-side cần gọi.

---

#### Bài 3.3.3 — Utilities Script Include (Class mới)

**Yêu cầu:** Tạo Script Include `NeedItUtils` với phương thức `isDatePast` để kiểm tra ngày có trong quá khứ không.

**Lời giải:**

```javascript
var NeedItUtils = Class.create();
NeedItUtils.prototype = {

  initialize: function() {
    // Hàm khởi tạo tự động chạy khi instantiate
  },

  isDatePast: function(strDate) {
    var rightnow = new GlideDateTime();
    var testDate = new GlideDateTime(strDate);

    if (testDate.before(rightnow)) {
      return true;
    } else {
      return false;
    }
  },

  isDateToday: function(strDate) {
    var today = new GlideDateTime();
    var testDate = new GlideDateTime(strDate);

    // So sánh chỉ phần ngày (không có giờ)
    return today.getLocalDate().toString() == testDate.getLocalDate().toString();
  },

  type: 'NeedItUtils'
};
```

**Sử dụng trong Business Rule:**

```javascript
(function executeRule(current, previous) {
  // Khởi tạo NeedItUtils
  var niutils = new NeedItUtils();

  // Gọi phương thức isDatePast
  var isPast = niutils.isDatePast(current.u_when_needed);

  if (isPast == true) {
    current.setAbortAction(true);
    gs.addErrorMessage('Ngày When needed không được trong quá khứ.');
  }
})(current, previous);
```

---

### Chủ đề 3.4: JavaScript Debugger

---

#### Bài 3.4.1 — Câu hỏi lý thuyết về Debugging

**1.** Script Tracer dùng để làm gì?
- A) Viết server-side scripts
- B) Xác định server-side scripts nào thực thi khi tương tác UI
- C) Gỡ lỗi client-side scripts

**Đáp án: B)** — Script Tracer xác định tất cả server-side scripts thực thi như một phần của tương tác UI.

**2.** Khi đặt breakpoint trong JavaScript Debugger, script sẽ:
- A) Bỏ qua dòng có breakpoint
- B) Dừng lại tại dòng có breakpoint để kiểm tra biến
- C) Xóa dòng có breakpoint

**Đáp án: B)** — Breakpoint dừng thực thi script tại dòng đó, cho phép kiểm tra giá trị biến trong panel Local/Closures.

**3.** Sự khác biệt giữa breakpoint và logpoint?
- **Breakpoint:** Dừng thực thi script, cho phép kiểm tra biến.
- **Logpoint:** Ghi thông tin vào log mà KHÔNG dừng thực thi script.

**Các nút trong Debugger:**

| Nút | Chức năng |
|---|---|
| Resume | Tiếp tục đến breakpoint tiếp theo |
| Step over | Thực thi dòng tiếp theo (không vào hàm) |
| Step into | Đi vào bên trong hàm |
| Step out of | Thoát ra khỏi hàm hiện tại |

---

### Chủ đề 3.5: Các Loại Server-side Script Khác

---

#### Bài 3.5.1 — Bảng tham chiếu nhanh các loại script

**Câu hỏi:** Nối loại script với use case phù hợp.

| Script Type | Trigger | Use Case |
|---|---|---|
| **Business Rule** | Database access (CRUD) | Xác thực dữ liệu, đặt giá trị tự động |
| **Script Include** | Gọi tường minh | Thư viện hàm tái sử dụng |
| **Script Action** | Events | Gửi email, ghi log |
| **Scheduled Script** | Time-based schedule | Báo cáo hàng ngày/tuần/tháng |
| **UI Action** | Người dùng nhấp nút/link | Thêm nút trên form, thao tác tùy chỉnh |
| **Fix Script** | Cài đặt/nâng cấp | Tạo/sửa dữ liệu hệ thống |
| **Scripted REST API** | Web service request | Tạo endpoint trả về JSON |
| **Transform Map Script** | Data import | Chuẩn hóa dữ liệu nhập |

**Bài tập: Chọn loại script phù hợp**

**Tình huống 1:** Bạn cần gửi email cho manager khi Incident Priority 1 được tạo.
→ **Đáp án:** Business Rule (after, insert) + Script Action/Event

**Tình huống 2:** Bạn cần chạy report hàng tuần về số lượng Incident mở.
→ **Đáp án:** Scheduled Script Job

**Tình huống 3:** Bạn cần verify email format mỗi khi bản ghi được lưu.
→ **Đáp án:** Business Rule gọi Script Include (reusable)

---

## Module 4: Giới Thiệu Service Portal

### Chủ đề 4.1: Tạo và Cấu hình Portal

---

#### Bài 4.1.1 — Tạo Portal mới

**Yêu cầu:** Tạo portal "Portal Meum" với các cấu hình cơ bản.

**Lời giải:**

| Trường | Giá trị |
|---|---|
| Title | Portal Meum |
| URL suffix | pm |
| Homepage | index |
| KB home page | kb_view2 |
| 404 page | 404 |
| Catalog home page | sc_home |
| Main menu | SP Header Menu |
| Theme | Stock - High Contrast |

**Truy cập portal:** `https://<instance>.service-now.com/pm`

**Các thành phần Portal quan trọng:**

| Thành phần | Mô tả |
|---|---|
| **Title** | Tên portal hiển thị trên tab trình duyệt |
| **URL suffix** | Đường dẫn truy cập portal |
| **Homepage** | Page ID trang chủ |
| **Theme** | Chủ đề màu sắc và style |
| **Logo** | Logo hiển thị trên header |
| **Icon** | Favicon hiển thị trên tab |

---

### Chủ đề 4.2: Page Layout (Containers, Rows, Columns)

---

#### Bài 4.2.1 — Câu hỏi về cấu trúc trang

**1.** Thứ tự phân cấp cấu trúc trang portal là gì?

**Đáp án:** Portal → Pages → Containers → Rows → Columns → Widgets

**2.** Bootstrap Grid System chia mỗi row thành bao nhiêu cột?

**Đáp án:** 12 cột. Mỗi row layout chỉ định số cột portal và độ rộng mỗi cột.

**3.** Sự khác biệt giữa Fixed và Fluid container?

| Loại | Hành vi |
|---|---|
| **Fixed** | Phần tử giữ nguyên kích thước khi trang co/giãn |
| **Fluid** | Phần tử theo tỷ lệ % khi trang co/giãn |

---

#### Bài 4.2.2 — Configure Container Properties

**Yêu cầu:** Cấu hình container thứ nhất có background image và hiển thị Homepage Search widget.

**Lời giải:**

| Thuộc tính | Giá trị |
|---|---|
| Background image | background.png (upload) |
| Background style | Cover |
| Width | Fluid |
| Parent class | hidden-xs (ẩn trên màn hình nhỏ) |

---

### Chủ đề 4.3: Widgets & Widget Options

---

#### Bài 4.3.1 — Cấu hình Widget Options

**Yêu cầu:** Cấu hình 3 Icon Link widgets với các loại khác nhau.

**Lời giải:**

**Widget 1 - Order Something:**

| Option | Giá trị |
|---|---|
| Type | Page |
| Page | sc_home |
| Title | Order Something |
| Short description | Browse the catalog for services and items |
| Bootstrap color | Primary |
| Glyph | usd |
| Template | Top icon |

**Widget 2 - Knowledge Base:**

| Option | Giá trị |
|---|---|
| Type | KB Category |
| KB category | Policies |
| Page | kb_category |
| Title | Knowledge Base |
| Glyph | eye |
| Template | Color Box |

**Widget 3 - Get Help:**

| Option | Giá trị |
|---|---|
| Type | Catalog category |
| Catalog category | Can We Help You? |
| Page | sc_category |
| Title | Get Help |
| Glyph | question-sign |
| Template | Simple |

---

#### Bài 4.3.2 — Cấu hình Simple List Widget

**Yêu cầu:** Hiển thị danh sách Incident active mở bởi người dùng đang đăng nhập.

**Lời giải:**

| Option | Giá trị |
|---|---|
| Table | Incident [incident] |
| Filter | active=true^opened_by=javascript:gs.getUserID() |
| Display field | Short description |
| Secondary fields | Number, Updated |
| Link to this page | ticket |
| Show even when empty | ✅ |
| Glyph | list (fa-list) |
| Maximum entries | 7 |

**Cách lấy filter:** Tạo query trên danh sách Incident → right-click breadcrumbs → Copy query.

---

### Chủ đề 4.4: Responsive Design & Branding

---

#### Bài 4.4.1 — Ẩn/hiện container theo viewport

**Yêu cầu:** Hiển thị Homepage Search cho màn hình lớn, Typeahead Search cho màn hình nhỏ.

**Lời giải:**

**Container Homepage Search:**
- Parent class: `hidden-xs`

**Container Typeahead Search:**
- Parent class: `visible-xs`
- Move to header: ✅ Checked

**Bootstrap CSS Helper Classes:**

| Class | Hành vi |
|---|---|
| `hidden-xs` | Ẩn trên extra small (< 768px) |
| `hidden-sm` | Ẩn trên small (≥ 768px) |
| `hidden-md` | Ẩn trên medium (≥ 992px) |
| `visible-xs` | Chỉ hiển thị trên extra small |
| `visible-sm` | Chỉ hiển thị trên small |

---

#### Bài 4.4.2 — Thay đổi Branding

**Yêu cầu:** Thay đổi logo, logo padding, và Primary color trong Branding Editor.

**Lời giải:**

1. Mở **Service Portal > Service Portal Configuration > Branding Editor**
2. Chọn portal **Portal Meum**
3. **Quick Setup tab:**
   - Upload logo mới
   - Left padding: 10, Top padding: 4
4. **Theme Colors tab:**
   - Brand > Primary: `#48424C`
5. Kiểm tra Theme Preview
6. Click Save

---

### Chủ đề 4.5: Roles & Widget Security

---

#### Bài 4.5.1 — Gán Role cho Widget

**Yêu cầu:** Widget Approvals chỉ hiển thị cho người dùng có vai trò `manager`.

**Lời giải:**

1. Tạo role `manager` trong User Administration > Roles
2. Thêm roles `approver_user` và `report_admin` vào Contains Roles
3. Gán role `manager` cho Fred Luddy
4. Thêm widget Approvals vào trang
5. Mở **Page Editor** → chọn Instance widget Approvals
6. Trong trường **Roles** nhập: `manager`
7. Save

**Kiểm thử:**
- Impersonate Fred Luddy (có role manager) → thấy Approvals widget ✅
- Impersonate Abel Tuter (không có role) → không thấy Approvals widget ✅

---

## Bài Tập Tổng Hợp Nâng Cao

### Bài TH.1 — Xây dựng ứng dụng IT Request hoàn chỉnh

**Yêu cầu:** Tạo ứng dụng "IT Request" gồm:
1. **Client Script:** Khi `Category` = "Hardware", hiển thị trường `Device Type` và đặt bắt buộc
2. **UI Policy:** Khi `Priority` = "1", đặt trường `Justification` bắt buộc
3. **Business Rule:** Xác thực email trước khi lưu (dùng Script Include)
4. **Script Include:** `validateEmailAddress()` dùng regex
5. **Widget:** Hiển thị danh sách IT Requests trên Service Portal

**Lời giải:**

**1. onChange Client Script:**

```javascript
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
  if (isLoading || newValue === '') return;

  if (newValue == 'hardware') {
    g_form.setVisible('u_device_type', true);
    g_form.setMandatory('u_device_type', true);
  } else {
    g_form.setVisible('u_device_type', false);
    g_form.setMandatory('u_device_type', false);
    g_form.clearValue('u_device_type');
  }
}
```

**2. UI Policy:**
- Condition: `[Priority] [is] [1 - Critical]`
- Action: Justification → Mandatory: True
- Reverse if false: ✅

**3. Before Business Rule:**

```javascript
(function executeRule(current, previous) {
  var isValid = validateEmailAddress(current.u_contact_email);
  if (!isValid) {
    current.setAbortAction(true);
    gs.addErrorMessage('Email không hợp lệ: ' + current.u_contact_email);
  }
})(current, previous);
```

**4. Script Include:**

```javascript
function validateEmailAddress(emailStr) {
  emailStr = emailStr + '';
  return !!emailStr.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
}
```

**5. Widget Server Script:**

```javascript
(function() {
  var gr = new GlideRecord('x_app_it_request');
  gr.addQuery('u_requested_by', gs.getUserID());
  gr.addActiveQuery();
  gr.orderByDesc('sys_created_on');
  gr.setLimit(20);
  gr.query();

  data.requests = [];
  while (gr.next()) {
    data.requests.push({
      number: gr.getValue('number'),
      shortDesc: gr.getValue('short_description'),
      priority: gr.getDisplayValue('priority'),
      state: gr.getDisplayValue('state'),
      sysId: gr.getUniqueValue()
    });
  }
})();
```

---

### Bài TH.2 — Tổng hợp API Reference Card

**Tổng hợp tất cả API quan trọng đã học:**

#### Client-side APIs

```
┌─────────────────────────────────────────────────┐
│  g_form (GlideForm) - Quản lý form & trường     │
├─────────────────────────────────────────────────┤
│  getValue / setValue                             │
│  setMandatory / setReadOnly / setVisible         │
│  addInfoMessage / addErrorMessage                │
│  showFieldMsg / hideFieldMsg / clearMessages     │
│  addOption / clearOptions                        │
│  isNewRecord / getSections / getSectionName       │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  g_user (GlideUser) - Thông tin người dùng       │
├─────────────────────────────────────────────────┤
│  firstName / lastName / userName / userID         │
│  getFullName()                                   │
│  hasRole('role') / hasRoleExactly('role')         │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Widget API (Client)                             │
├─────────────────────────────────────────────────┤
│  spUtil: addInfoMessage, recordWatch             │
│  spModal: confirm, alert, open, prompt           │
│  c.server.get() / c.server.update()              │
│  $scope.$emit() / $scope.$on()                   │
└─────────────────────────────────────────────────┘
```

#### Server-side APIs

```
┌─────────────────────────────────────────────────┐
│  GlideRecord - Truy vấn database                │
├─────────────────────────────────────────────────┤
│  addQuery / addEncodedQuery / query              │
│  next / get / getValue / setValue                │
│  insert / update / deleteRecord                  │
│  setLimit / orderBy / orderByDesc                │
│  addActiveQuery / getRowCount                    │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  GlideSystem (gs) - Hệ thống                    │
├─────────────────────────────────────────────────┤
│  gs.getUserID() / gs.getUserDisplayName()         │
│  gs.info() / gs.warn() / gs.error()              │
│  gs.addInfoMessage() / gs.addErrorMessage()      │
│  gs.now() / gs.nowDateTime()                     │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  GlideDateTime - Ngày giờ                        │
├─────────────────────────────────────────────────┤
│  new GlideDateTime() / new GlideDateTime(str)    │
│  before() / after() / getLocalDate()             │
│  add() / subtract()                              │
└─────────────────────────────────────────────────┘
```

---

> **📌 Lưu ý:** Tất cả bài tập trong tài liệu này được thiết kế để thực hành trên ServiceNow Personal Developer Instance (PDI). Đảm bảo bạn đã có PDI trước khi bắt đầu thực hành.
>
> **Tài liệu tham khảo:** [ServiceNow Developer Site](https://developer.servicenow.com) | [API Reference](https://developer.servicenow.com/dev.do#!/reference)
