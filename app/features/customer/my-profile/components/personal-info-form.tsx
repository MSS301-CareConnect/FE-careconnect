import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { CustomerProfileData } from '../hooks/use-profile-data'

const CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']
const DISTRICTS = ['Quận Bình Thạnh', 'Quận 1', 'Quận 3', 'TP. Thủ Đức']
const WARDS = ['Phường 22', 'Phường 19', 'Phường 25']

export interface PersonalInfoFormProps {
  profile: CustomerProfileData
  onUpdate: (data: Partial<CustomerProfileData>) => void
  onSave: () => Promise<void>
  isSaving: boolean
  saveSuccess: boolean
}

export function PersonalInfoForm({ profile, onUpdate, onSave, isSaving, saveSuccess }: PersonalInfoFormProps) {
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave()
  }

  return (
    <section id='personal-info' className='rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:p-8'>
      <div className='mb-6 flex flex-col justify-between gap-4 border-b border-surface-container pb-6 sm:flex-row sm:items-center'>
        <div>
          <h2 className='text-xl font-bold text-on-surface'>{t('customer.profile.form.title')}</h2>
          <p className='mt-1 text-xs text-on-surface-variant'>{t('customer.profile.form.subtitle')}</p>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            type='button'
            className='rounded-lg px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container'
          >
            {t('customer.profile.form.cancel')}
          </button>
          <button
            type='button'
            onClick={onSave}
            disabled={isSaving}
            className='flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-70'
          >
            <Icon name={isSaving ? 'refresh' : 'check'} className={`text-base ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? t('customer.profile.form.saving') : t('customer.profile.form.saveChanges')}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Full Name */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='fullName'
              className='flex items-center justify-between text-xs font-semibold text-on-surface'
            >
              <span>
                {t('customer.profile.form.fullName')} <span className='text-error'>*</span>
              </span>
              <span className='text-[11px] font-normal text-primary'>{t('customer.profile.form.matchCccd')}</span>
            </label>
            <div className='relative'>
              <input
                id='fullName'
                type='text'
                value={profile.fullName}
                onChange={(e) => onUpdate({ fullName: e.target.value })}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <span className='absolute top-3 right-3 text-primary'>
                <Icon name='verified' className='text-lg' />
              </span>
            </div>
          </div>

          {/* Gender */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='gender' className='text-xs font-semibold text-on-surface'>
              {t('customer.profile.form.gender')} <span className='text-error'>*</span>
            </label>
            <select
              id='gender'
              value={profile.gender}
              onChange={(e) => onUpdate({ gender: e.target.value as 'female' | 'male' | 'other' })}
              className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
            >
              <option value='female'>{t('customer.profile.form.genderFemale')}</option>
              <option value='male'>{t('customer.profile.form.genderMale')}</option>
              <option value='other'>{t('customer.profile.form.genderOther')}</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div className='flex flex-col gap-1.5'>
            <label htmlFor='dob' className='text-xs font-semibold text-on-surface'>
              {t('customer.profile.form.dob')} <span className='text-error'>*</span>
            </label>
            <div className='relative'>
              <input
                id='dob'
                type='text'
                value={profile.dob}
                onChange={(e) => onUpdate({ dob: e.target.value })}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <span className='absolute top-3 right-3 text-on-surface-variant'>
                <Icon name='calendar_today' className='text-lg' />
              </span>
            </div>
          </div>

          {/* National ID */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='idNumber'
              className='flex items-center justify-between text-xs font-semibold text-on-surface'
            >
              <span>
                {t('customer.profile.form.idNumber')} <span className='text-error'>*</span>
              </span>
              <span className='flex items-center gap-1 text-[11px] font-semibold text-primary'>
                <Icon name='lock' className='text-xs' />
                <span>{t('customer.profile.badge.securityLevel2')}</span>
              </span>
            </label>
            <input
              id='idNumber'
              type='text'
              value={profile.idNumber}
              onChange={(e) => onUpdate({ idNumber: e.target.value })}
              className='h-11 w-full rounded-lg bg-surface-container-low px-4 font-mono text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
            />
          </div>

          {/* Phone */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='phoneNumber'
              className='flex items-center justify-between text-xs font-semibold text-on-surface'
            >
              <span>
                {t('customer.profile.form.phone')} <span className='text-error'>*</span>
              </span>
              <span className='rounded bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container'>
                {t('customer.profile.badge.verified')}
              </span>
            </label>
            <div className='relative'>
              <input
                id='phoneNumber'
                type='tel'
                value={profile.phone}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-16 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <button
                type='button'
                className='absolute top-2.5 right-3 text-xs font-semibold text-primary hover:underline'
              >
                {t('customer.profile.form.change')}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className='flex flex-col gap-1.5'>
            <label
              htmlFor='emailAddress'
              className='flex items-center justify-between text-xs font-semibold text-on-surface'
            >
              <span>
                {t('customer.profile.form.email')} <span className='text-error'>*</span>
              </span>
              <span className='rounded bg-secondary-container px-2 py-0.5 text-[11px] font-bold text-on-secondary-container'>
                {t('customer.profile.badge.verified')}
              </span>
            </label>
            <div className='relative'>
              <input
                id='emailAddress'
                type='email'
                value={profile.email}
                onChange={(e) => onUpdate({ email: e.target.value })}
                className='h-11 w-full rounded-lg bg-surface-container-low px-4 pr-16 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              />
              <button
                type='button'
                className='absolute top-2.5 right-3 text-xs font-semibold text-primary hover:underline'
              >
                {t('customer.profile.form.change')}
              </button>
            </div>
          </div>
        </div>

        {/* Address Subsection */}
        <div className='border-t border-surface-container pt-4'>
          <div className='mb-4 flex items-center gap-2 text-on-surface'>
            <Icon name='home_pin' className='text-xl text-primary' />
            <span className='text-sm font-bold'>{t('customer.profile.form.addressSectionTitle')}</span>
          </div>

          <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='flex flex-col gap-1.5'>
              <label htmlFor='city' className='text-xs font-medium text-on-surface'>
                {t('customer.profile.form.city')}
              </label>
              <select
                id='city'
                value={profile.city}
                onChange={(e) => onUpdate({ city: e.target.value })}
                className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='district' className='text-xs font-medium text-on-surface'>
                {t('customer.profile.form.district')}
              </label>
              <select
                id='district'
                value={profile.district}
                onChange={(e) => onUpdate({ district: e.target.value })}
                className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex flex-col gap-1.5'>
              <label htmlFor='ward' className='text-xs font-medium text-on-surface'>
                {t('customer.profile.form.ward')}
              </label>
              <select
                id='ward'
                value={profile.ward}
                onChange={(e) => onUpdate({ ward: e.target.value })}
                className='h-11 w-full cursor-pointer rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
              >
                {WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='mb-4 flex flex-col gap-1.5'>
            <label htmlFor='addressDetail' className='text-xs font-medium text-on-surface'>
              {t('customer.profile.form.addressDetail')}
            </label>
            <input
              id='addressDetail'
              type='text'
              value={profile.addressDetail}
              onChange={(e) => onUpdate({ addressDetail: e.target.value })}
              className='h-11 w-full rounded-lg bg-surface-container-low px-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <label htmlFor='notes' className='flex items-center justify-between text-xs font-medium text-on-surface'>
              <span>{t('customer.profile.form.notes')}</span>
              <span className='text-[11px] text-on-surface-variant'>{t('customer.profile.form.notesHint')}</span>
            </label>
            <textarea
              id='notes'
              rows={3}
              value={profile.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              className='w-full rounded-lg bg-surface-container-low p-4 text-sm text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:outline-none'
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className='flex items-center justify-end gap-4 pt-2'>
          {saveSuccess && (
            <span className='flex items-center gap-1 text-xs text-primary transition-opacity'>
              <Icon name='done_all' className='text-base' />
              <span>{t('customer.profile.form.saveSuccess')}</span>
            </span>
          )}
          <button
            type='submit'
            disabled={isSaving}
            className='flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-70'
          >
            <Icon name='save' className='text-base' />
            <span>{t('customer.profile.form.saveChanges')}</span>
          </button>
        </div>
      </form>
    </section>
  )
}
