# Example — Repo Git mẫu để thực hành

Repo Git nhỏ, có sẵn vài file và branch mẫu. Chạy được các lệnh Git để **test và học** theo tài liệu Git.

## Khởi tạo (nếu chưa có .git)

```bash
git init
echo "# Git Example" > README.md
git add README.md
git commit -m "Initial commit"
git branch feature
git checkout -b develop
echo "develop" >> README.md
git add README.md && git commit -m "Add develop"
git checkout main
```

## Thực hành

- `git branch -a` — xem nhánh
- `git checkout feature` — đổi sang nhánh feature
- `git merge develop` — merge develop vào nhánh hiện tại
- Tạo conflict: sửa cùng dòng trên hai nhánh rồi merge

Đọc kèm [../README.md](../README.md) và các file 01-*.md trong devops/git.
