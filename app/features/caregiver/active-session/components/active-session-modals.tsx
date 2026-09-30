import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const ICON_WARNING = 'emergency'
const ICON_CLOSE = 'close'
const ICON_ADD = 'add_task'

interface ActiveSessionModalsProps {
  isSosOpen: boolean
  onCloseSos: () => void
  onConfirmSos: () => void

  isAddTaskOpen: boolean
  onCloseAddTask: () => void
  onConfirmAddTask: (title: string, desc: string) => void
}

export function ActiveSessionModals({
  isSosOpen,
  onCloseSos,
  onConfirmSos,
  isAddTaskOpen,
  onCloseAddTask,
  onConfirmAddTask
}: ActiveSessionModalsProps) {
  const { t } = useTranslation()
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (taskTitle.trim()) {
      onConfirmAddTask(taskTitle.trim(), taskDesc.trim())
      setTaskTitle('')
      setTaskDesc('')
    }
  }

  return (
    <>
      {/* SOS Alert Modal */}
      {isSosOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs'>
          <div className='w-full max-w-md p-6 shadow-2xl rounded-2xl bg-surface-container-lowest'>
            <div className='flex items-center justify-between pb-3 border-b border-error/20'>
              <div className='flex items-center gap-2 text-error'>
                <span className='material-symbols-outlined text-[28px]'>{ICON_WARNING}</span>
                <h3 className='text-base font-bold sm:text-lg'>{t('caregiver.activeSession.modals.sosTitle')}</h3>
              </div>
              <button
                className='p-1 rounded-lg cursor-pointer text-on-surface-variant hover:bg-surface-container'
                onClick={onCloseSos}
                type='button'
              >
                <span className='material-symbols-outlined text-[20px]'>{ICON_CLOSE}</span>
              </button>
            </div>

            <p className='mt-4 text-xs leading-relaxed text-on-surface sm:text-sm'>
              {t('caregiver.activeSession.modals.sosDesc')}
            </p>

            <div className='flex flex-wrap items-center justify-end gap-2 mt-6'>
              <button
                className='px-4 py-2 text-xs font-semibold transition-colors rounded-lg cursor-pointer bg-surface-container text-on-surface hover:bg-surface-container-high sm:text-sm'
                onClick={onCloseSos}
                type='button'
              >
                {t('caregiver.activeSession.modals.cancel')}
              </button>
              <button
                className='px-4 py-2 text-xs font-bold transition-colors rounded-lg shadow-sm cursor-pointer bg-error text-on-error hover:bg-error/90 sm:text-sm'
                onClick={onConfirmSos}
                type='button'
              >
                {t('caregiver.activeSession.modals.sosConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ad-hoc Task Modal */}
      {isAddTaskOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
          <div className='w-full max-w-md rounded-2xl bg-surface-container-lowest p-6 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-outline-variant/20 pb-3'>
              <div className='flex items-center gap-2 text-primary'>
                <span className='material-symbols-outlined text-[24px]'>{ICON_ADD}</span>
                <h3 className='text-base font-bold text-on-surface sm:text-lg'>
                  {t('caregiver.activeSession.modals.addTaskTitle')}
                </h3>
              </div>
              <button
                className='cursor-pointer rounded-lg p-1 text-on-surface-variant hover:bg-surface-container'
                onClick={onCloseAddTask}
                type='button'
              >
                <span className='material-symbols-outlined text-[20px]'>{ICON_CLOSE}</span>
              </button>
            </div>

            <form className='mt-4 space-y-3' onSubmit={handleAddTaskSubmit}>
              <div>
                <input
                  className='w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface outline-hidden focus:border-primary focus:ring-1 focus:ring-primary'
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={t('caregiver.activeSession.modals.taskTitlePlaceholder')}
                  required
                  type='text'
                  value={taskTitle}
                />
              </div>

              <div>
                <textarea
                  className='w-full rounded-xl border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface outline-hidden focus:border-primary focus:ring-1 focus:ring-primary'
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder={t('caregiver.activeSession.modals.taskDescPlaceholder')}
                  rows={3}
                  value={taskDesc}
                />
              </div>

              <div className='flex flex-wrap items-center justify-end gap-2 pt-2'>
                <button
                  className='cursor-pointer rounded-lg bg-surface-container px-4 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high sm:text-sm'
                  onClick={onCloseAddTask}
                  type='button'
                >
                  {t('caregiver.activeSession.modals.cancel')}
                </button>
                <button
                  className='cursor-pointer rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container sm:text-sm'
                  type='submit'
                >
                  {t('caregiver.activeSession.modals.addTaskConfirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
