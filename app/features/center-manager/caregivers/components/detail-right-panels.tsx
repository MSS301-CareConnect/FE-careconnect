import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import type { ManagerCaregiver } from '../caregiver-preview'

const clinical = ['tube', 'injection', 'wounds', 'dressing', 'oxygen'] as const
const supportive = ['dementia', 'therapy', 'hygiene', 'nutrition'] as const
const scheduleCells = [
  ['available', 'booked', 'hospitalDuty', 'booked', 'available', 'off', 'off'],
  ['booked', 'hospitalDuty', 'booked', 'hospitalDuty', 'booked', 'off', 'off'],
  ['off', 'off', 'hospitalDuty', 'off', 'hospitalDuty', 'off', 'off']
] as const

export function DetailRightPanels({ person }: { person: ManagerCaregiver }) {
  const { t, i18n } = useTranslation()
  const featured = person.id === 'CG-1024'
  return (
    <div className='space-y-6'>
      <SectionCard icon='vaccines' title={t('centerManager.detail.skills')}>
        <p className='mb-4 text-xs text-outline'>{t('centerManager.detail.skillsHint')}</p>
        {featured ? (
          <>
            <h3 className='mb-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
              {t('centerManager.detail.clinical')}
            </h3>
            <div className='grid gap-2 sm:grid-cols-2'>
              {clinical.map((key) => (
                <div
                  className='flex items-start gap-2 rounded-lg bg-surface-container-low p-3 text-xs leading-5'
                  key={key}
                >
                  <Icon className='shrink-0 text-lg text-primary' name='check' />
                  {t(`centerManager.detail.skillList.${key}`)}
                </div>
              ))}
            </div>
            <h3 className='mb-3 mt-5 text-xs font-bold uppercase tracking-wide text-on-surface-variant'>
              {t('centerManager.detail.supportive')}
            </h3>
            <div className='grid gap-2 sm:grid-cols-2'>
              {supportive.map((key) => (
                <div
                  className='flex items-start gap-2 rounded-lg bg-surface-container-low p-3 text-xs leading-5'
                  key={key}
                >
                  <Icon className='shrink-0 text-lg text-primary' name='check' />
                  {t(`centerManager.detail.skillList.${key}`)}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {person.specialties.map((key) => (
              <span
                className='rounded-lg bg-secondary-container px-3 py-2 text-xs font-semibold text-primary'
                key={key}
              >
                {t(`centerManager.management.specialties.${key}`)}
              </span>
            ))}
          </div>
        )}
      </SectionCard>
      {featured && (
        <SectionCard icon='workspace_premium' title={t('centerManager.detail.certificates')}>
          <div className='grid gap-3 sm:grid-cols-2'>
            {(['degree', 'license', 'bls', 'elderly'] as const).map((key) => (
              <div className='rounded-xl bg-surface-container-low p-4' key={key}>
                <Icon className='text-2xl text-primary' name={key === 'degree' ? 'school' : 'workspace_premium'} />
                <h3 className='mt-2 text-sm font-bold'>{t(`centerManager.detail.certificateList.${key}`)}</h3>
                <p className='mt-2 text-xs text-outline'>{t('centerManager.detail.verificationHint')}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
      <SectionCard icon='timeline' title={t('centerManager.detail.experience')}>
        <ol className='ml-2 border-l-2 border-secondary-container'>
          {featured ? (
            (['current', 'previous', 'careconnect'] as const).map((key) => (
              <li className='relative pb-6 pl-6 last:pb-0' key={key}>
                <span className='absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white' />
                <h3 className='text-sm font-bold'>{t(`centerManager.detail.experienceList.${key}`)}</h3>
                <p className='mt-2 text-xs text-outline'>
                  {key === 'careconnect'
                    ? t('centerManager.management.years', { count: person.years })
                    : t(`centerManager.detail.experienceList.${key}Place`)}
                </p>
              </li>
            ))
          ) : (
            <li className='relative pl-6'>
              <span className='absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white' />
              <h3 className='text-sm font-bold'>{person.hospital}</h3>
              <p className='mt-2 text-xs text-outline'>
                {t('centerManager.management.years', { count: person.years })}
              </p>
            </li>
          )}
        </ol>
      </SectionCard>
      {featured && (
        <SectionCard
          action={
            <button
              className='text-xs font-semibold text-outline disabled:cursor-not-allowed'
              disabled
              title={t('centerManager.unavailable')}
              type='button'
            >
              {t('centerManager.detail.editSchedule')}
            </button>
          }
          icon='event_available'
          title={t('centerManager.detail.schedule')}
        >
          <p className='text-xs text-outline'>{t('centerManager.detail.scheduleHint')}</p>
          <div className='mt-4 flex flex-wrap gap-4 text-[11px]'>
            {(['available', 'booked', 'off'] as const).map((key) => (
              <span className='flex items-center gap-1' key={key}>
                <span
                  className={`h-3 w-3 rounded ${key === 'available' ? 'bg-primary' : key === 'booked' ? 'bg-blue-600' : 'bg-surface-container-high'}`}
                />
                {t(`centerManager.detail.${key}`)}
              </span>
            ))}
          </div>
          <div className='mt-4 overflow-x-auto'>
            <table className='min-w-[560px] w-full text-center text-xs'>
              <thead>
                <tr>
                  <th className='p-2 text-left' scope='col'>
                    {t('centerManager.detail.slot')}
                  </th>
                  {[2, 3, 4, 5, 6, 7, 1].map((day, index) => (
                    <th className='p-2' key={day} scope='col'>
                      {new Intl.DateTimeFormat(i18n.resolvedLanguage, { weekday: 'short', timeZone: 'UTC' }).format(
                        new Date(Date.UTC(2026, 8, 21 + index))
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(['morning', 'afternoon', 'night'] as const).map((slot, index) => (
                  <tr className='border-t border-outline-variant/20' key={slot}>
                    <th className='p-2 text-left font-semibold' scope='row'>
                      {t(`centerManager.detail.${slot}`)}
                    </th>
                    {scheduleCells[index].map((value, position) => (
                      <td className='p-1' key={position}>
                        <span
                          className={`block rounded px-1 py-2 ${value === 'available' ? 'bg-primary/15 text-primary' : value === 'booked' ? 'bg-blue-50 text-blue-800' : 'bg-surface-container-low text-outline'}`}
                        >
                          {t(`centerManager.detail.${value}`)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className='mt-4 text-xs text-outline'>
            {t('centerManager.detail.scheduleDetails')} · {t('centerManager.unavailable')}
          </p>
        </SectionCard>
      )}
    </div>
  )
}
