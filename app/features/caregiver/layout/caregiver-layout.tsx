import { useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { AiChatWidget } from '~/features/shared/ai-chat/ai-chat-widget'
import { PageTransition } from '~/shared/ui/page-transition'

import { CaregiverToaster } from '../ui/caregiver-toaster'
import {
  useBookingRequests,
  useMyAvatar,
  useMyCaregiverProfile,
  useToday,
  useVisitsToAccept
} from '../data/caregiver-queries'
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
 * Caregiver shell ("Soft Bento", 2026-11-09): the floating forest rail from 1024 px (collapsible), a floating pill tab
 * bar on phones and a light topbar over the mint → peach page. Only the content animates between pages (fade, blur and
 * rise through `PageTransition`); the navigation stays still.
 */
export function CaregiverLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const today = useToday()
  const toAccept = useVisitsToAccept(today).data?.totalElements ?? 0
  const requests = useBookingRequests().data?.totalElements ?? 0
  const profile = useMyCaregiverProfile()
  const avatar = useMyAvatar(profile.data?.id)
  const pageKey = caregiverPageKey(pathname)
  const outlet = useOutlet()

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
    <div className='theme-caregiver cc-mesh min-h-dvh bg-fixed text-on-surface'>
      <CaregiverRouteProgress />
      <CaregiverSidebar collapsed={collapsed} onToggle={toggle} requests={requests} toAccept={toAccept} />
      <div
        className={`flex min-h-dvh min-w-0 flex-col transition-[padding] duration-200 ease-[var(--cg-ease)] print:pl-0 ${collapsed ? 'lg:pl-[5.75rem]' : 'lg:pl-[16.5rem]'}`}
      >
        <CaregiverTopbar avatarUrl={avatar.url} name={profile.data?.fullName} />
        <main className='w-full min-w-0 flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-6'>
          <PageTransition pageKey={pageKey}>{outlet}</PageTransition>
        </main>
      </div>
      <CaregiverBottomNav requests={requests} toAccept={toAccept} />
      <CaregiverToaster />
      <AiChatWidget />
    </div>
  )
}
