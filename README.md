# 租屋經驗分享地圖

一個讓使用者分享租屋經驗的互動式地圖應用程式，使用 Google Maps API 顯示租屋位置和相關資訊。

## 功能特色

- 🗺️ Google Maps 整合顯示租屋位置
- 📝 租屋經驗分享和瀏覽
- 🔍 互動式地圖標記和資訊窗口
- ➕ 新增租屋經驗功能
- 🔐 安全的 API key 管理

## 技術架構

- **前端**: HTML, CSS, JavaScript
- **後端**: Node.js, Express
- **地圖服務**: Google Maps API
- **資料**: 模擬資料庫 (可擴展為真實資料庫)

## 安裝和使用

### 1. 克隆專案
```bash
git clone https://github.com/你的用戶名/rental-experience-map.git
cd rental-experience-map
```

### 2. 安裝依賴
```bash
npm install
```

### 3. 設定環境變數
建立 `.env` 檔案並添加你的 Google Maps API key：
```
GOOGLE_MAPS_API_KEY=你的_API_金鑰
PORT=3000
```

### 4. 啟動應用程式
```bash
npm start
```

### 5. 開啟瀏覽器
前往 `http://localhost:3000`

## Google Maps API 設定

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案或選擇現有專案
3. 啟用以下 API：
   - Maps JavaScript API
   - Geocoding API
4. 建立 API 金鑰
5. 設定 API 金鑰限制：
   - 應用程式限制：HTTP 參照網址
   - 網站限制：`localhost:3000`, `你的網域.com/*`

## 專案結構

```
rental-experience-map/
├── index.html          # 主要 HTML 檔案
├── script.js           # 前端 JavaScript
├── server.js           # Express 伺服器
├── package.json        # Node.js 依賴設定
├── .env               # 環境變數 (不包含在版本控制中)
├── .gitignore         # Git 忽略檔案
└── README.md          # 專案說明
```

## 安全性

- API key 透過後端代理保護，不暴露在前端
- 使用環境變數管理敏感資訊
- 建議在 Google Cloud Console 設定 API 使用限制

## 未來擴展

- [ ] 真實資料庫整合 (MongoDB/PostgreSQL)
- [ ] 使用者註冊和登入系統
- [ ] 租屋評分和評論系統
- [ ] 照片上傳功能
- [ ] 進階篩選和搜尋
- [ ] 響應式設計優化

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 授權

MIT License