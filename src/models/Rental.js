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
                `, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    // 獲取所有租屋資料（支援分頁和排序）
    async getAll(options = {}) {
        return new Promise((resolve, reject) => {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = options;
            const offset = (page - 1) * limit;
            
            // 驗證排序欄位
            const allowedSortFields = ['created_at', 'updated_at', 'rent_price', 'overall_rating', 'address'];
            const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
            const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
            
            const sql = `SELECT * FROM rentals ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
            
            this.db.all(sql, [limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // 根據ID獲取單一租屋資料
    async getById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM rentals WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // 新增租屋資料
    async create(rentalData) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO rentals (address, descriptive_address, lat, lng, description, rent_price, room_type, area_size, facilities, landlord_rating, location_rating, value_rating, overall_rating)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            // 如果有評分資料，計算平均分；否則設為null
            let overall = null;
            if (rentalData.landlord_rating && rentalData.location_rating && rentalData.value_rating) {
                overall = (rentalData.landlord_rating + rentalData.location_rating + rentalData.value_rating) / 3;
            }
            
            stmt.run([
                rentalData.address, rentalData.descriptive_address || null, rentalData.lat, rentalData.lng, rentalData.description,
                rentalData.rent_price, rentalData.room_type, rentalData.area_size, rentalData.facilities,
                rentalData.landlord_rating || null, rentalData.location_rating || null, 
                rentalData.value_rating || null, overall
            ], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, overall_rating: overall });
            });
            
            stmt.finalize();
        });
    }

    // 更新租屋資料
    async update(id, rentalData) {
        return new Promise((resolve, reject) => {
            // 構建動態更新語句
            const updateFields = [];
            const values = [];
            
            if (rentalData.address !== undefined) {
                updateFields.push('address = ?');
                values.push(rentalData.address);
            }
            
            if (rentalData.descriptive_address !== undefined) {
                updateFields.push('descriptive_address = ?');
                values.push(rentalData.descriptive_address);
            }
            
            if (rentalData.lat !== undefined) {
                updateFields.push('lat = ?');
                values.push(rentalData.lat);
            }
            
            if (rentalData.lng !== undefined) {
                updateFields.push('lng = ?');
                values.push(rentalData.lng);
            }
            
            if (rentalData.description !== undefined) {
                updateFields.push('description = ?');
                values.push(rentalData.description);
            }
            
            if (rentalData.rent_price !== undefined) {
                updateFields.push('rent_price = ?');
                values.push(rentalData.rent_price);
            }
            
            if (rentalData.room_type !== undefined) {
                updateFields.push('room_type = ?');
                values.push(rentalData.room_type);
            }
            
            if (rentalData.area_size !== undefined) {
                updateFields.push('area_size = ?');
                values.push(rentalData.area_size);
            }
            
            if (rentalData.facilities !== undefined) {
                updateFields.push('facilities = ?');
                values.push(rentalData.facilities);
            }
            
            if (updateFields.length === 0) {
                resolve({ id: id });
                return;
            }
            
            updateFields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            
            const sql = `UPDATE rentals SET ${updateFields.join(', ')} WHERE id = ?`;
            
            this.db.run(sql, values, function(err) {
                if (err) reject(err);
                else if (this.changes === 0) resolve(null);
                else resolve({ id: id });
            });
        });
    }

    // 刪除租屋資料
    async delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM rentals WHERE id = ?", [id], function(err) {
                if (err) reject(err);
                else if (this.changes === 0) resolve(null);
                else resolve({ id: id });
            });
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