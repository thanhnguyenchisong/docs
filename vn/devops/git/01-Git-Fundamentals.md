# Git Fundamentals - Câu hỏi phỏng vấn

## Mục lục
1. [Git là gì?](#git-là-gì)
2. [Git vs Other VCS](#git-vs-other-vcs)
3. [Repository Structure](#repository-structure)
4. [Three Areas of Git](#three-areas-of-git)
5. [Basic Commands](#basic-commands)
6. [Commits và History](#commits-và-history)
7. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Git là gì?

### Git (Global Information Tracker)

**Định nghĩa:**
- Git là **Distributed Version Control System** (DVCS)
- Track changes trong source code
- Created by Linus Torvalds (2005)
- Free và open-source

### Version Control System (VCS)

**VCS là gì?**
- System quản lý changes trong files
- Track history của changes
- Allow collaboration
- Enable rollback to previous versions

### Types of VCS

#### 1. Local VCS
- Track changes locally
- Example: RCS (Revision Control System)
- Limited collaboration

#### 2. Centralized VCS (CVCS)
- Single central server
- Examples: SVN, CVS
- Single point of failure

#### 3. Distributed VCS (DVCS)
- Every developer has full copy
- Examples: Git, Mercurial
- No single point of failure

---

## Git vs Other VCS

### Git vs SVN

| Feature | Git | SVN |
|---------|-----|-----|
| **Type** | Distributed | Centralized |
| **Speed** | Very fast | Slower |
| **Branching** | Cheap, fast | Expensive, slow |
| **Offline** | Full functionality | Limited |
| **Storage** | Content-addressable | File-based |
| **Merge** | Excellent | Basic |

### Git vs Mercurial

| Feature | Git | Mercurial |
|---------|-----|-----------|
| **Learning curve** | Steeper | Easier |
| **Performance** | Faster | Good |
| **Windows support** | Good | Excellent |
| **Community** | Larger | Smaller |
| **Commands** | More complex | Simpler |

### Why Git?

1. **Distributed**: Every clone is full backup
2. **Fast**: Operations are local
3. **Branching**: Cheap và easy
4. **Flexible**: Many workflows
5. **Popular**: Industry standard
6. **Free**: Open-source

---

## Repository Structure

### Repository (Repo)

**Định nghĩa:**
- Repository là storage location cho project
- Contains all files và history
- Can be local hoặc remote

### .git Directory

```
.git/
├── HEAD              # Points to current branch
├── config            # Repository configuration
├── objects/          # All Git objects (commits, trees, blobs)
├── refs/            # References (branches, tags)
│   ├── heads/       # Branch references
│   └── tags/        # Tag references
├── index             # Staging area
└── hooks/           # Git hooks
```

### Working Directory

**Định nghĩa:**
- Directory chứa project files
- Where you work on files
- Files can be tracked hoặc untracked

```
project/
├── .git/            # Git repository (hidden)
├── src/
│   └── main.java
├── README.md
└── .gitignore
```

---

## Three Areas of Git

### 1. Working Directory (Working Tree)

**Định nghĩa:**
- Nơi bạn làm việc với files
- Files có thể modified, untracked
- Changes chưa staged

**States:**
- **Modified**: File changed but not staged
- **Untracked**: File not in Git yet
- **Clean**: No changes

### 2. Staging Area (Index)

**Định nghĩa:**
- Intermediate area giữa Working Directory và Repository
- Files prepared for commit
- Snapshot of what will be committed

**Purpose:**
- Review changes before commit
- Select specific changes
- Build up commit incrementally

### 3. Repository (Git Directory)

**Định nghĩa:**
- Permanent storage
- Contains committed snapshots
- History of all changes

**Contains:**
- Commits
- Branches
- Tags
- Configuration

### Flow Diagram

```
Working Directory → Staging Area → Repository
     (modified)        (staged)      (committed)
```

**Commands:**
```bash
# Working Directory → Staging Area
git add file.txt

# Staging Area → Repository
git commit -m "message"
```

---

## Basic Commands

### git init

**Định nghĩa:**
- Initialize new Git repository
- Creates `.git` directory

```bash
# Initialize repository
git init

# Initialize in existing directory
cd project/
git init
```

### git status

**Định nghĩa:**
- Show status of working directory
- Shows modified, staged, untracked files

```bash
# Check status
git status

# Short format
git status -s

# Output example:
# M  file.txt        # Modified, staged
# M  file2.txt       # Modified, not staged
# ?? newfile.txt     # Untracked
```

### git add

**Định nghĩa:**
- Add files to staging area
- Prepare files for commit

```bash
# Add specific file
git add file.txt

# Add all files in directory
git add src/

# Add all changes
git add .

# Add all files (including deleted)
git add -A

# Interactive add (select changes)
git add -p
```

### git commit

**Định nghĩa:**
- Save snapshot to repository
- Creates commit object
- Records author, date, message

```bash
# Commit with message
git commit -m "Add new feature"

# Commit with detailed message
git commit -m "Add new feature" -m "Detailed description"

# Commit all staged changes
git commit -a -m "message"  # Skips git add

# Amend last commit
git commit --amend
```

### git log

**Định nghĩa:**
- Show commit history
- Display commits in reverse chronological order

```bash
# Basic log
git log

# One line per commit
git log --oneline

# Graph view
git log --graph --oneline --all

# Show changes
git log -p

# Limit number
git log -5

# Search in messages
git log --grep="fix"
```

### git diff

**Định nghĩa:**
- Show differences
- Compare working directory, staging, repository

```bash
# Working directory vs Staging
git diff

# Staging vs Repository
git diff --staged
git diff --cached

# Between commits
git diff commit1 commit2

# Between branches
git diff branch1 branch2
```

### git rm

**Định nghĩa:**
- Remove files from Git
- Can remove from working directory và staging

```bash
# Remove file (staged for deletion)
git rm file.txt

# Remove from Git but keep in working directory
git rm --cached file.txt

# Remove directory
git rm -r directory/
```

### git mv

**Định nghĩa:**
- Move hoặc rename files
- Git tracks rename

```bash
# Rename file
git mv oldname.txt newname.txt

# Move file
git mv file.txt src/file.txt
```

---

## Commits và History

### Commit

**Định nghĩa:**
- Snapshot of project tại một thời điểm
- Contains: author, date, message, parent commit(s)
- Identified by SHA-1 hash

**Commit Structure:**
```
commit abc123def456...
Author: John Doe <john@example.com>
Date:   Mon Jan 1 12:00:00 2024 +0000

    Add new feature

    Detailed description of changes
```

### Commit Hash (SHA-1)

**Định nghĩa:**
- Unique identifier cho commit
- 40-character hexadecimal string
- Based on commit content

```bash
# Full hash
abc123def4567890123456789012345678901234

# Short hash (first 7 characters)
abc123d
```

### HEAD

**Định nghĩa:**
- Pointer to current commit
- Points to tip of current branch
- Moves with each commit

```bash
# Show HEAD
git log HEAD

# Show what HEAD points to
cat .git/HEAD

# Detached HEAD
git checkout abc123d  # HEAD points directly to commit
```

### Parent Commits

**Định nghĩa:**
- Commits have parent(s)
- First commit has no parent
- Merge commits have multiple parents

```
A → B → C → D
         ↓
         E (merge commit, has 2 parents: C and D)
```

### Viewing History

```bash
# Show commit history
git log

# Show specific file history
git log -- file.txt

# Show who changed what
git blame file.txt

# Show commit details
git show abc123d
```

---

## Câu hỏi thường gặp

### Q1: Git là gì và tại sao dùng Git?

**Git là:**
- Distributed Version Control System
- Track changes trong source code
- Enable collaboration

**Tại sao dùng:**
- Distributed: Every clone is backup
- Fast: Local operations
- Branching: Cheap và easy
- Popular: Industry standard
- Free: Open-source

### Q2: Three areas của Git là gì?

**1. Working Directory:**
- Nơi bạn làm việc với files
- Files có thể modified, untracked

**2. Staging Area (Index):**
- Intermediate area
- Files prepared for commit
- Snapshot of what will be committed

**3. Repository:**
- Permanent storage
- Contains committed snapshots
- History of all changes

### Q3: Sự khác biệt giữa git add và git commit?

**git add:**
- Moves files từ Working Directory → Staging Area
- Prepares files for commit
- Can add multiple times before commit

**git commit:**
- Moves files từ Staging Area → Repository
- Creates permanent snapshot
- Records author, date, message

### Q4: Commit hash là gì?

**Commit hash:**
- Unique identifier cho commit
- SHA-1 hash (40 characters)
- Based on commit content
- First 7 characters usually sufficient

**Ví dụ:**
```bash
abc123def4567890123456789012345678901234
```

### Q5: HEAD là gì?

**HEAD:**
- Pointer to current commit
- Points to tip of current branch
- Moves with each commit
- Can be detached (points directly to commit)

### Q6: git status hiển thị gì?

**git status shows:**
- Modified files (not staged)
- Staged files (ready to commit)
- Untracked files
- Branch information
- Ahead/behind remote

**Output:**
```bash
On branch main
Changes not staged for commit:
  modified:   file.txt

Changes to be committed:
  new file:   newfile.txt

Untracked files:
  untracked.txt
```

### Q7: git diff vs git status?

**git status:**
- Shows which files changed
- High-level overview
- Doesn't show actual changes

**git diff:**
- Shows actual changes
- Line-by-line differences
- Can show changes in specific files

### Q8: Làm sao xem history của một file?

```bash
# Show commits that changed file
git log -- file.txt

# Show changes in file
git log -p -- file.txt

# Show who changed each line
git blame file.txt

# Show file at specific commit
git show abc123d:file.txt
```

---

## Best Practices

1. **Commit Often**: Small, logical commits
2. **Write Good Messages**: Clear, descriptive commit messages
3. **Review Before Commit**: Use `git status` và `git diff`
4. **Don't Commit Large Files**: Use Git LFS hoặc external storage
5. **Use .gitignore**: Ignore unnecessary files
6. **Keep Commits Atomic**: One logical change per commit
7. **Review History**: Use `git log` để understand changes

---

## Bài tập thực hành

### Bài 1: Initialize Repository

```bash
# Yêu cầu:
# 1. Create new directory
# 2. Initialize Git repository
# 3. Create some files
# 4. Add files to staging
# 5. Make first commit
# 6. Check status và log
```

### Bài 2: Basic Workflow

```bash
# Yêu cầu:
# 1. Modify existing file
# 2. Check status
# 3. View differences
# 4. Stage changes
# 5. Commit changes
# 6. View commit history
```

### Bài 3: File Operations

```bash
# Yêu cầu:
# 1. Create new file
# 2. Add to Git
# 3. Rename file using git mv
# 4. Delete file using git rm
# 5. Commit all changes
```

---

## Tổng kết

- **Git**: Distributed Version Control System
- **Three Areas**: Working Directory, Staging Area, Repository
- **Basic Commands**: init, status, add, commit, log, diff
- **Commits**: Snapshots với unique hash (SHA-1)
- **HEAD**: Pointer to current commit
- **History**: Track all changes với git log
