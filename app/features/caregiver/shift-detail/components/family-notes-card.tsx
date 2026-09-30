import { useTranslation } from 'react-i18next'

const ICON_FORUM = 'forum'
const ICON_QUOTE = 'format_quote'
const ICON_PERSON = 'person'

export function FamilyNotesCard() {
  const { t } = useTranslation()

  return (
    <div className='space-y-3 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex items-center gap-2'>
        <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_FORUM}</span>
        <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.familyNotes.title')}</h2>
      </div>

      {/* Quote Container */}
      <div className='relative rounded-xl bg-surface-container-low p-4 sm:p-5'>
        <span className='pointer-events-none absolute right-3 top-2 text-[36px] text-primary/20 select-none material-symbols-outlined'>
          {ICON_QUOTE}
        </span>
        <p className='relative z-10 text-sm italic leading-relaxed text-on-surface sm:text-base'>
          {t('caregiver.shiftDetail.familyNotes.quote')}
        </p>
        <div className='mt-3 flex items-center gap-2 text-xs text-on-surface-variant font-medium'>
          <span className='material-symbols-outlined text-[16px] text-primary'>{ICON_PERSON}</span>
          <span>{t('caregiver.shiftDetail.familyNotes.meta')}</span>
        </div>
      </div>
    </div>
  )
}
