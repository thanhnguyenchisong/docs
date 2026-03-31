# Bài 9: Deployment & Production

## Mục lục
- [1. Production Architecture](#1-production-architecture)
- [2. Docker Containerization](#2-docker-containerization)
- [3. Observability & Monitoring](#3-observability--monitoring)
- [4. Cost Management](#4-cost-management)
- [5. Security](#5-security)
- [6. Scaling](#6-scaling)
- [7. CI/CD Pipeline](#7-cicd-pipeline)
- [8. Production Checklist](#8-production-checklist)

---

## 1. Production Architecture

### 1.1 System Architecture

```
Production Multi-Agent System Architecture:

┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                               │
│   [Web UI] [API] [Slack Bot] [CLI] [Webhook]            │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴────────────────────────────────┐
│                    API GATEWAY                           │
│   [Load Balancer] [Rate Limiter] [Auth] [CORS]          │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────┐
│                 AGENT ORCHESTRATOR                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  LangGraph / CrewAI Runtime                      │   │
│  │                                                   │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │
│  │  │  PM  │ │ Dev  │ │  QA  │ │DevOps│ │ Sec  │  │   │
│  │  │Agent │ │Agent │ │Agent │ │Agent │ │Agent │  │   │
│  │  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘  │   │
│  │     │        │        │        │        │       │   │
│  │  ┌──┴────────┴────────┴────────┴────────┴───┐   │   │
│  │  │          STATE MANAGEMENT                │   │   │
│  │  │     (LangGraph Checkpointer)             │   │   │
│  │  └──────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└───────┬──────────────┬───────────────┬──────────────────┘
        │              │               │
┌───────┴───┐  ┌──────┴──────┐ ┌──────┴───────┐
│ LLM APIs  │  │  Data Stores │ │   External   │
│           │  │              │ │   Services   │
│ OpenAI    │  │ PostgreSQL   │ │              │
│ Claude    │  │ Redis        │ │ GitHub API   │
│ Gemini    │  │ Chroma/Pine  │ │ Slack API    │
│           │  │ S3           │ │ Email SMTP   │
└───────────┘  └──────────────┘ └──────────────┘

Monitoring & Observability:
┌──────────────────────────────────────────────┐
│ LangSmith │ Prometheus │ Grafana │ PagerDuty │
└──────────────────────────────────────────────┘
```

---

## 2. Docker Containerization

### 2.1 Dockerfile

```dockerfile
# Dockerfile

FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ src/
COPY config/ config/

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2.2 Docker Compose

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ═══════════════════════════════════════
  # Main Application
  # ═══════════════════════════════════════
  agent-app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - LANGSMITH_API_KEY=${LANGSMITH_API_KEY}
      - LANGSMITH_TRACING_V2=true
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://agent:agent@postgres:5432/agentdb
      - CHROMA_HOST=chroma
      - CHROMA_PORT=8001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - agent-network

  # ═══════════════════════════════════════
  # PostgreSQL (State & Checkpoints)
  # ═══════════════════════════════════════
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: agentdb
      POSTGRES_USER: agent
      POSTGRES_PASSWORD: agent
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U agent"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - agent-network

  # ═══════════════════════════════════════
  # Redis (Cache, Pub/Sub, State)
  # ═══════════════════════════════════════
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - agent-network

  # ═══════════════════════════════════════
  # ChromaDB (Vector Store)
  # ═══════════════════════════════════════
  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma
    networks:
      - agent-network

  # ═══════════════════════════════════════
  # Monitoring
  # ═══════════════════════════════════════
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - agent-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - agent-network

volumes:
  postgres_data:
  redis_data:
  chroma_data:
  grafana_data:

networks:
  agent-network:
    driver: bridge
```

### 2.3 API Layer

```python
# src/api/main.py — FastAPI wrapper for agent system

from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel
from src.graph.company_graph import build_company_graph
import uuid

app = FastAPI(title="IT Company Agent API", version="1.0.0")

class ProjectRequest(BaseModel):
    requirement: str
    project_name: str = "Untitled Project"
    priority: str = "P2"

class ProjectStatus(BaseModel):
    project_id: str
    status: str
    current_agent: str
    progress: float
    artifacts: list[str]

# In-memory project tracker (use Redis in production)
projects = {}

@app.post("/api/projects", response_model=dict)
async def create_project(request: ProjectRequest, background: BackgroundTasks):
    """Start a new project — agents begin working"""
    project_id = str(uuid.uuid4())[:8]
    
    projects[project_id] = {
        "status": "starting",
        "requirement": request.requirement
    }
    
    # Run agents in background
    background.add_task(run_agents, project_id, request)
    
    return {"project_id": project_id, "status": "started"}

@app.get("/api/projects/{project_id}", response_model=ProjectStatus)
async def get_project_status(project_id: str):
    """Get current project status"""
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects[project_id]

@app.post("/api/projects/{project_id}/approve")
async def approve_deployment(project_id: str):
    """Human approves production deployment"""
    # Resume LangGraph from checkpoint
    pass

@app.get("/health")
async def health():
    return {"status": "healthy"}

async def run_agents(project_id: str, request: ProjectRequest):
    """Background task: run agent pipeline"""
    graph = build_company_graph()
    app = graph.compile()
    
    result = app.invoke({
        "requirement": request.requirement,
        "project_name": request.project_name,
        "tasks": [],
        "artifacts": {},
        "iteration_count": 0,
        "messages": [],
    })
    
    projects[project_id] = {
        "status": "completed",
        "artifacts": list(result.get("artifacts", {}).keys()),
        "deploy_status": result.get("deploy_status"),
    }
```

---

## 3. Observability & Monitoring

### 3.1 LangSmith (LLM Tracing)

```python
# LangSmith setup — automatic with env vars

# .env:
# LANGSMITH_API_KEY=ls-...
# LANGSMITH_PROJECT=it-company-agent
# LANGSMITH_TRACING_V2=true

# LangSmith provides:
# ├── Full trace of every LLM call
# ├── Input/output for each agent step
# ├── Latency breakdown per step
# ├── Token usage & cost per call
# ├── Error traces with context
# └── Feedback & evaluation tools
```

### 3.2 Prometheus Metrics

```python
# src/monitoring/metrics.py

from prometheus_client import Counter, Histogram, Gauge

# Agent metrics
agent_tasks_total = Counter(
    'agent_tasks_total',
    'Total tasks processed by agents',
    ['agent_name', 'status']  # labels
)

agent_task_duration = Histogram(
    'agent_task_duration_seconds',
    'Time taken to process a task',
    ['agent_name']
)

llm_calls_total = Counter(
    'llm_calls_total',
    'Total LLM API calls',
    ['provider', 'model']
)

llm_tokens_used = Counter(
    'llm_tokens_used_total',
    'Total tokens used',
    ['provider', 'model', 'type']  # input/output
)

llm_cost_dollars = Counter(
    'llm_cost_dollars_total',
    'Total cost in dollars',
    ['provider', 'model']
)

active_projects = Gauge(
    'active_projects',
    'Number of currently running projects'
)

# Usage in agent wrapper:
def track_agent_execution(agent_name, func):
    def wrapper(state):
        with agent_task_duration.labels(agent_name).time():
            try:
                result = func(state)
                agent_tasks_total.labels(agent_name, 'success').inc()
                return result
            except Exception as e:
                agent_tasks_total.labels(agent_name, 'error').inc()
                raise
    return wrapper
```

### 3.3 Structured Logging

```python
# src/monitoring/logger.py

import structlog

logger = structlog.get_logger()

# Agent-specific logging
def log_agent_action(agent_name, action, details=None):
    logger.info(
        "agent_action",
        agent=agent_name,
        action=action,
        details=details,
    )

# Usage:
log_agent_action("pm_agent", "task_created", {
    "task_id": "TASK-042",
    "assigned_to": "backend_dev",
    "priority": "P1"
})

log_agent_action("qa_agent", "review_completed", {
    "verdict": "PASS",
    "issues_found": 0,
    "suggestions": 3
})
```

---

## 4. Cost Management

### 4.1 Cost Tracking

```python
# src/monitoring/cost_tracker.py

# Token pricing (as of 2025-2026, verify current rates)
PRICING = {
    "gpt-4o": {"input": 2.50 / 1_000_000, "output": 10.00 / 1_000_000},
    "gpt-4o-mini": {"input": 0.15 / 1_000_000, "output": 0.60 / 1_000_000},
    "claude-3-5-sonnet": {"input": 3.00 / 1_000_000, "output": 15.00 / 1_000_000},
    "text-embedding-3-small": {"input": 0.02 / 1_000_000},
}

class CostTracker:
    def __init__(self):
        self.total_cost = 0.0
        self.calls = []
    
    def track_call(self, model, input_tokens, output_tokens):
        pricing = PRICING.get(model, {})
        cost = (
            input_tokens * pricing.get("input", 0) +
            output_tokens * pricing.get("output", 0)
        )
        self.total_cost += cost
        self.calls.append({
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost": cost
        })
        return cost
    
    def get_report(self):
        return {
            "total_cost": round(self.total_cost, 4),
            "total_calls": len(self.calls),
            "by_model": self._group_by_model()
        }
```

### 4.2 Cost Optimization Strategies

```python
# Model routing: use cheap models for simple tasks

class SmartModelRouter:
    """Route to different LLMs based on task complexity"""
    
    TASK_COMPLEXITY = {
        "documentation": "gpt-4o-mini",
        "formatting": "gpt-4o-mini",
        "status_report": "gpt-4o-mini",
        "code_generation": "gpt-4o",
        "architecture": "gpt-4o",
        "security_review": "gpt-4o",
        "code_review": "gpt-4o",
    }
    
    def get_model(self, task_type):
        return self.TASK_COMPLEXITY.get(task_type, "gpt-4o")

# Caching: avoid duplicate LLM calls
from functools import lru_cache
import hashlib

class LLMCache:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def get_or_call(self, prompt_hash, llm_func, *args):
        cached = self.redis.get(f"llm_cache:{prompt_hash}")
        if cached:
            return cached  # Cache hit — free!
        
        result = llm_func(*args)
        self.redis.setex(
            f"llm_cache:{prompt_hash}",
            3600,  # 1 hour TTL
            result
        )
        return result
```

---

## 5. Security

### 5.1 Security Best Practices

```
Multi-Agent Security Checklist:

API KEY MANAGEMENT:
├── ✅ Store API keys in environment variables / secrets manager
├── ✅ Never commit keys to git
├── ✅ Rotate keys regularly
├── ✅ Use different keys per environment (dev/staging/prod)
└── ✅ Monitor key usage for anomalies

AGENT ISOLATION:
├── ✅ Each agent runs in separate container/process
├── ✅ Agents cannot access other agents' credentials
├── ✅ File system access is sandboxed
├── ✅ Network access is restricted (egress rules)
└── ✅ Code execution in sandboxed environment (Docker/E2B)

INPUT VALIDATION:
├── ✅ Validate all inputs from users
├── ✅ Sanitize agent outputs before displaying
├── ✅ Prevent prompt injection attacks
├── ✅ Rate limit API endpoints
└── ✅ Max token limits on LLM calls

DATA PROTECTION:
├── ✅ Encrypt data at rest (database, vector store)
├── ✅ Encrypt data in transit (TLS/HTTPS)
├── ✅ PII detection and masking in logs
├── ✅ Data retention policies
└── ✅ GDPR compliance for user data
```

### 5.2 Prompt Injection Prevention

```python
# Prevent prompt injection in agent inputs

import re

def sanitize_user_input(user_input: str) -> str:
    """Sanitize user input to prevent prompt injection"""
    
    # Remove common injection patterns
    dangerous_patterns = [
        r"ignore previous instructions",
        r"ignore all previous",
        r"disregard (?:all|your|the) (?:previous|above)",
        r"you are now",
        r"act as",
        r"pretend (?:to be|you are)",
        r"system:\s*",
        r"<\|.*?\|>",
    ]
    
    sanitized = user_input
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, "[FILTERED]", sanitized, flags=re.IGNORECASE)
    
    # Limit length
    max_length = 10000
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length] + "... [truncated]"
    
    return sanitized

# Apply to all user-facing agent inputs
def create_project(requirement: str):
    safe_requirement = sanitize_user_input(requirement)
    # ... pass to agents
```

---

## 6. Scaling

### 6.1 Scaling Strategies

```
Scaling Multi-Agent Systems:

1. HORIZONTAL SCALING (More instances)
   ├── Run multiple agent-app containers
   ├── Load balancer distributes requests
   ├── Shared state via Redis/PostgreSQL
   └── Stateless design required

2. VERTICAL SCALING (Bigger machines)
   ├── More CPU/RAM for agent containers
   ├── Faster LLM inference (GPU if local)
   └── Simpler but has limits

3. AGENT POOLING
   ├── Pool of Dev Agents (3-5 instances)
   ├── Tasks distributed across pool
   ├── Parallel task execution
   └── Throughput multiplied

4. QUEUE-BASED SCALING
   ┌─────────┐     ┌────────┐     ┌────────────┐
   │ API     ├────→│ Queue  ├────→│ Workers    │
   │ Gateway │     │(Redis/ │     │ (Agents)   │
   └─────────┘     │ RabbitMQ)    │ Auto-scale │
                   └────────┘     └────────────┘
   └── Scale workers based on queue depth
```

---

## 7. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy IT Company Agent

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: it-company-agent

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: pip install pytest pytest-cov
      - run: pytest tests/ -v --cov=src --cov-report=xml

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Pull latest image and restart
          ssh ${{ secrets.DEPLOY_HOST }} << 'EOF'
            cd /opt/it-company-agent
            docker compose pull
            docker compose up -d --remove-orphans
          EOF
```

---

## 8. Production Checklist

```
🚀 Production Readiness Checklist:

INFRASTRUCTURE:
├── [ ] Docker containers built and tested
├── [ ] docker-compose.yml with all services
├── [ ] Health checks for all services
├── [ ] Persistent volumes for data
├── [ ] Network isolation configured
└── [ ] Resource limits set (CPU, memory)

SECURITY:
├── [ ] API keys in secrets manager (not env files)
├── [ ] HTTPS enabled
├── [ ] Rate limiting configured
├── [ ] Input sanitization (anti-injection)
├── [ ] CORS properly configured
├── [ ] Non-root container users
└── [ ] Security scan passed

OBSERVABILITY:
├── [ ] LangSmith tracing enabled
├── [ ] Prometheus metrics exposed
├── [ ] Grafana dashboards created
├── [ ] Structured logging (JSON)
├── [ ] Error alerting (PagerDuty/Slack)
└── [ ] Cost tracking active

RELIABILITY:
├── [ ] Retry logic with exponential backoff
├── [ ] Circuit breakers for external APIs
├── [ ] Graceful degradation (fallback models)
├── [ ] Checkpoint/resume capability
├── [ ] Rollback procedure documented
└── [ ] Disaster recovery plan

OPERATIONS:
├── [ ] CI/CD pipeline working
├── [ ] Automated tests > 80% coverage
├── [ ] Runbook for common issues
├── [ ] On-call rotation defined
├── [ ] SLA defined (availability, latency)
└── [ ] Cost budget and alerts set
```

---

## Tóm tắt toàn bộ

```
IT Company Agent System — Summary:

📚 LÝ THUYẾT (Bài 1-3):
├── Bài 1: Multi-Agent Theory (properties, MAS, communication)
├── Bài 2: Agent Patterns (ReAct, Plan-Execute, Supervisor)
└── Bài 3: Orchestration (message passing, state, events, HITL)

🔧 CÔNG NGHỆ (Bài 4-5):
├── Bài 4: Tech Stack (LangGraph, CrewAI, AutoGen, LLMs)
└── Bài 5: Memory & State (short/long-term, RAG, vector DB)

📐 THIẾT KẾ & BUILD (Bài 6-9):
├── Bài 6: Blueprint (12 agents, roles, RACI, workflows)
├── Bài 7: Implementation — LangGraph (graph, state, nodes)
├── Bài 8: Implementation — CrewAI (agents, tasks, crews)
└── Bài 9: Deployment (Docker, monitoring, security, CI/CD)

RECOMMENDED PATH:
1. Study theory (Bài 1-3) → 1 week
2. Hands-on frameworks (Bài 4-5) → 1 week
3. Design blueprint (Bài 6) → 3 days
4. Build MVP with CrewAI (Bài 8) → 1 week
5. Migrate to LangGraph (Bài 7) → 1 week
6. Productionize (Bài 9) → 1 week
```

---

**Quay lại:** [← README](./README.md)
