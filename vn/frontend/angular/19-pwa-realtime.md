# PWA & Real-time Communication

Progressive Web App (PWA) và giao tiếp real-time (WebSocket, SSE) giúp ứng dụng Angular hoạt động offline, push notification, và cập nhật dữ liệu tức thời.

## Mục lục
1. [PWA là gì? (Cho người mới)](#pwa-là-gì-cho-người-mới)
2. [Cài đặt PWA trong Angular](#cài-đặt-pwa-trong-angular)
3. [Service Worker và Caching](#service-worker-và-caching)
4. [Push Notifications](#push-notifications)
5. [WebSocket với RxJS](#websocket-với-rxjs)
6. [Server-Sent Events (SSE)](#server-sent-events-sse)
7. [Best practices](#best-practices)
8. [Câu hỏi thường gặp](#câu-hỏi-thường-gặp)

---

## PWA là gì? (Cho người mới)

- **PWA (Progressive Web App)** = ứng dụng web có khả năng giống app native: **cài đặt** lên màn hình chính (Add to Home Screen), **hoạt động offline** (hoặc mạng yếu), **push notification** — tất cả chạy từ trình duyệt, không cần app store.
- **Service Worker** = script chạy ngầm (background), không truy cập DOM. Nó đứng giữa app và network: **cache** file tĩnh (JS, CSS, hình) → khi mất mạng, app vẫn load từ cache. Cũng xử lý push notification.
- **Angular PWA** = Angular cung cấp package `@angular/pwa` — cài một lệnh, tự cấu hình service worker, manifest, icons. File cấu hình chính: `ngsw-config.json`.

### Real-time là gì?

- **WebSocket** = kết nối **hai chiều** giữa client và server, mở liên tục. Server có thể gửi dữ liệu bất cứ lúc nào (không cần client request). Dùng cho: chat, dashboard live, notifications, game.
- **Server-Sent Events (SSE)** = kết nối **một chiều** (server → client), đơn giản hơn WebSocket. Dùng cho: feed, stock price, notification stream.

---

## Cài đặt PWA trong Angular

```bash
ng add @angular/pwa
```

Lệnh này tự động:
- Tạo `ngsw-config.json` (cấu hình cache).
- Tạo `manifest.webmanifest` (tên app, icons, theme color).
- Thêm `provideServiceWorker()` vào `app.config.ts`.
- Tạo icons mẫu trong `src/assets/icons/`.

### manifest.webmanifest

```json
{
  "name": "My Angular App",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1976d2",
  "icons": [
    { "src": "assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- `display: "standalone"`: App chạy như native (không có thanh URL).
- Icons: Cần ít nhất 192x192 và 512x512 cho install prompt.

### app.config.ts

```typescript
import { provideServiceWorker } from '@angular/service-worker';

providers: [
  provideServiceWorker('ngsw-worker.js', {
    enabled: !isDevMode(),  // Chỉ bật trong production
    registrationStrategy: 'registerWhenStable:30000',
  }),
],
```

> **Lưu ý:** Service worker chỉ hoạt động trên **production build** (`ng build`) và **HTTPS** (hoặc localhost). `ng serve` không bật service worker.

---

## Service Worker và Caching

### ngsw-config.json — cấu hình cache

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(png|jpg|svg|webp)"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-performance",
      "urls": ["/api/products", "/api/categories"],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "5s"
      }
    },
    {
      "name": "api-freshness",
      "urls": ["/api/user/profile"],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 10,
        "maxAge": "10m",
        "timeout": "3s"
      }
    }
  ]
}
```

| Khái niệm | Ý nghĩa |
|------------|---------|
| **assetGroups** | Cache file tĩnh (JS, CSS, images) |
| **installMode: prefetch** | Tải và cache **ngay** khi service worker cài đặt |
| **installMode: lazy** | Cache khi **lần đầu request** (không tải trước) |
| **dataGroups** | Cache **API response** |
| **strategy: performance** | Cache-first: trả từ cache, background fetch mới (nhanh, có thể stale) |
| **strategy: freshness** | Network-first: gọi API trước, nếu timeout thì dùng cache (dữ liệu mới hơn) |

### Kiểm tra update app

Khi deploy version mới, service worker tải `ngsw.json` mới → phát hiện thay đổi → cache files mới.

```typescript
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      ).subscribe(() => {
        if (confirm('Có phiên bản mới. Cập nhật ngay?')) {
          window.location.reload();
        }
      });
    }
  }

  checkForUpdate() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
    }
  }
}
```

---

## Push Notifications

### Flow push notification

```
1. Client đăng ký push (PushManager.subscribe) → nhận subscription (endpoint + keys)
2. Client gửi subscription lên server (POST /api/push/subscribe)
3. Server lưu subscription
4. Khi cần thông báo: Server gửi message tới endpoint (Web Push Protocol)
5. Service worker nhận push event → hiển thị notification
```

### Angular — đăng ký push

```typescript
import { SwPush } from '@angular/service-worker';

@Injectable({ providedIn: 'root' })
export class PushService {
  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  private VAPID_PUBLIC_KEY = 'your-vapid-public-key';

  subscribeToPush() {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY,
    }).then(subscription => {
      // Gửi subscription lên server
      this.http.post('/api/push/subscribe', subscription).subscribe();
    }).catch(err => console.error('Push subscription failed:', err));
  }

  // Lắng nghe notification click
  listenToNotificationClicks() {
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      console.log('Notification clicked:', notification.title, action);
      // Navigate tới trang tương ứng
    });
  }
}
```

---

## WebSocket với RxJS

### webSocket() — RxJS operator

RxJS cung cấp `webSocket()` tạo Observable **hai chiều** cho WebSocket connection:

```typescript
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retry, delay, share } from 'rxjs/operators';

export interface ChatMessage {
  user: string;
  text: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket$: WebSocketSubject<ChatMessage>;
  readonly messages$;

  constructor() {
    this.socket$ = webSocket<ChatMessage>({
      url: 'wss://api.example.com/ws/chat',
      openObserver: { next: () => console.log('WebSocket connected') },
      closeObserver: { next: () => console.log('WebSocket disconnected') },
    });

    // Share connection + auto reconnect
    this.messages$ = this.socket$.pipe(
      retry({ delay: 3000, count: 10 }),  // Reconnect sau 3s, tối đa 10 lần
      share(),  // Chia sẻ subscription cho nhiều component
    );
  }

  send(message: ChatMessage) {
    this.socket$.next(message);
  }

  close() {
    this.socket$.complete();
  }
}
```

### Component chat

```typescript
@Component({
  template: `
    <div class="chat">
      @for (msg of messages(); track msg.timestamp) {
        <div class="message">
          <strong>{{ msg.user }}:</strong> {{ msg.text }}
        </div>
      }
      <input #input (keyup.enter)="send(input.value); input.value = ''" placeholder="Nhập tin..." />
    </div>
  `,
})
export class ChatComponent implements OnInit {
  private ws = inject(WebSocketService);
  private destroyRef = inject(DestroyRef);
  messages = signal<ChatMessage[]>([]);

  ngOnInit() {
    this.ws.messages$.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(msg => {
      this.messages.update(list => [...list, msg]);
    });
  }

  send(text: string) {
    if (!text.trim()) return;
    this.ws.send({ user: 'Me', text, timestamp: Date.now() });
  }
}
```

### Multiplexing — nhiều channel trên một connection

```typescript
// Gửi subscribe/unsubscribe message để server route đúng channel
const orders$ = this.socket$.multiplex(
  () => ({ type: 'subscribe', channel: 'orders' }),   // Subscribe message
  () => ({ type: 'unsubscribe', channel: 'orders' }), // Unsubscribe message
  (msg) => msg.channel === 'orders',                   // Filter
);
```

---

## Server-Sent Events (SSE)

SSE = HTTP connection giữ mở, server gửi event liên tục (one-way: server → client). Đơn giản hơn WebSocket, dùng HTTP chuẩn.

```typescript
@Injectable({ providedIn: 'root' })
export class SseService {
  connect(url: string): Observable<MessageEvent> {
    return new Observable(observer => {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => observer.next(event);
      eventSource.onerror = (error) => observer.error(error);

      // Cleanup khi unsubscribe
      return () => eventSource.close();
    });
  }
}
```

### Component nhận live price

```typescript
@Component({
  template: `
    <p>Giá hiện tại: {{ price() | currency:'VND' }}</p>
  `,
})
export class PriceTickerComponent implements OnInit {
  private sse = inject(SseService);
  private destroyRef = inject(DestroyRef);
  price = signal(0);

  ngOnInit() {
    this.sse.connect('/api/prices/stream').pipe(
      map(event => JSON.parse(event.data)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(data => this.price.set(data.price));
  }
}
```

### SSE vs WebSocket

| | SSE | WebSocket |
|---|-----|-----------|
| **Hướng** | Server → Client (một chiều) | Hai chiều |
| **Protocol** | HTTP | ws:// / wss:// |
| **Auto reconnect** | Có (browser tự reconnect) | Phải tự implement |
| **Binary data** | Không (chỉ text) | Có |
| **Dùng khi** | Feed, notification, stock price | Chat, game, collaborative editing |

---

## Best practices

| Nội dung | Gợi ý |
|----------|-------|
| **PWA testing** | Build production (`ng build`), serve với `http-server` hoặc `npx serve dist/...`, mở DevTools → Application → Service Workers để kiểm tra |
| **Cache invalidation** | Đặt `maxAge` hợp lý cho dataGroups; dùng `freshness` cho data thay đổi thường xuyên |
| **WebSocket reconnect** | Luôn có retry logic với delay tăng dần (exponential backoff); hiện trạng thái "Mất kết nối" cho user |
| **Unsubscribe** | WebSocket Observable cần unsubscribe khi component destroy (`takeUntilDestroyed`) |
| **Offline UX** | Hiện thông báo "Offline mode" khi mất mạng; disable nút submit; queue mutations cho khi online lại |
| **HTTPS** | Service worker và push notification **bắt buộc** HTTPS (trừ localhost) |

---

## Câu hỏi thường gặp

**PWA có thay thế app native không?**  
Tùy trường hợp. PWA đủ cho nhiều app (tin tức, e-commerce, dashboard). App cần hardware đặc biệt (Bluetooth, NFC nâng cao, camera nâng cao) vẫn cần native. PWA là lựa chọn tốt khi cần deploy nhanh, không qua app store.

**Service worker chạy ở đâu?**  
Trong browser, thread riêng (không block UI). Không truy cập DOM. Giao tiếp với app qua `postMessage`. Hoạt động ngay cả khi tab đóng (cho push notification).

**WebSocket có cần thư viện thêm không?**  
RxJS đã có `webSocket()` — đủ cho hầu hết trường hợp. Socket.IO thêm tính năng (room, namespace, auto fallback), nhưng cần server Socket.IO tương ứng. Nếu backend dùng WebSocket chuẩn, RxJS `webSocket()` là đủ.

**Khi nào dùng SSE thay WebSocket?**  
Khi chỉ cần server gửi dữ liệu (không cần client gửi ngược qua connection này). SSE đơn giản hơn, HTTP chuẩn, tự reconnect. Ví dụ: live feed, price ticker, notification stream.

---

## Senior / Master

- **Background Sync**: Service worker có thể **queue** request khi offline và gửi khi online lại (`BackgroundSyncPlugin` hoặc custom logic). Phù hợp cho form submit, order creation khi mạng không ổn định.
- **Workbox**: Thư viện Google cho service worker, cung cấp caching strategies nâng cao hơn Angular SW: stale-while-revalidate, cache-first với expiration, broadcast update. Có thể dùng thay hoặc bổ sung cho `ngsw`.
- **WebSocket scaling**: Với nhiều user, backend cần **load balancing** WebSocket connections (sticky sessions hoặc Redis pub/sub). Client cần handle reconnect khi server scale.
- **SignalR**: Thư viện Microsoft cho real-time (WebSocket + fallback SSE + long polling). Có package `@microsoft/signalr` cho Angular — phù hợp khi backend dùng .NET.
- **Service Worker precaching + runtime caching**: Precache shell (app bundle), runtime cache API response. Chiến lược tối ưu: precache critical path, lazy cache media/assets, freshness cho API user-specific, performance cho API public/static.

---

→ Xem thêm: [13 - Build & Deploy (SSR)](13-build-deploy.md) | [08 - HTTP Client](08-http-client.md)  
→ Quay lại: [15 - Master Angular](15-master-angular.md)
