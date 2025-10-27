import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllGames } from '../store/slices/gameSlice';
import { Search, Play, Users, Star } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

// Random gaming-related fallback images
const fallbackImages = [
  'https://cdn-icons-png.flaticon.com/512/3144/3144456.png', // PS5 controller
  'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', // Joystick
  'https://cdn-icons-png.flaticon.com/512/7329/7329862.png', // Gamepad
  'https://cdn-icons-png.flaticon.com/512/888/888879.png',   // Console
  'https://cdn-icons-png.flaticon.com/512/919/919851.png',   // Arcade
  'https://cdn-icons-png.flaticon.com/512/889/889768.png',   // Racing wheel
  'https://cdn-icons-png.flaticon.com/512/1055/1055646.png', // Pixel sword
  'https://cdn-icons-png.flaticon.com/512/942/942748.png',   // Puzzle cube
  'https://cdn-icons-png.flaticon.com/512/3094/3094853.png', // RPG shield
];

// Get unique image per game (based on ID or title)
const getStableImage = (identifier = '') => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbackImages.length;
  return fallbackImages[index];
};

const GameBrowser = () => {
  const dispatch = useDispatch();
  const { games, isLoading } = useSelector((state) => state.game);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  const categories = ['action', 'puzzle', 'strategy', 'rpg', 'platformer', 'racing'];
  const difficulties = ['easy', 'medium', 'hard'];

  useEffect(() => {
    const filters = { published: true };
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedDifficulty) filters.difficulty = selectedDifficulty;
    dispatch(getAllGames(filters));
  }, [dispatch, selectedCategory, selectedDifficulty]);

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Browse Games</h1>
          <p className="text-slate-400">
            Discover and play amazing games created by our community
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Difficulties</option>
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading games...</div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No games found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Card key={game._id} hover className="overflow-hidden bg-slate-900 border border-slate-700 rounded-xl transition-transform hover:scale-105">
                <img
                  src={game.thumbnail || getStableImage(game._id || game.title)}
                  alt={game.title}
                  className="w-full h-48 object-contain p-6 bg-slate-800"
                  onError={(e) => (e.target.src = getStableImage(game.title))}
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{game.description || 'No description available.'}</p>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span className="flex items-center">
                      <Play className="w-4 h-4 mr-1" /> {game.playCount || 0}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" /> {game.maxPlayers || 1}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" /> {Number(game.rating || 0).toFixed(1)}
                    </span>
                  </div>
                  <Link to={`/game/play/${game._id}`}>
                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" /> Play Now
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBrowser;
