require('dotenv').config();
const axios = require('axios');

const API = 'http://localhost:4000/api/auth';

const testRegister = async () => {
  try {
    const res = await axios.post(`${API}/register`, {
      username: 'testuser4',
      email: 'test@test.com4',
      password: '123456789041'
    });
    console.log('✅ Registered:', res.data);
  } catch (err) {
    console.error('❌ Register failed:', err.response?.data || err.message);
  }
};

const testLogin = async () => {
  try {
    const res = await axios.post(`${API}/login`, {
      email: 'test@test.com4',
      password: '123456789041'
    });
    console.log('✅ Logged in, token:', res.data.token);
    return res.data.token;
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
  }
};

const run = async () => {
  await testRegister();
  const token = await testLogin();
  console.log('Use this token for protected routes:', token);
};

run();
