import React, { useEffect, useState, useRef } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';

const COLORS = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#9B59B6'];

const GameRoom = ({ gameId, userId }) => {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState([]);
  const [positions, setPositions] = useState({});
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');

  const { emit, connected } = useGameSocket(userId, {
    playerJoined: (data) => {
      setPlayers(data?.players || []);
      data?.players?.forEach((p, i) => {
        setPositions((prev) => ({
          ...prev,
          [p]: prev[p] || { x: 50 + i * 60, y: 50 },
        }));
      });
    },
    playerLeft: (data) => setPlayers(data?.players || []),
    gameStateUpdate: (state) => setPositions((prev) => ({ ...prev, ...state })),
    receiveMessage: (msg) => setChat((prev) => [...prev, msg]),
  });

  const joinGame = () => emit('joinGame', { gameId, userId });
  const leaveGame = () => emit('leaveGame', { gameId, userId });

  const moveBall = () => {
    const newPos = {
      x: Math.random() * 450 + 25,
      y: Math.random() * 450 + 25,
    };
    setPositions((prev) => ({ ...prev, [userId]: newPos }));
    emit('playerAction', { gameId, userId, action: newPos });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    emit('sendMessage', { gameId, userId, message });
    setMessage('');
  };

  useEffect(() => {
    if (!gameId || !userId || !connected) return;
    joinGame();
    setPositions((prev) => ({ ...prev, [userId]: { x: 100, y: 100 } }));
    return () => leaveGame();
  }, [gameId, userId, connected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    players.forEach((p, i) => {
      const pos = positions[p];
      if (!pos) return;

      // Draw player circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // Draw player name
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(p, pos.x, pos.y - 35);
    });
  }, [players, positions]);

  return (
    <div className="pt-24 p-4 flex flex-col md:flex-row gap-6 min-h-screen bg-gradient-to-br from-purple-800 via-pink-800 to-red-700">
      {/* ↑ Added pt-24 for space below fixed navbar */}

      {/* Game canvas */}
      <div className="flex-1 bg-slate-900 rounded-lg p-4 flex flex-col items-center shadow-lg">
        <h2 className="text-white text-2xl font-bold mb-3">Game Area</h2>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="border-4 border-purple-500 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 shadow-md"
        />
        <button
          onClick={moveBall}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full font-semibold shadow-lg transition-all duration-200"
        >
          Move Ball
        </button>
      </div>

      {/* Chat + Player list */}
      <div className="w-full md:w-1/3 flex flex-col gap-4">
        <div className="bg-purple-900 rounded-lg p-4 shadow-lg">
          <h2 className="text-white text-xl font-semibold mb-2">Players</h2>
          <div className="flex flex-wrap gap-2">
            {players.length === 0 ? (
              <p className="text-purple-200">No players yet</p>
            ) : (
              players.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-700 px-3 py-1 rounded-full shadow-md"
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-white text-sm font-semibold">{p}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-purple-900 rounded-lg p-4 flex flex-col shadow-lg">
          <h2 className="text-white text-xl font-semibold mb-2">Chat</h2>
          <div className="flex-1 overflow-y-auto mb-2 space-y-1 p-2 bg-purple-800 rounded-lg">
            {chat.length === 0 ? (
              <p className="text-purple-200">No messages yet</p>
            ) : (
              chat.map((c, i) => (
                <p key={i} className="text-sm text-white">
                  <span className="font-bold text-green-400">{c.userId}:</span>{' '}
                  {c.message}
                </p>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 rounded bg-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
