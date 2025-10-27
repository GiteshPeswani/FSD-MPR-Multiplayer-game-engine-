import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;


// Initial state
const initialState = {
  games: [],
  currentGame: null,
  myGames: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// -------------------- Thunks -------------------- //

// Get all games
export const getAllGames = createAsyncThunk(
  'game/getAllGames',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/games`);
      return response.data.games;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get game by ID
export const getGameById = createAsyncThunk(
  'game/getGameById',
  async (gameId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/games/${gameId}`);
      return response.data.game;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create game (protected)
export const createGame = createAsyncThunk(
  'game/createGame',
  async (gameData, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const token = auth.token; // ✅ fetch token correctly
      const response = await axios.post(`${API_URL}/games`, gameData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.game;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update game (protected)
export const updateGame = createAsyncThunk(
  'game/updateGame',
  async ({ gameId, gameData }, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const token = auth.token; // ✅ fetch token correctly
      const response = await axios.put(`${API_URL}/games/${gameId}`, gameData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.game;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete game (protected)
export const deleteGame = createAsyncThunk(
  'game/deleteGame',
  async (gameId, thunkAPI) => {
    try {
      const { auth } = thunkAPI.getState();
      const token = auth.token; // ✅ fetch token correctly
      await axios.delete(`${API_URL}/games/${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return gameId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// -------------------- Slice -------------------- //

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCurrentGame: (state, action) => {
      state.currentGame = action.payload;
    },
    clearCurrentGame: (state) => {
      state.currentGame = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all games
      .addCase(getAllGames.pending, (state) => { state.isLoading = true; })
      .addCase(getAllGames.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.games = action.payload;
      })
      .addCase(getAllGames.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get game by ID
      .addCase(getGameById.pending, (state) => { state.isLoading = true; })
      .addCase(getGameById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentGame = action.payload;
      })
      .addCase(getGameById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create game
      .addCase(createGame.pending, (state) => { state.isLoading = true; })
      .addCase(createGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.games.unshift(action.payload);
      })
      .addCase(createGame.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update game
      .addCase(updateGame.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.currentGame = action.payload;
        const index = state.games.findIndex(g => g._id === action.payload._id);
        if (index !== -1) state.games[index] = action.payload;
      })
      // Delete game
      .addCase(deleteGame.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.games = state.games.filter(g => g._id !== action.payload);
        if (state.currentGame?._id === action.payload) state.currentGame = null;
      });
  },
});

export const { reset, setCurrentGame, clearCurrentGame } = gameSlice.actions;
export default gameSlice.reducer;
