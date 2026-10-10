export const commonEn = {
  common: {
    brand: 'CareConnect',
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
  home: {
    signIn: 'Sign in',
    description:
      'React Router owns routing, TanStack Query owns server state, and Orval keeps the client synchronized with the API contract.',
    foundationHeading: 'Architecture foundations',
    foundations: {
      ai: {
        description: 'Every agent follows the same architecture, verification commands, and generated-code rules.',
        title: 'AI-ready workflow'
      },
      boundaries: {
        description:
          'Routes only orchestrate URLs; business workflows stay inside features and never leak back into shared.',
        title: 'Feature boundaries'
      },
      contract: {
        description: 'OpenAPI is the source for the TypeScript client, TanStack Query hooks, and mock factories.',
        title: 'Contract-first API'
      }
    },
    title: 'The frontend foundation is ready for business-module development.'
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
    loading: 'Đang khởi tạo CareConnect…',
    notFoundDetails: 'Không tìm thấy trang bạn yêu cầu.',
    notFoundTitle: '404'
  },
  home: {
    signIn: 'Đăng nhập',
    description:
      'React Router quản lý route, TanStack Query quản lý server state và Orval giữ client đồng bộ với hợp đồng API.',
    foundationHeading: 'Các nền tảng kiến trúc',
    foundations: {
      ai: {
        description: 'Mọi agent dùng chung kiến trúc, lệnh kiểm tra và quy tắc không sửa generated code.',
        title: 'Quy trình sẵn sàng cho AI'
      },
      boundaries: {
        description: 'Route chỉ điều phối URL; nghiệp vụ nằm trong feature và không rò ngược vào shared.',
        title: 'Ranh giới feature'
      },
      contract: {
        description: 'OpenAPI là nguồn dữ liệu cho TypeScript client, TanStack Query hooks và mock factories.',
        title: 'API theo hợp đồng'
      }
    },
    title: 'Nền tảng frontend đã sẵn sàng để phát triển theo module nghiệp vụ.'
  },
  notFound: {
    action: 'Về trang chính',
    description: 'Đường dẫn này không tồn tại hoặc đã được di chuyển.',
    documentTitle: 'Không tìm thấy | CareConnect',
    eyebrow: '404',
    title: 'Không tìm thấy trang'
  }
} as const
