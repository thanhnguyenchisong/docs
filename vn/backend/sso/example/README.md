# Example — Project minh họa SSO

Minh họa OAuth2/OIDC: Resource Server (Spring Boot) bảo vệ API bằng JWT. Cần IdP (Keycloak, Auth0, hoặc Okta) chạy sẵn.

## Chạy Keycloak (Docker)

```bash
docker run -d -p 8180:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak start-dev
```

Tạo realm, client, user theo tài liệu [../README.md](../README.md). Ứng dụng Spring Boot cấu hình `spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8180/realms/your-realm`.

## Ứng dụng mẫu

Có thể dùng project từ [../jpa/example](../jpa/example), thêm dependency:

- `spring-boot-starter-oauth2-resource-server`

và cấu hình JWT issuer. Mọi request tới `/api/**` cần header `Authorization: Bearer <token>`. Đọc kèm các file trong backend/sso.
