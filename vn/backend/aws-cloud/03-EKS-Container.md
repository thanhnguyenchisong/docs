# EKS & Container Services

## EKS (Elastic Kubernetes Service)

```
Managed K8s control plane.
  - AWS manages: API server, etcd, control plane HA
  - You manage: worker nodes, pods, deployments

Node types:
  Managed Node Groups: EC2 instances, auto-scaling
  Fargate: serverless pods (no nodes to manage)
  Self-managed: full control over nodes
```

### EKS Setup

```bash
# eksctl — create cluster
eksctl create cluster \
  --name production \
  --region ap-southeast-1 \
  --nodegroup-name workers \
  --node-type m5.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed
```

## ECR (Elastic Container Registry)

```bash
# Push image to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-southeast-1.amazonaws.com

docker build -t my-app .
docker tag my-app:latest 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/my-app:v1.0
docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/my-app:v1.0
```

## Fargate (Serverless Containers)

```
Chạy containers KHÔNG cần quản lý servers/nodes.
  - Specify CPU + Memory
  - AWS quản lý infrastructure
  - Pay per vCPU + memory per second

Use case: microservices không cần GPU, batch jobs, dev/test
NOT for: GPU workloads, daemonsets, host-level access
```

## CI/CD Pipeline trên AWS

```
GitHub → CodePipeline → CodeBuild → ECR → EKS

Hoặc:
GitHub Actions → Build & Push to ECR → kubectl apply to EKS

Hoặc:
GitLab CI → Build → Push ECR → ArgoCD → EKS (GitOps)
```
