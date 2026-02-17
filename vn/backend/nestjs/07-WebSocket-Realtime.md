# WebSocket & Real-time

## Mục lục
1. [WebSocket là gì?](#websocket-là-gì)
2. [NestJS Gateway (Socket.io)](#gateway)
3. [Rooms & Broadcasting](#rooms)
4. [Authentication](#authentication)
5. [Ví dụ Chat App](#chat-app)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## WebSocket là gì?

**WebSocket** = giao thức full-duplex, persistent connection giữa client và server. Khác HTTP (request-response, stateless).

```
HTTP:      Client → Request → Server → Response → Done
WebSocket: Client ↔ Server (2 chiều, liên tục)
```

Use cases: chat, notifications, live dashboard, gaming, collaborative editing.

---

## Gateway

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install -D @types/socket.io
```

```typescript
import { WebSocketGateway, SubscribeMessage, MessageBody,
  WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast to room
    this.server.to(data.room).emit('message', {
      sender: client.id,
      text: data.text,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    this.server.to(room).emit('userJoined', { userId: client.id, room });
  }
}
```

---

## Rooms

```typescript
// Join room
client.join('room-1');

// Leave room
client.leave('room-1');

// Emit to room (trừ sender)
client.to('room-1').emit('event', data);

// Emit to room (kể cả sender)
this.server.to('room-1').emit('event', data);

// Emit to all (broadcast)
this.server.emit('event', data);

// Emit to specific client
this.server.to(clientId).emit('event', data);
```

---

## Authentication

```typescript
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
        || client.handshake.headers.authorization?.split(' ')[1];
      const user = this.jwtService.verify(token);
      client.data.user = user;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const user = client.data.user; // authenticated user
    // ...
  }
}
```

### Client (browser)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/chat', {
  auth: { token: 'eyJhb...' },
});

socket.on('connect', () => console.log('Connected'));
socket.emit('joinRoom', 'general');
socket.emit('message', { room: 'general', text: 'Hello!' });
socket.on('message', (data) => console.log('Received:', data));
```

---

## Chat App

```typescript
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users = new Map<string, string>(); // socketId → username

  handleConnection(client: Socket) {
    const username = client.handshake.query.username as string;
    this.users.set(client.id, username);
    this.server.emit('users', Array.from(this.users.values()));
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.server.emit('users', Array.from(this.users.values()));
  }

  @SubscribeMessage('chat')
  handleChat(@ConnectedSocket() client: Socket, @MessageBody() text: string) {
    this.server.emit('chat', {
      user: this.users.get(client.id),
      text,
      time: new Date().toISOString(),
    });
  }
}
```

---

## Câu hỏi phỏng vấn

**Q: WebSocket vs HTTP?**

> HTTP: request-response, stateless, client khởi tạo. WebSocket: full-duplex, persistent, server có thể push data. Dùng WS cho real-time (chat, notifications, live data).

**Q: Socket.io vs raw WebSocket?**

> Socket.io: auto-reconnect, rooms, namespaces, fallback (long-polling), broadcasting. Raw WS: nhẹ hơn, chuẩn W3C, không có rooms/auto-reconnect. Socket.io phổ biến hơn trong NestJS.

---

**Tiếp theo**: [08 - Testing](./08-Testing.md)
