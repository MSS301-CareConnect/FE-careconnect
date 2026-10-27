export const commonEn = {
  common: {
    brand: 'CareConnect',
    accountMenu: 'Account menu',
    providerMedia: {
      title: 'Files and images',
      centerTitle: 'Center logo and images',
      caregiverTitle: 'Caregiver profile photos',
      certificateTitle: 'Certificate files',
      caregiverHint:
        'The first photo is used as the profile photo. Remove the old photo before uploading a replacement.',
      centerHint: 'The first image is used as the center logo. Remove the old image before uploading a replacement.',
      empty: 'No files yet.',
      loading: 'Loading files…',
      error: 'Unable to load files.',
      upload: 'Upload files',
      remove: 'Remove file',
      open: 'Open file',
      image: 'Uploaded image',
      actionError: 'Unable to update files.',
      confirmRemove: 'Remove this file?',
      validation: {
        count: 'Select up to 10 files at a time.',
        type: 'This file type is not supported.',
        size: 'Files cannot be empty and must be no larger than {{maxSize}} MB.'
      }
    },
    language: {
      english: 'English',
      englishShort: 'EN',
      selector: 'Language',
      switchTo: 'Switch to {{language}}',
      vietnamese: 'Vietnamese',
      vietnameseShort: 'VI'
    }
  },
  errors: {
    genericDetails: 'An unexpected error occurred.',
    genericTitle: 'Error',
    loading: 'Starting CareConnect…',
    notFoundDetails: 'The requested page could not be found.',
    notFoundTitle: '404'
  },
  notFound: {
    action: 'Back to home',
    description: 'This route does not exist or has moved.',
    documentTitle: 'Page not found | CareConnect',
    eyebrow: '404',
    title: 'Page not found'
  }
} as const

export const commonVi = {
  common: {
    brand: 'CareConnect',
    accountMenu: 'Menu tài khoản',
    providerMedia: {
      title: 'Tệp và hình ảnh',
      centerTitle: 'Logo và hình ảnh trung tâm',
      caregiverTitle: 'Ảnh hồ sơ người chăm sóc',
      certificateTitle: 'Tệp chứng chỉ',
      caregiverHint: 'Ảnh đầu tiên được dùng làm ảnh hồ sơ. Hãy xóa ảnh cũ trước khi tải ảnh thay thế.',
      centerHint: 'Ảnh đầu tiên được dùng làm logo trung tâm. Hãy xóa ảnh cũ trước khi tải ảnh thay thế.',
      empty: 'Chưa có tệp.',
      loading: 'Đang tải tệp…',
      error: 'Không thể tải tệp.',
      upload: 'Tải tệp lên',
      remove: 'Xóa tệp',
      open: 'Mở tệp',
      image: 'Hình ảnh đã tải lên',
      actionError: 'Không thể cập nhật tệp.',
      confirmRemove: 'Xóa tệp này?',
      validation: {
        count: 'Mỗi lần chỉ được chọn tối đa 10 tệp.',
        type: 'Loại tệp này không được hỗ trợ.',
        size: 'Tệp không được để trống và không vượt quá {{maxSize}} MB.'
      }
    },
    language: {
      english: 'Tiếng Anh',
      englishShort: 'EN',
      selector: 'Ngôn ngữ',
      switchTo: 'Chuyển sang {{language}}',
      vietnamese: 'Tiếng Việt',
      vietnameseShort: 'VI'
    }
  },
  errors: {
    genericDetails: 'Đã xảy ra lỗi không mong muốn.',
    genericTitle: 'Lỗi',
    loading: 'Đang mở CareConnect…',
    notFoundDetails: 'Không tìm thấy trang bạn yêu cầu.',
    notFoundTitle: '404'
  },
  notFound: {
    action: 'Về trang chính',
    description: 'Đường dẫn này không tồn tại hoặc đã được di chuyển.',
    documentTitle: 'Không tìm thấy | CareConnect',
    eyebrow: '404',
    title: 'Không tìm thấy trang'
  }
} as const
