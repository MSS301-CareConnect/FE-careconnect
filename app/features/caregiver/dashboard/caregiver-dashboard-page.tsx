import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'

import { DashboardStats } from './components/dashboard-stats'
import { CareSessions } from './components/care-sessions'
import { CareTools } from './components/care-tools'

export function CaregiverDashboardPage() {
  const { t, i18n } = useTranslation()
  const [ready, setReady] = useState(true)
  useDocumentTitle(t('caregiver.title'))
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(new Date('2025-10-24T08:00:00+07:00'))
  return (
    <div className='mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-12'>
      <p className='flex items-start gap-2 rounded-lg bg-secondary-container px-4 py-3 text-xs leading-5 text-primary'>
        <Icon className='text-lg' name='info' />
        {t('caregiver.demo')}
      </p>
      <section className='relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm lg:p-8'>
        <div
          aria-hidden='true'
          className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary-container/70 blur-3xl'
        />
        <div className='relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center'>
          <div className='flex items-center gap-4'>
            <div className='relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary-container text-primary shadow-sm sm:h-20 sm:w-20'>
              <Icon className='text-4xl' name='clinical_notes' />
              <img
                alt={t('caregiver.identity.name')}
                className='absolute inset-0 h-full w-full object-cover'
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
                src='https://lh3.googleusercontent.com/aida/AEtjO1ViZ7Nv2gRWyAi6jcTfyI_hXIL80Ai1JfFYHfAQn-6JSmXtSgnCnihY7WYKpG1Zqa8HNUyrUUZt--iPafu8ZrCYQ4GpQspWw4q8Wob8CGKzlkkW3JcFRIb8RI2sjsYctS9KWPGBPMv5qkCZzZphmVsJLyS6Y3uQFNLOq_spPjkqS-hLMtMtCZc81wsusQ0Nd2_tFoNIl1oxrMCjDiFrR42cVFlJvIamsEBTn_JdamD5ykMbvIWg9ASEjD4'
              />
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-3'>
                <h1 className='text-xl font-extrabold tracking-tight sm:text-2xl'>
                  {t('caregiver.identity.greeting', { name: t('caregiver.identity.name') })}
                </h1>
                <span className='rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-primary'>
                  {t('caregiver.identity.role')}
                </span>
              </div>
              <div className='mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-on-surface-variant'>
                <span className='flex items-center gap-1.5'>
                  <Icon className='text-base' name='calendar_today' />
                  {t('caregiver.identity.date', { date })}
                </span>
                <span className='flex items-center gap-1.5'>
                  <Icon className='text-base text-primary' name='verified' />
                  {t('caregiver.identity.credential')}
                </span>
              </div>
            </div>
          </div>
          <div className='flex flex-wrap items-start gap-4'>
            <div>
              <button
                aria-checked={ready}
                aria-label={t('caregiver.identity.availability')}
                className='flex min-h-11 items-center gap-3 rounded-full bg-surface-container-low px-4 py-2 text-xs font-bold'
                onClick={() => setReady(!ready)}
                role='switch'
                type='button'
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${ready ? 'bg-primary' : 'bg-outline'}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${ready ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </span>
                <span className={ready ? 'text-primary' : 'text-outline'}>
                  {t(ready ? 'caregiver.identity.ready' : 'caregiver.identity.away')}
                </span>
              </button>
              <p className='mt-2 max-w-52 text-[10px] text-outline'>{t('caregiver.identity.local')}</p>
            </div>
            <a
              className='flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-white hover:bg-primary-container'
              href='#tools'
            >
              <Icon className='text-lg' name='description' />
              {t('caregiver.identity.quickReport')}
            </a>
          </div>
        </div>
      </section>
      <DashboardStats />
      <div className='grid items-start gap-8 lg:grid-cols-12'>
        <div className='lg:col-span-7'>
          <CareSessions />
        </div>
        <div className='lg:col-span-5'>
          <CareTools />
        </div>
      </div>
    </div>
  )
}
