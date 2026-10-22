import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

import { ManagerSidebar } from './components/manager-sidebar'
import { ManagerTopbar } from './components/manager-topbar'

export function CenterManagerLayout() {
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
      <ManagerSidebar onClose={() => setOpen(false)} open={open} />
      <div className='flex min-h-screen min-w-0 flex-col lg:pl-72'>
        <ManagerTopbar menuOpen={open} onToggleMenu={() => setOpen(!open)} />
        <main className='w-full min-w-0 flex-1'>
          <Outlet />
        </main>
        <footer className='border-t border-outline-variant/20 bg-white px-6 py-5 text-center text-xs text-outline'>
          {t('centerManager.footer')}
        </footer>
      </div>
    </div>
  )
}
