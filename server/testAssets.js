require('dotenv').config();
const axios = require('axios');

const API = 'http://localhost:4000/api/assets';
let TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZmE0YjVjYjljZjI0NzZkMzE1Y2E5NiIsInJvbGUiOiJwbGF5ZXIiLCJpYXQiOjE3NjEyMzM3NTYsImV4cCI6MTc2MTgzODU1Nn0._gs1H9feb4LisIBXeP5nBQwh9epcD434HL0WF-SIIYI'; // replace with token from testAuth

const headers = () => ({ Authorization: `Bearer ${TOKEN}` });

const testCreateAsset = async () => {
  try {
    const res = await axios.post(API, {
      name: 'Sword of Testing',
      description: 'Epic sword for tests',
      metadataURI: 'ipfs://test123',
      price: 100
    }, { headers: headers() });
    console.log('✅ Asset created:', res.data);
    return res.data.asset._id;
  } catch (err) {
    console.error('❌ Create asset failed:', err.response?.data || err.message);
  }
};

const testListAssets = async () => {
  try {
    const res = await axios.get(API);
    console.log('✅ Assets list:', res.data.assets);
  } catch (err) {
    console.error('❌ List assets failed:', err.response?.data || err.message);
  }
};

const testUpdateAsset = async (id) => {
  try {
    const res = await axios.put(`${API}/${id}`, {
      name: 'Sword of Testing +1',
      price: 150
    }, { headers: headers() });
    console.log('✅ Asset updated:', res.data);
  } catch (err) {
    console.error('❌ Update asset failed:', err.response?.data || err.message);
  }
};

const testDeleteAsset = async (id) => {
  try {
    const res = await axios.delete(`${API}/${id}`, { headers: headers() });
    console.log('✅ Asset deleted:', res.data);
  } catch (err) {
    console.error('❌ Delete asset failed:', err.response?.data || err.message);
  }
};

const run = async () => {
  const assetId = await testCreateAsset();
  await testListAssets();
  await testUpdateAsset(assetId);
  await testListAssets();
  await testDeleteAsset(assetId);
  await testListAssets();
};

run();
