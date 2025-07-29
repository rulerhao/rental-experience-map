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

// Nominatim Geocoding API (OpenStreetMap)
app.post('/api/geocode', async (req, res) => {
    const { address } = req.body;
    
    try {
        // 使用 Nominatim API 進行地理編碼
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'RentalExperienceMap/1.0' // Nominatim 要求提供 User-Agent
                }
            }
        );
        const data = await response.json();
        
        // 轉換為類似 Google Maps API 的格式
        if (data && data.length > 0) {
            const result = data[0];
            const formattedResponse = {
                status: 'OK',
                results: [{
                    formatted_address: result.display_name,
                    geometry: {
                        location: {
                            lat: parseFloat(result.lat),
                            lng: parseFloat(result.lon)
                        }
                    }
                }]
            };
            res.json(formattedResponse);
        } else {
            res.json({
                status: 'ZERO_RESULTS',
                results: []
            });
        }
    } catch (error) {
        console.error('Geocoding 錯誤:', error);
        res.status(500).json({ 
            status: 'ERROR',
            error: 'Geocoding failed' 
        });
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