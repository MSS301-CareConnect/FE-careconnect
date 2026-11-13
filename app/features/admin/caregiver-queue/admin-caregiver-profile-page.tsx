import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { FeedbackList } from '~/entities/aftercare/feedback-list'
import { BookingReasonDialog } from '~/entities/booking/booking-reason-dialog'
import { accountKeys, fetchAccount } from '~/entities/identity/account-api'
import { CaregiverAvatar } from '~/entities/provider/caregiver-avatar'
import { CertificateAiBadge } from '~/entities/provider/certificate-ai-badge'
import { CertificateReviewDialog } from '~/entities/provider/certificate-review-dialog'
import {
  fetchCaregiver,
  fetchCaregiverServices,
  fetchCertificates,
  providerKeys,
  verifyCaregiver
} from '~/entities/provider/provider-api'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { CaregiverWorkCard } from '~/entities/statistics/caregiver-work-card'
import { statisticsKeys } from '~/entities/statistics/statistics-api'
import { classifyApiError } from '~/shared/api/api-error'
import type { VerificationRequest } from '~/shared/api/generated/contracts'
import { formatCalendarDate } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { bentoBackLink, bentoCard, bentoContainer } from '~/shared/ui/bento-page-header'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ErrorState, SkeletonBlock } from '~/shared/ui/state-panels'
import { useActionToast } from '~/shared/ui/use-action-toast'

const key = 'admin.caregiverQueuePage' as const
const statusKeys = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationKeys = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
const certificateKeys = {
  PENDING: 'pending',
  CENTER_VERIFIED: 'centerVerified',
  ADMIN_VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const

function Fact({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className='flex items-start gap-3'>
      <span className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint-50 text-forest-800'>
        <Icon className='text-lg' name={icon} />
      </span>
      <div className='min-w-0'>
        <dt className='text-xs text-on-surface-variant'>{label}</dt>
        <dd className='truncate text-sm font-semibold text-on-surface'>{value || '—'}</dd>
      </div>
    </div>
  )
}

function SectionTitle({ icon, children }: { icon: string; children: string }) {
  return (
    <h2 className='flex items-center gap-2 text-base font-bold text-forest-950'>
      <Icon className='text-xl text-forest-700' name={icon} />
      {children}
    </h2>
  )
}

/**
 * One caregiver as the platform sees it (2026-11-12): who they are (ProviderService `GET /caregivers/{id}`), how to
 * reach them (Identity account), the services the center assigned and the certificates with their review. A pending
 * profile is approved or rejected here; a certificate the center confirmed opens the review dialog.
 */
export function AdminCaregiverProfilePage({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  // "Now" is fixed when the page opens: render must stay pure (react-hooks/purity).
  const [thisYear] = useState(() => new Date().getFullYear())
  const queryClient = useQueryClient()
  const notify = useActionToast()
  const [rejecting, setRejecting] = useState(false)
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const caregiver = useQuery({ queryKey: providerKeys.caregiver(id), queryFn: () => fetchCaregiver(id), retry: false })
  const userId = caregiver.data?.userId
  const account = useQuery({
    queryKey: accountKeys.detail(userId ?? ''),
    queryFn: () => fetchAccount(userId ?? ''),
    enabled: Boolean(userId),
    retry: false
  })
  const services = useQuery({
    queryKey: providerKeys.caregiverServices(id),
    queryFn: () => fetchCaregiverServices(id),
    retry: false
  })
  const certificates = useQuery({
    queryKey: providerKeys.certificates(id),
    queryFn: () => fetchCertificates(id),
    retry: false
  })
  const decide = useMutation({
    mutationFn: (request: VerificationRequest) => verifyCaregiver(id, request),
    onSuccess: (_saved, request) => {
      setRejecting(false)
      notify.success(
        t(request.status === 'VERIFIED' ? 'admin.toast.caregivers.verified' : 'admin.toast.caregivers.rejected', {
          name: caregiver.data?.fullName ?? ''
        })
      )
      void queryClient.invalidateQueries({ queryKey: statisticsKeys.providers })
      return queryClient.invalidateQueries({ queryKey: ['provider'] })
    },
    onError: (error, request) => {
      if (notify.systemError(error, t('admin.toast.caregivers.actions.review'), () => decide.mutate(request)))
        setRejecting(false)
    }
  })
  useDocumentTitle(caregiver.data?.fullName ?? t(`${key}.title`))

  const back = (
    <Link className={bentoBackLink} to='/admin/caregivers'>
      <Icon className='text-lg' name='arrow_back' />
      {t(`${key}.profile.back`)}
    </Link>
  )
  if (caregiver.isPending)
    return (
      <div className={bentoContainer} role='status' aria-label={t(`${key}.profile.loading`)}>
        {back}
        <SkeletonBlock className='h-40 w-full rounded-[1.75rem]' label={t(`${key}.profile.loading`)} />
        <SkeletonBlock className='mt-6 h-72 w-full rounded-[1.75rem]' label={t(`${key}.profile.loading`)} />
      </div>
    )
  if (caregiver.isError)
    return (
      <div className={bentoContainer}>
        {back}
        <ErrorState
          message={t(`${key}.profile.error`)}
          onRetry={() => void caregiver.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      </div>
    )

  const data = caregiver.data
  const language = i18n.language
  const age = data.dateOfBirth ? thisYear - Number(data.dateOfBirth.slice(0, 4)) : undefined
  const rating =
    data.ratingCount && data.ratingAverage
      ? t(`${key}.rating`, {
          average: new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(data.ratingAverage),
          count: data.ratingCount
        })
      : t(`${key}.noRating`)
  const reviewing = certificates.data?.find((item) => item.id === reviewingId)
  const decideFailed = decide.isError && classifyApiError(decide.error).kind !== 'system'

  return (
    <div className={`${bentoContainer} space-y-6`}>
      {back}
      <header className={`${bentoCard} flex flex-wrap items-center gap-5 p-5 sm:p-6`}>
        <CaregiverAvatar caregiverId={data.id} className='h-20 w-20 rounded-3xl text-2xl' name={data.fullName} />
        <div className='min-w-0 flex-1 basis-64'>
          <h1 className='text-[24px] leading-tight text-forest-950 sm:text-[30px]'>{data.fullName}</h1>
          <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant'>
            <Link
              className='inline-flex items-center gap-1 font-semibold text-forest-800 hover:underline'
              to={`/admin/centers/${data.centerId}?tab=staff`}
            >
              <Icon className='text-base' name='storefront' />
              {data.centerName ?? t(`${key}.openCenter`)}
            </Link>
            <span className='inline-flex items-center gap-1 tabular-nums'>
              <Icon className='text-base' name='star' />
              {rating}
            </span>
          </p>
          <div className='mt-3 flex flex-wrap items-center gap-2'>
            <ProviderStatusBadge status={data.verificationStatus}>
              {t(`admin.provider.${verificationKeys[data.verificationStatus]}`)}
            </ProviderStatusBadge>
            <ProviderStatusBadge status={data.caregiverStatus}>
              {t(`admin.provider.${statusKeys[data.caregiverStatus]}`)}
            </ProviderStatusBadge>
          </div>
          {data.verificationStatus === 'REJECTED' && data.verificationReason ? (
            <p className='mt-2 text-sm text-error'>
              {t(`${key}.rejectedBecause`, { reason: data.verificationReason })}
            </p>
          ) : null}
        </div>
        {data.verificationStatus === 'PENDING' ? (
          <div className='flex gap-2'>
            <Button
              disabled={decide.isPending}
              onClick={() => decide.mutate({ status: 'VERIFIED', version: data.version })}
            >
              {t(`${key}.approve`)}
            </Button>
            <Button
              disabled={decide.isPending}
              onClick={() => {
                decide.reset()
                setRejecting(true)
              }}
              variant='outline'
            >
              {t(`${key}.reject`)}
            </Button>
          </div>
        ) : null}
      </header>

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <section className={`${bentoCard} space-y-5 p-5 sm:p-6`}>
          <SectionTitle icon='badge'>{t(`${key}.profile.info`)}</SectionTitle>
          <dl className='grid gap-4 sm:grid-cols-2'>
            <Fact
              icon='wc'
              label={t(`${key}.profile.gender`)}
              value={data.gender ? t(`${key}.profile.genders.${data.gender}`) : undefined}
            />
            <Fact
              icon='cake'
              label={t(`${key}.profile.birthday`)}
              value={
                data.dateOfBirth
                  ? t(`${key}.profile.birthdayValue`, { date: formatCalendarDate(data.dateOfBirth), age })
                  : undefined
              }
            />
            <Fact
              icon='work_history'
              label={t(`${key}.profile.experience`)}
              value={t(`${key}.experience`, { count: data.experienceYears ?? 0 })}
            />
            <Fact
              icon='event'
              label={t(`${key}.profile.joined`)}
              value={data.createdAt ? formatCalendarDate(data.createdAt) : undefined}
            />
            <Fact icon='mail' label={t(`${key}.profile.email`)} value={account.data?.email} />
            <Fact icon='call' label={t(`${key}.profile.phone`)} value={account.data?.phoneNumber} />
          </dl>
          <div className='border-t border-outline-variant/40 pt-4'>
            <h3 className='text-sm font-semibold text-on-surface'>{t(`${key}.profile.bio`)}</h3>
            <p className='mt-1 text-sm leading-6 whitespace-pre-line text-on-surface-variant'>
              {data.bio || t(`${key}.profile.noBio`)}
            </p>
          </div>
          <div className='border-t border-outline-variant/40 pt-4'>
            <h3 className='text-sm font-semibold text-on-surface'>{t(`${key}.profile.services`)}</h3>
            {services.isPending ? (
              <SkeletonBlock className='mt-2 h-8 w-2/3 rounded-full' label={t(`${key}.profile.loading`)} />
            ) : null}
            {services.isError ? <p className='mt-1 text-sm text-error'>{t(`${key}.profile.servicesError`)}</p> : null}
            {services.isSuccess && services.data.length === 0 ? (
              <p className='mt-1 text-sm text-on-surface-variant'>{t(`${key}.profile.noServices`)}</p>
            ) : null}
            {services.isSuccess && services.data.length > 0 ? (
              <ul className='mt-2 flex flex-wrap gap-2'>
                {services.data.map((service) => (
                  <li
                    className='rounded-full bg-mint-50 px-3 py-1 text-sm font-medium text-forest-800'
                    key={service.centerServiceId}
                  >
                    {service.serviceName}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className={`${bentoCard} space-y-4 p-5 sm:p-6`}>
          <SectionTitle icon='workspace_premium'>{t(`${key}.profile.certificates`)}</SectionTitle>
          {certificates.isPending ? (
            <SkeletonBlock className='h-24 w-full rounded-2xl' label={t(`${key}.profile.loading`)} />
          ) : null}
          {certificates.isError ? (
            <ErrorState
              message={t('admin.provider.certificateLoadError')}
              onRetry={() => void certificates.refetch()}
              retryLabel={t(`${key}.retry`)}
            />
          ) : null}
          {certificates.isSuccess && certificates.data.length === 0 ? (
            <p className='text-sm text-on-surface-variant'>{t('admin.provider.certificateEmpty')}</p>
          ) : null}
          {certificates.isSuccess && certificates.data.length > 0 ? (
            <ul className='divide-y divide-outline-variant/30'>
              {certificates.data.map((certificate) => (
                <li className='flex flex-wrap items-center justify-between gap-3 py-3' key={certificate.id}>
                  <div className='min-w-0'>
                    <p className='font-semibold text-on-surface'>{certificate.certificateName}</p>
                    <p className='mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
                      {certificate.issuedBy ? <span>{certificate.issuedBy}</span> : null}
                      <ProviderStatusBadge status={certificate.verificationStatus}>
                        {t(`admin.provider.${certificateKeys[certificate.verificationStatus]}`)}
                      </ProviderStatusBadge>
                      {certificate.verificationStatus === 'CENTER_VERIFIED' ? (
                        <CertificateAiBadge certificate={certificate} />
                      ) : null}
                    </p>
                  </div>
                  {certificate.verificationStatus === 'PENDING' ? (
                    <span className='text-xs text-on-surface-variant'>{t('admin.provider.awaitingCenter')}</span>
                  ) : null}
                  {certificate.verificationStatus === 'CENTER_VERIFIED' ||
                  certificate.verificationStatus === 'ADMIN_VERIFIED' ? (
                    <Button onClick={() => setReviewingId(certificate.id)} size='sm' variant='outline'>
                      {t('admin.certificatesPage.open')}
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
        <CaregiverWorkCard caregiverId={data.id} />
        <section className={`${bentoCard} space-y-4 p-5 sm:p-6`}>
          <SectionTitle icon='star'>{t('aftercare.reviews.title')}</SectionTitle>
          <FeedbackList caregiverId={data.id} />
        </section>
      </div>

      {rejecting ? (
        <BookingReasonDialog
          confirmLabel={t(`${key}.reject`)}
          danger
          description={t(`${key}.rejectHint`, { name: data.fullName })}
          error={decideFailed ? t(`${key}.decideError`) : undefined}
          label={t(`${key}.reason`)}
          maxLength={500}
          onClose={() => setRejecting(false)}
          onConfirm={(reason) => decide.mutate({ status: 'REJECTED', reason, version: data.version })}
          pending={decide.isPending}
          title={t(`${key}.rejectTitle`)}
        />
      ) : null}
      {reviewing ? <CertificateReviewDialog certificate={reviewing} onClose={() => setReviewingId(null)} /> : null}
    </div>
  )
}
