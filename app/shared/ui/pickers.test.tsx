import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'
import { pickTime } from '~/shared/test/pickers'

import { DatePicker } from './date-picker'
import { Select } from './form-field'
import { TimeSelect } from './time-select'

const startLabel = 'Start'
const dayLabel = 'Day'
const outsideText = 'Outside'
const statusLabel = 'Status'
const optionA = 'A'
const optionB = 'B'

beforeEach(async () => {
  await setAppLanguage('vi', false)
})

function ControlledTime(props: { initial?: string; min?: string; onChange?: (value: string) => void }) {
  const [value, setValue] = useState(props.initial ?? '08:00')
  return (
    <label>
      {startLabel}
      <TimeSelect
        min={props.min}
        onChange={(next) => {
          setValue(next)
          props.onChange?.(next)
        }}
        value={value}
      />
    </label>
  )
}

function ControlledDate(props: { initial?: string; min?: string; onChange?: (value: string) => void }) {
  const [value, setValue] = useState(props.initial ?? '')
  return (
    <DatePicker
      aria-label={dayLabel}
      disabledReason='Too early'
      min={props.min}
      onChange={(next) => {
        setValue(next)
        props.onChange?.(next)
      }}
      value={value}
    />
  )
}

describe('TimeSelect', () => {
  it('is a labelled combobox that opens a listbox of 15-minute times and picks one', () => {
    const onChange = vi.fn()
    render(<ControlledTime onChange={onChange} />)
    const combobox = screen.getByRole('combobox', { name: 'Start' })
    expect(combobox).toHaveTextContent('08:00')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(combobox)
    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('listbox')
    expect(within(list).getAllByRole('option')).toHaveLength(96)
    expect(within(list).getByRole('option', { name: '08:00' })).toHaveAttribute('aria-selected', 'true')
    expect(within(list).getByRole('option', { name: '08:00' })).toHaveFocus()

    fireEvent.click(within(list).getByRole('option', { name: '09:45' }))
    expect(onChange).toHaveBeenCalledWith('09:45')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(combobox).toHaveTextContent('09:45')
    expect(combobox).toHaveFocus()
  })

  it('moves with the keyboard, picks with Enter and closes on Escape', () => {
    const onChange = vi.fn()
    render(<ControlledTime onChange={onChange} />)
    const combobox = screen.getByRole('combobox', { name: 'Start' })
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    const list = screen.getByRole('listbox')
    fireEvent.keyDown(list, { key: 'ArrowRight' })
    fireEvent.keyDown(list, { key: 'ArrowDown' })
    expect(within(list).getByRole('option', { name: '09:15' })).toHaveFocus()
    fireEvent.keyDown(within(list).getByRole('option', { name: '09:15' }), { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('09:15')

    fireEvent.keyDown(combobox, { key: 'Enter' })
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(combobox).toHaveFocus()
  })

  it('marks times before min and does not pick them', () => {
    const onChange = vi.fn()
    render(<ControlledTime min='07:00' onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox', { name: 'Start' }))
    const early = screen.getByRole('option', { name: '06:45' })
    expect(early).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(early)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('works through the pickTime test helper', () => {
    const onChange = vi.fn()
    render(<ControlledTime onChange={onChange} />)
    pickTime(screen.getByRole('combobox', { name: 'Start' }), '17:30')
    expect(onChange).toHaveBeenCalledWith('17:30')
  })
})

describe('DatePicker', () => {
  it('opens a calendar grid from the icon with the chosen day selected and picks a day', () => {
    const onChange = vi.fn()
    render(<ControlledDate initial='2030-01-15' onChange={onChange} />)
    const button = screen.getByRole('button', { name: 'Chọn ngày' })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const grid = screen.getByRole('grid')
    expect(within(grid).getByRole('gridcell', { name: '15/01/2030' })).toHaveAttribute('aria-selected', 'true')
    expect(within(grid).getByRole('gridcell', { name: '15/01/2030' })).toHaveFocus()

    fireEvent.click(within(grid).getByRole('gridcell', { name: '20/01/2030' }))
    expect(onChange).toHaveBeenCalledWith('2030-01-20')
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Day' })).toHaveValue('20/01/2030')
  })

  it('moves by day, by month with PageDown and picks with Enter', () => {
    const onChange = vi.fn()
    render(<ControlledDate initial='2030-01-31' onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Chọn ngày' }))
    const grid = screen.getByRole('grid')
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(screen.getByRole('gridcell', { name: '28/02/2030' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'ArrowLeft' })
    expect(screen.getByRole('gridcell', { name: '27/02/2030' })).toHaveFocus()
    fireEvent.click(screen.getByRole('gridcell', { name: '27/02/2030' }))
    expect(onChange).toHaveBeenCalledWith('2030-02-27')
  })

  it('jumps by month and year from the title', () => {
    render(<ControlledDate initial='2030-01-15' />)
    fireEvent.click(screen.getByRole('button', { name: 'Chọn ngày' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chọn tháng và năm' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chọn tháng và năm' }))
    fireEvent.click(screen.getByRole('button', { name: '2027' }))
    fireEvent.click(screen.getByRole('button', { name: /^th(g|áng) 6$/i }))
    expect(screen.getByRole('gridcell', { name: '15/06/2027' })).toBeInTheDocument()
  })

  it('keeps disabled days with their reason and does not pick them', () => {
    const onChange = vi.fn()
    render(<ControlledDate initial='2030-01-15' min='2030-01-10' onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Chọn ngày' }))
    const early = screen.getByRole('gridcell', { name: '05/01/2030' })
    expect(early).toHaveAttribute('aria-disabled', 'true')
    expect(early).toHaveAttribute('title', 'Too early')
    fireEvent.click(early)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('closes on Escape and on a press outside, returning focus to the input', () => {
    render(
      <>
        <ControlledDate initial='2030-01-15' />
        <p>{outsideText}</p>
      </>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Chọn ngày' }))
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' })
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Day' })).toHaveFocus()

    fireEvent.click(screen.getByRole('textbox', { name: 'Day' }))
    expect(screen.getByRole('grid')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Day' })).toHaveFocus()
    fireEvent.pointerDown(screen.getByText('Outside'))
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('accepts typed dd/mm/yyyy and leaves an unreadable value with a note', () => {
    const onChange = vi.fn()
    render(<ControlledDate onChange={onChange} />)
    const input = screen.getByRole('textbox', { name: 'Day' })
    fireEvent.change(input, { target: { value: '02/03/2031' } })
    expect(onChange).toHaveBeenCalledWith('2031-03-02')
    fireEvent.change(input, { target: { value: '31/02/2031' } })
    fireEvent.blur(input)
    expect(input).toHaveValue('31/02/2031')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/dd\/mm\/yyyy/)
  })
})

describe('Select', () => {
  it('stays a native single-choice select so keyboard, forms and tests keep working', () => {
    const onChange = vi.fn()
    render(
      <label>
        {statusLabel}
        <Select aria-invalid onChange={(event) => onChange(event.target.value)} value='a'>
          <option value='a'>{optionA}</option>
          <option value='b'>{optionB}</option>
        </Select>
      </label>
    )
    const select = screen.getByRole('combobox', { name: 'Status' })
    expect(select.tagName).toBe('SELECT')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    fireEvent.change(select, { target: { value: 'b' } })
    expect(onChange).toHaveBeenCalledWith('b')
  })
})
