# Elasticsearch Fundamentals

## Elasticsearch Là Gì?

> Distributed, RESTful search engine. Full-text search, analytics, log analysis. Dựa trên Apache Lucene.

## Concepts

| Concept | SQL equivalent | Mô tả |
|---------|---------------|--------|
| **Index** | Database | Tập hợp documents cùng loại |
| **Document** | Row | 1 JSON object |
| **Field** | Column | 1 trường trong document |
| **Mapping** | Schema | Định nghĩa field types |
| **Shard** | Partition | Chia index thành phần nhỏ |
| **Replica** | Replica | Copy của shard (HA + read scale) |

## Mapping

```json
PUT /products
{
  "mappings": {
    "properties": {
      "name":        { "type": "text", "analyzer": "vietnamese" },
      "description": { "type": "text" },
      "price":       { "type": "float" },
      "category":    { "type": "keyword" },
      "tags":        { "type": "keyword" },
      "inStock":     { "type": "boolean" },
      "createdAt":   { "type": "date" },
      "location":    { "type": "geo_point" }
    }
  },
  "settings": {
    "number_of_shards": 5,
    "number_of_replicas": 1
  }
}
```

### text vs keyword

| | text | keyword |
|---|------|---------|
| **Analyzed** | ✅ (tokenized, lowercase) | ❌ (exact value) |
| **Search** | Full-text search | Exact match, filter, sort, aggregation |
| **Ví dụ** | Product name, description | Category, status, email, tags |

## CRUD Operations

```bash
# Create
POST /products/_doc
{ "name": "iPhone 16 Pro", "price": 28990000, "category": "electronics" }

# Read
GET /products/_doc/1

# Update
POST /products/_update/1
{ "doc": { "price": 27990000 } }

# Delete
DELETE /products/_doc/1

# Bulk
POST /_bulk
{ "index": { "_index": "products" } }
{ "name": "Product A", "price": 100 }
{ "index": { "_index": "products" } }
{ "name": "Product B", "price": 200 }
```

## Analyzer — Cách Text Được Xử Lý

```
Input: "The Quick Brown FOX jumps"
         ↓ Character Filter (html_strip, mapping)
       "The Quick Brown FOX jumps"  
         ↓ Tokenizer (standard)
       ["The", "Quick", "Brown", "FOX", "jumps"]
         ↓ Token Filter (lowercase, stop, stemmer)
       ["quick", "brown", "fox", "jump"]
```

## So sánh với SQL

```sql
-- SQL (chậm ở scale lớn)
SELECT * FROM products
WHERE name LIKE '%iphone%' OR description LIKE '%iphone%'
ORDER BY relevance; -- Không có relevance scoring!

-- Elasticsearch (nhanh, có relevance scoring)
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "iphone",
      "fields": ["name^3", "description"]
    }
  }
}
-- name match có điểm gấp 3 (boost) → search chính xác hơn
```
