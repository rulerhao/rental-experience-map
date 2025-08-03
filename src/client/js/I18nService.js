class I18nService {
    constructor() {
        this.currentLanguage = 'zh-TW'; // Default language
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.observers = []; // For reactive updates
    }

    // Initialize the i18n service
    async init(language = null) {
        if (language) {
            this.currentLanguage = language;
        } else {
            // Try to detect language from browser or localStorage
            this.currentLanguage = this.detectLanguage();
        }
        
        await this.loadTranslations(this.currentLanguage);
        
        // Load fallback language if different
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadTranslations(this.fallbackLanguage);
        }
        
        this.updateDocumentLanguage();
        this.notifyObservers();
    }

    // Detect user's preferred language
    detectLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem('rental-app-language');
        if (savedLanguage) {
            return savedLanguage;
        }
        
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Map browser languages to supported languages
        const supportedLanguages = ['zh-TW', 'zh-CN', 'en', 'ja'];
        
        // Exact match
        if (supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // Partial match (e.g., 'zh' -> 'zh-TW')
        const langCode = browserLang.split('-')[0];
        const partialMatch = supportedLanguages.find(lang => lang.startsWith(langCode));
        if (partialMatch) {
            return partialMatch;
        }
        
        // Default fallback
        return 'zh-TW';
    }

    // Load translations for a specific language
    async loadTranslations(language) {
        try {
            const response = await fetch(`/src/client/locales/${language}.json`);
            if (response.ok) {
                const translations = await response.json();
                this.translations[language] = translations;
            } else {
                console.warn(`Failed to load translations for ${language}`);
            }
        } catch (error) {
            console.error(`Error loading translations for ${language}:`, error);
        }
    }

    // Get translated text
    t(key, params = {}) {
        const translation = this.getTranslation(key, this.currentLanguage) || 
                          this.getTranslation(key, this.fallbackLanguage) || 
                          key;
        
        return this.interpolate(translation, params);
    }

    // Get translation from specific language
    getTranslation(key, language) {
        const translations = this.translations[language];
        if (!translations) return null;
        
        // Support nested keys like 'form.title'
        return key.split('.').reduce((obj, k) => obj && obj[k], translations);
    }

    // Interpolate parameters into translation string
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // Change language
    async changeLanguage(language) {
        if (language === this.currentLanguage) return;
        
        this.currentLanguage = language;
        localStorage.setItem('rental-app-language', language);
        
        // Load translations if not already loaded
        if (!this.translations[language]) {
            await this.loadTranslations(language);
        }
        
        this.updateDocumentLanguage();
        this.notifyObservers();
    }

    // Update document language attribute
    updateDocumentLanguage() {
        document.documentElement.lang = this.currentLanguage;
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Get available languages
    getAvailableLanguages() {
        return [
            { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
            { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'ja', name: '日本語', nativeName: '日本語' }
        ];
    }

    // Subscribe to language changes
    subscribe(callback) {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(obs => obs !== callback);
        };
    }

    // Notify observers of language changes
    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLanguage));
    }

    // Format number according to current locale
    formatNumber(number, options = {}) {
        const locale = this.getLocaleCode();
        return new Intl.NumberFormat(locale, options).format(number);
    }

    // Format currency
    formatCurrency(amount, currency = 'TWD') {
        const locale = this.getLocaleCode();
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Format date
    formatDate(date, options = {}) {
        const locale = this.getLocaleCode();
        return new Intl.DateTimeFormat(locale, options).format(date);
    }

    // Get locale code for Intl APIs
    getLocaleCode() {
        const localeMap = {
            'zh-TW': 'zh-TW',
            'zh-CN': 'zh-CN',
            'en': 'en-US',
            'ja': 'ja-JP'
        };
        return localeMap[this.currentLanguage] || 'en-US';
    }

    // Get text direction (for RTL languages)
    getTextDirection() {
        const rtlLanguages = ['ar', 'he', 'fa'];
        return rtlLanguages.includes(this.currentLanguage) ? 'rtl' : 'ltr';
    }
}

// Create global instance
const i18n = new I18nService();

// Export for module systems
if (typeof window !== 'undefined') {
    window.I18nService = I18nService;
    window.i18n = i18n;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nService, i18n };
}