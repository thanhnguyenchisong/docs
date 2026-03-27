# Contract Testing — Consumer-Driven Contracts

## Tại sao cần Contract Testing?

```
Microservices: Order Service → gọi API → Payment Service
Vấn đề: Payment đổi response format → Order bị lỗi → phát hiện khi deploy

Contract test: định nghĩa "hợp đồng" API → test CẢ HAI bên tuân thủ
```

## Spring Cloud Contract

### Producer Side (Payment Service)

```groovy
// src/test/resources/contracts/shouldChargePayment.groovy
Contract.make {
    description "Should charge payment"
    request {
        method POST()
        url "/api/payments/charge"
        headers { contentType applicationJson() }
        body([
            userId: "user-1",
            amount: 100000,
            currency: "VND"
        ])
    }
    response {
        status 200
        headers { contentType applicationJson() }
        body([
            transactionId: $(anyUuid()),
            status: "SUCCESS",
            chargedAmount: 100000
        ])
    }
}
```

### Consumer Side (Order Service)

```java
// Order Service tests with stub from Payment Service
@SpringBootTest
@AutoConfigureStubRunner(
    ids = "com.example:payment-service:+:stubs:8090",
    stubsMode = StubRunnerProperties.StubsMode.LOCAL
)
class OrderServiceContractTest {

    @Test
    void shouldChargePayment() {
        PaymentResult result = paymentClient.charge("user-1", Money.of(100000));

        assertThat(result.getStatus()).isEqualTo("SUCCESS");
        assertThat(result.getTransactionId()).isNotBlank();
    }
}
```

## Pact (Alternative)

```java
// Consumer test (Order Service) defines contract
@ExtendWith(PactConsumerTestExt.class)
class PaymentClientPactTest {

    @Pact(consumer = "order-service", provider = "payment-service")
    public V4Pact createPact(PactDslWithProvider builder) {
        return builder
            .given("user exists")
            .uponReceiving("charge payment")
            .path("/api/payments/charge")
            .method("POST")
            .body(new PactDslJsonBody()
                .stringType("userId", "user-1")
                .numberType("amount", 100000))
            .willRespondWith()
            .status(200)
            .body(new PactDslJsonBody()
                .uuid("transactionId")
                .stringValue("status", "SUCCESS"))
            .toPact(V4Pact.class);
    }

    @Test
    @PactTestFor(pactMethod = "createPact")
    void testCharge(MockServer mockServer) {
        PaymentClient client = new PaymentClient(mockServer.getUrl());
        PaymentResult result = client.charge("user-1", 100000);
        assertThat(result.getStatus()).isEqualTo("SUCCESS");
    }
}
```
