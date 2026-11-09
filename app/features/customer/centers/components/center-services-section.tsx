import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { careCatalogKeys } from '~/entities/care-catalog/care-catalog-api'
import { fetchCenterServices } from '~/entities/care-catalog/center-services'
import { SERVICE_CATEGORY_ICONS, serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import type { ServiceCenter } from '~/entities/care-center/care-center-api'
import { apiErrorStatus } from '~/shared/api/error-details'
import { useFormat } from '~/shared/lib/format'
import { Icon } from '~/shared/ui/icon'
import { Pagination } from '~/shared/ui/pagination'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { SignInHint } from './sign-in-hint'
import { planPrice } from '~/entities/care-catalog/price-plan-price'

const key = 'customer.centers.detail.services' as const
const services = 'customer.services' as const

/** This center's active services with their cheapest price; "Book" opens the form for this center and service. */
export function CenterServicesSection({ center }: { center: ServiceCenter }) {
  const { t } = useTranslation()
  const format = useFormat()
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 6
  const list = useQuery({
    // The same cache entry the services page uses for this center.
    queryKey: [...careCatalogKeys.centerOfferings(center.id), 'with-price-plans', center],
    queryFn: () => fetchCenterServices(center),
    retry: false
  })

  const totalPages = Math.ceil((list.data?.length ?? 0) / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const pagedServices = (list.data ?? []).slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  return (
    <section aria-labelledby='center-services-title' className='flex flex-col gap-4'>
      <h2 className='text-xl font-bold tracking-tight text-forest-950' id='center-services-title'>
        {t(`${key}.title`)}
      </h2>
      {list.isPending ? (
        <SkeletonGroup className='flex flex-col gap-2' label={t(`${key}.title`)}>
          {[0, 1, 2].map((index) => (
            <Skeleton className='h-16 rounded-xl' key={index} />
          ))}
        </SkeletonGroup>
      ) : null}
      {list.isError && apiErrorStatus(list.error) === 401 ? <SignInHint text={t(`${key}.signIn`)} /> : null}
      {list.isError && apiErrorStatus(list.error) !== 401 ? (
        <ErrorState message={t(`${key}.error`)} onRetry={() => void list.refetch()} />
      ) : null}
      {list.isSuccess && list.data.length === 0 ? (
        <p className='text-sm text-on-surface-variant'>{t(`${key}.empty`)}</p>
      ) : null}
      {list.isSuccess && list.data.length > 0 ? (
        <>
          <ul className='divide-y divide-outline-variant overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest'>
            {pagedServices.map((service) => {
              const group = serviceCategoryGroup(service.category)
              const cheapest = service.plans[0]
              const samePrice = service.plans.every(
                (plan) => cheapest && planPrice(plan).finalPrice === planPrice(cheapest).finalPrice
              )
              return (
                <li className='flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5' key={service.id}>
                  <span
                    aria-hidden='true'
                    className='grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-primary'
                  >
                    <Icon className='text-[22px]' name={SERVICE_CATEGORY_ICONS[group]} />
                  </span>
                  <span className='min-w-0 flex-1'>
                    <Link
                      className='block font-semibold text-on-surface hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                      to={`/customer/services/${service.id}`}
                    >
                      {service.name}
                    </Link>
                    <span className='block text-sm text-on-surface-variant'>
                      {t(`common.serviceCategories.${group}`)}
                    </span>
                  </span>
                  <span className='text-sm font-semibold text-on-surface tabular-nums'>
                    {cheapest
                      ? samePrice
                        ? t(`${services}.card.price`, {
                            price: format.money(planPrice(cheapest).finalPrice),
                            unit: t(`${services}.priceUnit.${cheapest.pricingUnit}`)
                          })
                        : t(`${services}.card.fromPrice`, { price: format.money(planPrice(cheapest).finalPrice) })
                      : t(`${services}.card.contactPrice`)}
                  </span>
                  <Link
                    aria-label={`${t(`${services}.card.bookShort`)} ${service.name}`}
                    className='inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-semibold text-on-primary hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                    to={`/customer/booking?center=${center.id}&service=${service.catalogItemId}`}
                  >
                    {t(`${services}.card.bookShort`)}
                  </Link>
                </li>
              )
            })}
          </ul>
          <Pagination onPageChange={setPage} page={safePage} totalPages={totalPages} />
        </>
      ) : null}
    </section>
  )
}
