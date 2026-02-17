## Phần 2: Workflow và state

### Standard workflow
1) `terraform init` — download providers, set backend.
2) `terraform fmt` — format.
3) `terraform validate` — basic checks.
4) `terraform plan -out=plan.tfplan` — preview và save plan.
5) `terraform apply plan.tfplan` — apply exact plan.
6) `terraform destroy` — clean up (khi intentional).

### Backends (remote state + locking)
- Sử dụng remote state cho teams để tránh local .tfstate drift.
- Common: S3 + DynamoDB (locking), GCS (với locking), Azure Storage (với locking).
- Ví dụ S3 backend (trong `terraform` block):
```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state-bucket"
    key            = "perf-app/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "my-tf-locks"
    encrypt        = true
  }
}
```
- Initialize (one-time per workspace): `terraform init`

### Workspaces
- Light-weight state partitioning (dev/stage/prod) chia sẻ same config:
```bash
terraform workspace new dev
terraform workspace select dev
terraform workspace list
```
- Sử dụng cautiously; nhiều teams ưu tiên separate directories/stacks thay vì workspaces cho clearer isolation.

### State safety
- Không bao giờ edit state manually; sử dụng `terraform state` commands nếu needed (move/import).
- Locking prevent concurrent applies; đảm bảo backend hỗ trợ nó.
- Back up state buckets và restrict access (IAM).

### Imports và existing resources
- Mang existing infra under management:
```bash
terraform import aws_s3_bucket.logs my-logs-bucket
```
- Sau import, thêm matching resource blocks; chạy `plan` để confirm không drift.

### Drift detection
- Regular `terraform plan` để spot changes made outside Terraform.
- Trong CI, chạy plan nightly và alert trên unexpected diffs.

### Destroy caution
- Sử dụng `-target` chỉ cho surgical changes; ưu tiên full plans để tránh surprises.
- Cho shared infra, restrict `destroy` qua IAM hoặc CI policy.

Tiếp tục đến Part 3 cho modules và reuse.