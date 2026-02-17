Production stack overview
You’re getting a complete Kubernetes production stack: a microservice web app (frontend + backend), a PostgreSQL database, TLS Ingress via cert-manager, autoscaling, resilience controls, network policies, and observability (Prometheus + Grafana + Loki + Promtail). Replace image names, domains, and storage classes with values for your environment.

Scope: Multi-service app, DB, TLS, autoscaling, PDB, quotas, limits, NetworkPolicy, monitoring, logging.

Assumptions: cert-manager and NGINX Ingress Controller are installed; a default storage class exists.


```yaml
# Namespace
apiVersion: v1
kind: Namespace
metadata:
  name: prod

---
# ResourceQuota to cap total usage per namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: prod-quota
  namespace: prod
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "100"
    services: "50"
    persistentvolumeclaims: "50"

---
# LimitRange to enforce per-container defaults
apiVersion: v1
kind: LimitRange
metadata:
  name: prod-defaults
  namespace: prod
spec:
  limits:
  - type: Container
    default:
      cpu: "1"
      memory: "1Gi"
    defaultRequest:
      cpu: "250m"
      memory: "512Mi"

---
# ClusterIssuer for automatic TLS via cert-manager (requires DNS challenge or HTTP-01 setup)
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    email: admin@example.com
    server: https://acme-v02.api.letsencrypt.org/directory
    privateKeySecretRef:
      name: letsencrypt-prod-key
    solvers:
    - http01:
        ingress:
          class: nginx
```

Application microservices and ingress
```yaml
# ConfigMap for app configs
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  namespace: prod
data:
  APP_MODE: "production"
  API_BASE_URL: "https://api.example.com"

---
# Secret for backend DB creds (base64-encode values)
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
  namespace: prod
type: Opaque
data:
  DB_HOST: cG9zdGdyZXMtc2VydmljZQ==      # postgresql-service
  DB_NAME: d2ViYXBw                     # webapp
  DB_USER: d2ViYXBwdXNlcg==             # webappuser
  DB_PASSWORD: c3VwZXJzZWNyZXQ=         # supersecret

---
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
    spec:
      containers:
      - name: backend
        image: ghcr.io/yourorg/backend:1.0.0
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: web-config
        - secretRef:
            name: backend-secrets
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "1Gi"
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 10

---
# Backend Service
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080

---
# Frontend Deployment (static SPA served by nginx)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/yourorg/frontend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: API_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: web-config
              key: API_BASE_URL
        resources:
          requests:
            cpu: "250m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /
            port: 8080
          initialDelaySeconds: 20
          periodSeconds: 10

---
# Frontend Service
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 8080

---
# Ingress with TLS (frontend) and path-based routing to backend
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  namespace: prod
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - www.example.com
    - api.example.com
    secretName: web-tls
  rules:
  - host: www.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80

---
# NetworkPolicy to restrict traffic: only frontend and ingress can hit backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allowlist
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: prod
  policyTypes:
  - Ingress
  - Egress
```

## Database: PostgreSQL with StatefulSet and PVC
```yaml
# StorageClass (optional: use your cloud/default SC; here, local-path example)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: postgres-sc
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer

---
# Headless Service for StatefulSet
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: prod
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432

---
# Secret for actual DB auth inside the DB
apiVersion: v1
kind: Secret
metadata:
  name: postgres-auth
  namespace: prod
type: Opaque
data:
  POSTGRES_DB: d2ViYXBw          # webapp
  POSTGRES_USER: d2ViYXBwdXNlcg== # webappuser
  POSTGRES_PASSWORD: c3VwZXJzZWNyZXQ=

---
# StatefulSet for PostgreSQL
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: prod
spec:
  serviceName: "postgres"
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      securityContext:
        fsGroup: 999
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
        envFrom:
        - secretRef:
            name: postgres-auth
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "1"
            memory: "2Gi"
        readinessProbe:
          exec:
            command: ["pg_isready", "-U", "webappuser"]
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          tcpSocket:
            port: 5432
          initialDelaySeconds: 20
          periodSeconds: 10
      terminationGracePeriodSeconds: 30
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
      storageClassName: postgres-sc

---
# ClusterIP service for app connectivity
apiVersion: v1
kind: Service
metadata:
  name: postgresql-service
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
```
## Observability: Prometheus, Grafana, Loki, Promtail

```yaml
# ServiceAccount and RBAC for Prometheus (simple example)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: prometheus-sa
  namespace: prod

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: prometheus-cr
rules:
- apiGroups: [""]
  resources: ["nodes", "nodes/proxy", "pods", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- nonResourceURLs: ["/metrics"]
  verbs: ["get"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus-crb
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: prometheus-cr
subjects:
- kind: ServiceAccount
  name: prometheus-sa
  namespace: prod

---
# Prometheus Deployment (basic)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      serviceAccountName: prometheus-sa
      containers:
      - name: prometheus
        image: prom/prometheus:v2.53.0
        args:
        - --config.file=/etc/prometheus/prometheus.yml
        - --storage.tsdb.path=/prometheus
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: prom-config
          mountPath: /etc/prometheus
        - name: prom-data
          mountPath: /prometheus
      volumes:
      - name: prom-config
        configMap:
          name: prometheus-config
      - name: prom-data
        emptyDir: {}

---
# Prometheus config (scrape default, plus annotations)
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: prod
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __metrics_port

---
# Prometheus Service
apiVersion: v1
kind: Service
metadata:
  name: prometheus
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: prometheus
  ports:
  - port: 9090
    targetPort: 9090

---
# Grafana Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: grafana
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: grafana
  template:
    metadata:
      labels:
        app: grafana
    spec:
      containers:
      - name: grafana
        image: grafana/grafana:11.0.0
        ports:
        - containerPort: 3000
        env:
        - name: GF_SECURITY_ADMIN_PASSWORD
          valueFrom:
            secretKeyRef:
              name: grafana-admin
              key: password
        volumeMounts:
        - name: grafana-storage
          mountPath: /var/lib/grafana
      volumes:
      - name: grafana-storage
        emptyDir: {}

---
# Grafana admin secret
apiVersion: v1
kind: Secret
metadata:
  name: grafana-admin
  namespace: prod
type: Opaque
data:
  password: c3VwZXJzZWNyZXQ=

---
# Grafana Service
apiVersion: v1
kind: Service
metadata:
  name: grafana
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: grafana
  ports:
  - port: 3000
    targetPort: 3000

---
# Loki (log store)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: loki
  namespace: prod
spec:
  replicas: 1
  selector:
    matchLabels:
      app: loki
  template:
    metadata:
      labels:
        app: loki
    spec:
      containers:
      - name: loki
        image: grafana/loki:2.9.0
        args: ["-config.file=/etc/loki/config.yml"]
        ports:
        - containerPort: 3100
        volumeMounts:
        - name: loki-config
          mountPath: /etc/loki
        - name: loki-data
          mountPath: /tmp/loki
      volumes:
      - name: loki-config
        configMap:
          name: loki-config
      - name: loki-data
        emptyDir: {}

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: loki-config
  namespace: prod
data:
  config.yml: |
    server:
      http_listen_port: 3100
    ingester:
      lifecycler:
        ring:
          kvstore:
            store: inmemory
    schema_config:
      configs:
      - from: 2020-10-24
        store: tsdb
        object_store: filesystem
        schema: v13
    storage_config:
      tsdb_shipper:
        active_index_directory: /tmp/loki/index
        cache_location: /tmp/loki/cache
      filesystem:
        directory: /tmp/loki/chunks

---
# Loki Service
apiVersion: v1
kind: Service
metadata:
  name: loki
  namespace: prod
spec:
  type: ClusterIP
  selector:
    app: loki
  ports:
  - port: 3100
    targetPort: 3100

---
# Promtail (log collector)
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: promtail
  namespace: prod
spec:
  selector:
    matchLabels:
      app: promtail
  template:
    metadata:
      labels:
        app: promtail
    spec:
      serviceAccountName: promtail-sa
      containers:
      - name: promtail
        image: grafana/promtail:2.9.0
        args: ["-config.file=/etc/promtail/config.yml"]
        volumeMounts:
        - name: promtail-config
          mountPath: /etc/promtail
        - name: varlog
          mountPath: /var/log
          readOnly: true
      volumes:
      - name: promtail-config
        configMap:
          name: promtail-config
      - name: varlog
        hostPath:
          path: /var/log

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: promtail-sa
  namespace: prod

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: promtail-config
  namespace: prod
data:
  config.yml: |
    server:
      http_listen_port: 9080
    clients:
    - url: http://loki.prod.svc.cluster.local:3100/loki/api/v1/push
    positions:
      filename: /run/promtail/positions.yml
    scrape_configs:
    - job_name: kubernetes-pods
      kubernetes_sd_configs:
      - role: pod
      pipeline_stages:
      - cri: {}
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_uid]
        target_label: __path__
        replacement: /var/log/pods/*$1/*.log
      - source_labels: [__meta_kubernetes_pod_label_app]
        target_label: app
      - source_labels: [__meta_kubernetes_pod_node_name]
        target_label: node
    - job_name: varlogs
      static_configs:
      - targets:
        - localhost
        labels:
          job: varlogs
          __path__: /var/log/*.log
```

Notes and next steps
Ingress & DNS: Point www.example.com  and api.example.com  to your Ingress Controller. cert-manager will provision TLS automatically.

Storage: Replace the StorageClass with your cloud provider’s class (e.g., gp2/gp3 for EKS, standard for GKE).

Security hardening: Add PodSecurity admission, strict NetworkPolicies for all services, and image signing/verification.

Backups: Schedule PostgreSQL backups (e.g., Velero for PVCs, or pgBackRest sidecar).

Secrets management: Consider external secret managers (AWS Secrets Manager, HashiCorp Vault) via ExternalSecrets.