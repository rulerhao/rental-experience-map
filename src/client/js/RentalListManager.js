class RentalListManager {
    constructor() {
        this.rentalList = document.getElementById('rental-list');
    }

    // 清空租屋列表
    clearList() {
        if (this.rentalList) {
            this.rentalList.innerHTML = '';
        }
    }

    // 添加租屋項目到列表
    addRentalItem(rental, onClickCallback, onAddRatingCallback) {
        if (!this.rentalList) return;

        const item = this.createRentalItem(rental, onClickCallback, onAddRatingCallback);
        this.rentalList.appendChild(item);
    }

    // 創建租屋項目元素
    createRentalItem(rental, onClickCallback, onAddRatingCallback) {
        const item = document.createElement('div');
        item.className = 'rental-item';
        item.dataset.id = rental.id;
        
        const starsHtml = this.generateStarsHtml(rental.overall_rating || 0);
        const rentPrice = rental.rent_price ? `NT${rental.rent_price.toLocaleString()}` : '價格未提供';
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
            <button class="add-rating-btn" onclick="event.stopPropagation(); ${onAddRatingCallback ? `${onAddRatingCallback.name}(${rental.id})` : ''}">新增評分</button>
        `;
        
        // 點擊項目時的處理
        item.addEventListener('click', (e) => {
            // 避免按鈕點擊觸發項目點擊
            if (e.target.classList.contains('add-rating-btn')) return;
            
            if (onClickCallback) {
                onClickCallback(rental);
            }
        });
        
        return item;
    }

    // 高亮顯示選中的租屋項目
    highlightItem(id) {
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
    window.RentalListManager = RentalListManager;
}