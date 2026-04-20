# Bài 6: RAG — Retrieval-Augmented Generation

> Module: [Building with the Claude API](./README.md) → Bài 6

---

## 🔹 1. RAG là gì?

**RAG** = Truy xuất thông tin liên quan từ knowledge base → đưa vào prompt → Claude trả lời dựa trên dữ liệu thực.

```
Không RAG:                          Có RAG:
User → Claude → trả lời            User → Search KB → lấy context
(từ training data,                       → đưa vào prompt → Claude
 có thể outdated/hallucinate)            → trả lời chính xác
```

**Tại sao cần RAG:**
- Claude chỉ biết dữ liệu đến training cutoff
- Company data, internal docs → Claude không biết
- RAG cho phép Claude trả lời dựa trên **dữ liệu cụ thể của bạn**

## 🔹 2. RAG Pipeline

```
┌─────────────┐     ┌───────────┐     ┌────────────┐
│ Documents   │ →   │ Chunking  │ →   │ Embeddings │
│ (PDF, text) │     │ (chia nhỏ)│     │ (vector)   │
└─────────────┘     └───────────┘     └────────────┘
                                            │
                                       ┌────▼───────┐
                                       │ Vector DB  │
                                       │ (lưu trữ)  │
                                       └────────────┘
                                            │
┌─────────────┐     ┌───────────┐     ┌────▼───────┐
│ User Query  │ →   │ Embed     │ →   │ Search     │
│             │     │ query     │     │ similar    │
└─────────────┘     └───────────┘     └────────────┘
                                            │
                                       ┌────▼───────┐
                                       │ Claude +   │
                                       │ Context    │ → Answer
                                       └────────────┘
```

## 🔹 3. Text Chunking

Chia tài liệu dài thành các đoạn nhỏ (chunks) để search hiệu quả.

```python
def chunk_text(text, chunk_size=500, overlap=50):
    """Chia text thành chunks với overlap"""
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append({
            "text": chunk,
            "start_word": i,
            "end_word": min(i + chunk_size, len(words))
        })
    
    return chunks

# Ví dụ
document = open("technical_spec.md").read()
chunks = chunk_text(document, chunk_size=300, overlap=30)
print(f"Document → {len(chunks)} chunks")
```

**Chiến lược chunking:**

| Chiến lược | Mô tả | Tốt cho |
|-----------|-------|---------|
| Fixed-size | Chia theo số từ/ký tự cố định | Simple, nhanh |
| Sentence-based | Chia theo câu | Giữ ngữ cảnh câu |
| Semantic | Chia theo ý nghĩa/đoạn | Chất lượng cao nhất |
| Recursive | Thử nhiều separators | Tổng quát nhất |

## 🔹 4. Text Embeddings

Embedding biến text → vector số → so sánh similarity.

```python
import anthropic
import numpy as np

# Anthropic không có embedding API riêng
# Dùng Voyage AI (partner) hoặc OpenAI
# Ví dụ với một embedding function generic:

def get_embedding(text):
    """Placeholder — thay bằng embedding API thực"""
    # Dùng voyageai, openai, hoặc sentence-transformers
    # pip install voyageai
    import voyageai
    vo = voyageai.Client()
    result = vo.embed([text], model="voyage-3")
    return result.embeddings[0]

# Embed tất cả chunks
chunk_embeddings = []
for chunk in chunks:
    embedding = get_embedding(chunk["text"])
    chunk_embeddings.append({
        "text": chunk["text"],
        "embedding": embedding
    })
```

## 🔹 5. Similarity Search

```python
from numpy import dot
from numpy.linalg import norm

def cosine_similarity(a, b):
    """Tính cosine similarity giữa 2 vectors"""
    return dot(a, b) / (norm(a) * norm(b))

def search(query, chunk_embeddings, top_k=3):
    """Tìm top-K chunks liên quan nhất"""
    query_embedding = get_embedding(query)
    
    scored = []
    for chunk in chunk_embeddings:
        score = cosine_similarity(query_embedding, chunk["embedding"])
        scored.append({
            "text": chunk["text"],
            "score": score
        })
    
    # Sort theo score giảm dần
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]
```

## 🔹 6. Full RAG Flow

```python
import anthropic

client = anthropic.Anthropic()

def rag_answer(user_question, chunk_embeddings):
    """Full RAG pipeline"""
    
    # 1. Search chunks liên quan
    relevant_chunks = search(user_question, chunk_embeddings, top_k=5)
    
    # 2. Xây dựng context
    context = "\n\n---\n\n".join([
        f"[Relevance: {c['score']:.2f}]\n{c['text']}" 
        for c in relevant_chunks
    ])
    
    # 3. Gửi cho Claude với context
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        system="""Bạn là trợ lý trả lời câu hỏi dựa trên tài liệu được cung cấp.
Chỉ trả lời dựa trên thông tin trong Context. 
Nếu Context không chứa thông tin cần thiết, nói rõ "Tôi không tìm thấy thông tin này trong tài liệu".""",
        messages=[{
            "role": "user",
            "content": f"""<context>
{context}
</context>

<question>
{user_question}
</question>

Trả lời câu hỏi dựa trên context trên. Trích dẫn phần liên quan."""
        }]
    )
    
    return response.content[0].text

# Sử dụng
answer = rag_answer("Hệ thống xử lý authentication như thế nào?", chunk_embeddings)
print(answer)
```

## 🔹 7. BM25 Lexical Search

BM25 tìm kiếm dựa trên **từ khóa** (keyword matching), bổ sung cho semantic search.

```python
# pip install rank_bm25
from rank_bm25 import BM25Okapi

# Tokenize chunks
tokenized_chunks = [chunk["text"].lower().split() for chunk in chunks]

# Build BM25 index
bm25 = BM25Okapi(tokenized_chunks)

# Search
query = "authentication login JWT"
query_tokens = query.lower().split()
bm25_scores = bm25.get_scores(query_tokens)

# Lấy top results
top_indices = bm25_scores.argsort()[-5:][::-1]
bm25_results = [chunks[i]["text"] for i in top_indices]
```

## 🔹 8. Multi-Index RAG (Hybrid Search)

Kết hợp semantic + lexical cho kết quả tốt nhất:

```python
def hybrid_search(query, chunks, chunk_embeddings, top_k=5):
    """Kết hợp BM25 + Semantic search"""
    
    # Semantic search
    semantic_results = search(query, chunk_embeddings, top_k=top_k)
    
    # BM25 search
    query_tokens = query.lower().split()
    bm25_scores = bm25.get_scores(query_tokens)
    
    # Combine scores (Reciprocal Rank Fusion)
    combined = {}
    for rank, result in enumerate(semantic_results):
        text = result["text"]
        combined[text] = combined.get(text, 0) + 1 / (rank + 60)
    
    top_bm25 = bm25_scores.argsort()[-top_k:][::-1]
    for rank, idx in enumerate(top_bm25):
        text = chunks[idx]["text"]
        combined[text] = combined.get(text, 0) + 1 / (rank + 60)
    
    # Sort và return top_k
    sorted_results = sorted(combined.items(), key=lambda x: x[1], reverse=True)
    return [{"text": text, "score": score} for text, score in sorted_results[:top_k]]
```

---

## 📝 Tổng kết RAG Pipeline

| Bước | Mô tả | Tool |
|------|-------|------|
| **Chunking** | Chia tài liệu → đoạn nhỏ | Custom / LangChain |
| **Embedding** | Text → vector | Voyage AI / OpenAI |
| **Indexing** | Lưu vectors | ChromaDB / Pinecone / FAISS |
| **Retrieval** | Tìm chunks liên quan | Cosine similarity + BM25 |
| **Generation** | Claude + context → answer | Anthropic API |

---

➡️ Tiếp theo: [Features](07-features.md)
