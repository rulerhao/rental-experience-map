const GeocodingService = require('./src/services/GeocodingService');

async function testService() {
    console.log('測試地理編碼服務...');
    
    const service = new GeocodingService();
    
    try {
        const result = await service.geocodeAddress('台北市大安區');
        console.log('服務回應:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('服務錯誤:', error);
    }
}

testService();