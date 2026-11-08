import { useTranslation } from 'react-i18next'

/** VND without decimals in the active locale, matching the services catalog cards. */
export function useMoney() {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
}
