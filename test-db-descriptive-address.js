const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 連接到資料庫
const dbPath = path.join(__dirname, 'rental_database.db');
const db = new sqlite3.Database(dbPath);

console.log('🧪 測試資料庫中的地址欄位功能...\n');

// 測試新增資料
function testInsert() {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT INTO rentals (address, descriptive_address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const testData = [
            "台北市信義區信義路五段7號",
            "信義計畫區內，靠近台北101大樓，XX社區A棟15樓",
            25.0330,
            121.5654,
            "測試新增的地址欄位功能。這是一個很棒的租屋經驗！",
            30000,
            "套房",
            20.5,
            "冷氣,洗衣機,網路,電視",
            4,
            5,
            3,
            4.0
        ];
        
        stmt.run(testData, function(err) {
            if (err) {
                reject(err);
            } else {
                console.log('✅ 新增資料成功！ID:', this.lastID);
                resolve(this.lastID);
            }
        });
        
        stmt.finalize();
    });
}

// 測試查詢資料
function testSelect() {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM rentals ORDER BY created_at DESC LIMIT 3", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                console.log('\n✅ 查詢資料成功！');
                console.log(`共找到 ${rows.length} 筆最新資料：\n`);
                
                rows.forEach((row, index) => {
                    console.log(`--- 資料 ${index + 1} ---`);
                    console.log('ID:', row.id);
                    console.log('地圖地址:', row.address);
                    console.log('詳細地址:', row.descriptive_address || '未提供');
                    console.log('描述:', row.description);
                    console.log('座標:', `${row.lat}, ${row.lng}`);
                    console.log('建立時間:', row.created_at);
                    console.log('');
                });
                
                resolve(rows);
            }
        });
    });
}

// 檢查表格結構
function checkTableStructure() {
    return new Promise((resolve, reject) => {
        db.all("PRAGMA table_info(rentals)", (err, columns) => {
            if (err) {
                reject(err);
            } else {
                console.log('📋 資料表結構：');
                columns.forEach(col => {
                    console.log(`- ${col.name}: ${col.type}${col.notnull ? ' (必填)' : ''}`);
                });
                console.log('');
                
                const hasDescriptiveAddress = columns.some(col => col.name === 'descriptive_address');
                if (hasDescriptiveAddress) {
                    console.log('✅ descriptive_address 欄位存在！');
                } else {
                    console.log('❌ descriptive_address 欄位不存在！');
                }
                console.log('');
                
                resolve(hasDescriptiveAddress);
            }
        });
    });
}

// 執行測試
async function runTests() {
    try {
        // 檢查表格結構
        const hasField = await checkTableStructure();
        
        if (!hasField) {
            console.log('❌ 缺少 descriptive_address 欄位，請執行遷移腳本');
            return;
        }
        
        // 測試新增
        await testInsert();
        
        // 測試查詢
        await testSelect();
        
        console.log('🎉 所有測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('關閉資料庫失敗:', err.message);
            } else {
                console.log('資料庫已關閉');
            }
        });
    }
}

runTests();