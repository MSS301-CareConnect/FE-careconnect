import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { CareReportRecord, OverallCondition } from '~/shared/api/generated/contracts'

import { aftercareErrorKey, aftercareKeys, fetchReports, saveReport, submitReport } from './aftercare-api'

const CONDITIONS = ['STABLE', 'IMPROVED', 'DECLINED', 'NEEDS_ATTENTION'] as const satisfies readonly OverallCondition[]

/**
 * Caregiver care report for one session (H-04): save a draft as often as needed, then submit once (D27: no edits
 * after submitting). Drafts stay private to the caregiver; customers and managers only see submitted reports.
 */
export function CareReportForm({ bookingId, sessionId }: { bookingId: string; sessionId: string }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const reports = useQuery({
    queryKey: aftercareKeys.reports(bookingId),
    queryFn: () => fetchReports(bookingId),
    retry: false
  })
  const report = reports.data?.find((item) => item.sessionId === sessionId)
  if (reports.isPending) {
    return (
      <p className='rounded-2xl bg-white p-5 text-sm text-on-surface-variant shadow-sm' role='status'>
        {t('aftercare.report.loading')}
      </p>
    )
  }
  return (
    <ReportEditor
      key={report?.id ?? 'new'}
      onSaved={() => queryClient.invalidateQueries({ queryKey: aftercareKeys.reports(bookingId) })}
      report={report}
      sessionId={sessionId}
    />
  )
}

function ReportEditor({
  report,
  sessionId,
  onSaved
}: {
  report: CareReportRecord | undefined
  sessionId: string
  onSaved: () => Promise<void>
}) {
  const { t } = useTranslation()
  const [condition, setCondition] = useState<OverallCondition>(report?.overallCondition ?? 'STABLE')
  const [summary, setSummary] = useState(report?.summary ?? '')
  const [recommendations, setRecommendations] = useState(report?.recommendations ?? '')
  const submitted = report?.status === 'SUBMITTED'
  const save = useMutation({
    mutationFn: () =>
      saveReport(report?.id, {
        sessionId,
        overallCondition: condition,
        summary: summary.trim(),
        recommendations: recommendations.trim() || undefined,
        version: report?.version
      }),
    onSuccess: onSaved
  })
  const submit = useMutation({
    mutationFn: async () => submitReport((await save.mutateAsync()).id),
    onSuccess: onSaved
  })
  const error = save.error ?? submit.error

  function handleSave(event: FormEvent) {
    event.preventDefault()
    save.mutate()
  }

  return (
    <section aria-labelledby={`report-${sessionId}`} className='rounded-2xl bg-white p-5 shadow-sm'>
      <h2 className='text-base font-bold' id={`report-${sessionId}`}>
        {t('aftercare.report.title')}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>
        {submitted ? t('aftercare.report.submitted') : t('aftercare.report.draftHint')}
      </p>
      <form className='mt-3 flex flex-col gap-3' onSubmit={handleSave}>
        <label className='text-sm font-medium'>
          {t('aftercare.report.condition')}
          <select
            className='mt-1 w-full rounded-lg border border-outline-variant p-2 text-sm'
            disabled={submitted}
            onChange={(event) => setCondition(event.target.value as OverallCondition)}
            value={condition}
          >
            {CONDITIONS.map((item) => (
              <option key={item} value={item}>
                {t(`aftercare.conditions.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label className='text-sm font-medium'>
          {t('aftercare.report.summary')}
          <textarea
            className='mt-1 w-full rounded-lg border border-outline-variant p-2 text-sm'
            disabled={submitted}
            onChange={(event) => setSummary(event.target.value)}
            required
            rows={4}
            value={summary}
          />
        </label>
        <label className='text-sm font-medium'>
          {t('aftercare.report.recommendations')}
          <textarea
            className='mt-1 w-full rounded-lg border border-outline-variant p-2 text-sm'
            disabled={submitted}
            onChange={(event) => setRecommendations(event.target.value)}
            rows={2}
            value={recommendations}
          />
        </label>
        {error ? (
          <p className='text-sm text-error' role='alert'>
            {t(aftercareErrorKey(error))}
          </p>
        ) : null}
        {submitted ? null : (
          <div className='flex flex-wrap gap-2'>
            <button
              className='rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold disabled:opacity-50'
              disabled={save.isPending || submit.isPending || !summary.trim()}
              type='submit'
            >
              {t('aftercare.report.saveDraft')}
            </button>
            <button
              className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-50'
              disabled={save.isPending || submit.isPending || !summary.trim()}
              onClick={() => submit.mutate()}
              type='button'
            >
              {t('aftercare.report.submit')}
            </button>
          </div>
        )}
      </form>
    </section>
  )
}
