import { useTranslation } from 'react-i18next'
import { Icon } from '~/shared/ui/icon'
import { SectionCard } from '~/shared/ui/section-card'
import type { ManagerCaregiver } from '../caregiver-preview'

export function DetailLeftPanels({ person }: { person: ManagerCaregiver }) {
  const { t } = useTranslation()
  const featured = person.id === 'CG-1024'
  const contactItems: { key: 'phone' | 'email' | 'address'; value: string; icon: string }[] = [
    { key: 'phone', value: person.phone, icon: 'call' },
    { key: 'email', value: person.email, icon: 'mail' }
  ]
  if (featured) contactItems.push({ key: 'address', value: t('centerManager.detail.addressValue'), icon: 'home_pin' })
  return (
    <div className='space-y-6'>
      <SectionCard icon='contact_page' title={t('centerManager.detail.contact')}>
        <dl className='space-y-5'>
          {contactItems.map((item) => (
            <div className='flex min-w-0 items-start gap-3' key={item.key}>
              <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary'>
                <Icon className='text-xl' name={item.icon} />
              </span>
              <div className='min-w-0'>
                <dt className='text-[11px] font-semibold uppercase tracking-wide text-outline'>
                  {t(`centerManager.detail.${item.key}`)}
                </dt>
                <dd className='mt-1 break-words text-sm font-semibold'>{item.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        {featured && (
          <>
            <div className='mt-6 border-t border-outline-variant/20 pt-5'>
              <h3 className='text-xs font-bold'>{t('centerManager.detail.areas')}</h3>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(['area1', 'area2', 'area3'] as const).map((key) => (
                  <span
                    className='rounded-md bg-secondary-container px-3 py-1 text-xs font-semibold text-primary'
                    key={key}
                  >
                    {t(`centerManager.detail.${key}`)}
                  </span>
                ))}
              </div>
            </div>
            <div className='mt-6 rounded-xl bg-surface-container-low p-4'>
              <h3 className='text-xs font-bold'>{t('centerManager.detail.bio')}</h3>
              <p className='mt-2 text-xs leading-6 text-on-surface-variant'>{t('centerManager.detail.bioValue')}</p>
            </div>
          </>
        )}
      </SectionCard>
      <SectionCard icon='policy' title={t('centerManager.detail.verification')}>
        <p className='text-xs leading-5 text-outline'>{t('centerManager.detail.verificationHint')}</p>
        <ol className='mt-5 space-y-4'>
          {(['identity', 'license', 'degree', 'background'] as const).map((key, index) => (
            <li className='flex items-start gap-3' key={key}>
              <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-container text-xs font-bold text-primary'>
                {index + 1}
              </span>
              <div>
                <p className='text-sm font-semibold'>{t(`centerManager.detail.checklist.${key}`)}</p>
                <p className='mt-1 text-xs text-outline'>
                  {t(`centerManager.management.verifications.${person.verification}`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>
      {featured && (
        <SectionCard
          action={
            <button
              className='text-xs font-semibold text-outline disabled:cursor-not-allowed'
              disabled
              title={t('centerManager.unavailable')}
              type='button'
            >
              {t('centerManager.detail.downloadAll')}
            </button>
          }
          icon='attachment'
          title={t('centerManager.detail.documents')}
        >
          <p className='text-xs leading-5 text-outline'>{t('centerManager.detail.documentsHint')}</p>
          <ul className='mt-4 space-y-3'>
            {(['license', 'degree', 'health', 'background'] as const).map((key) => {
              const name = t(`centerManager.detail.docNames.${key}`)
              return (
                <li
                  className='flex min-w-0 items-center justify-between gap-2 rounded-lg bg-surface-container-low p-3'
                  key={key}
                >
                  <div className='flex min-w-0 items-center gap-2'>
                    <Icon className='shrink-0 text-primary' name='picture_as_pdf' />
                    <span className='truncate text-xs font-semibold' title={name}>
                      {name}
                    </span>
                  </div>
                  <div className='flex gap-1'>
                    <button
                      aria-label={t('centerManager.detail.viewDoc', { name })}
                      className='text-outline disabled:cursor-not-allowed'
                      disabled
                      title={t('centerManager.unavailable')}
                      type='button'
                    >
                      <Icon className='text-lg' name='visibility' />
                    </button>
                    <button
                      aria-label={t('centerManager.detail.downloadDoc', { name })}
                      className='text-outline disabled:cursor-not-allowed'
                      disabled
                      title={t('centerManager.unavailable')}
                      type='button'
                    >
                      <Icon className='text-lg' name='download' />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      )}
    </div>
  )
}
