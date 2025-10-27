// controllers/inventoryController.js

const mongoose = require('mongoose'); 
const Inventory = require('../models/inventory'); // Corrected casing
const Asset = require('../models/Asset'); 

// ------------------------------------------------------------------------
// 1. getUserInventory - GET /api/inventory
// ------------------------------------------------------------------------
const getUserInventory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.query; 

        let baseQuery = { owner: userId };
        
        if (category) {
            const matchingAssets = await Asset.find({ category: category }).select('_id');
            const assetIds = matchingAssets.map(asset => asset._id);
            baseQuery.asset = { $in: assetIds };
        }

        const inventoryItems = await Inventory.find(baseQuery)
            .populate({
                path: 'asset',
                select: 'name description imageURL category rarity price crossGameCompatible creator' 
            })
            .sort({ createdAt: -1 });

        const transformedInventory = inventoryItems.map(item => ({
            ...item.asset.toObject(), 
            _id: item._id, 
            quantity: item.quantity,
            status: item.status,
            thumbnail: item.asset.imageURL, 
            isNFT: item.asset.rarity !== 'Common', 
            downloads: 100 + item.quantity, 
            rating: 4.5
        }));

        res.status(200).json(transformedInventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ message: 'Failed to retrieve inventory.' });
    }
};

// ------------------------------------------------------------------------
// 2. getInventoryStats - GET /api/inventory/stats
// ------------------------------------------------------------------------
const getInventoryStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Ensure you have all necessary imports (mongoose for aggregation)

        const stats = await Inventory.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(userId) } }, 
            {
                $lookup: {
                    from: 'assets',
                    localField: 'asset',
                    foreignField: '_id',
                    as: 'assetDetails'
                }
            },
            { $unwind: '$assetDetails' },
            {
                $group: {
                    _id: null,
                    totalAssets: { $sum: '$quantity' },
                    totalValue: { $sum: { $multiply: ['$quantity', '$assetDetails.price'] } },
                    assetsByType: { $push: { type: '$assetDetails.category', quantity: '$quantity' } },
                    crossGameAssets: { $sum: { $cond: ['$assetDetails.crossGameCompatible', '$quantity', 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAssets: 1,
                    totalValue: { $round: ['$totalValue', 2] },
                    crossGameAssets: 1,
                    assetsByType: {
                        $arrayToObject: { $map: { input: '$assetsByType', as: 'item', in: ['$$item.type', '$$item.quantity'] } }
                    }
                }
            }
        ]);

        const finalStats = stats.length > 0 ? stats[0] : { totalAssets: 0, totalValue: 0, crossGameAssets: 0, assetsByType: {} };

        res.status(200).json(finalStats);
    } catch (error) {
        console.error('Error calculating inventory stats:', error);
        res.status(500).json({ message: 'Failed to retrieve inventory stats.' });
    }
};

// ------------------------------------------------------------------------
// 3. purchaseAsset - POST /api/inventory/purchase
// ------------------------------------------------------------------------
const purchaseAsset = async (req, res) => {
    const userId = req.user.id; 
    const { assetId, quantity = 1 } = req.body;

    if (!assetId) {
        return res.status(400).json({ message: 'Asset ID is required for purchase.' });
    }

    try {
        const assetToBuy = await Asset.findById(assetId);
        if (!assetToBuy) {
            return res.status(404).json({ message: 'Asset not found in marketplace.' });
        }
        
        let inventoryItem = await Inventory.findOne({ owner: userId, asset: assetId });

        if (inventoryItem) {
            inventoryItem.quantity += quantity;
            await inventoryItem.save();
        } else {
            inventoryItem = await Inventory.create({
                owner: userId,
                asset: assetId,
                quantity: quantity,
                status: 'available'
            });
        }

        res.status(201).json({ 
            message: 'Asset successfully added to inventory.', 
            inventoryItem 
        });

    } catch (error) {
        console.error('Purchase/Add Inventory error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You already own this unstackable item.' });
        }
        res.status(500).json({ message: 'Failed to complete transaction.' });
    }
};

// 🔑 FINAL EXPORT: Use module.exports to reliably export all functions
module.exports = {
    getUserInventory,
    getInventoryStats,
    purchaseAsset,
};