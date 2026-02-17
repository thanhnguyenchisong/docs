# Security & Best Practices - Câu hỏi phỏng vấn JFrog

## Mục lục
1. [Permissions và authentication](#permissions-và-authentication)
2. [JFrog Xray](#jfrog-xray)
3. [Retention và cleanup](#retention-và-cleanup)
4. [Backup và HA](#backup-và-ha)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Permissions và authentication

- **User/Group**: Artifactory quản lý user, group; gán **permission** theo repository (read, write, delete, annotate, deploy, …).
- **Admin**: Full quyền; tạo repo, user, permission target.
- **Authentication**: Username/password; **API key** (dùng trong CI thay password); **Access token** (JWT, có expiry). CI nên dùng token/API key, không hardcode password.
- **Permission target**: Gắn repo (hoặc repo + build) với user/group → “nhóm A được read repo X, write repo Y”.

---

## JFrog Xray

- **Xray** scan artifact (và dependency trong build) để tìm **vulnerability** (CVE), **license** risk.
- **Policy**: Rule (block nếu critical CVE; warn nếu license GPL). **Watch**: Gắn policy với repo/build → scan khi có artifact mới.
- **Kết quả**: Block deploy, quarantine, hoặc chỉ báo cáo. Tích hợp vào pipeline (fail build nếu critical) hoặc approval trước promote.

---

## Retention và cleanup

- **Retention**: Giữ artifact theo chính sách: “keep last N versions”, “keep 90 days”, “keep forever for release”. Tránh repo phình vô hạn.
- **Cleanup job**: Artifactory (hoặc script) xóa artifact không còn trong retention; có thể exclude theo pattern (ví dụ không xóa release).
- **Quota**: Giới hạn dung lượng repo (nếu có) để tránh đầy disk.

---

## Backup và HA

- **Backup**: Database (metadata) + **filestore** (artifact binary). Backup định kỳ; test restore. Artifact lớn có thể lưu trên object storage (S3) → backup storage theo policy cloud.
- **HA**: Artifactory hỗ trợ cluster (nhiều node); shared storage (NFS, S3) cho filestore. Load balancer phía trước; session/state cần cấu hình phù hợp.

---

## Câu hỏi thường gặp

### API key vs password?

- **API key**: Không đổi (trừ khi revoke); dùng cho script/CI; có thể scope (user). **Password**: Có thể đổi; dùng cho login UI. CI nên dùng API key (hoặc token) và lưu trong secret manager, không commit.

### Xray có bắt buộc không?

- Không bắt buộc; tùy compliance (security, license). Nên dùng khi cần audit dependency và block deploy khi có CVE critical.

---

**Kết thúc JFrog.** Quay lại [README](./README.md).
