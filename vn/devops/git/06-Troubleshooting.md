# Troubleshooting - Câu hỏi phỏng vấn

## Mục lục
1. [Common Issues](#common-issues)
2. [Undo Changes](#undo-changes)
3. [Recover Lost Commits](#recover-lost-commits)
4. [Clean Up Repository](#clean-up-repository)
5. [Debug Git Issues](#debug-git-issues)
6. [Performance Issues](#performance-issues)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Common Issues

### Issue 1: Accidentally Committed Wrong Files

**Problem:**
```bash
# Committed files that shouldn't be committed
git commit -m "Add feature"
# Includes sensitive data, large files, etc.
```

**Solution:**
```bash
# Remove file from last commit (keep in working directory)
git reset HEAD~1
# Or
git reset --soft HEAD~1  # Keep changes staged
git reset --mixed HEAD~1  # Keep changes unstaged (default)
git reset --hard HEAD~1   # Discard changes

# Remove file from commit (if not pushed)
git rm --cached sensitive-file.txt
git commit --amend
```

### Issue 2: Wrong Commit Message

**Problem:**
```bash
# Typo in commit message
git commit -m "Fix typo"  # Should be "Fix bug"
```

**Solution:**
```bash
# Amend commit message (if not pushed)
git commit --amend -m "Fix bug"

# Or edit message
git commit --amend
```

### Issue 3: Forgot to Add Files

**Problem:**
```bash
# Committed but forgot some files
git commit -m "Add feature"
# Missing important-file.txt
```

**Solution:**
```bash
# Add file và amend commit
git add important-file.txt
git commit --amend --no-edit

# Or edit message
git commit --amend
```

### Issue 4: Committed to Wrong Branch

**Problem:**
```bash
# Committed to main instead of feature branch
git checkout main
git commit -m "Add feature"  # Wrong branch!
```

**Solution:**
```bash
# Move commit to correct branch
git reset HEAD~1  # Undo commit on main
git checkout feature-branch
git cherry-pick main@{1}  # Or use reflog to find commit
```

### Issue 5: Merge Conflicts

**Problem:**
```bash
# Merge conflicts during merge
git merge feature-branch
# CONFLICT (content): Merge conflict in file.txt
```

**Solution:**
```bash
# 1. Identify conflicts
git status

# 2. Resolve conflicts
# Edit file, remove markers
# Keep desired changes

# 3. Stage resolved file
git add file.txt

# 4. Complete merge
git commit

# Or abort
git merge --abort
```

---

## Undo Changes

### Undo Working Directory Changes

```bash
# Discard changes in working directory
git checkout -- file.txt

# Discard all changes
git checkout -- .

# Modern syntax
git restore file.txt
git restore .
```

### Undo Staged Changes

```bash
# Unstage file (keep changes)
git reset HEAD file.txt

# Unstage all (keep changes)
git reset HEAD

# Modern syntax
git restore --staged file.txt
git restore --staged .
```

### Undo Commits

#### Reset (Local Only)

```bash
# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset --mixed HEAD~1
git reset HEAD~1  # Default

# Hard reset (discard changes)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard abc123d
```

**⚠️ Warning:**
- `--hard` discards all changes
- Only use on local commits
- Don't reset public commits

#### Revert (Safe for Public)

```bash
# Revert commit (creates new commit)
git revert abc123d

# Revert last commit
git revert HEAD

# Revert multiple commits
git revert abc123d..def456e
```

**Revert vs Reset:**
- **Revert**: Safe, creates new commit
- **Reset**: Rewrites history, unsafe for public

### Undo Merge

```bash
# Undo merge (before pushing)
git reset --hard HEAD~1

# Or if already pushed
git revert -m 1 HEAD  # Revert merge commit
```

---

## Recover Lost Commits

### Using Reflog

**Problem:**
```bash
# Lost commit after reset
git reset --hard HEAD~3
# Lost 3 commits!
```

**Solution:**
```bash
# 1. View reflog
git reflog

# Output:
# abc123d HEAD@{0}: reset: moving to HEAD~3
# def456e HEAD@{1}: commit: Lost commit 3
# ghi789f HEAD@{2}: commit: Lost commit 2
# jkl012g HEAD@{3}: commit: Lost commit 1

# 2. Recover commit
git checkout def456e
git checkout -b recovered-branch

# Or reset to commit
git reset --hard def456e
```

### Recover Deleted Branch

**Problem:**
```bash
# Deleted branch
git branch -D feature-branch
# Lost all commits!
```

**Solution:**
```bash
# 1. Find branch in reflog
git reflog | grep feature-branch

# 2. Recover branch
git checkout -b feature-branch abc123d

# Or from reflog
git checkout -b feature-branch HEAD@{5}
```

### Recover After Force Push

**Problem:**
```bash
# Force pushed, lost commits
git push --force
# Someone else's commits lost!
```

**Solution:**
```bash
# 1. Check reflog on remote (if accessible)
# 2. Check other developers' reflogs
# 3. Use reflog to find lost commits
git reflog

# 4. Recover và push
git checkout -b recovered abc123d
git push origin recovered
```

---

## Clean Up Repository

### Remove Untracked Files

```bash
# Show untracked files
git clean -n

# Remove untracked files
git clean -f

# Remove untracked files và directories
git clean -fd

# Interactive removal
git clean -i
```

### Remove Ignored Files

```bash
# Remove ignored files
git clean -fX

# Remove ignored files và directories
git clean -fdX
```

### Prune Remote Branches

```bash
# Remove local references to deleted remote branches
git fetch --prune

# Or
git remote prune origin
```

### Remove Local Branches

```bash
# Delete merged branches
git branch --merged | grep -v "\*\|main\|master" | xargs -n 1 git branch -d

# Delete all branches except current
git branch | grep -v "\*" | xargs git branch -D
```

### Garbage Collection

```bash
# Clean up repository
git gc

# Aggressive cleanup
git gc --aggressive

# Prune old objects
git prune
```

---

## Debug Git Issues

### View Git Configuration

```bash
# Show all config
git config --list

# Show specific config
git config user.name
git config user.email

# Show config file location
git config --list --show-origin
```

### Debug Merge Issues

```bash
# Show merge state
git status

# Show merge conflicts
git diff

# Show merge base
git merge-base branch1 branch2

# Show merge strategy
git merge --strategy-option=ours
git merge --strategy-option=theirs
```

### Debug Branch Issues

```bash
# Show branch tracking
git branch -vv

# Show remote branches
git branch -r

# Show all branches
git branch -a

# Show branch relationship
git show-branch
```

### Debug Commit Issues

```bash
# Show commit details
git show abc123d

# Show commit log
git log --oneline --graph --all

# Show file history
git log --follow -- file.txt

# Show who changed what
git blame file.txt
```

### Debug Remote Issues

```bash
# Show remote details
git remote show origin

# Test remote connection
git ls-remote origin

# Show remote URL
git remote get-url origin
```

---

## Performance Issues

### Large Repository

**Problem:**
- Repository too large
- Slow operations
- Too much history

**Solutions:**

#### Shallow Clone

```bash
# Clone with limited history
git clone --depth 1 https://github.com/user/repo.git

# Increase depth later
git fetch --unshallow
```

#### Partial Clone

```bash
# Clone without blobs
git clone --filter=blob:none https://github.com/user/repo.git

# Fetch blobs when needed
git checkout feature-branch
```

#### Remove Large Files

```bash
# Find large files
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -10

# Remove from history (use git-filter-repo)
git filter-repo --path large-file.txt --invert-paths
```

### Slow Operations

**Problem:**
- Slow git status
- Slow git add
- Slow git commit

**Solutions:**

#### Update Git

```bash
# Update to latest Git version
# Newer versions are faster
```

#### Use Git LFS

```bash
# For large files
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

#### Optimize Repository

```bash
# Repack repository
git repack -ad

# Garbage collection
git gc --aggressive
```

---

## Câu hỏi thường gặp

### Q1: Làm sao undo commit đã push?

**Options:**

**1. Revert (Safe):**
```bash
# Creates new commit that undoes changes
git revert abc123d
git push
```

**2. Reset + Force Push (⚠️ Dangerous):**
```bash
# Only if you're sure no one else pulled
git reset --hard HEAD~1
git push --force
```

**Best Practice:** Use revert for public commits.

### Q2: Làm sao recover lost commit?

**Using reflog:**
```bash
# 1. View reflog
git reflog

# 2. Find lost commit
# abc123d HEAD@{5}: commit: Lost commit

# 3. Recover
git checkout abc123d
git checkout -b recovered-branch
```

### Q3: Làm sao remove file from Git history?

**Using git-filter-repo:**
```bash
# Install git-filter-repo first
git filter-repo --path file.txt --invert-paths

# Or use BFG Repo-Cleaner
bfg --delete-files file.txt
```

**⚠️ Warning:** Rewrites history, requires force push.

### Q4: Làm sao fix merge conflict?

**Steps:**
1. Identify conflicts (`git status`)
2. Open conflicted files
3. Remove conflict markers
4. Keep desired changes
5. Stage resolved files (`git add`)
6. Complete merge (`git commit`)

### Q5: Làm sao clean up repository?

**Commands:**
```bash
# Remove untracked files
git clean -fd

# Prune remote branches
git fetch --prune

# Garbage collection
git gc --aggressive

# Remove old branches
git branch --merged | xargs git branch -d
```

### Q6: Repository quá lớn, làm sao optimize?

**Solutions:**
1. **Shallow clone**: `git clone --depth 1`
2. **Remove large files**: Use git-filter-repo
3. **Use Git LFS**: For large files
4. **Garbage collection**: `git gc --aggressive`
5. **Repack**: `git repack -ad`

### Q7: Làm sao debug Git issues?

**Debug commands:**
```bash
# View config
git config --list

# View status
git status

# View log
git log --oneline --graph --all

# View remote
git remote show origin

# View branch tracking
git branch -vv
```

### Q8: Reset vs Revert?

**Reset:**
- Rewrites history
- Moves HEAD
- ⚠️ Unsafe for public commits
- Use for local commits

**Revert:**
- Creates new commit
- Safe for public commits
- Doesn't rewrite history
- Use for public commits

---

## Best Practices

1. **Use Revert**: For public commits
2. **Use Reset**: Only for local commits
3. **Check Before Force Push**: Verify no one else pulled
4. **Regular Cleanup**: Remove old branches, files
5. **Monitor Repository Size**: Keep it manageable
6. **Use Reflog**: For recovery
7. **Test Before Push**: Avoid issues

---

## Bài tập thực hành

### Bài 1: Undo Changes

```bash
# Yêu cầu:
# 1. Make changes to file
# 2. Stage changes
# 3. Undo staged changes
# 4. Undo working directory changes
# 5. Practice reset và revert
```

### Bài 2: Recover Lost Commits

```bash
# Yêu cầu:
# 1. Make commits
# 2. Reset to previous commit
# 3. Use reflog to find lost commits
# 4. Recover lost commits
# 5. Recover deleted branch
```

### Bài 3: Clean Up

```bash
# Yêu cầu:
# 1. Create untracked files
# 2. Remove untracked files
# 3. Prune remote branches
# 4. Remove merged branches
# 5. Run garbage collection
```

---

## Tổng kết

- **Common Issues**: Wrong commits, merge conflicts
- **Undo Changes**: reset, revert, restore
- **Recover Lost Commits**: Using reflog
- **Clean Up**: Remove files, branches, optimize
- **Debug**: Config, status, log, remote
- **Performance**: Shallow clone, Git LFS, optimize
- **Best Practice**: Use revert for public, reset for local
