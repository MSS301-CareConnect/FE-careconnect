import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'

import {
  archiveCareRecipient,
  careRecipientErrorStatus as errorStatus,
  careRecipientKeys,
  fetchCareRecipient
} from '~/entities/care-recipient/care-recipient-api'
import { canEditCareRecipient } from '~/entities/care-recipient/care-recipient-format'
import { calendarDayOf } from '~/shared/lib/format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import type { ActionMenuItem } from '~/shared/ui/action-menu'
import { toastSuccess } from '~/shared/ui/app-toast'
import { ConfirmDialog } from '~/shared/ui/modal'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'
import { Tabs, tabId, tabPanelId } from '~/shared/ui/tabs'

import { AddressesCard } from './components/addresses-card'
import { EmergencyContactsCard } from './components/emergency-contacts-card'
import { ManagersCard } from './components/managers-card'
import { MedicationsSection } from './components/medications-section'
import { PatientDetailHeader } from './components/patient-detail-header'
import { ProfileEditDialog } from './components/profile-edit-dialog'
import { AllergyCallout, DailyLifeTab, MedicalBackground, OverviewTab } from './components/profile-tabs'
import { useProfileEditor, type EditSection } from './hooks/use-profile-editor'
import { profileCompleteness, type DetailTab } from './profile-completeness'

const key = 'customer.patientDetail' as const
const TABS: DetailTab[] = ['overview', 'medical', 'daily', 'contacts', 'addresses', 'managers']
const EDIT_SECTIONS: EditSection[] = ['basic', 'address', 'medical', 'daily']
const TABS_ID = 'patient-detail'
const LOAD_ERROR_KEYS = { 403: `${key}.states.forbidden`, 404: `${key}.states.notFound` } as const

/**
 * One family profile in five tabs (`?tab=`): overview, health and medications, daily life, emergency contacts and
 * co-managers. Each section has its own "Edit" that opens a centred dialog; `?edit=basic` (or the older `?mode=edit`) opens
 * the basic information drawer on arrival.
 */
export function PatientDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((item) => item === params.get('tab')) ?? 'overview'
  const [today] = useState(() => calendarDayOf(new Date()))
  const [deleting, setDeleting] = useState(false)
  const [initialEdit, setInitialEdit] = useState<EditSection | null>(
    () =>
      EDIT_SECTIONS.find((section) => section === params.get('edit')) ??
      (params.get('mode') === 'edit' ? 'basic' : null)
  )

  const detail = useQuery({
    queryKey: careRecipientKeys.detail(id),
    queryFn: () => fetchCareRecipient(id),
    retry: false
  })
  const editor = useProfileEditor(id, () => toastSuccess(t(`${key}.banner.toastSuccess`)))
  const archive = useMutation({
    mutationFn: () => archiveCareRecipient(id),
    onSuccess: async () => {
      toastSuccess(t(`${key}.deleted`))
      await queryClient.invalidateQueries({ queryKey: careRecipientKeys.all })
      navigate('/customer/patient-profiles', { replace: true })
    }
  })
  useDocumentTitle(detail.data ? `${detail.data.profile.fullName} | CareConnect` : t(`${key}.documentTitle`))

  const data = detail.data
  const canEdit = Boolean(data && canEditCareRecipient(data.myAccessLevel) && data.profile.status !== 'ARCHIVED')
  // Open the drawer a link asked for once the profile is here (state set during render, guarded to run once).
  if (initialEdit && data) {
    setInitialEdit(null)
    if (canEdit) editor.open(initialEdit, data.profile)
  }

  function selectTab(value: DetailTab) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value === 'overview') next.delete('tab')
        else next.set('tab', value)
        next.delete('edit')
        next.delete('mode')
        return next
      },
      { replace: true }
    )
  }

  if (detail.isPending)
    return (
      <SkeletonGroup className='pt-8' label={t(`${key}.states.loading`)}>
        <Skeleton className='h-4 w-40 rounded' />
        <div className='mt-5 flex items-center gap-4'>
          <Skeleton className='h-20 w-20 rounded-full' />
          <div className='flex-1 space-y-2'>
            <Skeleton className='h-8 w-1/2 rounded-lg' />
            <Skeleton className='h-4 w-1/3 rounded' />
          </div>
        </div>
        <Skeleton className='mt-6 h-11 w-full rounded-lg' />
        <Skeleton className='mt-6 h-56 w-full rounded-2xl' />
      </SkeletonGroup>
    )

  if (detail.isError || !data) {
    const status = errorStatus(detail.error)
    return (
      <div className='flex flex-col gap-3 pt-8'>
        <ErrorState
          message={t(status === 403 || status === 404 ? LOAD_ERROR_KEYS[status] : `${key}.states.error`)}
          onRetry={status === 404 ? undefined : () => void detail.refetch()}
          retryLabel={t(`${key}.states.retry`)}
        />
        <Link className='self-start text-sm font-semibold text-primary hover:underline' to='/customer/patient-profiles'>
          {t(`${key}.banner.back`)}
        </Link>
      </div>
    )
  }

  const { profile } = data
  const completeness = profileCompleteness(data)
  const onEdit = canEdit ? (section: EditSection) => editor.open(section, profile) : undefined
  const menu: ActionMenuItem[] = [
    ...(canEdit
      ? [
          {
            id: 'edit',
            label: t(`${key}.drawer.basic.title`),
            icon: 'edit',
            onSelect: () => editor.open('basic', profile)
          }
        ]
      : []),
    ...(data.myAccessLevel === 'OWNER' && profile.status !== 'ARCHIVED'
      ? [
          {
            id: 'delete',
            label: t('customer.patientProfiles.card.delete'),
            icon: 'delete',
            tone: 'danger' as const,
            onSelect: () => {
              archive.reset()
              setDeleting(true)
            }
          }
        ]
      : [])
  ]

  return (
    <div>
      <PatientDetailHeader
        completeness={completeness}
        detail={data}
        menu={menu}
        onCompleteItem={
          canEdit
            ? (item) => {
                selectTab(item.tab)
                if (item.section) editor.open(item.section, profile)
              }
            : undefined
        }
      />

      <Tabs
        className='mt-6'
        idBase={TABS_ID}
        items={TABS.map((value) => ({
          value,
          label: t(`${key}.tabs.${value}`),
          badge:
            value === 'medical'
              ? (data.medications ?? []).filter((medication) => medication.active).length || undefined
              : value === 'contacts'
                ? (data.emergencyContacts ?? []).length || undefined
                : undefined
        }))}
        label={t(`${key}.tabs.label`)}
        onChange={selectTab}
        value={tab}
      />

      <div
        aria-labelledby={tabId(TABS_ID, tab)}
        className='cc-fade-up mt-6 flex flex-col gap-5'
        id={tabPanelId(TABS_ID)}
        key={tab}
        role='tabpanel'
      >
        {tab === 'overview' ? <OverviewTab detail={data} onEdit={onEdit} onOpenTab={selectTab} /> : null}
        {tab === 'medical' ? (
          <>
            <AllergyCallout allergies={profile.allergies} />
            <MedicalBackground detail={data} onEdit={onEdit} />
            <MedicationsSection canEdit={canEdit} medications={data.medications ?? []} recipientId={profile.id} />
          </>
        ) : null}
        {tab === 'daily' ? <DailyLifeTab detail={data} onEdit={onEdit} /> : null}
        {tab === 'contacts' ? (
          <EmergencyContactsCard canEdit={canEdit} contacts={data.emergencyContacts ?? []} recipientId={profile.id} />
        ) : null}
        {tab === 'addresses' ? (
          <AddressesCard
            canEdit={canEdit}
            profileAddress={[profile.addressLine, profile.ward, profile.district, profile.province]
              .filter(Boolean)
              .join(', ')}
            recipientId={profile.id}
          />
        ) : null}
        {tab === 'managers' ? <ManagersCard recipientId={profile.id} /> : null}
      </div>

      <ProfileEditDialog
        draft={editor.draft}
        error={editor.error}
        onChange={editor.update}
        onClose={editor.close}
        onSubmit={() => editor.submit(profile)}
        saving={editor.saving}
        section={editor.section}
        today={today}
      />

      <ConfirmDialog
        confirmLabel={t('customer.patientProfiles.card.confirmDeleteButton')}
        danger
        description={t('customer.patientProfiles.card.confirmDelete')}
        error={archive.isError ? t('customer.patientProfiles.card.deleteError') : undefined}
        loading={archive.isPending}
        onClose={() => setDeleting(false)}
        onConfirm={() => archive.mutate()}
        open={deleting}
        title={t('customer.patientProfiles.card.deleteTitle', { name: profile.fullName })}
      />
    </div>
  )
}
