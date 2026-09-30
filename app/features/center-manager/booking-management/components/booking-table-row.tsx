import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import type { ManagerBookingPreview } from '../booking-preview'

const statusStyle = {
  pending: 'bg-amber-50 text-amber-800',
  confirmed: 'bg-secondary-container text-primary',
  inProgress: 'bg-blue-50 text-blue-800',
  completed: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-surface-container text-outline'
} as const

export function BookingTableRow({ booking, onView }: { booking: ManagerBookingPreview; onView: (id: string) => void }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? 'vi'
  const created = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date(booking.createdAt))
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${booking.date}T00:00:00Z`))
  return (
    <tr className='border-t border-outline-variant/25 align-top hover:bg-surface-container-low/50'>
      <td className='p-4'>
        <Link className='font-bold text-primary hover:underline' to={`/center-manager/bookings/${booking.id}`}>
          #{booking.id}
        </Link>
        <p className='mt-2 text-xs text-outline'>{t('centerManager.bookingManagement.created', { date: created })}</p>
        <span className='mt-3 inline-flex rounded-md bg-surface-container-low px-2 py-1 text-xs font-semibold'>
          {t(`centerManager.bookingManagement.package.${booking.package}`)}
        </span>
      </td>
      <td className='p-4'>
        <p className='min-w-32 font-semibold'>{booking.customer}</p>
        <p className='mt-1 text-xs text-outline'>#{booking.customerCode}</p>
        <a className='mt-3 flex items-center gap-1 text-xs text-primary hover:underline' href={`tel:${booking.phone}`}>
          <Icon className='text-sm' name='call' />
          {booking.phone}
        </a>
      </td>
      <td className='p-4'>
        <p className='min-w-32 font-semibold'>{booking.patient}</p>
        <p className='mt-1 text-xs text-outline'>
          {booking.patientAge === 0
            ? t('centerManager.bookingManagement.infantAge')
            : t('centerManager.bookingManagement.age', { count: booking.patientAge })}{' '}
          · {t(`centerManager.bookingManagement.${booking.patientGender}`)}
        </p>
        <p className='mt-2 text-xs leading-5 text-on-surface-variant'>{booking.condition}</p>
      </td>
      <td className='p-4'>
        {booking.caregiver ? (
          <>
            <Link
              className='min-w-32 font-semibold hover:text-primary hover:underline'
              to={`/center-manager/caregivers/${booking.caregiverId}`}
            >
              {booking.caregiver}
            </Link>
            <p className='mt-2 text-xs text-outline'>#{booking.caregiverId}</p>
          </>
        ) : (
          <div className='min-w-32'>
            <p className='text-sm font-semibold text-amber-800'>{t('centerManager.bookingManagement.unassigned')}</p>
            <button
              className='mt-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-55'
              disabled
              title={t('centerManager.unavailable')}
              type='button'
            >
              {t('centerManager.bookingManagement.assign')}
            </button>
          </div>
        )}
      </td>
      <td className='p-4'>
        <p className='min-w-40 text-sm font-semibold'>{booking.serviceName}</p>
        <p className='mt-2 text-xs text-outline'>{t(`centerManager.bookingManagement.areas.${booking.area}`)}</p>
      </td>
      <td className='p-4'>
        <p className='min-w-32 font-semibold'>{date}</p>
        {booking.start && booking.end ? (
          <p className='mt-2 text-xs text-on-surface-variant'>
            {booking.start} – {booking.end}
            {booking.package === 'night' && (
              <span className='mt-1 block text-outline'>{t('centerManager.bookingManagement.overnight')}</span>
            )}
          </p>
        ) : (
          <p className='mt-2 text-xs text-outline'>{t('centerManager.bookingManagement.noSchedule')}</p>
        )}
      </td>
      <td className='p-4'>
        <span
          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[booking.status]}`}
        >
          {t(`centerManager.bookingManagement.statuses.${booking.status}`)}
        </span>
        {booking.status === 'inProgress' && (
          <p className='mt-2 min-w-32 text-xs text-outline'>{t('centerManager.bookingManagement.progress')}</p>
        )}
        {booking.status === 'cancelled' && booking.note && (
          <p className='mt-2 min-w-32 text-xs leading-5 text-outline'>
            {t('centerManager.bookingManagement.cancelledNote', { note: booking.note })}
          </p>
        )}
      </td>
      <td className='p-4'>
        <div className='flex items-center gap-1'>
          <Link
            aria-label={t('centerManager.bookingManagement.view', { id: booking.id })}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary-container'
            to={`/center-manager/bookings/${booking.id}`}
          >
            <Icon className='text-xl' name='visibility' />
          </Link>
          <button
            aria-label={t('centerManager.bookingManagement.quickPreview', { id: booking.id })}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low'
            onClick={() => onView(booking.id)}
            type='button'
          >
            <Icon className='text-xl' name='open_in_new' />
          </button>
          <button
            aria-label={t(
              booking.status === 'completed'
                ? 'centerManager.bookingManagement.report'
                : booking.status === 'cancelled'
                  ? 'centerManager.bookingManagement.history'
                  : 'centerManager.bookingManagement.reassign',
              { id: booking.id }
            )}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-outline disabled:cursor-not-allowed'
            disabled
            title={t('centerManager.unavailable')}
            type='button'
          >
            <Icon
              className='text-xl'
              name={
                booking.status === 'completed'
                  ? 'clinical_notes'
                  : booking.status === 'cancelled'
                    ? 'history'
                    : 'swap_horiz'
              }
            />
          </button>
          <button
            aria-label={t(
              booking.status === 'completed'
                ? 'centerManager.bookingManagement.receipt'
                : 'centerManager.bookingManagement.cancel',
              { id: booking.id }
            )}
            className='flex h-9 w-9 items-center justify-center rounded-lg text-outline disabled:cursor-not-allowed'
            disabled
            title={t('centerManager.unavailable')}
            type='button'
          >
            <Icon className='text-xl' name={booking.status === 'completed' ? 'receipt_long' : 'cancel'} />
          </button>
        </div>
      </td>
    </tr>
  )
}
