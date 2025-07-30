const { default: fetch } = require('node-fetch');

async function testCompleteFlow() {
    console.log('=== 完整流程測試 ===\n');
    
    try {
        // 1. 測試地理編碼
        console.log('1. 測試地理編碼...');
        const geocodeResponse = await fetch('http://localhost:3000/api/geocoding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: '台北市大安區' })
        });
        
        const geocodeData = await geocodeResponse.json();
        console.log('地理編碼結果:', geocodeData.success ? '✅ 成功' : '❌ 失敗');
        
        if (!geocodeData.success || !geocodeData.data.results) {
            console.log('地理編碼失敗，停止測試');
            return;
        }
        
        // 2. 測試創建租屋
        console.log('\n2. 測試創建租屋...');
        const location = geocodeData.data.results[0].geometry.location;
        const rentalData = {
            address: geocodeData.data.results[0].formatted_address,
            lat: location.lat,
            lng: location.lng,
            description: '測試租屋經驗',
            rent_price: 15000,
            room_type: '套房',
            area_size: 10,
            facilities: '冷氣,網路',
            landlord_rating: 4,
            location_rating: 5,
            value_rating: 3
        };
        
        const rentalResponse = await fetch('http://localhost:3000/api/rentals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rentalData)
        });
        
        const rentalResult = await rentalResponse.json();
        console.log('創建租屋結果:', rentalResult.success ? '✅ 成功' : '❌ 失敗');
        
        if (rentalResult.success) {
            console.log('租屋 ID:', rentalResult.data.id);
            console.log('整體評分:', rentalResult.data.overall_rating);
        } else {
            console.log('錯誤:', rentalResult.message);
        }
        
        // 3. 測試獲取租屋列表
        console.log('\n3. 測試獲取租屋列表...');
        const listResponse = await fetch('http://localhost:3000/api/rentals');
        const listResult = await listResponse.json();
        console.log('獲取列表結果:', listResult.success ? '✅ 成功' : '❌ 失敗');
        
        if (listResult.success) {
            console.log('租屋數量:', listResult.data.length);
        }
        
        console.log('\n=== 測試完成 ===');
        
    } catch (error) {
        console.error('測試錯誤:', error.message);
    }
}

testCompleteFlow();