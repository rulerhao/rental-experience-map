# 租屋經驗分享地圖 - RESTful API 文檔

## 概述

本API採用RESTful設計原則，提供租屋資料和評分的完整CRUD操作。所有回應都使用統一的JSON格式，包含成功狀態、資料和訊息。

## 基本URL

```
http://localhost:3000/api
```

## 回應格式

### 成功回應
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功訊息"
}
```

### 錯誤回應
```json
{
  "success": false,
  "error": "錯誤類型",
  "message": "詳細錯誤訊息"
}
```

## HTTP 狀態碼

- `200 OK` - 成功獲取或更新資源
- `201 Created` - 成功創建資源
- `400 Bad Request` - 請求參數錯誤
- `404 Not Found` - 資源不存在
- `422 Unprocessable Entity` - 資料驗證失敗
- `500 Internal Server Error` - 伺服器內部錯誤

---

## 地理編碼 API

### 地址轉座標

**POST** `/api/geocoding`

將地址轉換為經緯度座標。

#### 請求體
```json
{
  "address": "台北市信義區信義路五段7號"
}
```

#### 成功回應 (200)
```json
{
  "success": true,
  "data": {
    "lat": 25.0330,
    "lng": 121.5654,
    "formatted_address": "台北市信義區信義路五段7號"
  },
  "message": "地址解析成功"
}
```

---

## 租屋資料 API

### 獲取所有租屋資料

**GET** `/api/rentals`

獲取所有租屋資料，支援分頁和排序。

#### 查詢參數
- `page` (可選) - 頁碼，預設為 1
- `limit` (可選) - 每頁筆數，預設為 10
- `sort` (可選) - 排序欄位，可選值：`created_at`, `updated_at`, `rent_price`, `overall_rating`, `address`
- `order` (可選) - 排序方向，`asc` 或 `desc`，預設為 `desc`

#### 範例請求
```
GET /api/rentals?page=1&limit=5&sort=rent_price&order=asc
```

#### 成功回應 (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "address": "台北市信義區信義路五段7號",
      "lat": 25.0330,
      "lng": 121.5654,
      "description": "交通便利，近101大樓...",
      "rent_price": 25000,
      "room_type": "套房",
      "area_size": 15.5,
      "facilities": "冷氣,洗衣機,網路,電視",
      "landlord_rating": 4,
      "location_rating": 5,
      "value_rating": 3,
      "overall_rating": 4.0,
      "created_at": "2024-01-01 12:00:00",
      "updated_at": "2024-01-01 12:00:00"
    }
  ],
  "message": "成功獲取租屋資料"
}
```

### 獲取單一租屋資料

**GET** `/api/rentals/:id`

根據ID獲取特定租屋資料。

#### 成功回應 (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "address": "台北市信義區信義路五段7號",
    // ... 其他欄位
  },
  "message": "成功獲取租屋資料"
}
```

#### 錯誤回應 (404)
```json
{
  "success": false,
  "error": "資源不存在",
  "message": "找不到指定的租屋資料"
}
```

### 創建租屋資料

**POST** `/api/rentals`

創建新的租屋資料。

#### 請求體
```json
{
  "address": "台北市中山區南京東路二段100號",
  "lat": 25.0478,
  "lng": 121.5170,
  "description": "老公寓但維護良好...",
  "rent_price": 18000,
  "room_type": "雅房",
  "area_size": 12.0,
  "facilities": "冷氣,網路,共用洗衣機",
  "landlord_rating": 5,
  "location_rating": 4,
  "value_rating": 4
}
```

#### 必填欄位
- `address` - 地址
- `lat` - 緯度
- `lng` - 經度

#### 成功回應 (201)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "overall_rating": 4.33
  },
  "message": "成功創建租屋資料"
}
```

### 更新租屋資料

**PUT** `/api/rentals/:id`

更新現有的租屋資料。

#### 請求體
```json
{
  "description": "更新後的描述",
  "rent_price": 20000
}
```

#### 成功回應 (200)
```json
{
  "success": true,
  "data": {
    "id": 1
  },
  "message": "成功更新租屋資料"
}
```

### 刪除租屋資料

**DELETE** `/api/rentals/:id`

刪除指定的租屋資料及其相關評分。

#### 成功回應 (200)
```json
{
  "success": true,
  "message": "成功刪除租屋資料"
}
```

---

## 評分 API

### 獲取租屋評分

**GET** `/api/rentals/:rentalId/ratings`

獲取指定租屋的所有評分。

#### 成功回應 (200)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rental_id": 1,
      "user_name": "張三",
      "landlord_rating": 4,
      "location_rating": 5,
      "value_rating": 3,
      "overall_rating": 4.0,
      "comment": "房東人很好，但房租偏高",
      "created_at": "2024-01-01 12:00:00",
      "updated_at": "2024-01-01 12:00:00"
    }
  ],
  "message": "成功獲取評分資料"
}
```

### 新增評分

**POST** `/api/rentals/:rentalId/ratings`

為指定租屋新增評分。

#### 請求體
```json
{
  "user_name": "李四",
  "landlord_rating": 5,
  "location_rating": 4,
  "value_rating": 4,
  "comment": "整體來說很不錯"
}
```

#### 必填欄位
- `landlord_rating` - 房東評分 (1-5)
- `location_rating` - 地點評分 (1-5)
- `value_rating` - 性價比評分 (1-5)

#### 成功回應 (201)
```json
{
  "success": true,
  "data": {
    "id": 2,
    "overall_rating": 4.2
  },
  "message": "成功新增評分"
}
```

### 獲取單一評分

**GET** `/api/rentals/:rentalId/ratings/:ratingId`

獲取指定的評分資料。

#### 成功回應 (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rental_id": 1,
    "user_name": "張三",
    // ... 其他欄位
  },
  "message": "成功獲取評分資料"
}
```

### 更新評分

**PUT** `/api/rentals/:rentalId/ratings/:ratingId`

更新現有的評分資料。

#### 請求體
```json
{
  "landlord_rating": 5,
  "comment": "更新後的評論"
}
```

#### 成功回應 (200)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "overall_rating": 4.33
  },
  "message": "成功更新評分資料"
}
```

### 刪除評分

**DELETE** `/api/rentals/:rentalId/ratings/:ratingId`

刪除指定的評分資料。

#### 成功回應 (200)
```json
{
  "success": true,
  "message": "成功刪除評分資料"
}
```

---

## 錯誤處理

### 常見錯誤回應

#### 400 Bad Request - 請求參數錯誤
```json
{
  "success": false,
  "error": "請求參數錯誤",
  "message": "缺少必要欄位: address, lat, lng"
}
```

#### 404 Not Found - 資源不存在
```json
{
  "success": false,
  "error": "資源不存在",
  "message": "找不到指定的租屋資料"
}
```

#### 422 Unprocessable Entity - 資料驗證失敗
```json
{
  "success": false,
  "error": "資料驗證失敗",
  "message": "緯度必須在 -90 到 90 之間"
}
```

#### 500 Internal Server Error - 伺服器錯誤
```json
{
  "success": false,
  "error": "內部伺服器錯誤",
  "message": "操作失敗，請稍後再試"
}
```

---

## RESTful 設計原則

### 1. 資源導向的URL設計
- `/api/rentals` - 租屋資源集合
- `/api/rentals/:id` - 單一租屋資源
- `/api/rentals/:rentalId/ratings` - 租屋的評分子資源

### 2. HTTP方法語義化
- `GET` - 獲取資源
- `POST` - 創建資源
- `PUT` - 更新資源
- `DELETE` - 刪除資源

### 3. 統一的回應格式
- 所有API都使用相同的JSON結構
- 包含成功狀態、資料和訊息
- 錯誤回應包含錯誤類型和詳細訊息

### 4. 適當的HTTP狀態碼
- 根據操作結果返回對應的狀態碼
- 提供清晰的錯誤資訊

### 5. 資源關係表達
- 評分作為租屋的子資源
- URL結構清楚表達資源間的關係

這種RESTful設計提供了：
- **更好的可讀性** - URL和方法清楚表達操作意圖
- **更好的可維護性** - 統一的設計模式
- **更好的可擴展性** - 易於添加新的資源和操作
- **更好的開發體驗** - 符合REST標準，易於理解和使用