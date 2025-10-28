import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export const useGameSocket = (user, onEvents = {}) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const normalizedUser = {
      id: user.id || user._id || user.userId,
      username: user.username || user.name || user.email?.split("@")[0] || "Guest",
    };

    if (!normalizedUser.id || !normalizedUser.username) {
      console.warn("⚠️ Missing user info for socket connection:", normalizedUser);
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🎮 Connected to socket:", socket.id);
      setConnected(true);

      // Authenticate once connected
      socket.emit("authenticate", {
        userId: normalizedUser.id,
        username: normalizedUser.username,
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected");
      setConnected(false);
    });

    // Register event listeners
    for (const [event, handler] of Object.entries(onEvents)) {
      socket.on(event, handler);
    }

    return () => {
      for (const [event, handler] of Object.entries(onEvents)) {
        socket.off(event, handler);
      }
      socket.disconnect();
    };
  }, [user?.id, user?.username]);

  const emit = (event, data) => {
    if (!socketRef.current) return console.warn("Socket not ready");
    socketRef.current.emit(event, data);
  };

  return { emit, socket: socketRef.current, connected };
};
