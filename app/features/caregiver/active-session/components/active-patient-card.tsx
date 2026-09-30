import { useTranslation } from 'react-i18next'
import type { ActiveSessionData } from '../active-session-preview'

const ICON_NEUROLOGY = 'neurology'
const ICON_LOCATION = 'location_on'
const ICON_OPEN_MAP = 'open_in_new'
const ICON_CALL = 'call'
const ICON_CHAT = 'chat'
const ICON_WARNING = 'warning'

interface ActivePatientCardProps {
  patient: ActiveSessionData['patient']
}

export function ActivePatientCard({ patient }: ActivePatientCardProps) {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-xs'>
      {/* Patient & Guardian Top Bar */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div className='flex items-center gap-4'>
          <div className='relative shrink-0'>
            <img
              alt={patient.name}
              className='h-20 w-20 rounded-full object-cover shadow-xs ring-2 ring-primary/20'
              src={patient.avatar}
            />
            <span
              className='absolute bottom-0 right-0 h-4 w-4 rounded-full bg-secondary ring-2 ring-surface-container-lowest'
              title={t('caregiver.activeSession.patient.restingStatus')}
            />
          </div>

          <div className='flex flex-col'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-lg font-bold text-on-surface sm:text-xl'>{patient.name}</span>
              <span className='rounded bg-surface-container px-2 py-0.5 text-xs font-semibold text-on-surface-variant'>
                {t('caregiver.activeSession.patient.age')}
              </span>
              <span className='rounded bg-surface-container-low px-2 py-0.5 text-xs font-bold text-secondary'>
                {t('caregiver.activeSession.patient.code')}
              </span>
            </div>

            <p className='mt-1 flex items-center gap-1 text-sm font-semibold text-secondary'>
              <span className='material-symbols-outlined text-[18px]'>{ICON_NEUROLOGY}</span>
              <span>{t('caregiver.activeSession.patient.condition')}</span>
            </p>

            <div className='mt-1 flex flex-wrap items-center gap-1 text-xs text-on-surface-variant sm:text-sm'>
              <span className='material-symbols-outlined text-[16px] text-outline'>{ICON_LOCATION}</span>
              <span className='truncate'>{patient.address}</span>
              <a
                className='ml-1 inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline'
                href='https://maps.google.com'
                rel='noopener noreferrer'
                target='_blank'
              >
                <span>{t('caregiver.activeSession.patient.mapBtn')}</span>
                <span className='material-symbols-outlined text-[14px]'>{ICON_OPEN_MAP}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Guardian Quick Actions */}
        <div className='flex min-w-[230px] flex-col gap-1.5 self-stretch rounded-xl bg-surface-container-low p-3 md:self-auto'>
          <span className='text-xs font-semibold uppercase text-on-surface-variant'>
            {t('caregiver.activeSession.patient.guardianLabel')}
          </span>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-sm font-semibold text-on-surface'>
                {t('caregiver.activeSession.patient.guardianName')}
              </p>
              <p className='text-xs text-on-surface-variant'>{t('caregiver.activeSession.patient.guardianRelation')}</p>
            </div>
            <div className='flex items-center gap-1.5'>
              <a
                className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-on-primary shadow-xs transition-colors hover:bg-primary-container'
                href={`tel:${patient.guardian.phone}`}
                title={t('caregiver.activeSession.patient.callTitle')}
              >
                <span className='material-symbols-outlined text-[18px]'>{ICON_CALL}</span>
              </a>
              <button
                className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface shadow-xs transition-colors hover:bg-surface-container'
                title={t('caregiver.activeSession.patient.chatTitle')}
                type='button'
              >
                <span className='material-symbols-outlined text-[18px]'>{ICON_CHAT}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Warning Alert Banner */}
      <div className='flex items-start gap-3 rounded-xl bg-error-container/40 p-4'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-error text-on-error'>
          <span className='material-symbols-outlined text-[20px]'>{ICON_WARNING}</span>
        </div>
        <div className='flex flex-1 flex-col gap-1'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <span className='text-xs font-bold text-on-error-container sm:text-sm'>
              {t('caregiver.activeSession.patient.warningTitle')}
            </span>
            <span className='rounded bg-error px-2 py-0.5 text-xs font-bold uppercase text-on-error'>
              {t('caregiver.activeSession.patient.warningBadge')}
            </span>
          </div>
          <p className='text-xs leading-relaxed text-on-error-container sm:text-sm'>
            {t('caregiver.activeSession.patient.warningText')}
          </p>
        </div>
      </div>
    </section>
  )
}
