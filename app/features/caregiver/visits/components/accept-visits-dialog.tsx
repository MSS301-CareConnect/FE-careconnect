import { useTranslation } from 'react-i18next'

import type { CaregiverOccurrenceRecord } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

import { useAcceptVisits } from '../../data/use-visit-actions'
import { VisitDayDigest } from './visit-day-digest'

/**
 * "Accept all" of a booking or a day (2026-11-10): lists the visits per day and accepts them in one request
 * (`POST /booking-occurrences/acknowledgements`); a visit taken meanwhile turns the whole request down.
 */
export function AcceptVisitsDialog({ visits, onClose }: { visits: CaregiverOccurrenceRecord[]; onClose: () => void }) {
  const { t } = useTranslation()
  const accept = useAcceptVisits(onClose)

  return (
    <Modal
      footer={
        <div className='flex w-full flex-wrap justify-end gap-2'>
          <Button onClick={onClose} variant='outline'>
            {t('caregiver.booking.accept.cancel')}
          </Button>
          <Button
            leftIcon={<Icon className='text-lg' name='done_all' />}
            loading={accept.isPending}
            onClick={() => accept.mutate(visits)}
            variant='dark'
          >
            {t('caregiver.booking.accept.confirm', { count: visits.length })}
          </Button>
        </div>
      }
      onClose={onClose}
      open
      size='md'
      title={t('caregiver.booking.accept.title', { count: visits.length })}
    >
      <div className='flex flex-col gap-4 text-sm'>
        <p className='text-on-surface-variant'>{t('caregiver.booking.accept.intro')}</p>
        <VisitDayDigest visits={visits} />
      </div>
    </Modal>
  )
}
