# Bài 2: Agent Architecture & Design Patterns

## Mục lục
- [1. Agent Internal Architecture](#1-agent-internal-architecture)
- [2. ReAct Pattern](#2-react-pattern)
- [3. Plan-and-Execute Pattern](#3-plan-and-execute-pattern)
- [4. Tool-Use Agent](#4-tool-use-agent)
- [5. Reflexion & Self-Correction](#5-reflexion--self-correction)
- [6. Multi-Agent Design Patterns](#6-multi-agent-design-patterns)
- [7. Prompt Engineering cho Agents](#7-prompt-engineering-cho-agents)

---

## 1. Agent Internal Architecture

### 1.1 Agent Components

```
AI Agent Internal Architecture:

┌─────────────────────────────────────────────────────────┐
│                    AI AGENT                              │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  🧠 BRAIN (LLM)                                   │  │
│  │  ├── System Prompt (persona, rules, constraints)  │  │
│  │  ├── Reasoning Engine (CoT, ToT)                  │  │
│  │  └── Decision Making (which action to take)       │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│  ┌───────────┐   ┌──────┴──────┐   ┌────────────────┐  │
│  │ 📥 INPUT  │   │ 🎯 PLANNING │   │ 📤 OUTPUT      │  │
│  │           │   │             │   │                 │  │
│  │ Messages  │   │ Goal decomp │   │ Actions         │  │
│  │ Context   │   │ Task plan   │   │ Messages        │  │
│  │ Feedback  │   │ Priority    │   │ Artifacts       │  │
│  └───────────┘   └─────────────┘   └────────────────┘  │
│                          │                               │
│  ┌───────────┐   ┌──────┴──────┐   ┌────────────────┐  │
│  │ 🧰 TOOLS │   │ 💾 MEMORY   │   │ 🔄 REFLECTION  │  │
│  │           │   │             │   │                 │  │
│  │ APIs      │   │ Short-term  │   │ Self-evaluate   │  │
│  │ Code exec │   │ Long-term   │   │ Error detection │  │
│  │ Search    │   │ Episodic    │   │ Self-correction │  │
│  │ Database  │   │ Shared      │   │ Learn from past │  │
│  └───────────┘   └─────────────┘   └────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Agent Loop (Core Runtime)

```python
# Pseudocode — Agent Core Loop

class Agent:
    def __init__(self, name, role, tools, llm):
        self.name = name
        self.role = role
        self.tools = tools
        self.llm = llm
        self.memory = Memory()
    
    def run(self, task):
        """Main agent loop"""
        
        # 1. PERCEIVE — Nhận task + context
        context = self.memory.get_relevant_context(task)
        
        # 2. THINK — LLM reasoning
        plan = self.llm.think(
            system_prompt=self.role,
            task=task,
            context=context,
            available_tools=self.tools
        )
        
        # 3. ACT — Execute plan
        while not plan.is_complete():
            step = plan.next_step()
            
            if step.requires_tool():
                # Use tool
                result = self.execute_tool(step.tool, step.args)
            elif step.requires_delegation():
                # Delegate to another agent
                result = self.delegate(step.target_agent, step.sub_task)
            else:
                # Generate content directly
                result = self.llm.generate(step.prompt)
            
            # 4. OBSERVE — Check result
            observation = self.observe(result)
            
            # 5. REFLECT — Self-evaluate
            if not self.is_satisfactory(observation):
                plan.revise(observation)  # Re-plan
                continue
            
            # 6. MEMORIZE — Store experience
            self.memory.store(step, result, observation)
            plan.mark_complete(step)
        
        return plan.final_output()
```

---

## 2. ReAct Pattern

### 2.1 ReAct (Reasoning + Acting)

> **ReAct** = Pattern phổ biến nhất cho AI Agents. Agent xen kẽ giữa **suy luận** (Thought) và **hành động** (Action), sử dụng kết quả observations để quyết định bước tiếp theo.

```
ReAct Loop:

User: "Tìm bug trong function calculateDiscount() và fix"

Thought 1: Tôi cần đọc source code function calculateDiscount() trước.
Action 1:  [read_file] path="src/pricing/discount.py"
Observation 1: 
  def calculateDiscount(price, discount_percent):
      return price * discount_percent  # BUG: thiếu / 100

Thought 2: Bug là discount_percent không được chia cho 100.
           price * 0.2 sẽ cho kết quả = 20% giá gốc (đúng nếu input = 0.2)
           Nhưng nếu input = 20 (phần trăm) → kết quả sai.
           Cần thêm / 100 hoặc validate input.
Action 2:  [write_file] fix the bug
Observation 2: File updated successfully.

Thought 3: Cần verify fix bằng cách chạy tests.
Action 3:  [run_tests] path="tests/test_discount.py"
Observation 3: All 5 tests passed ✅

Thought 4: Bug đã fix, tests pass. Task hoàn thành.
Action 4:  [FINISH] "Fixed calculateDiscount() — added / 100 for percent conversion"
```

### 2.2 ReAct Implementation

```python
# ReAct Agent Prompt Template

REACT_PROMPT = """
You are {agent_name}, a {agent_role}.

You have access to the following tools:
{tools_description}

Use the following format:

Question: the input question/task you must solve
Thought: you should always think about what to do
Action: the action to take, must be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the question

Question: {input}
{agent_scratchpad}
"""
```

---

## 3. Plan-and-Execute Pattern

### 3.1 Overview

> **Plan-and-Execute** = Agent TRƯỚC HẾT tạo full plan, SAU ĐÓ execute từng bước. Phù hợp cho tasks phức tạp, nhiều bước.

```
Plan-and-Execute vs ReAct:

ReAct:
  Think → Act → Observe → Think → Act → Observe → ...
  (Plan dynamically, 1 step at a time)

Plan-and-Execute:
  PLAN: [Step 1, Step 2, Step 3, Step 4, Step 5]
  EXECUTE: Step 1 → Step 2 → Step 3 → (re-plan if needed) → Step 4 → Step 5
  (Plan upfront, execute sequentially)
```

### 3.2 Plan-and-Execute Flow

```
Task: "Build authentication API with tests"

┌──────────────────────────────────────────┐
│  PLANNER AGENT                            │
│                                           │
│  Plan:                                    │
│  1. Research existing auth patterns       │
│  2. Design API schema (endpoints)         │
│  3. Create database models                │
│  4. Implement auth endpoints              │
│  5. Add JWT token handling                │
│  6. Write unit tests                      │
│  7. Write integration tests               │
│  8. Update API documentation              │
│  9. Code review checklist                 │
└──────────────┬───────────────────────────┘
               │
┌──────────────┴───────────────────────────┐
│  EXECUTOR AGENT                           │
│                                           │
│  Step 1: ✅ Researched OAuth2 patterns    │
│  Step 2: ✅ Designed 5 endpoints          │
│  Step 3: ✅ Created User, Token models    │
│  Step 4: ✅ Implemented endpoints         │
│  Step 5: ❌ JWT import error!             │
│           → Re-plan: install pyjwt first  │
│  Step 5: ✅ Fixed import, JWT working     │
│  Step 6: ✅ 12 unit tests written         │
│  Step 7: ✅ 5 integration tests           │
│  Step 8: ✅ OpenAPI spec updated          │
│  Step 9: ✅ All items checked             │
└──────────────────────────────────────────┘
```

---

## 4. Tool-Use Agent

### 4.1 Concept

> **Tool-Use Agent** = Agent biết chọn và sử dụng tools phù hợp cho mỗi bước. LLM quyết định tool nào cần gọi, với arguments nào.

### 4.2 Tool Definition

```python
# Tool definition cho Agent

tools = [
    {
        "name": "search_codebase",
        "description": "Search for code patterns, functions, or classes in the codebase",
        "parameters": {
            "query": "string - search query",
            "file_type": "string - optional file extension filter (e.g., '.py')"
        }
    },
    {
        "name": "read_file",
        "description": "Read the contents of a file",
        "parameters": {
            "path": "string - file path relative to project root"
        }
    },
    {
        "name": "write_file",
        "description": "Create or overwrite a file with new content",
        "parameters": {
            "path": "string - file path",
            "content": "string - file content"
        }
    },
    {
        "name": "run_terminal",
        "description": "Run a terminal command (e.g., tests, build, lint)",
        "parameters": {
            "command": "string - shell command to execute"
        }
    },
    {
        "name": "query_database",
        "description": "Execute a read-only SQL query",
        "parameters": {
            "sql": "string - SQL query",
            "database": "string - database name"
        }
    },
    {
        "name": "send_message",
        "description": "Send message to another agent",
        "parameters": {
            "to_agent": "string - target agent name",
            "message": "string - message content",
            "priority": "string - low/medium/high"
        }
    },
    {
        "name": "create_jira_ticket",
        "description": "Create a Jira ticket for tracking",
        "parameters": {
            "title": "string",
            "description": "string",
            "type": "string - bug/story/task",
            "assignee": "string - agent name"
        }
    }
]
```

### 4.3 Function Calling (OpenAI)

```python
# OpenAI Function Calling — Core of Tool-Use

import openai

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a Dev Agent. Use tools to complete tasks."},
        {"role": "user", "content": "Fix the bug in auth_service.py line 42"}
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read a file's contents",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "File path"}
                    },
                    "required": ["path"]
                }
            }
        }
    ],
    tool_choice="auto"  # LLM decides whether to use tool
)

# LLM Response:
# tool_calls: [{ function: { name: "read_file", arguments: '{"path": "auth_service.py"}' }}]

# → Execute tool → Feed result back → LLM continues reasoning
```

---

## 5. Reflexion & Self-Correction

### 5.1 Reflexion Pattern

> **Reflexion** = Agent tự đánh giá output, phát hiện lỗi, và tự sửa. Giống con người review lại work.

```
Reflexion Flow:

Task: "Write a sorting algorithm"

ATTEMPT 1:
├── Agent writes bubble sort
├── Self-evaluate: "Is this correct? Let me test..."
├── Run tests: ❌ Failed on edge case (empty array)
├── Reflection: "I didn't handle empty array. Need to add check."

ATTEMPT 2:
├── Agent fixes with empty array check
├── Run tests: ❌ Failed on large arrays (timeout)
├── Reflection: "Bubble sort is O(n²). Switch to quicksort."

ATTEMPT 3:
├── Agent rewrites with quicksort
├── Run tests: ✅ All pass
├── Reflection: "All tests pass. Performance is good. Done."

Final Output: Quicksort implementation ✅
```

### 5.2 Critic Agent Pattern

```
Critic Agent = Agent riêng chuyên review output

┌──────────────┐     ┌──────────────┐
│  Dev Agent   │────→│ Critic Agent │
│ (Generate)   │     │  (Evaluate)  │
└──────────────┘     └──────┬───────┘
       ↑                     │
       │                     │ Feedback
       │     ┌───────────────┘
       │     │
       │     ├── Score: 7/10
       │     ├── Issues:
       │     │   ├── Missing error handling
       │     │   ├── No input validation  
       │     │   └── Magic numbers
       │     └── Suggestions:
       │         ├── Add try-catch blocks
       │         ├── Validate function parameters
       │         └── Extract constants
       │
       └── Dev Agent revises code based on feedback
```

---

## 6. Multi-Agent Design Patterns

### 6.1 Supervisor Pattern

```
Supervisor Pattern:
1 agent điều phối, nhiều worker agents

┌──────────────────────────────────────────┐
│            SUPERVISOR AGENT              │
│                                          │
│  Responsibilities:                       │
│  ├── Nhận task từ user/system            │
│  ├── Phân tích & phân công              │
│  ├── Monitor progress                    │
│  ├── Combine results                     │
│  └── Quality check final output          │
│                                          │
│  Decision: "Which agent handles this?"   │
│  ├── Code task → Dev Agent               │
│  ├── Test task → QA Agent                │
│  ├── Deploy task → DevOps Agent          │
│  ├── Security review → Security Agent    │
│  └── Unclear → Ask for clarification     │
└──────────────┬───────────────────────────┘
               │ Route task
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐ ┌───┴───┐ ┌───┴───┐
│  Dev  │ │  QA   │ │DevOps │
│ Agent │ │ Agent │ │ Agent │
└───────┘ └───────┘ └───────┘
```

### 6.2 Hierarchical Teams Pattern

```
Hierarchical Teams:
Multi-level hierarchy, realistic company

                    ┌──────────┐
                    │ CEO Agent│
                    └────┬─────┘
              ┌──────────┼──────────┐
              │                     │
        ┌─────┴──────┐       ┌─────┴──────┐
        │ CTO Agent  │       │ COO Agent  │
        │ (Tech)     │       │ (Ops)      │
        └─────┬──────┘       └─────┬──────┘
         ┌────┼────┐           ┌───┼───┐
         │    │    │           │       │
     ┌───┴┐ ┌┴──┐┌┴────┐  ┌──┴──┐ ┌──┴───┐
     │Dev │ │QA ││SecOps│  │DevOp│ │Support│
     │Team│ │   ││      │  │     │ │      │
     └────┘ └───┘└──────┘  └─────┘ └──────┘

Flow:
1. CEO receives business requirement
2. CEO delegates to CTO (tech) and COO (ops)
3. CTO breaks down into dev tasks
4. Dev Team executes, QA validates
5. DevOps deploys
6. Results flow back up the hierarchy
```

### 6.3 Network / Collaboration Pattern

```
Network / Collaboration:
Agents giao tiếp trực tiếp khi cần

    ┌────────┐      ┌────────┐
    │   PM   │──────│  Dev   │
    │ Agent  │      │ Agent  │
    └───┬────┘      └───┬────┘
        │     ╲         │ ╲
        │      ╲        │  ╲
    ┌───┴────┐  ╲  ┌────┴───┐
    │Designer│   ╲ │  QA    │
    │ Agent  │    ╲│ Agent  │
    └────────┘     └───┬────┘
                       │
                  ┌────┴───┐
                  │ DevOps │
                  │ Agent  │
                  └────────┘

Mỗi agent có thể giao tiếp với bất kỳ agent nào khác.
Flexible nhưng cần clear protocols.
```

### 6.4 Pipeline Pattern

```
Pipeline / Sequential Processing:
Output agent trước = Input agent sau

[Requirement] → [PM Agent] → [Design Agent] → [Dev Agent] 
    → [QA Agent] → [Security Agent] → [DevOps Agent] → [DONE]

Ưu điểm: Đơn giản, dễ debug
Nhược điểm: Chậm (sequential), 1 agent block = tất cả chờ
```

### 6.5 Debate / Discussion Pattern

```
Debate Pattern:
Nhiều agents tranh luận → tăng quality

Topic: "Should we use microservices or monolith?"

Round 1:
Dev Agent (Pro Microservices): "Microservices scale better, 
  independent deployment..."
Architect Agent (Pro Monolith): "For our team size (5 people), 
  monolith is simpler, less ops overhead..."
Security Agent (Neutral): "Microservices = more attack surface, 
  but monolith = bigger blast radius..."

Round 2:
Dev Agent: "Considering team size, maybe start with modular monolith..."
Architect: "Agreed. Modular monolith → microservices later when team grows"
Security: "Modular monolith with clear boundaries = better security posture"

Moderator (CEO Agent): 
  CONSENSUS: "Modular monolith architecture, with clear module boundaries 
  that can be extracted to microservices when team grows to 15+."
```

---

## 7. Prompt Engineering cho Agents

### 7.1 System Prompt Structure

```python
# Best practice: Agent System Prompt

AGENT_SYSTEM_PROMPT = """
## Role
You are {name}, the {role} of an IT company.

## Personality & Style
{personality_traits}

## Core Responsibilities
{responsibilities}

## Skills & Expertise
{skills}

## Available Tools
{tools}

## Communication Rules
1. Always be professional and concise
2. When delegating, clearly state:
   - What you need
   - Why you need it  
   - When you need it
   - Acceptance criteria
3. When receiving tasks:
   - Confirm understanding
   - Ask clarifying questions if needed
   - Provide time estimate
   - Report progress/blockers

## Constraints
{constraints}

## Output Format
{output_format}
"""

# Example: Dev Agent
DEV_AGENT_PROMPT = """
## Role
You are DevBot, the Senior Software Developer of TechCorp.

## Personality & Style
- Pragmatic, favors clean code and SOLID principles
- Prefers well-tested solutions over quick hacks
- Communicates technical concepts clearly

## Core Responsibilities
1. Write production-quality code based on task specifications
2. Review code from other developers for quality and bugs
3. Suggest technical solutions and architecture decisions
4. Debug and fix reported issues
5. Write unit and integration tests for your code

## Skills & Expertise
- Languages: Python, TypeScript, Java
- Frameworks: FastAPI, Next.js, Spring Boot
- Databases: PostgreSQL, Redis, MongoDB
- Patterns: SOLID, Clean Architecture, DDD

## Communication Rules
1. When you receive a task, confirm with a brief plan before coding
2. When code is ready, notify QA Agent for testing
3. If blocked, escalate to Tech Lead with clear description
4. Always include tests with your code submissions

## Constraints
- Never commit directly to main/prod branch
- Always write tests (minimum 80% coverage)
- Follow the team's coding standards
- Security-sensitive code → flag for Security Agent review
- Max 500 lines per file
"""
```

### 7.2 Few-Shot Examples cho Agents

```python
# Few-shot examples trong agent prompt

EXAMPLES = """
## Example Interactions:

### Example 1: Receiving a task
PM Agent: "TASK-042: Implement password reset API. 
  Requirements: email verification, token expiry 24h, rate limit 3/hour"

Your response:
"Understood TASK-042. My plan:
1. Create PasswordResetToken model (token, user_id, expires_at, used)
2. POST /api/auth/forgot-password → generate token, send email
3. POST /api/auth/reset-password → validate token, update password
4. Rate limiting middleware: 3 requests/hour per email
5. Unit tests for all endpoints
ETA: 4 hours. Starting now."

### Example 2: Reporting completion
"TASK-042 completed. Summary:
- 3 new endpoints implemented
- Token model with auto-expiry
- Rate limiter configured (3/hr)
- 12 unit tests, 3 integration tests (all passing)
- PR ready for review: PR-089
Sending to QA Agent for validation."

### Example 3: Escalating a blocker
"⚠️ BLOCKED on TASK-042: 
Email service (SendGrid) returning 403. 
Likely API key expired or rate limit hit.
Need DevOps Agent to check SendGrid dashboard.
ETA impact: +2 hours if resolved quickly."
"""
```

---

## Tóm tắt

```
Agent Design Patterns — Cheat Sheet:

┌────────────────┬───────────────────────────────────┐
│ Pattern        │ Best For                          │
├────────────────┼───────────────────────────────────┤
│ ReAct          │ Single agent, step-by-step tasks  │
│ Plan-Execute   │ Complex tasks needing full plan   │
│ Tool-Use       │ Tasks requiring external tools    │
│ Reflexion      │ Tasks needing quality assurance   │
│ Supervisor     │ Team of agents, clear hierarchy   │
│ Hierarchical   │ Large organizations, departments  │
│ Network        │ Flexible collaboration            │
│ Pipeline       │ Sequential processing             │
│ Debate         │ Decision-making, brainstorming    │
└────────────────┴───────────────────────────────────┘

For IT Company Agent: 
→ Hierarchical Teams + Supervisor + Tool-Use + Reflexion
```

---

**Tiếp theo:** [Bài 3: Communication & Orchestration →](./03-Communication-Orchestration.md)
