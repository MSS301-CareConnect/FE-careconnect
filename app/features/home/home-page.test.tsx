import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { setAppLanguage } from '~/shared/i18n/i18n'

import { HomePage } from './home-page'

describe('HomePage', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setAppLanguage('vi', false)
  })

  it('renders Vietnamese copy from the translation resources', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: /nền tảng frontend đã sẵn sàng/i
      })
    ).toBeInTheDocument()
    expect(screen.getByText('API theo hợp đồng')).toBeInTheDocument()
  })

  it('switches every mapped label to English', async () => {
    render(<HomePage />)

    fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang Tiếng Anh' }))

    expect(
      await screen.findByRole('heading', {
        name: /frontend foundation is ready/i
      })
    ).toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('lang', 'en')
  })
})
