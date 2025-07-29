const RentalService = require('../services/RentalService');

class RentalController {
    constructor() {
        this.rentalService = new RentalService();
    }

    async getAllRentals(req, res) {
        try {
            const rentals = await this.rentalService.getAllRentals();
            res.json(rentals);
        } catch (error) {
            res.status(500).json({ error: '獲取資料失敗' });
        }
    }

    async createRental(req, res) {
        try {
            const result = await this.rentalService.createRental(req.body);
            res.json({ success: true, id: result.id, overall_rating: result.overall_rating });
        } catch (error) {
            res.status(500).json({ error: '新增資料失敗' });
        }
    }

    async addRating(req, res) {
        try {
            const result = await this.rentalService.addRating(req.body);
            res.json({ success: true, id: result.id, overall_rating: result.overall_rating });
        } catch (error) {
            res.status(500).json({ error: '新增評分失敗' });
        }
    }

    async getRatingsByRentalId(req, res) {
        try {
            const ratings = await this.rentalService.getRatingsByRentalId(req.params.id);
            res.json(ratings);
        } catch (error) {
            res.status(500).json({ error: '獲取評分失敗' });
        }
    }
}

module.exports = RentalController;