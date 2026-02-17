# NPM & Package Management

## Mục lục
1. [npm là gì?](#npm-là-gì)
2. [package.json](#packagejson)
3. [Semantic Versioning](#semantic-versioning)
4. [npm Commands](#npm-commands)
5. [package-lock.json](#package-lockjson)
6. [npm Scripts](#npm-scripts)
7. [npm vs yarn vs pnpm](#npm-vs-yarn-vs-pnpm)
8. [npx](#npx)
9. [Publish Package](#publish-package)
10. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## npm là gì?

**npm** (Node Package Manager) gồm 3 thành phần:
1. **Registry** — kho lưu trữ packages lớn nhất thế giới (npmjs.com).
2. **CLI** — tool dòng lệnh để cài, gỡ, publish packages.
3. **Website** — tìm kiếm packages tại npmjs.com.

```bash
npm -v        # kiểm tra version
npm help      # trợ giúp
```

---

## package.json

File **manifest** mô tả project — dependencies, scripts, metadata.

### Tạo package.json

```bash
npm init          # hướng dẫn từng bước
npm init -y       # tạo nhanh (mặc định)
```

### Cấu trúc quan trọng

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "description": "Mô tả ngắn",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "license": "MIT"
}
```

### dependencies vs devDependencies

| | `dependencies` | `devDependencies` |
|---|----------------|-------------------|
| Cài khi | `npm install` | `npm install` (dev) |
| Production | Cần | **Không** cần |
| Ví dụ | express, mongoose | jest, eslint, nodemon |
| Cài lệnh | `npm i express` | `npm i -D jest` |

```bash
npm install express           # → dependencies
npm install --save-dev jest   # → devDependencies (hoặc -D)
npm install --production      # chỉ cài dependencies (deploy)
```

---

## Semantic Versioning

Format: **MAJOR.MINOR.PATCH** (ví dụ: `4.18.2`)

| Phần | Khi nào tăng | Ví dụ |
|------|-------------|-------|
| **MAJOR** | Breaking changes (API thay đổi) | 3.x → 4.0 |
| **MINOR** | Tính năng mới, backward-compatible | 4.17 → 4.18 |
| **PATCH** | Bug fix, backward-compatible | 4.18.1 → 4.18.2 |

### Range operators

```json
{
  "dependencies": {
    "express": "4.18.2",     // chính xác 4.18.2
    "express": "^4.18.2",    // >=4.18.2 <5.0.0 (tương thích MAJOR)
    "express": "~4.18.2",    // >=4.18.2 <4.19.0 (tương thích MINOR)
    "express": ">=4.18.0",   // >= 4.18.0 (bất kỳ)
    "express": "*"            // bất kỳ version nào
  }
}
```

**Khuyến nghị**: Dùng `^` (mặc định) — cho phép cập nhật MINOR + PATCH.

---

## npm Commands

```bash
# ---- Cài đặt ----
npm install                    # cài tất cả từ package.json
npm install express            # cài package → dependencies
npm install -D nodemon         # cài → devDependencies
npm install -g typescript      # cài toàn cục (global)

# ---- Gỡ ----
npm uninstall express          # gỡ package
npm uninstall -g typescript    # gỡ global

# ---- Cập nhật ----
npm update                     # cập nhật tất cả (trong range)
npm outdated                   # xem packages cần update

# ---- Thông tin ----
npm list                       # danh sách packages đã cài
npm list --depth=0             # chỉ cấp 1
npm info express               # thông tin package
npm view express versions      # tất cả versions

# ---- Bảo mật ----
npm audit                      # kiểm tra vulnerabilities
npm audit fix                  # tự động fix
npm audit fix --force          # fix (có thể breaking changes)

# ---- Cache ----
npm cache clean --force        # xóa cache
npm cache verify               # kiểm tra cache
```

---

## package-lock.json

- **Khóa chính xác** version mọi dependency (kể cả transitive).
- Đảm bảo mọi người trong team cài **cùng version**.
- **Luôn commit** vào git. Không sửa tay.

```bash
# Cài từ lock file (nhanh, chính xác) — dùng trong CI/CD
npm ci
```

| | `npm install` | `npm ci` |
|---|--------------|---------|
| Đọc | `package.json` | `package-lock.json` |
| Cập nhật lock | Có thể | Không |
| Xóa `node_modules` trước | Không | Có |
| Dùng khi | Dev | CI/CD, deploy |

---

## npm Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "build": "tsc",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "prestart": "echo 'Trước khi start'",
    "poststart": "echo 'Sau khi start'"
  }
}
```

```bash
npm start          # chạy script "start" (không cần "run")
npm test           # chạy script "test"
npm run dev        # các script khác cần "run"
npm run lint:fix
```

### Lifecycle hooks

- `prestart` → `start` → `poststart`
- `pretest` → `test` → `posttest`
- `preinstall` → `install` → `postinstall`

### Chạy tuần tự / song song

```json
{
  "scripts": {
    "build:all": "npm run build:css && npm run build:js",
    "dev": "concurrently \"npm run watch:css\" \"npm run watch:js\""
  }
}
```

---

## npm vs yarn vs pnpm

| Đặc điểm | npm | yarn | pnpm |
|-----------|-----|------|------|
| Lock file | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |
| Tốc độ | Trung bình | Nhanh | **Nhanh nhất** |
| Disk usage | Cao (duplicate) | Cao | **Thấp** (hard links) |
| Workspaces | Có | Có | Có |
| Monorepo | Có thể | Có thể | **Tốt nhất** |
| PnP (Plug'n'Play) | Không | Có (yarn 2+) | Không |

```bash
# yarn
yarn add express
yarn add -D jest
yarn install
yarn start

# pnpm
pnpm add express
pnpm add -D jest
pnpm install
pnpm start
```

---

## npx

Chạy package **không cần cài global**.

```bash
npx create-react-app my-app   # chạy generator
npx ts-node script.ts         # chạy TypeScript
npx serve .                   # static file server
npx eslint .                  # lint
npx -p node@18 node -v        # chạy với Node version khác
```

---

## Publish Package

```bash
# 1. Đăng nhập
npm login

# 2. Chuẩn bị package.json
{
  "name": "@myorg/my-lib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "files": ["dist"],          // chỉ publish thư mục dist
  "publishConfig": {
    "access": "public"
  }
}

# 3. Publish
npm publish
npm publish --access public   # scoped package (public)

# 4. Cập nhật version
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.1 → 1.1.0
npm version major   # 1.1.0 → 2.0.0
npm publish
```

### .npmignore

```
node_modules/
src/
test/
.env
*.test.js
```

---

## Câu hỏi phỏng vấn

**Q: `dependencies` vs `devDependencies` — khi nào dùng gì?**

> `dependencies`: packages cần trong production (express, mongoose). `devDependencies`: chỉ cần khi phát triển (jest, eslint, nodemon). Khi deploy: `npm install --production` chỉ cài `dependencies`.

**Q: `^4.18.0` vs `~4.18.0` khác gì?**

> `^4.18.0` cho phép update MINOR + PATCH (4.18.0 → 4.99.99). `~4.18.0` chỉ cho phép PATCH (4.18.0 → 4.18.99). `^` phổ biến hơn, `~` an toàn hơn.

**Q: `npm install` vs `npm ci`?**

> `npm install` đọc package.json, có thể update lock file. `npm ci` đọc package-lock.json, xóa node_modules, cài chính xác → nhanh, deterministic, dùng cho CI/CD.

**Q: Tại sao commit `package-lock.json`?**

> Đảm bảo mọi người (và CI/CD) cài cùng version dependencies. Tránh "works on my machine". Lock cả transitive dependencies.

---

**Tiếp theo**: [04 - Async Programming](./04-Async-Programming.md)
