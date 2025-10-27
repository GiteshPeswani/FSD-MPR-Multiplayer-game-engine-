import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Play, Edit, Eye, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getAllGames, createGame } from '../store/slices/gameSlice';

const categoryImages = {
  racing: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  puzzle: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80',
  battle: 'https://images.unsplash.com/photo-1590608897129-79da98d159e9?auto=format&fit=crop&w=800&q=80',
  adventure: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80',
  arcade: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=800&q=80',
  strategy: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437d9?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?auto=format&fit=crop&w=800&q=80'
};

const getGameImage = (game) => {
  const category = game?.category?.toLowerCase() || 'default';
  return categoryImages[category] || categoryImages.default;
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { games, isLoading } = useSelector((state) => state.game);

  const [showModal, setShowModal] = useState(false);
  const [newGame, setNewGame] = useState({ title: '', description: '', category: '' });

  useEffect(() => { dispatch(getAllGames()); }, [dispatch]);

  const myGames = games?.filter(
    (game) => game?.creator?._id === user?._id || game?.owner === user?._id
  ) || [];

  const handleCreateGame = async () => {
    if (!newGame.title.trim()) return alert('Enter a game title!');
    await dispatch(createGame(newGame));
    setShowModal(false);
    setNewGame({ title: '', description: '', category: '' });
    dispatch(getAllGames());
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-slate-400">Manage your games below</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Games</p>
                <p className="text-3xl font-bold text-white">{myGames.length}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg"><Play className="w-6 h-6 text-purple-400" /></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Plays</p>
                <p className="text-3xl font-bold text-white">{myGames.reduce((acc,g)=>acc+(g.playCount||0),0)}</p>
              </div>
              <div className="p-3 bg-pink-500/20 rounded-lg"><Users className="w-6 h-6 text-pink-400" /></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Published</p>
                <p className="text-3xl font-bold text-white">{myGames.filter(g=>g.isPublished).length}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg"><Eye className="w-6 h-6 text-green-400" /></div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Coins</p>
                <p className="text-3xl font-bold text-yellow-400">{user?.coins||0}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-lg">💰</div>
            </div>
          </Card>
        </div>

        {/* My Games */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">My Games</h2>
            <Button onClick={()=>setShowModal(true)}><Plus className="w-5 h-5 mr-2"/> Create Game</Button>
          </div>
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : myGames.length===0 ? (
            <Card className="p-12 text-center">
              <p className="text-slate-400">No games yet</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGames.map(game=>(
                <Card key={game._id} hover className="overflow-hidden">
                  <img src={getGameImage(game)} alt={game.title} className="w-full h-48 object-cover"/>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{game.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${game.isPublished?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>
                        {game.isPublished?'Published':'Draft'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{game.description}</p>
                    <div className="flex space-x-2">
                      <Link to={`/game/play/${game._id}`} className="flex-1">
                        <Button variant="secondary" size="sm"><Play className="w-4 h-4 mr-1"/> Play</Button>
                      </Link>
                      <Link to={`/game/editor/${game._id}`}>
                        <Button variant="outline" size="sm"><Edit className="w-4 h-4"/></Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Game Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
              <h2 className="text-xl text-white mb-4 font-bold">Create New Game</h2>
              <input type="text" placeholder="Title" value={newGame.title} onChange={e=>setNewGame({...newGame,title:e.target.value})} className="w-full mb-3 p-2 rounded bg-gray-700 text-white"/>
              <input type="text" placeholder="Category" value={newGame.category} onChange={e=>setNewGame({...newGame,category:e.target.value})} className="w-full mb-3 p-2 rounded bg-gray-700 text-white"/>
              <textarea placeholder="Description" value={newGame.description} onChange={e=>setNewGame({...newGame,description:e.target.value})} className="w-full mb-4 p-2 rounded bg-gray-700 text-white"/>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={()=>setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateGame}>Create</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
