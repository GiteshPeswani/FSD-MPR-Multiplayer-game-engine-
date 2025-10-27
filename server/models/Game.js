const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: String,
  description: String,
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  settings: { type: Object, default: {} },
  state: { type: Object, default: {} }, // last persisted state snapshot
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLive: { type: Boolean, default: false },
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
