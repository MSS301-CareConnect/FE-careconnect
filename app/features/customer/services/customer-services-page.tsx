import { useTranslation } from 'react-i18next'

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
    <div className='flex w-full flex-1 flex-col bg-[#f8faf7] text-[#1b2922]'>
      <section className='relative isolate overflow-hidden border-b border-[#e2e9e1] bg-[#fbfcf9]'>
        <div
          aria-hidden='true'
          className='absolute inset-0 bg-[#fbfcf9]'
          style={{
            backgroundImage: "url('/images/services-catalog-hero.jpg')",
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'auto 100%'
          }}
        />
        <div aria-hidden='true' className='absolute inset-0 bg-[#fbfcf9]/88 lg:hidden' />
        <div
          aria-hidden='true'
          className='absolute inset-0 hidden lg:block'
          style={{
            backgroundImage:
              'linear-gradient(90deg, #fbfcf9 0%, rgba(251,252,249,.98) 29%, rgba(251,252,249,.84) 48%, rgba(251,252,249,.08) 82%)'
          }}
        />
        <div className='relative mx-auto w-full max-w-[1440px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20'>
          <header className='max-w-[920px]'>
            <p className='flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#075b31]'>
              <Icon aria-hidden='true' className='text-lg' name='verified' />
              {t(`${key}.badge`)}
            </p>
            <h1 className='mt-4 max-w-[18ch] text-[clamp(2.75rem,4.4vw,3.75rem)] font-bold leading-[1.08] tracking-[-0.045em] text-[#1b2922]'>
              {t(`${key}.title`)}
            </h1>
            <p className='mt-5 max-w-[54ch] text-base leading-7 text-[#435b4a] lg:text-lg lg:leading-8'>
              {t(`${key}.subtitle`)}
            </p>
          </header>
        </div>
      </section>
      <section className='mx-auto w-full max-w-[1440px] px-5 pt-2 sm:px-8 lg:px-12'>
        <ServicesFilters
          categories={list.categories}
          category={list.category}
          centerId={list.centerId}
          centers={list.centerOptions}
          keyword={list.keyword}
          onChange={list.update}
          onReset={list.reset}
        />
      </section>
      <section className='mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10'>
        <ServicesResults list={list} />
      </section>
    </div>
  )
}
