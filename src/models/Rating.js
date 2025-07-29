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

    // 獲取特定租屋的所有評分
    async getByRentalId(rentalId) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM ratings WHERE rental_id = ? ORDER BY created_at DESC", [rentalId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = Rating;