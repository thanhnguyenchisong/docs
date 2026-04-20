# Bài 5: Resources — Dữ liệu Read-only

> Module: [MCP](./README.md) → Bài 5

---

## 🔹 Resources vs Tools

```
Tool     → Claude GỌI → có thể THAY ĐỔI dữ liệu (create, update, delete)
Resource → App ĐỌC   → chỉ EXPOSE dữ liệu (read-only, no side effects)
```

## 🔹 Direct Resources — Static URI

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("data-server")

# Resource với URI cố định
@mcp.resource("config://app-settings")
def get_app_settings():
    """Cấu hình ứng dụng hiện tại"""
    return json.dumps({
        "version": "2.1.0",
        "environment": "production",
        "features": {"dark_mode": True, "beta": False}
    })

@mcp.resource("stats://daily")
def get_daily_stats():
    """Thống kê hàng ngày"""
    return json.dumps({
        "active_users": 1523,
        "requests": 45000,
        "errors": 12
    })
```

## 🔹 Resource Templates — Dynamic URI

```python
# Template với parameter
@mcp.resource("users://{user_id}")
def get_user(user_id: str):
    """Thông tin user theo ID"""
    user = database.get_user(user_id)
    return json.dumps(user)

@mcp.resource("notes://{note_id}")
def get_note_resource(note_id: str):
    """Nội dung ghi chú (read-only)"""
    note = notes.get(note_id)
    if note:
        return json.dumps(note)
    return json.dumps({"error": "Not found"})
```

## 🔹 MIME Types

```python
# Mặc định: text/plain
@mcp.resource("readme://project")
def get_readme():
    """README của project"""
    return open("README.md").read()  # text/plain

# JSON
@mcp.resource("data://users", mime_type="application/json")
def get_users_json():
    """Danh sách users dạng JSON"""
    return json.dumps(users)

# HTML
@mcp.resource("report://monthly", mime_type="text/html")
def get_monthly_report():
    """Báo cáo tháng dạng HTML"""
    return "<h1>Monthly Report</h1>..."
```

## 🔹 Đọc Resources từ Client

```python
async def read_resources(session):
    # Liệt kê resources
    resources = await session.list_resources()
    for r in resources.resources:
        print(f"  {r.uri} — {r.name}")
    
    # Đọc resource cụ thể
    content = await session.read_resource("config://app-settings")
    
    for item in content.contents:
        if item.mimeType == "application/json":
            data = json.loads(item.text)
            print(data)
        else:
            print(item.text)
```

## 🔹 Khi nào dùng Resource vs Tool?

| Dùng Resource | Dùng Tool |
|---------------|-----------|
| Đọc config, settings | Thay đổi config |
| Xem danh sách, stats | CRUD operations |
| Lấy content file | Sửa/xóa file |
| Inject context vào prompt | Execute actions |

---

➡️ Tiếp theo: [Prompts & Advanced](06-prompts.md)
