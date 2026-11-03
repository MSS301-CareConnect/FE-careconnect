import { useTranslation } from 'react-i18next'

import { CenterContextLine } from '~/entities/care-center/center-scope'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { PageHeader, pageContainer } from '~/shared/ui/page-header'

import { ServicesFilters } from './components/services-filters'
import { ServicesResults } from './components/services-results'
import { useCustomerServices } from './hooks/use-customer-services'

const key = 'customer.services' as const

/** Home care services: one title block, one filter row and a card grid (2026-11 redesign, no hero). */
export function CustomerServicesPage() {
  const { t } = useTranslation()
  const list = useCustomerServices()
  useDocumentTitle(t(`${key}.documentTitle`))

  return (
    <div className={`${pageContainer} pb-16`}>
      <PageHeader
        breadcrumb={[
          { label: t(`${key}.breadcrumb.home`), to: '/customer' },
          { label: t(`${key}.breadcrumb.current`) }
        ]}
        breadcrumbLabel={t(`${key}.breadcrumb.label`)}
        description={t(`${key}.subtitle`)}
        meta={<CenterContextLine />}
        title={t(`${key}.title`)}
      />
      <ServicesFilters list={list} />
      <ServicesResults list={list} />
    </div>
  )
}
