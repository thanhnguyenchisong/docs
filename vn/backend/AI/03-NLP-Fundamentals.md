# Bài 3: NLP Fundamentals — Xử lý Ngôn ngữ Tự nhiên

## Mục lục
- [1. NLP là gì?](#1-nlp-là-gì)
- [2. Text Preprocessing](#2-text-preprocessing)
- [3. Word Embeddings](#3-word-embeddings)
- [4. Text Representation — BoW & TF-IDF](#4-text-representation--bow--tf-idf)
- [5. Sequence-to-Sequence Models](#5-sequence-to-sequence-models)
- [6. Attention Mechanism](#6-attention-mechanism)
- [7. NLP Tasks phổ biến](#7-nlp-tasks-phổ-biến)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. NLP là gì?

### 1.1 Định nghĩa & Tầm quan trọng

```
Natural Language Processing (NLP):
  Lĩnh vực AI giúp máy tính hiểu, xử lý, và sinh ngôn ngữ con người.

Tại sao NLP quan trọng?
├── 80% dữ liệu doanh nghiệp là text (email, docs, chat, reviews)
├── ChatGPT, Claude — nền tảng là NLP
├── Search engines, chatbots, virtual assistants
├── Dịch thuật, tóm tắt, phân tích sentiment
└── Tự động hóa xử lý tài liệu
```

### 1.2 Lịch sử NLP

```
Era 1: Rule-based (1950-1990)
├── Regular expressions, grammars
├── Expert systems, hand-crafted rules
└── Hạn chế: không scale, fragile

Era 2: Statistical NLP (1990-2013)
├── Probabilistic models: HMM, CRF
├── Machine learning: Naive Bayes, SVM, MaxEnt
├── N-gram language models
└── Feature engineering tốn công

Era 3: Neural NLP (2013-2017)
├── Word2Vec, GloVe — distributed representations
├── RNN, LSTM cho sequence modeling
├── Seq2Seq → Machine Translation
└── Attention mechanism ra đời

Era 4: Transformer Era (2017-nay) ← HIỆN TẠI
├── 2017: Attention Is All You Need
├── 2018: BERT — bidirectional pre-training
├── 2020: GPT-3 — in-context learning
├── 2022: ChatGPT — conversational AI
├── 2024: Context-length million tokens
└── 2026: Agentic AI, multi-modal NLP
```

---

## 2. Text Preprocessing

### 2.1 Pipeline xử lý text

```
Raw Text → Clean → Tokenize → Normalize → Vectorize → Model

Ví dụ:
  "I'm LOVING this product!! It's AMAZING 😍 #bestever"
  
  1. Lowercasing:     "i'm loving this product!! it's amazing 😍 #bestever"
  2. Remove noise:    "im loving this product its amazing bestever"
  3. Tokenization:    ["im", "loving", "this", "product", "its", "amazing", "bestever"]
  4. Stop words:      ["loving", "product", "amazing", "bestever"]
  5. Lemmatization:   ["love", "product", "amazing", "bestever"]
```

### 2.2 Tokenization chi tiết

```python
# 1. Word Tokenization (đơn giản)
text = "I can't believe it's not butter!"
tokens = text.split()  # ["I", "can't", "believe", "it's", "not", "butter!"]

# 2. NLTK Tokenizer
import nltk
tokens = nltk.word_tokenize(text)  # ["I", "ca", "n't", "believe", "it", "'s", ...]

# 3. SpaCy Tokenizer — KHUYÊN DÙNG cho production
import spacy
nlp = spacy.load("en_core_web_sm")
doc = nlp(text)
tokens = [token.text for token in doc]

# 4. Subword Tokenization — CHUẨN cho LLMs (BPE, SentencePiece)
from transformers import AutoTokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokens = tokenizer.tokenize("unhappiness")  # ["un", "happiness"]
# → Subword giải quyết OOV (Out-of-Vocabulary) problem
```

### 2.3 Subword Tokenization — Nền tảng LLMs

```
Tại sao Subword thay vì Word tokenization?

Word-level:
  "unfriendliness" → ["unfriendliness"]  ← OOV nếu chưa gặp
  Vocabulary: 100,000+ words → quá lớn

Character-level:
  "cat" → ["c", "a", "t"]  ← mất semantic meaning
  Sequence quá dài → chậm

Subword (BPE / SentencePiece):  ← ĐÚNG
  "unfriendliness" → ["un", "friend", "li", "ness"]
  Vocabulary: 30,000–50,000 subwords
  ├── Cân bằng giữa word và character
  ├── Xử lý được từ mới (OOV)
  └── Chuẩn cho GPT, BERT, Claude, Llama

BPE (Byte Pair Encoding):
  1. Bắt đầu với characters
  2. Merge cặp characters xuất hiện nhiều nhất
  3. Lặp lại cho đến khi đạt vocab_size
  
  Ví dụ: "low lower newest" 
  → "l o w" → "lo w" → "low" → merge dần dần
```

### 2.4 Stemming vs Lemmatization

```python
# Stemming — cắt đuôi từ (nhanh nhưng thô)
from nltk.stem import PorterStemmer
stemmer = PorterStemmer()
stemmer.stem("running")   # "run"
stemmer.stem("better")    # "better" ← sai!
stemmer.stem("studies")   # "studi"  ← xấu

# Lemmatization — tìm từ gốc chính xác (chậm hơn nhưng đúng)
from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()
lemmatizer.lemmatize("running", pos='v')  # "run"
lemmatizer.lemmatize("better", pos='a')   # "good"  ← đúng!
lemmatizer.lemmatize("studies")           # "study" ← đúng!

# SpaCy Lemmatization — production-ready
doc = nlp("The children were playing happily")
lemmas = [token.lemma_ for token in doc]
# ["the", "child", "be", "play", "happily"]
```

---

## 3. Word Embeddings

### 3.1 Từ One-Hot đến Distributed Representation

```
One-Hot Encoding (trước 2013):
  "cat" = [1, 0, 0, 0, ...]    (50,000 dimensions)
  "dog" = [0, 1, 0, 0, ...]
  "kitten" = [0, 0, 1, 0, ...]
  
  ❌ Vấn đề:
  ├── Sparse (hầu hết = 0)
  ├── High dimensional
  └── KHÔNG capture similarity: cos("cat", "kitten") = 0

Word Embeddings (2013+):
  "cat"    = [0.2, -0.4, 0.7, 0.1, ...]   (300 dimensions)
  "dog"    = [0.6, 0.3, 0.0, -0.1, ...]
  "kitten" = [0.25, -0.35, 0.68, 0.15, ...] ← gần "cat"!
  
  ✅ Ưu điểm:
  ├── Dense (mọi dimension có ý nghĩa)
  ├── Low dimensional (50-300)
  ├── Capture semantic similarity
  └── "King - Man + Woman ≈ Queen" — analogy!
```

### 3.2 Word2Vec

```
Word2Vec (Google, 2013) — 2 architectures:

1. CBOW (Continuous Bag of Words):
   Context → predict TARGET word
   ["The", "cat", "___", "on", "the"] → "sat"

2. Skip-gram:
   TARGET word → predict CONTEXT
   "sat" → ["The", "cat", "on", "the"]
   
   ⚡ Skip-gram tốt hơn cho rare words
   ⚡ CBOW nhanh hơn, tốt cho frequent words
```

```python
# Training Word2Vec
from gensim.models import Word2Vec

sentences = [
    ["machine", "learning", "is", "great"],
    ["deep", "learning", "is", "amazing"],
    ["natural", "language", "processing"],
]

model = Word2Vec(sentences, vector_size=100, window=5, min_count=1, workers=4)

# Tìm từ tương tự
model.wv.most_similar("learning")
# [("deep", 0.98), ("machine", 0.95), ...]

# Analogy
model.wv.most_similar(positive=["king", "woman"], negative=["man"])
# → "queen"

# Similarity
model.wv.similarity("machine", "deep")  # 0.85
```

### 3.3 GloVe & FastText

```
GloVe (Stanford, 2014):
├── "Global Vectors for Word Representation"
├── Kết hợp matrix factorization + local context
├── Pre-trained: 6B tokens, 400K vocab, 300d
└── Download: https://nlp.stanford.edu/projects/glove/

FastText (Facebook, 2016):
├── Cải tiến Word2Vec: dùng subword (character n-grams)
├── "apple" = {"ap", "app", "appl", "apple", "ppl", "pple", ...}
├── → Xử lý được OOV words (từ mới, typo)
└── → Tốt cho morphologically rich languages (Tiếng Việt!)
```

### 3.4 Contextual Embeddings — Bước tiến lớn

```
Static Embeddings (Word2Vec, GloVe):
  "bank" = [0.5, -0.2, ...] ← CÙNG vector cho mọi ngữ cảnh
  "I went to the bank to deposit money" → bank = financial
  "I sat on the river bank"             → bank = river edge
  ⚠️ CÙNG embedding dù nghĩa khác!

Contextual Embeddings (ELMo, BERT, GPT):
  "bank" embedding THAY ĐỔI theo context
  "I went to the bank to deposit money" → bank = [0.5, -0.2, ...] (financial)
  "I sat on the river bank"             → bank = [0.1, 0.8, ...]  (river)
  ✅ KHÁC embedding tùy ngữ cảnh!
  
  → Đây là NỀN TẢNG của LLMs hiện đại
```

---

## 4. Text Representation — BoW & TF-IDF

### 4.1 Bag of Words (BoW)

```python
from sklearn.feature_extraction.text import CountVectorizer

documents = [
    "I love machine learning",
    "Machine learning is great",
    "I love deep learning too"
]

vectorizer = CountVectorizer()
X = vectorizer.fit_transform(documents)

# Feature names
print(vectorizer.get_feature_names_out())
# ['deep', 'great', 'is', 'learning', 'love', 'machine', 'too']

# BoW Matrix:
# Doc 1: [0, 0, 0, 1, 1, 1, 0]  ← "machine"=1, "learning"=1, "love"=1
# Doc 2: [0, 1, 1, 1, 0, 1, 0]
# Doc 3: [1, 0, 0, 1, 1, 0, 1]

# ⚠️ Nhược điểm BoW:
# - Mất thứ tự từ ("dog bites man" = "man bites dog")
# - Từ phổ biến (the, is) có giá trị cao nhưng ít ý nghĩa
# → Giải pháp: TF-IDF
```

### 4.2 TF-IDF

```python
from sklearn.feature_extraction.text import TfidfVectorizer

# TF-IDF = Term Frequency × Inverse Document Frequency
#
# TF(t, d) = số lần t xuất hiện trong d / tổng words trong d
# IDF(t) = log(tổng documents / số documents chứa t)
# TF-IDF = TF × IDF
#
# → Từ phổ biến ("the", "is") → IDF thấp → weight thấp
# → Từ đặc trưng ("machine", "quantum") → IDF cao → weight cao

tfidf = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
X_tfidf = tfidf.fit_transform(documents)

# Dùng cho: Text Classification, Information Retrieval
# ⚠️ Vẫn mất context → Transformer-based models tốt hơn nhiều
```

---

## 5. Sequence-to-Sequence Models

### 5.1 Encoder-Decoder Architecture

```
Seq2Seq: Ánh xạ sequence đầu vào → sequence đầu ra

Ứng dụng:
├── Machine Translation: "Tôi yêu AI" → "I love AI"
├── Text Summarization: Đoạn dài → Tóm tắt
├── Question Answering: Question → Answer
└── Chatbot: User input → Response

Architecture:
  ┌──────────────────┐        ┌──────────────────┐
  │     ENCODER       │        │     DECODER       │
  │  (Hiểu input)     │        │  (Sinh output)     │
  │                    │        │                    │
  │  x₁→x₂→x₃→x₄    │──ctx──→│  y₁→y₂→y₃→<EOS>  │
  │  "Tôi yêu AI"     │ vector │  "I love AI"       │
  └──────────────────┘        └──────────────────┘

⚠️ Bottleneck Problem:
  Toàn bộ input sequence nén vào 1 context vector → mất thông tin
  Câu dài → context vector không đủ chứa
  → Giải pháp: ATTENTION MECHANISM
```

---

## 6. Attention Mechanism

### 6.1 Ý tưởng cốt lõi

```
TRƯỚC Attention (Seq2Seq cổ điển):
  Encoder nén TOÀN BỘ input → 1 context vector → Decoder
  "Con mèo ngồi trên thảm" → [0.5, -0.2, 0.8] → "The cat sat on the mat"
  ⚠️ 1 vector cho mọi thứ → bottleneck

VỚI Attention:
  Decoder NHÌN LẠI tất cả encoder hidden states
  Khi sinh từ "cat" → tập trung vào "mèo"
  Khi sinh từ "mat" → tập trung vào "thảm"
  
  Attention Weights:          "cat"        "mat"
  "Con"                       0.05         0.01
  "mèo"                      0.80  ←high  0.02
  "ngồi"                     0.05         0.02
  "trên"                     0.03         0.05
  "thảm"                     0.07         0.90  ←high
```

### 6.2 Attention Score Computation

```
Attention(Q, K, V) = softmax(QKᵀ / √dₖ) × V

Q (Query):   "Tôi đang tìm thông tin gì?" — từ decoder
K (Key):     "Tôi có thông tin gì?"        — từ encoder  
V (Value):   "Thông tin thực tế là gì?"    — từ encoder

Bước:
1. Score = Q · Kᵀ           ← Tương đồng Query-Key
2. Scaled = Score / √dₖ     ← Normalize (tránh softmax saturation)
3. Weights = softmax(Scaled) ← Attention weights (sum = 1)
4. Output = Weights × V     ← Weighted sum of Values

Đây là NỀN TẢNG của Transformer (Bài 4)
```

### 6.3 Self-Attention vs Cross-Attention

```
Self-Attention:
  Q, K, V đều từ CÙNG 1 sequence
  "The cat sat on the mat" — mỗi từ attend với TẤT CẢ từ khác
  → Hiểu mối quan hệ TRONG câu
  → "it" trong "The cat ate the fish because it was hungry" → "it" = "cat"

Cross-Attention:
  Q từ 1 sequence, K/V từ sequence KHÁC
  Decoder query attends to Encoder output
  → Dùng trong translation, Q&A
  → Dùng trong RAG (query attends to retrieved documents)
```

---

## 7. NLP Tasks phổ biến

### 7.1 Phân loại NLP Tasks

```
NLP Tasks:
├── Understanding (Hiểu)
│   ├── Text Classification (Spam, Sentiment)
│   ├── Named Entity Recognition (NER)
│   ├── Part-of-Speech Tagging (POS)
│   ├── Relation Extraction
│   └── Coreference Resolution
│
├── Generation (Sinh)
│   ├── Machine Translation
│   ├── Text Summarization
│   ├── Question Answering
│   ├── Dialogue / Chatbot
│   └── Creative Writing
│
└── Representation (Biểu diễn)
    ├── Word/Sentence Embeddings
    ├── Semantic Similarity
    └── Information Retrieval
```

### 7.2 Ví dụ — Sentiment Analysis với Transformers

```python
from transformers import pipeline

# Sentiment Analysis — chỉ 2 dòng code!
classifier = pipeline("sentiment-analysis")
result = classifier("I absolutely love this product!")
# [{'label': 'POSITIVE', 'score': 0.9998}]

# NER — Named Entity Recognition
ner = pipeline("ner", grouped_entities=True)
entities = ner("Elon Musk founded SpaceX in Hawthorne, California in 2002")
# [{'entity_group': 'PER', 'word': 'Elon Musk', 'score': 0.99},
#  {'entity_group': 'ORG', 'word': 'SpaceX', 'score': 0.99},
#  {'entity_group': 'LOC', 'word': 'Hawthorne, California', 'score': 0.98}]

# Text Summarization
summarizer = pipeline("summarization")
summary = summarizer(long_text, max_length=150, min_length=30)

# Question Answering
qa = pipeline("question-answering")
answer = qa(question="What is the capital of France?", 
            context="Paris is the capital of France.")
# {'answer': 'Paris', 'score': 0.99}

# Translation
translator = pipeline("translation_en_to_vi", model="Helsinki-NLP/opus-mt-en-vi")
result = translator("I love artificial intelligence")
```

### 7.3 Bảng tổng kết NLP Tasks

| Task | Model chuẩn 2026 | Metric | Ví dụ |
|------|-----------------|--------|-------|
| Text Classification | BERT, RoBERTa | F1, Accuracy | Spam detection |
| NER | BERT + CRF | F1 (entity-level) | Extract names, dates |
| Sentiment Analysis | RoBERTa, DeBERTa | F1, Accuracy | Review analysis |
| Machine Translation | mBART, NLLB, LLMs | BLEU, COMET | EN→VI translation |
| Summarization | BART, T5, LLMs | ROUGE, BERTScore | News summary |
| Question Answering | LLMs, DeBERTa | F1, EM | Chatbot, QA system |
| Text Generation | GPT, Claude, Llama | Perplexity, Human eval | Creative writing |

---

## FAQ & Best Practices

### Q1: Nên dùng NLP truyền thống hay LLMs?
**A:**
```
Dùng NLP truyền thống (BERT, fine-tuned models) khi:
✅ Task cụ thể, data labeled có sẵn
✅ Cần low latency & low cost
✅ Không cần generation (classification, NER)
✅ Domain-specific (medical, legal)

Dùng LLMs (GPT, Claude) khi:
✅ Zero/Few-shot (không có labeled data)
✅ Generation tasks (summarization, chatbot)
✅ Complex reasoning
✅ Multi-task (1 model cho nhiều task)
```

### Q2: Xử lý tiếng Việt khác gì tiếng Anh?
**A:**
```
Tiếng Việt — thách thức riêng:
├── Word segmentation: "học sinh" = 1 từ hay 2?
│   → Dùng VnCoreNLP hoặc Underthesea
├── Dấu (tonal marks): "ma", "mà", "má", "mả", "mã", "mạ"
│   → 6 thanh = 6 nghĩa khác nhau
├── Compound words: "nhà trường", "bệnh viện"
├── Abbreviations: "TPHCM", "ĐH BKHN"
└── Pre-trained models:
    ├── PhoBERT (VinAI) — BERT cho tiếng Việt
    ├── ViT5 (Vietnamese T5)
    └── Multilingual models: mBERT, XLM-R
```

### Q3: Embedding model nào chọn cho tiếng Việt?
**A:**
- **Multilingual:** `intfloat/multilingual-e5-large` — tốt cho cross-lingual
- **Vietnamese-specific:** PhoBERT embeddings
- **2026 best:** Gemini Embedding API, Cohere multilingual

### Best Practices

1. **Preprocessing ít nhất có thể** — LLMs tự xử lý được
2. **Subword tokenization** — chuẩn cho mọi model hiện đại
3. **Pre-trained embeddings** — đừng train từ đầu
4. **đánh giá theo task** — BLEU cho translation, ROUGE cho summarization
5. **Data quality > Data quantity** — clean data quan trọng hơn nhiều data
6. **Multilingual models** — xem xét cho tiếng Việt và cross-lingual tasks

---

## Bài tập thực hành

### Bài 1: Text Preprocessing
1. Download dataset reviews tiếng Việt
2. Implement full preprocessing pipeline: clean → tokenize → lemmatize
3. So sánh Word2Vec vs FastText cho tiếng Việt

### Bài 2: Sentiment Analysis
1. Dùng Hugging Face pipeline cho Sentiment Analysis (English)
2. Fine-tune PhoBERT cho Sentiment Analysis tiếng Việt
3. So sánh accuracy: TF-IDF + SVM vs BERT vs LLM zero-shot

### Bài 3: NER Pipeline
1. Dùng SpaCy NER cho English
2. Custom NER model: thêm entity types mới
3. So sánh SpaCy vs Hugging Face Transformers cho NER

---

**Tiếp theo:** [Bài 4: Transformer Architecture →](./04-Transformer-Architecture.md)
