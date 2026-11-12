import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { CustomerPageHeader } from '~/features/customer/ui/customer-page-header'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { pageContainer } from '~/shared/ui/page-header'

import { RecipientPicker } from './components/recipient-picker'
import { ScreeningForm } from './components/screening-form'
import { ScreeningResultPanel } from './components/screening-result-panel'
import { useStrokeScreening } from './hooks/use-stroke-screening'

const key = 'customer.strokeScreening' as const

/**
 * `/customer/stroke-screening` (2026-11-12): a customer screens a family member for a stroke-history pattern through
 * AIService (`POST /ai/stroke-screening/predict`). The form sits on the left, the result — always followed by the
 * model's disclaimer — on the right (below the form on phones). Nothing is stored; the backend enforces the CUSTOMER role.
 */
export function StrokeScreeningPage() {
  const { t } = useTranslation()
  useDocumentTitle(t(`${key}.documentTitle`))
  const state = useStrokeScreening()
  const formRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  /** On phones the result sits under the form, so it is brought into view once it arrives. */
  function showResult() {
    if (!window.matchMedia?.('(max-width: 1023px)').matches) return
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  function editAnswers() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    formRef.current?.querySelector<HTMLElement>('select, input')?.focus({ preventScroll: true })
  }

  return (
    <div className={`${pageContainer} pb-16`}>
      <CustomerPageHeader
        breadcrumb={[
          { label: t(`${key}.breadcrumb.home`), to: '/customer' },
          { label: t(`${key}.breadcrumb.current`) }
        ]}
        breadcrumbLabel={t(`${key}.breadcrumb.label`)}
        description={t(`${key}.subtitle`)}
        title={t(`${key}.title`)}
      />

      <aside
        aria-label={t(`${key}.emergency.title`)}
        className='mb-6 flex flex-col gap-3 rounded-3xl bg-peach-50 px-5 py-4 ring-1 ring-peach-200 sm:flex-row sm:items-center'
      >
        <span className='grid size-10 shrink-0 place-items-center rounded-2xl bg-peach-300 text-forest-950'>
          <Icon className='text-xl' filled name='emergency' />
        </span>
        <p className='min-w-0 flex-1 text-sm leading-6 text-forest-950'>
          <span className='font-bold'>{t(`${key}.emergency.title`)}</span> {t(`${key}.emergency.text`)}
        </p>
        <a
          className='inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-forest-900 px-5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-900'
          href='tel:115'
        >
          <Icon className='text-lg' name='call' />
          {t(`${key}.emergency.call`)}
        </a>
      </aside>

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]'>
        <div className='flex scroll-mt-28 flex-col gap-5' ref={formRef}>
          <RecipientPicker state={state} />
          <ScreeningForm onScreened={showResult} state={state} />
        </div>
        {/* The short guide stays in view while the form scrolls; a result is taller than the screen, so it scrolls
            with the page and its disclaimer is never hidden behind a sticky top. */}
        <div className={`scroll-mt-28 ${state.result ? '' : 'lg:sticky lg:top-24'}`} ref={resultRef}>
          <ScreeningResultPanel onEdit={editAnswers} state={state} />
        </div>
      </div>
    </div>
  )
}
