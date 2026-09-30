import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { CareRecordPreview } from '~/entities/care-session/care-record-preview'
import { SectionCard } from '~/shared/ui/section-card'
import { Icon } from '~/shared/ui/icon'

export function HistorySidebar({ records }: { records: readonly CareRecordPreview[] }) {
  const { t, i18n } = useTranslation()
  const weeks = [0, 1, 2, 3].map(
    (week) =>
      records.filter((record) => Math.min(3, Math.floor((Number(record.date.slice(-2)) - 1) / 7)) === week).length
  )
  const maximum = Math.max(1, ...weeks)
  return (
    <aside className='space-y-6'>
      <SectionCard title={t('caregiver.careHistory.nurse')} icon='clinical_notes'>
        <div className='flex gap-3'>
          <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary'>
            <Icon className='text-3xl' name='person' />
          </div>
          <div>
            <h3 className='font-bold'>{t('caregiver.identity.name')}</h3>
            <p className='mt-1 text-xs text-outline'>{t('caregiver.identity.license')}</p>
          </div>
        </div>
        <p className='mt-4 text-xs leading-6 text-outline'>{t('caregiver.careHistory.nurseDetail')}</p>
        <Link
          className='mt-4 block rounded-lg border border-primary/25 p-3 text-center text-xs font-bold text-primary hover:bg-secondary-container'
          to='/caregiver/profile'
        >
          {t('caregiver.careHistory.profile')}
        </Link>
      </SectionCard>
      <SectionCard title={t('caregiver.careHistory.chart')} icon='bar_chart'>
        <p className='text-xs leading-5 text-outline'>{t('caregiver.careHistory.chartHint')}</p>
        <div className='mt-6 flex h-40 items-end justify-around gap-3'>
          {weeks.map((count, index) => (
            <div className='flex h-full flex-1 flex-col items-center justify-end gap-2' key={index}>
              <span className='text-xs font-bold text-primary'>{t('caregiver.careHistory.chartCount', { count })}</span>
              <div
                aria-hidden='true'
                className='w-full max-w-10 rounded-t-md bg-primary/80'
                style={{ height: `${Math.max(3, (count / maximum) * 95)}px` }}
              />
              <span className='whitespace-nowrap text-[11px] text-outline'>
                {t('caregiver.careHistory.week', {
                  week: new Intl.NumberFormat(i18n.resolvedLanguage).format(index + 1)
                })}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
      <section className='rounded-2xl bg-primary p-6 text-white'>
        <Icon className='mb-3 text-3xl' name='support_agent' />
        <h2 className='font-bold'>{t('caregiver.careHistory.support')}</h2>
        <p className='mt-3 text-xs leading-6 text-white/80'>{t('caregiver.careHistory.supportHint')}</p>
      </section>
      <section className='rounded-2xl border border-outline-variant/30 p-5'>
        <h2 className='flex items-center gap-2 text-sm font-bold'>
          <Icon className='text-primary' name='verified_user' />
          {t('caregiver.careHistory.insurance')}
        </h2>
        <p className='mt-3 text-xs leading-6 text-outline'>{t('caregiver.careHistory.insuranceHint')}</p>
      </section>
    </aside>
  )
}
