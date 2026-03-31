# Tài liệu Học ServiceNow — Từ Zero đến IT Professional

Chào mừng đến với bộ tài liệu học ServiceNow! Bộ tài liệu này được thiết kế để giúp bạn trở thành **IT Professional** cho dự án ServiceNow, bao gồm từ kiến thức nền tảng đến chuyên sâu.

## 📚 Mục lục

### Nền tảng (Foundation)

1. **[ServiceNow Fundamentals](./01-ServiceNow-Fundamentals.md)**
   - ServiceNow là gì? Now Platform
   - Kiến trúc nền tảng (Architecture)
   - Navigation, Lists, Forms
   - Data Model & Tables
   - Personal Developer Instance (PDI)

2. **[Platform Administration](./02-Platform-Administration.md)**
   - User Management (Users, Groups, Roles)
   - Access Control Lists (ACLs)
   - Security Rules & Policies
   - Instance Configuration
   - System Properties & Settings

3. **[ITSM — IT Service Management](./03-ITSM.md)**
   - Incident Management
   - Problem Management
   - Change Management
   - Request Management (Service Catalog)
   - Knowledge Management
   - SLA Management

4. **[CMDB — Configuration Management Database](./04-CMDB.md)**
   - CMDB là gì? CI (Configuration Item)
   - CSDM (Common Service Data Model)
   - CI Relationships & Dependencies
   - Identification & Reconciliation Engine (IRE)
   - Health & Audit

### Phát triển (Development)

5. **[ServiceNow Scripting](./05-Scripting.md)**
   - JavaScript trong ServiceNow
   - Server-side vs Client-side Scripting
   - GlideRecord API
   - GlideSystem, GlideAjax, GlideAggregate
   - Scoped Applications

6. **[Business Rules & Client Scripts](./06-Business-Rules-Client-Scripts.md)**
   - Business Rules (before, after, async, display)
   - Client Scripts (onChange, onLoad, onSubmit, onCellEdit)
   - UI Policies & UI Actions
   - Script Includes
   - Scheduled Jobs & Fix Scripts

7. **[Flow Designer & Automation](./07-Flow-Designer.md)**
   - Flow Designer Overview
   - Triggers, Actions, Subflows
   - IntegrationHub
   - Decision Tables
   - So sánh Flow Designer vs Workflow Editor

8. **[Service Portal & UI](./08-Service-Portal.md)**
   - Service Portal Overview
   - Widgets (AngularJS)
   - Portal Pages & Themes
   - Service Catalog & Request Items
   - Employee Center

### Nâng cao (Advanced)

9. **[Integration & REST API](./09-Integration-REST-API.md)**
   - REST API Explorer
   - Inbound & Outbound REST
   - SOAP Web Services
   - Import Sets & Transform Maps
   - MID Server
   - IntegrationHub

10. **[ITOM — IT Operations Management](./10-ITOM.md)**
    - Discovery
    - Service Mapping
    - Event Management
    - Cloud Management
    - Health Log Analytics

11. **[Security & Compliance](./11-Security-Compliance.md)**
    - LDAP & Active Directory Integration
    - SSO (SAML 2.0, OIDC)
    - Multi-Factor Authentication (MFA)
    - Data Encryption
    - Security Operations (SecOps)

12. **[Update Sets & Deployment](./12-Update-Sets-Deployment.md)**
    - Update Sets (Create, Export, Import, Commit)
    - Application Scope
    - Instance Strategy (Dev → Test → Prod)
    - ATF (Automated Test Framework)
    - CI/CD Pipeline cho ServiceNow

### Master Level

13. **[Performance & Best Practices](./13-Performance-Best-Practices.md)**
    - Performance Tuning
    - Coding Best Practices
    - Debugging & Troubleshooting
    - Instance Scan
    - Upgrade Planning

14. **[AI & Advanced Features](./14-AI-Advanced-Features.md)**
    - Now Assist (GenAI)
    - Predictive Intelligence
    - Virtual Agent
    - Performance Analytics
    - App Engine Studio

15. **[Certification Guide](./15-Certification-Guide.md)**
    - CSA (Certified System Administrator)
    - CAD (Certified Application Developer)
    - CIS (Certified Implementation Specialist)
    - Exam Preparation Strategy
    - Practice Questions

### Chuyên sâu (Deep Dive)

16. **[JavaScript Chuyên Sâu cho ServiceNow](./16-JavaScript-Deep-Dive.md)**
    - ES5 trong ServiceNow (Rhino Engine)
    - Kiểu dữ liệu, Type Coercion, Truthy/Falsy
    - Functions, Closures, Scope, this keyword
    - Objects, Prototypes, Class.create()
    - Arrays (map, filter, reduce, forEach)
    - Error Handling, Regex, JSON
    - Design Patterns (Module, Strategy, Cache)
    - JavaScript Pitfalls trong ServiceNow

17. **[AngularJS Chuyên Sâu cho Service Portal](./17-AngularJS-ServiceNow.md)**
    - AngularJS 1.x Architecture
    - Controllers, $scope, Data Binding
    - Directives (ng-if, ng-repeat, ng-click, ng-model)
    - Filters (built-in & custom)
    - Services & Factories (Angular Providers)
    - Widget Development (HTML + CSS + Client + Server)
    - Widget Communication ($rootScope, snRecordWatcher)
    - spUtil, spModal, $http APIs
    - Performance Optimization

---

## 🎯 Cách sử dụng

1. **Bắt đầu với Fundamentals**: Hiểu nền tảng ServiceNow và cách platform hoạt động
2. **Đăng ký PDI**: Lấy Personal Developer Instance miễn phí tại [developer.servicenow.com](https://developer.servicenow.com)
3. **Thực hành mỗi ngày**: Mỗi file có ví dụ thực tế — hãy thử trên PDI
4. **Ôn tập theo chủ đề**: Tập trung vào chủ đề bạn còn yếu
5. **Lấy chứng chỉ**: Chuẩn bị cho CSA trước, sau đó CAD hoặc CIS

## 📝 Cấu trúc mỗi file

Mỗi file tài liệu bao gồm:

- **Lý thuyết**: Giải thích chi tiết các khái niệm
- **Ví dụ thực tế**: Screenshots, code examples minh họa
- **Best Practices**: Các thực hành tốt nhất
- **Câu hỏi thường gặp**: FAQ với câu trả lời chi tiết
- **Bài tập thực hành**: Exercises để luyện tập trên PDI

## 🚀 Lộ trình học

### Phase 1: Foundation (Tuần 1–4)
1. ServiceNow Fundamentals
2. Platform Administration
3. ITSM (Incident, Problem, Change)
4. CMDB Basics

### Phase 2: Development (Tuần 5–8)
5. Scripting (GlideRecord, Server/Client)
6. Business Rules & Client Scripts
7. Flow Designer & Automation
8. Service Portal

### Phase 2.5: Deep Dive (Song song với Phase 2)
16. JavaScript ES5 Chuyên Sâu
17. AngularJS cho Service Portal

### Phase 3: Advanced (Tuần 9–12)
9. Integration & REST API
10. ITOM
11. Security & Compliance
12. Update Sets & Deployment

### Phase 4: Master (Tuần 13–16)
13. Performance & Best Practices
14. AI & Advanced Features
15. Certification Preparation

## 🔥 Chủ đề Hot cho IT ServiceNow

### Must Know
- ✅ ITSM Processes (Incident → Problem → Change)
- ✅ CMDB & CSDM
- ✅ ACLs & Security
- ✅ GlideRecord & Scripting
- ✅ Flow Designer

### In-Demand 2025-2026
- ✅ Now Assist (AI/GenAI)
- ✅ Virtual Agent
- ✅ IntegrationHub
- ✅ App Engine Studio
- ✅ Security Operations (SecOps)

## ✅ Checklist trước khi vào dự án

### Foundation
- [ ] Hiểu kiến trúc Now Platform
- [ ] Navigate được trong ServiceNow instance
- [ ] Biết data model (Tables, Fields, Relationships)
- [ ] Quản lý Users, Groups, Roles
- [ ] Cấu hình ACLs

### ITSM
- [ ] Incident Management workflow
- [ ] Problem Management (Root Cause Analysis)
- [ ] Change Management (Normal, Standard, Emergency)
- [ ] Service Catalog & Request Items
- [ ] Knowledge Management
- [ ] SLA Configuration

### Development
- [ ] JavaScript ES5 (closures, prototypes, this, scope)
- [ ] GlideRecord (query, insert, update, delete)
- [ ] Business Rules (before, after, async)
- [ ] Client Scripts (onChange, onLoad, onSubmit)
- [ ] UI Policies & Actions
- [ ] Script Includes
- [ ] Flow Designer
- [ ] AngularJS (directives, controllers, data binding)
- [ ] Widget Development (HTML + CSS + Client + Server Script)

### Administration
- [ ] Update Sets (create, export, import)
- [ ] Instance configuration
- [ ] Integration basics (REST API)
- [ ] LDAP / SSO setup
- [ ] Scheduled Jobs

### Advanced
- [ ] CMDB health & audit
- [ ] Performance optimization
- [ ] Debugging techniques
- [ ] ATF (Automated Test Framework)
- [ ] Now Assist & AI features

## 📖 Tài liệu tham khảo

- [ServiceNow Documentation](https://docs.servicenow.com/)
- [Now Learning](https://nowlearning.servicenow.com/)
- [ServiceNow Developer](https://developer.servicenow.com/)
- [ServiceNow Community](https://www.servicenow.com/community/)
- [ServiceNow Blog](https://www.servicenow.com/blogs.html)

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue hoặc pull request.

---

**Chúc bạn thành công trong dự án ServiceNow! 🎉**
