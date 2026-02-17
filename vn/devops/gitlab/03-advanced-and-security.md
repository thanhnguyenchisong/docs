## Phần 3: Nâng cao, environments, bảo mật

### Environments và deployments
- Sử dụng `environment` để theo dõi deploys và links:
```yaml
deploy_staging:
  stage: deploy
  script: ./scripts/deploy.sh staging
  environment:
    name: staging
    url: https://staging.example.com
```
- `only: [main]` hoặc `rules:` để bảo vệ deploys.
- Sử dụng `when: manual` cho approvals thủ công; `allow_failure: false` để chặn pipeline cho đến khi chạy.

### Protected branches/tags và variables
- Bảo vệ branches/tags `main`/`prod`; hạn chế ai có thể push/merge.
- Bảo vệ variables có phạm vi environment (ví dụ: `PROD_DB_PASSWORD`) để chỉ protected branches/tags có thể truy cập chúng.

### Patterns approval
- Sử dụng manual jobs trong deploy stage.
- Cho merge requests, bật approval rules trong project settings; yêu cầu pipeline xanh trước khi merge.

### Includes và reusability
- Tập trung hóa templates (ví dụ: `.gitlab/ci/*.yml`) và include chúng trong projects:
```yaml
include:
  - project: mygroup/ci-templates
    ref: main
    file: /maven.yml
```

### Caching và performance
- Tách riêng caches cho mỗi branch hoặc mỗi bộ dependency chính để tránh ô nhiễm.
- Sử dụng `cache:policy: pull-push` để tái sử dụng caches trước khi có sẵn.
- Ưu tiên artifacts để truyền outputs build; sử dụng caches cho dirs dependency.

### Security scans (nếu có license)
- SAST/DAST/Dependency scans qua GitLab templates:
```yaml
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml
```
- Đảm bảo language-specific analyzers phù hợp với stack của bạn; tune `variables:` cho paths/modules.

### Container registry và image build
- Sử dụng built-in registry: `$CI_REGISTRY_IMAGE`.
```yaml
build_image:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  variables:
    DOCKER_DRIVER: overlay2
  script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" "$CI_REGISTRY"
    - docker build -t "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA" .
    - docker push "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"
  artifacts:
    reports:
      dotenv: build.env   # ví dụ: ghi IMAGE_TAG cho stages sau
```

### K8s deploy (example sketch)
```yaml
deploy_prod:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl config set-cluster prod --server="$KUBE_SERVER" --certificate-authority=$KUBE_CA_PEM
    - kubectl config set-credentials ci --token="$KUBE_TOKEN"
    - kubectl config set-context prod --cluster=prod --user=ci --namespace=perf
    - kubectl config use-context prod
    - kubectl set image deploy/perf-app perf-app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
  environment:
    name: production
    url: https://perf.example.com
  when: manual
  only:
    refs: [main]
```

### Observability cho pipelines
- Sử dụng timings `script` cấp job và artifacts để trace các bước chậm.
- Bật pipeline metrics (nếu có sẵn) để giám sát thời gian queue vs thời gian thực thi.

Bạn giờ đã có patterns GitLab CI nâng cao: guarded deploys, protected secrets, reusable includes, caches, security scans, và examples deploy container/K8s.