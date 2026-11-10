// Center Manager: caregiver xin hủy buổi — hàng đợi cần phân người khác (2026-11-09).
export const managerWithdrawalsVi = {
  title: 'Caregiver xin hủy buổi ({{count}})',
  description:
    'Hệ thống đang tự tìm người thay. Bạn có thể phân tay ngay ở trang chi tiết lịch; buổi còn 12 giờ mà chưa có người sẽ tự hủy và hoàn tiền cho khách.',
  loading: 'Đang tải yêu cầu hủy buổi…',
  error: 'Chưa tải được yêu cầu hủy buổi.',
  visit: 'Buổi {{number}} · {{time}}',
  caregiver: 'Người xin hủy: {{name}}',
  unknownCaregiver: 'Không rõ',
  reason: 'Lý do: {{reason}}',
  reasons: {
    PERSONAL: 'Việc cá nhân',
    OTHER: 'Lý do khác'
  },
  assign: 'Phân người khác',
  more: 'Còn {{count}} yêu cầu khác',
  inBooking: 'Caregiver đã xin hủy {{count}} buổi của lịch này',
  inBookingHint: 'Phân người khác cho từng buổi bên dưới (nút đổi người). Hệ thống cũng đang tự tìm người rảnh.'
}

export const managerWithdrawalsEn: typeof managerWithdrawalsVi = {
  title: 'Caregivers withdrew from visits ({{count}})',
  description:
    'The system is looking for replacements. You can assign someone yourself on the booking page; a visit still without a caregiver 12 hours before it starts is cancelled and refunded.',
  loading: 'Loading withdrawals…',
  error: 'Withdrawals could not be loaded.',
  visit: 'Visit {{number}} · {{time}}',
  caregiver: 'Withdrawn by: {{name}}',
  unknownCaregiver: 'Unknown',
  reason: 'Reason: {{reason}}',
  reasons: {
    PERSONAL: 'Personal matter',
    OTHER: 'Other reason'
  },
  assign: 'Assign someone else',
  more: '{{count}} more requests',
  inBooking: 'A caregiver withdrew from {{count}} visits of this booking',
  inBookingHint: 'Assign someone else to each visit below (change caregiver). The system is also looking for a free caregiver.'
}
