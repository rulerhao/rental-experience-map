# Internationalization (i18n) System

This directory contains translation files for the rental experience sharing application.

## Supported Languages

- **zh-TW** (Traditional Chinese) - Default language
- **zh-CN** (Simplified Chinese)
- **en** (English)
- **ja** (Japanese)

## File Structure

Each language has its own JSON file:
- `zh-TW.json` - Traditional Chinese translations
- `zh-CN.json` - Simplified Chinese translations
- `en.json` - English translations
- `ja.json` - Japanese translations

## Translation Key Structure

The translation keys are organized hierarchically:

```json
{
  "app": {
    "title": "Application title",
    "subtitle": "Application subtitle"
  },
  "form": {
    "title": "Form title",
    "basicInfo": {
      "title": "Basic information section title",
      "description": "Description field label"
    }
  }
}
```

## Adding New Languages

1. Create a new JSON file with the language code (e.g., `ko.json` for Korean)
2. Copy the structure from an existing file
3. Translate all the values
4. Add the language to the `getAvailableLanguages()` method in `I18nService.js`
5. Update the locale mapping in `getLocaleCode()` method if needed

## Adding New Translation Keys

1. Add the key to all language files
2. Use the key in your JavaScript code: `i18n.t('your.new.key')`
3. For HTML elements, add `data-i18n="your.new.key"` attribute

## Parameter Interpolation

You can use parameters in translations:

```json
{
  "welcome": "Welcome {{name}}!"
}
```

Usage:
```javascript
i18n.t('welcome', { name: 'John' })
```

## Best Practices

1. Keep keys descriptive and hierarchical
2. Use consistent naming conventions
3. Avoid hardcoded strings in the code
4. Test all languages before deployment
5. Consider text length differences between languages
6. Use appropriate number and date formatting for each locale