// Center Manager: caregiver xin hủy buổi — hàng đợi cần phân người khác (2026-11-09).
export const managerWithdrawalsVi = {
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
  inBooking: 'Caregiver đã xin hủy {{count}} buổi của lịch này',
  inBookingHint: 'Phân người khác cho từng buổi bên dưới (nút đổi người). Hệ thống cũng đang tự tìm người rảnh.'
}

// Center Manager: ca hệ thống tự đóng chờ trung tâm xác nhận trước khi quyết toán (2026-11-11).
export const managerSessionReviewVi = {
  description:
    'Ca do hệ thống tự đóng (người chăm sóc không check-out) hoặc bị khách phản ánh trong 24 giờ sau khi kết thúc. Tiền buổi được giữ lại tới khi trung tâm xác nhận buổi có được thực hiện hay không.',
  customerReport: 'Khách phản ánh:',
  visit: 'Buổi {{number}} · {{time}}',
  checkedIn: 'Check-in lúc {{time}}',
  delivered: 'Đã thực hiện',
  notDelivered: 'Không thực hiện',
  deliveredTitle: 'Xác nhận buổi {{number}} đã được thực hiện?',
  deliveredHint: 'Buổi được quyết toán như bình thường. Kết luận không sửa lại được.',
  notDeliveredTitle: 'Buổi {{number}} không được thực hiện',
  notDeliveredHint:
    'Khách được hoàn 100 % tiền buổi này vào ví và người chăm sóc bị ghi một lần vắng ca. Kết luận không sửa lại được.',
  note: 'Lý do'
}

export const managerSessionReviewEn: typeof managerSessionReviewVi = {
  description:
    'Visits the system closed because the caregiver never checked out, or that the customer reported within 24 hours after they ended. Their money is held until the center says whether the visit was delivered.',
  customerReport: 'Customer report:',
  visit: 'Visit {{number}} · {{time}}',
  checkedIn: 'Checked in at {{time}}',
  delivered: 'Delivered',
  notDelivered: 'Not delivered',
  deliveredTitle: 'Confirm visit {{number}} was delivered?',
  deliveredHint: 'The visit is settled as usual. The conclusion cannot be changed.',
  notDeliveredTitle: 'Visit {{number}} was not delivered',
  notDeliveredHint:
    'The customer is refunded this visit in full to the wallet and the caregiver gets an absence record. The conclusion cannot be changed.',
  note: 'Reason'
}

export const managerWithdrawalsEn: typeof managerWithdrawalsVi = {
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
  inBooking: 'A caregiver withdrew from {{count}} visits of this booking',
  inBookingHint:
    'Assign someone else to each visit below (change caregiver). The system is also looking for a free caregiver.'
}

export const managerAttentionVi = {
  label: 'Việc cần trung tâm xử lý',
  loading: 'Đang tải…',
  empty: 'Không còn mục nào cần xử lý.',
  details: 'Chi tiết',
  close: 'Đóng',
  cards: {
    unassigned: { title: 'Buổi chưa có người chăm sóc', hint: 'Bị hủy và hoàn tiền nếu không phân kịp' },
    withdrawals: { title: 'Người chăm sóc xin rút ca', hint: 'Buổi cần người khác thay' },
    reviews: { title: 'Ca chờ trung tâm xác nhận', hint: 'Tiền buổi đang được giữ lại' },
    absences: { title: 'Người chăm sóc vắng ca', hint: 'Cần kết luận: có lý do hay vi phạm' }
  },
  dialogTitle: '{{title}} ({{count}})',
  unassigned: {
    description:
      'Khách đã thanh toán nhưng hệ thống chưa tìm được người: chỉ người có ca làm việc đã duyệt phủ giờ buổi mới được tự phân công. Mở ca cho khung giờ đó hoặc phân công tay trước giờ hủy.',
    visit: 'Buổi {{number}} · {{time}}',
    replacement: 'Cần người thay',
    cancelAt: 'Tự hủy và hoàn tiền lúc {{time}} nếu chưa có người',
    openShift: 'Mở ca cho giờ này',
    assign: 'Phân công'
  }
}

export const managerAttentionEn: typeof managerAttentionVi = {
  label: 'Needs the center',
  loading: 'Loading…',
  empty: 'Nothing is waiting any more.',
  details: 'Details',
  close: 'Close',
  cards: {
    unassigned: { title: 'Visits without a caregiver', hint: 'Cancelled and refunded if not assigned in time' },
    withdrawals: { title: 'Caregivers withdrew from visits', hint: 'Visits that need someone else' },
    reviews: { title: 'Visits waiting for the center', hint: 'Their money is held' },
    absences: { title: 'Caregiver absences', hint: 'Decide: excused or a violation' }
  },
  dialogTitle: '{{title}} ({{count}})',
  unassigned: {
    description:
      'The customer paid but nobody could be assigned yet: auto-assign only picks caregivers whose approved shifts cover the visit. Open a shift for that time or assign someone before the cancel time.',
    visit: 'Visit {{number}} · {{time}}',
    replacement: 'Needs a replacement',
    cancelAt: 'Cancelled and refunded at {{time}} if still unassigned',
    openShift: 'Open a shift for this time',
    assign: 'Assign'
  }
}
