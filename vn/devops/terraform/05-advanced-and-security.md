## Phần 5: Advanced và security

### Locking và concurrency
- Đảm bảo backend hỗ trợ locks (S3+DynDB, GCS, Azure). Không bao giờ disable locking trong teams.
- Tránh concurrent applies; serialize qua CI.

### Secrets handling
- Không commit secrets. Ưu tiên:
  - Environment variables injected tại runtime.
  - External secret managers (AWS Secrets Manager/SSM, GCP Secret Manager, Vault) với data sources.
  - `sops` + `sops` provider hoặc helm-secrets-like patterns cho encrypted tfvars.
- Mark outputs `sensitive = true`.

### Policy và guardrails
- checkov/tfsec cho static checks.
- OPA/Conftest cho custom policies trên `terraform show -json plan.tfplan`.
- Sentinel (Terraform Cloud/Enterprise) nếu available.

### Multi-environment layout
- Option A: separate directories per env (khuyến nghị cho clarity):
```
envs/
  dev/
    main.tf
    terraform.tfvars
  prod/
    main.tf
    terraform.tfvars
```
- Option B: workspaces với env-specific vars; có discipline về backend key naming.

### Provider/version pinning
- Pin providers và Terraform version (`required_providers`, `required_version`).
- Commit `.terraform.lock.hcl`; regenerate khi upgrading providers intentionally.

### Drift và compliance
- Scheduled `terraform plan` để detect drift.
- Alert trên plan deltas trong CI; require approval trước apply.

### Performance và large states
- Giữ states scoped (đừng put everything trong một state).
- Sử dụng data sources thay vì duplicating resources across states.
- Cho very large plans, split thành multiple stacks/modules.

### Imports và refactors
- Sử dụng `terraform state mv` để reshape state mà không recreating resources.
- Plan sau moves/imports để đảm bảo không unintended changes.

### Debugging
- `TF_LOG=INFO` (hoặc DEBUG) cho provider diagnostics.
- `terraform show -json` cho machine-readable outputs.
- `terraform graph | dot -Tsvg > graph.svg` để visualize dependencies.

### Terragrunt (optional mention)
- Terragrunt có thể help với DRY backends, repeatable module calls, và environment stacks. Nếu adopted, giữ rules đơn giản và documented.

Bạn giờ đã có full Terraform path từ basics đến advanced practices. Giữ state safe, plans reviewed, và secrets out of code.