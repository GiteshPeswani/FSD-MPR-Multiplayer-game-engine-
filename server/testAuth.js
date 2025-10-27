require('dotenv').config();
const axios = require('axios');

const API = 'https://fsd-mpr-multiplayer-game-engine.onrender.com/api/auth';

async function testRegister() {
  try {
    const res = await axios.post(`${API}/register`, {
      username: 'testuser_final',
      email: 'testuser_final@example.com',
      password: '12345678',
    });
    console.log('✅ Registration success:');
    console.log(res.data);
  } catch (err) {
    console.error('❌ Registration failed:', err.response?.data || err.message);
  }
}

async function testLogin() {
  try {
    const res = await axios.post(`${API}/login`, {
      email: 'testuser_final@example.com',
      password: '12345678',
    });
    console.log('✅ Login success, token:');
    console.log(res.data.token);
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
  }
}

(async () => {
  await testRegister();
  await testLogin();
})();
