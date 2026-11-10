import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { fetchMyInvitations, managerKeys } from '~/entities/care-recipient/care-recipient-managers-api'
import type { CareRecipientSummaryRecord } from '~/shared/api/generated/contracts'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { FilterChips } from '~/shared/ui/filter-chips'
import { Icon } from '~/shared/ui/icon'
import { ConfirmDialog } from '~/shared/ui/modal'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { SearchInput } from '~/shared/ui/search-input'

import { PatientList, addProfileClass } from './components/patient-list'
import { usePatientProfiles } from './hooks/use-patient-profiles'
import { STATUS_OPTIONS, type StatusFilter } from './types'

const key = 'customer.patientProfiles' as const

/** Family profiles of the customer: search as you type, status chips, a two-column grid, delete behind a dialog. */
export function PatientProfilesPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  const { profiles, keyword, status, hasFilters, setKeyword, setStatus, setPage, clearFilters, remove } =
    usePatientProfiles()
  const invitations = useQuery({ queryKey: managerKeys.myInvitations, queryFn: fetchMyInvitations, retry: false })
  const pending = invitations.data?.length ?? 0
  const [deleting, setDeleting] = useState<CareRecipientSummaryRecord | null>(null)

  return (
    <div>
      <CustomerPageHeader
        actions={
          <Link className={addProfileClass} to='/customer/patient-profiles/new'>
            <Icon className='text-lg' name='person_add' />
            {t(`${key}.header.addPatient`)}
          </Link>
        }
        description={t(`${key}.header.subtitle`)}
        title={t(`${key}.header.title`)}
      />

      {pending > 0 ? (
        <div className='cc-fade-up mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-info/20 bg-info-container px-4 py-3 text-sm text-on-info-container'>
          <Icon className='text-xl' name='mail' />
          <p className='min-w-0 flex-1 font-medium'>
            {t('customer.accountArea.invitationsNotice', { count: pending })}
          </p>
          <Link
            className='inline-flex min-h-10 items-center rounded-lg px-3 font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
            to='/customer/invitations'
          >
            {t('customer.accountArea.invitationsOpen')}
          </Link>
        </div>
      ) : null}

      <div className='mb-5 flex flex-col gap-3'>
        <SearchInput
          label={t(`${key}.toolbar.searchLabel`)}
          onChange={setKeyword}
          placeholder={t(`${key}.toolbar.searchPlaceholder`)}
          value={keyword}
        />
        <FilterChips
          label={t(`${key}.toolbar.filterStatusLabel`)}
          onChange={(value) => setStatus((value as StatusFilter) || 'ALL')}
          options={(['ALL', ...STATUS_OPTIONS] as StatusFilter[]).map((value) => ({
            value,
            label: value === 'ALL' ? t(`${key}.toolbar.all`) : t(`customer.careRecipient.status.${value}`)
          }))}
          value={status}
        />
      </div>

      <PatientList
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onDelete={(patient) => {
          remove.reset()
          setDeleting(patient)
        }}
        onPageChange={setPage}
        profiles={profiles}
      />

      <ConfirmDialog
        confirmLabel={t(`${key}.card.confirmDeleteButton`)}
        danger
        description={t(`${key}.card.confirmDelete`)}
        error={remove.isError ? t(`${key}.card.deleteError`) : undefined}
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        open={deleting !== null}
        title={t(`${key}.card.deleteTitle`, { name: deleting?.fullName ?? '' })}
      />
    </div>
  )
}
