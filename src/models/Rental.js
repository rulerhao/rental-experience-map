const dbConfig = require('../config/database');

class Rental {
    constructor() {
        this.db = dbConfig.getConnection();
    }

    // 初始化資料庫表格
    async initializeTable() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run(`
                    CREATE TABLE IF NOT EXISTS rentals (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        address TEXT NOT NULL,
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
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    // 獲取所有租屋資料
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM rentals ORDER BY created_at DESC", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // 新增租屋資料
    async create(rentalData) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO rentals (address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const overall = (rentalData.landlord_rating + rentalData.location_rating + rentalData.value_rating) / 3;
            
            stmt.run([
                rentalData.address, rentalData.lat, rentalData.lng, rentalData.description,
                rentalData.rent_price, rentalData.room_type, rentalData.area_size, rentalData.facilities,
                rentalData.landlord_rating, rentalData.location_rating, rentalData.value_rating, overall
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, overall_rating: overall });
            });
            
            stmt.finalize();
        });
    }

    // 更新租屋平均評分
    async updateAverageRating(rentalId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT 
                    AVG(landlord_rating) as avg_landlord,
                    AVG(location_rating) as avg_location,
                    AVG(value_rating) as avg_value,
                    AVG(overall_rating) as avg_overall
                FROM ratings WHERE rental_id = ?
            `, [rentalId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row) {
                    this.db.run(`
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
                    ], (updateErr) => {
                        if (updateErr) reject(updateErr);
                        else resolve(row.avg_overall);
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    // 插入示例資料
    async insertSampleData() {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT COUNT(*) as count FROM rentals", (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                if (row.count === 0) {
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

                    const stmt = this.db.prepare(`
                        INSERT INTO rentals (address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `);
                    
                    sampleData.forEach(data => {
                        stmt.run([
                            data.address, data.lat, data.lng, data.description,
                            data.rent_price, data.room_type, data.area_size, data.facilities,
                            data.landlord_rating, data.location_rating, data.value_rating, data.overall_rating
                        ]);
                    });
                    
                    stmt.finalize();
                }
                
                resolve();
            });
        });
    }
}

module.exports = Rental;