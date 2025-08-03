# 地址欄位實作說明

## 概述
成功為租屋經驗表單新增了「地址」欄位（`descriptive_address`），讓使用者可以輸入詳細的地址描述，這個欄位與 OSM 地圖功能無關，純粹是讓使用者手動輸入的描述性文字。

## 實作內容

### 1. 資料庫更新
- **新增欄位**: `descriptive_address TEXT`
- **位置**: 在 `rentals` 表格中，位於 `address` 欄位之後
- **類型**: TEXT（可選填）
- **用途**: 儲存使用者手動輸入的詳細地址描述

#### 更新的檔案：
- `src/models/Rental.js` - 更新模型的 CREATE TABLE 和 INSERT/UPDATE 語句
- `database.js` - 更新資料庫初始化腳本
- `migrate-add-descriptive-address.js` - 遷移腳本，為現有資料庫新增欄位

### 2. 前端表單更新
在基本資訊區塊新增了地址輸入欄位：

```html
<div class="form-group">
    <label for="descriptiveAddress">
        <span data-i18n="form.basicInfo.address">地址</span>
    </label>
    <input type="text" id="descriptiveAddress" class="form-control" 
           data-i18n-placeholder="form.basicInfo.addressPlaceholder"
           placeholder="請輸入詳細地址描述，如：XX社區XX棟XX號">
</div>
```

#### 更新的檔案：
- `src/client/js/RentalFormManager.js` - 新增表單欄位和處理邏輯

### 3. 多語言支援
為三種語言新增了相關翻譯：

#### 中文簡體 (zh-CN)
- `form.basicInfo.address`: "地址"
- `form.basicInfo.addressPlaceholder`: "请输入详细地址描述，如：XX小区XX栋XX号"

#### 中文繁體 (zh-TW)
- `form.basicInfo.address`: "地址"
- `form.basicInfo.addressPlaceholder`: "請輸入詳細地址描述，如：XX社區XX棟XX號"

#### 英文 (en)
- `form.basicInfo.address`: "Address"
- `form.basicInfo.addressPlaceholder`: "Please enter detailed address description, e.g.: XX Community Building XX Unit XX"

#### 更新的檔案：
- `src/client/locales/zh-CN.json`
- `src/client/locales/zh-TW.json`
- `src/client/locales/en.json`

### 4. API 更新
表單提交時會包含新的 `descriptive_address` 欄位：

```javascript
const formData = {
    address: this.currentLocation.address,           // 來自地圖選點的地址
    descriptive_address: document.getElementById('descriptiveAddress').value.trim() || null,  // 使用者輸入的詳細地址
    lat: this.currentLocation.lat,
    lng: this.currentLocation.lng,
    // ... 其他欄位
};
```

### 5. 測試檔案
建立了多個測試檔案來驗證功能：

- `test-descriptive-address.html` - 前端測試頁面
- `test-api-descriptive-address.js` - API 測試腳本
- `test-db-descriptive-address.js` - 資料庫測試腳本

## 使用方式

### 對使用者來說：
1. 開啟租屋經驗表單
2. 在地圖上選擇位置（這會自動填入 `address` 欄位）
3. 在基本資訊區塊中，可以在「地址」欄位輸入更詳細的地址描述
4. 例如：「信義計畫區內，靠近台北101大樓，XX社區A棟15樓」
5. 提交表單

### 資料儲存：
- `address`: 來自地圖反向地理編碼的地址（如：「台北市信義區信義路五段7號」）
- `descriptive_address`: 使用者手動輸入的詳細描述（如：「XX社區A棟15樓」）

## 遷移說明

如果你有現有的資料庫，請執行遷移腳本：

```bash
node migrate-add-descriptive-address.js
```

這個腳本會：
1. 檢查 `descriptive_address` 欄位是否已存在
2. 如果不存在，則新增該欄位
3. 不會影響現有資料

## 測試驗證

執行以下命令來測試功能：

```bash
# 測試資料庫功能
node test-db-descriptive-address.js

# 啟動伺服器後測試 API
node server.js
# 在另一個終端執行：
node test-api-descriptive-address.js

# 或直接開啟測試頁面
# 瀏覽器開啟 test-descriptive-address.html
```

## 特點

1. **非必填欄位**: 使用者可以選擇是否填寫詳細地址
2. **與地圖無關**: 這個欄位純粹是文字描述，不會影響地圖功能
3. **多語言支援**: 支援中文簡體、繁體和英文
4. **向後相容**: 不會影響現有功能和資料
5. **靈活性**: 使用者可以輸入任何形式的地址描述

## 實際應用場景

- 使用者在地圖上選擇了「台北市信義區信義路五段」
- 但想要補充更具體的資訊：「信義計畫區內，靠近台北101大樓，遠雄金融中心A棟15樓」
- 這樣其他使用者就能更準確地了解具體位置

這個實作完全符合你的需求：新增一個「地址」欄位讓使用者輸入，與 OSM 地圖功能無關，純粹是描述性的文字輸入。