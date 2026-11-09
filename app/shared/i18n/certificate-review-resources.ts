// Certificate review copy (2026-11-09): AI check result, risk levels and the admin decision dialog
// (entities/provider), used by the admin certificate queue and the admin center caregiver page; the AI check state
// is also shown to center managers.
export const certificateReviewVi = {
  statuses: {
    PENDING: 'chờ trung tâm xác nhận',
    CENTER_VERIFIED: 'chờ admin duyệt',
    ADMIN_VERIFIED: 'đã xác minh',
    REJECTED: 'đã từ chối'
  },
  riskLevels: {
    LOW: 'Rủi ro thấp',
    MEDIUM: 'Rủi ro trung bình',
    HIGH: 'Rủi ro cao',
    UNDETERMINED: 'Chưa xác định'
  },
  riskHints: {
    LOW: 'Thông tin chính khớp và chứng chỉ chưa hết hạn.',
    MEDIUM: 'Một số thông tin phụ như tên chứng chỉ, đơn vị cấp hoặc ngày tháng chưa khớp.',
    HIGH: 'Tên người chăm sóc hoặc số chứng chỉ không khớp, hoặc chứng chỉ đã hết hạn.',
    UNDETERMINED: 'AI không đọc được nội dung ảnh.'
  },
  aiStatuses: {
    NONE: 'Chưa kiểm tra AI',
    QUEUED: 'Chờ AI kiểm tra',
    PROCESSING: 'AI đang đọc ảnh',
    COMPLETED: 'AI đã kiểm tra',
    FAILED: 'AI kiểm tra lỗi'
  },
  managerAiStatuses: {
    QUEUED: 'Đã gửi AI đối chiếu ảnh — chờ admin duyệt.',
    PROCESSING: 'AI đang đối chiếu ảnh — chờ admin duyệt.',
    COMPLETED: 'AI đã đối chiếu ảnh — chờ admin duyệt.',
    FAILED: 'Đang chờ admin duyệt.'
  },
  fields: {
    HOLDER_NAME: 'Họ tên người được cấp',
    CREDENTIAL_NUMBER: 'Số chứng chỉ',
    CERTIFICATE_NAME: 'Tên chứng chỉ',
    ISSUED_BY: 'Đơn vị cấp',
    ISSUED_DATE: 'Ngày cấp',
    EXPIRY_DATE: 'Ngày hết hạn'
  },
  warnings: {
    NO_IMAGE: 'Chứng chỉ chưa có ảnh nào để AI đọc.',
    UNSUPPORTED_FILE: 'Chỉ có file AI không đọc được (PDF). Hãy tự mở file để đối chiếu.',
    UNREADABLE: 'AI không đọc được nội dung ảnh (ảnh mờ, bị che hoặc không phải chứng chỉ).',
    MISMATCH: '{{field}}: thông tin khai báo khác với trên ảnh.',
    NOT_FOUND: '{{field}}: không thấy trên ảnh.',
    EXPIRED: 'Chứng chỉ đã hết hạn.',
    OTHER: 'AI có một cảnh báo khác.'
  },
  results: {
    match: 'Khớp',
    mismatch: 'Không khớp',
    notFound: 'Không thấy trên ảnh',
    notDeclared: 'Không khai báo',
    expired: 'Đã hết hạn'
  },
  dialog: {
    title: 'Duyệt chứng chỉ',
    caregiver: 'Người chăm sóc',
    center: 'Trung tâm',
    photos: 'Ảnh chứng chỉ',
    comparison: 'Đối chiếu thông tin',
    field: 'Thông tin',
    declared: 'Người chăm sóc khai báo',
    extracted: 'AI đọc được',
    result: 'Kết quả',
    warningsTitle: 'Cảnh báo của AI',
    noWarnings: 'AI không phát hiện điểm bất thường.',
    aiCheckedAt: 'AI kiểm tra lúc {{time}}',
    centerConfirmedAt: 'Trung tâm xác nhận lúc {{time}}',
    centerNote: 'Ghi chú của trung tâm: {{note}}',
    checking: 'AI đang đọc ảnh chứng chỉ, kết quả sẽ có sau ít phút. Bạn vẫn có thể tự đối chiếu và quyết định.',
    failed: 'AI không kiểm tra được sau nhiều lần thử. Hãy chạy lại hoặc tự đối chiếu ảnh.',
    notChecked: 'Chứng chỉ này chưa được AI kiểm tra.',
    advisory: 'Kết quả AI chỉ để tham khảo; quyết định cuối cùng thuộc về admin.',
    rerun: 'Chạy lại AI',
    reason: 'Lý do / ghi chú',
    reasonHint: 'Bắt buộc khi từ chối, và khi duyệt mà AI chưa cho kết quả rủi ro thấp hoặc trung bình.',
    reasonRequiredReject: 'Nhập lý do từ chối.',
    reasonRequiredRisk: 'Kết quả AI chưa ở mức thấp hoặc trung bình — nhập lý do để duyệt.',
    approve: 'Duyệt chứng chỉ',
    reject: 'Từ chối',
    revoke: 'Thu hồi xác minh',
    close: 'Đóng',
    alreadyDecided: 'Chứng chỉ đã được quyết định: {{status}}.'
  },
  toast: {
    approved: 'Đã duyệt chứng chỉ {{name}}.',
    rejected: 'Đã từ chối chứng chỉ {{name}}.',
    aiQueued: 'Đã gửi chứng chỉ {{name}} cho AI kiểm tra lại.'
  },
  errors: {
    e4251: 'Chứng chỉ vừa được cập nhật. Hãy tải lại rồi thử lại.',
    e4253: 'Chứng chỉ không còn ở bước này. Hãy tải lại.',
    e4254: 'Chứng chỉ đã hết hạn, không thể duyệt.',
    e4255: 'Hãy để người chăm sóc tải ảnh chứng chỉ lên trước khi xác nhận.',
    e4256: 'Kết quả AI chưa ở mức thấp hoặc trung bình — nhập lý do để duyệt.',
    e4257: 'Chỉ chạy AI được với chứng chỉ trung tâm đã xác nhận.',
    generic: 'Không lưu được thao tác. Hãy thử lại.'
  }
}

export const certificateReviewEn = {
  statuses: {
    PENDING: 'waiting for the center',
    CENTER_VERIFIED: 'waiting for the admin',
    ADMIN_VERIFIED: 'verified',
    REJECTED: 'rejected'
  },
  riskLevels: {
    LOW: 'Low risk',
    MEDIUM: 'Medium risk',
    HIGH: 'High risk',
    UNDETERMINED: 'Undetermined'
  },
  riskHints: {
    LOW: 'The main details match and the certificate has not expired.',
    MEDIUM: 'Some secondary details such as the certificate name, issuer or dates do not match.',
    HIGH: 'The caregiver name or certificate number does not match, or the certificate has expired.',
    UNDETERMINED: 'The AI could not read the photos.'
  },
  aiStatuses: {
    NONE: 'Not checked by AI',
    QUEUED: 'Waiting for the AI check',
    PROCESSING: 'AI is reading the photos',
    COMPLETED: 'Checked by AI',
    FAILED: 'AI check failed'
  },
  managerAiStatuses: {
    QUEUED: 'Sent to the AI photo check — waiting for the admin.',
    PROCESSING: 'The AI is checking the photos — waiting for the admin.',
    COMPLETED: 'The AI checked the photos — waiting for the admin.',
    FAILED: 'Waiting for the admin.'
  },
  fields: {
    HOLDER_NAME: 'Holder name',
    CREDENTIAL_NUMBER: 'Certificate number',
    CERTIFICATE_NAME: 'Certificate name',
    ISSUED_BY: 'Issued by',
    ISSUED_DATE: 'Issue date',
    EXPIRY_DATE: 'Expiry date'
  },
  warnings: {
    NO_IMAGE: 'The certificate has no photo for the AI to read.',
    UNSUPPORTED_FILE: 'Only files the AI cannot read (PDF). Open them to compare yourself.',
    UNREADABLE: 'The AI could not read the photos (blurred, covered or not a certificate).',
    MISMATCH: '{{field}}: the declared value differs from the photo.',
    NOT_FOUND: '{{field}}: not found on the photo.',
    EXPIRED: 'The certificate has expired.',
    OTHER: 'The AI raised another warning.'
  },
  results: {
    match: 'Matches',
    mismatch: 'Differs',
    notFound: 'Not on the photo',
    notDeclared: 'Not declared',
    expired: 'Expired'
  },
  dialog: {
    title: 'Review certificate',
    caregiver: 'Caregiver',
    center: 'Center',
    photos: 'Certificate photos',
    comparison: 'Comparison',
    field: 'Detail',
    declared: 'Declared by the caregiver',
    extracted: 'Read by the AI',
    result: 'Result',
    warningsTitle: 'AI warnings',
    noWarnings: 'The AI found nothing unusual.',
    aiCheckedAt: 'AI checked at {{time}}',
    centerConfirmedAt: 'Center confirmed at {{time}}',
    centerNote: 'Center note: {{note}}',
    checking:
      'The AI is reading the photos; the result arrives within a few minutes. You can still compare and decide.',
    failed: 'The AI check failed after several attempts. Run it again or compare the photos yourself.',
    notChecked: 'The AI has not checked this certificate.',
    advisory: 'The AI result is advice only; the admin makes the final decision.',
    rerun: 'Run AI again',
    reason: 'Reason / note',
    reasonHint: 'Required to reject, and to approve without a low or medium AI risk result.',
    reasonRequiredReject: 'Enter a rejection reason.',
    reasonRequiredRisk: 'The AI result is not low or medium — enter a reason to approve.',
    approve: 'Approve certificate',
    reject: 'Reject',
    revoke: 'Revoke verification',
    close: 'Close',
    alreadyDecided: 'The certificate was already decided: {{status}}.'
  },
  toast: {
    approved: 'Certificate {{name}} approved.',
    rejected: 'Certificate {{name}} rejected.',
    aiQueued: 'Certificate {{name}} was sent to the AI check again.'
  },
  errors: {
    e4251: 'The certificate was just updated. Reload and try again.',
    e4253: 'The certificate is no longer at this step. Reload.',
    e4254: 'The certificate has expired and cannot be approved.',
    e4255: 'Ask the caregiver to upload a photo of the certificate before confirming it.',
    e4256: 'The AI result is not low or medium — enter a reason to approve.',
    e4257: 'The AI can only check a certificate the center has confirmed.',
    generic: 'The action was not saved. Try again.'
  }
}
