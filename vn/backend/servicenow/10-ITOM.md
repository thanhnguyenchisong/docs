# Bài 10: ITOM — IT Operations Management

## Mục lục
- [1. ITOM Overview](#1-itom-overview)
- [2. Discovery](#2-discovery)
- [3. Service Mapping](#3-service-mapping)
- [4. Event Management](#4-event-management)
- [5. Cloud Management](#5-cloud-management)
- [6. Health Log Analytics](#6-health-log-analytics)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. ITOM Overview

### 1.1 ITOM là gì?

> **ITOM (IT Operations Management)** = Bộ công cụ quản lý, tự động hóa, và giám sát hạ tầng IT. ITOM giữ CMDB chính xác và cung cấp operational intelligence.

```
ITOM Modules:

┌────────────────────────────────────────────────┐
│                    ITOM                         │
│                                                 │
│  ┌─────────────┐  ┌──────────────┐             │
│  │  Discovery   │  │Service Mapping│            │
│  │ (find CIs)   │  │(map services) │            │
│  └──────┬──────┘  └──────┬───────┘             │
│         │                 │                     │
│         ▼                 ▼                     │
│  ┌──────────────────────────────┐               │
│  │         CMDB                  │              │
│  │   (populated & maintained)    │              │
│  └──────────────────────────────┘               │
│         ▲                                       │
│         │                                       │
│  ┌──────┴──────┐  ┌──────────────┐             │
│  │   Event     │  │    Cloud     │              │
│  │ Management  │  │  Management  │              │
│  │(monitor)    │  │(cloud infra) │              │
│  └─────────────┘  └──────────────┘             │
│                                                 │
│  ┌─────────────────────────────┐               │
│  │   Health Log Analytics      │               │
│  │   (log analysis with AI)    │               │
│  └─────────────────────────────┘               │
└────────────────────────────────────────────────┘
```

---

## 2. Discovery

### 2.1 Discovery là gì?

> **Discovery** = Tự động scan mạng để tìm và populate CIs vào CMDB. Discovery sử dụng MID Server để access on-premise network.

### 2.2 Discovery Process

```
Discovery Flow:

1. SCANNING
   │ MID Server scan IP ranges
   │ Protocols: SNMP, SSH, WMI, WinRM, PowerShell
   ▼
2. CLASSIFICATION
   │ Identify device type (server, switch, printer)
   │ Match to CMDB CI class
   ▼
3. IDENTIFICATION
   │ IRE matches discovered device to existing CI
   │ or creates new CI record
   ▼
4. EXPLORATION
   │ Collect detailed info:
   │ ├── OS, software, patches
   │ ├── Hardware specs (CPU, RAM, disk)
   │ ├── Network config (IP, MAC)
   │ ├── Running processes
   │ └── Installed applications
   ▼
5. POPULATION
   │ Update CMDB with discovered data
   │ Update relationships between CIs
   └── Done!
```

### 2.3 Discovery Configuration

```
Discovery Schedule:
├── Name:           Weekly Full Discovery
├── MID Server:     MID-Server-DC1
├── Type:           IP Based
├── IP Ranges:      10.0.0.0/16, 172.16.0.0/12
├── Exclude IPs:    10.0.0.1-10.0.0.10 (network devices)
├── Schedule:       Every Sunday 02:00 AM
├── Max run time:   8 hours
│
├── Credentials:
│   ├── SSH: linux_discovery_account
│   ├── WMI: windows_discovery_account
│   ├── SNMP: snmp_community_string
│   └── VMware: vcenter_account
│
└── Status:
    ├── Last Run:     2026-03-30 02:00
    ├── Devices Found: 1,250
    ├── CIs Updated:   1,180
    └── Errors:         12 (unreachable hosts)
```

### 2.4 Discovery Protocols

| Protocol | Target | Port | Mô tả |
|----------|--------|------|--------|
| **SSH** | Linux/Unix | 22 | Shell commands |
| **WMI** | Windows | 135 | Windows Management |
| **WinRM** | Windows | 5985/5986 | PowerShell remoting |
| **SNMP** | Network devices | 161 | Switch, Router, Firewall |
| **VMware API** | vCenter | 443 | Virtual infrastructure |
| **AWS API** | AWS | 443 | Cloud resources |
| **Azure API** | Azure | 443 | Cloud resources |

---

## 3. Service Mapping

### 3.1 Service Mapping là gì?

> **Service Mapping** = Tự động mapping infrastructure CIs → application CIs → business services. Tạo **Service Map** trực quan.

### 3.2 Service Map Example

```
Service Map: "E-Commerce Platform"

                    ┌──────────────┐
                    │ E-Commerce   │
                    │ Service      │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────┴───┐  ┌────┴────┐ ┌────┴────┐
        │Web App  │  │API App  │ │Payment  │
        │(nginx)  │  │(Tomcat) │ │Gateway  │
        └────┬────┘  └────┬────┘ └────┬────┘
             │            │           │
    ┌────────┼───┐   ┌────┼────┐     │
    │        │   │   │    │    │     │
┌───┴──┐ ┌──┴──┐│ ┌─┴──┐│┌───┴──┐  │
│WEB-01│ │WEB-02││ │APP-1││ │APP-2│  │
│(VM)  │ │(VM)  ││ │(VM) ││ │(VM) │  │
└──────┘ └──────┘│ └─────┘│ └─────┘  │
                 │        │          │
           ┌─────┴────────┴───┐  ┌──┴───┐
           │   PostgreSQL DB   │  │Redis  │
           │   (Primary +      │  │Cache  │
           │    Replica)       │  │       │
           └──────────────────┘  └───────┘

Discovery → tìm individual CIs
Service Mapping → connect CIs into service view
```

### 3.3 Entry Points

```
Service Mapping bắt đầu từ Entry Points:

Entry Point Types:
├── URL:          https://ecommerce.company.com
├── TCP Port:     10.0.1.50:8080
├── Process:      java -jar ecommerce.jar
├── Windows Service: EcommerceAppService
└── Tag-based:    AWS tag "service=ecommerce"

Service Mapping từ entry point:
1. Connect to server hosting the URL/service
2. Identify running processes
3. Trace TCP connections to other servers
4. Discover database connections
5. Build dependency map automatically
```

---

## 4. Event Management

### 4.1 Event Management là gì?

> **Event Management** = Thu thập alerts từ monitoring tools, correlate, suppress noise, và tạo incidents khi cần.

### 4.2 Event Processing Flow

```
Monitoring Tools:
├── Prometheus / Grafana
├── Nagios / Zabbix
├── Datadog / New Relic
├── AWS CloudWatch
├── SolarWinds
└── Custom scripts

         │ alerts/events
         ▼
┌─────────────────────────┐
│    Event Management      │
│                          │
│  1. Ingestion            │ ← Raw events arrive
│  2. Filtering            │ ← Remove noise
│  3. De-duplication       │ ← Merge duplicate events
│  4. Correlation          │ ← Group related events
│  5. Suppression          │ ← Suppress during maintenance
│  6. CI Binding           │ ← Link event to CMDB CI
│  7. Alert Creation       │ ← Create Alert (em_alert)
│  8. Alert to Incident    │ ← Auto-create incident if needed
│                          │
│  AI Features:            │
│  ├── Alert Intelligence  │ ← AI groups related alerts
│  └── Anomaly Detection   │ ← Detect unusual patterns
└─────────────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Incident (auto-created)│
│   ├── CI: WEB-01         │
│   ├── Priority: P1       │
│   ├── Source: Event Mgmt  │
│   └── Alert group: 5      │
└─────────────────────────┘
```

### 4.3 Event → Alert → Incident

```
Timeline:

09:00 — Event: CPU > 90% on WEB-01          → Event created
09:01 — Event: CPU > 90% on WEB-01          → Deduplicated (count: 2)
09:02 — Event: Memory > 85% on WEB-01       → Correlated with CPU event
09:03 — Event: Response time > 5s on Web App → Correlated (same service)
09:05 — Alert created: "WEB-01 Performance Degradation"
09:05 — Severity: Critical (multiple events correlated)
09:05 — CI Bound: WEB-01 (Linux Server)
09:05 — Service Impact: E-Commerce Platform
09:06 — INCIDENT auto-created: INC0050001
         ├── CI: WEB-01
         ├── Priority: P1 (business-critical service impacted)
         ├── Assignment: OS Support Team
         └── Source: Event Management
```

---

## 5. Cloud Management

### 5.1 Cloud Management Features

```
Cloud Management:
├── Cloud Discovery → Discover AWS/Azure/GCP resources
├── Cloud Governance → Cost, compliance, policies
├── Cloud Provisioning → Request & provision cloud resources
└── Cloud Optimization → Right-sizing, cost optimization

Supported Clouds:
├── AWS (EC2, RDS, S3, Lambda, VPC, etc.)
├── Microsoft Azure (VMs, SQL, Storage, etc.)
├── Google Cloud Platform (Compute, Cloud SQL, etc.)
└── VMware vRealize
```

---

## 6. Health Log Analytics

### 6.1 Overview

```
Health Log Analytics:
├── Ingests logs from servers, apps, infrastructure
├── AI/ML analyzes log patterns
├── Detects anomalies automatically
├── Creates events/alerts for unusual patterns
└── Accelerates root cause analysis

Use Cases:
├── Detect error spikes in application logs
├── Identify configuration drift
├── Correlate log events with incidents
└── Proactive problem detection
```

---

## FAQ & Best Practices

### Q1: Discovery cần MID Server không?
**A:** **Có** cho on-premise resources. Cloud resources (AWS, Azure) có thể discover trực tiếp qua API mà không cần MID Server.

### Q2: Service Mapping vs manual CMDB relationships?
**A:** **Service Mapping** chính xác hơn và tự động maintain. Manual relationships dễ outdated.

### Q3: Event Management thay thế monitoring tools?
**A:** **Không.** Event Management **tổng hợp** alerts từ monitoring tools. Bạn vẫn cần Prometheus/Datadog/etc.

### Best Practices

1. **Discovery schedules** — weekly cho full, daily cho incremental
2. **Service Mapping** — bắt đầu từ business-critical services
3. **Event filters** — giảm noise ngay từ đầu
4. **Alert correlation** — Group related alerts tránh incident flood
5. **CI binding** — đảm bảo mọi alert link đến đúng CI

---

## Bài tập thực hành

### Bài 1: Discovery Basics
1. Xem Discovery Schedules trong PDI
2. Xem Discovery Status — kết quả scan
3. Kiểm tra CIs được tạo/update từ Discovery

### Bài 2: Event Management
1. Xem Event Management console
2. Tạo event manual → xem nó trở thành alert
3. Configure alert rule → auto-create incident từ alert

---

**Tiếp theo:** [Bài 11: Security & Compliance →](./11-Security-Compliance.md)
