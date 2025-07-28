// 租屋資料將從資料庫載入
let rentalData = [];

let map;
let markers = [];
let infoWindow;

// 動態載入 Google Maps API
async function loadGoogleMapsAPI() {
    try {
        const response = await fetch('/api/maps-config');
        const config = await response.json();
        
        const script = document.createElement('script');
        script.src = config.mapsApiUrl;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch (error) {
        console.error('載入 Google Maps API 失敗:', error);
    }
}

// 初始化地圖
function initMap() {
    // 以台北市為中心
    const taipei = { lat: 25.0330, lng: 121.5654 };
    
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: taipei,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    });
    
    infoWindow = new google.maps.InfoWindow();
    
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
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        
        rentalData.forEach(rental => {
            // 在地圖上添加標記
            const marker = new google.maps.Marker({
                position: { lat: rental.lat, lng: rental.lng },
                map: map,
                title: rental.address,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#FF5722"/>
                            <circle cx="15" cy="15" r="8" fill="white"/>
                            <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="#FF5722">房</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(30, 40),
                    anchor: new google.maps.Point(15, 40)
                }
            });
            
            // 點擊標記顯示資訊
            marker.addListener('click', () => {
                showRentalInfo(rental);
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
        
        const position = { lat: rental.lat, lng: rental.lng };
        map.setCenter(position);
        map.setZoom(16);
        showRentalInfo(rental);
        highlightRentalItem(rental.id);
    });
    
    return item;
}

// 顯示租屋資訊
function showRentalInfo(rental) {
    const content = `
        <div style="max-width: 300px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${rental.address}</h3>
            <p style="margin: 0; line-height: 1.4; color: #666;">${rental.description}</p>
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
                <small style="color: #999;">經緯度: ${rental.lat.toFixed(4)}, ${rental.lng.toFixed(4)}</small>
            </div>
        </div>
    `;
    
    infoWindow.setContent(content);
    
    // 找到對應的標記並顯示資訊窗口
    const marker = markers.find(m => 
        m.getPosition().lat().toFixed(4) == rental.lat.toFixed(4) && 
        m.getPosition().lng().toFixed(4) == rental.lng.toFixed(4)
    );
    
    if (marker) {
        infoWindow.open(map, marker);
    }
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
                map.setCenter({ lat: location.lat, lng: location.lng });
                map.setZoom(16);
                
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

// 頁面載入時自動載入 Google Maps API
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMapsAPI();
});