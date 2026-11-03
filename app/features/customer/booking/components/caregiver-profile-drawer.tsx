import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { Drawer } from '~/shared/ui/drawer'
import { Icon } from '~/shared/ui/icon'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'

import type { BookingCaregiverOption } from '../hooks/use-booking-form'

/** A short caregiver profile without leaving the booking; the full profile opens in a new tab. */
export function CaregiverProfileDrawer({
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
    <Drawer
      footer={
        caregiver ? (
          <Button
            disabled={chosen}
            leftIcon={<Icon className='text-lg' name={chosen ? 'check' : 'how_to_reg'} />}
            onClick={() => onChoose(caregiver.id)}
          >
            {chosen ? t('customer.booking.caregiver.chosen') : t('customer.booking.caregiver.choose')}
          </Button>
        ) : null
      }
      onClose={onClose}
      open={caregiver !== null}
      title={t('customer.booking.caregiver.profileTitle')}
    >
      {caregiver ? (
        <div className='flex flex-col gap-5'>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16 rounded-full text-lg' name={caregiver.fullName} src={caregiver.avatarUrl} />
            <div className='min-w-0'>
              <p className='text-lg font-semibold text-on-surface'>{caregiver.fullName}</p>
              <div className='mt-1 flex flex-wrap items-center gap-2'>
                <Rating average={caregiver.ratingAverage} count={caregiver.ratingCount} />
                {caregiver.verifiedCertificateCount ? <VerifiedBadge /> : null}
              </div>
            </div>
          </div>
          <ul className='flex flex-col gap-2 text-sm text-on-surface'>
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
          <p className='text-sm leading-6 whitespace-pre-line text-on-surface-variant'>
            {caregiver.bio?.trim() || t('customer.booking.caregiver.noBio')}
          </p>
          <Link
            className='inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline'
            rel='noreferrer'
            target='_blank'
            to={`/customer/caregivers/${caregiver.id}`}
          >
            {t('customer.booking.caregiver.fullProfile')}
            <Icon className='text-base' name='open_in_new' />
          </Link>
        </div>
      ) : null}
    </Drawer>
  )
}
