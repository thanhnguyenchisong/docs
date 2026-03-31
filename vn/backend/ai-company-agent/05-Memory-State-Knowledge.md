# Bài 5: Memory, State & Knowledge

## Mục lục
- [1. Memory Types trong AI Agent](#1-memory-types-trong-ai-agent)
- [2. Short-term Memory](#2-short-term-memory)
- [3. Long-term Memory](#3-long-term-memory)
- [4. Episodic Memory](#4-episodic-memory)
- [5. Shared Memory](#5-shared-memory)
- [6. State Management](#6-state-management)
- [7. Knowledge Base & RAG](#7-knowledge-base--rag)
- [8. Vector Databases](#8-vector-databases)

---

## 1. Memory Types trong AI Agent

### 1.1 Memory Architecture

```
AI Agent Memory System:

┌─────────────────────────────────────────────────────────┐
│                  AGENT MEMORY                           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SHORT-TERM MEMORY (Working Memory)              │   │
│  │  ├── Current conversation context                │   │
│  │  ├── Current task details                        │   │
│  │  ├── Recent tool call results                    │   │
│  │  └── Immediate context window (LLM input)        │   │
│  │  Duration: Current session only                   │   │
│  │  Storage: In-memory / LLM context window          │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  LONG-TERM MEMORY (Persistent)                   │   │
│  │  ├── Past conversations summary                  │   │
│  │  ├── Learned facts & preferences                 │   │
│  │  ├── Code patterns & solutions                   │   │
│  │  └── User/project knowledge                      │   │
│  │  Duration: Permanent (across sessions)            │   │
│  │  Storage: Vector DB (Pinecone, Chroma, Weaviate)  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  EPISODIC MEMORY (Experiences)                   │   │
│  │  ├── Past task executions (success/failure)      │   │
│  │  ├── Debugging sessions (what worked)            │   │
│  │  ├── Decision outcomes                           │   │
│  │  └── Error patterns & resolutions                │   │
│  │  Duration: Permanent                              │   │
│  │  Storage: Structured DB + Vector DB               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  SHARED MEMORY (Cross-agent)                     │   │
│  │  ├── Project state (tasks, status, artifacts)    │   │
│  │  ├── Team knowledge base                         │   │
│  │  ├── Coding standards & guidelines               │   │
│  │  └── Architecture decisions log (ADR)            │   │
│  │  Duration: Project lifetime                       │   │
│  │  Storage: Shared state store (Redis, DB)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Short-term Memory

### 2.1 Conversation Buffer

```python
# Short-term Memory — Conversation Buffer

from langchain.memory import ConversationBufferMemory

# Simple buffer: keeps ALL messages
memory = ConversationBufferMemory(return_messages=True)

memory.save_context(
    {"input": "Implement login API"},
    {"output": "I'll create a FastAPI endpoint with JWT auth..."}
)

# Problem: Context window fills up with long conversations
# Solution: Sliding window or summarization
```

### 2.2 Sliding Window Memory

```python
from langchain.memory import ConversationBufferWindowMemory

# Keep only last K messages
memory = ConversationBufferWindowMemory(k=10, return_messages=True)

# Only retains the 10 most recent exchanges
# Older messages are discarded
```

### 2.3 Summary Memory

```python
from langchain.memory import ConversationSummaryBufferMemory

# Summarize old messages, keep recent ones verbatim
memory = ConversationSummaryBufferMemory(
    llm=llm,
    max_token_limit=2000,  # When tokens exceed this, summarize
    return_messages=True
)

# Flow:
# Messages 1-50: Summarized → "Dev discussed auth implementation..."
# Messages 51-60: Kept verbatim (most recent, full detail)
```

---

## 3. Long-term Memory

### 3.1 Vector-based Long-term Memory

```python
# Long-term Memory using Vector Database

from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

# Setup vector store for agent memories
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

memory_store = Chroma(
    collection_name="dev_agent_memory",
    embedding_function=embeddings,
    persist_directory="./data/memories"
)

# Store a memory
def remember(agent_name, content, metadata=None):
    """Store information in long-term memory"""
    doc_metadata = {
        "agent": agent_name,
        "timestamp": datetime.now().isoformat(),
        "type": "learned_fact",
        **(metadata or {})
    }
    memory_store.add_texts(
        texts=[content],
        metadatas=[doc_metadata]
    )

# Recall relevant memories
def recall(query, agent_name=None, k=5):
    """Retrieve relevant memories"""
    filter_dict = {"agent": agent_name} if agent_name else None
    results = memory_store.similarity_search(
        query=query,
        k=k,
        filter=filter_dict
    )
    return [doc.page_content for doc in results]

# Usage:
remember("dev_agent", 
    "The project uses FastAPI 0.100+ with Pydantic v2 models. "
    "All endpoints must return standard response format: "
    "{'status': str, 'data': Any, 'message': str}")

remember("dev_agent",
    "Rate limiting is implemented using slowapi library. "
    "Default: 100 requests/minute per API key.")

# When Dev Agent needs context:
relevant = recall("How to implement rate limiting?")
# → Returns: ["Rate limiting is implemented using slowapi..."]
```

### 3.2 Structured Long-term Memory

```python
# Structured memory for precise recall

class AgentMemoryDB:
    """PostgreSQL-backed structured memory"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
    
    # Memory types:
    
    def store_fact(self, agent, category, key, value):
        """Store a factual piece of knowledge"""
        # facts table: agent, category, key, value, timestamp
        # Example: ("dev_agent", "tech_stack", "orm", "SQLAlchemy")
        pass
    
    def store_decision(self, agent, context, decision, reasoning):
        """Store a decision with reasoning"""
        # decisions table: agent, context, decision, reasoning, timestamp
        pass
    
    def store_task_result(self, agent, task_id, result, success, notes):
        """Store task execution result"""
        # task_results table: agent, task_id, result, success, notes, timestamp
        pass
    
    def query_facts(self, agent=None, category=None):
        """Query stored facts"""
        pass
    
    def query_similar_tasks(self, description, k=5):
        """Find similar past tasks (hybrid: SQL + vector)"""
        pass
```

---

## 4. Episodic Memory

### 4.1 Experience Replay

```python
# Episodic Memory — Agent learns from past experiences

class EpisodicMemory:
    """
    Stores past task executions as episodes.
    Agents can recall similar episodes to improve performance.
    """
    
    def __init__(self, vector_store):
        self.vector_store = vector_store
    
    def store_episode(self, episode):
        """Store a complete task episode"""
        content = f"""
        Task: {episode['task']}
        Plan: {episode['plan']}
        Actions Taken: {episode['actions']}
        Result: {episode['result']}
        Success: {episode['success']}
        Lessons Learned: {episode['lessons']}
        Time Taken: {episode['duration']}
        """
        
        self.vector_store.add_texts(
            texts=[content],
            metadatas=[{
                "task_type": episode['task_type'],
                "success": episode['success'],
                "agent": episode['agent'],
                "timestamp": datetime.now().isoformat()
            }]
        )
    
    def recall_similar(self, current_task, k=3):
        """Find similar past episodes"""
        episodes = self.vector_store.similarity_search(
            query=current_task,
            k=k,
            filter={"success": True}  # Only successful episodes
        )
        return episodes

# Usage:
episodic = EpisodicMemory(vector_store)

# After completing a task:
episodic.store_episode({
    "task": "Implement JWT authentication",
    "task_type": "backend_api",
    "agent": "dev_agent",
    "plan": "1. Install pyjwt 2. Create token utils 3. Add middleware",
    "actions": "Created auth/jwt.py, auth/middleware.py, tests/test_auth.py",
    "result": "JWT auth working with refresh tokens",
    "success": True,
    "lessons": "Remember to handle token expiry gracefully. "
               "Use httponly cookies for refresh tokens.",
    "duration": "2 hours"
})

# When starting a similar task:
past_episodes = episodic.recall_similar("Implement OAuth2 authentication")
# → Returns similar JWT auth episode
# → Agent uses lessons learned to do better this time
```

---

## 5. Shared Memory

### 5.1 Cross-Agent Shared State

```python
# Shared Memory — All agents access

class SharedCompanyMemory:
    """
    Central knowledge store accessible by all agents.
    Acts as the company's institutional knowledge.
    """
    
    def __init__(self, redis_url, vector_store):
        self.redis = Redis.from_url(redis_url)
        self.vector_store = vector_store
    
    # ═══════════════════════════════════════
    # Project State (Redis — fast access)
    # ═══════════════════════════════════════
    
    def get_project_state(self):
        return json.loads(self.redis.get("project:state"))
    
    def update_task_status(self, task_id, status, agent):
        """Any agent can update task status"""
        task = json.loads(self.redis.get(f"task:{task_id}"))
        task["status"] = status
        task["updated_by"] = agent
        task["updated_at"] = datetime.now().isoformat()
        self.redis.set(f"task:{task_id}", json.dumps(task))
        
        # Publish event for other agents
        self.redis.publish("task_updates", json.dumps({
            "task_id": task_id,
            "status": status,
            "agent": agent
        }))
    
    # ═══════════════════════════════════════
    # Code Artifacts (Redis — structured)
    # ═══════════════════════════════════════
    
    def store_artifact(self, name, content, agent, artifact_type):
        self.redis.hset(f"artifact:{name}", mapping={
            "content": content,
            "author": agent,
            "type": artifact_type,
            "created": datetime.now().isoformat()
        })
    
    def get_artifact(self, name):
        return self.redis.hgetall(f"artifact:{name}")
    
    # ═══════════════════════════════════════
    # Knowledge Base (Vector DB — semantic search)
    # ═══════════════════════════════════════
    
    def add_knowledge(self, content, metadata):
        """Add to shared knowledge base"""
        self.vector_store.add_texts([content], [metadata])
    
    def search_knowledge(self, query, k=5):
        """Semantic search in shared knowledge"""
        return self.vector_store.similarity_search(query, k=k)
    
    # ═══════════════════════════════════════
    # Decision Log (Append-only)
    # ═══════════════════════════════════════
    
    def log_decision(self, agent, decision, reasoning, context):
        """Log architectural/technical decisions"""
        entry = {
            "agent": agent,
            "decision": decision,
            "reasoning": reasoning,
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        self.redis.rpush("decisions:log", json.dumps(entry))
```

### 5.2 Memory trong LangGraph State

```python
from typing import TypedDict, Annotated
import operator

class CompanyState(TypedDict):
    # Append-only message history (shared across all agents)
    messages: Annotated[list, operator.add]
    
    # Shared artifacts
    artifacts: dict[str, str]      # filename → content
    
    # Task board (shared)
    task_board: dict[str, list]    # status → [tasks]
    
    # Knowledge entries added during execution
    knowledge_entries: Annotated[list, operator.add]
    
    # Decision log
    decisions: Annotated[list, operator.add]
    
    # Agent-specific scratchpads
    agent_notes: dict[str, str]    # agent_name → notes

# Each agent reads shared state and contributes back:
def dev_agent(state: CompanyState) -> dict:
    # Read shared context
    past_decisions = state.get("decisions", [])
    existing_code = state.get("artifacts", {})
    
    # ... do work ...
    
    # Contribute back to shared state
    return {
        "artifacts": {"auth.py": new_code},        # Add artifact
        "messages": [{"from": "dev", "msg": "..."}], # Add message
        "decisions": [{"decision": "Use bcrypt", "reasoning": "..."}]
    }
```

---

## 6. State Management

### 6.1 State Patterns

```
State Management Patterns:

1. CENTRALIZED STATE (Single Source of Truth)
   ┌─────────────────┐
   │  CENTRAL STATE   │←── All agents read/write
   │  (Redis / DB)    │
   └─────────────────┘
   ✅ Consistent
   ❌ Bottleneck, single point of failure

2. DISTRIBUTED STATE (Each agent owns part)
   ┌─────┐ ┌─────┐ ┌─────┐
   │Dev  │ │QA   │ │DevOp│ ← Each owns their state
   │State│ │State│ │State│
   └──┬──┘ └──┬──┘ └──┬──┘
      └───────┼───────┘
         Sync via messages
   ✅ No bottleneck
   ❌ Consistency challenges

3. EVENT-SOURCED STATE
   All state changes = sequence of events
   State = replay all events from beginning
   ┌────────────────────────────────────┐
   │ Event 1: task.created             │
   │ Event 2: task.assigned(dev_agent) │
   │ Event 3: code.written             │
   │ Event 4: review.requested         │
   │ Event 5: review.passed            │
   │ Event 6: deployed                 │
   └────────────────────────────────────┘
   ✅ Full audit trail, time travel
   ❌ Complex, storage grows
```

### 6.2 LangGraph Checkpointing

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.postgres import PostgresSaver

# SQLite (development)
checkpointer = SqliteSaver.from_conn_string("./data/checkpoints.db")

# PostgreSQL (production)
checkpointer = PostgresSaver.from_conn_string(
    "postgresql://user:pass@localhost/agents"
)

# Compile graph with checkpointing
app = workflow.compile(checkpointer=checkpointer)

# Run with thread ID (enables resume)
config = {"configurable": {"thread_id": "project-alpha-001"}}

# First run
result = app.invoke(initial_state, config)

# Resume from checkpoint (after human approval, error recovery, etc.)
result = app.invoke(
    {"human_decision": "approved"},
    config  # Same thread_id → resumes from last checkpoint
)

# Time-travel: replay from any checkpoint
history = app.get_state_history(config)
for state in history:
    print(state.values["status"], state.created_at)
```

---

## 7. Knowledge Base & RAG

### 7.1 RAG cho Multi-Agent

```
RAG (Retrieval-Augmented Generation) cho Company Agents:

┌─────────────────────────────────────────────────────┐
│                KNOWLEDGE SOURCES                     │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐  │
│  │ Codebase   │ │ Docs       │ │ Past Projects  │  │
│  │ (Git repos)│ │ (Confluence)│ │ (Jira history) │  │
│  └─────┬──────┘ └─────┬──────┘ └───────┬────────┘  │
│        │               │                │            │
│        └───────────────┼────────────────┘            │
│                        ▼                             │
│              ┌─────────────────┐                     │
│              │   INDEXING      │                     │
│              │ ├── Chunk docs  │                     │
│              │ ├── Embed       │                     │
│              │ └── Store       │                     │
│              └────────┬────────┘                     │
│                       ▼                              │
│              ┌─────────────────┐                     │
│              │  VECTOR DB      │                     │
│              │ (Chroma/Pine)   │                     │
│              └────────┬────────┘                     │
│                       │                              │
│  ┌────────────────────┼────────────────────────┐     │
│  │ RETRIEVAL          │                        │     │
│  │                    ▼                        │     │
│  │  Agent query → Semantic search → Top K docs │     │
│  │                    ▼                        │     │
│  │  LLM generates response WITH retrieved docs │     │
│  └─────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 7.2 Multi-Agent RAG Implementation

```python
from langchain_community.document_loaders import (
    GitLoader, 
    ConfluenceLoader,
    DirectoryLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

# ═══════════════════════════════════════
# 1. Load & Index Knowledge
# ═══════════════════════════════════════

# Load codebase
code_loader = DirectoryLoader("./project/src", glob="**/*.py")
code_docs = code_loader.load()

# Load documentation
doc_loader = DirectoryLoader("./project/docs", glob="**/*.md")
doc_docs = doc_loader.load()

# Chunk documents
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", " "]
)
chunks = splitter.split_documents(code_docs + doc_docs)

# Create vector store
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
knowledge_base = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    collection_name="company_knowledge",
    persist_directory="./data/knowledge"
)

# ═══════════════════════════════════════
# 2. Agent uses RAG
# ═══════════════════════════════════════
def dev_agent_with_rag(state):
    task = state["current_task"]
    
    # Retrieve relevant code & docs
    relevant_docs = knowledge_base.similarity_search(
        query=task["description"],
        k=5,
        filter={"source_type": "code"}  # Filter by type
    )
    
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    
    # Generate with context
    response = llm.invoke([
        {"role": "system", "content": f"""You are a Senior Developer.
        
Use this existing codebase context to write consistent code:
{context}"""},
        {"role": "user", "content": f"Task: {task['description']}"}
    ])
    
    return {"code": response.content}
```

---

## 8. Vector Databases

### 8.1 Comparison

```
Vector DB Comparison:

┌─────────────┬────────────┬────────┬───────────┬──────────┐
│ Database    │ Type       │ Cost   │ Scale     │ Best For │
├─────────────┼────────────┼────────┼───────────┼──────────┤
│ Chroma      │ Embedded   │ Free   │ Small-Med │ Dev/POC  │
│ Pinecone    │ Cloud      │ $$     │ Large     │ Prod     │
│ Weaviate    │ Self-host  │ Free*  │ Large     │ Prod     │
│ Qdrant      │ Self-host  │ Free*  │ Large     │ Prod     │
│ pgvector    │ PostgreSQL │ Free*  │ Medium    │ Simple   │
│ Milvus      │ Self-host  │ Free*  │ Very Large│ ML teams │
└─────────────┴────────────┴────────┴───────────┴──────────┘

Recommendation:
├── Development: Chroma (embedded, zero config)
├── Production (simple): pgvector (PostgreSQL extension)
├── Production (scale): Pinecone or Weaviate
└── On-premise: Qdrant or Weaviate (Docker)
```

---

## Tóm tắt

```
Memory Strategy cho IT Company Agent:

SHORT-TERM:
└── ConversationSummaryBuffer (summarize old, keep recent)

LONG-TERM:  
└── Vector DB (Chroma dev / Pinecone prod)
└── Store: facts, patterns, solutions

EPISODIC:
└── Past task results (success/failure + lessons)
└── Similar task lookup → improve over time

SHARED:
└── Redis for real-time state (tasks, artifacts)
└── Vector DB for knowledge base (code, docs)
└── Append-only decision log

STATE:
└── LangGraph TypedDict state + Checkpointing
└── PostgreSQL for persistence
```

---

**Tiếp theo:** [Bài 6: IT Company Agent Blueprint →](./06-Company-Blueprint.md)
