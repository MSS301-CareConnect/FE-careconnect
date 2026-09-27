import { Outlet } from 'react-router'

import { CustomerFooter } from './components/customer-footer'
import { CustomerHeader } from './components/customer-header'

export function CustomerLayout() {
  return (
    <div className='flex min-h-screen flex-col bg-background font-sans text-on-surface antialiased'>
      <CustomerHeader />
      <main className='w-full flex-1 pt-20'>
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  )
}
