# Bài 3: ITSM — IT Service Management

## Mục lục
- [1. ITSM Overview](#1-itsm-overview)
- [2. Incident Management](#2-incident-management)
- [3. Problem Management](#3-problem-management)
- [4. Change Management](#4-change-management)
- [5. Request Management (Service Catalog)](#5-request-management-service-catalog)
- [6. Knowledge Management](#6-knowledge-management)
- [7. SLA Management](#7-sla-management)
- [8. Major Incident Management](#8-major-incident-management)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. ITSM Overview

### 1.1 ITIL Framework trong ServiceNow

ServiceNow ITSM được xây dựng trên **ITIL (Information Technology Infrastructure Library)** — best practices cho quản lý dịch vụ IT.

```
ITIL Service Lifecycle trong ServiceNow:

┌───────────────────────────────────────────────────┐
│                SERVICE STRATEGY                    │
│  (Portfolio Management, Financial Management)      │
├───────────────────────────────────────────────────┤
│                SERVICE DESIGN                      │
│  (Service Catalog, SLA, Availability Management)   │
├───────────────────────────────────────────────────┤
│              SERVICE TRANSITION                    │
│  (Change Management, Knowledge Management)         │
├───────────────────────────────────────────────────┤
│              SERVICE OPERATION                     │
│  (Incident, Problem, Request, Event Management)    │
├───────────────────────────────────────────────────┤
│          CONTINUAL SERVICE IMPROVEMENT             │
│  (Reporting, Analytics, Process Improvement)       │
└───────────────────────────────────────────────────┘
```

### 1.2 Mối quan hệ giữa các ITSM processes

```
      User báo lỗi
           │
           ▼
    ┌──────────────┐
    │   INCIDENT   │──── (nhiều incidents) ──→ ┌──────────┐
    │  Management  │                           │ PROBLEM  │
    └──────┬───────┘                           │Management│
           │                                    └────┬─────┘
           │ Cần fix                                  │ Root cause → fix
           │                                          │
           ▼                                          ▼
    ┌──────────────┐                           ┌──────────────┐
    │   CHANGE     │◄──────────────────────────│   CHANGE     │
    │  Management  │                           │   REQUEST    │
    └──────┬───────┘                           └──────────────┘
           │
           │ Thay đổi thành công
           ▼
    ┌──────────────┐
    │  KNOWLEDGE   │ ← Document solution
    │  Management  │
    └──────────────┘
```

---

## 2. Incident Management

### 2.1 Incident là gì?

> **Incident** = Sự gián đoạn (interruption) hoặc giảm chất lượng (degradation) của một dịch vụ IT.

**Mục tiêu:** Khôi phục dịch vụ bình thường **nhanh nhất có thể**, giảm thiểu ảnh hưởng đến business.

### 2.2 Incident Lifecycle

```
State Flow:

  ┌──────┐     ┌─────────────┐     ┌─────────┐
  │ New  │────→│ In Progress │────→│On Hold  │
  │ (1)  │     │    (2)      │     │  (3)    │
  └──┬───┘     └──────┬──────┘     └────┬────┘
     │                │                  │
     │                │                  │
     │                ▼                  │
     │         ┌──────────────┐          │
     │         │  Resolved    │◄─────────┘
     │         │    (6)       │
     │         └──────┬───────┘
     │                │
     │                │ Auto-close (sau X ngày)
     │                ▼
     │         ┌──────────────┐
     └────────→│   Closed     │
               │    (7)       │
               └──────────────┘

State Values:
1 = New
2 = In Progress  
3 = On Hold
6 = Resolved
7 = Closed
8 = Canceled
```

### 2.3 Priority Matrix

Priority được tính từ **Impact × Urgency**:

```
                          URGENCY
                    High    Medium    Low
              ┌─────────┬─────────┬─────────┐
        High  │  P1     │  P2     │  P3     │
              │Critical │ High    │ Moderate│
IMPACT  ──────┼─────────┼─────────┼─────────┤
        Med   │  P2     │  P3     │  P4     │
              │ High    │ Moderate│ Low     │
        ──────┼─────────┼─────────┼─────────┤
        Low   │  P3     │  P4     │  P5     │
              │Moderate │ Low     │Planning │
              └─────────┴─────────┴─────────┘

Impact:  Ảnh hưởng đến bao nhiêu users/services
Urgency: Mức độ cấp bách cần xử lý
```

### 2.4 Incident Form — Key Fields

```
┌─────────────────────────────────────────────────────┐
│ Incident: INC0010001                                │
│                                                     │
│ Number:              INC0010001                     │
│ Caller:              [Nguyen Thanh]                 │
│ Category:            [Hardware]                     │
│ Subcategory:         [Monitor]                      │
│ Contact Type:        [Phone]                        │
│ ─────────────────────────────────────────────       │
│ State:               [In Progress ▼]                │
│ Impact:              [2 - Medium ▼]                 │
│ Urgency:             [2 - Medium ▼]                 │
│ Priority:            3 - Moderate (auto-calculated) │
│ ─────────────────────────────────────────────       │
│ Assignment Group:    [IT Support L2]                │
│ Assigned to:         [Tran Van A]                   │
│ Configuration Item:  [ERP Server 01]                │
│ ─────────────────────────────────────────────       │
│ Short Description:   Monitor không hiển thị         │
│ Description:         Chi tiết sự cố...              │
│ ─────────────────────────────────────────────       │
│ Work notes:    [Internal notes - user không thấy]   │
│ Additional comments: [Customer-visible notes]       │
│ ─────────────────────────────────────────────       │
│ Resolution code:     [Solved (Permanently)]         │
│ Resolution notes:    Thay cáp VGA mới               │
│ ─────────────────────────────────────────────       │
│ [Save] [Update] [Resolve] [Close]                   │
└─────────────────────────────────────────────────────┘
```

### 2.5 Assignment Rules

```
Assignment Rules tự động gán incident cho group/user phù hợp:

Rule 1: Category = "Network" → Assignment Group = "Network Team"
Rule 2: Category = "Software" AND CI contains "SAP" → Group = "SAP Team"
Rule 3: Priority = 1 → Group = "Critical Response Team"

Filter Navigator: "sys_trigger_assignment.list"
```

### 2.6 Auto-Close & Inactivity Monitor

```
System Properties:

# Tự động close incident sau X ngày ở trạng thái Resolved
glide.ui.autoclose.time = 3  (3 business days)

# Inactivity Monitor — nhắc nhở nếu incident không hoạt động
# Scheduled Job: "Incident Inactivity Monitor"
# Send notification nếu incident không cập nhật > 2 ngày
```

---

## 3. Problem Management

### 3.1 Problem vs Incident

| Feature | Incident | Problem |
|---------|----------|---------|
| **Mục tiêu** | Khôi phục service ASAP | Tìm root cause |
| **Timeline** | Ngắn (hours/days) | Dài (days/weeks) |
| **Trigger** | User báo lỗi | Nhiều incidents cùng loại |
| **Output** | Service restored | Known Error, Workaround |
| **Table** | `incident` | `problem` |
| **Reactive?** | Có (reactive) | Có thể proactive |

### 3.2 Problem Lifecycle

```
State Flow:

┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│ New / Open   │────→│Under Invest.   │────→│  Known Error │
│   (1)        │     │   (101)        │     │    (106)     │
└──────────────┘     └────────────────┘     └──────┬───────┘
                                                     │
                            ┌────────────────────────┘
                            ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  Fix Applied │────→│    Closed    │
                     │   (107)      │     │    (4)       │
                     └──────────────┘     └──────────────┘

Key Concepts:
- Known Error: Root cause đã xác định + Workaround có sẵn
- Known Error Database (KEDB): Lưu trữ các known errors
- Workaround: Giải pháp tạm thời (giảm impact, chưa fix root cause)
```

### 3.3 Root Cause Analysis (RCA)

```
RCA Methods:
1. 5 Whys Analysis
   - Why did the server crash? → Out of memory
   - Why out of memory? → Memory leak in app
   - Why memory leak? → Bug in latest release
   - Why bug in release? → Insufficient testing
   - Why insufficient testing? → No load testing process

2. Fishbone Diagram (Ishikawa)
   People | Process | Technology | Environment
   
3. Timeline Analysis
   - Chronological list of events leading to the problem
```

---

## 4. Change Management

### 4.1 Change là gì?

> **Change** = Thêm, sửa, hoặc xóa bất kỳ thứ gì có thể ảnh hưởng đến dịch vụ IT.

**Mục tiêu:** Thực hiện thay đổi có kế hoạch, giảm thiểu rủi ro gián đoạn dịch vụ.

### 4.2 Change Types

| Type | Mô tả | Phê duyệt | Ví dụ |
|------|--------|-----------|-------|
| **Standard** | Pre-approved, low risk | ❌ Không cần | Password reset, add user |
| **Normal** | Requires assessment & approval | ✅ CAB approval | Server upgrade, patch |
| **Emergency** | Urgent fix for critical issue | ✅ ECAB (expedited) | Hotfix production bug |

### 4.3 Normal Change Lifecycle

```
State Flow:

┌────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  New   │───→│ Assess   │───→│ Authorize   │───→│Scheduled │
│  (-5)  │    │  (-4)    │    │  (-3)       │    │  (-2)    │
└────────┘    └──────────┘    └─────────────┘    └────┬─────┘
                                                       │
           ┌──────────────────────────────────────────┘
           ▼
    ┌──────────────┐    ┌──────────┐    ┌──────────┐
    │ Implement    │───→│ Review   │───→│  Closed  │
    │   (-1)       │    │  (0)     │    │  (3)     │
    └──────────────┘    └──────────┘    └──────────┘

Key Fields:
- Risk:        High / Moderate / Low
- Conflict Status: Checking for scheduling conflicts
- CAB Date:    Change Advisory Board meeting date
- Backout Plan: Plan to rollback if change fails
```

### 4.4 Change Advisory Board (CAB)

```
CAB = Committee phê duyệt Normal changes

CAB Members:
├── Change Manager (chair)
├── IT managers
├── Technical leads
├── Business representatives
└── Security team

CAB Process:
1. Change owner submits Change Request
2. Change Manager reviews → adds to CAB agenda
3. CAB meeting: discuss risks, impacts, schedule
4. CAB votes: Approve / Reject / Defer
5. If approved → schedule implementation
```

### 4.5 Conflict Detection

```
ServiceNow tự động detect Change Conflicts:

Conflict Types:
├── CI Conflict:     Cùng CI, cùng thời điểm
├── Blackout Window: Thay đổi trong thời gian bị cấm (freeze period)
├── Maintenance:     Conflict với scheduled maintenance
└── Already Running: CI đã có change đang implement

# Ví dụ:
Change CHG0010001: Upgrade Database Server
Change CHG0010002: Patch Database Server
→ CONFLICT : Cùng CI "DB Server 01" cùng thời điểm
→ Resolution: Reschedule 1 trong 2 changes
```

---

## 5. Request Management (Service Catalog)

### 5.1 Service Catalog Architecture

```
Service Catalog Structure:

Service Catalog
├── Category: Hardware
│   ├── Catalog Item: Request New Laptop
│   ├── Catalog Item: Request Additional Monitor
│   └── Catalog Item: Replace Keyboard
│
├── Category: Software
│   ├── Catalog Item: Install Adobe Creative Suite
│   ├── Catalog Item: Request VPN Access
│   └── Catalog Item: Request Development Tools
│
├── Category: Access & Accounts
│   ├── Catalog Item: New Employee Onboarding
│   ├── Catalog Item: Password Reset
│   └── Catalog Item: Request System Access
│
└── Category: HR Services
    ├── Catalog Item: Request Time Off
    └── Catalog Item: Update Personal Information
```

### 5.2 Request Workflow

```
User Journey:

┌────────────────┐
│  Service Portal│ → User browse catalog
└───────┬────────┘
        │ User orders
        ▼
┌────────────────┐
│  sc_request    │ → Request record created (REQ0010001)
└───────┬────────┘
        │ Generates
        ▼
┌────────────────┐
│  sc_req_item   │ → Request Item (RITM0010001)
└───────┬────────┘
        │ May generate
        ▼
┌────────────────┐
│  sc_task       │ → Catalog Tasks (SCTASK0010001)
└────────────────┘   → Assigned to fulfillment groups

Ví dụ:
REQ0010001: "New Employee Onboarding"
├── RITM0010001: New Laptop
│   ├── SCTASK0010001: Order laptop (IT Procurement)
│   └── SCTASK0010002: Setup laptop (Desktop Support)
├── RITM0010002: VPN Access
│   └── SCTASK0010003: Create VPN account (Network Team)
└── RITM0010003: Email Account
    └── SCTASK0010004: Create email (Exchange Team)
```

### 5.3 Catalog Item Configuration

```
Catalog Item: "Request New Laptop"

General:
├── Name: Request New Laptop
├── Category: Hardware
├── Short description: Order a new standard laptop
├── Price: $1,200
├── Delivery time: 5 business days
├── Picture: laptop.png

Variables (Form fields):
├── Operating System: [Windows 11 / macOS] (Select Box)
├── RAM: [8GB / 16GB / 32GB] (Select Box)
├── Justification: [text] (Multi-line Text)
├── Needed by: [date] (Date)
└── Approver: [reference → sys_user] (Reference)

Workflow / Flow:
├── Auto-approval if price < $500
├── Manager approval if price >= $500
├── Generate catalog tasks
└── Send notification on fulfillment
```

---

## 6. Knowledge Management

### 6.1 Knowledge Base Structure

```
Knowledge Base
├── KB: IT Support
│   ├── Category: Common Issues
│   │   ├── Article: How to reset password
│   │   ├── Article: VPN troubleshooting guide
│   │   └── Article: Printer setup instructions
│   │
│   ├── Category: FAQs
│   │   ├── Article: How to request software
│   │   └── Article: Working from home setup
│   │
│   └── Category: Policies
│       ├── Article: IT Security Policy
│       └── Article: Acceptable Use Policy
│
└── KB: HR Knowledge
    ├── Category: Benefits
    └── Category: Policies
```

### 6.2 Knowledge Article Lifecycle

```
Article States:

Draft → Review → Published → Retired

Draft (1):     Author tạo và chỉnh sửa
Review (2):    Gửi cho reviewer/approver
Published (3): Hiển thị cho users
Retired (4):   Ẩn đi (nhưng không xóa)

# Knowledge workflow tự động move qua states
# Approver review → approve/reject → published/back to draft
```

### 6.3 Knowledge Integration

```
Knowledge tích hợp với ITSM:

Incident Form:
┌───────────────────────────────────┐
│ Short Description: VPN not working│
│                                   │
│ 💡 Suggested Knowledge:           │
│ ├── KB0010001: VPN Troubleshooting│
│ ├── KB0010002: VPN Setup Guide    │
│ └── KB0010003: Network Issues     │
│                                   │
│ [Attach Article] [View Article]   │
└───────────────────────────────────┘

→ Agent xem KB article → tìm solution → resolve incident nhanh hơn
→ Reduced MTTR (Mean Time To Resolve)
```

---

## 7. SLA Management

### 7.1 SLA là gì?

> **SLA (Service Level Agreement)** = Thỏa thuận về mức độ dịch vụ (response time, resolution time) giữa provider và customer.

### 7.2 SLA Definitions

```
SLA Definition (contract_sla)
├── Name:           P1 Incident Resolution
├── Table:          incident
├── Duration type:  Duration
├── Duration:       4 hours
├── Schedule:       24x7 (hoặc Business Hours: 8x5)
│
├── Start Condition:
│   priority = 1 AND state = In Progress
│
├── Pause Condition:
│   state = On Hold
│
├── Stop Condition:
│   state = Resolved OR state = Closed
│
├── Reset Condition:
│   (not commonly used)
│
└── Breach: Notification to Management when SLA breached
```

### 7.3 SLA Targets

| Priority | Response Time | Resolution Time |
|----------|--------------|-----------------|
| P1 - Critical | 15 minutes | 4 hours |
| P2 - High | 30 minutes | 8 hours |
| P3 - Moderate | 2 hours | 24 hours |
| P4 - Low | 4 hours | 72 hours |
| P5 - Planning | 8 hours | 1 week |

### 7.4 SLA Workflow Stages

```
SLA Timeline:

  ├──────────────────────────────────────────────┤
  0%                    50%            75%     100% (BREACH!)
  │                      │              │        │
  Start                50% Alert    75% Alert  Breach!
                     (notification)            (escalation)

Ví dụ P1 = 4 hours:
0h    → SLA attached to incident
2h    → 50% notification: "P1 incident 50% SLA consumed"  
3h    → 75% notification: "P1 incident approaching breach"
4h    → BREACH! → Escalation to management
```

---

## 8. Major Incident Management

### 8.1 Major Incident là gì?

> **Major Incident** = Incident có impact lớn, ảnh hưởng nhiều users, cần response đặc biệt.

### 8.2 Major Incident Process

```
Major Incident Lifecycle:

1. DETECTION
   │ P1 incident reported
   │ Multiple users affected
   ▼
2. DECLARATION
   │ Incident Manager declares Major Incident
   │ Major Incident flag = true
   ▼
3. COMMUNICATION
   │ Stakeholder notification
   │ Status page update
   │ Customer communication
   ▼
4. RESOLUTION
   │ Bridge call / War room
   │ Technical teams collaborate
   │ Fix applied
   ▼
5. POST-INCIDENT REVIEW (PIR)
   │ Root cause analysis
   │ Action items
   │ Problem record created
   │ Process improvement

Communication Templates:
├── Initial notification: "Major incident declared at [time]"
├── Hourly update: "Impact: [X] users, ETA: [Y]"
├── Resolution: "Service restored at [time], RCA to follow"
└── PIR: "Root cause identified, preventive actions defined"
```

---

## FAQ & Best Practices

### Q1: Sự khác biệt giữa Incident và Service Request?
**A:**
- **Incident**: Something is **broken** (sự cố) → cần fix
- **Service Request**: User **wants something** (yêu cầu) → cần fulfill

### Q2: Khi nào tạo Problem từ Incident?
**A:**
- Cùng loại incident xảy ra **≥ 3 lần**
- P1/P2 incident cần RCA
- Workaround tạm thời — cần permanent fix

### Q3: Emergency Change có cần approval không?
**A:** Có, nhưng qua **ECAB (Emergency CAB)** — ít members hơn, quyết định nhanh (phone/chat). Có thể retroactive approval.

### Q4: SLA pause khi nào?
**A:** Thường pause khi incident ở state `On Hold` (đang chờ thông tin từ user). Clock không đếm trong thời gian pause.

### Best Practices

1. **Đừng skip states**: New → In Progress → Resolved → Closed (đúng thứ tự)
2. **Always fill work notes**: Mọi action phải có ghi chú
3. **Link related records**: Incident → Problem → Change → KB
4. **SLA tuning**: Review SLA thường xuyên, adjust targets theo thực tế
5. **Knowledge-Centered Service**: Tạo/cập nhật KB article với mỗi incident
6. **Post-Incident Review**: Bắt buộc cho mọi P1 incidents

---

## Bài tập thực hành

### Bài 1: Incident Management
1. Tạo 5 incidents với các priorities khác nhau (P1→P5)
2. Walk through lifecycle: New → In Progress → Resolved → Closed
3. Add work notes ở mỗi state transition
4. Resolve incident với Resolution code và Resolution notes

### Bài 2: Problem Management
1. Tạo 3 incidents cùng category/subcategory 
2. Tạo Problem record liên kết đến 3 incidents
3. Điền Root Cause và Workaround
4. Mark Problem as Known Error
5. Close Problem sau khi fix applied

### Bài 3: Change Management
1. Tạo Normal Change Request
2. Điền Risk Assessment, Implementation Plan, Backout Plan
3. Approve Change (impersonate Change Manager)
4. Move through states: Assess → Authorize → Scheduled → Implement → Review → Closed

### Bài 4: Service Catalog
1. Tạo Catalog Category mới "Development Tools"
2. Tạo Catalog Item "Request IDE License"
3. Add variables: IDE Type (dropdown), Justification (text)
4. Tạo Workflow/Flow cho approval
5. Test bằng cách order từ Service Portal

### Bài 5: SLA Configuration
1. Tạo SLA Definition cho P1 Resolution (4 hours)
2. Set 50% và 75% notification
3. Tạo P1 incident → verify SLA attached
4. Move incident qua states → xem SLA progress

---

**Tiếp theo:** [Bài 4: CMDB — Configuration Management Database →](./04-CMDB.md)
