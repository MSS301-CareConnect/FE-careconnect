import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import { featuredBookingDetail } from '../booking-detail-preview'

export function BookingDetailTimeline() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const time = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  })
  return (
    <SectionCard
      action={
        <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-primary'>
          {t('centerManager.bookingDetail.timelineNote')}
        </span>
      }
      icon='route'
      title={t('centerManager.bookingDetail.timeline')}
    >
      <ol className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
        {featuredBookingDetail.timeline.map((step, index) => (
          <li
            className={`flex min-h-36 flex-col justify-between rounded-xl border p-3 ${step.state === 'current' ? 'border-primary bg-secondary-container/50' : step.state === 'done' ? 'border-secondary-container bg-secondary-container/25' : 'border-outline-variant/40 bg-surface-container-low'}`}
            key={step.key}
          >
            <div>
              <div className='flex items-center justify-between gap-2'>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step.state === 'upcoming' ? 'bg-surface-container text-outline' : 'bg-primary text-white'}`}
                >
                  {step.state === 'done' ? <Icon className='text-sm' name='check' /> : index + 1}
                </span>
                <span className='text-[11px] text-outline'>
                  {step.time ? time.format(new Date(step.time)) : t('centerManager.bookingDetail.summary.progressNote')}
                </span>
              </div>
              <h3 className='mt-3 text-sm font-bold leading-5'>{t(`centerManager.bookingDetail.steps.${step.key}`)}</h3>
            </div>
            <p
              className={`mt-3 text-[11px] font-semibold uppercase tracking-wide ${step.state === 'current' ? 'text-primary' : 'text-outline'}`}
            >
              {t(
                `centerManager.bookingDetail.${step.state === 'done' ? 'timelineDone' : step.state === 'current' ? 'timelineCurrent' : 'timelineUpcoming'}`
              )}
            </p>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
