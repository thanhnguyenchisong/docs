# Bài 8: Service Portal & UI

## Mục lục
- [1. Service Portal Overview](#1-service-portal-overview)
- [2. Portal Architecture](#2-portal-architecture)
- [3. Widgets](#3-widgets)
- [4. Service Catalog trong Portal](#4-service-catalog-trong-portal)
- [5. Employee Center](#5-employee-center)
- [6. Workspace](#6-workspace)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Service Portal Overview

### 1.1 Service Portal là gì?

> **Service Portal** = Giao diện **frontend** cho end-users (non-IT). Thay vì dùng backend ServiceNow UI (phức tạp), users truy cập Service Portal để tạo requests, tra knowledge, xem tickets.

```
Backend UI (platform view):
→ Dành cho: IT staff, admins, developers
→ Full features, complex navigation

Service Portal (frontend view):
→ Dành cho: End users, employees
→ Simple, beautiful, self-service
→ URL: https://instance.service-now.com/sp
```

### 1.2 Portal vs Backend UI

| Feature | Service Portal | Backend UI |
|---------|---------------|------------|
| **Target user** | End users | IT staff/Admin |
| **Complexity** | Simple, self-service | Full platform |
| **Technology** | AngularJS, Bootstrap | Glide UI engine |
| **Customizable** | Widgets, CSS, themes | Form layout, lists |
| **URL** | `/sp` or custom | `/nav_to.do` |
| **Mobile** | Responsive | Not optimal |

---

## 2. Portal Architecture

### 2.1 Components

```
Service Portal Architecture:

Portal (sp_portal)
├── Theme (sp_theme)
│   ├── CSS Variables
│   ├── Header/Footer
│   └── Branding
│
├── Pages (sp_page)
│   ├── Homepage
│   ├── Catalog Page
│   ├── Ticket Page
│   ├── Knowledge Page
│   └── Custom Pages
│
├── Widgets (sp_widget)
│   ├── HTML Template
│   ├── CSS (SCSS)
│   ├── Client Script (AngularJS)
│   └── Server Script (GlideRecord)
│
├── Header & Menu
│   ├── Logo
│   ├── Navigation
│   └── Search bar
│
└── Angular Providers
    ├── Services
    ├── Directives
    └── Filters
```

### 2.2 Portal Configuration

```
Filter Navigator: "Service Portal > Portals"

Portal Record:
├── Title:              MyCompany IT Portal
├── URL Suffix:         sp
├── Homepage:           index
├── Login Page:         login
├── 404 Page:           404
├── Theme:              MyCompany Theme
├── Knowledge Base:     IT Support KB
├── Catalog:            Service Catalog
├── CSS Variables:
│   ├── --brand-primary: #0056b3
│   ├── --brand-success: #28a745
│   └── --nav-bg: #1a1a2e
└── Quick Start Config:
    ├── Logo
    ├── Banner Image
    └── Welcome Message
```

---

## 3. Widgets

### 3.1 Widget Structure

```
Widget: "My Active Tickets"
│
├── HTML Template (AngularJS):
│   <div class="panel panel-default">
│     <div class="panel-heading">
│       <h3>My Active Tickets</h3>
│     </div>
│     <div class="panel-body">
│       <table class="table">
│         <tr ng-repeat="ticket in c.data.tickets">
│           <td>{{ticket.number}}</td>
│           <td>{{ticket.short_description}}</td>
│           <td>{{ticket.state}}</td>
│         </tr>
│       </table>
│     </div>
│   </div>
│
├── CSS (SCSS):
│   .panel-heading { background-color: $brand-primary; color: white; }
│   .table tr:hover { background-color: #f5f5f5; }
│
├── Client Script (AngularJS Controller):
│   function($scope) {
│     var c = this;
│     // c.data = data from Server Script
│   }
│
└── Server Script:
    (function() {
      var gr = new GlideRecord('incident');
      gr.addQuery('caller_id', gs.getUserID());
      gr.addQuery('state', 'NOT IN', '7,8');
      gr.orderByDesc('sys_created_on');
      gr.setLimit(10);
      gr.query();
      
      data.tickets = [];
      while (gr.next()) {
        data.tickets.push({
          sys_id: gr.getUniqueValue(),
          number: gr.getDisplayValue('number'),
          short_description: gr.getDisplayValue('short_description'),
          state: gr.getDisplayValue('state'),
          priority: gr.getDisplayValue('priority')
        });
      }
    })();
```

### 3.2 Widget Communication

```
Server ↔ Client Communication:

Server Script → data object → Client Script
Client Script → c.server.get({action: 'x'}) → Server Script

// Server Script:
(function() {
    if (input && input.action == 'getDetails') {
        var gr = new GlideRecord('incident');
        if (gr.get(input.sys_id)) {
            data.detail = {
                description: gr.getValue('description'),
                work_notes: gr.getValue('work_notes')
            };
        }
    }
})();

// Client Script:
function($scope) {
    var c = this;
    c.getDetails = function(sysId) {
        c.server.get({
            action: 'getDetails',
            sys_id: sysId
        }).then(function(response) {
            c.data.detail = response.data.detail;
        });
    };
}
```

### 3.3 OOB Widgets quan trọng

| Widget | Mô tả |
|--------|--------|
| **Homepage Search** | Search bar tìm knowledge/catalog |
| **SC Category Page** | Danh sách categories |
| **SC Catalog Item** | Form đặt hàng catalog item |
| **My Requests** | Danh sách requests của user |
| **My Incidents** | Danh sách incidents của user |
| **Knowledge Article View** | Hiển thị KB article |
| **Approval** | Approve/reject records |
| **Chat Support** | Live chat with agent |

---

## 4. Service Catalog trong Portal

### 4.1 User Journey

```
Service Portal - Service Catalog:

1. User truy cập Portal → Homepage
2. Browse Categories hoặc Search
3. Click Catalog Item → Form hiển thị
4. Điền thông tin (variables) → Submit
5. Request/RITM/Tasks được tạo
6. User theo dõi status trong "My Requests"
```

### 4.2 Catalog Variable Types

| Variable Type | Mô tả | Ví dụ |
|--------------|--------|-------|
| **Single Line Text** | Text ngắn | Employee Name |
| **Multi Line Text** | Text dài | Justification |
| **Select Box** | Dropdown | Department |
| **Check Box** | Yes/No | Need VPN access? |
| **Reference** | Link to table | Approver (sys_user) |
| **Date** | Date picker | Needed by date |
| **Attachment** | File upload | Supporting document |
| **Lookup Select Box** | Search + select | CI Selection |
| **Container Start/End** | Group variables | Section headers |
| **Macro** | Custom HTML widget | Custom UI element |

---

## 5. Employee Center

### 5.1 Employee Center vs Service Portal

```
Employee Center = Next-gen portal (thay thế Service Portal)

Employee Center:
├── Unified experience cho tất cả departments
├── Content Management (articles, announcements)
├── Topic-based navigation
├── Personalized content
├── Modern UI (Seismic components)
└── Multi-department: IT + HR + Facilities + Legal

Service Portal:
├── IT-focused self-service
├── Widget-based customization
├── AngularJS technology
├── Mature, well-documented
└── Still widely used
```

---

## 6. Workspace

### 6.1 Agent Workspace

> **Workspace** = Giao diện hiện đại cho IT agents (thay thế backend list/form view). Tối ưu cho productivity.

```
Agent Workspace Features:
├── Multi-tab → Mở nhiều records cùng lúc
├── Side panels → Related info không cần navigate
├── Live feed → Real-time activity stream
├── Playbook → Guided resolution steps
├── AI suggestions → Now Assist recommendations
├── Contextual search → Tìm KB articles inline
└── Performance → Faster than traditional UI
```

---

## FAQ & Best Practices

### Q1: Nên dùng Service Portal hay Employee Center?
**A:** 
- **New implementations**: Xem xét Employee Center nếu cần multi-department
- **Existing**: Service Portal vẫn fully supported
- **IT-only**: Service Portal đủ dùng

### Q2: Có thể customize Service Portal theme?
**A:** Có. Portal > Theme > CSS Variables, Header/Footer widgets, custom SCSS.

### Best Practices

1. **OOB widgets first** — customize chỉ khi cần
2. **Mobile responsive** — test trên mobile
3. **Performance** — limit GlideRecord queries trong widget server script
4. **Branding** — consistent logo, colors, fonts
5. **Accessibility** — WCAG compliance cho portal

---

## Bài tập thực hành

### Bài 1: Portal Exploration
1. Truy cập PDI Service Portal: `https://<instance>.service-now.com/sp`
2. Browse Service Catalog → order 1 item
3. Xem "My Requests" → track status
4. Tìm knowledge article qua search

### Bài 2: Custom Widget
1. Tạo widget mới "Welcome Banner"
2. HTML: hiện tên user, greeting message
3. Server Script: query user info
4. CSS: style đẹp với brand colors
5. Add widget lên homepage

---

**Tiếp theo:** [Bài 9: Integration & REST API →](./09-Integration-REST-API.md)
