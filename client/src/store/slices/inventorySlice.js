import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialState = {
  inventory: [],
  stats: null,
  isLoading: false,
  isError: false,
  message: '',
};

// ------------------------------------------------------------------------
// 1️⃣ Get user inventory
// ------------------------------------------------------------------------
export const getUserInventory = createAsyncThunk(
  'inventory/getUserInventory',
  async (filters, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/inventory?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // returning array of inventory items
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------------------------
// 2️⃣ Get inventory stats
// ------------------------------------------------------------------------
export const getInventoryStats = createAsyncThunk(
  'inventory/getInventoryStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.get(`${API_URL}/inventory/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // returning stats object
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------------------------
// 3️⃣ Purchase an asset
// ------------------------------------------------------------------------
export const purchaseAsset = createAsyncThunk(
  'inventory/purchaseAsset',
  async ({ assetId, quantity = 1 }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(
        `${API_URL}/inventory/purchase`,
        { assetId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.inventoryItem; // backend returns the created inventory item
    } catch (error) {
      const message =
        (error.response?.data?.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// ------------------------------------------------------------------------
// Slice
// ------------------------------------------------------------------------
export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // getUserInventory
      .addCase(getUserInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = action.payload;
      })
      .addCase(getUserInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // getInventoryStats
      .addCase(getInventoryStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // purchaseAsset
      .addCase(purchaseAsset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(purchaseAsset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.inventory = [action.payload, ...state.inventory]; // prepend newly purchased asset
      })
      .addCase(purchaseAsset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = inventorySlice.actions;
export default inventorySlice.reducer;
