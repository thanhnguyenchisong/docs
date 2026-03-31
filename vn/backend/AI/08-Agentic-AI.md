# Bài 8: Agentic AI

## Mục lục
- [1. Agentic AI là gì?](#1-agentic-ai-là-gì)
- [2. Agent Architecture](#2-agent-architecture)
- [3. Tool Use & Function Calling](#3-tool-use--function-calling)
- [4. Model Context Protocol (MCP)](#4-model-context-protocol-mcp)
- [5. Multi-Agent Systems](#5-multi-agent-systems)
- [6. Orchestration Frameworks](#6-orchestration-frameworks)
- [7. State Management & Memory](#7-state-management--memory)
- [8. Human-in-the-Loop (HITL)](#8-human-in-the-loop-hitl)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Agentic AI là gì?

### 1.1 Từ Chatbot đến Agent

```
Evolution:
2022: Chatbot — hỏi/đáp, stateless
2023: Assistant — context window, memory cơ bản
2024: Tool-using AI — search, code execution
2025: Agents — autonomous reasoning + acting
2026: Multi-Agent Systems — orchestrated agent teams

AI Agent = LLM + Reasoning + Tool Use + Memory + Planning

Chatbot:
  User: "What's the weather?"
  Bot:  "I don't have access to real-time weather data."
  → PASSIVE, limited to training data

Agent:
  User: "What's the weather in Hanoi?"
  Agent: (Think) I need real-time weather data
         (Act) Call weather_api("Hanoi")
         (Observe) Result: 28°C, sunny
         (Think) I have the answer
         (Respond) "Hanoi: 28°C, sunny."
  → ACTIVE, uses tools, reasons about actions
```

### 1.2 Agent Properties

```
5 đặc điểm của AI Agent:

1. AUTONOMY — Tự quyết định hành động
   Không cần human guide mỗi bước

2. REASONING — Suy luận, phân tích
   Break complex problems into sub-tasks
   Chain-of-Thought, planning

3. TOOL USE — Sử dụng công cụ
   APIs, databases, file system, web search
   Code execution, calculators

4. MEMORY — Nhớ context
   Short-term: conversation history
   Long-term: persistent knowledge store

5. REFLECTION — Tự đánh giá, sửa lỗi
   "Output này có đúng không?"
   "Tôi cần thử approach khác"
```

---

## 2. Agent Architecture

### 2.1 The Agent Loop — Think → Act → Observe

```
┌─────────────────────────────────────────────┐
│              THE AGENT LOOP                  │
│                                              │
│   ┌──────────┐                               │
│   │   USER    │                               │
│   │  QUERY    │                               │
│   └────┬─────┘                               │
│        ▼                                      │
│   ┌──────────┐     ┌────────────┐            │
│   │  THINK   │────→│    ACT     │            │
│   │ (Reason) │     │ (Use Tool) │            │
│   └────▲─────┘     └─────┬──────┘            │
│        │                  │                   │
│        │           ┌──────▼──────┐            │
│        └───────────│  OBSERVE    │            │
│                    │ (Get Result)│            │
│                    └──────┬──────┘            │
│                           │                   │
│                    ┌──────▼──────┐            │
│                    │  DONE?      │            │
│                    │  Yes → REPLY│            │
│                    │  No → LOOP  │            │
│                    └─────────────┘            │
└─────────────────────────────────────────────┘
```

### 2.2 ReAct Pattern Implementation

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for current information",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_python",
            "description": "Execute Python code and return result",
            "parameters": {
                "type": "object",
                "properties": {
                    "code": {"type": "string", "description": "Python code"}
                },
                "required": ["code"]
            }
        }
    }
]

def agent_loop(user_query: str, max_iterations: int = 10):
    messages = [
        {"role": "system", "content": """You are a helpful AI assistant with access to tools.
        Think step by step. Use tools when needed. 
        If a tool result is insufficient, try a different approach."""},
        {"role": "user", "content": user_query}
    ]
    
    for i in range(max_iterations):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        messages.append(message)
        
        # No tool calls → agent is done
        if not message.tool_calls:
            return message.content
        
        # Execute tool calls
        for tool_call in message.tool_calls:
            func_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            
            # Execute tool
            result = execute_tool(func_name, args)
            
            # Add result to conversation
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            })
    
    return "Max iterations reached"
```

---

## 3. Tool Use & Function Calling

### 3.1 Common Tools cho Agent

```
Agent Tools — Các công cụ phổ biến:

Information Retrieval:
├── Web Search (Google, Bing, Tavily)
├── RAG Search (vector database queries)
├── Database Query (SQL, MongoDB)
├── Document Reading (PDF, DOCX parsing)
└── API Calls (REST, GraphQL)

Computation:
├── Code Execution (Python sandbox)
├── Calculator
├── Data Analysis (pandas operations)
└── Chart Generation (matplotlib, plotly)

Communication:
├── Email Sending
├── Slack Messaging
├── Calendar Management
└── Ticket Creation (Jira, ServiceNow)

File Operations:
├── File Read/Write
├── Image Generation (DALL-E, FLUX)
├── Document Generation (PDF, DOCX)
└── Spreadsheet Operations

⚠️ SECURITY: Mỗi tool cần:
├── Input validation
├── Rate limiting  
├── Permission checks
├── Sandboxing (đặc biệt code execution)
└── Audit logging
```

### 3.2 Parallel vs Sequential Tool Calls

```python
# Parallel Tool Calls — Model gọi nhiều tools cùng lúc
# User: "What's the weather in Hanoi and HCMC?"

# Model response:
# tool_calls: [
#   {"name": "get_weather", "args": {"city": "Hanoi"}},
#   {"name": "get_weather", "args": {"city": "HCMC"}}
# ]

# → Execute BOTH in parallel → faster!

import asyncio

async def execute_tools_parallel(tool_calls):
    tasks = []
    for call in tool_calls:
        task = asyncio.create_task(
            execute_tool_async(call.function.name, call.function.arguments)
        )
        tasks.append((call.id, task))
    
    results = []
    for call_id, task in tasks:
        result = await task
        results.append({"tool_call_id": call_id, "content": str(result)})
    
    return results
```

---

## 4. Model Context Protocol (MCP)

### 4.1 MCP là gì?

```
MCP = "USB-C for AI" — Universal standard kết nối AI với tools

Trước MCP:
├── Mỗi AI tool cần custom integration
├── N AI apps × M tools = N×M integrations  
├── Code duplication, inconsistent interfaces
└── Mỗi app triển khai tool calling khác nhau

Với MCP:
├── 1 standard protocol cho mọi tool connection
├── N AI apps + M MCP servers = N+M implementations
├── Plug-and-play: bất kỳ MCP client ↔ MCP server
└── Đã được hỗ trợ bởi: Claude, Cursor, VS Code, Zed, ...

Architecture:
┌──────────┐    MCP     ┌──────────────┐    ┌─────────┐
│ AI App   │◄──────────►│  MCP Server  │───►│ Service │
│ (Client) │  Protocol  │  (Adapter)   │    │ (API,DB)│
│ Claude   │            │              │    │         │
│ Cursor   │            │  - Tools     │    │ GitHub  │
│ Your App │            │  - Resources │    │ Slack   │
└──────────┘            │  - Prompts   │    │ SQL DB  │
                        └──────────────┘    └─────────┘
```

### 4.2 MCP Components

```
MCP Server cung cấp 3 loại capabilities:

1. TOOLS — Functions agent có thể gọi
   {
     "name": "create_issue",
     "description": "Create a GitHub issue",
     "inputSchema": {"title": "string", "body": "string"}
   }

2. RESOURCES — Data sources agent có thể đọc
   - Danh sách files
   - Database tables  
   - API endpoints
   - Configuration

3. PROMPTS — Prompt templates
   - Reusable prompt/instruction templates
   - Parameterized prompts

Popular MCP Servers (2026):
├── Filesystem — read/write local files
├── GitHub — issues, PRs, repos
├── Slack — messages, channels
├── PostgreSQL — query databases
├── Google Drive — documents
├── Brave Search — web search
├── Docker — container management
└── Kubernetes — cluster management
```

### 4.3 Code — MCP Server (TypeScript)

```typescript
// Simple MCP Server Example
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({
  name: "todo-server",
  version: "1.0.0",
}, {
  capabilities: { tools: {} }
});

// Define tool
server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "add_todo",
    description: "Add a new todo item",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Todo title" },
        priority: { type: "string", enum: ["low", "medium", "high"] }
      },
      required: ["title"]
    }
  }]
}));

// Handle tool call
server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "add_todo") {
    const { title, priority } = request.params.arguments;
    // ... save to database ...
    return { content: [{ type: "text", text: `Added: ${title} (${priority})` }] };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 5. Multi-Agent Systems

### 5.1 Tại sao Multi-Agent?

```
Single Agent:
├── 1 LLM làm MỌI THỨ
├── ✅ Đơn giản
├── ❌ Context window bloated
├── ❌ Khó specialize  
└── ❌ Long tasks → lost focus

Multi-Agent:
├── Nhiều agents CHUYÊN BIỆT phối hợp
├── ✅ Mỗi agent focus 1 domain
├── ✅ Parallel execution
├── ✅ Better quality (specialized prompts)
└── ✅ Scalable

Ví dụ — Software Development Team:
┌─────────────────────────────────────────────┐
│            ORCHESTRATOR AGENT                │
│      (Plan, delegate, coordinate)            │
├──────────┬──────────┬──────────┬────────────┤
│ Researcher│ Developer│ Reviewer │ Tester    │
│ Agent     │ Agent    │ Agent    │ Agent     │
│           │          │          │           │
│ Search    │ Write    │ Code     │ Write     │
│ docs,     │ code,    │ review,  │ tests,    │
│ APIs      │ debug    │ security │ run tests │
└──────────┴──────────┴──────────┴────────────┘
```

### 5.2 Multi-Agent Patterns

```
1. Hierarchical (Manager-Worker)
   Manager → assigns tasks → Workers → report back
   ✅ Clear responsibility, controlled
   ❌ Single point of failure (manager)

2. Collaborative (Peer-to-Peer)  
   Agents communicate directly, negotiate
   ✅ Flexible, no bottleneck
   ❌ Complex coordination

3. Pipeline (Sequential)
   Agent A → output → Agent B → output → Agent C
   ✅ Simple, predictable
   ❌ Slow (sequential)

4. Debate / Critique
   Agent A proposes → Agent B critiques → Agent A revises
   ✅ Higher quality output
   ❌ Expensive (multiple LLM calls)
```

---

## 6. Orchestration Frameworks

### 6.1 Framework Comparison 2026

| Framework | Strengths | Best For |
|-----------|-----------|----------|
| **LangGraph** | State machines, cycles, human-in-loop | Complex workflows |
| **CrewAI** | Role-based agents, easy setup | Multi-agent teams |
| **AutoGen** | Code execution, multi-agent chat | Code-heavy tasks |
| **LlamaIndex Workflows** | Data-centric, RAG + agents | Data processing |
| **Semantic Kernel** | Enterprise, .NET/Python | Microsoft stack |
| **Haystack** | Pipelines, search + QA | Search-focused |

### 6.2 Code — LangGraph Agent

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_action: str

llm = ChatOpenAI(model="gpt-4o")

# Define nodes
def researcher(state: AgentState):
    # Research task
    response = llm.invoke(state["messages"] + [
        {"role": "system", "content": "You are a researcher. Find relevant information."}
    ])
    return {"messages": [response], "next_action": "writer"}

def writer(state: AgentState):
    # Write based on research
    response = llm.invoke(state["messages"] + [
        {"role": "system", "content": "You are a writer. Create content based on research."}
    ])
    return {"messages": [response], "next_action": "reviewer"}

def reviewer(state: AgentState):
    # Review and decide
    response = llm.invoke(state["messages"] + [
        {"role": "system", "content": "Review the content. Reply APPROVED or REVISION_NEEDED."}
    ])
    content = response.content
    next_action = "end" if "APPROVED" in content else "writer"
    return {"messages": [response], "next_action": next_action}

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("researcher", researcher)
workflow.add_node("writer", writer)
workflow.add_node("reviewer", reviewer)

workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "writer")
workflow.add_edge("writer", "reviewer")
workflow.add_conditional_edges("reviewer", 
    lambda state: state["next_action"],
    {"writer": "writer", "end": END}
)

app = workflow.compile()
result = app.invoke({"messages": [{"role": "user", "content": "Write about AI trends 2026"}]})
```

---

## 7. State Management & Memory

### 7.1 Memory Types

```
Agent Memory System:

1. Short-term Memory (Working Memory)
   ├── Conversation history trong context window
   ├── Tự động theo messages
   ├── Limited by context window size
   └── Reset mỗi session mới

2. Long-term Memory (Persistent)
   ├── Vector database storing past interactions
   ├── Key facts, preferences, decisions
   ├── Persist across sessions
   └── Retrieve relevant memories per query

3. Episodic Memory
   ├── Specific past events/conversations
   ├── "Lần trước user hỏi về X, tôi trả lời Y"
   └── Giúp consistency across sessions

4. Procedural Memory
   ├── Learned skills, patterns
   ├── "Khi user yêu cầu deploy, follow these steps..."
   └── Tool usage patterns
```

### 7.2 Memory Implementation

```python
from langchain.memory import ConversationSummaryBufferMemory
from langchain_community.vectorstores import Chroma

# Short-term: Summary Buffer
# Giữ recent messages + summarize cũ hơn
memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,
    return_messages=True
)

# Long-term: Vector Store Memory
class LongTermMemory:
    def __init__(self):
        self.vectordb = Chroma(
            collection_name="agent_memory",
            embedding_function=embeddings
        )
    
    def store(self, text: str, metadata: dict):
        self.vectordb.add_texts([text], metadatas=[metadata])
    
    def recall(self, query: str, k: int = 5) -> list:
        results = self.vectordb.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

# Usage trong agent
long_memory = LongTermMemory()

# Store important info
long_memory.store(
    "User prefers Python over Java for backend",
    {"type": "preference", "timestamp": "2026-03-31"}
)

# Recall when relevant
memories = long_memory.recall("What language should I use?")
# → ["User prefers Python over Java for backend"]
```

---

## 8. Human-in-the-Loop (HITL)

### 8.1 Khi nào cần HITL?

```
HITL: Human xác nhận trước khi agent thực hiện

CẦN HITL khi:
├── Hành động KHÔNG thể undo (delete data, send email)
├── Financial transactions
├── Access sensitive systems
├── Content publishing
├── Hành động ảnh hưởng nhiều người
└── Compliance requirements

KHÔNG CẦN HITL khi:
├── Read-only operations (search, query)
├── Low-risk actions (create draft)
├── Analysis/reporting
└── Internal calculations
```

### 8.2 HITL Patterns

```
Pattern 1: APPROVAL GATE
  Agent → propose action → HUMAN APPROVE → execute
  "Tôi sẽ gửi email này cho 500 customers. Approve?"

Pattern 2: CONFIDENCE THRESHOLD
  confidence > 0.9 → auto-execute
  confidence 0.5-0.9 → human review
  confidence < 0.5 → human decide

Pattern 3: ESCALATION
  Agent handles routine → escalate complex to human
  "Tôi không chắc chắn về yêu cầu refund $10,000. Chuyển cho manager."

Pattern 4: COLLABORATIVE
  Agent draft → human edit → agent finalize
  Agent: "Draft email: ..." → Human edits → Agent sends
```

---

## FAQ & Best Practices

### Q1: Agent hay RAG cho use case của tôi?
**A:**
```
Dùng RAG khi:
├── Q&A trên documents
├── Knowledge base search
└── Simple information retrieval

Dùng Agent khi:
├── Cần thực hiện actions (create, update, delete)
├── Multi-step tasks
├── Cần reasoning + multiple tools
├── Dynamic workflows
└── Integration với external systems
```

### Q2: Agent framework nào chọn 2026?
**A:**
```
Simple agents (1-2 tools): Raw API Function Calling
Medium complexity: LangGraph hoặc CrewAI
Enterprise/Production: LangGraph + LangSmith monitoring
Microsoft ecosystem: Semantic Kernel
Data-heavy: LlamaIndex
```

### Best Practices

1. **Start simple** — 1 agent + few tools trước multi-agent
2. **Limit iterations** — set max_iterations tránh infinite loops
3. **Structured tools** — clear descriptions, input schemas
4. **Error handling** — graceful failures, retry logic
5. **HITL for risky actions** — never auto-execute dangerous operations
6. **Monitor & log** — every agent step, tool call, reasoning
7. **Cost awareness** — mỗi iteration = LLM call = cost
8. **Security** — sandbox tool execution, validate inputs

---

## Bài tập thực hành

### Bài 1: Simple Agent
1. Build agent với 3 tools: web search, calculator, code executor
2. Test với complex queries cần multiple tool calls
3. Add error handling và retry logic

### Bài 2: MCP Server
1. Build MCP server cho todo list (CRUD operations)
2. Connect với Claude Desktop
3. Test agent sử dụng todo MCP tools

### Bài 3: Multi-Agent System
1. Build 3-agent system: Researcher → Writer → Reviewer
2. Implement approval/revision cycle
3. Add human-in-the-loop cho final approval

---

**Tiếp theo:** [Bài 9: Generative AI →](./09-Generative-AI.md)
