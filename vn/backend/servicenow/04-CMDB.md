# Bài 4: CMDB — Configuration Management Database

## Mục lục
- [1. CMDB Overview](#1-cmdb-overview)
- [2. Configuration Items (CI)](#2-configuration-items-ci)
- [3. CI Relationships & Dependencies](#3-ci-relationships--dependencies)
- [4. CSDM — Common Service Data Model](#4-csdm--common-service-data-model)
- [5. Identification & Reconciliation Engine (IRE)](#5-identification--reconciliation-engine-ire)
- [6. CMDB Health & Audit](#6-cmdb-health--audit)
- [7. CMDB trong thực tế](#7-cmdb-trong-thực-tế)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. CMDB Overview

### 1.1 CMDB là gì?

> **CMDB (Configuration Management Database)** là cơ sở dữ liệu lưu trữ tất cả **Configuration Items (CIs)** — tài sản IT và mối quan hệ phụ thuộc giữa chúng. Đây là **Single Source of Truth** cho toàn bộ hạ tầng IT.

### 1.2 Tại sao CMDB quan trọng?

```
CMDB là BACKBONE của ServiceNow:

┌──────────────────────────────────────────────────┐
│                  CMDB                             │
│         (Single Source of Truth)                   │
│                                                   │
│  Cung cấp data cho:                               │
│  ├── ITSM → Incident: CI nào bị ảnh hưởng?       │
│  ├── ITSM → Change: CI nào sẽ thay đổi?          │
│  ├── ITSM → Problem: CI nào gây ra vấn đề?       │
│  ├── ITOM → Discovery: Tự động populate CIs      │
│  ├── ITOM → Service Mapping: CI → Service         │
│  ├── SecOps → Vulnerability: CI nào exposed?      │
│  ├── SAM → Software Asset: License compliance     │
│  └── HAM → Hardware Asset: Lifecycle management   │
└──────────────────────────────────────────────────┘

Không có CMDB chính xác = Mọi process đều thiếu context
```

### 1.3 CMDB Capabilities

| Capability | Mô tả |
|------------|--------|
| **Asset Tracking** | Biết mình có gì (hardware, software, cloud) |
| **Impact Analysis** | Server X down → ảnh hưởng services nào? |
| **Change Risk** | Thay đổi CI này → rủi ro gì? |
| **Compliance** | Software licensing, security compliance |
| **Capacity Planning** | Tài nguyên còn bao nhiêu? |
| **Cost Management** | Chi phí vận hành từng service |

---

## 2. Configuration Items (CI)

### 2.1 CI là gì?

> **CI (Configuration Item)** = Bất kỳ thành phần nào cần quản lý để cung cấp dịch vụ IT. Có thể là phần cứng, phần mềm, tài liệu, hoặc dịch vụ.

### 2.2 CI Class Hierarchy

```
cmdb_ci (Base CI class)
│
├── cmdb_ci_computer
│   ├── cmdb_ci_server
│   │   ├── cmdb_ci_win_server      → Windows Server
│   │   ├── cmdb_ci_linux_server    → Linux Server
│   │   └── cmdb_ci_unix_server     → Unix Server
│   ├── cmdb_ci_pc                   → Desktop/Laptop
│   └── cmdb_ci_mainframe           → Mainframe
│
├── cmdb_ci_netgear
│   ├── cmdb_ci_ip_switch           → Network Switch
│   ├── cmdb_ci_ip_router           → Router
│   ├── cmdb_ci_ip_firewall         → Firewall
│   └── cmdb_ci_lb                  → Load Balancer
│
├── cmdb_ci_storage_device          → Storage (SAN, NAS)
│
├── cmdb_ci_service
│   ├── cmdb_ci_service_auto        → Business Service (auto-discovered)
│   └── cmdb_ci_service_manual      → Business Service (manual)
│
├── cmdb_ci_appl                    → Application
│   ├── cmdb_ci_app_server          → Application Server
│   │   ├── cmdb_ci_app_server_tomcat  → Tomcat
│   │   └── cmdb_ci_app_server_java    → Java App Server
│   └── cmdb_ci_spkg                → Software Package
│
├── cmdb_ci_db_instance             → Database Instance
│   ├── cmdb_ci_db_mssql_instance   → MS SQL
│   ├── cmdb_ci_db_ora_instance     → Oracle
│   ├── cmdb_ci_db_mysql_instance   → MySQL
│   └── cmdb_ci_db_pg_instance      → PostgreSQL
│
└── cmdb_ci_cloud_object            → Cloud Resources
    ├── cmdb_ci_vm_instance         → Virtual Machine
    ├── cmdb_ci_cloud_database      → Cloud DB (RDS, etc.)
    └── cmdb_ci_cloud_load_balancer → Cloud LB (ALB, etc.)
```

### 2.3 CI Key Fields

```
CI Record (cmdb_ci):
├── Name:              ERP-PROD-01
├── Class:             Linux Server
├── IP Address:        10.0.1.100
├── DNS Domain:        erp-prod-01.company.local
├── Serial Number:     SN-ABC-12345
├── Asset Tag:         ASSET-001234
├── Status:            Operational
│   ├── Operational    → Đang hoạt động
│   ├── Non-Operational→ Không hoạt động
│   ├── Retired        → Đã loại bỏ
│   └── Stolen         → Bị mất cắp
├── Operational Status:
│   ├── Operational    → Đang chạy bình thường
│   ├── Repair in Progress → Đang sửa chữa
│   ├── DR Standby     → Standby cho Disaster Recovery
│   └── Ready          → Sẵn sàng
├── Environment:       Production / Development / Test
├── Location:          Data Center 1
├── Managed by:        IT Operations
├── Owned by:          IT Director
├── Supported by:      Linux Admin Team
├── Maintenance Schedule: Sunday 02:00-06:00
├── Discovery Source:  ServiceNow Discovery
├── Last Discovered:   2026-03-30 04:00:00
└── Relationships:     (Related CIs)
```

---

## 3. CI Relationships & Dependencies

### 3.1 Relationship Types

```
Relationship Types (cmdb_rel_type):

Upstream (depends on):
├── Runs on          → App "Runs on" Server
├── Hosted on        → VM "Hosted on" ESXi Host  
├── Connects to      → App Server "Connects to" Database
├── Uses             → Service "Uses" Application
└── Depends on       → Service A "Depends on" Service B

Downstream (used by):
├── Used by          → Server "Used by" Application
├── Hosts            → ESXi "Hosts" VMs
└── Depended on by   → Database "Depended on by" App
```

### 3.2 Dependency Map — Ví dụ thực tế

```
Business Service: "ERP System"
│
├── Depends on:
│   ├── Application: "SAP ERP"
│   │   ├── Runs on: Server "ERP-APP-01" (Linux)
│   │   ├── Runs on: Server "ERP-APP-02" (Linux)
│   │   └── Connects to: Database "ERP-DB-01" (Oracle)
│   │       └── Runs on: Server "DB-PROD-01" (Linux)
│   │
│   ├── Application: "SAP Portal"
│   │   └── Runs on: Server "WEB-01" (Windows)
│   │
│   └── Load Balancer: "F5-PROD-01"
│       └── Connects to: "ERP-APP-01", "ERP-APP-02"
│
└── Infrastructure:
    ├── Network Switch: "SW-DC1-01"
    ├── Firewall: "FW-PROD-01"
    └── Storage: "SAN-PROD-01"
```

### 3.3 Impact Analysis

```
Scenario: Server "DB-PROD-01" bị down

Impact Analysis (upstream):
DB-PROD-01 (Server) → DOWN
    │
    └── ERP-DB-01 (Database) → AFFECTED
        │
        └── SAP ERP (Application) → AFFECTED
            │
            └── ERP System (Business Service) → AFFECTED
                │
                └── 5000 users cannot use ERP!

→ CMDB cho bạn biết:
  - Impact: HIGH (5000 users)
  - Urgency: HIGH (business-critical service)
  - Priority: P1 - CRITICAL
  - Assignment Group: Database Admin Team
  - Related Changes: Kiểm tra recent changes trên DB-PROD-01
```

---

## 4. CSDM — Common Service Data Model

### 4.1 CSDM là gì?

> **CSDM (Common Service Data Model)** = Framework chuẩn hóa cách tổ chức data trong CMDB, mapping infrastructure → applications → services → business capabilities.

### 4.2 CSDM Layers

```
CSDM Framework (4 layers):

┌─────────────────────────────────────────────┐
│ Layer 4: BUSINESS                            │
│ ├── Business Capability: "Financial Mgmt"    │
│ └── Business Application: "ERP"              │
├─────────────────────────────────────────────┤
│ Layer 3: SERVICE                             │
│ ├── Business Service: "ERP System"           │
│ ├── Technical Service: "Oracle DB Service"   │
│ └── Service Offering: "ERP Standard"         │
├─────────────────────────────────────────────┤
│ Layer 2: APPLICATION                         │
│ ├── Application: "SAP S/4HANA"              │
│ └── Application Service: "SAP Portal"        │
├─────────────────────────────────────────────┤
│ Layer 1: INFRASTRUCTURE                      │
│ ├── Server: "ERP-APP-01"                    │
│ ├── Database: "ERP-DB-01"                   │
│ ├── Network: "SW-DC1-01"                    │
│ └── Storage: "SAN-PROD-01"                  │
└─────────────────────────────────────────────┘

Mapping: Infrastructure → runs → Application → provides → Service → supports → Business
```

### 4.3 CSDM Adoption Levels

| Level | Mô tả | Mục tiêu |
|-------|--------|----------|
| **Foundation** | Populate basic CI data | Biết mình có gì |
| **Crawl** | Add relationships, services | Impact analysis cơ bản |
| **Walk** | Full CSDM, service mapping | Service-aware ITSM |
| **Run** | Automated, real-time accuracy | Proactive operations |
| **Fly** | AI-driven insights | Predictive optimization |

---

## 5. Identification & Reconciliation Engine (IRE)

### 5.1 IRE là gì?

> **IRE** = Engine tự động xử lý CI data từ nhiều nguồn, đảm bảo không duplicate, và maintain data quality.

### 5.2 Identification Rules

```
Identification Rules xác định CI là UNIQUE dựa trên:

Server:
├── Primary: serial_number + model_id
├── Fallback: name + ip_address + dns_domain

Database:
├── Primary: name + host (server reference)

Application:
├── Primary: name + version + install_directory + host

Ví dụ:
Source 1 (Discovery): serial_number = "SN-ABC-12345"
Source 2 (Import): serial_number = "SN-ABC-12345"  
→ IRE: Same CI → MERGE (update existing record)

Source 3 (Manual): serial_number = "SN-XYZ-99999"
→ IRE: New CI → INSERT (tạo record mới)
```

### 5.3 Reconciliation Rules

```
Reconciliation Rules quyết định DATA nào được ưu tiên:

Priority (AuthSource):
1. ServiceNow Discovery   → Highest priority (tự động scan)
2. SCCM / Intune          → Microsoft endpoint management
3. vCenter                → VMware virtual infrastructure
4. Manual Entry           → Lowest priority

Ví dụ:
CI "WEB-01" có IP = 10.0.1.50 (từ Manual Entry)
Discovery scan → IP thực tế = 10.0.1.55
→ IRE: Discovery có priority cao hơn → cập nhật IP = 10.0.1.55
```

---

## 6. CMDB Health & Audit

### 6.1 CMDB Health Dashboard

```
CMDB Health Metrics:

┌────────────────────────────────────────┐
│ CMDB Health Score: 78/100              │
│                                        │
│ ├── Completeness: 85%                  │
│ │   └── CIs missing required fields    │
│ ├── Compliance: 72%                    │
│ │   └── CIs following CSDM standards   │
│ ├── Correctness: 80%                   │
│ │   └── CIs with valid data            │
│ └── Relationship Health: 75%           │
│     └── Orphan CIs, missing relations  │
│                                        │
│ Top Issues:                            │
│ ├── 120 CIs missing "Environment"      │
│ ├── 45 CIs without relationships       │
│ ├── 30 Duplicate CIs detected          │
│ └── 15 Stale CIs (not discovered > 90d)│
└────────────────────────────────────────┘

Filter Navigator: "CMDB Health Dashboard"
```

### 6.2 CMDB Audit

```
CMDB Audit checks:
├── Duplicate Detection  → CIs có cùng serial number?
├── Orphan CIs          → CIs không có relationships?
├── Stale CIs           → CIs không discover > X ngày?
├── Missing Data        → Required fields trống?
├── Relationship Issues → Broken/invalid relationships?
└── Classification      → CIs đúng class chưa?

Scheduled Jobs:
├── "CMDB Health Audit" → Daily
├── "CMDB Stale CI Detection" → Weekly
└── "CMDB Duplicate Scan" → Weekly
```

---

## 7. CMDB trong thực tế

### 7.1 Ví dụ: Infrastructure cho 1 hệ thống e-commerce

```
Business Service: "E-Commerce Platform"
│
├── Application: "E-Commerce Web App"
│   ├── Runs on: Server "WEB-01" (nginx)
│   ├── Runs on: Server "WEB-02" (nginx)
│   ├── Load Balanced by: "LB-PROD-01" (F5)
│   └── Connects to: "APP-CLUSTER"
│
├── Application: "E-Commerce API"
│   ├── Runs on: Server "APP-01" (Tomcat)
│   ├── Runs on: Server "APP-02" (Tomcat)
│   ├── Connects to: Database "ECOM-DB"
│   └── Connects to: Cache "REDIS-CLUSTER"
│
├── Database: "ECOM-DB" (PostgreSQL)
│   ├── Runs on: Server "DB-PRIMARY" 
│   └── Replicated to: Server "DB-REPLICA"
│
├── Cache: "REDIS-CLUSTER"
│   ├── Runs on: Server "CACHE-01"
│   └── Runs on: Server "CACHE-02"
│
└── Infrastructure:
    ├── Network: Switch "SW-01", Firewall "FW-01"
    ├── Storage: SAN "STORAGE-01"
    └── Monitoring: Prometheus, Grafana
```

### 7.2 CMDB Population Methods

| Method | Mô tả | Accuracy | Coverage |
|--------|--------|----------|----------|
| **Discovery** | ServiceNow tự scan mạng | Cao | Cao |
| **Service Mapping** | Map CI → Service tự động | Cao | Trung bình |
| **Import Sets** | Import từ CSV/Excel/JDBC | Thấp-TB | Tùy |
| **Manual Entry** | Nhập tay | Thấp | Thấp |
| **3rd Party** | SCCM, vCenter, AWS Config | Cao | Cao (trong scope) |
| **API** | REST/SOAP API integration | TB-Cao | Tùy |

---

## FAQ & Best Practices

### Q1: CMDB vs Asset Management?
**A:**
- **CMDB**: Focus on **relationships & dependencies** — phục vụ service management
- **Asset Management**: Focus on **financial lifecycle** — procurement, depreciation, disposal

### Q2: Bắt đầu populate CMDB từ đâu?
**A:** 
1. **Business Services** đầu tiên (top-down)
2. Sau đó map Applications → Servers → Databases
3. Dùng Discovery cho infrastructure
4. Validate với CSDM

### Q3: Làm sao giữ CMDB chính xác?
**A:**
- **Automated Discovery** (hàng ngày)
- **Reconciliation rules** để merge data
- **CMDB Health audits** (hàng tuần)
- **Change process** bắt buộc update CI
- **Stale CI cleanup** (hàng tháng)

### Best Practices

1. **Discovery first**: Dùng automated discovery trước manual entry
2. **Follow CSDM**: Tuân thủ Common Service Data Model
3. **CI Owner**: Mỗi CI phải có owner rõ ràng
4. **Regular audits**: Kiểm tra CMDB health định kỳ
5. **Link to ITSM**: Mọi incident/change phải reference CI
6. **Don't over-populate**: Chỉ track CIs cần quản lý

---

## Bài tập thực hành

### Bài 1: Tạo CI Structure
1. Tạo 3 Server CIs (Linux Server class)
2. Tạo 1 Database CI (MySQL)
3. Tạo 1 Application CI
4. Tạo 1 Business Service CI
5. Tạo relationships: App → runs on → Server → connects to → Database

### Bài 2: Impact Analysis
1. Mở dependency map của Business Service
2. Xem upstream/downstream CIs
3. Tạo incident linked to Server CI
4. Xem impact analysis trên Service

### Bài 3: CMDB Health
1. Mở CMDB Health Dashboard
2. Identify CIs missing required data
3. Fix top 10 issues
4. Re-run health check → xem score tăng

---

**Tiếp theo:** [Bài 5: ServiceNow Scripting →](./05-Scripting.md)
