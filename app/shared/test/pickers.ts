import { fireEvent, within } from '@testing-library/react'

/** Opens a `TimeSelect` (its combobox) and picks `time` ("09:00") from its listbox. */
export function pickTime(combobox: HTMLElement, time: string) {
  fireEvent.click(combobox)
  const listId = combobox.getAttribute('aria-controls')
  const list = listId ? combobox.ownerDocument.getElementById(listId) : null
  if (!list) throw new Error('The time list did not open')
  fireEvent.click(within(list).getByRole('option', { name: time }))
}
