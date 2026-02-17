# Kubernetes trên Cloud

## 1. Tổng quan về Managed Kubernetes

Managed Kubernetes services cho phép bạn chạy Kubernetes mà không cần quản lý control plane. Cloud provider sẽ:
- Quản lý control plane (API Server, etcd, Scheduler, Controller Manager)
- Tự động update và patch
- Cung cấp high availability
- Tích hợp với các cloud services khác

### 1.1. Lợi ích của Managed Kubernetes

**Ưu điểm:**
- **Giảm operational overhead**: Không cần quản lý control plane
- **High availability**: Multi-master setup tự động
- **Auto-scaling**: Tích hợp với cloud auto-scaling
- **Security**: Managed security patches và updates
- **Tích hợp cloud services**: IAM, Load Balancer, Storage, Monitoring
- **Cost-effective**: Chỉ trả tiền cho worker nodes

**Nhược điểm:**
- **Vendor lock-in**: Phụ thuộc vào cloud provider
- **Giới hạn customization**: Một số cấu hình bị hạn chế
- **Cost**: Có thể đắt hơn self-managed nếu scale lớn
- **Region availability**: Một số features chỉ có ở một số regions

### 1.2. Các Managed Kubernetes Services

- **AWS EKS** (Elastic Kubernetes Service)
- **Google GKE** (Google Kubernetes Engine)
- **Azure AKS** (Azure Kubernetes Service)
- **DigitalOcean Kubernetes**
- **IBM Cloud Kubernetes Service**
- **Oracle Container Engine for Kubernetes (OKE)**

## 2. AWS EKS (Elastic Kubernetes Service)

### 2.1. Tổng quan

EKS là managed Kubernetes service của AWS, cung cấp:
- Managed control plane
- Tích hợp với AWS services (IAM, VPC, ELB, etc.)
- Hỗ trợ Fargate (serverless containers)
- CNI plugin cho VPC networking

### 2.2. Kiến trúc EKS

```
┌─────────────────────────────────────────┐
│         AWS Managed Control Plane       │
│  (API Server, etcd, Scheduler, etc.)    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              VPC (Your Account)         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │ Worker Node  │    │ Worker Node  │  │
│  │  (EC2/Fargate)│    │  (EC2/Fargate)│  │
│  └──────────────┘    └──────────────┘  │
└─────────────────────────────────────────┘
```

### 2.3. Tạo EKS Cluster

**Sử dụng eksctl (Recommended):**

```bash
# Cài đặt eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Tạo cluster đơn giản
eksctl create cluster \
  --name my-cluster \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4

# Tạo cluster với nhiều options
eksctl create cluster \
  --name production-cluster \
  --region us-west-2 \
  --version 1.28 \
  --nodegroup-name workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 10 \
  --managed \
  --ssh-access \
  --ssh-public-key ~/.ssh/id_rsa.pub \
  --full-ecr-access \
  --alb-ingress-access
```

**Sử dụng AWS CLI:**

```bash
# Tạo cluster
aws eks create-cluster \
  --name my-cluster \
  --version 1.28 \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/EKSClusterRole \
  --resources-vpc-config subnetIds=subnet-xxx,subnet-yyy,securityGroupIds=sg-xxx

# Tạo node group
aws eks create-nodegroup \
  --cluster-name my-cluster \
  --nodegroup-name workers \
  --node-role arn:aws:iam::ACCOUNT_ID:role/NodeInstanceRole \
  --subnets subnet-xxx subnet-yyy \
  --instance-types t3.medium \
  --scaling-config minSize=1,maxSize=4,desiredSize=3
```

**Sử dụng Terraform:**

```hcl
# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "my-cluster"
  role_arn = aws_iam_role.cluster.arn
  version  = "1.28"

  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy,
  ]
}

# Node Group
resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "workers"
  node_role_arn   = aws_iam_role.nodes.arn
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 3
    max_size     = 10
    min_size     = 1
  }

  instance_types = ["t3.large"]
}
```

### 2.4. Kết nối đến EKS Cluster

```bash
# Cấu hình kubeconfig
aws eks update-kubeconfig --name my-cluster --region us-west-2

# Kiểm tra kết nối
kubectl get nodes
kubectl get svc
```

### 2.5. EKS Features

**AWS Load Balancer Controller:**
```bash
# Cài đặt AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

**Fargate (Serverless):**
```bash
# Tạo Fargate profile
eksctl create fargateprofile \
  --cluster my-cluster \
  --name my-fargate-profile \
  --namespace default

# Deploy pod lên Fargate
kubectl run nginx --image=nginx --namespace=default
```

**IRSA (IAM Roles for Service Accounts):**
```bash
# Tạo IAM role và link với service account
eksctl create iamserviceaccount \
  --name s3-reader \
  --namespace default \
  --cluster my-cluster \
  --attach-policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess \
  --approve
```

### 2.6. EKS Best Practices

- **Sử dụng managed node groups**: Dễ quản lý và update
- **Enable cluster autoscaler**: Tự động scale nodes
- **Sử dụng IRSA**: Thay vì hardcode AWS credentials
- **Enable encryption**: Encrypt etcd và EBS volumes
- **Multi-AZ deployment**: Đảm bảo high availability
- **Enable CloudWatch Container Insights**: Monitoring
- **Sử dụng AWS Load Balancer Controller**: Thay vì NodePort

## 3. Google GKE (Google Kubernetes Engine)

### 3.1. Tổng quan

GKE là managed Kubernetes service của Google Cloud, cung cấp:
- Managed control plane
- Tích hợp với GCP services (IAM, Cloud Load Balancing, etc.)
- Autopilot mode (fully managed)
- Multi-cluster support

### 3.2. Tạo GKE Cluster

**Sử dụng gcloud CLI:**

```bash
# Cài đặt gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Tạo cluster Standard
gcloud container clusters create my-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --region=us-central1 \
  --enable-autorepair \
  --enable-autoupgrade

# Tạo cluster Autopilot (Fully managed)
gcloud container clusters create-auto my-autopilot-cluster \
  --region=us-central1

# Tạo cluster với nhiều options
gcloud container clusters create production-cluster \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --region=us-central1 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --enable-network-policy \
  --enable-ip-alias \
  --release-channel=regular
```

**Sử dụng Terraform:**

```hcl
resource "google_container_cluster" "main" {
  name     = "my-cluster"
  location = "us-central1"

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.main.name
  subnetwork = google_compute_subnetwork.main.name

  # Enable autoscaling
  node_config {
    machine_type = "e2-medium"
    disk_size_gb = 100
  }
}

resource "google_container_node_pool" "workers" {
  name       = "workers"
  cluster    = google_container_cluster.main.name
  location   = "us-central1"
  node_count = 3

  autoscaling {
    min_node_count = 1
    max_node_count = 10
  }

  node_config {
    machine_type = "e2-standard-4"
    disk_size_gb = 100
  }
}
```

### 3.3. Kết nối đến GKE Cluster

```bash
# Cấu hình kubeconfig
gcloud container clusters get-credentials my-cluster --region us-central1

# Kiểm tra kết nối
kubectl get nodes
```

### 3.4. GKE Features

**Autopilot Mode:**
- Fully managed, không cần quản lý nodes
- Auto-scaling và auto-upgrade
- Pay per pod thay vì per node

**Workload Identity (tương tự IRSA):**
```bash
# Enable Workload Identity
gcloud container clusters update my-cluster \
  --workload-pool=PROJECT_ID.svc.id.goog

# Link service account với GCP service account
kubectl annotate serviceaccount default \
  iam.gke.io/gcp-service-account=GCP_SA@PROJECT_ID.iam.gserviceaccount.com
```

**GKE Autopilot:**
```bash
# Tạo Autopilot cluster
gcloud container clusters create-auto my-autopilot-cluster \
  --region=us-central1

# Deploy workload (tự động scale)
kubectl apply -f deployment.yaml
```

**Multi-cluster Ingress:**
```bash
# Enable Multi-cluster Ingress
gcloud container clusters update my-cluster \
  --enable-multi-cluster-ingress
```

### 3.5. GKE Best Practices

- **Sử dụng Release Channels**: Regular, Rapid, Stable
- **Enable node auto-repair và auto-upgrade**
- **Sử dụng Workload Identity**: Thay vì service account keys
- **Enable network policy**: Security
- **Sử dụng Regional clusters**: High availability
- **Enable Binary Authorization**: Image security
- **Sử dụng Cloud Monitoring**: Observability

## 4. Azure AKS (Azure Kubernetes Service)

### 4.1. Tổng quan

AKS là managed Kubernetes service của Microsoft Azure, cung cấp:
- Managed control plane
- Tích hợp với Azure services (Azure AD, Azure Load Balancer, etc.)
- Virtual Nodes (serverless)
- Azure Policy integration

### 4.2. Tạo AKS Cluster

**Sử dụng Azure CLI:**

```bash
# Cài đặt Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Tạo resource group
az group create --name myResourceGroup --location eastus

# Tạo AKS cluster
az aks create \
  --resource-group myResourceGroup \
  --name my-cluster \
  --node-count 3 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --enable-azure-rbac \
  --generate-ssh-keys

# Tạo cluster với nhiều options
az aks create \
  --resource-group myResourceGroup \
  --name production-cluster \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --enable-cluster-autoscaler \
  --min-count 1 \
  --max-count 10 \
  --enable-managed-identity \
  --enable-azure-rbac \
  --network-plugin azure \
  --enable-addons monitoring
```

**Sử dụng Terraform:**

```hcl
resource "azurerm_resource_group" "main" {
  name     = "my-resource-group"
  location = "East US"
}

resource "azurerm_kubernetes_cluster" "main" {
  name                = "my-cluster"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "mycluster"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }

  role_based_access_control_enabled = true
}
```

### 4.3. Kết nối đến AKS Cluster

```bash
# Cấu hình kubeconfig
az aks get-credentials --resource-group myResourceGroup --name my-cluster

# Kiểm tra kết nối
kubectl get nodes
```

### 4.4. AKS Features

**Virtual Nodes (Serverless):**
```bash
# Enable Virtual Nodes
az aks enable-addons \
  --resource-group myResourceGroup \
  --name my-cluster \
  --addons virtual-node \
  --subnet-name myVirtualNodeSubnet
```

**Azure AD Integration:**
```bash
# Enable Azure AD integration
az aks update \
  --resource-group myResourceGroup \
  --name my-cluster \
  --enable-aad \
  --aad-admin-group-object-ids <group-id>
```

**Azure Policy:**
```bash
# Enable Azure Policy
az aks enable-addons \
  --resource-group myResourceGroup \
  --name my-cluster \
  --addons azure-policy
```

**Pod Identity (tương tự IRSA):**
```bash
# Enable Pod Identity
az aks update \
  --resource-group myResourceGroup \
  --name my-cluster \
  --enable-pod-identity
```

### 4.5. AKS Best Practices

- **Sử dụng Managed Identity**: Thay vì service principal
- **Enable Azure RBAC**: Integration với Azure AD
- **Sử dụng Azure CNI**: Better networking control
- **Enable cluster autoscaler**: Auto-scale nodes
- **Enable Azure Monitor**: Observability
- **Sử dụng Availability Zones**: High availability
- **Enable Azure Policy**: Governance và compliance

## 5. So sánh các Cloud Providers

### 5.1. Bảng so sánh

| Feature | AWS EKS | Google GKE | Azure AKS |
|---------|---------|------------|-----------|
| **Control Plane Cost** | $0.10/hour | Free | Free |
| **Node Management** | Managed/Unmanaged | Managed/Autopilot | Managed |
| **Serverless Option** | Fargate | Autopilot | Virtual Nodes |
| **IAM Integration** | IRSA | Workload Identity | Pod Identity |
| **Load Balancer** | ALB/NLB | GCP Load Balancer | Azure LB |
| **Storage** | EBS/EFS | Persistent Disk | Azure Disk/File |
| **Networking** | VPC CNI | GKE Networking | Azure CNI |
| **Multi-cluster** | Limited | Multi-cluster Ingress | Limited |
| **Auto-scaling** | Cluster Autoscaler | Built-in | Cluster Autoscaler |
| **Monitoring** | CloudWatch | Cloud Monitoring | Azure Monitor |

### 5.2. Khi nào chọn provider nào?

**AWS EKS:**
- Đã sử dụng AWS ecosystem
- Cần tích hợp với nhiều AWS services
- Cần Fargate cho serverless workloads
- Enterprise với AWS contracts

**Google GKE:**
- Cần multi-cluster features
- Muốn Autopilot (fully managed)
- Đã sử dụng GCP
- Cần advanced networking features

**Azure AKS:**
- Đã sử dụng Azure ecosystem
- Cần tích hợp với Microsoft services
- Enterprise với Microsoft contracts
- Cần Azure AD integration

## 6. Cloud-Specific Features

### 6.1. Storage Classes

**AWS EKS:**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
```

**Google GKE:**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard-rwo
provisioner: pd.csi.storage.gke.io
parameters:
  type: pd-standard
  replication-type: regional-pd
volumeBindingMode: WaitForFirstConsumer
```

**Azure AKS:**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: managed-premium
provisioner: disk.csi.azure.com
parameters:
  storageaccounttype: Premium_LRS
  kind: Managed
volumeBindingMode: WaitForFirstConsumer
```

### 6.2. Load Balancer Integration

**AWS EKS - ALB Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

**Google GKE - GCP Load Balancer:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: app
```

**Azure AKS - Azure Load Balancer:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
  annotations:
    service.beta.kubernetes.io/azure-load-balancer-resource-group: myResourceGroup
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: app
```

### 6.3. Identity và Access Management

**AWS EKS - IRSA:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: s3-reader
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/S3ReaderRole
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      serviceAccountName: s3-reader
      containers:
      - name: app
        image: my-app:latest
```

**Google GKE - Workload Identity:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: gcs-reader
  annotations:
    iam.gke.io/gcp-service-account: gcs-reader@PROJECT_ID.iam.gserviceaccount.com
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  template:
    spec:
      serviceAccountName: gcs-reader
      containers:
      - name: app
        image: my-app:latest
```

**Azure AKS - Pod Identity:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: blob-reader
---
apiVersion: aadpodidentity.k8s.io/v1
kind: AzureIdentity
metadata:
  name: blob-reader-identity
spec:
  type: 0
  resourceID: /subscriptions/SUB_ID/resourcegroups/RG/providers/Microsoft.ManagedIdentity/userAssignedIdentities/BLOB_READER
  clientID: CLIENT_ID
---
apiVersion: aadpodidentity.k8s.io/v1
kind: AzureIdentityBinding
metadata:
  name: blob-reader-binding
spec:
  azureIdentity: blob-reader-identity
  selector: blob-reader
```

## 7. Thực hành: Deploy ứng dụng lên Cloud

### 7.1. Deploy lên EKS

**Bước 1: Tạo cluster**
```bash
eksctl create cluster \
  --name my-app-cluster \
  --region us-west-2 \
  --nodegroup-name workers \
  --node-type t3.medium \
  --nodes 3
```

**Bước 2: Deploy ứng dụng**
```bash
# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml

# Kiểm tra
kubectl get pods
kubectl get svc
kubectl get ingress
```

**Bước 3: Cấu hình AWS Load Balancer Controller**
```bash
# Cài đặt
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-app-cluster
```

### 7.2. Deploy lên GKE

**Bước 1: Tạo cluster**
```bash
gcloud container clusters create my-app-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --region=us-central1
```

**Bước 2: Deploy ứng dụng**
```bash
# Get credentials
gcloud container clusters get-credentials my-app-cluster --region us-central1

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

### 7.3. Deploy lên AKS

**Bước 1: Tạo cluster**
```bash
az group create --name myResourceGroup --location eastus
az aks create \
  --resource-group myResourceGroup \
  --name my-app-cluster \
  --node-count 3 \
  --enable-managed-identity
```

**Bước 2: Deploy ứng dụng**
```bash
# Get credentials
az aks get-credentials --resource-group myResourceGroup --name my-app-cluster

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
```

## 8. Cost Optimization

### 8.1. Node Management

**Sử dụng Spot/Preemptible Instances:**
- **EKS**: Spot Instances
- **GKE**: Preemptible VMs
- **AKS**: Spot VMs

```bash
# EKS với Spot Instances
eksctl create nodegroup \
  --cluster my-cluster \
  --name spot-workers \
  --instance-types t3.medium,t3.large \
  --spot \
  --nodes 3
```

**Cluster Autoscaler:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 8.2. Serverless Options

**Fargate (EKS):**
- Pay per pod, không pay cho idle nodes
- Phù hợp cho workloads không cần full node

**Autopilot (GKE):**
- Fully managed, pay per pod
- Tự động optimize resource allocation

**Virtual Nodes (AKS):**
- Serverless containers
- Scale to zero khi không dùng

### 8.3. Resource Optimization

- **Right-sizing**: Chọn instance type phù hợp
- **Reserved Instances**: Giảm cost cho long-running workloads
- **Scheduled Scaling**: Scale down vào off-hours
- **Pod Disruption Budgets**: Tránh over-provisioning

## 9. Security Best Practices

### 9.1. Network Security

- **Private clusters**: Control plane không có public endpoint
- **Network policies**: Restrict pod-to-pod communication
- **VPC/Network isolation**: Isolate workloads

### 9.2. Identity và Access

- **RBAC**: Fine-grained permissions
- **IRSA/Workload Identity/Pod Identity**: Không hardcode credentials
- **Secrets management**: Sử dụng cloud secret managers
- **Image scanning**: Scan container images

### 9.3. Compliance

- **Encryption**: Encrypt data at rest và in transit
- **Audit logging**: Enable audit logs
- **Policy enforcement**: Sử dụng OPA/Gatekeeper
- **Compliance certifications**: SOC, ISO, etc.

## 10. Monitoring và Observability

### 10.1. Cloud Monitoring Solutions

**AWS:**
- CloudWatch Container Insights
- X-Ray for tracing
- CloudWatch Logs

**Google:**
- Cloud Monitoring
- Cloud Logging
- Cloud Trace

**Azure:**
- Azure Monitor
- Application Insights
- Log Analytics

### 10.2. Setup Monitoring

**EKS - CloudWatch:**
```bash
# Enable Container Insights
aws eks update-cluster-config \
  --name my-cluster \
  --logging '{"enable":["api","audit","authenticator","controllerManager","scheduler"]}'
```

**GKE - Cloud Monitoring:**
```bash
# Enable monitoring
gcloud container clusters update my-cluster \
  --enable-monitoring
```

**AKS - Azure Monitor:**
```bash
# Enable monitoring
az aks enable-addons \
  --resource-group myResourceGroup \
  --name my-cluster \
  --addons monitoring
```

## 11. Disaster Recovery và Backup

### 11.1. Cluster Backup

- **etcd backup**: Backup control plane state
- **Application data**: Backup persistent volumes
- **Configuration**: GitOps với Git repository

### 11.2. Multi-Region Deployment

- **Multi-cluster**: Deploy ở nhiều regions
- **Global Load Balancer**: Route traffic đến healthy clusters
- **Data replication**: Replicate data across regions

## 12. Migration từ On-Premise sang Cloud

### 12.1. Migration Strategy

1. **Assessment**: Đánh giá workloads hiện tại
2. **Planning**: Lập kế hoạch migration
3. **Pilot**: Test với non-critical workloads
4. **Migration**: Migrate từng phần
5. **Optimization**: Optimize sau migration

### 12.2. Tools

- **Velero**: Backup và restore
- **Kubectl**: Export/import resources
- **Helm**: Package và deploy
- **GitOps**: ArgoCD, Flux

## 13. Tóm tắt

- **Managed Kubernetes**: Giảm operational overhead, tự động update và patch
- **EKS**: Tích hợp tốt với AWS ecosystem, Fargate cho serverless
- **GKE**: Autopilot mode, multi-cluster features, advanced networking
- **AKS**: Tích hợp với Azure services, Azure AD integration
- **Cost Optimization**: Sử dụng spot instances, autoscaling, serverless options
- **Security**: Network policies, RBAC, IRSA/Workload Identity, encryption
- **Monitoring**: Cloud-native monitoring solutions
- **Best Practices**: Right-sizing, multi-region, disaster recovery

Khi chọn cloud provider, cân nhắc:
- Ecosystem hiện tại
- Features cần thiết
- Cost structure
- Compliance requirements
- Team expertise