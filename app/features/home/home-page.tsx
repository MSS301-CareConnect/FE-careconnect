import { Reveal } from '~/shared/ui/motion'

import { CustomerDashboard } from './components/customer-dashboard'
import { HomeHero } from './components/home-hero'
import { HomeProcess } from './components/home-process'
import { HomeReasons } from './components/home-reasons'
import { HomeSectionRail } from './components/home-section-rail'
import { homeContainer } from './components/home-styles'
import { HomeTrust } from './components/home-trust'

/**
 * Home ("Soft Bento" redesign 2026-11-09, docs/2026-11-09-UI_REDESIGN_PLAN.md) on a soft mint → peach page: the bento
 * hero, — for a signed-in customer — the next visit, shortcuts and what their center offers, then how it works as
 * tabs, the reasons as a bento grid and the trust band with the next step. The support hotline lives only in the
 * footer.
 */
export function HomePage({ audience = 'public' }: { audience?: 'public' | 'customer' }) {
  const isCustomer = audience === 'customer'

  return (
    <div className='text-on-surface'>
      <HomeHero isCustomer={isCustomer} />
      {isCustomer ? (
        <Reveal className={`${homeContainer} pb-6`}>
          <CustomerDashboard />
        </Reveal>
      ) : null}
      <HomeProcess />
      <HomeReasons />
      <HomeTrust isCustomer={isCustomer} />
      <HomeSectionRail />
    </div>
  )
}
