import { useTranslation } from 'react-i18next'
import type { CareTask } from '../active-session-preview'

const ICON_CHECKLIST = 'checklist'
const ICON_TASK_ALT = 'task_alt'
const ICON_ADD_CIRCLE = 'add_circle'
const ICON_CHECK = 'check'
const ICON_DONE_ALL = 'done_all'
const ICON_CHECK_CIRCLE = 'check_circle'
const ICON_ADD_PHOTO = 'add_a_photo'

interface ActiveCarePlanCardProps {
  tasks: CareTask[]
  completedCount: number
  totalCount: number
  onMarkCompleted: (id: string) => void
  onOpenAddTaskModal: () => void
}

export function ActiveCarePlanCard({
  tasks,
  completedCount,
  totalCount,
  onMarkCompleted,
  onOpenAddTaskModal
}: ActiveCarePlanCardProps) {
  const { t } = useTranslation()

  const getTaskTitle = (task: CareTask) => {
    switch (task.key) {
      case 'task1':
        return t('caregiver.activeSession.carePlan.task1Title')
      case 'task2':
        return t('caregiver.activeSession.carePlan.task2Title')
      case 'task3':
        return t('caregiver.activeSession.carePlan.task3Title')
      case 'task4':
        return t('caregiver.activeSession.carePlan.task4Title')
      case 'task5':
        return t('caregiver.activeSession.carePlan.task5Title')
      default:
        return task.customTitle ?? ''
    }
  }

  const getTaskDesc = (task: CareTask) => {
    switch (task.key) {
      case 'task1':
        return t('caregiver.activeSession.carePlan.task1Desc')
      case 'task2':
        return t('caregiver.activeSession.carePlan.task2Desc')
      case 'task3':
        return t('caregiver.activeSession.carePlan.task3Desc')
      case 'task4':
        return t('caregiver.activeSession.carePlan.task4Desc')
      case 'task5':
        return t('caregiver.activeSession.carePlan.task5Desc')
      default:
        return task.customDesc ?? ''
    }
  }

  return (
    <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-3 border-b border-outline-variant/15 pb-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-surface-container text-primary'>
            <span className='material-symbols-outlined text-[22px]'>{ICON_CHECKLIST}</span>
          </div>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('caregiver.activeSession.carePlan.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('caregiver.activeSession.carePlan.subtitle')}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <span className='flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1 text-xs font-bold text-secondary'>
            <span className='material-symbols-outlined text-[16px]'>{ICON_TASK_ALT}</span>
            <span>
              {t('caregiver.activeSession.carePlan.progress', { completed: completedCount, total: totalCount })}
            </span>
          </span>
          <button
            className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container hover:text-on-surface'
            onClick={onOpenAddTaskModal}
            type='button'
          >
            <span className='material-symbols-outlined text-[18px]'>{ICON_ADD_CIRCLE}</span>
            <span>{t('caregiver.activeSession.carePlan.addTaskBtn')}</span>
          </button>
        </div>
      </div>

      {/* Task Checklist Group */}
      <div className='flex flex-col gap-3'>
        {tasks.map((task) => {
          if (task.status === 'completed') {
            return (
              <div
                className='flex items-start gap-4 rounded-xl bg-surface-container-low/70 p-4 transition-all'
                key={task.id}
              >
                <div className='pt-0.5'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-on-secondary shadow-xs'>
                    <span className='material-symbols-outlined text-[18px]'>{ICON_CHECK}</span>
                  </div>
                </div>
                <div className='flex flex-1 flex-col gap-1'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-on-surface-variant line-through'>
                      {getTaskTitle(task)}
                    </span>
                    <div className='flex items-center gap-2'>
                      {task.completedTime && (
                        <span className='flex items-center gap-1 rounded bg-surface-container px-2 py-0.5 text-xs font-bold text-secondary'>
                          <span className='material-symbols-outlined text-[14px]'>{ICON_DONE_ALL}</span>
                          <span>
                            {t('caregiver.activeSession.carePlan.completedBadge', { time: task.completedTime })}
                          </span>
                        </span>
                      )}
                      {task.hasPhoto && (
                        <span className='rounded bg-surface-container-lowest px-2 py-0.5 text-xs text-on-surface-variant'>
                          {t('caregiver.activeSession.carePlan.withPhoto')}
                        </span>
                      )}
                      {task.medCount && (
                        <span className='rounded bg-surface-container-lowest px-2 py-0.5 text-xs text-on-surface-variant'>
                          {t('caregiver.activeSession.carePlan.medCount', { count: task.medCount })}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>{getTaskDesc(task)}</p>
                </div>
              </div>
            )
          }

          if (task.status === 'in_progress') {
            return (
              <div
                className='flex items-start gap-4 rounded-xl bg-surface-container-high/60 p-4 shadow-xs'
                key={task.id}
              >
                <div className='pt-0.5'>
                  <div className='flex h-6 w-6 items-center justify-center rounded-md bg-surface-container-lowest text-secondary shadow-inner'>
                    <span className='h-2.5 w-2.5 animate-pulse rounded-full bg-secondary' />
                  </div>
                </div>
                <div className='flex flex-1 flex-col gap-1'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <span className='text-sm font-bold text-on-surface sm:text-base'>{getTaskTitle(task)}</span>
                    <span className='animate-pulse rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-on-primary'>
                      {t('caregiver.activeSession.carePlan.inProgressBadge')}
                    </span>
                  </div>
                  <p className='text-xs leading-relaxed text-on-surface sm:text-sm'>{getTaskDesc(task)}</p>

                  <div className='mt-2 flex flex-wrap items-center gap-2'>
                    <button
                      className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-container'
                      onClick={() => onMarkCompleted(task.id)}
                      type='button'
                    >
                      <span className='material-symbols-outlined text-[16px]'>{ICON_CHECK_CIRCLE}</span>
                      <span>{t('caregiver.activeSession.carePlan.markDoneBtn')}</span>
                    </button>
                    <button
                      className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container'
                      type='button'
                    >
                      <span className='material-symbols-outlined text-[16px]'>{ICON_ADD_PHOTO}</span>
                      <span>{t('caregiver.activeSession.carePlan.addPhotoBtn')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              className='flex items-start gap-4 rounded-xl bg-surface-container-lowest p-4 opacity-85 transition-opacity hover:opacity-100'
              key={task.id}
            >
              <div className='pt-0.5'>
                <div className='flex h-6 w-6 items-center justify-center rounded-md bg-surface-container'>
                  <span className='h-2 w-2 rounded-full bg-outline-variant' />
                </div>
              </div>
              <div className='flex flex-1 flex-col gap-1'>
                <div className='flex flex-wrap items-center justify-between gap-2'>
                  <span className='text-sm font-semibold text-on-surface'>{getTaskTitle(task)}</span>
                  {task.expectedTime && (
                    <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
                      {t('caregiver.activeSession.carePlan.expectedTime', { time: task.expectedTime })}
                    </span>
                  )}
                </div>
                <p className='text-xs leading-relaxed text-on-surface-variant sm:text-sm'>{getTaskDesc(task)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
