# 租屋經驗分享地圖

這是一個基於 Google Maps API 的租屋經驗分享平台，讓用戶可以在地圖上標記和分享他們的租屋經驗，並提供評分功能。

## 功能特色

- 🗺️ 互動式地圖界面
- 📍 地址自動定位
- 💬 租屋經驗分享
- ⭐ 多維度評分系統（房東、地點、性價比）
- 🏠 詳細房屋資訊（租金、房型、坪數、設施）
- 💾 SQLite 資料庫儲存
- 🔍 地點搜尋功能
- 📱 響應式設計

## 技術棧

- **前端**: HTML5, CSS3, JavaScript
- **後端**: Node.js, Express.js
- **資料庫**: SQLite3
- **地圖服務**: Google Maps API
- **其他**: CORS, dotenv

## 資料庫結構

### rentals 表格
- `id`: 主鍵
- `address`: 地址
- `lat`, `lng`: 經緯度
- `description`: 租屋經驗描述
- `rent_price`: 租金
- `room_type`: 房型
- `area_size`: 坪數
- `facilities`: 設施
- `landlord_rating`: 房東評分 (1-5)
- `location_rating`: 地點評分 (1-5)
- `value_rating`: 性價比評分 (1-5)
- `overall_rating`: 總體評分
- `created_at`, `updated_at`: 時間戳記

### ratings 表格
- `id`: 主鍵
- `rental_id`: 關聯租屋ID
- `user_name`: 評分用戶名稱
- `landlord_rating`: 房東評分 (1-5)
- `location_rating`: 地點評分 (1-5)
- `value_rating`: 性價比評分 (1-5)
- `overall_rating`: 總體評分
- `comment`: 評論
- `created_at`: 時間戳記

## API 端點

- `GET /api/rentals` - 獲取所有租屋資料
- `POST /api/rentals` - 新增租屋資料
- `POST /api/ratings` - 新增評分
- `GET /api/rentals/:id/ratings` - 獲取特定租屋的所有評分
- `POST /api/geocode` - 地址轉換為經緯度

## 安裝與設置

1. 克隆專案
```bash
git clone [repository-url]
cd rental-experience-map
```

2. 安裝依賴
```bash
npm install
```

3. 設置環境變數
創建 `.env` 文件並添加你的 Google Maps API Key:
```
GOOGLE_MAPS_API_KEY=your_api_key_here
PORT=3000
```

4. 啟動應用程式
```bash
npm start
```

5. 開啟瀏覽器訪問 `http://localhost:3000`

## 使用方法

### 新增租屋經驗
1. 點擊「新增租屋經驗」按鈕
2. 依序輸入：
   - 地址
   - 租屋經驗描述
   - 租金（可選）
   - 房型（可選）
   - 坪數（可選）
   - 設施（可選）
   - 房東評分 (1-5)
   - 地點評分 (1-5)
   - 性價比評分 (1-5)
3. 系統會自動在地圖上標記該位置並儲存到資料庫

### 新增評分
1. 在租屋項目上點擊「新增評分」按鈕
2. 輸入姓名（可選）
3. 分別對房東、地點、性價比進行評分 (1-5)
4. 輸入評論（可選）
5. 系統會更新該租屋的平均評分

### 查看資訊
- 點擊地圖標記或側邊欄項目查看詳細資訊
- 評分以星星形式顯示
- 可查看租金、房型、坪數等詳細資訊

## 開發模式

使用 nodemon 進行開發：
```bash
npm run dev
```

## 注意事項

- 需要有效的 Google Maps API Key
- API Key 需要啟用 Maps JavaScript API 和 Geocoding API
- 建議設置 API Key 的使用限制以確保安全
- 資料庫文件 `rental_database.db` 會自動創建
- 首次運行會自動初始化資料庫並插入示例資料

## 貢獻

歡迎提交 Pull Request 或開啟 Issue 來改善這個專案。

## 授權

MIT License