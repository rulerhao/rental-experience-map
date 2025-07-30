// 測試租屋經驗新增功能的調試腳本
const { default: fetch } = require('node-fetch');

const baseUrl = 'http://localhost:3000/api';

async function testGeocodingAPI() {
    console.log('=== 測試地理編碼 API ===');
    try {
        const response = await fetch(`${baseUrl}/geocoding`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: '台北市大安區' })
        });
        
        const result = await response.json();
        console.log('地理編碼回應:', JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('地理編碼錯誤:', error);
        return null;
    }
}

async function testCreateRental(geocodeData) {
    console.log('\n=== 測試創建租屋資料 ===');
    
    if (!geocodeData || !geocodeData.success || !geocodeData.data || !geocodeData.data.results || geocodeData.data.results.length === 0) {
        console.error('無法進行租屋創建測試，地理編碼失敗');
        return;
    }
    
    const location = geocodeData.data.results[0].geometry.location;
    const rentalData = {
        address: geocodeData.data.results[0].formatted_address,
        lat: location.lat,
        lng: location.lng,
        description: '測試租屋經驗 - 這是一個很棒的地方',
        rent_price: 15000,
        room_type: '套房',
        area_size: 10.5,
        facilities: '冷氣,洗衣機,網路',
        landlord_rating: 4,
        location_rating: 5,
        value_rating: 3
    };
    
    console.log('發送的租屋資料:', JSON.stringify(rentalData, null, 2));
    
    try {
        const response = await fetch(`${baseUrl}/rentals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rentalData)
        });
        
        const result = await response.json();
        console.log('創建租屋回應:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ 租屋資料創建成功！');
            return result.data.id;
        } else {
            console.log('❌ 租屋資料創建失敗');
        }
    } catch (error) {
        console.error('創建租屋錯誤:', error);
    }
}

async function testGetRentals() {
    console.log('\n=== 測試獲取租屋列表 ===');
    try {
        const response = await fetch(`${baseUrl}/rentals`);
        const result = await response.json();
        console.log('租屋列表回應:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('獲取租屋列表錯誤:', error);
    }
}

async function runTests() {
    console.log('開始測試租屋經驗新增功能...\n');
    
    // 測試地理編碼
    const geocodeResult = await testGeocodingAPI();
    
    // 測試創建租屋
    if (geocodeResult) {
        await testCreateRental(geocodeResult);
    }
    
    // 測試獲取租屋列表
    await testGetRentals();
    
    console.log('\n測試完成！');
}

runTests().catch(console.error);