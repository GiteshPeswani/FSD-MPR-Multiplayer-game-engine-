// ✅ server/utils/websocket.js
const initWebSocket = (io) => {
  const sessions = {}; // in-memory store for game sessions

  io.on("connection", (socket) => {
    const { userId, username } = socket.handshake.auth || {};

    if (!userId || !username) {
      console.log("⚠️ Unauthenticated socket tried to connect:", socket.id);
      socket.disconnect(true);
      return;
    }

    socket.userId = userId;
    socket.username = username;

    console.log(`✅ ${username} connected (${socket.id})`);

    // 🧠 Create a new game session
    socket.on("createGameSession", ({ gameId }) => {
      const sessionId = `session-${Date.now()}`;
      sessions[sessionId] = {
        id: sessionId,
        gameId,
        players: [{ userId, username }],
      };

      socket.join(sessionId);
      socket.emit("sessionCreated", { success: true, session: sessions[sessionId] });

      console.log(`🎮 ${username} created session ${sessionId}`);
    });

    // 👥 Join existing session
    socket.on("joinGameSession", ({ sessionId, userId, username }) => {
      const session = sessions[sessionId];
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      const alreadyIn = session.players.some((p) => p.userId === userId);
      if (!alreadyIn) session.players.push({ userId, username });

      socket.join(sessionId);
      io.to(sessionId).emit("playerJoined", { session, player: { userId, username } });

      console.log(`👤 ${username} joined session ${sessionId}`);
    });

    // 🎾 Handle ball movement
    socket.on("gameStateUpdate", ({ sessionId, userId, username, state }) => {
      if (!sessions[sessionId]) return;
      io.to(sessionId).emit("gameStateSync", { state });
      console.log(`🌀 ${username} moved ball in ${sessionId}`);
    });

    // 💬 Handle chat messages
    socket.on("chatMessage", ({ sessionId, userId, username, message }) => {
      if (!sessions[sessionId]) return;
      const msg = { userId, username, message };
      io.to(sessionId).emit("chatMessage", msg);
      console.log(`💬 [${sessionId}] ${username}: ${message}`);
    });

    // ❌ Handle player leaving
    socket.on("leaveSession", ({ sessionId, userId }) => {
      const session = sessions[sessionId];
      if (!session) return;

      socket.leave(sessionId);
      session.players = session.players.filter((p) => p.userId !== userId);

      io.to(sessionId).emit("playerLeft", { session, userId });
      console.log(`🚪 ${username} left ${sessionId}`);
    });

    // 🔴 Disconnect cleanup
    socket.on("disconnect", () => {
      console.log(`🔴 ${username} (${socket.id}) disconnected`);

      // remove player from all sessions
      Object.values(sessions).forEach((session) => {
        const wasInSession = session.players.some((p) => p.userId === userId);
        if (wasInSession) {
          session.players = session.players.filter((p) => p.userId !== userId);
          io.to(session.id).emit("playerLeft", { session, userId });
          console.log(`🧹 Cleaned ${username} from ${session.id}`);
        }
      });
    });
  });
};

module.exports = initWebSocket;
