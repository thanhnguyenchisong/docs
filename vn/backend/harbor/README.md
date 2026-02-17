# Tài liệu Luyện Phỏng vấn Harbor

Bộ tài liệu luyện phỏng vấn **Harbor** — **container image registry** mã nguồn mở (CNCF): lưu trữ, quét bảo mật, ký image, replication. Thường dùng trong Kubernetes/DevOps để private registry thay Docker Hub.

## 📚 Mục lục

1. **[Harbor Fundamentals](./01-Harbor-Fundamentals.md)** — Container registry là gì, Harbor vs Docker Registry
2. **[Project và Image](./02-Project-and-Image.md)** — Project, repository, tag, push/pull
3. **[Replication](./03-Replication.md)** — Replication rule, sync giữa Harbor hoặc với registry khác
4. **[Security & Vulnerability Scanning](./04-Security-Vulnerability-Scanning.md)** — Quyền, RBAC, scan CVE, ký image
5. **[CI/CD & Best Practices](./05-CI-CD-Best-Practices.md)** — Tích hợp pipeline, retention, HA

## 🎯 Cách sử dụng

- Hiểu **container registry** và vai trò trong CI/CD (build image → push Harbor → deploy pull từ Harbor).
- Ôn **replication**, **scan**, **RBAC** cho phỏng vấn DevOps/Backend.

## ✅ Checklist trước Phỏng vấn

- [ ] Harbor dùng để làm gì (private registry, scan, replication)
- [ ] Project vs repository vs tag
- [ ] docker login / push / pull với Harbor
- [ ] Replication: pull từ Docker Hub, push sang Harbor khác
- [ ] Vulnerability scanning, image signing (Notary)
- [ ] RBAC: role trong project

---

**Chúc bạn thành công! 🎉**
