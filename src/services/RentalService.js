const Rental = require('../models/Rental');
const Rating = require('../models/Rating');

class RentalService {
    constructor() {
        this.rentalModel = new Rental();
        this.ratingModel = new Rating();
    }

    async getAllRentals() {
        try {
            return await this.rentalModel.getAll();
        } catch (error) {
            console.error('獲取租屋資料錯誤:', error);
            throw error;
        }
    }

    async createRental(rentalData) {
        try {
            return await this.rentalModel.create(rentalData);
        } catch (error) {
            console.error('新增租屋資料錯誤:', error);
            throw error;
        }
    }

    async addRating(ratingData) {
        try {
            const result = await this.ratingModel.create(ratingData);
            
            // 更新租屋的平均評分
            await this.rentalModel.updateAverageRating(ratingData.rental_id);
            
            return result;
        } catch (error) {
            console.error('新增評分錯誤:', error);
            throw error;
        }
    }

    async getRatingsByRentalId(rentalId) {
        try {
            return await this.ratingModel.getByRentalId(rentalId);
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }
}

module.exports = RentalService;