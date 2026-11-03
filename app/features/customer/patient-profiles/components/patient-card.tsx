import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { canEditCareRecipient } from '~/entities/care-recipient/care-recipient-format'
import type { CareRecipientSummaryRecord } from '~/shared/api/generated/contracts'
import { ActionMenu, type ActionMenuItem } from '~/shared/ui/action-menu'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge, type StatusTone } from '~/shared/ui/status-badge'

const key = 'customer.patientProfiles' as const
const STATUS_TONES: Record<CareRecipientSummaryRecord['status'], StatusTone> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ARCHIVED: 'neutral'
}

/**
 * One family profile: photo or initials, name, "81 years · Female · Ba Đình, Hà Nội", the customer's access, then
 * "View profile" and "Book care". Edit and delete sit in the "⋯" menu; the whole card opens the profile.
 */
export function PatientCard({
  patient,
  onDelete
}: {
  patient: CareRecipientSummaryRecord
  onDelete: (patient: CareRecipientSummaryRecord) => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const detail = `/customer/patient-profiles/${patient.id}`
  const canEdit = canEditCareRecipient(patient.myAccessLevel) && patient.status !== 'ARCHIVED'
  const canDelete = patient.myAccessLevel === 'OWNER' && patient.status !== 'ARCHIVED'
  const facts = [
    patient.age != null ? t('customer.careRecipient.yearsOld', { age: patient.age }) : null,
    patient.gender ? t(`customer.careRecipient.gender.${patient.gender}`) : null,
    [patient.district, patient.province].filter(Boolean).join(', ') || null
  ].filter(Boolean)
  const menu: ActionMenuItem[] = [
    ...(canEdit
      ? [{ id: 'edit', label: t(`${key}.card.edit`), icon: 'edit', onSelect: () => navigate(`${detail}?edit=basic`) }]
      : []),
    ...(canDelete
      ? [
          {
            id: 'delete',
            label: t(`${key}.card.delete`),
            icon: 'delete',
            tone: 'danger' as const,
            onSelect: () => onDelete(patient)
          }
        ]
      : [])
  ]

  return (
    <article className='cc-lift group relative flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-[var(--shadow-card)] hover:border-brand-200'>
      <div className='flex items-start gap-4'>
        <Avatar
          alt={t(`${key}.card.avatarAlt`, { name: patient.fullName })}
          className='h-14 w-14 shrink-0 rounded-full text-base ring-4 ring-brand-50'
          name={patient.fullName}
          src={patient.avatarUrl}
        />
        <div className='min-w-0 flex-1'>
          <h2 className='text-lg leading-snug font-semibold text-on-surface'>
            <Link
              className='rounded after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
              to={detail}
            >
              {patient.fullName}
            </Link>
          </h2>
          {facts.length ? <p className='mt-0.5 text-sm text-on-surface-variant'>{facts.join(' · ')}</p> : null}
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            {patient.status !== 'ACTIVE' ? (
              <StatusBadge tone={STATUS_TONES[patient.status]}>
                {t(`customer.careRecipient.status.${patient.status}`)}
              </StatusBadge>
            ) : null}
            {patient.myAccessLevel ? (
              <span className='inline-flex items-center gap-1 text-xs text-on-surface-variant'>
                <Icon className='text-sm' name={patient.myAccessLevel === 'OWNER' ? 'shield_person' : 'group'} />
                {t(`customer.managers.levels.${patient.myAccessLevel}`)}
              </span>
            ) : null}
          </div>
        </div>
        <ActionMenu
          className='relative z-10 -mt-1 -mr-1'
          items={menu}
          label={t(`${key}.card.more`, { name: patient.fullName })}
        />
      </div>

      <div className='mt-5 flex flex-wrap items-center justify-end gap-2'>
        <Link
          className='relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-semibold text-on-surface transition-[background-color,transform] hover:bg-surface-container-low active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          to={detail}
        >
          {t(`${key}.card.viewDetails`)}
        </Link>
        {patient.status === 'ACTIVE' ? (
          <Link
            className='relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs transition-[background-color,transform] hover:bg-primary-container active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
            to={`/customer/booking?patientId=${patient.id}`}
          >
            <Icon className='text-lg' name='event_available' />
            {t(`${key}.card.bookCare`)}
          </Link>
        ) : null}
      </div>
    </article>
  )
}
