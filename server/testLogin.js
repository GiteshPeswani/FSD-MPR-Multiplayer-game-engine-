const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'test@test.com4',
      password: '123456789041'
    });
    console.log('✅ Login success:');
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ Error response:', err.response.data);
    } else {
      console.error('❌ Request failed:', err.message);
    }
  }
}

testLogin();
