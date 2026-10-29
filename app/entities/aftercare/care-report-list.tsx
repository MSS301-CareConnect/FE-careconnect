import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { aftercareErrorKey, aftercareKeys, fetchReports } from './aftercare-api'

/** Submitted care reports of a booking, for the customer and the center manager (H-04). */
export function CareReportList({ bookingId }: { bookingId: string }) {
  const { t, i18n } = useTranslation()
  const reports = useQuery({
    queryKey: aftercareKeys.reports(bookingId),
    queryFn: () => fetchReports(bookingId),
    retry: false
  })
  const submitted = (reports.data ?? []).filter((report) => report.status === 'SUBMITTED')
  const formatter = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' })
  return (
    <section aria-labelledby={`reports-${bookingId}`} className='rounded-2xl bg-white p-5 shadow-sm'>
      <h2 className='text-base font-bold' id={`reports-${bookingId}`}>
        {t('aftercare.report.listTitle')}
      </h2>
      {reports.isPending ? (
        <p className='mt-2 text-sm text-on-surface-variant' role='status'>
          {t('aftercare.report.loading')}
        </p>
      ) : null}
      {reports.isError ? (
        <p className='mt-2 text-sm text-error' role='alert'>
          {t(aftercareErrorKey(reports.error))}
        </p>
      ) : null}
      {reports.isSuccess && submitted.length === 0 ? (
        <p className='mt-2 text-sm text-on-surface-variant'>{t('aftercare.report.none')}</p>
      ) : null}
      <ul className='mt-3 flex flex-col gap-3'>
        {submitted.map((report) => (
          <li className='rounded-xl border border-outline-variant/60 p-4' key={report.id}>
            <p className='text-sm font-semibold'>
              {report.overallCondition ? t(`aftercare.conditions.${report.overallCondition}`) : '—'}
              {report.submittedAt ? ` · ${formatter.format(new Date(report.submittedAt))}` : ''}
            </p>
            {report.summary ? <p className='mt-2 text-sm whitespace-pre-line'>{report.summary}</p> : null}
            {report.recommendations ? (
              <p className='mt-2 text-sm text-on-surface-variant'>
                <strong>{t('aftercare.report.recommendations')}: </strong>
                {report.recommendations}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
