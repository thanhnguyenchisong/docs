# Replication - Câu hỏi phỏng vấn Harbor

## Mục lục
1. [Replication là gì?](#replication-là-gì)
2. [Replication rule](#replication-rule)
3. [Push vs Pull mode](#push-vs-pull-mode)
4. [Use case](#use-case)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Replication là gì?

**Replication** trong Harbor là cơ chế **đồng bộ image** giữa:

- **Harbor ↔ Harbor** (Harbor khác).
- **Harbor ↔ registry khác** (Docker Hub, ECR, ACR, GCR, Artifactory, …).

→ Dùng để: backup, multi-site (Harbor A sync sang Harbor B), hoặc **pull** image từ Docker Hub/registry ngoài vào Harbor (cache/proxy nội bộ).

---

## Replication rule

- **Rule** gồm: **Source** (registry + filter) và **Destination** (Harbor project).
- **Filter**: Theo tên image (pattern), tag (pattern). Chỉ image match filter mới được replicate.
- **Trigger**: Manual (chạy job ngay) hoặc schedule (theo cron) hoặc event-based (khi có push mới — nếu source là Harbor).

### Ví dụ

- **Source**: Docker Hub, filter `library/nginx*`. **Destination**: Project `proxy` trong Harbor. → Replicate các image `library/nginx*` từ Docker Hub vào Harbor project `proxy`.
- **Source**: Harbor A, project `backend`, filter `*`. **Destination**: Harbor B, project `backend`. → Sync toàn bộ image project `backend` từ A sang B.

---

## Push vs Pull mode

- **Pull**: Harbor **kéo** image từ registry nguồn (remote) vào Harbor. Dùng khi: mirror Docker Hub, backup từ Harbor khác.
- **Push**: Harbor **đẩy** image từ Harbor (local) sang registry đích. Dùng khi: đẩy sang Harbor/ECR ở region khác, đẩy release lên registry công cộng.

- Một rule chỉ một chiều (pull **hoặc** push). Cần hai rule nếu muốn hai chiều.

---

## Use case

1. **Mirror public images**: Replication pull từ Docker Hub (filter `library/*` hoặc image cần dùng) vào Harbor → dev/K8s pull từ Harbor, không phụ thuộc Docker Hub rate limit.
2. **Multi-datacenter**: Harbor DC1 push sang Harbor DC2 (replication push) khi có release mới.
3. **Backup**: Replication pull từ Harbor prod sang Harbor backup (hoặc registry S3).

---

## Câu hỏi thường gặp

### Replication có real-time không?

- **Event-based** (khi source là Harbor): Gần real-time khi có push. **Schedule**: Theo cron (ví dụ mỗi giờ). **Manual**: Chạy tay. Tùy nhu cầu chọn trigger.

### Replication thất bại thì sao?

- Job replication có log; có thể retry (manual hoặc schedule lại). Harbor lưu trạng thái job (success/failed); cần xem log để sửa (network, credential, quota, filter sai).

---

**Tiếp theo:** [04-Security-Vulnerability-Scanning.md](./04-Security-Vulnerability-Scanning.md)
