import React, { useEffect, useState, useRef } from "react";
import { useGameSocket } from "../hooks/useGameSocket";

const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F1C40F", "#9B59B6"];

const GameRoom = ({ gameId, user }) => {
  const canvasRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState({});
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  // socket API from hook (support multiple shapes)
  const socketApi = useGameSocket(user) || {};
  const { socket, emit, connected, on, off } = socketApi;
  const safeEmit = (...args) => {
    if (typeof emit === "function") emit(...args);
  };

  const getName = (p) => {
    if (!p) return "You";
    if (typeof p === "string") return p;
    if (typeof p.username === "string") return p.username;
    if (p.username && typeof p.username === "object") return p.username.username || String(p.username);
    if (p.name) return p.name;
    return "You";
  };

  const normalizePlayers = (arr = []) => arr.map((p) => ({ username: getName(p) }));

  // Create session when connected
  useEffect(() => {
    if (connected && user?.id && gameId && !sessionId) {
      safeEmit("createGameSession", {
        gameId,
        userId: user.id,
        username: getName(user),
      });
      setSessionId((s) => s || "local-temp");
      setPlayers((p) => {
        const exists = p.some((x) => getName(x) === getName(user));
        return exists ? p : [...p, { username: getName(user) }];
      });
    }
  }, [connected, sessionId, user?.id, gameId]);

  // Register socket listeners (support socket.on or custom on/off API)
  useEffect(() => {
    const add = (ev, h) => {
      if (socket && typeof socket.on === "function") socket.on(ev, h);
      else if (typeof on === "function") on(ev, h);
    };
    const remove = (ev, h) => {
      if (socket && typeof socket.off === "function") socket.off(ev, h);
      else if (socket && typeof socket.removeListener === "function") socket.removeListener(ev, h);
      else if (typeof off === "function") off(ev, h);
    };

    const onSessionCreated = (payload) => {
      const session = payload && (payload.session || payload);
      if (!session) return;
      setSessionId(session.id || sessionId || "server-session");
      setPlayers(normalizePlayers(session.players || []));
      if (session.state) setPositions((prev) => ({ ...prev, ...session.state }));
    };

    const onPlayerJoined = (payload) => {
      const session = payload && (payload.session || payload);
      if (session && session.players) {
        setPlayers(normalizePlayers(session.players));
      } else if (payload && payload.player) {
        setPlayers((prev) => {
          const username = getName(payload.player);
          if (prev.some((p) => getName(p) === username)) return prev;
          return [...prev, { username }];
        });
      }
    };

    const onPlayerLeft = (payload) => {
      const session = payload && (payload.session || payload);
      if (session && session.players) {
        setPlayers(normalizePlayers(session.players));
      } else if (payload && payload.player) {
        const username = getName(payload.player);
        setPlayers((prev) => prev.filter((p) => getName(p) !== username));
      }
    };

    const onGameStateUpdate = (payload) => {
      // payload may be { username, state } or { state } or { userId, state }
      const state = payload && (payload.state || payload);
      if (!state) return;
      // If server sends { username, state: {x,y} } apply accordingly
      if (payload.username && payload.state) {
        setPositions((prev) => ({ ...prev, [payload.username]: payload.state }));
        return;
      }
      // If server sends a map of states
      setPositions((prev) => ({ ...prev, ...state }));
    };

    const onChatMessage = (msg) => {
      // msg shape: { userId, username, message, ts }
      setChat((prev) => [...prev, msg]);
    };

    add("sessionCreated", onSessionCreated);
    add("playerJoined", onPlayerJoined);
    add("playerLeft", onPlayerLeft);
    add("gameStateUpdate", onGameStateUpdate);
    add("gameStateSync", onGameStateUpdate);
    add("chatMessage", onChatMessage);

    return () => {
      remove("sessionCreated", onSessionCreated);
      remove("playerJoined", onPlayerJoined);
      remove("playerLeft", onPlayerLeft);
      remove("gameStateUpdate", onGameStateUpdate);
      remove("gameStateSync", onGameStateUpdate);
      remove("chatMessage", onChatMessage);
    };
  }, [socket, on, off, connected]);

  // Move ball (click or random) - updates local pos and emits to server
  const moveBall = (e = null, random = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const radius = 25;
    let x, y;

    if (!random && e && e.clientX != null) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      x = Math.random() * (rect.width - radius * 2) + radius;
      y = Math.random() * (rect.height - radius * 2) + radius;
    }

    const username = getName(user);
    const update = { [username]: { x, y } };

    // local update
    setPositions((prev) => ({ ...prev, ...update }));

    // emit to server
    if (sessionId && user?.id) {
      safeEmit("gameStateUpdate", {
        sessionId,
        userId: user.id,
        username,
        state: update[username],
      });
    }
  };

  // Send chat
  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = {
      sessionId: sessionId || "local-temp",
      userId: user?.id || "local",
      username: getName(user),
      message: message.trim(),
      type: "chat",
      ts: Date.now(),
    };

    setChat((prev) => [...prev, msg]);
    setMessage("");

    if (sessionId && user?.id) {
      safeEmit("chatMessage", msg);
    }
  };

  // Drawing canvas (DPR aware)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || canvas.width / dpr;
    const height = rect.height || canvas.height / dpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const drawList = players && players.length ? players : [{ username: getName(user) }];

    drawList.forEach((p, i) => {
      const name = getName(p);
      const pos = positions[name] || { x: width / 2, y: height / 2 };

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffffaa";
      ctx.stroke();
      ctx.closePath();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(name || "You", pos.x, pos.y - 35);
    });
  }, [players, positions, user]);

  return (
    <div className="pt-24 p-4 flex flex-col md:flex-row gap-6 min-h-screen bg-gradient-to-br from-purple-800 via-pink-800 to-red-700">
      {/* Game Area */}
      <div className="flex-1 bg-slate-900 rounded-lg p-4 flex flex-col items-center shadow-lg">
        <h2 className="text-white text-2xl font-bold mb-3">Game Area</h2>
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onClick={(e) => moveBall(e, false)}
          className="cursor-pointer border-4 border-purple-500 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-md"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => moveBall(e, true)}
            className="px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full font-semibold shadow-lg transition-all duration-200"
          >
            Move Ball (random)
          </button>
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (!canvas) return;
              const rect = canvas.getBoundingClientRect();
              const centerEvent = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
              moveBall(centerEvent, false);
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold shadow transition"
          >
            Center Ball
          </button>
        </div>
      </div>

      {/* Chat + Player List */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        {/* Players */}
        <div className="bg-purple-900 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-xl font-semibold">Players</h2>
            <div className="text-sm text-slate-200 font-medium">{players.length}</div>
          </div>
          {players.length === 0 ? (
            <p className="text-purple-200">No players yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {players.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-700 px-3 py-1 rounded-full shadow-md"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-white text-sm font-semibold">{getName(p)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="bg-purple-900 rounded-lg p-4 flex flex-col shadow-lg">
          <h2 className="text-white text-xl font-semibold mb-2">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 bg-purple-800 rounded-lg max-h-48">
            {chat.length === 0 ? (
              <p className="text-purple-200">No messages yet</p>
            ) : (
              chat.map((c, i) => {
                const isMe = c.userId === user?.id || c.username === getName(user);
                return (
                  <div
                    key={i}
                    className={`max-w-full ${isMe ? "ml-auto bg-green-600/80 text-white" : "bg-purple-700/70 text-white"} px-3 py-2 rounded-lg`}
                  >
                    <div className="text-xs font-bold mb-1">{isMe ? "You" : c.username}</div>
                    <div className="text-sm">{c.message}</div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 rounded bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;