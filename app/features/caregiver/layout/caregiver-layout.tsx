import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'

import { CaregiverSidebar } from './components/caregiver-sidebar'
import { CaregiverTopbar } from './components/caregiver-topbar'

export function CaregiverLayout() {
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
      <CaregiverSidebar onClose={() => setOpen(false)} open={open} />
      <div className='flex min-h-screen min-w-0 flex-col lg:pl-72 print:pl-0'>
        <CaregiverTopbar menuOpen={open} onToggleMenu={() => setOpen(!open)} />
        <main className='w-full min-w-0 flex-1'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
