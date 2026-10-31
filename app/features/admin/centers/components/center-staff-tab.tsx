import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { accountKeys, fetchAccounts } from '~/entities/identity/account-api'
import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { fetchCaregivers, providerKeys } from '~/entities/provider/provider-api'
import type { ListCenterCaregiversParams, ProviderCaregiverRecord } from '~/shared/api/generated/contracts'
import { baseControlClass } from '~/shared/ui/form-field'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

const key = 'admin.centersPage.staff' as const
const PAGE_SIZE = 20
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'] as const
type CaregiverStatus = (typeof STATUSES)[number]
type WorkStatus = 'working' | 'resting' | 'suspended' | 'left' | 'locked'

const WORK_TONES: Record<WorkStatus, StatusTone> = {
  working: 'success',
  resting: 'neutral',
  suspended: 'warning',
  left: 'neutral',
  locked: 'error'
}

/**
 * Work status from the account (IdentityService) and the profile at this center (ProviderService) — never from
 * check-in / check-out (D-03). Suspended and archived profiles win over the account state.
 */
export function workStatus(caregiver: ProviderCaregiverRecord, accountStatus: string | undefined): WorkStatus {
  if (caregiver.caregiverStatus === 'ARCHIVED') return 'left'
  if (caregiver.caregiverStatus === 'SUSPENDED') return 'suspended'
  if (accountStatus === 'LOCKED') return 'locked'
  return caregiver.caregiverStatus === 'ACTIVE' ? 'working' : 'resting'
}

export function CenterStaffTab({ centerId }: { centerId: string }) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<CaregiverStatus | ''>('')
  const number = new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'vi-VN')
  const params: ListCenterCaregiversParams = { page, size: PAGE_SIZE, status: status || undefined }
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), params],
    queryFn: () => fetchCaregivers(centerId, params),
    placeholderData: keepPreviousData,
    retry: false
  })
  // One page of up to 100 caregiver accounts of the center gives each row its account status.
  const accountParams = { role: 'CAREGIVER', centerId, page: 0, size: 100 } as const
  const accounts = useQuery({
    queryKey: accountKeys.list(accountParams),
    queryFn: () => fetchAccounts(accountParams),
    retry: false
  })
  const accountStatus = new Map((accounts.data?.content ?? []).map((user) => [user.id, user.status]))

  // Counts read `totalElements` of one-row pages, so they cover the whole center, not this page.
  const counters = useQueries({
    queries: [
      ...(['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const).map((item) => ({
        queryKey: [...providerKeys.caregivers(centerId), 'count', item],
        queryFn: () => fetchCaregivers(centerId, { status: item, page: 0, size: 1 }),
        retry: false
      })),
      {
        queryKey: [...providerKeys.caregivers(centerId), 'count', 'PENDING'],
        queryFn: () => fetchCaregivers(centerId, { verification: 'PENDING', page: 0, size: 1 }),
        retry: false
      }
    ]
  })
  const lockedCount = useQuery({
    queryKey: accountKeys.list({ ...accountParams, status: 'LOCKED', size: 1 }),
    queryFn: () => fetchAccounts({ ...accountParams, status: 'LOCKED', size: 1 }),
    retry: false
  })
  const [active, inactive, suspended, pending] = counters.map((query) => query.data?.totalElements)
  const metrics = [
    {
      name: 'total',
      value:
        active === undefined || inactive === undefined || suspended === undefined
          ? undefined
          : active + inactive + suspended
    },
    { name: 'working', value: active },
    { name: 'resting', value: inactive },
    { name: 'suspended', value: suspended },
    { name: 'locked', value: lockedCount.data?.totalElements },
    { name: 'pending', value: pending }
  ] as const

  return (
    <div className='space-y-5'>
      <section aria-label={t(`${key}.metrics.total`)} className='grid gap-3 sm:grid-cols-3 xl:grid-cols-6'>
        {metrics.map((metric) => (
          <div className='rounded-xl border border-outline-variant/40 bg-white px-4 py-3' key={metric.name}>
            <p className='text-xs font-medium text-on-surface-variant'>{t(`${key}.metrics.${metric.name}`)}</p>
            <p className='mt-1 text-xl font-bold tabular-nums text-on-surface'>
              {metric.value === undefined ? '—' : number.format(metric.value)}
            </p>
          </div>
        ))}
      </section>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <p className='flex max-w-xl items-start gap-2 text-xs text-on-surface-variant'>
          <Icon className='text-base' name='info' />
          {t(`${key}.note`)}
        </p>
        <div className='flex flex-wrap items-end gap-3'>
          <label className='flex flex-col gap-1 text-xs font-semibold text-on-surface-variant'>
            {t(`${key}.columns.work`)}
            <select
              className={baseControlClass}
              onChange={(event) => {
                setStatus(event.target.value as CaregiverStatus | '')
                setPage(0)
              }}
              value={status}
            >
              <option value=''>{t('admin.centersPage.tabs.all')}</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`${key}.work.${workStatus({ caregiverStatus: item } as ProviderCaregiverRecord, 'ACTIVE')}`)}
                </option>
              ))}
            </select>
          </label>
          <Link
            className='inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-outline-variant px-4 text-sm font-semibold text-primary hover:bg-surface-container-low'
            to={`/admin/centers/${centerId}/caregivers`}
          >
            <Icon className='text-lg' name='fact_check' />
            {t(`${key}.review`)}
          </Link>
        </div>
      </div>
      {caregivers.isPending ? (
        <SkeletonBlock label={t(`${key}.loading`)} rows={5} />
      ) : caregivers.isError ? (
        <ErrorState
          message={t(`${key}.error`)}
          onRetry={() => void caregivers.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      ) : caregivers.data.items.length === 0 ? (
        <EmptyState icon='groups' title={t(`${key}.empty`)} />
      ) : (
        <div className='overflow-x-auto rounded-xl border border-outline-variant/40 bg-white'>
          <table className='w-full min-w-180 text-left text-sm'>
            <thead className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
              <tr>
                {(['name', 'work', 'verification', 'experience', 'rating'] as const).map((column) => (
                  <th className='px-4 py-3' key={column} scope='col'>
                    {t(`${key}.columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-outline-variant/25'>
              {caregivers.data.items.map((caregiver) => {
                const work = workStatus(caregiver, caregiver.userId ? accountStatus.get(caregiver.userId) : undefined)
                return (
                  <tr key={caregiver.id}>
                    <td className='px-4 py-3'>
                      <span className='flex items-center gap-3'>
                        <CaregiverAvatar
                          caregiverId={caregiver.id}
                          className='h-9 w-9 rounded-full'
                          name={caregiver.fullName}
                        />
                        <span className='font-semibold text-on-surface'>{caregiver.fullName}</span>
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <StatusBadge dot tone={WORK_TONES[work]}>
                        {t(`${key}.work.${work}`)}
                      </StatusBadge>
                    </td>
                    <td className='px-4 py-3'>{t(`${key}.verification.${caregiver.verificationStatus}`)}</td>
                    <td className='px-4 py-3 tabular-nums'>
                      {caregiver.experienceYears === undefined
                        ? '—'
                        : t(`${key}.years`, { count: caregiver.experienceYears })}
                    </td>
                    <td className='px-4 py-3 tabular-nums'>
                      {caregiver.ratingCount
                        ? t(`${key}.rating`, {
                            value: number.format(caregiver.ratingAverage ?? 0),
                            count: caregiver.ratingCount
                          })
                        : t(`${key}.noRating`)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {caregivers.isSuccess ? (
        <Pagination
          ariaLabel={t(`${key}.pagination`)}
          onPageChange={setPage}
          page={page}
          totalPages={caregivers.data.totalPages}
        />
      ) : null}
    </div>
  )
}
