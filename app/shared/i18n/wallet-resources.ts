// Wallet copy shared by the four portals (entities/wallet) and the admin withdrawal queue (2026-11-09).
export const walletVi = {
  titles: {
    CUSTOMER: 'Ví của tôi',
    CAREGIVER: 'Ví của tôi',
    CENTER: 'Ví trung tâm',
    PLATFORM: 'Ví nền tảng'
  },
  subtitles: {
    CUSTOMER: 'Tiền hoàn khi bạn hủy lịch được cộng vào ví. Bạn có thể rút về tài khoản ngân hàng bất cứ lúc nào.',
    CAREGIVER: 'Tiền cọc khách bị giữ khi hủy buổi bạn được giao được cộng vào ví của bạn.',
    CENTER:
      'Tiền các buổi đã phục vụ (sau hoa hồng nền tảng) và tiền cọc giữ lại của buổi chưa phân công. Mọi quản lý của trung tâm dùng chung ví này.',
    PLATFORM:
      'Hoa hồng nền tảng trên các buổi đã phục vụ, cùng tổng tiền nền tảng đang giữ hộ khách, caregiver và trung tâm.'
  },
  loading: 'Đang tải ví...',
  refundToWallet: 'Hoàn vào ví',
  balance: {
    available: 'Số dư khả dụng',
    held: 'Đang chờ rút',
    heldHint: 'Đã trừ khỏi số dư, chờ bên xử lý chuyển khoản',
    withdraw: 'Rút tiền',
    notWithdrawable: 'Số dư phải lớn hơn 0 mới rút được',
    platformReadOnly: 'Ví nền tảng chỉ để theo dõi, không rút',
    negative: 'Ví đang âm do hoàn tiền khiếu nại sau khi đã cộng tiền buổi — chưa rút được tới khi số dư dương trở lại.'
  },
  period: {
    label: 'Kỳ thống kê',
    month: 'Tháng này',
    last30: '30 ngày qua',
    year: 'Năm nay'
  },
  metrics: {
    totalIncome: 'Thu nhập trong kỳ',
    totalWithdrawn: 'Đã rút trong kỳ',
    bookingCount: 'Số lịch đặt',
    totalPaid: 'Đã thanh toán',
    refundedToWallet: 'Hoàn vào ví',
    refundedToGateway: 'Hoàn qua cổng thanh toán',
    netSpent: 'Chi tiêu thực',
    forfeitIncome: 'Tiền cọc được hưởng',
    serviceIncome: 'Tiền buổi thực nhận',
    commissionDeducted: 'Hoa hồng nền tảng đã trừ',
    complaintDebits: 'Trừ do hoàn khiếu nại',
    commissionIncome: 'Hoa hồng thu được',
    grossCollected: 'Tổng đã thu của khách',
    totalRefunded: 'Tổng đã hoàn',
    pendingWithdrawals: 'Yêu cầu rút chờ xử lý',
    pendingWithdrawalsValue: '{{count}} yêu cầu · {{amount}}'
  },
  chart: {
    title: 'Biến động theo thời gian',
    income: 'Thu nhập',
    withdrawn: 'Đã rút',
    spent: 'Đã thanh toán',
    empty: 'Chưa có biến động trong kỳ này.',
    point: '{{period}}: {{label}} {{amount}}'
  },
  liabilities: {
    title: 'Tiền nền tảng đang giữ hộ',
    hint: 'Số dư khả dụng và đang chờ rút của mọi ví — số tiền nền tảng còn phải trả.',
    owner: 'Loại ví',
    wallets: 'Số ví',
    available: 'Khả dụng',
    held: 'Chờ rút',
    owners: {
      CUSTOMER: 'Khách hàng',
      CAREGIVER: 'Người chăm sóc',
      CENTER: 'Trung tâm',
      PLATFORM: 'Nền tảng'
    }
  },
  types: {
    REFUND_CREDIT: 'Hoàn tiền hủy lịch',
    FORFEIT_CREDIT: 'Tiền cọc được hưởng',
    SERVICE_SETTLEMENT: 'Tiền buổi đã phục vụ',
    COMMISSION_CREDIT: 'Hoa hồng nền tảng',
    COMPLAINT_DEBIT: 'Trừ hoàn khiếu nại',
    WITHDRAWAL_HOLD: 'Tạm giữ để rút',
    WITHDRAWAL_RELEASE: 'Hoàn lại (yêu cầu rút bị từ chối)',
    WITHDRAWAL_PAID: 'Đã chuyển khoản'
  },
  transactions: {
    title: 'Lịch sử giao dịch',
    hint: 'Mỗi biến động số dư trong kỳ, mới nhất trước.',
    empty: 'Chưa có giao dịch trong kỳ này.',
    viewBooking: 'Xem lịch đặt',
    balanceChange: 'Số dư {{before}} → {{after}}',
    held: 'Đang chờ rút: {{amount}}'
  },
  withdrawals: {
    title: 'Yêu cầu rút tiền',
    empty: 'Bạn chưa gửi yêu cầu rút tiền nào.',
    amount: 'Số tiền',
    bank: 'Ngân hàng',
    account: 'Tài khoản',
    status: 'Trạng thái',
    createdAt: 'Gửi lúc',
    rejectReason: 'Lý do từ chối: {{reason}}',
    transferReference: 'Mã chuyển khoản: {{reference}}',
    statuses: {
      PENDING: 'Chờ xử lý',
      APPROVED: 'Đã duyệt, chờ chuyển',
      REJECTED: 'Bị từ chối',
      COMPLETED: 'Đã chuyển khoản'
    }
  },
  form: {
    title: 'Rút tiền về tài khoản ngân hàng',
    description:
      'Số tiền được tạm giữ ngay khi gửi. Trung tâm đang giữ khoản tiền của bạn (ví trung tâm: quản trị viên) chuyển khoản; xong là yêu cầu tự hoàn tất và bạn nhận thông báo. Nếu bị từ chối, tiền quay lại số dư.',
    center: 'Rút từ khoản tiền của trung tâm',
    centerHint: 'Yêu cầu được gửi tới trung tâm này xử lý. Tối đa {{amount}}.',
    centerPlatform: 'CareConnect (khoản cũ, quản trị viên xử lý)',
    centerOption: '{{name}} · {{amount}}',
    centerLoading: 'Đang tải số dư theo trung tâm…',
    amount: 'Số tiền muốn rút (₫)',
    amountHint: 'Tối đa {{amount}}',
    withdrawAll: 'Rút toàn bộ',
    bankName: 'Tên ngân hàng',
    bankNamePlaceholder: 'Ví dụ: Vietcombank',
    bankAccountNumber: 'Số tài khoản',
    accountHolderName: 'Tên chủ tài khoản',
    accountHolderHint: 'Viết đúng như trên tài khoản ngân hàng',
    summary: 'Sau khi gửi',
    summaryAvailable: 'Số dư khả dụng còn lại',
    summaryHeld: 'Đang chờ rút',
    submit: 'Gửi yêu cầu',
    cancel: 'Hủy',
    success: 'Đã gửi yêu cầu rút {{amount}}',
    errors: {
      amountRequired: 'Nhập số tiền muốn rút.',
      amountInvalid: 'Số tiền phải là số nguyên dương (đồng).',
      amountTooHigh: 'Số tiền vượt quá số dư khả dụng.',
      amountTooHighForCenter: 'Số tiền vượt quá số dư của bạn tại trung tâm này.',
      bankNameRequired: 'Nhập tên ngân hàng.',
      accountRequired: 'Nhập số tài khoản.',
      accountInvalid: 'Số tài khoản gồm 6–20 chữ số.',
      holderRequired: 'Nhập tên chủ tài khoản.',
      tooLong: 'Nội dung quá dài.'
    }
  },
  errors: {
    e6040: 'Không tìm thấy ví.',
    e6041: 'Số tiền vượt quá số dư khả dụng.',
    e6042: 'Không tìm thấy yêu cầu rút tiền.',
    e6043: 'Yêu cầu rút tiền đã được xử lý hoặc không còn ở trạng thái cho phép thao tác này.',
    e6052: 'Ví này không rút được.',
    e6053: 'Hãy chọn rút từ khoản tiền của trung tâm nào.',
    e6054: 'Số tiền vượt quá số dư của bạn tại trung tâm này.',
    e6055: 'Yêu cầu này do trung tâm khác hoặc quản trị viên xử lý.',
    e6027: 'Tài khoản quản lý chưa được gán trung tâm.',
    generic: 'Không thể tải dữ liệu ví. Vui lòng thử lại.',
    unavailable: 'Dịch vụ thanh toán đang tạm gián đoạn. Vui lòng thử lại sau.'
  },
  admin: {
    title: 'Yêu cầu rút tiền',
    subtitle:
      'Yêu cầu rút của ví trung tâm (và yêu cầu cũ chưa gắn trung tâm) do bạn chuyển khoản; yêu cầu của khách hàng và người chăm sóc do trung tâm giữ tiền xử lý — ở đây chỉ để theo dõi.',
    filters: 'Lọc yêu cầu',
    allStatuses: 'Mọi trạng thái',
    allOwners: 'Mọi loại ví',
    requester: 'Người yêu cầu',
    unknown: 'Không rõ',
    owner: 'Loại ví',
    empty: 'Không có yêu cầu nào khớp bộ lọc.',
    open: 'Xem',
    detailTitle: 'Yêu cầu rút {{amount}}',
    walletBalance: 'Số dư hiện tại của ví',
    ledger: 'Giao dịch gần đây của ví',
    reject: 'Từ chối',
    close: 'Đóng',
    rejectReason: 'Lý do từ chối',
    rejectReasonRequired: 'Nhập lý do từ chối.',
    reviewedAt: 'Xử lý lúc {{time}}',
    completedAt: 'Chuyển lúc {{time}}',
    copy: 'Sao chép'
  },
  nav: {
    customer: 'Ví của tôi',
    caregiver: 'Ví của tôi',
    manager: 'Ví trung tâm',
    managerWithdrawals: 'Yêu cầu rút tiền'
  },
  review: {
    managerTitle: 'Yêu cầu rút tiền',
    managerSubtitle:
      'Khách hàng và người chăm sóc rút khoản tiền trung tâm đang giữ (tiền hoàn, cọc bị giữ). Chuyển khoản giả lập — thành công thì yêu cầu tự hoàn tất và người rút nhận thông báo.',
    scopes: { REVIEW: 'Cần tôi xử lý', OWN: 'Tất cả' },
    handledBy: 'Bên xử lý',
    handledByCenter: 'Trung tâm {{name}}',
    handledByAdmin: 'Quản trị viên',
    readOnly: 'Yêu cầu này do {{handler}} xử lý — bạn chỉ xem.',
    transfer: 'Chuyển khoản',
    transferTitle: 'Chuyển khoản giả lập',
    transferHint:
      'Hệ thống sẽ chuyển {{amount}} tới {{bank}} · {{account}} · {{holder}}. Thành công thì yêu cầu tự chuyển sang "Đã chuyển khoản", không cần xác nhận tay.',
    transferConfirm: 'Xác nhận chuyển {{amount}}',
    transferring: 'Đang chuyển khoản…',
    transferred: 'Đã chuyển khoản {{amount}} — mã {{reference}}',
    rejected: 'Đã từ chối yêu cầu, tiền đã trả về ví người rút',
    reference: 'Mã giao dịch',
    sourceCenter: 'Khoản tiền của',
    pendingFirst: 'Chờ xử lý trước',
    filtersTitle: 'Lọc theo',
    requesterKinds: { CUSTOMER: 'Khách hàng', CAREGIVER: 'Người chăm sóc', CENTER: 'Trung tâm', PLATFORM: 'Nền tảng' },
    openQueue: 'Mở hàng đợi rút tiền',
    pendingCount: '{{count}} yêu cầu đang chờ · {{amount}}'
  },
  breakdown: {
    title: 'Cơ cấu biến động ví',
    hint: 'Tổng từng loại biến động trong kỳ.'
  },
  stats: {
    title: 'Tổng quan rút tiền',
    hint: 'Đang chờ tính mọi thời điểm; còn lại theo kỳ thống kê.',
    pending: 'Đang chờ xử lý',
    pendingHint: '{{count}} yêu cầu',
    completed: 'Đã chuyển trong kỳ',
    completedHint: '{{count}} yêu cầu',
    rejected: 'Đã từ chối trong kỳ',
    rejectedHint: '{{count}} yêu cầu',
    requested: 'Gửi mới trong kỳ',
    requestedHint: '{{count}} yêu cầu',
    processing: 'Thời gian xử lý trung bình',
    processingNone: 'Chưa có',
    chartTitle: 'Yêu cầu rút theo thời gian',
    chartHint: 'Số tiền gửi yêu cầu và số tiền đã chuyển.',
    requestedSeries: 'Gửi yêu cầu',
    completedSeries: 'Đã chuyển',
    ownersTitle: 'Theo loại người rút',
    ownersHint: 'Đang chờ và đã chuyển trong kỳ.',
    ownerRow: '{{pending}} chờ · {{completed}} đã chuyển',
    custodyTitle: 'Tiền trung tâm đang giữ hộ',
    custodyHint:
      'Khoản hoàn / cọc của khách hàng và người chăm sóc gắn với trung tâm, còn trong ví của họ — trung tâm cần sẵn sàng chi trả.',
    custodyTotal: 'Tổng đang giữ hộ',
    custodyCustomer: 'Của khách hàng',
    custodyCaregiver: 'Của người chăm sóc',
    custodyHeld: 'Đang chờ rút'
  }
} as const

export const walletEn = {
  titles: {
    CUSTOMER: 'My wallet',
    CAREGIVER: 'My wallet',
    CENTER: 'Center wallet',
    PLATFORM: 'Platform wallet'
  },
  subtitles: {
    CUSTOMER: 'Refunds of bookings you cancel go to your wallet. You can withdraw to a bank account at any time.',
    CAREGIVER: 'Deposits customers lose when they cancel visits assigned to you go to your wallet.',
    CENTER:
      'Money of served visits (after the platform commission) and deposits kept on visits without a caregiver. Every manager of the center shares this wallet.',
    PLATFORM:
      'The platform commission on served visits, and the total the platform holds for customers, caregivers and centers.'
  },
  loading: 'Loading wallet...',
  refundToWallet: 'Refunded to wallet',
  balance: {
    available: 'Available balance',
    held: 'Awaiting withdrawal',
    heldHint: 'Taken from the balance, waiting for the transfer',
    withdraw: 'Withdraw',
    notWithdrawable: 'The balance must be above 0 to withdraw',
    platformReadOnly: 'The platform wallet is read-only',
    negative:
      'The wallet is negative because of a complaint refund after visits were paid out — withdrawals resume once it is positive again.'
  },
  period: {
    label: 'Period',
    month: 'This month',
    last30: 'Last 30 days',
    year: 'This year'
  },
  metrics: {
    totalIncome: 'Income in period',
    totalWithdrawn: 'Withdrawn in period',
    bookingCount: 'Bookings',
    totalPaid: 'Paid',
    refundedToWallet: 'Refunded to wallet',
    refundedToGateway: 'Refunded to payment gateway',
    netSpent: 'Net spending',
    forfeitIncome: 'Kept deposits',
    serviceIncome: 'Visit earnings',
    commissionDeducted: 'Platform commission deducted',
    complaintDebits: 'Complaint refunds deducted',
    commissionIncome: 'Commission earned',
    grossCollected: 'Collected from customers',
    totalRefunded: 'Refunded',
    pendingWithdrawals: 'Withdrawals to process',
    pendingWithdrawalsValue: '{{count}} requests · {{amount}}'
  },
  chart: {
    title: 'Over time',
    income: 'Income',
    withdrawn: 'Withdrawn',
    spent: 'Paid',
    empty: 'No movement in this period.',
    point: '{{period}}: {{label}} {{amount}}'
  },
  liabilities: {
    title: 'Money held for others',
    hint: 'Available and pending balances of every wallet — what the platform still owes.',
    owner: 'Wallet type',
    wallets: 'Wallets',
    available: 'Available',
    held: 'Awaiting withdrawal',
    owners: {
      CUSTOMER: 'Customers',
      CAREGIVER: 'Caregivers',
      CENTER: 'Centers',
      PLATFORM: 'Platform'
    }
  },
  types: {
    REFUND_CREDIT: 'Cancellation refund',
    FORFEIT_CREDIT: 'Kept deposit',
    SERVICE_SETTLEMENT: 'Served visit',
    COMMISSION_CREDIT: 'Platform commission',
    COMPLAINT_DEBIT: 'Complaint refund deducted',
    WITHDRAWAL_HOLD: 'Held for withdrawal',
    WITHDRAWAL_RELEASE: 'Returned (withdrawal rejected)',
    WITHDRAWAL_PAID: 'Transferred'
  },
  transactions: {
    title: 'Transaction history',
    hint: 'Every balance movement in the period, newest first.',
    empty: 'No transactions in this period.',
    viewBooking: 'View booking',
    balanceChange: 'Balance {{before}} → {{after}}',
    held: 'Awaiting withdrawal: {{amount}}'
  },
  withdrawals: {
    title: 'Withdrawal requests',
    empty: 'You have not requested a withdrawal yet.',
    amount: 'Amount',
    bank: 'Bank',
    account: 'Account',
    status: 'Status',
    createdAt: 'Sent',
    rejectReason: 'Rejected because: {{reason}}',
    transferReference: 'Transfer reference: {{reference}}',
    statuses: {
      PENDING: 'Waiting',
      APPROVED: 'Approved, awaiting transfer',
      REJECTED: 'Rejected',
      COMPLETED: 'Transferred'
    }
  },
  form: {
    title: 'Withdraw to a bank account',
    description:
      'The amount is held as soon as you send. The center holding your money (an administrator for a center wallet) transfers it; the request then completes by itself and you are notified. If rejected, the money returns to your balance.',
    center: 'Withdraw from the money held by',
    centerHint: 'This center handles the request. Up to {{amount}}.',
    centerPlatform: 'CareConnect (older money, handled by an administrator)',
    centerOption: '{{name}} · {{amount}}',
    centerLoading: 'Loading balances per center…',
    amount: 'Amount to withdraw (₫)',
    amountHint: 'Up to {{amount}}',
    withdrawAll: 'Withdraw all',
    bankName: 'Bank name',
    bankNamePlaceholder: 'For example: Vietcombank',
    bankAccountNumber: 'Account number',
    accountHolderName: 'Account holder name',
    accountHolderHint: 'Exactly as on the bank account',
    summary: 'After sending',
    summaryAvailable: 'Available balance left',
    summaryHeld: 'Awaiting withdrawal',
    submit: 'Send request',
    cancel: 'Cancel',
    success: 'Withdrawal of {{amount}} requested',
    errors: {
      amountRequired: 'Enter the amount to withdraw.',
      amountInvalid: 'The amount must be a positive whole number of dong.',
      amountTooHigh: 'The amount exceeds your available balance.',
      amountTooHighForCenter: 'The amount exceeds your balance at this center.',
      bankNameRequired: 'Enter the bank name.',
      accountRequired: 'Enter the account number.',
      accountInvalid: 'The account number has 6 to 20 digits.',
      holderRequired: 'Enter the account holder name.',
      tooLong: 'The text is too long.'
    }
  },
  errors: {
    e6040: 'Wallet not found.',
    e6041: 'The amount exceeds your available balance.',
    e6042: 'Withdrawal request not found.',
    e6043: 'The withdrawal request was already handled or no longer allows this action.',
    e6052: 'This wallet cannot be withdrawn from.',
    e6053: "Choose which center's money to withdraw.",
    e6054: 'The amount exceeds your balance at this center.',
    e6055: 'Another center or an administrator handles this request.',
    e6027: 'This manager account is not assigned to a center.',
    generic: 'Could not load the wallet. Please try again.',
    unavailable: 'The payment service is temporarily unavailable. Please try again later.'
  },
  admin: {
    title: 'Withdrawal requests',
    subtitle:
      'You transfer center-wallet withdrawals (and older requests without a center); customer and caregiver requests are handled by the center holding the money — they appear here for oversight only.',
    filters: 'Filter requests',
    allStatuses: 'All statuses',
    allOwners: 'All wallet types',
    requester: 'Requester',
    unknown: 'Unknown',
    owner: 'Wallet type',
    empty: 'No request matches the filters.',
    open: 'View',
    detailTitle: 'Withdrawal of {{amount}}',
    walletBalance: 'Current wallet balance',
    ledger: 'Recent wallet transactions',
    reject: 'Reject',

    close: 'Close',
    rejectReason: 'Reason for rejecting',
    rejectReasonRequired: 'Enter a reason for rejecting.',

    reviewedAt: 'Handled at {{time}}',
    completedAt: 'Transferred at {{time}}',
    copy: 'Copy'
  },
  nav: {
    customer: 'My wallet',
    caregiver: 'My wallet',
    manager: 'Center wallet',
    managerWithdrawals: 'Withdrawal requests'
  },
  review: {
    managerTitle: 'Withdrawal requests',
    managerSubtitle:
      'Customers and caregivers withdraw money the center holds for them (refunds, kept deposits). The bank transfer is simulated — once it succeeds the request completes by itself and the requester is notified.',
    scopes: { REVIEW: 'For me to handle', OWN: 'All' },
    handledBy: 'Handled by',
    handledByCenter: 'Center {{name}}',
    handledByAdmin: 'Administrator',
    readOnly: '{{handler}} handles this request — view only.',
    transfer: 'Transfer',
    transferTitle: 'Simulated bank transfer',
    transferHint:
      'The system transfers {{amount}} to {{bank}} · {{account}} · {{holder}}. On success the request moves to "Transferred" by itself — no manual confirmation.',
    transferConfirm: 'Transfer {{amount}}',
    transferring: 'Transferring…',
    transferred: 'Transferred {{amount}} — reference {{reference}}',
    rejected: 'Request rejected, the money is back in the requester wallet',
    reference: 'Reference',
    sourceCenter: 'Money held by',
    pendingFirst: 'Waiting first',
    filtersTitle: 'Filter by',
    requesterKinds: { CUSTOMER: 'Customer', CAREGIVER: 'Caregiver', CENTER: 'Center', PLATFORM: 'Platform' },
    openQueue: 'Open the withdrawal queue',
    pendingCount: '{{count}} requests waiting · {{amount}}'
  },
  breakdown: {
    title: 'Wallet movements by type',
    hint: 'The total of each kind of movement in this period.'
  },
  stats: {
    title: 'Withdrawals at a glance',
    hint: 'Waiting counts every open request; the rest follow the period.',
    pending: 'Waiting',
    pendingHint: '{{count}} requests',
    completed: 'Transferred in the period',
    completedHint: '{{count}} requests',
    rejected: 'Rejected in the period',
    rejectedHint: '{{count}} requests',
    requested: 'New in the period',
    requestedHint: '{{count}} requests',
    processing: 'Average handling time',
    processingNone: 'None yet',
    chartTitle: 'Withdrawals over time',
    chartHint: 'Amounts requested and amounts transferred.',
    requestedSeries: 'Requested',
    completedSeries: 'Transferred',
    ownersTitle: 'By requester',
    ownersHint: 'Waiting now and transferred in the period.',
    ownerRow: '{{pending}} waiting · {{completed}} transferred',
    custodyTitle: 'Money the center holds for others',
    custodyHint:
      'Refunds and kept deposits of customers and caregivers tied to this center, still in their wallets — the center must be ready to pay them out.',
    custodyTotal: 'Held in total',
    custodyCustomer: 'For customers',
    custodyCaregiver: 'For caregivers',
    custodyHeld: 'Waiting to be withdrawn'
  }
} as const
