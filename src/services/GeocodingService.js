const { default: fetch } = require('node-fetch');

class GeocodingService {
    constructor() {
        this.baseUrl = 'https://nominatim.openstreetmap.org/search';
        this.userAgent = 'RentalExperienceMap/1.0';
    }

    async geocodeAddress(address) {
        try {
            // 嘗試多種地址格式，從具體到寬泛
            const addressVariations = this.generateAddressVariations(address);
            
            for (const addressVariation of addressVariations) {
                console.log(`嘗試地理編碼: ${addressVariation}`);
                
                const response = await fetch(
                    `${this.baseUrl}?format=json&q=${encodeURIComponent(addressVariation)}&limit=1&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': this.userAgent
                        }
                    }
                );
                
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const result = data[0];
                    console.log(`成功解析地址: ${addressVariation} -> ${result.display_name}`);
                    
                    return {
                        status: 'OK',
                        results: [{
                            formatted_address: result.display_name,
                            original_address: address, // 保留原始地址
                            matched_address: addressVariation, // 實際匹配的地址
                            geometry: {
                                location: {
                                    lat: parseFloat(result.lat),
                                    lng: parseFloat(result.lon)
                                }
                            }
                        }]
                    };
                }
                
                // 避免請求過於頻繁
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            return {
                status: 'ZERO_RESULTS',
                results: []
            };
        } catch (error) {
            console.error('Geocoding 錯誤:', error);
            throw new Error('Geocoding failed');
        }
    }

    // 生成地址變化版本，從具體到寬泛
    generateAddressVariations(address) {
        const variations = [address]; // 首先嘗試原始地址
        
        // 如果是台灣地址，嘗試簡化
        if (address.includes('台北市') || address.includes('臺北市')) {
            // 移除門牌號碼
            let simplified = address.replace(/\d+號$/, '').trim();
            if (simplified !== address) {
                variations.push(simplified);
            }
            
            // 移除巷弄號
            simplified = simplified.replace(/\d+巷\d*弄?/, '').trim();
            if (simplified !== variations[variations.length - 1]) {
                variations.push(simplified);
            }
            
            // 只保留到路名
            const roadMatch = simplified.match(/(.*路|.*街|.*大道)/);
            if (roadMatch) {
                variations.push(roadMatch[0]);
            }
            
            // 只保留到區
            const districtMatch = address.match(/(台北市|臺北市)(.+?區)/);
            if (districtMatch) {
                variations.push(districtMatch[1] + districtMatch[2]);
            }
        }
        
        // 移除重複項目
        return [...new Set(variations)];
    }
}

module.exports = GeocodingService;