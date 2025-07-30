// Jest 測試套件
const request = require('supertest');
const express = require('express');

// 假設你的 app 可以被導入
// const app = require('../server');

describe('租屋經驗分享地圖 API 測試', () => {
    const baseURL = 'http://localhost:3000';
    
    beforeAll(async () => {
        // 等待伺服器啟動
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    describe('租屋資料 API', () => {
        test('GET /api/rentals - 應該返回所有租屋資料', async () => {
            const response = await request(baseURL)
                .get('/api/rentals')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.message).toBeDefined();
        });

        test('GET /api/rentals/:id - 應該返回指定租屋資料', async () => {
            const response = await request(baseURL)
                .get('/api/rentals/1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe(1);
        });

        test('POST /api/rentals - 應該創建新租屋資料', async () => {
            const newRental = {
                address: "Jest 測試地址",
                lat: 25.0330,
                lng: 121.5654,
                description: "Jest 測試描述",
                rent_price: 20000,
                room_type: "套房",
                area_size: 15,
                facilities: "冷氣,網路",
                landlord_rating: 4,
                location_rating: 5,
                value_rating: 3
            };

            const response = await request(baseURL)
                .post('/api/rentals')
                .send(newRental)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBeDefined();
            expect(response.body.data.overall_rating).toBeDefined();
        });

        test('GET /api/rentals/999 - 應該返回 404 錯誤', async () => {
            const response = await request(baseURL)
                .get('/api/rentals/999')
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('評分 API', () => {
        test('GET /api/rentals/1/ratings - 應該返回租屋評分', async () => {
            const response = await request(baseURL)
                .get('/api/rentals/1/ratings')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('POST /api/rentals/1/ratings - 應該新增評分', async () => {
            const newRating = {
                user_name: "Jest 測試用戶",
                landlord_rating: 5,
                location_rating: 4,
                value_rating: 4,
                comment: "Jest 測試評分"
            };

            const response = await request(baseURL)
                .post('/api/rentals/1/ratings')
                .send(newRating)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBeDefined();
        });
    });

    describe('地理編碼 API', () => {
        test('POST /api/geocoding - 應該返回地理編碼結果', async () => {
            const geocodeData = {
                address: "台北市信義區信義路五段7號"
            };

            const response = await request(baseURL)
                .post('/api/geocoding')
                .send(geocodeData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });
});