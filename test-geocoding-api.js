const { default: fetch } = require('node-fetch');

async function testGeocodingAPI() {
    console.log('測試地理編碼 API...');
    
    try {
        const response = await fetch('http://localhost:3000/api/geocoding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: '台北市大安區' })
        });
        
        const result = await response.json();
        console.log('完整回應:', JSON.stringify(result, null, 2));
        
        // 檢查回應結構
        if (result.success && result.data) {
            console.log('data 內容:', JSON.stringify(result.data, null, 2));
            if (result.data.results) {
                console.log('results 存在');
                console.log('第一個結果:', JSON.stringify(result.data.results[0], null, 2));
            } else {
                console.log('results 不存在');
            }
        }
    } catch (error) {
        console.error('錯誤:', error);
    }
}

testGeocodingAPI();