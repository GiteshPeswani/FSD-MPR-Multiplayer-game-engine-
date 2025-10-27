import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, Users, Star, Code, Tag } from 'lucide-react';

const GamePlay = () => {
  const { id } = useParams();
  // Assume state structure is { game: { games: [...] } }
  const { games } = useSelector((state) => state.game);

  const game = games.find((g) => g._id === id);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center text-3xl font-bold text-red-500 bg-gray-900">
        Game not found! 😔
      </div>
    );
  }

  // --- Configuration for Styling and Content ---

  // Category-based background gradients (Main Page BG)
  const bgGradients = {
    racing: 'from-purple-900 via-indigo-900 to-pink-700', 
    puzzle: 'from-blue-900 via-teal-800 to-cyan-700',
    strategy: 'from-green-900 via-emerald-800 to-lime-700',
    rpg: 'from-red-900 via-rose-900 to-orange-700',
    platformer: 'from-indigo-900 via-violet-800 to-purple-500',
    shooter: 'from-red-800 via-gray-900 to-red-600', 
    default: 'from-gray-900 via-slate-800 to-gray-700'
  };

  const getGradient = (category) => bgGradients[category?.toLowerCase()] || bgGradients.default;

  // Category flair messages
  const messages = {
    racing: '🏎️ Race against time and your friends!',
    puzzle: '🧩 Solve challenging puzzles!',
    strategy: '♟️ Outsmart your opponents in strategy battles!',
    rpg: '🗡️ Embark on an epic RPG adventure!',
    platformer: '🏃 Jump, run, and collect coins!',
    shooter: '💥 Lock and load for intense action!',
    default: '🎮 Enjoy this awesome game!'
  };

  // Dummy tags for better visualization (Replace with actual game.tags)
  const dummyTags = game.tags || ['Multiplayer', 'Action', 'Indie', game.category || 'Casual'];

  // --- Component Rendering ---

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getGradient(game.category)} relative pb-20`}>
      
      {/* NOTE: If you want a STICKY NAVBAR, you must place your Navbar component 
        *before* this <div> and ensure it has the 'sticky top-0 z-50' classes.
      */}

      {/* Banner */}
      <div className="w-full h-72 md:h-96 relative overflow-hidden rounded-b-[40px] shadow-2xl">
        <img
          src={game.thumbnail || 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png'}
          alt={game.title}
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end items-start text-white p-6 md:p-10">
          <div className="max-w-4xl">
            {/* Category and Developer */}
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-semibold uppercase tracking-wider text-teal-300 bg-teal-300/10 px-3 py-1 rounded-full border border-teal-300/30">
                {game.category || 'Arcade'}
              </span>
              <div className="flex items-center text-sm text-slate-300">
                <Code className="w-4 h-4 mr-1" />
                <span className='font-medium'>{game.developer || 'Anonymous Studio'}</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold drop-shadow-xl leading-tight">
              {game.title}
            </h1>
            <p className="mt-3 text-lg md:text-xl font-light text-slate-200 drop-shadow">
              {messages[game.category?.toLowerCase()] || messages.default}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto -mt-16 relative z-10 px-4">
        {/* Action Button and Stats Panel */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6">
          {/* Play Button */}
          <button
            onClick={() => alert(`Starting ${game.title}!`)}
            className="flex-shrink-0 flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 transition duration-300 text-white font-bold text-xl py-4 px-10 rounded-2xl shadow-2xl shadow-green-500/50 uppercase tracking-widest transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>Play Now</span>
          </button>

          {/* Stats Panel - SOLID bg-gray-900 */}
          <div className="flex-grow grid grid-cols-3 gap-4 bg-gray-900 rounded-2xl p-4 shadow-xl border border-gray-700">
            {/* Stat Item: Plays */}
            <div className="flex flex-col items-center p-2">
              <Play className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-white font-extrabold text-xl">{game.playCount?.toLocaleString() || '0'}</span>
              <span className="text-slate-400 text-sm mt-0">Plays</span>
            </div>
            {/* Stat Item: Max Players */}
            <div className="flex flex-col items-center p-2 border-x border-gray-700">
              <Users className="w-5 h-5 text-pink-400 mb-1" />
              <span className="text-white font-extrabold text-xl">{game.maxPlayers || 1}</span>
              <span className="text-slate-400 text-sm mt-0">Players</span>
            </div>
            {/* Stat Item: Rating */}
            <div className="flex flex-col items-center p-2">
              <Star className="w-5 h-5 text-yellow-400 mb-1 fill-yellow-400" />
              <span className="text-white font-extrabold text-xl">{(game.rating || 0).toFixed(1)}</span>
              <span className="text-slate-400 text-sm mt-0">Rating</span>
            </div>
          </div>
        </div>

        {/* Description / Features / Tags */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description & Features - Column 1 */}
          <div className="lg:col-span-2 text-slate-200">
            <h2 className="text-3xl font-bold mb-4 border-b border-gray-700 pb-2">About the Game</h2>
            <p className="mb-8 leading-relaxed text-lg">{game.description || 'A groundbreaking and immersive gaming experience awaits you. Dive into a richly detailed world, complete challenging quests, and interact with a vibrant community of players!'}</p>

            <h3 className="text-2xl font-bold mb-4 text-indigo-400">Roadmap / Upcoming Features:</h3>
            <ul className="space-y-3 list-none p-0">
              <li className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span className='text-slate-300'>**Real-time multiplayer gameplay:** Battle or cooperate with friends across the globe.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span className='text-slate-300'>**Physics simulation & collision detection:** Experience realistic movement and interactions.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span className='text-slate-300'>**Live chat and player communication:** Coordinate and socialize seamlessly in-game.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span className='text-slate-300'>**Spectator mode:** Watch epic matches live!</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 text-xl mr-3">✓</span>
                <span className='text-slate-300'>**Player synchronization & global leaderboards:** Climb the ranks and earn bragging rights.</span>
              </li>
            </ul>
          </div>

          {/* Tags & More Info - Column 2 */}
          <div className="lg:col-span-1">
             {/* Game Details - SOLID bg-gray-900 */}
             <div className="bg-gray-900 p-6 rounded-xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold mb-4 text-yellow-400">Game Details</h3>
                
                <div className="space-y-4">
                    {/* Tags Section */}
                    <div>
                        <div className="flex items-center text-lg font-semibold text-slate-300 mb-2">
                            <Tag className="w-5 h-5 mr-2 text-yellow-500" />
                            <span>Tags</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {dummyTags.map((tag, index) => (
                                <span 
                                    key={index} 
                                    className="px-3 py-1 text-sm font-medium text-indigo-300 bg-indigo-500/20 rounded-full hover:bg-indigo-500/30 transition cursor-default"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePlay;