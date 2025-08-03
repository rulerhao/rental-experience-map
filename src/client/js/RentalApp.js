class RentalApp {
    constructor() {
        this.mapManager = new MapManager();
        this.listManager = new RentalListManager(window.i18n);
        this.apiService = new ApiService();
        this.formManager = null; // 延遲初始化
        this.rentalData = [];
    }

    // 初始化應用程式
    async init() {
        try {
            this.mapManager.initMap();
            
            // 初始化表單管理器
            this.formManager = new RentalFormManager(this.apiService, this.mapManager, window.i18n);
            this.formManager.setOnSuccess(async (locationData) => {
                // 重新載入資料並聚焦到新位置
                await this.loadRentalData();
                this.mapManager.focusOnLocation(locationData.lat, locationData.lng);
            });
            
            await this.loadRentalData();
        } catch (error) {
            console.error('應用程式初始化失敗:', error);
            const errorMsg = window.i18n ? window.i18n.t('messages.error.appInitFailed') : '應用程式載入失敗，請重新整理頁面。';
            alert(errorMsg);
        }
    }

    // 載入並顯示租屋資料
    async loadRentalData() {
        try {
            this.rentalData = await this.apiService.getRentals();
            this.displayRentals();
        } catch (error) {
            console.error('載入租屋資料錯誤:', error);
            const errorMsg = window.i18n ? window.i18n.t('messages.error.loadFailed') : '載入資料失敗，請稍後再試。';
            alert(errorMsg);
        }
    }

    // 顯示租屋資料
    displayRentals() {
        // 清除現有資料
        this.mapManager.clearMarkers();
        this.listManager.clearList();

        this.rentalData.forEach(rental => {
            // 在地圖上添加標記
            this.mapManager.addRentalMarker(rental, (rentalId) => {
                this.listManager.highlightItem(rentalId);
            });

            // 在側邊欄添加項目
            this.listManager.addRentalItem(rental, (rental) => {
                this.onRentalItemClick(rental);
            }, this.addRating);
        });
    }

    // 處理租屋項目點擊
    onRentalItemClick(rental) {
        this.mapManager.focusOnLocation(rental.lat, rental.lng);
        
        // 找到對應的標記並顯示資訊
        const marker = this.mapManager.markers.find(m => {
            const pos = m.getLatLng();
            return Math.abs(pos.lat - rental.lat) < 0.0001 && Math.abs(pos.lng - rental.lng) < 0.0001;
        });
        
        if (marker) {
            this.mapManager.showRentalInfo(rental, marker);
        }
        this.listManager.highlightItem(rental.id);
    }

    // 新增評分
    async addRating(rentalId) {
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
            const result = await this.apiService.addRating(rentalId, {
                user_name: userName,
                landlord_rating: landlordRating,
                location_rating: locationRating,
                value_rating: valueRating,
                comment: comment
            });
            
            if (result.success) {
                alert('評分已成功添加！');
                // 重新載入資料以顯示更新的評分
                await this.loadRentalData();
            } else {
                alert('評分添加失敗，請稍後再試。');
            }
        } catch (error) {
            alert('評分添加失敗，請稍後再試。');
        }
    }

    // 新增租屋經驗（使用新的表單UI）
    async addNewRentalByMapSelection() {
        if (this.formManager) {
            this.formManager.show();
        }
    }

    // 使用地圖選擇位置的新增租屋經驗
    async addNewRentalWithMapSelection() {
        alert('請在地圖上點擊選擇租屋位置');
        
        // 開始位置選擇模式
        this.mapManager.startLocationSelection(async (selectedLocation) => {
            try {
                // 獲取地址（反向地理編碼）
                const address = await this.mapManager.reverseGeocode(selectedLocation.lat, selectedLocation.lng);
                
                // 收集其他資訊
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
                
                // 直接使用選擇的座標創建租屋資料
                const rentalResult = await this.apiService.createRental({
                    address: address,
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    description: description,
                    rent_price: rentPrice,
                    room_type: roomType,
                    area_size: areaSize,
                    facilities: facilities,
                    landlord_rating: landlordRating,
                    location_rating: locationRating,
                    value_rating: valueRating
                });
                
                if (rentalResult.success) {
                    // 重新載入資料
                    await this.loadRentalData();
                    
                    // 聚焦到新添加的位置
                    this.mapManager.focusOnLocation(selectedLocation.lat, selectedLocation.lng);
                    
                    alert('租屋經驗已成功添加！');
                } else {
                    alert('租屋資料添加失敗，請稍後再試。');
                }
                
            } catch (error) {
                console.error('新增租屋經驗錯誤:', error);
                alert('新增失敗：' + (error.message || '請稍後再試。'));
            }
        });
    }

    // 新增租屋經驗（原始地址輸入版本）
    async addNewRental() {
        const address = prompt('請輸入地址（建議格式：台北市○○區○○路 或 台北市○○區）:');
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
            // 地理編碼
            const geocodeData = await this.apiService.geocodeAddress(address);
            
            if (geocodeData.data && geocodeData.data.status === 'OK' && geocodeData.data.results.length > 0) {
                const location = geocodeData.data.results[0].geometry.location;
                
                // 新增租屋資料
                const rentalResult = await this.apiService.createRental({
                    address: geocodeData.data.results[0].formatted_address,
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
                });
                
                if (rentalResult.success) {
                    // 重新載入資料
                    await this.loadRentalData();
                    
                    // 聚焦到新添加的位置
                    this.mapManager.focusOnLocation(location.lat, location.lng);
                    
                    alert('租屋經驗已成功添加！');
                } else {
                    alert('租屋資料添加失敗，請稍後再試。');
                }
            } else {
                alert('無法找到該地址。\n\n建議嘗試：\n• 台北市信義區（區級地址）\n• 台北市信義區信義路（路級地址）\n• 台北101（知名地標）');
            }
        } catch (error) {
            console.error('新增租屋經驗錯誤:', error);
            alert('新增失敗：' + (error.message || '請稍後再試。'));
        }
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.RentalApp = RentalApp;
}