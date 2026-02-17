## Phần 6: Day-2 ops, incidents, và hardening

Mục tiêu: giữ service reliable trong production, handle incidents, và reduce risk.

### 1) SLOs và budgets
- Ví dụ SLO: 99.5% success qua 30d; P95 latency < 500ms; error budget = 0.5% failures.
- Track qua Grafana/Prometheus; alert trên budget burn rate, không chỉ point metrics.

### 2) Runbook cho incidents
1) **Detect**: Alerts fire (5xx rate, latency P95, CPU/GC cao, restarts).
2) **Triage fast**:
   - `kubectl -n perf get pods -o wide`
   - `kubectl -n perf describe pod <pod>` cho events
   - `kubectl -n perf logs <pod> | tail`
   - `kubectl -n perf top pods`
3) **Scope**: Nó là một pod, node-wide, hoặc all zones?
4) **Mitigate**:
   - Scale up: `kubectl -n perf scale deploy/perf-app --replicas=6`
   - Roll back: `kubectl -n perf rollout undo deploy/perf-app`
   - Restart bad pod: `kubectl -n perf delete pod <pod>`
5) **Diagnose deeper**:
   - Kiểm tra Grafana panels (HTTP, JVM, GC, node resources).
   - Profile hot pod với Async Profiler (xem Part 5/`docs/07-async-profiler-k8s-recipes.md`).
6) **Close**: Verify metrics recovered, tạo postmortem, track action items.

### 3) Backups và config safety
- Lưu manifests trong git; sử dụng tags cho deployable versions.
- Back up Grafana dashboards và alert rules (qua config hoặc API).
- Back up bất kỳ stateful dependencies (DB/storage) nào riêng biệt; app này stateless nhưng depends on chúng.

### 4) Security/hardening checklist
- Không chạy dưới dạng root: đặt `securityContext.runAsNonRoot: true` và một UID non-root.
- Read-only root FS khi có thể; drop unnecessary capabilities.
- Sử dụng NetworkPolicies để restrict ingress/egress nếu cluster hỗ trợ.
- Giữ images nhỏ và updated; scan images định kỳ.
- Rotate secrets; tránh mounting secrets dưới dạng files nếu env vars đủ.

### 5) Reliability settings để consider
- PodDisruptionBudget (Part 4) để protect capacity trong drains.
- Liveness/readiness tuned đến real startup/steady-state behavior.
- HPA configured để tránh runaway scale-down (đặt sensible minReplicas).
- Topology spread constraints để tránh single-node concentration.

### 6) Change management
- Ưu tiên immutable image tags per release.
- Roll out với surge 1 / unavailable 0 cho low-risk changes; canary cho risky ones.
- Sau rollout, watch key metrics trong 10–15 phút trước khi gọi nó good.

### 7) Useful ops commands
```bash
kubectl -n perf get pods -o wide
kubectl -n perf describe deploy/perf-app
kubectl -n perf rollout status deploy/perf-app
kubectl -n perf rollout undo deploy/perf-app
kubectl -n perf top pods
kubectl -n perf logs -l app=perf-app --max-log-requests=1 --tail=200
```

Giữ runbook này close đến dashboards và profiler recipes để responders có thể act nhanh.