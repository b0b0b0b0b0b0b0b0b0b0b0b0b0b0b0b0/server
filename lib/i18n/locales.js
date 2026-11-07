export const LOCALE_COOKIE = 'site-locale'
export const DEFAULT_LOCALE = 'ru'

export const LOCALES = [
  { id: 'ru', nativeName: 'Русский', englishName: 'Russian', flag: 'ru', intl: 'ru-RU' },
  { id: 'orv', nativeName: 'Русь', englishName: 'Дореволюціонный', flagUrl: 'https://modrinth.black/flags/orv-imperial.svg', intl: 'ru-RU' },
  { id: 'en', nativeName: 'English', englishName: 'English (United States)', flag: 'us', intl: 'en-US' },
  { id: 'de', nativeName: 'Deutsch', englishName: 'German', flag: 'de', intl: 'de-DE' },
  { id: 'it', nativeName: 'Italiano', englishName: 'Italian', flag: 'it', intl: 'it-IT' },
  { id: 'fr', nativeName: 'Français', englishName: 'French', flag: 'fr', intl: 'fr-FR' },
  { id: 'es', nativeName: 'Español', englishName: 'Spanish', flag: 'es', intl: 'es-ES' },
  { id: 'pt', nativeName: 'Português', englishName: 'Portuguese (Brazil)', flag: 'br', intl: 'pt-BR' },
  { id: 'pl', nativeName: 'Polski', englishName: 'Polish', flag: 'pl', intl: 'pl-PL' },
  { id: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', flag: 'ua', intl: 'uk-UA' },
  { id: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', flag: 'lv', intl: 'lv-LV' },
  { id: 'sv', nativeName: 'Svenska', englishName: 'Swedish', flag: 'se', intl: 'sv-SE' },
  { id: 'zh', nativeName: '简体中文', englishName: 'Chinese (Simplified)', flag: 'cn', intl: 'zh-CN' },
  { id: 'ja', nativeName: '日本語', englishName: 'Japanese', flag: 'jp', intl: 'ja-JP' },
  { id: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', flag: 'vn', intl: 'vi-VN' },
]

export function isLocale(value) {
  return LOCALES.some((locale) => locale.id === value)
}

export function htmlLang(locale) {
  return locale === 'orv' ? 'ru' : locale
}

export function lookup(messages, key) {
  return String(key)
    .split('.')
    .reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), messages)
}

export function format(template, vars) {
  if (typeof template !== 'string') return template
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => (vars[name] === undefined ? match : String(vars[name])))
}
