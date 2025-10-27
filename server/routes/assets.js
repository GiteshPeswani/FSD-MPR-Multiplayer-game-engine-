// routes/assets.js

const express = require('express');
const router = express.Router();
const { 
    createAsset, 
    createBulkAssets, // 👈 Imported the new bulk handler
    listAssets, 
    getAsset, 
    updateAsset, 
    deleteAsset 
} = require('../controllers/assetController'); 
const { protect } = require('../middleware/authMiddleware'); // Your authentication middleware

// --- Public/View Routes ---

// GET /api/assets - List all assets (No authentication needed to view)
router.get('/', listAssets);

// GET /api/assets/:id - Get a single asset (No authentication needed to view)
router.get('/:id', getAsset);

// --- Creation & Modification Routes (Requires Middleware/Protection) ---

// 🛑 POST /api/assets/bulk - Bulk Creation Route
// This route is set up to handle the array of 20 assets.
// It DOES NOT use 'protect' middleware so you can easily load data for development.
router.post('/bulk', createBulkAssets); 

// POST /api/assets - Single Asset Creation
// This is for creating one asset at a time, typically by an authenticated user.
router.post('/', protect, createAsset); 

// PUT /api/assets/:id - Update an asset
// Requires authentication to ensure only authorized users modify assets.
router.put('/:id', protect, updateAsset);

// DELETE /api/assets/:id - Delete an asset
// Requires authentication to ensure only authorized users delete assets.
router.delete('/:id', protect, deleteAsset);

module.exports = router;