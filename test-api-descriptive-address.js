const fetch = require('node-fetch');

// 測試新增租屋經驗（包含地址欄位）
async function testAddRentalWithAddress() {
    const testData = {
        address: "台北市信義區信義路五段7號",
        descriptive_address: "信義計畫區內，靠近台北101大樓，XX社區A棟15樓",
        lat: 25.0330,
        lng: 121.5654,
        description: "測試新增的地址欄位功能。這是一個很棒的租屋經驗！",
        rent_price: 30000,
        room_type: "套房",
        area_size: 20.5,
        facilities: "冷氣,洗衣機,網路,電視",
        landlord_rating: 4,
        location_rating: 5,
        value_rating: 3
    };

    try {
        console.log('正在測試新增租屋經驗（包含地址欄位）...');
        
        const response = await fetch('http://localhost:3000/api/rentals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ 新增成功！');
            console.log('回應資料:', result);
            return result.id;
        } else {
            console.log('❌ 新增失敗:', result);
            return null;
        }
    } catch (error) {
        console.error('❌ 請求失敗:', error.message);
        return null;
    }
}

// 測試獲取租屋資料
async function testGetRentals() {
    try {
        console.log('\n正在測試獲取租屋資料...');
        
        const response = await fetch('http://localhost:3000/api/rentals');
        const rentals = await response.json();
        
        if (response.ok) {
            console.log('✅ 獲取成功！');
            console.log(`共找到 ${rentals.length} 筆資料`);
            
            // 顯示最新的一筆資料（包含地址欄位）
            if (rentals.length > 0) {
                const latest = rentals[0];
                console.log('\n最新資料：');
                console.log('- ID:', latest.id);
                console.log('- 地圖地址:', latest.address);
                console.log('- 詳細地址:', latest.descriptive_address || '未提供');
                console.log('- 描述:', latest.description);
                console.log('- 座標:', `${latest.lat}, ${latest.lng}`);
            }
        } else {
            console.log('❌ 獲取失敗:', rentals);
        }
    } catch (error) {
        console.error('❌ 請求失敗:', error.message);
    }
}

// 執行測試
async function runTests() {
    console.log('🧪 開始測試地址欄位功能...\n');
    
    // 測試新增
    const newId = await testAddRentalWithAddress();
    
    // 等待一下讓資料庫操作完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 測試獲取
    await testGetRentals();
    
    console.log('\n🎉 測試完成！');
}

// 檢查伺服器是否運行
async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000/api/rentals');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// 主程序
async function main() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.log('❌ 伺服器未運行，請先執行: node server.js');
        return;
    }
    
    await runTests();
}

main();