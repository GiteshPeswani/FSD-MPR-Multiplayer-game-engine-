// src/hooks/useSocket.js
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket, setConnected } from "../store/slices/socketSlice";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";

export const useSocket = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { instance } = useSelector((state) => state.socket);

  useEffect(() => {
    if (!user || !user.id || !user.username) {
      console.log("⏳ Waiting for user before connecting socket...");
      return;
    }

    if (instance) {
      console.log("⚠️ Socket already connected, skipping...");
      return;
    }

    console.log("🚀 Connecting socket for user:", user.username);

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      dispatch(setConnected(true));

      // Authenticate user
      socket.emit("authenticate", {
        userId: user.id,
        username: user.username,
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      dispatch(setConnected(false));
    });

    socket.on("connect_error", (err) => {
      console.error("🚨 Socket connection error:", err.message);
    });

    socket.on("authenticated", (data) => {
      console.log("🟢 Authenticated user:", data.username);
    });

    dispatch(setSocket(socket));

    return () => {
      console.log("🧹 Cleaning up socket...");
      socket.disconnect();
      dispatch(setSocket(null));
    };
  }, [user?.id, user?.username]);

  return instance;
};
