// Node.js Express 伺服器 - 租屋經驗分享地圖
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./src/routes/api');
const DatabaseInitializer = require('./src/services/DatabaseInitializer');

const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API 路由
app.use('/api', apiRoutes);

// 提供主頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 初始化資料庫並啟動伺服器
const dbInitializer = new DatabaseInitializer();

dbInitializer.initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`伺服器運行在 http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('應用程式啟動失敗:', error);
    process.exit(1);
});