import { useTranslation } from 'react-i18next'

import { BookingsBrowser } from '~/entities/booking/bookings-browser'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

const detailPath = (bookingId: string) => `/admin/bookings/${bookingId}`

/** Every booking on the platform, or one center's, as a list or a month of visits (V-03); a booking opens its detail. */
export function AdminBookingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('admin.bookingsPage.title'))
  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t('admin.bookingsPage.description')} title={t('admin.bookingsPage.title')} />
      <BookingsBrowser detailPath={detailPath} />
    </div>
  )
}
