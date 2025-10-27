import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserInventory, getInventoryStats } from '../store/slices/inventorySlice';
import { Package, Filter, Download, Star, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';

const Inventory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventory, stats, isLoading } = useSelector((state) => state.inventory);
  const [selectedType, setSelectedType] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const assetTypes = ['sprite', 'sound', 'music', 'tileset', 'character', 'weapon', 'powerup'];

  useEffect(() => {
    const filters = {};
    if (selectedType) filters.type = selectedType;
    dispatch(getUserInventory(filters));
    dispatch(getInventoryStats());
  }, [dispatch, selectedType]);

  const purchaseAsset = async (assetId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/inventory/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Purchase failed');

      console.log('Purchased:', data);
      dispatch(getUserInventory());
      dispatch(getInventoryStats());
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  const safeImage = (src, name) =>
    src || `/fallback.png` || `https://via.placeholder.com/400x200?text=${encodeURIComponent(name || 'Asset')}`;

  // 🧮 Calculate total bill
  const totalBill = inventory.reduce((sum, item) => sum + (item.price || 0), 0);

  // 💳 When Buy Now clicked
  const handleBuyNow = () => {
    if (inventory.length === 0) {
      alert('Your inventory is empty!');
      return;
    }
    setShowSummary(true);
  };

  // ✅ Confirm and redirect
  const confirmPurchase = () => {
    setShowSummary(false);
    alert('✅ Purchase confirmed! Redirecting to Marketplace...');
    setTimeout(() => navigate('/marketplace'), 1500);
  };

  return (
    <div className="min-h-screen py-12 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Inventory</h1>
          <p className="text-slate-400">Manage your purchased assets</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Assets</p>
                  <p className="text-3xl font-bold text-white">{stats.totalAssets}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Cross-Game</p>
                  <p className="text-3xl font-bold text-white">{stats.crossGameAssets}</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.totalValue?.toFixed?.(2) || 0}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Most Common</p>
                  <p className="text-xl font-bold text-white capitalize">
                    {Object.entries(stats.assetsByType || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Types</option>
            {assetTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Inventory Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">Your inventory is empty</h3>
              <p className="text-slate-400">Visit the marketplace to purchase assets for your games</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-slate-400">
              Showing {inventory.length} asset{inventory.length !== 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {inventory.map((asset) => (
                <Card key={asset._id} hover className="overflow-hidden">
                  <div className="relative">
                    <img src={safeImage(asset.thumbnail, asset.name)} alt={asset.name} className="w-full h-40 object-cover" />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs text-white font-semibold">
                      {asset.type || 'N/A'}
                    </div>
                    {asset.isNFT && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs text-white font-semibold">
                        NFT
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">{asset.name}</h3>
                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{asset.description}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {asset.downloads || 0}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-yellow-400" />
                        {(asset.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <img
                        src={safeImage(asset.creator?.avatar, asset.creator?.username)}
                        alt={asset.creator?.username || 'Creator'}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-slate-400 text-xs truncate">{asset.creator?.username || 'Unknown'}</span>
                    </div>

                    {asset.crossGameCompatible && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-400">✓ Cross-Game Compatible</span>
                      </div>
                    )}

                    <div className="mt-3 text-center">
                      <button
                        onClick={() => purchaseAsset(asset._id, 1)}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* 💰 Bottom Buy Now button */}
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleBuyNow}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full shadow-lg transition-all"
              >
                💳 Buy Now
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🧾 Summary Popup */}
      // ...existing code...
      {/* 🧾 Summary Popup */}
      {showSummary && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)} />

          {/* <-- CHANGED: white solid card (no transparency) --> */}
          <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 transform transition-all">
            <button
              onClick={() => setShowSummary(false)}
              aria-label="Close summary"
              className="absolute top-3 right-3 text-slate-500 hover:text-black z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center gap-4">
              <h2 className="text-2xl md:text-3xl font-extrabold text-black">Purchase Summary</h2>

              <div className="w-full bg-white border border-slate-100 rounded-lg p-4 text-center">
                <p className="text-sm text-slate-600 mb-2">Total Assets</p>
                <p className="text-xl md:text-2xl font-bold text-black">{inventory.length}</p>

                <div className="mt-3">
                  <p className="text-xs text-slate-600 mb-1">Total Bill</p>

                  {/* Black bill badge */}
                  <div className="inline-block bg-black text-yellow-400 px-4 py-2 rounded-md text-2xl md:text-3xl font-extrabold shadow-sm border border-slate-800">
                    ₹{totalBill.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex w-full justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowSummary(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition"
                >
                  Confirm & Go to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;