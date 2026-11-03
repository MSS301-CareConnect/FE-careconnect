export const patientProfilesEn = {
  documentTitle: 'Family profiles | CareConnect',
  header: {
    title: 'Family profiles',
    subtitle: 'Health and daily-life details help the caregiver give the right care from the first visit.',
    addPatient: 'Add profile'
  },
  toolbar: {
    searchLabel: 'Search profiles by name',
    searchPlaceholder: 'Search by full name',
    filterStatusLabel: 'Profile status',
    all: 'All',
    clear: 'Clear filters'
  },
  card: {
    more: 'Actions for {{name}}',
    viewDetails: 'View profile',
    edit: 'Edit details',
    delete: 'Delete profile',
    deleteTitle: 'Delete the profile of {{name}}?',
    confirmDelete: 'The profile is archived and hidden from your list. Past bookings stay as they are.',
    confirmDeleteButton: 'Delete profile',
    deleteError: 'Could not delete this profile. Please try again.',
    bookCare: 'Book care',
    avatarAlt: 'Photo of {{name}}'
  },
  states: {
    loading: 'Loading family profiles…',
    error: 'Could not load the profiles.',
    forbidden: 'Your account cannot view these profiles.',
    retry: 'Try again',
    emptyTitle: 'No family profiles yet',
    emptyDescription: 'Create a profile so the caregiver knows the health and habits of your relative.',
    noResults: 'No profile matches',
    noResultsHint: 'Try another name or clear the status filter.'
  },
  pagination: {
    label: 'Profile pages'
  }
} as const

export const patientProfilesVi = {
  documentTitle: 'Hồ sơ người thân | CareConnect',
  header: {
    title: 'Hồ sơ người thân',
    subtitle: 'Thông tin sức khỏe và sinh hoạt giúp người chăm sóc chăm đúng cách ngay từ buổi đầu.',
    addPatient: 'Thêm hồ sơ'
  },
  toolbar: {
    searchLabel: 'Tìm hồ sơ theo tên',
    searchPlaceholder: 'Tìm theo họ tên',
    filterStatusLabel: 'Trạng thái hồ sơ',
    all: 'Tất cả',
    clear: 'Xóa bộ lọc'
  },
  card: {
    more: 'Thao tác với hồ sơ {{name}}',
    viewDetails: 'Xem hồ sơ',
    edit: 'Sửa thông tin',
    delete: 'Xóa hồ sơ',
    deleteTitle: 'Xóa hồ sơ {{name}}?',
    confirmDelete: 'Hồ sơ sẽ được lưu trữ và ẩn khỏi danh sách của bạn. Các lịch đặt cũ vẫn giữ nguyên.',
    confirmDeleteButton: 'Xóa hồ sơ',
    deleteError: 'Không thể xóa hồ sơ này. Vui lòng thử lại.',
    bookCare: 'Đặt lịch',
    avatarAlt: 'Ảnh của {{name}}'
  },
  states: {
    loading: 'Đang tải hồ sơ người thân…',
    error: 'Không thể tải danh sách hồ sơ.',
    forbidden: 'Tài khoản của bạn không có quyền xem các hồ sơ này.',
    retry: 'Thử lại',
    emptyTitle: 'Chưa có hồ sơ người thân',
    emptyDescription: 'Tạo hồ sơ để người chăm sóc nắm rõ sức khỏe và thói quen của người thân bạn.',
    noResults: 'Không có hồ sơ phù hợp',
    noResultsHint: 'Thử tên khác hoặc bỏ lọc trạng thái.'
  },
  pagination: {
    label: 'Trang hồ sơ'
  }
} as const
