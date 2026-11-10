import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import { cgCard } from '../../ui/caregiver-page'
import { useNow } from '../../ui/use-now'
import { WithdrawDialog, canWithdraw } from './withdraw-dialog'

/**
 * Withdrawing from this visit (2026-11-09): the action while it starts more than 24 hours from now, the reason it is no
 * longer possible, or the "being replaced" state after the caregiver withdrew. Nothing for visits already under way.
 */
export function VisitWithdraw({ visit }: { visit: CaregiverOccurrenceRecord }) {
  const { t } = useTranslation()
  const now = useNow()
  const [open, setOpen] = useState(false)
  const notStarted = visit.status === 'SCHEDULED' || visit.status === 'ACKNOWLEDGED'
  if (!notStarted) return null

  return (
    <section className={`${cgCard} flex flex-col gap-2 p-4 sm:p-5`}>
      {visit.needsReassignment ? (
        <p className='flex items-start gap-2 text-sm font-semibold text-on-caution-container'>
          <Icon className='mt-0.5 text-lg text-caution' name='person_alert' />
          {t('caregiver.booking.withdraw.alreadyRequested')}
        </p>
      ) : canWithdraw(visit, now) ? (
        <Button
          className='self-start'
          leftIcon={<Icon className='text-lg' name='event_busy' />}
          onClick={() => setOpen(true)}
          variant='secondary'
        >
          {t('caregiver.booking.withdraw.open')}
        </Button>
      ) : (
        <p className='text-sm text-on-surface-variant'>{t('caregiver.booking.withdraw.tooLate')}</p>
      )}
      {open ? <WithdrawDialog onClose={() => setOpen(false)} visits={[visit]} /> : null}
    </section>
  )
}
