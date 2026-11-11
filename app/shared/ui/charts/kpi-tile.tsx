import { motion } from 'motion/react'
import type { ReactNode } from 'react'

import { Icon } from '~/shared/ui/icon'
import { CountUp, revealVariants } from '~/shared/ui/motion'

type Tone = 'dark' | 'light' | 'mint' | 'peach'

const TONES: Record<Tone, { card: string; label: string; value: string; icon: string; hint: string }> = {
  dark: {
    card: 'border-transparent bg-forest-900 shadow-[var(--shadow-float)]',
    label: 'text-white/70',
    value: 'text-white',
    icon: 'bg-white/10 text-mint-200',
    hint: 'text-white/65'
  },
  light: {
    card: 'border-forest-900/[0.06] bg-surface-container-lowest shadow-[var(--shadow-card)]',
    label: 'text-on-surface-variant',
    value: 'text-forest-950',
    icon: 'bg-mint-50 text-forest-700',
    hint: 'text-on-surface-variant'
  },
  mint: {
    card: 'border-transparent bg-mint-100 shadow-[var(--shadow-card)]',
    label: 'text-forest-800/80',
    value: 'text-forest-950',
    icon: 'bg-white/70 text-forest-700',
    hint: 'text-forest-800/70'
  },
  peach: {
    card: 'border-peach-200 bg-peach-50 shadow-[var(--shadow-card)]',
    label: 'text-peach-700',
    value: 'text-forest-950',
    icon: 'bg-white/80 text-peach-700',
    hint: 'text-peach-700/80'
  }
}

/**
 * One headline number (a stat tile, not a chart): label, the value counting up, an optional icon and a one-line hint.
 * Use inside a `motion` parent with `staggerVariants` so tiles appear one after another.
 */
export function KpiTile({
  label,
  value,
  format,
  icon,
  hint,
  tone = 'light',
  className = ''
}: {
  label: string
  value: number
  format: (value: number) => ReactNode
  icon?: string
  hint?: ReactNode
  tone?: Tone
  className?: string
}) {
  const style = TONES[tone]
  return (
    <motion.div className={`rounded-3xl border p-5 ${style.card} ${className}`} variants={revealVariants}>
      <div className='flex items-start justify-between gap-3'>
        <p className={`text-xs font-semibold ${style.label}`}>{label}</p>
        {icon ? (
          <span aria-hidden='true' className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${style.icon}`}>
            <Icon className='text-lg' name={icon} />
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-[28px] leading-none font-extrabold tracking-tight ${style.value}`}>
        <CountUp format={format} value={value} />
      </p>
      {hint ? <p className={`mt-2 text-xs ${style.hint}`}>{hint}</p> : null}
    </motion.div>
  )
}
