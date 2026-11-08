/** BookingService hides the middle digits of a customer's phone until the visit is close ("09******78"). */
const MASK = '*'
const MASK_DISPLAY = '•'

/** True when the number came back with hidden digits, so it cannot be dialled. */
export function isMaskedPhone(raw: string | null | undefined) {
  return Boolean(raw?.includes(MASK))
}

/**
 * Vietnamese phone numbers grouped for reading aloud:
 * - mobile "0912 345 678"; "+84 912 345 678" for 84 / +84 numbers, including the common "+84 0912…" typo;
 * - landline "028 3822 1234".
 * Anything else keeps its digits in groups of three so it is still easier to read than one block. A masked number keeps
 * the same grouping with its hidden digits shown as dots ("09•• ••• •78"). Returns '' for an empty value so callers can
 * fall back to a "not set" label.
 */
export function formatPhone(raw: string | null | undefined) {
  if (!raw) return ''
  const digits = raw.replace(/[^\d+*]/g, '')
  const shown = (value: string) => value.replaceAll(MASK, MASK_DISPLAY)
  const international = /^\+?840?([\d*]{9})$/.exec(digits)
  if (international) {
    const rest = international[1]
    return shown(`+84 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`)
  }
  if (/^02[\d*]{9}$/.test(digits)) return shown(`${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`)
  if (/^0[\d*]{9}$/.test(digits)) return shown(`${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`)
  return shown(digits.replace(/([\d*]{3})(?=[\d*])/g, '$1 ').trim())
}

/** A tel: link target with only digits and a leading plus; none for a masked number. */
export function phoneHref(raw: string | null | undefined) {
  return raw && !isMaskedPhone(raw) ? `tel:${raw.replace(/[^\d+]/g, '')}` : undefined
}
