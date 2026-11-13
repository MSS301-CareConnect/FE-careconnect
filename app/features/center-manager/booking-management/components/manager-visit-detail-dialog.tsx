import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { aftercareKeys, fetchReports } from '~/entities/aftercare/aftercare-api'
import { bookingKeys, fetchCareSession, fetchOccurrence } from '~/entities/booking/booking-api'
import { calcOccurrenceDurationMinutes, matchOccurrenceService } from '~/entities/booking/booking-occurrence-list'
import { OccurrenceStatusBadge } from '~/entities/booking/booking-status-badge'
import type { BookingDetailRecord, BookingOccurrenceRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { StatusBadge } from '~/shared/ui/status-badge'

import { ManagerVisitAbsence } from './manager-visit-absence'

const k = 'centerManager.bookingDetail.visit' as const
// Visits that may have a care session, report or no-show to show.
const STARTED: ReadonlySet<BookingOccurrenceRecord['status']> = new Set([
  'IN_PROGRESS',
  'COMPLETED',
  'CUSTOMER_NO_SHOW',
  'CAREGIVER_MISSED'
])

function Block({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className='rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-4'>
      <h3 className='flex items-center gap-1.5 text-xs font-bold tracking-wide text-on-surface-variant uppercase'>
        <Icon className='text-base text-primary' name={icon} />
        {title}
      </h3>
      <div className='mt-3 space-y-2 text-sm'>{children}</div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className='flex justify-between gap-3'>
      <dt className='text-on-surface-variant'>{label}</dt>
      <dd className='text-right font-medium text-on-surface tabular-nums'>{children}</dd>
    </div>
  )
}

/**
 * One visit for the center manager: time (planned / actual / check-in window), service and price, address and note,
 * caregiver, and — once it has started — the care session (tasks) and the caregiver's report.
 */
export function ManagerVisitDetailDialog({
  booking,
  occurrence,
  caregiverName,
  onClose
}: {
  booking: BookingDetailRecord
  occurrence: BookingOccurrenceRecord
  caregiverName?: string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const format = useFormat()
  const service = matchOccurrenceService(occurrence, booking.services)
  const minutes = calcOccurrenceDurationMinutes(occurrence)
  const detail = useQuery({
    queryKey: bookingKeys.occurrence(occurrence.id),
    queryFn: () => fetchOccurrence(occurrence.id),
    retry: false
  })
  const sessionId = detail.data?.sessionId
  const session = useQuery({
    queryKey: ['care-session', sessionId],
    queryFn: () => fetchCareSession(sessionId ?? ''),
    enabled: Boolean(sessionId),
    retry: false
  })
  const reports = useQuery({
    queryKey: aftercareKeys.reports(booking.id),
    queryFn: () => fetchReports(booking.id),
    enabled: STARTED.has(occurrence.status),
    retry: false
  })
  const report = (reports.data ?? []).find(
    (item) => item.status === 'SUBMITTED' && (item.occurrenceId === occurrence.id || item.sessionId === sessionId)
  )
  const tasks = [...(session.data?.tasks ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const doneTasks = tasks.filter((task) => task.status === 'DONE').length
  const address = occurrence.serviceAddress || booking.serviceAddress
  const note = occurrence.note || booking.customerNote
  const units = service?.unitsPerOccurrence ?? 1

  return (
    <Modal
      footer={
        <Button onClick={onClose} variant='outline'>
          {t(`${k}.close`)}
        </Button>
      }
      onClose={onClose}
      open
      size='xl'
      title={t(`${k}.title`, { number: occurrence.occurrenceNo, code: booking.bookingCode })}
    >
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <OccurrenceStatusBadge status={occurrence.status} />
            <span className='font-semibold tabular-nums'>
              {format.visitRange(occurrence.startAt, occurrence.endAt)}
            </span>
            {minutes ? <StatusBadge tone='neutral'>{format.duration(minutes)}</StatusBadge> : null}
          </div>
          {occurrence.priceAmount !== undefined ? (
            <div className='text-right'>
              <span className='block text-xs text-on-surface-variant'>{t(`${k}.price`)}</span>
              <span className='text-2xl font-extrabold text-primary tabular-nums'>
                {format.money(occurrence.priceAmount)}
              </span>
            </div>
          ) : null}
        </div>

        {occurrence.cancelReason || occurrence.needsReassignment || detail.data?.noShowReportedAt ? (
          <div className='space-y-2'>
            {occurrence.cancelReason ? (
              <p className='rounded-xl border border-error/25 bg-error-container p-3 text-sm text-on-error-container'>
                {t(`${k}.cancelled`, {
                  reason: occurrence.cancelReason,
                  time: format.dateTime(occurrence.cancelledAt),
                  party: occurrence.cancelledByParty ? t(`${k}.parties.${occurrence.cancelledByParty}`) : '—'
                })}
              </p>
            ) : null}
            {occurrence.needsReassignment ? (
              <p className='rounded-xl border border-warning/30 bg-warning-container p-3 text-sm text-on-warning-container'>
                {t(`${k}.needsReassignment`)}
              </p>
            ) : null}
            {detail.data?.noShowReportedAt ? (
              <p className='rounded-xl border border-warning/30 bg-warning-container p-3 text-sm text-on-warning-container'>
                {t(`${k}.noShow`, {
                  time: format.dateTime(detail.data.noShowReportedAt),
                  note: detail.data.noShowNote || '—'
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        <ManagerVisitAbsence bookingId={booking.id} caregiverName={caregiverName} occurrence={occurrence} />

        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-4'>
            <Block icon='medical_services' title={t(`${k}.service`)}>
              <p className='text-base font-bold'>{service?.serviceName ?? t(`${k}.allServices`)}</p>
              {service?.planName ? <p className='text-on-surface-variant'>{service.planName}</p> : null}
              <dl className='space-y-1.5 border-t border-dashed border-outline-variant pt-2'>
                {service?.unitPrice !== undefined ? (
                  <Row label={t(`${k}.unitPrice`)}>
                    {t(`${k}.unitValue`, {
                      price: format.money(service.unitPrice),
                      unit: service.unitType ? t(`booking.unitType.${service.unitType}`) : '—'
                    })}
                  </Row>
                ) : null}
                {service ? <Row label={t(`${k}.units`)}>{units}</Row> : null}
                <Row label={t(`${k}.visitPrice`)}>
                  <span className='font-bold text-primary'>{format.money(occurrence.priceAmount)}</span>
                </Row>
              </dl>
            </Block>
            <Block icon='schedule' title={t(`${k}.time`)}>
              <dl className='space-y-1.5'>
                <Row label={t(`${k}.planned`)}>{format.visitRange(occurrence.startAt, occurrence.endAt)}</Row>
                {occurrence.originalStartAt && (occurrence.rescheduleCount ?? 0) > 0 ? (
                  <Row label={t(`${k}.original`, { count: occurrence.rescheduleCount ?? 0 })}>
                    {format.visitRange(occurrence.originalStartAt, occurrence.originalEndAt)}
                  </Row>
                ) : null}
                {detail.data?.checkInOpensAt ? (
                  <Row label={t(`${k}.checkInWindow`)}>
                    {format.clock(detail.data.checkInOpensAt)}–{format.clock(detail.data.checkInClosesAt)}
                  </Row>
                ) : null}
                <Row label={t(`${k}.actual`)}>
                  {occurrence.actualStartAt || occurrence.actualEndAt
                    ? `${format.clock(occurrence.actualStartAt) || '—'}–${format.clock(occurrence.actualEndAt) || '—'}`
                    : t(`${k}.notStarted`)}
                </Row>
              </dl>
            </Block>
            <Block icon='home_pin' title={t(`${k}.place`)}>
              <p>{address || '—'}</p>
              {occurrence.serviceAddress ? <StatusBadge tone='info'>{t(`${k}.otherAddress`)}</StatusBadge> : null}
              <p className='whitespace-pre-line text-on-surface-variant'>{note || t(`${k}.noNote`)}</p>
            </Block>
          </div>

          <div className='space-y-4'>
            <Block icon='badge' title={t(`${k}.caregiver`)}>
              {occurrence.caregiverId ? (
                <Link
                  className='font-semibold text-primary hover:underline'
                  to={`/center-manager/caregivers/${occurrence.caregiverId}`}
                >
                  {caregiverName ?? t('booking.occurrences.assigned')}
                </Link>
              ) : (
                <p className='text-on-surface-variant'>{t('booking.occurrences.unassigned')}</p>
              )}
              <p className='text-on-surface-variant'>
                {detail.data?.acknowledgedAt
                  ? t(`${k}.acknowledged`, { time: format.dateTime(detail.data.acknowledgedAt) })
                  : t(`${k}.notAcknowledged`)}
              </p>
              {occurrence.isEmergencyReplacement ? (
                <p className='rounded-lg bg-warning-container p-2.5 text-xs text-on-warning-container'>
                  {t(`${k}.replacement`, { reason: occurrence.replacementReason || '—' })}
                </p>
              ) : null}
            </Block>
            <Block icon='checklist' title={t(`${k}.session`)}>
              {!sessionId ? (
                <p className='text-on-surface-variant'>{t(`${k}.noSession`)}</p>
              ) : session.isPending ? (
                <p className='text-on-surface-variant' role='status'>
                  {t(`${k}.loading`)}
                </p>
              ) : session.isError ? (
                <p className='text-error' role='alert'>
                  {t(`${k}.sessionError`)}
                </p>
              ) : (
                <>
                  <dl className='space-y-1.5'>
                    <Row label={t(`${k}.checkIn`)}>{format.dateTime(session.data.checkInAt) || '—'}</Row>
                    <Row label={t(`${k}.checkOut`)}>{format.dateTime(session.data.checkOutAt) || '—'}</Row>
                    <Row label={t(`${k}.late`)}>
                      {session.data.lateMinutes
                        ? t(`${k}.minutes`, { count: session.data.lateMinutes })
                        : t(`${k}.onTime`)}
                    </Row>
                    {session.data.checkOutAt ? (
                      <Row label={t(`${k}.earlyLeave`)}>
                        {session.data.earlyLeaveMinutes
                          ? t(`${k}.minutes`, { count: session.data.earlyLeaveMinutes })
                          : t(`${k}.onTime`)}
                      </Row>
                    ) : null}
                    {session.data.checkInDistanceMeters !== undefined ? (
                      <Row label={t(`${k}.distance`)}>
                        {t(`${k}.meters`, { count: session.data.checkInDistanceMeters })}
                      </Row>
                    ) : null}
                    {session.data.locationFlag ? (
                      <Row label={t(`${k}.location`)}>
                        <StatusBadge tone='warning'>{t(`${k}.locationFlags.${session.data.locationFlag}`)}</StatusBadge>
                      </Row>
                    ) : null}
                    {session.data.autoClosed ? (
                      <Row label={t(`${k}.autoClosed`)}>
                        <Icon className='text-base text-warning' name='timer_off' />
                      </Row>
                    ) : null}
                    {session.data.completionReview ? (
                      <Row label={t(`${k}.review`)}>
                        <StatusBadge
                          tone={
                            session.data.completionReview === 'PENDING'
                              ? 'warning'
                              : session.data.completionReview === 'CONFIRMED'
                                ? 'success'
                                : 'danger'
                          }
                        >
                          {t(`${k}.reviews.${session.data.completionReview}`)}
                        </StatusBadge>
                      </Row>
                    ) : null}
                  </dl>
                  {tasks.length ? (
                    <>
                      <p className='pt-1 text-xs font-semibold text-on-surface-variant'>
                        {t(`${k}.tasks`, { done: doneTasks, total: tasks.length })}
                      </p>
                      <ul className='space-y-1'>
                        {tasks.map((task) => (
                          <li className='flex items-start gap-2' key={task.id}>
                            <Icon
                              className={`text-base ${task.status === 'DONE' ? 'text-success' : task.status === 'SKIPPED' ? 'text-outline' : 'text-on-surface-variant'}`}
                              name={
                                task.status === 'DONE'
                                  ? 'check_circle'
                                  : task.status === 'SKIPPED'
                                    ? 'block'
                                    : 'radio_button_unchecked'
                              }
                            />
                            <span className={task.status === 'SKIPPED' ? 'text-on-surface-variant line-through' : ''}>
                              {task.title}
                              {task.skipReason ? (
                                <span className='block text-xs text-on-surface-variant'>{task.skipReason}</span>
                              ) : null}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              )}
            </Block>
            <Block icon='assignment' title={t(`${k}.report`)}>
              {report ? (
                <>
                  <p className='font-semibold'>
                    {report.overallCondition ? t(`aftercare.conditions.${report.overallCondition}`) : '—'}
                    {report.submittedAt ? ` · ${format.dateTime(report.submittedAt)}` : ''}
                  </p>
                  {report.summary ? <p className='whitespace-pre-line'>{report.summary}</p> : null}
                  {report.recommendations ? (
                    <p className='text-on-surface-variant'>
                      {t(`${k}.recommendations`, { text: report.recommendations })}
                    </p>
                  ) : null}
                </>
              ) : (
                <p className='text-on-surface-variant'>{t(`${k}.noReport`)}</p>
              )}
            </Block>
          </div>
        </div>
      </div>
    </Modal>
  )
}
