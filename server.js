const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    
    socket.to(roomId).emit('user-connected', userId);
    
    const participants = Array.from(rooms.get(roomId));
    socket.emit('participants', participants.filter(id => id !== userId));
    
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', {
      sdp: payload.sdp,
      caller: socket.id
    });
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', {
      sdp: payload.sdp,
      caller: socket.id
    });
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', {
      candidate: payload.candidate,
      caller: socket.id
    });
  });

  socket.on('toggle-video', (roomId, userId, enabled) => {
    socket.to(roomId).emit('user-toggle-video', userId, enabled);
  });

  socket.on('toggle-audio', (roomId, userId, enabled) => {
    socket.to(roomId).emit('user-toggle-audio', userId, enabled);
  });

  socket.on('screen-share', (roomId, userId, isSharing) => {
    socket.to(roomId).emit('user-screen-share', userId, isSharing);
  });

  socket.on('send-message', (roomId, message) => {
    socket.to(roomId).emit('receive-message', {
      ...message,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        if (participants.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`Signaling server running on http://${HOST}:${PORT}`);
  console.log(`For network access, use your machine's IP address`);
});
