import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useAuthUser } from '~/features/shared/auth/auth-user-context'
import { SignOutButton } from '~/features/shared/auth/sign-out-button'
import { WalletBalanceLink } from '~/entities/wallet/wallet-balance-link'
import { setAppLanguage, type SupportedLanguage } from '~/shared/i18n/i18n'
import { Avatar } from '~/shared/ui/avatar'
import { Icon } from '~/shared/ui/icon'
import { useExitPresence } from '~/shared/lib/use-exit-presence'

const LANGUAGES: SupportedLanguage[] = ['vi', 'en']

/** Avatar menu: profile, security (now a profile tab), language and sign-out. */
export function CaregiverAccountMenu({ avatarUrl, name }: { avatarUrl?: string; name?: string }) {
  const { t, i18n } = useTranslation()
  const user = useAuthUser()
  const [open, setOpen] = useState(false)
  const { present, state: panelState } = useExitPresence(open)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const displayName = name || user?.fullName || user?.email || t('caregiver.identity.role')
  const language = i18n.resolvedLanguage?.split('-')[0] ?? 'vi'

  useEffect(() => {
    if (!open) return
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const linkClass =
    'flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-on-surface hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'

  return (
    <div className='relative' ref={rootRef}>
      <button
        aria-controls='caregiver-account-menu'
        aria-expanded={open}
        aria-haspopup='true'
        aria-label={t('caregiver.account.menu')}
        className='cg-press flex min-h-11 items-center gap-2 rounded-full bg-white/85 p-1 shadow-[var(--cg-shadow-1)] ring-1 ring-forest-900/5 hover:bg-white focus-visible:outline-2 focus-visible:outline-primary lg:pr-3'
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type='button'
      >
        <Avatar className='h-9 w-9 rounded-full text-xs' decorative name={displayName} src={avatarUrl} />
        <span className='hidden max-w-40 min-w-0 text-left leading-tight lg:block'>
          <strong className='block truncate text-sm font-semibold text-on-surface'>{displayName}</strong>
          <span className='block truncate text-xs text-on-surface-variant'>{t('caregiver.identity.role')}</span>
        </span>
        <Icon className='hidden text-lg text-on-surface-variant lg:block' name='expand_more' />
      </button>
      {present ? (
        <nav
          aria-label={t('caregiver.account.menu')}
          data-state={panelState}
          className='cc-dropdown absolute top-full right-0 z-50 mt-2 w-64 origin-top-right rounded-2xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-[var(--cg-shadow-2)]'
          id='caregiver-account-menu'
        >
          <div className='flex items-center gap-3 border-b border-outline-variant px-3 pt-2 pb-3'>
            <Avatar className='h-10 w-10 rounded-full text-sm' decorative name={displayName} src={avatarUrl} />
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-on-surface'>{displayName}</p>
              <p className='truncate text-xs text-on-surface-variant'>{user?.email}</p>
            </div>
          </div>
          <div className='py-1'>
            <WalletBalanceLink onNavigate={() => setOpen(false)} to='/caregiver/wallet' />
            <Link className={linkClass} onClick={() => setOpen(false)} to='/caregiver/profile'>
              <Icon className='text-lg text-primary' name='person' />
              {t('caregiver.nav.profile')}
            </Link>
            <Link className={linkClass} onClick={() => setOpen(false)} to='/caregiver/earnings'>
              <Icon className='text-lg text-primary' name='savings' />
              {t('caregiver.nav.earnings')}
            </Link>
            <Link className={linkClass} onClick={() => setOpen(false)} to='/caregiver/profile?tab=security'>
              <Icon className='text-lg text-primary' name='shield_lock' />
              {t('caregiver.nav.security')}
            </Link>
          </div>
          <div className='flex items-center justify-between gap-2 border-t border-outline-variant px-3 py-2.5'>
            <span className='text-sm text-on-surface-variant'>{t('caregiver.account.language')}</span>
            <div
              aria-label={t('common.language.selector')}
              className='flex rounded-lg bg-surface-container-low p-0.5'
              role='group'
            >
              {LANGUAGES.map((code) => {
                const languageName = t(code === 'vi' ? 'common.language.vietnamese' : 'common.language.english')
                return (
                  <button
                    aria-label={t('common.language.switchTo', { language: languageName })}
                    aria-pressed={language === code}
                    className='min-h-9 min-w-11 rounded-md px-2.5 text-xs font-semibold text-on-surface-variant transition-colors aria-pressed:bg-surface-container-lowest aria-pressed:text-primary aria-pressed:shadow-[var(--cg-shadow-1)] focus-visible:outline-2 focus-visible:outline-primary'
                    key={code}
                    onClick={() => void setAppLanguage(code)}
                    type='button'
                  >
                    {t(code === 'vi' ? 'common.language.vietnameseShort' : 'common.language.englishShort')}
                  </button>
                )
              })}
            </div>
          </div>
          <div className='border-t border-outline-variant pt-1'>
            <SignOutButton appearance='menu' />
          </div>
        </nav>
      ) : null}
    </div>
  )
}
