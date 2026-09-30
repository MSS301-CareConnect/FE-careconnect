import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { careDate, careTime, type CareRecordPreview } from '~/entities/care-session/care-record-preview'
import { Icon } from '~/shared/ui/icon'
import { CarePatientPortrait } from '~/entities/care-session/care-patient-portrait'

export function HistoryRecordCard({ record }: { record: CareRecordPreview }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  return (
    <article className='overflow-hidden rounded-2xl border border-outline-variant/20 bg-white shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3 bg-surface-container-low/70 px-5 py-3 text-xs'>
        <span className='flex items-center gap-2 font-semibold'>
          <Icon className='text-lg text-primary' name='calendar_today' />
          {careDate(record.date, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span
          className={`rounded-full px-3 py-1 font-semibold ${record.needsSupplement ? 'bg-amber-50 text-amber-800' : 'bg-secondary-container text-primary'}`}
        >
          {t(record.needsSupplement ? 'caregiver.careHistory.supplement' : 'caregiver.careHistory.archived')}
        </span>
      </div>
      <div className='p-5'>
        <div className='flex flex-wrap justify-between gap-4'>
          <div className='flex gap-3'>
            <CarePatientPortrait patient={record.patient} />
            <div>
              <h2 className='text-lg font-bold'>{t(`caregiver.careRecords.${record.patient}.name`)}</h2>
              <p className='mt-1 text-xs text-outline'>
                {t('caregiver.careHistory.age', { age: number(record.age) })} ·{' '}
                {t(`caregiver.careRecords.${record.patient}.detail`)}
              </p>
              <p className='mt-2 text-xs text-primary'>{t(`caregiver.careRecords.${record.patient}.service`)}</p>
            </div>
          </div>
          <div className='text-right'>
            <p className='text-xs text-outline'>{t('caregiver.careHistory.payment')}</p>
            <p className='mt-1 text-xl font-extrabold text-primary'>
              {new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND' }).format(record.amount)}
            </p>
          </div>
        </div>
        <div className='mt-5 grid gap-3 rounded-xl bg-surface-container-low p-4 text-xs sm:grid-cols-2'>
          <div>
            <p className='font-semibold'>
              {careTime(record.start, locale)} – {careTime(record.end, locale)}
            </p>
            <p className='mt-1 text-outline'>
              {t('caregiver.careHistory.duration', {
                hours: number(Math.floor(record.minutes / 60)),
                minutes: number(record.minutes % 60)
              })}
            </p>
          </div>
          <div>
            <p className='font-semibold'>{t('caregiver.careHistory.code', { code: record.code })}</p>
            <p className='mt-1 text-outline'>{t(`caregiver.careRecords.${record.patient}.address`)}</p>
          </div>
        </div>
        {record.code === 'BK-8821' && (
          <div className='mt-4 flex gap-3 rounded-xl border border-secondary-container p-3 text-xs'>
            <Icon className='text-primary' name='ecg_heart' />
            <div>
              <h3 className='font-semibold'>{t('caregiver.careHistory.vitals')}</h3>
              <p className='mt-1 text-on-surface-variant'>
                {t('caregiver.careHistory.vitalsValue', { pressure: '125/80', oxygen: number(98), pulse: number(74) })}
              </p>
            </div>
          </div>
        )}
        {record.rating !== null ? (
          <div className='mt-4 rounded-xl bg-amber-50/70 p-4'>
            <div className='flex items-center justify-between gap-2 text-xs'>
              <h3 className='font-semibold'>{t('caregiver.careHistory.familyReview')}</h3>
              <span className='flex items-center gap-1 font-bold text-amber-700'>
                <Icon className='text-base' filled name='star' />
                {number(record.rating)}
              </span>
            </div>
            <p className='mt-2 text-xs leading-6 text-on-surface-variant'>
              {t(`caregiver.careRecords.${record.patient}.review`)}
            </p>
          </div>
        ) : (
          <p className='mt-4 text-xs text-outline'>{t('caregiver.careHistory.noReview')}</p>
        )}
        <div className='mt-5 flex flex-wrap items-center gap-3 border-t border-outline-variant/20 pt-4'>
          <Link
            className='flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-container'
            to={`/caregiver/shifts/${record.code}/report`}
          >
            <Icon className='text-lg' name='description' />
            {t('caregiver.careHistory.report')}
          </Link>
          <button
            className='rounded-lg border border-outline-variant/30 px-3 py-2.5 text-xs text-outline disabled:cursor-not-allowed'
            disabled
            title={t('caregiver.unavailable')}
            type='button'
          >
            {t('caregiver.careHistory.receipt')}
          </button>
          <Link
            className='ml-auto flex items-center gap-1 py-2 text-xs font-bold text-primary'
            to='/caregiver/schedule'
          >
            {t('caregiver.careHistory.familiar')}
            <Icon className='text-base' name='arrow_forward' />
          </Link>
        </div>
      </div>
    </article>
  )
}
