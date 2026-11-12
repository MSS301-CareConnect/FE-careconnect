import { useMemo, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { fetchCaregivers, providerKeys } from '~/entities/provider/provider-api'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { downloadCsv } from '~/shared/lib/csv'
import { calendarDayOf } from '~/shared/lib/format'
import { foldText } from '~/shared/lib/fold-text'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ActionMenu } from '~/shared/ui/action-menu'
import { Button } from '~/shared/ui/button'
import { FilterMenuChip } from '~/shared/ui/filter-menu-chip'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { SearchInput } from '~/shared/ui/search-input'
import { EmptyState, ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { StatusBadge } from '~/shared/ui/status-badge'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'
import { CaregiverRosterStats } from './components/caregiver-roster-stats'
import { CreateCaregiverDialog } from './components/create-caregiver-dialog'
import { useCaregiverToday } from './hooks/use-caregiver-today'

const key = 'centerManager.management' as const
const r = 'centerManager.management.roster' as const
const providerKey = 'centerManager.provider' as const
const statusLabels = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationLabels = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'] as const
const VERIFICATIONS = ['VERIFIED', 'PENDING', 'REJECTED'] as const
const EXPERIENCE = ['lt2', '2-5', '5-10', 'gt10'] as const
const EXPERIENCE_LABELS = { lt2: 'lt2', '2-5': 'range2to5', '5-10': 'range5to10', gt10: 'gt10' } as const
const SORTS = ['rating', 'experience', 'newest', 'name'] as const

/**
 * Center Manager caregiver roster: numbers for the center, one filter row (server-side status / verification, search,
 * experience and sort on the loaded page), and a table that also says who works or is off today.
 */
export function ManagerCaregiversPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const centerId = useAuthUser()?.centerId ?? ''
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  // Fixed when the page opens: "today" and "on leave now" do not move while the list is open.
  const [now] = useState(() => Date.now())
  const today = calendarDayOf(new Date(now))
  const page = Math.max(0, Number(params.get('page')) || 0)
  const size = [10, 20, 50].includes(Number(params.get('size'))) ? Number(params.get('size')) : 10
  const verification = VERIFICATIONS.find((item) => item === params.get('verification'))
  const status = STATUSES.find((item) => item === params.get('status'))
  const keyword = params.get('q') ?? ''
  const experience = EXPERIENCE.find((item) => item === params.get('experience')) ?? ''
  const sort = SORTS.find((item) => item === params.get('sort')) ?? 'rating'
  const request = { page, size, verification, status }
  const caregivers = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), request],
    queryFn: () => fetchCaregivers(centerId, request),
    enabled: Boolean(centerId),
    placeholderData: keepPreviousData,
    retry: false
  })
  const pendingRequest = { page: 0, size: 1, verification: 'PENDING' as const }
  const pending = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), pendingRequest],
    queryFn: () => fetchCaregivers(centerId, pendingRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const allRequest = { page: 0, size: 1 }
  const all = useQuery({
    queryKey: [...providerKeys.caregivers(centerId), allRequest],
    queryFn: () => fetchCaregivers(centerId, allRequest),
    enabled: Boolean(centerId),
    retry: false
  })
  const todayInfo = useCaregiverToday(centerId, today, now)
  const visible = useMemo(() => {
    const needle = foldText(keyword.trim())
    const people =
      caregivers.data?.items.filter((person) => {
        const years = person.experienceYears
        if (needle && !foldText(person.fullName).includes(needle)) return false
        if (experience === 'lt2') return years !== undefined && years < 2
        if (experience === '2-5') return years !== undefined && years >= 2 && years < 5
        if (experience === '5-10') return years !== undefined && years >= 5 && years <= 10
        if (experience === 'gt10') return years !== undefined && years > 10
        return true
      }) ?? []
    return [...people].sort((a, b) =>
      sort === 'experience'
        ? (b.experienceYears ?? -1) - (a.experienceYears ?? -1)
        : sort === 'newest'
          ? (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
          : sort === 'name'
            ? a.fullName.localeCompare(b.fullName, 'vi')
            : (b.ratingAverage ?? -1) - (a.ratingAverage ?? -1)
    )
  }, [caregivers.data, keyword, experience, sort])
  useDocumentTitle(t(`${key}.documentTitle`))

  function update(name: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value) next.set(name, value)
        else next.delete(name)
        if (name !== 'page') next.delete('page')
        return next
      },
      { replace: true }
    )
  }
  function exportCsv() {
    const rows = [
      [
        t(`${key}.downloadName`),
        t(`${r}.columns.experience`),
        t(`${key}.downloadStatus`),
        t(`${key}.downloadVerification`)
      ],
      ...visible.map((person) => [
        person.fullName,
        person.experienceYears !== undefined ? String(person.experienceYears) : '',
        t(`${providerKey}.${statusLabels[person.caregiverStatus]}`),
        t(`${providerKey}.${verificationLabels[person.verificationStatus]}`)
      ])
    ]
    downloadCsv('caregivers.csv', rows)
  }

  if (!centerId)
    return (
      <div className='mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6' role='alert'>
        {t(`${providerKey}.noCenter`)}
      </div>
    )
  const number = (value: number) => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(value)
  const filtered = Boolean(keyword || experience || status || verification)

  return (
    <div className='mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'>
      <BentoPageHeader
        actions={
          <>
            {/* Icon-only on the title row; the name shows on hover and to screen readers. */}
            <Button
              aria-label={t(`${key}.export`)}
              className='w-11 rounded-full! px-0!'
              disabled={!visible.length}
              onClick={exportCsv}
              title={t(`${key}.export`)}
              variant='outline'
            >
              <Icon name='download' />
            </Button>
            <Button
              aria-label={t(`${key}.add`)}
              className='w-11 rounded-full! px-0!'
              onClick={() => setCreating(true)}
              title={t(`${key}.add`)}
            >
              <Icon name='person_add' />
            </Button>
          </>
        }
        description={t(`${r}.subtitle`)}
        title={t(`${r}.title`)}
      />
      <CaregiverRosterStats
        onLeave={todayInfo.failed ? null : todayInfo.ready ? todayInfo.onLeaveCount : undefined}
        onShowPending={() => update('verification', verification === 'PENDING' ? '' : 'PENDING')}
        pending={pending.data?.totalElements}
        pendingActive={verification === 'PENDING'}
        total={all.data?.totalElements}
        working={todayInfo.failed ? null : todayInfo.ready ? todayInfo.workingCount : undefined}
      />

      <section
        aria-label={t(`${r}.filters`)}
        className='flex flex-wrap items-center gap-2 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-3 sm:p-4'
      >
        <SearchInput
          className='w-full sm:w-72'
          label={t(`${key}.search`)}
          onChange={(value) => update('q', value)}
          placeholder={t(`${key}.search`)}
          value={keyword}
        />
        <FilterMenuChip
          icon='toggle_on'
          label={t(`${key}.status`)}
          onChange={(value) => update('status', value)}
          options={[
            { value: '', label: t(`${key}.all`) },
            ...STATUSES.map((value) => ({ value, label: t(`${providerKey}.${statusLabels[value]}`) }))
          ]}
          value={status ?? ''}
        />
        <FilterMenuChip
          icon='verified_user'
          label={t(`${r}.verification`)}
          onChange={(value) => update('verification', value)}
          options={[
            { value: '', label: t(`${key}.all`) },
            ...VERIFICATIONS.map((value) => ({ value, label: t(`${providerKey}.${verificationLabels[value]}`) }))
          ]}
          value={verification ?? ''}
        />
        <FilterMenuChip
          icon='work_history'
          label={t(`${key}.experience`)}
          onChange={(value) => update('experience', value)}
          options={[
            { value: '', label: t(`${key}.all`) },
            ...EXPERIENCE.map((value) => ({ value, label: t(`${key}.${EXPERIENCE_LABELS[value]}`) }))
          ]}
          value={experience}
        />
        <FilterMenuChip
          defaultValue='rating'
          icon='sort'
          label={t(`${key}.sort`)}
          onChange={(value) => update('sort', value === 'rating' ? '' : value)}
          options={SORTS.map((value) => ({ value, label: t(`${r}.sorts.${value}`) }))}
          showValue
          value={sort}
        />
        {filtered ? (
          <button
            className='inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary hover:underline'
            onClick={() => setParams({})}
            type='button'
          >
            <Icon className='text-lg' name='filter_alt_off' />
            {t(`${key}.reset`)}
          </button>
        ) : null}
        <p aria-live='polite' className='ml-auto text-sm text-on-surface-variant tabular-nums'>
          {caregivers.data ? t(`${r}.total`, { count: caregivers.data.totalElements }) : null}
        </p>
      </section>
      {keyword || experience ? (
        <p className='-mt-2 text-xs text-on-surface-variant'>{t(`${r}.pageFilterHint`)}</p>
      ) : null}

      <section className='overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest'>
        {caregivers.isPending ? (
          <SkeletonBlock className='m-4 border-0 shadow-none' label={t(`${providerKey}.loading`)} rows={6} />
        ) : caregivers.isError ? (
          <ErrorState
            message={t(`${providerKey}.caregiversError`)}
            onRetry={() => void caregivers.refetch()}
            retryLabel={t(`${providerKey}.retry`)}
          />
        ) : visible.length === 0 ? (
          <EmptyState
            action={
              filtered ? (
                <Button onClick={() => setParams({})} variant='outline'>
                  {t(`${key}.reset`)}
                </Button>
              ) : (
                <Button leftIcon={<Icon name='person_add' />} onClick={() => setCreating(true)}>
                  {t(`${key}.add`)}
                </Button>
              )
            }
            description={t(filtered ? `${key}.emptyHint` : `${r}.emptyHint`)}
            icon='person_search'
            title={t(filtered ? `${key}.empty` : `${r}.empty`)}
          />
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[920px] text-left text-sm'>
              <caption className='sr-only'>{t(`${r}.title`)}</caption>
              <thead className='border-b border-outline-variant/50 bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
                <tr>
                  {(['caregiver', 'experience', 'today', 'status', 'verification', 'actions'] as const).map(
                    (column) => (
                      <th className={`px-4 py-3 ${column === 'actions' ? 'text-right' : ''}`} key={column} scope='col'>
                        {t(`${r}.columns.${column}`)}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-outline-variant/30'>
                {visible.map((person) => {
                  const shifts = todayInfo.shiftsOf(person.id)
                  const off = todayInfo.isOnLeave(person.id)
                  return (
                    <tr className='transition-colors hover:bg-surface-container-low/60' key={person.id}>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <CaregiverAvatar
                            caregiverId={person.id}
                            className='h-10 w-10 rounded-xl'
                            name={person.fullName}
                          />
                          <div className='min-w-0'>
                            <Link
                              className='block truncate font-semibold text-on-surface hover:text-primary hover:underline'
                              to={`/center-manager/caregivers/${person.id}`}
                            >
                              {person.fullName}
                            </Link>
                            <span className='flex items-center gap-1 text-xs text-on-surface-variant tabular-nums'>
                              <Icon className='text-sm text-warning' filled name='star' />
                              {(person.ratingCount ?? 0) > 0 && person.ratingAverage !== undefined
                                ? t(`${r}.rating`, {
                                    score: number(person.ratingAverage),
                                    count: person.ratingCount ?? 0
                                  })
                                : t(`${r}.noRating`)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 tabular-nums'>
                        {person.experienceYears !== undefined
                          ? t(`${providerKey}.yearsValue`, { count: person.experienceYears })
                          : '—'}
                      </td>
                      <td className='px-4 py-3'>
                        {todayInfo.failed ? (
                          <span className='text-xs text-outline'>—</span>
                        ) : !todayInfo.ready ? (
                          <span className='text-xs text-outline'>…</span>
                        ) : off ? (
                          <StatusBadge dot tone='warning'>
                            {t(`${r}.onLeave`)}
                          </StatusBadge>
                        ) : shifts.length ? (
                          <span className='text-xs font-semibold text-on-surface tabular-nums'>
                            {shifts
                              .map((item) => `${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`)
                              .join(', ')}
                          </span>
                        ) : (
                          <span className='text-xs text-on-surface-variant'>{t(`${r}.noShiftToday`)}</span>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <ProviderStatusBadge
                          label={t(`${providerKey}.${statusLabels[person.caregiverStatus]}`)}
                          status={person.caregiverStatus}
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <ProviderStatusBadge
                          label={t(`${providerKey}.${verificationLabels[person.verificationStatus]}`)}
                          status={person.verificationStatus}
                        />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-1'>
                          <Link
                            className='inline-flex min-h-9 items-center rounded-lg px-3 text-xs font-semibold text-primary hover:bg-surface-container-low'
                            to={`/center-manager/caregivers/${person.id}`}
                          >
                            {t(`${r}.open`)}
                          </Link>
                          <ActionMenu
                            items={[
                              {
                                id: 'schedule',
                                label: t(`${r}.openSchedule`),
                                icon: 'calendar_view_week',
                                onSelect: () => navigate(`/center-manager/schedules?caregiver=${person.id}`)
                              },
                              {
                                id: 'timeOff',
                                label: t(`${r}.openTimeOff`),
                                icon: 'beach_access',
                                onSelect: () =>
                                  navigate(`/center-manager/schedules?view=timeOff&caregiver=${person.id}`)
                              }
                            ]}
                            label={t(`${r}.more`, { name: person.fullName })}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {caregivers.isSuccess && caregivers.data.totalElements > 0 ? (
          <Pagination
            className='rounded-none border-0 border-t border-outline-variant/40 shadow-none'
            onPageChange={(value) => update('page', value > 0 ? String(value) : '')}
            onPageSizeChange={(value) => update('size', String(value))}
            page={page}
            pageSize={size}
            pageSizeOptions={[10, 20, 50]}
            totalElements={caregivers.data.totalElements}
            totalPages={caregivers.data.totalPages}
          />
        ) : null}
      </section>
      {creating ? <CreateCaregiverDialog centerId={centerId} onClose={() => setCreating(false)} /> : null}
    </div>
  )
}
