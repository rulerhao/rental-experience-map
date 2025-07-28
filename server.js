// 簡單的 Node.js Express 伺服器作為 Google Maps API 代理
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// 提供主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`伺服器運行在 http://localhost:${PORT}`);
});