const RANK = Object.freeze({
  snapline: 5,
  semverExact: 4,
  semverPre: 3,
  weekly: 2,
  fuzzy: 1,
  raw: 0,
});

function parseComparableKey(versionString) {
  const s = String(versionString).trim();
  let m;

  if ((m = /^(\d+)\.(\d+)-snapshot-(\d+)$/i.exec(s))) {
    return { rank: RANK.snapline, nums: [+m[1], +m[2], +m[3]], raw: null };
  }

  if ((m = /^(\d+)\.(\d+)\.(\d+)$/.exec(s))) {
    return { rank: RANK.semverExact, nums: [+m[1], +m[2], +m[3]], raw: null };
  }

  if ((m = /^(\d+)\.(\d+)$/.exec(s))) {
    return { rank: RANK.semverExact, nums: [+m[1], +m[2], 0], raw: null };
  }

  if ((m = /^(\d+)\.(\d+)\.(\d+)-(.+)$/i.exec(s))) {
    return { rank: RANK.semverPre, nums: [+m[1], +m[2], +m[3]], raw: m[4] };
  }

  if ((m = /^(\d+)\.(\d+)-(?!snapshot-\d+)/i.exec(s))) {
    return { rank: RANK.semverPre, nums: [+m[1], +m[2], 0], raw: s.slice(m[0].length) };
  }

  if ((m = /^(\d+)w(\d+)([a-z]?)$/i.exec(s))) {
    const letter = (m[3] || '`').toLowerCase();
    const ord = letter ? letter.charCodeAt(0) : 96;
    return { rank: RANK.weekly, nums: [+m[1], +m[2], ord], raw: null };
  }

  const head = /^[\d.]+/.exec(s);
  const fv = parseFloat(head?.[0] ?? 'NaN');
  if (!Number.isNaN(fv)) {
    return { rank: RANK.fuzzy, nums: [fv, 0, 0], raw: null };
  }

  return { rank: RANK.raw, nums: [], raw: s };
}

export function compareMinecraftVersionsDesc(a, b) {
  const ka = parseComparableKey(a);
  const kb = parseComparableKey(b);

  if (ka.rank !== kb.rank) return kb.rank - ka.rank;

  const len = Math.max(ka.nums.length, kb.nums.length);
  for (let i = 0; i < len; i++) {
    const na = ka.nums[i] ?? 0;
    const nb = kb.nums[i] ?? 0;
    if (na !== nb) return nb - na;
  }

  if (ka.raw != null && kb.raw != null && ka.raw !== kb.raw) {
    return String(kb.raw).localeCompare(String(ka.raw), undefined, { numeric: true, sensitivity: 'base' });
  }

  return String(b).localeCompare(String(a));
}
