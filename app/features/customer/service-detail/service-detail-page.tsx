import { useTranslation } from 'react-i18next'

import { SERVICE_CATEGORY_ICONS, serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'
import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'

import { ServiceBookingCard } from './components/service-booking-card'
import { ServiceCaregivers } from './components/service-caregivers'
import { ServiceImageGallery } from './components/service-image-gallery'
import { ServicePlans } from './components/service-plans'
import { useServiceDetail } from './hooks/use-service-detail'
import { planPrice } from '~/entities/care-catalog/price-plan-price'

const key = 'customer.serviceDetail' as const

/** One center's care service: description, price plans, caregivers who provide it and booking. */
export function CustomerServiceDetailPage() {
  const { t } = useTranslation()
  const { offering, plans, center, caregivers } = useServiceDetail()
  const service = offering.data
  const group = serviceCategoryGroup(service?.catalogItem.category)
  useDocumentTitle(service ? t(`${key}.documentTitle`, { name: service.catalogItem.name }) : t(`${key}.fallbackTitle`))

  return (
    <div className={`${pageContainer} pb-16`}>
      <CustomerPageHeader
        breadcrumb={[
          { label: t(`${key}.breadcrumbHome`), to: '/customer' },
          { label: t(`${key}.breadcrumbServices`), to: '/customer/services' },
          ...(service ? [{ label: service.catalogItem.name }] : [])
        ]}
        breadcrumbLabel={t(`${key}.breadcrumbLabel`)}
        description={
          service ? (
            <span className='inline-flex items-center gap-2'>
              <Icon className='text-lg text-primary' name={SERVICE_CATEGORY_ICONS[group]} />
              {t(`common.serviceCategories.${group}`)}
            </span>
          ) : undefined
        }
        meta={
          center.data ? (
            <span className='inline-flex items-center gap-1.5'>
              <Icon className='text-base text-primary' name='home_health' />
              {center.data.centerName}
            </span>
          ) : undefined
        }
        title={service?.catalogItem.name ?? t(`${key}.loadingTitle`)}
      />
      <section>
        {offering.isPending ? (
          <div
            className='space-y-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-7'
            role='status'
          >
            <span className='sr-only'>{t(`${key}.loading`)}</span>
            <span className='cc-skeleton block h-5 w-1/3 rounded' />
            <span className='cc-skeleton block h-4 w-full rounded' />
            <span className='cc-skeleton block h-4 w-2/3 rounded' />
          </div>
        ) : null}
        {offering.isError ? (
          <div
            className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest px-6 py-14 text-center'
            role='alert'
          >
            <Icon className='text-4xl text-primary' name='search_off' />
            <h1 className='mt-4 text-xl font-bold text-on-surface'>{t(`${key}.error`)}</h1>
            <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.errorHelp`)}</p>
            <button
              className='mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-colors hover:bg-primary-container'
              onClick={() => offering.refetch()}
              type='button'
            >
              {t(`${key}.retry`)}
            </button>
          </div>
        ) : null}
        {service ? (
          <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8'>
            <div className='flex min-w-0 flex-col gap-6'>
              <ServiceImageGallery
                categoryIcon={SERVICE_CATEGORY_ICONS[group]}
                images={
                  service.catalogItem.imageUrl
                    ? [{ id: 'hero', url: service.catalogItem.imageUrl, alt: service.catalogItem.name }]
                    : []
                }
              />
              <section className='rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:p-7'>
                <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em] text-on-surface'>
                  <Icon className='text-xl text-primary' name='description' />
                  {t(`${key}.about`)}
                </h2>
                <p className='mt-4 leading-7 text-on-surface-variant'>
                  {service.catalogItem.description || t(`${key}.aboutEmpty`)}
                </p>
                {service.description ? (
                  <div className='mt-5 rounded-xl border border-outline-variant/60 bg-surface-container-low px-5 py-4'>
                    <p className='flex items-center gap-1.5 text-sm font-semibold text-primary'>
                      <Icon className='text-lg' name='home_health' />
                      {t(`${key}.centerNote`)}
                    </p>
                    <p className='mt-1 leading-7 text-on-surface'>{service.description}</p>
                  </div>
                ) : null}
              </section>
              <ServicePlans isError={plans.isError} isPending={plans.isPending} plans={plans.data} />
              <ServiceCaregivers
                isError={caregivers.isError}
                isPending={caregivers.isPending}
                items={caregivers.data?.items}
                total={caregivers.data?.totalElements}
              />
            </div>
            <ServiceBookingCard
              careServiceId={service.catalogItem.id}
              center={center.data}
              centerId={service.centerId}
              centerPending={center.isPending}
              fromPrice={plans.data?.[0] ? planPrice(plans.data[0]).finalPrice : undefined}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}
