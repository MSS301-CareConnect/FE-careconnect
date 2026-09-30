import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'

export function ProfileSidebar() {
  const { t, i18n } = useTranslation()
  const [morning, setMorning] = useState(true)
  const [afternoon, setAfternoon] = useState(true)
  const currency = (value: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, { style: 'currency', currency: 'VND' }).format(value)
  return (
    <aside className='space-y-6'>
      <SectionCard icon='verified_user' title={t('caregiver.profile.verification')}>
        <p className='text-xs text-outline'>{t('caregiver.profile.verificationHint')}</p>
        <ul className='mt-5 space-y-5'>
          {(['identity', 'license', 'background', 'health', 'training'] as const).map((key) => (
            <li className='flex items-start gap-3' key={key}>
              <Icon className='text-xl text-outline' name='pending' />
              <div>
                <p className='text-xs font-semibold'>{t(`caregiver.profile.verificationList.${key}`)}</p>
                <p className='mt-1 text-[11px] text-outline'>{t('caregiver.profile.pending')}</p>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard icon='tune' title={t('caregiver.profile.preferences')}>
        <p className='rounded-lg bg-secondary-container p-3 text-xs font-semibold leading-6 text-primary'>
          {t('caregiver.profile.rate', { min: currency(80000), max: currency(120000) })}
        </p>
        <fieldset className='mt-5 space-y-3'>
          <legend className='mb-3 text-xs font-bold'>{t('caregiver.profile.shiftsLabel')}</legend>
          <label className='flex items-center gap-3 text-xs'>
            <input
              checked={morning}
              className='h-4 w-4 accent-primary'
              onChange={(event) => setMorning(event.target.checked)}
              type='checkbox'
            />
            {t('caregiver.profile.morning')}
          </label>
          <label className='flex items-center gap-3 text-xs'>
            <input
              checked={afternoon}
              className='h-4 w-4 accent-primary'
              onChange={(event) => setAfternoon(event.target.checked)}
              type='checkbox'
            />
            {t('caregiver.profile.afternoon')}
          </label>
        </fieldset>
        <Link
          className='mt-5 block rounded-xl bg-primary p-3 text-center text-xs font-bold text-white print:hidden'
          to='/caregiver/schedule'
        >
          {t('caregiver.profile.schedule')}
        </Link>
      </SectionCard>
      <SectionCard className='print:hidden' icon='lock' title={t('caregiver.profile.security')}>
        <div className='divide-y divide-outline-variant/20'>
          {(['password', 'twoFactor', 'policy'] as const).map((key) => (
            <button
              className='flex w-full items-center justify-between gap-3 py-3 text-left text-xs text-outline disabled:cursor-not-allowed'
              disabled
              key={key}
              title={t('caregiver.unavailable')}
              type='button'
            >
              {t(`caregiver.profile.${key}`)}
              <Icon className='text-lg' name='chevron_right' />
            </button>
          ))}
        </div>
      </SectionCard>
    </aside>
  )
}
