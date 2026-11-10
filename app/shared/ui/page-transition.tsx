import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

import { easeSoft } from './motion'

/**
 * Page change of a portal layout ("Soft Bento", docs/2026-11-09-UI_REDESIGN_PLAN.md §5): the old page fades and
 * blurs out quickly, the new one fades, unblurs and rises in. Pass the layout's `useOutlet()` element and a key that
 * changes only when the page should animate (tabs of one page share a key). The exiting page keeps the element it
 * last rendered, so it never flashes the next page's content.
 */
export function PageTransition({ pageKey, children }: { pageKey: string; children: ReactNode }) {
  return (
    <AnimatePresence initial={false} mode='wait'>
      <motion.div
        // A finished entrance leaves no filter behind (`transitionEnd`) and motion drops a default transform, so
        // `fixed` children (bottom sheets, sticky bars) are placed against the screen, not this box.
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
        exit={{ opacity: 0, y: -6, filter: 'blur(4px)', transition: { duration: 0.14, ease: 'easeIn' } }}
        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
        key={pageKey}
        transition={{ duration: 0.34, ease: easeSoft }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
