## Phần 1: Cơ bản về Terraform

### Terraform là gì
- IaC (infrastructure as code) tool lập kế hoạch desired state và apply changes qua providers.
- Declarative: bạn describe resources; Terraform figure out create/update/delete.
- Tracks state để biết cái gì tồn tại; plans là diff-like previews trước apply.

### Cài đặt
- macOS: `brew install terraform`
- Linux: `curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add - && sudo apt-add-repository ...` hoặc download từ releases.hashicorp.com.
- Verify: `terraform version`

### Lệnh cốt lõi (muscle memory)
```bash
terraform init              # download providers/modules, set up backend
terraform fmt               # format code
terraform validate          # syntax + provider validation
terraform plan              # preview changes
terraform apply             # apply với confirmation
terraform destroy           # remove managed resources
```

### Files và structure
- `main.tf` (entry), `variables.tf`, `outputs.tf`, `providers.tf` (common split).
- `terraform.tfvars` hoặc `*.auto.tfvars` cho values (auto-loaded).
- `.terraform.lock.hcl` locks provider versions; commit nó.
- Sử dụng một working directory per stack/env (hoặc sử dụng workspaces với care).

### Minimal example (local file)
```hcl
terraform {
  required_providers {
    local = { source = "hashicorp/local", version = "~> 2.4" }
  }
}

provider "local" {}

resource "local_file" "example" {
  filename = "hello.txt"
  content  = "hello"
}
```
Commands:
```bash
terraform init
terraform plan
terraform apply
terraform destroy
```

### Provider và version pinning
- Sử dụng version constraints trong `required_providers`.
- Pin Terraform trong `required_version` để tránh accidental upgrades.

### State caution (thậm chí trong dev)
- State là authoritative; không bao giờ delete `.tfstate` trừ khi bạn muốn mất tracking.
- Cho teams, sử dụng remote backends với locking (S3+DynDB, GCS, etc.)—covered trong Part 2.

Tiếp tục đến Part 2 cho workflow, backends, và state management.