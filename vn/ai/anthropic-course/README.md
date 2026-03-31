# Anthropic Courses — Tổng hợp các khóa học chính thức

## 📚 Nguồn học chính thức từ Anthropic

Anthropic cung cấp tài liệu học qua **3 kênh chính**:

---

## 1. 🎓 GitHub Courses (github.com/anthropics/courses)

> **Repo chính:** [https://github.com/anthropics/courses](https://github.com/anthropics/courses)
> ⭐ 20k stars | Jupyter Notebooks | Miễn phí

### 5 Khóa học (theo thứ tự nên học):

| # | Khóa học | Nội dung chính | Level |
|---|---------|----------------|-------|
| 1 | **[Anthropic API Fundamentals](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals)** | API key, model params, multimodal prompts, streaming | Beginner |
| 2 | **[Prompt Engineering Interactive Tutorial](https://github.com/anthropics/courses/tree/master/prompt_engineering_interactive_tutorial)** | 9 chapters: roles, CoT, XML tags, output format, avoiding hallucinations | Beginner → Intermediate |
| 3 | **[Real World Prompting](https://github.com/anthropics/courses/tree/master/real_world_prompting)** | Complex prompts cho production, real use cases | Intermediate |
| 4 | **[Prompt Evaluations](https://github.com/anthropics/courses/tree/master/prompt_evaluations)** | Đo lường quality prompts, eval frameworks | Intermediate → Advanced |
| 5 | **[Tool Use](https://github.com/anthropics/courses/tree/master/tool_use)** | Function calling, tool integration, workflows | Advanced |

### Chi tiết từng khóa:

#### Course 1: Anthropic API Fundamentals
```
Nội dung:
├── Getting API key & setup
├── Model parameters (temperature, max_tokens, top_p)
├── Messages API format
├── System prompts
├── Multimodal (text + images)
├── Streaming responses
└── Error handling & retries
```

#### Course 2: Prompt Engineering Interactive Tutorial (9 Chapters)
```
Chapter 1: Basic Prompt Structure
Chapter 2: Being Clear and Direct
Chapter 3: Assigning Roles (System Prompts)
Chapter 4: Separating Data from Instructions (XML tags)
Chapter 5: Formatting Output (JSON, lists, etc.)
Chapter 6: Thinking Step by Step (Chain-of-Thought)
Chapter 7: Using Examples (Few-shot)
Chapter 8: Avoiding Hallucinations
Chapter 9: Complex Prompts (chaining techniques)

Mỗi chapter có:
├── Lesson (lý thuyết)
├── Exercises (bài tập)
└── Playground (thử nghiệm)
```

#### Course 3: Real World Prompting
```
Nội dung:
├── Customer support chatbot prompts
├── Content generation prompts
├── Data extraction & classification
├── Code generation prompts
├── Summarization prompts
└── Complex multi-step workflows
```

#### Course 4: Prompt Evaluations
```
Nội dung:
├── Tại sao cần evaluate prompts
├── Evaluation metrics
├── Automated evaluation pipelines
├── A/B testing prompts
├── Scoring & benchmarking
└── Continuous improvement workflow
```

#### Course 5: Tool Use (Function Calling)
```
Nội dung:
├── Tool use basics
├── Defining tools (JSON schema)
├── Tool choice (auto, required, specific)
├── Multi-tool workflows
├── Error handling in tool calls
├── Sequential tool chains
├── Parallel tool execution
└── Building agentic systems with tools
```

---

## 2. 🏫 Anthropic Academy (anthropic.skilljar.com)

> **Portal:** [https://anthropic.skilljar.com/](https://anthropic.skilljar.com/)
> Self-paced | Certificates | Miễn phí

### Các tracks:

```
FOUNDATION LAYER (Non-Technical):
├── Claude 101 — Giới thiệu cơ bản dùng Claude
├── AI Fluency: Framework & Foundations
├── AI Fluency for Students
├── AI Fluency for Educators
├── AI Fluency for Nonprofits
└── Teaching AI Fluency

BUILDER LAYER (Technical):
├── Building with the Claude API
│   ├── Authentication
│   ├── Message construction
│   ├── Tool use
│   └── Response handling
├── Introduction to Agent Skills
│   ├── Build agents
│   ├── Configure skills
│   └── Share & deploy
└── Claude Code in Action
    ├── Setup Claude Code
    ├── Dev workflows
    └── Best practices

INFRASTRUCTURE LAYER (Advanced):
├── Introduction to MCP (Model Context Protocol)
│   ├── MCP basics
│   ├── Multi-server setups
│   ├── Security
│   └── Production patterns
├── Advanced MCP Topics
├── Claude with Amazon Bedrock
└── Claude with Google Cloud Vertex AI
```

---

## 3. 📖 Documentation & Cookbooks

### Anthropic Documentation
> [https://docs.anthropic.com/](https://docs.anthropic.com/)
```
├── Getting Started / Quickstart
├── Build with Claude
│   ├── Prompt Engineering Guide
│   ├── Prompt Library (pre-built prompts)
│   ├── Extended Thinking
│   ├── Tool Use
│   ├── Computer Use
│   ├── Vision
│   ├── Caching
│   ├── Batches
│   └── MCP (Model Context Protocol)
├── Agents
│   ├── Agent Design Patterns
│   ├── Tool Use for Agents
│   └── Building Effective Agents (guide)
└── API Reference
```

### Claude Cookbooks (GitHub)
> [https://github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook)
```
├── RAG (Retrieval-Augmented Generation)
├── Tool use examples
├── Prompt chaining
├── Classification
├── Summarization
├── Data extraction
├── Code generation
└── Advanced patterns
```

---

## 🗺️ Lộ trình học đề xuất

```
WEEK 1: Fundamentals
├── Day 1-2: Anthropic API Fundamentals (Course 1)
├── Day 3-5: Prompt Engineering Tutorial Ch.1-5 (Course 2)
└── Practice: Try Claude API with basic prompts

WEEK 2: Intermediate
├── Day 1-2: Prompt Engineering Tutorial Ch.6-9 (Course 2)
├── Day 3-4: Real World Prompting (Course 3)
├── Day 5: Prompt Evaluations (Course 4)
└── Practice: Build a real-world prompt pipeline

WEEK 3: Advanced
├── Day 1-3: Tool Use (Course 5)
├── Day 4-5: MCP (Model Context Protocol) — Academy
└── Practice: Build an agent with tool use

WEEK 4: Production
├── Day 1-2: Claude with Bedrock/Vertex — Academy
├── Day 3-4: Agent patterns from docs
├── Day 5: Review & build portfolio project
└── Practice: Deploy an agent to production
```

---

## 📎 Quick Links

| Resource | URL |
|----------|-----|
| GitHub Courses | [github.com/anthropics/courses](https://github.com/anthropics/courses) |
| Anthropic Academy | [anthropic.skilljar.com](https://anthropic.skilljar.com/) |
| Documentation | [docs.anthropic.com](https://docs.anthropic.com/) |
| Prompt Library | [docs.anthropic.com/prompt-library](https://docs.anthropic.com/en/docs/build-with-claude/prompt-library) |
| Cookbooks | [github.com/anthropics/anthropic-cookbook](https://github.com/anthropics/anthropic-cookbook) |
| API Reference | [docs.anthropic.com/api](https://docs.anthropic.com/en/api/) |
| Building Agents Guide | [docs.anthropic.com/agents](https://docs.anthropic.com/en/docs/build-with-claude/agents) |
