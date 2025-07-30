// Jest 測試設置檔案
const axios = require('axios');

// 全域測試設置
beforeAll(async () => {
  // 等待伺服器啟動
  console.log('等待伺服器啟動...');
  
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      await axios.get('http://localhost:3000/api/rentals');
      console.log('伺服器已就緒');
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('伺服器啟動超時');
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

// 全域測試清理
afterAll(async () => {
  console.log('測試完成');
});