import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function DashboardStats() {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  const percent = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage, { style: 'percent' }).format(value)
  const cards = [
    {
      key: 'shifts',
      icon: 'event_available',
      value: t('caregiver.stats.shiftsValue', { count: 2 }),
      extra: t('caregiver.stats.active', { count: 1 }),
      detail: t('caregiver.stats.completed', { percent: percent(0.5) })
    },
    {
      key: 'hours',
      icon: 'schedule',
      value: t('caregiver.stats.hoursValue', { done: number(4.5), total: number(8) }),
      extra: '',
      detail: ''
    },
    {
      key: 'income',
      icon: 'account_balance_wallet',
      value: new Intl.NumberFormat(i18n.resolvedLanguage, { style: 'currency', currency: 'VND' }).format(850000),
      extra: '',
      detail: t('caregiver.stats.growth', { percent: percent(0.15) })
    },
    {
      key: 'quality',
      icon: 'star',
      value: t('caregiver.stats.rating', { score: number(4.98), max: number(5) }),
      extra: '',
      detail: t('caregiver.stats.reviews', { count: 98 })
    }
  ] as const
  return (
    <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => (
        <div
          className='relative rounded-2xl bg-white p-6 shadow-sm'
          id={card.key === 'income' ? 'earnings' : undefined}
          key={card.key}
        >
          <Icon className='absolute right-5 top-5 text-3xl text-primary/20' filled name={card.icon} />
          <h2 className='pr-8 text-[10px] font-bold uppercase tracking-widest text-outline'>
            {t(`caregiver.stats.${card.key}`)}
          </h2>
          <p className='mt-4 text-2xl font-extrabold tracking-tight'>
            {card.value}
            <span className='ml-2 text-xs font-medium text-outline'>{card.extra}</span>
          </p>
          {card.key === 'hours' ? (
            <div className='mt-4 h-1.5 overflow-hidden rounded-full bg-surface-container-high'>
              <div aria-hidden='true' className='h-full w-[56.25%] rounded-full bg-primary' />
            </div>
          ) : (
            <p className='mt-3 text-xs font-medium text-primary'>{card.detail}</p>
          )}
        </div>
      ))}
    </section>
  )
}
