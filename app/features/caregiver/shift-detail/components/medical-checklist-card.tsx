import { useTranslation } from 'react-i18next'
import type { ShiftChecklistItem } from '../shift-preview'

const ICON_CHECKLIST = 'fact_check'

interface MedicalChecklistCardProps {
  items: ShiftChecklistItem[]
  checkedItems: string[]
  onToggleChecklist: (id: string) => void
}

export function MedicalChecklistCard({ items, checkedItems, onToggleChecklist }: MedicalChecklistCardProps) {
  const { t } = useTranslation()

  return (
    <div className='space-y-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-[24px] text-primary'>{ICON_CHECKLIST}</span>
          <h2 className='text-lg font-bold text-on-surface'>{t('caregiver.shiftDetail.checklist.title')}</h2>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container'>
            {t('caregiver.shiftDetail.checklist.packageBadge')}
          </span>
          <span className='rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant'>
            {t('caregiver.shiftDetail.checklist.tasksCountBadge')}
          </span>
        </div>
      </div>

      <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>
        {t('caregiver.shiftDetail.checklist.description')}
      </p>

      {/* Progress pill */}
      <div className='flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-2 text-xs font-semibold text-primary'>
        <span>
          {t('caregiver.shiftDetail.checklist.completedCount', { completed: checkedItems.length, total: items.length })}
        </span>
        <div className='h-2 w-32 overflow-hidden rounded-full bg-surface-container-high'>
          <div
            className='h-full bg-primary transition-all duration-300'
            style={{ width: `${(checkedItems.length / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist items list */}
      <div className='space-y-2' id='checklistContainer'>
        {items.map((item) => {
          const isChecked = checkedItems.includes(item.id)
          return (
            <label
              className={`group flex cursor-pointer items-start gap-3 rounded-xl p-3.5 transition-colors sm:p-4 ${
                isChecked
                  ? 'bg-secondary-container/20 border border-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container'
              }`}
              key={item.id}
            >
              <input
                checked={isChecked}
                className='mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-primary'
                onChange={() => onToggleChecklist(item.id)}
                type='checkbox'
              />
              <div className='flex-1 space-y-1'>
                <div className='flex items-center justify-between gap-2'>
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isChecked ? 'text-primary line-through' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    {t(`caregiver.shiftDetail.checklist.items.${item.key}Title`)}
                  </span>
                  <span className='font-mono text-xs text-on-surface-variant'>
                    {t(`caregiver.shiftDetail.checklist.items.${item.key}Time`)}
                  </span>
                </div>
                <p className='text-xs text-on-surface-variant leading-relaxed'>
                  {t(`caregiver.shiftDetail.checklist.items.${item.key}Desc`)}
                </p>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
