# Security & Cost Optimization

## IAM Best Practices

```
1. Least Privilege: chỉ cấp quyền cần thiết
2. No root access: dùng IAM users/roles
3. MFA: bắt buộc cho tất cả users
4. Roles > Users: cho services dùng IAM Roles (không hardcode credentials)
5. Rotate keys: access keys rotate mỗi 90 ngày
```

### IAM Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": [
            "s3:GetObject",
            "s3:PutObject"
        ],
        "Resource": "arn:aws:s3:::my-bucket/*"
    }]
}
```

## Secrets Management

```
AWS Secrets Manager:
  - Store DB passwords, API keys, tokens
  - Auto-rotate secrets
  - Access via IAM roles (no hardcoded credentials)

AWS Systems Manager Parameter Store:
  - Configuration values
  - Free tier (standard parameters)
  - Hierarchy: /prod/db/password, /dev/db/password
```

## Cost Optimization

| Strategy | Savings | Khi nào dùng |
|---------|---------|-------------|
| **Reserved Instances** | 40-70% | Steady-state workloads |
| **Spot Instances** | 60-90% | Stateless, fault-tolerant |
| **Savings Plans** | 20-40% | Commit to $/hr for compute |
| **Right-sizing** | 10-40% | Over-provisioned resources |
| **Auto-scaling** | Variable | Traffic varies by time |
| **S3 Lifecycle** | 50-80% | Infrequent access data |

### Cost Monitoring

```
AWS Cost Explorer: visualize spending trends
AWS Budgets: set budget alerts
Trusted Advisor: recommendations
Tags: tag resources → track cost per team/project/env
```

## Well-Architected Framework (5 Pillars)

| Pillar | Focus |
|--------|-------|
| **Operational Excellence** | Automation, monitoring, incident response |
| **Security** | IAM, encryption, compliance |
| **Reliability** | HA, fault tolerance, disaster recovery |
| **Performance Efficiency** | Right resource type/size, scaling |
| **Cost Optimization** | Pay for what you use, right-sizing |
