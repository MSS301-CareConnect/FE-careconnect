import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import type { PaymentStatus } from '~/shared/api/generated/contracts'
import { Icon } from '~/shared/ui/icon'

export interface PaymentShellProps {
  title: string
  subtitle: string
  crumb: string
  bookingId?: string
  bookingCode?: string
  children: ReactNode
}

/** Header band and frame shared by the deposit, return and result screens, matching the booking form. */
export function PaymentShell({ title, subtitle, crumb, bookingId, bookingCode, children }: PaymentShellProps) {
  const { t } = useTranslation()
  return (
    <div className='flex w-full flex-1 flex-col bg-surface text-on-surface'>
      <section className='border-b border-outline-variant/60 bg-surface-container-low'>
        <div className='mx-auto w-full max-w-[1440px] px-5 pt-6 pb-8 sm:px-8 lg:px-12 lg:pt-8 lg:pb-10'>
          <nav
            aria-label={t('customer.payment.breadcrumb')}
            className='flex flex-wrap items-center gap-1.5 text-sm text-on-surface-variant'
          >
            <Link className='hover:text-primary' to='/customer/bookings'>
              {t('customer.payment.bookings')}
            </Link>
            {bookingId && bookingCode ? (
              <>
                <Icon className='text-base' name='chevron_right' />
                <Link className='hover:text-primary' to={`/customer/bookings/${bookingId}`}>
                  #{bookingCode}
                </Link>
              </>
            ) : null}
            <Icon className='text-base' name='chevron_right' />
            <span className='font-semibold text-primary'>{crumb}</span>
          </nav>
          <h1 className='mt-4 text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl'>{title}</h1>
          <p className='mt-3 max-w-2xl text-base leading-7 text-on-surface-variant'>{subtitle}</p>
        </div>
      </section>
      <div className='mx-auto w-full max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12'>{children}</div>
    </div>
  )
}

export const paymentPanel = 'rounded-2xl border border-outline-variant bg-white p-5 sm:p-7'
export const primaryAction =
  'group inline-flex min-h-13 items-center justify-center gap-3 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-on-primary transition-[transform,background-color] duration-300 hover:bg-primary-container active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-outline disabled:active:scale-100'
export const secondaryAction =
  'inline-flex min-h-13 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-secondary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export const paymentStatusTone: Record<PaymentStatus, string> = {
  PENDING: 'bg-warning-container text-on-warning-container',
  SUCCESS: 'bg-success-container text-on-success-container',
  FAILED: 'bg-error-container text-on-error-container',
  CANCELLED: 'bg-neutral-container text-on-neutral-container',
  EXPIRED: 'bg-neutral-container text-on-neutral-container'
}
