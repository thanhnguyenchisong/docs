# Bài 8: MCP trong API — Model Context Protocol

> Module: [Building with the Claude API](./README.md) → Bài 8
> Chi tiết hơn tại: [Module MCP riêng](../07-mcp/)

---

## 🔹 1. MCP là gì?

**MCP (Model Context Protocol)** là giao thức chuẩn để kết nối Claude với **external services** — databases, APIs, file systems — mà không cần viết integration code phức tạp.

```
Trước MCP:                         Với MCP:
App → custom code → API1           App → MCP Client
App → custom code → API2                → MCP Server 1 (tools)
App → custom code → DB                  → MCP Server 2 (resources)
(N integrations = N custom codes)       → MCP Server 3 (prompts)
                                   (1 protocol, nhiều servers)
```

## 🔹 2. 3 Primitives của MCP

| Primitive | Ai điều khiển | Mô tả |
|-----------|--------------|-------|
| **Tools** | Model (Claude tự gọi) | Functions có side effects |
| **Resources** | App (code bạn quyết định) | Read-only data exposure |
| **Prompts** | User (user chọn) | Pre-crafted prompt templates |

## 🔹 3. Xây MCP Server (Python)

```python
# pip install mcp
from mcp.server.fastmcp import FastMCP

# Tạo MCP server
mcp = FastMCP("notes-server")

# Tool — Claude có thể gọi
@mcp.tool()
def create_note(title: str, content: str) -> str:
    """Tạo ghi chú mới"""
    # Lưu vào database...
    return f"Đã tạo ghi chú: {title}"

@mcp.tool()
def search_notes(query: str) -> str:
    """Tìm kiếm ghi chú theo từ khóa"""
    # Search database...
    return f"Tìm thấy 3 kết quả cho '{query}'"

# Resource — dữ liệu read-only
@mcp.resource("notes://list")
def list_notes():
    """Danh sách tất cả ghi chú"""
    return "Note 1: ...\nNote 2: ..."

# Resource template — dynamic URI
@mcp.resource("notes://{note_id}")
def get_note(note_id: str):
    """Lấy nội dung ghi chú theo ID"""
    return f"Nội dung note {note_id}..."

# Prompt — template pre-crafted
@mcp.prompt()
def summarize_notes():
    """Prompt tóm tắt tất cả ghi chú"""
    return "Hãy tóm tắt tất cả ghi chú thành 1 đoạn văn ngắn"

# Chạy server
if __name__ == "__main__":
    mcp.run()
```

## 🔹 4. Test với MCP Inspector

```bash
# Chạy inspector
mcp dev server.py

# Mở browser → http://localhost:5173
# Test tools, resources, prompts trực tiếp
```

## 🔹 5. MCP Client

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import anthropic

async def main():
    # Kết nối MCP server
    server_params = StdioServerParameters(
        command="python",
        args=["server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Lấy danh sách tools
            tools = await session.list_tools()
            
            # Convert tools → Anthropic format
            anthropic_tools = [{
                "name": tool.name,
                "description": tool.description,
                "input_schema": tool.inputSchema
            } for tool in tools.tools]
            
            # Gọi Claude với MCP tools
            client = anthropic.Anthropic()
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                tools=anthropic_tools,
                messages=[{
                    "role": "user",
                    "content": "Tạo ghi chú về cuộc họp hôm nay"
                }]
            )
            
            # Xử lý tool calls
            for block in response.content:
                if block.type == "tool_use":
                    result = await session.call_tool(
                        block.name, 
                        block.input
                    )
                    print(f"Tool result: {result}")

import asyncio
asyncio.run(main())
```

## 🔹 6. MCP Connector (Simple API)

Anthropic cũng cung cấp **MCP Connector** — kết nối MCP servers trực tiếp trong API request:

```python
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    mcp_servers=[{
        "type": "url",
        "url": "https://my-mcp-server.example.com/mcp",
        "name": "notes"
    }],
    messages=[{
        "role": "user",
        "content": "Liệt kê tất cả ghi chú của tôi"
    }]
)
```

---

## 📝 Khi nào dùng gì?

| Cách | Dùng khi |
|------|---------|
| **Tool Use trực tiếp** | Ít tools, logic đơn giản |
| **MCP Server** | Nhiều tools, cần chuẩn hóa, team dùng chung |
| **MCP Connector** | Đã có MCP server, muốn kết nối nhanh |

---

➡️ Tiếp theo: [Agents & Workflows](09-agents-workflows.md)
