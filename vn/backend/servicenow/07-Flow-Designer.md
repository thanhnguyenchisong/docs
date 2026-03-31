# Bài 7: Flow Designer & Automation

## Mục lục
- [1. Flow Designer Overview](#1-flow-designer-overview)
- [2. Flows — Cấu trúc & Triggers](#2-flows--cấu-trúc--triggers)
- [3. Actions & Steps](#3-actions--steps)
- [4. Subflows](#4-subflows)
- [5. IntegrationHub](#5-integrationhub)
- [6. Decision Tables](#6-decision-tables)
- [7. Flow Designer vs Workflow Editor](#7-flow-designer-vs-workflow-editor)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Flow Designer Overview

### 1.1 Flow Designer là gì?

> **Flow Designer** = Low-code automation tool trong ServiceNow cho phép tạo automated processes bằng drag-and-drop, thay thế legacy Workflow Editor.

```
Flow Designer Architecture:

┌─────────────────────────────────────────┐
│          FLOW DESIGNER                   │
│                                          │
│  ┌──────────┐   ┌──────────┐            │
│  │ Triggers │──→│  Actions │            │
│  └──────────┘   └──────────┘            │
│       │              │                   │
│       │         ┌────┴────┐             │
│       │         │ Subflows│             │
│       │         └─────────┘             │
│       │                                  │
│  ┌────┴────────────────────┐            │
│  │   Flow Logic:           │            │
│  │   ├── If/Else           │            │
│  │   ├── For Each          │            │
│  │   ├── Do Until          │            │
│  │   ├── Wait For          │            │
│  │   └── Parallel          │            │
│  └─────────────────────────┘            │
│                                          │
│  ┌─────────────────────────┐            │
│  │   IntegrationHub        │            │
│  │   ├── REST              │            │
│  │   ├── SOAP              │            │
│  │   ├── Email             │            │
│  │   └── Custom Spokes     │            │
│  └─────────────────────────┘            │
└─────────────────────────────────────────┘
```

### 1.2 Ưu điểm Flow Designer

```
✅ Low-code / No-code → Non-developers có thể tạo automation
✅ Visual builder → Dễ hiểu flow logic
✅ Reusable → Subflows & Actions dùng lại
✅ Testing → Built-in test mode
✅ Versioning → Version history & rollback
✅ Future-proof → ServiceNow đang deprecate Workflow Editor
✅ IntegrationHub → Connect với external systems
```

---

## 2. Flows — Cấu trúc & Triggers

### 2.1 Flow Structure

```
Flow: "Auto-assign P1 Incidents"
│
├── TRIGGER: Record Created or Updated
│   └── Table: incident
│   └── Condition: Priority = 1
│
├── ACTION 1: Look Up Record
│   └── Table: sys_user_group
│   └── Condition: Name = "Critical Response Team"
│
├── ACTION 2: Update Record
│   └── Record: Trigger → Incident Record
│   └── Fields:
│       ├── Assignment Group = Action 1 → Group Record
│       └── State = In Progress
│
├── ACTION 3: Send Notification
│   └── To: Assignment Group Members
│   └── Subject: "P1 Alert: ${trigger.incident.number}"
│
└── END
```

### 2.2 Trigger Types

| Trigger | Mô tả | Ví dụ |
|---------|--------|-------|
| **Record** | Record created/updated/deleted | Incident created |
| **Schedule** | Time-based | Daily at 02:00 |
| **Application** | Custom triggers | Button click |
| **Inbound Email** | Email received | Support email |
| **SLA** | SLA breach/warning | P1 SLA at 75% |
| **API** | REST API call | External system trigger |
| **Service Catalog** | Item ordered | Laptop request |

### 2.3 Trigger Conditions

```
Trigger: Record Created or Updated
├── Table: incident
├── Conditions:
│   ├── Priority = 1 - Critical
│   ├── AND State = New
│   └── AND Assignment Group is empty
│
├── Run Trigger once: ✅
│   └── Chỉ chạy 1 lần cho mỗi thay đổi matching conditions
│
└── Run Trigger for each unique change: ❌
    └── Chạy mỗi khi record update match conditions
```

---

## 3. Actions & Steps

### 3.1 Built-in Actions

```
Core Actions:
├── Record Actions:
│   ├── Create Record
│   ├── Update Record  
│   ├── Delete Record
│   ├── Look Up Record
│   └── Look Up Records (multiple)
│
├── Communication:
│   ├── Send Email
│   ├── Send Notification
│   ├── Create Event
│   └── Log Message
│
├── User & Group:
│   ├── Ask for Approval
│   ├── Create Task
│   ├── Wait for Task Completion
│   └── Assign Record
│
├── Flow Logic:
│   ├── If / Else If / Else
│   ├── For Each (loop)
│   ├── Do Until
│   ├── Wait For Condition
│   ├── Parallel
│   └── End Flow
│
└── Integration:
    ├── REST Step
    ├── SOAP Step
    └── Custom Action (Script)
```

### 3.2 Flow Logic Examples

```
// IF/ELSE Example:
IF Trigger.Incident.Priority = 1
    → Action: Assign to "Critical Response Team"
    → Action: Send SMS notification
ELSE IF Trigger.Incident.Priority = 2
    → Action: Assign to "IT Support L2"
    → Action: Send Email notification
ELSE
    → Action: Assign to "IT Support L1"

// FOR EACH Example:
Look Up Records: All active P1 incidents
FOR EACH record in Look Up Results
    → Update Record: Add work_notes "Daily P1 review check"

// WAIT FOR Example:
Create approval request
WAIT FOR: Approval = Approved OR Approval = Rejected
IF Approved
    → Proceed with implementation
IF Rejected
    → Notify requestor → End Flow
```

### 3.3 Custom Script Action

```javascript
// Custom Action trong Flow Designer (Script step):

(function execute(inputs, outputs) {
    // inputs: Data từ previous steps
    var incNumber = inputs.incident_number;
    var priority = inputs.priority;
    
    // Business logic
    var gr = new GlideRecord('incident');
    if (gr.get('number', incNumber)) {
        // Calculate SLA breach risk
        var sla = new GlideRecord('task_sla');
        sla.addQuery('task', gr.getUniqueValue());
        sla.addQuery('stage', '!=', 'achieved');
        sla.query();
        
        outputs.sla_count = sla.getRowCount();
        outputs.is_high_risk = (priority == 1 && sla.hasNext());
    }
    
})(inputs, outputs);
```

---

## 4. Subflows

### 4.1 Subflow là gì?

> **Subflow** = Reusable flow component — tương tự function trong programming. Có thể gọi từ nhiều flows khác nhau.

### 4.2 Subflow Example

```
Subflow: "Manager Approval Process"
│
├── INPUTS:
│   ├── record_sys_id (Reference)
│   ├── table_name (String)
│   ├── justification (String)
│   └── approver (Reference → sys_user)
│
├── Step 1: Ask for Approval
│   └── Approver: inputs.approver
│   └── Record: inputs.record_sys_id
│
├── Step 2: Wait for Approval Response
│
├── Step 3: IF Approved
│   └── Action: Update Record → State = Approved
│   └── OUTPUT: approval_status = "approved"
│
├── Step 4: ELSE (Rejected)
│   └── Action: Update Record → State = Rejected
│   └── Action: Send Notification to requestor
│   └── OUTPUT: approval_status = "rejected"
│
└── OUTPUTS:
    └── approval_status (String)


// Gọi từ Flow khác:
Flow: "Laptop Request Process"
├── Trigger: Service Catalog Item ordered
├── Action 1: Call Subflow "Manager Approval Process"
│   ├── record_sys_id = Trigger.RITM.sys_id
│   ├── table_name = "sc_req_item"
│   ├── justification = Trigger.RITM.description
│   └── approver = Trigger.RITM.requested_for.manager
├── IF Subflow.approval_status = "approved"
│   └── Action: Create Task for IT Procurement
└── END
```

---

## 5. IntegrationHub

### 5.1 IntegrationHub Overview

> **IntegrationHub** = Extension của Flow Designer cho phép tích hợp với external systems thông qua **Spokes** (connectors).

### 5.2 Built-in Spokes

```
IntegrationHub Spokes:
├── Microsoft:
│   ├── Microsoft Teams → Send messages, create channels
│   ├── Azure AD → User provisioning
│   └── Outlook → Calendar, email
│
├── Cloud:
│   ├── AWS → EC2, S3, Lambda, CloudWatch
│   ├── Azure → VMs, Storage, Functions
│   └── GCP → Compute, Storage
│
├── Communication:
│   ├── Slack → Messages, channels
│   ├── Twilio → SMS, Voice
│   └── PagerDuty → Incident management
│
├── IT Management:
│   ├── Jira → Issues, projects
│   ├── Confluence → Pages, spaces
│   └── GitHub → Repositories, issues
│
└── Generic:
    ├── REST → Any REST API
    ├── SOAP → Any SOAP service
    ├── SSH → Remote commands
    └── PowerShell → Windows automation
```

### 5.3 REST Integration Example

```
Flow: "Create Jira Issue from Incident"
│
├── Trigger: Incident Priority = 1
│
├── Action 1: REST Step
│   ├── Connection: Jira REST API
│   ├── Method: POST
│   ├── Endpoint: /rest/api/2/issue
│   ├── Headers: Content-Type: application/json
│   ├── Body:
│   │   {
│   │     "fields": {
│   │       "project": {"key": "OPS"},
│   │       "summary": "${trigger.incident.short_description}",
│   │       "description": "${trigger.incident.description}",
│   │       "issuetype": {"name": "Bug"},
│   │       "priority": {"name": "Critical"}
│   │     }
│   │   }
│   └── Output: jira_response
│
├── Action 2: Update Incident
│   └── work_notes: "Jira issue created: ${Action1.jira_response.key}"
│
└── END
```

---

## 6. Decision Tables

### 6.1 Decision Table là gì?

> **Decision Table** = Bảng quy tắc (rule matrix) cho phép định nghĩa logic phức tạp mà không cần code. Flow Designer có thể gọi Decision Tables.

### 6.2 Decision Table Example

```
Decision Table: "Incident Auto-Assignment"

┌──────────┬──────────┬───────────┬─────────────────────┬────────────┐
│ Priority │ Category │ Location  │ Assignment Group     │ SLA Target │
├──────────┼──────────┼───────────┼─────────────────────┼────────────┤
│ P1       │ *        │ *         │ Critical Response    │ 4h         │
│ P2       │ Network  │ *         │ Network Team         │ 8h         │
│ P2       │ Software │ HCM      │ Software Support HCM │ 8h         │
│ P2       │ Software │ HN       │ Software Support HN  │ 8h         │
│ P3       │ Hardware │ *         │ Hardware Support     │ 24h        │
│ P3       │ *        │ *         │ IT Support L1        │ 24h        │
│ P4       │ *        │ *         │ IT Support L1        │ 72h        │
└──────────┴──────────┴───────────┴─────────────────────┴────────────┘

* = Any value (wildcard)
```

---

## 7. Flow Designer vs Workflow Editor

### 7.1 So sánh

| Feature | Flow Designer | Workflow Editor |
|---------|--------------|-----------------|
| **Status** | ✅ Active development | ⚠️ Legacy (deprecated) |
| **UI** | Modern, visual | Older canvas-based |
| **Reusability** | Subflows, Actions | Limited |
| **Integration** | IntegrationHub | Orchestration Activities |
| **Testing** | Built-in test mode | Manual |
| **Low-code** | ✅ Excellent | ❌ More complex |
| **Custom Script** | Script Actions | Script Activities |
| **Recommendation** | ✅ Dùng cái này | ❌ Chỉ maintain cũ |

### 7.2 Migration Path

```
ServiceNow recommendation:
1. MỚI → Luôn dùng Flow Designer
2. CŨ  → Migrate Workflows → Flows khi có cơ hội
3. Support → Workflow Editor vẫn hoạt động nhưng không có features mới
```

---

## FAQ & Best Practices

### Q1: Khi nào dùng Flow Designer vs Business Rules?
**A:**
- **Business Rules**: Simple, synchronous, single-table logic (field calculations, validation)
- **Flow Designer**: Multi-step, multi-table, async processes (approvals, integrations, orchestration)

### Q2: Flow Designer có ảnh hưởng performance không?
**A:** Flows chạy **asynchronous** (background) nên ít ảnh hưởng UI. Tuy nhiên, flows phức tạp với nhiều GlideRecord queries vẫn cần optimize.

### Best Practices

1. **Use Subflows** cho reusable logic
2. **Use Decision Tables** thay vì complex if/else chains
3. **Test mode** trước khi activate
4. **Error handling** — thêm error actions cho mỗi integration step
5. **Naming convention** — đặt tên rõ ràng cho flows/actions
6. **Don't over-engineer** — dùng simpler tools (BR, UI Policy) khi đủ

---

## Bài tập thực hành

### Bài 1: Basic Flow
1. Tạo Flow trigger khi P1 incident được tạo
2. Auto-assign to "Critical Response Team"
3. Send notification cho group members
4. Add work_notes "Auto-assigned by Flow Designer"

### Bài 2: Approval Flow
1. Tạo Flow cho Request Item approval
2. IF price > $1000 → Manager approval required
3. ELSE → Auto-approve
4. Update RITM state based on approval result

### Bài 3: Subflow
1. Tạo Subflow "Send Escalation Notification"
2. Inputs: incident_sys_id, escalation_level
3. Logic: lookup incident → lookup manager → send email
4. Gọi Subflow từ main Flow

---

**Tiếp theo:** [Bài 8: Service Portal & UI →](./08-Service-Portal.md)
