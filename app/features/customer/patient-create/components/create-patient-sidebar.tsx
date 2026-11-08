import type { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

const sections = [
  { id: 'patient-basic-info', number: '1', title: 'step1Title', subtitle: 'step1Subtitle' },
  { id: 'patient-medical-history', number: '2', title: 'step2Title', subtitle: 'step2Subtitle' },
  { id: 'patient-medications', number: '3', title: 'step3Title', subtitle: 'step3Subtitle' }
] as const

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView?.({
    behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start'
  })
  target.focus({ preventScroll: true })
}

export function CreatePatientSidebar() {
  const { t } = useTranslation()

  return (
    <aside className='flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-4'>
      <nav
        aria-label={t('customer.patientCreate.sidebar.stepper.title')}
        className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'
      >
        <h2 className='mb-4 text-sm font-bold text-on-surface'>{t('customer.patientCreate.sidebar.stepper.title')}</h2>
        <ul className='flex flex-col gap-1'>
          {sections.map((section) => (
            <li key={section.id}>
              <a
                className='group flex items-start gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-container-low focus-visible:outline-2 focus-visible:outline-primary'
                href={`#${section.id}`}
                onClick={(event) => scrollToSection(event, section.id)}
              >
                <span
                  aria-hidden='true'
                  className='grid size-8 shrink-0 place-items-center rounded-full bg-secondary-container text-xs font-bold text-primary group-hover:bg-primary group-hover:text-on-primary'
                >
                  {section.number}
                </span>
                <span className='min-w-0'>
                  <span className='block text-sm font-semibold text-on-surface group-hover:text-primary'>
                    {t(`customer.patientCreate.sidebar.stepper.${section.title}`)}
                  </span>
                  <span className='mt-0.5 block text-xs leading-5 text-on-surface-variant'>
                    {t(`customer.patientCreate.sidebar.stepper.${section.subtitle}`)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 3. Security & HIPAA Compliance Notice Card */}
      <div className='rounded-xl bg-surface-container-low p-6 shadow-sm'>
        <div className='flex items-start gap-3'>
          <div className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary'>
            <Icon name='verified_user' className='text-lg' />
          </div>
          <div>
            <span className='rounded bg-surface-container-lowest px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider'>
              {t('customer.patientCreate.sidebar.security.badge')}
            </span>
            <p className='mt-2 text-xs font-medium text-on-surface leading-relaxed'>
              {t('customer.patientCreate.sidebar.security.desc')}
            </p>
            <p className='mt-1 text-[11px] text-on-surface-variant leading-relaxed'>
              {t('customer.patientCreate.sidebar.security.subdesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Hotline y tế 24/7 */}
      <div className='flex items-center justify-between rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container/40 text-on-secondary-container'>
            <Icon name='support_agent' className='text-xl' />
          </div>
          <div>
            <p className='text-xs text-on-surface-variant'>{t('customer.patientCreate.sidebar.hotline.label')}</p>
            <p className='text-lg font-bold text-primary'>{t('customer.patientCreate.sidebar.hotline.phone')}</p>
          </div>
        </div>
        <a
          href='tel:19006868'
          aria-label={t('customer.patientCreate.sidebar.hotline.call')}
          className='rounded-lg bg-surface-container-low p-2.5 text-primary transition-colors hover:bg-secondary-container/50'
        >
          <Icon name='call' className='text-xl' />
        </a>
      </div>

      {/* 5. Quick Tips Card */}
      <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
        <h3 className='mb-1 flex items-center gap-1.5 text-xs font-semibold text-on-surface'>
          <Icon name='lightbulb' className='text-base text-primary' />
          <span>{t('customer.patientCreate.sidebar.tips.title')}</span>
        </h3>
        <p className='text-xs text-on-surface-variant leading-relaxed'>
          {t('customer.patientCreate.sidebar.tips.desc')}
        </p>
      </div>
    </aside>
  )
}
