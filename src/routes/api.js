const express = require('express');
const RentalController = require('../controllers/RentalController');
const GeocodingController = require('../controllers/GeocodingController');

const router = express.Router();

// 初始化控制器
const rentalController = new RentalController();
const geocodingController = new GeocodingController();

// RESTful Geocoding API
router.post('/geocoding', (req, res) => geocodingController.geocodeAddress(req, res));

// RESTful Rentals API
router.route('/rentals')
    .get((req, res) => rentalController.getAllRentals(req, res))     // GET /api/rentals - 獲取所有租屋
    .post((req, res) => rentalController.createRental(req, res));    // POST /api/rentals - 創建租屋

router.route('/rentals/:id')
    .get((req, res) => rentalController.getRentalById(req, res))     // GET /api/rentals/:id - 獲取單一租屋
    .put((req, res) => rentalController.updateRental(req, res))      // PUT /api/rentals/:id - 更新租屋
    .delete((req, res) => rentalController.deleteRental(req, res));  // DELETE /api/rentals/:id - 刪除租屋

// RESTful Ratings API (作為租屋的子資源)
router.route('/rentals/:rentalId/ratings')
    .get((req, res) => rentalController.getRatingsByRentalId(req, res))  // GET /api/rentals/:rentalId/ratings - 獲取租屋評分
    .post((req, res) => rentalController.addRating(req, res));           // POST /api/rentals/:rentalId/ratings - 新增評分

router.route('/rentals/:rentalId/ratings/:ratingId')
    .get((req, res) => rentalController.getRatingById(req, res))         // GET /api/rentals/:rentalId/ratings/:ratingId - 獲取單一評分
    .put((req, res) => rentalController.updateRating(req, res))          // PUT /api/rentals/:rentalId/ratings/:ratingId - 更新評分
    .delete((req, res) => rentalController.deleteRating(req, res));      // DELETE /api/rentals/:rentalId/ratings/:ratingId - 刪除評分

module.exports = router;