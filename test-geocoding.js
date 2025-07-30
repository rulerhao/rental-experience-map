const { default: fetch } = require('node-fetch');

async function testDirectGeocoding() {
    console.log('直接測試 OpenStreetMap 地理編碼...');
    
    try {
        const address = '台北市大安區';
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
        
        console.log('請求 URL:', url);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RentalExperienceMap/1.0'
            }
        });
        
        const data = await response.json();
        console.log('原始回應:', JSON.stringify(data, null, 2));
        
        if (data && data.length > 0) {
            const result = data[0];
            const formatted = {
                status: 'OK',
                results: [{
                    formatted_address: result.display_name,
                    geometry: {
                        location: {
                            lat: parseFloat(result.lat),
                            lng: parseFloat(result.lon)
                        }
                    }
                }]
            };
            console.log('格式化後:', JSON.stringify(formatted, null, 2));
        }
    } catch (error) {
        console.error('錯誤:', error);
    }
}

testDirectGeocoding();