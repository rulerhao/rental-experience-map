class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.tempMarker = null; // 臨時標記，用於新增租屋時的位置選擇
        this.isSelectingLocation = false; // 是否正在選擇位置模式
        this.onLocationSelected = null; // 位置選擇回調函數
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

        // 添加地圖點擊事件監聽器
        this.map.on('click', (e) => {
            if (this.isSelectingLocation) {
                this.handleLocationSelection(e.latlng);
            }
        });
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
        const t = (key) => window.i18n ? window.i18n.t(key) : key;
        const rentPrice = rental.rent_price ? 
            (window.i18n ? window.i18n.formatCurrency(rental.rent_price) : `NT${rental.rent_price.toLocaleString()}`) : 
            t('rental.priceNotProvided');
        const roomType = rental.room_type || t('rental.roomTypeNotProvided');
        
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
                    <small style="color: #999;">${window.i18n ? window.i18n.t('map.coordinates') : '經緯度'}: ${rental.lat.toFixed(4)}, ${rental.lng.toFixed(4)}</small>
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

    // 開始位置選擇模式
    startLocationSelection(callback) {
        this.isSelectingLocation = true;
        this.onLocationSelected = callback;
        
        // 清除之前的臨時標記
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        
        // 改變地圖游標樣式
        this.map.getContainer().style.cursor = 'crosshair';
        
        // 顯示提示訊息
        this.showLocationSelectionHint();
    }

    // 結束位置選擇模式
    endLocationSelection() {
        this.isSelectingLocation = false;
        this.onLocationSelected = null;
        
        // 恢復地圖游標樣式
        this.map.getContainer().style.cursor = '';
        
        // 隱藏提示訊息
        this.hideLocationSelectionHint();
    }

    // 停止位置選擇（外部調用）
    stopLocationSelection() {
        this.endLocationSelection();
        
        // 清除臨時標記
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        
        this.selectedLocation = null;
    }

    // 處理位置選擇
    handleLocationSelection(latlng) {
        // 清除之前的臨時標記
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }
        
        // 創建臨時標記
        const tempIcon = L.divIcon({
            html: `<div style="background-color: #4CAF50; color: white; border-radius: 50%; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); animation: pulse 1.5s infinite;">📍</div>`,
            className: 'temp-marker',
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5]
        });
        
        this.tempMarker = L.marker([latlng.lat, latlng.lng], {
            icon: tempIcon,
            title: '選擇的位置'
        }).addTo(this.map);
        
        // 顯示位置資訊
        const t = (key) => window.i18n ? window.i18n.t(key) : key;
        this.tempMarker.bindPopup(`
            <div style="text-align: center;">
                <h4 style="margin: 0 0 10px 0; color: #4CAF50;">📍 ${t('map.selectedLocation')}</h4>
                <p style="margin: 0; font-size: 12px; color: #666;">
                    ${t('map.latitude')}: ${latlng.lat.toFixed(6)}<br>
                    ${t('map.longitude')}: ${latlng.lng.toFixed(6)}
                </p>
                <div style="margin-top: 10px;">
                    <button onclick="window.mapManager.confirmLocationSelection()" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">${t('map.confirm')}</button>
                    <button onclick="window.mapManager.cancelLocationSelection()" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">${t('map.cancel')}</button>
                </div>
            </div>
        `).openPopup();
        
        this.selectedLocation = latlng;
    }

    // 確認位置選擇
    confirmLocationSelection() {
        if (this.selectedLocation && this.onLocationSelected) {
            this.onLocationSelected(this.selectedLocation);
        }
        this.endLocationSelection();
        
        // 清除臨時標記
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
    }

    // 取消位置選擇
    cancelLocationSelection() {
        this.endLocationSelection();
        
        // 清除臨時標記
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
        
        this.selectedLocation = null;
    }

    // 顯示位置選擇提示
    showLocationSelectionHint() {
        // 創建提示元素
        const hint = document.createElement('div');
        hint.id = 'location-selection-hint';
        hint.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: fadeIn 0.3s ease-in;
        `;
        const hintText = window.i18n ? window.i18n.t('map.selectLocationHint') : '請在地圖上點擊選擇租屋位置';
        hint.innerHTML = '📍 ' + hintText;
        
        // 添加到地圖容器
        const mapContainer = document.getElementById('map');
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(hint);
        
        // 添加CSS動畫
        if (!document.getElementById('location-hint-styles')) {
            const style = document.createElement('style');
            style.id = 'location-hint-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 隱藏位置選擇提示
    hideLocationSelectionHint() {
        const hint = document.getElementById('location-selection-hint');
        if (hint) {
            hint.remove();
        }
    }

    // 反向地理編碼（將座標轉換為地址）
    async reverseGeocode(lat, lng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
                headers: {
                    'User-Agent': 'RentalExperienceMap/1.0'
                }
            });
            
            const data = await response.json();
            
            if (data && data.display_name) {
                return data.display_name;
            } else {
                const coordText = window.i18n ? window.i18n.t('rental.coordinateLocation') : '座標位置';
                return `${coordText} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            }
        } catch (error) {
            console.error('反向地理編碼錯誤:', error);
            const coordText = window.i18n ? window.i18n.t('rental.coordinateLocation') : '座標位置';
            return `${coordText} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.MapManager = MapManager;
}