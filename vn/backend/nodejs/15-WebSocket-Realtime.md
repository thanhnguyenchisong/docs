# WebSocket & Real-time

## Mục lục
1. [WebSocket là gì?](#websocket-là-gì)
2. [Native WebSocket (ws)](#ws)
3. [Socket.io](#socketio)
4. [Chat App Example](#chat-example)
5. [Scaling WebSocket](#scaling)
6. [Câu hỏi phỏng vấn](#câu-hỏi-phỏng-vấn)

---

## WebSocket là gì?

**WebSocket** = giao thức **full-duplex** trên 1 TCP connection. Khác HTTP:

```
HTTP:      Client → Request → Server → Response → đóng
WebSocket: Client ←→ Server (2 chiều, liên tục, real-time)
```

| | HTTP | WebSocket |
|---|------|-----------|
| Protocol | Request-Response | Full-duplex |
| Connection | Mới mỗi request | Persistent |
| Direction | Client → Server | Cả 2 chiều |
| Overhead | Header mỗi request | 2 bytes frame |
| Use case | REST API, web pages | Chat, live data, gaming |

---

## ws

Package `ws` = native WebSocket, nhẹ, nhanh.

```bash
npm install ws
```

### Server

```javascript
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  console.log(`Client connected from ${req.socket.remoteAddress}`);

  ws.on('message', (data) => {
    const msg = data.toString();
    console.log('Received:', msg);

    // Broadcast to all clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'message', data: msg }));
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
  ws.on('error', console.error);

  ws.send(JSON.stringify({ type: 'welcome', data: 'Connected!' }));
});

console.log('WebSocket server on ws://localhost:8080');
```

### Client (browser)

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server!');
};
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));
ws.onclose = () => console.log('Disconnected');
ws.onerror = (err) => console.error('Error:', err);
```

---

## Socket.io

Thư viện real-time phổ biến nhất, thêm nhiều tính năng trên WebSocket.

```bash
npm install socket.io          # server
npm install socket.io-client   # client
```

### Tính năng Socket.io

- **Auto-reconnection** (tự kết nối lại).
- **Rooms** (nhóm clients).
- **Namespaces** (chia kênh).
- **Acknowledgments** (callback xác nhận).
- **Fallback** (long-polling nếu WS không hỗ trợ).
- **Broadcasting** (gửi cho tất cả trừ sender).

### Server

```javascript
const { Server } = require('socket.io');
const http = require('http');
const express = require('express');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen events
  socket.on('chat:message', (data) => {
    io.to(data.room).emit('chat:message', {
      user: socket.id,
      text: data.text,
      time: new Date().toISOString(),
    });
  });

  // Rooms
  socket.on('room:join', (room) => {
    socket.join(room);
    socket.to(room).emit('room:userJoined', socket.id);
  });

  socket.on('room:leave', (room) => {
    socket.leave(room);
    socket.to(room).emit('room:userLeft', socket.id);
  });

  // Acknowledgment
  socket.on('ping', (callback) => {
    callback({ status: 'ok', time: Date.now() });
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
  });
});

server.listen(3000, () => console.log('http://localhost:3000'));
```

### Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('room:join', 'general');
  socket.emit('chat:message', { room: 'general', text: 'Hello!' });
});

socket.on('chat:message', (data) => console.log(data));

// Acknowledgment
socket.emit('ping', (response) => console.log(response));
```

---

## Chat Example

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = new Map(); // socketId → { username, room }

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }) => {
    socket.join(room);
    users.set(socket.id, { username, room });

    // Notify room
    socket.to(room).emit('system', `${username} joined`);

    // Send user list
    const roomUsers = [...users.values()].filter(u => u.room === room).map(u => u.username);
    io.to(room).emit('users', roomUsers);
  });

  socket.on('message', (text) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.room).emit('message', {
        username: user.username,
        text,
        time: new Date().toLocaleTimeString(),
      });
    }
  });

  socket.on('typing', () => {
    const user = users.get(socket.id);
    if (user) socket.to(user.room).emit('typing', user.username);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.to(user.room).emit('system', `${user.username} left`);
      const roomUsers = [...users.values()].filter(u => u.room === user.room).map(u => u.username);
      io.to(user.room).emit('users', roomUsers);
    }
  });
});

server.listen(3000, () => console.log('Chat server: http://localhost:3000'));
```

---

## Scaling

### Vấn đề

Khi chạy nhiều instances (cluster, containers), mỗi instance có Socket.io riêng → clients ở instance khác không nhận message.

### Giải pháp: Redis Adapter

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
// → Messages sync qua Redis → tất cả instances nhận
```

---

## Câu hỏi phỏng vấn

**Q: WebSocket vs HTTP?**

> HTTP: request-response, stateless, overhead header mỗi request. WebSocket: full-duplex, persistent, real-time, overhead thấp (2 bytes frame). Dùng WS cho chat, live notifications, gaming.

**Q: Socket.io vs ws?**

> `ws`: native WebSocket, nhẹ (100KB), nhanh, không có rooms/auto-reconnect. Socket.io: rooms, namespaces, auto-reconnect, fallback, broadcast — phổ biến hơn cho production.

**Q: Cách scale WebSocket?**

> Dùng Redis Adapter (Socket.io) hoặc Redis Pub/Sub (ws) để sync messages giữa nhiều instances. Sticky sessions hoặc Redis để share state.

---

**Tiếp theo**: [16 - GraphQL](./16-GraphQL.md)
