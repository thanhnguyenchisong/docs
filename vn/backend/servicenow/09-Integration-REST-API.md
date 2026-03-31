# Bài 9: Integration & REST API

## Mục lục
- [1. Integration Overview](#1-integration-overview)
- [2. REST API trong ServiceNow](#2-rest-api-trong-servicenow)
- [3. Inbound REST API](#3-inbound-rest-api)
- [4. Outbound REST API](#4-outbound-rest-api)
- [5. Import Sets & Transform Maps](#5-import-sets--transform-maps)
- [6. MID Server](#6-mid-server)
- [7. SOAP Web Services](#7-soap-web-services)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Integration Overview

### 1.1 Integration Patterns

```
ServiceNow Integration Patterns:

┌──────────────┐    Inbound     ┌──────────────┐
│  External    │───────────────→│  ServiceNow  │
│  System      │                │  Instance    │
│  (Jira, SAP) │←───────────────│              │
└──────────────┘    Outbound    └──────────────┘

Inbound: External system gọi API vào ServiceNow
Outbound: ServiceNow gọi API đến external system

Methods:
├── REST API (Most common)
├── SOAP Web Services (Legacy)
├── Import Sets (Batch data)
├── JDBC (Database connection)
├── LDAP (Directory services)
├── Email (Inbound email actions)
├── MID Server (On-premise bridge)
└── IntegrationHub (Flow Designer)
```

### 1.2 Integration User Best Practice

```
⚠️ LUÔN tạo Integration User riêng cho mỗi integration:

Integration User:
├── User Name: api_jira_integration
├── First Name: Jira
├── Last Name: Integration
├── Active: ✅
├── Web service access only: ✅  ← QUAN TRỌNG
│   └── User không thể login UI, chỉ truy cập qua API
├── Roles: 
│   └── Chỉ assign roles cần thiết (principle of least privilege)
└── Password: Strong, rotated regularly

Tại sao?
1. Audit trail rõ ràng — biết integration nào thay đổi data
2. Security — giới hạn quyền chính xác
3. Monitoring — track API usage theo user
4. Disable dễ — tắt integration không ảnh hưởng others
```

---

## 2. REST API trong ServiceNow

### 2.1 ServiceNow REST APIs

```
ServiceNow cung cấp nhiều REST APIs có sẵn:

Table API:        /api/now/table/{tableName}
Aggregate API:    /api/now/stats/{tableName}
Import Set API:   /api/now/import/{tableName}
Attachment API:   /api/now/attachment
CMDB API:         /api/now/cmdb/instance/{className}
Scripted REST:    /api/{namespace}/{api_name}

Authentication:
├── Basic Auth (username:password)
├── OAuth 2.0
├── API Key
└── Mutual TLS
```

### 2.2 REST API Explorer

```
Filter Navigator: "REST API Explorer"

REST API Explorer cho phép:
├── Browse available APIs
├── Test API calls trực tiếp trong browser
├── Generate code (cURL, Python, JavaScript, PowerShell)
├── View request/response headers
└── Test authentication

URL: https://<instance>.service-now.com/$restapi.do
```

---

## 3. Inbound REST API

### 3.1 Table API — CRUD Operations

```bash
# Base URL: https://<instance>.service-now.com/api/now/table

# ============ GET — Query records ============
# Get all active P1 incidents
GET /api/now/table/incident?sysparm_query=priority=1^active=true
    &sysparm_fields=number,short_description,priority,state
    &sysparm_limit=10
    &sysparm_display_value=true
Headers:
  Accept: application/json
  Authorization: Basic <base64(user:pass)>

# Response:
{
  "result": [
    {
      "number": "INC0010001",
      "short_description": "Server down",
      "priority": "1 - Critical",
      "state": "In Progress"
    }
  ]
}

# ============ GET — Single record ============
GET /api/now/table/incident/{sys_id}

# ============ POST — Create record ============
POST /api/now/table/incident
Content-Type: application/json
{
  "caller_id": "nguyen.thanh",
  "short_description": "Cannot access email",
  "description": "Email client shows connection error since 9am",
  "priority": "2",
  "category": "software",
  "subcategory": "email"
}

# ============ PUT — Update record ============
PUT /api/now/table/incident/{sys_id}
Content-Type: application/json
{
  "state": "2",
  "assigned_to": "tran.van.a",
  "work_notes": "Investigating the issue"
}

# ============ PATCH — Partial update ============
PATCH /api/now/table/incident/{sys_id}
Content-Type: application/json
{
  "priority": "1"
}

# ============ DELETE — Delete record ============
DELETE /api/now/table/incident/{sys_id}
```

### 3.2 Query Parameters

| Parameter | Mô tả | Ví dụ |
|-----------|--------|-------|
| `sysparm_query` | Encoded query | `priority=1^state=2` |
| `sysparm_fields` | Fields to return | `number,state,priority` |
| `sysparm_limit` | Max records | `10` |
| `sysparm_offset` | Pagination offset | `20` |
| `sysparm_display_value` | Return display values | `true` |
| `sysparm_exclude_reference_link` | No reference links | `true` |
| `sysparm_suppress_pagination_header` | No pagination header | `true` |

### 3.3 Scripted REST API

```
Scripted REST API cho phép tạo custom endpoints:

REST API: "Custom Incident API"
├── Namespace: x_myapp
├── API ID: incident_api
├── Base URI: /api/x_myapp/incident_api
│
├── Resource: GET /active-p1
│   └── Script:
│       (function process(request, response) {
│           var gr = new GlideRecord('incident');
│           gr.addQuery('priority', 1);
│           gr.addQuery('active', true);
│           gr.query();
│           
│           var incidents = [];
│           while (gr.next()) {
│               incidents.push({
│                   number: gr.getDisplayValue('number'),
│                   description: gr.getValue('short_description'),
│                   assigned_to: gr.getDisplayValue('assigned_to'),
│                   created: gr.getValue('sys_created_on')
│               });
│           }
│           
│           response.setBody({
│               count: incidents.length,
│               incidents: incidents
│           });
│           response.setStatus(200);
│       })(request, response);
│
├── Resource: POST /create
│   └── Script:
│       (function process(request, response) {
│           var body = request.body.data;
│           var gr = new GlideRecord('incident');
│           gr.initialize();
│           gr.short_description = body.short_description;
│           gr.description = body.description;
│           gr.caller_id.setDisplayValue(body.caller);
│           gr.priority = body.priority || 3;
│           var sysId = gr.insert();
│           
│           response.setBody({
│               sys_id: sysId,
│               number: gr.getDisplayValue('number'),
│               message: 'Incident created successfully'
│           });
│           response.setStatus(201);
│       })(request, response);
```

---

## 4. Outbound REST API

### 4.1 REST Message

```
Outbound REST Message (sys_rest_message):

Name: Slack Notification
Endpoint: https://hooks.slack.com/services/T.../B.../xxx
Authentication: No authentication (webhook)

HTTP Methods:
├── POST - Send Message
│   ├── Endpoint: (same as base)
│   ├── Content-Type: application/json
│   └── Content:
│       {
│         "channel": "${channel}",
│         "username": "ServiceNow Bot",
│         "text": "${message}",
│         "icon_emoji": ":servicenow:"
│       }
│   
│   Variable Substitutions:
│   ├── ${channel}  → #it-alerts
│   └── ${message}  → Dynamic message from calling script
```

### 4.2 Calling Outbound REST from Script

```javascript
// Gọi Outbound REST Message từ Business Rule / Script Include

// Method 1: Using REST Message record
var sm = new sn_ws.RESTMessageV2('Slack Notification', 'POST - Send Message');
sm.setStringParameterNoEscape('channel', '#it-alerts');
sm.setStringParameterNoEscape('message', 
    ':rotating_light: P1 Incident: ' + current.number + '\n' +
    'Description: ' + current.short_description + '\n' +
    'Assigned to: ' + current.assigned_to.getDisplayValue()
);

var response = sm.execute();
var httpStatus = response.getStatusCode();
var body = response.getBody();

if (httpStatus == 200) {
    gs.info('Slack notification sent successfully');
} else {
    gs.error('Slack notification failed: ' + httpStatus + ' - ' + body);
}


// Method 2: Direct REST call (without REST Message record)
var request = new sn_ws.RESTMessageV2();
request.setEndpoint('https://api.example.com/v1/tickets');
request.setHttpMethod('POST');
request.setRequestHeader('Content-Type', 'application/json');
request.setRequestHeader('Authorization', 'Bearer ' + token);
request.setRequestBody(JSON.stringify({
    title: current.short_description,
    priority: current.priority.getDisplayValue()
}));

var response = request.execute();
gs.info('Response: ' + response.getStatusCode());
```

---

## 5. Import Sets & Transform Maps

### 5.1 Data Import Flow

```
External Data (CSV, Excel, JDBC, API)
         │
         ▼
┌─────────────────────┐
│  Data Source          │ → Defines where data comes from
│  (sys_data_source)   │
└─────────┬───────────┘
          │ Load
          ▼
┌─────────────────────┐
│  Import Set Table    │ → Staging table for raw data
│  (u_import_xxx)      │ → Auto-created based on columns
└─────────┬───────────┘
          │ Transform
          ▼
┌─────────────────────┐
│  Transform Map       │ → Rules for mapping columns
│  (sys_transform_map) │ → to target table fields
└─────────┬───────────┘
          │ 
          ▼
┌─────────────────────┐
│  Target Table        │ → Final destination
│  (sys_user, cmdb_ci) │ → Insert or Update (coalesce)
└─────────────────────┘
```

### 5.2 Coalesce — Insert or Update

```
Coalesce = Field dùng để match records (giống UPSERT)

Transform Map:
├── Source: email_address → Target: email
│   └── Coalesce: ✅
├── Source: first_name → Target: first_name
├── Source: last_name → Target: last_name
└── Source: department_name → Target: department (lookup)

Logic:
1. Import row: email = "thanh@company.com"
2. Check sys_user: email = "thanh@company.com" exists?
   → YES → UPDATE existing record
   → NO  → INSERT new record
```

---

## 6. MID Server

### 6.1 MID Server là gì?

> **MID Server** = Middleware component cài đặt trong corporate network. Đóng vai trò cầu nối giữa ServiceNow cloud instance và on-premise resources.

```
                     Internet
                        │
┌───────────────────────┼───────────────────┐
│  ServiceNow Cloud     │                   │
│  Instance             │                   │
└───────────────────────┼───────────────────┘
                        │
                   ┌────┴────┐
                   │Firewall │
                   └────┬────┘
                        │
┌───────────────────────┼───────────────────┐
│  Corporate Network    │                   │
│                  ┌────┴────┐              │
│                  │MID Server│             │
│                  └────┬────┘              │
│                       │                   │
│  ┌────────┐  ┌────────┤  ┌──────────┐    │
│  │ AD/LDAP│  │Database│  │ Servers  │    │
│  └────────┘  └────────┘  └──────────┘    │
│  ┌────────┐  ┌────────┐  ┌──────────┐    │
│  │ vCenter│  │ SCCM   │  │ Network  │    │
│  └────────┘  └────────┘  │ Devices  │    │
│                           └──────────┘    │
└───────────────────────────────────────────┘

MID Server dùng cho:
├── Discovery → Scan network, discover CIs
├── Service Mapping → Map services
├── LDAP Integration → Sync users from AD
├── Orchestration → Run commands on servers
├── Import Sets → JDBC connections to databases
└── Event Management → Collect events from monitoring tools
```

---

## 7. SOAP Web Services

### 7.1 SOAP trong ServiceNow

```
ServiceNow hỗ trợ SOAP (legacy):

WSDL URL: https://<instance>.service-now.com/incident.do?WSDL

SOAP Operations:
├── get       → Get single record
├── getKeys   → Get sys_ids matching query
├── getRecords→ Get multiple records
├── insert    → Create record
├── update    → Update record
└── deleteRecord → Delete record

⚠️ SOAP đang bị phase out → ưu tiên REST API cho integrations mới
```

---

## FAQ & Best Practices

### Q1: REST hay SOAP?
**A:** **REST** cho mọi integration mới. SOAP chỉ khi external system chỉ hỗ trợ SOAP.

### Q2: Basic Auth hay OAuth?
**A:** **OAuth 2.0** cho production. Basic Auth chấp nhận cho development/testing nhưng không khuyến nghị cho production.

### Q3: Rate limiting?
**A:** ServiceNow có rate limits. Default ~tương đương vài trăm requests/minute. Dùng pagination, batch operations để tối ưu.

### Best Practices

1. **Integration User** riêng cho mỗi integration (Web service access only)
2. **OAuth 2.0** cho authentication thay vì Basic Auth
3. **Error handling** cho mọi API call
4. **Pagination** cho large result sets (`sysparm_limit` + `sysparm_offset`)
5. **Logging** — log API calls cho troubleshooting
6. **sysparm_fields** — chỉ request fields cần thiết (giảm payload)
7. **sysparm_display_value** — cân nhắc khi nào cần display vs raw value
8. **MID Server** cho on-premise integrations

---

## Bài tập thực hành

### Bài 1: REST API Explorer
1. Mở REST API Explorer trong PDI
2. GET incidents: `sysparm_query=priority=1&sysparm_limit=5`
3. POST: tạo incident mới qua API
4. PUT: update state của incident

### Bài 2: Scripted REST API
1. Tạo Scripted REST API: "My Incident API"
2. Resource GET `/summary` → return incident counts by priority
3. Resource POST `/create` → create incident from JSON body
4. Test bằng Postman hoặc REST API Explorer

### Bài 3: Outbound REST
1. Tạo REST Message → webhook URL (dùng webhook.site)
2. Script: gửi notification khi P1 incident created
3. Verify webhook.site nhận được request

---

**Tiếp theo:** [Bài 10: ITOM — IT Operations Management →](./10-ITOM.md)
