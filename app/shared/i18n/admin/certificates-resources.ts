// Admin certificate queue (/admin/certificates, 2026-11-09): step 5 of the certificate review.
export const adminCertificatesVi = {
  title: 'Duyệt chứng chỉ',
  description:
    'Chứng chỉ trung tâm đã xác nhận, kèm kết quả AI đọc ảnh và đối chiếu thông tin. Rủi ro cao được xếp lên đầu.',
  steps:
    'Quy trình: người chăm sóc khai báo và tải ảnh → trung tâm xác nhận → AI đọc ảnh, cảnh báo → admin quyết định.',
  stats: {
    total: 'Chờ duyệt',
    high: 'Rủi ro cao',
    undetermined: 'Chưa xác định',
    medium: 'Rủi ro trung bình',
    low: 'Rủi ro thấp',
    checking: 'AI đang kiểm tra',
    failed: 'AI lỗi'
  },
  filters: 'Bộ lọc',
  center: 'Trung tâm',
  allCenters: 'Tất cả trung tâm',
  allRisks: 'Mọi mức rủi ro',
  clear: 'Bỏ lọc',
  columns: {
    caregiver: 'Người chăm sóc',
    certificate: 'Chứng chỉ',
    confirmedAt: 'Trung tâm xác nhận',
    ai: 'Kết quả AI',
    warnings: 'Cảnh báo'
  },
  warningCount: '{{count}} cảnh báo',
  noWarning: 'Không có',
  open: 'Xem & duyệt',
  loading: 'Đang tải chứng chỉ chờ duyệt…',
  error: 'Không tải được chứng chỉ chờ duyệt.',
  empty: 'Không có chứng chỉ nào chờ duyệt.',
  emptyFiltered: 'Không có chứng chỉ khớp bộ lọc.',
  pagination: 'Phân trang chứng chỉ chờ duyệt'
}

export const adminCertificatesEn = {
  title: 'Certificate review',
  description:
    'Certificates the center confirmed, with the AI reading of the photos and the comparison. High risk comes first.',
  steps:
    'Flow: the caregiver declares and uploads photos → the center confirms → the AI reads and warns → the admin decides.',
  stats: {
    total: 'Waiting',
    high: 'High risk',
    undetermined: 'Undetermined',
    medium: 'Medium risk',
    low: 'Low risk',
    checking: 'AI checking',
    failed: 'AI failed'
  },
  filters: 'Filters',
  center: 'Center',
  allCenters: 'All centers',
  allRisks: 'Every risk level',
  clear: 'Clear filters',
  columns: {
    caregiver: 'Caregiver',
    certificate: 'Certificate',
    confirmedAt: 'Center confirmed',
    ai: 'AI result',
    warnings: 'Warnings'
  },
  warningCount: '{{count}} warnings',
  noWarning: 'None',
  open: 'Review',
  loading: 'Loading certificates to review…',
  error: 'The certificates to review could not be loaded.',
  empty: 'No certificates are waiting for review.',
  emptyFiltered: 'No certificates match the filters.',
  pagination: 'Certificate review pages'
}
