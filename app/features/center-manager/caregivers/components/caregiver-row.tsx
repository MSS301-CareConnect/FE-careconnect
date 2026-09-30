import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import type { ManagerCaregiver } from '../caregiver-preview'

export function CaregiverRow({ person }: { person: ManagerCaregiver }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  const date = person.joined
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${person.joined}T00:00:00Z`)
      )
    : null
  return (
    <tr className='border-t border-outline-variant/25 align-top hover:bg-surface-container-low/40'>
      <td className='p-4'>
        <div className='flex min-w-56 gap-3'>
          <span className='relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-container text-primary'>
            <Icon name='person' />
            <img
              alt={person.name}
              className='absolute inset-0 h-full w-full object-cover'
              loading='lazy'
              onError={(event) => {
                event.currentTarget.hidden = true
              }}
              src={person.photo}
            />
          </span>
          <div>
            <Link
              className='font-bold hover:text-primary hover:underline'
              to={`/center-manager/caregivers/${person.id}`}
            >
              {person.name}
            </Link>
            <p className='mt-1 text-xs text-outline'>#{person.id}</p>
            <p className='mt-2 flex items-center gap-1 text-xs text-on-surface-variant'>
              <Icon className='text-base text-amber-500' filled name='star' />
              {t('centerManager.management.rating', { score: number(person.rating), count: person.reviews })}
            </p>
            <p className='mt-1 text-xs text-outline'>
              {date ? t('centerManager.management.joined', { date }) : t('centerManager.management.newFile')}
            </p>
          </div>
        </div>
      </td>
      <td className='p-4'>
        <div className='flex min-w-40 max-w-64 flex-wrap gap-1.5'>
          {person.specialties.map((specialty) => (
            <span
              className='rounded-md bg-secondary-container/55 px-2 py-1 text-xs font-medium text-primary'
              key={specialty}
            >
              {t(`centerManager.management.specialties.${specialty}`)}
            </span>
          ))}
        </div>
      </td>
      <td className='p-4'>
        <p className='min-w-40 text-sm font-semibold'>{t('centerManager.management.years', { count: person.years })}</p>
        <p className='mt-2 flex items-start gap-1 text-xs leading-5 text-outline'>
          <Icon className='text-base' name='local_hospital' />
          {person.hospital}
        </p>
      </td>
      <td className='p-4'>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${person.status === 'disabled' ? 'bg-error-container text-error' : person.status === 'onduty' ? 'bg-sky-50 text-sky-800' : 'bg-secondary-container text-primary'}`}
        >
          {t(`centerManager.management.statuses.${person.status}`)}
        </span>
      </td>
      <td className='p-4'>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${person.verification === 'pending' ? 'bg-amber-50 text-amber-800' : person.verification === 'update' ? 'bg-error-container text-error' : 'bg-secondary-container text-primary'}`}
        >
          {t(`centerManager.management.verifications.${person.verification}`)}
        </span>
        <p className='mt-2 text-xs text-outline'>
          {person.license ? `#${person.license}` : t('centerManager.management.noLicense')}
        </p>
      </td>
      <td className='p-4'>
        <div className='flex items-center gap-1'>
          <Link
            aria-label={t('centerManager.management.view', { name: person.name })}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary-container'
            to={`/center-manager/caregivers/${person.id}`}
          >
            <Icon className='text-xl' name='visibility' />
          </Link>
          <button
            aria-label={t('centerManager.management.edit', { name: person.name })}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-outline disabled:cursor-not-allowed'
            disabled
            title={t('centerManager.unavailable')}
            type='button'
          >
            <Icon className='text-xl' name='edit' />
          </button>
          <button
            aria-label={t(
              person.verification === 'pending'
                ? 'centerManager.management.approve'
                : person.status === 'disabled'
                  ? 'centerManager.management.enable'
                  : 'centerManager.management.disable',
              { name: person.name }
            )}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-outline disabled:cursor-not-allowed'
            disabled
            title={t('centerManager.unavailable')}
            type='button'
          >
            <Icon
              className='text-xl'
              name={
                person.verification === 'pending'
                  ? 'check_circle'
                  : person.status === 'disabled'
                    ? 'lock_open'
                    : 'block'
              }
            />
          </button>
        </div>
      </td>
    </tr>
  )
}
