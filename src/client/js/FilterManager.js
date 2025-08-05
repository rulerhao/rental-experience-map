class FilterManager {
    constructor(i18nService) {
        this.i18n = i18nService || window.i18n;
        this.filters = {
            roomType: '',
            district: '',
            rating: '',
            facilities: [],
            minPrice: null,
            maxPrice: null
        };
        this.onFilterChange = null;
        this.allRentals = [];
        
        this.init();
        
        // Subscribe to language changes
        if (this.i18n) {
            this.i18n.subscribe(() => {
                this.updateFilterTexts();
            });
        }
    }

    init() {
        this.bindEvents();
        this.populateDistrictFilter();
    }

    // 綁定篩選器事件
    bindEvents() {
        // 房型篩選
        const roomTypeFilter = document.getElementById('roomTypeFilter');
        if (roomTypeFilter) {
            roomTypeFilter.addEventListener('change', (e) => {
                this.filters.roomType = e.target.value;
                this.applyFilters();
            });
        }

        // 行政區篩選
        const districtFilter = document.getElementById('districtFilter');
        if (districtFilter) {
            districtFilter.addEventListener('change', (e) => {
                this.filters.district = e.target.value;
                this.applyFilters();
            });
        }

        // 評分篩選
        const ratingFilter = document.getElementById('ratingFilter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', (e) => {
                this.filters.rating = e.target.value;
                this.applyFilters();
            });
        }

        // 設施篩選
        const facilityCheckboxes = document.querySelectorAll('.facility-checkbox input');
        facilityCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFacilityFilters();
                this.applyFilters();
            });
        });

        // 租金範圍篩選
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('input', (e) => {
                this.filters.minPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }

        if (maxPriceInput) {
            maxPriceInput.addEventListener('input', (e) => {
                this.filters.maxPrice = e.target.value ? parseInt(e.target.value) : null;
                this.applyFilters();
            });
        }
    }

    // 更新設施篩選
    updateFacilityFilters() {
        const checkedFacilities = [];
        const facilityCheckboxes = document.querySelectorAll('.facility-checkbox input:checked');
        facilityCheckboxes.forEach(checkbox => {
            checkedFacilities.push(checkbox.value);
        });
        this.filters.facilities = checkedFacilities;
    }

    // 填充行政區篩選選項
    populateDistrictFilter() {
        const districtFilter = document.getElementById('districtFilter');
        if (!districtFilter) return;

        // 從現有租屋資料中提取行政區
        const districts = new Set();
        this.allRentals.forEach(rental => {
            if (rental.address) {
                const district = this.extractDistrict(rental.address);
                if (district) {
                    districts.add(district);
                }
            }
        });

        // 清除現有選項（保留"全部"選項）
        const allOption = districtFilter.querySelector('option[value=""]');
        districtFilter.innerHTML = '';
        if (allOption) {
            districtFilter.appendChild(allOption);
        }

        // 添加行政區選項
        Array.from(districts).sort().forEach(district => {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtFilter.appendChild(option);
        });
    }

    // 從地址中提取行政區
    extractDistrict(address) {
        // 匹配台灣行政區格式：縣市 + 區/鄉/鎮/市
        const match = address.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)([^區鄉鎮市]*[區鄉鎮市])/);
        
        if (match) {
            return match[1] + match[2]; // 縣市 + 區/鄉/鎮/市
        }

        // 如果沒有匹配到完整格式，嘗試只匹配縣市
        const cityMatch = address.match(/(台北市|新北市|桃園市|台中市|台南市|高雄市|基隆市|新竹市|嘉義市|新竹縣|苗栗縣|彰化縣|南投縣|雲林縣|嘉義縣|屏東縣|宜蘭縣|花蓮縣|台東縣|澎湖縣|金門縣|連江縣)/);
        
        return cityMatch ? cityMatch[1] : null;
    }

    // 設定租屋資料
    setRentals(rentals) {
        this.allRentals = rentals;
        this.populateDistrictFilter();
    }

    // 應用篩選
    applyFilters() {
        const filteredRentals = this.allRentals.filter(rental => {
            // 房型篩選
            if (this.filters.roomType && rental.room_type !== this.filters.roomType) {
                return false;
            }

            // 行政區篩選
            if (this.filters.district) {
                const rentalDistrict = this.extractDistrict(rental.address);
                if (rentalDistrict !== this.filters.district) {
                    return false;
                }
            }

            // 評分篩選
            if (this.filters.rating) {
                const minRating = parseFloat(this.filters.rating);
                if (!rental.overall_rating || rental.overall_rating < minRating) {
                    return false;
                }
            }

            // 設施篩選
            if (this.filters.facilities.length > 0) {
                const rentalFacilities = rental.facilities ? rental.facilities.split(',').map(f => f.trim()) : [];
                const hasAllFacilities = this.filters.facilities.every(facility => 
                    rentalFacilities.includes(facility)
                );
                if (!hasAllFacilities) {
                    return false;
                }
            }

            // 租金範圍篩選
            if (this.filters.minPrice !== null && (!rental.rent_price || rental.rent_price < this.filters.minPrice)) {
                return false;
            }
            if (this.filters.maxPrice !== null && (!rental.rent_price || rental.rent_price > this.filters.maxPrice)) {
                return false;
            }

            return true;
        });

        // 觸發篩選變更回調
        if (this.onFilterChange) {
            this.onFilterChange(filteredRentals);
        }
    }

    // 清除所有篩選
    clearAllFilters() {
        // 重置篩選狀態
        this.filters = {
            roomType: '',
            district: '',
            rating: '',
            facilities: [],
            minPrice: null,
            maxPrice: null
        };

        // 重置UI元素
        const roomTypeFilter = document.getElementById('roomTypeFilter');
        if (roomTypeFilter) roomTypeFilter.value = '';

        const districtFilter = document.getElementById('districtFilter');
        if (districtFilter) districtFilter.value = '';

        const ratingFilter = document.getElementById('ratingFilter');
        if (ratingFilter) ratingFilter.value = '';

        const facilityCheckboxes = document.querySelectorAll('.facility-checkbox input');
        facilityCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        const minPriceInput = document.getElementById('minPrice');
        if (minPriceInput) minPriceInput.value = '';

        const maxPriceInput = document.getElementById('maxPrice');
        if (maxPriceInput) maxPriceInput.value = '';

        // 應用篩選（顯示所有資料）
        this.applyFilters();
    }

    // 設定篩選變更回調
    setOnFilterChange(callback) {
        this.onFilterChange = callback;
    }

    // 更新篩選器文字（多語言支援）
    updateFilterTexts() {
        if (!this.i18n) return;

        const t = (key, params) => this.i18n.t(key, params);

        // 更新所有帶有 data-i18n 屬性的元素
        document.querySelectorAll('.filter-section [data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = t(key);
        });

        // 更新房型選項
        const roomTypeFilter = document.getElementById('roomTypeFilter');
        if (roomTypeFilter) {
            const options = roomTypeFilter.querySelectorAll('option');
            options.forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = t(key);
                }
            });
        }

        // 更新行政區選項的"全部"選項
        const districtFilter = document.getElementById('districtFilter');
        if (districtFilter) {
            const allOption = districtFilter.querySelector('option[value=""]');
            if (allOption) {
                allOption.textContent = t('filters.all');
            }
        }

        // 更新評分選項的"全部"選項
        const ratingFilter = document.getElementById('ratingFilter');
        if (ratingFilter) {
            const allOption = ratingFilter.querySelector('option[value=""]');
            if (allOption) {
                allOption.textContent = t('filters.all');
            }
        }
    }

    // 獲取當前篩選狀態
    getCurrentFilters() {
        return { ...this.filters };
    }

    // 獲取篩選後的租屋數量
    getFilteredCount() {
        return this.allRentals.filter(rental => {
            // 重複篩選邏輯（可以考慮重構）
            if (this.filters.roomType && rental.room_type !== this.filters.roomType) return false;
            if (this.filters.district) {
                const rentalDistrict = this.extractDistrict(rental.address);
                if (rentalDistrict !== this.filters.district) return false;
            }
            if (this.filters.rating) {
                const minRating = parseFloat(this.filters.rating);
                if (!rental.overall_rating || rental.overall_rating < minRating) return false;
            }
            if (this.filters.facilities.length > 0) {
                const rentalFacilities = rental.facilities ? rental.facilities.split(',').map(f => f.trim()) : [];
                const hasAllFacilities = this.filters.facilities.every(facility => 
                    rentalFacilities.includes(facility)
                );
                if (!hasAllFacilities) return false;
            }
            if (this.filters.minPrice !== null && (!rental.rent_price || rental.rent_price < this.filters.minPrice)) return false;
            if (this.filters.maxPrice !== null && (!rental.rent_price || rental.rent_price > this.filters.maxPrice)) return false;
            return true;
        }).length;
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.FilterManager = FilterManager;
}