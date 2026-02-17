# Checklist Master DevOps — Tự tin pass phỏng vấn Master DevOps

Sau khi **học thuộc hết** nội dung trong toàn bộ folder devops (Git, GitLab CI, Jenkins, Kubernetes, Helm, Terraform, bottleneck-resolve / observability), dùng checklist này để **tự kiểm tra**. Trả lời rõ ràng hầu hết các mục = **hoàn toàn tự tin pass phỏng vấn master DevOps**.

---

## 1. Tổng quan nội dung DevOps (đã có trong folder)

| Folder | Chủ đề chính | Dùng để trả lời |
|--------|----------------|------------------|
| **git** | Fundamentals, branching, remote, workflow, troubleshooting, reflog | Version control, collaboration |
| **gitlab** | Pipelines, stages/jobs, rules, artifacts, cache, environments, security scans, registry, K8s deploy | CI/CD GitLab |
| **jenkins** | Pipelines (Declarative), agents, credentials, quality gates, security, backup | CI/CD Jenkins |
| **k8s** | Concepts, deploy app, observability, scaling/resilience, profiling, ops/incidents (SLO, runbook, hardening) | K8s production |
| **k8s-udemy** | Container runtime (CRI, containerd), manifest, networking, security (RBAC, NetworkPolicy), Kustomize, Jobs/CronJobs | K8s chi tiết |
| **helm** | Chart, values, templating, release (install/upgrade/rollback), diff, testing | Package manager K8s |
| **terraform** | IaC, state, backends, modules, testing, CI, security, multi-env | Infrastructure as Code |
| **bottleneck-resolve** | JMeter, Async Profiler, Prometheus/Grafana, profiling on K8s | Observability, performance |

---

## 2. Checklist phỏng vấn Master DevOps

### Git & Version Control

- [ ] **Git workflow**: working directory, staging, repository; merge vs rebase — khi nào dùng gì?
- [ ] **Conflict resolution**: cách resolve merge conflict, khi nào dùng `ours`/`theirs`.
- [ ] **Reflog**: dùng để làm gì? Recover commit “mất” thế nào?
- [ ] **Branch strategy**: Git Flow, GitHub Flow, trunk-based — ưu nhược từng kiểu.
- [ ] **Cherry-pick, revert**: khác nhau; dùng khi nào (hotfix, undo commit đã push).

### CI/CD — Pipeline & Practices

- [ ] **Pipeline stages** điển hình: build → test → (security scan) → build image → deploy; fail fast ở đâu?
- [ ] **Artifacts vs cache**: artifacts để truyền output giữa stages; cache để tăng tốc (deps). Khác nhau?
- [ ] **Secrets trong CI**: không hardcode; dùng vault/credentials store; inject qua env hoặc files; rotate.
- [ ] **Quality gates**: unit test, integration test, lint, SAST/Dependency scan — block deploy khi fail.
- [ ] **Blue-Green vs Canary**: so sánh; khi nào chọn từng kiểu; rollback thế nào?
- [ ] **GitLab vs Jenkins**: so sánh (YAML vs Groovy, runner vs agent, built-in registry vs external).
- [ ] **Pipeline cho nhiều môi trường**: dev/staging/prod; manual approval cho prod; environment variables protected.

### Container & Docker

- [ ] **Image layers**: Dockerfile mỗi instruction = layer; tận dụng cache; đặt ít thay đổi lên trên.
- [ ] **Multi-stage build**: dùng để giảm size image (build stage tách khỏi runtime stage).
- [ ] **Container runtime**: CRI, containerd vs Docker (từ K8s 1.24 không dùng Docker runtime); crictl/nerdctl dùng khi nào?
- [ ] **Image security**: base image nhỏ, không chạy root; scan CVE (Trivy, Clair); registry signing.

### Kubernetes — Core & Deploy

- [ ] **Pod, Deployment, Service, Ingress**: vai trò từng resource; Service types (ClusterIP, LoadBalancer, NodePort).
- [ ] **Rollout**: rolling update, maxSurge/maxUnavailable; rollback (`kubectl rollout undo`).
- [ ] **ConfigMap & Secret**: dùng cho config và sensitive data; mount env hoặc file.
- [ ] **Requests vs Limits**: ảnh hưởng scheduling và throttling; QoS (Guaranteed, Burstable, BestEffort).
- [ ] **Liveness vs Readiness probe**: khác nhau; sai cấu hình dẫn đến restart loop hoặc traffic vào pod chưa sẵn sàng.
- [ ] **Namespace**: dùng để isolate (env, team); ResourceQuota, LimitRange.

### Kubernetes — Scaling & Resilience

- [ ] **HPA** (Horizontal Pod Autoscaler): dựa trên CPU/custom metrics; min/max replicas.
- [ ] **PodDisruptionBudget (PDB)**: đảm bảo số replica tối thiểu khi drain node.
- [ ] **Node affinity / taint & toleration**: dùng để schedule pod lên node phù hợp hoặc tránh node.
- [ ] **Topology spread**: tránh tập trung pod trên một node/zone.

### Kubernetes — Security & Ops

- [ ] **RBAC**: Role, ClusterRole, RoleBinding, ClusterRoleBinding; ServiceAccount cho pod.
- [ ] **NetworkPolicy**: restrict traffic ingress/egress theo pod selector.
- [ ] **Security context**: runAsNonRoot, readOnlyRootFilesystem, drop capabilities.
- [ ] **Secrets**: tránh log; dùng external secret manager (Vault, provider) nếu cần.
- [ ] **SLO/SLI và error budget**: ví dụ 99.5% availability; alert theo burn rate.
- [ ] **Incident runbook**: detect → triage → mitigate (scale, rollback, restart) → diagnose → postmortem.
- [ ] **Backup**: manifest trong git; backup stateful data (DB, volumes); Grafana/alert rules.

### Helm

- [ ] **Chart structure**: Chart.yaml, values.yaml, templates/, helpers.
- [ ] **Install / upgrade / rollback**: `helm upgrade --install`, `helm rollback`; immutable tags.
- [ ] **Values**: override qua -f file, --set; values per environment (dev/staging/prod).
- [ ] **Diff trước khi apply**: helm-diff plugin; `helm template` + validation.
- [ ] **Helm trong CI**: lint → template → (kubeconform) → diff → deploy on approval.

### Terraform (IaC)

- [ ] **Workflow**: init → plan → apply; state lưu ở đâu (local, remote backend).
- [ ] **State locking**: tránh apply đồng thời (DynamoDB, …); tại sao quan trọng?
- [ ] **Module**: structure, input/output; dùng module registry (public/private).
- [ ] **Drift detection**: state khác với thực tế; cách xử lý (plan, fix code hoặc import).
- [ ] **Secrets**: không lưu plaintext trong state; dùng vault/provider; sensitive output.
- [ ] **Multi-environment**: workspace hoặc thư mục/backend riêng; tránh duplicate code (module).
- [ ] **Terraform trong CI**: plan trên PR; apply có approval; audit log.

### Observability & Performance

- [ ] **Metrics**: Prometheus (pull), các metric type (counter, gauge, histogram); scrape config.
- [ ] **Logging**: centralized (ELK, Loki); structured log; log level; không log secret.
- [ ] **Tracing**: distributed trace (trace id qua services); dùng khi debug latency qua nhiều service.
- [ ] **Alerting**: alert rule (Prometheus); severity; runbook link; tránh alert fatigue.
- [ ] **SLO → alert**: alert trên error budget burn rate, không chỉ “có lỗi”.
- [ ] **Load test**: JMeter hoặc tool khác; kịch bản (throughput, latency); profile (Async Profiler) để tìm bottleneck.
- [ ] **Profiling trên K8s**: copy profiler vào pod, chạy on-demand; không ảnh hưởng pod khác.

### Master-level (SRE & Culture)

- [ ] **Availability**: 99.9% = bao nhiêu downtime/năm? Cách tính.
- [ ] **Incident response**: severity; communication; blameless postmortem; action items.
- [ ] **Change management**: immutable image tag; rollout nhỏ; canary; watch metrics sau deploy.
- [ ] **Cost & optimization**: right-sizing requests/limits; spot/preemptible; cleanup unused resource.
- [ ] **Disaster recovery**: RTO/RPO; backup & restore; multi-region nếu cần.
- [ ] **Security in pipeline**: SAST, dependency scan, image scan; signed image; least privilege trong cluster.

---

## 3. Chủ đề Master DevOps thường gặp (đảm bảo ôn)

- **CI/CD**: Pipeline design, quality gates, secrets, blue-green/canary, rollback.
- **Kubernetes**: Deploy, scaling, resilience (HPA, PDB), security (RBAC, NetworkPolicy, securityContext), troubleshooting (describe, logs, events).
- **Observability**: Metrics (Prometheus), logs, traces; SLO/error budget; alerting có runbook.
- **IaC**: Terraform state, lock, module, multi-env; drift; không commit secret.
- **Incident & SRE**: Runbook, postmortem, on-call; availability tính toán; change risk.
- **Security**: Least privilege, secret management, image scan, supply chain (SBOM).

---

## 4. Cách dùng checklist

1. **Học đủ** toàn bộ tài liệu trong từng folder (git, gitlab, jenkins, k8s, k8s-udemy, helm, terraform, bottleneck-resolve).
2. **Tự hỏi từng mục** trong checklist; chưa trả lời được thì quay lại bài tương ứng (xem bảng mục 1).
3. **Thực hành**: tạo pipeline (GitLab hoặc Jenkins), deploy app lên K8s, dùng Helm, viết Terraform module, setup Prometheus/Grafana, chạy load test và profile.
4. **Ôn SRE**: đọc thêm SRE book hoặc tài liệu SLO/incident nếu công ty nhấn mạnh reliability.

---

## 5. Kết luận

**Học thuộc hết** nội dung devops trong folder + **trả lời được rõ ràng** đa số câu trong checklist trên = bạn có đủ nền **master DevOps** để **tự tin pass phỏng vấn master DevOps**. Các chủ đề version control, CI/CD, container/K8s, Helm, Terraform, observability và ops/incident đều được phủ bởi tài liệu hiện có; checklist giúp bạn không bỏ sót và biết cách “nối” từng chủ đề khi trả lời phỏng vấn.

→ Quay lại [README](./README.md) để xem lộ trình và mục lục từng folder.
