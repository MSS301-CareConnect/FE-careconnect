import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'
import { Modal } from '~/shared/ui/modal'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'

import type { BookingCaregiverOption } from '../hooks/use-booking-form'

/**
 * A short caregiver profile in a centred dialog without leaving the booking: identity and facts on the left, the
 * introduction on the right (one column on phones). The full profile opens in a new tab.
 */
export function CaregiverProfileDialog({
  caregiver,
  chosen,
  onChoose,
  onClose
}: {
  caregiver: BookingCaregiverOption | null
  chosen: boolean
  onChoose: (id: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Modal
      footer={
        caregiver ? (
          <>
            <Link
              className='mr-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
              rel='noreferrer'
              target='_blank'
              to={`/customer/caregivers/${caregiver.id}`}
            >
              {t('customer.booking.caregiver.fullProfile')}
              <Icon className='text-base' name='open_in_new' />
            </Link>
            <Button
              disabled={chosen}
              leftIcon={<Icon className='text-lg' name={chosen ? 'check' : 'how_to_reg'} />}
              onClick={() => onChoose(caregiver.id)}
            >
              {chosen ? t('customer.booking.caregiver.chosen') : t('customer.booking.caregiver.choose')}
            </Button>
          </>
        ) : null
      }
      onClose={onClose}
      open={caregiver !== null}
      size='xl'
      title={t('customer.booking.caregiver.profileTitle')}
    >
      {caregiver ? (
        <div className='grid gap-6 md:grid-cols-2'>
          <div className='flex flex-col gap-5 md:border-r md:border-outline-variant/40 md:pr-6'>
            <div className='flex items-center gap-4'>
              <Avatar
                className='h-20 w-20 rounded-full text-xl'
                name={caregiver.fullName}
                src={caregiver.avatarUrl}
                viewable
              />
              <div className='min-w-0'>
                <p className='text-lg font-semibold text-on-surface'>{caregiver.fullName}</p>
                <div className='mt-1 flex flex-wrap items-center gap-2'>
                  <Rating average={caregiver.ratingAverage} count={caregiver.ratingCount} />
                  {caregiver.verifiedCertificateCount ? <VerifiedBadge /> : null}
                </div>
              </div>
            </div>
            <ul className='flex flex-col gap-2.5 text-sm text-on-surface'>
              {caregiver.experienceYears !== undefined ? (
                <li className='flex items-center gap-2'>
                  <Icon className='text-lg text-on-surface-variant' name='work_history' />
                  {t('customer.booking.caregiver.experience', { count: caregiver.experienceYears })}
                </li>
              ) : null}
              {caregiver.verifiedCertificateCount ? (
                <li className='flex items-center gap-2'>
                  <Icon className='text-lg text-on-surface-variant' name='workspace_premium' />
                  {t('customer.booking.caregiver.certificates', { count: caregiver.verifiedCertificateCount })}
                </li>
              ) : null}
              {caregiver.centerName ? (
                <li className='flex items-center gap-2'>
                  <Icon className='text-lg text-on-surface-variant' name='home_health' />
                  {t('customer.booking.caregiver.centerName', { name: caregiver.centerName })}
                </li>
              ) : null}
            </ul>
          </div>
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold text-on-surface'>{t('customer.booking.caregiver.about')}</h3>
            <p className='mt-2 text-sm leading-6 whitespace-pre-line text-on-surface-variant'>
              {caregiver.bio?.trim() || t('customer.booking.caregiver.noBio')}
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
