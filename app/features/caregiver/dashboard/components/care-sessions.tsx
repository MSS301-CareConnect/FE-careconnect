import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function CareSessions({ previewDate }: { previewDate: Date }) {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  const time = (hour: number) =>
    new Intl.DateTimeFormat(i18n.resolvedLanguage, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Asia/Ho_Chi_Minh'
    }).format(new Date(`2026-09-20T${String(hour).padStart(2, '0')}:00:00+07:00`))
  const tomorrow = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(previewDate.getTime() + 24 * 60 * 60 * 1000))
  return (
    <div className='space-y-8'>
      <section
        aria-label={t('caregiver.active.heading')}
        className='relative scroll-mt-28 overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary-container to-emerald-600 p-6 text-white shadow-md lg:p-8'
        id='active-session'
      >
        <svg
          aria-hidden='true'
          className='pointer-events-none absolute bottom-16 right-0 w-72 text-white/10'
          fill='none'
          viewBox='0 0 300 100'
        >
          <path d='M0 50h80l15-30 20 65 20-85 20 65 10-15h135' stroke='currentColor' strokeWidth='3' />
        </svg>
        <div className='relative'>
          <div className='flex flex-wrap items-center justify-between gap-3 text-[11px] font-semibold'>
            <span className='flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5'>
              <span className='h-1.5 w-1.5 rounded-full bg-secondary-fixed' />
              {t('caregiver.active.badge')}
            </span>
            <span className='flex items-center gap-1.5 text-white/80'>
              <Icon className='text-base' name='timer' />
              {t('caregiver.active.remaining', { hours: number(2), minutes: number(30) })}
            </span>
          </div>
          <div className='mt-7 flex items-center gap-4'>
            <div className='flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/15'>
              <Icon name='elderly' />
              <span className='mt-1 text-[10px]'>{t('caregiver.active.age', { age: number(78) })}</span>
            </div>
            <div>
              <h2 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('caregiver.active.name')}</h2>
              <p className='mt-2 text-xs text-white/75'>{t('caregiver.active.patient')}</p>
            </div>
          </div>
          <p className='mt-5 text-sm font-medium leading-6'>{t('caregiver.active.service')}</p>
          <p className='mt-3 flex items-start gap-2 text-xs leading-5 text-white/80'>
            <Icon className='shrink-0 text-base' name='clinical_notes' />
            {t('caregiver.active.clinical')}
          </p>
          <div className='mt-6 flex flex-wrap items-center gap-4 border-y border-white/15 py-4 text-xs font-semibold'>
            <span>{t('caregiver.active.time', { start: time(8), end: time(12) })}</span>
            <span className='flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2'>
              <Icon className='text-base' name='favorite' />
              {t('caregiver.active.pressure', { value: `${number(125)}/${number(80)}` })}
            </span>
          </div>
          <div className='mt-5 flex items-start justify-between gap-3'>
            <p className='flex items-start gap-2 text-xs leading-6 text-white/80'>
              <Icon className='shrink-0 text-lg' name='pin_drop' />
              {t('caregiver.active.address')}
            </p>
            <button
              className='flex shrink-0 items-center gap-1 rounded-lg bg-white/10 p-2 text-[10px] disabled:cursor-not-allowed disabled:opacity-60'
              disabled
              title={t('caregiver.unavailable')}
              type='button'
            >
              <Icon className='text-base' name='directions' />
              {t('caregiver.active.directions')}
            </button>
          </div>
          <div className='mt-6 grid gap-3 sm:grid-cols-2'>
            <button
              className='flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-70'
              disabled
              title={t('caregiver.unavailable')}
              type='button'
            >
              <Icon name='vital_signs' />
              {t('caregiver.active.report')}
            </button>
            <button
              className='flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-70'
              disabled
              title={t('caregiver.unavailable')}
              type='button'
            >
              <Icon name='phone_in_talk' />
              {t('caregiver.active.sos')}
            </button>
          </div>
        </div>
      </section>
      <section className='scroll-mt-28' id='schedule'>
        <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-bold'>{t('caregiver.schedule.heading')}</h2>
          <Link
            className='flex items-center gap-1 text-xs font-bold text-primary hover:underline'
            to='/caregiver/schedule'
          >
            {t('caregiver.schedule.all')}
            <Icon className='text-base' name='arrow_forward' />
          </Link>
        </div>
        <div className='rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm font-bold text-primary'>
              {t('caregiver.schedule.afternoon', { start: time(14), end: time(18) })}
            </p>
            <span className='rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold text-primary'>
              {t('caregiver.schedule.confirmed')}
            </span>
          </div>
          <div className='mt-5 flex items-center gap-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-outline'>
              <Icon className='text-3xl' name='person' />
            </div>
            <div>
              <h3 className='font-bold'>{t('caregiver.schedule.name')}</h3>
              <p className='mt-1 text-xs text-outline'>
                {t('caregiver.active.age', { age: number(65) })}
                <span className='mx-2' aria-hidden='true'>
                  ·
                </span>
                {t('caregiver.schedule.patient')}
              </p>
            </div>
          </div>
          <p className='mt-4 text-sm leading-6 text-on-surface-variant'>{t('caregiver.schedule.service')}</p>
          <p className='mt-3 flex items-start gap-2 text-xs leading-6 text-outline'>
            <Icon className='shrink-0 text-base' name='location_on' />
            <span>
              {t('caregiver.schedule.address')}
              <span className='block text-primary'>{t('caregiver.schedule.distance', { distance: number(3.2) })}</span>
            </span>
          </p>
          <p className='mt-4 flex items-start gap-2 rounded-lg bg-surface-container-low px-3 py-3 text-[11px] leading-5 text-on-surface-variant'>
            <Icon className='shrink-0 text-base text-primary' name='info' />
            {t('caregiver.schedule.handover', { minutes: number(15) })}
          </p>
          <div className='mt-5 grid gap-3 sm:grid-cols-2'>
            {(
              [
                { key: 'contact', icon: 'call' },
                { key: 'medical', icon: 'medical_information' }
              ] as const
            ).map((action) => (
              <button
                className='flex min-h-11 items-center justify-center gap-2 rounded-xl border border-outline-variant/30 px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50'
                disabled
                key={action.key}
                title={t('caregiver.unavailable')}
                type='button'
              >
                <Icon className='text-lg' name={action.icon} />
                {t(`caregiver.schedule.${action.key}`)}
              </button>
            ))}
          </div>
        </div>
        <div className='mt-4 flex items-start gap-4 rounded-2xl bg-surface-container-low p-5'>
          <Icon className='text-primary' name='event_upcoming' />
          <div>
            <h3 className='text-[10px] font-bold uppercase tracking-wider text-outline'>
              {t('caregiver.schedule.tomorrow')}
            </h3>
            <p className='mt-2 text-sm font-bold'>{t('caregiver.schedule.next', { date: tomorrow, time: time(8) })}</p>
            <p className='mt-2 text-xs text-on-surface-variant'>
              {t('caregiver.schedule.nextService', { hours: number(8) })}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
