# Bài 8: Implementation Guide — CrewAI

## Mục lục
- [1. CrewAI Setup](#1-crewai-setup)
- [2. Define Agents](#2-define-agents)
- [3. Define Tasks](#3-define-tasks)
- [4. Custom Tools](#4-custom-tools)
- [5. Sequential Process](#5-sequential-process)
- [6. Hierarchical Process](#6-hierarchical-process)
- [7. IT Company Full Example](#7-it-company-full-example)
- [8. Advanced Features](#8-advanced-features)
- [9. CrewAI vs LangGraph](#9-crewai-vs-langgraph)

---

## 1. CrewAI Setup

```bash
# Install
pip install crewai crewai-tools
pip install langchain-openai

# Project structure (CrewAI convention)
mkdir it-company-crew && cd it-company-crew
crewai create crew it_company    # scaffolding tool

# Manual structure:
mkdir -p src/{agents,tasks,tools,config}
```

```python
# src/config/settings.py
import os
os.environ["OPENAI_API_KEY"] = "sk-..."
os.environ["OPENAI_MODEL_NAME"] = "gpt-4o"
```

---

## 2. Define Agents

```python
# src/agents/company_agents.py

from crewai import Agent
from src.tools.dev_tools import CodeTool, TestTool, SearchTool

# ═══════════════════════════════════════
# CEO Agent
# ═══════════════════════════════════════
ceo_agent = Agent(
    role="Chief Executive Officer",
    goal="Make strategic business decisions and approve final deliverables",
    backstory="""You are a visionary CEO with 15 years of experience
    in tech companies. You focus on business value, customer impact,
    and long-term scalability. You trust your CTO for technical 
    decisions but make final calls on product direction.""",
    llm="gpt-4o",
    verbose=True,
    allow_delegation=True,
    max_iter=5
)

# ═══════════════════════════════════════
# PM Agent
# ═══════════════════════════════════════
pm_agent = Agent(
    role="Project Manager",
    goal="Break down requirements into actionable tasks and coordinate the team",
    backstory="""You are an expert PM with PMP and Scrum Master 
    certifications. You excel at creating clear user stories with 
    acceptance criteria and managing sprint deliverables.
    You know the team's strengths and assign tasks accordingly.""",
    llm="gpt-4o",
    verbose=True,
    allow_delegation=True
)

# ═══════════════════════════════════════
# Backend Developer Agent
# ═══════════════════════════════════════
backend_dev = Agent(
    role="Senior Backend Developer",
    goal="Write clean, tested, production-quality backend code",
    backstory="""You are a senior developer with 8 years of experience 
    in Python, FastAPI, SQLAlchemy, and PostgreSQL.
    You follow SOLID principles, always write type hints, 
    and achieve 80%+ test coverage. You prefer simple, readable 
    solutions over clever ones.""",
    tools=[CodeTool(), TestTool(), SearchTool()],
    llm="gpt-4o",
    verbose=True,
    allow_delegation=False  # Devs do their own work
)

# ═══════════════════════════════════════
# Frontend Developer Agent
# ═══════════════════════════════════════
frontend_dev = Agent(
    role="Senior Frontend Developer",
    goal="Build responsive, accessible, and performant user interfaces",
    backstory="""You specialize in React, TypeScript, and Next.js.
    You follow accessibility (WCAG 2.1) guidelines and write 
    component tests. You prioritize user experience.""",
    tools=[CodeTool()],
    llm="gpt-4o",
    verbose=True
)

# ═══════════════════════════════════════
# QA Agent
# ═══════════════════════════════════════
qa_agent = Agent(
    role="QA Engineer",
    goal="Ensure software quality through thorough testing and code review",
    backstory="""You are a meticulous QA engineer who has caught 
    thousands of bugs before they reached production. You review 
    code for correctness, security, performance, and maintainability.
    You are constructive but never let subpar code pass.""",
    tools=[TestTool()],
    llm="gpt-4o",
    verbose=True
)

# ═══════════════════════════════════════
# DevOps Agent
# ═══════════════════════════════════════
devops_agent = Agent(
    role="DevOps Engineer",
    goal="Ensure reliable CI/CD and infrastructure management",
    backstory="""You manage Docker containers, Kubernetes clusters,
    and CI/CD pipelines. You prioritize infrastructure as code (IaC),
    monitoring, and automated rollbacks.""",
    llm="gpt-4o-mini",  # Simpler tasks
    verbose=True
)

# ═══════════════════════════════════════
# Security Agent
# ═══════════════════════════════════════
security_agent = Agent(
    role="Security Engineer",
    goal="Identify and prevent security vulnerabilities",
    backstory="""You are a security expert with CISSP certification.
    You review code for OWASP Top 10 vulnerabilities, check for 
    injection attacks, broken authentication, and data exposure.
    You also verify compliance with security policies.""",
    llm="gpt-4o",
    verbose=True
)

# ═══════════════════════════════════════
# Documentation Agent
# ═══════════════════════════════════════
docs_agent = Agent(
    role="Technical Writer",
    goal="Create clear, comprehensive API documentation and guides",
    backstory="""You create developer-friendly documentation 
    following the Diátaxis framework (tutorials, how-to, 
    reference, explanation). You write OpenAPI specs and README files.""",
    llm="gpt-4o-mini",
    verbose=True
)
```

---

## 3. Define Tasks

```python
# src/tasks/development_tasks.py

from crewai import Task
from src.agents.company_agents import *

def create_feature_tasks(requirement: str):
    """Create the full task chain for a feature"""
    
    # ═══════════════════════════════════════
    # Task 1: Planning
    # ═══════════════════════════════════════
    planning_task = Task(
        description=f"""
        Analyze this requirement and create a detailed development plan:
        
        REQUIREMENT: {requirement}
        
        Your plan should include:
        1. Feature breakdown into subtasks
        2. Technical approach for each subtask
        3. Dependencies between subtasks
        4. Risk assessment
        5. Time estimates
        """,
        expected_output="""A structured development plan with:
        - Clear task list with descriptions
        - Technical approach
        - Dependencies mapped
        - Total time estimate""",
        agent=pm_agent
    )
    
    # ═══════════════════════════════════════
    # Task 2: Backend Implementation
    # ═══════════════════════════════════════
    backend_task = Task(
        description="""
        Based on the PM's plan, implement the backend code.
        
        Requirements:
        - Use FastAPI framework
        - Use Pydantic v2 models for validation
        - Use SQLAlchemy 2.0 for database
        - Include proper error handling (HTTPException)
        - Add input validation
        - Write docstrings for all functions
        
        Provide complete, runnable code.
        """,
        expected_output="""Production-ready Python code with:
        - API endpoints (routes)
        - Database models
        - Business logic
        - Input/output schemas
        - Error handling""",
        agent=backend_dev,
        context=[planning_task]  # Gets PM's output as context
    )
    
    # ═══════════════════════════════════════
    # Task 3: Code Review & Testing
    # ═══════════════════════════════════════
    qa_task = Task(
        description="""
        Review the developer's code for:
        
        1. Correctness: Does it meet the requirements?
        2. Code Quality: Clean code, naming, structure?
        3. Security: Any OWASP vulnerabilities?
        4. Performance: Efficient queries, no N+1?
        5. Testing: Write pytest tests for the code
        
        Provide:
        - Code review feedback (issues + suggestions)
        - Unit tests
        - Integration tests
        - Final VERDICT: PASS / NEEDS_CHANGES / FAIL
        """,
        expected_output="""
        - Detailed code review report
        - List of issues with severity
        - pytest test code
        - Final verdict""",
        agent=qa_agent,
        context=[backend_task]
    )
    
    # ═══════════════════════════════════════
    # Task 4: Security Review
    # ═══════════════════════════════════════
    security_task = Task(
        description="""
        Perform a security review of the code:
        
        Check for:
        1. SQL Injection vulnerabilities
        2. Authentication/Authorization issues
        3. Input sanitization
        4. Secrets/credentials in code
        5. CORS configuration
        6. Rate limiting
        7. Data validation
        
        Provide:
        - Security findings (Critical / High / Medium / Low)
        - Remediation suggestions
        - Compliance status
        """,
        expected_output="""Security audit report with:
        - Vulnerability findings
        - Severity ratings
        - Remediation steps
        - Overall security score""",
        agent=security_agent,
        context=[backend_task]
    )
    
    # ═══════════════════════════════════════
    # Task 5: Documentation
    # ═══════════════════════════════════════
    docs_task = Task(
        description="""
        Create API documentation based on the implemented code:
        
        Include:
        1. OpenAPI/Swagger spec (YAML)
        2. README with setup instructions
        3. API endpoint reference table
        4. Example requests/responses with curl
        5. Error codes reference
        """,
        expected_output="""
        - OpenAPI spec
        - README.md
        - API reference table
        - Example curl commands""",
        agent=docs_agent,
        context=[backend_task, qa_task]
    )
    
    # ═══════════════════════════════════════
    # Task 6: Deployment Plan
    # ═══════════════════════════════════════
    deploy_task = Task(
        description="""
        Create deployment artifacts:
        
        1. Dockerfile for the application
        2. docker-compose.yml (app + postgres + redis)
        3. CI/CD pipeline configuration (GitHub Actions)
        4. Environment variable template (.env.example)
        5. Health check endpoint specification
        """,
        expected_output="""
        - Dockerfile
        - docker-compose.yml
        - .github/workflows/deploy.yml
        - .env.example
        - Health check spec""",
        agent=devops_agent,
        context=[backend_task, security_task]
    )
    
    return [planning_task, backend_task, qa_task, 
            security_task, docs_task, deploy_task]
```

---

## 4. Custom Tools

```python
# src/tools/dev_tools.py

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

class CodeSearchInput(BaseModel):
    query: str = Field(description="Search query for code patterns")

class CodeTool(BaseTool):
    name: str = "Code Search"
    description: str = "Search the codebase for existing patterns and examples"
    args_schema: type[BaseModel] = CodeSearchInput
    
    def _run(self, query: str) -> str:
        # In production: integrate with actual codebase search
        return f"Searched codebase for '{query}'. Found existing patterns in auth module."

class TestRunInput(BaseModel):
    test_path: str = Field(default="tests/", description="Path to test files")

class TestTool(BaseTool):
    name: str = "Run Tests"
    description: str = "Execute pytest test suite and return results"
    args_schema: type[BaseModel] = TestRunInput
    
    def _run(self, test_path: str = "tests/") -> str:
        import subprocess
        try:
            result = subprocess.run(
                ["python", "-m", "pytest", test_path, "-v"],
                capture_output=True, text=True, timeout=60
            )
            return f"Exit: {result.returncode}\n{result.stdout}"
        except Exception as e:
            return f"Test execution error: {str(e)}"

class SearchInput(BaseModel):
    query: str = Field(description="Web search query")

class SearchTool(BaseTool):
    name: str = "Web Search"
    description: str = "Search the web for technical information and best practices"
    args_schema: type[BaseModel] = SearchInput
    
    def _run(self, query: str) -> str:
        # In production: integrate with Tavily or Serper
        return f"Search results for '{query}': [Best practices documentation...]"
```

---

## 5. Sequential Process

```python
# src/crews/sequential_crew.py

from crewai import Crew, Process
from src.agents.company_agents import *
from src.tasks.development_tasks import create_feature_tasks

def run_sequential_crew(requirement: str):
    """Run IT Company as sequential pipeline"""
    
    tasks = create_feature_tasks(requirement)
    
    crew = Crew(
        agents=[pm_agent, backend_dev, qa_agent, 
                security_agent, docs_agent, devops_agent],
        tasks=tasks,
        process=Process.sequential,  # Task 1 → 2 → 3 → 4 → 5 → 6
        verbose=True,
        memory=True,              # Enable memory across tasks
        embedder={                # For memory embeddings
            "provider": "openai",
            "config": {"model": "text-embedding-3-small"}
        }
    )
    
    result = crew.kickoff(inputs={
        "requirement": requirement
    })
    
    return result

# Run
if __name__ == "__main__":
    result = run_sequential_crew(
        "Build a user authentication API with JWT, rate limiting, "
        "and email verification"
    )
    print(result)
```

---

## 6. Hierarchical Process

```python
# src/crews/hierarchical_crew.py

from crewai import Crew, Process

def run_hierarchical_crew(requirement: str):
    """Run IT Company with manager agent coordinating"""
    
    tasks = create_feature_tasks(requirement)
    
    crew = Crew(
        agents=[pm_agent, backend_dev, qa_agent, 
                security_agent, docs_agent, devops_agent],
        tasks=tasks,
        process=Process.hierarchical,
        manager_llm="gpt-4o",     # Auto-creates manager agent
        verbose=True,
        memory=True
    )
    
    # Manager automatically:
    # 1. Reviews all tasks
    # 2. Assigns to best agent
    # 3. Reviews output quality
    # 4. Re-assigns if needed
    # 5. Compiles final result
    
    result = crew.kickoff(inputs={"requirement": requirement})
    return result
```

---

## 7. IT Company Full Example

```python
# src/main.py — Complete CrewAI IT Company

from crewai import Agent, Task, Crew, Process

def build_it_company():
    """Build complete IT Company Agent Crew"""
    
    # Define all agents
    pm = Agent(
        role="Project Manager",
        goal="Create detailed, actionable development plans",
        backstory="Expert PM with 10 years agile experience",
        llm="gpt-4o",
        verbose=True,
        allow_delegation=True
    )
    
    architect = Agent(
        role="Software Architect",
        goal="Design scalable, maintainable system architecture",
        backstory="Principal architect with expertise in distributed systems",
        llm="gpt-4o",
        verbose=True
    )
    
    backend = Agent(
        role="Backend Developer",
        goal="Implement robust, tested backend services",
        backstory="Senior dev: Python, FastAPI, PostgreSQL, Redis",
        llm="gpt-4o",
        verbose=True
    )
    
    frontend = Agent(
        role="Frontend Developer",
        goal="Build responsive, accessible UIs",
        backstory="Senior dev: React, TypeScript, Next.js",
        llm="gpt-4o",
        verbose=True
    )
    
    qa = Agent(
        role="QA Engineer",
        goal="Ensure zero critical bugs reach production",
        backstory="10 years QA, automated + manual testing expert",
        llm="gpt-4o",
        verbose=True
    )
    
    security = Agent(
        role="Security Engineer",
        goal="Protect against all OWASP Top 10 vulnerabilities",
        backstory="CISSP certified, penetration testing background",
        llm="gpt-4o",
        verbose=True
    )
    
    devops = Agent(
        role="DevOps Engineer",
        goal="Ensure reliable CI/CD and infrastructure",
        backstory="Expert in Docker, K8s, GitHub Actions, AWS",
        llm="gpt-4o-mini",
        verbose=True
    )
    
    # Define task pipeline
    t1 = Task(
        description="Analyze requirement and create architecture docs: {requirement}",
        expected_output="Architecture document with diagrams, tech stack, and data flow",
        agent=architect
    )
    
    t2 = Task(
        description="Create sprint plan with tasks based on architecture",
        expected_output="Sprint plan with prioritized tasks and assignments",
        agent=pm,
        context=[t1]
    )
    
    t3 = Task(
        description="Implement the backend services and APIs",
        expected_output="Complete backend code with API endpoints and DB models",
        agent=backend,
        context=[t1, t2]
    )
    
    t4 = Task(
        description="Implement the frontend UI and components",
        expected_output="React components, pages, and API integration code",
        agent=frontend,
        context=[t1, t2]
    )
    
    t5 = Task(
        description="Review all code and write comprehensive tests",
        expected_output="Test results, coverage report, code review findings",
        agent=qa,
        context=[t3, t4]
    )
    
    t6 = Task(
        description="Security audit of all code and infrastructure",
        expected_output="Security audit report with findings and remediation",
        agent=security,
        context=[t3, t4]
    )
    
    t7 = Task(
        description="Create deployment pipeline and infrastructure",
        expected_output="Dockerfile, CI/CD config, K8s manifests, monitoring setup",
        agent=devops,
        context=[t3, t5, t6]
    )
    
    # Create and run crew
    company = Crew(
        agents=[architect, pm, backend, frontend, qa, security, devops],
        tasks=[t1, t2, t3, t4, t5, t6, t7],
        process=Process.sequential,
        verbose=True,
        memory=True
    )
    
    return company

if __name__ == "__main__":
    company = build_it_company()
    result = company.kickoff(inputs={
        "requirement": """
        Build an e-commerce checkout system with:
        - Shopping cart management
        - Payment processing (Stripe integration)
        - Order confirmation emails
        - Order history
        - Inventory management
        """
    })
    
    print("\n" + "=" * 60)
    print("🏢 IT COMPANY AGENT - FINAL DELIVERABLE")
    print("=" * 60)
    print(result)
```

---

## 8. Advanced Features

### 8.1 Agent Memory

```python
# CrewAI built-in memory types:

crew = Crew(
    # ...
    memory=True,       # Enable all memory types
    
    # Short-term: conversation within this run
    # Long-term: learnings across runs (persistent)
    # Entity: remembers facts about entities
    
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)

# After running, agents remember:
# - Past coding patterns used
# - What worked and what didn't
# - Team preferences and standards
```

### 8.2 Human Input

```python
# Allow human input during execution

human_in_loop_agent = Agent(
    role="Backend Developer",
    goal="Write production code",
    backstory="...",
    human_input=True  # Will ask human for feedback
)
```

### 8.3 Callbacks

```python
from crewai.tasks.task_output import TaskOutput

def task_callback(output: TaskOutput):
    """Called after each task completes"""
    print(f"\n📋 Task completed: {output.description[:50]}...")
    print(f"   Agent: {output.agent}")
    print(f"   Output length: {len(output.raw)} chars")

task = Task(
    description="...",
    agent=backend_dev,
    callback=task_callback
)
```

---

## 9. CrewAI vs LangGraph

```
When to choose:

CrewAI:
├── ✅ Quick prototyping & POC
├── ✅ Role-based thinking (intuitive)
├── ✅ Less code to write
├── ✅ Good for linear workflows
├── ❌ Limited flow control
├── ❌ No conditional routing
├── ❌ Basic state management
└── ❌ Limited HITL support

LangGraph:
├── ✅ Complex workflows with loops & conditions
├── ✅ Fine-grained state management
├── ✅ Built-in checkpointing & HITL
├── ✅ Production observability (LangSmith)
├── ✅ Subgraphs (team of teams)
├── ❌ More code to write
├── ❌ Steeper learning curve
└── ❌ More configuration needed

Recommendation:
├── Start with CrewAI for quick MVP
├── Move to LangGraph when you need:
│   ├── Conditional routing
│   ├── Complex state management
│   ├── Human-in-the-loop
│   └── Production deployment
└── Both can be used together in different parts of the system
```

---

**Tiếp theo:** [Bài 9: Deployment & Production →](./09-Deployment-Production.md)
