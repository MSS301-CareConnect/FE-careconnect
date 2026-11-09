/**
 * Shared frame of the sign-in, registration and password reset screens ("Soft Bento", 2026-11-09, after the owner's
 * EXE auth screens): the forest panel, the phone tabs, and the step indicators.
 */
export const authShellEn = {
  tabsLabel: 'Sign in or create an account',
  signInTab: 'Sign in',
  registerTab: 'Sign up',
  backToSignIn: 'Back to sign in',
  rememberPassword: 'Remembered your password?',
  securityNote: 'Safe & secure care',
  footerMotto: 'CareConnect · Peace of mind when loved ones are cared for',
  panel: {
    switchPromptRegister: 'Create a free account',
    switchPromptLogin: 'Sign in to your account',
    switchPromptForgot: 'Back to sign in',
    login: {
      eyebrow: 'Care at home',
      title: 'Care that feels close to <accent>home</accent>.',
      chip: 'Verified caregiver',
      pillars: {
        profilesTitle: 'Clear profiles',
        profilesText: 'Skills and certificates checked by the center',
        bookingTitle: 'Flexible booking',
        bookingText: 'By the hour, by the day or by the shift',
        followTitle: 'Easy to follow',
        followText: 'A report after every care visit'
      }
    },
    register: {
      title: 'One account for your family’s whole <accent>care</accent> journey.',
      description: 'Keep family profiles, bookings and care reports in one place.',
      chip: 'Ready in a few minutes'
    },
    forgot: {
      eyebrow: 'Account recovery',
      title: 'Back into your account in a <accent>few steps</accent>.',
      description: 'We send a six-digit code to the email you registered with.',
      chip: 'Six-digit code by email',
      stepOne: 'Enter the email you registered with',
      stepTwo: 'Type the six-digit code from that email',
      stepThree: 'Choose a new password and sign in'
    }
  },
  steps: {
    label: 'Progress',
    progress: 'Step {{current, number}} of {{total, number}}',
    details: 'Your details',
    verify: 'Confirm email',
    email: 'Email',
    newPassword: 'New password',
    done: 'Done'
  },
  codeSentTo: 'Code sent to <strong>{{email}}</strong>',
  changeEmail: 'Change email'
} as const

export const authShellVi = {
  tabsLabel: 'Đăng nhập hoặc tạo tài khoản',
  signInTab: 'Đăng nhập',
  registerTab: 'Đăng ký',
  backToSignIn: 'Quay lại đăng nhập',
  rememberPassword: 'Đã nhớ ra mật khẩu?',
  securityNote: 'Bảo mật & An tâm trọn vẹn',
  footerMotto: 'CareConnect · An tâm khi người thân được chăm sóc',
  panel: {
    switchPromptRegister: 'Tạo tài khoản miễn phí',
    switchPromptLogin: 'Đăng nhập vào tài khoản',
    switchPromptForgot: 'Quay lại đăng nhập',
    login: {
      eyebrow: 'Chăm sóc tại nhà',
      title: 'An tâm khi người thân được <accent>chăm sóc</accent>.',
      chip: 'Người chăm sóc đã xác minh',
      pillars: {
        profilesTitle: 'Hồ sơ rõ ràng',
        profilesText: 'Kỹ năng và chứng chỉ được trung tâm kiểm tra',
        bookingTitle: 'Đặt lịch linh hoạt',
        bookingText: 'Theo giờ, theo ngày hoặc theo ca',
        followTitle: 'Theo dõi dễ dàng',
        followText: 'Có báo cáo sau mỗi buổi chăm sóc'
      }
    },
    register: {
      title: 'Một tài khoản cho cả hành trình chăm sóc của <accent>gia đình</accent>.',
      description: 'Lưu hồ sơ người thân, đặt lịch và nhận báo cáo chăm sóc ở cùng một nơi.',
      chip: 'Xong trong vài phút'
    },
    forgot: {
      eyebrow: 'Khôi phục tài khoản',
      title: 'Lấy lại quyền truy cập chỉ trong <accent>vài bước</accent>.',
      description: 'Chúng tôi gửi mã 6 chữ số đến email bạn đã dùng để đăng ký.',
      chip: 'Mã 6 chữ số qua email',
      stepOne: 'Nhập email bạn đã đăng ký',
      stepTwo: 'Nhập mã 6 chữ số trong email',
      stepThree: 'Đặt mật khẩu mới rồi đăng nhập'
    }
  },
  steps: {
    label: 'Tiến trình',
    progress: 'Bước {{current, number}}/{{total, number}}',
    details: 'Thông tin',
    verify: 'Xác nhận email',
    email: 'Email',
    newPassword: 'Mật khẩu mới',
    done: 'Hoàn tất'
  },
  codeSentTo: 'Đã gửi mã đến <strong>{{email}}</strong>',
  changeEmail: 'Đổi email'
} as const
