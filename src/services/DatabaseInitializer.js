const Rental = require('../models/Rental');
const Rating = require('../models/Rating');

class DatabaseInitializer {
    constructor() {
        this.rentalModel = new Rental();
        this.ratingModel = new Rating();
    }

    async initialize() {
        try {
            console.log('正在初始化資料庫...');
            
            // 初始化表格
            await this.rentalModel.initializeTable();
            await this.ratingModel.initializeTable();
            
            // 插入示例資料
            await this.rentalModel.insertSampleData();
            
            console.log('資料庫初始化完成');
        } catch (error) {
            console.error('資料庫初始化失敗:', error);
            throw error;
        }
    }
}

module.exports = DatabaseInitializer;