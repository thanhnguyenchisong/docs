# Collaboration Workflows - Câu hỏi phỏng vấn

## Mục lục
1. [Git Workflows](#git-workflows)
2. [Git Flow](#git-flow)
3. [GitHub Flow](#github-flow)
4. [GitLab Flow](#gitlab-flow)
5. [Pull Request Workflow](#pull-request-workflow)
6. [Code Review](#code-review)
7. [Branch Naming](#branch-naming)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Git Workflows

### Workflow là gì?

**Định nghĩa:**
- Set of rules và conventions
- How team uses Git
- Branching strategy
- Collaboration process

### Why Workflows?

1. **Consistency**: Team follows same process
2. **Clarity**: Clear process for everyone
3. **Quality**: Code review, testing
4. **Stability**: Stable main branch
5. **Collaboration**: Smooth teamwork

### Common Workflows

- **Git Flow**: Feature branches, release branches
- **GitHub Flow**: Simple, feature branches
- **GitLab Flow**: Environment branches
- **Trunk-based**: Direct commits to main

---

## Git Flow

### Git Flow Overview

**Định nghĩa:**
- Branching model với multiple branch types
- Long-lived branches: main, develop
- Short-lived branches: feature, release, hotfix
- Created by Vincent Driessen

### Branch Types

#### 1. main (master)

**Purpose:**
- Production-ready code
- Always deployable
- Tagged releases

**Rules:**
- Only merge from release hoặc hotfix
- Never commit directly
- Protected branch

#### 2. develop

**Purpose:**
- Integration branch
- Latest development code
- Merge features here

**Rules:**
- Merge feature branches
- Merge release branches
- Merge hotfix branches

#### 3. feature/*

**Purpose:**
- New features
- Short-lived branches
- Merge to develop

**Workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature develop

# Work on feature
git add .
git commit -m "Add feature"

# Merge to develop
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature
```

#### 4. release/*

**Purpose:**
- Prepare new release
- Bug fixes only
- Merge to main và develop

**Workflow:**
```bash
# Create release branch
git checkout -b release/1.0.0 develop

# Fix bugs, update version
git commit -m "Bump version to 1.0.0"

# Merge to main
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0

# Merge to develop
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
```

#### 5. hotfix/*

**Purpose:**
- Critical production fixes
- Branch from main
- Merge to main và develop

**Workflow:**
```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug main

# Fix bug
git commit -m "Fix critical bug"

# Merge to main
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1

# Merge to develop
git checkout develop
git merge --no-ff hotfix/critical-bug
git branch -d hotfix/critical-bug
```

### Git Flow Diagram

```
main:     A ────────────── C ────────────── E (v1.0.0) ──── G (v1.0.1)
           │               │                 │                │
develop:   └─── B ─────────┴─── D ──────────┴─── F ──────────┴─── H
           │     │         │     │
feature:   └─────┘         └─────┘
           │               │
release:                   └─── D (1.0.0)
```

### When to Use Git Flow

**Use Git Flow when:**
- Multiple releases in production
- Need release preparation
- Complex release process
- Large team
- Formal release cycle

**Don't use when:**
- Simple projects
- Continuous deployment
- Small team
- Single production version

---

## GitHub Flow

### GitHub Flow Overview

**Định nghĩa:**
- Simple workflow
- Feature branches
- Direct merge to main
- Created by GitHub

### Branch Types

#### 1. main

**Purpose:**
- Production-ready code
- Always deployable
- Protected branch

**Rules:**
- Merge feature branches via PR
- Never commit directly
- Deploy from main

#### 2. feature/*

**Purpose:**
- New features
- Bug fixes
- Any changes

**Workflow:**
```bash
# Create feature branch
git checkout -b feature/new-feature main

# Work on feature
git add .
git commit -m "Add feature"

# Push và create Pull Request
git push -u origin feature/new-feature

# After PR approval, merge to main
# Delete feature branch
```

### GitHub Flow Diagram

```
main:     A ──────────── B ──────────── C ──────────── D
           │             │               │               │
feature:   └─── A1 ──────┘               │               │
                       └─── A2 ──────────┘               │
                                       └─── A3 ──────────┘
```

### When to Use GitHub Flow

**Use GitHub Flow when:**
- Continuous deployment
- Simple release process
- Small to medium team
- Single production version
- Fast iteration

**Don't use when:**
- Need release branches
- Multiple production versions
- Complex release process

---

## GitLab Flow

### GitLab Flow Overview

**Định nghĩa:**
- Workflow với environment branches
- Upstream first principle
- Environment promotion
- Created by GitLab

### Branch Types

#### 1. main (production)

**Purpose:**
- Production code
- Always deployable

#### 2. pre-production

**Purpose:**
- Pre-production environment
- Testing before production

#### 3. staging

**Purpose:**
- Staging environment
- Integration testing

#### 4. feature/*

**Purpose:**
- New features
- Merge to main

### Environment Promotion

```
feature → main → staging → pre-production → production
```

**Workflow:**
```bash
# Create feature
git checkout -b feature/new-feature main

# Merge to main
git checkout main
git merge feature/new-feature

# Deploy to staging
git checkout staging
git merge main

# Deploy to pre-production
git checkout pre-production
git merge staging

# Deploy to production
git checkout production
git merge pre-production
```

### When to Use GitLab Flow

**Use GitLab Flow when:**
- Multiple environments
- Environment promotion needed
- Staging, pre-production, production
- Need environment branches

---

## Pull Request Workflow

### Pull Request (PR) / Merge Request (MR)

**Định nghĩa:**
- Request to merge changes
- Code review process
- Discussion, comments
- Automated checks

### PR Workflow Steps

#### 1. Create Feature Branch

```bash
# Create branch from main
git checkout -b feature/new-feature main

# Or from develop (Git Flow)
git checkout -b feature/new-feature develop
```

#### 2. Make Changes

```bash
# Make changes
git add .
git commit -m "Add feature"

# Push to remote
git push -u origin feature/new-feature
```

#### 3. Create Pull Request

**On GitHub/GitLab:**
- Click "New Pull Request"
- Select base branch (main/develop)
- Select feature branch
- Add description
- Add reviewers
- Link issues

#### 4. Code Review

**Reviewers:**
- Review code
- Add comments
- Request changes
- Approve

**Author:**
- Address comments
- Push updates
- Respond to feedback

#### 5. Merge

**After approval:**
- Merge via web interface
- Or merge locally:
```bash
git checkout main
git merge feature/new-feature
git push
```

**Merge options:**
- **Merge commit**: Creates merge commit
- **Squash and merge**: Combines commits
- **Rebase and merge**: Linear history

#### 6. Cleanup

```bash
# Delete feature branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### PR Best Practices

1. **Small PRs**: Easier to review
2. **Clear Description**: Explain what và why
3. **Reference Issues**: Link related issues
4. **Test Changes**: Ensure everything works
5. **Follow Style**: Match project conventions
6. **Respond Promptly**: Address review comments
7. **Keep Updated**: Sync with base branch

---

## Code Review

### Code Review là gì?

**Định nghĩa:**
- Process of reviewing code changes
- Before merging to main
- Quality assurance
- Knowledge sharing

### Review Checklist

**Functionality:**
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling present
- [ ] Tests included

**Code Quality:**
- [ ] Follows style guide
- [ ] No code smells
- [ ] Proper naming
- [ ] Comments where needed

**Security:**
- [ ] No security vulnerabilities
- [ ] Input validation
- [ ] No sensitive data exposed

**Performance:**
- [ ] No performance issues
- [ ] Efficient algorithms
- [ ] No memory leaks

### Review Comments

**Types:**
- **Must fix**: Blocking issues
- **Should fix**: Important but not blocking
- **Nice to have**: Suggestions
- **Questions**: Clarifications

**Best Practices:**
- Be constructive
- Explain why
- Suggest solutions
- Be respectful

---

## Branch Naming

### Naming Conventions

**Common patterns:**
- `feature/description`
- `bugfix/description`
- `hotfix/description`
- `release/version`
- `chore/description`

**Examples:**
```bash
feature/user-authentication
feature/add-payment-gateway
bugfix/fix-login-error
hotfix/critical-security-patch
release/v1.0.0
chore/update-dependencies
```

### Naming Best Practices

1. **Descriptive**: Clear purpose
2. **Consistent**: Follow team convention
3. **Short**: Not too long
4. **Lowercase**: Use lowercase
5. **Hyphens**: Use hyphens, not underscores
6. **Issue Numbers**: Include issue number if applicable

**Examples:**
```bash
# Good
feature/user-login
bugfix/123-fix-crash
hotfix/security-patch

# Bad
feature1
new_stuff
FIX
```

---

## Câu hỏi thường gặp

### Q1: Git Flow vs GitHub Flow?

**Git Flow:**
- Multiple branch types
- Long-lived develop branch
- Release branches
- Hotfix branches
- Complex, formal

**GitHub Flow:**
- Simple, feature branches only
- Direct merge to main
- No develop branch
- Continuous deployment
- Simple, fast

### Q2: Khi nào dùng Git Flow?

**Use Git Flow when:**
- Multiple releases in production
- Need release preparation
- Complex release process
- Large team
- Formal release cycle

### Q3: Pull Request workflow?

**Steps:**
1. Create feature branch
2. Make changes và commit
3. Push to remote
4. Create Pull Request
5. Code review
6. Address feedback
7. Merge after approval
8. Delete feature branch

### Q4: Code review best practices?

**Best practices:**
- Review functionality
- Check code quality
- Verify tests
- Check security
- Be constructive
- Explain why
- Suggest solutions

### Q5: Branch naming conventions?

**Common patterns:**
- `feature/description`
- `bugfix/description`
- `hotfix/description`
- `release/version`

**Best practices:**
- Descriptive
- Consistent
- Lowercase
- Use hyphens

### Q6: Merge options trong PR?

**Options:**
- **Merge commit**: Creates merge commit
- **Squash and merge**: Combines commits
- **Rebase and merge**: Linear history

**Choose based on:**
- Team preference
- History style
- Project needs

---

## Best Practices

1. **Choose Right Workflow**: Match team needs
2. **Small PRs**: Easier to review
3. **Clear Descriptions**: Explain changes
4. **Code Review**: Quality assurance
5. **Consistent Naming**: Follow conventions
6. **Keep Branches Updated**: Sync with base
7. **Clean Up**: Delete merged branches

---

## Bài tập thực hành

### Bài 1: Git Flow

```bash
# Yêu cầu:
# 1. Setup Git Flow branches
# 2. Create feature branch
# 3. Create release branch
# 4. Create hotfix branch
# 5. Merge following Git Flow
```

### Bài 2: GitHub Flow

```bash
# Yêu cầu:
# 1. Create feature branch
# 2. Make changes
# 3. Create Pull Request
# 4. Review và merge
# 5. Clean up
```

### Bài 3: Pull Request

```bash
# Yêu cầu:
# 1. Create feature branch
# 2. Make multiple commits
# 3. Push và create PR
# 4. Address review comments
# 5. Merge PR
```

---

## Tổng kết

- **Git Flow**: Feature, release, hotfix branches
- **GitHub Flow**: Simple, feature branches only
- **GitLab Flow**: Environment branches
- **Pull Request**: Code review process
- **Code Review**: Quality assurance
- **Branch Naming**: Consistent conventions
- **Workflow**: Choose based on team needs
