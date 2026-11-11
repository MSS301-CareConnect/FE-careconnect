import { commonEn, commonVi } from './common-resources'
import { bookingSharedEn, bookingSharedVi } from './booking-resources'
import { bookingScheduleEn, bookingScheduleVi } from './booking-schedule-resources'
import { paymentSharedEn, paymentSharedVi } from './payment-resources'
import { walletEn, walletVi } from './wallet-resources'
import { caregiverAbsenceEn, caregiverAbsenceVi } from './caregiver-absence-resources'
import { aiChatEn, aiChatVi } from './ai-chat-resources'
import { certificateReviewEn, certificateReviewVi } from './certificate-review-resources'
import { notificationEn, notificationVi } from './notification-resources'
import { aftercareEn, aftercareVi } from './aftercare-resources'
import { statisticsEn, statisticsVi } from './statistics-resources'
import { publicHomeEn, publicHomeVi } from './public/home-resources'
import { authEn, authVi } from './auth/login-resources'
import { registrationEn, registrationVi } from './auth/registration-resources'
import { recoveryEn, recoveryVi } from './auth/password-recovery-resources'
import { securityEn, securityVi } from './auth/security-resources'
import { authShellEn, authShellVi } from './auth/shell-resources'
import { customerLayoutEn, customerLayoutVi } from './customer/layout-resources'
import { customerHomeEn, customerHomeVi } from './customer/home-resources'
import { bookingDetailEn, bookingDetailVi } from './customer/booking-detail-resources'
import { bookingsEn, bookingsVi } from './customer/bookings-resources'
import { profileEn, profileVi } from './customer/profile-resources'
import { patientProfilesEn, patientProfilesVi } from './customer/patient-profiles-resources'
import { patientDetailEn, patientDetailVi } from './customer/patient-detail-resources'
import { patientCreateEn, patientCreateVi } from './customer/patient-create-resources'
import { careRecipientEn, careRecipientVi } from './customer/care-recipient-resources'
import { customerServicesEn, customerServicesVi } from './customer/services-resources'
import { serviceDetailEn, serviceDetailVi } from './customer/service-detail-resources'
import { caregiversEn, caregiversVi } from './customer/caregivers-resources'
import { customerProviderEn, customerProviderVi } from './customer/provider-resources'
import { bookingEn, bookingVi } from './customer/booking-resources'
import { careReportEn, careReportVi } from './customer/care-report-resources'
import { bookingReviewEn, bookingReviewVi } from './customer/booking-review-resources'
import { caregiverChangeEn, caregiverChangeVi } from './customer/caregiver-change-resources'
import {
  customerPaymentEn,
  customerPaymentVi,
  customerPaymentsEn,
  customerPaymentsVi
} from './customer/payment-resources'
import {
  customerInvitationsEn,
  customerInvitationsVi,
  customerManagersEn,
  customerManagersVi
} from './customer/managers-resources'
import { centerPickerEn, centerPickerVi } from './customer/center-picker-resources'
import { customerCentersEn, customerCentersVi } from './customer/centers-resources'
import { caregiverLayoutEn, caregiverLayoutVi } from './caregiver/layout-resources'
import { caregiverProfileEn, caregiverProfileVi } from './caregiver/profile-resources'
import { caregiverProviderEn, caregiverProviderVi } from './caregiver/provider-resources'
import { caregiverVisitsEn, caregiverVisitsVi } from './caregiver/visits-resources'
import { caregiverBookingEn, caregiverBookingVi } from './caregiver/booking-resources'
import { caregiverVisitDetailEn, caregiverVisitDetailVi } from './caregiver/visit-detail-resources'
import { caregiverUiEn, caregiverUiVi } from './caregiver/ui-resources'
import { caregiverTodayEn, caregiverTodayVi } from './caregiver/today-resources'
import { caregiverWorkEn, caregiverWorkVi } from './caregiver/work-resources'
import { caregiverMeEn, caregiverMeVi } from './caregiver/me-resources'
import {
  caregiverEarningsEn,
  caregiverEarningsVi,
  caregiverRequestsEn,
  caregiverRequestsVi
} from './caregiver/requests-resources'
import { managerLayoutEn, managerLayoutVi } from './center-manager/layout-resources'
import { managerManagementEn, managerManagementVi } from './center-manager/management-resources'
import { managerDetailEn, managerDetailVi } from './center-manager/detail-resources'
import { managerBookingManagementEn, managerBookingManagementVi } from './center-manager/booking-management-resources'
import { managerBookingDetailEn, managerBookingDetailVi } from './center-manager/booking-detail-resources'
import { managerWithdrawalsEn, managerWithdrawalsVi } from './center-manager/withdrawal-resources'
import { managerProviderEn, managerProviderVi } from './center-manager/provider-resources'
import { managerScheduleEn, managerScheduleVi } from './center-manager/schedule-resources'
import { managerServicesEn, managerServicesVi } from './center-manager/services-resources'
import { managerStatisticsEn, managerStatisticsVi } from './center-manager/statistics-resources'
import { managerPolicyEn, managerPolicyVi } from './center-manager/policy-resources'
import { managerWorkShiftsEn, managerWorkShiftsVi } from './center-manager/work-shifts-resources'
import { adminLayoutEn, adminLayoutVi } from './admin/layout-resources'
import { adminDashboardEn, adminDashboardVi } from './admin/dashboard-resources'
import { adminProfileEn, adminProfileVi } from './admin/profile-resources'
import { adminCentersEn, adminCentersVi } from './admin/centers-resources'
import { adminRevenueEn, adminRevenueVi } from './admin/revenue-resources'
import { adminServicesEn, adminServicesVi } from './admin/services-resources'
import { adminPoliciesEn, adminPoliciesVi } from './admin/policies-resources'
import { adminQualityEn, adminQualityVi } from './admin/quality-resources'
import { adminReviewsComplaintsEn, adminReviewsComplaintsVi } from './admin/reviews-complaints-resources'
import { identityEn, identityVi } from './admin/identity-resources'
import { adminIncidentsEn, adminIncidentsVi } from './admin/incidents-resources'
import { adminBookingsEn, adminBookingsVi } from './admin/bookings-resources'
import { adminCaregiverQueueEn, adminCaregiverQueueVi } from './admin/caregiver-queue-resources'
import { adminCertificatesEn, adminCertificatesVi } from './admin/certificates-resources'
import { adminProviderEn, adminProviderVi } from './admin/provider-resources'
import { adminToastEn, adminToastVi } from './admin/toast-resources'

export const resources = {
  en: {
    translation: {
      ...commonEn,
      booking: bookingSharedEn,
      bookingSchedule: bookingScheduleEn,
      payment: paymentSharedEn,
      wallet: walletEn,
      caregiverAbsence: caregiverAbsenceEn,
      aiChat: aiChatEn,
      certificateReview: certificateReviewEn,
      notifications: notificationEn,
      aftercare: aftercareEn,
      statistics: statisticsEn,
      home: publicHomeEn,
      auth: { ...authEn, registration: registrationEn, recovery: recoveryEn, security: securityEn, shell: authShellEn },
      customer: {
        ...customerLayoutEn,
        home: customerHomeEn,
        bookingDetail: bookingDetailEn,
        myBookings: bookingsEn,
        profile: profileEn,
        patientProfiles: patientProfilesEn,
        patientDetail: patientDetailEn,
        patientCreate: patientCreateEn,
        careRecipient: careRecipientEn,
        services: customerServicesEn,
        serviceDetail: serviceDetailEn,
        caregivers: caregiversEn,
        provider: customerProviderEn,
        booking: bookingEn,
        careReport: careReportEn,
        bookingReview: bookingReviewEn,
        caregiverChange: caregiverChangeEn,
        payment: customerPaymentEn,
        payments: customerPaymentsEn,
        managers: customerManagersEn,
        invitations: customerInvitationsEn,
        centerPicker: centerPickerEn,
        centers: customerCentersEn
      },
      caregiver: {
        ...caregiverLayoutEn,
        profile: caregiverProfileEn,
        provider: caregiverProviderEn,
        visits: caregiverVisitsEn,
        booking: caregiverBookingEn,
        visitDetail: caregiverVisitDetailEn,
        ui: caregiverUiEn,
        today: caregiverTodayEn,
        work: caregiverWorkEn,
        me: caregiverMeEn,
        requests: caregiverRequestsEn,
        earnings: caregiverEarningsEn
      },
      centerManager: {
        ...managerLayoutEn,
        management: managerManagementEn,
        detail: managerDetailEn,
        bookingManagement: managerBookingManagementEn,
        bookingDetail: managerBookingDetailEn,
        withdrawals: managerWithdrawalsEn,
        provider: managerProviderEn,
        schedules: managerScheduleEn,
        services: managerServicesEn,
        statisticsPage: managerStatisticsEn,
        policyPage: managerPolicyEn,
        workShifts: managerWorkShiftsEn
      },
      admin: {
        ...adminLayoutEn,
        dashboardPage: adminDashboardEn,
        profilePage: adminProfileEn,
        revenuePage: adminRevenueEn,
        servicesPage: adminServicesEn,
        centersPage: adminCentersEn,
        policiesPage: adminPoliciesEn,
        qualityPage: adminQualityEn,
        reviewsComplaintsPage: adminReviewsComplaintsEn,
        incidentsPage: adminIncidentsEn,
        bookingsPage: adminBookingsEn,
        caregiverQueuePage: adminCaregiverQueueEn,
        certificatesPage: adminCertificatesEn,
        identity: identityEn,
        provider: adminProviderEn,
        toast: adminToastEn
      }
    }
  },
  vi: {
    translation: {
      ...commonVi,
      booking: bookingSharedVi,
      bookingSchedule: bookingScheduleVi,
      payment: paymentSharedVi,
      wallet: walletVi,
      caregiverAbsence: caregiverAbsenceVi,
      aiChat: aiChatVi,
      certificateReview: certificateReviewVi,
      notifications: notificationVi,
      aftercare: aftercareVi,
      statistics: statisticsVi,
      home: publicHomeVi,
      auth: { ...authVi, registration: registrationVi, recovery: recoveryVi, security: securityVi, shell: authShellVi },
      customer: {
        ...customerLayoutVi,
        home: customerHomeVi,
        bookingDetail: bookingDetailVi,
        myBookings: bookingsVi,
        profile: profileVi,
        patientProfiles: patientProfilesVi,
        patientDetail: patientDetailVi,
        patientCreate: patientCreateVi,
        careRecipient: careRecipientVi,
        services: customerServicesVi,
        serviceDetail: serviceDetailVi,
        caregivers: caregiversVi,
        provider: customerProviderVi,
        booking: bookingVi,
        careReport: careReportVi,
        bookingReview: bookingReviewVi,
        caregiverChange: caregiverChangeVi,
        payment: customerPaymentVi,
        payments: customerPaymentsVi,
        managers: customerManagersVi,
        invitations: customerInvitationsVi,
        centerPicker: centerPickerVi,
        centers: customerCentersVi
      },
      caregiver: {
        ...caregiverLayoutVi,
        profile: caregiverProfileVi,
        provider: caregiverProviderVi,
        visits: caregiverVisitsVi,
        booking: caregiverBookingVi,
        visitDetail: caregiverVisitDetailVi,
        ui: caregiverUiVi,
        today: caregiverTodayVi,
        work: caregiverWorkVi,
        me: caregiverMeVi,
        requests: caregiverRequestsVi,
        earnings: caregiverEarningsVi
      },
      centerManager: {
        ...managerLayoutVi,
        management: managerManagementVi,
        detail: managerDetailVi,
        bookingManagement: managerBookingManagementVi,
        bookingDetail: managerBookingDetailVi,
        withdrawals: managerWithdrawalsVi,
        provider: managerProviderVi,
        schedules: managerScheduleVi,
        services: managerServicesVi,
        statisticsPage: managerStatisticsVi,
        policyPage: managerPolicyVi,
        workShifts: managerWorkShiftsVi
      },
      admin: {
        ...adminLayoutVi,
        dashboardPage: adminDashboardVi,
        profilePage: adminProfileVi,
        revenuePage: adminRevenueVi,
        servicesPage: adminServicesVi,
        centersPage: adminCentersVi,
        policiesPage: adminPoliciesVi,
        qualityPage: adminQualityVi,
        reviewsComplaintsPage: adminReviewsComplaintsVi,
        incidentsPage: adminIncidentsVi,
        bookingsPage: adminBookingsVi,
        caregiverQueuePage: adminCaregiverQueueVi,
        certificatesPage: adminCertificatesVi,
        identity: identityVi,
        provider: adminProviderVi,
        toast: adminToastVi
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
