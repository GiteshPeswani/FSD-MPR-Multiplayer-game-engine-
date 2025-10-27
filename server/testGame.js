require('dotenv').config();
const axios = require('axios');

const API = 'https://fsd-mpr-multiplayer-game-engine.onrender.com/api/games';

// 🔑 Paste your token from testAuth.js output here
const TOKEN = 'PASTE_YOUR_TOKEN_HERE';

const headers = () => ({ Authorization: `Bearer ${TOKEN}` });

async function testCreateGame() {
  try {
    const res = await axios.post(
      API,
      {
        title: 'Render Test Game',
        description: 'Testing game creation on deployed backend',
        settings: { difficulty: 'medium' },
      },
      { headers: headers() }
    );
    console.log('✅ Game created:', res.data);
  } catch (err) {
    console.error('❌ Game creation failed:', err.response?.data || err.message);
  }
}

async function testListGames() {
  try {
    const res = await axios.get(API);
    console.log('✅ Games list:', res.data.games);
  } catch (err) {
    console.error('❌ List games failed:', err.response?.data || err.message);
  }
}

(async () => {
  await testCreateGame();
  await testListGames();
})();
