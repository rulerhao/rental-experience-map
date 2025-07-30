const GeocodingController = require('./src/controllers/GeocodingController');

async function testController() {
    console.log('測試地理編碼控制器...');
    
    const controller = new GeocodingController();
    
    // 模擬 req 和 res 對象
    const req = {
        body: { address: '台北市大安區' }
    };
    
    const res = {
        status: function(code) {
            console.log('狀態碼:', code);
            return this;
        },
        json: function(data) {
            console.log('回應資料:', JSON.stringify(data, null, 2));
            return this;
        }
    };
    
    try {
        await controller.geocodeAddress(req, res);
    } catch (error) {
        console.error('控制器錯誤:', error);
    }
}

testController();