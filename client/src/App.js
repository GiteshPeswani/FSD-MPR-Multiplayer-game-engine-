import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './store/slices/authSlice';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GameBrowser from './pages/GameBrowser';
import GameEditor from './pages/GameEditor';
import GamePlay from './pages/GamePlay';
import AssetMarketplace from './pages/AssetMarketplace';
import Inventory from './pages/Inventory';
import Profile from './pages/Profile';
import GameRoom from './pages/GameRoom';

// Components
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/routing/PrivateRoute';
import Loader from './components/common/Loader';

function App() {
  const dispatch = useDispatch();
  const { token, isLoading, user } = useSelector((state) => state.auth || {}); // ✅ Safe destructure

  useEffect(() => {
    if (token) dispatch(getMe());
  }, [token, dispatch]);

  if (isLoading) return <Loader />;

  const GameRoomWrapper = () => {
    const { roomId } = useParams();
    const userId = user?._id;
    return <GameRoom gameId={roomId} userId={userId} />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/games" element={<GameBrowser />} />
          <Route path="/marketplace" element={<AssetMarketplace />} />

          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/game/editor/:id?" element={<PrivateRoute><GameEditor /></PrivateRoute>} />
          <Route path="/game/play/:id" element={<PrivateRoute><GamePlay /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/game/room/:roomId" element={<PrivateRoute><GameRoomWrapper /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
