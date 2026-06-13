import { STORAGE_KEYS, DEFAULT_THEME } from '@/lib/config/constants';

export class ThemeStore {
  constructor(storage) {
    this.storage = storage;
  }

  read(fallback = DEFAULT_THEME) {
    try {
      return this.storage.getItem(STORAGE_KEYS.theme) ?? fallback;
    } catch {
      return fallback;
    }
  }

  write(theme) {
    this.storage.setItem(STORAGE_KEYS.theme, theme);
  }

  apply(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}
