class ApiService {
    constructor() {
        this.baseUrl = '/api';
    }

    // 獲取所有租屋資料
    async getRentals() {
        try {
            const response = await fetch(`${this.baseUrl}/rentals`);
            if (!response.ok) {
                throw new Error('獲取租屋資料失敗');
            }
            return await response.json();
        } catch (error) {
            console.error('載入租屋資料錯誤:', error);
            throw error;
        }
    }

    // 新增租屋資料
    async createRental(rentalData) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentalData)
            });

            if (!response.ok) {
                throw new Error('新增租屋資料失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('新增租屋資料錯誤:', error);
            throw error;
        }
    }

    // 新增評分
    async addRating(ratingData) {
        try {
            const response = await fetch(`${this.baseUrl}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData)
            });

            if (!response.ok) {
                throw new Error('新增評分失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('新增評分錯誤:', error);
            throw error;
        }
    }

    // 獲取特定租屋的評分
    async getRatingsByRentalId(rentalId) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings`);
            if (!response.ok) {
                throw new Error('獲取評分資料失敗');
            }
            return await response.json();
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }

    // 地理編碼
    async geocodeAddress(address) {
        try {
            const response = await fetch(`${this.baseUrl}/geocode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address })
            });

            if (!response.ok) {
                throw new Error('地理編碼失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('地理編碼錯誤:', error);
            throw error;
        }
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.ApiService = ApiService;
}