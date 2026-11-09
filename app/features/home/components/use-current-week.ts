import { useTranslation } from 'react-i18next'

import { useClock } from '~/shared/lib/use-clock'

/** Monday-to-Sunday of the current week with short weekday names in the active language, for the landing previews. */
export function useCurrentWeek() {
  const { i18n } = useTranslation()
  const now = new Date(useClock(60 * 60_000))
  const offset = (now.getDay() + 6) % 7
  // Narrow names (T2 … CN, M T W …) fit a 7-column strip in a half-width card; Vietnamese 'short' ("Thứ 2") wraps.
  const weekday = new Intl.DateTimeFormat(i18n.language, { weekday: 'narrow' })
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset + index)
    return { key: date.toDateString(), label: weekday.format(date), day: date.getDate() }
  })
  return { weekdays, today: offset }
}
