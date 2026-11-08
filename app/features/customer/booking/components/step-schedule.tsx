import { useTranslation } from 'react-i18next'

import type { BookingType } from '~/shared/api/generated/contracts'
import { useFormat } from '~/shared/lib/format'
import { Button } from '~/shared/ui/button'
import { ChoiceCard } from '~/shared/ui/choice-card'
import { Icon } from '~/shared/ui/icon'
import { Textarea } from '~/shared/ui/form-field'

import type { BookingForm } from '../hooks/use-booking-form'
import { ScheduleCustom } from './schedule-custom'
import { ScheduleRecurring } from './schedule-recurring'
import { ScheduleShift } from './schedule-shift'
import { WizardSection } from './wizard-parts'

const TYPES: { type: BookingType; icon: string }[] = [
  { type: 'SHIFT', icon: 'schedule' },
  { type: 'RECURRING', icon: 'event_repeat' },
  { type: 'CUSTOM', icon: 'edit_calendar' }
]
const NOTE_MAX = 2000

export function StepSchedule({ form }: { form: BookingForm }) {
  const { t } = useTranslation()
  const format = useFormat()
  const { schedule } = form
  const deposit = form.policy.data?.depositPercent

  return (
    <div className='flex flex-col gap-10'>
      <WizardSection
        description={t('customer.booking.schedule.description')}
        id='booking-schedule-type'
        title={t('customer.booking.schedule.typeLegend')}
      >
        <fieldset>
          <legend className='sr-only'>{t('customer.booking.schedule.typeLegend')}</legend>
          <div className='grid gap-3 md:grid-cols-3'>
            {TYPES.map(({ type, icon }) => {
              const blocked = type === 'SHIFT' && !form.selectedCaregiverId
              return (
                <ChoiceCard
                  checked={schedule.bookingType === type}
                  disabled={blocked}
                  disabledReason={t('customer.booking.schedule.shiftNeedsCaregiver')}
                  footer={
                    blocked ? (
                      <div className='px-4 pb-4'>
                        <Button onClick={() => form.goTo(2)} size='sm' variant='outline'>
                          {t('customer.booking.schedule.chooseCaregiver')}
                        </Button>
                      </div>
                    ) : null
                  }
                  key={type}
                  name='bookingType'
                  onChange={() => form.updateSchedule({ bookingType: type })}
                  type='radio'
                >
                  <span
                    aria-hidden='true'
                    className='mb-2 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-primary'
                  >
                    <Icon name={icon} />
                  </span>
                  <span className='block font-semibold text-on-surface'>
                    {t(`customer.booking.schedule.types.${type}.title`)}
                  </span>
                  <span className='mt-0.5 block text-sm text-on-surface-variant'>
                    {t(`customer.booking.schedule.types.${type}.description`)}
                  </span>
                  <span className='mt-3 flex flex-col items-start gap-1.5 text-xs'>
                    <span className='inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2 py-1 text-on-surface-variant'>
                      <Icon className='text-sm' name='hourglass_top' />
                      {t('customer.booking.schedule.notice', { duration: format.duration(form.noticeMinutes[type]) })}
                    </span>
                    <span className='inline-flex items-center gap-1 rounded-full bg-surface-container-low px-2 py-1 text-on-surface-variant'>
                      <Icon className='text-sm' name='payments' />
                      {deposit !== undefined
                        ? t('customer.booking.schedule.payDeposit', { percent: deposit })
                        : t('customer.booking.schedule.payDepositGeneric')}
                    </span>
                  </span>
                </ChoiceCard>
              )
            })}
          </div>
        </fieldset>
      </WizardSection>

      <div className='cc-fade-up' key={schedule.bookingType}>
        {schedule.bookingType === 'SHIFT' ? <ScheduleShift form={form} /> : null}
        {schedule.bookingType === 'RECURRING' ? <ScheduleRecurring form={form} /> : null}
        {schedule.bookingType === 'CUSTOM' ? <ScheduleCustom form={form} /> : null}
        <p className='mt-3 flex items-center gap-1.5 text-xs text-on-surface-variant'>
          <Icon className='text-sm' name='public' />
          {t('customer.booking.schedule.timezone')}
        </p>
      </div>

      <div>
        <label className='block text-sm font-semibold text-on-surface' htmlFor='booking-note'>
          {t('customer.booking.schedule.note')}
        </label>
        <Textarea
          aria-describedby='booking-note-count'
          className='mt-1.5'
          id='booking-note'
          maxLength={NOTE_MAX}
          onChange={(event) => form.setCustomerNote(event.target.value)}
          placeholder={t('customer.booking.schedule.notePlaceholder')}
          rows={3}
          value={form.customerNote}
        />
        <p className='mt-1 text-right text-xs text-on-surface-variant tabular-nums' id='booking-note-count'>
          {t('common.kit.characters', { count: form.customerNote.length, max: NOTE_MAX })}
        </p>
      </div>
    </div>
  )
}
