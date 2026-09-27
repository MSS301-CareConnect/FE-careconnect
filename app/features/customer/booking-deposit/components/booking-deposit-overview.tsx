import { useTranslation } from 'react-i18next'

const NURSE_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCrANvunmMmi0_5RbFkxoBiphDLL0up84bpuDfI0PFrudTLjtzoytc_08d5uGJou5eLlovYTWxHfuneyVeDtI5DsGlCBxXBI2DqEZ-Fg0VgiEE3wic0wGVM2xzV9sO3lHV9ttRhf3TJhJjvfoEYEN1GWrWkaopBIKy5Emkj15SAkwp2X335uqVhSudqPBnKF09WY1Pq_NZ9qIqNRh062dqjNUbCrRyy_rxl_exoUWvdvNBhJIEBO5VIyA'

const ICON_VERIFIED_USER = 'verified_user'
const ICON_VERIFIED = 'verified'
const ICON_STAR = 'star'
const ICON_CHAT = 'chat'
const ICON_PERSON = 'person'
const ICON_LOCATION = 'location_on'
const ICON_CALENDAR = 'calendar_month'
const ICON_CLOCK = 'nest_clock_farsight_analog'
const ICON_REPORT = 'history_edu'
const ICON_CHECK_CIRCLE = 'check_circle'
const BULLET = '•'

export const BookingDepositOverview = () => {
  const { t } = useTranslation()

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm flex flex-col gap-6 border border-slate-100'>
      {/* Booking Meta Header */}
      <div className='flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100'>
        <div className='flex flex-col'>
          <div className='flex items-center gap-3'>
            <h2 className='text-xl font-bold text-slate-900'>{t('customer.bookingDeposit.overview.title')}</h2>
            <span className='px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold'>
              {t('customer.bookingDeposit.overview.pendingDepositBadge')}
            </span>
          </div>
          <span className='text-sm text-slate-500 mt-1'>
            {t('customer.bookingDeposit.overview.fileCodePrefix')}
            <strong className='text-slate-800'>{t('customer.bookingDeposit.overview.fileCodeValue')}</strong>
            {t('customer.bookingDeposit.overview.createdTime')}
          </span>
        </div>
        <div className='flex items-center gap-1.5 text-slate-700 text-xs font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200'>
          <span className='material-symbols-outlined text-[18px] text-emerald-700'>{ICON_VERIFIED_USER}</span>
          {t('customer.bookingDeposit.overview.insuranceBadge')}
        </div>
      </div>

      {/* Assigned Caregiver Details */}
      <div className='bg-slate-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-100'>
        <div className='relative shrink-0'>
          <img
            src={NURSE_AVATAR}
            alt={t('customer.bookingDeposit.overview.caregiver.avatarAlt')}
            className='w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-sm ring-2 ring-emerald-600/30'
          />
          <span className='absolute bottom-0 right-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center shadow-xs'>
            <span className='w-2.5 h-2.5 bg-emerald-600 rounded-full' />
          </span>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-base font-bold text-slate-900 truncate'>
              {t('customer.bookingDeposit.overview.caregiver.name')}
            </h3>
            <span className='px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1'>
              <span className='material-symbols-outlined text-[14px]'>{ICON_VERIFIED}</span>
              {t('customer.bookingDeposit.overview.caregiver.verifiedBadge')}
            </span>
          </div>
          <p className='text-xs text-slate-600 mt-1'>{t('customer.bookingDeposit.overview.caregiver.bio')}</p>
          <div className='flex items-center gap-4 mt-2 text-xs'>
            <div className='flex items-center gap-1 text-slate-800 font-semibold'>
              <span
                className='material-symbols-outlined text-amber-500 text-[18px]'
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {ICON_STAR}
              </span>
              <span>{t('customer.bookingDeposit.overview.caregiver.ratingValue')}</span>
              <span className='text-slate-500 font-normal'>
                {t('customer.bookingDeposit.overview.caregiver.reviewsCount')}
              </span>
            </div>
            <span className='text-slate-300'>{BULLET}</span>
            <span className='text-slate-500 flex items-center gap-1'>
              <span className='material-symbols-outlined text-[16px] text-teal-700'>{ICON_CHAT}</span>
              {t('customer.bookingDeposit.overview.caregiver.chatAfterDeposit')}
            </span>
          </div>
        </div>
      </div>

      {/* Patient & Care Location Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-slate-50/80 rounded-xl p-4 flex flex-col gap-2 border border-slate-100'>
          <div className='flex items-center gap-2 text-emerald-800 font-semibold text-sm'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_PERSON}</span>
            <span>{t('customer.bookingDeposit.overview.patient.title')}</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>{t('customer.bookingDeposit.overview.patient.name')}</p>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              <strong className='text-slate-800'>
                {t('customer.bookingDeposit.overview.patient.conditionLabel')}{' '}
              </strong>
              {t('customer.bookingDeposit.overview.patient.conditionDesc')}
            </p>
          </div>
        </div>

        <div className='bg-slate-50/80 rounded-xl p-4 flex flex-col gap-2 border border-slate-100'>
          <div className='flex items-center gap-2 text-emerald-800 font-semibold text-sm'>
            <span className='material-symbols-outlined text-[20px]'>{ICON_LOCATION}</span>
            <span>{t('customer.bookingDeposit.overview.location.title')}</span>
          </div>
          <div>
            <p className='text-sm font-semibold text-slate-900'>
              {t('customer.bookingDeposit.overview.location.building')}
            </p>
            <p className='text-xs text-slate-600 mt-1 leading-relaxed'>
              {t('customer.bookingDeposit.overview.location.address')}
            </p>
          </div>
        </div>
      </div>

      {/* Service Scope & Daily Schedule */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <span className='text-base font-bold text-slate-900'>
            {t('customer.bookingDeposit.overview.schedule.title')}
          </span>
          <span className='text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full'>
            {t('customer.bookingDeposit.overview.schedule.shiftsCountBadge')}
          </span>
        </div>

        {/* Schedule Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-100'>
            <span className='material-symbols-outlined text-emerald-700 text-[22px]'>{ICON_CALENDAR}</span>
            <div>
              <span className='block text-xs text-slate-500 font-medium'>
                {t('customer.bookingDeposit.overview.schedule.datesLabel')}
              </span>
              <span className='text-sm font-semibold text-slate-900'>
                {t('customer.bookingDeposit.overview.schedule.datesValue')}
              </span>
            </div>
          </div>

          <div className='bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-100'>
            <span className='material-symbols-outlined text-emerald-700 text-[22px]'>{ICON_CLOCK}</span>
            <div>
              <span className='block text-xs text-slate-500 font-medium'>
                {t('customer.bookingDeposit.overview.schedule.shiftHoursLabel')}
              </span>
              <span className='text-sm font-semibold text-slate-900'>
                {t('customer.bookingDeposit.overview.schedule.shiftHoursValue')}
              </span>
            </div>
          </div>

          <div className='bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-100'>
            <span className='material-symbols-outlined text-emerald-700 text-[22px]'>{ICON_REPORT}</span>
            <div>
              <span className='block text-xs text-slate-500 font-medium'>
                {t('customer.bookingDeposit.overview.schedule.reportFrequencyLabel')}
              </span>
              <span className='text-sm font-semibold text-slate-900'>
                {t('customer.bookingDeposit.overview.schedule.reportFrequencyValue')}
              </span>
            </div>
          </div>
        </div>

        {/* Protocols Checklist */}
        <div className='bg-slate-50/60 rounded-xl p-4 flex flex-col gap-3 border border-slate-100'>
          <span className='text-sm font-semibold text-slate-900'>
            {t('customer.bookingDeposit.overview.schedule.protocolsTitle')}
          </span>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-y-2.5 gap-x-4 text-xs text-slate-700'>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-emerald-600 text-[18px]'>{ICON_CHECK_CIRCLE}</span>
              <span>{t('customer.bookingDeposit.overview.schedule.protocols.vitals')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-emerald-600 text-[18px]'>{ICON_CHECK_CIRCLE}</span>
              <span>{t('customer.bookingDeposit.overview.schedule.protocols.physio')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-emerald-600 text-[18px]'>{ICON_CHECK_CIRCLE}</span>
              <span>{t('customer.bookingDeposit.overview.schedule.protocols.meds')}</span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='material-symbols-outlined text-emerald-600 text-[18px]'>{ICON_CHECK_CIRCLE}</span>
              <span>{t('customer.bookingDeposit.overview.schedule.protocols.nutrition')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
