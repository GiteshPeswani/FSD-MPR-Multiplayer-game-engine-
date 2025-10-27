import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL

export const useGameSocket = (userId, onEvents = {}) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      autoConnect: false, // do not connect automatically
    });

    socketRef.current = socket;

    // Connect manually
    socket.connect();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnected(true);
      // safe to register user and join game now
      socket.emit('registerUser', { userId });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // register all custom event handlers
    Object.entries(onEvents).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const emit = (event, data) => {
    if (socketRef.current && connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit "${event}", socket not connected`);
    }
  };

  return { emit, socket: socketRef.current, connected };
};
