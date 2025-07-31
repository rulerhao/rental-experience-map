class RentalFormManager {
    constructor(apiService, mapManager) {
        this.apiService = apiService;
        this.mapManager = mapManager;
        this.currentLocation = null;
        this.selectedFacilities = new Set();
        this.ratings = {
            landlord: 0,
            location: 0,
            value: 0
        };
        
        this.init();
    }

    init() {
        this.createFormHTML();
        this.bindEvents();
    }

    createFormHTML() {
        const formHTML = `
            <div class="rental-form-overlay" id="rentalFormOverlay">
                <div class="rental-form-container">
                    <div class="rental-form-header">
                        <h2>📍 新增租屋經驗</h2>
                        <p>分享你的租屋經驗，幫助其他人找到好房子</p>
                        <button class="close-btn" id="closeFormBtn">&times;</button>
                    </div>
                    
                    <div class="rental-form-body">
                        <form id="rentalForm">
                            <!-- 位置選擇區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">📍</span>
                                    位置資訊
                                </div>
                                
                                <div class="location-section">
                                    <div class="location-methods">
                                        <div class="location-method active" data-method="map">
                                            <span class="icon">🗺️</span>
                                            <div class="title">地圖選點</div>
                                            <div class="desc">在地圖上點選位置</div>
                                        </div>
                                    </div>
                                    
                                    <div id="selectedLocation" class="selected-location" style="display: none;">
                                        <div class="location-info">
                                            <span class="icon">✅</span>
                                            <div>
                                                <div class="address" id="selectedAddress"></div>
                                                <div class="coords" id="selectedCoords"></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div id="locationPrompt" class="location-prompt">
                                        <div class="prompt-content">
                                            <span class="prompt-icon">👆</span>
                                            <div class="prompt-text">
                                                <div class="prompt-title">請選擇租屋位置</div>
                                                <div class="prompt-desc">點擊上方按鈕開始在地圖上選點</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 基本資訊區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">🏠</span>
                                    基本資訊
                                </div>
                                
                                <div class="form-group">
                                    <label for="description">租屋經驗描述 <span class="required">*</span></label>
                                    <textarea id="description" class="form-control" rows="4" 
                                              placeholder="請詳細描述你的租屋經驗，包括房屋狀況、周邊環境、房東互動等..."></textarea>
                                    <div class="error-message">請輸入租屋經驗描述</div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="form-group">
                                            <label for="rentPrice">租金（元/月）</label>
                                            <input type="number" id="rentPrice" class="form-control" 
                                                   placeholder="25000" min="0">
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="form-group">
                                            <label for="roomType">房型</label>
                                            <select id="roomType" class="form-control">
                                                <option value="">請選擇</option>
                                                <option value="套房">套房</option>
                                                <option value="雅房">雅房</option>
                                                <option value="分租套房">分租套房</option>
                                                <option value="整層住家">整層住家</option>
                                                <option value="獨立套房">獨立套房</option>
                                                <option value="其他">其他</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="areaSize">坪數</label>
                                    <input type="number" id="areaSize" class="form-control" 
                                           placeholder="15.5" min="0" step="0.1">
                                </div>
                                
                                <div class="form-group">
                                    <label for="facilities">房屋設施</label>
                                    <input type="text" id="facilities" class="form-control" 
                                           placeholder="點選下方標籤或手動輸入，用逗號分隔">
                                    <div class="facility-tags">
                                        <span class="facility-tag" data-facility="冷氣">❄️ 冷氣</span>
                                        <span class="facility-tag" data-facility="洗衣機">🧺 洗衣機</span>
                                        <span class="facility-tag" data-facility="網路">🌐 網路</span>
                                        <span class="facility-tag" data-facility="電視">📺 電視</span>
                                        <span class="facility-tag" data-facility="冰箱">🧊 冰箱</span>
                                        <span class="facility-tag" data-facility="熱水器">🚿 熱水器</span>
                                        <span class="facility-tag" data-facility="停車位">🚗 停車位</span>
                                        <span class="facility-tag" data-facility="電梯">🛗 電梯</span>
                                        <span class="facility-tag" data-facility="陽台">🌿 陽台</span>
                                        <span class="facility-tag" data-facility="廚房">🍳 廚房</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 評分區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">⭐</span>
                                    評分 <span class="required">*</span>
                                </div>
                                
                                <div class="rating-group">
                                    <div class="rating-item">
                                        <label>房東評分</label>
                                        <div class="star-rating" data-rating="landlord">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="landlordRatingText">請選擇評分</div>
                                    </div>
                                    
                                    <div class="rating-item">
                                        <label>地點評分</label>
                                        <div class="star-rating" data-rating="location">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="locationRatingText">請選擇評分</div>
                                    </div>
                                    
                                    <div class="rating-item">
                                        <label>性價比評分</label>
                                        <div class="star-rating" data-rating="value">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="valueRatingText">請選擇評分</div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">
                                    取消
                                </button>
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    <span class="btn-text">新增租屋經驗</span>
                                    <div class="loading-spinner" style="display: none;"></div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', formHTML);
    }

    bindEvents() {
        // 關閉表單
        document.getElementById('closeFormBtn').addEventListener('click', () => this.hide());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hide());
        
        // 點擊遮罩關閉
        document.getElementById('rentalFormOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'rentalFormOverlay') {
                this.hide();
            }
        });

        // 位置選擇方式切換（現在只有地圖選點）
        document.querySelectorAll('.location-method').forEach(method => {
            method.addEventListener('click', () => this.startMapSelection());
        });

        // 設施標籤選擇
        document.querySelectorAll('.facility-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleFacility(tag));
        });

        // 星級評分
        document.querySelectorAll('.star-rating').forEach(ratingGroup => {
            const stars = ratingGroup.querySelectorAll('.star');
            const ratingType = ratingGroup.dataset.rating;
            
            stars.forEach(star => {
                star.addEventListener('click', () => this.setRating(ratingType, parseInt(star.dataset.value)));
                star.addEventListener('mouseenter', () => this.highlightStars(ratingGroup, parseInt(star.dataset.value)));
            });
            
            ratingGroup.addEventListener('mouseleave', () => this.resetStarHighlight(ratingGroup, ratingType));
        });

        // 表單提交
        document.getElementById('rentalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // ESC 鍵關閉
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible()) {
                this.hide();
            }
        });
    }

    // 移除switchLocationMethod，因為現在只有地圖選點

    startMapSelection() {
        this.hide(); // 暫時隱藏表單
        alert('請在地圖上點擊選擇租屋位置');
        
        this.mapManager.startLocationSelection(async (selectedLocation) => {
            try {
                // 反向地理編碼獲取地址
                const address = await this.mapManager.reverseGeocode(selectedLocation.lat, selectedLocation.lng);
                
                this.currentLocation = {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    address: address
                };
                
                this.updateSelectedLocation();
                this.show(); // 重新顯示表單
            } catch (error) {
                console.error('獲取地址失敗:', error);
                this.currentLocation = {
                    lat: selectedLocation.lat,
                    lng: selectedLocation.lng,
                    address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
                };
                this.updateSelectedLocation();
                this.show();
            }
        });
    }

    stopMapSelection() {
        this.mapManager.stopLocationSelection();
        this.currentLocation = null;
        this.updateSelectedLocation();
    }

    updateSelectedLocation() {
        const selectedLocationDiv = document.getElementById('selectedLocation');
        const selectedAddress = document.getElementById('selectedAddress');
        const selectedCoords = document.getElementById('selectedCoords');
        
        if (this.currentLocation) {
            selectedLocationDiv.style.display = 'block';
            selectedAddress.textContent = this.currentLocation.address;
            selectedCoords.textContent = `${this.currentLocation.lat.toFixed(6)}, ${this.currentLocation.lng.toFixed(6)}`;
        } else {
            selectedLocationDiv.style.display = 'none';
        }
    }

    toggleFacility(tag) {
        const facility = tag.dataset.facility;
        
        if (this.selectedFacilities.has(facility)) {
            this.selectedFacilities.delete(facility);
            tag.classList.remove('selected');
        } else {
            this.selectedFacilities.add(facility);
            tag.classList.add('selected');
        }
        
        this.updateFacilitiesInput();
    }

    updateFacilitiesInput() {
        const facilitiesInput = document.getElementById('facilities');
        facilitiesInput.value = Array.from(this.selectedFacilities).join(',');
    }

    setRating(type, value) {
        this.ratings[type] = value;
        this.updateRatingDisplay(type, value);
    }

    highlightStars(ratingGroup, value) {
        const stars = ratingGroup.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    resetStarHighlight(ratingGroup, ratingType) {
        const currentRating = this.ratings[ratingType];
        this.highlightStars(ratingGroup, currentRating);
    }

    updateRatingDisplay(type, value) {
        const textElement = document.getElementById(`${type}RatingText`);
        const ratingTexts = {
            1: '很差',
            2: '不好',
            3: '普通',
            4: '不錯',
            5: '很好'
        };
        textElement.textContent = `${value} 星 - ${ratingTexts[value]}`;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');
        
        // 顯示載入狀態
        submitBtn.disabled = true;
        btnText.textContent = '新增中...';
        spinner.style.display = 'inline-block';

        try {
            // 現在只使用地圖選點，必須有位置資料
            if (!this.currentLocation) {
                throw new Error('請先在地圖上選擇位置');
            }

            // 收集表單資料
            const formData = {
                address: this.currentLocation.address,
                lat: this.currentLocation.lat,
                lng: this.currentLocation.lng,
                description: document.getElementById('description').value.trim(),
                rent_price: parseInt(document.getElementById('rentPrice').value) || null,
                room_type: document.getElementById('roomType').value || null,
                area_size: parseFloat(document.getElementById('areaSize').value) || null,
                facilities: document.getElementById('facilities').value.trim() || null,
                landlord_rating: this.ratings.landlord,
                location_rating: this.ratings.location,
                value_rating: this.ratings.value
            };

            // 提交資料
            const result = await this.apiService.createRental(formData);
            
            if (result.success) {
                this.hide();
                this.reset();
                
                // 觸發成功回調
                if (this.onSuccess) {
                    this.onSuccess(this.currentLocation);
                }
                
                // 顯示成功訊息
                this.showSuccessMessage();
            } else {
                throw new Error(result.message || '新增失敗');
            }
            
        } catch (error) {
            console.error('新增租屋經驗失敗:', error);
            alert('新增失敗：' + error.message);
        } finally {
            // 恢復按鈕狀態
            submitBtn.disabled = false;
            btnText.textContent = '新增租屋經驗';
            spinner.style.display = 'none';
        }
    }

    validateForm() {
        let isValid = true;
        
        // 清除之前的錯誤狀態
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });

        // 驗證位置
        const addressInput = document.getElementById('address');
        if (!this.currentLocation && !addressInput.value.trim()) {
            this.showFieldError('addressGroup', '請選擇位置或輸入地址');
            isValid = false;
        }

        // 驗證描述
        const description = document.getElementById('description').value.trim();
        if (!description) {
            this.showFieldError('description', '請輸入租屋經驗描述');
            isValid = false;
        }

        // 驗證評分
        if (!this.ratings.landlord || !this.ratings.location || !this.ratings.value) {
            alert('請完成所有評分項目');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group') || document.getElementById(fieldId + 'Group');
        if (formGroup) {
            formGroup.classList.add('error');
            const errorMsg = formGroup.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = message;
            }
        }
    }

    showSuccessMessage() {
        // 創建成功提示
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            font-weight: 500;
        `;
        successDiv.innerHTML = '✅ 租屋經驗已成功新增！';
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    show() {
        document.getElementById('rentalFormOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        document.getElementById('rentalFormOverlay').classList.remove('active');
        document.body.style.overflow = '';
        this.stopMapSelection();
    }

    isVisible() {
        return document.getElementById('rentalFormOverlay').classList.contains('active');
    }

    reset() {
        // 重置表單
        document.getElementById('rentalForm').reset();
        
        // 重置狀態
        this.currentLocation = null;
        this.selectedFacilities.clear();
        this.ratings = { landlord: 0, location: 0, value: 0 };
        
        // 重置UI
        document.querySelectorAll('.facility-tag').forEach(tag => tag.classList.remove('selected'));
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        document.querySelectorAll('.rating-text').forEach(text => text.textContent = '請選擇評分');
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
        
        // 重置位置選擇
        document.querySelectorAll('.location-method').forEach(m => m.classList.remove('active'));
        document.querySelector('[data-method="address"]').classList.add('active');
        document.getElementById('addressGroup').style.display = 'block';
        this.updateSelectedLocation();
    }

    // 設置成功回調
    setOnSuccess(callback) {
        this.onSuccess = callback;
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.RentalFormManager = RentalFormManager;
}