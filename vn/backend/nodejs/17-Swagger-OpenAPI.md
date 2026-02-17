# Swagger & OpenAPI

## Mục lục
1. [OpenAPI là gì?](#openapi-là-gì)
2. [swagger-jsdoc + swagger-ui-express](#setup)
3. [Annotations](#annotations)
4. [Schema / DTO](#schema)
5. [Authentication](#authentication)
6. [Best Practices](#best-practices)
7. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## OpenAPI là gì?

**OpenAPI Specification (OAS)** = chuẩn mô tả REST API (YAML/JSON). **Swagger** = bộ tools:

- **Swagger UI** — giao diện web interactive cho API docs.
- **Swagger Editor** — viết/edit OpenAPI spec.
- **Swagger Codegen** — generate client SDK.

---

## Setup

```bash
npm install swagger-jsdoc swagger-ui-express
```

```javascript
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// Swagger config
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'REST API documentation',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // files chứa annotations
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// → http://localhost:3000/api-docs
```

---

## Annotations

```javascript
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 */
router.get('/api/users', usersController.findAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy user theo ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/api/users/:id', usersController.findOne);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tạo user mới
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/api/users', auth, usersController.create);
```

---

## Schema

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Nguyen Van An
 *         email:
 *           type: string
 *           format: email
 *           example: an@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *     CreateUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         message:
 *           type: string
 */
```

---

## Authentication

```javascript
// Protected route
/**
 * @swagger
 * /api/users:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     ...
 */

// Swagger UI → nút "Authorize" → nhập JWT token
```

---

## Best Practices

1. **Document tất cả endpoints** — request params, body, responses.
2. **Sử dụng schemas** (`$ref`) — tránh duplicate.
3. **Ví dụ (example)** — cho mỗi field.
4. **Error responses** — document cả 400, 401, 404, 500.
5. **Tags** — nhóm endpoints theo domain.
6. **Versioning** — ghi rõ version.
7. **Auto-generate** khi có thể (NestJS `@nestjs/swagger`).

---

## Câu hỏi phỏng vấn

**Q: OpenAPI / Swagger dùng để làm gì?**

> Mô tả REST API (endpoints, parameters, request/response schemas). Swagger UI tạo docs interactive. Auto-generate client SDKs. Giúp frontend, QA, team mới hiểu API nhanh.

**Q: Cách document API trong Express?**

> Dùng `swagger-jsdoc` (JSDoc annotations) + `swagger-ui-express` (UI). Viết annotations trong route files, swagger-jsdoc đọc → sinh OpenAPI spec → Swagger UI render.

---

**Quay lại**: [README — Node.js Documentation](./README.md)
