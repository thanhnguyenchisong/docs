# Remote Repositories - Câu hỏi phỏng vấn

## Mục lục
1. [Remote Repository là gì?](#remote-repository-là-gì)
2. [Remote Operations](#remote-operations)
3. [Clone, Fetch, Pull, Push](#clone-fetch-pull-push)
4. [Upstream và Downstream](#upstream-và-downstream)
5. [Remote Branches](#remote-branches)
6. [Fork và Pull Request](#fork-và-pull-request)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Remote Repository là gì?

### Remote Repository

**Định nghĩa:**
- Repository stored on remote server
- Shared với team
- Examples: GitHub, GitLab, Bitbucket
- Can have multiple remotes

### Why Remote Repositories?

1. **Backup**: Central backup of code
2. **Collaboration**: Share code với team
3. **CI/CD**: Automated builds và deployments
4. **Code Review**: Pull requests, reviews
5. **Issues**: Bug tracking, project management

### Common Remote Hosts

- **GitHub**: Most popular, public và private repos
- **GitLab**: Self-hosted option, CI/CD built-in
- **Bitbucket**: Atlassian integration
- **Azure DevOps**: Microsoft ecosystem
- **Self-hosted**: Your own Git server

---

## Remote Operations

### View Remotes

```bash
# List all remotes
git remote

# List with URLs
git remote -v

# Show remote details
git remote show origin
```

**Output:**
```bash
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
```

### Add Remote

```bash
# Add remote repository
git remote add origin https://github.com/user/repo.git

# Add multiple remotes
git remote add upstream https://github.com/original/repo.git
git remote add fork https://github.com/you/repo.git
```

### Remove Remote

```bash
# Remove remote
git remote remove origin

# Or
git remote rm origin
```

### Rename Remote

```bash
# Rename remote
git remote rename old-name new-name
```

### Update Remote URL

```bash
# Change remote URL
git remote set-url origin https://github.com/user/new-repo.git

# Verify
git remote -v
```

---

## Clone, Fetch, Pull, Push

### git clone

**Định nghĩa:**
- Copy remote repository to local
- Creates new directory
- Sets up remote tracking

```bash
# Clone repository
git clone https://github.com/user/repo.git

# Clone to specific directory
git clone https://github.com/user/repo.git my-project

# Clone specific branch
git clone -b feature-branch https://github.com/user/repo.git

# Shallow clone (limited history)
git clone --depth 1 https://github.com/user/repo.git
```

### git fetch

**Định nghĩa:**
- Download changes from remote
- **Does NOT merge** into local branches
- Updates remote-tracking branches
- Safe operation (doesn't modify working directory)

```bash
# Fetch from origin
git fetch origin

# Fetch all remotes
git fetch --all

# Fetch specific branch
git fetch origin main

# Fetch và prune (remove deleted remote branches)
git fetch --prune
```

**What fetch does:**
- Downloads commits, branches, tags
- Updates remote-tracking branches (origin/main)
- Does NOT modify local branches
- Does NOT modify working directory

### git pull

**Định nghĩa:**
- Fetch + Merge
- Downloads changes và merges into current branch
- Can cause merge conflicts

```bash
# Pull from origin
git pull origin main

# Pull current branch
git pull

# Pull với rebase
git pull --rebase

# Pull và prune
git pull --prune
```

**git pull = git fetch + git merge**

```bash
# Equivalent to:
git fetch origin
git merge origin/main
```

### git push

**Định nghĩa:**
- Upload local commits to remote
- Updates remote branches
- Requires write access

```bash
# Push to origin
git push origin main

# Push current branch
git push

# Push all branches
git push --all

# Push tags
git push --tags

# Force push (⚠️ dangerous)
git push --force
git push -f
```

**⚠️ Warning:**
- `--force` overwrites remote history
- Can cause problems for others
- Only use on private branches
- Consider `--force-with-lease` (safer)

### Force Push với Lease

```bash
# Safer force push
git push --force-with-lease

# Checks if remote changed before force push
# Fails if someone else pushed
```

---

## Upstream và Downstream

### Upstream

**Định nghĩa:**
- Original repository
- Source of truth
- Usually named `upstream`

**Use Case:**
- Forking repositories
- Contributing to open-source
- Syncing with original project

### Downstream

**Định nghĩa:**
- Your fork hoặc copy
- Derived from upstream
- Usually named `origin`

### Setup Upstream

```bash
# Clone your fork
git clone https://github.com/you/repo.git
cd repo

# Add upstream remote
git remote add upstream https://github.com/original/repo.git

# Verify
git remote -v
# origin    https://github.com/you/repo.git (fetch)
# origin    https://github.com/you/repo.git (push)
# upstream  https://github.com/original/repo.git (fetch)
# upstream  https://github.com/original/repo.git (push)
```

### Sync với Upstream

```bash
# Fetch from upstream
git fetch upstream

# Merge upstream/main into local main
git checkout main
git merge upstream/main

# Or rebase
git rebase upstream/main

# Push to your fork
git push origin main
```

---

## Remote Branches

### Remote-Tracking Branches

**Định nghĩa:**
- Local references to remote branches
- Format: `remote/branch`
- Example: `origin/main`, `origin/feature`

**Auto-created:**
- When you clone
- When you fetch
- When you push

### View Remote Branches

```bash
# List remote branches
git branch -r

# List all branches (local + remote)
git branch -a

# Show remote-tracking info
git branch -vv
```

### Checkout Remote Branch

```bash
# Create local branch from remote
git checkout -b feature-branch origin/feature-branch

# Modern syntax
git switch -c feature-branch origin/feature-branch

# Auto-track remote branch
git checkout --track origin/feature-branch
git switch --track origin/feature-branch
```

### Push New Branch

```bash
# Push new branch và set upstream
git push -u origin feature-branch

# Or
git push --set-upstream origin feature-branch

# After first push, can use:
git push
```

### Delete Remote Branch

```bash
# Delete remote branch
git push origin --delete feature-branch

# Or
git push origin :feature-branch
```

### Prune Remote Branches

```bash
# Remove local references to deleted remote branches
git fetch --prune

# Or
git remote prune origin
```

---

## Fork và Pull Request

### Fork

**Định nghĩa:**
- Copy of repository to your account
- Independent from original
- Can modify freely
- Used for contributing

**Workflow:**
1. Fork repository on GitHub/GitLab
2. Clone your fork
3. Make changes
4. Push to your fork
5. Create Pull Request

### Pull Request (PR) / Merge Request (MR)

**Định nghĩa:**
- Request to merge changes
- Code review process
- Discussion, comments
- Automated checks (CI/CD)

### Fork Workflow

```bash
# 1. Fork on GitHub (via web interface)

# 2. Clone your fork
git clone https://github.com/you/repo.git
cd repo

# 3. Add upstream
git remote add upstream https://github.com/original/repo.git

# 4. Create feature branch
git checkout -b feature-branch

# 5. Make changes và commit
git add .
git commit -m "Add feature"

# 6. Push to your fork
git push -u origin feature-branch

# 7. Create Pull Request on GitHub (via web interface)

# 8. Sync with upstream (if needed)
git fetch upstream
git merge upstream/main
git push
```

### Pull Request Best Practices

1. **Small PRs**: Easier to review
2. **Clear Description**: Explain what và why
3. **Reference Issues**: Link related issues
4. **Test Changes**: Ensure everything works
5. **Follow Style**: Match project conventions
6. **Respond to Feedback**: Address review comments

---

## Câu hỏi thường gặp

### Q1: Remote repository là gì?

**Remote repository:**
- Repository stored on remote server
- Shared với team
- Examples: GitHub, GitLab, Bitbucket
- Can have multiple remotes

### Q2: git fetch vs git pull?

**git fetch:**
- Downloads changes from remote
- Does NOT merge
- Updates remote-tracking branches
- Safe (doesn't modify working directory)

**git pull:**
- Fetch + Merge
- Downloads và merges into current branch
- Can cause merge conflicts
- Modifies working directory

### Q3: Khi nào dùng force push?

**Force push:**
- Overwrites remote history
- ⚠️ Dangerous, can break others' work
- Only use on:
  - Private branches
  - Your own repositories
  - After rebase (if necessary)

**Safer alternative:**
```bash
git push --force-with-lease
```

### Q4: Upstream vs Origin?

**Origin:**
- Default remote name
- Usually your fork hoặc main repository
- Where you push/pull normally

**Upstream:**
- Original repository
- Source of truth
- Used for syncing with original project

### Q5: Remote-tracking branch là gì?

**Remote-tracking branch:**
- Local reference to remote branch
- Format: `remote/branch` (e.g., `origin/main`)
- Auto-updated when you fetch
- Not directly editable

**Example:**
```bash
origin/main  # Remote-tracking branch
main         # Local branch
```

### Q6: Làm sao sync fork với upstream?

```bash
# 1. Add upstream (if not added)
git remote add upstream https://github.com/original/repo.git

# 2. Fetch from upstream
git fetch upstream

# 3. Merge upstream/main
git checkout main
git merge upstream/main

# 4. Push to your fork
git push origin main
```

### Q7: Pull Request workflow?

**Steps:**
1. Fork repository
2. Clone your fork
3. Create feature branch
4. Make changes
5. Push to your fork
6. Create Pull Request on GitHub/GitLab
7. Address review comments
8. Merge after approval

### Q8: Làm sao xem remote branches?

```bash
# List remote branches
git branch -r

# List all branches
git branch -a

# Show tracking info
git branch -vv

# Show remote details
git remote show origin
```

---

## Best Practices

1. **Regular Fetch**: Keep remote-tracking branches updated
2. **Pull Before Push**: Avoid conflicts
3. **Use Upstream**: For contributing to projects
4. **Avoid Force Push**: On shared branches
5. **Delete Merged Branches**: Keep repository clean
6. **Clear PR Descriptions**: Help reviewers
7. **Test Before Push**: Ensure code works

---

## Bài tập thực hành

### Bài 1: Remote Setup

```bash
# Yêu cầu:
# 1. Create repository on GitHub
# 2. Add remote to local repository
# 3. Push local commits
# 4. Verify on GitHub
# 5. Clone repository to another directory
```

### Bài 2: Fetch và Pull

```bash
# Yêu cầu:
# 1. Make changes on GitHub (via web)
# 2. Fetch changes locally
# 3. Observe remote-tracking branch
# 4. Merge into local branch
# 5. Try git pull instead
```

### Bài 3: Fork Workflow

```bash
# Yêu cầu:
# 1. Fork a repository
# 2. Clone your fork
# 3. Add upstream remote
# 4. Create feature branch
# 5. Make changes và push
# 6. Sync with upstream
```

### Bài 4: Remote Branches

```bash
# Yêu cầu:
# 1. Create branch locally
# 2. Push to remote
# 3. Checkout remote branch
# 4. Delete remote branch
# 5. Prune deleted branches
```

---

## Tổng kết

- **Remote Repository**: Repository on remote server
- **Clone**: Copy remote repository locally
- **Fetch**: Download changes (doesn't merge)
- **Pull**: Fetch + Merge
- **Push**: Upload local commits
- **Upstream**: Original repository
- **Remote Branches**: References to remote branches
- **Pull Request**: Request to merge changes
