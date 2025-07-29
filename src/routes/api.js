const express = require('express');
const RentalController = require('../controllers/RentalController');
const GeocodingController = require('../controllers/GeocodingController');

const router = express.Router();

// 初始化控制器
const rentalController = new RentalController();
const geocodingController = new GeocodingController();

// Geocoding 路由
router.post('/geocode', (req, res) => geocodingController.geocodeAddress(req, res));

// 租屋資料路由
router.get('/rentals', (req, res) => rentalController.getAllRentals(req, res));
router.post('/rentals', (req, res) => rentalController.createRental(req, res));

// 評分路由
router.post('/ratings', (req, res) => rentalController.addRating(req, res));
router.get('/rentals/:id/ratings', (req, res) => rentalController.getRatingsByRentalId(req, res));

module.exports = router;