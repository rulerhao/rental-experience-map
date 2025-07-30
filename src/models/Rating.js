const dbConfig = require('../config/database');

class Rating {
    constructor() {
        this.db = dbConfig.getConnection();
    }

    // 初始化資料庫表格
    async initializeTable() {
        return new Promise((resolve, reject) => {
            this.db.run(`
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
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (rental_id) REFERENCES rentals (id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // 新增評分
    async create(ratingData) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
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
                else resolve({ id: this.lastID, overall_rating: overall });
            });
            
            stmt.finalize();
        });
    }

    // 根據ID獲取單一評分
    async getById(rentalId, ratingId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                "SELECT * FROM ratings WHERE id = ? AND rental_id = ?", 
                [ratingId, rentalId], 
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }

    // 獲取特定租屋的所有評分
    async getByRentalId(rentalId) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM ratings WHERE rental_id = ? ORDER BY created_at DESC", [rentalId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // 更新評分
    async update(ratingId, ratingData) {
        return new Promise((resolve, reject) => {
            // 構建動態更新語句
            const updateFields = [];
            const values = [];
            
            if (ratingData.user_name !== undefined) {
                updateFields.push('user_name = ?');
                values.push(ratingData.user_name);
            }
            
            if (ratingData.landlord_rating !== undefined) {
                updateFields.push('landlord_rating = ?');
                values.push(ratingData.landlord_rating);
            }
            
            if (ratingData.location_rating !== undefined) {
                updateFields.push('location_rating = ?');
                values.push(ratingData.location_rating);
            }
            
            if (ratingData.value_rating !== undefined) {
                updateFields.push('value_rating = ?');
                values.push(ratingData.value_rating);
            }
            
            if (ratingData.comment !== undefined) {
                updateFields.push('comment = ?');
                values.push(ratingData.comment);
            }
            
            // 如果有評分更新，重新計算overall_rating
            if (ratingData.landlord_rating !== undefined || 
                ratingData.location_rating !== undefined || 
                ratingData.value_rating !== undefined) {
                
                // 先獲取現有資料
                this.db.get("SELECT * FROM ratings WHERE id = ?", [ratingId], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (!row) {
                        resolve(null);
                        return;
                    }
                    
                    // 計算新的overall_rating
                    const landlordRating = ratingData.landlord_rating !== undefined ? ratingData.landlord_rating : row.landlord_rating;
                    const locationRating = ratingData.location_rating !== undefined ? ratingData.location_rating : row.location_rating;
                    const valueRating = ratingData.value_rating !== undefined ? ratingData.value_rating : row.value_rating;
                    
                    const overall = (landlordRating + locationRating + valueRating) / 3;
                    updateFields.push('overall_rating = ?');
                    values.push(overall);
                    
                    updateFields.push('updated_at = CURRENT_TIMESTAMP');
                    values.push(ratingId);
                    
                    const sql = `UPDATE ratings SET ${updateFields.join(', ')} WHERE id = ?`;
                    
                    this.db.run(sql, values, function(err) {
                        if (err) reject(err);
                        else if (this.changes === 0) resolve(null);
                        else resolve({ id: ratingId, overall_rating: overall });
                    });
                });
            } else {
                // 沒有評分更新，直接更新其他欄位
                if (updateFields.length === 0) {
                    resolve({ id: ratingId });
                    return;
                }
                
                updateFields.push('updated_at = CURRENT_TIMESTAMP');
                values.push(ratingId);
                
                const sql = `UPDATE ratings SET ${updateFields.join(', ')} WHERE id = ?`;
                
                this.db.run(sql, values, function(err) {
                    if (err) reject(err);
                    else if (this.changes === 0) resolve(null);
                    else resolve({ id: ratingId });
                });
            }
        });
    }

    // 刪除評分
    async delete(ratingId) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM ratings WHERE id = ?", [ratingId], function(err) {
                if (err) reject(err);
                else if (this.changes === 0) resolve(null);
                else resolve({ id: ratingId });
            });
        });
    }

    // 根據租屋ID刪除所有評分
    async deleteByRentalId(rentalId) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM ratings WHERE rental_id = ?", [rentalId], function(err) {
                if (err) reject(err);
                else resolve({ deletedCount: this.changes });
            });
        });
    }

    // 獲取所有評分
    async getAll() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM ratings ORDER BY created_at DESC", (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = Rating;