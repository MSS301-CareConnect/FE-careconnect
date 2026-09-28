import { fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { setAppLanguage } from '~/shared/i18n/i18n'
import { CustomerCareReportPage } from '../care-report-page'
import { CustomerBookingDetailPage } from '../booking-detail-page'

function openReportReview() {
  render(
    <MemoryRouter>
      <CustomerCareReportPage code='CC-BK-9750' />
    </MemoryRouter>
  )
  const trigger = screen.getAllByRole('button', { name: 'Đánh giá điều dưỡng' })[0]
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

describe('BookingReviewModal', () => {
  beforeEach(async () => {
    await setAppLanguage('vi', false)
  })

  it('opens from the report and restores focus and scroll when dismissed', () => {
    const trigger = openReportReview()
    const dialog = screen.getByRole('dialog', { name: 'Đánh giá & nhận xét người chăm sóc' })
    expect(dialog).toHaveAttribute('open')
    expect(within(dialog).getByText('ĐD. Lê Thị Thanh Mai')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đóng đánh giá' })).toHaveFocus()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Để sau' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('keeps draft choices when closed and reopened without sending a review or payment', () => {
    const trigger = openReportReview()
    fireEvent.click(screen.getByRole('radio', { name: '4 sao' }))
    fireEvent.click(screen.getByRole('button', { name: 'Chuyên môn vững vàng' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Nhận xét & góp ý chi tiết' }), {
      target: { value: 'Chăm sóc chu đáo' }
    })
    fireEvent.click(screen.getByRole('radio', { name: /50\.000/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Đóng đánh giá' }))
    fireEvent.click(trigger)
    expect(screen.getByRole('radio', { name: '4 sao' })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Chuyên môn vững vàng' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('textbox')).toHaveValue('Chăm sóc chu đáo')
    expect(screen.getByRole('radio', { name: /50\.000/ })).toBeChecked()
    expect(screen.getByRole('button', { name: 'Gửi đánh giá' })).toBeDisabled()
  })

  it('limits comments and controls anonymous display according to the public choice', () => {
    openReportReview()
    const comment = screen.getByRole('textbox')
    fireEvent.change(comment, { target: { value: 'a'.repeat(600) } })
    expect(comment).toHaveValue('a'.repeat(500))
    expect(comment).toHaveAttribute('maxlength', '500')
    fireEvent.click(screen.getByRole('checkbox', { name: 'Hiển thị nhận xét công khai trên hồ sơ điều dưỡng' }))
    expect(screen.getByRole('checkbox', { name: 'Hiển thị đánh giá ẩn danh' })).toBeDisabled()
  })

  it('opens on completed booking details and closes on the native Escape cancel event', () => {
    render(
      <MemoryRouter>
        <CustomerBookingDetailPage code='CC-BK-9750' />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Đánh giá điều dưỡng' }))
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('translates the open modal when language changes', async () => {
    openReportReview()
    await setAppLanguage('en', false)
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Rate and review your caregiver' })).toBeInTheDocument()
    )
    expect(screen.getByRole('button', { name: 'Send review' })).toBeDisabled()
  })
})
