const { default: fetch } = require('node-fetch');

async function debugAddRental() {
    console.log('=== 調試新增租屋經驗功能 ===\n');
    
    try {
        // 步驟1: 測試地理編碼
        console.log('步驟1: 測試地理編碼...');
        const address = '台北市中正區';
        console.log('輸入地址:', address);
        
        const geocodeResponse = await fetch('http://localhost:3000/api/geocoding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address })
        });
        
        console.log('地理編碼回應狀態:', geocodeResponse.status);
        const geocodeData = await geocodeResponse.json();
        console.log('地理編碼回應:', JSON.stringify(geocodeData, null, 2));
        
        if (!geocodeData.success) {
            console.log('❌ 地理編碼失敗，停止測試');
            return;
        }
        
        // 步驟2: 準備租屋資料
        console.log('\n步驟2: 準備租屋資料...');
        const location = geocodeData.data.results[0].geometry.location;
        const rentalData = {
            address: geocodeData.data.results[0].formatted_address,
            lat: location.lat,
            lng: location.lng,
            description: '測試租屋經驗描述',
            rent_price: 20000,
            room_type: '套房',
            area_size: 12,
            facilities: '冷氣,洗衣機,網路',
            landlord_rating: 4,
            location_rating: 5,
            value_rating: 3
        };
        
        console.log('準備發送的租屋資料:');
        console.log(JSON.stringify(rentalData, null, 2));
        
        // 步驟3: 創建租屋
        console.log('\n步驟3: 創建租屋...');
        const rentalResponse = await fetch('http://localhost:3000/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rentalData)
        });
        
        console.log('創建租屋回應狀態:', rentalResponse.status);
        const rentalResult = await rentalResponse.json();
        console.log('創建租屋回應:', JSON.stringify(rentalResult, null, 2));
        
        if (rentalResult.success) {
            console.log('✅ 租屋創建成功！');
            console.log('租屋ID:', rentalResult.data.id);
            console.log('整體評分:', rentalResult.data.overall_rating);
        } else {
            console.log('❌ 租屋創建失敗');
            console.log('錯誤訊息:', rentalResult.message);
            console.log('錯誤詳情:', rentalResult.error);
        }
        
    } catch (error) {
        console.error('❌ 調試過程中發生錯誤:', error);
        console.error('錯誤堆疊:', error.stack);
    }
}

debugAddRental();