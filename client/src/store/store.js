import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import assetReducer from './slices/assetSlice';
import inventoryReducer from './slices/inventorySlice';
import socketReducer from './slices/socketSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    asset: assetReducer,
    inventory: inventoryReducer,
    socket: socketReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['socket/setSocket'],
        ignoredPaths: ['socket.instance'],
      },
    }),
});

export default store; // ✅ Default export (fix)
