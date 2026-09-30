import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTitle } from '~/shared/lib/use-document-title'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import { ProfileCredentials } from './components/profile-credentials'
import { ProfilePersonal } from './components/profile-personal'
import { ProfileSidebar } from './components/profile-sidebar'

const skills = ['elderly', 'glucose', 'heart', 'hygiene', 'feeding', 'emergency', 'rehab'] as const
export function CaregiverProfilePage() {
  const { t, i18n } = useTranslation()
  const [available, setAvailable] = useState(true)
  const number = (value: number) => new Intl.NumberFormat(i18n.resolvedLanguage).format(value)
  useDocumentTitle(t('caregiver.profile.documentTitle'))
  return (
    <div className='caregiver-print-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>{t('caregiver.profile.title')}</h1>
          <p className='mt-3 text-sm text-on-surface-variant'>{t('caregiver.profile.subtitle')}</p>
        </div>
        <button
          className='flex items-center gap-2 rounded-xl border border-primary/25 bg-white px-4 py-3 text-sm font-bold text-primary print:hidden'
          onClick={() => window.print()}
          type='button'
        >
          <Icon name='print' />
          {t('caregiver.profile.print')}
        </button>
      </div>
      <p className='text-xs leading-5 text-outline'>{t('caregiver.profile.demo')}</p>
      <section className='overflow-hidden rounded-2xl bg-white shadow-sm'>
        <div className='h-3 bg-primary' />
        <div className='p-5 sm:p-7'>
          <div className='flex flex-wrap items-start gap-5'>
            <div className='relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary-container text-primary'>
              <Icon className='text-7xl' name='clinical_notes' />
              <img
                alt={t('caregiver.identity.name')}
                className='absolute inset-0 h-full w-full object-cover'
                onError={(event) => {
                  event.currentTarget.hidden = true
                }}
                src='https://lh3.googleusercontent.com/aida/AEtjO1ViZ7Nv2gRWyAi6jcTfyI_hXIL80Ai1JfFYHfAQn-6JSmXtSgnCnihY7WYKpG1Zqa8HNUyrUUZt--iPafu8ZrCYQ4GpQspWw4q8Wob8CGKzlkkW3JcFRIb8RI2sjsYctS9KWPGBPMv5qkCZzZphmVsJLyS6Y3uQFNLOq_spPjkqS-hLMtMtCZc81wsusQ0Nd2_tFoNIl1oxrMCjDiFrR42cVFlJvIamsEBTn_JdamD5ykMbvIWg9ASEjD4'
              />
            </div>
            <div className='min-w-0 flex-1'>
              <span className='rounded-md bg-secondary-container px-2 py-1 text-[10px] font-bold text-primary'>
                {t('caregiver.profile.previewBadge')}
              </span>
              <h2 className='mt-3 text-2xl font-extrabold'>{t('caregiver.identity.name')}</h2>
              <p className='mt-2 text-sm font-semibold text-primary'>{t('caregiver.profile.degree')}</p>
              <p className='mt-3 text-xs text-outline'>{t('caregiver.profile.license')}</p>
              <p className='mt-2 text-xs text-outline'>{t('caregiver.profile.identity')}</p>
            </div>
            <button
              aria-checked={available}
              aria-label={t('caregiver.profile.availability')}
              className='flex items-center gap-3 rounded-full bg-surface-container-low px-4 py-3 text-xs font-bold text-primary print:hidden'
              onClick={() => setAvailable(!available)}
              role='switch'
              type='button'
            >
              <span
                aria-hidden='true'
                className={`relative h-5 w-9 rounded-full transition-colors ${available ? 'bg-primary' : 'bg-outline'}`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${available ? 'left-0.5 translate-x-4' : 'left-0.5'}`}
                />
              </span>
              {t(available ? 'caregiver.profile.ready' : 'caregiver.profile.unavailable')}
            </button>
          </div>
          <div className='mt-6 grid grid-cols-2 gap-5 border-t border-outline-variant/20 pt-5 sm:grid-cols-4'>
            <div>
              <p className='flex items-center gap-1 text-2xl font-extrabold text-primary'>
                <Icon className='text-amber-500' filled name='star' />
                {t('caregiver.profile.rating', { score: number(4.9), max: number(5) })}
              </p>
              <p className='mt-1 text-xs text-outline'>{t('caregiver.profile.reviews', { count: 120 })}</p>
            </div>
            {(
              [
                { key: 'shifts', value: number(850) },
                {
                  key: 'punctual',
                  value: new Intl.NumberFormat(i18n.resolvedLanguage, {
                    style: 'percent',
                    maximumFractionDigits: 1
                  }).format(0.995)
                },
                { key: 'experience', value: number(7) }
              ] as const
            ).map((stat) => (
              <div key={stat.key}>
                <p className='text-2xl font-extrabold text-primary'>{stat.value}</p>
                <p className='mt-1 text-xs text-outline'>{t(`caregiver.profile.${stat.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <nav
        aria-label={t('caregiver.profile.title')}
        className='flex flex-wrap gap-2 rounded-xl bg-white p-2 shadow-sm print:hidden'
      >
        {(['personal', 'skills', 'work', 'certificates'] as const).map((key) => (
          <a
            className='rounded-lg px-4 py-3 text-xs font-bold text-primary hover:bg-secondary-container'
            href={`#${key}`}
            key={key}
          >
            {t(`caregiver.profile.${key}`)}
          </a>
        ))}
      </nav>
      <div className='grid items-start gap-6 lg:grid-cols-12'>
        <div className='space-y-6 lg:col-span-8'>
          <ProfilePersonal />
          <SectionCard
            action={
              <span className='text-xs text-outline'>
                {t('caregiver.profile.skillsCount', { count: skills.length })}
              </span>
            }
            icon='medical_services'
            id='skills'
            title={t('caregiver.profile.skillsTitle')}
          >
            <div className='grid gap-3 sm:grid-cols-2'>
              {skills.map((key) => (
                <div
                  className='flex items-start gap-2 rounded-xl bg-surface-container-low p-3 text-xs font-medium leading-6'
                  key={key}
                >
                  <Icon className='mt-0.5 shrink-0 text-lg text-primary' name='check_circle' />
                  {t(`caregiver.profile.skillList.${key}`)}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard icon='work_history' id='work' title={t('caregiver.profile.workTitle')}>
            <ol className='ml-2 border-l-2 border-secondary-container'>
              {(['current', 'icu', 'intern'] as const).map((key) => (
                <li className='relative pb-7 pl-6 last:pb-0' key={key}>
                  <span className='absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white' />
                  <p className='text-xs font-bold text-primary'>{t(`caregiver.profile.workList.${key}.dates`)}</p>
                  <h3 className='mt-2 text-sm font-bold'>{t(`caregiver.profile.workList.${key}.title`)}</h3>
                  <p className='mt-2 text-xs leading-6 text-on-surface-variant'>
                    {t(`caregiver.profile.workList.${key}.description`)}
                  </p>
                </li>
              ))}
            </ol>
          </SectionCard>
          <ProfileCredentials />
        </div>
        <div className='lg:col-span-4'>
          <ProfileSidebar />
        </div>
      </div>
    </div>
  )
}
