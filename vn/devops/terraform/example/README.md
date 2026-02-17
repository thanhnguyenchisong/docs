# Example — Terraform mẫu

Tạo file `output.txt` bằng provider `local`. Chạy được để test và học Terraform.

## Chạy

```bash
terraform init
terraform plan
terraform apply -auto-approve
# Kiểm tra: cat output.txt
terraform destroy -auto-approve
```

Đọc kèm [../README.md](../README.md) và các file trong devops/terraform.
