# CI/CD & Best Practices - Câu hỏi phỏng vấn Harbor

## Mục lục
1. [CI/CD với Harbor](#cicd-với-harbor)
2. [Kubernetes integration](#kubernetes-integration)
3. [Retention và garbage collection](#retention-và-garbage-collection)
4. [HA và backup](#ha-và-backup)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## CI/CD với Harbor

1. **Build**: CI (Jenkins, GitLab CI, GitHub Actions) build Docker image từ Dockerfile; tag với version (git tag, build number).
2. **Push**: `docker login harbor.company.com` (dùng robot account hoặc CI secret); `docker push harbor.company.com/project/repo:tag`.
3. **Scan**: Harbor scan on push (nếu bật) hoặc trigger scan sau push; pipeline có thể check API Harbor để fail nếu critical CVE.
4. **Deploy**: CD/Kubernetes pull image từ Harbor (`harbor.company.com/project/repo:tag`); cluster cần **imagePullSecrets** nếu project private.

→ Harbor là **single source of truth** cho container image; không deploy từ Docker Hub hoặc build local không qua Harbor (trừ dev local).

---

## Kubernetes integration

- **imagePullSecrets**: Namespace cần secret chứa credential Harbor (docker config json). Pod dùng `imagePullSecrets` để pull image từ project private.

```bash
kubectl create secret docker-registry harbor-secret \
  --docker-server=harbor.company.com \
  --docker-username=<robot-user> \
  --docker-password=<robot-token> \
  -n my-namespace
```

- Trong Deployment: `spec.template.spec.imagePullSecrets: [{ name: harbor-secret }]`.
- **Helm**: Có thể tạo secret qua values (credentials từ CI) hoặc external secrets operator.

---

## Retention và garbage collection

- **Retention policy** (Harbor): Giữ tag theo rule (ví dụ “keep last 10 tags”, “keep tags match v*”, “keep 30 days”). Tag không thỏa rule sẽ bị xóa (theo job).
- **Garbage collection (GC)**: Xóa **layer** (blob) không còn được tham chiếu bởi bất kỳ manifest nào. Chạy định kỳ (schedule) hoặc manual; trong lúc chạy registry read-only (tùy version).
- Tránh tích tụ quá nhiều tag không dùng → tốn storage; nên tag version rõ (v1.0.0) và dùng retention.

---

## HA và backup

- **HA**: Harbor có thể chạy **multiple replicas** (Core, Job service, Registry); **shared storage** (S3, NFS) cho registry storage; **DB** (PostgreSQL) dùng primary-replica. Phía trước dùng load balancer; session/state cần cấu hình (redis session store nếu có).
- **Backup**: Backup **database** (metadata) và **registry storage** (blobs). Restore: restore DB + storage rồi start Harbor. Document quy trình restore và test định kỳ.

---

## Câu hỏi thường gặp

### Tag latest có nên dùng không?

- **latest** dễ dùng nhưng không immutable (có thể ghi đè). Production nên dùng **version tag** (v1.0.0, sha256) để deploy đúng bản đã test. CI có thể tag cả `latest` và `v1.0.0`; deploy dùng `v1.0.0`.

### Harbor và Artifactory cùng dùng được không?

- **Được**. Artifactory quản lý nhiều loại artifact (Maven, npm, **Docker**); Harbor chuyên registry container. Có thể: CI push image lên Harbor (hoặc Artifactory Docker repo); team chọn một làm nguồn image chính. Một số dùng Harbor cho K8s, Artifactory cho Maven/npm.

---

**Kết thúc Harbor.** Quay lại [README](./README.md).
