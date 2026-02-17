# Example — GitLab CI/CD mẫu

File `.gitlab-ci.yml` mẫu: hai stage `build` và `test`, chạy script đơn giản. **Chạy được** khi push lên GitLab (cần runner).

## Cách dùng

1. Copy `.gitlab-ci.yml` vào root của một repo GitLab.
2. Push commit — pipeline sẽ chạy (nếu project có runner).
3. Xem kết quả trong GitLab: CI/CD → Pipelines.

Đọc kèm [../README.md](../README.md) và các file trong devops/gitlab.
