import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import { FeedbackList } from '~/entities/aftercare/feedback-list'
import { CaregiverTimeOffs } from '~/entities/provider/caregiver-time-offs'
import { fetchCaregiver, fetchProviderMedia, providerKeys, removeCaregiver } from '~/entities/provider/provider-api'
import { pickAvatar } from '~/entities/provider/provider-avatar'
import { formatProviderDate } from '~/entities/provider/provider-format'
import { ProviderStatusBadge } from '~/entities/provider/provider-status-badge'
import { CaregiverWorkCard } from '~/entities/statistics/caregiver-work-card'
import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { apiRequestErrorKey } from '~/shared/api/error-details'
import { calendarDayOf } from '~/shared/lib/format'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { ErrorState, ForbiddenState, SkeletonBlock } from '~/shared/ui/state-panels'

import { BentoPageHeader } from '~/shared/ui/bento-page-header'
import { CaregiverAbsenceHistory } from './components/caregiver-absence-history'
import { CaregiverEditorDialog } from './components/caregiver-editor-dialog'
import { CaregiverServicesEditor } from './components/caregiver-services-editor'
import { CaregiverUpcomingShifts } from './components/caregiver-upcoming-shifts'
import { ManagerCertificates } from './components/manager-certificates'

const key = 'centerManager.provider' as const
const genderOptions = { MALE: 'male', FEMALE: 'female', OTHER: 'other' } as const
const statusLabels = { ACTIVE: 'active', INACTIVE: 'inactive', SUSPENDED: 'suspended', ARCHIVED: 'archived' } as const
const verificationLabels = { PENDING: 'pending', VERIFIED: 'verified', REJECTED: 'rejected' } as const
const container = 'mx-auto w-full max-w-[1280px] space-y-5 px-4 pb-10 sm:px-6'

/**
 * Center Manager caregiver profile: identity and status, the track record and customer reviews (answered here), then
 * what the center plans with them — upcoming shifts, time off, services and certificates. Edits open as popups; the shift card links to the center's work schedule.
 */
export function ManagerCaregiverDetailPage() {
  const { id = '' } = useParams()
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const now = useClock(60_000)
  const today = calendarDayOf(new Date(now))
  const [editing, setEditing] = useState(false)
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const caregiver = useQuery({
    queryKey: providerKeys.caregiver(id),
    queryFn: () => fetchCaregiver(id),
    retry: false,
    enabled: Boolean(id)
  })
  const avatarMedia = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', id),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', id),
    retry: false,
    enabled: Boolean(id) && caregiver.data?.centerId === user?.centerId
  })
  const archive = useMutation({
    mutationFn: () => removeCaregiver(id, caregiver.data?.version ?? 0),
    onSuccess: async () => {
      setConfirmArchiveOpen(false)
      await queryClient.invalidateQueries({ queryKey: providerKeys.caregivers(user?.centerId ?? '') })
      navigate('/center-manager/caregivers')
    }
  })
  useDocumentTitle(caregiver.data?.fullName ?? t(`${key}.caregiversTitle`))

  if (!user?.centerId)
    return (
      <div className={`${container} py-8`} role='alert'>
        {t(`${key}.noCenter`)}
      </div>
    )
  if (caregiver.isPending)
    return (
      <div className={`${container} py-8`}>
        <SkeletonBlock label={t(`${key}.loading`)} rows={6} />
      </div>
    )
  if (caregiver.isError)
    return (
      <div className={`${container} py-8`}>
        <ErrorState
          message={t(`${key}.caregiverError`)}
          onRetry={() => void caregiver.refetch()}
          retryLabel={t(`${key}.retry`)}
        />
      </div>
    )
  if (caregiver.data.centerId !== user.centerId)
    return (
      <div className={`${container} py-8`}>
        <ForbiddenState description={t(`${key}.noAccess`)} />
      </div>
    )

  const person = caregiver.data
  const facts = [
    [
      t(`${key}.experience`),
      person.experienceYears !== undefined
        ? t(`${key}.yearsValue`, { count: person.experienceYears })
        : t(`${key}.unknown`),
      'work_history'
    ],
    [
      t(`${key}.birthDate`),
      person.dateOfBirth ? formatProviderDate(person.dateOfBirth, i18n.language) : t(`${key}.unknown`),
      'cake'
    ],
    [t(`${key}.gender`), person.gender ? t(`${key}.${genderOptions[person.gender]}`) : t(`${key}.unknown`), 'wc'],
    [t(`${key}.centerName`), person.centerName || t(`${key}.unknown`), 'home_health']
  ] as const

  return (
    <div className={container}>
      <BentoPageHeader
        actions={
          <>
            <Button leftIcon={<Icon name='edit' />} onClick={() => setEditing(true)} variant='outline'>
              {t(`${key}.editCaregiver`)}
            </Button>
            <Button
              className='text-error! hover:text-error!'
              disabled={archive.isPending}
              leftIcon={<Icon name='inventory_2' />}
              onClick={() => setConfirmArchiveOpen(true)}
              variant='ghost'
            >
              {t(`${key}.archive`)}
            </Button>
          </>
        }
        breadcrumb={[
          { label: t('centerManager.caregivers'), to: '/center-manager/caregivers' },
          { label: person.fullName }
        ]}
        breadcrumbLabel={t(`${key}.caregiversTitle`)}
        title={person.fullName}
      />

      <section className='relative isolate overflow-hidden rounded-[1.75rem] bg-forest-900 p-5 text-white shadow-[var(--shadow-float)] sm:p-7'>
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -top-24 -right-16 -z-10 h-72 w-72 rounded-full bg-mint-400/25 blur-3xl'
        />
        <div className='flex flex-wrap items-center gap-5'>
          <span className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-mint-100 text-forest-800 ring-4 ring-mint-300/60 sm:h-28 sm:w-28'>
            <Avatar
              className='h-full w-full'
              icon='person'
              name={person.fullName}
              onExpired={() => void avatarMedia.refetch()}
              src={pickAvatar(avatarMedia.data)?.downloadUrl}
              viewable
            />
          </span>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <ProviderStatusBadge
                label={t(`${key}.${statusLabels[person.caregiverStatus]}`)}
                status={person.caregiverStatus}
              />
              <ProviderStatusBadge
                label={t(`${key}.${verificationLabels[person.verificationStatus]}`)}
                status={person.verificationStatus}
              />
            </div>
            <p className='mt-3 flex items-center gap-1 text-base font-semibold tabular-nums'>
              <Icon className='text-peach-300' filled name='star' />
              {person.ratingAverage !== undefined && (person.ratingCount ?? 0) > 0
                ? new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 }).format(person.ratingAverage)
                : '—'}
              <span className='ml-1 font-normal text-white/65'>
                {t(`${key}.reviewsValue`, { count: person.ratingCount ?? 0 })}
              </span>
            </p>
            <p className='mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-white/70'>
              {person.bio || t(`${key}.noBio`)}
            </p>
          </div>
        </div>
        <dl className='mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {facts.map(([label, value, icon]) => (
            <div
              className='flex items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10'
              key={label}
            >
              <span className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint-300 text-forest-950'>
                <Icon className='text-xl' name={icon} />
              </span>
              <div className='min-w-0'>
                <dt className='text-xs text-white/65'>{label}</dt>
                <dd className='truncate font-semibold text-white'>{value}</dd>
              </div>
            </div>
          ))}
        </dl>
        {archive.isError ? (
          <p className='mt-4 inline-block rounded-full bg-peach-100 px-3 py-1 text-sm text-peach-700' role='alert'>
            {t(apiRequestErrorKey(archive.error, `${key}.actionError`))}
          </p>
        ) : null}
      </section>

      <div className='grid items-start gap-5 lg:grid-cols-12'>
        <div className='space-y-5 lg:col-span-7'>
          <CaregiverWorkCard caregiverId={id} />
          <section
            aria-labelledby='caregiver-reviews-title'
            className='rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-5 sm:p-6'
            id='reviews'
          >
            <h2 className='flex items-center gap-2 text-lg font-bold' id='caregiver-reviews-title'>
              <Icon className='text-warning' filled name='star' />
              {t('aftercare.reviews.title')}
            </h2>
            <p className='mt-1 mb-4 text-sm text-on-surface-variant'>{t('aftercare.reviews.hint')}</p>
            <FeedbackList canReply caregiverId={id} />
          </section>
          <CaregiverUpcomingShifts caregiverId={id} centerId={person.centerId} today={today} />
          <CaregiverTimeOffs caregiverId={id} caregiverName={person.fullName} now={now} />
          <CaregiverAbsenceHistory caregiverId={id} />
        </div>
        <div className='space-y-5 lg:col-span-5'>
          <CaregiverServicesEditor caregiverId={id} centerId={person.centerId} />
          <ManagerCertificates caregiverId={id} />
        </div>
      </div>

      <ConfirmDialog
        confirmLabel={t(`${key}.archive`)}
        description={t(`${key}.confirmArchive`)}
        loading={archive.isPending}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={() => archive.mutate()}
        open={confirmArchiveOpen}
        title={t(`${key}.archive`)}
        tone='danger'
      />
      {editing ? (
        <CaregiverEditorDialog key={person.version} onClose={() => setEditing(false)} person={person} />
      ) : null}
    </div>
  )
}
