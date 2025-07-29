class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
    }

    // 初始化地圖
    initMap() {
        // 以台北市為中心
        this.map = L.map('map').setView([25.0330, 121.5654], 12);
        
        // 添加 OpenStreetMap 圖層
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);
    }

    // 清除所有標記
    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    // 添加租屋標記
    addRentalMarker(rental, onClickCallback) {
        const customIcon = L.divIcon({
            html: `<div style="background-color: #FF5722; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">房</div>`,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([rental.lat, rental.lng], {
            icon: customIcon,
            title: rental.address
        }).addTo(this.map);
        
        // 點擊標記顯示資訊
        marker.on('click', () => {
            this.showRentalInfo(rental, marker);
            if (onClickCallback) onClickCallback(rental.id);
        });
        
        this.markers.push(marker);
        return marker;
    }

    // 顯示租屋資訊
    showRentalInfo(rental, marker) {
        const starsHtml = this.generateStarsHtml(rental.overall_rating || 0);
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

    // 聚焦到指定位置
    focusOnLocation(lat, lng, zoom = 16) {
        this.map.setView([lat, lng], zoom);
    }

    // 生成星星評分HTML
    generateStarsHtml(rating) {
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
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.MapManager = MapManager;
}