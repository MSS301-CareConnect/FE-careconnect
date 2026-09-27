import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { Icon } from '~/shared/ui/icon'

export function FamilyInsightCard() {
  const { t } = useTranslation()

  return (
    <section className='flex flex-col items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:flex-row'>
      <div className='flex items-center gap-4'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container shadow-sm'>
          <Icon name='elderly' className='text-3xl' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-on-surface'>{t('customer.profile.familyInsight.title')}</h3>
          <p className='text-xs text-on-surface-variant'>{t('customer.profile.familyInsight.description')}</p>
        </div>
      </div>

      <Link
        to='/customer/patient-profiles'
        className='flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container px-4 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-high'
      >
        <span>{t('customer.profile.familyInsight.viewDetails')}</span>
        <Icon name='arrow_forward' className='text-base' />
      </Link>
    </section>
  )
}
