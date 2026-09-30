import { useTranslation } from 'react-i18next'

const ICON_CLINICAL = 'clinical_notes'
const ICON_CLOUD_DONE = 'cloud_done'
const ICON_VERIFIED_USER = 'verified_user'
const ICON_MIC = 'mic'
const ICON_CAMERA = 'photo_camera'
const ICON_ATTACH = 'attach_file'
const ICON_SEND = 'send'

interface ActiveNursingNotesCardProps {
  nursingNote: string
  onChangeNote: (val: string) => void
  onSaveDraft: () => void
  onUpdateProgress: () => void
}

export function ActiveNursingNotesCard({
  nursingNote,
  onChangeNote,
  onSaveDraft,
  onUpdateProgress
}: ActiveNursingNotesCardProps) {
  const { t } = useTranslation()

  const words = nursingNote.trim() ? nursingNote.trim().split(/\s+/).length : 0

  return (
    <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-2 border-b border-outline-variant/15 pb-2 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-secondary'>
            <span className='material-symbols-outlined text-[22px]'>{ICON_CLINICAL}</span>
          </div>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('caregiver.activeSession.nursingNotes.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('caregiver.activeSession.nursingNotes.subtitle')}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-medium text-secondary'>
            <span className='material-symbols-outlined text-[14px]'>{ICON_CLOUD_DONE}</span>
            <span>{t('caregiver.activeSession.nursingNotes.autoSaved')}</span>
          </span>
        </div>
      </div>

      {/* Textarea Editor */}
      <div className='flex flex-col gap-2'>
        <label className='text-xs font-semibold text-on-surface-variant sm:text-sm' htmlFor='nursing-note-input'>
          {t('caregiver.activeSession.nursingNotes.label')}
        </label>
        <div className='relative rounded-xl bg-surface-container-low p-4 transition-all focus-within:bg-surface-container-lowest focus-within:shadow-md'>
          <textarea
            className='w-full resize-none border-0 bg-transparent text-sm text-on-surface outline-hidden sm:text-base'
            id='nursing-note-input'
            onChange={(e) => onChangeNote(e.target.value)}
            placeholder={t('caregiver.activeSession.nursingNotes.placeholder')}
            rows={4}
            value={nursingNote}
          />
          <div className='flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant/15 pt-2 text-xs text-on-surface-variant'>
            <span className='flex items-center gap-1'>
              <span className='material-symbols-outlined text-[14px] text-secondary'>{ICON_VERIFIED_USER}</span>
              <span>{t('caregiver.activeSession.nursingNotes.nurseInCharge')}</span>
            </span>
            <span>{t('caregiver.activeSession.nursingNotes.wordCount', { count: words })}</span>
          </div>
        </div>
      </div>

      {/* Attachments & Actions Bar */}
      <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
        <div className='flex flex-wrap items-center gap-2'>
          <button
            className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
            type='button'
          >
            <span className='material-symbols-outlined text-[18px] text-primary'>{ICON_MIC}</span>
            <span>{t('caregiver.activeSession.nursingNotes.voiceRecord')}</span>
          </button>
          <button
            className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container px-3 py-1.5 text-xs font-semibold text-primary'
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_CAMERA}</span>
            <span>{t('caregiver.activeSession.nursingNotes.photoProof')}</span>
          </button>
          <button
            className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_ATTACH}</span>
            <span>{t('caregiver.activeSession.nursingNotes.attachFile')}</span>
          </button>
        </div>

        <div className='flex items-center gap-2'>
          <button
            className='cursor-pointer rounded-lg bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container sm:text-sm'
            onClick={onSaveDraft}
            type='button'
          >
            {t('caregiver.activeSession.nursingNotes.saveDraft')}
          </button>
          <button
            className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-container sm:text-sm'
            onClick={onUpdateProgress}
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_SEND}</span>
            <span>{t('caregiver.activeSession.nursingNotes.updateProgress')}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
