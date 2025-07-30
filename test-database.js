const Rental = require('./src/models/Rental');

async function testDatabase() {
    console.log('=== 測試資料庫操作 ===\n');
    
    try {
        // 創建Rental實例
        console.log('1. 創建Rental模型實例...');
        const rental = new Rental();
        
        // 初始化資料庫
        console.log('2. 初始化資料庫...');
        await rental.initializeTable();
        console.log('✅ 資料庫初始化成功');
        
        // 測試創建租屋資料
        console.log('\n3. 測試創建租屋資料...');
        const testData = {
            address: '測試地址',
            lat: 25.0265152,
            lng: 121.534395,
            description: '測試描述',
            rent_price: 15000,
            room_type: '套房',
            area_size: 10,
            facilities: '冷氣,網路',
            landlord_rating: 4,
            location_rating: 5,
            value_rating: 3
        };
        
        console.log('準備創建的資料:', JSON.stringify(testData, null, 2));
        
        const result = await rental.create(testData);
        console.log('✅ 創建成功！');
        console.log('結果:', JSON.stringify(result, null, 2));
        
        // 測試獲取資料
        console.log('\n4. 測試獲取資料...');
        const allRentals = await rental.getAll();
        console.log('✅ 獲取成功！');
        console.log('總數:', allRentals.length);
        console.log('最新資料:', JSON.stringify(allRentals[allRentals.length - 1], null, 2));
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        console.error('錯誤堆疊:', error.stack);
    }
}

testDatabase();