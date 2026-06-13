export class I18n {
  constructor(catalog, locale) {
    this.catalog = catalog;
    this.locale = locale;
  }

  setLocale(locale) {
    if (this.catalog[locale]) {
      this.locale = locale;
    }
  }

  t(key, params = {}) {
    const value = this.resolve(key);
    if (typeof value !== 'string') {
      return key;
    }
    return Object.entries(params).reduce(
      (text, [name, part]) => text.replaceAll(`{${name}}`, String(part)),
      value,
    );
  }

  resolve(key) {
    const parts = key.split('.');
    let node = this.catalog[this.locale];
    for (const part of parts) {
      if (!node || typeof node !== 'object') {
        return key;
      }
      node = node[part];
    }
    return node ?? key;
  }
}
