require('dotenv').config();
const axios = require('axios');

const API = 'http://localhost:4000/api/games';

let TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmE0YjVjYjljZjI0NzZkMzE1Y2E5NiIsInJvbGUiOiJwbGF5ZXIiLCJpYXQiOjE3NjEyMzM3NTYsImV4cCI6MTc2MTgzODU1Nn0._gs1H9feb4LisIBXeP5nBQwh9epcD434HL0WF-SIIYI'; // replace with token from testAuth or run testAuth first

const headers = () => ({ Authorization: `Bearer ${TOKEN}` });

const testCreateGame = async () => {
  try {
    const res = await axios.post(API, {
      title: 'Epic Battle',
      description: 'Test game with backend',
      settings: { difficulty: 'medium' }
    }, { headers: headers() });
    console.log('✅ Game created:', res.data);
    return res.data.game._id;
  } catch (err) {
    console.error('❌ Create game failed:', err.response?.data || err.message);
  }
};

const testListGames = async () => {
  try {
    const res = await axios.get(API);
    console.log('✅ Games list:', res.data.games);
  } catch (err) {
    console.error('❌ List games failed:', err.response?.data || err.message);
  }
};

const testUpdateGame = async (id) => {
  try {
    const res = await axios.put(`${API}/${id}`, {
      title: 'Epic Battle +1'
    }, { headers: headers() });
    console.log('✅ Game updated:', res.data);
  } catch (err) {
    console.error('❌ Update game failed:', err.response?.data || err.message);
  }
};

const testDeleteGame = async (id) => {
  try {
    const res = await axios.delete(`${API}/${id}`, { headers: headers() });
    console.log('✅ Game deleted:', res.data);
  } catch (err) {
    console.error('❌ Delete game failed:', err.response?.data || err.message);
  }
};

const run = async () => {
  const gameId = await testCreateGame();
  await testListGames();
  await testUpdateGame(gameId);
  await testListGames();
  await testDeleteGame(gameId);
  await testListGames();
};

run();
