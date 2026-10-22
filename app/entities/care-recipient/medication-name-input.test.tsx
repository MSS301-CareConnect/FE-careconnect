import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import type { MedicationCatalogEntry } from './medication-catalog.constants'
import { MedicationNameInput } from './medication-name-input'

function Harness({ onSelect }: { onSelect: (entry: MedicationCatalogEntry) => void }) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  return (
    <MedicationNameInput
      value={value}
      onChange={setValue}
      onSelect={onSelect}
      aria-label={t('customer.patientCreate.section3.medicineNameLabel')}
    />
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

describe('MedicationNameInput', () => {
  it('suggests catalog names after the first characters and fills the name on click', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const input = screen.getByRole('combobox', { name: 'Tên thuốc' })

    fireEvent.change(input, { target: { value: 'me' } })

    expect(screen.getByRole('listbox', { name: 'Gợi ý tên thuốc' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: /Metformin 850 mg/ }))

    expect(input).toHaveValue('Metformin 850 mg')
    expect(onSelect).toHaveBeenCalledWith({ medicationName: 'Metformin 850 mg', route: 'ORAL' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('supports choosing with the keyboard and closing with Escape', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox', { name: 'Tên thuốc' })

    fireEvent.change(input, { target: { value: 'am' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input).toHaveAttribute('aria-activedescendant', screen.getAllByRole('option')[1].id)
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input).toHaveValue('Amlodipine 10 mg')

    fireEvent.change(input, { target: { value: 'pa' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps free text when nothing in the catalog matches', () => {
    render(<Harness onSelect={vi.fn()} />)
    const input = screen.getByRole('combobox', { name: 'Tên thuốc' })

    fireEvent.change(input, { target: { value: 'Thuốc nam gia truyền' } })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveValue('Thuốc nam gia truyền')
  })
})
