import type { ReactNode } from 'react'
import { Outlet, useLocation, useNavigation } from 'react-router'
import { AiChatWidget } from '~/features/shared/ai-chat/ai-chat-widget'

import { Toaster } from '~/shared/ui/toaster'

import { SiteFooter } from '~/shared/ui/site-footer'

import { CenterPickerDialog } from './components/center-picker-dialog'
import { CustomerBottomNav } from './components/customer-bottom-nav'
import { CustomerHeader } from './components/customer-header'

/** Routes that hide the footer so the customer can focus on one task. */
const FOCUS_ROUTES = ['/customer/booking']

/**
 * Customer portal shell: the warm customer theme, sticky header, a 2 px progress bar while a route loads, a fade-up of
 * the content only (header and footer stay put) and the phone bottom navigation. Children replace the outlet for a
 * route outside the customer route tree, such as the public home page.
 */
export function CustomerLayout({
  audience = 'customer',
  children
}: {
  audience?: 'public' | 'customer'
  children?: ReactNode
}) {
  const location = useLocation()
  const navigation = useNavigation()
  const focus = FOCUS_ROUTES.includes(location.pathname)

  return (
    <div className='theme-customer flex min-h-screen flex-col bg-background font-sans text-on-surface antialiased'>
      {navigation.state !== 'idle' ? (
        <div
          aria-hidden='true'
          className='fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden bg-brand-100'
          data-testid='route-progress'
        >
          <div className='cc-route-progress h-full w-full bg-primary' />
        </div>
      ) : null}
      <CustomerHeader />
      <main className='w-full flex-1 pb-20 lg:pb-0'>
        <div className='cc-fade-up' key={location.pathname}>
          {children ?? <Outlet />}
        </div>
      </main>
      {focus ? null : <SiteFooter audience={audience} />}
      <div className={focus ? 'hidden' : 'contents'}>
        <CustomerBottomNav />
      </div>
      <CenterPickerDialog />
      {/* AI assistant for guests and signed-in customers alike (2026-11-09). */}
      <AiChatWidget />
      {/* Action results (saved, invited…) as toasts, kept above the bottom navigation on phones. */}
      <Toaster mobileOffset={{ bottom: 88 }} />
    </div>
  )
}
