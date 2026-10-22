import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { ServicesFilters } from './components/services-filters'
import { ServicesResults } from './components/services-results'
import { useCustomerServices } from './hooks/use-customer-services'

const key = 'customer.services' as const

export function CustomerServicesPage() {
  const { t } = useTranslation()
  const list = useCustomerServices()
  useDocumentTitle(t(`${key}.documentTitle`))

  return (
    <div className='flex w-full flex-1 flex-col bg-surface'>
      <section className='mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8'>
        <nav aria-label={t(`${key}.breadcrumb.label`)} className='mb-4 flex items-center gap-2 text-xs text-outline'>
          <Link className='hover:text-primary' to='/customer'>
            {t(`${key}.breadcrumb.home`)}
          </Link>
          <Icon className='text-sm' name='chevron_right' />
          <span className='font-semibold text-primary'>{t(`${key}.breadcrumb.current`)}</span>
        </nav>
        <header className='rounded-2xl bg-secondary-container/40 p-6 sm:p-8'>
          <span className='inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-primary'>
            <Icon className='text-base' name='verified' />
            {t(`${key}.badge`)}
          </span>
          <h1 className='mt-3 text-2xl font-bold tracking-tight text-on-surface sm:text-3xl'>{t(`${key}.title`)}</h1>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant'>{t(`${key}.subtitle`)}</p>
        </header>
      </section>
      <section className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 items-start gap-8 lg:grid-cols-12'>
          <ServicesFilters
            categories={list.categories}
            category={list.category}
            centerId={list.centerId}
            centers={list.centerOptions}
            keyword={list.keyword}
            onChange={list.update}
            onReset={list.reset}
          />
          <ServicesResults list={list} />
        </div>
      </section>
    </div>
  )
}
