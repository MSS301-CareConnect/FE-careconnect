export const adminCaregiverQueueVi = {
  title: 'Hàng chờ xác minh người chăm sóc',
  description:
    'Hồ sơ người chăm sóc của mọi trung tâm đang chờ admin duyệt. Duyệt xong người chăm sóc mới được nhận ca.',
  loading: 'Đang tải hàng chờ…',
  error: 'Không tải được hàng chờ xác minh.',
  retry: 'Thử lại',
  empty: 'Không có hồ sơ nào chờ xác minh.',
  experience: '{{count, number}} năm kinh nghiệm',
  openCenter: 'Xem tại trung tâm',
  approve: 'Duyệt',
  reason: 'Lý do từ chối',
  reject: 'Từ chối',
  decideError: 'Không lưu được quyết định — hồ sơ có thể vừa được cập nhật, vui lòng tải lại.',
  pagination: 'Phân trang hàng chờ',
  certificatesHint: 'Chứng chỉ của từng người chăm sóc được xác minh trong trang người chăm sóc của trung tâm.',
  centersLink: 'Danh sách trung tâm'
}

export const adminCaregiverQueueEn = {
  title: 'Caregiver verification queue',
  description:
    'Caregiver profiles from every center waiting for an admin decision. Only verified caregivers can take visits.',
  loading: 'Loading the queue…',
  error: 'The verification queue could not be loaded.',
  retry: 'Retry',
  empty: 'No profiles are waiting for verification.',
  experience: '{{count, number}} years of experience',
  openCenter: 'Open in center',
  approve: 'Approve',
  reason: 'Rejection reason',
  reject: 'Reject',
  decideError: 'The decision was not saved — the profile may have just changed. Please reload.',
  pagination: 'Queue pages',
  certificatesHint: "Each caregiver's certificates are verified on the center's caregiver page.",
  centersLink: 'Centers'
}
