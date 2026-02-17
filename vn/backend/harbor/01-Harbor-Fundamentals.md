# Harbor Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Container registry là gì?](#container-registry-là-gì)
2. [Harbor là gì?](#harbor-là-gì)
3. [Harbor vs Docker Registry](#harbor-vs-docker-registry)
4. [Kiến trúc cơ bản](#kiến-trúc-cơ-bản)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Container registry là gì?

**Container registry** là nơi lưu trữ và phân phối **container images** (Docker/OCI). Client (docker, containerd, Kubernetes) **push** image lên registry và **pull** image từ registry khi chạy/deploy.

- **Chuẩn**: OCI Distribution Spec (API push/pull, manifest, layers).
- **Ví dụ**: Docker Hub (public), AWS ECR, GCP GCR, Azure ACR, **Harbor** (self-hosted), Quay.

---

## Harbor là gì?

**Harbor** là **open-source container registry** (CNCF project), cung cấp:

- **Registry**: API push/pull image (tương thích Docker Registry V2 / OCI).
- **Web UI**: Quản lý project, user, replication, scan.
- **Vulnerability scanning**: Tích hợp Trivy/Clair scan CVE trong image.
- **Image signing**: Notary (content trust) — ký tag, verify khi pull.
- **Replication**: Đồng bộ image giữa Harbor với Harbor hoặc với registry khác (Docker Hub, ECR, …).
- **RBAC**: Role theo project (admin, developer, guest).
- **LDAP/AD, OIDC**: Tích hợp identity.

---

## Harbor vs Docker Registry

| Tiêu chí | Harbor | Docker Registry (open source) |
|----------|--------|------------------------------|
| **Chức năng** | Registry + UI + scan + replication + RBAC + Notary | Chỉ registry API (push/pull) |
| **UI** | Có | Không (chỉ API) |
| **Scan CVE** | Có (Trivy/Clair) | Không |
| **Replication** | Có | Không |
| **RBAC** | Project-based | Không (hoặc qua proxy) |
| **Deploy** | Helm / Docker Compose / K8s | Chỉ chạy container registry |

→ **Harbor** = Docker Registry + nhiều tính năng enterprise; phù hợp private registry trong doanh nghiệp/Kubernetes.

---

## Kiến trúc cơ bản

- **Core**: **Registry** (storage image), **Core** (API, auth, project), **Portal** (UI).
- **Job service**: Replication, scan, retention (background job).
- **Database**: PostgreSQL (metadata, user, project, job).
- **Storage**: Filesystem hoặc S3/MinIO cho image layers (configurable).

```
Client (docker/kubectl) ──push/pull──► Harbor (Core + Registry)
                                            │
                                            ├── DB (metadata)
                                            ├── Storage (blobs)
                                            └── Job service (replication, scan)
```

---

## Câu hỏi thường gặp

### Harbor có thay Docker Hub không?

- **Chức năng**: Cùng vai trò registry (push/pull). Harbor thêm UI, scan, replication, RBAC. Có thể dùng Harbor làm **private** registry; vẫn pull từ Docker Hub khi cần (replication hoặc base image).

### Harbor chạy trên Kubernetes?

- Có. Deploy bằng **Helm chart** (golang-harbor/harbor); các component chạy dạng Deployment/StatefulSet; dùng Ingress hoặc LoadBalancer cho UI và registry API.

---

**Tiếp theo:** [02-Project-and-Image.md](./02-Project-and-Image.md)
