const { default: fetch } = require('node-fetch');

async function testSpecificAddress() {
    console.log('=== 測試具體地址解析 ===\n');
    
    const addresses = [
        '台北市信義區信義路五段7號',
        '台北市信義區信義路五段',
        '台北市信義區信義路',
        '台北市信義區',
        '信義區, 台北市',
        'Xinyi District, Taipei',
        '台北101',
        '台北市信義區市府路45號'
    ];
    
    for (const address of addresses) {
        console.log(`測試地址: ${address}`);
        
        try {
            // 直接測試 OpenStreetMap API
            const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
            console.log(`請求URL: ${osmUrl}`);
            
            const response = await fetch(osmUrl, {
                headers: {
                    'User-Agent': 'RentalExperienceMap/1.0'
                }
            });
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                console.log('✅ 成功解析');
                console.log(`  結果: ${data[0].display_name}`);
                console.log(`  座標: ${data[0].lat}, ${data[0].lon}`);
            } else {
                console.log('❌ 無法解析');
            }
            
            // 測試我們的 API
            console.log('測試我們的地理編碼 API...');
            const apiResponse = await fetch('http://localhost:3000/api/geocoding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address })
            });
            
            const apiResult = await apiResponse.json();
            
            if (apiResult.success) {
                console.log('✅ API 解析成功');
                console.log(`  結果: ${apiResult.data.results[0].formatted_address}`);
            } else {
                console.log('❌ API 解析失敗');
                console.log(`  錯誤: ${apiResult.message}`);
            }
            
        } catch (error) {
            console.error('❌ 測試錯誤:', error.message);
        }
        
        console.log('---');
        
        // 避免請求過於頻繁
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testSpecificAddress();