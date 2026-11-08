import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { Combobox } from './combobox'

const OPTIONS = [
  { value: 'Phường Ba Đình', name: 'Phường Ba Đình', label: 'Ba Đình', tag: 'Phường' },
  { value: 'Phường Hoàn Kiếm', name: 'Phường Hoàn Kiếm', label: 'Hoàn Kiếm', tag: 'Phường' },
  { value: 'Xã Sóc Sơn', name: 'Xã Sóc Sơn', label: 'Sóc Sơn', tag: 'Xã' }
]

const wardLabel = 'Phường / xã'
const placeholder = 'Chọn'

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <label htmlFor='ward'>{wardLabel}</label>
      <Combobox id='ward' onChange={setValue} options={OPTIONS} placeholder={placeholder} value={value} />
      <output>{value}</output>
    </>
  )
}

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

describe('Combobox', () => {
  it('filters without diacritics and picks with the keyboard', () => {
    render(<Harness />)
    const field = screen.getByLabelText('Phường / xã')
    fireEvent.click(field)
    const search = screen.getByRole('searchbox')
    expect(search).toHaveFocus()
    expect(screen.getAllByRole('option')).toHaveLength(3)

    fireEvent.change(search, { target: { value: 'soc' } })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByText('1 kết quả')).toBeInTheDocument()
    fireEvent.keyDown(search, { key: 'Enter' })

    expect(field).toHaveTextContent('Xã Sóc Sơn')
    expect(field).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('searches by the unit type too and says when nothing matches', () => {
    render(<Harness />)
    fireEvent.click(screen.getByLabelText('Phường / xã'))
    const search = screen.getByRole('searchbox')
    fireEvent.change(search, { target: { value: 'phuong' } })
    expect(screen.getAllByRole('option')).toHaveLength(2)
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    fireEvent.keyDown(search, { key: 'Enter' })
    expect(screen.getByRole('combobox')).toHaveTextContent('Phường Hoàn Kiếm')

    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(screen.getByText('Không tìm thấy “zzz”')).toBeInTheDocument()
  })

  it('keeps showing a value that is not among the options', () => {
    render(<Harness initial='Phường Kim Mã' />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Phường Kim Mã')
  })
})
