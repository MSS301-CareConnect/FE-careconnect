import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '~/shared/ui/section-card'
import type { ReportEditor } from '../hooks/use-care-report-draft'

export function ReportConfirmation({ editor }: { editor: ReportEditor }) {
  const { t } = useTranslation()
  const dialog = useRef<HTMLDialogElement>(null)
  const [reviewed, setReviewed] = useState(false)
  const { draft } = editor
  return (
    <>
      <SectionCard title={t('caregiver.careReport.signature')} icon='draw'>
        <label className='flex items-start gap-3 rounded-xl bg-surface-container-low p-4 text-xs leading-6'>
          <input
            checked={reviewed}
            className='mt-1 h-4 w-4 shrink-0 accent-primary'
            onChange={(event) => setReviewed(event.target.checked)}
            type='checkbox'
          />
          {t('caregiver.careReport.declaration')}
        </label>
        <div className='mt-5 space-y-3 print:hidden'>
          <button
            aria-describedby='report-submit-hint'
            className='w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50'
            disabled
            type='button'
          >
            {t('caregiver.careReport.submit')}
          </button>
          <p className='text-xs leading-5 text-outline' id='report-submit-hint'>
            {t('caregiver.careReport.submitHint')}
          </p>
          <button
            className='w-full rounded-xl border border-primary/30 px-4 py-3 text-sm font-bold text-primary hover:bg-secondary-container'
            onClick={editor.save}
            type='button'
          >
            {t('caregiver.careReport.save')}
          </button>
          <button
            className='w-full py-2 text-xs font-semibold text-primary underline underline-offset-4'
            onClick={() => dialog.current?.showModal()}
            type='button'
          >
            {t('caregiver.careReport.family')}
          </button>
        </div>
      </SectionCard>
      <dialog
        aria-labelledby='family-preview-title'
        className='m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl bg-white p-6 text-on-surface shadow-xl backdrop:bg-on-surface/50'
        ref={dialog}
      >
        <h2 className='text-xl font-bold' id='family-preview-title'>
          {t('caregiver.careReport.familyTitle')}
        </h2>
        <p className='mt-2 text-sm text-outline'>{t('caregiver.careReport.demo')}</p>
        <h3 className='mt-6 font-bold'>{t(`caregiver.careRecords.${draft.record.patient}.name`)}</h3>
        <p className='mt-1 text-sm text-primary'>{t(`caregiver.careReport.${draft.condition}`)}</p>
        <ul className='my-5 space-y-2 text-sm'>
          {draft.tasks
            .filter((task) => task.done)
            .map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
        </ul>
        <h3 className='font-bold'>{t('caregiver.careReport.nursingNotes')}</h3>
        <p className='my-3 whitespace-pre-wrap text-sm leading-6'>{draft.notes || t('caregiver.careReport.noNotes')}</p>
        <h3 className='font-bold'>{t('caregiver.careReport.advice')}</h3>
        <p className='my-3 whitespace-pre-wrap text-sm leading-6'>
          {draft.advice || t('caregiver.careReport.noNotes')}
        </p>
        <button
          className='mt-4 w-full rounded-xl bg-primary p-3 font-semibold text-white'
          onClick={() => dialog.current?.close()}
          type='button'
        >
          {t('caregiver.careReport.close')}
        </button>
      </dialog>
    </>
  )
}
