import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// -------------------- Helpers -------------------- //
const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

const getLocalToken = () => localStorage.getItem('token') || null;

// -------------------- Initial State -------------------- //
const initialState = {
  user: getLocalUser(),
  token: getLocalToken(),
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// -------------------- Thunks -------------------- //

// ✅ Register user
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    if (res.data.user && res.data.token) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Login user
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_URL}/auth/login`, userData);
    if (res.data.user && res.data.token) {
      localStorage.setItem('user', JSON.stringify(res.data.user));
      localStorage.setItem('token', res.data.token);
    }
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  return true;
});

// ✅ Get current user
export const getMe = createAsyncThunk('auth/getMe', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    if (!token) throw new Error('No token found');
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ✅ Update profile
export const updateProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    if (!token) throw new Error('No token found');
    const res = await axios.put(`${API_URL}/auth/profile`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

// -------------------- Slice -------------------- //

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    updateUserCoins: (state, action) => {
      if (state.user) {
        state.user.coins = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- Register ----------------
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })

      // ---------------- Login ----------------
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })

      // ---------------- Logout ----------------
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })

      // ---------------- Get Me ----------------
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // ---------------- Update Profile ----------------
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

// -------------------- Exports -------------------- //
export const { reset, updateUserCoins } = authSlice.actions;
export default authSlice.reducer;
