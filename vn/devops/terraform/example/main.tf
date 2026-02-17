# Minh hoạ Terraform — resource đơn giản, chạy được
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

resource "local_file" "hello" {
  content  = "Hello from Terraform example"
  filename = "${path.module}/output.txt"
}
