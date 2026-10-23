import { Outlet } from 'react-router'

import { SiteFooter } from '~/shared/ui/site-footer'

import { CustomerHeader } from './components/customer-header'

export function CustomerLayout({ audience = 'customer' }: { audience?: 'public' | 'customer' }) {
  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-on-surface antialiased'>
      <CustomerHeader />
      <main className='w-full flex-1'>
        <Outlet />
      </main>
      <SiteFooter audience={audience} />
    </div>
  )
}
