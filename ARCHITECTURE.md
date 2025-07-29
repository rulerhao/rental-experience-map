# 租屋經驗分享地圖 - 模組化架構說明

## 專案結構

```
rental-experience-map/
├── src/                          # 源碼目錄
│   ├── config/                   # 配置檔案
│   │   └── database.js          # 資料庫配置
│   ├── models/                   # 資料模型
│   │   ├── Rental.js            # 租屋資料模型
│   │   └── Rating.js            # 評分資料模型
│   ├── services/                 # 業務邏輯服務
│   │   ├── DatabaseInitializer.js # 資料庫初始化服務
│   │   ├── GeocodingService.js   # 地理編碼服務
│   │   └── RentalService.js      # 租屋業務邏輯服務
│   ├── controllers/              # 控制器
│   │   ├── GeocodingController.js # 地理編碼控制器
│   │   └── RentalController.js   # 租屋控制器
│   ├── routes/                   # 路由定義
│   │   └── api.js               # API 路由
│   └── client/                   # 前端模組
│       └── js/                   # JavaScript 模組
│           ├── ApiService.js     # API 服務
│           ├── MapManager.js     # 地圖管理
│           ├── RentalListManager.js # 租屋列表管理
│           └── RentalApp.js      # 主應用程式
├── server.js                     # 主伺服器檔案
├── script.js                     # 前端入口檔案
├── index.html                    # 主頁面
├── database.js                   # 舊版資料庫檔案（可刪除）
└── package.json                  # 專案配置
```

## 模組化架構優點

### 後端架構 (MVC 模式)

1. **Models (模型層)**
   - `Rental.js`: 處理租屋資料的 CRUD 操作
   - `Rating.js`: 處理評分資料的 CRUD 操作
   - 每個模型負責自己的資料庫操作邏輯

2. **Services (服務層)**
   - `RentalService.js`: 整合租屋和評分的業務邏輯
   - `GeocodingService.js`: 處理地址轉換為座標的服務
   - `DatabaseInitializer.js`: 負責資料庫初始化

3. **Controllers (控制器層)**
   - `RentalController.js`: 處理租屋相關的 HTTP 請求
   - `GeocodingController.js`: 處理地理編碼的 HTTP 請求
   - 控制器只負責處理請求和回應，業務邏輯委託給服務層

4. **Routes (路由層)**
   - `api.js`: 統一管理所有 API 路由
   - 清晰的路由結構，易於維護

5. **Config (配置層)**
   - `database.js`: 資料庫連接配置
   - 集中管理配置，便於環境切換

### 前端架構 (模組化設計)

1. **ApiService.js**
   - 統一管理所有 API 呼叫
   - 提供一致的錯誤處理
   - 易於測試和維護

2. **MapManager.js**
   - 專門處理地圖相關功能
   - 標記管理、地圖操作
   - 與其他模組解耦

3. **RentalListManager.js**
   - 管理租屋列表的顯示和互動
   - 處理列表項目的創建和事件

4. **RentalApp.js**
   - 主應用程式類別
   - 協調各個模組的互動
   - 統一的應用程式狀態管理

## 模組化帶來的好處

### 1. 可維護性
- 每個模組職責單一，易於理解和修改
- 修改一個功能不會影響其他模組
- 程式碼結構清晰，新開發者容易上手

### 2. 可測試性
- 每個模組可以獨立測試
- 依賴注入使得模組間解耦
- 易於編寫單元測試

### 3. 可擴展性
- 新增功能時只需要添加新的模組
- 現有模組不需要修改
- 支援團隊協作開發

### 4. 可重用性
- 模組可以在不同專案中重用
- 服務層可以支援不同的前端框架
- API 可以被其他應用程式使用

### 5. 錯誤隔離
- 一個模組的錯誤不會影響整個應用程式
- 更容易定位和修復問題
- 提高應用程式的穩定性

## 使用方式

### 開發環境啟動
```bash
npm install
npm run dev
```

### 生產環境啟動
```bash
npm start
```

## 未來擴展建議

1. **添加中間件層**
   - 身份驗證中間件
   - 請求日誌中間件
   - 錯誤處理中間件

2. **引入前端框架**
   - 可以輕鬆遷移到 React、Vue 或 Angular
   - 現有的 API 服務可以直接重用

3. **添加測試**
   - 單元測試
   - 整合測試
   - E2E 測試

4. **性能優化**
   - 資料庫查詢優化
   - 前端資源打包
   - CDN 部署

5. **監控和日誌**
   - 應用程式監控
   - 錯誤追蹤
   - 性能監控