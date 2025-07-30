const { default: fetch } = require('node-fetch');

async function testImprovedGeocoding() {
    console.log('=== 測試改善後的地理編碼 ===\n');
    
    const testAddresses = [
        '台北市信義區信義路五段7號',
        '台北市大安區忠孝東路四段1號',
        '台北市中山區南京東路二段100號',
        '台北市松山區八德路四段123號',
        '台北市內湖區成功路五段456號'
    ];
    
    for (const address of testAddresses) {
        console.log(`測試地址: ${address}`);
        
        try {
            const response = await fetch('http://localhost:3000/api/geocoding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ 解析成功');
                console.log(`  原始地址: ${result.data.results[0].original_address || address}`);
                console.log(`  匹配地址: ${result.data.results[0].matched_address || '未提供'}`);
                console.log(`  格式化地址: ${result.data.results[0].formatted_address}`);
                console.log(`  座標: ${result.data.results[0].geometry.location.lat}, ${result.data.results[0].geometry.location.lng}`);
            } else {
                console.log('❌ 解析失敗');
                console.log(`  錯誤: ${result.message}`);
            }
            
        } catch (error) {
            console.error('❌ 測試錯誤:', error.message);
        }
        
        console.log('---');
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testImprovedGeocoding();