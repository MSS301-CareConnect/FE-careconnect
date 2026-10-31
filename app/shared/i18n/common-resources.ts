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
    },
    toast: {
      region: 'Notifications',
      close: 'Close notification',
      retry: 'Retry',
      mediaUploaded: 'Files uploaded.',
      mediaRemoved: 'File removed.',
      mediaAction: 'update the files',
      systemError: 'Could not {{action}} because the system is having trouble. Your input is kept; please try again.'
    },
    serviceCategories: {
      elderly: 'Elderly care',
      postSurgery: 'Post-surgery',
      rehabilitation: 'Rehabilitation',
      chronic: 'Chronic illness',
      nursing: 'Medical nursing',
      motherBaby: 'Mother & baby',
      other: 'Other'
    },
    ui: {
      closeDialog: 'Close dialog',
      cancel: 'Cancel',
      confirm: 'Confirm',
      working: 'Working…',
      retry: 'Try again',
      unknownName: 'Unknown',
      loadingName: 'Loading…',
      Dismiss: 'Dismiss notification',
      offlineTitle: 'No internet connection',
      offlineDescription: 'Check your network connection. Actions will resume automatically when you are back online.',
      forbiddenTitle: 'Access denied',
      forbiddenDescription: 'Your account does not have permission to view or perform this action.',
      pagination: {
        label: 'Pagination',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {{page}} of {{total}}'
      }
    },
    status: {
      certificate: {
        PENDING: 'Pending verification',
        CENTER_VERIFIED: 'Center verified',
        ADMIN_VERIFIED: 'Admin verified',
        REJECTED: 'Rejected'
      },
      shift: {
        OPEN: 'Open',
        CLOSED: 'Closed',
        CANCELLED: 'Cancelled',
        COMPLETED: 'Completed'
      },
      registration: {
        PENDING: 'Pending approval',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        CANCELLED: 'Cancelled'
      },
      account: {
        ACTIVE: 'Active',
        LOCKED: 'Locked',
        INACTIVE: 'Inactive',
        PENDING: 'Pending'
      }
    }
  },
  errors: {
    genericDetails: 'This page could not be displayed. Refresh it and try again.',
    genericTitle: 'Unable to open this page',
    loading: 'Starting CareConnect…',
    notFoundDetails: 'The requested page could not be found.',
    notFoundTitle: 'Page not found',
    unauthorizedTitle: 'Please sign in again',
    unauthorizedDetails: 'Your session has expired. Sign in to continue.',
    forbiddenTitle: 'Access denied',
    forbiddenDetails: 'Your account does not have access to this page.',
    unavailableTitle: 'Service temporarily unavailable',
    unavailableDetails: 'Please wait a few minutes, then refresh the page.',
    request: {
      invalid: 'Please check the information you entered and try again.',
      unauthorized: 'Your session has expired. Sign in again to continue.',
      forbidden: 'Your account does not have permission for this action.',
      notFound: 'This item no longer exists. Refresh the page and try again.',
      conflict: 'This information has changed. Refresh the page before trying again.',
      rateLimited: 'Too many attempts. Wait a moment, then try again.',
      unavailable: 'The service is temporarily unavailable. Try again in a few minutes.',
      server: 'The service could not complete your request. Try again in a few minutes.',
      network: 'Connection lost. Check your internet connection and try again.'
    }
  },
  notFound: {
    action: 'Back to home',
    description: 'This route does not exist or has moved.',
    documentTitle: 'Page not found | CareConnect',
    eyebrow: 'CareConnect',
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
    },
    toast: {
      region: 'Thông báo',
      close: 'Đóng thông báo',
      retry: 'Thử lại',
      mediaUploaded: 'Đã tải tệp lên.',
      mediaRemoved: 'Đã xóa tệp.',
      mediaAction: 'cập nhật tệp',
      systemError: 'Chưa {{action}} được vì hệ thống đang gặp sự cố. Dữ liệu bạn nhập vẫn được giữ, hãy thử lại.'
    },
    serviceCategories: {
      elderly: 'Người cao tuổi',
      postSurgery: 'Sau phẫu thuật',
      rehabilitation: 'Phục hồi chức năng',
      chronic: 'Bệnh mạn tính',
      nursing: 'Điều dưỡng y tế',
      motherBaby: 'Mẹ và bé',
      other: 'Khác'
    },
    ui: {
      closeDialog: 'Đóng hộp thoại',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      working: 'Đang xử lý…',
      retry: 'Thử lại',
      unknownName: 'Không xác định',
      loadingName: 'Đang tải…',
      Dismiss: 'Đóng thông báo',
      offlineTitle: 'Mất kết nối mạng',
      offlineDescription: 'Vui lòng kiểm tra kết nối Internet. Các thao tác sẽ hoạt động trở lại khi có mạng.',
      forbiddenTitle: 'Không có quyền truy cập',
      forbiddenDescription: 'Tài khoản của bạn không có quyền xem hoặc thực hiện thao tác này.',
      pagination: {
        label: 'Phân trang',
        previous: 'Trước',
        next: 'Tiếp',
        pageOf: 'Trang {{page}} / {{total}}'
      }
    },
    status: {
      certificate: {
        PENDING: 'Chờ xác minh',
        CENTER_VERIFIED: 'Trung tâm đã duyệt',
        ADMIN_VERIFIED: 'Đã xác thực',
        REJECTED: 'Bị từ chối'
      },
      shift: {
        OPEN: 'Đang mở',
        CLOSED: 'Đã đóng',
        CANCELLED: 'Đã hủy',
        COMPLETED: 'Hoàn thành'
      },
      registration: {
        PENDING: 'Chờ duyệt',
        APPROVED: 'Đã duyệt',
        REJECTED: 'Từ chối',
        CANCELLED: 'Đã hủy'
      },
      account: {
        ACTIVE: 'Hoạt động',
        LOCKED: 'Đã khóa',
        INACTIVE: 'Ngưng hoạt động',
        PENDING: 'Chờ kích hoạt'
      }
    }
  },
  errors: {
    genericDetails: 'Không thể hiển thị trang này. Hãy tải lại và thử lần nữa.',
    genericTitle: 'Không thể mở trang',
    loading: 'Đang mở CareConnect…',
    notFoundDetails: 'Không tìm thấy trang bạn yêu cầu.',
    notFoundTitle: 'Không tìm thấy trang',
    unauthorizedTitle: 'Vui lòng đăng nhập lại',
    unauthorizedDetails: 'Phiên đăng nhập đã hết hạn. Đăng nhập để tiếp tục.',
    forbiddenTitle: 'Không có quyền truy cập',
    forbiddenDetails: 'Tài khoản của bạn không có quyền mở trang này.',
    unavailableTitle: 'Dịch vụ tạm thời gián đoạn',
    unavailableDetails: 'Vui lòng đợi vài phút rồi tải lại trang.',
    request: {
      invalid: 'Vui lòng kiểm tra thông tin đã nhập và thử lại.',
      unauthorized: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại để tiếp tục.',
      forbidden: 'Tài khoản của bạn không có quyền thực hiện thao tác này.',
      notFound: 'Thông tin này không còn tồn tại. Hãy tải lại trang và thử lại.',
      conflict: 'Thông tin đã thay đổi. Hãy tải lại trang trước khi thử lại.',
      rateLimited: 'Bạn đã thử quá nhiều lần. Hãy đợi một lúc rồi thử lại.',
      unavailable: 'Dịch vụ đang tạm gián đoạn. Hãy thử lại sau vài phút.',
      server: 'Dịch vụ chưa xử lý được yêu cầu. Hãy thử lại sau vài phút.',
      network: 'Mất kết nối. Hãy kiểm tra mạng rồi thử lại.'
    }
  },
  notFound: {
    action: 'Về trang chính',
    description: 'Đường dẫn này không tồn tại hoặc đã được di chuyển.',
    documentTitle: 'Không tìm thấy | CareConnect',
    eyebrow: 'CareConnect',
    title: 'Không tìm thấy trang'
  }
} as const
