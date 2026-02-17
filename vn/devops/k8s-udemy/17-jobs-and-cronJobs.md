# Jobs và CronJobs trong Kubernetes

## 1. Tổng quan

Jobs và CronJobs trong Kubernetes dùng để chạy tasks:

- **Job**: Chạy một hoặc nhiều pods đến khi hoàn thành thành công
- **CronJob**: Tự động tạo Jobs theo schedule (cron format)

### 1.1. Khi nào sử dụng?

**Jobs:**
- One-time tasks (batch processing, data migration, backup)
- Tasks cần chạy đến completion
- Parallel processing
- Tasks có thể retry

**CronJobs:**
- Scheduled tasks (backups, reports, cleanup)
- Recurring jobs
- Maintenance tasks
- Data synchronization

### 1.2. So sánh với Deployments

| Feature | Deployment | Job | CronJob |
|---------|------------|-----|---------|
| **Purpose** | Long-running services | One-time tasks | Scheduled tasks |
| **Restart** | Always restart | Restart on failure | Create new Job |
| **Completion** | Never completes | Completes successfully | Creates Jobs |
| **Use case** | Web servers, APIs | Batch processing | Scheduled backups |

## 2. Jobs

### 2.1. Job Basics

Job tạo một hoặc nhiều pods và đảm bảo chúng chạy đến khi hoàn thành thành công.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: my-job
spec:
  completions: 1        # Số lần job phải complete thành công
  parallelism: 1       # Số pods chạy đồng thời
  backoffLimit: 3      # Số lần retry nếu fail
  activeDeadlineSeconds: 300  # Timeout sau 5 phút
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Job completed' && sleep 5"]
      restartPolicy: OnFailure  # OnFailure hoặc Never
```

### 2.2. Job Completion và Parallelism

**Single Job (completions=1, parallelism=1):**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: single-job
spec:
  completions: 1
  parallelism: 1
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Task 1'"]
      restartPolicy: OnFailure
```

**Parallel Jobs (completions=5, parallelism=2):**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-job
spec:
  completions: 5       # Job phải complete 5 lần
  parallelism: 2       # Chạy 2 pods đồng thời
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Task $JOB_COMPLETION_INDEX'"]
      restartPolicy: OnFailure
```

**Work Queue Pattern:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: work-queue-job
spec:
  parallelism: 3      # 3 workers
  completions: null   # Không giới hạn completions
  template:
    spec:
      containers:
      - name: worker
        image: worker-image:latest
        command: ["process-queue"]
      restartPolicy: OnFailure
```

### 2.3. Job Completion Modes

**NonIndexed (default):**

```yaml
spec:
  completionMode: NonIndexed  # Default
  completions: 5
  parallelism: 2
```

**Indexed:**

```yaml
spec:
  completionMode: Indexed
  completions: 5
  parallelism: 2
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Processing index $JOB_COMPLETION_INDEX'"]
```

Với Indexed mode, mỗi pod có index từ 0 đến completions-1, accessible qua `JOB_COMPLETION_INDEX` environment variable.

### 2.4. Job Retry và Backoff

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: retry-job
spec:
  backoffLimit: 5      # Retry tối đa 5 lần
  activeDeadlineSeconds: 600  # Timeout sau 10 phút
  template:
    spec:
      containers:
      - name: task
        image: my-app:latest
        command: ["sh", "-c", "exit 1"]  # Will fail
      restartPolicy: OnFailure
```

**Backoff Strategy:**
- Exponential backoff: 10s, 20s, 40s, 80s, 160s
- Maximum backoff: 6 minutes

### 2.5. Job TTL

TTL (Time To Live) tự động xóa Job sau khi complete:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: ttl-job
spec:
  ttlSecondsAfterFinished: 100  # Xóa sau 100 giây
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Done'"]
      restartPolicy: OnFailure
```

### 2.6. Job Use Cases

**1. Database Migration:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: my-app:migrate
        command: ["npm", "run", "migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
      restartPolicy: OnFailure
```

**2. Data Processing:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-processor
spec:
  completions: 10
  parallelism: 3
  template:
    spec:
      containers:
      - name: processor
        image: data-processor:latest
        command: ["process", "--batch-size", "1000"]
        volumeMounts:
        - name: data
          mountPath: /data
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: data-pvc
      restartPolicy: OnFailure
```

**3. Backup:**

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  template:
    spec:
      containers:
      - name: backup
        image: postgres:16
        command:
        - pg_dump
        - -U
        - postgres
        - -F
        - c
        - -f
        - /backup/backup.dump
        - mydb
        volumeMounts:
        - name: backup-storage
          mountPath: /backup
        env:
        - name: PGPASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
      volumes:
      - name: backup-storage
        persistentVolumeClaim:
          claimName: backup-pvc
      restartPolicy: OnFailure
```

## 3. CronJobs

CronJob tự động tạo Jobs theo schedule định kỳ.

### 3.1. CronJob Basics

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: my-cronjob
spec:
  schedule: "0 2 * * *"  # Chạy mỗi ngày lúc 2:00 AM
  successfulJobsHistoryLimit: 3  # Giữ 3 successful jobs
  failedJobsHistoryLimit: 1      # Giữ 1 failed job
  concurrencyPolicy: Allow       # Allow, Forbid, Replace
  startingDeadlineSeconds: 200   # Deadline để start job
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: task
            image: busybox:1.35
            command: ["sh", "-c", "echo 'CronJob executed'"]
          restartPolicy: OnFailure
```

### 3.2. Cron Schedule Format

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

**Ví dụ:**

- `0 2 * * *`: Mỗi ngày lúc 2:00 AM
- `*/15 * * * *`: Mỗi 15 phút
- `0 0 * * 0`: Mỗi Chủ nhật lúc midnight
- `0 9-17 * * 1-5`: Mỗi giờ từ 9 AM đến 5 PM, Monday-Friday
- `0 0 1 * *`: Ngày đầu tiên của mỗi tháng lúc midnight

### 3.3. Concurrency Policy

**Allow (default):** Cho phép nhiều jobs chạy đồng thời

```yaml
spec:
  concurrencyPolicy: Allow
```

**Forbid:** Không cho phép job mới nếu job cũ vẫn đang chạy

```yaml
spec:
  concurrencyPolicy: Forbid
```

**Replace:** Thay thế job cũ bằng job mới nếu job cũ vẫn đang chạy

```yaml
spec:
  concurrencyPolicy: Replace
```

### 3.4. Job History

```yaml
spec:
  successfulJobsHistoryLimit: 3  # Giữ 3 successful jobs
  failedJobsHistoryLimit: 1       # Giữ 1 failed job
```

Kubernetes tự động xóa old jobs dựa trên history limits.

### 3.5. Starting Deadline

```yaml
spec:
  startingDeadlineSeconds: 200  # Job phải start trong 200 giây
```

Nếu job không start trong deadline, sẽ bị skip.

### 3.6. Suspend CronJob

```yaml
spec:
  suspend: true  # Tạm dừng CronJob
```

```bash
# Suspend CronJob
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":true}}'

# Resume CronJob
kubectl patch cronjob my-cronjob -p '{"spec":{"suspend":false}}'
```

### 3.7. CronJob Use Cases

**1. Daily Backup:**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  successfulJobsHistoryLimit: 7
  failedJobsHistoryLimit: 3
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16
            command:
            - pg_dump
            - -U
            - postgres
            - -F
            - c
            - -f
            - /backup/backup-$(date +%Y%m%d).dump
            - mydb
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

**2. Cleanup Job:**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cleanup-old-files
spec:
  schedule: "0 0 * * 0"  # Weekly on Sunday
  successfulJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cleanup
            image: busybox:1.35
            command:
            - find
            - /data
            - -type
            - f
            - -mtime
            - +30
            - -delete
            volumeMounts:
            - name: data
              mountPath: /data
          volumes:
          - name: data
            persistentVolumeClaim:
              claimName: data-pvc
          restartPolicy: OnFailure
```

**3. Health Check:**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: health-check
spec:
  schedule: "*/5 * * * *"  # Mỗi 5 phút
  successfulJobsHistoryLimit: 1
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: health-check
            image: curlimages/curl:latest
            command:
            - curl
            - -f
            - http://my-app-service:8080/health
          restartPolicy: OnFailure
```

## 4. Job Patterns

### 4.1. Single Job Pattern

Chạy một task một lần:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: single-task
spec:
  completions: 1
  parallelism: 1
  template:
    spec:
      containers:
      - name: task
        image: task-image:latest
      restartPolicy: OnFailure
```

### 4.2. Parallel Job Pattern

Chạy nhiều tasks song song:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-tasks
spec:
  completions: 10
  parallelism: 3
  template:
    spec:
      containers:
      - name: task
        image: task-image:latest
      restartPolicy: OnFailure
```

### 4.3. Work Queue Pattern

Workers xử lý queue cho đến khi hết:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: work-queue
spec:
  parallelism: 5
  completions: null  # Không giới hạn
  template:
    spec:
      containers:
      - name: worker
        image: worker-image:latest
        command: ["process-queue"]
      restartPolicy: OnFailure
```

### 4.4. Indexed Job Pattern

Mỗi pod có index riêng:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: indexed-job
spec:
  completionMode: Indexed
  completions: 10
  parallelism: 3
  template:
    spec:
      containers:
      - name: task
        image: task-image:latest
        command: ["process", "--index", "$JOB_COMPLETION_INDEX"]
      restartPolicy: OnFailure
```

## 5. Best Practices

### 5.1. Job Best Practices

- **Set completions và parallelism**: Rõ ràng về số lượng tasks
- **Use backoffLimit**: Giới hạn số lần retry
- **Set activeDeadlineSeconds**: Tránh jobs chạy quá lâu
- **Use TTL**: Tự động cleanup completed jobs
- **RestartPolicy**: Dùng OnFailure, không dùng Always
- **Resource limits**: Set requests và limits
- **Logging**: Log output để debug

### 5.2. CronJob Best Practices

- **Schedule carefully**: Tránh overlap với high-traffic periods
- **ConcurrencyPolicy**: Chọn policy phù hợp (thường là Forbid)
- **History limits**: Set limits để tránh accumulate quá nhiều jobs
- **Starting deadline**: Set deadline để tránh missed schedules
- **Suspend khi cần**: Suspend CronJob khi maintenance
- **Monitor**: Monitor failed jobs
- **Test schedule**: Test cron expression trước khi deploy

### 5.3. Resource Management

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: resource-managed-job
spec:
  template:
    spec:
      containers:
      - name: task
        image: task-image:latest
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "1Gi"
      restartPolicy: OnFailure
```

### 5.4. Error Handling

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: error-handling-job
spec:
  backoffLimit: 3
  activeDeadlineSeconds: 600
  template:
    spec:
      containers:
      - name: task
        image: task-image:latest
        command:
        - sh
        - -c
        - |
          set -e  # Exit on error
          echo "Starting task"
          process-data || exit 1
          echo "Task completed"
      restartPolicy: OnFailure
```

## 6. Thực hành

### 6.1. Tạo và quản lý Job

```bash
# Tạo namespace
kubectl create namespace jobs-test

# Tạo Job đơn giản
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: simple-job
  namespace: jobs-test
spec:
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Job completed' && sleep 5"]
      restartPolicy: OnFailure
EOF

# Xem Job status
kubectl get jobs -n jobs-test
kubectl describe job simple-job -n jobs-test

# Xem pods
kubectl get pods -n jobs-test

# Xem logs
kubectl logs -l job-name=simple-job -n jobs-test

# Xóa Job (sẽ xóa cả pods)
kubectl delete job simple-job -n jobs-test
```

### 6.2. Parallel Job

```bash
# Tạo parallel job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: parallel-job
  namespace: jobs-test
spec:
  completions: 5
  parallelism: 2
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "echo 'Task \$JOB_COMPLETION_INDEX' && sleep 10"]
      restartPolicy: OnFailure
EOF

# Watch pods
kubectl get pods -n jobs-test -w

# Xem Job status
kubectl get job parallel-job -n jobs-test
```

### 6.3. Job với Retry

```bash
# Tạo job sẽ fail và retry
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: retry-job
  namespace: jobs-test
spec:
  backoffLimit: 3
  activeDeadlineSeconds: 300
  template:
    spec:
      containers:
      - name: task
        image: busybox:1.35
        command: ["sh", "-c", "exit 1"]  # Will fail
      restartPolicy: OnFailure
EOF

# Watch retries
kubectl get pods -n jobs-test -w

# Xem events
kubectl get events -n jobs-test --sort-by='.lastTimestamp'
```

### 6.4. CronJob

```bash
# Tạo CronJob
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-cronjob
  namespace: jobs-test
spec:
  schedule: "*/2 * * * *"  # Mỗi 2 phút
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello
            image: busybox:1.35
            command: ["sh", "-c", "echo 'Hello from CronJob at \$(date)'"]
          restartPolicy: OnFailure
EOF

# Xem CronJob
kubectl get cronjob -n jobs-test
kubectl describe cronjob hello-cronjob -n jobs-test

# Xem Jobs được tạo
kubectl get jobs -n jobs-test

# Xem pods
kubectl get pods -n jobs-test

# Suspend CronJob
kubectl patch cronjob hello-cronjob -n jobs-test -p '{"spec":{"suspend":true}}'

# Resume CronJob
kubectl patch cronjob hello-cronjob -n jobs-test -p '{"spec":{"suspend":false}}'
```

### 6.5. Database Migration Job

```bash
# Tạo migration job
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: jobs-test
spec:
  template:
    spec:
      containers:
      - name: migrate
        image: postgres:16
        command:
        - sh
        - -c
        - |
          echo "Running migrations..."
          psql \$DATABASE_URL -f /migrations/migrate.sql
          echo "Migrations completed"
        env:
        - name: DATABASE_URL
          value: "postgresql://user:pass@db:5432/mydb"
        volumeMounts:
        - name: migrations
          mountPath: /migrations
      volumes:
      - name: migrations
        configMap:
          name: migrations-config
      restartPolicy: OnFailure
EOF
```

### 6.6. Backup CronJob

```bash
# Tạo backup CronJob
cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-backup
  namespace: jobs-test
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  successfulJobsHistoryLimit: 7
  failedJobsHistoryLimit: 3
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: busybox:1.35
            command:
            - sh
            - -c
            - |
              echo "Starting backup at \$(date)"
              tar czf /backup/backup-\$(date +%Y%m%d).tar.gz /data
              echo "Backup completed"
            volumeMounts:
            - name: data
              mountPath: /data
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: data
            persistentVolumeClaim:
              claimName: data-pvc
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
EOF
```

## 7. Troubleshooting

### 7.1. Job không complete

```bash
# Xem Job status
kubectl get job my-job
kubectl describe job my-job

# Xem pods
kubectl get pods -l job-name=my-job

# Xem logs
kubectl logs -l job-name=my-job

# Xem events
kubectl get events --field-selector involvedObject.name=my-job
```

### 7.2. Job fail liên tục

```bash
# Xem backoffLimit
kubectl get job my-job -o jsonpath='{.spec.backoffLimit}'

# Xem failed pods
kubectl get pods -l job-name=my-job --field-selector=status.phase=Failed

# Xem logs của failed pods
kubectl logs -l job-name=my-job --previous

# Check restartPolicy
kubectl get job my-job -o jsonpath='{.spec.template.spec.restartPolicy}'
```

### 7.3. CronJob không tạo Jobs

```bash
# Xem CronJob status
kubectl get cronjob my-cronjob
kubectl describe cronjob my-cronjob

# Kiểm tra schedule
kubectl get cronjob my-cronjob -o jsonpath='{.spec.schedule}'

# Kiểm tra suspend
kubectl get cronjob my-cronjob -o jsonpath='{.spec.suspend}'

# Xem events
kubectl get events --field-selector involvedObject.name=my-cronjob

# Test cron expression
# Sử dụng online cron validator hoặc test trong container
```

### 7.4. CronJob tạo quá nhiều Jobs

```bash
# Kiểm tra concurrencyPolicy
kubectl get cronjob my-cronjob -o jsonpath='{.spec.concurrencyPolicy}'

# Kiểm tra history limits
kubectl get cronjob my-cronjob -o jsonpath='{.spec.successfulJobsHistoryLimit}'
kubectl get cronjob my-cronjob -o jsonpath='{.spec.failedJobsHistoryLimit}'

# Xem tất cả Jobs
kubectl get jobs -l app=my-app

# Xóa old Jobs
kubectl delete jobs --field-selector status.successful=1 --older-than=24h
```

## 8. Cleanup

```bash
# Xóa namespace (sẽ xóa tất cả resources)
kubectl delete namespace jobs-test

# Hoặc xóa từng resource
kubectl delete job simple-job -n jobs-test
kubectl delete cronjob hello-cronjob -n jobs-test

# Xóa tất cả completed Jobs
kubectl delete jobs --field-selector status.successful=1

# Xóa tất cả failed Jobs
kubectl delete jobs --field-selector status.failed=1
```

## 9. Tóm tắt

- **Jobs**: One-time tasks chạy đến completion
  - completions: Số lần job phải complete
  - parallelism: Số pods chạy đồng thời
  - backoffLimit: Số lần retry
  - activeDeadlineSeconds: Timeout
  - TTL: Tự động cleanup

- **CronJobs**: Scheduled Jobs tự động tạo Jobs
  - schedule: Cron expression
  - concurrencyPolicy: Allow, Forbid, Replace
  - successfulJobsHistoryLimit: Giữ successful jobs
  - failedJobsHistoryLimit: Giữ failed jobs
  - suspend: Tạm dừng CronJob

- **Job Patterns**:
  - Single Job: Một task một lần
  - Parallel Job: Nhiều tasks song song
  - Work Queue: Workers xử lý queue
  - Indexed Job: Mỗi pod có index

- **Use Cases**:
  - Database migrations
  - Data processing
  - Backups
  - Cleanup tasks
  - Health checks
  - Scheduled reports

- **Best Practices**:
  - Set completions và parallelism
  - Use backoffLimit và activeDeadlineSeconds
  - Set resource limits
  - Use TTL để cleanup
  - Monitor failed jobs
  - Test cron expressions
  - Set concurrencyPolicy phù hợp