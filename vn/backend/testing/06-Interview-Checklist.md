# Testing Interview & Checklist

## Checklist

- [ ] Test Pyramid: unit 70%, integration 20%, E2E 10%
- [ ] JUnit 5: @Test, @BeforeEach, @Nested, @ParameterizedTest
- [ ] Mockito: when/thenReturn, verify, ArgumentCaptor, @InjectMocks
- [ ] AssertJ: fluent assertions, collections, exceptions
- [ ] @SpringBootTest, @WebMvcTest, @DataJpaTest — khi nào dùng gì
- [ ] Testcontainers: PostgreSQL, Kafka, Redis trong test
- [ ] Contract testing: Spring Cloud Contract hoặc Pact
- [ ] Performance testing: K6/Gatling, SLA thresholds
- [ ] TDD: Red-Green-Refactor cycle
- [ ] Test naming: `should_expectedBehavior_when_condition`

## Top Câu Hỏi

**Q: Test gì khi thời gian ít?**
> Ưu tiên: (1) Unit test cho business logic phức tạp, (2) Integration test cho API chính, (3) Contract test cho microservices boundary. Bỏ: trivial CRUD, getter/setter.

**Q: Mock vs Real dependency?**
> Unit test → mock (nhanh, isolate). Integration test → real (Testcontainers). Contract test → stub (verify API contract). Performance test → real hoặc staging.

**Q: Code coverage bao nhiêu là đủ?**
> 70-80% là target tốt. 100% là lãng phí. Quan trọng: coverage cho **critical business logic**, không phải cho boilerplate.

**Quay lại:** [README.md](./README.md)
