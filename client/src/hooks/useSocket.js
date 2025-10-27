import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import {
  setSocket,
  setConnected,
  setCurrentSession,
  setPlayers,
  addPlayer,
  removePlayer,
  updateGameState,
  addMessage,
} from '../store/slices/socketSlice';

const SOCKET_URL = process.env.REACT_APP_API_URL;


export const useSocket = () => {
  const dispatch = useDispatch();
  const { instance, connected, currentSession } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.auth);

  // Initialize socket connection
  useEffect(() => {
    if (!instance && user) {
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        dispatch(setConnected(true));
        
        // Authenticate user
        socket.emit('authenticate', {
          userId: user.id,
          username: user.username,
        });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch(setConnected(false));
      });

      socket.on('authenticated', (data) => {
        console.log('Socket authenticated:', data);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      dispatch(setSocket(socket));

      return () => {
        socket.disconnect();
      };
    }
  }, [instance, user, dispatch]);

  // Create game session
  const createGameSession = useCallback(
    (gameId) => {
      if (!instance || !user) return;

      instance.emit('createGameSession', {
        gameId,
        userId: user.id,
      });

      instance.once('sessionCreated', (data) => {
        if (data.success) {
          dispatch(setCurrentSession(data.session));
          dispatch(setPlayers(data.session.players));
        }
      });
    },
    [instance, user, dispatch]
  );

  // Join game session
  const joinGameSession = useCallback(
    (sessionId) => {
      if (!instance || !user) return;

      instance.emit('joinGameSession', {
        sessionId,
        userId: user.id,
        username: user.username,
      });
    },
    [instance, user]
  );

  // Player ready
  const setPlayerReady = useCallback(
    (sessionId) => {
      if (!instance || !user) return;

      instance.emit('playerReady', {
        sessionId,
        userId: user.id,
      });
    },
    [instance, user]
  );

  // Update game state
  const updateGameStateSocket = useCallback(
    (sessionId, state) => {
      if (!instance || !user) return;

      instance.emit('gameStateUpdate', {
        sessionId,
        userId: user.id,
        state,
      });
    },
    [instance, user]
  );

  // Send chat message
  const sendChatMessage = useCallback(
    (sessionId, message, type = 'chat') => {
      if (!instance || !user) return;

      instance.emit('chatMessage', {
        sessionId,
        userId: user.id,
        username: user.username,
        message,
        type,
      });
    },
    [instance, user]
  );

  // Spectate session
  const spectateSession = useCallback(
    (sessionId) => {
      if (!instance || !user) return;

      instance.emit('spectateSession', {
        sessionId,
        userId: user.id,
        username: user.username,
      });
    },
    [instance, user]
  );

  // Leave session
  const leaveSession = useCallback(
    (sessionId) => {
      if (!instance || !user) return;

      instance.emit('leaveSession', {
        sessionId,
        userId: user.id,
      });
    },
    [instance, user]
  );

  // Setup event listeners
  useEffect(() => {
    if (!instance) return;

    const handlePlayerJoined = (data) => {
      dispatch(addPlayer(data.player));
      dispatch(setCurrentSession(data.session));
    };

    const handlePlayerLeft = (data) => {
      dispatch(removePlayer(data.userId));
      dispatch(setCurrentSession(data.session));
    };

    const handlePlayerReadyUpdate = (data) => {
      dispatch(setCurrentSession(data.session));
    };

    const handleGameStart = (data) => {
      dispatch(setCurrentSession(data.session));
    };

    const handleGameStateSync = (data) => {
      dispatch(updateGameState(data.state));
    };

    const handleChatMessage = (data) => {
      dispatch(addMessage(data));
    };

    const handleSpectatorJoined = (data) => {
      if (data.session) {
        dispatch(setCurrentSession(data.session));
      }
    };

    instance.on('playerJoined', handlePlayerJoined);
    instance.on('playerLeft', handlePlayerLeft);
    instance.on('playerReadyUpdate', handlePlayerReadyUpdate);
    instance.on('gameStart', handleGameStart);
    instance.on('gameStateSync', handleGameStateSync);
    instance.on('chatMessage', handleChatMessage);
    instance.on('spectatorJoined', handleSpectatorJoined);

    return () => {
      instance.off('playerJoined', handlePlayerJoined);
      instance.off('playerLeft', handlePlayerLeft);
      instance.off('playerReadyUpdate', handlePlayerReadyUpdate);
      instance.off('gameStart', handleGameStart);
      instance.off('gameStateSync', handleGameStateSync);
      instance.off('chatMessage', handleChatMessage);
      instance.off('spectatorJoined', handleSpectatorJoined);
    };
  }, [instance, dispatch]);

  return {
    socket: instance,
    connected,
    currentSession,
    createGameSession,
    joinGameSession,
    setPlayerReady,
    updateGameState: updateGameStateSocket,
    sendChatMessage,
    spectateSession,
    leaveSession,
  };
};