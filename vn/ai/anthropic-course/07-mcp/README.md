# Model Context Protocol (MCP) — Deep Dive

> 🔗 Khóa chính thức: [Introduction to MCP](https://anthropic.skilljar.com/introduction-to-model-context-protocol) + [MCP: Advanced Topics](https://anthropic.skilljar.com/model-context-protocol-advanced-topics)
> 📌 Level: Intermediate → Advanced | Dành cho Developer | Miễn phí

---

## 📖 Giới thiệu

MCP là **giao thức chuẩn mở** để kết nối AI models với external services. Thay vì viết integration code riêng cho từng tool, bạn build **MCP servers** chuẩn hóa — rồi bất kỳ MCP client nào (Claude, IDEs, apps) đều kết nối được. Tương tự cách USB chuẩn hóa kết nối phần cứng.

---

## 🎯 Sau khóa học, bạn sẽ biết

- Kiến trúc MCP: host, client, server, transport
- 3 primitives: Tools, Resources, Prompts
- Build MCP server bằng Python SDK
- Test với MCP Inspector
- Implement MCP client kết nối Claude API
- Resources: static URIs, templates, MIME types
- Prompts: pre-crafted templates
- Advanced: remote servers, auth, streaming

---

## 📚 Nội dung

| Bài | Tiêu đề |
|-----|---------|
| 1 | [MCP là gì?](01-mcp-la-gi.md) |
| 2 | [Xây MCP Server](02-xay-mcp-server.md) |
| 3 | [MCP Inspector](03-server-inspector.md) |
| 4 | [MCP Client](04-mcp-client.md) |
| 5 | [Resources](05-resources.md) |
| 6 | [Prompts & Advanced](06-prompts.md) |
