import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { PublicCenterRecord } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

import { useMoney } from '../service-detail-format'

const key = 'customer.serviceDetail' as const

type Props = {
  centerId: string
  careServiceId: string
  fromPrice: number | undefined
  center: PublicCenterRecord | undefined
  centerPending: boolean
}

function CenterLine({ icon, label, value }: { icon: string; label: string; value: string | undefined }) {
  if (!value) return null
  return (
    <div className='flex items-start gap-2.5'>
      <Icon className='mt-0.5 text-lg text-[#075b31]' name={icon} />
      <div className='min-w-0'>
        <dt className='text-xs font-semibold uppercase tracking-[0.08em] text-[#647b69]'>{label}</dt>
        <dd className='mt-0.5 text-sm text-[#263b2d]'>{value}</dd>
      </div>
    </div>
  )
}

/** Lowest price, the center's contact details and the booking entry for this service. */
export function ServiceBookingCard({ centerId, careServiceId, fromPrice, center, centerPending }: Props) {
  const { t } = useTranslation()
  const money = useMoney()
  const params = new URLSearchParams({ center: centerId, service: careServiceId })

  return (
    <aside className='flex flex-col gap-4 lg:sticky lg:top-6'>
      <div className='rounded-2xl border border-[#dbe4db] bg-[#f5f9f4] p-6'>
        <p className='text-sm text-[#526a57]'>
          {fromPrice === undefined ? (
            t(`${key}.booking.contactPrice`)
          ) : (
            <>
              {t(`${key}.booking.from`)}{' '}
              <strong className='block text-3xl font-bold tracking-tight text-[#075b31]'>
                {money.format(fromPrice)}
              </strong>
            </>
          )}
        </p>
        <Link
          className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#075b31] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#064925] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075b31]'
          to={`/customer/booking?${params.toString()}`}
        >
          <Icon className='text-lg' name='calendar_add_on' />
          {t(`${key}.booking.book`)}
        </Link>
        <p className='mt-3 text-xs leading-5 text-[#617267]'>{t(`${key}.booking.hint`)}</p>
      </div>
      <div className='rounded-2xl border border-[#dbe4db] bg-white p-6'>
        <h2 className='text-xs font-bold uppercase tracking-[0.12em] text-[#647b69]'>{t(`${key}.center.title`)}</h2>
        {centerPending ? (
          <p className='mt-3 text-sm text-[#526a57]' role='status'>
            {t(`${key}.center.loading`)}
          </p>
        ) : null}
        {center ? (
          <>
            <p className='mt-3 flex items-center gap-2 font-bold text-[#1b2922]'>
              <Icon className='text-xl text-[#075b31]' name='home_health' />
              {center.centerName}
            </p>
            <dl className='mt-4 flex flex-col gap-3 border-t border-[#e6ece5] pt-4'>
              <CenterLine icon='location_on' label={t(`${key}.center.address`)} value={center.address} />
              <CenterLine icon='call' label={t(`${key}.center.phone`)} value={center.phoneNumber} />
              <CenterLine icon='schedule' label={t(`${key}.center.hours`)} value={center.operatingHours} />
            </dl>
          </>
        ) : null}
      </div>
    </aside>
  )
}
