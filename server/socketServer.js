const initWebSocket = (io) => {
  const sessions = {};

  io.on("connection", (socket) => {
    const { userId, username } = socket.handshake.auth || {};
    if (userId && username) {
      socket.userId = userId;
      socket.username = username;
      console.log(`✅ ${username} connected (${socket.id})`);
    } else {
      console.warn("⚠️ Missing auth info in handshake");
    }

    // 🧩 Create Game Session
    socket.on("createGameSession", ({ gameId, userId, username }) => {
      const sessionId = `session-${Date.now()}`;
      sessions[sessionId] = {
        id: sessionId,
        gameId,
        players: [{ userId, username }],
        state: {},
      };

      socket.join(sessionId);
      socket.emit("sessionCreated", { success: true, session: sessions[sessionId] });

      console.log(`🎮 Session created by ${username}: ${sessionId}`);
    });

    // 👥 Join existing session
    socket.on("joinGameSession", ({ sessionId, userId, username }) => {
      const session = sessions[sessionId];
      if (!session) return;

      const alreadyJoined = session.players.some((p) => p.userId === userId);
      if (!alreadyJoined) session.players.push({ userId, username });

      socket.join(sessionId);
      io.to(sessionId).emit("playerJoined", { session, player: { userId, username } });

      console.log(`👥 ${username} joined ${sessionId}`);
    });

    // 🏓 Player updates game state (ball movement etc.)
    socket.on("gameStateUpdate", ({ sessionId, userId, username, state }) => {
      const session = sessions[sessionId];
      if (!session) return;

      // merge new state (per player)
      session.state = { ...session.state, ...state };

      // broadcast to everyone
      io.to(sessionId).emit("gameStateSync", { state: session.state });
    });

    // 💬 Chat
    socket.on("chatMessage", ({ sessionId, userId, username, message, type }) => {
      io.to(sessionId).emit("chatMessage", { userId, username, message, type });
    });

    // ❌ Leave session
    socket.on("leaveSession", ({ sessionId, userId }) => {
      socket.leave(sessionId);
      const session = sessions[sessionId];
      if (session) {
        session.players = session.players.filter((p) => p.userId !== userId);
        io.to(sessionId).emit("playerLeft", { userId, session });
      }
      console.log(`❌ ${userId} left ${sessionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Disconnected: ${socket.id}`);
    });
  });
};

module.exports = initWebSocket;
