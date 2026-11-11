import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

import { aftercareKeys, fetchReports } from './aftercare-api'
import { CareReportForm } from './care-report-form'

/**
 * The care report of one session on the caregiver's visit page (2026-11-11): a compact card saying where the report
 * stands (not written, draft, submitted) and one button that opens the form as a centred dialog. The dialog does not
 * close on a click outside, so a half-written report is not lost by accident; drafts are saved from inside it.
 */
export function CareReportCard({ bookingId, sessionId }: { bookingId: string; sessionId: string }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [open, setOpen] = useState(false)
  // Same query as the form, so opening the dialog shows the report at once.
  const reports = useQuery({
    queryKey: aftercareKeys.reports(bookingId),
    queryFn: () => fetchReports(bookingId),
    retry: false
  })
  const report = reports.data?.find((item) => item.sessionId === sessionId)
  const state = report?.status === 'SUBMITTED' ? 'submitted' : report ? 'draft' : 'none'
  const submitted = state === 'submitted'

  return (
    <section
      aria-labelledby={`report-card-${sessionId}`}
      className='rounded-3xl border border-forest-900/[0.06] bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'
    >
      <div className='flex items-start gap-3.5'>
        <span
          aria-hidden='true'
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${submitted ? 'bg-mint-100 text-forest-700' : 'bg-peach-100 text-peach-700'}`}
        >
          <Icon className='text-2xl' name={submitted ? 'task_alt' : 'edit_note'} />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-base font-bold text-forest-950' id={`report-card-${sessionId}`}>
              {t('aftercare.report.title')}
            </h2>
            {reports.isSuccess ? (
              <StatusBadge dot tone={submitted ? 'success' : state === 'draft' ? 'warning' : 'neutral'}>
                {t(`aftercare.report.states.${state}`)}
              </StatusBadge>
            ) : null}
          </div>
          <p className='mt-1 text-sm text-on-surface-variant'>
            {submitted
              ? t('aftercare.report.cardSubmitted', { time: format.dateTime(report?.submittedAt) })
              : t('aftercare.report.due')}
          </p>
          {report?.summary ? (
            <p className='mt-2 line-clamp-2 text-sm whitespace-pre-line text-on-surface'>{report.summary}</p>
          ) : null}
        </div>
      </div>
      <Button
        className='mt-4 w-full rounded-full!'
        leftIcon={<Icon name={submitted ? 'visibility' : 'edit'} />}
        onClick={() => setOpen(true)}
        variant={submitted ? 'outline' : 'dark'}
      >
        {t(`aftercare.report.open.${state}`)}
      </Button>

      <Modal
        description={submitted ? t('aftercare.report.submitted') : t('aftercare.report.draftHint')}
        dismissOnBackdrop={false}
        onClose={() => setOpen(false)}
        open={open}
        size='xl'
        title={t('aftercare.report.title')}
      >
        <CareReportForm bookingId={bookingId} sessionId={sessionId} variant='dialog' />
      </Modal>
    </section>
  )
}
