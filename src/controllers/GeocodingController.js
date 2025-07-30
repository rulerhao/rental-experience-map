const GeocodingService = require('../services/GeocodingService');

class GeocodingController {
    constructor() {
        this.geocodingService = new GeocodingService();
    }

    // POST /api/geocoding - 地址轉換為座標
    async geocodeAddress(req, res) {
        try {
            const { address } = req.body;
            
            // 驗證必要參數
            if (!address) {
                return res.status(400).json({
                    success: false,
                    error: '請求參數錯誤',
                    message: '地址為必填欄位'
                });
            }
            
            const result = await this.geocodingService.geocodeAddress(address);
            
            if (result.status === 'ZERO_RESULTS' || !result.results || result.results.length === 0) {
                return res.status(422).json({
                    success: false,
                    error: '地理編碼失敗',
                    message: '無法解析提供的地址'
                });
            }
            
            res.status(200).json({
                success: true,
                data: result,
                message: '地址解析成功'
            });
        } catch (error) {
            console.error('地理編碼錯誤:', error);
            res.status(500).json({ 
                success: false,
                error: '內部伺服器錯誤',
                message: '地理編碼服務暫時無法使用'
            });
        }
    }
}

module.exports = GeocodingController;