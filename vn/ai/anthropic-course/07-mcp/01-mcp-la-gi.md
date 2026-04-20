# Bài 1: MCP là gì?

> Module: [MCP](./README.md) → Bài 1

---

## 🔹 Vấn đề MCP giải quyết

```
Trước MCP:
┌─────────┐    custom code    ┌──────────┐
│ Your App │ ──────────────→  │ GitHub   │
│          │    custom code    │ Slack    │
│          │ ──────────────→  │ Database │
│          │    custom code    │ Files    │
│          │ ──────────────→  │ APIs     │
└─────────┘                   └──────────┘
Mỗi integration = viết code riêng

Với MCP:
┌─────────┐    MCP Protocol   ┌──────────────┐    ┌──────────┐
│ MCP     │ ←───────────────→ │ MCP Server 1 │ →  │ GitHub   │
│ Client  │                   │ MCP Server 2 │ →  │ Slack    │
│ (Claude)│                   │ MCP Server 3 │ →  │ Database │
└─────────┘                   └──────────────┘    └──────────┘
1 protocol, nhiều servers
```

## 🔹 Kiến trúc MCP

```
┌───────────────────────────────────────────┐
│                  HOST                      │
│  (Claude Desktop, IDE, Your App)          │
│                                            │
│  ┌──────────┐  ┌──────────┐              │
│  │MCP Client│  │MCP Client│  ...         │
│  │ (1:1)    │  │ (1:1)    │              │
│  └────┬─────┘  └────┬─────┘              │
│       │              │                    │
└───────┼──────────────┼────────────────────┘
        │              │
   Transport      Transport
   (stdio/SSE)   (stdio/SSE)
        │              │
  ┌─────▼─────┐  ┌─────▼─────┐
  │MCP Server │  │MCP Server │
  │ (GitHub)  │  │ (Postgres)│
  └───────────┘  └───────────┘
```

**Các thành phần:**
| Component | Vai trò |
|-----------|---------|
| **Host** | App chứa MCP clients (Claude Desktop, IDE) |
| **Client** | Kết nối 1:1 với 1 server, quản lý protocol |
| **Server** | Expose tools/resources/prompts cho 1 service |
| **Transport** | Kênh giao tiếp (stdio, HTTP+SSE) |

## 🔹 3 Primitives

| Primitive | Ai điều khiển | Side effects? | Ví dụ |
|-----------|--------------|---------------|-------|
| **Tools** | Model (AI tự gọi) | ✅ Có | Create issue, send email |
| **Resources** | App (code quyết định) | ❌ Read-only | Database records, file content |
| **Prompts** | User (user chọn) | ❌ No | Template "summarize doc" |

```
Tool     = Claude có thể GỌI → có thể thay đổi dữ liệu
Resource = Claude có thể ĐỌC → chỉ lấy thông tin
Prompt   = User CHỌN → template instructions pre-made
```

## 🔹 Transport Protocols

### stdio (Standard I/O)
```
Cho local servers — parent process tạo child process:
Host → spawn "python server.py" → giao tiếp qua stdin/stdout
```

### HTTP + Server-Sent Events (SSE)  
```
Cho remote servers — HTTP request/response + SSE streaming:
Client → HTTP POST → Server
Server → SSE events → Client
```

## 🔹 Request Flow

```
1. User: "Tạo GitHub issue cho bug login"
2. Host (Claude Desktop) → gửi cho Claude AI
3. Claude AI: "Tôi cần dùng tool create_issue"
4. MCP Client → gửi tool call → MCP Server (GitHub)
5. MCP Server → gọi GitHub API → tạo issue
6. MCP Server → trả result → MCP Client
7. MCP Client → trả cho Claude AI
8. Claude AI: "Đã tạo issue #456: Bug login"
```

---

➡️ Tiếp theo: [Xây MCP Server](02-xay-mcp-server.md)
