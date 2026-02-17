## Hướng dẫn nhanh GitLab CI/CD từ cơ bản đến nâng cao

Đọc theo thứ tự:

1. `01-basics.md` — runners, anatomy .gitlab-ci.yml, pipeline quickstart.
2. `02-pipelines-and-config.md` — stages/jobs, rules/only/except, artifacts, caches, templates.
3. `03-advanced-and-security.md` — environments, deployments, approvals, security scans, variables/protection, includes.

### File mẫu và giải thích chi tiết

- **`gitlab-ci.yml`** — File `.gitlab-ci.yml` mẫu đầy đủ cho Spring Boot application
  - Bao gồm: build, test, security scan, Docker build, deployment
  - Có thể copy trực tiếp vào root project và tùy chỉnh
  
- **`gitlab-ci-explanation.md`** — Giải thích chi tiết từng phần trong file `gitlab-ci.yml`
  - Giải thích từng section, keyword, và best practices
  - Có ví dụ và FAQ

Sử dụng file `gitlab-ci.yml` mẫu và một shared hoặc local runner để thực hành trong khi đọc.