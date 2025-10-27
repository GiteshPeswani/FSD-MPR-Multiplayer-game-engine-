  // controllers/assetController.js

const Asset = require('../models/Asset'); // Ensure the path to your Mongoose model is correct

// Create Single Asset (POST /api/assets)
const createAsset = async (req, res, next) => {
    // Prevent accidentally sending an array to the single endpoint
    if (Array.isArray(req.body)) {
        return res.status(400).json({ message: "Use the /bulk endpoint for inserting multiple assets." });
    }
    
    try {
        // We assume req.user.id is set by auth middleware, 
        // but fall back to req.body if not authenticated or if IDs are passed explicitly.
        const { name, description, metadataURI, imageURL, price, rarity, category, owner, creator } = req.body;
        const userId = req.user ? req.user.id : owner;

        if (!userId) {
            return res.status(401).json({ message: "Authentication required or 'owner' must be provided." });
        }

        const asset = await Asset.create({
            name, 
            description, 
            metadataURI, 
            imageURL, 
            price, 
            rarity, 
            category,
            owner: userId,
            creator: creator || userId,
        });

        res.status(201).json({ message: "✅ Asset created successfully!", asset });
    } catch (err) {
        console.error("❌ Error creating single asset:", err);
        next(err); // Pass error to central error handler
    }
};

// Create Bulk Assets (POST /api/assets/bulk) 🌟 NEW LOGIC 🌟
const createBulkAssets = async (req, res, next) => {
    try {
        const assetsArray = req.body;

        if (!Array.isArray(assetsArray) || assetsArray.length === 0) {
            return res.status(400).json({ message: "Bulk creation requires a non-empty array of assets." });
        }

        // Use Mongoose's insertMany for high performance bulk insertion
        // The asset objects must contain 'name', 'price', 'metadataURI', 'owner', and 'creator'
        const insertedAssets = await Asset.insertMany(assetsArray, { ordered: false });

        res.status(201).json({ 
            message: `✅ Successfully created ${insertedAssets.length} assets in bulk!`,
            data: insertedAssets
        });
    } catch (err) {
        console.error("❌ Error creating bulk assets:", err);
        next(err); // Pass error to central error handler
    }
};

// List All Assets
const listAssets = async (req, res, next) => {
    try {
        const assets = await Asset.find().populate("owner", "username email").lean();

        const formattedAssets = assets.map((asset) => ({
            ...asset,
            displayImage:
                asset.imageURL ||
                (asset.metadataURI?.startsWith("ipfs://")
                    ? `https://ipfs.io/ipfs/${asset.metadataURI.split("ipfs://")[1]}`
                    : asset.metadataURI || "https://via.placeholder.com/400x200?text=No+Image"),
        }));

        res.status(200).json({ assets: formattedAssets });
    } catch (err) {
        console.error("❌ Error fetching assets:", err);
        next(err);
    }
};

// Get Single Asset
const getAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id).populate("owner", "username email").lean();

        if (!asset) return res.status(404).json({ message: "Asset not found" });

        asset.displayImage =
            asset.imageURL ||
            (asset.metadataURI?.startsWith("ipfs://")
                ? `https://ipfs.io/ipfs/${asset.metadataURI.split("ipfs://")[1]}`
                : asset.metadataURI || "https://via.placeholder.com/400x200?text=No+Image");

        res.status(200).json({ asset });
    } catch (err) {
        console.error("❌ Error getting asset:", err);
        next(err);
    }
};

// Update Asset
const updateAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) return res.status(404).json({ message: "Asset not found" });

        // Ownership check
        if (!asset.owner.equals(req.user.id)) {
            return res.status(403).json({ message: "Not authorized to update this asset" });
        }

        // Validate price format again if updating
        if (req.body.price !== undefined && typeof req.body.price !== 'number') {
            return res.status(400).json({ message: "Price must be a number" });
        }

        Object.assign(asset, req.body);
        await asset.save();

        res.status(200).json({ message: "✅ Asset updated successfully", asset });
    } catch (err) {
        console.error("❌ Error updating asset:", err);
        next(err);
    }
};

// Delete Asset
const deleteAsset = async (req, res, next) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        // Ownership check (Optional: uncomment if only owner can delete)
        // if (!asset.owner.equals(req.user.id)) {
        //     return res.status(403).json({ message: "Not authorized to delete this asset" });
        // }

        await Asset.deleteOne({ _id: req.params.id });
        res.json({ message: "🗑️ Asset deleted successfully" });
    } catch (error) {
        console.error("❌ Delete asset error:", error);
        next(error);
    }
};

module.exports = {
    createAsset,
    createBulkAssets, // Export the new function
    listAssets,
    getAsset,
    updateAsset,
    deleteAsset,
};