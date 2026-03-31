# Bài 3: Communication & Orchestration

## Mục lục
- [1. Communication Patterns](#1-communication-patterns)
- [2. Message Passing](#2-message-passing)
- [3. Shared State / Blackboard](#3-shared-state--blackboard)
- [4. Event-Driven Architecture](#4-event-driven-architecture)
- [5. State Machine & Graph Orchestration](#5-state-machine--graph-orchestration)
- [6. Human-in-the-Loop](#6-human-in-the-loop)
- [7. Error Handling & Recovery](#7-error-handling--recovery)
- [8. Conflict Resolution](#8-conflict-resolution)

---

## 1. Communication Patterns

### 1.1 Tổng quan

```
Multi-Agent Communication — 3 Main Patterns:

1. MESSAGE PASSING (Truyền tin nhắn)
   ┌────────┐  message  ┌────────┐
   │Agent A ├──────────→│Agent B │
   └────────┘           └────────┘
   
   Agents gửi/nhận messages trực tiếp
   Like: Email, Slack DM

2. SHARED STATE (Chia sẻ trạng thái)
   ┌────────┐           ┌────────┐
   │Agent A │           │Agent B │
   └───┬────┘           └───┬────┘
       │  read/write        │  read/write
       ▼                    ▼
   ┌─────────────────────────┐
   │     SHARED STATE        │
   │  (single source of truth)│
   └─────────────────────────┘
   
   Agents đọc/ghi vào shared space
   Like: Google Docs, Shared Database

3. EVENT-DRIVEN (Sự kiện)
   ┌────────┐  emit event   ┌────────────┐
   │Agent A ├──────────────→│ Event Bus  │
   └────────┘               └─────┬──────┘
                              ┌───┴───┐
                              │ Route │
                         ┌────┴───┬───┴────┐
                    ┌────┴──┐ ┌──┴───┐ ┌──┴───┐
                    │Agent B│ │Agent C│ │Agent D│
                    └───────┘ └──────┘ └──────┘
   
   Agents publish events, interested agents subscribe
   Like: Kafka, RabbitMQ
```

### 1.2 So sánh

| Feature | Message Passing | Shared State | Event-Driven |
|---------|----------------|--------------|--------------|
| Coupling | Tight (know each other) | Medium | Loose |
| Scalability | Limited | Limited (contention) | High |
| Complexity | Low | Medium | High |
| Real-time | Yes | Polling needed | Yes |
| Consistency | Point-to-point | Central state | Eventually consistent |
| Best for | Small teams | Collaborative work | Large systems |

---

## 2. Message Passing

### 2.1 Direct Message

```python
# Direct Message Pattern

class AgentMessage:
    def __init__(self, sender, receiver, content, msg_type="task"):
        self.id = str(uuid4())
        self.sender = sender
        self.receiver = receiver
        self.content = content
        self.type = msg_type       # task, response, question, notification
        self.timestamp = datetime.now()
        self.status = "pending"    # pending, delivered, read, processed
        self.thread_id = None      # For conversation threading

# Message Flow Example:
# PM Agent → Dev Agent

message = AgentMessage(
    sender="pm_agent",
    receiver="dev_agent",
    content={
        "task_id": "TASK-042",
        "title": "Implement login API",
        "requirements": ["JWT auth", "Rate limiting", "bcrypt hashing"],
        "priority": "high",
        "deadline": "2026-04-02"
    },
    msg_type="task"
)

# Dev Agent responds:
response = AgentMessage(
    sender="dev_agent",
    receiver="pm_agent",
    content={
        "task_id": "TASK-042",
        "status": "accepted",
        "estimate": "4 hours",
        "plan": [
            "1. Create User model",
            "2. Implement /login endpoint",
            "3. Add JWT token generation",
            "4. Unit tests",
        ]
    },
    msg_type="response"
)
```

### 2.2 Message Router

```python
# Central Message Router

class MessageRouter:
    def __init__(self):
        self.agents = {}
        self.message_queue = []
        self.message_log = []
    
    def register_agent(self, agent_name, agent_instance):
        self.agents[agent_name] = agent_instance
    
    def send(self, message):
        """Route message to correct agent"""
        self.message_log.append(message)
        
        if message.receiver == "broadcast":
            # Send to all agents
            for name, agent in self.agents.items():
                if name != message.sender:
                    agent.receive(message)
        elif message.receiver in self.agents:
            # Direct message
            self.agents[message.receiver].receive(message)
        else:
            raise AgentNotFoundError(f"Agent '{message.receiver}' not found")
    
    def get_conversation(self, thread_id):
        """Get all messages in a thread"""
        return [m for m in self.message_log if m.thread_id == thread_id]

# Usage:
router = MessageRouter()
router.register_agent("pm_agent", pm_agent)
router.register_agent("dev_agent", dev_agent)
router.register_agent("qa_agent", qa_agent)

# PM sends task to Dev
router.send(AgentMessage(
    sender="pm_agent",
    receiver="dev_agent",
    content={"task": "Build auth API"},
    msg_type="task"
))
```

---

## 3. Shared State / Blackboard

### 3.1 Shared State Architecture

```python
# Shared State Pattern — All agents read/write

class SharedState:
    """Central state object shared across all agents"""
    
    def __init__(self):
        self.state = {
            # Project info
            "project": {
                "name": "E-Commerce Platform",
                "status": "in_progress",
                "started": "2026-03-01"
            },
            
            # Task board
            "tasks": {
                "backlog": [],
                "in_progress": [],
                "in_review": [],
                "done": []
            },
            
            # Code artifacts
            "artifacts": {
                "code_files": {},
                "test_results": {},
                "documentation": {},
                "api_specs": {}
            },
            
            # Agent status
            "agents": {
                "pm_agent": {"status": "idle", "current_task": None},
                "dev_agent": {"status": "working", "current_task": "TASK-042"},
                "qa_agent": {"status": "idle", "current_task": None},
                "devops_agent": {"status": "idle", "current_task": None}
            },
            
            # Communication log
            "messages": [],
            
            # Decisions log
            "decisions": []
        }
    
    def get(self, path):
        """Get value by dot-notation path"""
        keys = path.split(".")
        value = self.state
        for key in keys:
            value = value[key]
        return value
    
    def set(self, path, value):
        """Set value by dot-notation path"""
        keys = path.split(".")
        target = self.state
        for key in keys[:-1]:
            target = target[key]
        target[keys[-1]] = value
    
    def append(self, path, value):
        """Append to list by path"""
        target = self.get(path)
        target.append(value)
```

### 3.2 LangGraph State (Production Pattern)

```python
# LangGraph — TypedDict State (recommended)
from typing import TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph

class CompanyState(TypedDict):
    """State shared across all agents in the graph"""
    
    # Messages history (append-only)
    messages: Annotated[Sequence[dict], "append"]
    
    # Current task being processed
    current_task: dict | None
    
    # Task board
    tasks_backlog: list[dict]
    tasks_in_progress: list[dict]
    tasks_completed: list[dict]
    
    # Code artifacts produced
    code_artifacts: dict[str, str]  # filename → content
    
    # Test results
    test_results: dict[str, bool]
    
    # Which agent should act next
    next_agent: str
    
    # Human approval needed?
    needs_human_approval: bool
    
    # Error state
    error: str | None

# State flows through the graph:
# Each agent reads state → processes → updates state → next agent
```

---

## 4. Event-Driven Architecture

### 4.1 Event System

```python
# Event-Driven Multi-Agent Communication

class EventBus:
    """Pub/Sub event system for agents"""
    
    def __init__(self):
        self.subscribers = {}  # event_type → [callback_functions]
        self.event_log = []
    
    def subscribe(self, event_type, agent_name, callback):
        """Agent subscribes to event type"""
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append({
            "agent": agent_name,
            "callback": callback
        })
    
    def publish(self, event):
        """Publish event to all subscribers"""
        self.event_log.append(event)
        
        if event.type in self.subscribers:
            for subscriber in self.subscribers[event.type]:
                subscriber["callback"](event)
    
    def get_events(self, event_type=None, since=None):
        """Query event history"""
        events = self.event_log
        if event_type:
            events = [e for e in events if e.type == event_type]
        if since:
            events = [e for e in events if e.timestamp > since]
        return events

# Event Types:
EVENT_TYPES = {
    "task.created":      "New task created",
    "task.assigned":     "Task assigned to agent",
    "task.completed":    "Task completed",
    "task.failed":       "Task failed",
    "code.pushed":       "Code pushed for review",
    "code.reviewed":     "Code review completed",
    "test.passed":       "All tests passed",
    "test.failed":       "Tests failed",
    "deploy.started":    "Deployment started",
    "deploy.completed":  "Deployment completed",
    "deploy.failed":     "Deployment failed",
    "alert.security":    "Security issue detected",
    "alert.performance": "Performance issue detected",
    "human.approval":    "Human approval requested",
}

# Agent subscriptions:
event_bus = EventBus()

# Dev Agent cares about: task assignments, code reviews
event_bus.subscribe("task.assigned", "dev_agent", dev_agent.on_task_assigned)
event_bus.subscribe("code.reviewed", "dev_agent", dev_agent.on_code_reviewed)

# QA Agent cares about: code pushes (to test)
event_bus.subscribe("code.pushed", "qa_agent", qa_agent.on_code_pushed)

# DevOps Agent cares about: test results (to deploy)
event_bus.subscribe("test.passed", "devops_agent", devops_agent.on_tests_passed)

# Security Agent cares about: code pushes, deployments
event_bus.subscribe("code.pushed", "security_agent", security_agent.on_code_pushed)
event_bus.subscribe("deploy.started", "security_agent", security_agent.on_deploy)

# PM Agent cares about: everything
for event_type in EVENT_TYPES:
    event_bus.subscribe(event_type, "pm_agent", pm_agent.on_event)
```

---

## 5. State Machine & Graph Orchestration

### 5.1 State Machine

```
State Machine cho IT Company Workflow:

States: [idle, planning, developing, reviewing, testing, 
         deploying, monitoring, done, failed]

Transitions:
┌──────┐ task_received  ┌──────────┐
│ IDLE ├───────────────→│ PLANNING │
└──────┘                └────┬─────┘
                             │ plan_approved
                        ┌────┴──────────┐
                        │  DEVELOPING   │
                        └────┬──────────┘
                             │ code_ready
                   ┌─────────┴──────────┐
                   │     REVIEWING      │
                   └──┬──────────────┬──┘
          review_pass │              │ review_fail
                ┌─────┴───┐    ┌────┴──────┐
                │ TESTING │    │ DEVELOPING │ (back to fix)
                └──┬──────┘    └───────────┘
          test_pass │  test_fail │
                ┌───┴───┐  ┌────┴───┐
                │DEPLOYING│ │ FAILED │→ escalate
                └──┬──────┘ └────────┘
          success │
            ┌─────┴────┐
            │MONITORING │
            └──┬────────┘
          stable │
            ┌────┴──┐
            │ DONE  │
            └───────┘
```

### 5.2 Graph-Based Orchestration (LangGraph)

```python
# LangGraph — Graph-based agent orchestration

from langgraph.graph import StateGraph, END

# 1. Define state
class AgentState(TypedDict):
    task: str
    plan: str
    code: str
    review_feedback: str
    test_results: str
    status: str

# 2. Define agent nodes (functions)
def pm_agent(state: AgentState) -> AgentState:
    """PM Agent: receives task, creates plan"""
    plan = llm.invoke(f"Create dev plan for: {state['task']}")
    return {"plan": plan, "status": "planned"}

def dev_agent(state: AgentState) -> AgentState:
    """Dev Agent: writes code based on plan"""
    code = llm.invoke(f"Write code for plan: {state['plan']}")
    return {"code": code, "status": "coded"}

def qa_agent(state: AgentState) -> AgentState:
    """QA Agent: reviews and tests code"""
    review = llm.invoke(f"Review this code:\n{state['code']}")
    return {"review_feedback": review, "status": "reviewed"}

def devops_agent(state: AgentState) -> AgentState:
    """DevOps Agent: deploys code"""
    result = deploy_service.deploy(state['code'])
    return {"status": "deployed"}

# 3. Define routing logic
def route_after_review(state: AgentState) -> str:
    """Decide next step after QA review"""
    if "PASS" in state["review_feedback"]:
        return "devops_agent"      # Deploy
    else:
        return "dev_agent"         # Back to fix

# 4. Build graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("pm_agent", pm_agent)
graph.add_node("dev_agent", dev_agent)
graph.add_node("qa_agent", qa_agent)
graph.add_node("devops_agent", devops_agent)

# Add edges (flow)
graph.set_entry_point("pm_agent")
graph.add_edge("pm_agent", "dev_agent")
graph.add_edge("dev_agent", "qa_agent")
graph.add_conditional_edges(
    "qa_agent",
    route_after_review,
    {
        "devops_agent": "devops_agent",
        "dev_agent": "dev_agent"
    }
)
graph.add_edge("devops_agent", END)

# 5. Compile & run
app = graph.compile()
result = app.invoke({"task": "Build user authentication API"})
```

---

## 6. Human-in-the-Loop

### 6.1 When to involve humans

```
Human-in-the-Loop Decision Matrix:

ALWAYS require human approval:
├── Production deployment
├── Delete operations (data, infrastructure)
├── Budget/spending decisions
├── Security-sensitive changes
├── External communications (to clients)
└── Changes affecting > 100 users

SOMETIMES require human approval:
├── Architecture decisions (if cost > threshold)
├── New technology adoption
├── Complex bug fixes (if risk > threshold)
└── Hiring/resource decisions

NEVER require human approval (fully automated):
├── Code formatting/linting
├── Running tests
├── Internal task assignment
├── Status updates
├── Non-production deploys (dev/staging)
└── Knowledge base lookups
```

### 6.2 Implementation

```python
# LangGraph — Human-in-the-Loop

from langgraph.checkpoint.memory import MemorySaver

# Add human checkpoint before deployment
def should_deploy(state):
    if state["environment"] == "production":
        return "human_approval"  # Pause for human
    return "devops_agent"        # Auto-deploy

graph.add_conditional_edges(
    "qa_agent",
    should_deploy,
    {
        "human_approval": "human_approval_node",
        "devops_agent": "devops_agent"
    }
)

# Human approval node
def human_approval_node(state):
    """Pause execution and wait for human input"""
    # This node will interrupt the graph
    # Human reviews and provides: approve / reject / modify
    pass

graph.add_node("human_approval_node", human_approval_node)

# Compile with checkpointing (to resume after human input)
memory = MemorySaver()
app = graph.compile(
    checkpointer=memory,
    interrupt_before=["human_approval_node"]
)

# Run until interrupt
config = {"configurable": {"thread_id": "deploy-001"}}
result = app.invoke(initial_state, config)
# → Pauses at human_approval_node

# Human reviews and approves...
# Resume:
result = app.invoke(
    {"human_decision": "approved"},
    config
)
```

---

## 7. Error Handling & Recovery

### 7.1 Error Types

```
Error Handling in Multi-Agent Systems:

1. AGENT FAILURE
   ├── LLM timeout / rate limit
   ├── Tool execution error
   ├── Invalid output format
   └── Recovery: Retry with exponential backoff

2. COMMUNICATION FAILURE  
   ├── Message not delivered
   ├── Agent not responding
   ├── Network timeout
   └── Recovery: Dead letter queue, retry, escalate

3. LOGIC ERRORS
   ├── Agent produces wrong output
   ├── Circular delegation (A → B → A → B...)
   ├── Deadlock (agents waiting for each other)
   └── Recovery: Self-reflection, supervisor intervention

4. STATE CORRUPTION
   ├── Inconsistent shared state
   ├── Race conditions (parallel agents)
   ├── Lost updates
   └── Recovery: State snapshots, rollback

5. CASCADING FAILURE
   ├── 1 agent fails → dependent agents fail
   ├── Error propagation through pipeline
   └── Recovery: Circuit breaker, fallback agents
```

### 7.2 Recovery Strategies

```python
# Retry with exponential backoff
class AgentWithRetry:
    def execute(self, task, max_retries=3):
        for attempt in range(max_retries):
            try:
                result = self.run(task)
                if self.validate_output(result):
                    return result
                else:
                    raise InvalidOutputError("Output validation failed")
            except Exception as e:
                wait_time = 2 ** attempt  # 1s, 2s, 4s
                log.warning(f"Attempt {attempt+1} failed: {e}. Retrying in {wait_time}s")
                time.sleep(wait_time)
                
                if attempt == max_retries - 1:
                    # Final attempt: escalate to supervisor
                    return self.escalate_to_supervisor(task, e)

# Circuit breaker pattern
class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=60):
        self.failures = 0
        self.threshold = failure_threshold
        self.state = "closed"  # closed → open → half-open
    
    def call(self, func, *args):
        if self.state == "open":
            raise CircuitOpenError("Agent temporarily disabled")
        
        try:
            result = func(*args)
            self.failures = 0
            self.state = "closed"
            return result
        except Exception as e:
            self.failures += 1
            if self.failures >= self.threshold:
                self.state = "open"
                # Auto-reset after timeout
                schedule_reset(self.reset_timeout)
            raise
```

---

## 8. Conflict Resolution

### 8.1 Conflict Types

```
Conflicts trong Multi-Agent IT Company:

1. RESOURCE CONFLICT
   Dev Agent 1 & Dev Agent 2 cùng edit 1 file
   → Resolution: Lock mechanism / merge strategy

2. DECISION CONFLICT  
   Dev Agent muốn dùng React, Designer Agent muốn Vue
   → Resolution: Voting / Supervisor decides

3. PRIORITY CONFLICT
   QA Agent yêu cầu fix bug, PM Agent yêu cầu new feature
   → Resolution: Priority matrix / PM has authority

4. DATA CONFLICT
   2 agents update shared state cùng lúc
   → Resolution: Optimistic locking / event sourcing
```

### 8.2 Resolution Mechanisms

```
Resolution Strategies:

1. AUTHORITY (thẩm quyền)
   └── Agent cấp cao quyết định
   └── CEO > CTO > Dev Agent

2. VOTING (bỏ phiếu)
   └── Majority wins
   └── Dùng cho: tech decisions, code reviews

3. NEGOTIATION (đàm phán)
   └── Agents present arguments
   └── Mediator agent tổng hợp

4. PRIORITY RULES (quy tắc ưu tiên)
   └── Pre-defined rules
   └── Security > Feature > Optimization
   └── P1 bug > P2 > P3 > new feature

5. FIRST-COME-FIRST-SERVED
   └── Agent đến trước được ưu tiên
   └── Dùng cho: resource allocation
```

---

**Tiếp theo:** [Bài 4: Technology Stack & Frameworks →](./04-Technology-Stack.md)
