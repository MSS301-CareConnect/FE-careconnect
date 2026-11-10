import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, submitReplacementConsent } from '~/entities/booking/booking-api'
import {
  bookingErrorKey,
  formatClock,
  formatDate,
  formatDateTime,
  formatMoney
} from '~/entities/booking/booking-format'
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
  onReschedule?: (occurrence: BookingOccurrenceRecord) => void
}

export function BookingOccurrenceDetailDialog({
  occurrence,
  booking,
  service,
  caregiverName,
  caregiverProfile,
  onClose,
  onReschedule
}: BookingOccurrenceDetailDialogProps) {
  const { t, i18n } = useTranslation()
  const format = useFormat()
  const language = i18n.language
  const queryClient = useQueryClient()

  const consentMutation = useMutation({
    mutationFn: (action: 'ACCEPT' | 'REJECT_AND_CANCEL') => submitReplacementConsent(occurrence?.id ?? '', { action }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) })
      void queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      onClose()
    }
  })

  if (!occurrence) return null

  const durationMinutes = calcOccurrenceDurationMinutes(occurrence)
  const isAssigned = Boolean(occurrence.caregiverId || booking.caregiverId)
  const displayName =
    caregiverName ||
    caregiverProfile?.fullName ||
    (isAssigned ? t('booking.occurrences.assigned') : t('booking.occurrences.unassigned'))
  const note = occurrence.note || booking.customerNote
  const isUpcoming = occurrence.status === 'SCHEDULED' || occurrence.status === 'ACKNOWLEDGED'

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
      size='xl'
      title={t(`${key}.title`, { number: occurrence.occurrenceNo })}
    >
      <div className='flex flex-col gap-4 text-sm'>
        {/* Highlight Banner: Status, Time Slot & Price */}
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/60 bg-surface-container-low/50 p-4'>
          <div className='flex flex-wrap items-center gap-2.5'>
            <OccurrenceStatusBadge status={occurrence.status} />
            <span className='inline-flex items-center gap-1.5 rounded-lg bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface'>
              <Icon className='text-sm text-primary' name='calendar_month' />
              {formatDate(occurrence.startAt, language)} · {formatClock(occurrence.startAt, language)} –{' '}
              {formatClock(occurrence.endAt, language)}
            </span>
            {durationMinutes ? (
              <span className='inline-flex items-center gap-1 rounded-lg bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant'>
                <Icon className='text-sm' name='schedule' />
                {format.duration(durationMinutes)}
              </span>
            ) : null}
            {occurrence.rescheduleCount && occurrence.rescheduleCount > 0 ? (
              <span className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800'>
                <Icon className='text-xs' name='update' />
                {t(`${key}.rescheduled`, { count: occurrence.rescheduleCount })}
              </span>
            ) : null}
          </div>
          {occurrence.priceAmount !== undefined ? (
            <div className='text-right'>
              <span className='text-xs text-on-surface-variant block font-medium'>{t(`${key}.price`)}</span>
              <span className='text-2xl font-black text-primary tabular-nums'>
                {formatMoney(occurrence.priceAmount, language)}
              </span>
            </div>
          ) : null}
        </div>

        {/* 2026-11-10: the caregiver never came — say where the money went. */}
        {occurrence.status === 'CAREGIVER_MISSED' ? (
          <div className='rounded-xl border border-error/25 bg-error-container p-3.5 text-sm text-on-error-container'>
            <div className='flex items-center gap-2 font-semibold'>
              <Icon className='text-base' name='person_off' />
              <span>{t('caregiverAbsence.customer.missedTitle')}</span>
            </div>
            <p className='mt-1 text-xs leading-relaxed'>{t('caregiverAbsence.customer.missedBody')}</p>
            <Link className='mt-2 inline-block text-xs font-semibold underline' to='/customer/wallet'>
              {t('caregiverAbsence.customer.openWallet')}
            </Link>
          </div>
        ) : null}

        {/* Cancellation warning if cancelled */}
        {occurrence.cancelReason ? (
          <div className='rounded-xl border border-error/25 bg-error-container p-3.5 text-sm text-on-error-container'>
            <div className='flex items-center gap-2 font-semibold'>
              <Icon className='text-base' name='cancel' />
              <span>{t(`${key}.cancellation`)}</span>
            </div>
            <p className='mt-1 text-xs'>{t(`${key}.cancelReason`, { reason: occurrence.cancelReason })}</p>
            {occurrence.cancelledAt ? (
              <p className='mt-0.5 text-xs'>
                {t(`${key}.cancelledAt`, { time: formatDateTime(occurrence.cancelledAt, language) })}
              </p>
            ) : null}
            {occurrence.cancelledByParty ? (
              <p className='mt-0.5 text-xs'>{t(`${key}.cancelledBy`, { party: occurrence.cancelledByParty })}</p>
            ) : null}
          </div>
        ) : null}

        {/* Emergency Replacement Alert */}
        {occurrence.isEmergencyReplacement ? (
          <div className='rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950'>
            <div className='flex items-center gap-2 font-bold text-amber-900'>
              <Icon className='text-lg text-amber-700' name='emergency' />
              <span>{t(`${key}.emergency.title`)}</span>
            </div>
            {occurrence.replacementReason ? (
              <p className='mt-1 text-xs text-amber-800 leading-relaxed'>
                {t(`${key}.emergency.reason`, { reason: occurrence.replacementReason })}
              </p>
            ) : null}
            {occurrence.replacementConsentStatus === 'PENDING_CUSTOMER' ? (
              <div className='mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200'>
                <button
                  type='button'
                  disabled={consentMutation.isPending}
                  onClick={() => consentMutation.mutate('ACCEPT')}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50'
                >
                  <Icon className='text-xs' name='check' />
                  {t(`${key}.emergency.accept`)}
                </button>
                {onReschedule ? (
                  <button
                    type='button'
                    disabled={consentMutation.isPending}
                    onClick={() => {
                      onClose()
                      onReschedule(occurrence)
                    }}
                    className='inline-flex items-center gap-1.5 rounded-lg bg-white border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/50 disabled:opacity-50'
                  >
                    <Icon className='text-xs' name='calendar_month' />
                    {t(`${key}.emergency.reschedule`)}
                  </button>
                ) : null}
                <button
                  type='button'
                  disabled={consentMutation.isPending}
                  onClick={() => consentMutation.mutate('REJECT_AND_CANCEL')}
                  className='inline-flex items-center gap-1.5 rounded-lg bg-rose-50 border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-800 shadow-xs hover:bg-rose-100 disabled:opacity-50'
                >
                  <Icon className='text-xs' name='cancel' />
                  {t(`${key}.emergency.reject`)}
                </button>
                {consentMutation.error ? (
                  <p className='w-full text-xs font-medium text-error' role='alert'>
                    {t(bookingErrorKey(consentMutation.error))}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className='mt-2 text-xs font-medium text-amber-800'>
                {t(`${key}.emergency.status.${occurrence.replacementConsentStatus ?? 'NONE'}`)}
              </div>
            )}
          </div>
        ) : null}

        {/* Reassignment warning */}
        {occurrence.needsReassignment ? (
          <div className='rounded-xl border border-caution/30 bg-caution-container/30 p-3.5 text-sm text-on-surface'>
            <div className='flex items-center gap-2 font-semibold text-caution'>
              <Icon className='text-base' name='person_alert' />
              <span>{t('booking.occurrences.needsReassignment')}</span>
            </div>
            <p className='mt-1 text-xs text-on-surface-variant'>{t(`${key}.needsReassignment`)}</p>
          </div>
        ) : null}

        {/* Balanced 2-Column Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Column 1: Services & Care Logistics */}
          <div className='flex flex-col gap-4'>
            {/* Section 1: Care Service */}
            <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5'>
                <Icon className='text-sm text-primary' name='medical_services' />
                {t(`${key}.service`)}
              </h3>
              <div className='mt-3 flex items-start gap-3'>
                <div className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'>
                  <Icon className='text-xl' name='health_and_safety' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-base font-bold text-on-surface'>
                    {service?.serviceName ?? t(`${key}.defaultService`)}
                  </p>
                  {service?.planName ? (
                    <p className='mt-0.5 text-xs text-on-surface-variant font-medium'>{service.planName}</p>
                  ) : null}
                  {service?.unitPrice ? (
                    <p className='mt-1 text-xs text-on-surface-variant tabular-nums font-semibold'>
                      {formatMoney(service.unitPrice, language)}
                      {service.unitType ? ` · ${t(`booking.unitType.${service.unitType}`)}` : ''}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Section 2: Patient & Location */}
            <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5'>
                <Icon className='text-sm text-primary' name='home_pin' />
                {t(`${key}.recipientAndLocation`)}
              </h3>
              <ul className='mt-3 flex flex-col gap-2.5 text-xs'>
                <li className='flex items-start gap-2.5'>
                  <Icon className='mt-0.5 text-base text-primary shrink-0' name='personal_injury' />
                  <div>
                    <span className='block font-semibold text-on-surface-variant'>{t(`${key}.patient`)}</span>
                    <span className='font-bold text-on-surface text-sm'>
                      {booking.recipientSnapshot?.fullName ?? '—'}
                      {booking.recipientSnapshot?.age
                        ? ` ${t(`${key}.age`, { count: booking.recipientSnapshot.age })}`
                        : ''}
                    </span>
                  </div>
                </li>
                {booking.serviceAddress ? (
                  <li className='flex items-start gap-2.5'>
                    <Icon className='mt-0.5 text-base text-primary shrink-0' name='location_on' />
                    <div>
                      <span className='block font-semibold text-on-surface-variant'>{t(`${key}.address`)}</span>
                      <span className='text-on-surface leading-relaxed'>{booking.serviceAddress}</span>
                    </div>
                  </li>
                ) : null}
                <li className='flex items-start gap-2.5'>
                  <Icon className='mt-0.5 text-base text-primary shrink-0' name='sticky_note_2' />
                  <div>
                    <span className='block font-semibold text-on-surface-variant'>{t(`${key}.note`)}</span>
                    <span className='text-on-surface-variant whitespace-pre-line leading-relaxed'>
                      {note || t(`${key}.noNote`)}
                    </span>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Column 2: Caregiver Profile & Operations */}
          <div className='flex flex-col gap-4'>
            {/* Section 3: Caregiver Profile */}
            <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5'>
                <Icon className='text-sm text-primary' name='badge' />
                {t(`${key}.caregiver`)}
              </h3>
              <div className='mt-3 flex items-center gap-3.5'>
                <Avatar
                  alt={displayName}
                  className='h-14 w-14 shrink-0 rounded-full text-base font-bold shadow-xs'
                  name={displayName}
                  src={caregiverProfile?.avatarUrl}
                />
                <div className='min-w-0 flex-1'>
                  <p className='text-base font-bold text-on-surface'>{displayName}</p>
                  {caregiverProfile?.experienceYears !== undefined ? (
                    <p className='text-xs text-on-surface-variant font-medium mt-0.5'>
                      {t('booking.caregiver.experience', { count: caregiverProfile.experienceYears })}
                    </p>
                  ) : null}
                  {caregiverProfile?.ratingCount ? (
                    <p className='flex items-center gap-1 text-xs text-on-surface-variant tabular-nums mt-0.5 font-medium'>
                      <Icon className='text-xs text-amber-500' filled name='star' />
                      <span className='font-bold text-on-surface'>{caregiverProfile.ratingAverage?.toFixed(1)}</span>
                      <span>{t(`${key}.reviews`, { count: caregiverProfile.ratingCount })}</span>
                    </p>
                  ) : null}
                  {!isAssigned ? (
                    <p className='text-xs text-on-surface-variant italic mt-0.5'>{t(`${key}.caregiverUnassigned`)}</p>
                  ) : null}
                </div>
              </div>
            </section>

            {/* Section 4: Schedule Timing & Actions */}
            <section className='rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-2xs'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5'>
                <Icon className='text-sm text-primary' name='schedule' />
                {t(`${key}.schedule`)}
              </h3>
              <div className='mt-3 space-y-2.5 text-xs'>
                <div className='flex items-center justify-between rounded-lg bg-surface-container-low/60 px-3 py-2'>
                  <span className='text-on-surface-variant font-medium'>{t(`${key}.plannedTime`)}</span>
                  <span className='font-bold text-on-surface tabular-nums'>
                    {formatClock(occurrence.startAt, language)} – {formatClock(occurrence.endAt, language)}
                  </span>
                </div>
                {occurrence.actualStartAt || occurrence.actualEndAt ? (
                  <div className='flex items-center justify-between rounded-lg bg-secondary/10 px-3 py-2 text-secondary'>
                    <span className='font-medium'>{t(`${key}.actualTime`)}</span>
                    <span className='font-bold tabular-nums'>
                      {occurrence.actualStartAt ? formatClock(occurrence.actualStartAt, language) : '—'}
                      {' – '}
                      {occurrence.actualEndAt ? formatClock(occurrence.actualEndAt, language) : '—'}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Action buttons if upcoming */}
              {isUpcoming ? (
                <div className='mt-3.5 pt-3 border-t border-outline-variant/40 flex flex-col gap-2'>
                  {onReschedule ? (
                    <button
                      type='button'
                      onClick={() => onReschedule(occurrence)}
                      className='inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-low transition-colors'
                    >
                      <Icon className='text-sm text-primary' name='edit_calendar' />
                      {t(`${key}.rescheduleAction`)}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </div>
    </Modal>
  )
}
