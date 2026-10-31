import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { Toaster } from '~/shared/ui/toaster'

import { AdminSidebar } from './components/admin-sidebar'
import { AdminTopbar } from './components/admin-topbar'

export function AdminLayout() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <div className='min-h-screen bg-surface text-on-surface'>
      <AdminSidebar onClose={() => setOpen(false)} open={open} />
      <div className='flex min-h-screen min-w-0 flex-col lg:pl-72'>
        <AdminTopbar menuOpen={open} onToggleMenu={() => setOpen(!open)} />
        <main className='w-full min-w-0 flex-1'>
          <Outlet />
        </main>
        <footer className='border-t border-outline-variant/20 bg-white px-6 py-5 text-center text-xs text-outline'>
          {t('admin.footer')}
        </footer>
      </div>
      {/* Admin first (D-09); other portals adopt the same Toaster once it has proven itself here. */}
      <Toaster />
    </div>
  )
}
