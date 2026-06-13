const MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function writePrefCookie(name, value) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${MAX_AGE_SECONDS};samesite=lax`;
}
