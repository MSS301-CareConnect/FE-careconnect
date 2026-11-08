import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { bookingErrorKey, bookingTypeKey } from '~/entities/booking/booking-format'
import { bookingErrorStatus } from '~/entities/booking/booking-api'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'

import { useCaregiverRequest } from '../data/caregiver-queries'
import { CaregiverEmpty, CaregiverError, CaregiverPageHeader, cgContainer } from '../ui/caregiver-page'
import { useNow } from '../ui/use-now'
import { RequestRecipient } from './components/request-recipient'
import { RequestSchedule } from './components/request-schedule'
import { RequestAnswer, RequestCustomer, RequestPricing } from './components/request-side'
import { useRequestAnswer } from './hooks/use-request-answer'
import { useRequestSummary } from './hooks/use-request-summary'

const RESPOND = '/caregiver/visits?tab=respond'

/**
 * Everything a caregiver may see about a booking a customer sent them, before answering: schedule and work shift,
 * every visit with its service and price, the person's health, who booked, the price lines and the answer. Once
 * answered (or expired) the request is gone and the page says so.
 */
export function CaregiverRequestDetailPage({ id }: { id: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const now = useNow(30_000)
  const request = useCaregiverRequest(id)
  const answer = useRequestAnswer(() => void navigate(RESPOND))
  useDocumentTitle(t('caregiver.requests.detail.documentTitle', { code: request.data?.bookingCode ?? '' }))
  const back = { to: RESPOND, label: t('caregiver.requests.detail.back') }

  if (request.isPending)
    return (
      <div className={cgContainer}>
        <SkeletonGroup className='flex flex-col gap-4' label={t('caregiver.requests.detail.loading')}>
          <Skeleton className='h-5 w-32 rounded-md' />
          <Skeleton className='h-9 w-64 rounded-md' />
          <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
            <Skeleton className='h-80 rounded-xl' />
            <Skeleton className='h-60 rounded-xl' />
          </div>
        </SkeletonGroup>
      </div>
    )
  if (request.isError)
    return (
      <div className={cgContainer}>
        <CaregiverPageHeader back={back} title={t('caregiver.requests.detail.titleFallback')} />
        {bookingErrorStatus(request.error) === 404 ? (
          <CaregiverEmpty
            action={
              <Link
                className='cg-press inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                to={RESPOND}
              >
                {t('caregiver.requests.detail.goneAction')}
              </Link>
            }
            description={t('caregiver.requests.detail.gone')}
            icon='inbox'
            title={t('caregiver.requests.detail.goneTitle')}
          />
        ) : (
          <CaregiverError
            message={t(bookingErrorKey(request.error))}
            onRetry={() => void request.refetch()}
            retryLabel={t('caregiver.ui.actions.retry')}
          />
        )}
      </div>
    )

  return <RequestDetail answer={answer} back={back} now={now} request={request.data} />
}

function RequestDetail({
  request,
  answer,
  back,
  now
}: {
  request: NonNullable<ReturnType<typeof useCaregiverRequest>['data']>
  answer: ReturnType<typeof useRequestAnswer>
  back: { to: string; label: string }
  now: number
}) {
  const { t } = useTranslation()
  const summary = useRequestSummary(request)

  return (
    <div className={`${cgContainer} pb-28 lg:pb-8`}>
      <CaregiverPageHeader
        back={back}
        description={<span className='tabular-nums'>{summary.when}</span>}
        eyebrow={`${request.bookingCode} · ${t(bookingTypeKey(request))}`}
        title={
          request.recipientName
            ? t('caregiver.requests.detail.title', { name: request.recipientName })
            : t('caregiver.requests.detail.titleFallback')
        }
      />
      <div className='grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
        <div className='flex min-w-0 flex-col gap-4'>
          <RequestSchedule request={request} />
          <RequestRecipient request={request} />
        </div>
        <div className='flex flex-col gap-4 lg:sticky lg:top-20'>
          <RequestAnswer
            busy={answer.busy(request.id)}
            now={now}
            onAccept={() => answer.accept(request.id)}
            onDecline={() => answer.startDecline(request.id)}
            request={request}
          />
          <RequestCustomer area={summary.area} request={request} />
          <RequestPricing request={request} />
        </div>
      </div>
      {answer.declineDialog}
    </div>
  )
}
