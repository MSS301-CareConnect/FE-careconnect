import { useTranslation } from 'react-i18next'

import { parseCenterHours } from '../center-hours'

/** Opening hours as words: day range, overnight ("… next day") or open 24 hours. */
export function useHoursLabel() {
  const { t } = useTranslation()
  return (stored: string | undefined) => {
    const hours = parseCenterHours(stored)
    switch (hours.kind) {
      case 'none':
        return t('admin.centersPage.hours.none')
      case 'legacy':
        return hours.text
      case 'allDay':
        return t('admin.centersPage.hours.allDay')
      case 'overnight':
        return t('admin.centersPage.hours.overnight', { open: hours.open, close: hours.close })
      default:
        return t('admin.centersPage.hours.range', { open: hours.open, close: hours.close })
    }
  }
}
