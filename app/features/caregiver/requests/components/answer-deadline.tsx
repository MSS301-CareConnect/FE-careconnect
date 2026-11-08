import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import { useCaregiverFormat } from '../../ui/caregiver-format'

const SOON_MS = 3 * 3_600_000

/** Time left to answer a request: amber under three hours, grey once it is over; the exact deadline as a tooltip. */
export function AnswerDeadline({ dueAt, now }: { dueAt: string | undefined; now: number }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  if (!dueAt) return null
  const left = new Date(dueAt).getTime() - now
  const tone =
    left <= 0
      ? 'bg-neutral-container text-on-neutral-container'
      : left < SOON_MS
        ? 'bg-warning-container text-on-warning-container'
        : 'bg-brand-50 text-primary'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${tone}`}
      title={t('caregiver.requests.answerBy', { time: format.shortDateTime(dueAt) })}
    >
      <Icon className={`text-sm ${left > 0 && left < SOON_MS ? 'cg-pulse' : ''}`} name='schedule' />
      {left <= 0 ? t('caregiver.requests.timeUp') : t('caregiver.requests.timeLeft', { time: format.remaining(left) })}
    </span>
  )
}
