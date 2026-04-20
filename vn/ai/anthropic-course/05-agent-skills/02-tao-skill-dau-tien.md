# Bài 2: Tạo Skill đầu tiên

> Module: [Agent Skills](./README.md) → Bài 2

---

## 🔹 1. Tạo thư mục Skill

```bash
# Trong project root
mkdir -p .claude/skills/api-generator
```

## 🔹 2. Viết SKILL.md

```markdown
---
name: api-generator
description: "Generate REST API endpoints with FastAPI, including request/response schemas, error handling, and OpenAPI documentation"
---

# API Endpoint Generator

## Khi tạo endpoint mới, follow pattern này:

### 1. Pydantic Schemas (schemas/)
```python
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    description: str | None = None

class ItemResponse(BaseModel):
    id: int
    name: str
    price: float
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

### 2. Route (api/routes/)
```python
@router.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item: ItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new item."""
    service = ItemService(db)
    return await service.create(item, owner_id=current_user.id)
```

### 3. Service (services/)
- Business logic tách khỏi route
- Raise HTTPException cho errors
- Return model instance, không return dict

### 4. Tests
- Test happy path + error cases
- Test authentication required
- Test validation errors
```

## 🔹 3. Frontmatter chi tiết

```yaml
---
name: api-generator                    # Tên unique
description: "Generate REST API..."    # MÔ TẢ QUAN TRỌNG NHẤT
                                       # Claude dùng description để match!
allowed-tools:                         # Giới hạn tools skill được dùng
  - read_file
  - write_file
  - search
  # KHÔNG có bash → skill không chạy commands
---
```

### Tips cho description tốt:

```
❌ "API stuff"  
   → Quá mơ hồ, Claude không biết khi nào trigger

✅ "Generate REST API endpoints with FastAPI, including 
    request/response schemas, error handling, validation, 
    and OpenAPI documentation"
   → Cụ thể, chứa keywords Claude sẽ match
```

## 🔹 4. Progressive Disclosure

Skill files có thể **reference** files khác để giữ SKILL.md ngắn gọn:

```
.claude/skills/api-generator/
├── SKILL.md              ← instructions chính (ngắn)
├── schema-patterns.md    ← reference khi cần chi tiết schemas
├── error-handling.md     ← reference khi cần chi tiết errors
└── examples/
    ├── user_endpoint.py  ← ví dụ thực
    └── order_endpoint.py
```

```markdown
<!-- Trong SKILL.md -->
## Schema Patterns
See [schema-patterns.md](./schema-patterns.md) for detailed patterns.

## Error Handling
See [error-handling.md](./error-handling.md) for error patterns.
```

**Lợi ích:** Claude chỉ đọc files cần thiết → tiết kiệm context window.

## 🔹 5. Test Skill

```bash
# Khởi động Claude Code
claude

# Test trigger
> "Tạo CRUD endpoints cho Product model"

# Claude sẽ:
# 1. Detect skill "api-generator" từ description match
# 2. Load SKILL.md
# 3. Follow instructions trong skill
# 4. Generate code theo đúng pattern
```

---

➡️ Tiếp theo: [Cấu hình nâng cao](03-cau-hinh-nang-cao.md)
