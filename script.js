// 全域應用程式實例
let rentalApp;
let languageSelector;

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

// 更新頁面文字的函數
function updatePageTexts() {
    if (!window.i18n) return;
    
    // 更新所有帶有 data-i18n 屬性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = window.i18n.t(key);
    });
}

// 頁面載入時初始化應用程式
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化 i18n 系統
        await window.i18n.init();
        
        // 初始化語言選擇器
        languageSelector = new LanguageSelector(window.i18n);
        
        // 訂閱語言變更事件
        window.i18n.subscribe(() => {
            updatePageTexts();
        });
        
        // 初始化頁面文字
        updatePageTexts();
        
        // 初始化應用程式
        rentalApp = new RentalApp();
        await rentalApp.init();
        
        // 將 mapManager 設為全域變數，供彈出窗口中的按鈕使用
        window.mapManager = rentalApp.mapManager;
    } catch (error) {
        console.error('應用程式初始化失敗:', error);
        const errorMsg = window.i18n ? window.i18n.t('messages.error.appInitFailed') : '應用程式載入失敗，請重新整理頁面。';
        alert(errorMsg);
    }
});