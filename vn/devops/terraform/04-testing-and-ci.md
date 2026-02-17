## Phần 4: Testing và CI

### Local quality gates
```bash
terraform fmt -recursive
terraform validate
```

### Lint và security
- tflint (syntax + best practices per provider):
```bash
tflint --init
tflint
```
- checkov (IaC security/policy):
```bash
checkov -d .
```
- tfsec (alternative security scanner):
```bash
tfsec .
```

### Plan checks
- Luôn chạy `terraform plan` trong CI; fail trên drift/unexpected changes.
- Optional: `terraform plan -out=plan.tfplan` sau đó `terraform show -json plan.tfplan` cho policy checks.

### Testing modules
- Unit-ish: `terraform validate` + `tflint` + `terraform plan` với sample `tfvars`.
- Integration: Terratest (Go) hoặc kitchen-terraform để stand up resources, assert, và destroy.
- Cho cost/risk, restrict integration tests đến sandbox account/project.

### Sample CI flow (conceptual)
1) `terraform fmt -check`
2) `terraform validate`
3) `tflint`
4) `checkov` (hoặc tfsec)
5) `terraform plan` (đối với remote state backend)
6) Optional: store plan artifact; manual approval gates trước apply

### Apply gates
- Require plan review/approval trước apply.
- Sử dụng service accounts/roles với least privilege; tránh personal creds trong CI.
- Separate apply step (manual hoặc trên protected branches).

### State/backends trong CI
- Backend config nên consistent; tránh overriding đến local state trong CI.
- Đảm bảo lock table/bucket tồn tại trước khi chạy CI plans.

Tiếp tục đến Part 5 cho advanced topics và security patterns.