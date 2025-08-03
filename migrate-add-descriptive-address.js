const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 創建或連接到資料庫
const dbPath = path.join(__dirname, 'rental_database.db');
const db = new sqlite3.Database(dbPath);

console.log('開始遷移：新增 descriptive_address 欄位...');

// 檢查欄位是否已存在
db.get("PRAGMA table_info(rentals)", (err, row) => {
    if (err) {
        console.error('檢查表格結構失敗:', err);
        return;
    }

    // 檢查是否已有 descriptive_address 欄位
    db.all("PRAGMA table_info(rentals)", (err, columns) => {
        if (err) {
            console.error('獲取表格資訊失敗:', err);
            return;
        }

        const hasDescriptiveAddress = columns.some(col => col.name === 'descriptive_address');
        
        if (hasDescriptiveAddress) {
            console.log('descriptive_address 欄位已存在，無需遷移。');
            db.close();
            return;
        }

        // 新增 descriptive_address 欄位
        db.run("ALTER TABLE rentals ADD COLUMN descriptive_address TEXT", (err) => {
            if (err) {
                console.error('新增欄位失敗:', err);
            } else {
                console.log('成功新增 descriptive_address 欄位！');
            }
            
            db.close((closeErr) => {
                if (closeErr) {
                    console.error('關閉資料庫失敗:', closeErr);
                } else {
                    console.log('遷移完成，資料庫已關閉。');
                }
            });
        });
    });
});