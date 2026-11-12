import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { FormAlert } from '~/shared/ui/form-alert'
import { FormField, Input } from '~/shared/ui/form-field'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import type { StrokeScreeningState } from '../hooks/use-stroke-screening'
import { strokeScreeningError } from '../stroke-screening-api'
import {
  AGE_MAX,
  AGE_MIN,
  BMI_MAX,
  BMI_MIN,
  CARDIO_FIELDS,
  HABIT_FIELDS,
  METABOLIC_FIELDS,
  TOTAL_ANSWERS,
  type FieldErrorKey,
  type Sex,
  type YesNoField
} from '../stroke-screening-form'
import { BmiHelper } from './bmi-helper'
import { AnswerPills, FormSection, YesNoQuestion } from './form-parts'

const key = 'customer.strokeScreening' as const
const SEXES: Sex[] = ['FEMALE', 'MALE']

/**
 * The nine answers in four cards (basic information, metabolic history, heart history, habits) and the action bar.
 * Errors sit under their input; a failed request is a `FormAlert` at the end of the form, with "Try again" only when
 * repeating can help.
 */
export function ScreeningForm({ state, onScreened }: { state: StrokeScreeningState; onScreened: () => void }) {
  const { t } = useTranslation()
  const { draft, errors, screening } = state
  const failure = screening.isError ? strokeScreeningError(screening.error) : null
  const sexLabelId = 'stroke-screening-sex-label'

  function message(error: FieldErrorKey | undefined) {
    if (!error) return undefined
    return t(
      `${key}.validation.${error}`,
      error === 'ageRange' ? { min: AGE_MIN, max: AGE_MAX } : { min: BMI_MIN, max: BMI_MAX }
    )
  }

  function question(field: YesNoField) {
    return (
      <YesNoQuestion
        error={message(errors[field])}
        hint={t(`${key}.fields.${field}.hint`)}
        key={field}
        label={t(`${key}.fields.${field}.label`)}
        noLabel={t(`${key}.answers.no`)}
        onChange={(value) => state.update(field, value)}
        value={draft[field]}
        yesLabel={t(`${key}.answers.yes`)}
      />
    )
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    state.submit(onScreened)
  }

  return (
    <form className='flex flex-col gap-5' noValidate onSubmit={submit}>
      <FormSection
        description={t(`${key}.sections.basic.description`)}
        icon='person'
        title={t(`${key}.sections.basic.title`)}
      >
        <div className='grid gap-5 sm:grid-cols-2'>
          <div className='space-y-1.5 sm:col-span-2'>
            <p className='text-sm font-semibold text-on-surface' id={sexLabelId}>
              {t(`${key}.fields.sex.label`)}
            </p>
            <AnswerPills
              className='sm:max-w-sm'
              invalid={Boolean(errors.sex)}
              labelledBy={sexLabelId}
              onChange={(value) => state.update('sex', value)}
              options={SEXES.map((sex) => ({ value: sex, label: t(`${key}.fields.sex.${sex}`) }))}
              value={draft.sex}
            />
            {errors.sex ? (
              <p className='text-xs font-medium text-error' role='alert'>
                {message(errors.sex)}
              </p>
            ) : null}
          </div>
          <FormField
            error={message(errors.age)}
            hint={t(`${key}.fields.age.hint`)}
            label={t(`${key}.fields.age.label`)}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete='off'
                inputMode='numeric'
                onBlur={() => state.touch('age')}
                onChange={(event) => state.update('age', event.target.value)}
                value={draft.age}
              />
            )}
          </FormField>
          <FormField
            error={message(errors.bmi)}
            hint={t(`${key}.fields.bmi.hint`)}
            label={t(`${key}.fields.bmi.label`)}
          >
            {(props) => (
              <Input
                {...props}
                autoComplete='off'
                inputMode='decimal'
                onBlur={() => state.touch('bmi')}
                onChange={(event) => state.update('bmi', event.target.value)}
                value={draft.bmi}
              />
            )}
          </FormField>
          <div className='sm:col-span-2'>
            <BmiHelper
              onApply={(bmi) => {
                state.update('bmi', bmi)
                state.touch('bmi')
              }}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        description={t(`${key}.sections.metabolic.description`)}
        icon='bloodtype'
        title={t(`${key}.sections.metabolic.title`)}
      >
        <div className='divide-y divide-outline-variant/70'>{METABOLIC_FIELDS.map(question)}</div>
      </FormSection>
      <FormSection
        description={t(`${key}.sections.cardio.description`)}
        icon='cardiology'
        title={t(`${key}.sections.cardio.title`)}
      >
        <div className='divide-y divide-outline-variant/70'>{CARDIO_FIELDS.map(question)}</div>
      </FormSection>
      <FormSection
        description={t(`${key}.sections.habits.description`)}
        icon='smoking_rooms'
        title={t(`${key}.sections.habits.title`)}
      >
        <div className='divide-y divide-outline-variant/70'>{HABIT_FIELDS.map(question)}</div>
      </FormSection>

      {failure ? (
        <FormAlert
          actionLabel={failure.retry ? t(`${key}.actions.retry`) : undefined}
          onAction={failure.retry ? () => state.submit(onScreened) : undefined}
          tone={failure.retry ? 'error' : 'warning'}
        >
          {t(failure.key)}
        </FormAlert>
      ) : null}

      <ActionBar state={state} />
    </form>
  )
}

function ActionBar({ state }: { state: StrokeScreeningState }) {
  const { t } = useTranslation()
  const progress = Math.round((state.answered / TOTAL_ANSWERS) * 100)
  const blocked = !state.request
  return (
    <div className='flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-[var(--shadow-card)] ring-1 ring-forest-900/[0.06] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5'>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-semibold text-forest-900 tabular-nums'>
          {t(`${key}.progress`, { answered: state.answered, total: TOTAL_ANSWERS })}
        </p>
        <div
          aria-hidden='true'
          className='mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-container-high'
        >
          <div
            className='h-full rounded-full bg-gradient-to-r from-mint-400 to-forest-600 transition-[width] duration-500'
            style={{ width: `${progress}%` }}
          />
        </div>
        {blocked ? (
          <p className='mt-2 text-xs text-on-surface-variant' id='stroke-screening-blocked'>
            {state.complete ? t(`${key}.errors.invalid`) : t(`${key}.incomplete`, { total: TOTAL_ANSWERS })}
          </p>
        ) : null}
      </div>
      <div className='flex flex-wrap gap-2'>
        <Button leftIcon={<Icon className='text-lg' name='restart_alt' />} onClick={state.reset} variant='outline'>
          {t(`${key}.actions.reset`)}
        </Button>
        <Button
          aria-describedby={blocked ? 'stroke-screening-blocked' : undefined}
          disabled={blocked}
          leftIcon={<Icon className='text-lg' name='monitor_heart' />}
          loading={state.screening.isPending}
          loadingLabel={t(`${key}.actions.submitting`)}
          type='submit'
          variant='dark'
        >
          {t(`${key}.actions.submit`)}
        </Button>
      </div>
    </div>
  )
}
