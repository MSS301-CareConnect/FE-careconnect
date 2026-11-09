import { motion, useInView, type HTMLMotionProps, type Variants } from 'motion/react'
import { useRef, type ReactNode } from 'react'

import { useAnimatedNumber } from '~/shared/lib/use-animated-number'

/**
 * Soft Bento motion primitives (2026-11-09, docs/2026-11-09-UI_REDESIGN_PLAN.md §5). One easing, short distances,
 * a light blur; `MotionConfig reducedMotion="user"` in `AppProviders` turns transforms off under reduced motion.
 */
export const easeSoft = [0.22, 1, 0.36, 1] as const

/** Variants for any `motion.*` element: use `revealVariants` on items and `staggerVariants()` on their parent. */
export const staggerVariants = (gap = 0.08): Variants => ({
  hidden: {},
  shown: { transition: { staggerChildren: gap } }
})

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  shown: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: easeSoft } }
}

/** Fades, unblurs and lifts its content once it scrolls into view. */
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial='hidden'
      transition={{ delay }}
      variants={revealVariants}
      viewport={{ once: true, amount: 0.2 }}
      whileInView='shown'
      {...props}
    />
  )
}

/** Counts up to `value` when it first scrolls into view; screen readers get the final value straight away. */
export function CountUp({
  value,
  format = (n) => String(n),
  className
}: {
  value: number
  format?: (value: number) => ReactNode
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const shown = useAnimatedNumber(inView ? value : 0, 900)

  return (
    <span className={className} ref={ref}>
      <span aria-hidden='true' className='tabular-nums'>
        {format(shown)}
      </span>
      <span className='sr-only'>{format(value)}</span>
    </span>
  )
}
