# 自動化測試指南

這個專案提供了多種自動化測試方案，讓你可以輕鬆驗證 API 的功能。

## 🚀 快速開始

### 1. 安裝測試依賴
```bash
npm install axios colors jest supertest nodemon --save-dev
```

### 2. 啟動伺服器
```bash
npm start
# 或在背景執行
npm run dev
```

### 3. 執行測試
```bash
# 執行基本自動化測試
npm test

# 執行 Jest 測試套件
npm run test:jest

# 監控模式（檔案變更時自動重新測試）
npm run test:watch
```

## 📋 測試方案

### 1. Node.js 自動化測試 (`test-api.js`)

**特色：**
- 彩色輸出，易於閱讀
- 完整的 CRUD 測試
- 自動等待伺服器啟動
- 詳細的測試結果摘要
- 錯誤處理測試

**使用方法：**
```bash
node test-api.js
# 或
npm test
```

**測試內容：**
- ✅ 獲取所有租屋資料
- ✅ 獲取單一租屋資料
- ✅ 創建新租屋資料
- ✅ 更新租屋資料
- ✅ 刪除租屋資料
- ✅ 獲取評分資料
- ✅ 新增評分
- ✅ 地理編碼
- ✅ 錯誤處理

### 2. Jest 測試套件 (`tests/api.test.js`)

**特色：**
- 專業的測試框架
- 支援測試覆蓋率報告
- 結構化的測試組織
- 詳細的斷言

**使用方法：**
```bash
npx jest
# 或
npm run test:jest

# 生成覆蓋率報告
npm run test:coverage
```

### 3. Postman 集合 (`postman-collection.json`)

**特色：**
- 視覺化測試界面
- 可以手動或自動執行
- 支援環境變數
- 內建測試斷言

**使用方法：**

**在 Postman 中：**
1. 導入 `postman-collection.json`
2. 設置環境變數 `baseUrl = http://localhost:3000/api`
3. 執行整個集合或單個請求

**使用 Newman (命令列)：**
```bash
# 安裝 Newman
npm install -g newman

# 執行測試
newman run postman-collection.json
```

### 4. PowerShell 測試腳本 (`test-runner.ps1`)

**特色：**
- 一鍵執行所有測試
- 自動啟動/停止伺服器
- 生成 HTML 測試報告
- 支援不同測試類型

**使用方法：**
```powershell
# 執行所有測試（自動啟動和停止伺服器）
.\test-runner.ps1 -TestType all -StartServer -StopServer

# 只執行 Node.js 測試
.\test-runner.ps1 -TestType node

# 只執行 Jest 測試
.\test-runner.ps1 -TestType jest

# 只執行 Postman 測試
.\test-runner.ps1 -TestType postman
```

## 🔧 測試配置

### Jest 配置 (`jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testTimeout: 10000
};
```

### 測試設置 (`tests/setup.js`)
- 自動等待伺服器啟動
- 全域測試前後處理

## 📊 測試報告

### 1. 控制台輸出
所有測試都會在控制台顯示彩色的結果：
- ✅ 綠色表示通過
- ❌ 紅色表示失敗
- ⏳ 黃色表示進行中

### 2. Jest 覆蓋率報告
```bash
npm run test:coverage
```
會在 `coverage/` 目錄生成 HTML 報告

### 3. PowerShell HTML 報告
使用 `test-runner.ps1` 會生成時間戳記的 HTML 報告

## 🚨 常見問題

### Q: 測試失敗，顯示連接錯誤
**A:** 確保伺服器正在運行：
```bash
npm start
# 檢查伺服器狀態
netstat -an | findstr :3000
```

### Q: 中文字符顯示為問號
**A:** 這是 PowerShell 編碼問題，不影響 API 功能。可以：
1. 在瀏覽器中測試
2. 使用 Postman
3. 設置 PowerShell 編碼：`chcp 65001`

### Q: Jest 測試超時
**A:** 增加超時時間：
```javascript
// 在測試檔案中
jest.setTimeout(15000);
```

### Q: 如何添加新的測試
**A:** 
1. **Node.js 測試**：在 `test-api.js` 中添加新的測試方法
2. **Jest 測試**：在 `tests/` 目錄創建新的 `.test.js` 檔案
3. **Postman 測試**：在 Postman 中編輯集合並重新導出

## 🎯 最佳實踐

### 1. 測試順序
建議按以下順序執行測試：
1. 基本 CRUD 操作
2. 業務邏輯測試
3. 錯誤處理測試
4. 性能測試

### 2. 測試資料管理
- 使用測試專用的資料
- 測試後清理資料
- 避免依賴現有資料

### 3. 持續整合
可以將測試整合到 CI/CD 流程：
```yaml
# GitHub Actions 範例
- name: Run Tests
  run: |
    npm start &
    sleep 5
    npm test
```

### 4. 測試覆蓋率
目標達到 80% 以上的測試覆蓋率：
```bash
npm run test:coverage
```

## 📈 進階功能

### 1. 性能測試
可以添加響應時間測試：
```javascript
const startTime = Date.now();
const response = await axios.get('/api/rentals');
const responseTime = Date.now() - startTime;
expect(responseTime).toBeLessThan(1000); // 1秒內回應
```

### 2. 負載測試
使用工具如 Artillery 或 k6 進行負載測試

### 3. 端到端測試
使用 Playwright 或 Cypress 進行前端測試

## 🔗 相關資源

- [Jest 官方文檔](https://jestjs.io/)
- [Supertest 文檔](https://github.com/visionmedia/supertest)
- [Postman 文檔](https://learning.postman.com/)
- [Newman 文檔](https://github.com/postmanlabs/newman)

---

**提示：** 定期執行測試可以確保 API 的穩定性和可靠性。建議在每次程式碼變更後都執行完整的測試套件。