import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { ageFromBirthDate } from '~/entities/care-recipient/care-recipient-format'
import type { CareRecipientDetailRecord } from '~/shared/api/generated/contracts'
import { ActionMenu, type ActionMenuItem } from '~/shared/ui/action-menu'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import type { CompletenessItem } from '../profile-completeness'

const key = 'customer.patientDetail' as const

/**
 * Who the profile is about: photo, name, "78 years · Male · Blood O+", status and the customer's access, "Book care"
 * and a "⋯" menu (edit, delete). Below it, how complete the profile is and the next thing worth adding.
 */
export function PatientDetailHeader({
  detail,
  completeness,
  menu,
  onCompleteItem
}: {
  detail: CareRecipientDetailRecord
  completeness: { percent: number; missing: CompletenessItem[] }
  menu: ActionMenuItem[]
  onCompleteItem?: (item: CompletenessItem) => void
}) {
  const { t } = useTranslation()
  const { profile, myAccessLevel } = detail
  const age = ageFromBirthDate(profile.dateOfBirth)
  const facts = [
    age === undefined ? null : t('customer.careRecipient.yearsOld', { age }),
    profile.gender ? t(`customer.careRecipient.gender.${profile.gender}`) : null,
    profile.bloodType
      ? t(`${key}.header.bloodType`, {
          type: profile.bloodType === 'UNKNOWN' ? t('customer.careRecipient.bloodType.UNKNOWN') : profile.bloodType
        })
      : null
  ].filter(Boolean)
  const next = completeness.missing[0]

  return (
    <header className='pt-6 sm:pt-8'>
      <nav aria-label={t(`${key}.breadcrumb.label`)} className='mb-4'>
        <ol className='flex flex-wrap items-center gap-1 text-sm text-on-surface-variant'>
          <li>
            <Link className='rounded hover:text-primary hover:underline' to='/customer/patient-profiles'>
              {t(`${key}.breadcrumb.patientProfiles`)}
            </Link>
          </li>
          <li className='flex items-center gap-1'>
            <Icon className='text-base text-outline' name='chevron_right' />
            <span aria-current='page' className='font-medium text-on-surface'>
              {profile.fullName}
            </span>
          </li>
        </ol>
      </nav>

      <div className='flex flex-wrap items-start gap-4'>
        <Avatar
          alt={t(`${key}.snapshot.avatarAlt`, { name: profile.fullName })}
          className='h-16 w-16 shrink-0 rounded-full text-lg ring-4 ring-brand-50 sm:h-20 sm:w-20 sm:text-xl'
          name={profile.fullName}
          src={profile.avatarUrl}
          viewable
        />
        <div className='min-w-0 flex-1 basis-56'>
          <h1 className='text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-extrabold tracking-tight text-forest-950'>
            {profile.fullName}
          </h1>
          {facts.length ? <p className='mt-1 text-base text-on-surface-variant'>{facts.join(' · ')}</p> : null}
          <div className='mt-2 flex flex-wrap items-center gap-2 text-sm'>
            <StatusBadge
              tone={profile.status === 'ACTIVE' ? 'success' : profile.status === 'INACTIVE' ? 'warning' : 'neutral'}
            >
              {t(`customer.careRecipient.status.${profile.status}`)}
            </StatusBadge>
            {myAccessLevel ? (
              <span className='inline-flex items-center gap-1 text-on-surface-variant'>
                <Icon className='text-base' name={myAccessLevel === 'OWNER' ? 'shield_person' : 'group'} />
                {t(`${key}.banner.yourAccess`, { level: t(`customer.careRecipient.access.${myAccessLevel}`) })}
              </span>
            ) : null}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {profile.status === 'ACTIVE' ? (
            <Link
              className='inline-flex min-h-11 items-center gap-2 rounded-full bg-peach-300 px-5 text-sm font-semibold text-forest-950 transition-[background-color,transform] hover:bg-peach-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-peach-400 shadow-[0_10px_24px_-12px_rgb(246_146_95/0.8)]'
              to={`/customer/booking?patientId=${profile.id}`}
            >
              <Icon className='text-lg' name='event_available' />
              {t(`${key}.banner.bookNewCare`)}
            </Link>
          ) : null}
          <ActionMenu items={menu} label={t(`${key}.header.more`)} />
        </div>
      </div>

      {profile.status !== 'ARCHIVED' && completeness.percent < 100 ? (
        <div className='mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3'>
          <div className='min-w-40 flex-1'>
            <p className='flex items-baseline justify-between gap-2 text-sm'>
              <span className='font-medium text-on-surface'>{t(`${key}.completeness.label`)}</span>
              <span className='font-semibold text-primary tabular-nums'>{completeness.percent}%</span>
            </p>
            <div
              aria-label={t(`${key}.completeness.label`)}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={completeness.percent}
              className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-container'
              role='progressbar'
            >
              <span
                className='block h-full rounded-full bg-gradient-to-r from-mint-400 to-forest-700 transition-[width] duration-500'
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
          </div>
          {next ? (
            onCompleteItem ? (
              <button
                className='inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
                onClick={() => onCompleteItem(next)}
                type='button'
              >
                <Icon className='text-lg' name='add' />
                {t(`${key}.completeness.add`, { item: t(`${key}.completeness.items.${next.id}`) })}
              </button>
            ) : (
              <span className='text-sm text-on-surface-variant'>
                {t(`${key}.completeness.missing`, { item: t(`${key}.completeness.items.${next.id}`) })}
              </span>
            )
          ) : null}
        </div>
      ) : null}
    </header>
  )
}
