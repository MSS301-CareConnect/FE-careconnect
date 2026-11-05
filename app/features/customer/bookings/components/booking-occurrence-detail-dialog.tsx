import { useTranslation } from 'react-i18next'

import { formatClock, formatDateTime, formatDate, formatMoney } from '~/entities/booking/booking-format'
import { OccurrenceStatusBadge } from '~/entities/booking/booking-status-badge'
import { calcOccurrenceDurationMinutes } from '~/entities/booking/booking-occurrence-list'
import type {
  BookingDetailRecord,
  BookingItemRecord,
  BookingOccurrenceRecord,
  ProviderCaregiverPublicRecord
} from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'

const key = 'customer.bookingDetail.occurrenceDetail' as const

export interface BookingOccurrenceDetailDialogProps {
  occurrence: BookingOccurrenceRecord | null
  booking: BookingDetailRecord
  service?: BookingItemRecord
  caregiverName?: string
  caregiverProfile?: ProviderCaregiverPublicRecord
  onClose: () => void
}

export function BookingOccurrenceDetailDialog({
  occurrence,
  booking,
  service,
  caregiverName,
  caregiverProfile,
  onClose
}: BookingOccurrenceDetailDialogProps) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const language = i18n.language

  if (!occurrence) return null

  const durationMinutes = calcOccurrenceDurationMinutes(occurrence)
  const isAssigned = Boolean(occurrence.caregiverId || booking.caregiverId)
  const displayName = caregiverName || caregiverProfile?.fullName || (isAssigned ? t('booking.occurrences.assigned') : t('booking.occurrences.unassigned'))
  const note = occurrence.note || booking.customerNote

  return (
    <Modal
      dismissOnBackdrop
      footer={
        <div className='flex justify-end'>
          <Button onClick={onClose} variant='secondary'>
            {t(`${key}.close`)}
          </Button>
        </div>
      }
      onClose={onClose}
      open={Boolean(occurrence)}
      size='lg'
      title={t(`${key}.title`, { number: occurrence.occurrenceNo })}
    >
      <div className='flex flex-col gap-5 px-5 py-4 sm:px-6'>
        {/* Highlight Banner: Status & Price */}
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <OccurrenceStatusBadge status={occurrence.status} />
            {durationMinutes ? (
              <span className='inline-flex items-center gap-1 rounded-md bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant'>
                <Icon className='text-sm' name='schedule' />
                {format.duration(durationMinutes)}
              </span>
            ) : null}
          </div>
          {occurrence.priceAmount !== undefined ? (
            <div className='text-right'>
              <span className='text-xs text-on-surface-variant block'>{t(`${key}.price`)}</span>
              <span className='text-lg font-bold text-primary tabular-nums'>
                {formatMoney(occurrence.priceAmount, language)}
              </span>
            </div>
          ) : null}
        </div>

        {/* Cancellation warning if cancelled */}
        {occurrence.cancelReason ? (
          <div className='rounded-xl border border-error/25 bg-error-container p-3 text-sm text-on-error-container'>
            <div className='flex items-center gap-2 font-semibold'>
              <Icon className='text-base' name='cancel' />
              <span>{t(`${key}.cancellation`)}</span>
            </div>
            <p className='mt-1 text-xs'>
              {t(`${key}.cancelReason`, { reason: occurrence.cancelReason })}
            </p>
            {occurrence.cancelledAt ? (
              <p className='mt-0.5 text-xs'>
                {t(`${key}.cancelledAt`, { time: formatDateTime(occurrence.cancelledAt, language) })}
              </p>
            ) : null}
            {occurrence.cancelledByParty ? (
              <p className='mt-0.5 text-xs'>
                {t(`${key}.cancelledBy`, { party: occurrence.cancelledByParty })}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Reassignment warning */}
        {occurrence.needsReassignment ? (
          <div className='rounded-xl border border-caution/30 bg-caution-container/30 p-3 text-sm text-on-surface'>
            <div className='flex items-center gap-2 font-semibold text-caution'>
              <Icon className='text-base' name='person_alert' />
              <span>{t('booking.occurrences.needsReassignment')}</span>
            </div>
            <p className='mt-1 text-xs text-on-surface-variant'>
              {t(`${key}.needsReassignment`)}
            </p>
          </div>
        ) : null}

        {/* Section 1: Care Service */}
        <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
            {t(`${key}.service`)}
          </h3>
          <div className='mt-2.5 flex items-start gap-3'>
            <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'>
              <Icon className='text-xl' name='medical_services' />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-base font-bold text-on-surface'>
                {service?.serviceName ?? t(`${key}.defaultService`)}
              </p>
              {service?.planName ? (
                <p className='mt-0.5 text-xs text-on-surface-variant'>
                  {service.planName}
                </p>
              ) : null}
              {service?.unitPrice ? (
                <p className='mt-1 text-xs text-on-surface-variant tabular-nums'>
                  {formatMoney(service.unitPrice, language)}
                  {service.unitType ? ` · ${t(`booking.unitType.${service.unitType}`)}` : ''}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section 2: Schedule & Time */}
        <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
            {t(`${key}.schedule`)}
          </h3>
          <div className='mt-3 grid gap-3 sm:grid-cols-2'>
            <div className='flex items-start gap-2.5 text-sm'>
              <Icon className='mt-0.5 text-lg text-primary' name='calendar_month' />
              <div>
                <span className='block text-xs text-on-surface-variant'>{t(`${key}.plannedTime`)}</span>
                <span className='font-medium text-on-surface tabular-nums'>
                  {formatDate(occurrence.startAt, language)}
                </span>
                <span className='block text-xs text-on-surface-variant tabular-nums'>
                  {formatClock(occurrence.startAt, language)} – {formatClock(occurrence.endAt, language)}
                  {durationMinutes ? ` (${format.duration(durationMinutes)})` : ''}
                </span>
              </div>
            </div>

            {(occurrence.actualStartAt || occurrence.actualEndAt) ? (
              <div className='flex items-start gap-2.5 text-sm'>
                <Icon className='mt-0.5 text-lg text-secondary' name='timer' />
                <div>
                  <span className='block text-xs text-on-surface-variant'>{t(`${key}.actualTime`)}</span>
                  <span className='font-medium text-on-surface tabular-nums'>
                    {occurrence.actualStartAt ? formatClock(occurrence.actualStartAt, language) : '—'}
                    {' – '}
                    {occurrence.actualEndAt ? formatClock(occurrence.actualEndAt, language) : '—'}
                  </span>
                  {occurrence.actualStartAt ? (
                    <span className='block text-xs text-on-surface-variant tabular-nums'>
                      {formatDate(occurrence.actualStartAt, language)}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Section 3: Caregiver */}
        <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
            {t(`${key}.caregiver`)}
          </h3>
          <div className='mt-3 flex items-center gap-3'>
            <Avatar
              alt={displayName}
              className='h-12 w-12 shrink-0 rounded-full text-base'
              name={displayName}
              src={caregiverProfile?.avatarUrl}
            />
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-bold text-on-surface'>{displayName}</p>
              {caregiverProfile?.experienceYears !== undefined ? (
                <p className='text-xs text-on-surface-variant'>
                  {t('booking.caregiver.experience', { count: caregiverProfile.experienceYears })}
                </p>
              ) : null}
              {caregiverProfile?.ratingCount ? (
                <p className='flex items-center gap-1 text-xs text-on-surface-variant tabular-nums'>
                  <Icon className='text-xs text-primary' filled name='star' />
                  <span>{caregiverProfile.ratingAverage?.toFixed(1)}</span>
                  <span>({caregiverProfile.ratingCount})</span>
                </p>
              ) : null}
              {!isAssigned ? (
                <p className='text-xs text-on-surface-variant'>{t(`${key}.caregiverUnassigned`)}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Section 4: Patient & Location */}
        <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4'>
          <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant'>
            {t(`${key}.recipientAndLocation`)}
          </h3>
          <ul className='mt-3 flex flex-col gap-2.5 text-sm'>
            <li className='flex items-start gap-2.5'>
              <Icon className='mt-0.5 text-lg text-primary' name='personal_injury' />
              <div>
                <span className='block text-xs text-on-surface-variant'>{t(`${key}.patient`)}</span>
                <span className='font-medium text-on-surface'>
                  {booking.recipientSnapshot?.fullName ?? '—'}
                  {booking.recipientSnapshot?.age ? ` (${booking.recipientSnapshot.age} tuổi)` : ''}
                </span>
              </div>
            </li>
            {booking.serviceAddress ? (
              <li className='flex items-start gap-2.5'>
                <Icon className='mt-0.5 text-lg text-primary' name='home_pin' />
                <div>
                  <span className='block text-xs text-on-surface-variant'>{t(`${key}.address`)}</span>
                  <span className='text-on-surface'>{booking.serviceAddress}</span>
                </div>
              </li>
            ) : null}
            <li className='flex items-start gap-2.5'>
              <Icon className='mt-0.5 text-lg text-primary' name='sticky_note_2' />
              <div>
                <span className='block text-xs text-on-surface-variant'>{t(`${key}.note`)}</span>
                <span className='text-on-surface-variant whitespace-pre-line'>
                  {note || t(`${key}.noNote`)}
                </span>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </Modal>
  )
}
