import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { validateProviderFiles } from '~/entities/provider/provider-media-panel'
import type { ProviderCaregiverRecord, ProviderMediaRecord } from '~/shared/api/generated/contracts'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { StatusBadge } from '~/shared/ui/status-badge'

import { OverflowMenu } from '../../ui/action-bits'
import { cgCard } from '../../ui/caregiver-page'
import { useAvatarUpload } from '../hooks/use-avatar-upload'

const VERIFICATION_TONE = { PENDING: 'warning', VERIFIED: 'success', REJECTED: 'error' } as const

export interface CompletenessItem {
  key: 'photo' | 'phone' | 'bio' | 'services' | 'certificate' | 'birthDate'
  done: boolean
}

/**
 * Round photo (tap to change, camera badge, local preview while uploading), name, verification, center and role, and
 * how complete the profile is with what is still missing.
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
  const { t } = useTranslation()
  const input = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<'count' | 'type' | 'size' | null>(null)
  const { upload, preview } = useAvatarUpload(profile, media)
  const done = completeness.filter((item) => item.done).length
  const percent = Math.round((done / completeness.length) * 100)
  const missing = completeness.filter((item) => !item.done)

  return (
    <section className={`${cgCard} p-4 sm:p-6`}>
      <div className='flex items-start gap-4 sm:gap-5'>
        <div className='relative shrink-0'>
          <button
            aria-label={t('caregiver.me.header.changePhoto')}
            className='group relative block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait print:pointer-events-none'
            disabled={upload.isPending || !media}
            onClick={() => input.current?.click()}
            type='button'
          >
            <Avatar
              className={`h-20 w-20 rounded-full text-2xl ring-4 ring-surface-container-lowest sm:h-24 sm:w-24 ${upload.isPending ? 'opacity-70' : ''}`}
              decorative
              name={profile.fullName}
              onExpired={onAvatarExpired}
              src={preview ?? avatarUrl}
            />
            <span className='absolute inset-0 grid place-items-center rounded-full bg-on-surface/0 text-white opacity-0 transition-[opacity,background-color] duration-200 group-hover:bg-on-surface/40 group-hover:opacity-100 print:hidden'>
              <Icon className='text-2xl' name='photo_camera' />
            </span>
            <span
              aria-hidden='true'
              className='absolute right-0 bottom-0 grid h-8 w-8 place-items-center rounded-full border-2 border-surface-container-lowest bg-primary text-on-primary print:hidden'
            >
              <Icon className='text-base' name='photo_camera' />
            </span>
          </button>
          {upload.isPending ? (
            <span
              aria-hidden='true'
              className='absolute inset-x-2 -bottom-2 h-1 overflow-hidden rounded-full bg-surface-container-high'
            >
              <span className='cg-progress-bar block h-full w-full bg-primary' />
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
              <h2 className='mt-1.5 text-xl font-bold text-on-surface sm:text-2xl'>{profile.fullName}</h2>
              <p className='text-sm text-on-surface-variant'>
                {[t('caregiver.identity.role'), profile.centerName].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className='print:hidden'>
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
            <p className='mt-1 text-sm text-on-surface-variant' role='status'>
              {t('caregiver.me.header.uploading')}
            </p>
          ) : null}
          {fileError ? (
            <p className='mt-1 text-sm text-error' role='alert'>
              {t(`common.providerMedia.validation.${fileError}`, { maxSize: 5 })}
            </p>
          ) : null}
        </div>
      </div>

      <div className='mt-5 print:hidden'>
        <div className='flex items-center justify-between text-sm'>
          <span className='font-semibold text-on-surface'>{t('caregiver.me.header.completeness', { percent })}</span>
          <span className='text-on-surface-variant tabular-nums'>
            {done}/{completeness.length}
          </span>
        </div>
        <div
          aria-label={t('caregiver.me.header.completeness', { percent })}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className='mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high'
          role='progressbar'
        >
          <div
            className='h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--cg-ease)]'
            style={{ width: `${percent}%` }}
          />
        </div>
        {missing.length ? (
          <p className='mt-2 text-sm text-on-surface-variant'>
            <span className='font-medium'>{t('caregiver.me.header.missingLabel')}: </span>
            {missing.map((item) => t(`caregiver.me.header.missing.${item.key}`)).join(' · ')}
          </p>
        ) : null}
      </div>
    </section>
  )
}
