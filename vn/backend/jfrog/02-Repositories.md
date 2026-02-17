# Repositories - Câu hỏi phỏng vấn JFrog

## Mục lục
1. [Local repository](#local-repository)
2. [Remote repository](#remote-repository)
3. [Virtual repository](#virtual-repository)
4. [Repository layout và URL](#repository-layout-và-url)
5. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Local repository

- **Local repository**: Lưu artifacts do **bạn push** lên (từ CI hoặc dev). Artifacts nằm trên storage của Artifactory.
- Dùng để: release build (JAR, Docker image), snapshot, package private.
- **Không** proxy bất kỳ nguồn ngoài; chỉ đọc/ghi nội bộ.

### Ví dụ

- `libs-release-local`: JAR/WAR release.
- `libs-snapshot-local`: Maven snapshot.
- `docker-local`: Docker images nội bộ.
- `npm-local`: npm package private.

---

## Remote repository

- **Remote repository**: **Proxy** tới repository bên ngoài (Maven Central, npm registry, Docker Hub). Artifactory cache artifact khi lần đầu request; lần sau trả từ cache (có thể theo TTL).
- **Ưu điểm**: Giảm phụ thuộc mạng ra ngoài; tải nhanh; có thể block/cache theo policy; audit.

### Ví dụ

- `remote-repos/maven-central` → https://repo1.maven.org/maven2/
- `remote-repos/npmjs` → https://registry.npmjs.org/
- `remote-repos/docker-hub` → Docker Hub

---

## Virtual repository

- **Virtual repository**: **Một URL** tổng hợp nhiều local + remote (và có thể nhiều virtual). Client chỉ cần trỏ tới **một** virtual repo; Artifactory resolve theo thứ tự ưu tiên (local trước, rồi remote).
- **Use case**: Dev/build tool chỉ cấu hình **một** URL; vừa dùng artifact nội bộ (local) vừa dependency từ Maven Central/npm (remote) qua cùng một repo “ảo”.

### Thứ tự resolution

- Resolution order: local → remote (theo thứ tự cấu hình). Artifact tìm thấy ở repo nào (theo thứ tự) thì dùng, không tìm tiếp.

---

## Repository layout và URL

- Mỗi repo type (Maven, npm, Docker) có **layout** (cách tổ chức path). Ví dụ Maven: `groupId/artifactId/version/artifactId-version.pom`.
- **URL** truy cập: `https://artifactory.company.com/artifactory/<repo-key>/...`
- **Repo key**: Tên duy nhất (libs-release-local, libs-release-virtual, …).

---

## Câu hỏi thường gặp

### Khi nào dùng virtual thay vì trỏ thẳng local/remote?

- **Virtual** khi muốn **một URL** cho toàn bộ dependency (local + remote): Maven settings.xml, npm .npmrc chỉ cần một URL. **Trỏ thẳng** local khi chỉ push/pull artifact nội bộ (ví dụ CI push lên local, deploy pull từ local).

### Artifact bị xóa khi nào?

- Tùy **retention policy** (giữ theo số bản, theo ngày) và **cleanup job**. Có thể set “keep forever” hoặc “keep last N versions”. Xray/Compliance cũng có thể ảnh hưởng (quarantine, block).

---

**Tiếp theo:** [03-Maven-NPM-Docker.md](./03-Maven-NPM-Docker.md)
