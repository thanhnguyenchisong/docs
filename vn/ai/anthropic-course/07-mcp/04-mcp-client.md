# Bài 4: MCP Client

> Module: [MCP](./README.md) → Bài 4

---

## 🔹 MCP Client kết nối Claude API

```python
import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import anthropic

async def main():
    # 1. Kết nối MCP server
    server_params = StdioServerParameters(
        command="python",
        args=["server.py"]
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 2. Initialize session
            await session.initialize()
            
            # 3. Lấy danh sách tools từ server
            tools_response = await session.list_tools()
            
            # 4. Convert sang Anthropic format
            anthropic_tools = []
            for tool in tools_response.tools:
                anthropic_tools.append({
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema
                })
            
            print(f"Available tools: {[t['name'] for t in anthropic_tools]}")
            
            # 5. Chat loop với Claude + MCP tools
            client = anthropic.Anthropic()
            messages = []
            
            user_input = "Tạo 3 ghi chú về Python, rồi liệt kê tất cả"
            messages.append({"role": "user", "content": user_input})
            
            while True:
                response = client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=4096,
                    tools=anthropic_tools,
                    messages=messages
                )
                
                # Xong rồi → in kết quả
                if response.stop_reason == "end_turn":
                    for block in response.content:
                        if hasattr(block, "text"):
                            print(f"\nClaude: {block.text}")
                    break
                
                # Cần tool → execute qua MCP
                if response.stop_reason == "tool_use":
                    messages.append({
                        "role": "assistant",
                        "content": response.content
                    })
                    
                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            print(f"  → Calling: {block.name}({block.input})")
                            
                            # Gọi tool qua MCP session
                            result = await session.call_tool(
                                block.name,
                                block.input
                            )
                            
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": str(result.content)
                            })
                    
                    messages.append({
                        "role": "user",
                        "content": tool_results
                    })

asyncio.run(main())
```

## 🔹 Output mẫu

```
Available tools: ['create_note', 'list_notes', 'get_note', 'delete_note']
  → Calling: create_note({'title': 'Python Basics', 'content': 'Variables, types...'})
  → Calling: create_note({'title': 'Python Functions', 'content': 'def, args...'})
  → Calling: create_note({'title': 'Python OOP', 'content': 'Classes...'})
  → Calling: list_notes({})

Claude: Đã tạo 3 ghi chú:
#1: Python Basics
#2: Python Functions  
#3: Python OOP
```

## 🔹 Multi-server Client

```python
# Kết nối nhiều MCP servers cùng lúc
servers = {
    "notes": StdioServerParameters(command="python", args=["notes_server.py"]),
    "github": StdioServerParameters(command="python", args=["github_server.py"]),
}

# Mỗi server = 1 session riêng
# Gộp tools từ tất cả servers → gửi cho Claude
all_tools = []
for name, params in servers.items():
    # ... connect và lấy tools
    # Prefix tool names để avoid conflicts: "notes__create_note"
    pass
```

---

➡️ Tiếp theo: [Resources](05-resources.md)
