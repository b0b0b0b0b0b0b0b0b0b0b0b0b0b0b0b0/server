const BASH_KEYWORDS = new Set([
  'while', 'do', 'done', 'echo', 'declare', 'true', 'break', 'if', 'then', 'fi', 'for', 'in', 'sleep',
]);

const BATCH_KEYWORDS = new Set([
  'echo', 'set', 'goto', 'timeout', 'off',
]);

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(className, text) {
  return `<span class="hl-${className}">${text}</span>`;
}

function protectSegments(text, pattern, bucket) {
  return text.replace(pattern, (match) => {
    const token = `\u0000${bucket.length}\u0000`;
    bucket.push(match);
    return token;
  });
}

function restoreSegments(text, bucket, wrapFn) {
  return bucket.reduce(
    (html, segment, index) => html.replace(`\u0000${index}\u0000`, wrapFn(segment)),
    text,
  );
}

function applyKeywordHighlights(text, language) {
  const keywords = language === 'batch' ? BATCH_KEYWORDS : BASH_KEYWORDS;
  return text.replace(/\b([A-Za-z_@][\w]*)\b/g, (match) => {
    const key = match.startsWith('@') ? match.slice(1).toLowerCase() : match.toLowerCase();
    if (keywords.has(key) || keywords.has(match.toLowerCase())) {
      return wrap('keyword', match);
    }
    return match;
  });
}

function highlightJavaCommand(line) {
  if (!line) {
    return '&nbsp;';
  }

  const protectedSegments = [];
  let html = escapeHtml(line);

  html = protectSegments(html, /&quot;(?:\\.|[^&])*?&quot;/g, protectedSegments);
  html = protectSegments(html, /'(?:\\.|[^'])*?'/g, protectedSegments);
  html = html.replace(/\b(java)\b/g, (match) => wrap('keyword', match));
  html = html.replace(
    /(-XX:[^\s]+|-D[^\s=]+(?:=[^\s]+)?|-Xmx?\d+M|-Xms\d+M|-jar|--nogui)/g,
    (match) => wrap('flag', match),
  );
  html = html.replace(/\b(\d+M)\b/g, (match) => wrap('number', match));
  html = restoreSegments(html, protectedSegments, (segment) => wrap('string', segment));

  return html;
}

function highlightShellLine(line, language) {
  if (!line) {
    return '&nbsp;';
  }

  if (language === 'bash' && (/^#!/.test(line) || /^\s*#/.test(line))) {
    return wrap('comment', escapeHtml(line));
  }

  if (language === 'batch') {
    if (/^\s*::/.test(line)) {
      return wrap('comment', escapeHtml(line));
    }
    if (/^:\w+/.test(line)) {
      return wrap('label', escapeHtml(line));
    }
    if (/^@echo off/i.test(line)) {
      return [
        wrap('keyword', '@echo'),
        ' ',
        wrap('keyword', 'off'),
      ].join('');
    }
  }

  const protectedSegments = [];
  let html = escapeHtml(line);

  html = protectSegments(html, /&quot;(?:\\.|[^&])*?&quot;/g, protectedSegments);
  html = protectSegments(html, /'(?:\\.|[^'])*?'/g, protectedSegments);

  if (language === 'batch') {
    html = html.replace(/(%[\w]+%?)/g, (match) => wrap('variable', match));
  } else {
    html = html.replace(/(\$[\w]+)/g, (match) => wrap('variable', match));
  }

  html = html.replace(
    /(-XX:[^\s]+|-D[^\s=]+(?:=[^\s]+)?|-Xmx?\d+M|-Xms\d+M|-jar|--nogui)/g,
    (match) => wrap('flag', match),
  );
  html = html.replace(/\b(\d+M)\b/g, (match) => wrap('number', match));
  html = applyKeywordHighlights(html, language);
  html = restoreSegments(html, protectedSegments, (segment) => wrap('string', segment));

  return html;
}

export function highlightScriptLine(line, language = 'bash') {
  if (language === 'java') {
    return highlightJavaCommand(line);
  }
  return highlightShellLine(line, language);
}

export function splitScriptLines(source = '') {
  return source.split('\n');
}
