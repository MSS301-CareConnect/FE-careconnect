import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { careDate, careTime, findCareRecord, type CareRecordPreview } from '~/entities/care-session/care-record-preview'
import { readCareReportDraft } from '~/entities/care-session/care-report-draft'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { CarePatientPortrait } from '~/entities/care-session/care-patient-portrait'
import { ReportConfirmation } from './components/report-confirmation'
import { ReportNotes } from './components/report-notes'
import { ReportTasks } from './components/report-tasks'
import { ReportVitals } from './components/report-vitals'
import { useCareReportDraft } from './hooks/use-care-report-draft'

export function CaregiverCareReportPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const record = readCareReportDraft(id)?.record ?? findCareRecord(id)
  useDocumentTitle(t('caregiver.careReport.documentTitle', { code: id }))
  if (!record)
    return (
      <div className='mx-auto max-w-7xl px-6 py-20'>
        <h1 className='text-2xl font-bold'>{t('caregiver.careReport.notFound')}</h1>
        <Link className='mt-6 inline-block text-primary underline' to='/caregiver/history'>
          {t('caregiver.careReport.back')}
        </Link>
      </div>
    )
  return <CareReportEditor key={record.code} record={record} />
}

function CareReportEditor({ record }: { record: CareRecordPreview }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const editor = useCareReportDraft(record)
  return (
    <div className='caregiver-print-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {t('caregiver.careReport.title', { code: record.code })}
          </h1>
          <span className='mt-3 inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800'>
            {t('caregiver.careReport.pending')}
          </span>
        </div>
        <div className='flex gap-3 print:hidden'>
          <button
            className='flex items-center gap-2 rounded-xl border border-outline-variant/40 bg-white px-4 py-3 text-sm font-semibold'
            onClick={() => window.print()}
            type='button'
          >
            <Icon name='print' />
            {t('caregiver.careReport.print')}
          </button>
          <button
            className='rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white'
            onClick={editor.save}
            type='button'
          >
            {t('caregiver.careReport.save')}
          </button>
        </div>
      </div>
      <p className='text-xs leading-5 text-outline'>{t('caregiver.careReport.demo')}</p>
      {editor.saved && (
        <p className='rounded-xl bg-secondary-container p-3 text-sm text-primary' role='status'>
          {t('caregiver.careReport.saved')}
        </p>
      )}
      <section className='grid gap-6 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-3'>
        <div className='flex gap-4'>
          <CarePatientPortrait patient={record.patient} />
          <div>
            <h2 className='font-bold'>{t(`caregiver.careRecords.${record.patient}.name`)}</h2>
            <p className='mt-1 text-xs text-outline'>{t('caregiver.careReport.age', { age: number(record.age) })}</p>
            <p className='mt-2 text-xs leading-5 text-on-surface-variant'>
              {t(`caregiver.careRecords.${record.patient}.address`)}
            </p>
          </div>
        </div>
        <div className='md:border-l md:border-outline-variant/30 md:pl-6'>
          <p className='text-xs text-outline'>{t('caregiver.careReport.time')}</p>
          <p className='mt-2 font-bold'>
            {careTime(record.start, locale)} – {careTime(record.end, locale)}
          </p>
          <p className='mt-1 text-sm text-on-surface-variant'>{careDate(record.date, locale)}</p>
          <p className='mt-2 text-xs font-semibold text-primary'>
            {t('caregiver.careReport.duration', {
              hours: number(Math.floor(record.minutes / 60)),
              minutes: number(record.minutes % 60)
            })}
          </p>
        </div>
        <div className='md:border-l md:border-outline-variant/30 md:pl-6'>
          <p className='text-xs text-outline'>{t('caregiver.careReport.guardian')}</p>
          <p className='mt-2 font-bold'>{t(`caregiver.careRecords.${record.patient}.guardian`)}</p>
          <p className='mt-2 text-xs text-outline'>{t(`caregiver.careRecords.${record.patient}.service`)}</p>
        </div>
      </section>
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='space-y-6 lg:col-span-7'>
          <ReportTasks editor={editor} />
          <ReportNotes editor={editor} />
        </div>
        <div className='space-y-6 lg:col-span-5'>
          <ReportVitals editor={editor} />
          <ReportConfirmation editor={editor} />
        </div>
      </div>
    </div>
  )
}
