import { useTranslation } from 'react-i18next'

import { BookingsBrowser } from '~/entities/booking/bookings-browser'
import { useDocumentTitle } from '~/shared/lib/use-document-title'

const detailPath = (bookingId: string) => `/admin/bookings/${bookingId}`

/** Every booking on the platform, or one center's, as a list or a month of visits (V-03); a booking opens its detail. */
export function AdminBookingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('admin.bookingsPage.title'))
  return (
    <div className='mx-auto max-w-7xl space-y-5 px-4 py-7 sm:px-6'>
      <header>
        <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('admin.bookingsPage.title')}</h1>
        <p className='mt-2 text-sm text-on-surface-variant'>{t('admin.bookingsPage.description')}</p>
      </header>
      <BookingsBrowser detailPath={detailPath} />
    </div>
  )
}
