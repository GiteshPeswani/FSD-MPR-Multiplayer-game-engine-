import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialState = {
  assets: [],
  currentAsset: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all assets
export const getAllAssets = createAsyncThunk(
  'asset/getAllAssets',
  async (filters, thunkAPI) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(`${API_URL}/assets?${params}`);
      return response.data.data.assets;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get asset by ID
export const getAssetById = createAsyncThunk(
  'asset/getAssetById',
  async (assetId, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/assets/${assetId}`);
      return response.data.data.asset;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create asset
export const createAsset = createAsyncThunk(
  'asset/createAsset',
  async (assetData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(`${API_URL}/assets`, assetData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data.asset;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Purchase asset
export const purchaseAsset = createAsyncThunk(
  'asset/purchaseAsset',
  async (assetId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(`${API_URL}/assets/${assetId}/purchase`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rate asset
export const rateAsset = createAsyncThunk(
  'asset/rateAsset',
  async ({ assetId, rating }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await axios.post(`${API_URL}/assets/${assetId}/rate`, { rating }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { assetId, rating: response.data.data.rating };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all assets
      .addCase(getAllAssets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllAssets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assets = action.payload;
      })
      .addCase(getAllAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get asset by ID
      .addCase(getAssetById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentAsset = action.payload;
      })
      .addCase(getAssetById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create asset
      .addCase(createAsset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assets.unshift(action.payload);
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Purchase asset
      .addCase(purchaseAsset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(purchaseAsset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(purchaseAsset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Rate asset
      .addCase(rateAsset.fulfilled, (state, action) => {
        if (state.currentAsset && state.currentAsset._id === action.payload.assetId) {
          state.currentAsset.rating = action.payload.rating;
        }
      });
  },
});

export const { reset } = assetSlice.actions;
export default assetSlice.reducer;