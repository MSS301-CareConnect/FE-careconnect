import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

export function SecuritySection() {
  const { t } = useTranslation()

  const [currentPassword, setCurrentPassword] = useState('MaiAnhSecure2024@')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setIsUpdating(false)
    setUpdateSuccess(true)
    setNewPassword('')
    setConfirmPassword('')
    setTimeout(() => {
      setUpdateSuccess(false)
    }, 2500)
  }

  return (
    <section
      id='security-section'
      className='relative overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8'
    >
      <div className='mb-6 flex items-start gap-4 border-b border-surface-container pb-6'>
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container'>
          <Icon name='shield_person' className='text-3xl' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-on-surface'>{t('customer.profile.security.title')}</h2>
          <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.profile.security.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleUpdatePassword} className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {/* Current Password */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='currentPassword' className='text-xs font-semibold text-on-surface'>
              {t('customer.profile.security.currentPassword')}
            </label>
            <div className='relative'>
              <input
                id='currentPassword'
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-10 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <button
                type='button'
                onClick={() => setShowCurrent((prev) => !prev)}
                className='absolute top-3 right-3 text-on-surface-variant hover:text-on-surface'
              >
                <Icon name={showCurrent ? 'visibility_off' : 'visibility'} className='text-lg' />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='newPassword' className='text-xs font-semibold text-on-surface'>
              {t('customer.profile.security.newPassword')}
            </label>
            <div className='relative'>
              <input
                id='newPassword'
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('customer.profile.security.newPasswordPlaceholder')}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-10 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <button
                type='button'
                onClick={() => setShowNew((prev) => !prev)}
                className='absolute top-3 right-3 text-on-surface-variant hover:text-on-surface'
              >
                <Icon name={showNew ? 'visibility_off' : 'visibility'} className='text-lg' />
              </button>
            </div>

            {/* Strength meter */}
            <div className='mt-1 flex flex-col gap-1'>
              <div className='flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container'>
                <div className='w-full rounded-full bg-primary transition-all' />
              </div>
              <div className='flex items-center justify-between text-[11px]'>
                <span className='text-on-surface-variant'>{t('customer.profile.security.securityLevel')}</span>
                <span className='font-bold text-primary'>{t('customer.profile.security.strengthStrong')}</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='confirmPassword' className='text-xs font-semibold text-on-surface'>
              {t('customer.profile.security.confirmPassword')}
            </label>
            <div className='relative'>
              <input
                id='confirmPassword'
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('customer.profile.security.confirmPasswordPlaceholder')}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-10 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <button
                type='button'
                onClick={() => setShowConfirm((prev) => !prev)}
                className='absolute top-3 right-3 text-on-surface-variant hover:text-on-surface'
              >
                <Icon name={showConfirm ? 'visibility_off' : 'visibility'} className='text-lg' />
              </button>
            </div>
          </div>
        </div>

        {/* Security Criteria Checklist */}
        <div className='flex flex-col justify-between gap-4 rounded-xl bg-surface-container-low p-4 md:flex-row md:items-center'>
          <div className='flex flex-col gap-2'>
            <span className='text-[11px] font-bold tracking-wider text-on-surface uppercase'>
              {t('customer.profile.security.standardsTitle')}
            </span>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-1.5 text-xs font-semibold text-primary'>
                <Icon name='check_circle' className='text-base' />
                <span>{t('customer.profile.security.ruleMinLength')}</span>
              </div>
              <div className='flex items-center gap-1.5 text-xs font-semibold text-primary'>
                <Icon name='check_circle' className='text-base' />
                <span>{t('customer.profile.security.ruleCaseAndNumber')}</span>
              </div>
              <div className='flex items-center gap-1.5 text-xs font-semibold text-primary'>
                <Icon name='check_circle' className='text-base' />
                <span>{t('customer.profile.security.ruleSpecialChar')}</span>
              </div>
            </div>
          </div>

          <button
            type='submit'
            disabled={isUpdating}
            className='flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-70'
          >
            <Icon
              name={isUpdating ? 'sync' : updateSuccess ? 'check_circle' : 'lock'}
              className={`text-base ${isUpdating ? 'animate-spin' : ''}`}
            />
            <span>
              {isUpdating
                ? t('customer.profile.security.updating')
                : updateSuccess
                  ? t('customer.profile.security.updated')
                  : t('customer.profile.security.updatePassword')}
            </span>
          </button>
        </div>

        {/* 2FA Box */}
        <div className='flex items-center justify-between rounded-xl bg-surface-container p-4'>
          <div className='flex items-center gap-4'>
            <Icon name='phonelink_lock' className='text-3xl text-primary' />
            <div>
              <h3 className='text-xs font-bold text-on-surface'>{t('customer.profile.security.twoFactorTitle')}</h3>
              <p className='text-xs text-on-surface-variant'>{t('customer.profile.security.twoFactorDesc')}</p>
            </div>
          </div>

          <label className='relative inline-flex cursor-pointer items-center'>
            <input
              type='checkbox'
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              className='peer sr-only'
            />
            <div className="peer h-6 w-11 rounded-full bg-outline-variant transition-all after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-surface-container after:bg-surface-container-lowest after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest peer-focus:outline-none" />
          </label>
        </div>
      </form>
    </section>
  )
}
