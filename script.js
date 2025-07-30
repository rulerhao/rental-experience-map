// 全域應用程式實例
let rentalApp;

// 新增評分函數（保持全域以供 HTML 調用）
async function addRating(rentalId) {
    if (rentalApp) {
        await rentalApp.addRating(rentalId);
    }
}

// 新增租屋經驗函數（保持全域以供 HTML 調用）
async function addNewRental() {
    if (rentalApp) {
        await rentalApp.addNewRentalByMapSelection();
    }
}

// 頁面載入時初始化應用程式
document.addEventListener('DOMContentLoaded', async () => {
    try {
        rentalApp = new RentalApp();
        await rentalApp.init();
        
        // 將 mapManager 設為全域變數，供彈出窗口中的按鈕使用
        window.mapManager = rentalApp.mapManager;
    } catch (error) {
        console.error('應用程式初始化失敗:', error);
        alert('應用程式載入失敗，請重新整理頁面。');
    }
});