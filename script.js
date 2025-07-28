// 模擬後端資料庫資料
const rentalData = [
    {
        id: 1,
        lat: 25.0330,
        lng: 121.5654,
        address: "台北市信義區信義路五段7號",
        description: "交通便利，近101大樓。房東人很好，但房租偏高。周邊生活機能完善，有很多餐廳和便利商店。"
    },
    {
        id: 2,
        lat: 25.0478,
        lng: 121.5170,
        address: "台北市中山區南京東路二段100號",
        description: "老公寓但維護良好，房東會定期修繕。附近有捷運站，上班很方便。唯一缺點是隔音稍差。"
    },
    {
        id: 3,
        lat: 25.0418,
        lng: 121.5313,
        address: "台北市中正區羅斯福路一段50號",
        description: "學生宿舍區域，價格合理。房間雖小但五臟俱全。房東對學生很友善，會幫忙處理各種問題。"
    },
    {
        id: 4,
        lat: 25.0855,
        lng: 121.5606,
        address: "台北市士林區文林路200號",
        description: "夜市附近，很熱鬧但也比較吵。房間寬敞，有陽台。房東偶爾會帶水果給房客，人情味濃厚。"
    },
    {
        id: 5,
        lat: 25.0138,
        lng: 121.4653,
        address: "新北市板橋區文化路一段188號",
        description: "CP值很高的選擇，房租便宜且空間大。雖然離台北市區較遠，但捷運可直達，通勤還算方便。"
    }
];

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
function loadRentalData() {
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
}

// 創建租屋項目元素
function createRentalItem(rental) {
    const item = document.createElement('div');
    item.className = 'rental-item';
    item.dataset.id = rental.id;
    
    item.innerHTML = `
        <div class="rental-address">${rental.address}</div>
        <div class="rental-description">${rental.description}</div>
    `;
    
    // 點擊項目時聚焦到地圖標記
    item.addEventListener('click', () => {
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

// 新增租屋經驗（使用後端代理）
async function addNewRental() {
    const address = prompt('請輸入地址:');
    if (!address) return;
    
    const description = prompt('請描述你的租屋經驗:');
    if (!description) return;
    
    try {
        // 使用後端代理進行 Geocoding
        const response = await fetch('/api/geocode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: address })
        });
        
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            const newRental = {
                id: rentalData.length + 1,
                lat: location.lat,
                lng: location.lng,
                address: data.results[0].formatted_address,
                description: description
            };
            
            // 添加到資料陣列
            rentalData.push(newRental);
            
            // 重新載入資料
            loadRentalData();
            
            // 聚焦到新添加的位置
            map.setCenter({ lat: location.lat, lng: location.lng });
            map.setZoom(16);
            
            alert('租屋經驗已成功添加！');
        } else {
            alert('無法找到該地址，請檢查地址是否正確。');
        }
    } catch (error) {
        console.error('Geocoding 錯誤:', error);
        alert('地址查詢失敗，請稍後再試。');
    }
}

// 頁面載入時自動載入 Google Maps API
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleMapsAPI();
});