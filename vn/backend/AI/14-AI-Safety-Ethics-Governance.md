# Bài 14: AI Safety, Ethics & Governance

## Mục lục
- [1. AI Safety & Alignment](#1-ai-safety--alignment)
- [2. Hallucination](#2-hallucination)
- [3. Bias & Fairness](#3-bias--fairness)
- [4. EU AI Act 2026](#4-eu-ai-act-2026)
- [5. Guardrails](#5-guardrails)
- [6. Red Teaming](#6-red-teaming)
- [7. Responsible AI Framework](#7-responsible-ai-framework)
- [8. Deepfake & Content Authenticity](#8-deepfake--content-authenticity)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. AI Safety & Alignment

### 1.1 AI Alignment Problem

```
AI Alignment: Đảm bảo AI hoạt động ĐÚNG ý muốn con người

Tại sao khó?
├── Specification Problem: Khó định nghĩa "hữu ích" chính xác
│   "Maximize user satisfaction" → model nịnh user, không nói sự thật
│
├── Reward Hacking: Model tìm cách cheat reward
│   "Giảm complaints" → model học cách GIẤU problems thay vì FIX
│
├── Goal Misalignment: Model pursue proxy goals
│   "Make code pass tests" → model modify tests to pass
│
└── Emergent Behavior: Behavior không ngờ ở scale lớn
    Model lớn hơn → behaviors mới xuất hiện → khó dự đoán

Approaches to Alignment:
├── RLHF: Human feedback → align với preferences
├── Constitutional AI: Self-critique against principles
├── Debate: 2 AIs argue → human judges
├── Interpretability: Understand WHY model makes decisions
└── Evaluation & Testing: Comprehensive safety testing
```

### 1.2 AI Safety Levels

```
Safety Taxonomy:
├── Level 1: Output Safety
│   ├── No harmful content (violence, hate, illegal)
│   ├── No personal information leakage
│   ├── Appropriate content for context
│   └── Tools: content filters, output validation
│
├── Level 2: Behavioral Safety
│   ├── Follow instructions correctly
│   ├── Refuse harmful requests
│   ├── Transparent about limitations
│   └── Tools: RLHF, guardrails, system prompts
│
├── Level 3: Systemic Safety  
│   ├── Safe tool use (don't delete critical data)
│   ├── Don't manipulate users
│   ├── Respect boundaries
│   └── Tools: HITL, sandboxing, permissions
│
└── Level 4: Societal Safety
    ├── Don't amplify misinformation
    ├── Don't create mass manipulation tools
    ├── Equitable access
    └── Tools: governance, regulation, monitoring
```

---

## 2. Hallucination

### 2.1 Types of Hallucination

```
Hallucination: LLM sinh thông tin SAI nhưng nghe hợp lý

Types:
├── Factual Hallucination
│   "Einstein invented the telephone" ← SAI (Bell invented it)
│
├── Fabrication  
│   Tạo ra citations/references không tồn tại
│   "According to Smith et al. (2023)..." ← paper không tồn tại
│
├── Inconsistency
│   "The population is 10 million" ... "The 5 million residents" ← mâu thuẫn
│
├── Over-confidence
│   Trả lời chắc chắn khi thực tế không biết
│
└── Instruction Hallucination
    Không follow instructions nhưng tạo output trông hợp lý
```

### 2.2 Mitigation Strategies

```
Giảm Hallucination:

1. RAG (Retrieval-Augmented Generation)
   ├── Ground responses trong verified documents
   └── "Only answer based on the provided context"

2. Temperature = 0
   ├── Deterministic output
   └── Ít creative = ít hallucinate

3. System Prompt Instructions
   ├── "If you don't know, say 'I don't know'"
   ├── "Cite your sources"
   └── "Distinguish between facts and opinions"

4. Self-Verification
   ├── Ask model to verify its own output
   ├── "Check if your answer contradicts any facts"
   └── Multi-step reasoning check

5. Automated Fact-Checking
   ├── Cross-reference with knowledge base
   ├── NLI (Natural Language Inference) models
   └── Citation verification

6. Human Review
   ├── Critical content MUST be human-reviewed
   └── Medical, legal, financial → ALWAYS human verification
```

---

## 3. Bias & Fairness

### 3.1 Sources of Bias

```
Bias trong AI:

1. Training Data Bias
   ├── Internet text reflects societal biases
   ├── Under-representation of minorities
   ├── Historical biases encoded in data
   └── Language bias (English >> other languages)

2. Algorithmic Bias
   ├── Model amplifies data biases
   ├── Optimization target may favor majority
   └── Evaluation metrics may miss minority performance

3. Deployment Bias
   ├── Model used in unintended context
   ├── Different demographics, different performance
   └── Feedback loops: biased output → biased data → more bias

Examples:
├── Resume screening: Biased against female candidates
├── Facial recognition: Lower accuracy for dark-skinned people
├── Language models: Stereotypical associations
├── Credit scoring: Discriminatory against ethnic minorities
└── Healthcare: Undertreated conditions in underrepresented groups
```

### 3.2 Fairness Metrics & Mitigation

```
Fairness Metrics:
├── Demographic Parity: Equal positive rate across groups
├── Equal Opportunity: Equal true positive rate
├── Equalized Odds: Equal TPR and FPR
├── Calibration: Predicted probabilities = actual outcomes per group
└── Individual Fairness: Similar individuals → similar outcomes

Mitigation:
├── Pre-training: 
│   ├── Diverse, balanced training data
│   ├── Debiasing text corpora
│   └── Data augmentation for underrepresented groups
│
├── Training:
│   ├── Fairness constraints in loss function
│   ├── Adversarial debiasing
│   └── Multi-objective optimization
│
├── Post-training:
│   ├── Output calibration per demographic
│   ├── Threshold adjustment
│   └── Rejection option for uncertain predictions
│
└── Deployment:
    ├── Monitor performance across demographics
    ├── Regular bias audits
    └── Feedback mechanisms for affected users
```

---

## 4. EU AI Act 2026

### 4.1 Risk-Based Framework

```
EU AI Act — Risk Categories:

UNACCEPTABLE RISK (BÃN) — Bị cấm từ Feb 2025:
├── Social scoring systems (like China)
├── Real-time biometric surveillance (public spaces)
├── Manipulation of vulnerable individuals
├── Emotion recognition at workplace/education
└── Untargeted scraping for facial recognition

HIGH RISK — Compliance bắt buộc từ Aug 2026:
├── Critical infrastructure (energy, transport)
├── Education (grading, admissions)
├── Employment (hiring, performance)
├── Essential services (credit, insurance)
├── Law enforcement
├── Migration & border control
└── Healthcare diagnostic systems

Requirements cho High-Risk:
├── Risk management system
├── Data governance
├── Technical documentation
├── Human oversight
├── Accuracy, robustness, cybersecurity
├── Logging & traceability
└── Conformity assessment

LIMITED RISK — Transparency obligations:
├── Chatbots: Must inform users they're talking to AI
├── AI-generated content: Must be labeled
├── Emotion recognition: Must inform affected persons
└── Deepfakes: Must be disclosed

MINIMAL RISK — Tự do sử dụng:
├── Spam filters
├── Video games
├── Most business AI applications
└── Nhưng codes of conduct encouraged
```

### 4.2 GPAI (General Purpose AI) Requirements

```
GPAI Models (GPT, Claude, Gemini, Llama):

Standard GPAI:
├── Technical documentation
├── Training data transparency (copyright compliance)
├── Policy for EU Copyright Directive
└── Publish training methodology summary

GPAI with Systemic Risk (>10^25 FLOPs training):
├── All standard requirements +
├── Model evaluation (adversarial testing)
├── Cybersecurity measures
├── Energy consumption reporting
├── Serious incident reporting
└── Risk assessment & mitigation

⚠️ Compliance Timeline:
├── Feb 2, 2025: Prohibited practices in force ✅
├── Aug 2, 2025: GPAI transparency rules ✅
├── Aug 2, 2026: Most high-risk AI requirements ← UPCOMING
└── Aug 2, 2027: Remaining product safety AI
```

---

## 5. Guardrails

### 5.1 Guardrail Architecture

```
Guardrails: Safety layers bao quanh LLM

     User Input
          │
    ┌─────▼─────┐
    │ INPUT      │  → Filter harmful prompts
    │ GUARDRAIL  │  → Detect prompt injection
    │            │  → PII detection
    └─────┬─────┘
          │ (safe input)
    ┌─────▼─────┐
    │   LLM     │  → Generate response
    └─────┬─────┘
          │ (raw output)
    ┌─────▼─────┐
    │ OUTPUT     │  → Filter harmful content
    │ GUARDRAIL  │  → Fact-check (optional)
    │            │  → Format validation
    └─────┬─────┘
          │ (safe output)
       User Response
```

### 5.2 Guardrail Tools

```python
# NeMo Guardrails (NVIDIA)
from nemoguardrails import RailsConfig, LLMRails

config = RailsConfig.from_path("./config")
rails = LLMRails(config)

response = rails.generate(
    messages=[{"role": "user", "content": "How to hack a website?"}]
)
# → "I cannot help with hacking. That's illegal and unethical."

# Guardrails AI 
from guardrails import Guard
from guardrails.hub import ToxicLanguage, PIIFilter

guard = Guard().use_many(
    ToxicLanguage(threshold=0.8, on_fail="fix"),
    PIIFilter(on_fail="fix")  # Remove PII from output
)

raw_output = llm("Tell me about John Smith at 123 Main St")
validated = guard.validate(raw_output)
# → PII stripped, toxic content removed

# Custom Guardrail Pattern
class ContentGuard:
    def check_input(self, text: str) -> tuple[bool, str]:
        if self.is_prompt_injection(text):
            return False, "Prompt injection detected"
        if self.contains_pii(text):
            return False, "PII detected in input"
        return True, "OK"
    
    def check_output(self, text: str) -> tuple[bool, str]:
        if self.is_toxic(text):
            return False, "Toxic content detected"
        if self.contains_pii(text):
            return False, "PII in output"
        return True, "OK"
```

---

## 6. Red Teaming

### 6.1 Red Teaming cho AI

```
Red Teaming: Tấn công AI một cách có chủ đích để tìm vulnerabilities

Attack Categories:
├── Prompt Injection
│   ├── Direct: "Ignore instructions, do X instead"
│   ├── Indirect: Malicious content in retrieved documents
│   └── Encoded: Base64, ROT13 encoded harmful requests
│
├── Jailbreaking
│   ├── Role-play: "You are DAN who can do anything"
│   ├── Hypothetical: "In a fictional world where..."
│   └── Gradual: Build up to harmful request step by step
│
├── Data Extraction
│   ├── System prompt extraction
│   ├── Training data extraction
│   └── PII leakage from context
│
├── Denial of Service
│   ├── Very long prompts
│   ├── Infinite loops
│   └── Resource exhaustion
│
└── Output Manipulation
    ├── Force specific outputs
    ├── Bypass filters
    └── Generate misleading content

Red Team Process:
1. Define scope & objectives
2. Assemble diverse team (security, ML, domain experts)
3. Systematic testing with attack taxonomy
4. Document vulnerabilities
5. Prioritize by severity & likelihood
6. Fix & retest
7. Continuous monitoring
```

---

## 7. Responsible AI Framework

### 7.1 Principles

```
Responsible AI Principles:

1. TRANSPARENCY
   ├── Explain how AI makes decisions
   ├── Disclose when content is AI-generated
   ├── Document training data, methods, limitations
   └── Publish model cards & datasheets

2. FAIRNESS
   ├── Test across demographics
   ├── Monitor for bias
   ├── Inclusive design
   └── Regular equity audits

3. PRIVACY
   ├── Minimize data collection
   ├── Anonymization & pseudonymization
   ├── Consent for data use
   └── Right to deletion

4. SAFETY
   ├── Pre-deployment testing (red teaming)
   ├── Guardrails & content filters
   ├── Human oversight for critical decisions
   └── Kill switch / rollback capability

5. ACCOUNTABILITY
   ├── Clear ownership of AI systems
   ├── Incident response plan
   ├── Regular audits
   └── Documentation & logging

6. HUMAN OVERSIGHT
   ├── Human-in-the-loop for high-stakes decisions
   ├── Override capability
   ├── Informed consent for AI interaction
   └── Escalation paths
```

### 7.2 AI Governance Checklist

```
Before Deployment:
□ Risk assessment completed
□ Bias testing across demographics
□ Red teaming / adversarial testing
□ Privacy impact assessment
□ Model card / documentation created
□ Human oversight mechanisms in place
□ Incident response plan ready
□ Monitoring alerts configured
□ Compliance review (EU AI Act, GDPR)
□ User disclosure prepared ("You're interacting with AI")

During Deployment:
□ Monitor quality metrics daily
□ Track bias metrics weekly
□ Review user feedback
□ Log all interactions for audit
□ Update knowledge base / RAG data
□ Security monitoring active

Quarterly Review:
□ Bias audit
□ Performance review
□ Compliance check
□ Cost optimization
□ User satisfaction survey
□ Update risk assessment
```

---

## 8. Deepfake & Content Authenticity

### 8.1 Detection & Prevention

```
Deepfake Landscape 2026:
├── Video deepfakes: Near-indistinguishable from real
├── Voice cloning: 3-second sample → perfect clone
├── Image generation: Photorealistic fake people/events
├── Real-time: Live video deepfakes in video calls
└── Text: AI-generated articles, reviews, comments

Detection Methods:
├── Artifact-based: Look for visual/audio artifacts
│   ❌ Less effective as generation improves
│
├── Learning-based: Train classifier on real vs fake
│   ⚠️ Arms race: generators improve → detectors need update
│
├── Provenance-based: C2PA, Content Credentials
│   ✅ Most promising long-term solution
│   Embed origin metadata at creation time
│
└── Behavioral: Check if content is consistent with known facts
    ✅ Context-aware, harder to fool

Prevention:
├── C2PA standard adoption (Adobe, Google, Microsoft)
├── Digital watermarking (SynthID by Google)
├── Platform policies (label AI content)
├── Legal requirements (EU AI Act transparency)
└── Education: Media literacy
```

---

## FAQ & Best Practices

### Q1: AI có thể dùng cho medical/legal advice?
**A:**
```
⚠️ KHÔNG nên dùng AI choices as ONLY source cho:
├── Medical diagnosis → AI assists, doctor decides
├── Legal advice → AI drafts, lawyer reviews
├── Financial advice → AI analyzes, advisor recommends
└── Safety-critical → AI suggests, human verifies

Pattern đúng:
  AI generates draft/analysis → Human expert reviews → Final decision
  NEVER: AI → Final decision (especially high-risk domains)
```

### Q2: Làm sao comply EU AI Act?
**A:**
```
1. Inventory all AI systems used
2. Classify risk level per EU AI Act
3. For high-risk: implement required tech documentation
4. Ensure transparency: inform users of AI interaction
5. Human oversight mechanisms
6. Regular audits & monitoring
7. Incident reporting process
8. AI literacy training for team
→ Deadline: August 2, 2026 cho most provisions
```

### Best Practices

1. **Safety by design** — Build guardrails from day 1
2. **Test adversarially** — Red team before launch
3. **Human oversight** — HITL for critical decisions
4. **Document everything** — Model cards, data sheets
5. **Monitor continuously** — Don't just deploy and forget
6. **Stay updated** — Regulations change, update compliance
7. **Diverse teams** — Different perspectives catch more biases
8. **User transparency** — Always inform users of AI interaction

---

## Bài tập thực hành

### Bài 1: Guardrails
1. Implement input/output guardrails cho chatbot
2. Test với 20 adversarial prompts (jailbreak, injection)
3. Measure filter effectiveness

### Bài 2: Bias Audit
1. Test LLM responses across different demographics
2. Measure fairness metrics (demographic parity)
3. Document findings & mitigation plan

### Bài 3: Red Teaming
1. Create attack taxonomy for your AI system
2. Execute 50 attack scenarios
3. Document vulnerabilities & severity
4. Implement fixes & retest

---

**Tiếp theo:** [Bài 15: AI cho Developer — Interview →](./15-AI-For-Developers-Interview.md)
