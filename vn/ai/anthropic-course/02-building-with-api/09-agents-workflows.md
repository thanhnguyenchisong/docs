# Bài 9: Agents & Workflows — Thiết kế hệ thống Agent

> Module: [Building with the Claude API](./README.md) → Bài 9

---

## 🔹 1. Agents vs Workflows

| | Workflow | Agent |
|-|---------|-------|
| **Điều khiển** | Code cứng (deterministic) | LLM tự quyết định |
| **Luồng** | Cố định, predictable | Linh hoạt, adaptive |
| **Phức tạp** | Thấp → Trung bình | Cao |
| **Dùng khi** | Task có bước rõ ràng | Task mở, cần khám phá |

## 🔹 2. Parallelization — Chạy song song

Chia task thành các phần **độc lập** → chạy đồng thời → gộp kết quả.

```python
import anthropic
import asyncio

client = anthropic.AsyncAnthropic()

async def analyze_aspect(code, aspect):
    """Phân tích 1 khía cạnh của code"""
    response = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"Phân tích {aspect} của code:\n```\n{code}\n```"
        }]
    )
    return {aspect: response.content[0].text}

async def parallel_code_review(code):
    """Review code song song trên nhiều khía cạnh"""
    aspects = ["security", "performance", "readability", "best practices"]
    
    # Chạy song song
    tasks = [analyze_aspect(code, aspect) for aspect in aspects]
    results = await asyncio.gather(*tasks)
    
    return {k: v for result in results for k, v in result.items()}

# Sử dụng
code = open("main.py").read()
review = asyncio.run(parallel_code_review(code))
```

```
Input: Code cần review
       │
  ┌────┼────┬────────┐
  ▼    ▼    ▼        ▼
Security Performance Readability Best Practices
  │    │    │        │
  └────┼────┴────────┘
       ▼
  Aggregated Report
```

## 🔹 3. Chaining — Xử lý tuần tự

Output của bước trước là input của bước sau.

```python
def chain_workflow(raw_text):
    """Pipeline: Extract → Validate → Format → Summary"""
    
    # Bước 1: Extract thông tin
    step1 = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Trích xuất thông tin từ văn bản sau thành JSON:
- name, email, phone, company, role

Văn bản: {raw_text}"""
        }]
    )
    extracted = step1.content[0].text
    
    # Bước 2: Validate
    step2 = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Validate JSON sau:
{extracted}

Kiểm tra: email format đúng, phone có đủ số, không có field trống.
Trả về JSON đã sửa + list errors."""
        }]
    )
    validated = step2.content[0].text
    
    # Bước 3: Format cho CRM
    step3 = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""Format dữ liệu sau cho CRM import:
{validated}

Output: CSV format với headers: Name,Email,Phone,Company,Role"""
        }]
    )
    
    return step3.content[0].text
```

```
Raw Text → Extract → Validate → Format → CSV Output
              │          │          │
         (Claude 1) (Claude 2) (Claude 3)
```

## 🔹 4. Routing — Điều hướng

Phân loại input → gửi đến handler chuyên biệt.

```python
def route_request(user_message):
    """Router: phân loại → gọi handler phù hợp"""
    
    # Bước 1: Classify
    classification = client.messages.create(
        model="claude-haiku-3-5-20241022",  # model nhẹ để classify
        max_tokens=50,
        messages=[{
            "role": "user",
            "content": f"""Classify request thành 1 trong: 
code_help, bug_report, feature_request, general_question

Request: {user_message}

Chỉ trả 1 category, không text khác."""
        }]
    )
    
    category = classification.content[0].text.strip()
    
    # Bước 2: Route đến handler chuyên biệt
    handlers = {
        "code_help": handle_code_help,
        "bug_report": handle_bug_report,
        "feature_request": handle_feature_request,
        "general_question": handle_general_question,
    }
    
    handler = handlers.get(category, handle_general_question)
    return handler(user_message)

def handle_code_help(message):
    return client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system="Bạn là senior developer. Viết code rõ ràng, có comments.",
        messages=[{"role": "user", "content": message}]
    ).content[0].text

def handle_bug_report(message):
    return client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system="Bạn là QA engineer. Phân tích bug, đề xuất fix, liệt kê impact.",
        messages=[{"role": "user", "content": message}]
    ).content[0].text
```

## 🔹 5. Orchestrator-Worker Pattern

Một agent chính **điều phối**, nhiều workers **thực thi** từng phần.

```python
def orchestrator(complex_task):
    """Orchestrator chia task → giao workers → tổng hợp"""
    
    # 1. Phân tích và chia nhỏ task
    plan = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{
            "role": "user",
            "content": f"""Phân tích task phức tạp sau và chia thành subtasks:

Task: {complex_task}

Trả về JSON array:
[{{"id": 1, "subtask": "...", "dependencies": []}}, ...]"""
        }]
    )
    
    import json
    subtasks = json.loads(plan.content[0].text)
    
    # 2. Thực thi từng subtask
    results = {}
    for task in subtasks:
        # Kiểm tra dependencies
        deps = {dep: results[dep] for dep in task.get("dependencies", []) 
                if dep in results}
        
        result = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": f"""Thực hiện subtask:
{task['subtask']}

Context từ các bước trước: {json.dumps(deps, ensure_ascii=False)}"""
            }]
        )
        results[task["id"]] = result.content[0].text
    
    # 3. Tổng hợp kết quả
    synthesis = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{
            "role": "user",
            "content": f"""Tổng hợp kết quả từ các subtasks:
{json.dumps(results, ensure_ascii=False)}

Tạo báo cáo tổng hợp hoàn chỉnh."""
        }]
    )
    
    return synthesis.content[0].text
```

## 🔹 6. Evaluator-Optimizer Pattern

Một agent tạo output, một agent khác **đánh giá** và yêu cầu cải thiện.

```python
def evaluator_optimizer(task, max_iterations=3):
    """Lặp: generate → evaluate → improve"""
    
    current_output = None
    
    for i in range(max_iterations):
        # Generate / Improve
        if current_output is None:
            prompt = f"Thực hiện task: {task}"
        else:
            prompt = f"""Cải thiện output dựa trên feedback:

Output hiện tại: {current_output}
Feedback: {feedback}

Chỉ sửa các vấn đề được nêu, giữ nguyên phần tốt."""
        
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        current_output = response.content[0].text
        
        # Evaluate
        eval_response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""Đánh giá output sau (score 1-10):
{current_output}

Trả JSON: {{"score": N, "issues": ["..."], "pass": true/false}}
pass = true nếu score >= 8"""
            }]
        )
        
        import json
        evaluation = json.loads(eval_response.content[0].text)
        
        if evaluation.get("pass", False):
            print(f"✅ Passed after {i+1} iterations (score: {evaluation['score']})")
            return current_output
        
        feedback = "\n".join(evaluation.get("issues", []))
        print(f"🔄 Iteration {i+1}: score={evaluation['score']}, improving...")
    
    return current_output  # return best effort
```

---

## 📝 Tổng kết Patterns

| Pattern | Mô tả | Use case |
|---------|-------|----------|
| **Parallelization** | Chạy nhiều task song song | Code review, multi-aspect analysis |
| **Chaining** | Output A → Input B → Input C | Data pipeline, ETL |
| **Routing** | Classify → route to handler | Customer support, triage |
| **Orchestrator** | 1 manager + N workers | Complex projects |
| **Evaluator** | Generate → evaluate → improve | Quality-critical outputs |

---

## ➡️ Hoàn thành Module!

Bạn đã hoàn thành **Building with the Claude API** — khóa toàn diện nhất.
Tiếp theo:
- [Claude Code 101](../03-claude-code-101/) — AI coding agent
- [MCP chi tiết](../07-mcp/) — deep dive vào MCP
- [Agent Skills](../05-agent-skills/) — tạo reusable skills
