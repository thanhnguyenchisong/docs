# Bài 7: Implementation Guide — LangGraph

## Mục lục
- [1. Project Setup](#1-project-setup)
- [2. Define State](#2-define-state)
- [3. Build Agent Nodes](#3-build-agent-nodes)
- [4. Define Tools](#4-define-tools)
- [5. Build the Graph](#5-build-the-graph)
- [6. Add Human-in-the-Loop](#6-add-human-in-the-loop)
- [7. Subgraphs (Teams)](#7-subgraphs-teams)
- [8. Full IT Company Example](#8-full-it-company-example)
- [9. Testing & Observability](#9-testing--observability)

---

## 1. Project Setup

### 1.1 Installation

```bash
# Create project
mkdir it-company-agent && cd it-company-agent
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install langgraph langchain langchain-openai langchain-community
pip install chromadb redis python-dotenv pydantic
pip install langsmith  # Observability

# Project structure
mkdir -p src/{agents,tools,state,memory,config}
mkdir -p tests
touch src/__init__.py
touch .env
```

### 1.2 Configuration

```python
# .env
OPENAI_API_KEY=sk-...
LANGSMITH_API_KEY=ls-...
LANGSMITH_PROJECT=it-company-agent
LANGSMITH_TRACING_V2=true
REDIS_URL=redis://localhost:6379

# src/config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    langsmith_api_key: str = ""
    redis_url: str = "redis://localhost:6379"
    
    # LLM configuration
    primary_model: str = "gpt-4o"          # For complex reasoning
    secondary_model: str = "gpt-4o-mini"   # For simple tasks
    temperature: float = 0.1               # Low for consistency
    
    # Agent configuration
    max_iterations: int = 10
    max_retries: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 2. Define State

### 2.1 Company State

```python
# src/state/company_state.py

from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class Task(TypedDict):
    id: str
    title: str
    description: str
    assigned_to: str
    status: Literal["todo", "in_progress", "review", "done", "failed"]
    priority: Literal["P0", "P1", "P2", "P3"]
    dependencies: list[str]
    acceptance_criteria: list[str]
    result: str | None

class CompanyState(TypedDict):
    """Central state shared across all agent nodes"""
    
    # Input
    requirement: str
    
    # Messages (append-only, full conversation history)
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Task management
    tasks: list[Task]
    current_task: Task | None
    
    # Artifacts produced by agents
    artifacts: dict[str, str]    # {filename: content}
    
    # Review & QA
    review_feedback: str
    review_status: Literal["pending", "passed", "failed", "needs_changes"]
    
    # Security
    security_scan_result: str
    security_status: Literal["pending", "passed", "failed"]
    
    # Deployment
    deploy_status: Literal["not_started", "staging", "production", "failed"]
    
    # Flow control
    next_agent: str
    iteration_count: int
    error: str | None
    needs_human_approval: bool
    
    # Meta
    project_name: str
    started_at: str
    completed_at: str | None
```

---

## 3. Build Agent Nodes

### 3.1 Agent Factory

```python
# src/agents/base.py

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

def create_agent_node(name: str, system_prompt: str, model: str = "gpt-4o"):
    """Factory function to create an agent node"""
    
    llm = ChatOpenAI(model=model, temperature=0.1)
    
    def agent_node(state: CompanyState) -> dict:
        """Agent node function for LangGraph"""
        
        # Build context from state
        context_parts = []
        
        if state.get("requirement"):
            context_parts.append(f"Project Requirement: {state['requirement']}")
        
        if state.get("tasks"):
            task_summary = "\n".join([
                f"  - [{t['status']}] {t['id']}: {t['title']} → {t['assigned_to']}"
                for t in state['tasks']
            ])
            context_parts.append(f"Task Board:\n{task_summary}")
        
        if state.get("current_task"):
            task = state["current_task"]
            context_parts.append(
                f"YOUR CURRENT TASK:\n"
                f"  ID: {task['id']}\n"
                f"  Title: {task['title']}\n"
                f"  Description: {task['description']}\n"
                f"  Acceptance Criteria: {', '.join(task['acceptance_criteria'])}"
            )
        
        if state.get("artifacts"):
            artifact_list = ", ".join(state["artifacts"].keys())
            context_parts.append(f"Existing Artifacts: {artifact_list}")
        
        if state.get("review_feedback"):
            context_parts.append(f"Review Feedback: {state['review_feedback']}")
        
        context = "\n\n".join(context_parts)
        
        # Call LLM
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Current Context:\n{context}\n\nPlease proceed with your responsibilities.")
        ]
        
        response = llm.invoke(messages)
        
        return {
            "messages": [AIMessage(
                content=f"[{name}]: {response.content}",
                name=name
            )]
        }
    
    agent_node.__name__ = name  # For graph visualization
    return agent_node
```

### 3.2 Specific Agent Nodes

```python
# src/agents/pm_agent.py

from src.agents.base import create_agent_node
from src.state.company_state import CompanyState, Task
import json

PM_SYSTEM_PROMPT = """You are the Project Manager. 

When given a requirement, you must:
1. Break it down into specific, actionable tasks
2. Assign each task to the appropriate agent
3. Set priorities and dependencies
4. Define clear acceptance criteria

Output your plan as JSON:
{
    "tasks": [
        {
            "id": "TASK-001",
            "title": "task title",
            "description": "detailed description",
            "assigned_to": "backend_dev|frontend_dev|designer|qa|devops|security|docs",
            "priority": "P0|P1|P2|P3",
            "dependencies": ["TASK-xxx"],
            "acceptance_criteria": ["criterion 1", "criterion 2"]
        }
    ]
}"""

def pm_agent(state: CompanyState) -> dict:
    """PM Agent: decompose requirements into tasks"""
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    response = llm.invoke([
        SystemMessage(content=PM_SYSTEM_PROMPT),
        HumanMessage(content=f"Requirement: {state['requirement']}\n\nCreate a task plan.")
    ])
    
    # Parse tasks from response
    try:
        content = response.content
        # Extract JSON from response
        json_start = content.find("{")
        json_end = content.rfind("}") + 1
        if json_start >= 0:
            plan = json.loads(content[json_start:json_end])
            tasks = [
                Task(
                    id=t["id"],
                    title=t["title"],
                    description=t["description"],
                    assigned_to=t["assigned_to"],
                    status="todo",
                    priority=t.get("priority", "P2"),
                    dependencies=t.get("dependencies", []),
                    acceptance_criteria=t.get("acceptance_criteria", []),
                    result=None
                )
                for t in plan.get("tasks", [])
            ]
        else:
            tasks = []
    except (json.JSONDecodeError, KeyError):
        tasks = []
    
    # Find first task to execute
    first_task = tasks[0] if tasks else None
    next_agent = first_task["assigned_to"] if first_task else "pm_agent"
    
    return {
        "tasks": tasks,
        "current_task": first_task,
        "next_agent": next_agent,
        "messages": [AIMessage(
            content=f"[PM Agent]: Created {len(tasks)} tasks. First task → {next_agent}",
            name="pm_agent"
        )]
    }
```

```python
# src/agents/dev_agent.py

DEV_SYSTEM_PROMPT = """You are a Senior Backend Developer.

Given a task, write production-quality Python/FastAPI code.

Rules:
- Use type hints
- Include docstrings
- Write clean, readable code
- Include error handling
- Follow REST API best practices

Output your code as:
```python
# filename: <suggested_filename.py>
<your code here>
```

After the code, briefly list what you implemented."""

def backend_dev_agent(state: CompanyState) -> dict:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    task = state.get("current_task", {})
    feedback = state.get("review_feedback", "")
    
    prompt = f"Task: {task.get('title', '')}\nDescription: {task.get('description', '')}"
    if feedback and state.get("review_status") == "needs_changes":
        prompt += f"\n\nPrevious review feedback (please fix these issues):\n{feedback}"
    
    response = llm.invoke([
        SystemMessage(content=DEV_SYSTEM_PROMPT),
        HumanMessage(content=prompt)
    ])
    
    # Extract code artifacts from response
    code_content = response.content
    artifacts = state.get("artifacts", {})
    
    # Simple extraction: look for ```python blocks
    import re
    code_blocks = re.findall(r'# filename: (.+?)\n(.*?)```', code_content, re.DOTALL)
    for filename, code in code_blocks:
        artifacts[filename.strip()] = code.strip()
    
    # If no specific filename found, use generic
    if not code_blocks:
        artifacts["implementation.py"] = code_content
    
    return {
        "artifacts": artifacts,
        "next_agent": "qa_agent",
        "review_status": "pending",
        "messages": [AIMessage(
            content=f"[Backend Dev]: Code implemented. Sending to QA for review.",
            name="backend_dev"
        )]
    }
```

```python
# src/agents/qa_agent.py

QA_SYSTEM_PROMPT = """You are a QA Engineer. Review the code for quality.

Check:
1. Code correctness & logic
2. Error handling
3. Security issues
4. Performance concerns
5. Test coverage

Respond with:
- VERDICT: PASS / NEEDS_CHANGES / FAIL
- ISSUES: (list of issues if any)
- SUGGESTIONS: (improvement suggestions)"""

def qa_agent(state: CompanyState) -> dict:
    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0.1)
    
    artifacts_text = "\n\n".join([
        f"=== {name} ===\n{content}"
        for name, content in state.get("artifacts", {}).items()
    ])
    
    task = state.get("current_task", {})
    
    response = llm.invoke([
        SystemMessage(content=QA_SYSTEM_PROMPT),
        HumanMessage(content=f"""
Task: {task.get('title', '')}
Acceptance Criteria: {task.get('acceptance_criteria', [])}

Code to review:
{artifacts_text}
""")
    ])
    
    content = response.content.upper()
    if "PASS" in content and "NEEDS_CHANGES" not in content and "FAIL" not in content:
        review_status = "passed"
        next_agent = "devops_agent"
    elif "FAIL" in content:
        review_status = "failed"
        next_agent = "backend_dev"
    else:
        review_status = "needs_changes"
        next_agent = "backend_dev"
    
    iteration = state.get("iteration_count", 0) + 1
    
    # Prevent infinite loops
    if iteration > 3:
        review_status = "passed"
        next_agent = "devops_agent"
    
    return {
        "review_feedback": response.content,
        "review_status": review_status,
        "next_agent": next_agent,
        "iteration_count": iteration,
        "messages": [AIMessage(
            content=f"[QA Agent]: Review verdict: {review_status.upper()}",
            name="qa_agent"
        )]
    }
```

---

## 4. Define Tools

```python
# src/tools/dev_tools.py

from langchain_core.tools import tool

@tool
def read_file(path: str) -> str:
    """Read contents of a file from the project"""
    try:
        with open(path, "r") as f:
            return f.read()
    except FileNotFoundError:
        return f"File not found: {path}"

@tool
def write_file(path: str, content: str) -> str:
    """Write content to a file"""
    import os
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    return f"File written: {path}"

@tool
def run_tests(test_path: str = "tests/") -> str:
    """Run pytest and return results"""
    import subprocess
    result = subprocess.run(
        ["python", "-m", "pytest", test_path, "-v", "--tb=short"],
        capture_output=True, text=True, timeout=60
    )
    return f"Exit code: {result.returncode}\n{result.stdout}\n{result.stderr}"

@tool
def search_codebase(query: str, directory: str = "src/") -> str:
    """Search codebase for a pattern using grep"""
    import subprocess
    result = subprocess.run(
        ["grep", "-rn", query, directory],
        capture_output=True, text=True
    )
    return result.stdout or "No matches found"

@tool
def run_linter(path: str) -> str:
    """Run flake8 linter on code"""
    import subprocess
    result = subprocess.run(
        ["python", "-m", "flake8", path, "--max-line-length=120"],
        capture_output=True, text=True
    )
    return result.stdout or "No linting issues ✅"
```

---

## 5. Build the Graph

```python
# src/graph/company_graph.py

from langgraph.graph import StateGraph, END, START
from src.state.company_state import CompanyState
from src.agents.pm_agent import pm_agent
from src.agents.dev_agent import backend_dev_agent
from src.agents.qa_agent import qa_agent

def route_after_pm(state: CompanyState) -> str:
    """Route to the correct agent after PM planning"""
    next_agent = state.get("next_agent", "backend_dev")
    agent_map = {
        "backend_dev": "backend_dev_node",
        "frontend_dev": "frontend_dev_node",
        "designer": "designer_node",
    }
    return agent_map.get(next_agent, "backend_dev_node")

def route_after_qa(state: CompanyState) -> str:
    """Route based on QA review result"""
    status = state.get("review_status", "pending")
    if status == "passed":
        return "devops_node"
    else:
        return "backend_dev_node"  # Back to fix

def devops_agent(state: CompanyState) -> dict:
    from langchain_core.messages import AIMessage
    return {
        "deploy_status": "staging",
        "next_agent": "end",
        "messages": [AIMessage(
            content="[DevOps]: Deployed to staging ✅",
            name="devops"
        )]
    }

# ═══════════════════════════════════════
# BUILD GRAPH
# ═══════════════════════════════════════
def build_company_graph():
    graph = StateGraph(CompanyState)
    
    # Add nodes
    graph.add_node("pm_node", pm_agent)
    graph.add_node("backend_dev_node", backend_dev_agent)
    graph.add_node("qa_node", qa_agent)
    graph.add_node("devops_node", devops_agent)
    
    # Add edges
    graph.add_edge(START, "pm_node")
    
    graph.add_conditional_edges(
        "pm_node",
        route_after_pm,
        {
            "backend_dev_node": "backend_dev_node",
        }
    )
    
    graph.add_edge("backend_dev_node", "qa_node")
    
    graph.add_conditional_edges(
        "qa_node",
        route_after_qa,
        {
            "devops_node": "devops_node",
            "backend_dev_node": "backend_dev_node",
        }
    )
    
    graph.add_edge("devops_node", END)
    
    return graph

# ═══════════════════════════════════════
# RUN
# ═══════════════════════════════════════
if __name__ == "__main__":
    graph = build_company_graph()
    app = graph.compile()
    
    result = app.invoke({
        "requirement": "Build a REST API for user registration with email verification",
        "tasks": [],
        "artifacts": {},
        "iteration_count": 0,
        "messages": [],
        "project_name": "User Service",
        "deploy_status": "not_started",
        "review_status": "pending",
        "security_status": "pending",
        "needs_human_approval": False,
    })
    
    # Print results
    for msg in result["messages"]:
        print(f"\n{msg.content}")
    
    print(f"\nDeploy Status: {result['deploy_status']}")
    print(f"Artifacts: {list(result['artifacts'].keys())}")
```

---

## 6. Add Human-in-the-Loop

```python
from langgraph.checkpoint.sqlite import SqliteSaver

def build_company_graph_with_hitl():
    graph = build_company_graph()
    
    # Add human approval node before production deploy
    def human_approval(state: CompanyState) -> dict:
        """This node will be interrupted for human input"""
        return {"needs_human_approval": True}
    
    graph.add_node("human_approval", human_approval)
    
    # Insert between devops staging and production
    # ... (modify edges to include human_approval)
    
    # Compile with checkpointer
    memory = SqliteSaver.from_conn_string("./data/checkpoints.db")
    app = graph.compile(
        checkpointer=memory,
        interrupt_before=["human_approval"]  # Pause here
    )
    
    return app

# Usage:
app = build_company_graph_with_hitl()
config = {"configurable": {"thread_id": "feature-001"}}

# Run until human approval needed
result = app.invoke(initial_state, config)
print("Waiting for human approval...")

# Later, human approves:
result = app.invoke(
    {"human_decision": "approved", "needs_human_approval": False},
    config
)
```

---

## 7. Subgraphs (Teams)

```python
# Engineering Team as a subgraph

def build_engineering_team():
    """Build engineering team subgraph"""
    team_graph = StateGraph(CompanyState)
    
    team_graph.add_node("dev", backend_dev_agent)
    team_graph.add_node("qa", qa_agent)
    
    team_graph.add_edge(START, "dev")
    team_graph.add_edge("dev", "qa")
    team_graph.add_conditional_edges("qa", route_after_qa, {
        "devops_node": END,           # QA passed → exit subgraph
        "backend_dev_node": "dev",    # QA failed → loop back to dev
    })
    
    return team_graph.compile()

# Main company graph uses subgraph
def build_main_graph():
    main = StateGraph(CompanyState)
    
    main.add_node("pm", pm_agent)
    main.add_node("engineering", build_engineering_team())  # Subgraph!
    main.add_node("devops", devops_agent)
    
    main.add_edge(START, "pm")
    main.add_edge("pm", "engineering")
    main.add_edge("engineering", "devops")
    main.add_edge("devops", END)
    
    return main.compile()
```

---

## 8. Full IT Company Example

```python
# src/main.py — Complete runnable example

from src.graph.company_graph import build_company_graph
from langgraph.checkpoint.sqlite import SqliteSaver
import datetime

def run_it_company():
    """Run the IT Company Agent System"""
    
    # Build and compile
    graph = build_company_graph()
    memory = SqliteSaver.from_conn_string("./data/checkpoints.db")
    app = graph.compile(checkpointer=memory)
    
    # Initial state
    initial_state = {
        "requirement": """
        Build a user authentication system with:
        1. User registration (email, password, name)
        2. Login with JWT access + refresh tokens
        3. Password reset via email
        4. Rate limiting on auth endpoints
        5. Input validation
        """,
        "tasks": [],
        "artifacts": {},
        "iteration_count": 0,
        "messages": [],
        "project_name": "Auth Service",
        "deploy_status": "not_started",
        "review_status": "pending",
        "security_status": "pending",
        "needs_human_approval": False,
        "started_at": datetime.datetime.now().isoformat(),
    }
    
    config = {"configurable": {"thread_id": "auth-service-v1"}}
    
    # Stream execution (see each step)
    print("🏢 IT Company Agent System Starting...\n")
    
    for event in app.stream(initial_state, config):
        for node_name, output in event.items():
            if "messages" in output and output["messages"]:
                for msg in output["messages"]:
                    print(f"  {msg.content}")
            print(f"  → Node completed: {node_name}")
            print("-" * 60)
    
    # Get final state
    final_state = app.get_state(config)
    print(f"\n✅ Project completed!")
    print(f"📦 Artifacts: {list(final_state.values.get('artifacts', {}).keys())}")
    print(f"🚀 Deploy status: {final_state.values.get('deploy_status')}")

if __name__ == "__main__":
    run_it_company()
```

---

## 9. Testing & Observability

### 9.1 LangSmith Tracing

```python
# LangSmith auto-traces when env vars are set:
# LANGSMITH_API_KEY=ls-...
# LANGSMITH_TRACING_V2=true

# View traces at: https://smith.langchain.com
# See: every LLM call, tool call, agent decision, latency, cost
```

### 9.2 Unit Testing Agents

```python
# tests/test_pm_agent.py

import pytest
from src.agents.pm_agent import pm_agent
from src.state.company_state import CompanyState

def test_pm_creates_tasks():
    state = CompanyState(
        requirement="Build a login API",
        tasks=[],
        artifacts={},
        messages=[],
        iteration_count=0,
        # ... other defaults
    )
    
    result = pm_agent(state)
    
    assert "tasks" in result
    assert len(result["tasks"]) > 0
    assert result["tasks"][0]["assigned_to"] in [
        "backend_dev", "frontend_dev", "designer"
    ]

def test_pm_sets_priorities():
    state = CompanyState(
        requirement="URGENT: Fix security vulnerability in auth",
        # ...
    )
    
    result = pm_agent(state)
    
    # P0 or P1 for urgent tasks
    assert result["tasks"][0]["priority"] in ["P0", "P1"]
```

---

**Tiếp theo:** [Bài 8: Implementation Guide — CrewAI →](./08-Implementation-CrewAI.md)
