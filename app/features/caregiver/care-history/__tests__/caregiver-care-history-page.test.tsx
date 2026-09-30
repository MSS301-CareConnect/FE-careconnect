import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CaregiverCareHistoryPage } from '../caregiver-care-history-page'

function renderHistory(path = '/caregiver/history') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CaregiverCareHistoryPage />
    </MemoryRouter>
  )
}
describe('Caregiver history', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })
  it('paginates and opens the report belonging to each row', () => {
    renderHistory()
    expect(screen.getAllByRole('article')).toHaveLength(4)
    expect(screen.getAllByRole('link', { name: 'Xem báo cáo ca trực' })[1]).toHaveAttribute(
      'href',
      '/caregiver/shifts/BK-8790/report'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Xem báo cáo ca trực' })).toHaveAttribute(
      'href',
      '/caregiver/shifts/BK-8600/report'
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'BK-8790' } })
    expect(screen.getByRole('link', { name: 'Xem báo cáo ca trực' })).toHaveAttribute(
      'href',
      '/caregiver/shifts/BK-8790/report'
    )
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled()
  })
  it('restores URL filters, handles empty results, and changes language', async () => {
    renderHistory('/caregiver/history?month=2026-08&tab=supplement')
    expect(screen.getByRole('link', { name: 'Xem báo cáo ca trực' })).toHaveAttribute(
      'href',
      '/caregiver/shifts/BK-8510/report'
    )
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'absent' } })
    expect(screen.getByRole('heading', { name: 'Không tìm thấy ca chăm sóc' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xuất danh sách (CSV)' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Đặt lại bộ lọc' }))
    expect(screen.getAllByRole('article')).toHaveLength(4)
    await act(() => setAppLanguage('en', false))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Care History & Clinical Records')
  })
  it('exports only filtered records in a CSV download', async () => {
    const create = vi.fn<(blob: Blob) => string>(() => 'blob:history')
    const revoke = vi.fn()
    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    renderHistory('/caregiver/history?q=BK-8790')
    fireEvent.click(screen.getByRole('button', { name: 'Xuất danh sách (CSV)' }))
    expect(create).toHaveBeenCalledOnce()
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsText(create.mock.calls[0][0])
    })
    expect(csv).toContain('BK-8790')
    expect(csv).not.toContain('BK-8821')
    expect(csv.split('\r\n')).toHaveLength(2)
    expect(click).toHaveBeenCalledOnce()
    expect(revoke).toHaveBeenCalledWith('blob:history')
    click.mockRestore()
    vi.unstubAllGlobals()
  })
})
