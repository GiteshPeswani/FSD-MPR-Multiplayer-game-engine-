require('dotenv').config();
const axios = require('axios');

const API = 'https://fsd-mpr-multiplayer-game-engine.onrender.com/api/assets';

// 🔑 Paste your token here
const TOKEN = 'PASTE_YOUR_TOKEN_HERE';

const headers = () => ({ Authorization: `Bearer ${TOKEN}` });

async function testCreateAsset() {
  try {
    const res = await axios.post(
      API,
      {
        name: 'Sword of Render',
        description: 'A legendary test sword',
        metadataURI: 'ipfs://test123',
        price: 150,
      },
      { headers: headers() }
    );
    console.log('✅ Asset created:', res.data);
  } catch (err) {
    console.error('❌ Asset creation failed:', err.response?.data || err.message);
  }
}

async function testListAssets() {
  try {
    const res = await axios.get(API, { headers: headers() });
    console.log('✅ Assets list:', res.data.assets);
  } catch (err) {
    console.error('❌ List assets failed:', err.response?.data || err.message);
  }
}

(async () => {
  await testCreateAsset();
  await testListAssets();
})();
