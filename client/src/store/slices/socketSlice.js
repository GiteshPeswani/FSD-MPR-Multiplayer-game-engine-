import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  instance: null,
  connected: false,
  currentSession: null,
  players: [],
  gameState: {},
  messages: [],
  spectatorMode: false,
};

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.instance = action.payload;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
    addPlayer: (state, action) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action) => {
      state.players = state.players.filter(p => p.userId !== action.payload);
    },
    updateGameState: (state, action) => {
      state.gameState = { ...state.gameState, ...action.payload };
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setSpectatorMode: (state, action) => {
      state.spectatorMode = action.payload;
    },
    resetSocket: (state) => {
      state.currentSession = null;
      state.players = [];
      state.gameState = {};
      state.messages = [];
      state.spectatorMode = false;
    },
  },
});

export const {
  setSocket,
  setConnected,
  setCurrentSession,
  setPlayers,
  addPlayer,
  removePlayer,
  updateGameState,
  addMessage,
  clearMessages,
  setSpectatorMode,
  resetSocket,
} = socketSlice.actions;

export default socketSlice.reducer;