// 租屋資料將從資料庫載入
let rentalData = [];

let map;
let markers = [];

// 初始化地圖
function initMap() {
    // 以台北市為中心
    map = L.map('map').setView([25.0330, 121.5654], 12);
    
    // 添加 OpenStreetMap 圖層
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // 載入租屋資料
    loadRentalData();
}

// 載入並顯示租屋資料
async function loadRentalData() {
    try {
        // 從資料庫載入資料
        const response = await fetch('/api/rentals');
        rentalData = await response.json();
        
        const rentalList = document.getElementById('rental-list');
        rentalList.innerHTML = '';
        
        // 清除現有標記
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        
        rentalData.forEach(rental => {
            // 創建自定義圖標
            const customIcon = L.divIcon({
                html: `<div style="background-color: #FF5722; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">房</div>`,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            // 在地圖上添加標記
            const marker = L.marker([rental.lat, rental.lng], {
                icon: customIcon,
                title: rental.address
            }).addTo(map);
            
            // 點擊標記顯示資訊
            marker.on('click', () => {
                showRentalInfo(rental, marker);
                highlightRentalItem(rental.id);
            });
            
            markers.push(marker);
            
            // 在側邊欄添加項目
            const rentalItem = createRentalItem(rental);
            rentalList.appendChild(rentalItem);
        });
        
    } catch (error) {
        console.error('載入租屋資料錯誤:', error);
        alert('載入資料失敗，請稍後再試。');
    }
}

// 創建租屋項目元素
function createRentalItem(rental) {
    const item = document.createElement('div');
    item.className = 'rental-item';
    item.dataset.id = rental.id;
    
    const starsHtml = generateStarsHtml(rental.overall_rating || 0);
    const rentPrice = rental.rent_price ? `NT$${rental.rent_price.toLocaleString()}` : '價格未提供';
    const roomType = rental.room_type || '房型未提供';
    
    item.innerHTML = `
        <div class="rental-address">${rental.address}</div>
        <div class="rental-rating">
            <span class="stars">${starsHtml}</span>
            <span class="rating-text">${(rental.overall_rating || 0).toFixed(1)}</span>
        </div>
        <div class="rental-description">${rental.description}</div>
        <div class="rental-details">
            ${roomType} | ${rentPrice}
            ${rental.area_size ? ` | ${rental.area_size}坪` : ''}
        </div>
        <button class="add-rating-btn" onclick="addRating(${rental.id})">新增評分</button>
    `;
    
    // 點擊項目時聚焦到地圖標記
    item.addEventListener('click', (e) => {
        // 避免按鈕點擊觸發項目點擊
        if (e.target.classList.contains('add-rating-btn')) return;
        
        map.setView([rental.lat, rental.lng], 16);
        
        // 找到對應的標記並顯示資訊
        const marker = markers.find(m => {
            const pos = m.getLatLng();
            return Math.abs(pos.lat - rental.lat) < 0.0001 && Math.abs(pos.lng - rental.lng) < 0.0001;
        });
        
        if (marker) {
            showRentalInfo(rental, marker);
        }
        highlightRentalItem(rental.id);
    });
    
    return item;
}

// 顯示租屋資訊
function showRentalInfo(rental, marker) {
    const starsHtml = generateStarsHtml(rental.overall_rating || 0);
    const rentPrice = rental.rent_price ? `NT${rental.rent_price.toLocaleString()}` : '價格未提供';
    const roomType = rental.room_type || '房型未提供';
    
    const content = `
        <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${rental.address}</h3>
            <div style="margin-bottom: 8px;">
                <span style="color: #ffc107; font-size: 16px;">${starsHtml}</span>
                <span style="font-size: 12px; color: #666; margin-left: 8px;">${(rental.overall_rating || 0).toFixed(1)}</span>
            </div>
            <p style="margin: 0 0 8px 0; line-height: 1.4; color: #666;">${rental.description}</p>
            <div style="font-size: 12px; color: #888; margin-bottom: 8px;">
                ${roomType} | ${rentPrice}
                ${rental.area_size ? ` | ${rental.area_size}坪` : ''}
            </div>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                <small style="color: #999;">經緯度: ${rental.lat.toFixed(4)}, ${rental.lng.toFixed(4)}</small>
            </div>
        </div>
    `;
    
    marker.bindPopup(content).openPopup();
}

// 高亮顯示選中的租屋項目
function highlightRentalItem(id) {
    // 移除所有高亮
    document.querySelectorAll('.rental-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 添加高亮到選中項目
    const selectedItem = document.querySelector(`[data-id="${id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
}

// 生成星星評分HTML
function generateStarsHtml(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // 實心星星
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '★';
    }
    
    // 半星
    if (hasHalfStar) {
        starsHtml += '☆';
    }
    
    // 空心星星
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '☆';
    }
    
    return starsHtml;
}

// 新增評分
async function addRating(rentalId) {
    const userName = prompt('請輸入您的姓名（可選）:') || '匿名用戶';
    
    const landlordRating = parseInt(prompt('房東評分 (1-5):'));
    if (!landlordRating || landlordRating < 1 || landlordRating > 5) {
        alert('請輸入有效的房東評分 (1-5)');
        return;
    }
    
    const locationRating = parseInt(prompt('地點評分 (1-5):'));
    if (!locationRating || locationRating < 1 || locationRating > 5) {
        alert('請輸入有效的地點評分 (1-5)');
        return;
    }
    
    const valueRating = parseInt(prompt('性價比評分 (1-5):'));
    if (!valueRating || valueRating < 1 || valueRating > 5) {
        alert('請輸入有效的性價比評分 (1-5)');
        return;
    }
    
    const comment = prompt('請輸入評論（可選）:') || '';
    
    try {
        const response = await fetch('/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rental_id: rentalId,
                user_name: userName,
                landlord_rating: landlordRating,
                location_rating: locationRating,
                value_rating: valueRating,
                comment: comment
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('評分已成功添加！');
            // 重新載入資料以顯示更新的評分
            loadRentalData();
        } else {
            alert('評分添加失敗，請稍後再試。');
        }
    } catch (error) {
        console.error('新增評分錯誤:', error);
        alert('評分添加失敗，請稍後再試。');
    }
}

// 新增租屋經驗（更新版本，包含更多資訊）
async function addNewRental() {
    const address = prompt('請輸入地址:');
    if (!address) return;
    
    const description = prompt('請描述你的租屋經驗:');
    if (!description) return;
    
    const rentPrice = parseInt(prompt('請輸入租金（元/月）:')) || null;
    const roomType = prompt('請輸入房型（如：套房、雅房、分租套房）:') || null;
    const areaSize = parseFloat(prompt('請輸入坪數:')) || null;
    const facilities = prompt('請輸入設施（用逗號分隔，如：冷氣,洗衣機,網路）:') || null;
    
    const landlordRating = parseInt(prompt('房東評分 (1-5):'));
    if (!landlordRating || landlordRating < 1 || landlordRating > 5) {
        alert('請輸入有效的房東評分 (1-5)');
        return;
    }
    
    const locationRating = parseInt(prompt('地點評分 (1-5):'));
    if (!locationRating || locationRating < 1 || locationRating > 5) {
        alert('請輸入有效的地點評分 (1-5)');
        return;
    }
    
    const valueRating = parseInt(prompt('性價比評分 (1-5):'));
    if (!valueRating || valueRating < 1 || valueRating > 5) {
        alert('請輸入有效的性價比評分 (1-5)');
        return;
    }
    
    try {
        // 使用後端代理進行 Geocoding
        const geocodeResponse = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: address })
        });
        
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            
            // 新增租屋資料到資料庫
            const rentalResponse = await fetch('/api/rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: geocodeData.results[0].formatted_address,
                    lat: location.lat,
                    lng: location.lng,
                    description: description,
                    rent_price: rentPrice,
                    room_type: roomType,
                    area_size: areaSize,
                    facilities: facilities,
                    landlord_rating: landlordRating,
                    location_rating: locationRating,
                    value_rating: valueRating
                })
            });
            
            const rentalResult = await rentalResponse.json();
            
            if (rentalResult.success) {
                // 重新載入資料
                await loadRentalData();
                
                // 聚焦到新添加的位置
                map.setView([location.lat, location.lng], 16);
                
                alert('租屋經驗已成功添加！');
            } else {
                alert('租屋資料添加失敗，請稍後再試。');
            }
        } else {
            alert('無法找到該地址，請檢查地址是否正確。');
        }
    } catch (error) {
        console.error('新增租屋經驗錯誤:', error);
        alert('新增失敗，請稍後再試。');
    }
}

// 頁面載入時初始化地圖
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});