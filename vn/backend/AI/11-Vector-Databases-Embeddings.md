# Bài 11: Vector Databases & Embeddings

## Mục lục
- [1. Embedding là gì?](#1-embedding-là-gì)
- [2. Types of Embeddings](#2-types-of-embeddings)
- [3. Vector Databases](#3-vector-databases)
- [4. PostgreSQL + pgvector](#4-postgresql--pgvector)
- [5. Indexing Algorithms chi tiết](#5-indexing-algorithms-chi-tiết)
- [6. Hybrid Search & Polystore](#6-hybrid-search--polystore)
- [7. Choosing a Vector DB](#7-choosing-a-vector-db)
- [FAQ & Best Practices](#faq--best-practices)
- [Bài tập thực hành](#bài-tập-thực-hành)

---

## 1. Embedding là gì?

### 1.1 Khái niệm

```
Embedding: Biểu diễn dữ liệu (text, image, audio) thành VECTOR số
sao cho dữ liệu TƯƠNG TỰ → vectors GẦN NHAU trong không gian.

  "I love AI"        →  [0.2, 0.8, -0.3, 0.5, ...]  (1536 dims)
  "AI is amazing"    →  [0.1, 0.7, -0.2, 0.6, ...]  ← GẦN!
  "The weather today"→  [-0.5, 0.1, 0.9, -0.4, ...] ← XA!

  cos_sim("I love AI", "AI is amazing") = 0.92    (tương tự!)
  cos_sim("I love AI", "The weather today") = 0.15 (không liên quan)

Ứng dụng:
├── Semantic Search: Tìm kiếm theo ý nghĩa
├── RAG: Retrieve relevant documents
├── Recommendation: Tìm items tương tự
├── Clustering: Nhóm dữ liệu tương tự
├── Anomaly Detection: Tìm outliers
└── Deduplication: Phát hiện nội dung trùng
```

---

## 2. Types of Embeddings

### 2.1 Text Embeddings

```python
from openai import OpenAI

client = OpenAI()

# Generate embedding
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Machine learning is a subset of AI"
)

embedding = response.data[0].embedding
print(f"Dimensions: {len(embedding)}")  # 1536
print(f"Sample: {embedding[:5]}")       # [0.023, -0.004, ...]

# Batch embeddings
texts = ["Hello world", "Machine learning", "Deep learning"]
response = client.embeddings.create(
    model="text-embedding-3-small",
    input=texts
)
embeddings = [d.embedding for d in response.data]

# Similarity
import numpy as np
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

sim = cosine_similarity(embeddings[1], embeddings[2])
print(f"ML vs DL similarity: {sim:.4f}")  # ~0.92
```

### 2.2 Multimodal Embeddings

```
Multimodal Embeddings: Text + Image + Audio → SAME vector space

CLIP (Contrastive Language-Image Pre-training):
  "a photo of a cat" → [0.2, 0.8, ...]
   🐱 (cat image)    → [0.19, 0.81, ...]  ← Similar!
   
  → Search images WITH text queries
  → Search text WITH image queries

Gemini Embedding API:
  Text + Image → unified embedding
  
Use cases:
├── Visual search: "Find images like this text"
├── Cross-modal retrieval: Image → find related docs
├── Multimodal RAG: Embed text + images together
└── Product matching: Text description → find product image
```

### 2.3 Matryoshka (MRL) & Dimension Reduction

```
Matryoshka Representation Learning:
  Embedding có thể TRUNCATE mà giữ quality

  Full: [0.2, 0.8, -0.3, 0.5, 0.1, -0.7, ...] 3072 dims → 100% quality
  Truncated: [0.2, 0.8, -0.3, 0.5, 0.1, -0.7, ...] 1536 dims → 99%
  More truncated: [0.2, 0.8, -0.3, 0.5, ...] 256 dims → 95%

  → Giảm storage 12×, search 12× nhanh hơn
  → Supported: text-embedding-3-*
```

---

## 3. Vector Databases

### 3.1 Dedicated Vector DB

| Database | Type | Strengths | Scale |
|----------|------|-----------|-------|
| **Pinecone** | Cloud-native, managed | Easiest, Serverless | Billions |
| **Milvus** | Open-source | Scalable, production | Billions |
| **Qdrant** | Open-source | Rust (fast), filtering | Billions |
| **Weaviate** | Open-source | GraphQL, modules | Billions |
| **Chroma** | Open-source | Simple, dev-friendly | Millions |
| **LanceDB** | Embedded | Serverless, edge | Millions |

### 3.2 Code — Qdrant Vector DB

```python
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

# Connect
client = QdrantClient("localhost", port=6333)

# Create collection
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(
        size=1536,                    # Embedding dimension
        distance=Distance.COSINE     # Similarity metric
    )
)

# Insert vectors
points = []
for i, (text, embedding) in enumerate(zip(texts, embeddings)):
    points.append(PointStruct(
        id=i,
        vector=embedding,
        payload={
            "text": text,
            "source": "doc1.pdf",
            "page": i,
            "date": "2026-03-31"
        }
    ))
client.upsert(collection_name="documents", points=points)

# Search
results = client.search(
    collection_name="documents",
    query_vector=query_embedding,
    limit=5,                           # Top 5 results
    query_filter={                      # Metadata filtering
        "must": [
            {"key": "date", "match": {"value": "2026-03-31"}}
        ]
    }
)

for result in results:
    print(f"Score: {result.score:.4f} | Text: {result.payload['text'][:100]}")
```

---

## 4. PostgreSQL + pgvector

### 4.1 pgvector — Vector Search in PostgreSQL

```sql
-- Install pgvector extension
CREATE EXTENSION vector;

-- Create table with vector column
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536),  -- 1536-dimensional vector
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert
INSERT INTO documents (content, metadata, embedding)
VALUES (
    'Machine learning is amazing',
    '{"source": "doc1.pdf", "page": 1}',
    '[0.1, -0.2, 0.3, ...]'::vector
);

-- Cosine similarity search
SELECT id, content, metadata,
       1 - (embedding <=> '[query_vector]'::vector) AS similarity
FROM documents
ORDER BY embedding <=> '[query_vector]'::vector  -- <=> = cosine distance
LIMIT 5;

-- L2 distance search
SELECT * FROM documents
ORDER BY embedding <-> '[query_vector]'::vector  -- <-> = L2 distance
LIMIT 5;

-- Inner product search
SELECT * FROM documents  
ORDER BY embedding <#> '[query_vector]'::vector  -- <#> = inner product
LIMIT 5;

-- Create HNSW index (QUAN TRỌNG cho performance)
CREATE INDEX ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 200);

-- Hybrid: vector + metadata filter
SELECT id, content,
       1 - (embedding <=> '[query_vector]'::vector) AS similarity
FROM documents
WHERE metadata->>'source' = 'doc1.pdf'
  AND created_at > '2026-01-01'
ORDER BY embedding <=> '[query_vector]'::vector
LIMIT 5;
```

### 4.2 Khi nào dùng pgvector vs Dedicated VectorDB

```
pgvector tốt khi:
├── ✅ Đã dùng PostgreSQL (không thêm infra)
├── ✅ < 10M vectors
├── ✅ Cần JOIN với relational data
├── ✅ ACID transactions cần thiết
├── ✅ Team biết SQL
└── ✅ Simple deployment

Dedicated VectorDB tốt khi:
├── ✅ > 10M vectors (billion-scale)
├── ✅ Cần high-throughput search
├── ✅ Advanced filtering + search
├── ✅ Distributed/sharded deployment
├── ✅ Built-in ML features (auto-embedding)
└── ✅ Cloud-managed preferred
```

---

## 5. Indexing Algorithms chi tiết

### 5.1 HNSW Deep Dive

```
HNSW (Hierarchical Navigable Small World):

Structure: Multi-layer graph
  Layer 3:  A ──── D              (few nodes, long connections)
  Layer 2:  A ── C ── D ── F     (more nodes)
  Layer 1:  A ─ B ─ C ─ D ─ E ─ F ─ G  (even more)
  Layer 0:  A B C D E F G H I J K L M N  (ALL nodes)

Search Process:
1. Start at top layer → find closest node
2. Descend to next layer → refine
3. Continue to Layer 0 → precise search
4. Return K nearest neighbors

Parameters:
├── M: Max connections per node (16 default)
│   Higher M → better recall, more memory
├── ef_construction: Build-time beam width (200)
│   Higher → better graph quality, slower build
├── ef_search: Query-time beam width (depends)
│   Higher → better recall, slower query
└── Tuning:
    ef_search=50:  ~95% recall, fast
    ef_search=100: ~98% recall, moderate
    ef_search=200: ~99.5% recall, slower
```

### 5.2 Performance Comparison

```
1M vectors, 1536 dimensions, laptop (M1 Mac):

┌────────────┬────────────┬──────────┬──────────┐
│ Algorithm  │ Recall@10  │ QPS      │ Memory   │
├────────────┼────────────┼──────────┼──────────┤
│ Brute Force│ 100%       │ 50       │ 6 GB     │
│ HNSW       │ 99.5%      │ 3,000    │ 12 GB    │
│ IVF (1024) │ 95%        │ 5,000    │ 6 GB     │
│ IVF-PQ     │ 85%        │ 10,000   │ 1 GB     │
│ HNSW-PQ    │ 95%        │ 8,000    │ 3 GB     │
└────────────┴────────────┴──────────┴──────────┘

Rule of thumb:
├── < 100K vectors: Brute force OK
├── 100K-10M: HNSW
├── 10M-100M: HNSW or IVF depending on memory
├── 100M+: IVF-PQ hoặc dedicated VectorDB
└── Billion+: Distributed VectorDB (Milvus, Pinecone)
```

---

## 6. Hybrid Search & Polystore

### 6.1 Hybrid Search Architecture

```
Hybrid = Vector (Semantic) + Keyword (Lexical) + Metadata (Filters)

User Query: "error ERR_403 authentication"
                    │
    ┌───────────────┼───────────────┐
    ▼               ▼               ▼
┌─────────┐   ┌─────────┐   ┌─────────────┐
│ Vector   │   │ BM25    │   │ Metadata    │
│ Search   │   │ Search  │   │ Filter      │
│ (meaning)│   │(keyword)│   │(date,type)  │
└────┬────┘   └────┬────┘   └──────┬──────┘
     │              │               │
     └──────────────┼───────────────┘
                    ▼
            ┌───────────────┐
            │ RRF / Weighted│  Reciprocal Rank Fusion
            │ Fusion        │  
            └──────┬────────┘
                   ▼
            ┌───────────────┐
            │ Re-ranking    │  Cross-encoder re-scoring
            │ (optional)    │
            └──────┬────────┘
                   ▼
              Top K Results
```

### 6.2 Polystore Architecture (2026 Pattern)

```
Polystore: Mỗi loại data ở nơi TỐI ƯU nhất

┌─────────────────────────────────────────┐
│           Application Layer              │
│  (Unified Query Interface)               │
├────────┬────────┬────────┬──────────────┤
│Postgres│ Vector │ Graph  │ Search       │
│SQL Data│ DB     │ DB     │ Engine       │
│        │(Qdrant)│(Neo4j) │(Elastic)     │
├────────┼────────┼────────┼──────────────┤
│Users   │Embeds  │Rels    │Full-text     │
│Orders  │Chunks  │Entities│Logs          │
│Products│Metadata│Links   │Analytics     │
└────────┴────────┴────────┴──────────────┘

AI Query:
1. Vector DB → relevant chunks
2. Graph DB → entity relationships
3. SQL DB → structured data
4. Search → full-text results
5. Merge → comprehensive answer
```

---

## 7. Choosing a Vector DB

### 7.1 Decision Matrix

```
Chọn Vector DB — Decision Tree:

1. Prototype / Hackathon?
   → Chroma (pip install, in-memory)

2. Already using PostgreSQL?
   → pgvector (no new infra)

3. < 10M vectors, self-hosted?
   → Qdrant (Rust performance, Docker)

4. Managed cloud, easy scaling?
   → Pinecone (serverless, zero-ops)

5. Billion-scale, distributed?
   → Milvus (proven at scale, Kubernetes)

6. GraphQL / module ecosystem?
   → Weaviate (built-in modules)

7. Embedded / edge?
   → LanceDB (no server needed)
```

---

## FAQ & Best Practices

### Q1: Embedding model nào chọn?
**A:**
```
General purpose: text-embedding-3-small (OpenAI) — best cost/quality
Multilingual: BGE-M3 (open) hoặc Cohere embed-v4
Long documents: E5-mistral-7b (32K context)
On-premise: BGE-M3, nomic-embed-text
Budget: nomic-embed-text (open, free)
```

### Q2: Bao nhiêu dimensions là đủ?
**A:**
```
256 dims: OK for most use cases, fast search
512 dims: Good balance
768-1536 dims: High quality, standard
3072 dims: Maximum quality, more storage
→ Test trên data THỰC, đo recall vs speed tradeoff
→ MRL cho phép flexible dimension at query time
```

### Best Practices
1. **Normalize vectors** — cosine similarity cần normalized vectors
2. **Batch embedding calls** — API batch tốt hơn single calls
3. **Store metadata** — cùng với vectors cho filtering
4. **Index tuning** — ef_search, nprobe cho tradeoff recall/speed
5. **Hybrid search** — LUÔN combine vector + keyword
6. **Monitor recall** — test regularly trên eval set
7. **Version embeddings** — model change = re-embed all

---

## Bài tập thực hành

### Bài 1: Embedding & Search
1. Embed 1000 documents (real dataset)
2. Build search API: query → top 10 similar docs
3. Compare Cosine vs L2 vs Dot Product

### Bài 2: pgvector
1. Setup PostgreSQL + pgvector
2. Insert 100K vectors + metadata
3. Build hybrid search: vector + SQL filters
4. Compare performance: HNSW vs IVF vs brute force

### Bài 3: Production Vector Search
1. Setup Qdrant (Docker)
2. Build indexing pipeline (auto-embed new documents)
3. Implement hybrid search (BM25 + Vector + Metadata)
4. Load test: measure QPS at different scales

---

**Tiếp theo:** [Bài 12: Fine-Tuning & Training →](./12-Fine-Tuning-Training.md)
