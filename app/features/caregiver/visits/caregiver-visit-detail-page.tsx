import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { CareReportCard } from '~/entities/aftercare/care-report-card'
import { SessionNotesCard } from '~/entities/aftercare/session-notes-card'
import { bookingKeys, fetchOccurrence } from '~/entities/booking/booking-api'
import { bookingErrorKey } from '~/entities/booking/booking-format'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useToday } from '../data/caregiver-queries'
import { calendarDayOf, minutesBetweenInstants, useCaregiverFormat } from '../ui/caregiver-format'
import { CaregiverError, CaregiverPageHeader, cgCard, cgContainer } from '../ui/caregiver-page'
import { visitPeople } from '../ui/visit-card'
import { VisitStatusBadge } from '../ui/visit-status-badge'
import { AllergyCallout, CareProfile } from './components/care-profile'
import { VisitAbsence } from './components/visit-absence'
import { VisitActions } from './components/visit-actions'
import { VisitChecklist } from './components/visit-checklist'
import { BookingVisits } from './components/visit-booking'
import { VisitLogistics } from './components/visit-logistics'
import { VisitWithdraw } from './components/visit-withdraw'

export function CaregiverVisitDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const format = useCaregiverFormat()
  const today = useToday()
  const visit = useQuery({ queryKey: bookingKeys.occurrence(id), queryFn: () => fetchOccurrence(id), retry: false })
  useDocumentTitle(t('caregiver.visitDetail.documentTitle', { name: visit.data?.recipientName ?? '' }))
  const back = visit.data?.bookingId
    ? {
        to: `/caregiver/visits/bookings/${visit.data.bookingId}`,
        label: t('caregiver.booking.page.crumb', { code: visit.data.bookingCode ?? '' })
      }
    : { to: '/caregiver/visits', label: t('caregiver.visitDetail.backToVisits') }

  if (visit.isPending)
    return (
      <div className={cgContainer}>
        <SkeletonGroup className='flex flex-col gap-4' label={t('caregiver.visitDetail.loading')}>
          <Skeleton className='h-5 w-32 rounded-md' />
          <Skeleton className='h-9 w-56 rounded-md' />
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]'>
            <Skeleton className='h-72 rounded-xl' />
            <Skeleton className='h-48 rounded-xl' />
          </div>
        </SkeletonGroup>
      </div>
    )
  if (visit.isError)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.visitDetail.error')} />
        <CaregiverError
          message={t(bookingErrorKey(visit.error))}
          onRetry={() => void visit.refetch()}
          retryLabel={t('caregiver.ui.actions.retry')}
        />
      </div>
    )

  const data = visit.data
  const day = calendarDayOf(data.startAt)
  const allergies = visitPeople(data).allergies

  return (
    <div className={`${cgContainer} pb-32 lg:pb-8`}>
      <CaregiverPageHeader
        actions={<VisitStatusBadge className='text-sm' status={data.status} />}
        back={back}
        description={data.bookingCode ? t('caregiver.visitDetail.bookingCode', { code: data.bookingCode }) : undefined}
        eyebrow={
          <span className='tabular-nums'>
            {format.relativeDay(day, today)} · {format.date(day)} ·{' '}
            {format.duration(minutesBetweenInstants(data.startAt, data.endAt))}
          </span>
        }
        title={<span className='tabular-nums'>{format.clockRange(data.startAt, data.endAt)}</span>}
      />

      <div className='flex flex-col gap-4'>
        {allergies ? <AllergyCallout value={allergies} /> : null}
        <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]'>
          <div className='flex min-w-0 flex-col gap-4'>
            <VisitAbsence visit={data} />
            {data.sessionId ? <VisitChecklist sessionId={data.sessionId} /> : <VisitActions visit={data} />}
            <VisitWithdraw visit={data} />
            <CareProfile visit={data} />
            {data.customerNote ? (
              <section aria-labelledby='visit-customer-note' className={`${cgCard} p-4 sm:p-5`}>
                <h2 className='text-sm font-semibold text-on-surface-variant' id='visit-customer-note'>
                  {t('caregiver.visitDetail.customerNote')}
                </h2>
                <p className='mt-1 text-[15px] whitespace-pre-line text-on-surface'>{data.customerNote}</p>
              </section>
            ) : null}
            <BookingVisits visit={data} />
            {data.sessionId ? (
              <div className='grid items-start gap-4 xl:grid-cols-2'>
                <SessionNotesCard canWrite sessionId={data.sessionId} />
                <CareReportCard bookingId={data.bookingId} sessionId={data.sessionId} />
              </div>
            ) : null}
          </div>
          <VisitLogistics visit={data} />
        </div>
      </div>
    </div>
  )
}
