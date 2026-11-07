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
  'mt-1 min-h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none disabled:bg-surface-container-low'

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
    />
  )
}

function ReportEditor({
  report,
  sessionId,
  onSaved,
  onReload,
  reloading
}: {
  report: CareReportRecord | undefined
  sessionId: string
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
    <section aria-labelledby={`report-${sessionId}`} className='rounded-2xl bg-surface-container-lowest p-5 shadow-sm'>
      <h2 className='text-base font-bold' id={`report-${sessionId}`}>
        {t('aftercare.report.title')}
      </h2>
      <p className='mt-1 text-sm text-on-surface-variant'>
        {submitted ? t('aftercare.report.submitted') : t('aftercare.report.draftHint')}
      </p>
      {submitted ? null : (
        <p className='mt-2 flex items-start gap-1.5 text-sm font-medium text-on-surface'>
          <Icon className='text-lg text-primary' name='schedule' />
          {t('aftercare.report.due')}
        </p>
      )}
      <form className='mt-3 flex flex-col gap-3' onSubmit={handleSave}>
        <label className='text-sm font-medium'>
          {t('aftercare.report.condition')}
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
        <label className='text-sm font-medium'>
          {t('aftercare.report.summary')}
          <textarea
            className={fieldClass}
            disabled={submitted || save.isPending}
            onChange={(event) => setSummary(event.target.value)}
            required
            rows={4}
            value={summary}
          />
        </label>
        <label className='text-sm font-medium'>
          {t('aftercare.report.recommendations')}
          <textarea
            className={fieldClass}
            disabled={submitted || save.isPending}
            onChange={(event) => setRecommendations(event.target.value)}
            rows={2}
            value={recommendations}
          />
        </label>
        <CareReportPhotos onReload={onReload} photos={report?.photos} reloading={reloading || save.isPending} />
        {!submitted && (
          <fieldset className='min-w-0 space-y-2 rounded-xl border border-outline-variant/60 p-3'>
            <legend className='px-1 text-sm font-semibold'>{t('aftercare.report.addPhotos')}</legend>
            <p className='text-sm text-on-surface-variant' id={`photo-rules-${sessionId}`}>
              {t('aftercare.report.photoRules')}
            </p>
            <label className='inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant px-3 text-sm font-semibold text-primary focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary has-disabled:cursor-default has-disabled:opacity-50'>
              <Icon name='attach_file' />
              <span>{t('aftercare.report.addPhotos')}</span>
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
            <p aria-live='polite' className='text-sm text-on-surface-variant' id={`photo-count-${sessionId}`}>
              {t('aftercare.report.photoCount', { count: totalPhotos })}
            </p>
            {files.length > 0 && (
              <ul className='space-y-1'>
                {files.map((file, index) => (
                  <li className='flex items-center justify-between gap-2 text-sm' key={`${index}-${file.name}`}>
                    <span className='min-w-0 wrap-anywhere'>{file.name}</span>
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
        {save.error && !recovery ? (
          <p className='text-sm text-error' role='alert'>
            {t(aftercareErrorKey(save.error))}
          </p>
        ) : null}
        {recovery && !submitted && (
          <div>
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
          <p className='text-sm text-on-surface-variant' role='status'>
            {t('aftercare.report.saving')}
          </p>
        )}
        {submitted ? null : (
          <div className='flex flex-wrap gap-2'>
            <button
              className='min-h-11 rounded-lg border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
              disabled={!ready}
              type='submit'
            >
              {t('aftercare.report.saveDraft')}
            </button>
            <button
              className='min-h-11 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50'
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
