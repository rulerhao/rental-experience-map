// 自動化 API 測試腳本
const axios = require('axios');
const colors = require('colors');

class APITester {
    constructor(baseURL = 'http://localhost:3000/api') {
        this.baseURL = baseURL;
        this.testResults = [];
    }

    // 測試結果記錄
    logTest(testName, success, message, data = null) {
        const result = {
            test: testName,
            success,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        this.testResults.push(result);
        
        const status = success ? '✅ PASS'.green : '❌ FAIL'.red;
        console.log(`${status} ${testName}: ${message}`);
        if (data && !success) {
            console.log('   Error details:', data);
        }
    }

    // 等待伺服器啟動
    async waitForServer(maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await axios.get(`${this.baseURL}/rentals`);
                console.log('🚀 伺服器已就緒'.green);
                return true;
            } catch (error) {
                console.log(`⏳ 等待伺服器啟動... (${i + 1}/${maxAttempts})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        throw new Error('伺服器啟動超時');
    }

    // 測試 1: 獲取所有租屋資料
    async testGetAllRentals() {
        try {
            const response = await axios.get(`${this.baseURL}/rentals`);
            const { success, data, message } = response.data;
            
            if (success && Array.isArray(data)) {
                this.logTest('GET /api/rentals', true, `成功獲取 ${data.length} 筆租屋資料`);
                return data;
            } else {
                this.logTest('GET /api/rentals', false, '回應格式不正確', response.data);
                return null;
            }
        } catch (error) {
            this.logTest('GET /api/rentals', false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 2: 獲取單一租屋資料
    async testGetRentalById(id = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/rentals/${id}`);
            const { success, data, message } = response.data;
            
            if (success && data && data.id == id) {
                this.logTest(`GET /api/rentals/${id}`, true, '成功獲取單一租屋資料');
                return data;
            } else {
                this.logTest(`GET /api/rentals/${id}`, false, '資料不正確', response.data);
                return null;
            }
        } catch (error) {
            this.logTest(`GET /api/rentals/${id}`, false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 3: 創建新租屋資料
    async testCreateRental() {
        const testData = {
            address: "測試地址 - 台北市大安區復興南路一段390號",
            lat: 25.0330,
            lng: 121.5654,
            description: "自動化測試創建的租屋資料",
            rent_price: 20000,
            room_type: "套房",
            area_size: 15,
            facilities: "冷氣,網路,洗衣機",
            landlord_rating: 4,
            location_rating: 5,
            value_rating: 3
        };

        try {
            const response = await axios.post(`${this.baseURL}/rentals`, testData);
            const { success, data, message } = response.data;
            
            if (success && data && data.id) {
                this.logTest('POST /api/rentals', true, `成功創建租屋資料，ID: ${data.id}`);
                return data;
            } else {
                this.logTest('POST /api/rentals', false, '創建失敗', response.data);
                return null;
            }
        } catch (error) {
            this.logTest('POST /api/rentals', false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 4: 更新租屋資料
    async testUpdateRental(id) {
        const updateData = {
            description: "更新後的描述 - 自動化測試",
            rent_price: 22000
        };

        try {
            const response = await axios.put(`${this.baseURL}/rentals/${id}`, updateData);
            const { success, data, message } = response.data;
            
            if (success) {
                this.logTest(`PUT /api/rentals/${id}`, true, '成功更新租屋資料');
                return true;
            } else {
                this.logTest(`PUT /api/rentals/${id}`, false, '更新失敗', response.data);
                return false;
            }
        } catch (error) {
            this.logTest(`PUT /api/rentals/${id}`, false, error.message, error.response?.data);
            return false;
        }
    }

    // 測試 5: 獲取租屋評分
    async testGetRatings(rentalId = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/rentals/${rentalId}/ratings`);
            const { success, data, message } = response.data;
            
            if (success && Array.isArray(data)) {
                this.logTest(`GET /api/rentals/${rentalId}/ratings`, true, `成功獲取 ${data.length} 筆評分資料`);
                return data;
            } else {
                this.logTest(`GET /api/rentals/${rentalId}/ratings`, false, '回應格式不正確', response.data);
                return null;
            }
        } catch (error) {
            this.logTest(`GET /api/rentals/${rentalId}/ratings`, false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 6: 新增評分
    async testCreateRating(rentalId = 1) {
        const ratingData = {
            user_name: "自動化測試用戶",
            landlord_rating: 5,
            location_rating: 4,
            value_rating: 4,
            comment: "這是自動化測試的評分"
        };

        try {
            const response = await axios.post(`${this.baseURL}/rentals/${rentalId}/ratings`, ratingData);
            const { success, data, message } = response.data;
            
            if (success && data && data.id) {
                this.logTest(`POST /api/rentals/${rentalId}/ratings`, true, `成功新增評分，ID: ${data.id}`);
                return data;
            } else {
                this.logTest(`POST /api/rentals/${rentalId}/ratings`, false, '新增評分失敗', response.data);
                return null;
            }
        } catch (error) {
            this.logTest(`POST /api/rentals/${rentalId}/ratings`, false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 7: 地理編碼
    async testGeocoding() {
        const geocodeData = {
            address: "台北市信義區信義路五段7號"
        };

        try {
            const response = await axios.post(`${this.baseURL}/geocoding`, geocodeData);
            const { success, data, message } = response.data;
            
            if (success && data) {
                this.logTest('POST /api/geocoding', true, '地理編碼成功');
                return data;
            } else {
                this.logTest('POST /api/geocoding', false, '地理編碼失敗', response.data);
                return null;
            }
        } catch (error) {
            this.logTest('POST /api/geocoding', false, error.message, error.response?.data);
            return null;
        }
    }

    // 測試 8: 錯誤處理
    async testErrorHandling() {
        try {
            await axios.get(`${this.baseURL}/rentals/99999`);
            this.logTest('Error Handling', false, '應該返回 404 錯誤');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                this.logTest('Error Handling', true, '正確處理 404 錯誤');
            } else {
                this.logTest('Error Handling', false, '錯誤處理不正確', error.response?.data);
            }
        }
    }

    // 測試 9: 刪除租屋資料
    async testDeleteRental(id) {
        try {
            const response = await axios.delete(`${this.baseURL}/rentals/${id}`);
            const { success, message } = response.data;
            
            if (success) {
                this.logTest(`DELETE /api/rentals/${id}`, true, '成功刪除租屋資料');
                return true;
            } else {
                this.logTest(`DELETE /api/rentals/${id}`, false, '刪除失敗', response.data);
                return false;
            }
        } catch (error) {
            this.logTest(`DELETE /api/rentals/${id}`, false, error.message, error.response?.data);
            return false;
        }
    }

    // 執行所有測試
    async runAllTests() {
        console.log('🧪 開始執行 API 自動化測試'.cyan.bold);
        console.log('='.repeat(50).gray);

        try {
            // 等待伺服器啟動
            await this.waitForServer();

            // 執行測試
            console.log('\n📋 執行基本 CRUD 測試'.yellow);
            const rentals = await this.testGetAllRentals();
            await this.testGetRentalById(1);
            
            const newRental = await this.testCreateRental();
            if (newRental && newRental.id) {
                await this.testUpdateRental(newRental.id);
                await this.testDeleteRental(newRental.id);
            }

            console.log('\n⭐ 執行評分相關測試'.yellow);
            await this.testGetRatings(1);
            await this.testCreateRating(1);

            console.log('\n🗺️ 執行地理編碼測試'.yellow);
            await this.testGeocoding();

            console.log('\n🚨 執行錯誤處理測試'.yellow);
            await this.testErrorHandling();

        } catch (error) {
            console.error('測試執行失敗:', error.message);
        }

        // 顯示測試結果摘要
        this.showSummary();
    }

    // 顯示測試結果摘要
    showSummary() {
        console.log('\n' + '='.repeat(50).gray);
        console.log('📊 測試結果摘要'.cyan.bold);
        console.log('='.repeat(50).gray);

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`總測試數: ${totalTests}`);
        console.log(`通過: ${passedTests.toString().green}`);
        console.log(`失敗: ${failedTests.toString().red}`);
        console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (failedTests > 0) {
            console.log('\n❌ 失敗的測試:'.red);
            this.testResults
                .filter(r => !r.success)
                .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
        }

        console.log('\n✨ 測試完成!'.green.bold);
    }
}

// 如果直接執行此檔案，則運行測試
if (require.main === module) {
    const tester = new APITester();
    tester.runAllTests().catch(console.error);
}

module.exports = APITester;