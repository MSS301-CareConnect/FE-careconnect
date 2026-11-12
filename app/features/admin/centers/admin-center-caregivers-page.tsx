import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { Icon } from '~/shared/ui/icon'

import { fetchCaregivers, fetchCenter, providerKeys } from '~/entities/provider/provider-api'
import { BentoPageHeader, bentoBackLink, bentoContainer } from '~/shared/ui/bento-page-header'

const key = 'admin.provider' as const
const statusKeys = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const

export function AdminCenterCaregiversPage() {
  const { id = '' } = useParams()
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const page = Math.max(0, Number(params.get('page')) || 0)
  const selected = params.get('caregiver')
  const center = useQuery({
    queryKey: providerKeys.center(id),
    queryFn: () => fetchCenter(id),
    retry: false,
    enabled: Boolean(id)
  })
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(id), page],
    queryFn: () => fetchCaregivers(id, { page, size: 20 }),
    retry: false,
    enabled: Boolean(id)
  })
  // Links from before 2026-11-12 opened the profile here as `?caregiver=`; it has its own page now.
  if (selected) return <Navigate replace to={`/admin/caregivers/${selected}`} />
  function update(name: string, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous)
      if (value) next.set(name, value)
      else next.delete(name)
      return next
    })
  }
  return (
    <main className={`${bentoContainer} space-y-6`}>
      <Link className={bentoBackLink} to={`/admin/centers/${id}?tab=staff`}>
        <Icon name='arrow_back' />
        {center.data?.centerName ?? t(`${key}.backToCenters`)}
      </Link>
      <BentoPageHeader
        actions={
          <span className='rounded-full bg-mint-100 px-3.5 py-1.5 text-sm font-bold text-forest-900 tabular-nums'>
            {caregivers.data?.totalElements ?? 0}
          </span>
        }
        description={center.isSuccess ? center.data.centerName : undefined}
        title={t(`${key}.caregiverTitle`)}
      />
      {center.isError ? <p role='alert'>{t(`${key}.centerLoadError`)}</p> : null}
      {caregivers.isPending ? <p role='status'>{t(`${key}.loading`)}</p> : null}
      {caregivers.isError ? (
        <div role='alert'>
          <p>{t(`${key}.caregiverLoadError`)}</p>
          <button className='text-primary underline' onClick={() => void caregivers.refetch()} type='button'>
            {t(`${key}.retry`)}
          </button>
        </div>
      ) : null}
      {caregivers.isSuccess ? (
        <section className='overflow-hidden rounded-2xl border border-forest-900/[0.06] bg-white shadow-[var(--shadow-card)]'>
          {caregivers.data.items.length === 0 ? (
            <p className='p-5'>{t(`${key}.caregiverEmpty`)}</p>
          ) : (
            <ul className='divide-y divide-outline-variant/20'>
              {caregivers.data.items.map((person) => (
                <li
                  className='flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-surface-container-low/40'
                  key={person.id}
                >
                  <div className='flex items-center gap-3'>
                    <CaregiverAvatar caregiverId={person.id} className='h-12 w-12 rounded-xl' name={person.fullName} />
                    <div>
                      <strong>{person.fullName}</strong>
                      <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-outline'>
                        <ProviderStatusBadge status={person.verificationStatus}>
                          {t(`${key}.${verificationKeys[person.verificationStatus]}`)}
                        </ProviderStatusBadge>
                        <ProviderStatusBadge status={person.caregiverStatus}>
                          {t(`${key}.${statusKeys[person.caregiverStatus]}`)}
                        </ProviderStatusBadge>
                      </div>
                    </div>
                  </div>
                  <Link
                    className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary hover:bg-secondary-container'
                    to={`/admin/caregivers/${person.id}`}
                  >
                    {t(`${key}.centerDetails`)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className='flex justify-between border-t p-4 text-sm'>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page === 0}
              onClick={() => update('page', String(page - 1))}
              type='button'
            >
              {t(`${key}.previous`)}
            </button>
            <span>{t(`${key}.page`, { page: page + 1, pages: Math.max(1, caregivers.data.totalPages) })}</span>
            <button
              className='text-primary disabled:opacity-40'
              disabled={page + 1 >= caregivers.data.totalPages}
              onClick={() => update('page', String(page + 1))}
              type='button'
            >
              {t(`${key}.next`)}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}
