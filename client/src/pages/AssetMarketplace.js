import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Play, Search, ArrowUpDown, User } from 'lucide-react';
import { purchaseAsset } from '../store/slices/inventorySlice'; // Redux action

const AssetMarketplace = () => {
  const dispatch = useDispatch();
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'

  // Fetch assets from backend
  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:4000/api/assets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setAssets(res.data.assets);
      setFilteredAssets(res.data.assets);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch assets');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Search & Sort logic
  const applyFiltersAndSort = useCallback((currentAssets, term, order) => {
    let results = currentAssets;

    if (term) {
      results = results.filter((asset) =>
        asset.name.toLowerCase().includes(term.toLowerCase()) ||
        asset.category.toLowerCase().includes(term.toLowerCase())
      );
    }

    if (order !== 'none') {
      results = [...results].sort((a, b) => (order === 'asc' ? a.price - b.price : b.price - a.price));
    }

    setFilteredAssets(results);
  }, []);

  useEffect(() => {
    applyFiltersAndSort(assets, searchTerm, sortOrder);
  }, [searchTerm, assets, sortOrder, applyFiltersAndSort]);

  const handleSort = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? 'none' : 'asc';
    setSortOrder(newSortOrder);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary': return 'text-yellow-400 border-yellow-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const getImageSource = (asset) =>
    asset.displayImage || `https://via.placeholder.com/400x200?text=${encodeURIComponent(asset.name || 'Asset')}`;

  // ------------------ Purchase Handler ------------------
  const handlePurchase = async (assetId) => {
    try {
      await dispatch(purchaseAsset({ assetId, quantity: 1 })).unwrap();
      alert('✅ Asset purchased successfully!');
    } catch (err) {
      console.error('Purchase error:', err);
      alert(err || 'Purchase failed');
    }
  };

  return (
    <div className="min-h-screen py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Asset Marketplace</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search assets..."
                className="pl-9 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSort}>
              <ArrowUpDown className="w-4 h-4 mr-1" /> Price
              {sortOrder === 'asc' && ' (Low to High)'}
              {sortOrder === 'desc' && ' (High to Low)'}
              {sortOrder === 'none' && ' (Unsorted)'}
            </Button>
          </div>
        </div>

        {/* Loading/Error/Empty States */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4">Loading assets...</p>
          </div>
        )}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        {!isLoading && !error && filteredAssets.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No assets found</h3>
            <p className="text-slate-400">Try different keywords or check later!</p>
          </Card>
        )}

        {/* Assets Grid */}
        {!isLoading && !error && filteredAssets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => {
              const rarity = asset.rarity || 'Common';
              const ownerName = asset.owner?.username || asset.owner?._id;

              return (
                <Card
                  key={asset._id}
                  hover
                  className="overflow-hidden bg-slate-800 border border-slate-700 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
                >
                  <div className="relative">
                    <img
                      src={getImageSource(asset)}
                      alt={asset.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://via.placeholder.com/400x200?text=${encodeURIComponent(asset.name || 'Asset')}` }}
                    />
                    <span className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold border rounded-full ${getRarityColor(rarity)}`}>
                      {rarity}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2">{asset.name}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{asset.description}</p>

                    <div className="flex items-center text-slate-400 text-xs mb-3">
                      <User className="w-3 h-3 mr-1" />
                      <span className="mr-3">Owner: {ownerName || 'Unknown'}</span>
                      <span className="px-1 bg-slate-700 rounded-full text-slate-300">{asset.category}</span>
                    </div>

                    <p className="text-slate-300 text-lg font-semibold mb-4 border-t border-slate-700 pt-3">
                      💰 {asset.price} Coins
                    </p>

                    <div className="flex justify-end">
                      <Button onClick={() => handlePurchase(asset._id)}>
                        <Play className="w-4 h-4 mr-1" /> Buy Now
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetMarketplace;
