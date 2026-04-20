# Bài 2: Xây MCP Server

> Module: [MCP](./README.md) → Bài 2

---

## 🔹 1. Setup Project

```bash
# Tạo project
mkdir mcp-notes-server && cd mcp-notes-server

# Setup Python virtual env
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install MCP SDK
pip install mcp
```

## 🔹 2. Server cơ bản

```python
# server.py
from mcp.server.fastmcp import FastMCP

# Tạo MCP server instance
mcp = FastMCP("notes-server")

# In-memory storage (thay bằng DB trong production)
notes = {}
note_counter = 0

@mcp.tool()
def create_note(title: str, content: str) -> str:
    """Tạo ghi chú mới.
    
    Args:
        title: Tiêu đề ghi chú
        content: Nội dung ghi chú
    """
    global note_counter
    note_counter += 1
    note_id = str(note_counter)
    notes[note_id] = {"title": title, "content": content}
    return f"Đã tạo ghi chú #{note_id}: {title}"

@mcp.tool()
def list_notes() -> str:
    """Liệt kê tất cả ghi chú."""
    if not notes:
        return "Chưa có ghi chú nào."
    
    result = []
    for note_id, note in notes.items():
        result.append(f"#{note_id}: {note['title']}")
    return "\n".join(result)

@mcp.tool()
def get_note(note_id: str) -> str:
    """Lấy nội dung ghi chú theo ID.
    
    Args:
        note_id: ID của ghi chú cần lấy
    """
    note = notes.get(note_id)
    if not note:
        return f"Không tìm thấy ghi chú #{note_id}"
    return f"# {note['title']}\n\n{note['content']}"

@mcp.tool()
def delete_note(note_id: str) -> str:
    """Xóa ghi chú theo ID.
    
    Args:
        note_id: ID của ghi chú cần xóa
    """
    if note_id in notes:
        title = notes[note_id]["title"]
        del notes[note_id]
        return f"Đã xóa ghi chú #{note_id}: {title}"
    return f"Không tìm thấy ghi chú #{note_id}"

if __name__ == "__main__":
    mcp.run()
```

## 🔹 3. Cách tool definitions hoạt động

MCP SDK **tự động** tạo JSON schema từ:
- **Function name** → tool name
- **Docstring** → tool description
- **Type hints** → input schema
- **Field descriptions** → parameter descriptions

```python
# Bạn viết:
@mcp.tool()
def search_notes(query: str, max_results: int = 5) -> str:
    """Tìm kiếm ghi chú theo từ khóa.
    
    Args:
        query: Từ khóa tìm kiếm
        max_results: Số kết quả tối đa (mặc định 5)
    """
    ...

# SDK tạo JSON schema:
# {
#   "name": "search_notes",
#   "description": "Tìm kiếm ghi chú theo từ khóa.",
#   "input_schema": {
#     "type": "object",
#     "properties": {
#       "query": {"type": "string", "description": "Từ khóa tìm kiếm"},
#       "max_results": {"type": "integer", "default": 5, 
#                       "description": "Số kết quả tối đa"}
#     },
#     "required": ["query"]
#   }
# }
```

## 🔹 4. Dùng Field cho descriptions chi tiết

```python
from pydantic import Field

@mcp.tool()
def edit_note(
    note_id: str = Field(description="ID ghi chú cần sửa"),
    title: str | None = Field(None, description="Tiêu đề mới (bỏ qua nếu không đổi)"),
    content: str | None = Field(None, description="Nội dung mới (bỏ qua nếu không đổi)")
) -> str:
    """Sửa nội dung ghi chú hiện có."""
    note = notes.get(note_id)
    if not note:
        return f"Không tìm thấy ghi chú #{note_id}"
    
    if title is not None:
        note["title"] = title
    if content is not None:
        note["content"] = content
    
    return f"Đã cập nhật ghi chú #{note_id}"
```

## 🔹 5. Chạy Server

```bash
# Chạy trực tiếp
python server.py

# Hoặc với MCP Inspector (recommended cho dev)
mcp dev server.py
```

---

➡️ Tiếp theo: [MCP Inspector](03-server-inspector.md)
