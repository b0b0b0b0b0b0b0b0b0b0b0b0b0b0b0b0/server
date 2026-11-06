let translate = (key) => key;

export function setPingTranslator(t) {
  if (typeof t === 'function') translate = t;
}

export function pt(key, params) {
  return translate(`tools.ping.ui.${key}`, params);
}
