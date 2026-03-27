# Query DSL & Aggregations

## Query Types

### Full-text Queries

```json
// match: tokenize query → search
{ "query": { "match": { "name": "iphone pro" } } }

// match_phrase: exact phrase
{ "query": { "match_phrase": { "name": "iphone pro" } } }

// multi_match: search nhiều fields
{ "query": { "multi_match": {
    "query": "iphone",
    "fields": ["name^3", "description", "tags"]
} } }
```

### Term-level Queries (exact match)

```json
// term: exact keyword match
{ "query": { "term": { "category": "electronics" } } }

// terms: IN clause
{ "query": { "terms": { "status": ["active", "pending"] } } }

// range: number/date range
{ "query": { "range": { "price": { "gte": 10000, "lte": 50000 } } } }
```

### Boolean Query (compound)

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "iphone" } }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "lte": 30000000 } } }
      ],
      "should": [
        { "term": { "featured": true } }
      ],
      "must_not": [
        { "term": { "status": "discontinued" } }
      ]
    }
  }
}
```

## Aggregations

```json
// Tương đương GROUP BY + COUNT
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category", "size": 20 },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } },
        "price_ranges": {
          "range": {
            "field": "price",
            "ranges": [
              { "to": 1000000 },
              { "from": 1000000, "to": 10000000 },
              { "from": 10000000 }
            ]
          }
        }
      }
    }
  }
}
```

## Search with Pagination & Sort

```json
{
  "from": 0,
  "size": 20,
  "query": { "match": { "name": "laptop" } },
  "sort": [
    { "_score": "desc" },
    { "price": "asc" }
  ],
  "highlight": {
    "fields": { "name": {}, "description": {} }
  }
}
```
