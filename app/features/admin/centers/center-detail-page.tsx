import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { BookingsBrowser } from '~/entities/booking/bookings-browser'
import { fetchCenter, fetchProviderMedia, providerKeys, removeCenter } from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { ProviderMediaPanel } from '~/entities/provider/provider-media-panel'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { OperationalStatisticsPanel } from '~/entities/statistics/statistics-panels'
import type { ProviderCenterRecord } from '~/shared/api/generated/contracts'
import { apiErrorStatus } from '~/shared/api/error-details'
import { classifyApiError } from '~/shared/api/api-error'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog, Modal } from '~/shared/ui/modal'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { useActionToast } from '~/shared/ui/use-action-toast'

import { CENTER_BUSINESS_ERRORS } from './center-errors'
import { parseCenterHours } from './center-hours'
import { useHoursLabel } from './hooks/use-hours-label'
import { CenterForm } from './components/center-form'
import { CenterManagerPanel } from './components/center-manager-panel'
import { CenterStaffTab } from './components/center-staff-tab'
import { CenterStatusPanel } from './components/center-status-panel'

const key = 'admin.centersPage' as const
const TABS = ['overview', 'staff', 'bookings', 'activity', 'images'] as const
type Tab = (typeof TABS)[number]
const bookingPath = (bookingId: string) => `/admin/bookings/${bookingId}`

function Overview({ center }: { center: ProviderCenterRecord }) {
  const { t } = useTranslation()
  const hours = useHoursLabel()
  // Booking rejects visits that cross midnight (5207), so an overnight center still sells same-day visits only.
  const overnight = parseCenterHours(center.operatingHours).kind === 'overnight'
  const rows = [
    ['email', center.email],
    ['phone', center.phoneNumber],
    ['address', center.address],
    ['hours', hours(center.operatingHours)]
  ] as const
  return (
    <div className='grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'>
      <section className='space-y-4 rounded-xl border border-outline-variant/40 bg-white p-5'>
        <h2 className='font-bold text-on-surface'>{t(`${key}.detail.info`)}</h2>
        <dl className='space-y-3 text-sm'>
          {rows.map(([name, value]) => (
            <div className='grid gap-0.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3' key={name}>
              <dt className='text-on-surface-variant'>{t(`${key}.detail.${name}`)}</dt>
              <dd className='break-words font-medium text-on-surface'>
                {value || t(`${key}.detail.none`)}
                {name === 'hours' && overnight ? (
                  <span className='mt-1 block text-xs font-normal leading-5 text-on-surface-variant'>
                    {t(`${key}.detail.overnightBooking`)}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className='border-t border-outline-variant/30 pt-4'>
          <CenterManagerPanel center={center} editable={center.centerStatus !== 'ARCHIVED'} />
        </div>
      </section>
      <section className='rounded-xl border border-outline-variant/40 bg-white p-5'>
        <CenterStatusPanel center={center} key={center.version} />
      </section>
    </div>
  )
}

/** One center as its own page (D-06): details, review, manager, staff, activity and images. */
export function CenterDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const tab: Tab = TABS.find((item) => item === params.get('tab')) ?? 'overview'
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const center = useQuery({ queryKey: providerKeys.center(id), queryFn: () => fetchCenter(id), retry: false })
  const media = useQuery({
    queryKey: providerKeys.media('CARE_CENTER', id),
    queryFn: () => fetchProviderMedia('CARE_CENTER', id),
    enabled: center.isSuccess,
    retry: false
  })
  useDocumentTitle(center.data?.centerName ?? t(`${key}.detail.documentTitle`))
  const notify = useActionToast()
  const archive = useMutation({
    mutationFn: () => removeCenter(id, center.data!.version),
    onError: (error) => {
      if (notify.systemError(error, t('admin.toast.centers.actions.archive'), () => archive.mutate())) {
        setArchiving(false)
      }
    },
    onSuccess: async () => {
      notify.success(t('admin.toast.centers.archived', { name: center.data?.centerName ?? '' }))
      await queryClient.invalidateQueries({ queryKey: providerKeys.centers })
      navigate('/admin/centers?status=ARCHIVED')
    }
  })
  const archiveFailure = archive.error ? classifyApiError(archive.error, { business: CENTER_BUSINESS_ERRORS }) : null

  function selectTab(next: Tab) {
    setParams(
      (previous) => {
        const search = new URLSearchParams(previous)
        if (next === 'overview') search.delete('tab')
        else search.set('tab', next)
        return search
      },
      { replace: true }
    )
  }

  return (
    <main className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'
        to='/admin/centers'
      >
        <Icon className='text-base' name='arrow_back' />
        {t(`${key}.detail.back`)}
      </Link>
      {center.isPending ? (
        <SkeletonBlock label={t(`${key}.detail.loading`)} rows={6} />
      ) : center.isError ? (
        <ErrorState
          message={t(apiErrorStatus(center.error) === 404 ? `${key}.detail.notFound` : `${key}.detail.error`)}
          onRetry={() => void center.refetch()}
          retryLabel={t(`${key}.detail.retry`)}
        />
      ) : (
        <>
          <header className='flex flex-wrap items-start gap-4'>
            <Avatar
              className='h-16 w-16 rounded-2xl'
              icon='apartment'
              name={center.data.centerName}
              onExpired={() => void media.refetch()}
              src={pickAvatar(media.data)?.downloadUrl}
            />
            <div className='min-w-0 flex-1'>
              <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{center.data.centerName}</h1>
              <div className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
                <ProviderStatusBadge status={center.data.centerStatus}>
                  {t(`${key}.status.${center.data.centerStatus}`)}
                </ProviderStatusBadge>
                {center.data.statusReason ? (
                  <span>{t(`${key}.detail.statusReason`, { reason: center.data.statusReason })}</span>
                ) : null}
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Button
                leftIcon={<Icon className='text-lg' name='edit' />}
                onClick={() => setEditing(true)}
                variant='outline'
              >
                {t(`${key}.detail.edit`)}
              </Button>
              <Button
                className='text-error! hover:bg-error-container/50!'
                onClick={() => {
                  archive.reset()
                  setArchiving(true)
                }}
                variant='ghost'
              >
                {t(`${key}.detail.archive`)}
              </Button>
            </div>
          </header>
          <div
            aria-label={t(`${key}.detail.tabsLabel`)}
            className='flex gap-1 overflow-x-auto border-b border-outline-variant/40'
            role='tablist'
          >
            {TABS.map((item) => (
              <button
                aria-controls={`center-panel-${item}`}
                aria-selected={tab === item}
                className={`-mb-px min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold transition-colors ${tab === item ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
                id={`center-tab-${item}`}
                key={item}
                onClick={() => selectTab(item)}
                role='tab'
                type='button'
              >
                {t(`${key}.detail.tabs.${item}`)}
              </button>
            ))}
          </div>
          <div aria-labelledby={`center-tab-${tab}`} id={`center-panel-${tab}`} role='tabpanel'>
            {tab === 'overview' ? <Overview center={center.data} /> : null}
            {tab === 'staff' ? <CenterStaffTab centerId={id} /> : null}
            {tab === 'bookings' ? <BookingsBrowser detailPath={bookingPath} fixedCenterId={id} /> : null}
            {tab === 'activity' ? <OperationalStatisticsPanel centerId={id} scope='center' /> : null}
            {tab === 'images' ? <ProviderMediaPanel ownerId={id} ownerType='CARE_CENTER' /> : null}
          </div>
          {editing ? (
            <Modal maxWidthClass='max-w-2xl' onClose={() => setEditing(false)} open title={t(`${key}.form.editTitle`)}>
              <CenterForm center={center.data} onCancel={() => setEditing(false)} onSaved={() => setEditing(false)} />
            </Modal>
          ) : null}
          <ConfirmDialog
            confirmLabel={t(`${key}.detail.archive`)}
            description={t(`${key}.detail.archiveDescription`)}
            error={archiveFailure && archiveFailure.kind === 'business' ? t(archiveFailure.key) : undefined}
            loading={archive.isPending}
            onClose={() => setArchiving(false)}
            onConfirm={() => archive.mutate()}
            open={archiving}
            title={t(`${key}.detail.archiveTitle`, { name: center.data.centerName })}
            tone='danger'
          />
        </>
      )}
    </main>
  )
}
