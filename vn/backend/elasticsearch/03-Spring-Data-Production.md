# Spring Data Elasticsearch & Production

## Spring Data Elasticsearch

```java
@Document(indexName = "products")
public class ProductDocument {
    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Float)
    private Float price;

    @Field(type = FieldType.Keyword)
    private String category;

    @Field(type = FieldType.Keyword)
    private List<String> tags;
}

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, String> {
    List<ProductDocument> findByNameContaining(String name);
    List<ProductDocument> findByCategoryAndPriceBetween(String category, float min, float max);
}

// Custom query
@Service
public class ProductSearchService {
    @Autowired
    private ElasticsearchOperations esOps;

    public SearchHits<ProductDocument> search(String query, String category, int page) {
        var criteria = new CriteriaQuery(
            Criteria.where("name").matches(query)
                .and(Criteria.where("category").is(category))
        );
        criteria.setPageable(PageRequest.of(page, 20));
        return esOps.search(criteria, ProductDocument.class);
    }
}
```

## Production Scaling

```
Sizing:
  Shards: 5-20 per index (tùy data size)
  Replicas: 1-2 (HA + read throughput)
  Memory: 50% RAM cho JVM heap, 50% cho OS cache
  
Cluster:
  3+ master-eligible nodes (quorum)
  Data nodes: tùy data volume
  Coordinating nodes: cho query routing

Index lifecycle:
  Hot → Warm → Cold → Delete
  (SSD)  (HDD)  (Frozen) (Auto-delete)
```

## Câu Hỏi Phỏng Vấn

### Elasticsearch vs SQL database cho search?
> ES: inverted index → full-text search nhanh (ms), relevance scoring, analyzers. SQL: LIKE '%query%' → full table scan, chậm, không scoring. ES cho search, SQL cho transactions.

### Khi nào dùng Elasticsearch?
> Full-text search (e-commerce), log analysis (ELK), analytics dashboards, auto-complete, geo search. KHÔNG dùng làm primary database (no transactions, eventual consistency).

**Quay lại:** [README.md](./README.md)
