import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'

import { useServiceCenter } from '~/entities/care-center/care-center-api'
import { apiErrorStatus } from '~/shared/api/error-details'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { peachPill } from '~/features/customer/ui/bento-styles'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import { CenterPhoto } from './components/center-card'
import { CenterCaregiversSection } from './components/center-caregivers-section'
import { CenterFacts } from './components/center-facts'
import { CenterPolicySection } from './components/center-policy-section'
import { CenterServicesSection } from './components/center-services-section'
import { ChooseCenterButton } from './components/choose-center-button'
import { SignInHint } from './components/sign-in-hint'

const key = 'customer.centers' as const
const backLink =
  'inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'

/**
 * `/customer/centers/:centerId` (CR-6): the center's details with "Choose this center" (or "Selected") and "Book care"
 * for this center, then its services with prices, its caregivers and a short deposit and refund summary. Viewing the
 * page never changes the header's center.
 */
export function CenterDetailPage() {
  const { t } = useTranslation()
  const { centerId = '' } = useParams()
  const center = useServiceCenter(centerId)
  useDocumentTitle(
    center.data ? t(`${key}.detail.documentTitle`, { name: center.data.name }) : t(`${key}.documentTitle`)
  )
  const status = apiErrorStatus(center.error)

  const crumbs = [
    { label: t(`${key}.breadcrumb.home`), to: '/customer' },
    { label: t(`${key}.breadcrumb.current`), to: '/customer/centers' }
  ]

  if (center.isPending)
    return (
      <div className={`${pageContainer} pb-16`}>
        <SkeletonGroup className='flex flex-col gap-4 pt-8' label={t(`${key}.detail.loading`)}>
          <Skeleton className='h-8 w-1/2 rounded' />
          <Skeleton className='h-48 w-full rounded-2xl' />
        </SkeletonGroup>
      </div>
    )

  if (center.isError)
    return (
      <div className={`${pageContainer} flex flex-col gap-4 pt-8 pb-16`}>
        {status === 404 ? (
          <EmptyState
            action={
              <Link className={backLink} to='/customer/centers'>
                {t(`${key}.detail.back`)}
              </Link>
            }
            description={t(`${key}.detail.notFoundText`)}
            icon='home_health'
            title={t(`${key}.detail.notFoundTitle`)}
          />
        ) : status === 401 ? (
          <SignInHint
            text={t('customer.centerPicker.states.signInText')}
            title={t('customer.centerPicker.states.signInTitle')}
          />
        ) : (
          <ErrorState message={t(`${key}.detail.error`)} onRetry={() => void center.refetch()} />
        )}
      </div>
    )

  const data = center.data
  return (
    <div className={`${pageContainer} pb-16`}>
      <CustomerPageHeader
        actions={
          <>
            <ChooseCenterButton center={data} />
            <Link className={peachPill} to={`/customer/booking?center=${data.id}`}>
              <Icon aria-hidden='true' className='text-lg' name='event_available' />
              {t(`${key}.book`)}
            </Link>
          </>
        }
        breadcrumb={[...crumbs, { label: data.name }]}
        breadcrumbLabel={t(`${key}.breadcrumb.label`)}
        title={data.name}
      />

      <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]'>
        <div className='flex min-w-0 flex-col gap-10'>
          <CenterServicesSection center={{ id: data.id, name: data.name }} />
          <CenterCaregiversSection centerId={data.id} />
        </div>
        <aside className='flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start'>
          <div className='overflow-hidden rounded-3xl border border-forest-900/[0.06] bg-white shadow-[var(--shadow-card)]'>
            <div className='m-2 mb-0 overflow-hidden rounded-[1.1rem]'>
              <CenterPhoto center={data} className='aspect-[16/10] w-full' />
            </div>
            <CenterFacts center={data} className='p-5' />
          </div>
          <CenterPolicySection centerId={data.id} />
        </aside>
      </div>
    </div>
  )
}
