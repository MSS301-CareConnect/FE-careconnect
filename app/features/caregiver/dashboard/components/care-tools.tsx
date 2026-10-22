import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function CareTools() {
  const { t, i18n } = useTranslation()
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  const time = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date('2026-09-20T10:00:00+07:00'))
  return (
    <div className='space-y-8'>
      <section className='scroll-mt-28 rounded-2xl bg-white shadow-sm' id='reminders'>
        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 px-6 py-5'>
          <h2 className='flex items-center gap-2 text-sm font-bold'>
            <Icon className='text-lg text-primary' name='notifications_active' />
            {t('caregiver.reminders.heading')}
          </h2>
          <span className='text-[10px] font-semibold text-outline'>{t('caregiver.reminders.sample')}</span>
        </div>
        <div className='space-y-6 p-6'>
          <article className='rounded-xl border border-amber-200 bg-amber-50 p-4'>
            <div className='flex items-start gap-3'>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700'>
                <Icon name='medication' />
              </span>
              <div className='min-w-0 flex-1'>
                <h3 className='text-sm font-bold'>{t('caregiver.reminders.medication', { time })}</h3>
                <p className='mt-1 text-[10px] font-semibold text-amber-700'>
                  {t('caregiver.reminders.after', { minutes: number(30) })}
                </p>
              </div>
            </div>
            <p className='mt-3 text-xs leading-6 text-on-surface-variant'>{t('caregiver.reminders.instruction')}</p>
            <p className='mt-2 text-[10px] leading-5 text-amber-800'>{t('caregiver.reminders.disclaimer')}</p>
            <button
              className='mt-4 flex w-full min-h-10 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-white text-xs font-bold text-amber-800 disabled:cursor-not-allowed disabled:opacity-60'
              disabled
              title={t('caregiver.unavailable')}
              type='button'
            >
              <Icon className='text-base' name='check_circle' />
              {t('caregiver.reminders.done')}
            </button>
          </article>
          <article className='flex items-start gap-3'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600'>
              <Icon filled name='star' />
            </span>
            <div>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
                <h3 className='text-xs font-bold'>{t('caregiver.reminders.review')}</h3>
                <span className='text-[10px] text-outline'>{t('caregiver.reminders.ago', { hours: number(1) })}</span>
              </div>
              <blockquote className='mt-2 text-xs italic leading-6 text-on-surface-variant'>
                {t('caregiver.reminders.quote')}
              </blockquote>
              <p className='mt-1 text-[10px] text-outline'>{t('caregiver.reminders.author')}</p>
            </div>
          </article>
          <article className='flex items-start gap-3 border-t border-outline-variant/20 pt-5'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-primary'>
              <Icon name='verified_user' />
            </span>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h3 className='text-xs font-bold'>{t('caregiver.reminders.credential')}</h3>
                <span className='rounded bg-surface-container-low px-2 py-1 text-[9px] text-outline'>
                  {t('caregiver.reminders.preview')}
                </span>
              </div>
              <p className='mt-2 text-[11px] leading-6 text-outline'>{t('caregiver.reminders.credentialDetail')}</p>
            </div>
          </article>
        </div>
      </section>
      <section className='scroll-mt-28' id='tools'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <h2 className='text-lg font-bold'>{t('caregiver.tools.heading')}</h2>
          <span className='rounded bg-surface-container-high px-2 py-1 text-[10px] text-outline'>
            {t('caregiver.tools.shortcut')}
          </span>
        </div>
        <div className='space-y-3'>
          {(
            [
              { key: 'report', icon: 'monitor_heart', color: 'bg-secondary-container text-primary' },
              { key: 'safety', icon: 'shield_with_heart', color: 'bg-red-50 text-error' },
              { key: 'guide', icon: 'menu_book', color: 'bg-blue-50 text-blue-700' }
            ] as const
          ).map((tool) => (
            <button
              className='flex w-full items-center gap-4 rounded-xl border border-outline-variant/15 bg-white p-4 text-left shadow-sm disabled:cursor-not-allowed disabled:opacity-70'
              disabled
              key={tool.key}
              title={t('caregiver.unavailable')}
              type='button'
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tool.color}`}>
                <Icon name={tool.icon} />
              </span>
              <span className='flex-1'>
                <span className='block text-sm font-bold'>{t(`caregiver.tools.${tool.key}`)}</span>
                <span className='mt-1 block text-[11px] text-outline'>{t(`caregiver.tools.${tool.key}Detail`)}</span>
              </span>
              <Icon className='text-outline' name='chevron_right' />
            </button>
          ))}
        </div>
        <div className='mt-5 flex items-start gap-3 rounded-xl bg-primary p-5 text-white'>
          <Icon name='verified' />
          <div>
            <h3 className='text-sm font-bold'>{t('caregiver.tools.hotline')}</h3>
            <p className='mt-2 text-xs leading-6 text-white/75'>{t('caregiver.tools.hotlineDetail')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
