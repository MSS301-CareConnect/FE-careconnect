export const identityVi = {
  roles: {
    ADMIN: 'Quản trị viên',
    CENTER_MANAGER: 'Quản lý trung tâm',
    CAREGIVER: 'Người chăm sóc',
    CUSTOMER: 'Khách hàng'
  },
  status: { ACTIVE: 'Đang hoạt động', LOCKED: 'Đã khóa' },
  accounts: {
    documentTitle: 'Tài khoản | Quản trị CareConnect',
    title: 'Tài khoản',
    subtitle: 'Người dùng, vai trò và trạng thái đăng nhập.',
    create: 'Tạo tài khoản',
    metrics: {
      title: 'Tổng quan tài khoản',
      total: 'Tổng tài khoản',
      active: 'Đang hoạt động',
      locked: 'Đã khóa',
      managers: 'Quản lý trung tâm'
    },
    search: 'Tìm theo tên, email hoặc số điện thoại',
    searchAction: 'Tìm',
    role: 'Vai trò',
    status: 'Trạng thái',
    allRoles: 'Tất cả vai trò',
    allStatuses: 'Tất cả trạng thái',
    reset: 'Xóa bộ lọc',
    results: '{{count}} tài khoản',
    columns: {
      user: 'Người dùng',
      phone: 'Số điện thoại',
      roles: 'Vai trò',
      center: 'Trung tâm',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo'
    },
    empty: 'Không có tài khoản phù hợp.',
    emptyHint: 'Thử bỏ bớt bộ lọc hoặc đổi từ khóa.',
    loading: 'Đang tải tài khoản…',
    error: 'Không thể tải danh sách tài khoản.',
    forbidden: 'Bạn không có quyền xem danh sách tài khoản.',
    retry: 'Thử lại',
    pagination: 'Phân trang tài khoản',
    createTitle: 'Tạo tài khoản',
    createDescription: 'Tài khoản được tạo chưa có mật khẩu; bước sau giúp chủ tài khoản đặt mật khẩu qua mã OTP.',
    createdTitle: 'Đã tạo tài khoản',
    createdDescription: '{{name}} · {{email}}',
    openCenter: 'Mở trung tâm để ghép làm người quản lý',
    done: 'Xong',
    centerLoading: 'Đang tải danh sách trung tâm…',
    centerError: 'Chưa tải được danh sách trung tâm.',
    centerEmpty: 'Chưa có trung tâm nào. Hãy tạo trung tâm ở trang Trung tâm trước.',
    centerHasManager: 'đã có người quản lý'
  },
  form: {
    email: 'Email',
    fullName: 'Họ tên',
    phone: 'Số điện thoại',
    optional: '(không bắt buộc)',
    role: 'Vai trò',
    center: 'Trung tâm',
    chooseCenter: 'Chọn trung tâm',
    sendCode: 'Gửi mã đặt mật khẩu tới email ngay sau khi tạo',
    sendCodeHint: 'Tài khoản mới chưa có mật khẩu; chủ tài khoản dùng mã này để đặt mật khẩu.',
    cancel: 'Hủy',
    errors: {
      emailRequired: 'Nhập email.',
      emailInvalid: 'Email chưa đúng định dạng, ví dụ ten@trungtam.vn.',
      emailTaken: 'Email này đã có tài khoản. Hãy dùng email khác.',
      fullNameRequired: 'Nhập họ tên.',
      fullNameTooLong: 'Họ tên tối đa 255 ký tự.',
      phoneInvalid: 'Số điện thoại gồm 10 hoặc 11 chữ số.',
      centerRequired: 'Chọn trung tâm cho tài khoản quản lý.'
    }
  },
  detail: {
    documentTitle: 'Chi tiết tài khoản | Quản trị CareConnect',
    back: 'Tài khoản',
    information: 'Thông tin tài khoản',
    email: 'Email',
    roles: 'Vai trò',
    center: 'Trung tâm',
    createdAt: 'Ngày tạo',
    status: 'Trạng thái',
    lockReasonValue: 'Lý do khóa: {{reason}}',
    none: 'Chưa có',
    profile: 'Hồ sơ',
    fullName: 'Họ tên',
    phone: 'Số điện thoại',
    save: 'Lưu thay đổi',
    saved: 'Đã lưu thay đổi.',
    loading: 'Đang tải tài khoản…',
    error: 'Không thể tải tài khoản.',
    notFound: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.',
    forbidden: 'Bạn không có quyền xem tài khoản này.',
    retry: 'Thử lại',
    rolesTitle: 'Vai trò',
    noRoles: 'Tài khoản chưa có vai trò.',
    assign: 'Gán vai trò',
    assignPlaceholder: 'Chọn vai trò',
    assignHint:
      'Quản lý trung tâm được ghép từ trang Trung tâm; người chăm sóc do quản lý trung tâm tạo kèm hồ sơ chuyên môn.',
    nothingToAssign: 'Không còn vai trò nào để gán thêm.',
    revoke: 'Gỡ',
    revokeTitle: 'Gỡ vai trò {{role}}?',
    revokeDescription: 'Tài khoản sẽ bị đăng xuất khỏi mọi thiết bị để áp dụng quyền mới.',
    roleSaved: 'Đã cập nhật vai trò.',
    access: 'Truy cập',
    lock: 'Khóa tài khoản',
    unlock: 'Mở khóa',
    lockTitle: 'Khóa tài khoản {{name}}?',
    lockDescription: 'Người dùng bị đăng xuất ngay và không đăng nhập được cho tới khi được mở khóa.',
    lockReason: 'Lý do khóa',
    unlockTitle: 'Mở khóa tài khoản {{name}}?',
    unlockDescription: 'Người dùng đăng nhập lại được bằng mật khẩu hiện có.',
    deactivate: 'Vô hiệu hóa',
    deactivateTitle: 'Vô hiệu hóa tài khoản {{name}}?',
    deactivateDescription:
      'Tài khoản rời khỏi danh sách và không đăng nhập được nữa. Lịch sử hoạt động vẫn được giữ. Không hoàn tác trên giao diện.',
    locked: 'Đã khóa tài khoản.',
    unlocked: 'Đã mở khóa tài khoản.',
    selfNote: 'Đây là tài khoản của bạn; bạn không thể tự khóa, vô hiệu hóa hay đổi vai trò.',
    errors: {
      fullNameRequired: 'Nhập họ tên.',
      fullNameTooLong: 'Họ tên tối đa 255 ký tự.',
      phoneInvalid: 'Số điện thoại gồm 10 hoặc 11 chữ số.',
      reasonRequired: 'Nhập lý do để quản trị viên khác biết vì sao tài khoản bị khóa.',
      reasonTooLong: 'Lý do tối đa 500 ký tự.'
    },
    business: {
      lastAdmin: 'Đây là quản trị viên cuối cùng đang hoạt động nên không thể khóa, gỡ vai trò hay vô hiệu hóa.',
      centerRequired: 'Tài khoản chưa thuộc trung tâm nào nên không gán được vai trò này.',
      self: 'Bạn không thể tự khóa hoặc vô hiệu hóa tài khoản của chính mình.',
      roleTaken: 'Vai trò không còn tồn tại hoặc đã ngừng dùng. Hãy tải lại trang.'
    }
  },
  rolesPage: {
    documentTitle: 'Phân quyền | Quản trị CareConnect',
    title: 'Phân quyền',
    subtitle: 'Vai trò quyết định cổng mỗi người dùng vào được và dữ liệu họ thấy.',
    create: 'Tạo vai trò',
    systemTitle: 'Vai trò hệ thống',
    systemHint: 'Bốn vai trò cố định của nền tảng; quyền của chúng không chỉnh sửa được.',
    usedFor: 'Dùng cho',
    portal: 'Cổng truy cập',
    can: 'Làm được',
    scope: 'Phạm vi dữ liệu',
    matrixTitle: 'Quyền quản trị tài khoản theo vai trò',
    matrixHint: 'Các quyền dưới đây chỉ áp dụng cho việc quản lý tài khoản trong hệ thống.',
    permission: 'Quyền',
    has: 'Có',
    hasNot: 'Không',
    customTitle: 'Vai trò tùy chỉnh',
    customWarning:
      'Vai trò tùy chỉnh không mở được cổng nào. Nó chỉ bổ sung quyền quản trị tài khoản cho người đã có một vai trò hệ thống.',
    noCustom: 'Chưa có vai trò tùy chỉnh.',
    noDescription: 'Chưa có mô tả',
    permissionCount: '{{count}} quyền',
    permissionsOf: 'Quyền của {{role}}',
    inactive: 'Ngừng dùng',
    save: 'Lưu quyền',
    confirmTitle: 'Lưu quyền của {{role}}?',
    confirmSave: 'Toàn bộ quyền hiện tại của vai trò sẽ được thay bằng các quyền đã chọn.',
    saved: 'Đã lưu quyền.',
    loading: 'Đang tải vai trò…',
    error: 'Không thể tải vai trò và quyền.',
    forbidden: 'Bạn không có quyền quản lý vai trò.',
    retry: 'Thử lại',
    info: {
      ADMIN: {
        usedFor: 'Đội vận hành CareConnect',
        portal: 'Cổng Quản trị',
        can: 'Duyệt và quản lý trung tâm, tài khoản, danh mục dịch vụ, khiếu nại cấp cao, sự cố đồng bộ',
        scope: 'Toàn hệ thống'
      },
      CENTER_MANAGER: {
        usedFor: 'Người điều hành một trung tâm chăm sóc',
        portal: 'Cổng Trung tâm',
        can: 'Quản lý người chăm sóc, dịch vụ và giá, duyệt lịch đặt, phân công, xử lý khiếu nại cấp 1',
        scope: 'Chỉ trung tâm của mình'
      },
      CAREGIVER: {
        usedFor: 'Nhân viên chăm sóc của trung tâm',
        portal: 'Ứng dụng di động và cổng Người chăm sóc',
        can: 'Nhận buổi được giao, check-in, cập nhật công việc, gửi báo cáo chăm sóc',
        scope: 'Chỉ các buổi được giao'
      },
      CUSTOMER: {
        usedFor: 'Người thân đặt dịch vụ',
        portal: 'Cổng Khách hàng',
        can: 'Tạo hồ sơ người bệnh, đặt lịch, thanh toán, đánh giá, khiếu nại',
        scope: 'Chỉ dữ liệu của mình'
      }
    },
    permissions: {
      userRead: { name: 'Xem tài khoản', description: 'Xem danh sách và chi tiết tài khoản trong phạm vi được phép.' },
      userManage: {
        name: 'Quản lý tài khoản',
        description: 'Sửa hồ sơ, khóa / mở khóa và vô hiệu hóa tài khoản trong phạm vi được phép.'
      },
      managerCreate: { name: 'Tạo quản lý trung tâm', description: 'Tạo tài khoản quản lý cho một trung tâm.' },
      caregiverCreate: {
        name: 'Tạo người chăm sóc',
        description: 'Quản lý trung tâm tạo tài khoản người chăm sóc cho trung tâm của mình.'
      },
      roleManage: {
        name: 'Quản lý vai trò',
        description: 'Gán / gỡ vai trò, tạo vai trò tùy chỉnh và chọn quyền cho chúng.'
      },
      other: { name: 'Quyền khác', description: 'Quyền do hệ thống bổ sung.' }
    },
    form: {
      title: 'Tạo vai trò tùy chỉnh',
      hint: 'Sau khi tạo, chọn vai trò trong danh sách để gắn quyền.',
      roleCode: 'Mã vai trò',
      roleCodeHint: 'Chữ in hoa, số và dấu gạch dưới, bắt đầu bằng chữ. Ví dụ: SUPPORT_AGENT.',
      roleName: 'Tên vai trò',
      description: 'Mô tả',
      descriptionHint: 'Ghi rõ vai trò dùng cho ai và để làm gì.',
      submit: 'Tạo vai trò',
      cancel: 'Hủy',
      created: 'Đã tạo vai trò.',
      errors: {
        codeRequired: 'Nhập mã vai trò.',
        codeInvalid: 'Mã gồm 2–64 ký tự in hoa, số hoặc dấu gạch dưới và bắt đầu bằng chữ.',
        codeTaken: 'Mã này đã có. Hãy chọn mã khác.',
        nameRequired: 'Nhập tên vai trò.'
      }
    }
  }
} as const

export const identityEn = {
  roles: {
    ADMIN: 'Administrator',
    CENTER_MANAGER: 'Center manager',
    CAREGIVER: 'Caregiver',
    CUSTOMER: 'Customer'
  },
  status: { ACTIVE: 'Active', LOCKED: 'Locked' },
  accounts: {
    documentTitle: 'Accounts | CareConnect Admin',
    title: 'Accounts',
    subtitle: 'Users, roles and sign-in status.',
    create: 'Create account',
    metrics: {
      title: 'Account overview',
      total: 'Total accounts',
      active: 'Active',
      locked: 'Locked',
      managers: 'Center managers'
    },
    search: 'Search by name, email or phone',
    searchAction: 'Search',
    role: 'Role',
    status: 'Status',
    allRoles: 'All roles',
    allStatuses: 'All statuses',
    reset: 'Clear filters',
    results: '{{count}} accounts',
    columns: {
      user: 'User',
      phone: 'Phone',
      roles: 'Roles',
      center: 'Center',
      status: 'Status',
      createdAt: 'Created'
    },
    empty: 'No matching accounts.',
    emptyHint: 'Try removing a filter or changing the keyword.',
    loading: 'Loading accounts…',
    error: 'Accounts could not be loaded.',
    forbidden: 'You do not have permission to view accounts.',
    retry: 'Retry',
    pagination: 'Accounts pagination',
    createTitle: 'Create account',
    createDescription: 'New accounts have no password; the next step helps the owner set one with an emailed code.',
    createdTitle: 'Account created',
    createdDescription: '{{name}} · {{email}}',
    openCenter: 'Open the center to make them its manager',
    done: 'Done',
    centerLoading: 'Loading centers…',
    centerError: 'Centers could not be loaded.',
    centerEmpty: 'No centers yet. Create one on the Centers page first.',
    centerHasManager: 'has a manager'
  },
  form: {
    email: 'Email',
    fullName: 'Full name',
    phone: 'Phone',
    optional: '(optional)',
    role: 'Role',
    center: 'Center',
    chooseCenter: 'Choose a center',
    sendCode: 'Email a password code right after creating',
    sendCodeHint: 'New accounts have no password; the owner uses this code to set one.',
    cancel: 'Cancel',
    errors: {
      emailRequired: 'Enter an email.',
      emailInvalid: 'Enter an email like name@center.com.',
      emailTaken: 'This email already has an account. Use another email.',
      fullNameRequired: 'Enter a full name.',
      fullNameTooLong: 'The name can have at most 255 characters.',
      phoneInvalid: 'Phone numbers have 10 or 11 digits.',
      centerRequired: 'Choose the center this manager runs.'
    }
  },
  detail: {
    documentTitle: 'Account | CareConnect Admin',
    back: 'Accounts',
    information: 'Account information',
    email: 'Email',
    roles: 'Roles',
    center: 'Center',
    createdAt: 'Created',
    status: 'Status',
    lockReasonValue: 'Lock reason: {{reason}}',
    none: 'None',
    profile: 'Profile',
    fullName: 'Full name',
    phone: 'Phone',
    save: 'Save changes',
    saved: 'Changes saved.',
    loading: 'Loading account…',
    error: 'The account could not be loaded.',
    notFound: 'This account does not exist or was deactivated.',
    forbidden: 'You do not have permission to view this account.',
    retry: 'Retry',
    rolesTitle: 'Roles',
    noRoles: 'This account has no roles.',
    assign: 'Assign role',
    assignPlaceholder: 'Choose a role',
    assignHint:
      'Center managers are linked from the Centers page; caregivers are created by their center manager with a profile.',
    nothingToAssign: 'There is no other role to assign.',
    revoke: 'Remove',
    revokeTitle: 'Remove the {{role}} role?',
    revokeDescription: 'The account is signed out everywhere so the new permissions apply.',
    roleSaved: 'Roles updated.',
    access: 'Access',
    lock: 'Lock account',
    unlock: 'Unlock',
    lockTitle: 'Lock {{name}}?',
    lockDescription: 'The user is signed out now and cannot sign in until the account is unlocked.',
    lockReason: 'Reason for locking',
    unlockTitle: 'Unlock {{name}}?',
    unlockDescription: 'The user can sign in again with their current password.',
    deactivate: 'Deactivate',
    deactivateTitle: 'Deactivate {{name}}?',
    deactivateDescription:
      'The account leaves the list and can no longer sign in. Its history is kept. This cannot be undone here.',
    locked: 'Account locked.',
    unlocked: 'Account unlocked.',
    selfNote: 'This is your own account; you cannot lock, deactivate or change its roles.',
    errors: {
      fullNameRequired: 'Enter a full name.',
      fullNameTooLong: 'The name can have at most 255 characters.',
      phoneInvalid: 'Phone numbers have 10 or 11 digits.',
      reasonRequired: 'Enter a reason so other administrators know why it was locked.',
      reasonTooLong: 'The reason can have at most 500 characters.'
    },
    business: {
      lastAdmin: 'This is the last active administrator, so it cannot be locked, deactivated or lose its role.',
      centerRequired: 'This account belongs to no center, so it cannot get this role.',
      self: 'You cannot lock or deactivate your own account.',
      roleTaken: 'That role no longer exists or is inactive. Reload the page.'
    }
  },
  rolesPage: {
    documentTitle: 'Permissions | CareConnect Admin',
    title: 'Permissions',
    subtitle: 'Roles decide which portal each user can open and which data they see.',
    create: 'Create role',
    systemTitle: 'System roles',
    systemHint: 'The four fixed platform roles; their permissions cannot be edited.',
    usedFor: 'For',
    portal: 'Portal',
    can: 'Can',
    scope: 'Data scope',
    matrixTitle: 'Account administration permissions by role',
    matrixHint: 'These permissions only cover managing accounts in the system.',
    permission: 'Permission',
    has: 'Yes',
    hasNot: 'No',
    customTitle: 'Custom roles',
    customWarning:
      'A custom role opens no portal. It only adds account administration permissions to someone who already has a system role.',
    noCustom: 'No custom roles yet.',
    noDescription: 'No description',
    permissionCount: '{{count}} permissions',
    permissionsOf: 'Permissions of {{role}}',
    inactive: 'Inactive',
    save: 'Save permissions',
    confirmTitle: 'Save the permissions of {{role}}?',
    confirmSave: 'Every current permission of the role is replaced by the selected ones.',
    saved: 'Permissions saved.',
    loading: 'Loading roles…',
    error: 'Roles and permissions could not be loaded.',
    forbidden: 'You do not have permission to manage roles.',
    retry: 'Retry',
    info: {
      ADMIN: {
        usedFor: 'The CareConnect operations team',
        portal: 'Admin portal',
        can: 'Approve and manage centers, accounts, the service catalog, escalated complaints and sync incidents',
        scope: 'The whole platform'
      },
      CENTER_MANAGER: {
        usedFor: 'The person running one care center',
        portal: 'Center portal',
        can: 'Manage caregivers, services and prices, accept bookings, assign caregivers, handle first-level complaints',
        scope: 'Their own center only'
      },
      CAREGIVER: {
        usedFor: 'Care staff of a center',
        portal: 'Mobile app and Caregiver portal',
        can: 'Receive assigned visits, check in, update tasks, submit care reports',
        scope: 'Assigned visits only'
      },
      CUSTOMER: {
        usedFor: 'Family members booking care',
        portal: 'Customer portal',
        can: 'Create patient profiles, book, pay, review and complain',
        scope: 'Their own data only'
      }
    },
    permissions: {
      userRead: { name: 'View accounts', description: 'See the list and details of accounts within their scope.' },
      userManage: {
        name: 'Manage accounts',
        description: 'Edit profiles, lock / unlock and deactivate accounts within their scope.'
      },
      managerCreate: { name: 'Create center managers', description: 'Create the manager account of a center.' },
      caregiverCreate: {
        name: 'Create caregivers',
        description: 'A center manager creates caregiver accounts for their own center.'
      },
      roleManage: {
        name: 'Manage roles',
        description: 'Assign / remove roles, create custom roles and choose their permissions.'
      },
      other: { name: 'Other permission', description: 'Added by the system.' }
    },
    form: {
      title: 'Create a custom role',
      hint: 'After creating it, pick the role in the list to give it permissions.',
      roleCode: 'Role code',
      roleCodeHint: 'Uppercase letters, digits and underscores, starting with a letter. Example: SUPPORT_AGENT.',
      roleName: 'Role name',
      description: 'Description',
      descriptionHint: 'Say who the role is for and what it is used for.',
      submit: 'Create role',
      cancel: 'Cancel',
      created: 'Role created.',
      errors: {
        codeRequired: 'Enter a role code.',
        codeInvalid: 'Use 2–64 uppercase letters, digits or underscores, starting with a letter.',
        codeTaken: 'This code already exists. Choose another.',
        nameRequired: 'Enter a role name.'
      }
    }
  }
} as const
