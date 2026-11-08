import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'
import { useAuthUser } from './auth-user-context'
import { SignOutButton } from './sign-out-button'

export function PortalAccountMenu({
  roleLabel,
  fallbackName,
  avatarIcon,
  avatarUrl,
  profileLink
}: {
  roleLabel: string
  fallbackName: string
  avatarIcon?: string
  avatarUrl?: string
  profileLink?: { to: string; label: string }
}) {
  const { t } = useTranslation()
  const user = useAuthUser()
  const [open, setOpen] = useState(false)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const name = user?.fullName || user?.email || fallbackName
  const initials =
    user?.fullName
      ?.split(/\s+/)
      .slice(-2)
      .map((part) => part[0])
      .join('')
      .toLocaleUpperCase() || fallbackName.slice(0, 2).toLocaleUpperCase()

  useEffect(() => {
    if (!open) return
    function closeOnOutsideClick(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className='relative border-l border-outline-variant/30 pl-2 sm:pl-3' ref={containerRef}>
      <button
        aria-controls='portal-account-menu'
        aria-expanded={open}
        aria-haspopup='true'
        aria-label={t('common.accountMenu')}
        className='flex items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <span
          aria-hidden='true'
          className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary shadow-xs'
        >
          {avatarUrl && failedAvatarUrl !== avatarUrl ? (
            <img
              alt=''
              className='h-full w-full rounded-full object-cover'
              onError={() => setFailedAvatarUrl(avatarUrl)}
              src={avatarUrl}
            />
          ) : avatarIcon ? (
            <Icon name={avatarIcon} />
          ) : (
            initials
          )}
        </span>
        <span className='hidden min-w-0 max-w-36 text-xs sm:block'>
          <strong className='block truncate font-semibold text-on-surface'>{name}</strong>
          <span className='block text-on-surface-variant'>{roleLabel}</span>
        </span>
        <Icon className='hidden text-base text-on-surface-variant sm:block' name='expand_more' />
      </button>
      {open && (
        <nav
          aria-label={t('common.accountMenu')}
          className='absolute top-full right-0 z-50 mt-2 w-60 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-2 shadow-lg'
          id='portal-account-menu'
        >
          <div className='border-b border-outline-variant/30 px-3 py-2 sm:hidden'>
            <strong className='block truncate text-sm text-on-surface'>{name}</strong>
            <span className='text-xs text-on-surface-variant'>{roleLabel}</span>
          </div>
          {profileLink && (
            <Link
              className='flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
              onClick={() => setOpen(false)}
              to={profileLink.to}
            >
              <Icon className='text-lg text-primary' name='person' />
              {profileLink.label}
            </Link>
          )}
          <Link
            className='flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
            onClick={() => setOpen(false)}
            to='/account/security'
          >
            <Icon className='text-lg text-primary' name='shield_lock' />
            {t('auth.security.title')}
          </Link>
          <div className='my-1 border-t border-outline-variant/30' />
          <SignOutButton appearance='menu' />
        </nav>
      )}
    </div>
  )
}
