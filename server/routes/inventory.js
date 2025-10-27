
const express = require('express');
const router = express.Router();

const {
  getUserInventory,
  getInventoryStats,
  purchaseAsset,
} = require('../controllers/inventoryController');

// ✅ FIXED: Import only the `protect` middleware function
const { protect } = require('../middleware/authMiddleware');

// GET /api/inventory/stats
router.get('/stats', protect, getInventoryStats);

// GET /api/inventory
router.get('/', protect, getUserInventory);

// POST /api/inventory/purchase
router.post('/purchase', protect, purchaseAsset);

module.exports = router;