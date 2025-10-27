// utils/websocket.js

module.exports = function initWebSocket(io) {
  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    // Join a specific room (useful for multiplayer games)
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
      io.to(roomId).emit('message', `User ${socket.id} joined the room`);
    });

    // Handle game moves
    socket.on('gameMove', (data) => {
      // Broadcast move to all clients in the same room except sender
      socket.to(data.roomId).emit('gameMove', data);
    });

    // Optional: chat messages broadcast
    socket.on('chatMessage', (msg) => {
      io.emit('chatMessage', msg);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });
};
