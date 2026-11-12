import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { bentoCard, forestBlock, softChip } from '~/features/customer/ui/bento-styles'
import type { StrokeScreeningRequest, StrokeScreeningResult } from '~/shared/api/generated/contracts'
import { Button } from '~/shared/ui/button'
import { Icon } from '~/shared/ui/icon'

import type { StrokeScreeningState } from '../hooks/use-stroke-screening'
import { YES_NO_FIELDS } from '../stroke-screening-form'

const key = 'customer.strokeScreening' as const

/** The right column: how it works before the first screening, "analysing" while it runs, then the result. */
export function ScreeningResultPanel({ state, onEdit }: { state: StrokeScreeningState; onEdit: () => void }) {
  const { t } = useTranslation()
  if (state.screening.isPending) {
    return (
      <div className={`${bentoCard} flex flex-col items-center gap-4 px-6 py-14 text-center`} role='status'>
        <span className='grid size-14 place-items-center rounded-full bg-mint-100 text-forest-800'>
          <Icon className='animate-spin text-3xl' name='progress_activity' />
        </span>
        <p className='text-sm font-semibold text-forest-900'>{t(`${key}.loading`)}</p>
      </div>
    )
  }
  if (state.result && state.submitted) {
    return (
      <ResultCard
        onEdit={onEdit}
        profile={state.prefill}
        request={state.submitted}
        result={state.result}
        stale={state.stale}
      />
    )
  }
  return <IdleCard />
}

function IdleCard() {
  const { t } = useTranslation()
  const steps = [
    { icon: 'checklist', text: t(`${key}.idle.steps.answer`) },
    { icon: 'query_stats', text: t(`${key}.idle.steps.compare`) },
    { icon: 'stethoscope', text: t(`${key}.idle.steps.read`) }
  ]
  return (
    <div className={`${forestBlock} relative isolate overflow-hidden p-6 sm:p-7`}>
      <span
        aria-hidden='true'
        className='absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-mint-400/25 blur-3xl'
      />
      <p className='text-xs font-bold tracking-wide text-mint-200 uppercase'>{t(`${key}.idle.eyebrow`)}</p>
      <h2 className='mt-1 text-xl font-bold tracking-tight'>{t(`${key}.idle.title`)}</h2>
      <ol className='mt-5 space-y-4'>
        {steps.map((step, index) => (
          <li className='flex items-start gap-3' key={step.icon}>
            <span className='grid size-9 shrink-0 place-items-center rounded-2xl bg-white/10 text-mint-200 ring-1 ring-white/15'>
              <Icon className='text-lg' name={step.icon} />
            </span>
            <p className='pt-1.5 text-sm leading-6 text-white/85'>
              <span className='mr-1.5 font-bold text-white tabular-nums'>{index + 1}.</span>
              {step.text}
            </p>
          </li>
        ))}
      </ol>
      <p className='mt-6 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-white/70'>
        <Icon className='mt-px text-base' name='lock' />
        {t(`${key}.idle.note`)}
      </p>
    </div>
  )
}

function ResultCard({
  result,
  request,
  stale,
  profile,
  onEdit
}: {
  result: StrokeScreeningResult
  request: StrokeScreeningRequest
  stale: boolean
  profile: StrokeScreeningState['prefill']
  onEdit: () => void
}) {
  const { t, i18n } = useTranslation()
  // Anything but the lower pattern reads as "assess further": the cautious reading of an unexpected value.
  const outcome =
    result.screeningResult === 'LOWER_SCREENING_PATTERN' ? 'LOWER_SCREENING_PATTERN' : 'NEEDS_FURTHER_ASSESSMENT'
  const needs = outcome === 'NEEDS_FURTHER_ASSESSMENT'
  const score = Math.min(1, Math.max(0, result.modelScore))
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 0 }).format(score)
  const decimal = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 1 })
  const factors = YES_NO_FIELDS.filter((field) => field !== 'currentSmoker' && request[field]).length
  const summary = [
    t(`${key}.fields.sex.${request.sex}`),
    t(`${key}.result.summary.age`, { age: request.age }),
    t(`${key}.result.summary.bmi`, { bmi: decimal.format(request.bmi) }),
    t(`${key}.result.summary.factors`, { yes: factors, total: YES_NO_FIELDS.length - 1 }),
    ...(request.currentSmoker ? [t(`${key}.result.summary.smoker`)] : [])
  ]

  return (
    <div className='cc-fade-up flex flex-col gap-4'>
      <section aria-labelledby='stroke-result-title' className={`${bentoCard} overflow-hidden`}>
        <p className='sr-only' role='status'>
          {t(`${key}.result.announce`)}
        </p>
        <div className={`p-6 sm:p-7 ${needs ? 'bg-peach-50' : 'bg-mint-50'}`}>
          <div className='flex items-start gap-4'>
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${needs ? 'bg-peach-300 text-forest-950' : 'bg-forest-900 text-mint-200'}`}
            >
              <Icon className='text-2xl' filled name={needs ? 'clinical_notes' : 'health_and_safety'} />
            </span>
            <div className='min-w-0'>
              <p
                className={`text-xs font-bold tracking-wide uppercase ${needs ? 'text-peach-700' : 'text-forest-700'}`}
              >
                {t(`${key}.result.eyebrow`)}
              </p>
              <h2 className='mt-0.5 text-xl font-bold tracking-tight text-forest-950' id='stroke-result-title'>
                {t(`${key}.result.${outcome}.title`)}
              </h2>
              <p className='mt-1 text-sm leading-6 text-on-surface'>{t(`${key}.result.${outcome}.lead`)}</p>
            </div>
          </div>

          <div className='mt-5'>
            <div className='flex items-baseline justify-between gap-3'>
              <p className='text-sm font-semibold text-forest-900'>{t(`${key}.result.score.label`)}</p>
              <p className='text-2xl font-extrabold text-forest-950 tabular-nums'>{percent}</p>
            </div>
            <div
              aria-label={t(`${key}.result.score.label`)}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={Math.round(score * 100)}
              aria-valuetext={percent}
              className='mt-2 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-forest-900/5'
              role='meter'
            >
              <div
                className={`h-full rounded-full transition-[width] duration-700 ${needs ? 'bg-gradient-to-r from-peach-200 to-peach-400' : 'bg-gradient-to-r from-mint-300 to-forest-600'}`}
                style={{ width: `${Math.round(score * 100)}%` }}
              />
            </div>
            <p className='mt-1.5 text-xs text-on-surface-variant'>{t(`${key}.result.score.caption`)}</p>
          </div>
        </div>

        <div className='space-y-5 p-6 sm:p-7'>
          {stale ? (
            <p className='flex items-start gap-2 rounded-2xl bg-warning-container px-4 py-3 text-sm text-on-warning-container'>
              <Icon className='mt-px text-lg' name='history' />
              {t(`${key}.result.stale`)}
            </p>
          ) : null}
          <div>
            <h3 className='text-sm font-bold text-forest-950'>{t(`${key}.result.recommendation`)}</h3>
            <p className='mt-1 text-sm leading-6 text-on-surface' lang='vi'>
              {result.recommendation}
            </p>
          </div>
          <div>
            <h3 className='text-sm font-bold text-forest-950'>{t(`${key}.result.nextSteps`)}</h3>
            <ul className='mt-2 space-y-2'>
              {(['first', 'second', 'third'] as const).map((step) => (
                <li className='flex items-start gap-2 text-sm leading-6 text-on-surface' key={step}>
                  <Icon className='mt-1 text-base text-forest-700' name='arrow_right_alt' />
                  {t(`${key}.result.steps.${outcome}.${step}`)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className='text-xs font-bold tracking-wide text-on-surface-variant uppercase'>
              {t(`${key}.result.basedOn`)}
            </h3>
            <ul className='mt-2 flex flex-wrap gap-1.5'>
              {summary.map((item) => (
                <li className={softChip} key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col'>
            <Button leftIcon={<Icon className='text-lg' name='edit_note' />} onClick={onEdit} variant='outline'>
              {t(`${key}.actions.edit`)}
            </Button>
            {profile ? (
              <Link
                className='inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-forest-800 hover:bg-mint-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
                to={`/customer/patient-profiles/${profile.id}?tab=medical`}
              >
                <Icon className='text-lg' name='folder_shared' />
                {t(`${key}.actions.openProfile`, { name: profile.name })}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <aside
        aria-label={t(`${key}.result.disclaimer`)}
        className='flex items-start gap-3 rounded-3xl border border-outline-variant bg-surface-container-lowest px-5 py-4'
      >
        <Icon className='mt-0.5 text-xl text-forest-700' name='info' />
        <div className='min-w-0 text-sm'>
          <p className='font-semibold text-forest-950'>{t(`${key}.result.disclaimer`)}</p>
          <p className='mt-0.5 leading-6 text-on-surface-variant' lang='vi'>
            {result.disclaimer}
          </p>
        </div>
      </aside>
    </div>
  )
}
