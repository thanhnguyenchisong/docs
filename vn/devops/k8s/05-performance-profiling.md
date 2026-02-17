## Phần 5: Performance testing và profiling trên K8s

Mục tiêu: load-test app trong cluster và pinpoint code bottlenecks với Async Profiler.

### 1) In-cluster JMeter (headless)
- Giữ traffic bên trong cluster cho latency thực tế.
```bash
kubectl -n perf run jmeter --image=justb4/jmeter:5.6.3 --restart=Never --command -- sleep 3600
kubectl -n perf cp docs/03-jmeter-load-test.md jmeter:/tmp/README.md   # optional reference
kubectl -n perf cp work-load.jmx jmeter:/tmp/work-load.jmx
kubectl -n perf exec -it jmeter -- jmeter -n -t /tmp/work-load.jmx \
  -JserverHost=perf-app.perf.svc.cluster.local \
  -JserverPort=80 \
  -Jn=20000 \
  -l /tmp/result.jtl -e -o /tmp/report
kubectl -n perf cp jmeter:/tmp/report ./report
```

### 2) Target một pod duy nhất (isolate một instance)
- Expose một pod tạm thời:
```bash
POD=$(kubectl -n perf get pod -l app=perf-app -o jsonpath='{.items[0].metadata.name}')
kubectl -n perf expose pod "$POD" --port=8080 --target-port=8080 --name perf-app-direct --type=ClusterIP
kubectl -n perf port-forward svc/perf-app-direct 18080:8080
curl "http://localhost:18080/work?n=20000"
```
- Chạy JMeter đối với `localhost:18080` để stress chỉ pod đó, sau đó profile nó.
- Clean up: `kubectl -n perf delete svc/perf-app-direct`

### 3) Async Profiler recipes (chọn một)
Xem `docs/07-async-profiler-k8s-recipes.md` cho full commands. Tóm tắt:
- Copy bundle vào pod:
```bash
kubectl -n perf cp /path/to/async-profiler "$POD":/tmp/async-profiler
kubectl -n perf exec "$POD" -- /tmp/async-profiler/profiler.sh -d 30 -e cpu -f /tmp/flame.svg <PID>
kubectl -n perf cp "$POD":/tmp/flame.svg ./flame.svg
```
- Ephemeral container (không thay đổi image): `kubectl -n perf debug pod/"$POD" -c ap --image=your-profiler-image --target=perf-app`
- Baked-in image: chạy profiler từ `/opt/async-profiler/...`
- Sidecar với `shareProcessNamespace: true` cho profiling lặp lại.
- Host-level attach nếu `kubectl exec` bị hạn chế.

Event choices: `-e cpu` (mặc định), `-e wall` (blocking/locks/I/O), `-e alloc` (alloc hotspots). Giữ runs 15–60s.

### 4) Liên kết với metrics
- Ghi chú spike times trong Grafana (HTTP latency, CPU, GC).
- Chạy profiler overlapping cửa sổ spike và trong khi JMeter load active.
- Verify improvement sau code/config changes bằng cách lặp lại load + profile.

### 5) Quick perf triage checklist
- CPU cao + flame graph hot method → optimize code path.
- GC cao, heap gần cap → tăng heap hoặc fix alloc churn.
- Throttling (metrics-server hiển thị CPU limit hit) → adjust limits hoặc requests.
- Một pod nóng hơn → kiểm tra node placement/affinity và targeted profile pod đó.

Tiếp theo: Phần 6 bao gồm day-2 ops, incidents, và hardening.