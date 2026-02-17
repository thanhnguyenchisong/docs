# Branching và Merging - Câu hỏi phỏng vấn

## Mục lục
1. [Branches là gì?](#branches-là-gì)
2. [Branch Operations](#branch-operations)
3. [Merge](#merge)
4. [Rebase](#rebase)
5. [Merge vs Rebase](#merge-vs-rebase)
6. [Merge Conflicts](#merge-conflicts)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Branches là gì?

### Branch (Nhánh)

**Định nghĩa:**
- Branch là movable pointer to a commit
- Allows parallel development
- Isolated line of development
- Default branch: `main` hoặc `master`

### Why Use Branches?

1. **Isolation**: Work on features without affecting main
2. **Parallel Development**: Multiple features simultaneously
3. **Experimentation**: Try ideas without risk
4. **Collaboration**: Different developers on different branches

### Branch Visualization

```
main:    A → B → C → D
                ↓
feature:       E → F → G
```

**main** và **feature** are different branches pointing to different commits.

---

## Branch Operations

### Create Branch

```bash
# Create new branch
git branch feature-branch

# Create and switch to branch
git checkout -b feature-branch

# Modern syntax (Git 2.23+)
git switch -c feature-branch
```

### List Branches

```bash
# List local branches
git branch

# List all branches (local + remote)
git branch -a

# List remote branches
git branch -r

# Show current branch
git branch --show-current
```

### Switch Branch

```bash
# Switch to branch
git checkout feature-branch

# Modern syntax
git switch feature-branch

# Create and switch
git checkout -b new-branch
git switch -c new-branch
```

### Delete Branch

```bash
# Delete local branch
git branch -d feature-branch

# Force delete (even if not merged)
git branch -D feature-branch

# Delete remote branch
git push origin --delete feature-branch
```

### Rename Branch

```bash
# Rename current branch
git branch -m new-name

# Rename other branch
git branch -m old-name new-name

# Update remote
git push origin -u new-name
git push origin --delete old-name
```

---

## Merge

### Merge là gì?

**Định nghĩa:**
- Combine changes from different branches
- Creates merge commit (if not fast-forward)
- Preserves history of both branches

### Merge Types

#### 1. Fast-Forward Merge

**Điều kiện:**
- No new commits on target branch since branch was created
- Linear history

**Ví dụ:**
```bash
# Before merge
main:    A → B → C
                ↓
feature:       D → E

# After fast-forward merge
main:    A → B → C → D → E
```

**Command:**
```bash
git checkout main
git merge feature-branch
# Fast-forward, no merge commit
```

#### 2. Three-Way Merge

**Điều kiện:**
- Both branches have new commits
- Creates merge commit

**Ví dụ:**
```bash
# Before merge
main:    A → B → C → F
                ↓
feature:       D → E

# After merge
main:    A → B → C → F → M (merge commit)
                ↓       ↗
feature:       D → E ───┘
```

**Command:**
```bash
git checkout main
git merge feature-branch
# Creates merge commit M
```

#### 3. Squash Merge

**Đặc điểm:**
- Combines all commits into one
- Cleaner history
- Loses individual commit history

```bash
git checkout main
git merge --squash feature-branch
git commit -m "Add feature"
```

### Merge Strategies

```bash
# Default merge (recursive)
git merge feature-branch

# Fast-forward only (fails if not possible)
git merge --ff-only feature-branch

# Always create merge commit
git merge --no-ff feature-branch

# Squash all commits
git merge --squash feature-branch
```

---

## Rebase

### Rebase là gì?

**Định nghĩa:**
- Move commits to new base
- Rewrites commit history
- Creates linear history
- **⚠️ Don't rebase public/shared branches**

### Basic Rebase

```bash
# Before rebase
main:    A → B → C → F
                ↓
feature:       D → E

# After rebase
main:    A → B → C → F
                        ↓
feature:               D' → E'
```

**Command:**
```bash
git checkout feature-branch
git rebase main
# Replays D and E on top of F
```

### Interactive Rebase

**Định nghĩa:**
- Rebase với control over commits
- Edit, reorder, squash, drop commits

```bash
# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Interactive rebase from commit
git rebase -i abc123d
```

**Interactive Options:**
- `pick`: Use commit as-is
- `reword`: Change commit message
- `edit`: Stop to amend commit
- `squash`: Combine with previous commit
- `fixup`: Like squash but discard message
- `drop`: Remove commit

**Example:**
```bash
pick abc123d Add feature
squash def456e Fix typo
reword ghi789f Update docs
```

### Rebase vs Merge

| Feature | Rebase | Merge |
|---------|--------|-------|
| **History** | Linear | Preserves branches |
| **Commits** | Rewrites | Creates merge commit |
| **Safety** | Rewrites history | Preserves history |
| **Use Case** | Private branches | Public branches |

---

## Merge vs Rebase

### When to Use Merge

**Use merge when:**
- Working on shared/public branches
- Want to preserve branch history
- Collaborating with others
- History accuracy important

**Example:**
```bash
# Merge preserves history
git checkout main
git merge feature-branch
# Creates merge commit, preserves both branches
```

### When to Use Rebase

**Use rebase when:**
- Working on private/local branches
- Want linear history
- Before merging to main
- Cleaning up commit history

**Example:**
```bash
# Rebase for clean history
git checkout feature-branch
git rebase main
# Linear history, then merge
```

### Best Practice

**Workflow:**
1. Use rebase for local/private branches
2. Use merge for integrating to main
3. Never rebase public/shared branches
4. Rebase before creating pull request

---

## Merge Conflicts

### Conflict là gì?

**Định nghĩa:**
- Same file changed in both branches
- Git cannot automatically merge
- Requires manual resolution

### Conflict Markers

```bash
<<<<<<< HEAD
Changes from current branch
=======
Changes from branch being merged
>>>>>>> feature-branch
```

**Structure:**
- `<<<<<<< HEAD`: Start of current branch changes
- `=======`: Separator
- `>>>>>>> feature-branch`: End of incoming changes

### Resolving Conflicts

#### Step 1: Identify Conflicts

```bash
# Merge và see conflicts
git merge feature-branch
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt
```

#### Step 2: Edit File

```bash
# Open conflicted file
# Remove conflict markers
# Keep desired changes (or combine)

# Before:
<<<<<<< HEAD
line 1
line 2
=======
line 1
line 3
>>>>>>> feature-branch

# After (example):
line 1
line 2
line 3
```

#### Step 3: Stage Resolved File

```bash
# Mark conflict as resolved
git add file.txt
```

#### Step 4: Complete Merge

```bash
# Complete merge
git commit
# Or use merge commit message
git commit -m "Merge feature-branch"
```

### Abort Merge

```bash
# Abort merge if needed
git merge --abort

# Abort rebase
git rebase --abort
```

### Conflict Resolution Tools

```bash
# Use merge tool
git mergetool

# Configure merge tool
git config --global merge.tool vimdiff
git config --global merge.tool meld
```

### Preventing Conflicts

1. **Communicate**: Coordinate with team
2. **Pull Often**: Keep branches updated
3. **Small Commits**: Easier to resolve
4. **Review Changes**: Before merging
5. **Use Tools**: Merge tools help

---

## Câu hỏi thường gặp

### Q1: Branch là gì?

**Branch:**
- Movable pointer to a commit
- Allows parallel development
- Isolated line of development
- Default: `main` hoặc `master`

### Q2: Merge vs Rebase?

**Merge:**
- Combines branches
- Preserves history
- Creates merge commit (if not fast-forward)
- Safe for public branches

**Rebase:**
- Moves commits to new base
- Rewrites history
- Linear history
- ⚠️ Don't use on public branches

### Q3: Fast-forward merge là gì?

**Fast-forward merge:**
- No new commits on target branch
- Simply moves pointer forward
- No merge commit created
- Linear history maintained

**Example:**
```bash
# Before: main at C, feature at E
main:    A → B → C
                ↓
feature:       D → E

# After: main moves to E
main:    A → B → C → D → E
```

### Q4: Khi nào có merge conflict?

**Merge conflict khi:**
- Same file changed in both branches
- Same lines changed differently
- Git cannot automatically merge
- Requires manual resolution

### Q5: Làm sao resolve merge conflict?

**Steps:**
1. Identify conflicted files (`git status`)
2. Open files, find conflict markers
3. Edit to resolve (keep desired changes)
4. Remove conflict markers
5. Stage resolved files (`git add`)
6. Complete merge (`git commit`)

### Q6: Có nên rebase public branches không?

**❌ KHÔNG!**

**Lý do:**
- Rewrites history
- Causes problems for others
- Breaks other people's work
- Only rebase private/local branches

### Q7: Squash merge là gì?

**Squash merge:**
- Combines all commits into one
- Cleaner history
- Loses individual commit history
- Useful for feature branches

```bash
git merge --squash feature-branch
git commit -m "Add feature"
```

### Q8: Interactive rebase dùng để làm gì?

**Interactive rebase:**
- Edit commit history
- Reorder commits
- Squash multiple commits
- Drop unwanted commits
- Change commit messages

```bash
git rebase -i HEAD~3
# Opens editor với options: pick, squash, drop, etc.
```

---

## Best Practices

1. **Use Branches**: Isolate features
2. **Merge Public Branches**: Never rebase
3. **Rebase Private Branches**: Before merging
4. **Resolve Conflicts Promptly**: Don't leave conflicts
5. **Test After Merge**: Ensure everything works
6. **Delete Merged Branches**: Keep repository clean
7. **Use Descriptive Names**: Clear branch names

---

## Bài tập thực hành

### Bài 1: Branch Operations

```bash
# Yêu cầu:
# 1. Create new branch
# 2. Make some commits
# 3. Switch back to main
# 4. Create another branch
# 5. List all branches
# 6. Delete branch
```

### Bài 2: Merge

```bash
# Yêu cầu:
# 1. Create feature branch
# 2. Make commits on feature branch
# 3. Make commits on main
# 4. Merge feature into main
# 5. Observe merge commit
# 6. Try fast-forward merge
```

### Bài 3: Merge Conflicts

```bash
# Yêu cầu:
# 1. Create two branches
# 2. Modify same file in both
# 3. Merge branches
# 4. Resolve conflicts
# 5. Complete merge
```

### Bài 4: Rebase

```bash
# Yêu cầu:
# 1. Create feature branch
# 2. Make commits
# 3. Rebase onto main
# 4. Observe linear history
# 5. Try interactive rebase
```

---

## Tổng kết

- **Branches**: Movable pointers to commits
- **Merge**: Combines branches, preserves history
- **Rebase**: Moves commits, rewrites history
- **Fast-forward**: Simple pointer move
- **Three-way merge**: Creates merge commit
- **Conflicts**: Manual resolution required
- **Best Practice**: Merge public, rebase private
