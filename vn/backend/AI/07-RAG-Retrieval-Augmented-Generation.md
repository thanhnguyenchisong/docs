# Bài 7: RAG — Retrieval-Augmented Generation

## Mục lục
- [1. Tại sao cần RAG?](#1-tại-sao-cần-rag)
- [2. Kiến trúc RAG](#2-kiến-trúc-rag)
- [3. Chunking Strategies](#3-chunking-strategies)
- [4. Embedding Models](#4-embedding-models)
- [5. Vector Search](#5-vector-search)
- [6. Advanced RAG](#6-advanced-rag)
- [7. RAG Evaluation](#7-rag-evaluation)
- [8. Production RAG Patterns](#8-production-rag-patterns)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Tại sao cần RAG?

### 1.1 Hạn chế của LLMs

```
LLMs có 3 hạn chế lớn:

1. Knowledge Cutoff
   ├── LLM chỉ biết data đến thời điểm training
   ├── GPT-4 cutoff: April 2024
   ├── Hỏi "Tin tức hôm nay?" → không biết
   └── RAG: Retrieve tin mới nhất → inject vào context

2. Hallucination
   ├── LLM "bịa" answers nghe hợp lý nhưng SAI
   ├── "Tác giả cuốn X?" → LLM bịa tên
   └── RAG: Ground answer trong verified documents

3. No Private Knowledge
   ├── LLM không biết data nội bộ công ty bạn
   ├── Hỏi "Company policy?" → không biết
   └── RAG: Retrieve từ internal knowledge base

RAG = Retrieval-Augmented Generation
  ├── Retrieve: Tìm documents liên quan
  ├── Augment: Thêm vào context của LLM
  └── Generate: LLM sinh answer DỰA TRÊN retrieved docs
```

### 1.2 RAG vs Fine-tuning vs Prompting

| | Prompting | RAG | Fine-tuning |
|--|----------|-----|-------------|
| **Private data** | ❌ | ✅ | ✅ |
| **Updated data** | ❌ | ✅ Real-time | ❌ Cần retrain |
| **Cost** | ✅ Rẻ nhất | ⚡ Vừa phải | ❌ Đắt |
| **Setup time** | ✅ Nhanh | ⚡ Vài ngày | ❌ Vài tuần |
| **Hallucination** | ❌ Cao | ✅ Giảm mạnh | ⚠️ Vẫn có |
| **Customization** | ⚠️ Hạn chế | ✅ Tốt | ✅✅ Sâu nhất |

```
💡 Rule of thumb 2026:
  Bắt đầu với RAG → Nếu chưa đủ → Fine-tuning
  80% use cases → RAG đủ tốt
```

---

## 2. Kiến trúc RAG

### 2.1 RAG Pipeline

```
┌──────────────────────────────────────────────────────┐
│                   INDEXING PHASE (Offline)             │
│                                                       │
│  Documents → Chunking → Embedding → Vector DB        │
│  ┌─────────┐  ┌──────┐  ┌────────┐  ┌──────────┐   │
│  │ PDF,DOCX│→ │Chunk │→ │Embed   │→ │ Store in │   │
│  │ HTML,TXT│  │Split │  │Model   │  │ VectorDB │   │
│  │ CSV,JSON│  │      │  │        │  │          │   │
│  └─────────┘  └──────┘  └────────┘  └──────────┘   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   QUERY PHASE (Online)                │
│                                                       │
│  User Query → Embed → Search → Retrieve → LLM        │
│  ┌─────────┐  ┌──────┐  ┌────────┐  ┌──────────┐   │
│  │"What is │→ │Embed │→ │Vector  │→ │Top-K     │   │
│  │ RAG?"   │  │Query │  │Search  │  │Results   │   │
│  └─────────┘  └──────┘  └────────┘  └────┬─────┘   │
│                                           │          │
│  ┌──────────────────────────────────┐     │          │
│  │ LLM                              │     │          │
│  │ Context: {retrieved_chunks}       │◄────┘          │
│  │ Query: "What is RAG?"            │                │
│  │ → "RAG is a technique that..."   │                │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### 2.2 Code — Simple RAG Pipeline

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA

# 1. LOAD Documents
loader = PyPDFLoader("company_handbook.pdf")
documents = loader.load()

# 2. CHUNK Documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,       # Max characters per chunk
    chunk_overlap=200,     # Overlap giữa chunks
    separators=["\n\n", "\n", ". ", " ", ""]
)
chunks = text_splitter.split_documents(documents)
print(f"Created {len(chunks)} chunks")

# 3. EMBED & STORE
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectordb = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db"
)

# 4. RETRIEVE & GENERATE
llm = ChatOpenAI(model="gpt-4o", temperature=0)
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",  # stuff all chunks into context
    retriever=vectordb.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True
)

# 5. QUERY
result = qa_chain.invoke({"query": "Chính sách nghỉ phép như thế nào?"})
print(result["result"])
for doc in result["source_documents"]:
    print(f"Source: {doc.metadata['source']}, Page: {doc.metadata['page']}")
```

---

## 3. Chunking Strategies

### 3.1 So sánh Chunking Methods

```
1. Fixed-size Chunking
   ├── Chia theo số characters/tokens cố định
   ├── chunk_size=1000, overlap=200
   ├── ✅ Đơn giản, nhanh
   ├── ❌ Cắt giữa câu, mất meaning
   └── Dùng: General purpose

2. Recursive Character Splitting ← KHUYÊN DÙNG
   ├── Split theo hierarchy: \n\n → \n → . → space
   ├── Giữ paragraph integrity
   ├── ✅ Balance size & semantic coherence
   └── Dùng: Most common in production

3. Semantic Chunking
   ├── Split dựa trên semantic similarity
   ├── Sentences gần nghĩa → cùng chunk
   ├── ✅ Best semantic coherence
   ├── ❌ Chậm (cần embedding per sentence)
   └── Dùng: High-quality RAG

4. Document-structure Chunking
   ├── Split theo heading, section, table
   ├── Markdown: ## Header → boundary
   ├── HTML: <section>, <article>
   ├── ✅ Preserve document structure
   └── Dùng: Structured documents

5. Agentic Chunking (2025-2026)
   ├── Dùng LLM để quyết định boundary
   ├── "This paragraph should be with the next one because..."
   ├── ✅ Best quality
   ├── ❌ Expensive, slow
   └── Dùng: High-value documents
```

### 3.2 Chunk Size Guidelines

```
Chunk Size Recommendations:
├── Too small (<200 tokens): Mất context → poor retrieval
├── Too large (>2000 tokens): Dilute relevance → noise
├── Sweet spot: 500-1000 tokens
│
├── Overlap: 10-20% of chunk_size
│   ├── Quá ít: mất info ở boundary
│   └── Quá nhiều: duplicate info → waste

Tùy thuộc embedding model:
├── text-embedding-3-small: max 8191 tokens → chunk 500-1000
├── BGE-M3: max 8192 tokens → chunk 500-1500
├── Cohere embed v3: max 512 tokens → chunk 400-500
└── ⚠️ LUÔN chunk < model max token limit

Tùy thuộc use case:
├── Q&A: 200-500 tokens (focused answers)
├── Summarization: 1000-2000 tokens (broader context)
├── Code: Split theo functions/classes
└── Legal/Medical: Split theo sections/articles
```

---

## 4. Embedding Models

### 4.1 Embedding Models 2026

| Model | Provider | Dims | Max tokens | Strengths |
|-------|----------|------|------------|-----------|
| **text-embedding-3-large** | OpenAI | 3072 | 8191 | Best OpenAI, MRL |
| **text-embedding-3-small** | OpenAI | 1536 | 8191 | Cost efficient |
| **embed-v4** | Cohere | 1024 | 512 | Multilingual, search |
| **BGE-M3** | BAAI | 1024 | 8192 | Open, multi-lingual |
| **E5-mistral-7b** | Microsoft | 4096 | 32768 | Long context |
| **Gemini Embedding** | Google | 768 | 2048 | Integrated ecosystem |
| **nomic-embed-text** | Nomic | 768 | 8192 | Open, long context |
| **jina-embeddings-v3** | Jina AI | 1024 | 8192 | Multilingual, code |

### 4.2 Matryoshka Representation Learning (MRL)

```
MRL: Truncate embedding dimensions MÀ GIỮ quality

text-embedding-3-large: 3072 dims full
├── 3072 dims: 100% quality
├── 1536 dims: ~99% quality (tốt!)
├── 768 dims: ~97% quality (vẫn tốt!)
├── 256 dims: ~93% quality
└── 64 dims: ~85% quality

Lợi ích:
├── Giảm storage 4-48×
├── Giảm search latency
├── Flexible: dùng full dims cho important data, 
│   truncated cho less important
└── Trade quality vs cost tại QUERY TIME

⚠️ Không phải mọi model hỗ trợ MRL
   Hỗ trợ: text-embedding-3-*, some BGE models
```

---

## 5. Vector Search

### 5.1 Similarity Metrics

```
1. Cosine Similarity ← PHỔ BIẾN NHẤT
   sim(A, B) = (A · B) / (||A|| × ||B||)
   Range: [-1, 1]  (1 = giống nhau, 0 = unrelated, -1 = opposite)
   ✅ Invariant to magnitude — chỉ xét direction
   Dùng: Text similarity

2. Euclidean Distance (L2)
   dist(A, B) = √(Σ(aᵢ - bᵢ)²)
   Range: [0, ∞)  (0 = giống nhau)
   Dùng: Image similarity, khi magnitude quan trọng

3. Dot Product (Inner Product)
   score(A, B) = A · B = Σ(aᵢ × bᵢ)
   Range: (-∞, ∞)
   ✅ Fastest computation
   Dùng: Khi embeddings đã normalized
   
⚠️ Nếu embeddings normalized → Cosine = Dot Product = Euclidean ordering
```

### 5.2 Indexing Algorithms

```
Brute Force (Exact Search):
├── So sánh query với TẤT CẢ vectors
├── ❌ O(n × d) — chậm với million vectors
└── Dùng: < 10K vectors

HNSW (Hierarchical Navigable Small World) ← PHỔBIẾN NHẤT
├── Graph-based: multi-layer graph
├── ✅ High recall (~99%), fast query
├── Memory: vectors + graph → 2-3× storage
├── Build time: moderate
└── Dùng: Default for most vector DBs

IVF (Inverted File Index)
├── Chia vectors thành clusters (centroids)
├── Query → tìm nearest centroids → search trong clusters
├── ✅ Memory efficient (ít hơn HNSW)
├── ⚡ Nhanh build, moderate recall
├── nprobe = 10-100 (số clusters search)
└── Dùng: Large scale, memory constrained

PQ (Product Quantization)
├── Compress vectors → ít bytes
├── 128 dims × 4 bytes → 16 bytes (32×compression)
├── ✅ Very memory efficient
├── ❌ Lower accuracy
└── Dùng: Billions of vectors

IVF-PQ: Combine IVF + PQ
├── ✅ Best for billion-scale
└── Dùng: Production search engines

HNSW + PQ: HNSW graph + PQ compression  
├── ✅ Good balance: speed + memory
└── Dùng: Large-scale production
```

---

## 6. Advanced RAG

### 6.1 Naive RAG vs Advanced RAG

```
Naive RAG:
  Query → Embed → Search Top-K → Stuff into LLM → Answer
  ⚠️ Issues: irrelevant chunks, missing context, poor answers

Advanced RAG adds:
├── Pre-retrieval Optimization
│   ├── Query Rewriting: LLM rephrase query
│   ├── Query Expansion: Generate sub-queries
│   ├── HyDE: Generate hypothetical document → search
│   └── Step-back Prompting: Abstract query first
│
├── Retrieval Optimization
│   ├── Hybrid Search: BM25 + Vector (RRF fusion)
│   ├── Multi-query: Generate multiple queries → merge results
│   ├── Metadata Filtering: filter by date, source, category
│   └── Parent-child Retrieval: retrieve child, return parent
│
├── Post-retrieval Optimization
│   ├── Re-ranking: Cross-encoder re-score results
│   ├── Compression: Summarize/filter retrieved context
│   ├── Diversity: MMR (Maximal Marginal Relevance)
│   └── Lost-in-middle mitigation: reorder chunks
│
└── Generation Optimization
    ├── Cite sources with references
    ├── Self-RAG: model self-evaluates retrieval quality
    └── FLARE: Forward-Looking Active Retrieval
```

### 6.2 Hybrid Search (BM25 + Vector)

```python
# Hybrid Search = Dense (Vector) + Sparse (BM25)

# Dense search (Semantic):
#   "What's the weather?" ↔ "Current climate conditions"
#   ✅ Understand MEANING
#   ❌ Miss exact keywords

# Sparse search (BM25 / TF-IDF):
#   "error code ERR_403" ↔ "ERR_403 permission denied"
#   ✅ Exact keyword matching
#   ❌ No semantic understanding

# Hybrid: Combine both with Reciprocal Rank Fusion (RRF)
# RRF(d) = Σ 1 / (k + rank(d))

from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# BM25 (sparse)
bm25_retriever = BM25Retriever.from_documents(chunks, k=5)

# Vector (dense)
vector_retriever = vectordb.as_retriever(search_kwargs={"k": 5})

# Hybrid Ensemble
hybrid_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.4, 0.6]  # 40% BM25 + 60% Vector
)

results = hybrid_retriever.invoke("error code ERR_403 permission")
```

### 6.3 GraphRAG

```
GraphRAG: RAG + Knowledge Graph

Standard RAG:
  "Chunks" = isolated text fragments
  ❌ Mất relationships giữa entities
  ❌ Khó trả lời câu hỏi cần reasoning qua nhiều docs

GraphRAG:
  Documents → Extract entities + relationships → Knowledge Graph
  Query → Graph traversal + Vector search → Richer context

  Ví dụ:
  Doc 1: "John works at Google"
  Doc 2: "Google is headquartered in Mountain View"
  Doc 3: "Mountain View is in California"
  
  Graph: John → works_at → Google → located_in → Mountain View → in → California
  
  Query: "Where does John work geographically?"
  Standard RAG: Có thể trả lời "Google" nhưng miss "California"
  GraphRAG: Traverse graph → "John works at Google, in Mountain View, California"

Tools:
├── Microsoft GraphRAG (open-source)
├── Neo4j + LangChain
├── LlamaIndex Knowledge Graph
└── Amazon Neptune ML
```

---

## 7. RAG Evaluation

### 7.1 RAG Evaluation Framework

```
Đánh giá RAG trên 3 dimensions:

1. Retrieval Quality
   ├── Context Precision: Bao nhiêu retrieved chunks thực sự relevant?
   ├── Context Recall: Bắt được bao nhiêu relevant info?
   └── MRR (Mean Reciprocal Rank): Relevant result ở position nào?

2. Generation Quality
   ├── Faithfulness: Answer có đúng với retrieved context?
   │   (Không hallucinate NGOÀI context)
   ├── Answer Relevancy: Answer có trả lời ĐÚNG câu hỏi?
   └── Answer Correctness: So với ground truth

3. End-to-End
   ├── Human evaluation: Expert rating 1-5
   ├── LLM-as-Judge: Dùng GPT-4 đánh giá quality
   └── Task-specific metrics: Accuracy, F1
```

### 7.2 Code — Evaluation với RAGAS

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)

# Evaluation dataset
eval_data = {
    "question": ["Chính sách nghỉ phép?", "Lương tháng 13?"],
    "answer": ["Nhân viên được 12 ngày nghỉ/năm...", "Lương tháng 13 = ..."],
    "contexts": [["Chunk 1...", "Chunk 2..."], ["Chunk 3..."]],
    "ground_truth": ["12 ngày nghỉ phép có lương/năm...", "Lương tháng 13 = lương cơ bản..."]
}

# Run evaluation
results = evaluate(
    dataset=eval_data,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall]
)

print(results)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88,
#  'context_precision': 0.85, 'context_recall': 0.90}
```

---

## 8. Production RAG Patterns

### 8.1 Production Architecture

```
Production RAG System:

┌─────────────────────────────────────────────────┐
│                   INGESTION PIPELINE             │
│  Sources → Loader → Chunker → Embedder → VecDB │
│  (S3, DB)   (Doc)   (Recursive) (API)   (Store)│
│                                                  │
│  + Metadata extraction (date, source, author)   │
│  + Deduplication                                 │
│  + Incremental updates                           │
│  + Quality checks                                │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                   QUERY PIPELINE                  │
│                                                   │
│  Query → Rewrite → Hybrid Search → Re-rank →    │
│  Filter → Compress → LLM Generate → Validate    │
│                                                   │
│  + Caching (semantic + exact)                     │
│  + Fallback (no results → web search)            │
│  + Citation tracking                              │
│  + Feedback loop (thumbs up/down)                │
└──────────────────────────────────────────────────┘
```

### 8.2 Common Pitfalls & Solutions

```
❌ Pitfall 1: "My RAG returns irrelevant chunks"
✅ Solution:
├── Improve chunking (semantic instead of fixed)
├── Hybrid search (BM25 + Vector)
├── Add re-ranking step (cross-encoder)
├── Metadata filtering (date, source)
└── Query rewriting

❌ Pitfall 2: "LLM hallucinates despite RAG"
✅ Solution:
├── System prompt: "Only answer based on provided context"
├── Temperature = 0
├── Self-RAG: model evaluates if retrieval is sufficient
├── Add citation requirement
└── Post-generation fact-checking

❌ Pitfall 3: "RAG too slow"
✅ Solution:
├── Pre-compute embeddings
├── Use approximate search (HNSW)
├── Cache frequent queries
├── Streaming response
└── Reduce chunk count (better ranking = less chunks needed)

❌ Pitfall 4: "Data keeps changing"
✅ Solution:
├── Incremental indexing (CDC — Change Data Capture)
├── TTL (Time-To-Live) cho chunks
├── Versioned embeddings
└── Background re-indexing pipeline
```

---

## FAQ & Best Practices

### Q1: RAG hay Long Context?
**A:**
```
Long Context (2M tokens Gemini):
├── ✅ Simple — dump everything
├── ❌ Expensive (pay per token)
├── ❌ "Lost in the middle" → miss info
└── ❌ Latency tăng

RAG:
├── ✅ Cost efficient — chỉ retrieve cần thiết
├── ✅ Scalable — millions of documents
├── ✅ Updatable — add/remove docs easily
├── ❌ More complex to build
└── ❌ Retrieval quality dependency

💡 2026 trend: Combine both
  RAG retrieve → inject into long-context model
  Best of both worlds
```

### Best Practices

1. **Hybrid Search** — LUÔN dùng BM25 + Vector
2. **Re-ranking** — Cross-encoder ĐÁNG kể cải thiện quality
3. **Chunk metadata** — store source, page, date, section
4. **Evaluate continuously** — RAGAS, LLM-as-Judge
5. **Feedback loop** — user thumbs up/down → improve
6. **Cache** — semantic + exact caching
7. **Monitor** — track retrieval quality, latency, cost

---

## Bài tập thực hành

### Bài 1: Simple RAG
1. Load 5 PDF documents → chunk → embed → store in Chroma
2. Build Q&A system với LangChain
3. Test với 10 questions → evaluate answers

### Bài 2: Advanced RAG
1. Implement Hybrid Search (BM25 + Vector)
2. Add Re-ranking step (Cohere re-rank hoặc cross-encoder)
3. Compare quality: Naive RAG vs Advanced RAG

### Bài 3: Production RAG
1. Build incremental indexing pipeline
2. Implement query caching
3. Add evaluation pipeline (RAGAS)
4. Build feedback UI (thumbs up/down)

---

**Tiếp theo:** [Bài 8: Agentic AI →](./08-Agentic-AI.md)
