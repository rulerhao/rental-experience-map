const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 創建或連接到資料庫
const dbPath = path.join(__dirname, 'rental_database.db');
const db = new sqlite3.Database(dbPath);

// 初始化資料庫表格
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 創建房屋資訊表
            db.run(`
                CREATE TABLE IF NOT EXISTS rentals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    address TEXT NOT NULL,
                    descriptive_address TEXT,
                    lat REAL NOT NULL,
                    lng REAL NOT NULL,
                    description TEXT,
                    rent_price INTEGER,
                    room_type TEXT,
                    area_size REAL,
                    facilities TEXT,
                    landlord_rating INTEGER CHECK(landlord_rating >= 1 AND landlord_rating <= 5),
                    location_rating INTEGER CHECK(location_rating >= 1 AND location_rating <= 5),
                    value_rating INTEGER CHECK(value_rating >= 1 AND value_rating <= 5),
                    overall_rating REAL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 創建評分詳細表（可以讓多個用戶對同一房屋評分）
            db.run(`
                CREATE TABLE IF NOT EXISTS ratings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rental_id INTEGER NOT NULL,
                    user_name TEXT,
                    landlord_rating INTEGER CHECK(landlord_rating >= 1 AND landlord_rating <= 5),
                    location_rating INTEGER CHECK(location_rating >= 1 AND location_rating <= 5),
                    value_rating INTEGER CHECK(value_rating >= 1 AND value_rating <= 5),
                    overall_rating REAL,
                    comment TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (rental_id) REFERENCES rentals (id)
                )
            `);

            // 插入一些示例資料
            const sampleData = [
                {
                    address: "台北市信義區信義路五段7號",
                    lat: 25.0330,
                    lng: 121.5654,
                    description: "交通便利，近101大樓。房東人很好，但房租偏高。周邊生活機能完善，有很多餐廳和便利商店。",
                    rent_price: 25000,
                    room_type: "套房",
                    area_size: 15.5,
                    facilities: "冷氣,洗衣機,網路,電視",
                    landlord_rating: 4,
                    location_rating: 5,
                    value_rating: 3,
                    overall_rating: 4.0
                },
                {
                    address: "台北市中山區南京東路二段100號",
                    lat: 25.0478,
                    lng: 121.5170,
                    description: "老公寓但維護良好，房東會定期修繕。附近有捷運站，上班很方便。唯一缺點是隔音稍差。",
                    rent_price: 18000,
                    room_type: "雅房",
                    area_size: 12.0,
                    facilities: "冷氣,網路,共用洗衣機",
                    landlord_rating: 5,
                    location_rating: 4,
                    value_rating: 4,
                    overall_rating: 4.3
                }
            ];

            // 檢查是否已有資料，沒有則插入示例資料
            db.get("SELECT COUNT(*) as count FROM rentals", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row.count === 0) {
                    const stmt = db.prepare(`
                        INSERT INTO rentals (address, descriptive_address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    
                    sampleData.forEach(data => {
                        stmt.run([
                            data.address, data.descriptive_address || null, data.lat, data.lng, data.description,
                            data.rent_price, data.room_type, data.area_size, data.facilities,
                            data.landlord_rating, data.location_rating, data.value_rating, data.overall_rating
                        ]);
                    });
                    
                    stmt.finalize();
                }
                
                resolve();
            });
        });
    });
}

// 資料庫操作函數
const dbOperations = {
    // 獲取所有租屋資料
    getAllRentals: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM rentals ORDER BY created_at DESC", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // 新增租屋資料
    addRental: (rentalData) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO rentals (address, descriptive_address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const overall = (rentalData.landlord_rating + rentalData.location_rating + rentalData.value_rating) / 3;
            
            stmt.run([
                rentalData.address, rentalData.descriptive_address || null, rentalData.lat, rentalData.lng, rentalData.description,
                rentalData.rent_price, rentalData.room_type, rentalData.area_size, rentalData.facilities,
                rentalData.landlord_rating, rentalData.location_rating, rentalData.value_rating, overall
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, overall_rating: overall });
            });
            
            stmt.finalize();
        });
    },

    // 新增評分
    addRating: (ratingData) => {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO ratings (rental_id, user_name, landlord_rating, location_rating, value_rating, overall_rating, comment)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            const overall = (ratingData.landlord_rating + ratingData.location_rating + ratingData.value_rating) / 3;
            
            stmt.run([
                ratingData.rental_id, ratingData.user_name,
                ratingData.landlord_rating, ratingData.location_rating, ratingData.value_rating,
                overall, ratingData.comment
            ], function(err) {
                if (err) reject(err);
                else {
                    // 更新租屋的平均評分
                    updateRentalAverageRating(ratingData.rental_id);
                    resolve({ id: this.lastID, overall_rating: overall });
                }
            });
            
            stmt.finalize();
        });
    },

    // 獲取特定租屋的所有評分
    getRatingsByRentalId: (rentalId) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM ratings WHERE rental_id = ? ORDER BY created_at DESC", [rentalId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// 更新租屋平均評分
function updateRentalAverageRating(rentalId) {
    db.get(`
        SELECT 
            AVG(landlord_rating) as avg_landlord,
            AVG(location_rating) as avg_location,
            AVG(value_rating) as avg_value,
            AVG(overall_rating) as avg_overall
        FROM ratings WHERE rental_id = ?
    `, [rentalId], (err, row) => {
        if (!err && row) {
            db.run(`
                UPDATE rentals SET 
                    landlord_rating = ?,
                    location_rating = ?,
                    value_rating = ?,
                    overall_rating = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [
                Math.round(row.avg_landlord),
                Math.round(row.avg_location), 
                Math.round(row.avg_value),
                row.avg_overall,
                rentalId
            ]);
        }
    });
}

module.exports = {
    db,
    initializeDatabase,
    dbOperations
};