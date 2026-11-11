export const commonEn = {
  common: {
    brand: 'CareConnect',
    format: {
      hours_one: '{{count}} hour',
      hours_other: '{{count}} hours',
      minutes_one: '{{count}} min',
      minutes_other: '{{count}} min',
      hoursMinutes: '{{hours}} h {{minutes}} min'
    },
    price: {
      discount: '−{{percent}}%',
      original: 'Original price {{price}}'
    },
    charts: {
      empty: 'No data in this period yet.',
      total: 'Total',
      share: '{{percent}} of the total',
      point: '{{label}}: {{values}}'
    },
    kit: {
      ratingNew: 'New',
      ratingLabel: 'Rated {{rating}} out of 5 from {{count}} reviews',
      verified: 'Verified',
      clearSearch: 'Clear search',
      viewer: {
        label: 'Image viewer: {{name}}',
        view: 'View image {{name}}',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        reset: 'Reset zoom',
        open: 'Open the original in a new tab',
        close: 'Close the viewer',
        previous: 'Previous image',
        next: 'Next image',
        counter: '{{current}} / {{total}}',
        hint: 'Scroll or press + / − to zoom, drag to move, Esc to close'
      },
      fileDrop: {
        choose: 'Choose files',
        chooseOne: 'Choose a file',
        drop: 'Click to choose, or drop files here',
        dropActive: 'Drop to add',
        remove: 'Remove {{name}}',
        selected: '{{count}} file(s) selected'
      },
      stepOf: 'Step {{current}} of {{total}}',
      stepDone: '(done)',
      stepCurrent: '(current step)',
      stepTodo: '(not reached)',
      datePlaceholder: 'dd/mm/yyyy',
      openCalendar: 'Choose a date',
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      invalidDate: 'Enter a date as dd/mm/yyyy.',
      dateTooEarly: 'Pick a date on or after {{date}}.',
      dateTooLate: 'Pick a date on or before {{date}}.',
      today: 'Today',
      chooseTime: 'Choose a time',
      timePlaceholder: '--:--',
      chooseMonthYear: 'Choose month and year',
      backToDays: 'Back to days',
      previousYear: 'Previous year',
      nextYear: 'Next year',
      calendarHint: 'Arrows move by day, Page Up / Page Down by month, Enter picks, Esc closes',
      timeGroups: { night: 'Night', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
      closePanel: 'Close panel',
      loadingPage: 'Loading page…',
      skipToContent: 'Skip to main content',
      characters: '{{count}}/{{max}} characters',
      copy: 'Copy',
      copied: 'Copied',
      more: 'More actions',
      combobox: {
        search: 'Search…',
        empty: 'Nothing matches “{{query}}”',
        count_one: '{{count}} result',
        count_other: '{{count}} results',
        loading: 'Loading…'
      }
    },
    accountMenu: 'Account menu',
    address: {
      province: 'Province / city',
      ward: 'Ward / commune',
      addressLine: 'Street address',
      provincePlaceholder: 'Choose a province or city',
      wardPlaceholder: 'Choose a ward or commune',
      addressLinePlaceholder: 'e.g. 45 Kim Ma Street, lane 12',
      provinceSearch: 'Search 34 provinces and cities…',
      wardSearch: 'Search {{count}} wards and communes…',
      provinceFirst: 'Choose the province or city first.',
      addressLineHint: 'House number, lane or alley, street, building.',
      loading: 'Loading the list of places…',
      loadError: 'The list of places could not be loaded.',
      retry: 'Try again',
      newUnits: 'Two-level administrative units in force since 01/07/2025 (no district level).',
      provinceMerged: '“{{old}}” is now part of {{now}}. Pick the new ward or commune.',
      provinceOutdated: '“{{value}}” is not in the current list. Choose it again.',
      wardOutdated: '“{{value}}” is not in the current list. Choose it again.',
      errors: {
        addressLineRequired: 'Enter the house number and street.',
        provinceRequired: 'Choose a province or city.',
        provinceOutdated: 'Choose a province or city from the current list.',
        wardRequired: 'Choose a ward or commune.',
        wardOutdated: 'Choose a ward or commune from the current list.'
      }
    },
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
      uploadCount_one: 'Upload {{count}} file',
      uploadCount_other: 'Upload {{count}} files',
      remove: 'Remove file',
      open: 'Open file',
      image: 'Uploaded image',
      actionError: 'Unable to update files.',
      confirmRemove: 'Remove this file?',
      validation: {
        count: 'Select up to 10 files at a time.',
        type: 'This file type is not supported.',
        size: 'Files cannot be empty and must be no larger than {{maxSize}} MB.',
        hintImage: 'JPG, PNG or WEBP, up to 5 MB each, 10 files at a time',
        hintCertificate: 'Choose from a folder or drag in · PDF, JPG or PNG, up to 10 MB each, 10 files at a time'
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
      decrease: 'Decrease',
      increase: 'Increase',
      unsavedTitle: 'Discard your changes?',
      unsavedDescription: 'What you entered has not been saved and will be lost.',
      discard: 'Discard',
      keepEditing: 'Keep editing',
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
        DRAFT: 'Draft',
        OPEN: 'Open',
        CLOSED: 'Closed',
        CANCELLED: 'Cancelled',
        COMPLETED: 'Completed'
      },
      shiftType: {
        MORNING: 'Morning',
        AFTERNOON: 'Afternoon',
        EVENING: 'Evening',
        NIGHT: 'Night',
        FULL_DAY: 'Full day',
        CUSTOM: 'Custom',
        DAILY: 'Daily',
        WEEKLY: 'Weekly',
        OTHER: 'Other'
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
    format: {
      hours_one: '{{count}} giờ',
      hours_other: '{{count}} giờ',
      minutes_one: '{{count}} phút',
      minutes_other: '{{count}} phút',
      hoursMinutes: '{{hours}} giờ {{minutes}} phút'
    },
    price: {
      discount: '−{{percent}}%',
      original: 'Giá gốc {{price}}'
    },
    charts: {
      empty: 'Chưa có dữ liệu trong kỳ này.',
      total: 'Tổng',
      share: '{{percent}} tổng số',
      point: '{{label}}: {{values}}'
    },
    kit: {
      ratingNew: 'Mới',
      ratingLabel: 'Đánh giá {{rating}}/5 từ {{count}} lượt',
      verified: 'Đã xác minh',
      clearSearch: 'Xóa tìm kiếm',
      viewer: {
        label: 'Xem ảnh: {{name}}',
        view: 'Xem ảnh {{name}}',
        zoomIn: 'Phóng to',
        zoomOut: 'Thu nhỏ',
        reset: 'Về kích thước gốc',
        open: 'Mở ảnh gốc ở thẻ mới',
        close: 'Đóng trình xem ảnh',
        previous: 'Ảnh trước',
        next: 'Ảnh sau',
        counter: '{{current}} / {{total}}',
        hint: 'Lăn chuột hoặc bấm + / − để phóng to, kéo để di chuyển, Esc để đóng'
      },
      fileDrop: {
        choose: 'Chọn tệp',
        chooseOne: 'Chọn một tệp',
        drop: 'Bấm để chọn tệp hoặc kéo thả vào đây',
        dropActive: 'Thả để thêm',
        remove: 'Bỏ {{name}}',
        selected: 'Đã chọn {{count}} tệp'
      },
      stepOf: 'Bước {{current}}/{{total}}',
      stepDone: '(đã xong)',
      stepCurrent: '(bước hiện tại)',
      stepTodo: '(chưa tới)',
      datePlaceholder: 'dd/mm/yyyy',
      openCalendar: 'Chọn ngày',
      previousMonth: 'Tháng trước',
      nextMonth: 'Tháng sau',
      invalidDate: 'Nhập ngày theo dạng dd/mm/yyyy.',
      dateTooEarly: 'Chọn ngày từ {{date}} trở đi.',
      dateTooLate: 'Chọn ngày không sau {{date}}.',
      today: 'Hôm nay',
      chooseTime: 'Chọn giờ',
      timePlaceholder: '--:--',
      chooseMonthYear: 'Chọn tháng và năm',
      backToDays: 'Quay lại chọn ngày',
      previousYear: 'Năm trước',
      nextYear: 'Năm sau',
      calendarHint: 'Mũi tên để đổi ngày, Page Up / Page Down để đổi tháng, Enter để chọn, Esc để đóng',
      timeGroups: { night: 'Đêm', morning: 'Sáng', afternoon: 'Chiều', evening: 'Tối' },
      closePanel: 'Đóng bảng',
      loadingPage: 'Đang tải trang…',
      skipToContent: 'Chuyển đến nội dung chính',
      characters: '{{count}}/{{max}} ký tự',
      copy: 'Sao chép',
      copied: 'Đã sao chép',
      more: 'Thao tác khác',
      combobox: {
        search: 'Tìm kiếm…',
        empty: 'Không tìm thấy “{{query}}”',
        count_one: '{{count}} kết quả',
        count_other: '{{count}} kết quả',
        loading: 'Đang tải…'
      }
    },
    accountMenu: 'Menu tài khoản',
    address: {
      province: 'Tỉnh / thành phố',
      ward: 'Phường / xã',
      addressLine: 'Số nhà, tên đường',
      provincePlaceholder: 'Chọn tỉnh / thành phố',
      wardPlaceholder: 'Chọn phường / xã',
      addressLinePlaceholder: 'VD: 45 Kim Mã, ngõ 12',
      provinceSearch: 'Tìm trong 34 tỉnh, thành phố…',
      wardSearch: 'Tìm trong {{count}} phường, xã…',
      provinceFirst: 'Chọn tỉnh / thành phố trước.',
      addressLineHint: 'Số nhà, ngõ / hẻm, tên đường, tòa nhà.',
      loading: 'Đang tải danh mục địa chỉ…',
      loadError: 'Không tải được danh mục địa chỉ.',
      retry: 'Thử lại',
      newUnits: 'Theo đơn vị hành chính 2 cấp áp dụng từ 01/07/2025 (không còn quận / huyện).',
      provinceMerged: '“{{old}}” nay thuộc {{now}}. Hãy chọn lại phường / xã mới.',
      provinceOutdated: '“{{value}}” không còn trong danh mục hiện hành. Hãy chọn lại.',
      wardOutdated: '“{{value}}” không còn trong danh mục hiện hành. Hãy chọn lại.',
      errors: {
        addressLineRequired: 'Nhập số nhà, tên đường.',
        provinceRequired: 'Chọn tỉnh / thành phố.',
        provinceOutdated: 'Chọn tỉnh / thành phố theo danh mục hiện hành.',
        wardRequired: 'Chọn phường / xã.',
        wardOutdated: 'Chọn phường / xã theo danh mục hiện hành.'
      }
    },
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
      uploadCount_one: 'Tải {{count}} tệp lên',
      uploadCount_other: 'Tải {{count}} tệp lên',
      remove: 'Xóa tệp',
      open: 'Mở tệp',
      image: 'Hình ảnh đã tải lên',
      actionError: 'Không thể cập nhật tệp.',
      confirmRemove: 'Xóa tệp này?',
      validation: {
        count: 'Mỗi lần chỉ được chọn tối đa 10 tệp.',
        type: 'Loại tệp này không được hỗ trợ.',
        size: 'Tệp không được để trống và không vượt quá {{maxSize}} MB.',
        hintImage: 'JPG, PNG hoặc WEBP, mỗi tệp tối đa 5 MB, tối đa 10 tệp mỗi lần',
        hintCertificate: 'Chọn từ thư mục hoặc kéo thả · PDF, JPG hoặc PNG, mỗi tệp tối đa 10 MB, tối đa 10 tệp mỗi lần'
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
      decrease: 'Giảm',
      increase: 'Tăng',
      unsavedTitle: 'Bỏ các thay đổi?',
      unsavedDescription: 'Những gì bạn vừa nhập chưa được lưu và sẽ mất.',
      discard: 'Bỏ thay đổi',
      keepEditing: 'Tiếp tục sửa',
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
        DRAFT: 'Bản nháp',
        OPEN: 'Đang mở',
        CLOSED: 'Đã đóng',
        CANCELLED: 'Đã hủy',
        COMPLETED: 'Hoàn thành'
      },
      shiftType: {
        MORNING: 'Ca sáng',
        AFTERNOON: 'Ca chiều',
        EVENING: 'Ca tối',
        NIGHT: 'Ca đêm',
        FULL_DAY: 'Cả ngày',
        CUSTOM: 'Tùy chỉnh',
        DAILY: 'Theo ngày',
        WEEKLY: 'Theo tuần',
        OTHER: 'Khác'
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
