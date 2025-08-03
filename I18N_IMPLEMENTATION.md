# Internationalization (i18n) Implementation

This document describes the comprehensive internationalization system implemented for the rental experience sharing application.

## Overview

The i18n system provides:
- **Multi-language support**: Traditional Chinese (default), Simplified Chinese, English, and Japanese
- **Modular architecture**: Easy to add new languages and translation keys
- **Reactive updates**: UI updates automatically when language changes
- **Locale-aware formatting**: Numbers, currencies, and dates formatted according to locale
- **User preference persistence**: Language choice saved in localStorage

## Architecture

### Core Components

1. **I18nService** (`src/client/js/I18nService.js`)
   - Main service for translation management
   - Handles language detection, loading, and switching
   - Provides formatting utilities
   - Manages reactive updates

2. **LanguageSelector** (`src/client/js/LanguageSelector.js`)
   - UI component for language selection
   - Dropdown interface in the header
   - Responsive design for mobile devices

3. **Translation Files** (`src/client/locales/`)
   - JSON files for each supported language
   - Hierarchical key structure
   - Parameter interpolation support

### Integration Points

All major components have been updated to support i18n:

- **RentalFormManager**: Form labels, placeholders, validation messages
- **RentalListManager**: List item texts and buttons
- **MapManager**: Map tooltips and popup messages
- **RentalApp**: Error messages and notifications
- **index.html**: Static page content

## Features

### 1. Language Detection
- Checks localStorage for saved preference
- Falls back to browser language
- Defaults to Traditional Chinese

### 2. Dynamic Content Updates
- All text updates automatically when language changes
- No page reload required
- Maintains application state

### 3. Locale-Aware Formatting
```javascript
// Currency formatting
i18n.formatCurrency(25000) // "NT$25,000" in zh-TW, "$25,000" in en

// Date formatting
i18n.formatDate(new Date(), { year: 'numeric', month: 'long', day: 'numeric' })

// Number formatting
i18n.formatNumber(1234.56, { minimumFractionDigits: 2 })
```

### 4. Parameter Interpolation
```javascript
// Translation: "Welcome {{name}}!"
i18n.t('welcome', { name: 'John' }) // "Welcome John!"
```

## Usage

### In JavaScript
```javascript
// Basic translation
const text = i18n.t('form.title');

// With parameters
const message = i18n.t('welcome', { name: userName });

// Subscribe to language changes
i18n.subscribe((newLanguage) => {
    updateUI();
});
```

### In HTML
```html
<!-- Static text -->
<h1 data-i18n="app.title">Default Text</h1>

<!-- Placeholder text -->
<input data-i18n-placeholder="form.search" placeholder="Default placeholder">
```

## Supported Languages

| Code | Language | Native Name | Status |
|------|----------|-------------|---------|
| zh-TW | Traditional Chinese | 繁體中文 | ✅ Complete |
| zh-CN | Simplified Chinese | 简体中文 | ✅ Complete |
| en | English | English | ✅ Complete |
| ja | Japanese | 日本語 | ✅ Complete |

## File Structure

```
src/client/
├── js/
│   ├── I18nService.js          # Core i18n service
│   ├── LanguageSelector.js     # Language selector component
│   ├── RentalFormManager.js    # Updated with i18n support
│   ├── RentalListManager.js    # Updated with i18n support
│   ├── MapManager.js           # Updated with i18n support
│   └── RentalApp.js            # Updated with i18n support
└── locales/
    ├── zh-TW.json              # Traditional Chinese
    ├── zh-CN.json              # Simplified Chinese
    ├── en.json                 # English
    ├── ja.json                 # Japanese
    └── README.md               # Translation guide
```

## Adding New Languages

1. **Create translation file**:
   ```bash
   cp src/client/locales/en.json src/client/locales/ko.json
   ```

2. **Translate all values** in the new file

3. **Update I18nService**:
   ```javascript
   getAvailableLanguages() {
       return [
           // ... existing languages
           { code: 'ko', name: '한국어', nativeName: '한국어' }
       ];
   }
   ```

4. **Add locale mapping** if needed:
   ```javascript
   getLocaleCode() {
       const localeMap = {
           // ... existing mappings
           'ko': 'ko-KR'
       };
       return localeMap[this.currentLanguage] || 'en-US';
   }
   ```

## Adding New Translation Keys

1. **Add to all language files**:
   ```json
   {
     "newSection": {
       "title": "New Section Title",
       "description": "New section description"
     }
   }
   ```

2. **Use in code**:
   ```javascript
   const title = i18n.t('newSection.title');
   ```

3. **Use in HTML**:
   ```html
   <h2 data-i18n="newSection.title">Default Title</h2>
   ```

## Testing

A demo page (`i18n-demo.html`) is provided to test the i18n system:
- Language switching functionality
- Text updates across different components
- Formatting for different locales
- Interactive message testing

## Best Practices

1. **Consistent Key Naming**: Use hierarchical, descriptive keys
2. **Fallback Handling**: Always provide fallback text
3. **Parameter Validation**: Validate parameters before interpolation
4. **Performance**: Load translations asynchronously
5. **Testing**: Test all languages before deployment
6. **Accessibility**: Consider text length differences between languages

## Performance Considerations

- **Lazy Loading**: Translations loaded only when needed
- **Caching**: Translations cached in memory after first load
- **Minimal Bundle**: Only active language loaded initially
- **Efficient Updates**: Only affected elements updated on language change

## Browser Support

- **Modern Browsers**: Full support with Intl API
- **Legacy Browsers**: Graceful degradation with basic formatting
- **Mobile**: Responsive language selector design

## Future Enhancements

1. **RTL Support**: Add right-to-left language support
2. **Pluralization**: Advanced plural form handling
3. **Context-Aware**: Context-sensitive translations
4. **Translation Management**: Admin interface for translation updates
5. **Auto-Detection**: IP-based location detection for language suggestions