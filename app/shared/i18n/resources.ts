import { careReportEn, careReportVi } from './care-report-resources'
import { bookingReviewEn, bookingReviewVi } from './booking-review-resources'

export const resources = {
  en: {
    translation: {
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
      },
      customer: {
        careReport: careReportEn,
        bookingReview: bookingReviewEn,
        bookingDetail: {
          documentTitle: 'Booking {{code}} | CareConnect',
          breadcrumb: 'Booking details',
          title: 'Care session details',
          sampleNotice: 'This page shows sample booking data. Live clinical updates and actions are not connected yet.',
          notFound: {
            title: 'Booking not found',
            description: 'This booking code is not in the available booking preview.',
            back: 'Back to my bookings'
          },
          status: {
            ongoing: 'Care in progress',
            upcoming: 'Care scheduled',
            completed: 'Care completed',
            cancelled: 'Booking cancelled'
          },
          timeline: {
            title: 'Care session progress',
            schedule: 'Scheduled session',
            progress: 'Session progress',
            current: 'Current step',
            steps: {
              confirmed: 'Booking confirmed',
              assigned: 'Caregiver assigned',
              checkIn: 'Home check-in',
              care: 'Care in progress',
              complete: 'Session handover'
            },
            note: {
              ongoing: 'The caregiver is carrying out the scheduled care plan.',
              upcoming: 'The session is confirmed and waiting for the scheduled start time.',
              completed: 'The care session has ended.',
              cancelled: 'This booking was cancelled. No care session is in progress.'
            }
          },
          vitals: {
            title: 'Sample vital signs',
            measured: 'Illustrative measurements from the provided design',
            stable: 'Stable',
            bloodPressure: 'Blood pressure',
            oxygen: 'Oxygen saturation',
            pulse: 'Heart rate',
            temperature: 'Body temperature',
            glucose: 'Blood glucose',
            next: 'Next scheduled check',
            normal: 'Normal',
            good: 'Good',
            regular: 'Regular',
            beforeMeal: 'Before meal'
          },
          feed: {
            title: 'Sample care journal',
            subtitle: 'Illustrative entries from the provided design',
            entries: {
              start: { title: 'Session started', description: 'Check-in and initial wellbeing assessment.' },
              medicine: { title: 'Morning medication', description: 'Medication support according to the care plan.' },
              nursing: { title: 'Nursing care', description: 'Personal care and dressing check.' },
              therapy: { title: 'Mobility exercises', description: 'Assisted rehabilitation exercises.' },
              lunch: { title: 'Preparing lunch', description: 'A suitable meal is being prepared.' }
            }
          },
          service: {
            title: 'Care service package',
            description: 'The care plan associated with this booking.',
            included: 'Planned care activities',
            items: {
              monitoring: 'Monitor vital signs during the session',
              movement: 'Support mobility and rehabilitation exercises',
              hygiene: 'Assist with safe personal care',
              medication: 'Support medication according to instructions',
              report: 'Prepare a care summary after the session'
            }
          },
          people: {
            title: 'Care location and recipient',
            address: 'Care location',
            patient: 'Care recipient',
            caregiver: 'Assigned caregiver',
            caregiverNote: 'Caregiver details are shown as a preview.'
          },
          payment: {
            title: 'Cost and payment',
            total: 'Session total',
            paid: 'Deposit paid',
            remaining: 'Remaining balance',
            refunded: 'Deposit refunded',
            status: 'Payment status'
          },
          policy: {
            title: 'Cancellation and support',
            before: 'Cancellation and refund terms depend on the confirmed booking policy.',
            during: 'For urgent care concerns, contact CareConnect support through the official channel.',
            unavailable: 'Calling, messaging, and emergency stop are available after backend integration.',
            call: 'Call caregiver',
            message: 'Message caregiver',
            stop: 'Request emergency stop'
          }
        },
        myBookings: {
          documentTitle: 'My Bookings | CareConnect',
          breadcrumb: 'My Bookings',
          title: 'Manage care bookings',
          subtitle: 'Track confirmed sessions, care updates, and schedules for your family.',
          newBooking: 'Book a new care session',
          sampleNotice: 'Preview bookings while live booking history is being connected.',
          stats: {
            ongoing: 'Ongoing',
            upcoming: 'Upcoming',
            completed: 'Completed',
            cancelled: 'Cancelled / Refunded'
          },
          tabs: {
            all: 'All bookings',
            ongoing: 'Ongoing',
            upcoming: 'Upcoming',
            completed: 'Completed',
            cancelled: 'Cancelled'
          },
          filters: {
            month: 'Month',
            allMonths: 'All dates',
            patient: 'Family member',
            allPatients: 'All family members',
            search: 'Search by booking code, family member, or caregiver',
            reset: 'Reset filters'
          },
          patients: {
            father: 'Mr. Nguyen Van An',
            mother: 'Ms. Nguyen Thi A'
          },
          items: {
            ongoing: {
              status: 'In progress',
              patient: 'Mr. Nguyen Van An',
              relation: '78 years old · Father (high blood pressure)',
              caregiverRole: 'Emergency care specialist',
              service: 'Advanced elderly care',
              location: 'Apartment 18.04, Landmark 2, Vinhomes Central Park, Binh Thanh',
              note: 'Checked in at 07:55 · 4h 15m of 9h completed',
              payment: '50% deposit paid · 800,000 ₫ remaining'
            },
            upcoming: {
              status: 'Confirmed and deposit paid',
              patient: 'Ms. Nguyen Thi A',
              relation: '76 years old · Mother (postoperative care)',
              caregiverRole: 'Nursing graduate · 4.9 rating',
              service: 'Recovery and mobility support',
              location: 'Villa 42, Street 12, Thao Dien, Thu Duc City',
              note: 'Session confirmed · Caregiver assigned',
              payment: '750,000 ₫ deposit paid · 700,000 ₫ remaining'
            },
            completed: {
              status: 'Completed',
              patient: 'Ms. Nguyen Thi A',
              relation: '76 years old · Mother',
              caregiverRole: '10 years of elderly care experience',
              service: 'Routine nursing and blood sugar monitoring',
              location: 'Thao Dien, Thu Duc City',
              note: 'Your rating: 5/5 · Attentive care and timely reports',
              payment: 'Paid in full via Visa · Invoice #VAT-9750'
            },
            cancelled: {
              status: 'Cancelled and fully refunded',
              patient: 'Mr. Nguyen Van An',
              relation: '78 years old · Father',
              caregiverRole: 'Cardiology specialist',
              service: 'Home nursing care',
              location: 'Binh Thanh, Ho Chi Minh City',
              note: 'Cancelled more than 24 hours before the session',
              payment: '100% deposit refunded · 450,000 ₫'
            }
          },
          labels: {
            patient: 'Care recipient',
            caregiver: 'Assigned caregiver',
            service: 'Service package',
            total: 'Total cost',
            schedule: 'Schedule',
            location: 'Care location',
            payment: 'Payment status'
          },
          actions: {
            details: 'View details',
            close: 'Close details',
            bookAgain: 'Book again',
            findCaregiver: 'Find another caregiver'
          },
          empty: {
            title: 'No matching bookings',
            description: 'Try another search term or change the filters to view your care history.'
          }
        },
        nav: {
          home: 'Home',
          findCaregivers: 'Find Caregivers',
          myBookings: 'My Bookings',
          menu: 'Customer menu',
          familyProfiles: 'Family Profiles',
          messages: 'Messages',
          notifications: 'Notifications',
          customerRole: 'Customer',
          userName: 'Nguyen Mai Anh',
          myProfile: 'My Profile'
        },
        profile: {
          documentTitle: 'My Profile | CareConnect',
          breadcrumb: {
            home: 'Home',
            myAccount: 'My Account',
            personalInfo: 'Personal Information'
          },
          badge: {
            verifiedAccount: 'Verified Account',
            online: 'Online',
            verified: 'Verified',
            securityLevel2: 'Level 2 Security'
          },
          header: {
            title: 'Personal Profile',
            subtitle:
              'Manage personal information, update address for coordinator support, and secure your CareConnect family account.'
          },
          overview: {
            avatarAlt: 'Profile picture of Nguyen Mai Anh',
            changeAvatar: 'Change avatar',
            verifiedIdentity: 'Verified primary account',
            memberId: 'CC-KH8842',
            memberSince: 'Member since Mar 2024',
            stats: {
              carePatients: 'Family members cared',
              completedShifts: 'Completed sessions',
              sentReviews: 'Reviews given'
            }
          },
          nav: {
            title: 'Account Management',
            personalInfo: 'Personal Info & Edit',
            security: 'Change Password & Security',
            familyProfiles: 'Family member health profiles',
            bookingHistory: 'Booking history',
            notifications: 'Notifications & Preferences'
          },
          support: {
            title: '24/7 Emergency Support',
            hotlineLabel: 'Priority hotline:'
          },
          form: {
            title: 'Detailed Information',
            subtitle: 'Update medical identification information and service delivery location.',
            cancel: 'Cancel',
            saveChanges: 'Save Changes',
            saving: 'Saving...',
            saveSuccess: 'Profile changes saved successfully!',
            autoSaved: 'Auto-saved 2 minutes ago',
            fullName: 'Full Name',
            matchCccd: 'Matches National ID',
            gender: 'Gender',
            genderFemale: 'Female',
            genderMale: 'Male',
            genderOther: 'Other',
            dob: 'Date of Birth',
            idNumber: 'National ID / Citizen ID',
            phone: 'Mobile Phone Number',
            email: 'Invoice & Report Email',
            change: 'Change',
            addressSectionTitle: 'Care delivery residential address',
            city: 'Province / City',
            district: 'District',
            ward: 'Ward',
            addressDetail: 'Specific address (House no., building, street)',
            notes: 'Directions / Emergency contact notes',
            notesHint: 'Exclusively for nurses & coordinators'
          },
          security: {
            title: 'Change Account Password',
            subtitle:
              'To secure your family account, please set a strong password of at least 8 characters including letters, numbers, and special characters.',
            currentPassword: 'Current Password',
            newPassword: 'New Password',
            newPasswordPlaceholder: 'Enter new password',
            confirmPassword: 'Confirm New Password',
            confirmPasswordPlaceholder: 'Re-enter new password',
            securityLevel: 'Security level:',
            strengthStrong: 'Strong (Very secure)',
            standardsTitle: 'CareConnect password standards:',
            ruleMinLength: 'At least 8 characters',
            ruleCaseAndNumber: 'Contains uppercase & number',
            ruleSpecialChar: 'Contains special characters (!@#$%)',
            updatePassword: 'Update Password',
            updating: 'Updating...',
            updated: 'Password updated',
            twoFactorTitle: 'Two-factor authentication (2FA via SMS)',
            twoFactorDesc: 'Receive an OTP when logging in from an unfamiliar device to protect family profiles.'
          },
          familyInsight: {
            title: 'Family members with established health profiles',
            description: 'Mrs. Tran Thi Lan (Mother - 78 yrs), Mr. Nguyen Van Nam (Father - 82 yrs)',
            viewDetails: 'View profile details'
          }
        },
        patientProfiles: {
          documentTitle: 'Family Profiles | CareConnect',
          breadcrumb: {
            home: 'Home',
            myAccount: 'My Account',
            title: 'Family member health profiles'
          },
          header: {
            title: 'Profiles of Care Recipients',
            subtitle:
              'Manage medical records, underlying conditions, dietary regimen, and treatment history to ensure the best care from caregivers.',
            addPatient: '+ Add family profile'
          },
          toolbar: {
            searchPlaceholder: 'Search by name, ID or health insurance number...',
            filterRelationship: {
              all: 'Relationship: All',
              parents: 'Parents',
              grandparents: 'Grandparents',
              children: 'Children'
            },
            filterStatus: {
              all: 'Status: All',
              special: 'Special care needed',
              monitoring: 'Periodic monitoring',
              rehab: 'Rehabilitation'
            },
            activeCount: '{{count}} active profiles'
          },
          card: {
            yearsOld: '{{age}} yrs',
            genderLabel: 'Gender:',
            genderMale: 'Male',
            genderFemale: 'Female',
            statusInCare: 'Active care session',
            statusStable: 'Stable health',
            statusPostOp: 'Post-op recovery monitoring',
            diagnoses: 'Conditions & Complications',
            primaryDiagnosis: 'Primary condition',
            currentStatus: 'Current condition',
            specialInstructions: 'Special instructions',
            rehabInstructions: 'Recovery & Medication notes',
            dietInstructions: 'Dietary & Warnings',
            attendingDoctor: 'Attending doctor',
            viewDetails: 'View details',
            edit: 'Edit',
            delete: 'Delete',
            bookCareNow: 'Book care now',
            bookCare: 'Book care session',
            readyTooltip: 'Ready for care',
            activeTooltip: 'Active profile'
          },
          guidelines: {
            title: 'CareConnect Safe Medical Profile Guidelines',
            description:
              'Fully updated medical records (including current prescriptions, allergy history, and doctor contacts) enable caregivers to establish accurate care plans from day one.',
            badgeHipaa: 'HIPAA Data Encryption',
            badgePrivacy: 'Medical Privacy Security',
            badgeSync: 'Direct sync with Nurse handbook',
            viewDoc: 'View documentation'
          },
          sidebar: {
            accountCode: 'Account ID:',
            verifiedIdentity: 'Verified identity',
            familyMetric: 'Family',
            shiftsMetric: 'Sessions',
            reviewsMetric: 'Reviews',
            emergencyTitle: 'Emergency Medical Hotline',
            emergencySubtitle: '24/7 Toll-free Support',
            emergencyDesc: 'Emergency contact with lead nurse when health condition changes unexpectedly.'
          }
        },
        patientDetail: {
          documentTitle: 'Medical Record Detail | CareConnect',
          breadcrumb: {
            home: 'Home',
            myAccount: 'My Account',
            patientProfiles: 'Family member health profiles',
            title: 'Medical Record Detail'
          },
          banner: {
            back: 'Back to profiles list',
            activeCareSession: 'Active care session in progress',
            titlePrefix: 'Medical Record: ',
            viewMode: 'View mode',
            editMode: 'Edit mode',
            saveUpdate: 'Save updates',
            bookNewCare: 'Book new care session',
            toastSuccess: 'Medical record updated and synchronized successfully!'
          },
          snapshot: {
            bloodType: 'Blood type',
            height: 'Height',
            weight: 'Weight',
            nationalIdLabel: 'National ID / Citizen ID:',
            insuranceIdLabel: 'Health Insurance ID:',
            dobLabel: 'Date of birth:',
            verifiedNotice: 'Electronic health record verified via VNeID database and UMC Hospital HCMC.',
            changeAvatar: 'Update profile picture',
            verifiedRecord: 'Verified identity profile'
          },
          caregiverWidget: {
            title: 'Current Assigned Nurse',
            shiftBadge: 'This afternoon shift',
            ratingCount: '{{rating}} ({{count}} sessions)',
            shiftTimeLabel: 'Shift hours:',
            shiftTimeValue: '08:00 - 17:00 (Daily)',
            chatButton: 'Chat with nurse'
          },
          emergencySection: {
            title: 'Emergency Contacts',
            priorityBadge: 'Priority 24/7',
            callButton: 'Call',
            primaryContact: {
              name: 'Nguyen Mai Anh (You - Daughter)',
              role: 'Primary Guardian • Binh Thanh Dist'
            },
            secondaryContact: {
              name: 'Nguyen Van Hung (Second Son)',
              role: 'Secondary Contact • 0988 123 456'
            },
            hotlineTitle: 'Emergency Medical Dispatch',
            hotlineDesc: '115 Emergency Dispatch & Rapid Response Team'
          },
          medicalBackground: {
            title: 'Underlying Conditions & Medical History',
            lastUpdated: 'Last updated: 3 days ago',
            chronicLabel: 'Chronic conditions under treatment',
            allergyLabel: 'Drug & Food allergy history',
            surgeryLabel: 'Surgical & Intervention history',
            attendingDoctorLabel: 'Attending specialist in charge',
            callDoctor: 'Tel: {{phone}}'
          },
          prescriptions: {
            title: 'Current Prescriptions & Schedule',
            regimenBadge: 'Applying October 2024 regimen',
            thMedication: 'Medication / Active ingredient',
            thDosage: 'Dosage',
            thTime: 'Administration time',
            thInstructions: 'Nurse instructions',
            addMedication: '+ Add medication to prescription'
          },
          carePlan: {
            title: 'Care Plan & Mandatory Vitals',
            standardBadge: 'Hospital standard • Daily cycle',
            mobilityTitle: 'Mobility & Rehabilitation',
            mobilityDesc:
              'Assistance needed when standing up for restroom. Left hand rehabilitation for 30 minutes every afternoon with medical rubber ball.',
            nutritionTitle: 'Dietary Management',
            nutritionDesc:
              'Low sodium diet (less than 3g salt/day), 3 main meals + 1 afternoon snack at 15:00. Ensure 1.5 - 1.8L of water daily.',
            vitalsTitle: 'Vitals twice daily',
            vitalsDesc: 'Measure BP & SpO2 at 07:00 and 17:00. Alert thresholds: Systolic BP > 145 mmHg or < 100 mmHg.',
            addressLabel: 'Home care residential address:'
          },
          historyAndDocs: {
            tabHistory: 'Recent Care Sessions History',
            tabDocs: 'Attached Documents & Lab Results (4)',
            viewSessionReport: 'View session report',
            previewDoc: 'Preview document',
            uploadTitle: 'Click to upload medical record or new referral',
            uploadSubtitle: 'Supports PDF, JPG, PNG up to 15MB'
          }
        },
        patientCreate: {
          documentTitle: 'Add New Care Recipient Profile | CareConnect',
          breadcrumb: {
            home: 'Home',
            myAccount: 'My Account',
            patientProfiles: 'Family member health profiles',
            current: 'Add new patient profile',
            backToList: 'Back to profiles list'
          },
          header: {
            badge: 'CareConnect Electronic Medical Record (EMR)',
            title: 'Create New Care Recipient Health Profile',
            subtitle:
              'Please provide accurate medical history, underlying conditions, and daily habits so nurses and caregivers can establish the safest care plan.',
            cancel: 'Cancel',
            saveDraft: 'Save draft',
            saveProfile: 'Save patient profile'
          },
          draftNotice: {
            text: 'Draft has been automatically saved to your account at {{time}}.',
            close: 'Close notification'
          },
          sidebar: {
            avatarCard: {
              title: 'Patient Portrait Photo',
              subtitle: 'Caregiver recognition',
              uploadLabel: 'Upload portrait photo',
              uploadHint: 'Supports JPG, PNG under 5MB.',
              uploadNote: 'A clear face photo helps caregivers recognize the patient accurately upon arrival.',
              changePhoto: 'Change photo',
              uploadBtn: 'Upload photo'
            },
            stepper: {
              title: 'Form Progress',
              status: '{{completed}}/{{total}} Completed',
              step1Title: '1. Identity & Demographics',
              step1Subtitle: 'Name, age, National ID, blood type, BMI',
              step2Title: '2. Physical & Pathologies',
              step2Subtitle: 'Chronic illnesses, allergy history',
              step3Title: '3. Prescriptions & Schedule',
              step3Subtitle: 'Dosages and critical instructions'
            },
            security: {
              badge: 'Medical Grade Security',
              desc: 'Health records encrypted with AES-256 complying with HIPAA and personal data protection regulations.',
              subdesc: 'Only caregivers approved for the active shift are granted monitoring access.'
            },
            hotline: {
              label: '24/7 Nursing Hotline',
              phone: '1900 6868',
              call: 'Call hotline'
            },
            tips: {
              title: 'Quick tips',
              desc: 'Take a clear photo of the recent hospital prescription to upload in step 3. The system will assist in digitizing medicine names and dosages.'
            }
          },
          section1: {
            title: 'Identity & Basic Information',
            subtitle: 'Demographics and initial biometric metrics',
            requiredNote: '* Required fields',
            fullNameLabel: 'Patient full name',
            fullNamePlaceholder: 'E.g., NGUYEN VAN AN',
            fullNameHint: 'Enter exactly as shown on National ID or Health Insurance card',
            relationshipLabel: 'Relationship to you',
            relationshipOptions: {
              father: 'Father',
              mother: 'Mother',
              spouse: 'Spouse',
              child: 'Child',
              grandparent: 'Grandparent',
              sibling: 'Sibling',
              other: 'Other relative'
            },
            birthDateLabel: 'Date of birth',
            genderLabel: 'Gender',
            genderOptions: {
              male: 'Male',
              female: 'Female',
              other: 'Other'
            },
            idNumberLabel: 'National ID / Citizen Identification',
            idNumberPlaceholder: 'Enter 12-digit chip ID',
            syncVNeID: 'Sync VNeID',
            bhytNumberLabel: 'Health Insurance Number (BHYT)',
            bhytNumberPlaceholder: 'Enter 15-character BHYT code',
            heightLabel: 'Height (cm)',
            weightLabel: 'Weight (kg)',
            bmiLabel: 'BMI Score:',
            bmiStatus: {
              underweight: 'Underweight',
              normal: 'Normal',
              overweight: 'Overweight',
              obese: 'Obese'
            },
            bloodTypeLabel: 'Blood type (ABO & Rh system)',
            bloodTypeUnknown: 'Unknown'
          },
          section2: {
            title: 'Chronic Pathologies & Medical Background',
            subtitle: 'Crucial history providing early warning for shock or drug interactions',
            chronicLabel: 'Chronic conditions under treatment',
            multiSelectHint: 'Select all that apply',
            chronicOptions: {
              hypertension: 'Primary hypertension',
              diabetes: 'Type 2 diabetes',
              strokeHistory: 'History of stroke / cerebrovascular accident',
              heartDisease: 'Coronary artery / cardiovascular disease',
              dementia: 'Dementia / Alzheimer / Parkinson',
              osteoarthritis: 'Knee osteoarthritis / spinal degeneration',
              kidneyDisease: 'Chronic kidney disease',
              copd: 'Chronic obstructive pulmonary disease (COPD)'
            },
            otherChronicPlaceholder: 'Add other conditions (if any, comma-separated)...',
            allergiesTitle: 'DRUG & FOOD ALLERGY HISTORY',
            allergiesBadge: 'Crucial',
            allergiesDesc:
              'Record any anaphylaxis, rashes, urticaria, or bronchospasm caused by antibiotics, NSAIDs, or food.',
            allergyInputPlaceholder: 'Enter drug or food allergen name...',
            addAllergyBtn: '+ Add allergy',
            removeAllergy: 'Remove allergy',
            surgeryHistoryLabel: 'Surgical & Intervention History',
            surgeryHistoryPlaceholder:
              'E.g., Right total knee replacement (2021, Cho Ray Hospital); Laparoscopic cholecystectomy (2018)...',
            doctorNameLabel: 'Attending Physician / Hospital',
            doctorNamePlaceholder: 'E.g., Dr. Tran Huu Duc - UMC Hospital',
            doctorContactLabel: 'Doctor / Department Phone (if available)',
            doctorContactPlaceholder: '090x xxx xxx'
          },
          section3: {
            title: 'Current Prescriptions & Schedule',
            subtitle: 'List of medications caregivers should remind or administer',
            addMedicineBtn: '+ Add new medication',
            medicineNamePlaceholder: 'Brand or generic name...',
            dosageLabel: 'Dosage',
            dosagePlaceholder: 'E.g., 1 tablet / dose...',
            timeLabel: 'Administration time',
            timePlaceholder: 'Morning / Afternoon / Evening...',
            instructionsLabel: 'Caregiver notes',
            instructionsPlaceholder: 'After meals, spaced 2h apart...',
            deleteMedicine: 'Delete medication',
            uploadZoneTitle: 'Upload Hospital Prescription / Medical Report',
            uploadZoneDesc:
              'Drag & drop image files or click to browse (Supports JPG, PNG, PDF up to 10MB). CareConnect clinical pharmacists will verify for safety.',
            chooseFileBtn: 'Choose file from device'
          },
          bottomBar: {
            securityNotice: 'Data protected with multi-layer encryption per Vietnam healthcare standards',
            cancel: 'Cancel',
            saveDraft: 'Save draft',
            complete: 'Complete Patient Profile'
          },
          modal: {
            title: 'Profile Created Successfully!',
            desc: 'Health profile for {{name}} has been securely created and is ready for booking home care sessions now.',
            findCaregiver: 'Find caregivers for this patient',
            backToList: 'Back to profiles list'
          }
        },
        caregivers: {
          documentTitle: 'Find Trusted Caregivers | CareConnect',
          breadcrumb: {
            home: 'Home',
            current: 'Find Caregivers'
          },
          banner: {
            verifiedBadge: '100% verified medical care professionals',
            title: 'Search & Book Trusted Caregivers',
            searchPlaceholder: 'Search by nurse name, specialty, training hospital, or district...',
            clearSearch: 'Clear search',
            searchBtn: 'Search',
            locations: {
              all: 'All Ho Chi Minh City',
              binhthanh: 'Binh Thanh District',
              q1: 'District 1',
              q7: 'District 7',
              thuduc: 'Thu Duc City'
            },
            suggestionsLabel: 'Popular suggestions:',
            tags: {
              postStroke: 'Post-stroke rehabilitation',
              ivInjection: 'Home IV & wound care',
              binhThanh: 'Binh Thanh District',
              eightHours: '8-hour shift',
              dementia: 'Dementia & Alzheimer care'
            }
          },
          filters: {
            title: 'Advanced Filters',
            reset: 'Reset filters',
            skillsTitle: 'Specialty Skills',
            selectedCount: 'Selected: {{count}}',
            skills: {
              elderly: 'Elderly Care / Dementia',
              strokeRehab: 'Post-stroke Rehab / Cerebrovascular',
              ivWound: 'IV Therapy, Dressing & Suture Removal',
              pressureUlcer: 'Pressure Ulcer / Tracheostomy / Feeding Tube',
              acupressure: 'Acupressure & Physical Therapy',
              postnatal: 'Postnatal Mother & Newborn Care'
            },
            experienceTitle: 'Years of Experience',
            experience: {
              all: 'All experience levels',
              under2: 'Under 2 years',
              from2to5: '2 - 5 years (Preferred)',
              over5: 'Over 5 years (Specialized)',
              over10: 'Over 10 years (Head Nurse / B.S.)'
            },
            genderTitle: 'Caregiver Gender',
            gender: {
              all: 'All',
              female: 'Female',
              male: 'Male'
            },
            priceTitle: 'Service Rate',
            priceRange: '180k - 350k / hr',
            minPerHour: 'Min / hr',
            maxPerHour: 'Max / hr',
            minPriceValue: '180,000 đ',
            maxPriceValue: '350,000 đ',
            fixedShiftPackage: 'Filter by fixed shift packages (8h / 24h)',
            ratingTitle: 'Customer Ratings',
            rating: {
              star5: '5.0 absolute',
              star48: '4.8 and above',
              star45: '4.5 and above'
            }
          },
          results: {
            matchCount: 'caregivers matching criteria',
            sortLabel: 'Sort by:',
            sortOptions: {
              highestRating: 'Highest Rating',
              mostExperience: 'Most Experience',
              priceAsc: 'Price: Low to High',
              closest: 'Closest to You (Binh Thanh)'
            },
            viewList: 'List view',
            viewGrid: 'Grid view',
            verifiedTooltip: 'Verified Identity & Credentials',
            reviewsCount: '({{count}} reviews)',
            completedShifts: '{{count}} shifts completed',
            ageGender: '{{gender}} • {{age}} years old',
            experienceLabel: 'Experience {{years}} years:',
            viewDetail: 'View full profile',
            bookNow: 'Book care session now',
            perHourSuffix: '/ hr',
            shift8hSuffix: '(or {{price}} đ/8h shift)',
            paginationText: 'Showing 1 - 3 out of 28 recommended caregivers',
            prevPage: 'Previous page',
            nextPage: 'Next page',
            genders: {
              female: 'Female',
              male: 'Male'
            },
            availability: {
              today: 'Available: Today (from 13:00) & This week',
              tomorrow: 'Available: Tomorrow morning (08:00 - 17:00)',
              recurring: 'Available: Extended shifts & Weekly recurring'
            },
            badges: {
              regularNurse: 'Registered Nurse',
              verified100: 'Verified CareConnect 100%',
              icuNurse: 'B.S. Intensive Care Nurse',
              topRated: 'Top Rated Caregiver',
              elderlySpecialist: 'Elderly Care Specialist',
              dedicated: 'Dedicated & Patient'
            },
            cardSkills: {
              postStroke: 'Post-stroke care',
              strokeRehab: 'Post-stroke recovery',
              rehabMobility: 'Rehabilitation & mobility',
              cardioMeds: 'Cardiovascular medication management',
              vitalSigns: 'Advanced vital signs monitoring',
              ventilatorTube: 'Ventilator / feeding tube care',
              physioTherapy: 'Physical mobility therapy',
              cprEmergency: 'Emergency CPR & first aid',
              alzheimerCare: 'Alzheimer / Dementia care',
              elderlyNutrition: 'Specialized elderly nutrition',
              hygieneCare: 'Attentive personal hygiene & bathing',
              psychTherapy: 'Companionship & psychological therapy'
            },
            bios: {
              nurse1:
                'Former Emergency & ICU nurse at Cho Ray Hospital and UMC HCMC. Deep clinical expertise in elderly patients with complex comorbidities.',
              nurse2:
                'Former lead in Cardiology - Intensive Care. Advanced skills in emergency resuscitation, ventilator/feeding tube care, and hemiplegia recovery.',
              nurse3:
                'Extensive experience at HCMC Elderly Care & Rehabilitation Center. Patient and understanding with dementia, Alzheimer, or post-stroke temperament.'
            }
          }
        },
        booking: {
          documentTitle: 'Create Home Care Appointment | CareConnect',
          breadcrumb: {
            home: 'Home',
            caregivers: 'Find Caregivers',
            current: 'New Care Booking'
          },
          header: {
            title: 'Schedule Home Healthcare Appointment',
            subtitle:
              'Professional nurse matching process, digitized vital signs monitoring, and personalized recovery path for your loved one.'
          },
          stepper: {
            step1Label: 'Step 1',
            step1Title: 'Patient',
            step2Label: 'Step 2',
            step2Title: 'Service Plan',
            step3Label: 'Step 3',
            step3Title: 'Caregiver',
            step4Label: 'Step 4',
            step4Title: 'Schedule & Time',
            step5Label: 'Step 5: Confirmation',
            step5Title: 'Summary & Book'
          },
          patientSection: {
            title: 'Care Recipient',
            subtitle: 'Medical records secured per HIPAA & Ministry of Health standards',
            switchPatientBtn: 'Change relative',
            ageText: '{{age}} years old',
            genderMale: 'Male',
            genderFemale: 'Female',
            bloodType: 'Blood Type {{type}}',
            underlyingLabel: 'Underlying conditions:',
            underlyingDesc: 'Grade 2 hypertension, Type 2 diabetes, mild post-stroke sequelae in 2022.',
            address: 'Apt 18.04 Landmark 2, Vinhomes Central Park, Ward 22, Binh Thanh, HCMC',
            patientFatherOption: 'Mr. Nguyen Van An (Father)',
            patientMotherOption: 'Mrs. Le Thi Mai - 74 years old (Mother)',
            addNewPatientLink: 'Add new patient profile'
          },
          servicesSection: {
            title: 'Medical Care Service Plan',
            subtitle: 'Select specialized care matching clinical status',
            activeBadge: 'Clinical protocol activated',
            plans: {
              stroke: {
                title: 'Post-Stroke Recovery & Chronic Care',
                desc: 'Focuses on motor recovery, muscle stimulation, pressure ulcer prevention, and standard blood pressure control.',
                f1: 'Measure vital signs (BP, SpO2, Blood glucose) 2x/shift',
                f2: 'Bedside physical therapy & rehabilitation 45 mins',
                f3: 'Administer prescribed meds & diabetic meal plan'
              },
              surgery: {
                title: 'Post-Surgical Care & Wound Management',
                desc: 'Sterile dressing changes, suture removal per orders, drain removal and infection surveillance.',
                f1: 'Hospital-grade sterile aseptic technique',
                f2: 'Nasogastric / Foley catheter management'
              },
              dementia: {
                title: 'Dementia & Alzheimer Care for Seniors',
                desc: 'Psychological dialogue therapy, memory stimulation, anti-wandering companionship, and comprehensive personal hygiene support.'
              },
              palliative: {
                title: 'Palliative Care & Bedridden Chronic Care',
                desc: 'Home oxygen support, suctioning, turning/repositioning for stage 3-4 ulcer prevention, and intensive pain control.'
              }
            }
          },
          caregiverSection: {
            title: 'Assigned Caregiver',
            subtitle: 'Vetted by professional licensing and specialized protocols',
            changeCaregiverBtn: 'Choose another nurse',
            onlineStatus: 'Ready for shifts',
            nurseName: 'Nurse Nguyen Thi Bich Loan',
            verifiedBadge: 'Verified',
            nurseBio: 'B.S. in Nursing, University of Medicine and Pharmacy HCMC • 6 years ICU & rehab experience',
            reviewsCount: '4.95 (186 5★ reviews)',
            distance: '2.4 km from home',
            priceLabel: 'Committed unit rate',
            priceRate: '1,450,000 đ',
            perShiftSuffix: '/ 8h shift',
            includedSupplies: 'Travel expenses & primary medical supplies included',
            smartMatchTitle: 'CareConnect SmartMatch (Auto-dispatch)',
            smartMatchDesc:
              'AI system automatically matches the nearest 5-star nurse if Nurse Loan has an unexpected emergency.'
          },
          scheduleSection: {
            title: 'Schedule & Shift Timing',
            subtitle: 'Select shift frequency and special instructions for the caregiver',
            weeklyTab: 'Weekly (Save 10%)',
            singleTab: 'Single shift',
            startDateLabel: 'Start date',
            firstShiftNotice: 'First shift: Monday, 21/10/2024',
            shiftHourLabel: 'Shift hours',
            shiftHourHint: 'Includes standard 60-minute lunch break',
            shifts: {
              day8h: 'Day shift 8 hours (08:00 - 17:00)',
              morning4h: 'Morning shift 4 hours (08:00 - 12:00)',
              afternoon4h: 'Afternoon shift 4 hours (13:30 - 17:30)',
              night12h: 'Night shift 12 hours (19:30 - 07:30)',
              full24h: 'In-home full time 24/24'
            },
            frequencyLabel: 'Days per week',
            frequencyHint: 'Eligible for Peace of Mind Weekly package',
            frequencies: {
              days5: '5 days (Monday to Friday)',
              days7: '7 days (Full week including Sat, Sun)',
              days3: '3 days (Monday, Wednesday, Friday)',
              custom: 'Custom schedule'
            },
            weeklyDaysLabel: 'Selected days this week:',
            notesLabel: 'Special instructions for the Caregiver:',
            notesLimit: 'Max 500 characters',
            notesPlaceholder: 'Enter special instructions for caregiver...',
            notesDefault:
              'My father has left-sided hemiparesis after a mild stroke. Please assist him with physical therapy for his arm and ankle for 30-45 minutes in the afternoon. He often forgets to take medication, so please check his blood pressure before administering Amlodipine 5mg after breakfast at 09:00.'
          },
          summary: {
            tag: 'Booking Summary',
            title: 'Shift Cost Confirmation',
            patientLabel: 'Patient',
            patientValue: 'Mr. Nguyen Van An (78 yrs)',
            caregiverLabel: 'Assigned Caregiver',
            caregiverValue: 'Nurse Nguyen Thi Bich Loan',
            timeLabel: 'Scheduled Time',
            timeValue: '5 shifts (21/10 - 25/10/2024 • 08:00 - 17:00)',
            rateLabel: 'Unit rate per 8h shift',
            rateValue: '1,450,000 đ / shift',
            shiftsCountLabel: 'Shifts subtotal (5 days)',
            shiftsCountValue: '7,250,000 đ',
            discountLabel: 'Weekly package discount (-10%)',
            discountValue: '- 725,000 đ',
            voucherLabel: 'Voucher FirstCare',
            voucherValue: '- 200,000 đ',
            insuranceLabel: 'Risk insurance & basic supplies',
            freeValue: 'Free (0 đ)',
            promoPlaceholder: 'PROMO CODE',
            applyBtn: 'Apply',
            totalEstimatedLabel: 'Estimated Total Payment',
            totalNote: 'Includes VAT & all-inclusive guarantee',
            currency: 'đ',
            totalAmount: '6,325,000',
            paymentMethodTitle: 'Payment Method:',
            recommendedBadge: 'Recommended',
            flexibleBadge: 'Flexible',
            paymentMethods: {
              napas: '24/7 Napas Bank Transfer QR',
              card: 'International Card (Visa / Master / JCB)',
              wallet: 'E-Wallet MoMo / ZaloPay',
              deposit30: '30% Deposit (Pay remainder after each shift)'
            },
            submitBtn: 'Confirm & Book Care Appointment',
            successTitle: 'Appointment Booked Successfully!',
            successDesc:
              'Your care appointment for {{patient}} with {{nurse}} has been confirmed. You can track this shift under My Bookings.',
            viewMyBookings: 'View My Bookings',
            backToCaregivers: 'Back to Find Caregivers',
            trustGuarantees: {
              g1: '100% refund if caregiver does not adhere to clinical protocol',
              g2: 'Free caregiver replacement at any time if unsatisfied',
              g3: 'Clinical data encrypted end-to-end with AES-256'
            }
          }
        },
        bookingDeposit: {
          documentTitle: 'Booking Confirmation & Deposit Payment | CareConnect',
          breadcrumb: {
            home: 'Home',
            myBookings: 'My Bookings',
            current: 'Confirm Appointment & Pay Deposit (#CC-BK-9284)'
          },
          banner: {
            title: 'Appointment is temporarily reserved',
            exclusiveBadge: 'Exclusive Shift',
            desc: 'Please complete the 30% deposit payment so the caregiver can accept the shift and lock in travel arrangements.',
            reservedTimeLabel: 'Reservation time left',
            expired: 'Expired'
          },
          overview: {
            title: 'Medical Appointment Details',
            pendingDepositBadge: 'Awaiting Deposit',
            fileCodePrefix: 'File Code: ',
            fileCodeValue: '#CC-BK-9284',
            createdTime: ' • Created at 09:15, 24/10/2024',
            insuranceBadge: 'Standard Medical Insurance',
            caregiver: {
              avatarAlt: 'Portrait of friendly Vietnamese nurse Nguyen Thi Bich Loan in jade scrubs',
              name: 'Nurse Nguyen Thi Bich Loan',
              verifiedBadge: 'Medical License & VNeID',
              bio: 'Bachelor of Nursing • University of Medicine and Pharmacy HCMC (7 years clinical experience)',
              ratingValue: '4.9',
              reviewsCount: '(124 reviews)',
              chatAfterDeposit: 'Private chat available after deposit'
            },
            patient: {
              title: 'Care Recipient Information',
              name: 'Mr. Nguyen Van An (78 yrs • Biological Father)',
              conditionLabel: 'Condition:',
              conditionDesc: 'Hypertension, Type 2 Diabetes, motor rehabilitation after mild left hemiparesis stroke.'
            },
            location: {
              title: 'Care Delivery Address',
              building: 'Apartment 18.04 • Landmark 2 Tower',
              address: 'Vinhomes Central Park, 208 Nguyen Huu Canh, Ward 22, Binh Thanh Dist., Ho Chi Minh City'
            },
            schedule: {
              title: 'Care Regimen & Shift Schedule',
              shiftsCountBadge: '5 consecutive shifts • 40 hours',
              datesLabel: 'Execution Dates',
              datesValue: '28/10 - 01/11/2024',
              shiftHoursLabel: 'Shift Hours',
              shiftHoursValue: '08:00 - 16:00 (Day shift)',
              reportFrequencyLabel: 'Clinical Report',
              reportFrequencyValue: 'Updated every 4 hours',
              protocolsTitle: 'Package Care Scope Items:',
              protocols: {
                vitals: 'Continuous vitals monitoring: Blood Pressure, SpO2, Blood Glucose',
                physio: 'Motor rehabilitation & physical therapy for limbs 45 mins/shift',
                meds: 'Medication reminders and dosage log documentation',
                nutrition: 'Clinical nutrition care & gentle mobility to prevent pressure ulcers'
              }
            }
          },
          policies: {
            title: 'Commitment Policy & Rights Protection',
            items: {
              refundTitle: 'Flexible 100% Deposit Refund',
              refundDesc:
                'Free cancellation and 100% deposit refund if cancelled at least 12 hours before the first shift start time.',
              insuranceTitle: 'Medical Liability Insurance',
              insuranceDesc:
                'All shifts are covered by a medical liability insurance policy worth 2,000,000,000 VND from partner Bao Viet.',
              escrowTitle: 'Safe Deposit Escrow',
              escrowDesc: 'Deposit is safely held in CareConnect escrow account until the caregiver checks in on time.',
              supportTitle: '24/7 Care Coordinator Support',
              supportDesc:
                'Clinical hotline and consultant doctors ready to dispatch immediate replacement if caregiver has emergency.'
            }
          },
          payment: {
            stepLabel: 'Final Step',
            title: 'Pay Deposit',
            subtitle: 'Reserve shift schedule and activate caregiver preparation record',
            shiftsCostLabel: 'Shift costs (5 shifts × 8h)',
            shiftsCostValue: '$95 (2,375,000 đ)',
            suppliesCostLabel: 'Basic medical supplies & shift insurance',
            suppliesCostValue: '$15 (375,000 đ)',
            promoLabel: 'New Customer Promo Code',
            promoValue: '-$10 (-250,000 đ)',
            totalPackageLabel: 'Total All-inclusive Package:',
            totalUsd: '$100',
            totalVnd: '2,500,000 đ',
            depositTitle: 'Required Deposit (30%)',
            depositRemaining: 'Remaining after shifts: $70 (1,750,000 đ)',
            depositUsd: '$30',
            depositVnd: '750,000 đ',
            methodTitle: 'Select deposit payment method',
            methods: {
              vietqr: {
                label: 'Scan VietQR 24/7',
                freeBadge: 'Zero fee',
                desc: 'Instant bank transfer across all banks',
                bankAccountLabel: 'Account: ',
                bankAccountValue: '0381000599999 (Vietcombank)',
                transferNoteLabel: 'Transfer note: ',
                transferNoteValue: 'CC 9284 COC'
              },
              card: {
                label: 'International Card (Visa / Master / JCB)',
                desc: 'PCI-DSS 3D-Secure certified security'
              },
              wallet: {
                label: 'MoMo / ZaloPay E-Wallet',
                desc: 'Instant verification via app'
              }
            },
            payButton: 'Pay Deposit $30 (750,000 đ)',
            processing: 'Processing transaction...',
            successText: 'Deposit Successful!',
            agreementPrefix: 'By paying you agree to CareConnect ',
            termsLink: 'Terms of Service',
            andText: ' and ',
            refundLink: 'Cancellation & Refund Policy',
            agreementSuffix: '.',
            sslNotice: '256-bit SSL banking-standard encrypted checkout',
            caregiverNotice:
              'Nurse Bich Loan has received the schedule reservation notice and is preparing medical equipment upon successful deposit.',
            modalTitle: 'Deposit Confirmed Successfully!',
            modalDesc:
              'Confirmation successful! Nurse Nguyen Thi Bich Loan has officially accepted the shift. CareConnect sent confirmation code & details via SMS / Email.',
            viewBookingsBtn: 'View My Bookings',
            closeModalBtn: 'Close'
          }
        },
        footer: {
          tagline: '© 2024 CareConnect. Trusted and dedicated caregiver platform.',
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          support: 'Support Center'
        }
      }
    }
  },
  vi: {
    translation: {
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
      },
      customer: {
        careReport: careReportVi,
        bookingReview: bookingReviewVi,
        bookingDetail: {
          documentTitle: 'Chi tiết lịch {{code}} | CareConnect',
          breadcrumb: 'Chi tiết ca trực',
          title: 'Chi tiết ca chăm sóc',
          sampleNotice:
            'Trang đang hiển thị dữ liệu lịch đặt mẫu. Cập nhật lâm sàng và thao tác trực tiếp chưa được kết nối.',
          notFound: {
            title: 'Không tìm thấy lịch đặt',
            description: 'Mã lịch đặt này không có trong dữ liệu mẫu hiện tại.',
            back: 'Quay lại lịch đặt của tôi'
          },
          status: {
            ongoing: 'Đang chăm sóc',
            upcoming: 'Sắp diễn ra',
            completed: 'Đã hoàn thành',
            cancelled: 'Đã hủy'
          },
          timeline: {
            title: 'Tiến trình ca trực',
            schedule: 'Thời gian ca trực',
            progress: 'Tiến độ ca',
            current: 'Giai đoạn hiện tại',
            steps: {
              confirmed: 'Đã xác nhận đặt lịch',
              assigned: 'Đã phân công',
              checkIn: 'Check-in tại nhà',
              care: 'Đang chăm sóc',
              complete: 'Nghiệm thu ca'
            },
            note: {
              ongoing: 'Điều dưỡng đang thực hiện kế hoạch chăm sóc đã đặt.',
              upcoming: 'Ca trực đã được xác nhận và đang chờ đến giờ bắt đầu.',
              completed: 'Ca chăm sóc đã kết thúc.',
              cancelled: 'Lịch đặt đã bị hủy. Hiện không có ca chăm sóc nào đang diễn ra.'
            }
          },
          vitals: {
            title: 'Chỉ số sinh hiệu mẫu',
            measured: 'Số đo minh họa theo giao diện được cung cấp',
            stable: 'Ổn định',
            bloodPressure: 'Huyết áp',
            oxygen: 'Oxy máu',
            pulse: 'Nhịp tim',
            temperature: 'Thân nhiệt',
            glucose: 'Đường huyết',
            next: 'Lần đo kế tiếp theo lịch',
            normal: 'Bình thường',
            good: 'Tốt',
            regular: 'Đều',
            beforeMeal: 'Trước ăn'
          },
          feed: {
            title: 'Nhật ký chăm sóc mẫu',
            subtitle: 'Các mục minh họa theo giao diện được cung cấp',
            entries: {
              start: { title: 'Bắt đầu ca trực', description: 'Check-in và kiểm tra sức khỏe ban đầu.' },
              medicine: { title: 'Dùng thuốc sáng', description: 'Hỗ trợ dùng thuốc theo kế hoạch chăm sóc.' },
              nursing: { title: 'Chăm sóc điều dưỡng', description: 'Vệ sinh cá nhân và kiểm tra băng gạc.' },
              therapy: { title: 'Tập phục hồi vận động', description: 'Hỗ trợ các bài tập phục hồi chức năng.' },
              lunch: { title: 'Chuẩn bị bữa trưa', description: 'Đang chuẩn bị bữa ăn phù hợp.' }
            }
          },
          service: {
            title: 'Thông tin gói dịch vụ y tế',
            description: 'Kế hoạch chăm sóc gắn với lịch đặt này.',
            included: 'Nội dung chăm sóc dự kiến',
            items: {
              monitoring: 'Theo dõi sinh hiệu trong ca trực',
              movement: 'Hỗ trợ tập vận động và phục hồi chức năng',
              hygiene: 'Hỗ trợ vệ sinh cá nhân an toàn',
              medication: 'Hỗ trợ dùng thuốc theo hướng dẫn',
              report: 'Tổng hợp báo cáo chăm sóc sau ca'
            }
          },
          people: {
            title: 'Địa chỉ & người nhận chăm sóc',
            address: 'Địa điểm chăm sóc',
            patient: 'Người nhận chăm sóc',
            caregiver: 'Điều dưỡng phụ trách',
            caregiverNote: 'Thông tin điều dưỡng đang ở chế độ xem mẫu.'
          },
          payment: {
            title: 'Chi phí & thanh toán',
            total: 'Tổng chi phí ca trực',
            paid: 'Tiền cọc đã thanh toán',
            remaining: 'Còn lại cần quyết toán',
            refunded: 'Tiền cọc đã hoàn',
            status: 'Tình trạng thanh toán'
          },
          policy: {
            title: 'Chính sách hủy ca & hỗ trợ',
            before: 'Điều kiện hủy và hoàn cọc áp dụng theo chính sách của lịch đặt đã xác nhận.',
            during: 'Nếu có vấn đề chăm sóc khẩn cấp, hãy liên hệ CareConnect qua kênh hỗ trợ chính thức.',
            unavailable: 'Gọi điện, nhắn tin và dừng ca khẩn cấp sẽ khả dụng sau khi kết nối backend.',
            call: 'Gọi điện cho điều dưỡng',
            message: 'Nhắn tin cho điều dưỡng',
            stop: 'Yêu cầu dừng ca khẩn cấp'
          }
        },
        myBookings: {
          documentTitle: 'Lịch đặt của tôi | CareConnect',
          breadcrumb: 'Lịch đặt của tôi',
          title: 'Quản lý lịch chăm sóc',
          subtitle: 'Theo dõi trạng thái xác nhận, cập nhật ca trực và lịch chăm sóc cho người thân.',
          newBooking: 'Đặt lịch chăm sóc mới',
          sampleNotice: 'Dữ liệu lịch đặt mẫu trong khi hệ thống đang kết nối lịch sử đặt lịch.',
          stats: {
            ongoing: 'Đang diễn ra',
            upcoming: 'Sắp diễn ra',
            completed: 'Đã hoàn thành',
            cancelled: 'Đã hủy / Hoàn cọc'
          },
          tabs: {
            all: 'Tất cả lịch đặt',
            ongoing: 'Đang diễn ra',
            upcoming: 'Sắp diễn ra',
            completed: 'Đã hoàn thành',
            cancelled: 'Đã hủy'
          },
          filters: {
            month: 'Tháng',
            allMonths: 'Tất cả thời gian',
            patient: 'Người thân',
            allPatients: 'Tất cả người thân',
            search: 'Tìm theo mã lịch, người thân hoặc điều dưỡng',
            reset: 'Đặt lại bộ lọc'
          },
          patients: {
            father: 'Nguyễn Văn An (Bố ruột)',
            mother: 'Nguyễn Thị A (Mẹ ruột)'
          },
          items: {
            ongoing: {
              status: 'Đang trong ca trực',
              patient: 'Cụ Nguyễn Văn An',
              relation: '78 tuổi · Bố ruột (cao huyết áp)',
              caregiverRole: 'Chuyên khoa Hồi sức cấp cứu',
              service: 'Chăm sóc người cao tuổi chuyên sâu',
              location: 'Phòng 18.04, Tòa Landmark 2, Vinhomes Central Park, Bình Thạnh',
              note: 'Check-in 07:55 · Đã thực hiện 4h 15m / 9h',
              payment: 'Đã thanh toán cọc 50% · Còn lại 800.000 ₫'
            },
            upcoming: {
              status: 'Đã xác nhận & đã cọc',
              patient: 'Nguyễn Thị A',
              relation: '76 tuổi · Mẹ ruột (hậu phẫu chỉnh hình)',
              caregiverRole: 'Cử nhân Điều dưỡng · Đánh giá 4,9',
              service: 'Chăm sóc phục hồi & hỗ trợ vận động',
              location: 'Biệt thự 42, Đường số 12, Thảo Điền, TP. Thủ Đức',
              note: 'Đã khóa lịch · Điều dưỡng đã nhận ca',
              payment: 'Đã cọc 750.000 ₫ · Còn lại 700.000 ₫'
            },
            completed: {
              status: 'Hoàn tất 100%',
              patient: 'Nguyễn Thị A',
              relation: '76 tuổi · Mẹ ruột',
              caregiverRole: '10 năm kinh nghiệm điều dưỡng lão khoa',
              service: 'Chăm sóc y tế định kỳ & theo dõi đường huyết',
              location: 'Thảo Điền, TP. Thủ Đức',
              note: 'Đánh giá của bạn: 5/5 · Chăm sóc chu đáo, báo cáo đúng giờ',
              payment: 'Đã thanh toán đủ qua Visa · Hóa đơn #VAT-9750'
            },
            cancelled: {
              status: 'Đã hủy & hoàn cọc 100%',
              patient: 'Cụ Nguyễn Văn An',
              relation: '78 tuổi · Bố ruột',
              caregiverRole: 'Khoa Tim mạch can thiệp',
              service: 'Chăm sóc điều dưỡng tại nhà',
              location: 'Bình Thạnh, TP. Hồ Chí Minh',
              note: 'Hủy trước 24 giờ · Miễn phí hủy ca',
              payment: 'Đã hoàn cọc 100% · 450.000 ₫'
            }
          },
          labels: {
            patient: 'Người nhận chăm sóc',
            caregiver: 'Điều dưỡng phụ trách',
            service: 'Gói dịch vụ',
            total: 'Tổng chi phí',
            schedule: 'Lịch chăm sóc',
            location: 'Địa điểm chăm sóc',
            payment: 'Tình trạng thanh toán'
          },
          actions: {
            details: 'Xem chi tiết',
            close: 'Đóng chi tiết',
            bookAgain: 'Đặt lại ca này',
            findCaregiver: 'Tìm điều dưỡng khác'
          },
          empty: {
            title: 'Không tìm thấy ca trực phù hợp',
            description: 'Thử từ khóa khác hoặc thay đổi bộ lọc để xem lại lịch sử chăm sóc.'
          }
        },
        nav: {
          home: 'Trang chủ',
          findCaregivers: 'Tìm người chăm sóc',
          myBookings: 'Lịch đặt của tôi',
          menu: 'Menu khách hàng',
          familyProfiles: 'Hồ sơ người thân',
          messages: 'Tin nhắn',
          notifications: 'Thông báo',
          customerRole: 'Khách hàng',
          userName: 'Nguyễn Mai Anh',
          myProfile: 'Hồ sơ của tôi'
        },
        profile: {
          documentTitle: 'Hồ sơ cá nhân | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            myAccount: 'Tài khoản của tôi',
            personalInfo: 'Thông tin cá nhân'
          },
          badge: {
            verifiedAccount: 'Tài khoản đã xác minh',
            online: 'Đang trực tuyến',
            verified: 'Đã xác minh',
            securityLevel2: 'Bảo mật cấp 2'
          },
          header: {
            title: 'Hồ sơ cá nhân',
            subtitle:
              'Quản lý thông tin cá nhân, cập nhật địa chỉ hỗ trợ điều phối viên và bảo mật tài khoản gia đình CareConnect.'
          },
          overview: {
            avatarAlt: 'Ảnh đại diện Nguyễn Mai Anh',
            changeAvatar: 'Đổi ảnh đại diện',
            verifiedIdentity: 'Tài khoản chính chủ đã xác thực',
            memberId: 'CC-KH8842',
            memberSince: 'Thành viên từ T3/2024',
            stats: {
              carePatients: 'Người thân chăm sóc',
              completedShifts: 'Ca hoàn thành',
              sentReviews: 'Đánh giá gửi đi'
            }
          },
          nav: {
            title: 'Quản trị tài khoản',
            personalInfo: 'Thông tin cá nhân & Chỉnh sửa',
            security: 'Đổi mật khẩu & Bảo mật',
            familyProfiles: 'Hồ sơ người thân cần chăm sóc',
            bookingHistory: 'Lịch sử đặt lịch',
            notifications: 'Thông báo & Tùy chọn'
          },
          support: {
            title: 'Hỗ trợ khẩn cấp 24/7',
            hotlineLabel: 'Hotline ưu tiên:'
          },
          form: {
            title: 'Thông tin chi tiết',
            subtitle: 'Cập nhật thông tin nhận diện định danh y tế và địa điểm thực hiện dịch vụ.',
            cancel: 'Hủy',
            saveChanges: 'Lưu thay đổi',
            saving: 'Đang lưu...',
            saveSuccess: 'Thay đổi hồ sơ vừa được lưu thành công!',
            autoSaved: 'Đã lưu tự động cách đây 2 phút',
            fullName: 'Họ và tên',
            matchCccd: 'Trùng CCCD',
            gender: 'Giới tính',
            genderFemale: 'Nữ',
            genderMale: 'Nam',
            genderOther: 'Khác',
            dob: 'Ngày sinh',
            idNumber: 'Số CMND / CCCD',
            phone: 'Số điện thoại di động',
            email: 'Email nhận hóa đơn & báo cáo',
            change: 'Thay đổi',
            addressSectionTitle: 'Địa chỉ lưu trú tiếp nhận chăm sóc',
            city: 'Tỉnh / Thành phố',
            district: 'Quận / Huyện',
            ward: 'Phường / Xã',
            addressDetail: 'Địa chỉ cụ thể (Số nhà, tòa nhà, tên đường)',
            notes: 'Ghi chú chỉ đường / Liên hệ khẩn cấp',
            notesHint: 'Dành riêng cho điều dưỡng & điều phối'
          },
          security: {
            title: 'Đổi mật khẩu tài khoản',
            subtitle:
              'Để bảo mật tài khoản gia đình, vui lòng đặt mật khẩu mạnh tối thiểu 8 ký tự bao gồm chữ cái, số và ký tự đặc biệt.',
            currentPassword: 'Mật khẩu hiện tại',
            newPassword: 'Mật khẩu mới',
            newPasswordPlaceholder: 'Nhập mật khẩu mới',
            confirmPassword: 'Xác nhận mật khẩu mới',
            confirmPasswordPlaceholder: 'Nhập lại mật khẩu mới',
            securityLevel: 'Độ bảo mật:',
            strengthStrong: 'Mạnh (Rất an toàn)',
            standardsTitle: 'Tiêu chuẩn mật khẩu CareConnect:',
            ruleMinLength: 'Tối thiểu 8 ký tự',
            ruleCaseAndNumber: 'Chứa chữ hoa & số',
            ruleSpecialChar: 'Chứa ký tự đặc biệt (!@#$%)',
            updatePassword: 'Cập nhật mật khẩu',
            updating: 'Cập nhật...',
            updated: 'Đã đổi mật khẩu',
            twoFactorTitle: 'Xác thực 2 yếu tố (2FA qua SMS)',
            twoFactorDesc: 'Nhận mã OTP khi đăng nhập từ thiết bị lạ để bảo vệ hồ sơ người thân.'
          },
          familyInsight: {
            title: 'Người thân đã thiết lập hồ sơ sức khỏe',
            description: 'Bà Trần Thị Lan (Mẹ ruột - 78 tuổi), Ông Nguyễn Văn Nam (Bố ruột - 82 tuổi)',
            viewDetails: 'Xem chi tiết hồ sơ'
          }
        },
        patientProfiles: {
          documentTitle: 'Hồ sơ người thân | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            myAccount: 'Tài khoản của tôi',
            title: 'Hồ sơ người thân cần chăm sóc'
          },
          header: {
            title: 'Hồ sơ người cần chăm sóc',
            subtitle:
              'Quản lý thông tin y tế, bệnh nền, chế độ dinh dưỡng và lịch sử điều trị của người thân để nhân viên chăm sóc tiếp cận chu đáo nhất.',
            addPatient: '+ Thêm hồ sơ người thân'
          },
          toolbar: {
            searchPlaceholder: 'Tìm theo họ tên, CCCD hoặc mã BHYT...',
            filterRelationship: {
              all: 'Mối quan hệ: Tất cả',
              parents: 'Bố mẹ',
              grandparents: 'Ông bà',
              children: 'Con cái'
            },
            filterStatus: {
              all: 'Tình trạng: Tất cả',
              special: 'Cần chăm sóc đặc biệt',
              monitoring: 'Theo dõi định kỳ',
              rehab: 'Phục hồi chức năng'
            },
            activeCount: '{{count}} hồ sơ kích hoạt'
          },
          card: {
            yearsOld: '{{age}} tuổi',
            genderLabel: 'Giới tính:',
            genderMale: 'Nam',
            genderFemale: 'Nữ',
            statusInCare: 'Đang có ca chăm sóc',
            statusStable: 'Sức khỏe ổn định',
            statusPostOp: 'Theo dõi phục hồi hậu phẫu',
            diagnoses: 'Bệnh nền & Di chứng',
            primaryDiagnosis: 'Bệnh nền chính',
            currentStatus: 'Tình trạng hiện tại',
            specialInstructions: 'Lưu ý đặc biệt',
            rehabInstructions: 'Lưu ý phục hồi & Dược liệu',
            dietInstructions: 'Chế độ dinh dưỡng & Cảnh báo',
            attendingDoctor: 'Bác sĩ phụ trách',
            viewDetails: 'Xem chi tiết',
            edit: 'Chỉnh sửa',
            delete: 'Xóa',
            bookCareNow: 'Đặt lịch chăm sóc ngay',
            bookCare: 'Đặt lịch chăm sóc',
            readyTooltip: 'Sẵn sàng tiếp nhận chăm sóc',
            activeTooltip: 'Hồ sơ hoạt động'
          },
          guidelines: {
            title: 'Quy chuẩn cập nhật hồ sơ y tế an toàn CareConnect',
            description:
              'Hồ sơ y tế được cập nhật đầy đủ (bao gồm toa thuốc hiện dùng, tiền sử dị ứng thuốc và số liên lạc bác sĩ điều trị) giúp Điều dưỡng viên và Chuyên viên chăm sóc xây dựng phác đồ can thiệp chuẩn xác nhất ngay từ buổi đầu tiên.',
            badgeHipaa: 'Mã hóa dữ liệu HIPAA',
            badgePrivacy: 'Bảo mật quyền riêng tư y khoa',
            badgeSync: 'Đồng bộ trực tiếp với sổ tay Điều dưỡng',
            viewDoc: 'Xem tài liệu hướng dẫn'
          },
          sidebar: {
            accountCode: 'Mã tài khoản:',
            verifiedIdentity: 'Đã xác thực danh tính',
            familyMetric: 'Người thân',
            shiftsMetric: 'Ca xong',
            reviewsMetric: 'Đánh giá',
            emergencyTitle: 'Hotline Y Tế Khẩn Cấp',
            emergencySubtitle: 'Hỗ trợ 24/7 miễn cước',
            emergencyDesc: 'Liên hệ khẩn cấp với điều dưỡng viên trưởng khi người thân có biến chuyển sức khỏe bất ngờ.'
          }
        },
        patientDetail: {
          documentTitle: 'Chi tiết hồ sơ bệnh án | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            myAccount: 'Tài khoản của tôi',
            patientProfiles: 'Hồ sơ người thân cần chăm sóc',
            title: 'Chi tiết hồ sơ bệnh án'
          },
          banner: {
            back: 'Quay lại danh sách hồ sơ',
            activeCareSession: 'Đang có ca chăm sóc hoạt động',
            titlePrefix: 'Hồ sơ y tế: ',
            viewMode: 'Chế độ xem',
            editMode: 'Chế độ chỉnh sửa',
            saveUpdate: 'Lưu cập nhật',
            bookNewCare: 'Đặt lịch chăm sóc mới',
            toastSuccess: 'Đã lưu và đồng bộ thông tin hồ sơ người bệnh thành công!'
          },
          snapshot: {
            bloodType: 'Nhóm máu',
            height: 'Chiều cao',
            weight: 'Cân nặng',
            nationalIdLabel: 'Số định danh / CCCD:',
            insuranceIdLabel: 'Mã thẻ BHYT:',
            dobLabel: 'Ngày sinh:',
            verifiedNotice: 'Hồ sơ y bạ điện tử đã được xác thực qua cơ sở dữ liệu VNeID và Bệnh viện ĐHYD TP.HCM.',
            changeAvatar: 'Cập nhật ảnh đại diện',
            verifiedRecord: 'Hồ sơ được xác thực danh tính'
          },
          caregiverWidget: {
            title: 'Điều dưỡng phụ trách hiện tại',
            shiftBadge: 'Ca trưa nay',
            ratingCount: '{{rating}} ({{count}} ca)',
            shiftTimeLabel: 'Thời gian ca:',
            shiftTimeValue: '08:00 - 17:00 (Hàng ngày)',
            chatButton: 'Nhắn tin với điều dưỡng'
          },
          emergencySection: {
            title: 'Liên hệ khẩn cấp',
            priorityBadge: 'Ưu tiên 24/7',
            callButton: 'Gọi điện',
            primaryContact: {
              name: 'Nguyễn Mai Anh (Bạn - Con gái)',
              role: 'Người giám hộ chính • Q.Bình Thạnh'
            },
            secondaryContact: {
              name: 'Nguyễn Văn Hùng (Con trai thứ)',
              role: 'Người liên hệ thứ 2 • 0988 123 456'
            },
            hotlineTitle: 'Tổng đài Y tế Khẩn cấp',
            hotlineDesc: 'Điều phối cấp cứu 115 & Đội phản ứng nhanh'
          },
          medicalBackground: {
            title: 'Tình trạng bệnh nền & Tiền sử y khoa',
            lastUpdated: 'Cập nhật lần cuối: 3 ngày trước',
            chronicLabel: 'Bệnh lý nền đang điều trị',
            allergyLabel: 'Tiền sử dị ứng thuốc & Thực phẩm',
            surgeryLabel: 'Tiền sử phẫu thuật & Can thiệp',
            attendingDoctorLabel: 'Bác sĩ chuyên khoa phụ trách theo dõi',
            callDoctor: 'SĐT: {{phone}}'
          },
          prescriptions: {
            title: 'Đơn thuốc hiện tại & Lịch uống định kỳ',
            regimenBadge: 'Đang áp dụng theo phác đồ tháng 10/2024',
            thMedication: 'Tên biệt dược / Hoạt chất',
            thDosage: 'Liều lượng',
            thTime: 'Thời điểm uống',
            thInstructions: 'Chỉ dẫn của điều dưỡng',
            addMedication: '+ Thêm loại thuốc vào đơn'
          },
          carePlan: {
            title: 'Kế hoạch chăm sóc & Chỉ số sinh hiệu bắt buộc',
            standardBadge: 'Quy chuẩn BV • Chu kỳ ngày',
            mobilityTitle: 'Vận động & Phục hồi',
            mobilityDesc:
              'Cần hỗ trợ dìu khi đứng dậy đi vệ sinh. Tập phục hồi vận động bàn tay trái 30 phút mỗi chiều với bóng cao su gai y tế.',
            nutritionTitle: 'Dinh dưỡng tiết chế',
            nutritionDesc:
              'Ăn nhạt (dưới 3g muối/ngày), chia 3 bữa chính + 1 bữa phụ hạt dinh dưỡng lúc 15h. Đảm bảo uống đủ 1.5 - 1.8L nước/ngày.',
            vitalsTitle: 'Đo sinh hiệu 2 lần/ngày',
            vitalsDesc:
              'Đo huyết áp & SpO2 vào 07:00 sáng và 17:00 chiều. Ngưỡng cảnh báo: HA tâm thu > 145 mmHg hoặc < 100 mmHg.',
            addressLabel: 'Địa chỉ lưu trú chăm sóc tại nhà:'
          },
          historyAndDocs: {
            tabHistory: 'Lịch sử các ca chăm sóc gần nhất',
            tabDocs: 'Tài liệu & Kết quả xét nghiệm đính kèm (4)',
            viewSessionReport: 'Xem báo cáo ca',
            previewDoc: 'Xem trước tài liệu',
            uploadTitle: 'Bấm để tải thêm sổ khám bệnh hoặc phiếu chỉ định mới',
            uploadSubtitle: 'Hỗ trợ định dạng PDF, JPG, PNG dung lượng tối đa 15MB'
          }
        },
        patientCreate: {
          documentTitle: 'Thêm hồ sơ người bệnh mới | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            myAccount: 'Tài khoản của tôi',
            patientProfiles: 'Hồ sơ người thân cần chăm sóc',
            current: 'Thêm hồ sơ người bệnh mới',
            backToList: 'Quay lại danh sách hồ sơ'
          },
          header: {
            badge: 'Hồ sơ y tế điện tử CareConnect (EMR)',
            title: 'Tạo mới Hồ sơ Người bệnh cần chăm sóc',
            subtitle:
              'Vui lòng cung cấp đầy đủ và chính xác thông tin y tế, bệnh nền và thói quen sinh hoạt để nhân viên y tế / điều dưỡng xây dựng phác đồ chăm sóc phù hợp và an toàn nhất.',
            cancel: 'Hủy bỏ',
            saveDraft: 'Lưu nháp',
            saveProfile: 'Lưu hồ sơ người bệnh'
          },
          draftNotice: {
            text: 'Bản nháp đã được tự động lưu vào tài khoản của bạn lúc {{time}}.',
            close: 'Đóng thông báo'
          },
          sidebar: {
            avatarCard: {
              title: 'Ảnh chân dung người bệnh',
              subtitle: 'Nhận diện điều dưỡng viên',
              uploadLabel: 'Tải ảnh chụp chân dung',
              uploadHint: 'Hỗ trợ định dạng JPG, PNG dung lượng dưới 5MB.',
              uploadNote:
                'Ảnh chụp rõ mặt, không đeo khẩu trang giúp điều dưỡng viên nhận diện chính xác và thân thiện khi tới chăm sóc.',
              changePhoto: 'Đổi ảnh',
              uploadBtn: 'Tải ảnh lên'
            },
            stepper: {
              title: 'Tiến trình hoàn thiện',
              status: '{{completed}}/{{total}} Hoàn thành',
              step1Title: '1. Định danh & Nhân khẩu học',
              step1Subtitle: 'Tên, tuổi, CCCD, nhóm máu, BMI',
              step2Title: '2. Thể chất & Bệnh nền',
              step2Subtitle: 'Bệnh mạn tính, tiền sử dị ứng',
              step3Title: '3. Đơn thuốc & Lịch uống',
              step3Subtitle: 'Liều dùng và lưu ý quan trọng'
            },
            security: {
              badge: 'Bảo mật chuẩn y tế',
              desc: 'Dữ liệu y tế được mã hóa AES-256 theo chuẩn HIPAA & Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.',
              subdesc: 'Chỉ điều dưỡng viên được phê duyệt trong ca trực mới được cấp quyền truy cập theo dõi.'
            },
            hotline: {
              label: 'Tổng đài điều dưỡng 24/7',
              phone: '1900 6868',
              call: 'Gọi tổng đài'
            },
            tips: {
              title: 'Mẹo nhỏ khi điền hồ sơ',
              desc: 'Hãy chụp lại đơn thuốc gần nhất tại bệnh viện để tải lên ở mục 3. Hệ thống sẽ hỗ trợ số hóa tự động tên thuốc và liều dùng.'
            }
          },
          section1: {
            title: 'Thông tin định danh & Cơ bản',
            subtitle: 'Thông tin nhân khẩu học và các chỉ số sinh trắc ban đầu',
            requiredNote: '* Trường bắt buộc',
            fullNameLabel: 'Họ và tên người bệnh',
            fullNamePlaceholder: 'Ví dụ: NGUYỄN VĂN AN',
            fullNameHint: 'Ghi đúng như trên thẻ Căn cước công dân hoặc Thẻ BHYT',
            relationshipLabel: 'Mối quan hệ với bạn',
            relationshipOptions: {
              father: 'Bố ruột (Cha)',
              mother: 'Mẹ ruột',
              spouse: 'Vợ / Chồng',
              child: 'Con cái',
              grandparent: 'Ông / Bà',
              sibling: 'Anh / Chị / Em',
              other: 'Người thân khác'
            },
            birthDateLabel: 'Ngày sinh',
            genderLabel: 'Giới tính',
            genderOptions: {
              male: 'Nam',
              female: 'Nữ',
              other: 'Khác'
            },
            idNumberLabel: 'Số CCCD / Mã định danh',
            idNumberPlaceholder: 'Nhập 12 số CCCD gắn chip',
            syncVNeID: 'Đồng bộ VNeID',
            bhytNumberLabel: 'Số thẻ Bảo hiểm y tế (BHYT)',
            bhytNumberPlaceholder: 'Nhập mã 15 ký tự thẻ BHYT',
            heightLabel: 'Chiều cao (cm)',
            weightLabel: 'Cân nặng (kg)',
            bmiLabel: 'Chỉ số BMI:',
            bmiStatus: {
              underweight: 'Thiếu cân',
              normal: 'Bình thường',
              overweight: 'Tiền béo phì',
              obese: 'Béo phì'
            },
            bloodTypeLabel: 'Nhóm máu (Hệ ABO & Rh)',
            bloodTypeUnknown: 'Chưa rõ'
          },
          section2: {
            title: 'Tình trạng Bệnh nền & Tiền sử Y khoa',
            subtitle: 'Hồ sơ bệnh án quan trọng giúp cảnh báo sớm nguy cơ sốc hoặc tương tác thuốc',
            chronicLabel: 'Bệnh lý nền đang điều trị',
            multiSelectHint: 'Có thể chọn nhiều mục',
            chronicOptions: {
              hypertension: 'Tăng huyết áp vô căn',
              diabetes: 'Đái tháo đường Type 2 (Tiểu đường)',
              strokeHistory: 'Tiền sử Tai biến / Đột quỵ não',
              heartDisease: 'Bệnh mạch vành / Tim mạch',
              dementia: 'Sa sút trí tuệ / Alzheimer / Parkinson',
              osteoarthritis: 'Thoái hóa khớp gối / Cột sống',
              kidneyDisease: 'Bệnh thận mạn tính',
              copd: 'Bệnh phổi tắc nghẽn mạn tính (COPD)'
            },
            otherChronicPlaceholder: 'Thêm bệnh nền khác (nếu có, cách nhau bằng dấu phẩy)...',
            allergiesTitle: 'Tiền sử dị ứng THUỐC & THỰC PHẨM',
            allergiesBadge: 'Tối quan trọng',
            allergiesDesc:
              'Ghi nhận các phản ứng phản vệ, ngứa, mề đay, co thắt phế quản khi dùng thuốc kháng sinh, giảm đau hoặc thức ăn.',
            allergyInputPlaceholder: 'Nhập tên thuốc hoặc thực phẩm gây dị ứng...',
            addAllergyBtn: '+ Thêm dị ứng',
            removeAllergy: 'Xóa dị ứng',
            surgeryHistoryLabel: 'Tiền sử phẫu thuật & Can thiệp ngoại khoa',
            surgeryHistoryPlaceholder:
              'Ví dụ: Thay khớp gối nhân tạo chân phải (Năm 2021, Bệnh viện Chợ Rẫy); Mổ sỏi túi mật nội soi (Năm 2018)...',
            doctorNameLabel: 'Bác sĩ / Bệnh viện theo dõi định kỳ',
            doctorNamePlaceholder: 'Ví dụ: BS.CK2 Trần Hữu Đức - BV ĐH Y Dược',
            doctorContactLabel: 'Số điện thoại liên hệ Bác sĩ / Khoa (nếu có)',
            doctorContactPlaceholder: '090x xxx xxx'
          },
          section3: {
            title: 'Đơn thuốc đang sử dụng & Lịch uống',
            subtitle: 'Lập danh mục thuốc điều dưỡng viên cần nhắc nhở hoặc hỗ trợ cho uống',
            addMedicineBtn: '+ Thêm thuốc mới',
            medicineNamePlaceholder: 'Tên biệt dược / hoạt chất...',
            dosageLabel: 'Liều lượng',
            dosagePlaceholder: 'Ví dụ: 1 viên / lần...',
            timeLabel: 'Thời điểm uống',
            timePlaceholder: 'Sáng / Trưa / Tối...',
            instructionsLabel: 'Lưu ý điều dưỡng',
            instructionsPlaceholder: 'Sau ăn, cách 2h...',
            deleteMedicine: 'Xóa thuốc',
            uploadZoneTitle: 'Tải lên ảnh chụp Đơn thuốc / Bệnh án bệnh viện',
            uploadZoneDesc:
              'Kéo thả tập tin ảnh hoặc bấm để duyệt từ thiết bị (Hỗ trợ JPG, PNG, PDF tối đa 10MB). Đội ngũ dược sĩ lâm sàng của CareConnect sẽ đối chiếu và rà soát an toàn.',
            chooseFileBtn: 'Chọn tệp từ máy tính'
          },
          bottomBar: {
            securityNotice: 'Dữ liệu được bảo vệ đa tầng theo tiêu chuẩn Y tế Việt Nam',
            cancel: 'Hủy bỏ',
            saveDraft: 'Lưu bản nháp',
            complete: 'Hoàn tất tạo hồ sơ người bệnh'
          },
          modal: {
            title: 'Tạo hồ sơ thành công!',
            desc: 'Hồ sơ người bệnh {{name}} đã được khởi tạo an toàn và sẵn sàng để bạn đặt lịch chăm sóc tại nhà ngay bây giờ.',
            findCaregiver: 'Tìm điều dưỡng cho người bệnh này',
            backToList: 'Quay về danh sách hồ sơ'
          }
        },
        caregivers: {
          documentTitle: 'Tìm kiếm & Đặt lịch Người chăm sóc uy tín | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            current: 'Tìm người chăm sóc'
          },
          banner: {
            verifiedBadge: 'Đội ngũ y tế đã xác thực 100% hồ sơ',
            title: 'Tìm kiếm & Đặt lịch Người chăm sóc uy tín',
            searchPlaceholder:
              'Tìm theo tên điều dưỡng, chuyên môn y tế, bệnh viện đào tạo hoặc khu vực (Quận/Huyện)...',
            clearSearch: 'Xoá tìm kiếm',
            searchBtn: 'Tìm kiếm',
            locations: {
              all: 'Toàn TP. Hồ Chí Minh',
              binhthanh: 'Quận Bình Thạnh',
              q1: 'Quận 1',
              q7: 'Quận 7',
              thuduc: 'TP. Thủ Đức'
            },
            suggestionsLabel: 'Gợi ý phổ biến:',
            tags: {
              postStroke: 'Chăm sóc sau tai biến',
              ivInjection: 'Tiêm truyền tại nhà',
              binhThanh: 'Quận Bình Thạnh',
              eightHours: 'Ca 8 tiếng',
              dementia: 'Chăm người già sa sút trí tuệ'
            }
          },
          filters: {
            title: 'Bộ lọc nâng cao',
            reset: 'Đặt lại bộ lọc',
            skillsTitle: 'Kỹ năng chuyên môn',
            selectedCount: 'Đã chọn: {{count}}',
            skills: {
              elderly: 'Chăm sóc người cao tuổi / Sa sút trí tuệ',
              strokeRehab: 'Phục hồi chức năng sau đột quỵ / Tai biến',
              ivWound: 'Tiêm truyền, thay băng & cắt chỉ vết thương',
              pressureUlcer: 'Chăm sóc loét tì đè / Mở khí quản / Sonde',
              acupressure: 'Xoa bóp, bấm huyệt & vật lý trị liệu',
              postnatal: 'Chăm sóc mẹ & bé sơ sinh sau sinh'
            },
            experienceTitle: 'Số năm kinh nghiệm',
            experience: {
              all: 'Tất cả kinh nghiệm',
              under2: 'Dưới 2 năm',
              from2to5: 'Từ 2 - 5 năm (Ưu tiên lựa chọn)',
              over5: 'Trên 5 năm (Chuyên khoa sâu)',
              over10: 'Trên 10 năm (Điều dưỡng trưởng / Cử nhân)'
            },
            genderTitle: 'Giới tính người chăm sóc',
            gender: {
              all: 'Tất cả',
              female: 'Nữ',
              male: 'Nam'
            },
            priceTitle: 'Mức giá dịch vụ',
            priceRange: '180k - 350k / giờ',
            minPerHour: 'Tối thiểu / giờ',
            maxPerHour: 'Tối đa / giờ',
            minPriceValue: '180.000 đ',
            maxPriceValue: '350.000 đ',
            fixedShiftPackage: 'Lọc theo gói ca trực cố định (Ca 8h / 24h)',
            ratingTitle: 'Đánh giá khách hàng',
            rating: {
              star5: '5.0 tuyệt đối',
              star48: 'Từ 4.8 trở lên',
              star45: 'Từ 4.5 trở lên'
            }
          },
          results: {
            matchCount: 'người chăm sóc phù hợp tiêu chí',
            sortLabel: 'Sắp xếp:',
            sortOptions: {
              highestRating: 'Đánh giá cao nhất',
              mostExperience: 'Kinh nghiệm nhiều nhất',
              priceAsc: 'Giá thấp đến cao',
              closest: 'Gần bạn nhất (Bình Thạnh)'
            },
            viewList: 'Xem dạng danh sách',
            viewGrid: 'Xem dạng lưới',
            verifiedTooltip: 'Đã xác thực danh tính & Bằng cấp',
            reviewsCount: '({{count}} đánh giá)',
            completedShifts: '{{count}} ca hoàn thành',
            ageGender: '{{gender}} • {{age}} tuổi',
            experienceLabel: 'Kinh nghiệm {{years}} năm:',
            viewDetail: 'Xem hồ sơ chi tiết',
            bookNow: 'Đặt lịch chăm sóc ngay',
            perHourSuffix: '/ giờ',
            shift8hSuffix: '(hoặc {{price}} đ/ca 8h)',
            paginationText: 'Hiển thị 1 - 3 trên tổng số 28 người chăm sóc được đề xuất',
            prevPage: 'Trang trước',
            nextPage: 'Trang sau',
            genders: {
              female: 'Nữ',
              male: 'Nam'
            },
            availability: {
              today: 'Trống lịch: Hôm nay (từ 13:00) & Tuần này',
              tomorrow: 'Trống lịch: Sáng mai (08:00 - 17:00)',
              recurring: 'Trống lịch: Ca trực dài ngày & Định kỳ hàng tuần'
            },
            badges: {
              regularNurse: 'Điều dưỡng viên chính quy',
              verified100: 'Xác thực CareConnect 100%',
              icuNurse: 'Cử nhân Điều dưỡng Hồi sức',
              topRated: 'Top Rated Điều Dưỡng',
              elderlySpecialist: 'Chuyên viên Chăm sóc Người cao tuổi',
              dedicated: 'Tận tâm & Kiên nhẫn'
            },
            cardSkills: {
              postStroke: 'Chăm sóc sau tai biến',
              strokeRehab: 'Phục hồi sau đột quỵ',
              rehabMobility: 'Vận động phục hồi chức năng',
              cardioMeds: 'Quản lý đơn thuốc tim mạch & huyết áp',
              vitalSigns: 'Đo sinh hiệu chuyên sâu',
              ventilatorTube: 'Chăm sóc bệnh nhân thở máy/sonde',
              physioTherapy: 'Vật lý trị liệu vận động',
              cprEmergency: 'Xử lý cấp cứu hồi sinh tim phổi',
              alzheimerCare: 'Chăm sóc Alzheimer / Sa sút trí tuệ',
              elderlyNutrition: 'Dinh dưỡng chuyên biệt người già',
              hygieneCare: 'Hỗ trợ tắm gội vệ sinh cá nhân tận tâm',
              psychTherapy: 'Trò chuyện & Liệu pháp tâm lý'
            },
            bios: {
              nurse1:
                'Từng công tác khoa Cấp cứu & Hồi sức tại BV Chợ Rẫy và BV Đại học Y Dược TP.HCM. Chuyên môn sâu về theo dõi người bệnh cao tuổi có bệnh nền phức tạp.',
              nurse2:
                'Từng phụ trách Chuyên khoa Tim mạch - Hồi sức tích cực. Có kỹ năng chuyên sâu xử lý tình huống khẩn cấp, bệnh nhân thở máy, sonde dạ dày và can thiệp tập phục hồi liệt nửa người.',
              nurse3:
                'Từng làm việc lâu năm tại Trung tâm Dưỡng lão & Phục hồi chức năng người cao tuổi TP.HCM. Rất kiên nhẫn, thấu hiểu tâm lý người già mất trí nhớ, Alzheimer hoặc khó tính sau tai biến.'
            }
          }
        },
        booking: {
          documentTitle: 'Tạo lịch hẹn chăm sóc y tế tại nhà | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            caregivers: 'Tìm người chăm sóc',
            current: 'Đặt lịch chăm sóc mới'
          },
          header: {
            title: 'Tạo lịch hẹn chăm sóc y tế tại nhà',
            subtitle:
              'Quy trình ghép nối điều dưỡng chuyên nghiệp, theo dõi sinh hiệu số hóa và cá nhân hóa lộ trình hồi phục cho người thân.'
          },
          stepper: {
            step1Label: 'Bước 1',
            step1Title: 'Người bệnh',
            step2Label: 'Bước 2',
            step2Title: 'Gói dịch vụ',
            step3Label: 'Bước 3',
            step3Title: 'Điều dưỡng viên',
            step4Label: 'Bước 4',
            step4Title: 'Lịch trình & Giờ',
            step5Label: 'Bước 5: Xác nhận',
            step5Title: 'Tổng kết & Đặt lịch'
          },
          patientSection: {
            title: 'Người nhận chăm sóc',
            subtitle: 'Hồ sơ y tế được bảo mật theo tiêu chuẩn HIPAA & Bộ Y Tế',
            switchPatientBtn: 'Đổi người thân',
            ageText: '{{age}} tuổi',
            genderMale: 'Nam',
            genderFemale: 'Nữ',
            bloodType: 'Nhóm máu {{type}}',
            underlyingLabel: 'Bệnh nền:',
            underlyingDesc: 'Tăng huyết áp độ 2, Đái tháo đường Type 2, Di chứng tai biến mạch máu não nhẹ năm 2022.',
            address: 'Căn hộ 18.04 Tòa Landmark 2, Vinhomes Central Park, P. 22, Bình Thạnh, TP.HCM',
            patientFatherOption: 'Cụ Nguyễn Văn An (Bố)',
            patientMotherOption: 'Bà Lê Thị Mai - 74 tuổi (Mẹ)',
            addNewPatientLink: 'Thêm hồ sơ người bệnh mới'
          },
          servicesSection: {
            title: 'Gói dịch vụ chăm sóc y tế',
            subtitle: 'Lựa chọn chuyên khoa phù hợp với tình trạng lâm sàng',
            activeBadge: 'Đã kích hoạt phác đồ',
            plans: {
              stroke: {
                title: 'Chăm sóc Phục hồi sau Tai biến & Mãn tính',
                desc: 'Tập trung tái tạo vận động, kích thích cơ, phòng loét tì đè và kiểm soát huyết áp chuẩn mực.',
                f1: 'Đo sinh hiệu (HA, SPO2, Đường huyết) 2 lần/ca',
                f2: 'Hỗ trợ tập vật lý trị liệu & PHCN tại giường 45 phút',
                f3: 'Cho dùng thuốc đúng chỉ định & thực đơn tiểu đường'
              },
              surgery: {
                title: 'Hậu phẫu Ngoại khoa & Chăm sóc Vết thương',
                desc: 'Thay băng vô khuẩn, cắt chỉ theo y lệnh, rút dẫn lưu và theo dõi nguy cơ nhiễm trùng.',
                f1: 'Kỹ thuật tiệt trùng vô khuẩn chuẩn viện',
                f2: 'Chăm sóc ống thông Sonde dạ dày / Foley'
              },
              dementia: {
                title: 'Sa sút trí tuệ & Alzheimer Người già',
                desc: 'Trò chuyện trị liệu tâm lý, kích thích trí nhớ, đồng hành chống lạc và hỗ trợ vệ sinh cá nhân toàn diện.'
              },
              palliative: {
                title: 'Chăm sóc Giảm nhẹ & Bệnh nặng tại giường',
                desc: 'Thở oxy gia đình, hút đờm dãi, xoay trở chống loét độ 3-4 và quản lý cơn đau chuyên sâu.'
              }
            }
          },
          caregiverSection: {
            title: 'Điều dưỡng viên phụ trách',
            subtitle: 'Được tuyển chọn theo chứng chỉ hành nghề và phác đồ chuyên khoa',
            changeCaregiverBtn: 'Chọn người khác',
            onlineStatus: 'Đang sẵn sàng nhận ca',
            nurseName: 'ĐD. Nguyễn Thị Bích Loan',
            verifiedBadge: 'Đã xác thực',
            nurseBio: 'Cử nhân Điều dưỡng Đại học Y Dược TP.HCM • 6 năm kinh nghiệm hồi sức & PHCN',
            reviewsCount: '4.95 (186 đánh giá 5★)',
            distance: 'Cách nhà 2.4 km',
            priceLabel: 'Đơn giá cam kết',
            priceRate: '1.450.000 đ',
            perShiftSuffix: '/ ca 8h',
            includedSupplies: 'Đã bao gồm chi phí đi lại & vật tư y tế sơ cấp',
            smartMatchTitle: 'CareConnect SmartMatch (Gợi ý tự động)',
            smartMatchDesc:
              'Hệ thống AI tự động điều phối điều dưỡng viên chuẩn 5 sao gần nhất nếu ĐD. Loan có ca đột xuất.'
          },
          scheduleSection: {
            title: 'Lịch trình & Khung giờ chăm sóc',
            subtitle: 'Lựa chọn tần suất ca trực và dặn dò chuyên biệt cho điều dưỡng',
            weeklyTab: 'Theo tuần (Tiết kiệm 10%)',
            singleTab: 'Ca lẻ đơn ngày',
            startDateLabel: 'Ngày bắt đầu',
            firstShiftNotice: 'Ca đầu tiên: Thứ 2, 21/10/2024',
            shiftHourLabel: 'Khung giờ ca trực',
            shiftHourHint: 'Bao gồm 60 phút nghỉ trưa tiêu chuẩn',
            shifts: {
              day8h: 'Ca Ngày 8 tiếng (08:00 - 17:00)',
              morning4h: 'Ca Sáng 4 tiếng (08:00 - 12:00)',
              afternoon4h: 'Ca Chiều 4 tiếng (13:30 - 17:30)',
              night12h: 'Ca Trực Đêm 12 tiếng (19:30 - 07:30)',
              full24h: 'Nội trú Toàn thời gian 24/24'
            },
            frequencyLabel: 'Số buổi trong tuần',
            frequencyHint: 'Được áp dụng gói ưu đãi Tuần An Tâm',
            frequencies: {
              days5: '5 ngày (Thứ Hai đến Thứ Sáu)',
              days7: '7 ngày (Trọn vẹn tuần kể cả T7, CN)',
              days3: '3 ngày (Thứ Hai, Tư, Sáu)',
              custom: 'Tùy chỉnh lịch cụ thể'
            },
            weeklyDaysLabel: 'Các ngày trong tuần này:',
            notesLabel: 'Ghi chú dặn dò đặc biệt cho Điều dưỡng viên:',
            notesLimit: 'Tối đa 500 ký tự',
            notesPlaceholder: 'Nhập ghi chú đặc biệt cho điều dưỡng viên...',
            notesDefault:
              'Bố tôi bị yếu nửa người bên trái sau di chứng tai biến nhẹ, nhờ điều dưỡng Loan hỗ trợ tập vật lý trị liệu cánh tay và cổ chân 30-45 phút vào buổi chiều. Bố hay quên uống thuốc, nhờ điều dưỡng kiểm tra huyết áp trước khi cho cụ uống viên hạ áp Amlodipine 5mg sau ăn sáng lúc 09:00.'
          },
          summary: {
            tag: 'Tóm tắt đơn đặt lịch',
            title: 'Xác nhận chi phí ca trực',
            patientLabel: 'Người bệnh',
            patientValue: 'Cụ Nguyễn Văn An (78 tuổi)',
            caregiverLabel: 'Điều dưỡng phụ trách',
            caregiverValue: 'ĐD. Nguyễn Thị Bích Loan',
            timeLabel: 'Thời gian thực hiện',
            timeValue: '5 ca (21/10 - 25/10/2024 • 08:00 - 17:00)',
            rateLabel: 'Đơn giá ca trực 8h',
            rateValue: '1.450.000 đ / ca',
            shiftsCountLabel: 'Số lượng ca trực (5 ngày)',
            shiftsCountValue: '7.250.000 đ',
            discountLabel: 'Ưu đãi gói tuần (-10%)',
            discountValue: '- 725.000 đ',
            voucherLabel: 'Voucher FirstCare',
            voucherValue: '- 200.000 đ',
            insuranceLabel: 'Bảo hiểm rủi ro & Vật tư sơ cấp',
            freeValue: 'Miễn phí (0 đ)',
            promoPlaceholder: 'MÃ GIẢM GIÁ',
            applyBtn: 'Áp dụng',
            totalEstimatedLabel: 'Tổng thanh toán dự kiến',
            totalNote: 'Đã bao gồm VAT & cam kết trọn gói',
            currency: 'đ',
            totalAmount: '6.325.000',
            paymentMethodTitle: 'Phương thức thanh toán:',
            recommendedBadge: 'Khuyên dùng',
            flexibleBadge: 'Linh hoạt',
            paymentMethods: {
              napas: 'Chuyển khoản QR Napas 24/7',
              card: 'Thẻ Quốc tế (Visa / Master / JCB)',
              wallet: 'Ví điện tử MoMo / ZaloPay',
              deposit30: 'Cọc 30% (Thanh toán sau mỗi ca)'
            },
            submitBtn: 'Xác nhận & Đặt lịch chăm sóc',
            successTitle: 'Đặt lịch chăm sóc thành công!',
            successDesc:
              'Lịch hẹn chăm sóc cho {{patient}} với {{nurse}} đã được ghi nhận. Bạn có thể theo dõi tiến độ ca trực tại mục Lịch đặt của tôi.',
            viewMyBookings: 'Xem Lịch đặt của tôi',
            backToCaregivers: 'Quay về Tìm người chăm sóc',
            trustGuarantees: {
              g1: 'Hoàn tiền 100% nếu điều dưỡng không đúng phác đồ',
              g2: 'Miễn phí đổi điều dưỡng viên bất kỳ lúc nào nếu chưa phù hợp',
              g3: 'Dữ liệu lâm sàng được mã hóa AES-256 đầu cuối'
            }
          }
        },
        bookingDeposit: {
          documentTitle: 'Xác nhận lịch hẹn & Thanh toán cọc | CareConnect',
          breadcrumb: {
            home: 'Trang chủ',
            myBookings: 'Lịch đặt của tôi',
            current: 'Xác nhận lịch hẹn & Thanh toán cọc (#CC-BK-9284)'
          },
          banner: {
            title: 'Lịch hẹn đang được giữ chỗ tạm thời',
            exclusiveBadge: 'Ca trực độc quyền',
            desc: 'Vui lòng hoàn tất thanh toán tiền cọc 30% để điều dưỡng viên tiếp nhận ca và chốt lịch di chuyển.',
            reservedTimeLabel: 'Thời gian giữ chỗ',
            expired: 'Hết hạn'
          },
          overview: {
            title: 'Chi tiết lịch hẹn y tế',
            pendingDepositBadge: 'Chờ đặt cọc',
            fileCodePrefix: 'Mã hồ sơ: ',
            fileCodeValue: '#CC-BK-9284',
            createdTime: ' • Khởi tạo lúc 09:15, 24/10/2024',
            insuranceBadge: 'Bảo hiểm y khoa tiêu chuẩn',
            caregiver: {
              avatarAlt:
                'Chân dung nữ điều dưỡng viên Việt Nam thân thiện Nguyễn Thị Bích Loan trong đồng phục ngọc bích',
              name: 'ĐĐ. Nguyễn Thị Bích Loan',
              verifiedBadge: 'CCHN & VNeID',
              bio: 'Cử nhân Điều dưỡng • ĐH Y Dược TP.HCM (7 năm kinh nghiệm lâm sàng)',
              ratingValue: '4.9',
              reviewsCount: '(124 đánh giá)',
              chatAfterDeposit: 'Trao đổi riêng sau cọc'
            },
            patient: {
              title: 'Thông tin người nhận chăm sóc',
              name: 'Cụ Nguyễn Văn An (78 tuổi • Bố ruột)',
              conditionLabel: 'Tình trạng:',
              conditionDesc:
                'Tăng huyết áp, Đái tháo đường Type 2, phục hồi vận động sau tai biến nhẹ nửa người bên trái.'
            },
            location: {
              title: 'Địa chỉ tiếp nhận chăm sóc',
              building: 'Căn hộ 18.04 • Tòa Landmark 2',
              address: 'Khu đô thị Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, P. 22, Q. Bình Thạnh, TP. Hồ Chí Minh'
            },
            schedule: {
              title: 'Phác đồ chăm sóc & Lịch trình',
              shiftsCountBadge: '5 ca liên tục • 40 giờ',
              datesLabel: 'Ngày thực hiện',
              datesValue: '28/10 - 01/11/2024',
              shiftHoursLabel: 'Khung giờ mỗi ca',
              shiftHoursValue: '08:00 - 16:00 (Ca ngày)',
              reportFrequencyLabel: 'Báo cáo lâm sàng',
              reportFrequencyValue: 'Cập nhật mỗi 4 giờ',
              protocolsTitle: 'Hạng mục công việc trong gói:',
              protocols: {
                vitals: 'Đo sinh hiệu liên tục: Huyết áp, SpO2, Đường huyết',
                physio: 'Vật lý trị liệu phục hồi chức năng tay chân 45 phút/ca',
                meds: 'Hỗ trợ nhắc thuốc và ghi chép nhật ký dùng thuốc',
                nutrition: 'Chăm sóc dinh dưỡng y tế & vận động nhẹ phòng loét tì đè'
              }
            }
          },
          policies: {
            title: 'Chính sách cam kết & Bảo vệ quyền lợi',
            items: {
              refundTitle: 'Hoàn cọc 100% linh hoạt',
              refundDesc:
                'Miễn phí hủy và nhận hoàn lại 100% tiền đặt cọc nếu hủy trước 12 giờ so với thời gian bắt đầu ca đầu tiên.',
              insuranceTitle: 'Bảo hiểm y tế trách nhiệm',
              insuranceDesc:
                'Toàn bộ ca trực được bảo vệ bởi gói bảo hiểm trách nhiệm y tế trị giá 2.000.000.000 đ từ đối tác Bảo Việt.',
              escrowTitle: 'Bảo lưu tiền cọc an toàn',
              escrowDesc:
                'Tiền cọc được tạm giữ an toàn trong tài khoản trung gian của CareConnect cho đến khi điều dưỡng viên check-in đúng giờ.',
              supportTitle: 'Điều phối viên hỗ trợ 24/7',
              supportDesc:
                'Tổng đài lâm sàng và bác sĩ cố vấn sẵn sàng hỗ trợ đổi nhân sự ngay tức thì nếu điều dưỡng viên gặp sự cố y tế khẩn cấp.'
            }
          },
          payment: {
            stepLabel: 'Bước cuối cùng',
            title: 'Thanh toán tiền cọc',
            subtitle: 'Giữ lịch ca trực và kích hoạt hồ sơ chuẩn bị của điều dưỡng',
            shiftsCostLabel: 'Chi phí ca trực (5 ca × 8h)',
            shiftsCostValue: '$95 (2.375.000 đ)',
            suppliesCostLabel: 'Vật tư y tế cơ bản & Bảo hiểm ca',
            suppliesCostValue: '$15 (375.000 đ)',
            promoLabel: 'Mã ưu đãi Khách hàng mới',
            promoValue: '-$10 (-250.000 đ)',
            totalPackageLabel: 'Tổng chi phí trọn gói:',
            totalUsd: '$100',
            totalVnd: '2.500.000 đ',
            depositTitle: 'Tiền cọc yêu cầu (30%)',
            depositRemaining: 'Còn lại sau ca: $70 (1.750.000 đ)',
            depositUsd: '$30',
            depositVnd: '750.000 đ',
            methodTitle: 'Chọn phương thức thanh toán cọc',
            methods: {
              vietqr: {
                label: 'Quét mã VietQR 24/7',
                freeBadge: 'Miễn phí GD',
                desc: 'Chuyển khoản tức thì mọi ngân hàng',
                bankAccountLabel: 'Tài khoản: ',
                bankAccountValue: '0381000599999 (Vietcombank)',
                transferNoteLabel: 'Nội dung CK: ',
                transferNoteValue: 'CC 9284 COC'
              },
              card: {
                label: 'Thẻ quốc tế (Visa / Master / JCB)',
                desc: 'Bảo mật chuẩn PCI-DSS 3D-Secure'
              },
              wallet: {
                label: 'Ví MoMo / ZaloPay',
                desc: 'Xác thực nhanh trên ứng dụng'
              }
            },
            payButton: 'Thanh toán đặt cọc $30 (750.000 đ)',
            processing: 'Đang xử lý giao dịch...',
            successText: 'Đặt cọc thành công!',
            agreementPrefix: 'Nhấn thanh toán đồng nghĩa với việc bạn đồng ý với ',
            termsLink: 'Điều khoản dịch vụ',
            andText: ' và ',
            refundLink: 'Chính sách hủy hoàn cọc',
            agreementSuffix: ' của CareConnect.',
            sslNotice: 'Mã hóa thanh toán SSL 256-bit tiêu chuẩn ngân hàng',
            caregiverNotice:
              'Điều dưỡng viên ĐĐ. Bích Loan đã nhận thông báo giữ lịch và sẵn sàng trang thiết bị ngay khi giao dịch cọc thành công.',
            modalTitle: 'Đặt cọc thành công!',
            modalDesc:
              'Xác nhận đặt cọc thành công! Điều dưỡng viên ĐĐ. Nguyễn Thị Bích Loan đã chính thức nhận ca trực. CareConnect đã gửi mã xác nhận & thông tin qua SMS / Email của bạn.',
            viewBookingsBtn: 'Xem Lịch đặt của tôi',
            closeModalBtn: 'Đóng'
          }
        },
        footer: {
          tagline: '© 2024 CareConnect. Nền tảng kết nối người chăm sóc uy tín và tận tâm.',
          privacy: 'Chính sách bảo mật',
          terms: 'Điều khoản dịch vụ',
          support: 'Trung tâm hỗ trợ'
        }
      }
    }
  }
} as const

export type SupportedLanguage = keyof typeof resources
