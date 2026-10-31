import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { fetchMyCaregiverProfile, fetchProviderMedia, providerKeys } from '~/entities/provider/provider-api'
import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { NotificationBell } from '~/entities/notification/notification-bell'
import { LanguageSwitch } from '~/shared/ui/language-switch'

import { activeCaregiverNavigation } from '../caregiver-navigation.constants'
import { CAREGIVER_SIDEBAR_ID } from './caregiver-sidebar'
import { pickAvatar } from '~/entities/provider/provider-avatar'

export function CaregiverTopbar({ menuOpen, onToggleMenu }: { menuOpen: boolean; onToggleMenu: () => void }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const active = activeCaregiverNavigation(pathname)
  const profile = useQuery({ queryKey: providerKeys.myProfile, queryFn: fetchMyCaregiverProfile, retry: false })
  const profileId = profile.data?.id ?? ''
  const media = useQuery({
    queryKey: providerKeys.media('CAREGIVER_PROFILE', profileId),
    queryFn: () => fetchProviderMedia('CAREGIVER_PROFILE', profileId),
    enabled: Boolean(profileId),
    retry: false
  })
  const avatarUrl = pickAvatar(media.data)?.downloadUrl

  return (
    <header className='sticky top-0 z-30 border-b border-outline-variant/25 bg-white/95 shadow-sm backdrop-blur print:hidden'>
      <div className='flex h-16 items-center justify-between gap-3 px-4 sm:px-6'>
        <div className='flex min-w-0 items-center gap-2'>
          <button
            aria-controls={CAREGIVER_SIDEBAR_ID}
            aria-expanded={menuOpen}
            aria-label={t(menuOpen ? 'caregiver.nav.close' : 'caregiver.nav.open')}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden'
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
          <NotificationBell />
          <PortalAccountMenu
            avatarIcon='clinical_notes'
            avatarUrl={avatarUrl}
            fallbackName={t('caregiver.identity.role')}
            profileLink={{ to: '/caregiver/profile', label: t('caregiver.nav.profile') }}
            roleLabel={t('caregiver.identity.role')}
          />
        </div>
      </div>
    </header>
  )
}
