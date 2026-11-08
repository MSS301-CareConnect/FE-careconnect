import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { NotFoundPage } from './not-found-page'

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('provides a translated route back to the application', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Về trang chính' })).toHaveAttribute('href', '/')
  })

  it('keeps the browser title synchronized with the selected language', async () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    )

    expect(document.title).toBe('Không tìm thấy | CareConnect')

    await setAppLanguage('en', false)

    await waitFor(() => expect(document.title).toBe('Page not found | CareConnect'))
  })
})
