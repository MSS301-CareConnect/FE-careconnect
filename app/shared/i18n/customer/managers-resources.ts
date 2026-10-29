export const customerManagersVi = {
  title: 'Người cùng quản lý',
  primary: 'Quản lý chính',
  levels: { VIEWER: 'Chỉ xem', EDITOR: 'Được chỉnh sửa', OWNER: 'Chủ sở hữu' },
  relationships: {
    CHILD: 'Con',
    SPOUSE: 'Vợ / chồng',
    PARENT: 'Cha / mẹ',
    SIBLING: 'Anh / chị / em',
    GRANDCHILD: 'Cháu',
    RELATIVE: 'Họ hàng',
    OTHER: 'Khác'
  },
  inviteHint: 'Mời người thân bằng email. Họ chỉ thấy hồ sơ sau khi tự chấp nhận lời mời trong 7 ngày.',
  email: 'Email người được mời',
  relationship: 'Quan hệ với người bệnh',
  level: 'Quyền',
  invite: 'Gửi lời mời',
  invited: 'Đã ghi nhận lời mời. Nếu email có tài khoản khách hàng, người đó sẽ thấy lời mời.',
  pending: 'Lời mời đang chờ',
  revoke: 'Thu hồi lời mời gửi {{email}}',
  revokeShort: 'Thu hồi',
  remove: 'Gỡ {{name}} khỏi hồ sơ',
  removeShort: 'Gỡ',
  errors: {
    e2402: 'Người này đã cùng quản lý hồ sơ.',
    e2403: 'Không thể gỡ chủ sở hữu cuối cùng.',
    e2405: 'Hãy chuyển quyền quản lý chính trước.',
    e2408: 'Email không đúng định dạng.',
    e2410: 'Không tìm thấy lời mời.',
    e2411: 'Lời mời đã được xử lý.',
    e2412: 'Lời mời đã hết hạn.',
    e2413: 'Đã có lời mời đang chờ cho email này.',
    e2414: 'Chỉ người quản lý chính được mời hoặc gỡ người thân.',
    generic: 'Không thực hiện được, vui lòng thử lại.'
  }
}

export const customerManagersEn = {
  title: 'Co-managers',
  primary: 'Primary manager',
  levels: { VIEWER: 'View only', EDITOR: 'Can edit', OWNER: 'Owner' },
  relationships: {
    CHILD: 'Child',
    SPOUSE: 'Spouse',
    PARENT: 'Parent',
    SIBLING: 'Sibling',
    GRANDCHILD: 'Grandchild',
    RELATIVE: 'Relative',
    OTHER: 'Other'
  },
  inviteHint: 'Invite a family member by email. They see the profile only after accepting within 7 days.',
  email: 'Invitee email',
  relationship: 'Relationship to the patient',
  level: 'Access',
  invite: 'Send invitation',
  invited: 'Invitation recorded. If the email has a customer account, that person will see it.',
  pending: 'Pending invitations',
  revoke: 'Revoke the invitation sent to {{email}}',
  revokeShort: 'Revoke',
  remove: 'Remove {{name}} from the profile',
  removeShort: 'Remove',
  errors: {
    e2402: 'This person already co-manages the profile.',
    e2403: 'The last owner cannot be removed.',
    e2405: 'Transfer the primary role first.',
    e2408: 'The email format is invalid.',
    e2410: 'Invitation not found.',
    e2411: 'This invitation has already been handled.',
    e2412: 'This invitation has expired.',
    e2413: 'A pending invitation already exists for this email.',
    e2414: 'Only the primary manager can invite or remove family members.',
    generic: 'Something went wrong. Please try again.'
  }
}

export const customerInvitationsVi = {
  documentTitle: 'Lời mời quản lý hồ sơ | CareConnect',
  title: 'Lời mời quản lý hồ sơ',
  subtitle: 'Người thân mời bạn cùng quản lý hồ sơ chăm sóc. Bạn chỉ thấy chi tiết hồ sơ sau khi chấp nhận.',
  loading: 'Đang tải lời mời…',
  empty: 'Bạn không có lời mời nào.',
  profile: 'Hồ sơ: {{name}}',
  expires: 'Hết hạn {{time}}',
  accept: 'Chấp nhận',
  decline: 'Từ chối',
  accepted: 'Đã chấp nhận lời mời.',
  openProfiles: 'Xem hồ sơ người thân'
}

export const customerInvitationsEn = {
  documentTitle: 'Profile invitations | CareConnect',
  title: 'Profile invitations',
  subtitle: 'Family members invited you to co-manage a care profile. You see its details only after accepting.',
  loading: 'Loading invitations…',
  empty: 'You have no invitations.',
  profile: 'Profile: {{name}}',
  expires: 'Expires {{time}}',
  accept: 'Accept',
  decline: 'Decline',
  accepted: 'Invitation accepted.',
  openProfiles: 'Open the family profiles'
}
