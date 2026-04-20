# Bài 3: Prompt Evaluation — Đánh giá chất lượng Prompt

> Module: [Building with the Claude API](./README.md) → Bài 3

---

## 🔹 1. Tại sao cần Evaluation?

Khi đưa prompt vào production, bạn cần **đo lường** chất lượng output — không thể chỉ "nhìn thấy tốt" mà kết luận.

```
Vấn đề phổ biến:
├── Prompt chạy tốt trên 5 test cases
├── Nhưng fail trên 10% edge cases trong production
├── Mỗi lần sửa prompt → có thể break test case cũ
└── Không có metrics → không biết prompt nào tốt hơn
```

**Eval workflow giúp:**
- Phát hiện regression khi thay đổi prompt
- So sánh prompt A vs prompt B bằng số liệu cụ thể
- Tự động hóa quá trình kiểm tra chất lượng

## 🔹 2. Eval Workflow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Test Dataset │ →  │ Run Prompt   │ →  │ Grade Output│
│ (inputs +   │    │ trên từng    │    │ (auto hoặc  │
│  expected)   │    │ test case    │    │  model-based│
└─────────────┘    └──────────────┘    └─────────────┘
                                              │
                                       ┌──────▼──────┐
                                       │ Report      │
                                       │ Accuracy,   │
                                       │ Scores      │
                                       └─────────────┘
```

## 🔹 3. Tạo Test Dataset

```python
# Test dataset = danh sách {input, expected_output}
test_cases = [
    {
        "input": "Tôi muốn trả hàng, sản phẩm bị lỗi",
        "expected_category": "return_request",
        "expected_sentiment": "negative"
    },
    {
        "input": "Cho hỏi giờ mở cửa thứ 7?",
        "expected_category": "inquiry",
        "expected_sentiment": "neutral"
    },
    {
        "input": "Cảm ơn team, sản phẩm tuyệt vời!",
        "expected_category": "feedback",
        "expected_sentiment": "positive"
    },
    # ... thêm nhiều test cases
]
```

**Cách tạo test dataset:**
1. **Thủ công** — viết tay từ real data (chất lượng cao nhất)
2. **Từ production data** — lấy sample từ real inputs
3. **AI-generated** — dùng Claude để sinh thêm test cases

```python
# Dùng Claude để sinh thêm test cases
import anthropic, json

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=2048,
    messages=[{
        "role": "user",
        "content": """Sinh 10 ví dụ email khách hàng đa dạng, mỗi email gồm:
- input: nội dung email
- expected_category: một trong [inquiry, complaint, return_request, feedback, order_status]
- expected_sentiment: một trong [positive, negative, neutral]

Trả về dạng JSON array. Bao gồm edge cases và ambiguous cases."""
    }]
)

generated_cases = json.loads(response.content[0].text)
```

## 🔹 4. Chạy Eval

```python
import anthropic

client = anthropic.Anthropic()

CLASSIFICATION_PROMPT = """Phân loại email khách hàng sau:

<email>{email_content}</email>

Trả về JSON:
{{"category": "...", "sentiment": "..."}}

Categories: inquiry, complaint, return_request, feedback, order_status
Sentiments: positive, negative, neutral

Chỉ trả JSON, không text khác."""

def run_eval(test_cases):
    results = []
    
    for case in test_cases:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=256,
            temperature=0.0,  # deterministic cho eval
            messages=[{
                "role": "user",
                "content": CLASSIFICATION_PROMPT.format(
                    email_content=case["input"]
                )
            }]
        )
        
        import json
        try:
            output = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            output = {"category": "PARSE_ERROR", "sentiment": "PARSE_ERROR"}
        
        results.append({
            "input": case["input"],
            "expected": {
                "category": case["expected_category"],
                "sentiment": case["expected_sentiment"]
            },
            "actual": output,
            "category_correct": output.get("category") == case["expected_category"],
            "sentiment_correct": output.get("sentiment") == case["expected_sentiment"]
        })
    
    return results
```

## 🔹 5. Code-based Grading

```python
def grade_results(results):
    total = len(results)
    category_correct = sum(1 for r in results if r["category_correct"])
    sentiment_correct = sum(1 for r in results if r["sentiment_correct"])
    both_correct = sum(1 for r in results 
                       if r["category_correct"] and r["sentiment_correct"])
    
    print(f"📊 Eval Results ({total} test cases)")
    print(f"├── Category accuracy:  {category_correct}/{total} "
          f"({category_correct/total*100:.1f}%)")
    print(f"├── Sentiment accuracy: {sentiment_correct}/{total} "
          f"({sentiment_correct/total*100:.1f}%)")
    print(f"└── Both correct:       {both_correct}/{total} "
          f"({both_correct/total*100:.1f}%)")
    
    # In ra failures để phân tích
    failures = [r for r in results if not r["category_correct"] 
                or not r["sentiment_correct"]]
    if failures:
        print(f"\n❌ Failures ({len(failures)}):")
        for f in failures:
            print(f"  Input: {f['input'][:50]}...")
            print(f"  Expected: {f['expected']}")
            print(f"  Actual:   {f['actual']}")
            print()
```

## 🔹 6. Model-based Grading

Khi output phức tạp (text dài, tóm tắt, creative writing), dùng **Claude để chấm điểm**:

```python
def model_grade(input_text, expected, actual):
    """Dùng Claude để chấm điểm output"""
    
    grading_prompt = f"""Bạn là giám khảo đánh giá chất lượng output.

Input gốc: {input_text}
Expected output: {expected}
Actual output: {actual}

Chấm điểm từ 1-5 theo tiêu chí:
1. Accuracy (đúng nội dung): 1-5
2. Completeness (đầy đủ): 1-5
3. Format (đúng format): 1-5

Trả về JSON: {{"accuracy": N, "completeness": N, "format": N, "reasoning": "..."}}
"""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=512,
        temperature=0.0,
        messages=[{"role": "user", "content": grading_prompt}]
    )
    
    import json
    return json.loads(response.content[0].text)
```

## 🔹 7. A/B Testing Prompts

```python
def ab_test_prompts(prompt_a, prompt_b, test_cases):
    """So sánh 2 prompt trên cùng test dataset"""
    
    results_a = run_eval_with_prompt(prompt_a, test_cases)
    results_b = run_eval_with_prompt(prompt_b, test_cases)
    
    score_a = sum(1 for r in results_a if r["correct"]) / len(results_a)
    score_b = sum(1 for r in results_b if r["correct"]) / len(results_b)
    
    print(f"Prompt A accuracy: {score_a*100:.1f}%")
    print(f"Prompt B accuracy: {score_b*100:.1f}%")
    print(f"Winner: {'A' if score_a > score_b else 'B'} "
          f"(+{abs(score_a-score_b)*100:.1f}%)")
```

---

## 📝 Tổng kết

| Bước | Mô tả |
|------|-------|
| 1. Test Dataset | Tạo inputs + expected outputs |
| 2. Run Prompt | Chạy prompt trên mọi test case |
| 3. Grade | Code-based (exact match) hoặc Model-based (Claude chấm) |
| 4. Report | Accuracy %, phân tích failures |
| 5. Iterate | Sửa prompt → chạy eval lại → so sánh |

---

➡️ Tiếp theo: [Prompt Engineering](04-prompt-engineering.md)
