import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { closeCenterPicker, promptCenterPickerOnce, selectCenter, useSelectedCenter } from './selected-center'

describe('selected center', () => {
  beforeEach(() => {
    selectCenter(null)
    closeCenterPicker()
    sessionStorage.clear()
  })

  it('remembers the chosen center in browser storage and closes the picker', () => {
    const { result } = renderHook(() => useSelectedCenter())
    act(() => promptCenterPickerOnce())
    expect(result.current.pickerOpen).toBe(true)

    act(() => selectCenter({ id: 'center-a', name: 'An Khang' }))
    expect(result.current).toEqual({ center: { id: 'center-a', name: 'An Khang' }, pickerOpen: false })
    expect(JSON.parse(localStorage.getItem('careconnect.selected-center') ?? 'null')).toEqual({
      id: 'center-a',
      name: 'An Khang'
    })
  })

  it('prompts once per browser session and never when a center is already chosen', () => {
    const { result } = renderHook(() => useSelectedCenter())
    act(() => promptCenterPickerOnce())
    act(() => closeCenterPicker())
    act(() => promptCenterPickerOnce())
    expect(result.current.pickerOpen).toBe(false)

    sessionStorage.clear()
    act(() => selectCenter({ id: 'center-a', name: 'An Khang' }))
    act(() => promptCenterPickerOnce())
    expect(result.current.pickerOpen).toBe(false)
  })
})
