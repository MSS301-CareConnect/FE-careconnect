import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'

const activities = [
  { key: 'nutrition', icon: 'restaurant' },
  { key: 'medication', icon: 'medication' },
  { key: 'hygiene', icon: 'clean_hands' },
  { key: 'mobility', icon: 'directions_walk' }
] as const
const observations = ['first', 'second', 'third'] as const

export function CareReportActivities({ caregiver }: { caregiver: string }) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-6'>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='care-activities-title'>
        <h2 id='care-activities-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='fact_check' className='text-primary' />
          {t('customer.careReport.tasksTitle')}
        </h2>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('customer.careReport.tasksSubtitle')}</p>
        <div className='mt-6 space-y-6'>
          {activities.map(({ key, icon }) => (
            <div key={key} className='border-t border-slate-100 pt-5'>
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div className='flex gap-3'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary'>
                    <Icon name={icon} />
                  </div>
                  <div>
                    <h3 className='text-base font-bold'>{t(`customer.careReport.tasks.${key}.title`)}</h3>
                    <p className='mt-1 text-xs text-on-surface-variant'>
                      {t(`customer.careReport.tasks.${key}.subtitle`)}
                    </p>
                  </div>
                </div>
                <span className='rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-primary'>
                  {t('customer.careReport.taskCompleted')}
                </span>
              </div>
              <ul className='mt-4 space-y-3 sm:pl-13'>
                {observations.map((observation) => (
                  <li key={observation} className='flex items-start gap-2 text-sm leading-6 text-on-surface-variant'>
                    <Icon name='check_circle' className='mt-1 shrink-0 text-base text-primary' />
                    <span>{t(`customer.careReport.tasks.${key}.${observation}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className='rounded-2xl bg-white p-5 shadow-sm sm:p-6' aria-labelledby='care-notes-title'>
        <h2 id='care-notes-title' className='flex items-center gap-2 text-lg font-bold'>
          <Icon name='clinical_notes' className='text-primary' />
          {t('customer.careReport.notesTitle')}
        </h2>
        <p className='mt-1 text-sm text-on-surface-variant'>{t('customer.careReport.notesSubtitle')}</p>
        <blockquote className='mt-5 rounded-xl border-l-4 border-primary bg-surface-container-low p-5 text-sm leading-7 text-on-surface-variant'>
          {t('customer.careReport.notes')}
        </blockquote>
        <div className='mt-5 flex gap-3 border-t border-slate-100 pt-5'>
          <Icon name='fingerprint' className='text-3xl text-primary' />
          <div>
            <h3 className='text-sm font-bold'>{t('customer.careReport.signatureTitle')}</h3>
            <p className='mt-1 text-sm'>{caregiver}</p>
            <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.careReport.signatureNote')}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
