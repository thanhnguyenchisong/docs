# Tài liệu DevOps

Tài liệu CI/CD, version control, container, Kubernetes, IaC và điều tra hiệu suất. Đọc README trong từng folder để biết thứ tự bài và cách dùng file mẫu.

## 🎯 Mục tiêu Master DevOps

**Học thuộc hết** nội dung trong toàn bộ folder devops và trả lời được **Checklist Master DevOps** → **hoàn toàn tự tin pass phỏng vấn master DevOps**.

→ **[MASTER-DEVOPS-CHECKLIST.md](./MASTER-DEVOPS-CHECKLIST.md)** — tổng hợp câu hỏi phỏng vấn theo chủ đề (Git, CI/CD, Container, K8s, Helm, Terraform, Observability, SRE/Ops). Làm xong checklist = sẵn sàng master.

---

## Cấu trúc

| Folder | Mô tả |
|--------|--------|
| [**git**](./git/) | Git: fundamentals, branching, remote, workflow, troubleshooting |
| [**gitlab**](./gitlab/) | GitLab CI/CD: pipelines, `.gitlab-ci.yml`, file mẫu |
| [**jenkins**](./jenkins/) | Jenkins: pipelines, Jenkinsfile mẫu, so sánh với GitLab |
| [**k8s**](./k8s/) | Kubernetes: deploy app, observability, scaling, profiling trên K8s |
| [**k8s-udemy**](./k8s-udemy/) | Kubernetes chi tiết: manifest, networking, security, Kustomize |
| [**helm**](./helm/) | Helm: chart, values, templating, release |
| [**terraform**](./terraform/) | Terraform: state, modules, testing, security |
| [**bottleneck-resolve**](./bottleneck-resolve/) | Demo profiling: JMeter, Async Profiler, Prometheus/Grafana |

## Lộ trình gợi ý

- **Version control & CI**: [git](./git/) → [gitlab](./gitlab/) hoặc [jenkins](./jenkins/)
- **Container & K8s**: [k8s](./k8s/) (nhanh) hoặc [k8s-udemy](./k8s-udemy/) (chi tiết) → [helm](./helm/)
- **IaC**: [terraform](./terraform/)
- **Observability**: [bottleneck-resolve](./bottleneck-resolve/) (JMeter, Profiler, Prometheus/Grafana)
- **Master**: Học hết các folder trên → làm **[MASTER-DEVOPS-CHECKLIST.md](./MASTER-DEVOPS-CHECKLIST.md)** để tự kiểm tra và ôn SRE/ops/incident.
