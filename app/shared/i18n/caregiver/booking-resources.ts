// Caregiver: buổi gom theo booking, trang chi tiết booking, xin hủy buổi (2026-11-09).
export const caregiverBookingVi = {
  groups: {
    openLabel: 'Mở lịch {{code}} của {{name}}',
    visits: '{{count}} buổi',
    next: 'Buổi kế tiếp: {{time}}',
    range: '{{from}} → {{to}}',
    toAnswer: '{{count}} buổi cần xác nhận',
    replacing: '{{count}} buổi chờ thay người',
    open: 'Xem các buổi'
  },
  page: {
    documentTitle: 'Lịch {{code}}',
    crumb: 'Lịch {{code}}',
    title: 'Lịch chăm sóc {{name}}',
    loading: 'Đang tải các buổi…',
    error: 'Chưa tải được các buổi của lịch này.',
    notFound: 'Lịch này không còn buổi nào được giao cho bạn.',
    back: 'Về danh sách buổi',
    upcoming: 'Sắp tới ({{count}})',
    past: 'Đã qua / đã đóng ({{count}})',
    noUpcoming: 'Không còn buổi nào sắp tới.',
    withdrawAll: 'Xin hủy các buổi còn lại',
    withdrawAllHint: 'Chỉ các buổi còn hơn 24 giờ mới bắt đầu được hủy.'
  },
  badge: {
    replacing: 'Đã xin hủy — chờ thay người'
  },
  withdraw: {
    open: 'Xin hủy buổi này',
    title: 'Xin hủy buổi chăm sóc',
    titleMany: 'Xin hủy {{count}} buổi',
    intro:
      'Trung tâm (hoặc hệ thống) sẽ phân người khác cho các buổi này. Bạn vẫn đứng tên buổi cho tới khi có người thay, nhưng không bắt đầu được ca.',
    visits: 'Các buổi sẽ xin hủy',
    kept: 'Các buổi còn dưới 24 giờ — bạn vẫn phụ trách',
    none: 'Không còn buổi nào đủ điều kiện (phải còn hơn 24 giờ mới bắt đầu).',
    tooLate: 'Chỉ hủy được buổi còn hơn 24 giờ mới bắt đầu. Liên hệ trung tâm nếu có việc gấp.',
    alreadyRequested: 'Bạn đã xin hủy buổi này, đang chờ trung tâm thay người.',
    reasonTitle: 'Lý do',
    reasons: {
      PERSONAL: 'Việc cá nhân',
      OTHER: 'Lý do khác'
    },
    detail: 'Ghi chú cho trung tâm',
    detailOptional: 'Ghi chú cho trung tâm (không bắt buộc)',
    detailRequired: 'Vui lòng ghi rõ lý do.',
    cancel: 'Quay lại',
    submit: 'Gửi yêu cầu hủy',
    sent: 'Đã gửi yêu cầu hủy, trung tâm sẽ phân người khác.',
    errors: {
      e5260: 'Buổi này còn chưa tới 24 giờ nữa là bắt đầu nên không hủy được.',
      e5261: 'Bạn đã xin hủy buổi này rồi.',
      e5262: 'Buổi này không còn hủy được.',
      e5263: 'Vui lòng ghi rõ lý do.',
      generic: 'Chưa gửi được yêu cầu hủy. Vui lòng thử lại.'
    }
  }
}

export const caregiverBookingEn: typeof caregiverBookingVi = {
  groups: {
    openLabel: 'Open booking {{code}} for {{name}}',
    visits: '{{count}} visits',
    next: 'Next visit: {{time}}',
    range: '{{from}} → {{to}}',
    toAnswer: '{{count}} visits to confirm',
    replacing: '{{count}} visits being replaced',
    open: 'See visits'
  },
  page: {
    documentTitle: 'Booking {{code}}',
    crumb: 'Booking {{code}}',
    title: 'Care for {{name}}',
    loading: 'Loading the visits…',
    error: 'The visits of this booking could not be loaded.',
    notFound: 'This booking has no visit assigned to you any more.',
    back: 'Back to visits',
    upcoming: 'Upcoming ({{count}})',
    past: 'Past / closed ({{count}})',
    noUpcoming: 'No upcoming visit left.',
    withdrawAll: 'Withdraw from the remaining visits',
    withdrawAllHint: 'Only visits starting more than 24 hours from now can be withdrawn.'
  },
  badge: {
    replacing: 'Withdrawn — being replaced'
  },
  withdraw: {
    open: 'Withdraw from this visit',
    title: 'Withdraw from a visit',
    titleMany: 'Withdraw from {{count}} visits',
    intro:
      'The center (or the system) assigns another caregiver to these visits. They stay in your name until someone takes them, but you cannot start them.',
    visits: 'Visits to withdraw from',
    kept: 'Visits less than 24 hours away — still yours',
    none: 'No visit qualifies (it must start more than 24 hours from now).',
    tooLate: 'Only visits starting more than 24 hours from now can be withdrawn. Contact the center if it is urgent.',
    alreadyRequested: 'You have withdrawn from this visit; the center is finding a replacement.',
    reasonTitle: 'Reason',
    reasons: {
      PERSONAL: 'Personal matter',
      OTHER: 'Other reason'
    },
    detail: 'Note for the center',
    detailOptional: 'Note for the center (optional)',
    detailRequired: 'Please describe the reason.',
    cancel: 'Back',
    submit: 'Send withdrawal',
    sent: 'Withdrawal sent; the center will assign someone else.',
    errors: {
      e5260: 'This visit starts in less than 24 hours, so it cannot be withdrawn.',
      e5261: 'You have already withdrawn from this visit.',
      e5262: 'This visit can no longer be withdrawn.',
      e5263: 'Please describe the reason.',
      generic: 'The withdrawal could not be sent. Please try again.'
    }
  }
}
