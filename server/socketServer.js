// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins for testing
    methods: ['GET', 'POST'],
  },
});

const rooms = {}; // store players per room

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('registerUser', ({ userId }) => {
    socket.userId = userId;
    console.log(`Registered user: ${userId}`);
  });

  socket.on('joinGame', ({ gameId, userId }) => {
    socket.join(gameId);
    if (!rooms[gameId]) rooms[gameId] = [];
    rooms[gameId].push(userId);
    io.to(gameId).emit('playerJoined', { players: rooms[gameId] });
    console.log(`${userId} joined game ${gameId}`);
  });

  socket.on('leaveGame', ({ gameId, userId }) => {
    socket.leave(gameId);
    if (rooms[gameId]) {
      rooms[gameId] = rooms[gameId].filter((p) => p !== userId);
      io.to(gameId).emit('playerLeft', { players: rooms[gameId] });
    }
    console.log(`${userId} left game ${gameId}`);
  });

  socket.on('playerAction', ({ gameId, userId, action }) => {
    // Broadcast action to other players
    io.to(gameId).emit('gameStateUpdate', { [userId]: action });
    console.log(`${userId} did action in game ${gameId}:`, action);
  });

  socket.on('sendMessage', ({ gameId, userId, message }) => {
    io.to(gameId).emit('receiveMessage', { userId, message });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId || socket.id);
    // Optional: remove from rooms
  });
});

server.listen(5001, () => console.log('WebSocket server running on port 5001'));
