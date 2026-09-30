import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function ScheduleProgress() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const percent = new Intl.NumberFormat(locale, { style: 'percent' }).format(0.5)
  const amount = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(350000)
  return (
    <section className='relative overflow-hidden rounded-xl bg-linear-to-r from-primary to-primary-container p-6 text-white shadow-md'>
      <div aria-hidden='true' className='absolute -right-12 -top-12 h-60 w-60 rounded-full bg-white/5' />
      <div className='relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center'>
        <div className='flex items-center gap-5'>
          <div className='flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-white/15'>
            <span className='text-lg font-bold'>{percent}</span>
            <span className='mt-1 text-[9px] uppercase tracking-wide text-white/80'>
              {t('caregiver.schedulePage.progress.target')}
            </span>
          </div>
          <div className='flex-1 space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='rounded bg-secondary-fixed px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-primary'>
                {t('caregiver.schedulePage.progress.title')}
              </h2>
              <span className='text-xs text-white/80'>
                {t('caregiver.schedulePage.progress.sessions', { active: number(1), next: number(1) })}
              </span>
            </div>
            <p className='text-sm font-semibold'>
              {t('caregiver.schedulePage.progress.hours', { done: number(4), total: number(8) })}
            </p>
            <div className='h-2.5 max-w-64 overflow-hidden rounded-full bg-white/20'>
              <div aria-hidden='true' className='h-full w-1/2 rounded-full bg-secondary-fixed' />
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-70'
            disabled
            title={t('caregiver.unavailable')}
            type='button'
          >
            <Icon className='text-lg' name='add_circle' />
            {t('caregiver.schedulePage.progress.extra', { amount })}
          </button>
          <button
            className='flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white/10 px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70'
            disabled
            title={t('caregiver.unavailable')}
            type='button'
          >
            <Icon className='text-lg' name='event_busy' />
            {t('caregiver.schedulePage.progress.leave')}
          </button>
        </div>
      </div>
    </section>
  )
}
