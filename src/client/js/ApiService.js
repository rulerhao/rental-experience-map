class ApiService {
    constructor() {
        this.baseUrl = '/api';
    }

    // 處理API回應的通用方法
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    }

    // === 租屋資料 API ===

    // 獲取所有租屋資料（支援分頁和排序）
    async getRentals(options = {}) {
        try {
            const { page = 1, limit = 10, sort = 'created_at', order = 'desc' } = options;
            const params = new URLSearchParams({ page, limit, sort, order });

            const response = await fetch(`${this.baseUrl}/rentals?${params}`);
            const result = await this.handleResponse(response);

            return result.data; // 返回實際資料，保持向後相容
        } catch (error) {
            console.error('載入租屋資料錯誤:', error);
            throw error;
        }
    }

    // 根據ID獲取單一租屋資料
    async getRentalById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${id}`);
            const result = await this.handleResponse(response);

            return result.data;
        } catch (error) {
            console.error('獲取租屋資料錯誤:', error);
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

            const result = await this.handleResponse(response);
            return result; // 返回完整結果，包含success和data
        } catch (error) {
            console.error('新增租屋資料錯誤:', error);
            throw error;
        }
    }

    // 更新租屋資料
    async updateRental(id, rentalData) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentalData)
            });

            const result = await this.handleResponse(response);
            return result;
        } catch (error) {
            console.error('更新租屋資料錯誤:', error);
            throw error;
        }
    }

    // 刪除租屋資料
    async deleteRental(id) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${id}`, {
                method: 'DELETE'
            });

            const result = await this.handleResponse(response);
            return result;
        } catch (error) {
            console.error('刪除租屋資料錯誤:', error);
            throw error;
        }
    }

    // === 評分 API ===

    // 獲取特定租屋的評分
    async getRatingsByRentalId(rentalId) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings`);
            const result = await this.handleResponse(response);

            return result.data; // 返回實際資料，保持向後相容
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }

    // 根據ID獲取單一評分
    async getRatingById(rentalId, ratingId) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings/${ratingId}`);
            const result = await this.handleResponse(response);

            return result.data;
        } catch (error) {
            console.error('獲取評分資料錯誤:', error);
            throw error;
        }
    }

    // 新增評分
    async addRating(rentalId, ratingData) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData)
            });

            const result = await this.handleResponse(response);
            return result; // 返回完整結果，包含success和data
        } catch (error) {
            console.error('新增評分錯誤:', error);
            throw error;
        }
    }

    // 更新評分
    async updateRating(rentalId, ratingId, ratingData) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings/${ratingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ratingData)
            });

            const result = await this.handleResponse(response);
            return result;
        } catch (error) {
            console.error('更新評分錯誤:', error);
            throw error;
        }
    }

    // 刪除評分
    async deleteRating(rentalId, ratingId) {
        try {
            const response = await fetch(`${this.baseUrl}/rentals/${rentalId}/ratings/${ratingId}`, {
                method: 'DELETE'
            });

            const result = await this.handleResponse(response);
            return result;
        } catch (error) {
            console.error('刪除評分錯誤:', error);
            throw error;
        }
    }

    // === 地理編碼 API ===

    // 地理編碼
    async geocodeAddress(address) {
        try {
            const response = await fetch(`${this.baseUrl}/geocoding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address })
            });

            const result = await this.handleResponse(response);
            return result.data; // 返回座標資料，保持向後相容
        } catch (error) {
            console.error('地理編碼錯誤:', error);
            throw error;
        }
    }

    // === 向後相容的方法 ===

    // 舊版addRating方法，為了向後相容
    async addRatingLegacy(ratingData) {
        // 從ratingData中提取rental_id
        const { rental_id, ...restData } = ratingData;
        return this.addRating(rental_id, restData);
    }
}

// 如果在瀏覽器環境中，將類別添加到全域
if (typeof window !== 'undefined') {
    window.ApiService = ApiService;
}