/** Lowercases and strips Vietnamese diacritics so "Bà Lan", "ba lan" and "BA LAN" match alike in a local search. */
export function foldText(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd').replaceAll('Đ', 'D').toLowerCase()
}
