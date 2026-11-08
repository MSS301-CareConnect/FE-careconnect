import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import type { MissingReason } from '../hooks/use-booking-form'

/** One titled block inside a step. */
export function WizardSection({
  id,
  title,
  description,
  aside,
  children
}: {
  id: string
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div>
          <h2 className='text-lg font-semibold text-on-surface' id={id}>
            {title}
          </h2>
          {description ? <p className='mt-0.5 text-sm text-on-surface-variant'>{description}</p> : null}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Why "Continue" is disabled, said right beside it (and announced). */
export function MissingHint({ reason, id }: { reason: MissingReason | null; id: string }) {
  const { t } = useTranslation()
  if (!reason) return null
  return (
    <p aria-live='polite' className='flex items-center gap-1.5 text-sm text-on-surface-variant' id={id}>
      <Icon className='text-base text-warning' name='info' />
      {t(`customer.booking.nav.missing.${reason}`)}
    </p>
  )
}

/** Back (ghost) + Continue (primary) at the end of a step. On phones Continue lives in the bottom bar instead. */
export function StepFooter({
  onBack,
  onNext,
  reason,
  nextLabel,
  loading = false,
  showBack = true
}: {
  onBack: () => void
  onNext: () => void
  reason: MissingReason | null
  nextLabel?: string
  loading?: boolean
  showBack?: boolean
}) {
  const { t } = useTranslation()
  const hintId = 'booking-step-hint'
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant pt-5'>
      {showBack ? (
        <Button leftIcon={<Icon className='text-lg' name='arrow_back' />} onClick={onBack} variant='ghost'>
          {t('customer.booking.nav.back')}
        </Button>
      ) : (
        <span />
      )}
      <div className='hidden flex-wrap items-center justify-end gap-3 lg:flex'>
        <MissingHint id={hintId} reason={reason} />
        <Button
          aria-describedby={reason ? hintId : undefined}
          disabled={Boolean(reason)}
          loading={loading}
          loadingLabel={t('customer.booking.nav.submitting')}
          onClick={onNext}
          rightIcon={<Icon className='text-lg' name='arrow_forward' />}
          size='lg'
        >
          {nextLabel ?? t('customer.booking.nav.next')}
        </Button>
      </div>
    </div>
  )
}
