export const SHARED_THEME_COOKIE = 'site-theme';

export function resolveServerTheme(cookieStore) {
  return cookieStore.get(SHARED_THEME_COOKIE)?.value === 'light' ? 'light' : 'dark';
}
