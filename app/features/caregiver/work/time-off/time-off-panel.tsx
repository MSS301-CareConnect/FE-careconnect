import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toastSuccess } from '~/shared/ui/app-toast'

import { fetchTimeOffs, providerKeys, removeTimeOff } from '~/entities/provider/provider-api'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import type { ProviderTimeOffRecord } from '~/shared/api/generated/contracts'
import { formatClock24 } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { calendarDayOf, useCaregiverFormat } from '../../ui/caregiver-format'
import { CaregiverEmpty, CaregiverError, cgCard } from '../../ui/caregiver-page'
import { useClientPage } from '../../ui/use-client-page'
import { useNow } from '../../ui/use-now'
import { TimeOffForm } from './time-off-form'

// ProviderService returns every upcoming time off at once; the list shows eight a page.
const TIME_OFFS_PER_PAGE = 8

/** "Ngày nghỉ": upcoming time off with add (drawer) and delete (confirmed). */
export function TimeOffPanel({ caregiverId, today }: { caregiverId?: string; today: string }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const queryClient = useQueryClient()
  const now = useNow(60_000)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<ProviderTimeOffRecord | null>(null)
  const list = useQuery({
    queryKey: providerKeys.timeOffs(caregiverId ?? ''),
    queryFn: () => fetchTimeOffs(caregiverId ?? '', { from: new Date().toISOString() }),
    enabled: Boolean(caregiverId),
    retry: false
  })
  const paged = useClientPage(list.data ?? [], TIME_OFFS_PER_PAGE)
  const remove = useMutation({
    mutationFn: (item: ProviderTimeOffRecord) => removeTimeOff(caregiverId ?? '', item.id),
    onSuccess: async () => {
      toastSuccess(t('caregiver.work.timeOff.deleted'))
      setDeleting(null)
      await queryClient.invalidateQueries({ queryKey: providerKeys.timeOffs(caregiverId ?? '') })
    }
  })

  /** "T6, 08/11 → CN, 10/11 · Cả ngày" or "08:00 T6, 08/11 → 17:00 T6, 08/11". */
  function rangeOf(item: ProviderTimeOffRecord) {
    const startDay = calendarDayOf(item.startAt)
    const endInstant = new Date(new Date(item.endAt).getTime() - 1).toISOString()
    const endDay = calendarDayOf(endInstant)
    const startClock = formatClock24(item.startAt, format.language)
    const endClock = formatClock24(item.endAt, format.language)
    if (startClock === '00:00' && endClock === '00:00') {
      const days =
        startDay === endDay
          ? format.shortDay(startDay)
          : t('caregiver.work.timeOff.fromTo', { from: format.shortDay(startDay), to: format.shortDay(endDay) })
      return `${days} · ${t('caregiver.work.timeOff.allDay')}`
    }
    if (startDay === calendarDayOf(item.endAt)) return `${format.shortDay(startDay)} · ${startClock}–${endClock}`
    return t('caregiver.work.timeOff.fromTo', {
      from: `${startClock} ${format.shortDay(startDay)}`,
      to: `${endClock} ${format.shortDay(calendarDayOf(item.endAt))}`
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='max-w-xl text-sm text-on-surface-variant'>{t('caregiver.work.timeOff.intro')}</p>
        <Button
          disabled={!caregiverId}
          leftIcon={<Icon className='text-lg' name='add' />}
          onClick={() => setAdding(true)}
        >
          {t('caregiver.work.timeOff.add')}
        </Button>
      </div>

      {list.isPending && caregiverId ? (
        <SkeletonGroup className='flex flex-col gap-2' label={t('caregiver.ui.states.loading')}>
          <Skeleton className='h-16 rounded-xl' />
          <Skeleton className='h-16 rounded-xl' />
        </SkeletonGroup>
      ) : null}
      {list.isError ? (
        <CaregiverError
          message={t(apiRequestErrorKey(list.error, 'caregiver.work.timeOff.loadError'))}
          onRetry={() => void list.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      ) : null}
      {list.isSuccess && list.data.length === 0 ? (
        <CaregiverEmpty
          description={t('caregiver.work.timeOff.emptyHint')}
          icon='beach_access'
          title={t('caregiver.work.timeOff.empty')}
        />
      ) : null}
      {list.isSuccess && list.data.length > 0 ? (
        <section aria-labelledby='time-off-upcoming'>
          <h2 className='mb-2 text-sm font-semibold text-on-surface-variant' id='time-off-upcoming'>
            {t('caregiver.work.timeOff.upcoming')}
          </h2>
          <ul className='cg-stagger flex flex-col gap-2' key={paged.page}>
            {paged.items.map((item) => (
              <li className={`${cgCard} flex items-center gap-3 p-3 sm:p-4`} key={item.id}>
                <span className='grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-container text-on-neutral-container'>
                  <Icon className='text-xl' name='beach_access' />
                </span>
                <span className='min-w-0 flex-1'>
                  <span className='block font-semibold text-on-surface tabular-nums'>{rangeOf(item)}</span>
                  {item.reason ? (
                    <span className='block truncate text-sm text-on-surface-variant'>{item.reason}</span>
                  ) : null}
                </span>
                <Button
                  aria-label={`${t('caregiver.work.timeOff.delete')} ${rangeOf(item)}`}
                  className='text-error'
                  onClick={() => {
                    remove.reset()
                    setDeleting(item)
                  }}
                  size='sm'
                  variant='ghost'
                >
                  {t('caregiver.work.timeOff.delete')}
                </Button>
              </li>
            ))}
          </ul>
          <Pagination
            ariaLabel={t('caregiver.work.timeOff.pagination')}
            className='mt-3'
            onPageChange={paged.setPage}
            page={paged.page}
            totalPages={paged.totalPages}
          />
        </section>
      ) : null}

      {caregiverId && adding ? (
        <TimeOffForm caregiverId={caregiverId} now={now} onClose={() => setAdding(false)} open today={today} />
      ) : null}
      <ConfirmDialog
        confirmLabel={t('caregiver.work.timeOff.delete')}
        description={deleting ? t('caregiver.work.timeOff.deleteDescription', { range: rangeOf(deleting) }) : undefined}
        error={
          remove.isError ? t(apiRequestErrorKey(remove.error, 'caregiver.provider.timeOff.actionError')) : undefined
        }
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) remove.mutate(deleting)
        }}
        open={deleting !== null}
        title={t('caregiver.work.timeOff.deleteTitle')}
        tone='danger'
      />
    </div>
  )
}
