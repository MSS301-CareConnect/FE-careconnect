import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { SelectedPatientId } from '../types'

const STEP_1_NUM = '1'
const ICON_SWAP = 'swap_horiz'
const ICON_FAVORITE = 'favorite'
const ICON_PIN_DROP = 'pin_drop'
const ICON_ADD_CIRCLE = 'add_circle'

const PATIENT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXMpNLS4mzcR34mC0Fl734aK_CHMLYVzAV9CbmNsfEskeqYP30AvNE9KGjD6-rRMxSjTV3jOWMBMf5-T5b345BwLh6ht9Du7SPrOhQMqlgoBlDv7NexpvmqOxiol3gUy5m5bZI3URZ-6wuPTgghDEql-VeLdvSSdKWUdui_eOO4XwHXnon65qsJdbcheQ4eb2bJD2DEFb939XC-mtfE4iCOC_RUzzm7V0Xz2CqZ594HGYMOTM0JjEBpw'

const PATIENT_FATHER = {
  name: 'Cụ Nguyễn Văn An',
  age: 78,
  bloodType: 'O(Rh+)'
}

const PATIENT_MOTHER = {
  name: 'Bà Lê Thị Mai',
  age: 74,
  bloodType: 'A(Rh+)'
}

interface BookingPatientSectionProps {
  selectedPatientId: SelectedPatientId
  onSelectPatient: (id: SelectedPatientId) => void
}

export function BookingPatientSection({ selectedPatientId, onSelectPatient }: BookingPatientSectionProps) {
  const { t } = useTranslation()
  const isFather = selectedPatientId === 'father'
  const activePatient = isFather ? PATIENT_FATHER : PATIENT_MOTHER

  return (
    <section className='relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md md:p-6'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between border-b border-outline-variant/20 pb-4'>
        <div className='flex items-center gap-3'>
          <span className='flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-low font-bold text-sm text-primary'>
            {STEP_1_NUM}
          </span>
          <div>
            <h2 className='text-lg font-bold text-on-surface sm:text-xl'>
              {t('customer.booking.patientSection.title')}
            </h2>
            <p className='text-xs text-on-surface-variant sm:text-sm'>
              {t('customer.booking.patientSection.subtitle')}
            </p>
          </div>
        </div>
        <button
          className='inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-low sm:text-sm'
          type='button'
          onClick={() => onSelectPatient(isFather ? 'mother' : 'father')}
        >
          <span className='material-symbols-outlined text-[18px]'>{ICON_SWAP}</span>
          <span>{t('customer.booking.patientSection.switchPatientBtn')}</span>
        </button>
      </div>

      {/* Patient Visual Tile */}
      <div className='flex flex-col items-start gap-4 rounded-xl bg-surface-container-low/60 p-4 sm:flex-row sm:items-center sm:gap-6'>
        <div className='relative shrink-0'>
          <img
            alt={activePatient.name}
            className='h-20 w-20 rounded-full object-cover shadow-xs ring-2 ring-primary/20'
            src={PATIENT_AVATAR}
          />
          <span className='absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[12px] font-bold text-on-secondary shadow-xs'>
            <span className='material-symbols-outlined text-[14px]'>{ICON_FAVORITE}</span>
          </span>
        </div>

        <div className='min-w-0 flex-1'>
          <div className='mb-1 flex flex-wrap items-center gap-2'>
            <h3 className='text-base font-bold text-on-surface sm:text-lg'>{activePatient.name}</h3>
            <span className='rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface'>
              {t('customer.booking.patientSection.ageText', { age: activePatient.age })}
            </span>
            <span className='rounded-full bg-surface-container-highest px-2.5 py-0.5 text-xs font-medium text-on-surface'>
              {isFather
                ? t('customer.booking.patientSection.genderMale')
                : t('customer.booking.patientSection.genderFemale')}
            </span>
            <span className='rounded-full bg-error-container px-2.5 py-0.5 text-xs font-semibold text-on-error-container'>
              {t('customer.booking.patientSection.bloodType', { type: activePatient.bloodType })}
            </span>
          </div>

          <p className='mb-1 line-clamp-2 text-xs text-on-surface-variant sm:text-sm'>
            <strong className='font-medium text-on-surface'>
              {t('customer.booking.patientSection.underlyingLabel')}{' '}
            </strong>
            {t('customer.booking.patientSection.underlyingDesc')}
          </p>

          <div className='flex items-center gap-1.5 text-xs text-on-surface-variant sm:text-sm'>
            <span className='shrink-0 material-symbols-outlined text-[18px] text-primary'>{ICON_PIN_DROP}</span>
            <span className='truncate'>{t('customer.booking.patientSection.address')}</span>
          </div>
        </div>
      </div>

      {/* Quick switcher strip */}
      <div className='mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 text-xs sm:text-sm'>
        <div className='flex items-center gap-4'>
          <label className='flex cursor-pointer items-center gap-2'>
            <input
              checked={selectedPatientId === 'father'}
              className='h-4 w-4 accent-primary text-primary'
              name='patient_switch'
              type='radio'
              onChange={() => onSelectPatient('father')}
            />
            <span className={isFather ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
              {t('customer.booking.patientSection.patientFatherOption')}
            </span>
          </label>

          <label className='flex cursor-pointer items-center gap-2'>
            <input
              checked={selectedPatientId === 'mother'}
              className='h-4 w-4 accent-primary text-primary'
              name='patient_switch'
              type='radio'
              onChange={() => onSelectPatient('mother')}
            />
            <span className={!isFather ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>
              {t('customer.booking.patientSection.patientMotherOption')}
            </span>
          </label>
        </div>

        <Link
          className='flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline sm:text-sm'
          to='/customer/patient-profiles/new'
        >
          <span className='material-symbols-outlined text-[16px]'>{ICON_ADD_CIRCLE}</span>
          <span>{t('customer.booking.patientSection.addNewPatientLink')}</span>
        </Link>
      </div>
    </section>
  )
}
