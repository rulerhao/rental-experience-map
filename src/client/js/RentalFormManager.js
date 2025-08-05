class RentalFormManager {
    constructor(apiService, mapManager, i18nService) {
        this.apiService = apiService;
        this.mapManager = mapManager;
        this.i18n = i18nService || window.i18n;
        this.currentLocation = null;
        this.selectedFacilities = new Set();
        this.ratings = {
            landlord: 0,
            location: 0,
            value: 0
        };

        this.init();

        // Subscribe to language changes
        if (this.i18n) {
            this.i18n.subscribe(() => {
                this.updateFormTexts();
            });
        }
    }

    init() {
        this.createFormHTML();
        this.bindEvents();
    }

    createFormHTML() {
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;

        const formHTML = `
            <div class="rental-form-overlay" id="rentalFormOverlay">
                <div class="rental-form-container">
                    <div class="rental-form-header">
                        <h2>📍 <span data-i18n="form.title">${t('form.title')}</span></h2>
                        <p data-i18n="form.subtitle">${t('form.subtitle')}</p>
                        <button class="close-btn" id="closeFormBtn">&times;</button>
                    </div>
                    
                    <div class="rental-form-body">
                        <form id="rentalForm">
                            <!-- 位置選擇區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">📍</span>
                                    <span data-i18n="form.location.title">${t('form.location.title')}</span>
                                </div>
                                
                                <div class="location-section">
                                    <div class="location-methods">
                                        <div class="location-method active" data-method="map">
                                            <span class="icon">🗺️</span>
                                            <div class="title" data-i18n="form.location.mapSelection">${t('form.location.mapSelection')}</div>
                                            <div class="desc" data-i18n="form.location.mapSelectionDesc">${t('form.location.mapSelectionDesc')}</div>
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
                                                <div class="prompt-title" data-i18n="form.location.selectPrompt">${t('form.location.selectPrompt')}</div>
                                                <div class="prompt-desc" data-i18n="form.location.selectPromptDesc">${t('form.location.selectPromptDesc')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 基本資訊區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">🏠</span>
                                    <span data-i18n="form.basicInfo.title">${t('form.basicInfo.title')}</span>
                                </div>
                                
                                <div class="form-group">
                                    <label for="descriptiveAddress">
                                        <span data-i18n="form.basicInfo.address">${t('form.basicInfo.address')}</span>
                                    </label>
                                    <input type="text" id="descriptiveAddress" class="form-control" 
                                           data-i18n-placeholder="form.basicInfo.addressPlaceholder"
                                           placeholder="${t('form.basicInfo.addressPlaceholder')}">
                                </div>
                                
                                <div class="form-group">
                                    <label for="description">
                                        <span data-i18n="form.basicInfo.description">${t('form.basicInfo.description')}</span> 
                                        <span class="required">*</span>
                                    </label>
                                    <textarea id="description" class="form-control" rows="4" 
                                              data-i18n-placeholder="form.basicInfo.descriptionPlaceholder"
                                              placeholder="${t('form.basicInfo.descriptionPlaceholder')}"></textarea>
                                    <div class="error-message" data-i18n="form.basicInfo.descriptionRequired">${t('form.basicInfo.descriptionRequired')}</div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-col">
                                        <div class="form-group">
                                            <label for="rentPrice" data-i18n="form.basicInfo.rentPrice">${t('form.basicInfo.rentPrice')}</label>
                                            <input type="number" id="rentPrice" class="form-control" 
                                                   data-i18n-placeholder="form.basicInfo.rentPricePlaceholder"
                                                   placeholder="${t('form.basicInfo.rentPricePlaceholder')}" min="0">
                                        </div>
                                    </div>
                                    <div class="form-col">
                                        <div class="form-group">
                                            <label for="roomType" data-i18n="form.basicInfo.roomType">${t('form.basicInfo.roomType')}</label>
                                            <select id="roomType" class="form-control">
                                                <option value="">${t('form.basicInfo.roomTypeSelect')}</option>
                                                <option value="套房">${t('form.roomTypes.studio')}</option>
                                                <option value="雅房">${t('form.roomTypes.shared')}</option>
                                                <option value="分租套房">${t('form.roomTypes.sharedStudio')}</option>
                                                <option value="整層住家">${t('form.roomTypes.wholeFloor')}</option>
                                                <option value="獨立套房">${t('form.roomTypes.independent')}</option>
                                                <option value="其他">${t('form.roomTypes.other')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="areaSize" data-i18n="form.basicInfo.areaSize">${t('form.basicInfo.areaSize')}</label>
                                    <input type="number" id="areaSize" class="form-control" 
                                           data-i18n-placeholder="form.basicInfo.areaSizePlaceholder"
                                           placeholder="${t('form.basicInfo.areaSizePlaceholder')}" min="0" step="0.1">
                                </div>
                                
                                <div class="form-group">
                                    <label for="facilities" data-i18n="form.basicInfo.facilities">${t('form.basicInfo.facilities')}</label>
                                    <input type="text" id="facilities" class="form-control" 
                                           data-i18n-placeholder="form.basicInfo.facilitiesPlaceholder"
                                           placeholder="${t('form.basicInfo.facilitiesPlaceholder')}">
                                    <div class="facility-tags">
                                        <span class="facility-tag" data-facility="冷氣">❄️ ${t('form.facilities.aircon')}</span>
                                        <span class="facility-tag" data-facility="洗衣機">🧺 ${t('form.facilities.washingMachine')}</span>
                                        <span class="facility-tag" data-facility="網路">🌐 ${t('form.facilities.internet')}</span>
                                        <span class="facility-tag" data-facility="電視">📺 ${t('form.facilities.tv')}</span>
                                        <span class="facility-tag" data-facility="冰箱">🧊 ${t('form.facilities.fridge')}</span>
                                        <span class="facility-tag" data-facility="熱水器">🚿 ${t('form.facilities.waterHeater')}</span>
                                        <span class="facility-tag" data-facility="停車位">🚗 ${t('form.facilities.parking')}</span>
                                        <span class="facility-tag" data-facility="電梯">🛗 ${t('form.facilities.elevator')}</span>
                                        <span class="facility-tag" data-facility="陽台">🌿 ${t('form.facilities.balcony')}</span>
                                        <span class="facility-tag" data-facility="廚房">🍳 ${t('form.facilities.kitchen')}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 評分區塊 -->
                            <div class="form-section">
                                <div class="section-title">
                                    <span class="section-icon">⭐</span>
                                    <span data-i18n="form.rating.title">${t('form.rating.title')}</span> <span class="required">*</span>
                                </div>
                                
                                <div class="rating-group">
                                    <div class="rating-item">
                                        <label data-i18n="form.rating.landlord">${t('form.rating.landlord')}</label>
                                        <div class="star-rating" data-rating="landlord">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="landlordRatingText" data-i18n="form.rating.selectRating">${t('form.rating.selectRating')}</div>
                                    </div>
                                    
                                    <div class="rating-item">
                                        <label data-i18n="form.rating.location">${t('form.rating.location')}</label>
                                        <div class="star-rating" data-rating="location">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="locationRatingText" data-i18n="form.rating.selectRating">${t('form.rating.selectRating')}</div>
                                    </div>
                                    
                                    <div class="rating-item">
                                        <label data-i18n="form.rating.value">${t('form.rating.value')}</label>
                                        <div class="star-rating" data-rating="value">
                                            <span class="star" data-value="1">★</span>
                                            <span class="star" data-value="2">★</span>
                                            <span class="star" data-value="3">★</span>
                                            <span class="star" data-value="4">★</span>
                                            <span class="star" data-value="5">★</span>
                                        </div>
                                        <div class="rating-text" id="valueRatingText" data-i18n="form.rating.selectRating">${t('form.rating.selectRating')}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn" data-i18n="form.cancel">
                                    ${t('form.cancel')}
                                </button>
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    <span class="btn-text" data-i18n="form.submit">${t('form.submit')}</span>
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

    // Update form texts when language changes
    updateFormTexts() {
        if (!this.i18n) return;

        const t = (key, params) => this.i18n.t(key, params);

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = t(key);
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = t(key);
        });

        // Update rating texts
        this.updateAllRatingTexts();

        // Update facility tags
        this.updateFacilityTags();

        // Update room type options
        this.updateRoomTypeOptions();
    }

    updateAllRatingTexts() {
        if (!this.i18n) return;

        const t = (key, params) => this.i18n.t(key, params);

        ['landlord', 'location', 'value'].forEach(type => {
            const rating = this.ratings[type];
            if (rating > 0) {
                this.updateRatingDisplay(type, rating);
            } else {
                const textElement = document.getElementById(`${type}RatingText`);
                if (textElement) {
                    textElement.textContent = t('form.rating.selectRating');
                }
            }
        });
    }

    updateFacilityTags() {
        if (!this.i18n) return;

        const t = (key, params) => this.i18n.t(key, params);

        const facilityMap = {
            '冷氣': 'aircon',
            '洗衣機': 'washingMachine',
            '網路': 'internet',
            '電視': 'tv',
            '冰箱': 'fridge',
            '熱水器': 'waterHeater',
            '停車位': 'parking',
            '電梯': 'elevator',
            '陽台': 'balcony',
            '廚房': 'kitchen'
        };

        document.querySelectorAll('.facility-tag').forEach(tag => {
            const facility = tag.dataset.facility;
            const facilityKey = facilityMap[facility];
            if (facilityKey) {
                const icon = tag.innerHTML.split(' ')[0]; // Keep the emoji
                tag.innerHTML = `${icon} ${t('form.facilities.' + facilityKey)}`;
            }
        });
    }

    updateRoomTypeOptions() {
        if (!this.i18n) return;

        const t = (key, params) => this.i18n.t(key, params);

        const roomTypeSelect = document.getElementById('roomType');
        if (roomTypeSelect) {
            const options = roomTypeSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                if (value === '') {
                    option.textContent = t('form.basicInfo.roomTypeSelect');
                } else {
                    const roomTypeMap = {
                        '套房': 'studio',
                        '雅房': 'shared',
                        '分租套房': 'sharedStudio',
                        '整層住家': 'wholeFloor',
                        '獨立套房': 'independent',
                        '其他': 'other'
                    };
                    const roomTypeKey = roomTypeMap[value];
                    if (roomTypeKey) {
                        option.textContent = t('form.roomTypes.' + roomTypeKey);
                    }
                }
            });
        }
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
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
        alert(t('form.location.clickToSelect'));

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
                const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
                console.error(t('messages.error.geocodingFailed') + ':', error);
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
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
        const ratingText = t(`form.rating.ratingText.${value}`);
        textElement.textContent = `${value} ★ - ${ratingText}`;
    }

    async handleSubmit() {
        if (!this.validateForm()) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.loading-spinner');

        // 顯示載入狀態
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
        submitBtn.disabled = true;
        btnText.textContent = t('form.submitting');
        spinner.style.display = 'inline-block';

        try {
            // 現在只使用地圖選點，必須有位置資料
            if (!this.currentLocation) {
                throw new Error(t('form.validation.selectLocationFirst'));
            }

            // 收集表單資料
            const formData = {
                address: this.currentLocation.address,
                descriptive_address: document.getElementById('descriptiveAddress').value.trim() || null,
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
                throw new Error(result.message || t('messages.error.addFailed'));
            }

        } catch (error) {
            console.error('新增租屋經驗失敗:', error);
            alert(t('messages.error.addFailed') + '：' + error.message);
        } finally {
            // 恢復按鈕狀態
            submitBtn.disabled = false;
            btnText.textContent = t('form.submit');
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
            const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
            alert(t('form.validation.completeRatings'));
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
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
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
        successDiv.innerHTML = '✅ ' + t('messages.success.rentalAdded');

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
        const t = (key, params) => this.i18n ? this.i18n.t(key, params) : key;
        document.querySelectorAll('.rating-text').forEach(text => text.textContent = t('form.rating.selectRating'));
        document.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));

        // 清空地址欄位
        const descriptiveAddressField = document.getElementById('descriptiveAddress');
        if (descriptiveAddressField) {
            descriptiveAddressField.value = '';
        }

        // 重置位置選擇
        document.querySelectorAll('.location-method').forEach(m => m.classList.remove('active'));
        const mapMethod = document.querySelector('[data-method="map"]');
        if (mapMethod) mapMethod.classList.add('active');
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