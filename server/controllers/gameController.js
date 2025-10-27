const Game = require('../models/Game');

// Create Game
const createGame = async (req, res, next) => {
  try {
    const game = await Game.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ message: 'Game created', game });
  } catch (err) {
    next(err);
  }
};

// List All Games
const listGames = async (req, res, next) => {
  try {
    const games = await Game.find();
    res.status(200).json({ games });
  } catch (err) {
    next(err);
  }
};

// Get Single Game
const getGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.status(200).json({ game });
  } catch (err) {
    next(err);
  }
};

// Update Game
const updateGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    if (!game.owner.equals(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(game, req.body);
    await game.save();
    res.status(200).json({ message: 'Game updated', game });
  } catch (err) {
    next(err);
  }
};

// Delete Game
const deleteGame = async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    await game.deleteOne();
    res.json({ message: 'Game deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createGame,
  listGames,
  getGame,
  updateGame,
  deleteGame
};
