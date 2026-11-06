const TEXT = {
  'account.petKitten': 'Погладить котика',
}

export function useT() {
  return (key) => TEXT[key] || key
}
