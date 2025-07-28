// Node.js Express 伺服器 - 租屋經驗分享地圖
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase, dbOperations } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Google Maps API 代理端點
app.get('/api/maps-config', (req, res) => {
    // 只返回必要的配置，不暴露完整的 API key
    res.json({
        mapsApiUrl: `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=places`
    });
});

// Geocoding API 代理
app.post('/api/geocode', async (req, res) => {
    const { address } = req.body;
    
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Geocoding failed' });
    }
});

// 租屋資料 API 端點
app.get('/api/rentals', async (req, res) => {
    try {
        const rentals = await dbOperations.getAllRentals();
        res.json(rentals);
    } catch (error) {
        console.error('獲取租屋資料錯誤:', error);
        res.status(500).json({ error: '獲取資料失敗' });
    }
});

// 新增租屋資料
app.post('/api/rentals', async (req, res) => {
    try {
        const result = await dbOperations.addRental(req.body);
        res.json({ success: true, id: result.id, overall_rating: result.overall_rating });
    } catch (error) {
        console.error('新增租屋資料錯誤:', error);
        res.status(500).json({ error: '新增資料失敗' });
    }
});

// 新增評分
app.post('/api/ratings', async (req, res) => {
    try {
        const result = await dbOperations.addRating(req.body);
        res.json({ success: true, id: result.id, overall_rating: result.overall_rating });
    } catch (error) {
        console.error('新增評分錯誤:', error);
        res.status(500).json({ error: '新增評分失敗' });
    }
});

// 獲取特定租屋的評分
app.get('/api/rentals/:id/ratings', async (req, res) => {
    try {
        const ratings = await dbOperations.getRatingsByRentalId(req.params.id);
        res.json(ratings);
    } catch (error) {
        console.error('獲取評分資料錯誤:', error);
        res.status(500).json({ error: '獲取評分失敗' });
    }
});

// 提供主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 初始化資料庫並啟動伺服器
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`伺服器運行在 http://localhost:${PORT}`);
        console.log('資料庫已初始化完成');
    });
}).catch(error => {
    console.error('資料庫初始化失敗:', error);
    process.exit(1);
});