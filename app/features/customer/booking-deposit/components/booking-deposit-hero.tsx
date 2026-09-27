import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

const ARIA_BREADCRUMB = 'Breadcrumb'
const ICON_HOME = 'home'
const ICON_CHEVRON = 'chevron_right'
const ICON_SCHEDULE = 'schedule'
const ICON_TIMER = 'timer'

interface BookingDepositHeroProps {
  formattedTime: string
  isExpired: boolean
}

export const BookingDepositHero = ({ formattedTime, isExpired }: BookingDepositHeroProps) => {
  const { t } = useTranslation()

  return (
    <div className='w-full bg-slate-50/50 py-4'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6'>
        {/* Breadcrumb */}
        <nav aria-label={ARIA_BREADCRUMB} className='flex items-center gap-1.5 text-sm text-slate-500 mb-4 flex-wrap'>
          <Link to='/' className='hover:text-emerald-700 transition-colors flex items-center gap-1'>
            <span className='material-symbols-outlined text-[18px]'>{ICON_HOME}</span>
            {t('customer.bookingDeposit.breadcrumb.home')}
          </Link>
          <span className='material-symbols-outlined text-[16px] text-slate-400'>{ICON_CHEVRON}</span>
          <Link to='/customer/booking' className='hover:text-emerald-700 transition-colors'>
            {t('customer.bookingDeposit.breadcrumb.myBookings')}
          </Link>
          <span className='material-symbols-outlined text-[16px] text-slate-400'>{ICON_CHEVRON}</span>
          <span className='text-slate-800 font-semibold truncate'>
            {t('customer.bookingDeposit.breadcrumb.current')}
          </span>
        </nav>

        {/* Urgent Notification / Countdown Banner */}
        <div className='bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden border border-slate-100'>
          <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-700' />
          <div className='flex items-start md:items-center gap-4 pl-2'>
            <div className='w-12 h-12 rounded-full bg-emerald-100/70 flex items-center justify-center text-emerald-800 shrink-0'>
              <span className='material-symbols-outlined text-[28px]'>{ICON_SCHEDULE}</span>
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-2 mb-0.5'>
                <span className='text-lg font-bold text-slate-900'>{t('customer.bookingDeposit.banner.title')}</span>
                <span className='px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold'>
                  {t('customer.bookingDeposit.banner.exclusiveBadge')}
                </span>
              </div>
              <p className='text-sm text-slate-600'>{t('customer.bookingDeposit.banner.desc')}</p>
            </div>
          </div>

          {/* Live Countdown Pill */}
          <div className='flex items-center gap-3 self-start md:self-auto bg-slate-100 px-4 py-2.5 rounded-lg shrink-0 border border-slate-200'>
            <span className='material-symbols-outlined text-emerald-700 text-[20px] animate-pulse'>{ICON_TIMER}</span>
            <div className='flex flex-col'>
              <span className='text-xs text-slate-500 uppercase tracking-wider font-semibold'>
                {t('customer.bookingDeposit.banner.reservedTimeLabel')}
              </span>
              <span
                id='countdown-timer'
                className={`text-base font-bold tracking-tight ${isExpired ? 'text-red-600' : 'text-emerald-700'}`}
              >
                {isExpired ? t('customer.bookingDeposit.banner.expired') : formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
