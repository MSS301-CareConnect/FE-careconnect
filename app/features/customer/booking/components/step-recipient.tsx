import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { careRecipientKeys, fetchCareRecipient } from '~/entities/care-recipient/care-recipient-api'
import { Avatar } from '~/shared/ui/avatar'
import { Button } from '~/shared/ui/button'
import { ChoiceCard } from '~/shared/ui/choice-card'
import { Icon } from '~/shared/ui/icon'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { EmptyState, ErrorState } from '~/shared/ui/state-panels'

import type { BookingForm } from '../hooks/use-booking-form'
import { RecipientQuickCreate } from './recipient-quick-create'
import { WizardSection } from './wizard-parts'

export function StepRecipient({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const [creating, setCreating] = useState(false)
  const { recipients } = form
  const items = recipients.data?.items ?? []

  return (
    <div className='flex flex-col gap-8'>
      <WizardSection
        aside={
          items.length > 0 ? (
            <Button
              leftIcon={<Icon className='text-lg' name='person_add' />}
              onClick={() => setCreating(true)}
              size='sm'
              variant='outline'
            >
              {t('customer.booking.recipient.add')}
            </Button>
          ) : null
        }
        description={t('customer.booking.recipient.description')}
        id='booking-recipient'
        title={t('customer.booking.recipient.title')}
      >
        {recipients.isPending ? (
          <SkeletonGroup className='grid gap-3 sm:grid-cols-2' label={t('customer.booking.recipient.loading')}>
            {[0, 1].map((index) => (
              <div className='flex items-center gap-3 rounded-xl border border-outline-variant p-4' key={index}>
                <Skeleton className='h-11 w-11 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-2/3 rounded' />
                  <Skeleton className='h-3 w-1/2 rounded' />
                </div>
              </div>
            ))}
          </SkeletonGroup>
        ) : null}
        {recipients.isError ? (
          <ErrorState message={t('customer.booking.recipient.error')} onRetry={() => void recipients.refetch()} />
        ) : null}
        {recipients.isSuccess && items.length === 0 ? (
          <EmptyState
            action={
              <Button leftIcon={<Icon className='text-lg' name='person_add' />} onClick={() => setCreating(true)}>
                {t('customer.booking.recipient.add')}
              </Button>
            }
            description={t('customer.booking.recipient.empty')}
            icon='family_restroom'
            title={t('customer.booking.recipient.emptyTitle')}
          />
        ) : null}
        {items.length > 0 ? (
          <fieldset>
            <legend className='sr-only'>{t('customer.booking.recipient.title')}</legend>
            <div className='cc-stagger grid gap-3 sm:grid-cols-2'>
              {items.map((patient) => (
                <ChoiceCard
                  checked={form.recipientId === patient.id}
                  key={patient.id}
                  name='recipient'
                  onChange={() => form.setRecipientId(patient.id)}
                  type='radio'
                  value={patient.id}
                >
                  <span className='flex items-center gap-3'>
                    <Avatar
                      className='h-11 w-11 rounded-full'
                      decorative
                      name={patient.fullName}
                      src={patient.avatarUrl}
                    />
                    <span className='min-w-0'>
                      <span className='block truncate font-semibold text-on-surface'>{patient.fullName}</span>
                      <span className='block truncate text-sm text-on-surface-variant'>
                        {[
                          patient.age !== undefined ? t('customer.booking.recipient.age', { age: patient.age }) : null,
                          patient.gender ? t(`customer.careRecipient.gender.${patient.gender}`) : null,
                          [patient.district, patient.province].filter(Boolean).join(', ') || null
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </fieldset>
        ) : null}
      </WizardSection>

      {form.recipientId ? <CareAddress recipientId={form.recipientId} /> : null}

      <RecipientQuickCreate
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          form.setRecipientId(id)
          setCreating(false)
        }}
        open={creating}
      />
    </div>
  )
}

/** The care address comes from the profile; the booking contract has no per-booking address, so it is edited there. */
function CareAddress({ recipientId }: { recipientId: string }) {
  const { t } = useTranslation()
  const detail = useQuery({
    queryKey: careRecipientKeys.detail(recipientId),
    queryFn: () => fetchCareRecipient(recipientId),
    retry: false
  })
  const profile = detail.data?.profile
  const address = profile
    ? [profile.addressLine, profile.ward, profile.district, profile.province].filter(Boolean).join(', ')
    : ''
  const missingHealth = profile ? !profile.allergies?.trim() && !profile.chronicConditions?.trim() : false
  const profileLink = `/customer/patient-profiles/${recipientId}`

  return (
    <section
      aria-labelledby='booking-address'
      className='cc-fade-up rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5'
    >
      <div className='flex items-start gap-3'>
        <span
          aria-hidden='true'
          className='grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-primary'
        >
          <Icon name='home_pin' />
        </span>
        <div className='min-w-0 flex-1'>
          <h2 className='font-semibold text-on-surface' id='booking-address'>
            {t('customer.booking.recipient.addressTitle')}
          </h2>
          {detail.isPending ? (
            <SkeletonGroup className='mt-2' label={t('customer.booking.recipient.addressLoading')}>
              <Skeleton className='h-4 w-3/4 rounded' />
            </SkeletonGroup>
          ) : address ? (
            <p className='mt-1 text-on-surface'>{address}</p>
          ) : (
            <p className='mt-1 text-sm text-warning'>{t('customer.booking.recipient.noAddress')}</p>
          )}
          <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.booking.recipient.addressHint')}</p>
          {missingHealth ? (
            <p className='mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-warning-container px-3 py-2 text-sm text-on-warning-container'>
              <Icon className='text-base' name='health_and_safety' />
              {t('customer.booking.recipient.incomplete')}
              <Link className='font-semibold underline underline-offset-2' to={profileLink}>
                {t('customer.booking.recipient.complete')}
              </Link>
            </p>
          ) : null}
        </div>
        <Link
          className='shrink-0 rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
          to={profileLink}
        >
          {t('customer.booking.recipient.editProfile')}
        </Link>
      </div>
    </section>
  )
}
