// ...existing code...
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
// destructure controller functions
const {
  createGame,
  listGames,
  getGame,
  updateGame,
  deleteGame
} = require('../controllers/gameController');
// destructure protect middleware (ensure authMiddleware exports { protect })
const { protect } = require('../middleware/authMiddleware');

// Validation middleware
const validateGameCreation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

const validateGameUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Routes
router.post('/', protect, ...validateGameCreation, createGame);

router.get('/', listGames);
router.get('/:id', getGame);
router.put('/:id', protect, ...validateGameUpdate, updateGame);
router.delete('/:id', protect, deleteGame);

module.exports = router;
// ...existing code...