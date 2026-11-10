import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { validateProviderFiles } from '~/entities/provider/provider-media-panel'
import type { ProviderCaregiverRecord, ProviderMediaRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { CountUp } from '~/shared/ui/motion'
import { StatusBadge } from '~/shared/ui/status-badge'

import { OverflowMenu } from '../../ui/action-bits'
import { cgForestCard } from '../../ui/caregiver-page'
import { useAvatarUpload } from '../hooks/use-avatar-upload'

const VERIFICATION_TONE = { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'error' } as const

export interface CompletenessItem {
  key: 'photo' | 'phone' | 'bio' | 'services' | 'certificate' | 'birthDate'
  done: boolean
}

/**
 * The profile hero ("Soft Bento", 2026-11-09, like the reference's dark member card): round photo (tap to change,
 * camera badge, local preview while uploading), name, verification, center and role on deep forest, three glass
 * tiles (rating, experience, completeness), and what is still missing. Prints as a plain light block.
 */
export function ProfileHeader({
  profile,
  media,
  avatarUrl,
  onAvatarExpired,
  completeness
}: {
  profile: ProviderCaregiverRecord
  media: ProviderMediaRecord[] | undefined
  avatarUrl?: string
  onAvatarExpired: () => void
  completeness: CompletenessItem[]
}) {
  const { t, i18n } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<'count' | 'type' | 'size' | null>(null)
  const { upload, preview } = useAvatarUpload(profile, media)
  const done = completeness.filter((item) => item.done).length
  const percent = Math.round((done / completeness.length) * 100)
  const missing = completeness.filter((item) => !item.done)
  const ratingFormat = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const tile =
    'rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/10 print:bg-transparent print:ring-outline-variant'

  return (
    <section
      className={`${cgForestCard} p-5 sm:p-7 print:bg-transparent print:text-on-surface print:shadow-none print:before:hidden`}
    >
      <div className='flex items-start gap-4 sm:gap-6'>
        <div className='relative shrink-0'>
          <button
            aria-label={t('caregiver.me.header.changePhoto')}
            className='group relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mint-300 disabled:cursor-wait print:pointer-events-none'
            disabled={upload.isPending || !media}
            onClick={() => input.current?.click()}
            type='button'
          >
            <Avatar
              className={`h-20 w-20 rounded-full text-2xl ring-4 ring-mint-300/60 sm:h-28 sm:w-28 sm:text-3xl ${upload.isPending ? 'opacity-70' : ''}`}
              decorative
              name={profile.fullName}
              onExpired={onAvatarExpired}
              src={preview ?? avatarUrl}
            />
            <span className='absolute inset-0 grid place-items-center rounded-full bg-forest-950/0 text-white opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-forest-950/45 group-hover:opacity-100 print:hidden'>
              <Icon className='text-2xl' name='photo_camera' />
            </span>
            <span
              aria-hidden='true'
              className='absolute right-0 bottom-0 grid h-9 w-9 place-items-center rounded-full border-[3px] border-forest-900 bg-peach-300 text-forest-950 print:hidden'
            >
              <Icon className='text-base' name='photo_camera' />
            </span>
          </button>
          {upload.isPending ? (
            <span
              aria-hidden='true'
              className='absolute inset-x-2 -bottom-2 h-1 overflow-hidden rounded-full bg-white/15'
            >
              <span className='cg-progress-bar block h-full w-full bg-mint-300' />
            </span>
          ) : null}
          <input
            accept='.jpg,.jpeg,.png,.webp'
            aria-label={t('caregiver.me.header.changePhoto')}
            className='sr-only'
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              const error = validateProviderFiles('CAREGIVER_PROFILE', [file])
              setFileError(error)
              if (!error) upload.mutate(file)
            }}
            ref={input}
            tabIndex={-1}
            type='file'
          />
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <StatusBadge dot tone={VERIFICATION_TONE[profile.verificationStatus]}>
                {t(`caregiver.me.header.verification.${profile.verificationStatus}`)}
              </StatusBadge>
              <h2 className='mt-2 text-2xl font-bold tracking-tight sm:text-[32px]'>{profile.fullName}</h2>
              <p className='mt-0.5 text-sm text-white/70 print:text-on-surface-variant'>
                {[t('caregiver.identity.role'), profile.centerName].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className='rounded-full bg-white/90 print:hidden'>
              <OverflowMenu
                actions={[
                  {
                    key: 'preview',
                    label: t('caregiver.me.header.previewAsCustomer'),
                    icon: 'visibility',
                    onSelect: () => window.open(`/customer/caregivers/${profile.id}`, '_blank', 'noopener')
                  },
                  {
                    key: 'print',
                    label: t('caregiver.me.header.printCv'),
                    icon: 'print',
                    onSelect: () => window.print()
                  }
                ]}
              />
            </div>
          </div>
          {upload.isPending ? (
            <p className='mt-1 text-sm text-white/75' role='status'>
              {t('caregiver.me.header.uploading')}
            </p>
          ) : null}
          {fileError ? (
            <p className='mt-2 inline-block rounded-full bg-peach-100 px-3 py-1 text-sm text-peach-700' role='alert'>
              {t(`common.providerMedia.validation.${fileError}`, { maxSize: 5 })}
            </p>
          ) : null}
        </div>
      </div>

      <dl aria-label={t('caregiver.me.header.stats.label')} className='mt-6 grid grid-cols-3 gap-2 sm:gap-3'>
        <div className={tile}>
          <dt className='text-xs font-medium text-white/65 print:text-on-surface-variant'>
            {t('caregiver.me.header.stats.rating')}
          </dt>
          <dd className='mt-1'>
            {profile.ratingAverage ? (
              <>
                <span className='flex items-center gap-1 text-xl font-bold sm:text-2xl'>
                  <Icon className='text-lg text-peach-300' filled name='star' />
                  <CountUp format={(n) => ratingFormat.format(n)} value={profile.ratingAverage} />
                </span>
                <span className='block truncate text-xs text-white/60 print:text-on-surface-variant'>
                  {t('caregiver.me.header.stats.reviews', { count: profile.ratingCount ?? 0 })}
                </span>
              </>
            ) : (
              <span className='block pt-1 text-sm font-semibold text-white/80 print:text-on-surface'>
                {t('caregiver.me.header.stats.noRating')}
              </span>
            )}
          </dd>
        </div>
        <div className={tile}>
          <dt className='text-xs font-medium text-white/65 print:text-on-surface-variant'>
            {t('caregiver.me.header.stats.experience')}
          </dt>
          <dd className='mt-1 text-xl font-bold sm:text-2xl'>
            {profile.experienceYears !== undefined
              ? t('caregiver.me.header.stats.years', { count: profile.experienceYears })
              : '—'}
          </dd>
        </div>
        <div className={`${tile} print:hidden`}>
          <dt className='text-xs font-medium text-white/65'>{t('caregiver.me.header.stats.completeness')}</dt>
          <dd className='mt-1 text-xl font-bold sm:text-2xl'>
            <CountUp format={(n) => `${Math.round(n)}%`} value={percent} />
          </dd>
        </div>
      </dl>

      <div className='mt-5 print:hidden'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-semibold'>{t('caregiver.me.header.completeness', { percent })}</span>
          <span className='text-white/65 tabular-nums'>
            {done}/{completeness.length}
          </span>
        </div>
        <div
          aria-label={t('caregiver.me.header.completeness', { percent })}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className='mt-2 h-2 overflow-hidden rounded-full bg-white/10'
          role='progressbar'
        >
          <div
            className='h-full rounded-full bg-gradient-to-r from-mint-300 to-mint-200 transition-[width] duration-700 ease-[var(--cg-ease)]'
            style={{ width: `${percent}%` }}
          />
        </div>
        {missing.length ? (
          <p className='mt-2.5 text-sm text-white/70'>
            <span className='font-semibold text-white/90'>{t('caregiver.me.header.missingLabel')}: </span>
            {missing.map((item) => t(`caregiver.me.header.missing.${item.key}`)).join(' · ')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
