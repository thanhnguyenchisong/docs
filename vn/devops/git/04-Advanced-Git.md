# Advanced Git - Câu hỏi phỏng vấn

## Mục lục
1. [Stash](#stash)
2. [Cherry-pick](#cherry-pick)
3. [Reflog](#reflog)
4. [Git Hooks](#git-hooks)
5. [Interactive Rebase](#interactive-rebase)
6. [Amend Commits](#amend-commits)
7. [Submodules](#submodules)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Stash

### Stash là gì?

**Định nghĩa:**
- Temporarily save uncommitted changes
- Clean working directory
- Switch branches without committing
- Reapply changes later

### Basic Stash

```bash
# Save changes to stash
git stash

# Or with message
git stash save "WIP: working on feature"

# List stashes
git stash list

# Apply most recent stash
git stash apply

# Apply và remove from stash
git stash pop

# Apply specific stash
git stash apply stash@{1}
```

### Stash Options

```bash
# Stash including untracked files
git stash -u
git stash --include-untracked

# Stash including ignored files
git stash -a
git stash --all

# Keep staged changes
git stash --keep-index

# Show stash contents
git stash show

# Show stash diff
git stash show -p
```

### Stash Management

```bash
# List all stashes
git stash list
# stash@{0}: WIP on main: abc123d Add feature
# stash@{1}: WIP on feature: def456e Fix bug

# Drop stash (delete without applying)
git stash drop stash@{0}

# Clear all stashes
git stash clear

# Create branch from stash
git stash branch new-branch stash@{0}
```

### Use Cases

**When to use stash:**
1. Switch branches với uncommitted changes
2. Pull changes với uncommitted work
3. Test something quickly
4. Save work in progress

**Example:**
```bash
# Working on feature, need to switch branches
git stash
git checkout main
# Do something on main
git checkout feature-branch
git stash pop  # Restore changes
```

---

## Cherry-pick

### Cherry-pick là gì?

**Định nghĩa:**
- Apply specific commit(s) to current branch
- Copy commit from another branch
- Creates new commit với same changes
- Useful for hotfixes, backports

### Basic Cherry-pick

```bash
# Cherry-pick single commit
git cherry-pick abc123d

# Cherry-pick multiple commits
git cherry-pick abc123d def456e

# Cherry-pick range
git cherry-pick abc123d..def456e
git cherry-pick abc123d^..def456e  # Include abc123d

# Cherry-pick và don't commit (just stage)
git cherry-pick -n abc123d
git cherry-pick --no-commit abc123d
```

### Cherry-pick Options

```bash
# Edit commit message
git cherry-pick -e abc123d
git cherry-pick --edit abc123d

# Don't commit (just stage changes)
git cherry-pick -n abc123d

# Continue after conflict resolution
git cherry-pick --continue

# Abort cherry-pick
git cherry-pick --abort
```

### Resolving Conflicts

```bash
# Cherry-pick may cause conflicts
git cherry-pick abc123d
# Auto-merging file.txt
# CONFLICT (content): Merge conflict in file.txt

# Resolve conflicts
# Edit file, remove markers
git add file.txt
git cherry-pick --continue
```

### Use Cases

**When to use cherry-pick:**
1. Apply hotfix to multiple branches
2. Backport features
3. Copy specific commits
4. Selective commit application

**Example:**
```bash
# Hotfix on main, apply to release branch
git checkout release-1.0
git cherry-pick hotfix-commit
```

---

## Reflog

### Reflog là gì?

**Định nghĩa:**
- Reference log
- History of HEAD movements
- Recovery tool
- Shows where HEAD pointed

### View Reflog

```bash
# Show reflog
git reflog

# Show reflog for specific branch
git reflog show main

# Show reflog with dates
git reflog --date=iso

# Limit number of entries
git reflog -10
```

**Output:**
```bash
abc123d HEAD@{0}: commit: Add feature
def456e HEAD@{1}: checkout: moving from main to feature
ghi789f HEAD@{2}: commit: Fix bug
```

### Recovery với Reflog

**Lost commits:**
```bash
# View reflog to find lost commit
git reflog

# Recover lost commit
git checkout abc123d
git checkout -b recovered-branch

# Or reset to lost commit
git reset --hard abc123d
```

**Recover deleted branch:**
```bash
# Find branch in reflog
git reflog | grep deleted-branch

# Recover branch
git checkout -b recovered-branch abc123d
```

### Reflog Expiration

```bash
# Reflog expires after 90 days (default)
# Can be configured:
git config gc.reflogExpire "90 days"
git config gc.reflogExpireUnreachable "30 days"

# Expire reflog entries
git reflog expire --expire=now --all
```

---

## Git Hooks

### Hooks là gì?

**Định nghĩa:**
- Scripts that run automatically
- Triggered by Git events
- Located in `.git/hooks/`
- Can be any executable script

### Hook Types

#### Client-Side Hooks

**pre-commit:**
- Runs before commit
- Can prevent commit
- Use for linting, tests

**prepare-commit-msg:**
- Runs before commit message editor
- Can modify commit message

**commit-msg:**
- Runs after commit message entered
- Can validate message format

**post-commit:**
- Runs after commit
- Use for notifications

**pre-push:**
- Runs before push
- Can prevent push
- Use for tests

#### Server-Side Hooks

**pre-receive:**
- Runs on server before accepting pushes
- Can reject pushes

**update:**
- Runs for each branch being pushed
- Can reject specific branches

**post-receive:**
- Runs after push accepted
- Use for deployments, notifications

### Example: Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed"
    exit 1
fi

# Run tests
npm test
if [ $? -ne 0 ]; then
    echo "Tests failed"
    exit 1
fi
```

**Make executable:**
```bash
chmod +x .git/hooks/pre-commit
```

### Example: Commit-msg Hook

```bash
#!/bin/sh
# .git/hooks/commit-msg

# Check commit message format
commit_msg=$(cat "$1")
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore):"; then
    echo "Commit message must start with: feat, fix, docs, style, refactor, test, or chore"
    exit 1
fi
```

### Sharing Hooks

**Problem:** `.git/hooks/` not tracked by Git

**Solution:** Store hooks in repository, symlink

```bash
# Store hooks in repo
mkdir -p .githooks
# Add hooks to .githooks/

# Install script
git config core.hooksPath .githooks
```

---

## Interactive Rebase

### Interactive Rebase

**Định nghĩa:**
- Rebase với control over commits
- Edit, reorder, squash, drop commits
- Rewrite history
- ⚠️ Only on private branches

### Basic Interactive Rebase

```bash
# Interactive rebase last 3 commits
git rebase -i HEAD~3

# Interactive rebase from commit
git rebase -i abc123d

# Opens editor với:
pick abc123d Add feature
pick def456e Fix typo
pick ghi789f Update docs
```

### Interactive Options

**pick:**
- Use commit as-is
- Default option

**reword:**
- Change commit message
- Stops to edit message

**edit:**
- Stop to amend commit
- Can modify commit

**squash (s):**
- Combine with previous commit
- Prompts for new message

**fixup (f):**
- Like squash but discard message
- Uses previous commit message

**drop (d):**
- Remove commit
- Delete commit from history

**exec (x):**
- Run command
- Useful for tests

### Example: Squash Commits

```bash
# Before:
pick abc123d Add feature
pick def456e Fix typo
pick ghi789f Update docs

# After (squash last two):
pick abc123d Add feature
squash def456e Fix typo
squash ghi789f Update docs

# Result: One commit với all changes
```

### Example: Reorder Commits

```bash
# Before:
pick abc123d Add feature
pick def456e Fix typo
pick ghi789f Update docs

# After (reorder):
pick def456e Fix typo
pick abc123d Add feature
pick ghi789f Update docs
```

### Edit Commit

```bash
# Mark commit as 'edit'
pick abc123d Add feature
edit def456e Fix typo
pick ghi789f Update docs

# Rebase stops at 'edit'
# Make changes
git add file.txt
git commit --amend
git rebase --continue
```

---

## Amend Commits

### Amend là gì?

**Định nghĩa:**
- Modify last commit
- Change message hoặc add files
- Rewrites commit history
- ⚠️ Don't amend public commits

### Amend Message

```bash
# Change last commit message
git commit --amend -m "New message"

# Edit commit message
git commit --amend
```

### Amend Files

```bash
# Add files to last commit
git add forgotten-file.txt
git commit --amend --no-edit

# Or edit message
git commit --amend
```

### Amend Author

```bash
# Change author
git commit --amend --author="John Doe <john@example.com>"

# Change date
git commit --amend --date="2024-01-01 12:00:00"
```

### ⚠️ Warning

**Don't amend:**
- Commits already pushed
- Public/shared commits
- Commits others depend on

**Safe to amend:**
- Local commits
- Before pushing
- Private branches

---

## Submodules

### Submodule là gì?

**Định nghĩa:**
- Git repository inside another repository
- Reference to specific commit
- Useful for dependencies
- Separate version control

### Add Submodule

```bash
# Add submodule
git submodule add https://github.com/user/lib.git lib

# Clones lib into lib/ directory
# Creates .gitmodules file
```

### Clone với Submodules

```bash
# Clone repository
git clone https://github.com/user/repo.git

# Initialize submodules
git submodule init

# Update submodules
git submodule update

# Or both at once
git submodule update --init --recursive

# Clone với submodules
git clone --recursive https://github.com/user/repo.git
```

### Update Submodules

```bash
# Update to latest commit
cd lib
git pull origin main
cd ..
git add lib
git commit -m "Update submodule"

# Or update all
git submodule update --remote
```

### Remove Submodule

```bash
# Remove submodule
git submodule deinit lib
git rm lib
rm -rf .git/modules/lib
```

---

## Câu hỏi thường gặp

### Q1: Stash dùng để làm gì?

**Stash:**
- Temporarily save uncommitted changes
- Clean working directory
- Switch branches without committing
- Reapply changes later

**Use cases:**
- Switch branches với uncommitted work
- Pull changes với uncommitted changes
- Save work in progress

### Q2: Cherry-pick là gì?

**Cherry-pick:**
- Apply specific commit(s) to current branch
- Copy commit from another branch
- Creates new commit với same changes

**Use cases:**
- Apply hotfix to multiple branches
- Backport features
- Copy specific commits

### Q3: Reflog dùng để làm gì?

**Reflog:**
- Reference log
- History of HEAD movements
- Recovery tool
- Shows where HEAD pointed

**Use cases:**
- Recover lost commits
- Recover deleted branches
- Find previous states

### Q4: Git hooks là gì?

**Git hooks:**
- Scripts that run automatically
- Triggered by Git events
- Located in `.git/hooks/`

**Common hooks:**
- `pre-commit`: Before commit (linting, tests)
- `commit-msg`: Validate commit message
- `pre-push`: Before push (tests)

### Q5: Interactive rebase dùng để làm gì?

**Interactive rebase:**
- Edit commit history
- Reorder commits
- Squash multiple commits
- Drop unwanted commits
- Change commit messages

**⚠️ Only on private branches**

### Q6: Amend commit là gì?

**Amend:**
- Modify last commit
- Change message hoặc add files
- Rewrites commit history

**⚠️ Don't amend public commits**

### Q7: Submodule là gì?

**Submodule:**
- Git repository inside another repository
- Reference to specific commit
- Separate version control

**Use cases:**
- Include external libraries
- Dependencies
- Shared code across projects

### Q8: Làm sao recover lost commit?

**Using reflog:**
```bash
# 1. View reflog
git reflog

# 2. Find lost commit
# abc123d HEAD@{5}: commit: Lost commit

# 3. Recover
git checkout abc123d
git checkout -b recovered-branch

# Or reset
git reset --hard abc123d
```

---

## Best Practices

1. **Use Stash**: For temporary saves
2. **Cherry-pick Carefully**: Understand what you're copying
3. **Reflog for Recovery**: Know how to recover
4. **Hooks for Quality**: Enforce standards
5. **Interactive Rebase**: Clean up history before merging
6. **Amend Local Only**: Never amend public commits
7. **Submodules Sparingly**: Can be complex

---

## Bài tập thực hành

### Bài 1: Stash

```bash
# Yêu cầu:
# 1. Make uncommitted changes
# 2. Stash changes
# 3. Switch branches
# 4. Apply stash
# 5. Manage multiple stashes
```

### Bài 2: Cherry-pick

```bash
# Yêu cầu:
# 1. Create commits on feature branch
# 2. Cherry-pick to main
# 3. Resolve conflicts
# 4. Cherry-pick multiple commits
```

### Bài 3: Reflog Recovery

```bash
# Yêu cầu:
# 1. Make commits
# 2. Reset to previous commit
# 3. Use reflog to find lost commit
# 4. Recover lost commit
```

### Bài 4: Interactive Rebase

```bash
# Yêu cầu:
# 1. Make multiple commits
# 2. Interactive rebase
# 3. Squash commits
# 4. Reorder commits
# 5. Edit commit messages
```

---

## Tổng kết

- **Stash**: Temporarily save changes
- **Cherry-pick**: Apply specific commits
- **Reflog**: Recovery tool, HEAD history
- **Git Hooks**: Automated scripts
- **Interactive Rebase**: Edit commit history
- **Amend**: Modify last commit
- **Submodules**: Repository inside repository
