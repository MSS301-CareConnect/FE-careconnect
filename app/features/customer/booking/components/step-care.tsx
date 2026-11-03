import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { serviceCategoryGroup } from '~/entities/care-catalog/service-category'
import type { CenterOfferingRecord, PricePlanRecord } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Avatar } from '~/shared/ui/avatar'
import { ChoiceCard } from '~/shared/ui/choice-card'
import { Icon } from '~/shared/ui/icon'
import { Rating, VerifiedBadge } from '~/shared/ui/rating'
import { Skeleton, SkeletonGroup } from '~/shared/ui/skeleton'
import { ErrorState } from '~/shared/ui/state-panels'

import { MAX_SERVICES, type BookingCaregiverOption, type BookingForm } from '../hooks/use-booking-form'
import { CaregiverProfileDrawer } from './caregiver-profile-drawer'
import { WizardSection } from './wizard-parts'

export function StepCare({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const count = Object.keys(form.services).length

  return (
    <div className='flex flex-col gap-10'>
      {form.centers.length > 1 ? (
        <WizardSection
          description={t('customer.booking.center.description')}
          id='booking-center'
          title={t('customer.booking.center.title')}
        >
          <fieldset>
            <legend className='sr-only'>{t('customer.booking.center.title')}</legend>
            <div className='grid gap-3 sm:grid-cols-2'>
              {form.centers.map((center) => (
                <ChoiceCard
                  checked={form.centerId === center.id}
                  key={center.id}
                  name='center'
                  onChange={() => form.selectCenter(center.id)}
                  type='radio'
                >
                  <span className='flex items-center gap-2 font-semibold text-on-surface'>
                    <Icon className='text-xl text-primary' name='home_health' />
                    {center.name}
                  </span>
                </ChoiceCard>
              ))}
            </div>
          </fieldset>
        </WizardSection>
      ) : null}

      <WizardSection
        aside={
          <span
            aria-live='polite'
            className='rounded-full bg-surface-container-low px-3 py-1 text-sm font-medium text-on-surface-variant tabular-nums'
          >
            {t('customer.booking.services.counter', { count, max: MAX_SERVICES })}
          </span>
        }
        description={t('customer.booking.services.description')}
        id='booking-services'
        title={t('customer.booking.services.title')}
      >
        <ServiceList form={form} />
      </WizardSection>

      <CaregiverList form={form} />
    </div>
  )
}

function ServiceList({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const { offerings } = form
  const count = Object.keys(form.services).length

  if (!form.centerId) return null
  if (offerings.isPending)
    return (
      <SkeletonGroup className='grid gap-3' label={t('customer.booking.services.loading')}>
        {[0, 1, 2].map((index) => (
          <div className='space-y-2 rounded-xl border border-outline-variant p-4' key={index}>
            <Skeleton className='h-4 w-1/3 rounded' />
            <Skeleton className='h-3 w-2/3 rounded' />
            <Skeleton className='h-3 w-1/4 rounded' />
          </div>
        ))}
      </SkeletonGroup>
    )
  if (offerings.isError)
    return <ErrorState message={t('customer.booking.services.error')} onRetry={() => void offerings.refetch()} />
  if (offerings.data.length === 0)
    return (
      <p className='rounded-xl bg-surface-container-low p-4 text-sm text-on-surface-variant'>
        {t('customer.booking.services.empty')}
      </p>
    )

  return (
    <fieldset>
      <legend className='sr-only'>{t('customer.booking.services.title')}</legend>
      <div className='cc-stagger grid gap-3'>
        {offerings.data.map((offering) => {
          const selection = form.services[offering.id]
          const full = !selection && count >= MAX_SERVICES
          return (
            <ServiceCard
              disabled={full}
              key={offering.id}
              offering={offering}
              onChoosePlan={(planId) => form.choosePlan(offering.id, offering.catalogItem.id, planId)}
              onToggle={() => form.toggleService(offering.id, offering.catalogItem.id)}
              plans={form.plansByOffering[offering.id]}
              selectedPlan={selection?.pricePlanId}
              selected={Boolean(selection)}
            />
          )
        })}
      </div>
    </fieldset>
  )
}

function PlanText({ plan }: { plan: PricePlanRecord }) {
  const { t } = useTranslation()
  const format = useFormat()
  return (
    <>
      <span className='font-semibold text-on-surface tabular-nums'>
        {t('customer.booking.services.price', {
          price: format.money(plan.basePrice),
          unit: t(`customer.booking.priceUnit.${plan.pricingUnit}`)
        })}
      </span>
      {plan.durationMinutes ? (
        <span className='text-on-surface-variant'>
          {' · '}
          {t('customer.booking.services.minimum', { duration: format.duration(plan.durationMinutes) })}
        </span>
      ) : null}
    </>
  )
}

function ServiceCard({
  offering,
  plans,
  selected,
  selectedPlan,
  disabled,
  onToggle,
  onChoosePlan
}: {
  offering: CenterOfferingRecord
  plans?: { pending: boolean; error: boolean; plans: PricePlanRecord[] }
  selected: boolean
  selectedPlan?: string
  disabled: boolean
  onToggle: () => void
  onChoosePlan: (planId: string) => void
}) {
  const { t } = useTranslation()
  const group = serviceCategoryGroup(offering.catalogItem.category)
  const description = offering.description || offering.catalogItem.description
  const list = plans?.plans ?? []
  const many = list.length > 1

  return (
    <ChoiceCard
      checked={selected}
      disabled={disabled}
      disabledReason={t('customer.booking.services.limitReached', { max: MAX_SERVICES })}
      footer={
        many ? (
          <div className='cc-collapse' data-open={selected}>
            <div>
              <fieldset className='border-t border-brand-100 px-4 pt-3 pb-4'>
                <legend className='sr-only'>
                  {t('customer.booking.services.planLegend', { name: offering.catalogItem.name })}
                </legend>
                <p aria-hidden='true' className='mb-2 text-xs font-medium text-on-surface-variant'>
                  {t('customer.booking.services.choosePlan')}
                </p>
                <div className='grid gap-2 sm:grid-cols-2'>
                  {list.map((plan) => (
                    <label
                      className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary ${selectedPlan === plan.id ? 'border-primary bg-surface-container-lowest' : 'border-outline-variant bg-surface-container-lowest/70 hover:border-brand-300'}`}
                      key={plan.id}
                    >
                      <input
                        checked={selectedPlan === plan.id}
                        className='mt-0.5 h-4 w-4 accent-primary'
                        disabled={!selected}
                        name={`plan-${offering.id}`}
                        onChange={() => onChoosePlan(plan.id)}
                        type='radio'
                      />
                      <span>
                        <span className='block font-medium text-on-surface'>{plan.planName}</span>
                        <PlanText plan={plan} />
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        ) : null
      }
      onChange={onToggle}
      type='checkbox'
    >
      <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        <span className='font-semibold text-on-surface'>{offering.catalogItem.name}</span>
        <span className='rounded-full bg-surface-container-low px-2 py-0.5 text-xs font-medium text-on-surface-variant'>
          {t(`common.serviceCategories.${group}`)}
        </span>
      </span>
      {description ? (
        <span className='mt-1 line-clamp-2 block text-sm leading-6 text-on-surface-variant'>{description}</span>
      ) : null}
      <span className='mt-2 block text-sm'>
        {plans?.pending ? (
          <Skeleton className='h-4 w-40 rounded' />
        ) : plans?.error ? (
          <span className='text-error'>{t('customer.booking.services.plansError')}</span>
        ) : list.length === 0 ? (
          <span className='text-on-surface-variant'>{t('customer.booking.services.plansEmpty')}</span>
        ) : many ? (
          <span className='text-on-surface-variant'>
            <PlanText plan={[...list].sort((a, b) => a.basePrice - b.basePrice)[0]} />
          </span>
        ) : (
          <PlanText plan={list[0]} />
        )}
      </span>
    </ChoiceCard>
  )
}

function CaregiverList({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<BookingCaregiverOption | null>(null)
  const { caregivers } = form.providers
  const hasServices = Object.keys(form.services).length > 0

  return (
    <WizardSection
      description={hasServices ? t('customer.booking.caregiver.description') : undefined}
      id='booking-caregiver'
      title={t('customer.booking.caregiver.title')}
    >
      {!hasServices ? (
        <div className='flex items-center gap-3 rounded-xl border border-dashed border-outline-variant p-5 text-sm'>
          <span aria-hidden='true' className='grid h-10 w-10 place-items-center rounded-full bg-surface-container-low'>
            <Icon className='text-on-surface-variant' name='person_search' />
          </span>
          <span>
            <span className='block font-semibold text-on-surface'>{t('customer.booking.caregiver.emptyTitle')}</span>
            <span className='text-on-surface-variant'>{t('customer.booking.caregiver.emptyDescription')}</span>
          </span>
        </div>
      ) : caregivers.isPending ? (
        <SkeletonGroup className='grid gap-3 sm:grid-cols-2' label={t('customer.booking.caregiver.loading')}>
          {[0, 1, 2, 3].map((index) => (
            <div className='flex items-center gap-3 rounded-xl border border-outline-variant p-4' key={index}>
              <Skeleton className='h-12 w-12 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-1/2 rounded' />
                <Skeleton className='h-3 w-2/3 rounded' />
              </div>
            </div>
          ))}
        </SkeletonGroup>
      ) : caregivers.isError ? (
        <ErrorState message={t('customer.booking.caregiver.error')} onRetry={() => void caregivers.refetch()} />
      ) : (
        <fieldset className='cc-fade-up'>
          <legend className='sr-only'>{t('customer.booking.caregiver.title')}</legend>
          <div className='cc-stagger grid gap-3 sm:grid-cols-2'>
            <ChoiceCard
              checked={form.selectedCaregiverId === ''}
              name='caregiver'
              onChange={() => form.selectCaregiver('')}
              type='radio'
            >
              <span className='flex items-start gap-3'>
                <span
                  aria-hidden='true'
                  className='grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-primary'
                >
                  <Icon className='text-2xl' name='diversity_1' />
                </span>
                <span className='min-w-0'>
                  <span className='flex flex-wrap items-center gap-2'>
                    <span className='font-semibold text-on-surface'>{t('customer.booking.caregiver.letCenter')}</span>
                    <span className='rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary'>
                      {t('customer.booking.caregiver.recommended')}
                    </span>
                  </span>
                  <span className='mt-0.5 block text-sm text-on-surface-variant'>
                    {t('customer.booking.caregiver.letCenterHint')}
                  </span>
                </span>
              </span>
            </ChoiceCard>
            {form.centerCaregivers.map((caregiver) => (
              <ChoiceCard
                checked={form.selectedCaregiverId === caregiver.id}
                footer={
                  <div className='flex justify-end px-3 pb-2'>
                    <button
                      className='rounded-lg px-2 py-1.5 text-sm font-medium text-primary hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-primary'
                      onClick={() => setProfile(caregiver)}
                      type='button'
                    >
                      {t('customer.booking.caregiver.viewProfile')}
                    </button>
                  </div>
                }
                key={caregiver.id}
                name='caregiver'
                onChange={() => form.selectCaregiver(caregiver.id)}
                type='radio'
              >
                <span className='flex items-start gap-3'>
                  <Avatar
                    className='h-12 w-12 rounded-full'
                    decorative
                    name={caregiver.fullName}
                    src={caregiver.avatarUrl}
                  />
                  <span className='min-w-0'>
                    <span className='block truncate font-semibold text-on-surface'>{caregiver.fullName}</span>
                    <span className='mt-1 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant'>
                      {caregiver.experienceYears !== undefined ? (
                        <span>{t('customer.booking.caregiver.experience', { count: caregiver.experienceYears })}</span>
                      ) : null}
                      <Rating average={caregiver.ratingAverage} count={caregiver.ratingCount} />
                      {caregiver.verifiedCertificateCount ? <VerifiedBadge /> : null}
                    </span>
                  </span>
                </span>
              </ChoiceCard>
            ))}
          </div>
          {caregivers.isSuccess && form.centerCaregivers.length === 0 ? (
            <p className='mt-3 text-sm text-on-surface-variant'>{t('customer.booking.caregiver.empty')}</p>
          ) : null}
        </fieldset>
      )}
      <CaregiverProfileDrawer
        caregiver={profile}
        chosen={profile?.id === form.selectedCaregiverId}
        onChoose={(id) => {
          form.selectCaregiver(id)
          setProfile(null)
        }}
        onClose={() => setProfile(null)}
      />
    </WizardSection>
  )
}
