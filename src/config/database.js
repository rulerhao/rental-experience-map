const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseConfig {
    constructor() {
        this.dbPath = path.join(__dirname, '../../rental_database.db');
        this.db = new sqlite3.Database(this.dbPath);
    }

    getConnection() {
        return this.db;
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

module.exports = new DatabaseConfig();