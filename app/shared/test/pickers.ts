import { fireEvent, waitFor, within } from '@testing-library/react'
import { expect } from 'vitest'

/** Opens a `TimeSelect` (its combobox) and picks `time` ("09:00") from its listbox. */
export function pickTime(combobox: HTMLElement, time: string) {
  fireEvent.click(combobox)
  const listId = combobox.getAttribute('aria-controls')
  const list = listId ? combobox.ownerDocument.getElementById(listId) : null
  if (!list) throw new Error('The time list did not open')
  fireEvent.click(within(list).getByRole('option', { name: time }))
}

/**
 * Opens a `Combobox` once its options are ready, narrows the list with `search` (or the option name) and picks the
 * option with that accessible name ("Phường Ba Đình").
 */
export async function pickOption(combobox: HTMLElement, name: string, search = name) {
  await waitFor(() => expect(combobox).toBeEnabled())
  fireEvent.click(combobox)
  const listId = combobox.getAttribute('aria-controls')
  const list = listId ? combobox.ownerDocument.getElementById(listId) : null
  if (!list) throw new Error('The option list did not open')
  fireEvent.change(within(list.parentElement ?? list).getByRole('searchbox'), { target: { value: search } })
  fireEvent.click(within(list).getByRole('option', { name }))
}
