import { type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export interface CreatePatientSidebarProps {
  avatarUrl: string
  onAvatarChange: (newUrl: string) => void
}

const STEP_2 = '2'
const STEP_3 = '3'

export function CreatePatientSidebar({ avatarUrl, onAvatarChange }: CreatePatientSidebarProps) {
  const { t } = useTranslation()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          onAvatarChange(event.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  return (
    <aside className='sticky top-24 flex flex-col gap-6 lg:col-span-4'>
      {/* 1. Patient Avatar Upload Card */}
      <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
        <div className='mb-4 flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/30 text-primary'>
            <Icon name='badge' className='text-lg' />
          </div>
          <div>
            <h2 className='text-sm font-bold text-on-surface'>
              {t('customer.patientCreate.sidebar.avatarCard.title')}
            </h2>
            <p className='text-xs text-on-surface-variant'>{t('customer.patientCreate.sidebar.avatarCard.subtitle')}</p>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center rounded-xl bg-surface-container-low/60 p-4'>
          <div className='group relative mb-3 cursor-pointer'>
            <div className='flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-surface-container-high shadow-inner'>
              <img
                src={avatarUrl}
                alt={t('customer.patientCreate.sidebar.avatarCard.title')}
                className='h-full w-full object-cover'
              />
            </div>
            <label
              htmlFor='patientAvatarInput'
              className='absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full bg-inverse-surface/40 text-on-primary opacity-0 transition-opacity group-hover:opacity-100'
            >
              <Icon name='photo_camera' className='text-2xl' />
              <span className='mt-1 text-[11px] font-medium'>
                {t('customer.patientCreate.sidebar.avatarCard.changePhoto')}
              </span>
            </label>
            <input
              id='patientAvatarInput'
              type='file'
              accept='image/png, image/jpeg'
              className='hidden'
              onChange={handleFileChange}
            />
            <span className='absolute right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary shadow-md'>
              <Icon name='upload' className='text-sm' />
            </span>
          </div>

          <p className='text-center text-xs font-semibold text-on-surface'>
            {t('customer.patientCreate.sidebar.avatarCard.uploadLabel')}
          </p>
          <p className='mt-1 text-center text-[11px] text-on-surface-variant'>
            {t('customer.patientCreate.sidebar.avatarCard.uploadHint')}
          </p>

          <div className='mt-3 flex w-full items-start gap-2 rounded-lg bg-surface-container-lowest p-3'>
            <Icon name='info' className='mt-0.5 shrink-0 text-sm text-primary' />
            <p className='text-[11px] text-on-surface-variant leading-relaxed'>
              {t('customer.patientCreate.sidebar.avatarCard.uploadNote')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Form Stepper Indicator */}
      <div className='rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-on-surface'>{t('customer.patientCreate.sidebar.stepper.title')}</h2>
          <span className='rounded-md bg-secondary-container/40 px-2 py-1 text-xs font-semibold text-on-secondary-container'>
            {t('customer.patientCreate.sidebar.stepper.status', {
              completed: 1,
              total: 3
            })}
          </span>
        </div>

        <ol className='relative flex flex-col gap-4'>
          <li className='flex items-start gap-3'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary shadow-sm'>
              <Icon name='check' className='text-sm' />
            </div>
            <div className='flex-1'>
              <p className='text-xs font-semibold text-primary'>
                {t('customer.patientCreate.sidebar.stepper.step1Title')}
              </p>
              <p className='text-[11px] text-on-surface-variant'>
                {t('customer.patientCreate.sidebar.stepper.step1Subtitle')}
              </p>
            </div>
          </li>

          <li className='flex items-start gap-3'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-on-surface'>
              <span>{STEP_2}</span>
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-on-surface'>
                {t('customer.patientCreate.sidebar.stepper.step2Title')}
              </p>
              <p className='text-[11px] text-on-surface-variant'>
                {t('customer.patientCreate.sidebar.stepper.step2Subtitle')}
              </p>
            </div>
          </li>

          <li className='flex items-start gap-3'>
            <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-on-surface'>
              <span>{STEP_3}</span>
            </div>
            <div className='flex-1'>
              <p className='text-xs font-medium text-on-surface'>
                {t('customer.patientCreate.sidebar.stepper.step3Title')}
              </p>
              <p className='text-[11px] text-on-surface-variant'>
                {t('customer.patientCreate.sidebar.stepper.step3Subtitle')}
              </p>
            </div>
          </li>
        </ol>
      </div>

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
