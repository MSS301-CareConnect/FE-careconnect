import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { BookingsBrowser } from '~/entities/booking/bookings-browser'
import type { BookingSummaryRecord } from '~/shared/api/generated/contracts'
import { useClock } from '~/shared/lib/use-clock'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { ActionMenu } from '~/shared/ui/action-menu'
import { BentoPageHeader, bentoContainer } from '~/shared/ui/bento-page-header'

import { CancelBookingDialog, canAdminCancel } from './components/cancel-booking-dialog'

const detailPath = (bookingId: string) => `/admin/bookings/${bookingId}`

/**
 * Every booking on the platform, or one center's, as a list or a month of visits (V-03); a booking opens its detail.
 * Each row has a "⋯" menu: open, and cancel on behalf of the platform while the booking still holds a schedule. Bookings
 * are created and changed by customers and centers only, so the admin has no create / edit here.
 */
export function AdminBookingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState<BookingSummaryRecord | null>(null)
  const now = useClock(30_000)
  useDocumentTitle(t('admin.bookingsPage.title'))
  return (
    <div className={bentoContainer}>
      <BentoPageHeader description={t('admin.bookingsPage.description')} title={t('admin.bookingsPage.title')} />
      <BookingsBrowser
        detailPath={detailPath}
        rowAction={(booking) => (
          <ActionMenu
            items={[
              {
                id: 'open',
                icon: 'open_in_new',
                label: t('admin.bookingsPage.open'),
                onSelect: () => navigate(detailPath(booking.id))
              },
              ...(canAdminCancel(booking, now)
                ? [
                    {
                      id: 'cancel',
                      icon: 'event_busy',
                      label: t('admin.bookingsPage.cancel'),
                      tone: 'danger' as const,
                      onSelect: () => setCancelling(booking)
                    }
                  ]
                : [])
            ]}
            label={t('admin.bookingsPage.rowActions', { code: booking.bookingCode })}
          />
        )}
      />
      {cancelling ? (
        <CancelBookingDialog
          bookingCode={cancelling.bookingCode}
          bookingId={cancelling.id}
          onClose={() => setCancelling(null)}
        />
      ) : null}
    </div>
  )
}
