import { useTranslation } from 'react-i18next'

import { dateLocale } from '~/shared/lib/format'

import { Icon } from './icon'

/** Star rating, or a "New" badge while there is no review yet (never "★ 0"). */
export function Rating({ average, count }: { average?: number; count?: number }) {
  const { t, i18n } = useTranslation()
  if (!average || !count) {
    return (
      <span className='inline-flex items-center gap-1 rounded-full bg-info-container px-2 py-0.5 text-xs font-semibold text-on-info-container'>
        <Icon className='text-sm' name='auto_awesome' />
        {t('common.kit.ratingNew')}
      </span>
    )
  }
  const value = new Intl.NumberFormat(dateLocale(i18n.language), { maximumFractionDigits: 1 }).format(average)
  return (
    <span
      aria-label={t('common.kit.ratingLabel', { rating: value, count })}
      className='inline-flex items-center gap-1 text-sm font-semibold text-on-surface tabular-nums'
      role='img'
    >
      <Icon className='text-base text-warning' filled name='star' />
      {value}
      <span className='font-normal text-on-surface-variant'>({count})</span>
    </span>
  )
}

export function VerifiedBadge() {
  const { t } = useTranslation()
  return (
    <span className='inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-primary'>
      <Icon className='text-sm' filled name='verified' />
      {t('common.kit.verified')}
    </span>
  )
}
