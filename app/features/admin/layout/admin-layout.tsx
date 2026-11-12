import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useOutlet } from 'react-router'
import { AiChatWidget } from '~/features/shared/ai-chat/ai-chat-widget'

import { useEscapeKey } from '~/shared/lib/use-escape-key'
import { useStoredFlag } from '~/shared/lib/use-stored-flag'
import { PageTransition } from '~/shared/ui/page-transition'
import { Toaster } from '~/shared/ui/toaster'
import '~/shared/ui/ops-theme.css'

import { AdminSidebar } from './components/admin-sidebar'
import { AdminTopbar } from './components/admin-topbar'

const COLLAPSED_KEY = 'careconnect.admin.sidebarCollapsed'

/**
 * Admin shell ("Soft Bento", 2026-11-09): the floating forest rail (collapsible from 1024 px, a drawer below), a light
 * topbar over the mint → peach page, and page changes that fade, blur and rise through `PageTransition` (keyed by path,
 * so search-parameter changes of a page do not animate).
 */
export function AdminLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const [open, setOpen] = useState(false)
  const [collapsed, toggleCollapsed] = useStoredFlag(COLLAPSED_KEY)

  useEscapeKey(open, () => setOpen(false))

  return (
    <div className='theme-ops cc-mesh min-h-screen bg-fixed text-on-surface'>
      <AdminSidebar
        collapsed={collapsed}
        onClose={() => setOpen(false)}
        onToggleCollapsed={toggleCollapsed}
        open={open}
      />
      <div
        className={`flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${collapsed ? 'lg:pl-[5.75rem]' : 'lg:pl-[19rem]'}`}
      >
        <AdminTopbar menuOpen={open} onToggleMenu={() => setOpen(!open)} />
        <main className='w-full min-w-0 flex-1'>
          <PageTransition pageKey={pathname.replace(/\/+$/, '')}>{outlet}</PageTransition>
        </main>
        <footer className='px-6 py-6 text-center text-xs text-on-surface-variant/80'>{t('admin.footer')}</footer>
      </div>
      {/* Admin first (D-09); other portals adopt the same Toaster once it has proven itself here. */}
      <Toaster />
      <AiChatWidget />
    </div>
  )
}
