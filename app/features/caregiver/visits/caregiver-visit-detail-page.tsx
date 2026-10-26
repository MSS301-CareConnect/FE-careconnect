import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bookingKeys, fetchOccurrence } from '~/entities/booking/booking-api'
import { bookingErrorKey, formatClock, formatDate } from '~/entities/booking/booking-format'
import { BookingRecipientSnapshot } from '~/entities/booking/booking-recipient-snapshot'
import { OccurrenceStatusBadge } from '~/entities/booking/booking-status-badge'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

import { VisitActions } from './components/visit-actions'
import { VisitChecklist } from './components/visit-checklist'

export function CaregiverVisitDetailPage({ id }: { id: string }) {
  const { t, i18n } = useTranslation()
  const language = i18n.language
  const visit = useQuery({ queryKey: bookingKeys.occurrence(id), queryFn: () => fetchOccurrence(id), retry: false })
  useDocumentTitle(t('caregiver.visitDetail.documentTitle', { name: visit.data?.recipientName ?? '' }))

  if (visit.isPending)
    return (
      <p className='mx-auto max-w-5xl px-6 py-10 text-sm text-on-surface-variant' role='status'>
        {t('caregiver.visitDetail.loading')}
      </p>
    )
  if (visit.isError)
    return (
      <div className='mx-auto max-w-5xl px-6 py-10' role='alert'>
        <h1 className='text-xl font-bold'>{t('caregiver.visitDetail.error')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t(bookingErrorKey(visit.error))}</p>
        <Link className='mt-4 inline-block font-semibold text-primary underline' to='/caregiver/visits'>
          {t('caregiver.visitDetail.back')}
        </Link>
      </div>
    )

  const data = visit.data
  const notes = data.specialNotes
  return (
    <div className='mx-auto flex max-w-5xl flex-col gap-6 px-4 py-7 sm:px-6'>
      <Link
        className='inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary'
        to='/caregiver/visits'
      >
        <Icon className='text-lg' name='arrow_back' />
        {t('caregiver.visitDetail.back')}
      </Link>

      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
            {data.recipientName ?? t('caregiver.visits.patientFallback')}
          </h1>
          <p className='mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
            <span className='font-semibold text-on-surface'>
              {formatDate(data.startAt, language)} · {formatClock(data.startAt, language)}–
              {formatClock(data.endAt, language)}
            </span>
            <OccurrenceStatusBadge status={data.status} />
            {data.bookingCode ? <span>#{data.bookingCode}</span> : null}
          </p>
        </div>
        {data.customerPhone ? (
          <a
            className='inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-surface-container-low'
            href={`tel:${data.customerPhone}`}
          >
            <Icon className='text-lg' name='call' />
            {data.customerPhone}
          </a>
        ) : null}
      </header>

      {data.sessionId ? <VisitChecklist sessionId={data.sessionId} /> : <VisitActions visit={data} />}

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        {data.recipientSnapshot ? (
          <SectionCard icon='personal_injury' title={t('caregiver.visitDetail.patient')}>
            <BookingRecipientSnapshot snapshot={data.recipientSnapshot} />
          </SectionCard>
        ) : (
          <SectionCard icon='personal_injury' title={t('caregiver.visitDetail.patient')}>
            <p className='text-sm text-on-surface-variant'>{t('caregiver.visitDetail.snapshotHidden')}</p>
          </SectionCard>
        )}
        <aside className='flex flex-col gap-5 rounded-2xl bg-white p-5 text-sm shadow-sm'>
          <div>
            <h2 className='text-base font-bold'>{t('caregiver.visitDetail.address')}</h2>
            <p className='mt-1 text-on-surface-variant'>{data.serviceAddress ?? '—'}</p>
          </div>
          <div>
            <h2 className='text-base font-bold'>{t('caregiver.visitDetail.services')}</h2>
            <ul className='mt-1 flex flex-col gap-1 text-on-surface-variant'>
              {(data.services ?? []).map((service) => (
                <li key={service.careServiceId}>{service.serviceName}</li>
              ))}
            </ul>
          </div>
          {data.customerNote ? (
            <div>
              <h2 className='text-base font-bold'>{t('caregiver.visitDetail.customerNote')}</h2>
              <p className='mt-1 rounded-lg bg-surface-container-low p-3 text-on-surface-variant'>
                {data.customerNote}
              </p>
            </div>
          ) : null}
          {notes && !data.recipientSnapshot ? (
            <div>
              <h2 className='text-base font-bold'>{t('caregiver.visitDetail.specialNotes')}</h2>
              <p className='mt-1 text-on-surface-variant'>
                {[
                  notes.allergies,
                  notes.chronicConditions,
                  notes.careRequirements,
                  notes.dietaryNotes,
                  notes.behaviorNotes
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
