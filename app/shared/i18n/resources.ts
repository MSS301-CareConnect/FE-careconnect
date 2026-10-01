import { commonEn, commonVi } from './common-resources'
import { customerLayoutEn, customerLayoutVi } from './customer/layout-resources'
import { bookingDetailEn, bookingDetailVi } from './customer/booking-detail-resources'
import { bookingsEn, bookingsVi } from './customer/bookings-resources'
import { profileEn, profileVi } from './customer/profile-resources'
import { patientProfilesEn, patientProfilesVi } from './customer/patient-profiles-resources'
import { patientDetailEn, patientDetailVi } from './customer/patient-detail-resources'
import { patientCreateEn, patientCreateVi } from './customer/patient-create-resources'
import { caregiversEn, caregiversVi } from './customer/caregivers-resources'
import { bookingEn, bookingVi } from './customer/booking-resources'
import { bookingDepositEn, bookingDepositVi } from './customer/booking-deposit-resources'
import { careReportEn, careReportVi } from './customer/care-report-resources'
import { bookingReviewEn, bookingReviewVi } from './customer/booking-review-resources'
import { caregiverLayoutEn, caregiverLayoutVi } from './caregiver/layout-resources'
import { caregiverDashboardEn, caregiverDashboardVi } from './caregiver/dashboard-resources'
import { caregiverScheduleEn, caregiverScheduleVi } from './caregiver/schedule-resources'
import { caregiverShiftDetailEn, caregiverShiftDetailVi } from './caregiver/shift-detail-resources'
import { caregiverActiveSessionEn, caregiverActiveSessionVi } from './caregiver/active-session-resources'
import { caregiverRecordsEn, caregiverRecordsVi } from './caregiver/care-record-resources'
import { caregiverReportEn, caregiverReportVi } from './caregiver/care-report-resources'
import { caregiverHistoryEn, caregiverHistoryVi } from './caregiver/care-history-resources'
import { caregiverProfileEn, caregiverProfileVi } from './caregiver/profile-resources'
import { managerLayoutEn, managerLayoutVi } from './center-manager/layout-resources'
import { managerManagementEn, managerManagementVi } from './center-manager/management-resources'
import { managerDetailEn, managerDetailVi } from './center-manager/detail-resources'
import { managerBookingManagementEn, managerBookingManagementVi } from './center-manager/booking-management-resources'
import { managerBookingDetailEn, managerBookingDetailVi } from './center-manager/booking-detail-resources'
import { adminLayoutEn, adminLayoutVi } from './admin/layout-resources'
import { adminDashboardEn, adminDashboardVi } from './admin/dashboard-resources'
import { adminCustomersEn, adminCustomersVi } from './admin/customers-resources'
import { adminCentersEn, adminCentersVi } from './admin/centers-resources'
import { adminRevenueEn, adminRevenueVi } from './admin/revenue-resources'
import { adminServicesEn, adminServicesVi } from './admin/services-resources'
import { adminPoliciesEn, adminPoliciesVi } from './admin/policies-resources'
import { adminQualityEn, adminQualityVi } from './admin/quality-resources'
import { adminReviewsComplaintsEn, adminReviewsComplaintsVi } from './admin/reviews-complaints-resources'

export const resources = {
  en: {
    translation: {
      ...commonEn,
      customer: {
        ...customerLayoutEn,
        bookingDetail: bookingDetailEn,
        myBookings: bookingsEn,
        profile: profileEn,
        patientProfiles: patientProfilesEn,
        patientDetail: patientDetailEn,
        patientCreate: patientCreateEn,
        caregivers: caregiversEn,
        booking: bookingEn,
        bookingDeposit: bookingDepositEn,
        careReport: careReportEn,
        bookingReview: bookingReviewEn
      },
      caregiver: {
        ...caregiverLayoutEn,
        ...caregiverDashboardEn,
        schedulePage: caregiverScheduleEn,
        shiftDetail: caregiverShiftDetailEn,
        activeSession: caregiverActiveSessionEn,
        careRecords: caregiverRecordsEn,
        careReport: caregiverReportEn,
        careHistory: caregiverHistoryEn,
        profile: caregiverProfileEn
      },
      centerManager: {
        ...managerLayoutEn,
        management: managerManagementEn,
        detail: managerDetailEn,
        bookingManagement: managerBookingManagementEn,
        bookingDetail: managerBookingDetailEn
      },
      admin: {
        ...adminLayoutEn,
        dashboardPage: adminDashboardEn,
        revenuePage: adminRevenueEn,
        customersPage: adminCustomersEn,
        servicesPage: adminServicesEn,
        centersPage: adminCentersEn,
        policiesPage: adminPoliciesEn,
        qualityPage: adminQualityEn,
        reviewsComplaintsPage: adminReviewsComplaintsEn
      }
    }
  },
  vi: {
    translation: {
      ...commonVi,
      customer: {
        ...customerLayoutVi,
        bookingDetail: bookingDetailVi,
        myBookings: bookingsVi,
        profile: profileVi,
        patientProfiles: patientProfilesVi,
        patientDetail: patientDetailVi,
        patientCreate: patientCreateVi,
        caregivers: caregiversVi,
        booking: bookingVi,
        bookingDeposit: bookingDepositVi,
        careReport: careReportVi,
        bookingReview: bookingReviewVi
      },
      caregiver: {
        ...caregiverLayoutVi,
        ...caregiverDashboardVi,
        schedulePage: caregiverScheduleVi,
        shiftDetail: caregiverShiftDetailVi,
        activeSession: caregiverActiveSessionVi,
        careRecords: caregiverRecordsVi,
        careReport: caregiverReportVi,
        careHistory: caregiverHistoryVi,
        profile: caregiverProfileVi
      },
      centerManager: {
        ...managerLayoutVi,
        management: managerManagementVi,
        detail: managerDetailVi,
        bookingManagement: managerBookingManagementVi,
        bookingDetail: managerBookingDetailVi
      },
      admin: {
        ...adminLayoutVi,
        dashboardPage: adminDashboardVi,
        revenuePage: adminRevenueVi,
        customersPage: adminCustomersVi,
        servicesPage: adminServicesVi,
        centersPage: adminCentersVi,
        policiesPage: adminPoliciesVi,
        qualityPage: adminQualityVi,
        reviewsComplaintsPage: adminReviewsComplaintsVi
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
