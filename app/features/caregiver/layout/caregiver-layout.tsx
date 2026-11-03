import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import { CaregiverToaster } from '../ui/caregiver-toaster'
import { useMyAvatar, useMyCaregiverProfile, useToday, useVisitsToAccept } from '../data/caregiver-queries'
import { caregiverPageKey } from './caregiver-navigation.constants'
import { CaregiverBottomNav } from './components/caregiver-bottom-nav'
import { CaregiverRouteProgress } from './components/caregiver-route-progress'
import { CaregiverSidebar } from './components/caregiver-sidebar'
import { CaregiverTopbar } from './components/caregiver-topbar'
import './caregiver-theme.css'

const COLLAPSED_KEY = 'careconnect.caregiver.sidebarCollapsed'

function readCollapsed() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Caregiver shell: a collapsible sidebar from 1024 px, a bottom tab bar on phones, and a compact topbar. Only the
 * content area animates between pages; the navigation stays still.
 */
export function CaregiverLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const today = useToday()
  const toAccept = useVisitsToAccept(today).data?.totalElements ?? 0
  const profile = useMyCaregiverProfile()
  const avatar = useMyAvatar(profile.data?.id)
  const pageKey = caregiverPageKey(pathname)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pageKey])

  function toggle() {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, value ? '0' : '1')
      } catch {
        // A blocked storage only loses the preference.
      }
      return !value
    })
  }

  return (
    <div className='theme-caregiver min-h-dvh bg-surface text-on-surface'>
      <CaregiverRouteProgress />
      <CaregiverSidebar collapsed={collapsed} onToggle={toggle} toAccept={toAccept} />
      <div
        className={`flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200 ease-[var(--cg-ease)] print:pl-0 ${collapsed ? 'lg:pl-[72px]' : 'lg:pl-60'}`}
      >
        <CaregiverTopbar avatarUrl={avatar.url} name={profile.data?.fullName} />
        <main className='w-full min-w-0 flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] lg:pb-0'>
          <div className='cg-page-in' key={pageKey}>
            <Outlet />
          </div>
        </main>
      </div>
      <CaregiverBottomNav toAccept={toAccept} />
      <CaregiverToaster />
    </div>
  )
}
