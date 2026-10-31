/**
 * Admin toasts (V-01): one sentence per nav item and action. `actions` fills the shared system-error sentence (`common.toast.systemError`), so a
 * failed write always names what did not happen.
 */
export const adminToastVi = {
  services: {
    created: 'Đã tạo dịch vụ “{{name}}”.',
    updated: 'Đã cập nhật dịch vụ “{{name}}”.',
    deleted: 'Đã xóa dịch vụ “{{name}}”.',
    actions: { create: 'tạo dịch vụ', update: 'cập nhật dịch vụ', delete: 'xóa dịch vụ' }
  },
  centers: {
    created: 'Đã tạo trung tâm “{{name}}”.',
    updated: 'Đã lưu thông tin trung tâm “{{name}}”.',
    approved: 'Đã duyệt và kích hoạt {{name}}.',
    rejected: 'Đã từ chối trung tâm {{name}}.',
    suspended: 'Đã tạm khóa {{name}}.',
    deactivated: 'Đã chuyển {{name}} sang ngừng hoạt động.',
    reopened: 'Đã mở lại {{name}}.',
    archived: 'Đã lưu trữ trung tâm {{name}}.',
    managerCreated: 'Đã tạo tài khoản quản lý {{name}}.',
    managerLinked: 'Đã ghép {{name}} làm người quản lý.',
    oldManagerLocked: 'Đã khóa tài khoản quản lý cũ {{name}}.',
    actions: {
      create: 'tạo trung tâm',
      update: 'lưu thông tin trung tâm',
      status: 'đổi trạng thái trung tâm',
      archive: 'lưu trữ trung tâm',
      manager: 'tạo tài khoản quản lý',
      link: 'ghép người quản lý'
    }
  },
  bookings: {
    cancelled: 'Đã hủy lịch #{{code}} và hoàn 100% cho khách.',
    actions: { cancel: 'hủy lịch đặt' }
  },
  caregivers: {
    verified: 'Đã duyệt hồ sơ {{name}}.',
    rejected: 'Đã từ chối hồ sơ {{name}}.',
    certificateVerified: 'Đã duyệt chứng chỉ “{{name}}”.',
    certificateRejected: 'Đã từ chối chứng chỉ “{{name}}”.',
    actions: { review: 'duyệt hồ sơ người chăm sóc', certificate: 'duyệt chứng chỉ' }
  },
  complaints: {
    resolved: 'Đã ra quyết định cho khiếu nại.',
    actions: { resolve: 'ra quyết định khiếu nại' }
  },
  accounts: {
    created: 'Đã tạo tài khoản {{name}}.',
    saved: 'Đã lưu hồ sơ {{name}}.',
    locked: 'Đã khóa tài khoản {{name}}.',
    unlocked: 'Đã mở khóa tài khoản {{name}}.',
    deactivated: 'Đã vô hiệu hóa tài khoản {{name}}.',
    roleAssigned: 'Đã gán vai trò {{role}}.',
    roleRevoked: 'Đã gỡ vai trò {{role}}.',
    codeSent: 'Đã gửi mã đặt mật khẩu tới {{email}}.',
    passwordSet: 'Đã đặt mật khẩu cho {{name}}.',
    actions: {
      create: 'tạo tài khoản',
      save: 'lưu hồ sơ tài khoản',
      status: 'đổi trạng thái tài khoản',
      deactivate: 'vô hiệu hóa tài khoản',
      role: 'cập nhật vai trò',
      code: 'gửi mã đặt mật khẩu',
      password: 'đặt mật khẩu'
    }
  },
  roles: {
    created: 'Đã tạo vai trò “{{name}}”.',
    saved: 'Đã lưu quyền của “{{name}}”.',
    actions: { create: 'tạo vai trò', save: 'lưu quyền' }
  },
  incidents: {
    requeued: 'Đã đưa sự cố vào hàng gửi lại.',
    skipped: 'Đã đánh dấu sự cố là xử lý tay.',
    actions: { requeue: 'gửi lại sự cố', skip: 'đánh dấu sự cố' }
  }
} as const

export const adminToastEn = {
  services: {
    created: 'Service “{{name}}” created.',
    updated: 'Service “{{name}}” updated.',
    deleted: 'Service “{{name}}” deleted.',
    actions: { create: 'create the service', update: 'update the service', delete: 'delete the service' }
  },
  centers: {
    created: 'Center “{{name}}” created.',
    updated: 'Center “{{name}}” details saved.',
    approved: '{{name}} approved and activated.',
    rejected: '{{name}} rejected.',
    suspended: '{{name}} suspended.',
    deactivated: '{{name}} set inactive.',
    reopened: '{{name}} reopened.',
    archived: '{{name}} archived.',
    managerCreated: 'Manager account {{name}} created.',
    managerLinked: '{{name}} is now the manager.',
    oldManagerLocked: 'Previous manager account {{name}} locked.',
    actions: {
      create: 'create the center',
      update: 'save the center details',
      status: 'change the center status',
      archive: 'archive the center',
      manager: 'create the manager account',
      link: 'link the manager'
    }
  },
  bookings: {
    cancelled: 'Booking #{{code}} cancelled with a full refund.',
    actions: { cancel: 'cancel the booking' }
  },
  caregivers: {
    verified: '{{name}} verified.',
    rejected: '{{name}} rejected.',
    certificateVerified: 'Certificate “{{name}}” approved.',
    certificateRejected: 'Certificate “{{name}}” rejected.',
    actions: { review: 'review the caregiver', certificate: 'review the certificate' }
  },
  complaints: {
    resolved: 'Complaint decision saved.',
    actions: { resolve: 'decide the complaint' }
  },
  accounts: {
    created: 'Account {{name}} created.',
    saved: 'Profile of {{name}} saved.',
    locked: 'Account {{name}} locked.',
    unlocked: 'Account {{name}} unlocked.',
    deactivated: 'Account {{name}} deactivated.',
    roleAssigned: 'Role {{role}} assigned.',
    roleRevoked: 'Role {{role}} removed.',
    codeSent: 'Password code sent to {{email}}.',
    passwordSet: 'Password set for {{name}}.',
    actions: {
      create: 'create the account',
      save: 'save the account profile',
      status: 'change the account status',
      deactivate: 'deactivate the account',
      role: 'update the role',
      code: 'send the password code',
      password: 'set the password'
    }
  },
  roles: {
    created: 'Role “{{name}}” created.',
    saved: 'Permissions of “{{name}}” saved.',
    actions: { create: 'create the role', save: 'save the permissions' }
  },
  incidents: {
    requeued: 'Incident queued to be sent again.',
    skipped: 'Incident marked as handled by hand.',
    actions: { requeue: 'requeue the incident', skip: 'mark the incident' }
  }
} as const
