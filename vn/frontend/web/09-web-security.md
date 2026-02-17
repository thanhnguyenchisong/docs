# Web Security

Các rủi ro và biện pháp bảo mật phía client và giao tiếp web: XSS, CSP, CORS, HTTPS, cookies. Senior cần nắm để thiết kế và trả lời phỏng vấn.

## Mục lục
1. [Bảo mật web là gì? (Cho người mới)](#bảo-mật-web-là-gì-cho-người-mới)
2. [Ví dụ trực quan: XSS đơn giản và cách tránh](#ví-dụ-trực-quan-xss-đơn-giản-và-cách-tránh)
3. [XSS (Cross-Site Scripting)](#xss-cross-site-scripting)
4. [CSP (Content Security Policy)](#csp-content-security-policy)
5. [CORS](#cors)
6. [HTTPS và transport](#https-và-transport)
7. [Cookies và token](#cookies-và-token)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## Bảo mật web là gì? (Cho người mới)

- **Bảo mật web (phía frontend và giao tiếp)** = tránh kẻ xấu đánh cắp dữ liệu, chiếm phiên đăng nhập, hoặc chèn mã độc vào trang. Các rủi ro thường gặp: **XSS** (script chạy trong trang của nạn nhân), **CSRF** (request giả mạo từ site khác), **CORS** (gọi API khác domain bị chặn nếu server không cấu hình), **lộ cookie/token** (bị đọc qua XSS hoặc gửi qua HTTP không mã hóa).
- **Frontend có thể làm:** Escape/sanitize dữ liệu hiển thị (chống XSS), không lưu token nhạy cảm vào localStorage khi có rủi ro XSS, dùng HTTPS, tôn trọng CSP. **Server phải làm:** CORS, cookie HttpOnly/SameSite, CSRF token, HTTPS.
- Senior thường được hỏi: XSS vs CSRF khác nhau thế nào, CORS do ai cấu hình, cookie đặt HttpOnly/Secure/SameSite để làm gì.

---

## Ví dụ trực quan: XSS đơn giản và cách tránh

**Ví dụ nguy hiểm (chỉ để học, không dùng trong production):** Nếu trang hiển thị nội dung từ URL mà không escape, kẻ tấn công có thể gửi link: `https://site.com/search?q=<script>alert('XSS')</script>`. Nếu server hoặc client chèn `q` vào HTML (innerHTML hoặc document.write), script sẽ chạy — đó là **reflected XSS**.

**Cách tránh:** Luôn hiển thị dữ liệu user dưới dạng **text** (Angular/React escape mặc định cho `{{ data }}` hoặc text node), không dùng `innerHTML` với input thô. Nếu bắt buộc phải render HTML (editor rich text), dùng thư viện sanitize (DOMPurify, Angular DomSanitizer) để loại bỏ thẻ script.

**Thử trong Console:** `document.createElement('div').textContent = '<script>alert(1)</script>'` — sau đó `div.innerHTML` sẽ là chuỗi đã escape, không chạy script. So sánh với `div.innerHTML = '<script>alert(1)</script>'` (nguy hiểm, script chạy trong context đó). Đó là “escape output” trực quan.

---

## XSS (Cross-Site Scripting)

Kẻ tấn công chèn script chạy trong trang nạn nhân (trên browser). Hậu quả: đánh cắp cookie, session, thao tác DOM, redirect.

**Phân loại:**
- **Reflected**: Script nằm trong URL/param, server echo ra HTML (ví dụ search).
- **Stored**: Script lưu DB (comment, profile), hiển thị cho user khác.
- **DOM-based**: Script inject qua DOM (client-side), không qua server.

**Phòng tránh:**
- **Escape output**: Mọi dữ liệu user hiển thị phải escape (HTML entity). Framework (Angular, React) escape mặc định cho `{{ }}` / text content.
- **Tránh innerHTML với input thô**: Nếu bắt buộc dùng HTML, dùng sanitizer (DOMPurify, Angular DomSanitizer) hoặc CSP strict.
- **Content-Type đúng**: JSON API trả `Content-Type: application/json`; không render JSON như HTML.
- **HttpOnly cookie**: Cookie session không đọc được từ JS → giảm ăn cắp qua XSS.

---

## CSP (Content Security Policy)

Header **Content-Security-Policy** hạn chế nguồn script, style, image, connect... Trang chỉ load resource từ domain/directive cho phép; inline script/style có thể bị chặn trừ khi có nonce/hash.

Ví dụ:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com;
```

- **default-src 'self'**: Mặc định chỉ same origin.
- **script-src**: Nguồn script; `'unsafe-inline'` không an toàn nhưng nhiều app cũ còn dùng; tốt hơn dùng nonce hoặc hash.
- **connect-src**: Fetch, XHR, WebSocket — giới hạn API gọi được.

**Báo cáo**: `report-uri` hoặc `report-to` để nhận report vi phạm CSP (chỉ báo, không chặn nếu dùng report-only).

---

## CORS

**Same-Origin Policy**: Script từ origin A không đọc response từ origin B (khác domain/port/protocol) trừ khi B cho phép.

**CORS** (Cross-Origin Resource Sharing): Server B trả header **Access-Control-Allow-Origin** (ví dụ `*` hoặc `https://app.example.com`) để browser cho frontend A đọc response. **Preflight** (OPTIONS): Với method/header “đặc biệt”, browser gửi OPTIONS trước; server trả Allow-Origin, Allow-Methods, Allow-Headers.

- Frontend chỉ gửi request; **server phải cấu hình CORS** (whitelist origin, credentials nếu dùng cookie).
- **Credentials** (cookie, Authorization): Server cần `Access-Control-Allow-Credentials: true` và Allow-Origin **không** được là `*`.

---

## HTTPS và transport

- **HTTPS**: Mã hóa kênh (TLS); chống nghe lén và sửa dữ liệu. Production luôn dùng HTTPS.
- **HSTS** (Strict-Transport-Security): Header bảo browser chỉ truy cập qua HTTPS trong thời gian chỉ định.
- **Secure cookie**: Cookie đặt `Secure` chỉ gửi qua HTTPS.

---

## Cookies và token

- **Cookie**: Lưu trên browser; gửi tự động theo domain/path. **HttpOnly**: JS không đọc được (giảm XSS). **SameSite**: Strict/Lax chống CSRF (request cross-site không gửi cookie).
- **Token (JWT trong memory/localStorage)**: Không gửi tự động; frontend gửi trong header. localStorage dễ bị XSS đọc → nếu dùng token trong localStorage phải chắc không có XSS. Nhiều hệ thống dùng access token ngắn hạn + refresh token (httpOnly cookie hoặc secure endpoint).

**CSRF**: Request từ site khác mạo danh user (cookie gửi kèm). Phòng: SameSite cookie; CSRF token (server sinh, form gửi kèm); kiểm tra Referer/Origin (bổ sung).

---

## Câu hỏi thường gặp

**XSS và CSRF khác nhau thế nào?**  
XSS: chạy script trong trang (đánh cắp session, thao tác DOM). CSRF: site khác “lừa” browser gửi request hợp lệ (cookie gửi kèm) từ user đã đăng nhập.

**CORS do server hay client xử lý?**  
Server trả header Allow-Origin (và preflight). Client (browser) chỉ kiểm tra header; không “fix CORS” ở client bằng cách tắt bảo mật.

**Cookie SameSite Lax vs Strict?**  
Strict: cookie không gửi khi vào link từ site khác (ví dụ email link). Lax: gửi với top-level navigation (GET). Lax cân bằng bảo mật và UX (đăng nhập qua link).

**Token nên đặt ở đâu?**  
Access token: memory (biến) hoặc memory + refresh qua httpOnly cookie. Tránh localStorage nếu không chắc không XSS. Refresh token: tốt nhất httpOnly cookie (secure, sameSite).

---

→ Tiếp theo: [10 - Checklist Senior Web](10-senior-web-checklist.md)
