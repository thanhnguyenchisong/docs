## Phần 3: Modules và reuse

### Module là gì?
- Một folder với `.tf` files; `main.tf` consuming `module` blocks là root module.
- Child modules là reusable units với `variables` và `outputs`.

### Tạo một local module (ví dụ)
```
modules/s3-logs/
  main.tf
  variables.tf
  outputs.tf
```
`variables.tf`:
```hcl
variable "bucket_name" { type = string }
variable "versioning"  { type = bool  default = true }
```
`main.tf`:
```hcl
resource "aws_s3_bucket" "this" {
  bucket = var.bucket_name
  versioning { enabled = var.versioning }
}
```
`outputs.tf`:
```hcl
output "bucket_arn" { value = aws_s3_bucket.this.arn }
```
Sử dụng nó:
```hcl
module "logs" {
  source      = "./modules/s3-logs"
  bucket_name = "perf-logs"
}
```

### Registry modules
- Sử dụng well-maintained registry modules cho common infra (VPC, ALB, RDS, GKE, etc.).
- Pin versions: `source = "terraform-aws-modules/vpc/aws"`, `version = "~> 5.0"`.

### Variables best practices
- Type everything; thêm validation khi helpful.
```hcl
variable "env" {
  type = string
  validation {
    condition     = contains(["dev","staging","prod"], var.env)
    error_message = "env must be one of dev|staging|prod."
  }
}
```
- Sử dụng maps/objects cho structured inputs; tránh nhiều parallel lists.

### Outputs
- Chỉ output cái gì callers need (IDs, ARNs, endpoints).
- Sensitive outputs: `sensitive = true`.

### Composition patterns
- Layered modules: network, data, app. Root module wires chúng với variables/outputs.
- Per-environment stacks: reuse same modules với different `tfvars`.
- Tránh excessive nesting; ưu tiên flatter composition cho clarity.

### Versioning và registries
- Cho internal modules, version qua git tags hoặc private registry.
- Giữ modules backward compatible; document required providers/versions.

### Testing modules (high level)
- `terraform validate` và `terraform plan` trong CI.
- Terratest hoặc kitchen-terraform cho integration tests (spin resources, assert, destroy).

Tiếp tục đến Part 4 cho testing và CI practices.