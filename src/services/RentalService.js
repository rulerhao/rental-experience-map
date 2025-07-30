const Rental = require('../models/Rental');
const Rating = require('../models/Rating');

class RentalService {
    constructor() {
        this.rentalModel = new Rental();
        this.ratingModel = new Rating();
    }

    // 獲取所有租屋資料（支援分頁和排序）
    async getAllRentals(options = {}) {
        try {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = options;
            return await this.rentalModel.getAll({ page, limit, sort, order });
        } catch (error) {
            console.error('獲取租屋資料錯誤:', error);
            throw error;
        }
    }

    // 根據ID獲取單一租屋資料
    async getRentalById(id) {
        try {
            return await this.rentalModel.getById(id);
        } catch (error) {
            console.error('獲取租屋資料錯誤:', error);
            throw error;
        }
    }

    // 創建新租屋資料
    async createRental(rentalData) {
        try {
            // 資料驗證
            this.validateRentalData(rentalData);
            return await this.rentalModel.create(rentalData);
        } catch (error) {
            console.error('新增租屋資料錯誤:', error);
            throw error;
        }
    }

    // 更新租屋資料
    async updateRental(id, rentalData) {
        try {
            // 檢查租屋是否存在
            const existingRental = await this.rentalModel.getById(id);
            if (!existingRental) {
                return null;
            }
            
            // 資料驗證
            this.validateRentalData(rentalData, false);
            return await this.rentalModel.update(id, rentalData);
        } catch (error) {
            console.error('更新租屋資料錯誤:', error);
            throw error;
        }
    }

    // 刪除租屋資料
    async deleteRental(id) {
        try {
            // 檢查租屋是否存在
            const existingRental = await this.rentalModel.getById(id);
            if (!existingRental) {
                return null;
            }
            
            // 先刪除相關的評分
            await this.ratingModel.deleteByRentalId(id);
            
            // 再刪除租屋資料
            return await this.rentalModel.delete(id);
        } catch (error) {
            console.error('刪除租屋資料錯誤:', error);
            throw error;
        }
    }

    // 新增評分
    async addRating(ratingData) {
        try {
            // 資料驗證
            this.validateRatingData(ratingData);
            
            const result = await this.ratingModel.create(ratingData);
            
            // 更新租屋的平均評分
            const updatedRating = await this.rentalModel.updateAverageRating(ratingData.rental_id);
            
            return {
                id: result.id,
                overall_rating: updatedRating
            };
        } catch (error) {
            console.error('新增評分錯誤:', error);
            throw error;
        }
    }

    // 根據租屋ID獲取評分
    async getRatingsByRentalId(rentalId) {
        try {
            return await this.ratingModel.getByRentalId(rentalId);
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }

    // 根據ID獲取單一評分
    async getRatingById(rentalId, ratingId) {
        try {
            return await this.ratingModel.getById(rentalId, ratingId);
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }

    // 更新評分
    async updateRating(rentalId, ratingId, ratingData) {
        try {
            // 檢查評分是否存在
            const existingRating = await this.ratingModel.getById(rentalId, ratingId);
            if (!existingRating) {
                return null;
            }
            
            // 資料驗證
            this.validateRatingData(ratingData, false);
            
            const result = await this.ratingModel.update(ratingId, ratingData);
            
            // 更新租屋的平均評分
            await this.rentalModel.updateAverageRating(rentalId);
            
            return result;
        } catch (error) {
            console.error('更新評分錯誤:', error);
            throw error;
        }
    }

    // 刪除評分
    async deleteRating(rentalId, ratingId) {
        try {
            // 檢查評分是否存在
            const existingRating = await this.ratingModel.getById(rentalId, ratingId);
            if (!existingRating) {
                return null;
            }
            
            const result = await this.ratingModel.delete(ratingId);
            
            // 更新租屋的平均評分
            await this.rentalModel.updateAverageRating(rentalId);
            
            return result;
        } catch (error) {
            console.error('刪除評分錯誤:', error);
            throw error;
        }
    }

    // 驗證租屋資料
    validateRentalData(data, isRequired = true) {
        if (isRequired) {
            if (!data.address || !data.lat || !data.lng) {
                throw new Error('地址、緯度和經度為必填欄位');
            }
        }
        
        if (data.lat && (data.lat < -90 || data.lat > 90)) {
            throw new Error('緯度必須在 -90 到 90 之間');
        }
        
        if (data.lng && (data.lng < -180 || data.lng > 180)) {
            throw new Error('經度必須在 -180 到 180 之間');
        }
        
        if (data.rent_price && data.rent_price < 0) {
            throw new Error('租金不能為負數');
        }
        
        if (data.area_size && data.area_size < 0) {
            throw new Error('面積不能為負數');
        }
    }

    // 驗證評分資料
    validateRatingData(data, isRequired = true) {
        const ratingFields = ['landlord_rating', 'location_rating', 'value_rating'];
        
        if (isRequired) {
            const missingFields = ratingFields.filter(field => !data[field]);
            if (missingFields.length > 0) {
                throw new Error(`缺少必要評分欄位: ${missingFields.join(', ')}`);
            }
        }
        
        ratingFields.forEach(field => {
            if (data[field] && (data[field] < 1 || data[field] > 5)) {
                throw new Error(`${field} 必須在 1 到 5 之間`);
            }
        });
    }
}

module.exports = RentalService;