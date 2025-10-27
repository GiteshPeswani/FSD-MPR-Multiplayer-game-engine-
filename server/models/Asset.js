const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    metadataURI: {
      type: String,
      trim: true // can be IPFS or direct image URL
    },
    imageURL: {
      type: String,
      trim: true // optional field for marketplace thumbnails
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    rarity: {
      type: String,
      enum: ['Common', 'Rare', 'Epic', 'Legendary'],
      default: 'Common'
    },
    category: {
      type: String,
      enum: ['Weapon', 'Armor', 'Potion', 'Skin', 'Misc'],
      default: 'Misc'
    },
    blockchainId: {
      type: String,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// optional virtual field to auto-pick image from metadata if no imageURL
assetSchema.virtual('displayImage').get(function () {
  if (this.imageURL) return this.imageURL;
  if (this.metadataURI?.startsWith('ipfs://'))
    return `https://ipfs.io/ipfs/${this.metadataURI.split('ipfs://')[1]}`;
  return this.metadataURI || 'https://via.placeholder.com/400x200?text=No+Image';
});

module.exports = mongoose.model('Asset', assetSchema);
