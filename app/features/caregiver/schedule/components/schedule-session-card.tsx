import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { formatHour, patientAges, patientImages, type ScheduleSession } from '../schedule-preview'

const statusColors = {
  ongoing: 'bg-secondary-fixed text-primary',
  confirmed: 'bg-secondary-container text-primary',
  upcoming: 'bg-surface-container-high text-on-surface-variant',
  completed: 'bg-surface-container-low text-outline'
}

export function ScheduleSessionCard({ session }: { session: ScheduleSession }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale).format(value)
  const patient = session.patient
  const name = t(`caregiver.schedulePage.patients.${patient}.name`)
  const actions =
    session.status === 'ongoing'
      ? ([
          { key: 'call', icon: 'call' },
          { key: 'report', icon: 'assignment_turned_in' }
        ] as const)
      : patient === 'c'
        ? ([
            { key: 'note', icon: 'edit_note' },
            { key: 'route', icon: 'directions' }
          ] as const)
        : ([
            { key: 'record', icon: 'folder_shared' },
            { key: 'gps', icon: 'near_me' }
          ] as const)
  return (
    <article
      aria-label={name}
      className={`space-y-4 rounded-xl bg-white p-4 sm:p-6 ${session.status === 'ongoing' ? 'shadow-md ring-1 ring-primary/10' : 'shadow-sm'}`}
    >
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColors[session.status]}`}
          >
            {session.status === 'ongoing' && <span className='h-1.5 w-1.5 rounded-full bg-primary' />}
            {t(`caregiver.schedulePage.status.${session.status}`)}
          </span>
          <p className='text-base font-bold'>
            {formatHour(session.startHour, locale)}
            <span className='mx-1' aria-hidden='true'>
              –
            </span>
            {formatHour(session.endHour, locale)}
            <span className='ml-2 text-xs font-normal text-outline'>
              {t('caregiver.schedulePage.card.duration', { hours: number(session.endHour - session.startHour) })}
            </span>
          </p>
        </div>
        <p className='flex items-center gap-1.5 text-[10px] leading-5 text-outline'>
          <Icon
            className='text-base text-primary'
            name={session.status === 'ongoing' ? 'verified_user' : patient === 'c' ? 'near_me' : 'sync'}
          />
          {session.status === 'ongoing'
            ? t('caregiver.schedulePage.card.insurance')
            : patient === 'c'
              ? t('caregiver.schedulePage.card.distance', { distance: number(2.4) })
              : t('caregiver.schedulePage.card.recurring', { count: 3 })}
        </p>
      </div>
      <div className='flex flex-col gap-4 rounded-lg bg-surface-container-low p-4 sm:flex-row sm:items-center'>
        <div className='relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high text-outline'>
          <Icon className='text-4xl' name='person' />
          {patientImages[patient] && (
            <img
              alt={name}
              className='absolute inset-0 h-full w-full object-cover'
              loading='lazy'
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
              src={patientImages[patient]}
            />
          )}
        </div>
        <div className='min-w-0 flex-1 space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-lg font-bold'>{name}</h3>
            <span className='rounded bg-surface-container-highest px-2 py-1 text-[10px] font-semibold'>
              {t('caregiver.schedulePage.card.age', { age: number(patientAges[patient]) })}
            </span>
            <span className='rounded bg-secondary-container px-2 py-1 text-[10px] font-semibold text-primary'>
              {t(`caregiver.schedulePage.patients.${patient}.tag`)}
            </span>
          </div>
          <p className='flex items-start gap-2 text-sm font-medium leading-6'>
            <Icon
              className='shrink-0 text-lg text-primary'
              name={patient === 'a' ? 'medical_services' : patient === 'c' ? 'healing' : 'vital_signs'}
            />
            {t(`caregiver.schedulePage.patients.${patient}.service`)}
          </p>
          <p className='flex items-start gap-2 text-xs leading-5 text-on-surface-variant'>
            <Icon className='shrink-0 text-base' name='family_restroom' />
            {t('caregiver.schedulePage.card.guardian', {
              name: t(`caregiver.schedulePage.patients.${patient}.guardian`)
            })}
          </p>
        </div>
      </div>
      <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-start'>
        <p className='flex items-start gap-2 text-xs leading-6 text-on-surface-variant'>
          <Icon className='shrink-0 text-lg text-primary' name='location_on' />
          {t(`caregiver.schedulePage.patients.${patient}.address`)}
        </p>
        {session.status === 'ongoing' && (
          <button
            className='flex shrink-0 items-center gap-1 text-xs font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-60'
            disabled
            title={t('caregiver.unavailable')}
            type='button'
          >
            <Icon className='text-base' name='navigation' />
            {t('caregiver.schedulePage.card.map')}
          </button>
        )}
      </div>
      {session.status === 'ongoing' && (
        <div className='flex flex-col justify-between gap-2 rounded-lg bg-surface-container p-3 text-[11px] sm:flex-row sm:items-center'>
          <p className='flex items-start gap-2 leading-5'>
            <Icon className='shrink-0 text-lg text-primary' name='task_alt' />
            {t('caregiver.schedulePage.card.checklist')}
          </p>
          <span className='shrink-0 font-bold text-primary'>
            {t('caregiver.schedulePage.card.checklistCount', { done: number(2), total: number(4) })}
          </span>
        </div>
      )}
      <div className='flex flex-wrap justify-end gap-2 pt-1'>
        {actions.map((action, index) => (
          <button
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-65 ${index === 1 ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface'}`}
            disabled
            key={action.key}
            title={t('caregiver.unavailable')}
            type='button'
          >
            <Icon className='text-lg' name={action.icon} />
            {t(`caregiver.schedulePage.card.${action.key}`)}
          </button>
        ))}
      </div>
    </article>
  )
}
