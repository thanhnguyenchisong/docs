# Bài 6: Prompts & Advanced Topics

> Module: [MCP](./README.md) → Bài 6

---

## 🔹 MCP Prompts

Prompts = **pre-crafted templates** cho common workflows. User chọn prompt, app inject vào conversation.

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("notes-server")

@mcp.prompt()
def summarize_all_notes():
    """Tóm tắt tất cả ghi chú thành 1 paragraph"""
    all_notes = "\n\n".join([
        f"## {n['title']}\n{n['content']}" 
        for n in notes.values()
    ])
    return f"""Hãy tóm tắt tất cả ghi chú sau thành 1 đoạn văn ngắn gọn:

{all_notes}

Tập trung vào ý chính, bỏ chi tiết không quan trọng."""

@mcp.prompt()
def format_note(note_id: str):
    """Format lại ghi chú theo professional style"""
    note = notes.get(note_id, {"title": "N/A", "content": "N/A"})
    return f"""Format lại ghi chú sau theo style chuyên nghiệp:

Title: {note['title']}
Content: {note['content']}

Yêu cầu:
- Headings rõ ràng
- Bullet points cho list items
- Bold cho keywords quan trọng
- Thêm summary ở đầu"""
```

## 🔹 Prompts trong Client

```python
async def use_prompts(session):
    # Liệt kê prompts available
    prompts = await session.list_prompts()
    for p in prompts.prompts:
        print(f"  {p.name}: {p.description}")
    
    # Lấy prompt content
    prompt = await session.get_prompt(
        "format_note", 
        arguments={"note_id": "1"}
    )
    
    # Inject vào Claude
    messages = []
    for msg in prompt.messages:
        messages.append({
            "role": msg.role,
            "content": msg.content.text
        })
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=messages
    )
```

## 🔹 Advanced: Remote MCP Servers

### HTTP + SSE Transport

```python
# server_remote.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("remote-notes")

# ... define tools, resources, prompts ...

if __name__ == "__main__":
    mcp.run(transport="sse", port=8000)
```

### Client kết nối remote

```python
from mcp.client.sse import sse_client

async def connect_remote():
    async with sse_client("http://localhost:8000/sse") as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            # ... sử dụng như stdio client
```

## 🔹 Advanced: Authentication

```python
# Server với auth
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("secure-server")

@mcp.tool()
def get_secret_data(api_key: str) -> str:
    """Lấy dữ liệu bảo mật (cần API key)"""
    if not validate_api_key(api_key):
        return "Unauthorized"
    return "Secret data..."
```

## 🔹 Advanced: MCP trong Claude Code

```json
// .claude/mcp.json
{
  "servers": {
    "my-notes": {
      "command": "python",
      "args": ["path/to/server.py"]
    },
    "remote-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp"
    }
  }
}
```

## 🔹 Tổng kết 3 Primitives

```
┌────────────┬──────────────┬──────────────┐
│   Tools    │  Resources   │   Prompts    │
├────────────┼──────────────┼──────────────┤
│ Model gọi  │ App control  │ User chọn   │
│ Có effects │ Read-only    │ Templates   │
│ @mcp.tool()│ @mcp.resource│ @mcp.prompt()│
│ CRUD ops   │ Data expose  │ Workflows   │
└────────────┴──────────────┴──────────────┘
```

---

## ➡️ Hoàn thành Module!

Tiếp theo:
- [Cloud Deployment](../08-cloud-deployment/) — deploy Claude trên AWS/GCP
- [Building with API](../02-building-with-api/) — nếu chưa học API
