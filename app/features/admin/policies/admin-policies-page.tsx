import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { allocationPreview, refundPreview, tierPreview } from './policies-preview'

const key = 'admin.policiesPage' as const
const card = 'rounded-xl bg-white p-5 shadow-sm'
const sections = ['deposit', 'commission', 'payout', 'risk'] as const

export function AdminPoliciesPage() {
  const { t, i18n } = useTranslation()
  const [deposit, setDeposit] = useState(30)
  const [cycle, setCycle] = useState<'weekly' | 'biweekly' | 'monthly'>('biweekly')
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]>('deposit')
  const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  const number = new Intl.NumberFormat(locale)
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })
  useDocumentTitle(t(`${key}.documentTitle`))
  function focusSection(section: (typeof sections)[number]) {
    setActiveSection(section)
    document.getElementById(`policy-${section}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }
  function changeDeposit(value: number) {
    if (Number.isFinite(value)) setDeposit(Math.min(50, Math.max(20, value)))
  }
  return (
    <div className='mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6'>
      <header className='flex flex-wrap items-start justify-between gap-5'>
        <div className='max-w-3xl'>
          <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{t(`${key}.title`)}</h1>
          <div className='mt-2 flex flex-wrap items-center gap-2 text-xs'>
            <span className='rounded-full bg-secondary-container px-3 py-1 font-semibold text-primary'>
              {t(`${key}.version`)}
            </span>
            <span className='font-semibold text-error'>{t(`${key}.sample`)}</span>
          </div>
          <p className='mt-3 text-sm leading-6 text-on-surface-variant'>{t(`${key}.intro`)}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            {t(`${key}.history`)}
          </button>
          <button
            className='rounded-lg bg-surface-container-low px-3 py-2 text-sm font-semibold text-primary'
            onClick={() => focusSection('deposit')}
            type='button'
          >
            {t(`${key}.simulate`)}
          </button>
          <button
            className='inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white opacity-50'
            disabled
            title={t(`${key}.unavailable`)}
            type='button'
          >
            <Icon name='save' />
            {t(`${key}.save`)}
          </button>
        </div>
      </header>
      <nav
        aria-label={t(`${key}.title`)}
        className='grid gap-2 rounded-xl bg-surface-container-low p-1.5 sm:grid-cols-2 xl:grid-cols-4'
      >
        {sections.map((section, index) => (
          <button
            aria-current={activeSection === section ? 'location' : undefined}
            className={`rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${activeSection === section ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:bg-white/60'}`}
            key={section}
            onClick={() => focusSection(section)}
            type='button'
          >
            {number.format(index + 1)}. {t(`${key}.tabs.${section}`)}
          </button>
        ))}
      </nav>
      <section className='scroll-mt-24 grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' id='policy-deposit'>
        <div className={card}>
          <div className='flex items-center gap-2'>
            <Icon className='text-2xl text-primary' name='savings' />
            <div>
              <h2 className='font-bold'>{t(`${key}.depositTitle`)}</h2>
              <p className='text-xs text-outline'>{t(`${key}.depositHint`)}</p>
            </div>
          </div>
          <div className='mt-5 rounded-xl bg-surface-container-low p-4'>
            <label
              className='flex items-center justify-between gap-3 text-sm font-semibold'
              htmlFor='admin-deposit-rate'
            >
              <span>{t(`${key}.depositRate`)}</span>
              <span className='text-xl font-bold text-primary'>{percent.format(deposit / 100)}</span>
            </label>
            <input
              aria-label={t(`${key}.depositRate`)}
              className='mt-4 w-full accent-primary'
              id='admin-deposit-rate'
              max={50}
              min={20}
              onChange={(event) => changeDeposit(Number(event.target.value))}
              type='range'
              value={deposit}
            />
            <p className='mt-2 text-xs text-outline'>{t(`${key}.depositRange`)}</p>
          </div>
          <div className='mt-4 rounded-lg border border-primary/20 bg-secondary-container/20 p-4'>
            <p className='text-xs text-on-surface-variant'>
              {t(`${key}.simulation`, { amount: money.format(1000000) })}
            </p>
            <p className='mt-1 text-lg font-bold text-primary'>
              {t(`${key}.simulationResult`, { amount: money.format((1000000 * deposit) / 100) })}
            </p>
            <p className='mt-2 text-xs text-outline'>{t(`${key}.draft`)}</p>
          </div>
          <h3 className='mt-5 text-sm font-bold'>{t(`${key}.shiftTypes`)}</h3>
          <div className='mt-3 space-y-2'>
            {(
              [
                ['short', 30],
                ['day', 35],
                ['liveIn', 50]
              ] as const
            ).map(([shift, rate]) => (
              <div className='flex justify-between gap-3 rounded-lg bg-surface-container-low p-3 text-sm' key={shift}>
                <div>
                  <strong>{t(`${key}.shifts.${shift}`)}</strong>
                  <p className='mt-1 text-xs text-outline'>{t(`${key}.shiftHints.${shift}`)}</p>
                </div>
                <span className='font-bold text-primary'>{percent.format(rate / 100)}</span>
              </div>
            ))}
          </div>
          <div className='mt-4 rounded-lg bg-primary/5 p-4'>
            <h3 className='text-sm font-bold text-primary'>{t(`${key}.escrowTitle`)}</h3>
            <p className='mt-2 text-xs leading-5 text-on-surface-variant'>{t(`${key}.escrowHint`)}</p>
          </div>
        </div>
        <div className={card}>
          <div className='flex items-center gap-2'>
            <Icon className='text-2xl text-primary' name='event_busy' />
            <div>
              <h2 className='font-bold'>{t(`${key}.refundTitle`)}</h2>
              <p className='text-xs text-outline'>{t(`${key}.refundHint`)}</p>
            </div>
          </div>
          <div className='mt-5 flex items-center justify-between rounded-lg bg-surface-container-low p-3 text-sm'>
            <span>{t(`${key}.autoRefund`)}</span>
            <button
              aria-checked='true'
              className='h-6 w-11 cursor-not-allowed rounded-full bg-primary/50 p-0.5'
              disabled
              role='switch'
              title={t(`${key}.unavailable`)}
              type='button'
            >
              <span className='ml-auto block h-5 w-5 rounded-full bg-white' />
            </button>
          </div>
          <ol className='mt-5 space-y-3'>
            {refundPreview.map((rule, index) => (
              <li className='flex gap-3 rounded-lg border border-outline-variant/25 p-3' key={rule.key}>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-primary'>
                  {index + 1}
                </span>
                <div className='flex-1'>
                  <div className='flex justify-between gap-2 text-sm'>
                    <strong>{t(`${key}.refundSteps.${rule.key}`)}</strong>
                    <strong className='text-primary'>{t(`${key}.refundAmount`, { value: rule.percent })}</strong>
                  </div>
                  <p className='mt-1 text-xs leading-5 text-outline'>{t(`${key}.refundDescriptions.${rule.key}`)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className='mt-4 rounded-lg bg-surface-container-low p-4'>
            <h3 className='text-sm font-bold'>{t(`${key}.forceMajeure`)}</h3>
            <p className='mt-1 text-xs leading-5 text-on-surface-variant'>{t(`${key}.forceMajeureHint`)}</p>
          </div>
        </div>
      </section>
      <section className={`${card} scroll-mt-24`} id='policy-commission'>
        <div className='flex items-center gap-2'>
          <Icon className='text-2xl text-primary' name='donut_large' />
          <div>
            <h2 className='font-bold'>{t(`${key}.commissionTitle`)}</h2>
            <p className='text-xs text-outline'>{t(`${key}.commissionHint`)}</p>
          </div>
        </div>
        <div className='mt-5 grid items-center gap-6 md:grid-cols-[220px_1fr]'>
          <div className='mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-[conic-gradient(#006b2c_0_70%,#68dba9_70%_85%,#d9e3f6_85%_100%)]'>
            <div className='flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white'>
              <strong className='text-xl text-primary'>{percent.format(0.7)}</strong>
              <span className='text-xs text-outline'>{t(`${key}.split.caregiver`)}</span>
            </div>
          </div>
          <div className='space-y-3'>
            {allocationPreview.map((part) => (
              <div
                className='flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3 text-sm'
                key={part.key}
              >
                <span className='flex items-center gap-2'>
                  <span className={`h-3 w-3 rounded-full ${part.color}`} />
                  {t(`${key}.split.${part.key}`)}
                </span>
                <strong className='text-primary'>{percent.format(part.percent / 100)}</strong>
              </div>
            ))}
          </div>
        </div>
        <h3 className='mt-7 text-sm font-bold'>{t(`${key}.tierTitle`)}</h3>
        <div className='mt-3 grid gap-3 md:grid-cols-3'>
          {tierPreview.map((tier) => (
            <div className='rounded-lg border border-outline-variant/30 p-4' key={tier.key}>
              <Icon className='text-2xl text-primary' name={tier.icon} />
              <h4 className='mt-2 font-bold'>{t(`${key}.tiers.${tier.key}`)}</h4>
              <p className='mt-2 text-xs leading-5 text-outline'>{t(`${key}.tierHints.${tier.key}`)}</p>
              <p className='mt-3 text-xs'>
                {t(`${key}.tierFee`)}:{' '}
                <strong className='text-lg text-primary'>{percent.format(tier.fee / 100)}</strong>
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className='scroll-mt-24 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]' id='policy-payout'>
        <div className={card}>
          <div className='flex items-center gap-2'>
            <Icon className='text-2xl text-primary' name='point_of_sale' />
            <div>
              <h2 className='font-bold'>{t(`${key}.payoutTitle`)}</h2>
              <p className='text-xs text-outline'>{t(`${key}.payoutHint`)}</p>
            </div>
          </div>
          <fieldset className='mt-5'>
            <legend className='text-sm font-semibold'>{t(`${key}.cycle`)}</legend>
            <div className='mt-3 grid gap-3 sm:grid-cols-3'>
              {(['weekly', 'biweekly', 'monthly'] as const).map((item) => (
                <label
                  className={`cursor-pointer rounded-lg border p-3 ${cycle === item ? 'border-primary bg-secondary-container/25' : 'border-outline-variant/30'}`}
                  key={item}
                >
                  <input
                    checked={cycle === item}
                    className='accent-primary'
                    name='admin-payout-cycle'
                    onChange={() => setCycle(item)}
                    type='radio'
                    value={item}
                  />
                  <strong className='ml-2 text-sm'>{t(`${key}.cycles.${item}`)}</strong>
                  <span className='mt-2 block text-xs leading-5 text-outline'>{t(`${key}.cycleHints.${item}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <dl className='mt-5 grid gap-3 sm:grid-cols-2'>
            <div className='rounded-lg bg-surface-container-low p-3'>
              <dt className='text-xs text-outline'>{t(`${key}.cutoff`)}</dt>
              <dd className='mt-1 text-sm font-semibold'>{t(`${key}.cutoffValue`)}</dd>
            </div>
            <div className='rounded-lg bg-surface-container-low p-3'>
              <dt className='text-xs text-outline'>{t(`${key}.minimum`)}</dt>
              <dd className='mt-1 text-sm font-semibold'>{money.format(2000000)}</dd>
            </div>
          </dl>
          <p className='mt-4 text-xs text-outline'>{t(`${key}.draft`)}</p>
        </div>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.riskTitle`)}</h2>
          <Icon className='my-5 text-5xl text-primary' name='security' />
          <p className='text-sm leading-6 text-on-surface-variant'>{t(`${key}.riskHint`)}</p>
        </div>
      </section>
      <section className='scroll-mt-24 grid gap-4 md:grid-cols-2' id='policy-risk'>
        <div className={card}>
          <h2 className='font-bold'>{t(`${key}.gatewayTitle`)}</h2>
          <p className='mt-2 text-sm text-on-surface-variant'>{t(`${key}.gatewayHint`)}</p>
        </div>
        <aside className='rounded-xl bg-secondary-container/20 p-5'>
          <h2 className='font-bold text-primary'>{t(`${key}.legalTitle`)}</h2>
          <p className='mt-2 text-sm leading-6 text-on-surface-variant'>{t(`${key}.legalHint`)}</p>
        </aside>
      </section>
    </div>
  )
}
