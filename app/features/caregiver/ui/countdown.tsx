import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { useCaregiverFormat } from './caregiver-format'
import { useNow } from './use-now'

const HOUR = 60 * 60 * 1000

/**
 * Time left until `target`, refreshed every 15 seconds. It turns amber when less than `warnMs` is left and shows
 * `doneKey` once the time has passed.
 */
export function Countdown({
  target,
  kind,
  warnMs = 24 * HOUR,
  className = ''
}: {
  target: string
  kind: 'startsIn' | 'closesIn' | 'endsIn'
  warnMs?: number
  className?: string
}) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const now = useNow(15_000)
  const left = new Date(target).getTime() - now
  const done = left <= 0
  const soon = !done && left < warnMs
  const doneKey = kind === 'startsIn' ? 'startsNow' : kind === 'closesIn' ? 'closed' : 'ended'
  const tone = done
    ? 'bg-neutral-container text-on-neutral-container'
    : soon
      ? 'bg-warning-container text-on-warning-container'
      : 'bg-brand-50 text-primary'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors duration-200 ${tone} ${className}`}
    >
      <Icon className={`text-sm ${soon ? 'cg-pulse' : ''}`} name='schedule' />
      {done
        ? t(`caregiver.ui.countdown.${doneKey}`)
        : t(`caregiver.ui.countdown.${kind}`, { time: format.remaining(left) })}
    </span>
  )
}
