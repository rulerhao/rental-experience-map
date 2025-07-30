const RentalService = require('../services/RentalService');

class RentalController {
    constructor() {
        this.rentalService = new RentalService();
    }

    // GET /api/rentals - 獲取所有租屋資料
    async getAllRentals(req, res) {
        try {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = req.query;
            const rentals = await this.rentalService.getAllRentals({ page, limit, sort, order });
            
            res.status(200).json({
                success: true,
                data: rentals,
                message: '成功獲取租屋資料'
            });
        } catch (error) {
            console.error('獲取租屋資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '獲取租屋資料失敗'
            });
        }
    }

    // GET /api/rentals/:id - 獲取單一租屋資料
    async getRentalById(req, res) {
        try {
            const { id } = req.params;
            const rental = await this.rentalService.getRentalById(id);
            
            if (!rental) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的租屋資料'
                });
            }
            
            res.status(200).json({
                success: true,
                data: rental,
                message: '成功獲取租屋資料'
            });
        } catch (error) {
            console.error('獲取租屋資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '獲取租屋資料失敗'
            });
        }
    }

    // POST /api/rentals - 創建新租屋資料
    async createRental(req, res) {
        try {
            // 驗證必要欄位
            const requiredFields = ['address', 'lat', 'lng'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: '請求參數錯誤',
                    message: `缺少必要欄位: ${missingFields.join(', ')}`
                });
            }
            
            const result = await this.rentalService.createRental(req.body);
            
            res.status(201).json({
                success: true,
                data: {
                    id: result.id,
                    overall_rating: result.overall_rating
                },
                message: '成功創建租屋資料'
            });
        } catch (error) {
            console.error('創建租屋資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '創建租屋資料失敗'
            });
        }
    }

    // PUT /api/rentals/:id - 更新租屋資料
    async updateRental(req, res) {
        try {
            const { id } = req.params;
            const result = await this.rentalService.updateRental(id, req.body);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的租屋資料'
                });
            }
            
            res.status(200).json({
                success: true,
                data: result,
                message: '成功更新租屋資料'
            });
        } catch (error) {
            console.error('更新租屋資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '更新租屋資料失敗'
            });
        }
    }

    // DELETE /api/rentals/:id - 刪除租屋資料
    async deleteRental(req, res) {
        try {
            const { id } = req.params;
            const result = await this.rentalService.deleteRental(id);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的租屋資料'
                });
            }
            
            res.status(200).json({
                success: true,
                message: '成功刪除租屋資料'
            });
        } catch (error) {
            console.error('刪除租屋資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '刪除租屋資料失敗'
            });
        }
    }

    // GET /api/rentals/:rentalId/ratings - 獲取租屋評分
    async getRatingsByRentalId(req, res) {
        try {
            const { rentalId } = req.params;
            const ratings = await this.rentalService.getRatingsByRentalId(rentalId);
            
            res.status(200).json({
                success: true,
                data: ratings,
                message: '成功獲取評分資料'
            });
        } catch (error) {
            console.error('獲取評分資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '獲取評分資料失敗'
            });
        }
    }

    // POST /api/rentals/:rentalId/ratings - 新增評分
    async addRating(req, res) {
        try {
            const { rentalId } = req.params;
            const ratingData = { ...req.body, rental_id: rentalId };
            
            // 驗證必要欄位
            const requiredFields = ['landlord_rating', 'location_rating', 'value_rating'];
            const missingFields = requiredFields.filter(field => !ratingData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: '請求參數錯誤',
                    message: `缺少必要欄位: ${missingFields.join(', ')}`
                });
            }
            
            const result = await this.rentalService.addRating(ratingData);
            
            res.status(201).json({
                success: true,
                data: {
                    id: result.id,
                    overall_rating: result.overall_rating
                },
                message: '成功新增評分'
            });
        } catch (error) {
            console.error('新增評分失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '新增評分失敗'
            });
        }
    }

    // GET /api/rentals/:rentalId/ratings/:ratingId - 獲取單一評分
    async getRatingById(req, res) {
        try {
            const { rentalId, ratingId } = req.params;
            const rating = await this.rentalService.getRatingById(rentalId, ratingId);
            
            if (!rating) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的評分資料'
                });
            }
            
            res.status(200).json({
                success: true,
                data: rating,
                message: '成功獲取評分資料'
            });
        } catch (error) {
            console.error('獲取評分資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '獲取評分資料失敗'
            });
        }
    }

    // PUT /api/rentals/:rentalId/ratings/:ratingId - 更新評分
    async updateRating(req, res) {
        try {
            const { rentalId, ratingId } = req.params;
            const result = await this.rentalService.updateRating(rentalId, ratingId, req.body);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的評分資料'
                });
            }
            
            res.status(200).json({
                success: true,
                data: result,
                message: '成功更新評分資料'
            });
        } catch (error) {
            console.error('更新評分資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '更新評分資料失敗'
            });
        }
    }

    // DELETE /api/rentals/:rentalId/ratings/:ratingId - 刪除評分
    async deleteRating(req, res) {
        try {
            const { rentalId, ratingId } = req.params;
            const result = await this.rentalService.deleteRating(rentalId, ratingId);
            
            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: '資源不存在',
                    message: '找不到指定的評分資料'
                });
            }
            
            res.status(200).json({
                success: true,
                message: '成功刪除評分資料'
            });
        } catch (error) {
            console.error('刪除評分資料失敗:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '刪除評分資料失敗'
            });
        }
    }
}

module.exports = RentalController;