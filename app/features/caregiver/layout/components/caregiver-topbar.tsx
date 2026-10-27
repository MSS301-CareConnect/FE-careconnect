import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'

import { fetchMyCaregiverProfile, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { activeCaregiverNavigation } from '../caregiver-navigation.constants'
import { CAREGIVER_SIDEBAR_ID } from './caregiver-sidebar'

export function CaregiverTopbar({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const { t } = useTranslation()
  const { pathname, hash } = useLocation()
  const active = activeCaregiverNavigation(pathname, hash)
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const profileId = profile.data?.id ?? ''
  const media = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', profileId),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', profileId),
    enabled: Boolean(profileId),
    retry: false
  })
  const avatarUrl = media.data?.find((item) => item.mediaFileType === 'IMAGE' && item.downloadUrl)?.downloadUrl

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur print:hidden'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-6'>
        <div className='flex min-w-0 items-center gap-2'>
          <button
            aria-controls={CAREGIVER_SIDEBAR_ID}
            aria-expanded={menuOpen}
            aria-label={t(menuOpen ? 'caregiver.nav.close' : 'caregiver.nav.open')}
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden'
            onClick={onToggleMenu}
            type='button'
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
          <span className='truncate text-sm font-semibold text-on-surface sm:text-base'>
            {t(`caregiver.nav.${active.key}`)}
          </span>
        </div>
        <div className='flex shrink-0 items-center gap-2'>
          <div className='[&_button]:px-2'>
            <LanguageSwitch />
          </div>
          <Link
            aria-label={t('caregiver.nav.notifications')}
            className='relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-secondary-container'
            to='/caregiver/dashboard#reminders'
          >
            <Icon name='notifications' />
            <span className='absolute right-1 top-1 h-2 w-2 rounded-full bg-error ring-2 ring-white' />
          </Link>
          <PortalAccountMenu
            avatarIcon='clinical_notes'
            avatarUrl={avatarUrl}
            fallbackName={t('caregiver.identity.name')}
            profileLink={{ to: '/caregiver/profile', label: t('caregiver.nav.profile') }}
            roleLabel={t('caregiver.identity.role')}
          />
        </div>
      </div>
    </header>
  )
}
