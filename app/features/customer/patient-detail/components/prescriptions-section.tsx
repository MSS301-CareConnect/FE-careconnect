import { useTranslation } from 'react-i18next'

import { Icon } from '~/shared/ui/icon'

import type { MedicationItem } from '../types'

export interface PrescriptionsSectionProps {
  medications: MedicationItem[]
  isEditMode: boolean
}

export function PrescriptionsSection({ medications, isEditMode }: PrescriptionsSectionProps) {
  const { t } = useTranslation()

  return (
    <div className='flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <Icon name='pill' className='text-2xl text-primary' />
          <h2 className='text-base font-bold text-on-surface'>{t('customer.patientDetail.prescriptions.title')}</h2>
        </div>
        <span className='rounded bg-secondary-container px-2.5 py-1 text-xs font-semibold text-on-secondary-container'>
          {t('customer.patientDetail.prescriptions.regimenBadge')}
        </span>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left text-xs'>
          <thead>
            <tr className='bg-surface-container-low text-xs font-semibold text-on-surface-variant'>
              <th className='rounded-l-lg p-3'>{t('customer.patientDetail.prescriptions.thMedication')}</th>
              <th className='p-3'>{t('customer.patientDetail.prescriptions.thDosage')}</th>
              <th className='p-3'>{t('customer.patientDetail.prescriptions.thTime')}</th>
              <th className='rounded-r-lg p-3'>{t('customer.patientDetail.prescriptions.thInstructions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-surface-container'>
            {medications.map((med) => (
              <tr key={med.id}>
                <td className='p-3'>
                  <div className='font-semibold text-on-surface'>{med.name}</div>
                  <div className='text-[11px] text-on-surface-variant'>{med.subtitle}</div>
                </td>
                <td className='p-3 font-mono font-medium'>{med.dosage}</td>
                <td className='p-3'>
                  <span className='rounded bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-primary'>
                    {med.time}
                  </span>
                </td>
                <td className='p-3 text-on-surface-variant'>{med.instructions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditMode && (
        <button
          type='button'
          className='self-start rounded-lg bg-surface-container px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-high'
        >
          {t('customer.patientDetail.prescriptions.addMedication')}
        </button>
      )}
    </div>
  )
}
