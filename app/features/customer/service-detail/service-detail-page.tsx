import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { ServiceBookingCard } from './components/service-booking-card'
import { ServiceCaregivers } from './components/service-caregivers'
import { ServicePlans } from './components/service-plans'
import { useServiceDetail } from './hooks/use-service-detail'

const key = 'customer.serviceDetail' as const

/** One center's care service: description, price plans, caregivers who provide it and booking. */
export function CustomerServiceDetailPage() {
  const { t } = useTranslation()
  const { offering, plans, center, caregivers } = useServiceDetail()
  const service = offering.data
  useDocumentTitle(service ? t(`${key}.documentTitle`, { name: service.catalogItem.name }) : t(`${key}.fallbackTitle`))

  return (
    <div className='flex w-full flex-1 flex-col bg-[#f8faf7] text-[#1b2922]'>
      <section className='border-b border-[#e2e9e1] bg-[#fbfcf9]'>
        <div className='mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12'>
          <Link
            className='inline-flex items-center gap-2 text-sm font-bold text-[#075b31] hover:text-[#043b20] focus-visible:outline-2 focus-visible:outline-[#075b31]'
            to='/customer/services'
          >
            <Icon className='text-lg' name='arrow_back' />
            {t(`${key}.back`)}
          </Link>
          {service ? (
            <header className='mt-6 max-w-[920px]'>
              <p className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#075b31]'>
                <Icon className='text-lg' name='medical_services' />
                {service.catalogItem.category}
              </p>
              <h1 className='mt-4 text-[clamp(2.25rem,3.6vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.045em]'>
                {service.catalogItem.name}
              </h1>
              {center.data ? (
                <p className='mt-4 flex items-center gap-2 text-base text-[#435b4a]'>
                  <Icon className='text-xl text-[#075b31]' name='home_health' />
                  {center.data.centerName}
                </p>
              ) : null}
            </header>
          ) : null}
        </div>
      </section>

      <section className='mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10'>
        {offering.isPending ? (
          <div className='rounded-2xl border border-[#dfe8de] bg-white p-10 text-center text-[#526a57]' role='status'>
            {t(`${key}.loading`)}
          </div>
        ) : null}
        {offering.isError ? (
          <div className='rounded-2xl border border-[#dfe8de] bg-white px-6 py-14 text-center' role='alert'>
            <Icon className='text-4xl text-[#075b31]' name='search_off' />
            <h1 className='mt-4 text-xl font-bold'>{t(`${key}.error`)}</h1>
            <p className='mt-2 text-sm text-[#647568]'>{t(`${key}.errorHelp`)}</p>
            <button
              className='mt-6 rounded-lg bg-[#075b31] px-5 py-3 text-sm font-bold text-white hover:bg-[#064925]'
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
              <section className='rounded-2xl border border-[#dbe4db] bg-white p-6 sm:p-7'>
                <h2 className='flex items-center gap-2 text-lg font-bold tracking-[-0.02em]'>
                  <Icon className='text-xl text-[#075b31]' name='description' />
                  {t(`${key}.about`)}
                </h2>
                <p className='mt-4 leading-7 text-[#435b4a]'>
                  {service.catalogItem.description || t(`${key}.aboutEmpty`)}
                </p>
                {service.description ? (
                  <div className='mt-5 rounded-xl border-l-4 border-[#075b31] bg-[#f5f9f4] px-5 py-4'>
                    <p className='text-xs font-bold uppercase tracking-[0.1em] text-[#647b69]'>
                      {t(`${key}.centerNote`)}
                    </p>
                    <p className='mt-1 leading-7 text-[#263b2d]'>{service.description}</p>
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
              fromPrice={plans.data?.[0]?.basePrice}
            />
          </div>
        ) : null}
      </section>
    </div>
  )
}
