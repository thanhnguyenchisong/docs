# Bài 3: MCP Inspector

> Module: [MCP](./README.md) → Bài 3

---

## 🔹 Inspector là gì?

MCP Inspector là **browser-based tool** để test và debug MCP server mà không cần viết client code.

```bash
# Chạy inspector
mcp dev server.py

# Mở browser
# → http://localhost:5173
```

## 🔹 Giao diện Inspector

```
┌──────────────────────────────────────────────┐
│  MCP Inspector                               │
├──────────────────────────────────────────────┤
│                                              │
│  Server: notes-server (connected ✅)          │
│                                              │
│  ┌─────────┬────────────┬─────────┐          │
│  │  Tools  │ Resources  │ Prompts │          │
│  └─────────┴────────────┴─────────┘          │
│                                              │
│  📦 Tools (4):                               │
│  ├── create_note                             │
│  │   ├── title: [input field]                │
│  │   ├── content: [input field]              │
│  │   └── [Execute]                           │
│  ├── list_notes                              │
│  │   └── [Execute]                           │
│  ├── get_note                                │
│  │   ├── note_id: [input field]              │
│  │   └── [Execute]                           │
│  └── delete_note                             │
│      ├── note_id: [input field]              │
│      └── [Execute]                           │
│                                              │
│  ─── Output ───                              │
│  "Đã tạo ghi chú #1: Meeting notes"         │
│                                              │
└──────────────────────────────────────────────┘
```

## 🔹 Workflow với Inspector

```
1. Viết/sửa tool trong server.py
2. Chạy `mcp dev server.py`
3. Mở Inspector trong browser
4. Test tool: điền parameters → Execute
5. Xem output → debug nếu cần
6. Sửa code → refresh → test lại
```

## 🔹 Debug tips

| Vấn đề | Check |
|--------|-------|
| Tool không hiện | Kiểm tra `@mcp.tool()` decorator |
| Schema sai | Kiểm tra type hints và docstring |
| Execute lỗi | Xem terminal output (server logs) |
| Connect fail | Kiểm tra port, server đang chạy |

---

➡️ Tiếp theo: [MCP Client](04-mcp-client.md)
