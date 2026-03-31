# Bài 4: Technology Stack & Frameworks

## Mục lục
- [1. Framework Landscape](#1-framework-landscape)
- [2. LangChain — Building Blocks](#2-langchain--building-blocks)
- [3. LangGraph — Graph Orchestration](#3-langgraph--graph-orchestration)
- [4. CrewAI — Role-based Teams](#4-crewai--role-based-teams)
- [5. AutoGen — Conversational Agents](#5-autogen--conversational-agents)
- [6. OpenAI Swarm — Lightweight](#6-openai-swarm--lightweight)
- [7. So sánh & Khi nào dùng](#7-so-sánh--khi-nào-dùng)
- [8. LLM Providers](#8-llm-providers)
- [9. Supporting Tools](#9-supporting-tools)

---

## 1. Framework Landscape

### 1.1 Multi-Agent Framework Ecosystem (2025-2026)

```
Multi-Agent Frameworks:

┌─────────────────────────────────────────────────────────┐
│                  PRODUCTION-READY                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  LangGraph   │  │   CrewAI     │  │   AutoGen    │  │
│  │  (LangChain) │  │  (Community) │  │ (Microsoft)  │  │
│  │              │  │              │  │              │  │
│  │ Graph-based  │  │ Role-based   │  │Conversational│  │
│  │ orchestration│  │ agent crews  │  │ multi-agent  │  │
│  │              │  │              │  │              │  │
│  │ ⭐⭐⭐⭐⭐  │  │ ⭐⭐⭐⭐    │  │ ⭐⭐⭐⭐    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                  EMERGING / SPECIALIZED                   │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ OpenAI Swarm │  │ Semantic     │  │  Magentic-   │  │
│  │ (Lightweight)│  │ Kernel (MS)  │  │  One (MS)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
├─────────────────────────────────────────────────────────┤
│                  RESEARCH / ACADEMIC                     │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   ChatDev    │  │   MetaGPT    │  │   CAMEL      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. LangChain — Building Blocks

### 2.1 LangChain Overview

```
LangChain = Foundation framework cho LLM applications

Components:
├── LLMs / Chat Models → Connect OpenAI, Anthropic, Gemini
├── Prompts            → Template management
├── Chains             → LLM + Prompt + Output parsing
├── Tools              → External tool integration
├── Agents             → Single-agent with tools
├── Memory             → Conversation history
├── Retrievers         → RAG (document retrieval)
└── Output Parsers     → Structured output

LangChain KHÔNG phải multi-agent framework
→ LangGraph (built on LangChain) MỚI là multi-agent
```

### 2.2 LangChain Core Code

```python
# LangChain basics — Foundation for multi-agent

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_tool_calling_agent

# 1. LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# 2. Custom Tools
@tool
def search_codebase(query: str) -> str:
    """Search the codebase for matching code patterns"""
    # Implementation
    return f"Found 3 matches for '{query}'..."

@tool
def run_tests(test_path: str) -> str:
    """Run test suite and return results"""
    # Implementation
    return "12 tests passed, 0 failed"

@tool
def create_file(path: str, content: str) -> str:
    """Create a new file with the given content"""
    # Implementation
    return f"File created: {path}"

# 3. Agent Prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are DevBot, a Senior Developer.
    Use tools to complete coding tasks.
    Always write tests for your code."""),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}")
])

# 4. Create Agent
tools = [search_codebase, run_tests, create_file]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# 5. Run
result = agent_executor.invoke({
    "input": "Create a login API endpoint with JWT authentication"
})
```

---

## 3. LangGraph — Graph Orchestration

### 3.1 Overview

> **LangGraph** = Multi-agent orchestration framework built on LangChain. Sử dụng **directed graphs** để define agent workflow. **Recommended choice** cho production multi-agent systems.

```
LangGraph Key Features:
├── Graph-based workflow  → Nodes = agents, Edges = transitions
├── Conditional routing   → Dynamic flow based on state
├── Cycles support        → Agent loops (unlike DAG-only)
├── State management      → Typed state shared across nodes
├── Checkpointing         → Save/resume execution
├── Human-in-the-loop     → Interrupt for human approval
├── Streaming             → Real-time output streaming
├── Persistence           → PostgreSQL, Redis, etc.
├── Subgraphs             → Nested graphs (teams within teams)
└── LangSmith integration → Full observability
```

### 3.2 LangGraph Multi-Agent Example

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

# ═══════════════════════════════════════
# 1. Define State
# ═══════════════════════════════════════
class ITCompanyState(TypedDict):
    task: str
    plan: str
    code: str
    tests: str
    review: str
    deploy_status: str
    next_action: str
    iteration: int
    messages: list[dict]

# ═══════════════════════════════════════
# 2. Define Agents (Graph Nodes)
# ═══════════════════════════════════════
llm = ChatOpenAI(model="gpt-4o")

def pm_agent(state: ITCompanyState) -> dict:
    """PM Agent: Analyze task, create plan"""
    response = llm.invoke([
        {"role": "system", "content": "You are a PM. Create a detailed dev plan."},
        {"role": "user", "content": f"Task: {state['task']}"}
    ])
    return {
        "plan": response.content,
        "next_action": "develop",
        "messages": [{"from": "pm", "content": response.content}]
    }

def dev_agent(state: ITCompanyState) -> dict:
    """Dev Agent: Write code based on plan"""
    response = llm.invoke([
        {"role": "system", "content": "You are a Senior Developer. Write clean code."},
        {"role": "user", "content": f"Plan:\n{state['plan']}\n\nWrite the implementation."}
    ])
    return {
        "code": response.content,
        "next_action": "review",
        "messages": [{"from": "dev", "content": "Code completed"}]
    }

def qa_agent(state: ITCompanyState) -> dict:
    """QA Agent: Review code, write tests"""
    response = llm.invoke([
        {"role": "system", "content": "You are a QA Engineer. Review code and report issues."},
        {"role": "user", "content": f"Review this code:\n{state['code']}"}
    ])
    
    passed = "PASS" in response.content.upper() or "APPROVED" in response.content.upper()
    return {
        "review": response.content,
        "next_action": "deploy" if passed else "fix",
        "messages": [{"from": "qa", "content": response.content}]
    }

def devops_agent(state: ITCompanyState) -> dict:
    """DevOps Agent: Deploy code"""
    return {
        "deploy_status": "deployed_successfully",
        "next_action": "done",
        "messages": [{"from": "devops", "content": "Deployed to production ✅"}]
    }

# ═══════════════════════════════════════
# 3. Define Routing (Conditional Edges)
# ═══════════════════════════════════════
def route_after_review(state: ITCompanyState) -> str:
    if state.get("next_action") == "deploy":
        return "devops_agent"
    elif state.get("iteration", 0) > 3:
        return "devops_agent"  # Force deploy after 3 iterations
    else:
        return "dev_agent"     # Send back to fix

# ═══════════════════════════════════════
# 4. Build Graph
# ═══════════════════════════════════════
workflow = StateGraph(ITCompanyState)

# Add nodes
workflow.add_node("pm_agent", pm_agent)
workflow.add_node("dev_agent", dev_agent)
workflow.add_node("qa_agent", qa_agent)
workflow.add_node("devops_agent", devops_agent)

# Add edges
workflow.add_edge(START, "pm_agent")
workflow.add_edge("pm_agent", "dev_agent")
workflow.add_edge("dev_agent", "qa_agent")
workflow.add_conditional_edges(
    "qa_agent",
    route_after_review,
    {"devops_agent": "devops_agent", "dev_agent": "dev_agent"}
)
workflow.add_edge("devops_agent", END)

# Compile
app = workflow.compile()

# ═══════════════════════════════════════
# 5. Run
# ═══════════════════════════════════════
result = app.invoke({
    "task": "Build a REST API for user management with CRUD operations",
    "iteration": 0,
    "messages": []
})
```

### 3.3 LangGraph Subgraphs (Teams)

```python
# Subgraphs = Teams within the company

# Backend Team subgraph
backend_team = StateGraph(TeamState)
backend_team.add_node("backend_dev", backend_dev_agent)
backend_team.add_node("backend_qa", backend_qa_agent)
backend_team.add_edge(START, "backend_dev")
backend_team.add_edge("backend_dev", "backend_qa")
backend_team.add_edge("backend_qa", END)

# Frontend Team subgraph
frontend_team = StateGraph(TeamState)
frontend_team.add_node("frontend_dev", frontend_dev_agent)
frontend_team.add_node("frontend_qa", frontend_qa_agent)
frontend_team.add_edge(START, "frontend_dev")
frontend_team.add_edge("frontend_dev", "frontend_qa")
frontend_team.add_edge("frontend_qa", END)

# Main Company graph
company = StateGraph(CompanyState)
company.add_node("pm", pm_agent)
company.add_node("backend_team", backend_team.compile())    # Subgraph!
company.add_node("frontend_team", frontend_team.compile())  # Subgraph!
company.add_node("devops", devops_agent)

company.add_edge(START, "pm")
company.add_edge("pm", "backend_team")   # PM routes to teams
company.add_edge("pm", "frontend_team")  # Parallel teams!
company.add_edge("backend_team", "devops")
company.add_edge("frontend_team", "devops")
company.add_edge("devops", END)
```

---

## 4. CrewAI — Role-based Teams

### 4.1 Overview

> **CrewAI** = Framework cho phép tạo **role-playing AI agent teams**. Mỗi agent có role, goal, và backstory rõ ràng. Dễ setup, intuitive API.

### 4.2 CrewAI Core Concepts

```python
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, FileReadTool

# ═══════════════════════════════════════
# 1. Define Agents with Roles
# ═══════════════════════════════════════
pm_agent = Agent(
    role="Project Manager",
    goal="Break down requirements into clear, actionable dev tasks",
    backstory="""You are an experienced PM with 10 years in agile 
    software development. You excel at creating detailed user stories 
    and acceptance criteria.""",
    tools=[SerperDevTool()],
    llm="gpt-4o",
    verbose=True,
    allow_delegation=True  # Can delegate to other agents
)

dev_agent = Agent(
    role="Senior Software Developer",
    goal="Write clean, tested, production-quality code",
    backstory="""You are a senior dev with expertise in Python, FastAPI, 
    and PostgreSQL. You follow SOLID principles and always write tests.""",
    tools=[FileReadTool()],
    llm="gpt-4o",
    verbose=True
)

qa_agent = Agent(
    role="QA Engineer",
    goal="Ensure code quality through thorough testing and review",
    backstory="""You are a meticulous QA engineer who never lets bugs 
    slip through. You write comprehensive test suites.""",
    tools=[],
    llm="gpt-4o",
    verbose=True
)

# ═══════════════════════════════════════
# 2. Define Tasks
# ═══════════════════════════════════════
planning_task = Task(
    description="Analyze the requirement and create a detailed development plan: {requirement}",
    expected_output="A detailed plan with tasks, subtasks, and acceptance criteria",
    agent=pm_agent
)

coding_task = Task(
    description="Implement the code based on the plan from the PM",
    expected_output="Production-ready code with inline documentation",
    agent=dev_agent,
    context=[planning_task]  # Input from planning_task
)

testing_task = Task(
    description="Review the code and write comprehensive tests",
    expected_output="Test results report with pass/fail status and coverage",
    agent=qa_agent,
    context=[coding_task]  # Input from coding_task
)

# ═══════════════════════════════════════
# 3. Create Crew & Run
# ═══════════════════════════════════════
crew = Crew(
    agents=[pm_agent, dev_agent, qa_agent],
    tasks=[planning_task, coding_task, testing_task],
    process=Process.sequential,  # sequential or hierarchical
    verbose=True
)

result = crew.kickoff(inputs={
    "requirement": "Build a user authentication API with JWT, refresh tokens, and rate limiting"
})
```

### 4.3 CrewAI Hierarchical Process

```python
# Hierarchical Process — Manager coordinates agents

crew = Crew(
    agents=[pm_agent, dev_agent, qa_agent, devops_agent],
    tasks=[planning_task, coding_task, testing_task, deploy_task],
    process=Process.hierarchical,
    manager_llm="gpt-4o",  # Manager agent auto-created
    manager_agent=None,     # Or provide custom manager
    verbose=True
)

# Manager agent sẽ:
# 1. Nhận tất cả tasks
# 2. Quyết định agent nào handle task nào
# 3. Coordinate giữa các agents
# 4. Compile final result
```

---

## 5. AutoGen — Conversational Agents

### 5.1 Overview

> **AutoGen** (Microsoft) = Framework cho multi-agent **conversations**. Agents chat với nhau để solve problems. Natural conversation flow.

### 5.2 AutoGen Example

```python
from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# ═══════════════════════════════════════
# Define Agents
# ═══════════════════════════════════════
pm = AssistantAgent(
    name="PM",
    system_message="You are a Project Manager. Break down tasks and assign work.",
    llm_config={"model": "gpt-4o"}
)

developer = AssistantAgent(
    name="Developer",
    system_message="You are a Senior Developer. Write code and explain solutions.",
    llm_config={"model": "gpt-4o"}
)

qa = AssistantAgent(
    name="QA",
    system_message="You are a QA Engineer. Review code and find issues.",
    llm_config={"model": "gpt-4o"}
)

human = UserProxyAgent(
    name="Human",
    human_input_mode="TERMINATE",  # Human can terminate
    code_execution_config={"work_dir": "workspace"}
)

# ═══════════════════════════════════════
# Group Chat — Agents talk to each other
# ═══════════════════════════════════════
group_chat = GroupChat(
    agents=[human, pm, developer, qa],
    messages=[],
    max_round=20
)

manager = GroupChatManager(
    groupchat=group_chat,
    llm_config={"model": "gpt-4o"}
)

# Start conversation
human.initiate_chat(
    manager,
    message="Build a REST API for managing a todo list with CRUD operations"
)

# Agents will naturally take turns:
# PM: "Let me break this down into tasks..."
# Developer: "I'll start with the data model..."
# QA: "I see potential issues with..."
# Developer: "Good catch, let me fix..."
```

---

## 6. OpenAI Swarm — Lightweight

### 6.1 Overview

> **Swarm** = OpenAI's lightweight multi-agent framework. Focused on simplicity. Agents + handoffs between agents. Minimal overhead.

```python
from swarm import Swarm, Agent

client = Swarm()

# Define agents
pm_agent = Agent(
    name="PM Agent",
    instructions="You are a PM. Break down tasks. Hand off coding to Dev Agent.",
    functions=[handoff_to_dev]  # Function to transfer control
)

dev_agent = Agent(
    name="Dev Agent",
    instructions="You are a developer. Write code. Hand off testing to QA.",
    functions=[write_code, handoff_to_qa]
)

qa_agent = Agent(
    name="QA Agent",
    instructions="You are QA. Test code. If pass, confirm. If fail, hand back to Dev.",
    functions=[run_tests, handoff_to_dev]
)

# Handoff functions
def handoff_to_dev():
    return dev_agent

def handoff_to_qa():
    return qa_agent

# Run
response = client.run(
    agent=pm_agent,
    messages=[{"role": "user", "content": "Build a login API"}]
)
```

---

## 7. So sánh & Khi nào dùng

### 7.1 Framework Comparison

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│              │ LangGraph│ CrewAI   │ AutoGen  │ Swarm    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Complexity   │ Medium   │ Low      │ Medium   │ Low      │
│ Flexibility  │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐   │ ⭐⭐⭐⭐ │ ⭐⭐     │
│ Control      │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐   │ ⭐⭐⭐   │ ⭐⭐⭐   │
│ Production   │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐ │ ⭐⭐⭐⭐ │ ⭐⭐     │
│ Learning     │ Steep    │ Easy     │ Medium   │ Easy     │
│ Multi-agent  │ Graph    │ Crew/Role│ Chat     │ Handoff  │
│ Observability│ LangSmith│ Basic    │ Basic    │ Minimal  │
│ State Mgmt   │ Built-in │ Basic    │ Messages │ Minimal  │
│ HITL         │ Built-in │ Limited  │ Built-in │ Limited  │
│ Persistence  │ Built-in │ Limited  │ Limited  │ None     │
│ Best for     │ Complex  │ Quick    │ Research │ Simple   │
│              │ produc-  │ MVP,     │ conver-  │ proto-   │
│              │ tion     │ POC      │ sational │ types    │
└──────────────┴──────────┴──────────┴──────────┴──────────┘
```

### 7.2 Decision Guide

```
Chọn framework nào?

1. "Tôi cần build production system phức tạp"
   → LangGraph ✅

2. "Tôi muốn quick prototype/POC"
   → CrewAI ✅ hoặc Swarm ✅

3. "Agents cần chat tự nhiên với nhau"
   → AutoGen ✅

4. "Tôi cần enterprise-grade với Microsoft stack"
   → Semantic Kernel + AutoGen ✅

5. "Tôi cần full control over agent flow"
   → LangGraph ✅

6. "Team mới học AI, cần framework dễ"
   → CrewAI ✅

Recommendation cho IT Company Agent:
→ CHÍNH: LangGraph (complex, production-ready)
→ PHỤ: CrewAI (quick POC, role-based tasks)
```

---

## 8. LLM Providers

### 8.1 Comparison

```
LLM Providers cho Agents:

┌──────────────┬─────────┬──────────┬──────────┬────────┐
│ Provider     │ Model   │Quality   │ Speed    │ Cost   │
├──────────────┼─────────┼──────────┼──────────┼────────┤
│ OpenAI       │ GPT-4o  │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐ │ $$$    │
│ OpenAI       │ GPT-4o  │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐⭐│ $$     │
│              │ mini    │          │          │        │
│ Anthropic    │Claude   │ ⭐⭐⭐⭐⭐│ ⭐⭐⭐⭐ │ $$$    │
│              │ 3.5     │          │          │        │
│ Google       │Gemini   │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐ │ $$     │
│              │ 2.0     │          │          │        │
│ Deepseek     │V3      │ ⭐⭐⭐⭐  │ ⭐⭐⭐⭐ │ $      │
│ Local        │Llama 3 │ ⭐⭐⭐    │ ⭐⭐⭐   │ Free   │
│ (Ollama)     │Mistral  │          │          │ (GPU)  │
└──────────────┴─────────┴──────────┴──────────┴────────┘

Strategy cho IT Company:
├── "Brain" agents (PM, Architect): GPT-4o / Claude 3.5
├── "Worker" agents (simple tasks): GPT-4o-mini / Gemini Flash
├── "Review" agents: GPT-4o (need high quality)
└── Development/testing: Local models (cost saving)
```

---

## 9. Supporting Tools

### 9.1 Full Technology Stack

```
Complete Tech Stack cho IT Company Agent:

CORE:
├── Language:  Python 3.11+
├── Framework: LangGraph + LangChain
├── LLM:       OpenAI GPT-4o / Anthropic Claude
└── Alt:       CrewAI (for simpler workflows)

MEMORY & STATE:
├── Vector DB:    Pinecone / Chroma / Weaviate
├── State Store:  Redis / PostgreSQL
├── File Storage: S3 / MinIO
└── Cache:        Redis

TOOLS:
├── Code Exec:   Docker sandbox / E2B
├── Web Search:  Tavily / Serper
├── Browser:     Playwright / Selenium
├── Git:         GitPython / GitHub API
└── Comms:       Slack API / Email SMTP

OBSERVABILITY:
├── Tracing:     LangSmith / Langfuse
├── Logging:     Loguru / structlog
├── Monitoring:  Prometheus + Grafana
└── Alerting:    PagerDuty / Slack

DEPLOYMENT:
├── Container:   Docker + Docker Compose
├── Orchestration: Kubernetes (if scaling)
├── CI/CD:       GitHub Actions
├── IaC:         Terraform
└── Cloud:       AWS / GCP / Azure
```

---

**Tiếp theo:** [Bài 5: Memory, State & Knowledge →](./05-Memory-State-Knowledge.md)
