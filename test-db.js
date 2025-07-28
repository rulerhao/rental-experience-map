// 測試資料庫功能
const { initializeDatabase, dbOperations } = require('./database');

async function testDatabase() {
    try {
        console.log('🔄 初始化資料庫...');
        await initializeDatabase();
        console.log('✅ 資料庫初始化成功');

        console.log('\n🔄 測試獲取所有租屋資料...');
        const rentals = await dbOperations.getAllRentals();
        console.log(`✅ 找到 ${rentals.length} 筆租屋資料`);
        
        if (rentals.length > 0) {
            console.log('📋 第一筆資料範例:');
            console.log(`   地址: ${rentals[0].address}`);
            console.log(`   評分: ${rentals[0].overall_rating}/5`);
            console.log(`   租金: NT$${rentals[0].rent_price?.toLocaleString() || '未提供'}`);
        }

        console.log('\n🔄 測試新增評分...');
        if (rentals.length > 0) {
            const testRating = {
                rental_id: rentals[0].id,
                user_name: '測試用戶',
                landlord_rating: 4,
                location_rating: 5,
                value_rating: 3,
                comment: '這是一個測試評分'
            };
            
            const result = await dbOperations.addRating(testRating);
            console.log(`✅ 評分新增成功，ID: ${result.id}, 總評分: ${result.overall_rating.toFixed(1)}`);
            
            // 獲取該租屋的所有評分
            const ratings = await dbOperations.getRatingsByRentalId(rentals[0].id);
            console.log(`✅ 該租屋共有 ${ratings.length} 個評分`);
        }

        console.log('\n🎉 所有測試通過！');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
        process.exit(1);
    }
}

testDatabase();