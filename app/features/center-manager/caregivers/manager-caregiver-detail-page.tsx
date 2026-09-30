import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { findManagerCaregiver, type ManagerCaregiver } from './caregiver-preview'
import { DetailLeftPanels } from './components/detail-left-panels'
import { DetailRightPanels } from './components/detail-right-panels'

export function ManagerCaregiverDetailPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const person = findManagerCaregiver(id)
  useDocumentTitle(
    person ? t('centerManager.detail.documentTitle', { name: person.name }) : t('centerManager.detail.notFound')
  )
  if (!person)
    return (
      <div className='mx-auto max-w-7xl px-6 py-20'>
        <h1 className='text-2xl font-bold'>{t('centerManager.detail.notFound')}</h1>
        <Link className='mt-5 inline-block text-primary underline' to='/center-manager/caregivers'>
          {t('centerManager.detail.back')}
        </Link>
      </div>
    )
  return <ManagerCaregiverDetail key={person.id} person={person} />
}

function ManagerCaregiverDetail({ person }: { person: ManagerCaregiver }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
  const date = person.joined
    ? new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(`${person.joined}T00:00:00Z`)
      )
    : null
  const featured = person.id === 'CG-1024'
  const stats = [
    { key: 'completed', icon: 'task_alt', value: number(person.completed) },
    {
      key: 'revenue',
      icon: 'payments',
      value: featured
        ? new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(6420)
        : t('centerManager.unavailable')
    },
    { key: 'rating', icon: 'star', value: `${number(person.rating)} / ${number(5)}` },
    {
      key: 'tier',
      icon: 'medical_information',
      value: featured ? t('centerManager.detail.tierValue') : t('centerManager.unavailable')
    }
  ] as const
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <nav aria-label={t('centerManager.menu')} className='flex flex-wrap items-center gap-2 text-xs text-outline'>
        <Link className='hover:text-primary' to='/center-manager/caregivers'>
          {t('centerManager.portal')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <Link className='hover:text-primary' to='/center-manager/caregivers'>
          {t('centerManager.caregivers')}
        </Link>
        <Icon className='text-sm' name='chevron_right' />
        <span>{person.id}</span>
      </nav>
      <Link
        className='inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2.5 text-sm font-semibold text-primary hover:bg-secondary-container'
        to='/center-manager/caregivers'
      >
        <Icon name='arrow_back' />
        {t('centerManager.detail.back')}
      </Link>
      <section className='rounded-xl bg-white p-5 shadow-sm sm:p-7'>
        <div className='flex flex-wrap items-start justify-between gap-5'>
          <div className='flex min-w-0 flex-wrap items-center gap-5'>
            <span className='relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-primary sm:h-28 sm:w-28'>
              <Icon className='text-5xl' name='person' />
              <img
                alt={person.name}
                className='absolute inset-0 h-full w-full object-cover'
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
                src={person.photo}
              />
            </span>
            <div className='min-w-0'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-2xl font-extrabold tracking-tight'>{person.name}</h1>
                <span className='rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'>
                  {t(`centerManager.management.statuses.${person.status}`)}
                </span>
              </div>
              <p className='mt-2 text-xs text-outline'>
                #{person.id}
                {date ? ` · ${t('centerManager.detail.joined', { date })}` : ''}
              </p>
              <p className='mt-2 flex items-center gap-1 text-sm font-semibold'>
                <Icon className='text-amber-500' filled name='star' />
                {number(person.rating)} / {number(5)}
                <span className='ml-2 font-normal text-outline'>
                  {t('centerManager.detail.reviewCount', { reviews: person.reviews, sessions: person.completed })}
                </span>
              </p>
              {person.license && (
                <p className='mt-3 inline-flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-semibold text-primary'>
                  <Icon className='text-lg' name='verified_user' />
                  {t('centerManager.detail.licenseBadge', { license: person.license })}
                </p>
              )}
            </div>
          </div>
          <div className='flex flex-wrap gap-2'>
            {(
              [
                { key: 'update', icon: 'edit' },
                { key: 'assign', icon: 'calendar_add_on' },
                { key: 'reapprove', icon: 'published_with_changes' },
                { key: 'suspend', icon: 'block' }
              ] as const
            ).map((action) => (
              <button
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-55 ${action.key === 'assign' ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant'}`}
                disabled
                key={action.key}
                title={t('centerManager.unavailable')}
                type='button'
              >
                <Icon className='text-lg' name={action.icon} />
                {t(`centerManager.detail.${action.key}`)}
              </button>
            ))}
          </div>
        </div>
      </section>
      <p className='rounded-lg bg-secondary-container/45 px-4 py-3 text-xs leading-5 text-primary'>
        {t('centerManager.detail.preview')}
      </p>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <section className='rounded-xl bg-white p-5 shadow-sm' key={stat.key}>
            <div className='flex items-center justify-between gap-2'>
              <h2 className='text-xs font-semibold text-outline'>{t(`centerManager.detail.${stat.key}`)}</h2>
              <Icon className='text-2xl text-primary' name={stat.icon} />
            </div>
            <p className='mt-4 text-xl font-extrabold text-primary'>{stat.value}</p>
          </section>
        ))}
      </div>
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='lg:col-span-5'>
          <DetailLeftPanels person={person} />
        </div>
        <div className='lg:col-span-7'>
          <DetailRightPanels person={person} />
        </div>
      </div>
      {!featured && (
        <p className='rounded-xl bg-white p-5 text-sm text-outline'>{t('centerManager.detail.extraUnavailable')}</p>
      )}
    </div>
  )
}
