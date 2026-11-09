// Khách yêu cầu đổi người chăm sóc cho cả booking (2026-11-09: bỏ đổi theo từng buổi).
export const caregiverChangeVi = {
  open: 'Đổi người chăm sóc',
  title: 'Đổi người chăm sóc · {{code}}',
  scopeTitle: 'Áp dụng cho',
  scope: 'Tất cả {{count}} buổi chưa diễn ra của lịch này',
  scopeNone: 'Lịch này không còn buổi nào sắp tới để đổi người.',
  scopeNote:
    'Buổi bắt đầu trong vòng 12 giờ tới vẫn giữ người hiện tại. Trung tâm sẽ chọn người phù hợp và báo lại cho bạn.',
  firstVisits: 'Buổi gần nhất',
  reasonTitle: 'Lý do đổi người',
  reasons: {
    SKILL_MISMATCH: 'Kỹ năng chuyên môn chưa phù hợp',
    ATTITUDE_ISSUE: 'Thái độ giao tiếp / phục vụ chưa tốt',
    PUNCTUALITY_ISSUE: 'Không đúng giờ / hay đến muộn',
    PERSONAL_PREFERENCE: 'Gia đình muốn thử người khác',
    OTHER: 'Lý do khác'
  },
  detail: 'Mô tả cụ thể',
  detailPlaceholder: 'Ví dụ: gia đình cần người quen đo huyết áp và hỗ trợ đi lại…',
  detailRequired: 'Vui lòng mô tả lý do để trung tâm sắp xếp người phù hợp.',
  footer: 'Trung tâm sẽ xem xét và phản hồi sớm nhất.',
  back: 'Quay lại',
  submit: 'Gửi yêu cầu đổi',
  failed: 'Chưa gửi được yêu cầu đổi người chăm sóc. Vui lòng thử lại.'
}

export const caregiverChangeEn: typeof caregiverChangeVi = {
  open: 'Change caregiver',
  title: 'Change caregiver · {{code}}',
  scopeTitle: 'Applies to',
  scope: 'All {{count}} upcoming visits of this booking',
  scopeNone: 'This booking has no upcoming visit left to change.',
  scopeNote:
    'Visits starting within the next 12 hours keep the current caregiver. The center picks a suitable caregiver and lets you know.',
  firstVisits: 'Next visits',
  reasonTitle: 'Reason',
  reasons: {
    SKILL_MISMATCH: 'Skills do not fit the care needed',
    ATTITUDE_ISSUE: 'Manner or service was not good',
    PUNCTUALITY_ISSUE: 'Not on time / often late',
    PERSONAL_PREFERENCE: 'The family would like someone else',
    OTHER: 'Other reason'
  },
  detail: 'Details',
  detailPlaceholder: 'For example: the family needs someone used to blood-pressure checks and walking support…',
  detailRequired: 'Please describe the reason so the center can find a suitable caregiver.',
  footer: 'The center reviews the request and answers as soon as possible.',
  back: 'Back',
  submit: 'Send request',
  failed: 'The request could not be sent. Please try again.'
}
