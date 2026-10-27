import type { ReactNode } from 'react'
import { Outlet } from 'react-router'

import { SiteFooter } from '~/shared/ui/site-footer'

import { CenterPickerDialog } from './components/center-picker-dialog'
import { CustomerHeader } from './components/customer-header'

/** Children replace the outlet for a route outside the customer route tree, such as the public home page. */
export function CustomerLayout({
  audience = 'customer',
  children
}: {
  audience?: 'public' | 'customer'
  children?: ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-on-surface antialiased'>
      <CustomerHeader />
      <main className='w-full flex-1'>{children ?? <Outlet />}</main>
      <SiteFooter audience={audience} />
      <CenterPickerDialog />
    </div>
  )
}
