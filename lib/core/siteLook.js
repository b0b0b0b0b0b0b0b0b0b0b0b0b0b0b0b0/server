
export const SITE_PALETTES = {
  pink: { accent: '236 127 171', hover: '240 143 187', light: '193 111 255', textLight: '198 29 98', textDark: '236 127 171', textAltLight: '151 14 255' },
  discord: { accent: '88 101 242', hover: '124 140 248', light: '114 137 218', textLight: '69 84 241', textDark: '126 136 245', textAltLight: '66 96 205' },
  cyan: { accent: '0 188 212', hover: '77 208 225', light: '38 198 218', textLight: '0 116 130', textDark: '0 188 212', textAltLight: '22 115 127' },
  red: { accent: '229 57 53', hover: '239 83 80', light: '255 82 82', textLight: '205 30 26', textDark: '235 104 100', textAltLight: '212 0 0' },
  gold: { accent: '230 126 34', hover: '243 156 18', light: '243 156 18', textLight: '159 84 18', textDark: '230 126 34', textAltLight: '146 93 7' },
  purple: { accent: '142 68 173', hover: '155 89 182', light: '155 89 182', textLight: '142 68 173', textDark: '180 124 204', textAltLight: '144 76 172' },
  gray: { accent: '156 163 175', hover: '209 213 219', light: '209 213 219', textLight: '97 105 120', textDark: '156 163 175', textAltLight: '95 106 121' },
  medelsin: { accent: '215 122 86', hover: '228 149 117', light: '241 179 144', textLight: '171 77 41', textDark: '215 122 86', textAltLight: '172 76 22' },
  dragon: { accent: '34 179 105', hover: '46 201 122', light: '98 237 160', textLight: '23 119 70', textDark: '34 179 105', textAltLight: '14 120 61' },
}

export const LOOK_BOOT_SCRIPT = `(function(){
var P=${JSON.stringify(SITE_PALETTES)};
var h=document.documentElement;
var mq=window.matchMedia?window.matchMedia('(prefers-color-scheme: dark)'):null;
function c(n){var m=document.cookie.match(new RegExp('(?:^|;\\\\s*)'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):null}
function apply(){
var p=P[c('site-palette')]||P.pink;
h.style.setProperty('--palette',p.accent);
h.style.setProperty('--palette-hover',p.hover);
h.style.setProperty('--palette-light',p.light);
var t=c('site-theme')||'system';
var dark=t==='dark'||(t!=='light'&&(!mq||mq.matches));
h.classList.toggle('dark',dark);
h.style.colorScheme=dark?'dark':'light';
h.style.setProperty('--palette-text',dark?p.textDark:p.textLight);
h.style.setProperty('--palette-text-alt',dark?p.light:p.textAltLight);
}
apply();
window.__siteLookApply=apply;
if(mq&&mq.addEventListener)mq.addEventListener('change',apply);
window.addEventListener('focus',apply);
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')apply()});
})();`
