const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    // The user who owns this asset item
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
        index: true // Index for fast lookup by user
    },
    // The asset/NFT itself (e.g., the Sword, the Potion)
    asset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset', // Assuming you have an Asset model
        required: true
    },
    // Quantity for stackable items (like potions, arrows)
    quantity: {
        type: Number,
        default: 1,
        min: 0
    },
    // Optional: Tracking status for cross-game use (e.g., for future 'equipped' logic)
    status: {
        type: String,
        enum: ['available', 'in-use', 'on-loan'],
        default: 'available'
    },
    // Optional: Reference to the specific game instance/slot it's currently loaded into
    gameInstance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GameInstance', // For cross-game logic
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Enforce that a user cannot own the same unstackable asset multiple times
// (Unless you handle quantity > 1 explicitly in the frontend logic)
InventorySchema.index({ owner: 1, asset: 1 }, { unique: true, partialFilterExpression: { quantity: 1 } });

module.exports = mongoose.model('Inventory', InventorySchema);