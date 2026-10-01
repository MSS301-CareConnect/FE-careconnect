import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { AdminCentersPage } from '../admin-centers-page'

function Location() {
  const location = useLocation()
  return <output data-testid='location'>{location.pathname + location.search}</output>
}

function renderPage(path = '/admin/centers') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminCentersPage />} path='/admin/centers' />
      </Routes>
      <Location />
    </MemoryRouter>
  )
}

describe('Admin partner centers preview', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('filters pending centers, previews the selected application and blocks approval', () => {
    renderPage()
    fireEvent.click(screen.getByRole('tab', { name: 'Chờ duyệt Onboard' }))
    expect(screen.getByText('2 trung tâm trong mẫu')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('tab=pending')
    const table = screen.getByRole('table')
    expect(within(table).getByText('TT Chăm sóc Y tế Gia đình An Nhiên')).toBeInTheDocument()
    expect(within(table).queryByText('TT Điều dưỡng & CS Tại nhà Sài Gòn Care')).not.toBeInTheDocument()
    fireEvent.click(within(table).getByText('TT Chăm sóc Y tế Gia đình An Nhiên'))
    expect(screen.getByRole('dialog', { name: 'Hồ sơ trung tâm đối tác' })).toHaveTextContent('0317894521')
    expect(screen.getAllByRole('button', { name: 'Duyệt Onboard' })[0]).toBeDisabled()
  })

  it('uses region filtering and English resources', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Khu vực'), { target: { value: 'DN' } })
    expect(screen.getByText('1 trung tâm trong mẫu')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('region=DN')
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Partner care center management')
    expect(screen.getByText('1 sample centers')).toBeInTheDocument()
  })
})
