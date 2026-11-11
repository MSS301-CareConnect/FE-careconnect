import { NotificationBell } from '~/entities/notification/notification-bell'
import { PortalAccountMenu } from '~/features/shared/auth/portal-account-menu'
import { Icon } from '~/shared/ui/icon'
import { LanguageSwitch } from '~/shared/ui/language-switch'

const chip = 'rounded-full bg-white/85 shadow-[var(--shadow-card)] ring-1 ring-forest-900/5'

/**
 * Topbar of the operations portals (Center Manager, Admin; "Soft Bento", 2026-11-09): a fade of the page colour instead
 * of a bar, the menu button on phones, then the language switch, the bell and the account menu as white pills. No
 * backdrop blur, so the bell's panel is positioned against the screen.
 */
export function OpsTopbar({
  portal,
  sidebarId,
  menuOpen,
  onToggleMenu,
  openMenuLabel,
  closeMenuLabel,
  fallbackName,
  roleLabel,
  profileLink,
  securityLink
}: {
  portal: 'admin' | 'center-manager'
  sidebarId: string
  menuOpen: boolean
  onToggleMenu: () => void
  openMenuLabel: string
  closeMenuLabel: string
  fallbackName: string
  roleLabel: string
  profileLink?: { to: string; label: string }
  securityLink?: string
}) {
  return (
    <header className='sticky top-0 z-30 print:hidden'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-surface/85 to-transparent'
      />
      <div className='relative flex h-[4.5rem] items-center justify-between gap-3 px-4 sm:px-6'>
        <button
          aria-controls={sidebarId}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? closeMenuLabel : openMenuLabel}
          className='grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-900 text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900 lg:hidden'
          onClick={onToggleMenu}
          type='button'
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <div className='ml-auto flex shrink-0 items-center gap-2'>
          <div className={`${chip} p-1 [&_button]:px-2`}>
            <LanguageSwitch />
          </div>
          <div className={chip}>
            <NotificationBell portal={portal} />
          </div>
          <div className={chip}>
            <PortalAccountMenu
              fallbackName={fallbackName}
              profileLink={profileLink}
              roleLabel={roleLabel}
              securityLink={securityLink}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
