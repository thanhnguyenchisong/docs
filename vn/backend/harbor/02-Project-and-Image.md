# Project và Image - Câu hỏi phỏng vấn Harbor

## Mục lục
1. [Project](#project)
2. [Repository và Tag](#repository-và-tag)
3. [Push và Pull](#push-và-pull)
4. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Project

- **Project** trong Harbor là nhóm **repository** (image); dùng cho **quyền (RBAC)** và **replication rule**.
- Mỗi project có: name, visibility (public/private), quota (optional), member (user/group + role).
- **Repository** thuộc một project; tên repo thường = `<project>/<image-name>`.

### Ví dụ

- Project: `backend`, visibility: private  
  → Repositories: `backend/api`, `backend/worker`  
  → User A: developer (push/pull), User B: guest (chỉ pull).

---

## Repository và Tag

- **Repository**: Một image name trong project (ví dụ `backend/api`). Trong repository có nhiều **tag** (ví dụ `v1.0`, `latest`, `abc123`).
- **Tag** trỏ tới một **manifest**; manifest tham chiếu các **layers** (filesystem). Push cùng tag mới → ghi đè (same tag, different digest).

### Cấu trúc URL

- **Registry URL**: `harbor.company.com`
- **Image đầy đủ**: `harbor.company.com/backend/api:v1.0` (project/repo:tag)
- **Pull**: `docker pull harbor.company.com/backend/api:v1.0`

---

## Push và Pull

### Login

```bash
docker login harbor.company.com
# Username: user
# Password: <password hoặc token>
```

- Credential lưu tại `~/.docker/config.json`. CI dùng **docker login** với secret (username + token/password).

### Push

```bash
docker tag myapp:latest harbor.company.com/backend/api:v1.0
docker push harbor.company.com/backend/api:v1.0
```

- Image phải **tag** đủ tên registry + project + repo + tag. Push upload layers và manifest; Harbor lưu vào project tương ứng (project phải tồn tại và user có quyền push).

### Pull

```bash
docker pull harbor.company.com/backend/api:v1.0
```

- Nếu project public không cần login (pull); project private cần login. Kubernetes pull image: imagePullSecret chứa credential Harbor.

---

## Câu hỏi thường gặp

### Project public vs private?

- **Public**: Mọi người (kể cả chưa login) có thể **pull**; không push được nếu chưa login. **Private**: Chỉ member (với quyền) mới pull/push. Production thường private; có thể có project public cho base image nội bộ.

### Xóa tag có xóa layer không?

- Xóa **tag** chỉ xóa manifest reference. **Layer** (blob) chỉ bị xóa khi không còn tag/image nào tham chiếu (garbage collection). Harbor có **retention policy** và **GC** job.

---

**Tiếp theo:** [03-Replication.md](./03-Replication.md)
