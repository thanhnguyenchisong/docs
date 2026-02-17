## Hướng dẫn Kubernetes từ cơ bản đến chuyên gia (cho app này)

Folder này chứa staged path từ zero đến production-ready cho bottleneck-resolve Java app. Đọc theo thứ tự:

1. `01-basics.md` — core K8s concepts, mental models, và CLI quickstart.
2. `02-deploy-app.md` — build/push image, deploy manifests, services, ingress, và config.
3. `03-observability.md` — metrics, logs, traces, dashboards, và alert seeds.
4. `04-scaling-resilience.md` — HPA, requests/limits, rollout strategies, disruption policies.
5. `05-performance-profiling.md` — load generation, Async Profiler recipes, targeted pod testing.
6. `06-ops-incidents.md` — day-2 ops, SLOs, incident runbook, backups, và hardening checklist.

Bạn có thể apply manifests từ folder này với:
```bash
kubectl apply -f k8s/app.yaml
```

Adjust namespaces, registry, và ingress theo environment của bạn.