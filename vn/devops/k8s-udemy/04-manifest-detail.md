Below is the full Markdown content to place into `vn/k8s-udemy/04-manifest-detail.md`.

```markdown
# Manifest details & commands

This file documents common `kubectl` commands and example manifests for creating Kubernetes objects.

## Prerequisites
- `kubectl` configured to the target cluster (`kubectl config current-context`)
- basic tools: `kubectl`, `kubectl apply`, `kubectl get`, `kubectl describe`, `kubectl logs`, `kubectl exec`

## Common kubectl commands (quick reference)
- Apply a manifest:
  ```sh
  kubectl apply -f <file.yaml>
  ```
- Delete by file or resource:
  ```sh
  kubectl delete -f <file.yaml>
  kubectl delete pod/my-pod
  ```
- Get resources:
  ```sh
  kubectl get pods
  kubectl get deploy
  kubectl get svc
  kubectl get po,svc,deploy -o wide
  ```
- Describe and logs:
  ```sh
  kubectl describe pod/<name>
  kubectl logs pod/<name> [-c <container>]
  ```
- Exec and port-forward:
  ```sh
  kubectl exec -it pod/<name> -- /bin/sh
  kubectl port-forward svc/<service> 8080:80
  ```
- Scale and rollout:
  ```sh
  kubectl scale deploy/<name> --replicas=3
  kubectl rollout status deploy/<name>
  kubectl set image deploy/<name> <container>=image:tag
  ```
- Debugging / metrics:
  ```sh
  kubectl top pod
  kubectl top node
  kubectl get events --sort-by=.metadata.creationTimestamp
  ```

## Manifest examples

Each example shows a minimal manifest and the command to create it.

### Pod
Create a single pod.
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-pod
  labels:
    app: hello
spec:
  containers:
  - name: web
    image: nginx:stable
    ports:
    - containerPort: 80
```
Apply:
```sh
kubectl apply -f pod-hello.yaml
```

### Deployment
Rolling updates and scaling.
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-deploy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
      - name: web
        image: nginx:stable
        ports:
        - containerPort: 80
```
Apply:
```sh
kubectl apply -f deploy-hello.yaml
```

### Service (ClusterIP / NodePort)
ClusterIP (internal) and NodePort (expose on node port).
```yaml
# ClusterIP service
apiVersion: v1
kind: Service
metadata:
  name: hello-svc
spec:
  selector:
    app: hello
  ports:
  - port: 80
    targetPort: 80
```

```yaml
# NodePort service
apiVersion: v1
kind: Service
metadata:
  name: hello-nodeport
spec:
  type: NodePort
  selector:
    app: hello
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

### Ingress (example, requires Ingress controller)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-ingress
spec:
  rules:
  - host: hello.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hello-svc
            port:
              number: 80
```

### ConfigMap
Provide configuration into pods.
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_MODE: "production"
  LOG_LEVEL: "info"
```

Mount or env usage shown in Deployment via `envFrom`:
```yaml
envFrom:
- configMapRef:
    name: app-config
```

### Secret (opaque, base64)
Create a secret file:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  username: YWRtaW4=     # base64('admin')
  password: c2VjcmV0     # base64('secret')
```

Use in pod as env or volume.

### PersistentVolumeClaim (PVC)
Request storage from a StorageClass.
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

Mount in pod `volumeMounts` and `volumes`.

### StatefulSet (stable identity)
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: "redis"
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:6
        ports:
        - containerPort: 6379
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 2Gi
```

### DaemonSet
Run one pod per node.
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels:
      app: node-agent
  template:
    metadata:
      labels:
        app: node-agent
    spec:
      containers:
      - name: agent
        image: busybox
        command: ["sh","-c","sleep 3600"]
```

### Job
Run a one-shot task.
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-job
spec:
  template:
    spec:
      containers:
      - name: task
        image: busybox
        command: ["sh","-c","echo hello && sleep 1"]
      restartPolicy: Never
  backoffLimit: 4
```

### CronJob
Scheduled job (batch/v1).
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cron
spec:
  schedule: "*/5 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: task
            image: busybox
            command: ["sh","-c","date; echo hello"]
          restartPolicy: OnFailure
```

### RBAC (Role and RoleBinding)
Role scoped to a namespace and bind to a ServiceAccount.
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get","watch","list"]
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: default
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### HorizontalPodAutoscaler (HPA)
Auto-scale deployment by CPU (metrics server required).
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: hello-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: hello-deploy
  minReplicas: 1
  maxReplicas: 5
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 50
```

## Useful patterns & tips
- Validate a manifest before apply:
  ```sh
  kubectl apply --dry-run=client -f file.yaml
  ```
- Preview changes (server-side dry-run):
  ```sh
  kubectl apply --server-dry-run -f file.yaml
  ```
- Get YAML of live object:
  ```sh
  kubectl get deploy hello-deploy -o yaml > current-deploy.yaml
  ```
- Patch a field without editing full manifest:
  ```sh
  kubectl patch deploy hello-deploy -p '{"spec":{"replicas":2}}'
  ```
- Debugging pods:
    - If CrashLoopBackOff: `kubectl logs --previous pod/<pod>`
    - Exec into running container: `kubectl exec -it pod/<pod> -- sh`

## File organization suggestions
- `manifests/` top-level folder
    - `manifests/0-namespace.yaml`
    - `manifests/1-config.yaml`
    - `manifests/2-deploy.yaml`
    - `manifests/3-svc.yaml`
    - `manifests/4-ingress.yaml`
    - `manifests/5-rbac/` for role/rolebinding
    - `manifests/6-storage/` for PV/PVC

## References
- kubectl cheat sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- API reference: https://kubernetes.io/docs/reference/generated/kubernetes-api/
```

The `manifests/` folder is a good baseline but not sufficient for a production\-ready Java Spring Boot application. Missing and recommended items (minimum):

- Security
  - Define least\-privilege RBAC (`Role`/`RoleBinding`) for service accounts.
  - Pod security policies via Pod Security Admission profiles.
  - Secrets management (external secrets, KMS, or sealed secrets) and encryption at rest.
  - Image signing/scanning and immutable image tags.

- Pod / runtime hardening
  - Resource `requests` / `limits` and QoS classes.
  - Liveness and readiness probes for each container.
  - SecurityContext (runAsNonRoot, readOnlyRootFilesystem).
  - JVM tuning: heap sizing via environment vars, graceful shutdown (SIGTERM handling).

- Availability & scheduling
  - PodDisruptionBudget manifests.
  - Anti\-affinity / affinity rules, taints & tolerations for multi\-AZ HA.
  - Multi\-zone cluster and node pools planning.

- Storage & data protection
  - Well\-defined `StorageClass`, PV/PVC withbackup/restore strategy.
  - Database backups and migration manifests (Flyway/Liquibase jobs).

- Networking & TLS
  - NetworkPolicy objects to restrict pod traffic.
  - Ingress controller + `cert\-manager` for TLS automation.
  - Load balancer / internal vs external service design.

- Observability & SRE
  - Metrics: Prometheus + metrics-server; add HPA based on metrics.
  - Centralized logging (Fluentd/Fluent Bit \-> Elasticsearch/LogStore).
  - Tracing (Jaeger/OpenTelemetry).
  - Alerts, dashboards, SLO/SLI definitions and runbooks.

- CI/CD & release strategy
  - Pipeline that builds, scans, tests, and deploys (GitOps or pipeline + rollback).
  - Image registry policy and automated deployments (canary/blue\-green).

- Autoscaling & cluster management
  - HPA/VPA configs, cluster autoscaler, and configure metrics server.
  - Node lifecycle and image/cache warming.

- Governance & resource control
  - `ResourceQuota` and `LimitRange` per namespace.
  - OPA/Gatekeeper policies for admission control.

- Testing & operational readiness
  - Staging environment manifests, integration/perf tests in pipeline.
  - DR plan, chaos testing, documented runbooks and escalation.

Conclusion: add manifests and operational tooling for the items above (probes, requests/limits, PDB, NetworkPolicy, StorageClass + backups, Prometheus/logging/tracing, cert\-manager, HPA, RBAC least\-privilege, ResourceQuota/LimitRange, CI/CD). Only then the deployment can be considered production\-ready.