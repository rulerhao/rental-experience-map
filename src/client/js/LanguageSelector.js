class LanguageSelector {
    constructor(i18nService) {
        this.i18n = i18nService;
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createSelector();
        this.bindEvents();
        
        // Subscribe to language changes
        this.i18n.subscribe(() => {
            this.updateSelector();
        });
    }

    createSelector() {
        const selectorHTML = `
            <div class="language-selector" id="languageSelector">
                <button class="language-selector-btn" id="languageSelectorBtn">
                    <span class="current-language" id="currentLanguage">
                        ${this.getCurrentLanguageDisplay()}
                    </span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="language-dropdown" id="languageDropdown">
                    ${this.generateLanguageOptions()}
                </div>
            </div>
        `;

        // Add to header
        const header = document.querySelector('.header');
        if (header) {
            header.insertAdjacentHTML('beforeend', selectorHTML);
        }

        // Add CSS styles
        this.addStyles();
    }

    generateLanguageOptions() {
        const languages = this.i18n.getAvailableLanguages();
        const currentLang = this.i18n.getCurrentLanguage();
        
        return languages.map(lang => `
            <div class="language-option ${lang.code === currentLang ? 'active' : ''}" 
                 data-lang="${lang.code}">
                <span class="language-name">${lang.nativeName}</span>
                <span class="language-code">${lang.code}</span>
            </div>
        `).join('');
    }

    getCurrentLanguageDisplay() {
        const languages = this.i18n.getAvailableLanguages();
        const currentLang = this.i18n.getCurrentLanguage();
        const lang = languages.find(l => l.code === currentLang);
        return lang ? lang.nativeName : currentLang;
    }

    bindEvents() {
        // Toggle dropdown
        document.getElementById('languageSelectorBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Language selection
        document.getElementById('languageDropdown').addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const langCode = option.dataset.lang;
                this.selectLanguage(langCode);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Close dropdown on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        document.getElementById('languageDropdown').classList.add('open');
        document.getElementById('languageSelectorBtn').classList.add('open');
    }

    closeDropdown() {
        this.isOpen = false;
        document.getElementById('languageDropdown').classList.remove('open');
        document.getElementById('languageSelectorBtn').classList.remove('open');
    }

    async selectLanguage(langCode) {
        if (langCode !== this.i18n.getCurrentLanguage()) {
            await this.i18n.changeLanguage(langCode);
            this.updateSelector();
        }
        this.closeDropdown();
    }

    updateSelector() {
        // Update current language display
        const currentLanguageSpan = document.getElementById('currentLanguage');
        if (currentLanguageSpan) {
            currentLanguageSpan.textContent = this.getCurrentLanguageDisplay();
        }

        // Update dropdown options
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.innerHTML = this.generateLanguageOptions();
        }
    }

    addStyles() {
        if (document.getElementById('language-selector-styles')) return;

        const styles = `
            <style id="language-selector-styles">
                .language-selector {
                    position: relative;
                    display: inline-block;
                    margin-left: auto;
                }

                .language-selector-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    transition: all 0.3s ease;
                    min-width: 120px;
                    justify-content: space-between;
                }

                .language-selector-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.5);
                }

                .language-selector-btn.open {
                    background: rgba(255, 255, 255, 0.3);
                    border-color: rgba(255, 255, 255, 0.5);
                }

                .dropdown-arrow {
                    font-size: 10px;
                    transition: transform 0.3s ease;
                }

                .language-selector-btn.open .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .language-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    min-width: 180px;
                    z-index: 1000;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.3s ease;
                    margin-top: 4px;
                }

                .language-dropdown.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .language-option {
                    padding: 12px 16px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: background-color 0.2s ease;
                    border-bottom: 1px solid #f0f0f0;
                }

                .language-option:last-child {
                    border-bottom: none;
                }

                .language-option:hover {
                    background-color: #f8f9fa;
                }

                .language-option.active {
                    background-color: #e3f2fd;
                    color: #1976d2;
                }

                .language-name {
                    font-weight: 500;
                }

                .language-code {
                    font-size: 12px;
                    color: #666;
                    background: #f0f0f0;
                    padding: 2px 6px;
                    border-radius: 3px;
                }

                .language-option.active .language-code {
                    background: #bbdefb;
                    color: #1976d2;
                }

                /* Header layout adjustment */
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .header h1 {
                    margin: 0;
                    flex: 1;
                }

                .header p {
                    margin: 5px 0 0 0;
                    flex: 1;
                }

                .header-content {
                    flex: 1;
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .language-selector {
                        position: static;
                        margin: 10px 0 0 0;
                    }
                    
                    .language-dropdown {
                        right: auto;
                        left: 0;
                        width: 100%;
                    }
                    
                    .header {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// Export for module systems
if (typeof window !== 'undefined') {
    window.LanguageSelector = LanguageSelector;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSelector;
}