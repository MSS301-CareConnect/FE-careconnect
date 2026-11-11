import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import type { CareReportRecord, OverallCondition } from '~/shared/api/generated/contracts'
import { apiErrorStatus } from '~/shared/api/error-details'
import { Icon } from '~/shared/ui/icon'

import {
  aftercareErrorKey,
  aftercareKeys,
  fetchReports,
  saveReport,
  submitReport,
  uploadReportPhotos
} from './aftercare-api'
import { CareReportPhotos } from './care-report-photos'

const CONDITIONS = ['STABLE', 'IMPROVED', 'DECLINED', 'NEEDS_ATTENTION'] as const satisfies readonly OverallCondition[]
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const fieldClass =
  'mt-1.5 min-h-11 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-normal text-on-surface transition-[border-color,box-shadow] focus:border-forest-700 focus:ring-4 focus:ring-mint-200/70 focus:outline-none disabled:bg-surface-container-low disabled:text-on-surface-variant'
const labelClass = 'block text-sm font-semibold text-forest-950'
const hintClass = 'mt-1 block text-xs font-normal text-on-surface-variant'
// How the patient was, as a colour cue beside the choice (the words still carry the meaning).
const CONDITION_DOTS: Record<OverallCondition, string> = {
  STABLE: 'bg-mint-400',
  IMPROVED: 'bg-success',
  DECLINED: 'bg-error',
  NEEDS_ATTENTION: 'bg-peach-300'
}

/**
 * Caregiver care report for one session (H-04): save a draft as often as needed, then submit once (D27: no edits
 * after submitting). Drafts stay private to the caregiver; customers and managers only see submitted reports.
 */
export function CareReportForm({
  bookingId,
  sessionId,
  variant = 'card'
}: {
  bookingId: string
  sessionId: string
  /** `dialog`: rendered inside a modal that already shows the title and the hint, so no card chrome. */
  variant?: 'card' | 'dialog'
}) {
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
  if (reports.isError && !reports.data) {
    return (
      <div className='rounded-2xl bg-white p-5 shadow-sm'>
        <p className='text-sm text-error' role='alert'>
          {t(aftercareErrorKey(reports.error))}
        </p>
        <button
          className='min-h-11 text-sm font-semibold text-primary underline'
          onClick={() => void reports.refetch()}
          type='button'
        >
          {t('aftercare.report.reloadReport')}
        </button>
      </div>
    )
  }
  return (
    <ReportEditor
      key={sessionId}
      onSaved={async (saved) => {
        const key = aftercareKeys.reports(bookingId)
        await queryClient.cancelQueries({ queryKey: key, exact: true })
        queryClient.setQueryData<CareReportRecord[]>(key, (previous = []) => [
          ...previous.filter((item) => item.sessionId !== saved.sessionId),
          saved
        ])
      }}
      onReload={async () => {
        const refreshed = await reports.refetch()
        return refreshed.isSuccess
      }}
      reloading={reports.isFetching}
      report={report}
      sessionId={sessionId}
      variant={variant}
    />
  )
}

function ReportEditor({
  report,
  sessionId,
  onSaved,
  onReload,
  reloading,
  variant
}: {
  report: CareReportRecord | undefined
  sessionId: string
  variant: 'card' | 'dialog'
  onSaved: (report: CareReportRecord) => Promise<void>
  onReload: () => Promise<boolean>
  reloading: boolean
}) {
  const { t } = useTranslation()
  // No default condition: the caregiver states it, so an untouched form never reports a patient as stable.
  const [condition, setCondition] = useState<OverallCondition | ''>(report?.overallCondition ?? '')
  const [summary, setSummary] = useState(report?.summary ?? '')
  const [recommendations, setRecommendations] = useState(report?.recommendations ?? '')
  const [files, setFiles] = useState<File[]>([])
  const [photoError, setPhotoError] = useState<'photoInvalid' | 'photoLimit'>()
  const [recovery, setRecovery] = useState<'report' | 'photos'>()
  const writing = useRef(false)
  const submitted = report?.status === 'SUBMITTED'
  const dialog = variant === 'dialog'
  const savedPhotoCount = report?.photos?.length ?? 0
  const totalPhotos = savedPhotoCount + files.length
  const save = useMutation({
    retry: false,
    mutationFn: async (publish: boolean) => {
      if (!condition) return
      let uploading = false
      try {
        let saved = await saveReport(report?.id, {
          sessionId,
          overallCondition: condition,
          summary: summary.trim(),
          recommendations: recommendations.trim() || undefined,
          ...(report?.mealNotes === undefined ? {} : { mealNotes: report.mealNotes }),
          ...(report?.medicationNotes === undefined ? {} : { medicationNotes: report.medicationNotes }),
          ...(report?.mobilityNotes === undefined ? {} : { mobilityNotes: report.mobilityNotes }),
          ...(report?.moodNotes === undefined ? {} : { moodNotes: report.moodNotes }),
          version: report?.version
        })
        if (!saved?.id || saved.sessionId !== sessionId || saved.status !== 'DRAFT') throw new Error()
        await onSaved(saved)
        if (files.length) {
          uploading = true
          saved = await uploadReportPhotos(saved.id, files)
          if (saved.sessionId !== sessionId || saved.status !== 'DRAFT') throw new Error()
          await onSaved(saved)
          setFiles([])
          uploading = false
        }
        if (publish) {
          const submitted = await submitReport(saved.id)
          if (submitted?.id !== saved.id || submitted.sessionId !== sessionId || submitted.status !== 'SUBMITTED') {
            throw new Error()
          }
          await onSaved(submitted)
        }
      } catch (error) {
        const status = apiErrorStatus(error)
        if (status === undefined || status >= 500 || status === 409 || status === 412) {
          setRecovery(uploading && (status === undefined || status >= 500) ? 'photos' : 'report')
        }
        throw error
      }
    },
    onSettled: () => {
      writing.current = false
    }
  })
  const ready =
    Boolean(condition) && Boolean(summary.trim()) && totalPhotos <= MAX_PHOTOS && !save.isPending && !recovery

  function persist(publish: boolean) {
    if (writing.current || submitted || !ready) return
    writing.current = true
    save.mutate(publish)
  }

  function selectPhotos(event: ChangeEvent<HTMLInputElement>) {
    const added = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (!added.length || writing.current || submitted || recovery) return
    if (totalPhotos + added.length > MAX_PHOTOS) return setPhotoError('photoLimit')
    if (added.some((file) => !PHOTO_TYPES.includes(file.type) || !file.size || file.size > MAX_PHOTO_SIZE)) {
      return setPhotoError('photoInvalid')
    }
    setPhotoError(undefined)
    setFiles((current) => [...current, ...added])
  }

  async function recover() {
    if (writing.current || !(await onReload())) return
    if (recovery === 'photos') setFiles([])
    setRecovery(undefined)
    setPhotoError(undefined)
    save.reset()
  }

  function handleSave(event: FormEvent) {
    event.preventDefault()
    persist(false)
  }

  return (
    <section
      aria-label={dialog ? t('aftercare.report.details') : undefined}
      aria-labelledby={dialog ? undefined : `report-${sessionId}`}
      className={dialog ? '' : 'rounded-3xl bg-surface-container-lowest p-5 shadow-[var(--shadow-card)]'}
    >
      {dialog ? null : (
        <>
          <h2 className='text-base font-bold' id={`report-${sessionId}`}>
            {t('aftercare.report.title')}
          </h2>
          <p className='mt-1 text-sm text-on-surface-variant'>
            {submitted ? t('aftercare.report.submitted') : t('aftercare.report.draftHint')}
          </p>
        </>
      )}
      {submitted ? null : (
        <p
          className={`flex items-start gap-2 rounded-2xl bg-mint-50 px-3.5 py-2.5 text-sm font-medium text-forest-900 ${dialog ? '' : 'mt-3'}`}
        >
          <Icon className='mt-0.5 text-lg text-forest-700' name='schedule' />
          {t('aftercare.report.due')}
        </p>
      )}
      <form
        className={`mt-4 flex flex-col gap-4 ${dialog ? 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-6' : ''}`}
        onSubmit={handleSave}
      >
        <div className='flex min-w-0 flex-col gap-4'>
          <label className={labelClass}>
            <span className='flex items-center gap-2'>
              {t('aftercare.report.condition')}
              {condition ? (
                <span aria-hidden='true' className={`h-2.5 w-2.5 rounded-full ${CONDITION_DOTS[condition]}`} />
              ) : null}
            </span>
            <select
              className={fieldClass}
              disabled={submitted || save.isPending}
              onChange={(event) => setCondition(event.target.value as OverallCondition)}
              required
              value={condition}
            >
              <option disabled value=''>
                {t('aftercare.report.conditionPick')}
              </option>
              {CONDITIONS.map((item) => (
                <option key={item} value={item}>
                  {t(`aftercare.conditions.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            {t('aftercare.report.summary')}
            <textarea
              aria-describedby={`summary-hint-${sessionId}`}
              className={fieldClass}
              disabled={submitted || save.isPending}
              onChange={(event) => setSummary(event.target.value)}
              required
              rows={5}
              value={summary}
            />
          </label>
          <p className={`-mt-3 ${hintClass}`} id={`summary-hint-${sessionId}`}>
            {t('aftercare.report.summaryHint')}
          </p>
          <label className={labelClass}>
            {t('aftercare.report.recommendations')}
            <textarea
              aria-describedby={`recommendations-hint-${sessionId}`}
              className={fieldClass}
              disabled={submitted || save.isPending}
              onChange={(event) => setRecommendations(event.target.value)}
              rows={3}
              value={recommendations}
            />
          </label>
          <p className={`-mt-3 ${hintClass}`} id={`recommendations-hint-${sessionId}`}>
            {t('aftercare.report.recommendationsHint')}
          </p>
        </div>
        <div className='flex min-w-0 flex-col gap-4'>
          <CareReportPhotos onReload={onReload} photos={report?.photos} reloading={reloading || save.isPending} />
          {!submitted && (
            <fieldset className='min-w-0 space-y-2.5 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/50 p-4'>
              <legend className='px-1 text-sm font-semibold text-forest-950'>{t('aftercare.report.addPhotos')}</legend>
              <p className='text-sm text-on-surface-variant' id={`photo-rules-${sessionId}`}>
                {t('aftercare.report.photoRules')}
              </p>
              <label className='inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-forest-900 transition-colors hover:bg-mint-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-disabled:cursor-default has-disabled:opacity-50'>
                <Icon name='add_photo_alternate' />
                <span aria-hidden='true'>{t('aftercare.report.pickPhotos')}</span>
                <input
                  accept={PHOTO_TYPES.join(',')}
                  aria-label={t('aftercare.report.addPhotos')}
                  aria-describedby={`photo-rules-${sessionId} photo-count-${sessionId}`}
                  className='sr-only'
                  disabled={save.isPending || !!recovery || totalPhotos >= MAX_PHOTOS}
                  multiple
                  onChange={selectPhotos}
                  type='file'
                />
              </label>
              <p
                aria-live='polite'
                className='text-sm font-medium text-on-surface-variant tabular-nums'
                id={`photo-count-${sessionId}`}
              >
                {t('aftercare.report.photoCount', { count: totalPhotos })}
              </p>
              {files.length > 0 && (
                <ul className='space-y-1'>
                  {files.map((file, index) => (
                    <li
                      className='flex items-center justify-between gap-2 rounded-xl bg-surface-container-lowest py-0.5 pr-1 pl-3 text-sm'
                      key={`${index}-${file.name}`}
                    >
                      <span className='flex min-w-0 items-center gap-2 wrap-anywhere'>
                        <Icon className='shrink-0 text-lg text-on-surface-variant' name='image' />
                        {file.name}
                      </span>
                      <button
                        aria-label={t('aftercare.report.removePhotoNamed', { name: file.name })}
                        className='min-h-11 shrink-0 px-2 text-error underline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50'
                        disabled={save.isPending || !!recovery}
                        onClick={() => {
                          setPhotoError(undefined)
                          setFiles((current) => current.filter((_, position) => position !== index))
                        }}
                        type='button'
                      >
                        {t('aftercare.report.removePhoto')}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {(photoError || totalPhotos > MAX_PHOTOS) && (
                <p className='text-sm text-error' role='alert'>
                  {t(`aftercare.report.${photoError ?? 'photoLimit'}`)}
                </p>
              )}
            </fieldset>
          )}
        </div>
        {save.error && !recovery ? (
          <p className='text-sm text-error lg:col-span-2' role='alert'>
            {t(aftercareErrorKey(save.error))}
          </p>
        ) : null}
        {recovery && !submitted && (
          <div className='lg:col-span-2'>
            <p className='text-sm text-error' role='alert'>
              {t(recovery === 'photos' ? 'aftercare.report.photoUncertain' : 'aftercare.report.saveUncertain')}
            </p>
            <button
              className='min-h-11 text-sm font-semibold text-primary underline disabled:opacity-50'
              disabled={reloading}
              onClick={() => void recover()}
              type='button'
            >
              {t(recovery === 'photos' ? 'aftercare.report.discardAndReload' : 'aftercare.report.reloadReport')}
            </button>
          </div>
        )}
        {save.isPending && (
          <p className='text-sm text-on-surface-variant lg:col-span-2' role='status'>
            {t('aftercare.report.saving')}
          </p>
        )}
        {submitted ? null : (
          <div className='flex flex-wrap justify-end gap-2.5 border-t border-outline-variant/40 pt-4 lg:col-span-2'>
            <button
              className='min-h-11 rounded-full border border-outline-variant px-5 py-2 text-sm font-semibold hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
              disabled={!ready}
              type='submit'
            >
              {t('aftercare.report.saveDraft')}
            </button>
            <button
              className='min-h-11 rounded-full bg-forest-900 px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
              disabled={!ready}
              onClick={() => persist(true)}
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
