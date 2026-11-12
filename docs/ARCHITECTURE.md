# CareConnect Web architecture

Status: accepted foundation, 2026-08-11.

## Context

CareConnect is a platform connecting family members with home caregivers.
Users can browse caregiver profiles, qualifications, experience, certifications,
and ratings before booking care sessions by hour or by day. Center Managers
manage their center's caregivers, services, bookings, and assignments. Admins
oversee centers, customers, the global service catalog, platform policies,
escalated complaints, and system-wide statistics. Caregivers primarily use a
mobile app to receive schedules, update task status, and submit care reports.

The frontend started from the React Router welcome template. This architecture is
deliberately a modular frontend inside one deployable application: a five-person,
fourteen-week MVP does not benefit from micro-frontends, a cross-platform UI package,
or a generic repository layer over a generated HTTP client.

## Runtime view

```text
Browser
  -> static React Router SPA
      -> route module
          -> feature UI/workflow
              -> generated TanStack Query hook
                  -> fetch /api/*
                      -> CareConnect backend REST API
```

The browser owns presentation, navigation, and ephemeral interaction state. Backend
services own validation, authorization, workflow transitions, audit trails,
persistence, and all decisions that affect money or access.

The admin dashboard reads live operational aggregates from BookingService's
`/api/v1/statistics/system` and provider status counts from ProviderService's
`/api/v1/care-centers/statistics`. Center managers use the separate
`/center-manager/statistics` page, backed by `/api/v1/statistics/centers`;
BookingService scopes that request to the manager's center. Since 2026-11-10
(`BE/docs/2026-11-10-DASHBOARD_AND_CENTER_WITHDRAWALS.md`) both responses carry chart data for the period
(`trend[]` by day or month, `occurrencesByStatus`, `bookingsByType`, `ratingDistribution`) and both pages are
dashboards: one period in `?period=month|last30|year` (`entities/statistics/statistics-period.ts`, Vietnam calendar
days for BookingService, instants for PaymentService) drives every section — six operational numbers, the booking /
visit trend and outcomes, booking status and type, ratings, complaints and top caregivers (`entities/statistics`), plus
money: the center page reads `/payments/revenue` and its center wallet statistics, the admin page the platform
revenue, the platform wallet statistics, Identity accounts by role and ProviderService partner counts, with a "needs
attention" band (centers to approve, caregivers to verify, center withdrawals, escalated complaints). Charts come from
`shared/ui/charts` (`ColumnChart`, `LineChart`, `DonutChart`, `BarList`, `KpiTile`, `ChartCard`; since 2026-11-11 the
booking / visit trend switches between grouped columns (default) and lines, and `LineChart` reveals its lines with a
clip because a `pathLength` draw under `non-scaling-stroke` broke them into dashes): SVG / CSS
with `motion`, no chart library, the categorical palette `--color-chart-1..5` in `app.css` (checked for colour-vision
deficiency), a legend for two or more series and every value in a tooltip and an accessible name.

### Web authentication and portal access

IdentityService owns the web session behind the API gateway on local port 8080.
The browser sends its HttpOnly access and refresh cookies to the same-origin `/api`
prefix. The frontend fetches a CSRF token before login, refresh, and logout and
sends it in the header specified by `/api/v1/auth/csrf`. Cookie-based web mutations
also send `X-Client-Type: web` so IdentityService issues and clears session cookies.
The frontend never stores access or refresh tokens in browser storage. After login,
`/api/v1/users/me` supplies the
authenticated user and roles. A 401 from `/api/v1/users/me` triggers one refresh
attempt and a retry; another 401 means the
session has ended. Other API failures show a retry state instead of treating the
user as signed out.
While an authenticated portal is open, its session query checks `/api/v1/users/me`
once a minute, allowing an expired access cookie to refresh without waiting for a
business request. Concurrent refreshes in one tab share a promise; browser tabs
coordinate refresh-token rotation with a Web Lock. A transient refresh failure
does not force navigation to login; an authentication rejection does.

Each portal parent route wraps its layout with a TanStack Query session guard.
The guard renders children only after `/api/v1/users/me` confirms an active user with the
required backend role. It redirects anonymous users to `/login` with an internal
return path and shows an access-denied state for the wrong role. The backend remains
authoritative for every data and mutation endpoint; these guards only prevent
incorrect UI access. Portal headers use the `/api/v1/users/me` identity while business
screens remain labeled previews. Login routes users to the first available built-in portal in
the order ADMIN, CENTER_MANAGER, CAREGIVER, CUSTOMER. A safe return path takes
priority when it belongs to one of the user's roles. Logout clears the backend
cookies and reloads `/login` to drop the in-memory query cache.

The Customer portal has its own guarded index at `/customer`. It renders the same
landing-page content as the public `/` route, with a bookings action in place of
account registration. The Customer header shares the public landing page's visual
style while retaining portal links, language selection, account access, and sign-out.
The shared site footer (a deep brand band since CR-5, 2026-11-03, the only place with the support hotline) adapts its
account links to the signed-in Customer portal.
The Customer header and in-portal home breadcrumbs point to `/customer`; the account
menu contains personal info, family profiles, payments, invitations, the language switch and
sign-out. Family profiles are reached from that menu rather than the header navigation.
The customer portal was redesigned on 2026-11-03 (`docs/2026-11-03-CUSTOMER_UI_REDESIGN_PROGRESS.md`): its theme is
scoped by `.theme-customer` in `app.css` (Be Vietnam Pro, brand scale `--color-brand-50…900`, two shadows, `cc-*`
motion classes that keep only fades under reduced motion), pages use `PageHeader` + `pageContainer` (1200 px), and the
header is 64 px sticky with Home · Caregivers · Services · Centers · Bookings (badge of bookings awaiting payment), "Book care", the
center chip, the notification bell (which also pins pending profile invitations) and the account menu; phones get a
bottom navigation. `/customer/my-profile`, `/customer/patient-profiles`, `/customer/patient-profiles/:id`,
`/customer/payments` and `/customer/invitations` share an account shell (`routes/customer/account-layout.tsx` →
`features/customer/layout/account-shell.tsx`): a sidebar on desktop, a row of tabs on phones, with a badge of pending
invitations. Since the "Soft Bento" restyle (2026-11-09) `features/customer/layout/customer-theme.css` remaps the
semantic tokens inside `.theme-customer` (forest primary, mint fills, 24 px cards) and customer pages use
`features/customer/ui` (`CustomerPageHeader`, `bento-styles.ts`) instead of the shared `PageHeader`. Action results are sonner toasts (the shared `Toaster`, mounted in `CustomerLayout` above the bottom
navigation).
Caregiver search, caregiver detail, and services under `/customer` use a public browse
layout outside the Customer portal guard. Guests see the same navigation style with
Home, Find Caregivers, Services, and Sign in; active Customers also see bookings and
their account menu. The `/customer` index, booking routes, and personal and patient
profiles remain guarded. Since 2026-11-09 guests read the caregiver catalog (`GET /caregivers`), the public caregiver
profile (`GET /caregivers/{id}/public`), catalog items, center offerings and their price plans without signing in: the
gateway's `OPTIONAL_AUTH_GET_ENDPOINTS` and the matching ProviderService / CareCatalogService matchers permit anonymous
GETs but still forward and verify a token when one is present, so admins and managers keep their full view (an
anonymous caller is treated like a customer). Verified certificate files and caregiver search still need a session.

The Customer header carries a center selector beside the logo, and the public `/` home
page uses the same Customer layout so the selector appears from the first visit.
`entities/care-center` lists ACTIVE centers through ProviderService's customer endpoint
`GET /v1/care-centers/public` (up to five pages of 100) and reads the chosen center's current
name through `GET /v1/care-centers/public/{centerId}`; a 404 there clears the choice. Both
endpoints are public since CR-6 (2026-11-03: `@SecurityRequirements({})`, ProviderService `PUBLIC_GET_ENDPOINTS`, gateway
`PUBLIC_GET_ENDPOINTS`, GET only, no token read). The chosen
center is a per-browser preference in `localStorage` (only its ID and name) shared through
a small external store; a dialog opens once per browser session while no center is chosen,
and any "choose a center" action reopens it. Until the BE change is deployed a visitor's 401 on the center list shows a
sign-in step instead of an error (a signed-in customer's 401 keeps the retry). Null means "All centers", the
platform-wide configuration; otherwise the chip shows the chosen center. The chip renders for visitors too (from `sm`).
Only an explicit choice changes the selection: the chip, the dialog and "Choose this center" on the center pages go
through `entities/care-center/use-choose-center.ts`, which rescopes the lists in place and shows an info toast
("Now viewing X"); opening a caregiver, service or center of another center never changes it. The picker links to the
center directory ("See all centers").

`/customer/centers` and `/customer/centers/:centerId` (browse layout, no guard; `features/customer/centers`) are the
public center directory: the list searches name and address without diacritics (`?q=`) and shows photo, address, hours,
phone, starting price and service count with "View center" and "Choose this center"; the detail page has "Choose this
center" / "Selected", "Book care" (`/customer/booking?center=<id>`), the center's services with prices
(`entities/care-catalog/center-services.ts`, shared with the services page), up to six caregivers from the provider
catalog filtered by `centerId`, and a deposit and refund summary from `GET /center-booking-policies/{centerId}`. The
services, caregivers and policy requests still need a session, so each section shows a sign-in hint on 401. Header
navigation has "Centers"; the visitor phone navigation adds it as a fourth tab (the customer bar is full and reaches
centers through the header menu). In "All centers" mode caregiver cards carry a center badge, and service cards (catalog
items without prices) offer "Choose a center" and "Compare centers".

Customer `/customer/services` follows that choice. With a center it reads the center's
offerings and price plans through `entities/care-catalog`, showing only active offerings
of active catalog items and active price plans. Without one it lists the active global
catalog items without prices and asks the customer to choose a center; a failed or empty
platform-wide list shows that request, not an error. Search, category, sort (name or
price) and page live in URL search parameters and work on the cached data. Customer
`/customer/caregivers` passes the chosen `centerId` to the caregiver catalog in the same
way. The booking form lists centers from the same public center query, reads only the
chosen center's caregivers, and starts from the header's center when its URL names neither a
center nor a caregiver. Changing the center drops a stale `page` parameter.

Customer `/customer/patient-profiles` and `/customer/patient-profiles/:id` read
CareRecipientService through `entities/care-recipient`, which owns the gateway
wrappers and query keys. The list keeps keyword (searched as the customer types), status chips and page in URL search
parameters and uses backend pagination; cards sit in a two-column grid with "Book care" (`/customer/booking?patientId=`)
and a "⋯" menu (edit, delete behind a confirmation dialog), and pending invitations show as a banner. The detail page
has six tabs in `?tab=` (overview, health & medications, daily life, emergency contacts, address book — saved places the
person may stay, `GET/POST/PUT/DELETE /care-recipients/{id}/addresses`, since 2026-11-05 — and managers), a header with the
profile completeness (ten caregiver-relevant items, medications excluded) and no page-wide edit mode: each section has
its own "Edit" that opens a centred dialog laid out in two columns (`?edit=basic`, or the older `?mode=edit`, opens the
basic section on arrival). Every section save still sends the whole profile with the
backend `version` because the PUT contract clears omitted fields; a 409 asks the
user to reload. Medications and emergency contacts use their own endpoints, and
medication activity changes only through the `active` PATCH. Edit and delete
controls follow the returned `myAccessLevel` (EDITOR/OWNER edit, OWNER deletes,
which archives), while the backend enforces access. Assigned caregivers, care
session history, attached documents, identity/insurance numbers and attending
doctors have no CareRecipient contract and are not shown.

Profile creation at `/customer/patient-profiles/new` sends one CSRF-protected
`POST /api/v1/care-recipients`; the backend stores the profile, its medications and
an optional primary emergency contact in one transaction and makes the customer the
OWNER. The form starts empty. It asks how the patient relates to the customer and
maps that to the stored manager relationship (a father becomes `CHILD`). Selected
chronic conditions and allergy tags are joined into the free-text contract fields.
Each medication needs a name and start date. Validation errors, and backend 400 codes
that name one field, appear under that field with `aria-invalid`/`aria-describedby`;
each failed submit focuses and scrolls to the first invalid control. Only server
failures without a field keep a form-level alert. The form has no national ID, insurance,
doctor, avatar upload, prescription upload or draft fields because the contract
cannot store them; patient data is never written to browser storage. Co-managers are
not added here.

Medication name fields on the create form and the detail medication form use
`entities/care-recipient/medication-name-input`, an accessible combobox over the static
`medication-catalog.constants.ts` list. Entries reuse the `MedicationRequest` fields
`medicationName` (active ingredient and strength) and `route`; dosage, schedule and
dates are never suggested. Matching ignores case and Vietnamese diacritics and accepts
the start of the name or of any word in it. Free text stays allowed, and a chosen entry
fills only an empty route field.

`/login`, `/register` and `/forgot-password` share the layout route `routes/auth-layout.tsx` →
`features/shared/auth/auth-shell.tsx`, which stays mounted so on desktop the forest card and the form slide past each
other and the page (outlet) swaps while they cross; the pages render only their form.

Public customer registration uses `/api/v1/auth/register` to send an email OTP. The
account is created only after `/api/v1/auth/register/verify` succeeds; verification
does not create a web session, so the user signs in separately. The registration
screen can request `/api/v1/auth/register/resend-otp` after the cooldown returned by
the backend. All three mutations fetch a fresh CSRF token and use the same-origin
`/api` proxy with credentials, so registration also works when an existing web
cookie is present. The UI never persists the password or OTP.

The committed OpenAPI snapshot covers reviewed IdentityService web authentication,
registration, recovery, current-user security, and account administration. The public
`/forgot-password` screen requests an emailed OTP and submits it with a new password;
both mutations use a fresh CSRF token. Its request result is deliberately neutral
about whether an account exists. The customer `/customer/my-profile` screen reads
the guarded `/api/v1/users/me` user, shows it read-only until "Edit", and saves only `fullName` and `phoneNumber`
through `PUT /api/v1/users/me` (the save / cancel bar sticks only while something changed); a successful response
replaces the session query data. `?section=security` is the password change with a strength bar and a live checklist
of the `validPassword` rules. Email is
read-only because the backend profile update contract does not accept it.
The snapshot corrects the live Swagger's generic
`ApiResponse.result` and spurious CSRF query parameter using the backend DTOs and
the observed `/api/v1/auth/csrf` response. Generated files are never hand-edited.

### Identity administration and account security

The reviewed IdentityService snapshot includes 14 web operations for account
administration, roles, permissions, password change, and global session logout,
plus two operations for individual session management. `/admin/accounts` lists and provisions real accounts; `/admin/accounts/:id`
edits profile fields, status, and role assignments; `/admin/roles` manages custom
roles and their permission sets. These screens stay separate from the illustrative
Admin customer screens. TanStack Query caches reads and invalidates affected lists
and details after mutations. The backend enforces all permissions; the UI hides
actions based on `/api/v1/users/me` permissions and renders denied/error states.
The account list reads the `content` array and `totalPages` from IdentityService's
paginated `/api/v1/users` result; an invalid page shape becomes a retryable API error.
Accounts show initials. A CAREGIVER account reads its ProviderService profile
(`GET /caregivers/by-user/{userId}`) and shows that caregiver photo, with a link to the review in `/admin/centers/:id/caregivers`.

Admin bookings (`/admin/bookings` and the center page's Bookings tab) use
`entities/booking/bookings-browser.tsx`: a filtered list or a month calendar that expands RECURRING
DAILY / WEEKLY schedules into visits and shows SHIFT and CUSTOM bookings on their first day (`booking-month.ts`; the list
carries no per-visit times of a CUSTOM booking), both reading
`GET /bookings` with URL-held filters. Booking history hides machine reasons such as
`paymentReference=…` (`booking-history-reason.ts`) and shows "deposit received" instead.
The Services page's Price plans tab compares the plans of every active center per
standard service, read-only, since only center managers edit plans in CareCatalog.

`/account/security` is available to every active web user. Password change and
sign-out on every device use CSRF-protected cookie requests, then reload `/login`
to clear in-memory session state. The same screen lists active web sessions through
`GET /api/v1/auth/sessions` and revokes a selected session through the CSRF-protected
`DELETE /api/v1/auth/sessions/{sessionId}`. Revoking the current session reloads
`/login`; revoking another session refreshes the session list. Sign-out on every
device revokes other sessions before the current session because IdentityService no
longer exposes `/auth/logout-all`. Admin provisioning offers Customer and Center
Manager accounts; the latter requires a center ID. New accounts set their password
through the existing email OTP recovery flow.
The Center Manager caregiver form provisions a CAREGIVER account through IdentityService,
then uses its returned user ID to create the ProviderService profile under the manager's
center. The manager enters details once. If profile creation fails after provisioning,
the open form retains the account ID for a profile-only retry so it does not create a
duplicate account. This frontend orchestration is not atomic across services.

## Key decisions

### React Router Framework Mode as an SPA

`react-router.config.ts` sets `ssr: false`. Framework Mode remains valuable for
typed route modules, route discovery, code splitting, metadata, and loader/action
orchestration. SSR is not needed for the authenticated MVP, and a single
backend avoids splitting authorization and operational ownership across two
servers.

The SPA build is `build/client/`. Every static host must fall back unknown document
requests to `index.html`; `nginx.conf` contains this rule. `/api` must be routed to
the backend by the deployment ingress/reverse proxy. Vite supplies the equivalent proxy
in local development.

### Feature-oriented source tree (Multi-Role Architecture)

CareConnect serves multiple user roles with distinct business capabilities:

- **Customer**: Search caregivers, view profiles & reviews, create patient profiles, book care sessions, track booking status, view care reports, rate caregivers.
- **Center Manager**: Manage center caregivers, configure services & pricing, handle bookings & assignments, process first-level complaints, view center statistics.
- **Admin**: Onboard/manage care centers, manage customers, configure global service catalog, set platform policies (deposits, refunds, commissions), handle escalated complaints, view system-wide statistics, audit caregiver credentials.
- **Caregiver**: View assigned schedules, accept care sessions, update task status, submit care reports, view history (primarily via mobile app; limited web presence).

To keep the codebase maintainable as the number of screens grows, routes and features are grouped by role/portal, while cross-role domain logic is shared through `entities/`:

```text
app/
  root.tsx                 document shell and error boundary
  routes.ts                route manifest defining nested layouts per role
  routes/                  thin route modules grouped by role/portal
    auth/                  login, sso-callback, forbidden
    customer/              customer portal routes (layout, dashboard, caregivers, bookings...)
    caregiver/             limited caregiver web portal (layout, dashboard)
    center-manager/        center manager portal routes (layout, caregivers, services, bookings...)
    admin/                 admin portal routes (layout, centers, customers, services, policies...)
  providers/               root-only framework providers
  features/                business capabilities grouped by role/portal
    customer/              customer features (layout, search-caregivers, bookings, care-reports...)
    caregiver/             caregiver layout, visits, schedule, shifts, profile
    center-manager/        center manager features (layout, caregiver-management, booking-management...)
    admin/                 admin features (layout, center-management, service-catalog, policies...)
    shared/                cross-role features (auth, profile-settings, notifications)
  entities/                domain presentation logic and models shared across roles
    caregiver/             CaregiverCard, CaregiverStatusBadge, caregiver domain types
    booking/               BookingStatusBadge, BookingTimeline, booking domain types
    care-report/           CareReportCard, care-report domain types
    patient/               PatientCard, patient domain types
    service/               ServiceCard, ServicePriceBadge, service domain types
    center/                CenterCard, CenterStatusBadge, center domain types
    user/                  UserAvatar, UserRoleBadge, user domain types
  shared/
    api/
      generated/
        api/<tag>/         fetch functions and TanStack Query hooks
        contracts/<tag>/   request/response/domain types
        mocks/<tag>/       Faker factories and MSW handlers
      query-client.ts       TanStack Query defaults
    config/                 validated public runtime/build configuration
    i18n/                   typed vi/en resources and language lifecycle
    lib/                    framework-neutral utilities
    ui/                     reusable presentation primitives (Button, Modal, Input, Table...)
test/                       global test setup
openapi/                    committed API contract snapshot
```

Folders are created when they gain a real member; empty taxonomy is not architecture.

Dependency rules are directional:

```text
routes -> features -> entities -> shared
providers --------------------------> shared
```

A lower layer cannot import a higher layer:

- A route module only renders its corresponding feature and configures loaders/meta.
- Features within one role do not import features from another role.
- Cross-role presentation or domain concepts MUST live in `entities/` (e.g. both Customer and Center Manager can import `BookingStatusBadge` from `entities/booking/`).
- Generic UI primitives and infrastructure live in `shared/ui/` and `shared/api/`.

### Role layouts and access control (RBAC)

1. **Dedicated Role Layouts**: Each role has its own layout shell (e.g., `features/customer/layout/customer-layout.tsx` for Customer, `features/admin/layout/admin-layout.tsx` for Admin). This ensures navigation items, headers, and quick actions are role-tailored without complex conditional logic in a single monolith layout.
2. **Layout-Level Route Guards**: Access control checks (e.g. verifying role permissions) run at the parent layout route module in `routes/<role>/layout.tsx`. Unauthorized users are intercepted before child route screens mount.

The Center Manager shell uses a fixed sidebar on desktop and a dismissible drawer
on smaller screens, matching the Admin portal's navigation pattern. Its topbar
shows the language switch and account menu without breadcrumbs. Navigation closes
on selection or Escape; the role guard remains at the parent route.

The Caregiver portal (redesigned 2026-11-03, mobile first) uses its own role guarded shell: a collapsible sidebar from
1024 px, a four-tab bottom bar on phones, a compact topbar with its own notification bell (bottom sheet on phones) and
account menu (profile, security, language, sign-out). Its theme is scoped by `.theme-caregiver`
(`features/caregiver/layout/caregiver-theme.css`, same brand values as `.theme-customer`, `cg-*` motion), shared caregiver
UI lives in `features/caregiver/ui` and shared queries in `features/caregiver/data`; only screens backed by the API exist
(D25). `/caregiver` opens `/caregiver/today` (login lands there too): the next visit with a countdown, directions and
call, today's timeline, items that need action (visits to accept, sign-ups closing within a day, missing or expiring
certificates, booking requests; on a day without visits, two or three open shifts) and the week's counts.
`/caregiver/visits` has Needs your answer / Upcoming / In progress / Done / Cancelled tabs (`?tab=`; "Needs your answer"
lists bookings families sent straight to the caregiver and visits the center assigned, each under its source, and one
sidebar badge counts both; `?tab=toAccept` still opens it; since 2026-11-05 a request card shows the person cared for
(name, age, gender, allergy), who booked, the work shift of a SHIFT booking (the caregiver's schedule from
`/caregivers/me/schedules` → `GET /work-shifts/{id}` for its type), each visit with its service and price, the booking value and
"View details" → `/caregiver/requests/:id` (`GET /bookings/caregiver-requests/{id}`): schedule facts, every visit, the health
summary BookingService releases before payment (mobility, conditions, allergies, care needs, diet, behaviour, number of
medicines — no street address, phones or medicine names), the customer, price lines and the answer; a 404 means the request
no longer waits;
history tabs read one period, `?range=week|month|custom&from&to`) grouped by day; BookingService takes one status per
request and at most 100 rows, so status groups are filtered on loaded pages with "load more". `/caregiver/visits/:id`
runs the visit — accept, check-in, tasks, no-show report and check-out — with an allergy callout, the care profile and a
sticky action bar on phones, plus the booking (who booked, type, work shift, this visit's price, services with their plan)
and links to the caregiver's other visits of the same booking (`customerName`, `bookingVisits` on the visit detail); check-in follows the booking's window (Q12, default 30 minutes either side, D22). The care
report states its 24-hour deadline (D27). `/caregiver/visits/bookings/:bookingId` (redesigned 2026-11-10) reads every
visit of the booking (pages of 100 collected) and shows them by day — each day names its services and offers "accept the
day" and "withdraw the day" — or as a month calendar (`?view=calendar`) with one summary chip per day; "accept all"
sends `POST /booking-occurrences/acknowledgements` (one booking, all or nothing) and a day with several visits can only
be withdrawn whole (BookingService 409 `5265`), also from the visit page. Missed visits carry their absence record's
state, and the visits tab gathers pending absences per booking. Pages outside the four sections (wallet, earnings,
notifications) select no rail item. `/caregiver/schedule`, `/caregiver/work-shifts` and `/caregiver/time-off` are
the three tabs of one Work schedule page: a week/month calendar (phones: day strip and agenda) layering availability
slots (D11; ProviderService has no date filter, so up to five pages of 100 are read), assigned visits and time off,
where an open future slot is cancelled with a reason and its version; shift sign-up as a card grid whose "Open shifts" chip lists only shifts still open that the caregiver has not signed up for (each registration carries its shift's date, hours, type and the availability slot created on approval, so approved sign-ups can be withdrawn with a reason through the slot), a confirmation dialog warning about same-day overlaps and time off, with each shift's state on its card
(registrations carry only the shift ID, so the shift is read through `GET /work-shifts/{id}`); and time off with
dd/mm/yyyy dates in Vietnam time and a warning when it overlaps assigned visits or open slots. `/caregiver/profile` has
Information / Certificates / Security tabs (`?tab=`): only the phone is editable (`PUT /users/me`) because
`PUT /caregivers/{id}` is for managers; certificates are added with optional number and dates and up to five photos / PDFs (front and back) picked from a folder
through the system file dialog ("Choose from a folder", "+" tile) or dragged in, show review and expiry
states, are edited in a one-column dialog (`certificate-edit-form.tsx`, `PUT /certificates/{id}` with the version; a
certificate past PENDING warns and asks again because saving sends it back to the center; photos stay in the files
drawer) and can be deleted only while PENDING or REJECTED (ProviderService 409 `4253` otherwise); security changes the password and names devices from their User-Agent. `/caregiver/security`
redirects there; `/account/security` stays the shared screen of the other roles. The Center Manager
`/center-manager/schedules` page is the center's work calendar (see below). Pages compare dates
against a "now" from `useNow` because `react-hooks/purity` forbids `Date.now()` during render.

### Design system tokens and shared UI primitives

`app/app.css` defines the unified "Warm Botanical Clinical" design system tokens in
Tailwind v4 `@theme` (`--color-primary`, `--color-surface*`, `--color-on-surface*`,
`--color-outline*`, `--color-success*`, `--color-warning*`, `--color-error*`,
`--color-info*`, `--color-neutral*`, and `--font-sans` set to `Plus Jakarta Sans`; icons use Material
Symbols). Features and entities consume these semantic tokens instead of hardcoded hex colors or ad-hoc palette
classes.

`app/shared/ui/` owns framework-and-domain-neutral UI primitives with `≥ 44px` touch
targets and keyboard focus rings:

- `button.tsx` (`Button`, `IconButton`): `primary`, `secondary`, `ghost`, and `danger` variants with loading and icon states.
- `status-badge.tsx` (`StatusBadge`): semantic `success`, `warning`, `error`, `info`, and `neutral` pills with optional status dot.
- `form-field.tsx` (`FormField`, `TextInput`, `SelectInput`, `TextareaInput`): accessible label, helper text, error message, and `aria-invalid`/`aria-describedby` wiring.
- `modal.tsx` (`Modal`, `ConfirmDialog`): native `<dialog>` modal and accessible confirmation dialog replacing browser `window.confirm`.
- `toaster.tsx`, `app-toast.ts`, `use-action-toast.ts`: the sonner toasts of every portal (token colors; bottom-right
  by default, mounted once per portal layout — the caregiver `CaregiverToaster` passes bottom-centre and its tab-bar
  offsets). Features call `toastSuccess` / `toastInfo` / `toastWarning` / `toastError` / `toastSystemError` instead of
  importing sonner. A mutation's success is a toast; a system failure (5xx, network) is a toast with a
  retry that keeps the form and its input; validation errors stay under the field and business errors at the end of
  the form (`FormAlert`). `toastSystemError` returns `false` for non-system errors so the caller renders them inline.
- `dashboard-section.tsx` (`DashboardSection`): a titled band of the admin dashboard and the manager statistics page.
- `pagination.tsx` (`Pagination`): accessible pagination bar with `tabular-nums`.
- `state-panels.tsx` (`SkeletonBlock`, `TableSkeleton`, `CardGridSkeleton`, `EmptyState`, `ErrorState`, `ForbiddenState`, `OfflineBanner`): unified loading, empty, error, 403, and offline states.
- `section-card.tsx`, `language-switch.tsx`, `site-footer.tsx`, `icon.tsx`: generic layout cards, VI/EN language switcher, footer, and Material Symbols icon wrapper.
- Added by the customer redesign (2026-11-03): `page-header.tsx` (`PageHeader`, `pageContainer`), `tabs.tsx` (sliding
  indicator, badges, roving focus; also used by the caregiver portal), `action-menu.tsx` ("⋯" menu), `stepper.tsx`
  (steps with an optional deadline note), `choice-card.tsx`, `date-picker.tsx` and `time-select.tsx` (see pickers below),
  `drawer.tsx`, `segmented-control.tsx`, `rating.tsx`, `skeleton.tsx`, `copy-button.tsx`, `search-input.tsx`
  (debounced), `filter-chips.tsx`, `filter-menu-chip.tsx`, `image-viewer.tsx` (`ImageViewer`, `ViewableImage`: zoom
  with buttons, wheel or + / − / 0, drag to pan, gallery arrows) and `file-drop-zone.tsx` (click or drop to pick files,
  previews that open in the viewer). `Avatar` takes `viewable` so a real photo opens the viewer; `Modal` takes
  `dismissOnBackdrop={false}` for forms and bounds its height to the screen. `shared/lib/format.ts` (`useFormat`) gives
  money "100.000 ₫", dates dd/mm/yyyy and 24-hour times in both languages; `use-clock.ts` and `fold-text.ts` support
  countdowns and diacritic-insensitive search. Also in `shared/lib`: `csv.ts` (`csvCell`, `downloadCsv`),
  `clipboard.ts` (`copyText`, resolves false instead of rejecting), `use-stored-flag.ts` (a '1' / '0' `localStorage`
  preference such as a collapsed sidebar) and `use-escape-key.ts`.

- Pickers and dropdowns (redesigned 2026-11-05). `use-anchored-popover.ts` places a panel next to its field in the
  browser top layer (`popover="manual"` + `showPopover()`), so dialogs and `overflow` containers never clip it; it opens
  below, flips above when there is more room there, stays inside the viewport, follows scroll/resize and closes on a
  press outside. `date-picker.tsx` (`DatePicker`) keeps the typed dd/mm/yyyy input (never auto-corrected; an unreadable
  value gets a note) and opens `calendar-panel.tsx` from the icon or a click in the input: today and the chosen day
  marked, min/max days disabled with their tooltip, a "Today" shortcut, month → year jump from the title, and grid
  keys (arrows, Home/End, PageUp/PageDown, Shift+PageUp/PageDown for a year, Enter, Esc). `time-select.tsx`
  (`TimeSelect`, same `value`/`onChange`/`step` contract, 24 h) is a select-only combobox whose listbox shows one hour
  per row grouped night / morning / afternoon / evening, opens scrolled to the value, takes `min`/`max`/`isTimeDisabled`
  to mark times that cannot be picked, and moves with ←/→ (one step), ↑/↓ (one hour), PageUp/PageDown, Home/End.
  `Select` and every raw `<select>` stay native and are styled in `app.css` with the CSS customizable select
  (`appearance: base-select`, `::picker(select)`): a rounded raised panel, 44 px options, hover/focus fills, a check mark
  on the chosen option and a bounded scrolling height, positioned and flipped by the browser. Native was chosen over a
  custom listbox so the ~50 feature selects, keyboard type-ahead, forms and Testing Library `change` events keep working
  untouched; browsers without support keep the styled native control. Tests pick a time with `shared/test/pickers.ts`
  (`pickTime`) and type dates as dd/mm/yyyy.
- `combobox.tsx` (`Combobox`, 2026-11-06): a searchable select-only combobox for long lists, built like `TimeSelect`
  on `use-anchored-popover.ts`; its panel starts with a search box (case and diacritics ignored, every word must match),
  options carry an optional tag, ↑/↓/PageUp/PageDown/Enter/Esc work from the search box, and a value missing from the
  options is still shown. Tests pick with `pickOption` from `shared/test/pickers.ts`.
- Addresses (2026-11-06): every address form (booking address change, the person's address book and profile address,
  quick profile creation in the booking form, admin center create / edit) uses `entities/address/address-fields.tsx`:
  province / city → ward / commune of that province → street, in the two-level units in force since 01/07/2025 (34
  provinces, 3,321 wards, no district). The list is `vn-admin-units.constants.ts`, generated by
  `scripts/generate-vn-admin-units.mjs` from provinces.open-api.vn and loaded on demand (`useAdminUnits`).
  `admin-units.ts` matches stored names (short, informal and the provinces merged in 2025), reports missing or outdated
  parts (`addressIssues`; a pre-2025 province or ward must be chosen again) and writes official names; a saved address
  drops its old district. Centers keep one address text, split back with `splitAddressText` and joined with `joinAddress`.

Domain-specific status mapping lives in `app/entities/` (`booking/booking-status-badge.tsx`
and `provider/provider-status-badge.tsx`), mapping backend booking, occurrence, center,
caregiver, verification, and shift statuses onto `StatusBadge` tones.

The Center Manager caregiver list and detail routes read ProviderService through the
gateway. Identity `/users/me` supplies the assigned `centerId`; the manager UI does
not issue center-scoped requests without it. The list uses backend pagination and
filters; detail, edits, archive, and certificate management use backend versions for
concurrency control. The UI checks the returned `centerId` before showing management
controls, and ProviderService enforces ownership and authorization. Admins review
caregivers and certificates from `/admin/centers/:id/caregivers`. Provider operations
use cookie credentials and fetch a fresh Identity CSRF token before mutations.
The manager caregiver detail assigns the caregiver's services (`PUT /caregivers/{id}/services`, PRV-01) from the
center's active offerings (`features/center-manager/caregivers/components/caregiver-services-editor.tsx`); booking
accepts only a caregiver who covers every chosen service, so a caregiver without services is flagged as unbookable.
Time off is managed through `entities/provider/caregiver-time-offs.tsx` (2026-11-06): `TimeOffDialog` (centred
two-column popup, caregiver picker unless one is fixed, dates and times in Vietnam time, notes under the inputs, 409 =
overlaps another time off), `RemoveTimeOffDialog`, and the `CaregiverTimeOffs` panel of the manager caregiver detail;
every change invalidates `providerKeys.allTimeOffs`. The caregiver detail (redesigned 2026-11-06) is a `PageHeader` with
breadcrumb, a profile card with the facts, then upcoming shifts of the next 14 days (`GET /care-centers/{id}/schedules`
with `caregiverId` / dates / status) linking to the work calendar, time off, missed visits (2026-11-10:
`components/caregiver-absence-history.tsx` — counts from `GET /caregiver-absences/statistics?caregiverId=` and the latest
five records, with a link to the bookings queue while any is pending), services and certificates; the profile edit
is a popup. The caregiver list shows four numbers (team, awaiting verification — click filters, working today, on
leave now), one filter row and a "Today" column (shift hours or "On leave") from one schedule read and one time-off read
for the whole center.

`/center-manager/schedules` ("Work schedule & time off", 2026-11-06, `features/center-manager/work-calendar`) shows one
week at a time (`?week=` Monday, `?caregiver=`, `?view=team|list|timeOff`, `?scope=` of the time-off tab): four numbers
(shifts and hours, people with shifts, on leave today, shifts that fall in time off), a team × day grid (shift chips link
to `/center-manager/work-shifts/:id`, dashed amber time off clipped to each day, red = shift during time off, struck =
cancelled), a shift list, and the center's time off (`GET /care-centers/{id}/time-offs`, ProviderService 2026-11-06)
with add / delete. Shifts are still created and approved in "Work shifts".

`/center-manager/work-shifts` (reworked 2026-11-05, `docs/2026-11-05-WORK_SHIFT_FLOW_PROGRESS.md`) shows four numbers for
the whole filter from `GET /work-shifts/statistics` (next 7 days; understaffed shifts of the next 7 days with the
places still missing — a click filters next 7 days + `hasVacancy`; sign-ups to review — a click filters `hasPending`;
fill rate), then one compact filter card: status chips with counts and a single toolbar row (date range and type as
dropdown chips, custom dates inline only when picked, "places left" and "to review" toggles, clear, total and the list /
week switch), all in URL search parameters and sent to ProviderService, and a list or week calendar
(`?view=week&week=`). The form also sets `maxBookings` (bookings one caregiver takes in the shift, 1–20, default 2). Statuses are the effective ones the backend returns (a past shift is never "open"); types go
through `entities/provider/work-shift.ts` (unknown legacy codes read "Other"). Create / edit / duplicate is a two-column
dialog (form + live summary with same-day overlap warnings), with the status chosen by the button (save draft / open
sign-up), an optional repeat over a date range and weekdays (`POST /work-shifts/centers/{id}/batch`, all or nothing) and a
confirmation before discarding unsaved changes. `?shift=<id>` or `/center-manager/work-shifts/:id` opens the detail dialog:
info, open / close sign-up (`PATCH /work-shifts/{id}/status`), cancel with a required reason (`POST /work-shifts/{id}/cancel`,
cascades to sign-ups and availability), a history built from the shift and its sign-ups, and sign-ups by state with
single or bulk approve / reject (`PATCH /work-shifts/{id}/registrations/review`). Results are sonner toasts (the center
manager layout mounts the shared `Toaster`). No Provider mutation runs from sample fixtures.

`/center-manager/schedules` reads the assigned center's ProviderService schedules and time off (see the work calendar
above); caregivers still cancel their own availability slots. Customer
`/customer/caregivers` reads the ProviderService
catalog; its detail route resolves a caregiver by Identity user ID and lists only
verified certificates. Shared `entities/provider` code owns gateway request wrappers,
schedule workflows, and owner scoped media upload/list/delete for centers, caregiver
profiles, and certificates. `provider-media-panel.tsx` picks files through `FileDropZone` (click anywhere in the zone
or drop files; each image previews before upload) and opens uploaded images in the viewer; certificate images on the
customer caregiver page and the center manager caregiver page, and caregiver and center photos, open there too. Multipart Faker factories are generated with a Blob
override in `orval.config.ts` so the generated test data matches the browser file
contract.

`/center-manager/services` manages the signed-in Center Manager's offerings and
price plans through `entities/care-catalog`. The route takes its center ID only
from `/users/me`, reads that center's offerings, and uses active master catalog
items for new offerings. Offering and price plan forms send only contract fields;
mutations use Identity CSRF headers and invalidate the related TanStack Query
cache. Since CAT-03 (2026-11-03) the new-service dialog (two columns: service details, then plan cards) creates the
offering and its plans in one `POST /center-services` with `pricePlans`; durations are typed in hours and sent as minutes —
an hourly plan is fixed at 1 hour, a daily plan asks for the working hours of the day and a shift plan for the shift
length (decimals such as 4,5 allowed, at most 24 hours), each with suggested values and what the unit means for billing; each plan has a 0–90 % discount with a
live "customer pays" preview. The plan table shows list price, discount and customer price, and "edit several plans"
edits them inline (select several to apply one discount or pause/offer them) and saves through the all-or-nothing
`PUT /price-plans/batch`. Plans and services are deleted (soft delete) behind a confirmation; a service with an
active plan explains that it must be paused or emptied first, matching CareCatalogService's 409 `3206`. Customer screens price, sort and filter by `finalPrice` (`entities/care-catalog/price-plan-price.ts`)
and show the struck-through list price with a discount badge (`plan-discount.tsx`). The backend enforces center ownership and pricing permissions. Admin's
center pricing view remains read-only.

The Center Manager booking list `/center-manager/bookings` and detail `/center-manager/bookings/:id` read
BookingService for the manager's center (list filters in URL search parameters). The detail accepts, rejects,
cancels and reassigns through `entities/booking`; the caregiver picker marks who is free for every upcoming visit
using ProviderService `/caregivers/search` with the booking's services and visit slots (M-16, Đợt 5), and the
backend checks again on save. No-show reports are decided per visit. Since 2026-11-06 the detail uses `PageHeader`
(breadcrumb, status, caregiver and deadline in the meta line, actions as buttons), each visit row names its service and
opens `ManagerVisitDetailDialog` (planned / actual / check-in window, service with plan, unit price, units and the visit
price, address and note, caregiver and acceptance, the care session with its tasks — `GET /care-sessions/{id}` — and the
submitted report), and the side column prices every service as unit price × units with the plan, the subtotal, initial
payment, remaining balance with its due time, refund and a payment state badge; caregiver change requests are
translated. The list uses `PageHeader`, stat-style queue cards, one filter card (status chips with counts, code search,
care date range, sort chip, total) and rows with the caregiver's name and a visit progress bar.
Since 2026-11-05 (`BE/docs/2026-11-05-CENTER_QUEUE_EXPIRY_NOTIFICATIONS.md`) the list is a work queue: four queue
cards from `GET /bookings/status-counts` (count, nearest deadline, due soon / past due), group tabs (to handle, waiting on
others, active, closed, all → `statuses=`), a toolbar (code, `DatePicker` range, sort `deadlineAt,asc` by default for the
waiting groups) and rows with a deadline countdown (`entities/booking/booking-deadline-chip.tsx`) and the center's answer
on the row (`ManagerBookingActionDialog`, shared with the detail page). List, counts and waiting bookings refresh every
30 seconds. A booking past its deadline that BookingService has not closed yet shows "closing" and no actions on both
the manager and customer screens (`isPastDeadline`); BookingService itself closes it when someone acts (409 `5116`).
The customer's expired booking names the reason (`expiredReason`) and offers "book the same again" and another center.
Notifications: every portal has `/<portal>/notifications` (`features/shared/notifications`: all / unread, by day,
a selection bar that marks read / unread or deletes the selected ones via `PATCH /notifications/read-state` and
`POST /notifications/deletions`, delete read ones; opening a notification always marks it read); the bells open a notification's page through
`entities/notification/notification-target.ts` (BookingService adds `bookingId` / `occurrenceId` to each notification),
delete single items and link to the full list. The SSE stream also refreshes booking queries.

The Admin shell is a left sidebar plus a topbar. `admin-navigation.constants.ts` groups the
menu into Overview, Operations, Finance, Customers and System; every item opens a live screen (Đợt 5). Since
2026-11-10 the Customers section has one "Accounts" item (the former "Customers" item opened the same Identity list;
`/admin/customers` still redirects to it filtered to CUSTOMER) and the account menu has "Profile" →
`/admin/profile` (personal information, `?tab=security` = password change and signed-in devices, inside the admin
shell; the panels live in `features/shared/profile`, shared with the customer account area). Revenue and
quality previews keep their routes but are left out of the menu until a backend exists (D26). `/admin/policies` is
live since booking spec v1.0 (2026-11-02): the admin picks an active center and edits its booking policy.
Each labelled group is a parent section (2026-11-09, after the EXE admin sidebar; `NavRailGroup` `icon` + `collapsible`,
`shared/ui/nav-rail-group.tsx`): a bold heading with its icon opens and closes its indented items, the choice is kept in
`localStorage` (`careconnect.admin.navOpenGroups`, open by default) and navigating into a closed section opens it; on
the collapsed rail a section is one icon whose items open in a flyout beside the rail (hover, click or ↓, Esc closes);
the icon is the section's own until one of its pages is open, then that page's icon on a round mint badge. The phone
drawer keeps the headings. Manager and caregiver rails do not use it.
At `lg` and wider the sidebar is fixed and scrolls on its own. On smaller screens the same
navigation opens as a drawer from the topbar toggle and closes on Escape, the backdrop or
navigation. The topbar holds the language switch, notifications and the account menu;
Admin pages do not render breadcrumbs.
The Admin portal has its own `/admin` layout, VI/EN menu resources, and child
routes `/admin/dashboard`, `/admin/revenue`, `/admin/customers`,
`/admin/customers/:id`, `/admin/services`, `/admin/centers`,
`/admin/centers/:id/caregivers`, `/admin/bookings`, `/admin/bookings/:id`, `/admin/caregivers`,
`/admin/incidents`, `/admin/policies`, `/admin/quality`, and `/admin/reviews-complaints`;
`/admin` redirects to its dashboard. `/admin/bookings` lists every booking (backend paginated, status and keyword in
URL search parameters); its detail cancels on behalf of the platform (M-11: full refund like a center cancel).
`/admin/caregivers` is the platform-wide caregiver verification queue. `/admin/incidents` lists BookingService and
ProviderService outbox events that ran out of retries and requeues them or marks them handled by hand (H-08).
`/admin/reviews-complaints` is the live escalated-complaint queue (`entities/aftercare`, H-05).
It does not import feature internals from the other roles. Both pages use distinct,
dated September 2026 design snapshots because the supplied KPI totals describe
different examples. They are not combined into a platform ledger or presented as
live data. The dashboard shows only the live operational panels; its former sample charts were removed (A-15). The revenue list owns its
sample transactions and URL-based search, filters, pagination, and selected-row
preview; CSV export includes the filtered sample rows. Bank reconciliation,
payout approval, invoices, live gateway status, refresh, and unimplemented Admin
menu destinations await backend contracts. The Admin parent layout checks the
Identity ADMIN role; each backend operation enforces its own authorization.
`/admin/customers` and `/admin/customers/:id` redirect to the Identity account list filtered to CUSTOMER and to
the account detail; the former illustrative customer snapshot was removed (M-13).
`/admin/services` reads and manages the CareCatalogService standard catalog through
`entities/care-catalog`, which owns the gateway wrappers and query keys. The catalog
endpoint returns every non-deleted item, so keyword, category, status and page live in
URL search parameters and filter the cached list client-side. Create and edit send only
the `CatalogItemRequest` fields (name, category, optional description, optional `imageUrl`, status). The cover image is
uploaded from the device (button or drop on the card preview, JPG / PNG / WebP up to 5 MB, checked in the browser first)
through `POST /catalog-items/images`, which stores it in MediaService and returns the permanent
`/api/v1/catalog-items/images/{mediaFileId}` URL; that public GET redirects to a short-lived R2 link, so `imageUrl` works
directly in `<img>` everywhere. A pasted link or a suggested photo is still accepted. The
category dropdown merges `service-category.constants.ts` (stable stored values with
translated labels) with categories already in the database, removing case-insensitive
duplicates; its final option reveals a free-text input, and an edited item whose category
matches no option opens in that input unchanged. Missing
or too-long values and backend codes 3101–3103 appear under their field with
`aria-invalid`/`aria-describedby`, and each failed submit focuses and scrolls to the first
invalid control. Only failures without a field (permission, not found, server errors)
keep a dialog-level alert. Delete is the backend soft delete. The prices-by-center tab
picks a ProviderService center and shows its center offerings and price plans read-only,
paginated client-side, because the backend lets only CENTER_MANAGER create or change
offerings and price plans. Surcharges, booking distribution and pricing policy remain
labeled design samples. `/admin/centers` lists
ProviderService centers by status tab (platform counts from `/care-centers/statistics`) with a server keyword search;
`?center=<id>` links from before redirect to `/admin/centers/:id`. The center page (2026-10-30) has Overview, Staff,
Activity and Images tabs. Overview reviews a PENDING center from a checklist (contact, hours, manager, images) with
Approve / Reject buttons, and gives an operating center Suspend / Set inactive / Reopen buttons; REJECTED, SUSPENDED and
INACTIVE need a reason. Its Manager section creates a CENTER_MANAGER account for this center (`POST /users`), links it
with the center PUT and emails a password code, or picks one of the center's active manager accounts; changing the
manager offers to lock the previous account because ProviderService does not revoke its Identity access. Staff counts
and lists caregivers with a work status taken from the Identity account and the ProviderService profile, never from
check-in. Activity reads `/statistics/centers?centerId=`. Operating hours stay `HH:mm - HH:mm`; a closing time before the
opening time means overnight and equal times mean 24 hours. Archived centers list under the Archived tab and open
read-only (Overview, Bookings, Activity); their status panel restores them as INACTIVE with a reason
(`POST /care-centers/{id}/restore`, D31), dropping a manager that now runs another center. Caregivers and certificates are reviewed at `/admin/centers/:id/caregivers`; each rejection asks its own
reason. `/admin/accounts` filters, searches and pages on the server (`GET /users` role, status, keyword) with counts from
`GET /users/statistics`; creating an account continues into `entities/identity/password-reset-panel.tsx`, which sends
the owner an email OTP (`/auth/forgot-password`) and lets the owner finish on `/forgot-password?email=` or the
administrator type the code the owner reads out (`/auth/reset-password`). Account details show the center and the lock
reason, lock with a required reason, and do not assign CENTER_MANAGER or CAREGIVER (they come from the center and the
caregiver flows). `/admin/roles` explains each system role and permission. Service categories are the six groups of
`entities/care-catalog/service-category.ts`; older long values read into their group without a data migration.
Profile photos and center logos use the newest image (`entities/provider/provider-avatar.ts`); uploads refresh every
cache that shows the owner (`invalidate-provider-media.ts`) and a caregiver keeps a single profile photo.
The caregiver quality page uses an independent, dated Admin design snapshot. Quality list filters and tabs
use URL search parameters, and a selected caregiver opens a read-only sample
profile. Sample OCR, license, legal, clinical, payment and risk data are not
live verification results. Caregiver approval/rejection, license checking and clinical calls await backend
contracts and authorization.

Center booking policies (spec §8) are edited by one form, `entities/booking/center-booking-policy-form.tsx`, used by
`/center-manager/policy` (the manager's own center, from the session) and `/admin/policies` (any active center). It
reads and writes `GET / PUT /center-booking-policies/{centerId}`, shows durations in hours and stores whole minutes,
checks every field and BookingService's consistency rules on the client, warns (without blocking) when the
confirmation, assignment and payment deadlines do not fit the minimum notice, and sends the `version` it read (null
for a center still on the platform defaults) so a concurrent save answers 409.

### Feature-internal organization

Each feature is self-contained. When a feature screen grows beyond a comfortable size, split it into focused files inside that feature folder:

```text
features/
  <role>/
    <feature>/
      <feature>-page.tsx              page component (~100 lines, composes children)
      components/                     feature-private child components
        <child-component>.tsx
      hooks/                          feature-private hooks
        use-<feature>-filters.ts
      __tests__/
        <feature>-page.test.tsx
```

Child components and hooks inside `components/` and `hooks/` are private to the
feature. Do not import them from other features. When a genuine second consumer
appears, promote the module to `entities/` (domain concept) or `shared/ui/`
(generic primitive).

#### Naming conventions

All file names use `kebab-case`. Exported symbols use their idiomatic JavaScript
casing (PascalCase for components, camelCase for hooks and functions).

| File type       | File name pattern            | Export pattern     | Example                                             |
| --------------- | ---------------------------- | ------------------ | --------------------------------------------------- |
| Page/screen     | `<feature>-page.tsx`         | `<Feature>Page`    | `caregiver-search-page.tsx` → `CaregiverSearchPage` |
| Child component | `<description>.tsx`          | `<Description>`    | `caregiver-card.tsx` → `CaregiverCard`              |
| Hook            | `use-<description>.ts`       | `use<Description>` | `use-booking-filters.ts` → `useBookingFilters`      |
| Utility         | `<description>.ts`           | named exports      | `format-currency.ts` → `formatCurrency`             |
| Type-only       | `<description>.types.ts`     | named exports      | `booking.types.ts`                                  |
| Constants       | `<description>.constants.ts` | named exports      | `booking.constants.ts`                              |
| Test            | `<source-file>.test.tsx`     | —                  | `caregiver-card.test.tsx`                           |

#### File size guideline

These are soft guidelines, not hard rules. Tailwind class names make JSX wider than
CSS-module equivalents, so the threshold is slightly generous.

| Lines   | Action                                                                  |
| ------- | ----------------------------------------------------------------------- |
| ≤ 150   | Ideal. Keep as-is.                                                      |
| 150–300 | Review: split if the file has two or more distinct responsibilities.    |
| > 300   | Split. A file this long almost certainly handles more than one concern. |

#### Splitting triggers

Beyond line count, split a component when any of these apply:

- The component owns two or more independent UI sections (table + filters + drawer).
- It accumulates more than four or five pieces of local state (`useState`,
  `useReducer`); extract a custom hook.
- A rendered list item has non-trivial logic of its own; extract an item component.
- The same markup or logic appears in two features; promote to `entities/` or
  `shared/ui/`.

### State ownership

- URL state: route params and search params.
- Remote state: TanStack Query keys, cache, mutations, invalidation, and retries.
- Form state: local to the feature/form until a chosen form library is justified.
- Ephemeral UI state: local component state; context only for a genuine subtree-wide
  concern.
- Auth and permissions: backend-authoritative; the client may derive display helpers
  from a returned session/permission model but cannot grant access.

Avoid copying query results into local state and avoid request calls in `useEffect`.
Use a route loader only when navigation itself needs the data or must redirect; use
`queryClient.ensureQueryData` with generated query options when loader prefetch is
introduced so Router and Query do not become competing caches.

### Contract-first client generation

`openapi/openapi.yaml` is a versioned snapshot consumed by `orval.config.ts`.
It contains the reviewed IdentityService operations currently consumed by the web
client; the backend OpenAPI export is authoritative for subsequent additions.

The snapshot also covers CareCatalogService (`CatalogItem`, `CenterOffering`,
`PricePlan` tags) and CareRecipientService (`CareRecipient` tag) through the gateway.
Their live Swagger declares one generic `ApiResponse` whose `result` points to a
single DTO, so the snapshot types each operation's envelope from the backend
controller return types (`*Record` payloads, `*Response`/`*ListResponse`/
`*PageResponse` envelopes, `EmptyActionResponse` for `Void`). Backend path aliases
(`/v1/care-services`, `/v1/price-plans/center-service/{id}`) are omitted in favor of
`/v1/catalog-items` and `/v1/price-plans/center-offering/{id}`. Mutations still need
the Identity CSRF header and `X-Client-Type: web` like ProviderService calls; the
backend enforces ADMIN, CENTER_MANAGER, CUSTOMER, and CAREGIVER access per operation.
Catalog items and center offerings now return paginated envelopes. Their entity
wrappers collect pages of up to 100 so existing service screens can still filter the
complete collection locally.

```text
openapi/openapi.yaml
  -> pnpm api:validate
      -> enforce one declared tag per operation, unique operationId,
         *Request request bodies, and *Response success bodies
  -> pnpm api:generate
      -> app/shared/api/generated/api/<tag>
      -> app/shared/api/generated/contracts/<tag>
      -> app/shared/api/generated/mocks/<tag>/*.faker.ts
      -> app/shared/api/generated/mocks/<tag>/*.msw.ts
```

Orval uses `fetch`, `react-query`, and `tags-split`. `splitByTags` also places
contracts under their owning tag; a contract referenced by multiple tags remains at
the contracts root so it is not duplicated. `tagsSplitDeduplication` extracts shared
transport infrastructure, and generated index files provide deliberate public entry
points. Its base URL reads
`env.API_BASE_URL`, which defaults to `/api`. The built-in fetch generator preserves
typed response data/status and throws for non-success HTTP responses, allowing
TanStack Query to enter its error state. Do not wrap every generated call in a
repository. Add a custom fetch mutator only when authentication, refresh, correlation
IDs, or a normalized API-error contract requires it. The hand-written gateway wrappers
share `shared/api/request.ts`: `readOptions` (cookies), `writeOptions()` (cookies, a fresh
CSRF header and `X-Client-Type: web`) and `serviceResponse('<Service>')`, whose `result` /
`success` throw when the APIResponse `code` is not 200.

Faker is a development dependency and may be used by unit tests, component examples,
or deterministic fixtures. MSW handlers may be used by integration tests or an
explicit local mock mode. Neither is imported by the production app graph.

Mock data does use Orval: Faker generators create typed object factories from schema
constraints/examples, while MSW generators wrap those factories as HTTP handlers.
Use Faker when code needs a typed object without a network boundary; use MSW when the
test must exercise loading/error/cache/request behavior. Override generated defaults
inside the test instead of editing generated mock files.

Tag and contract naming is what creates the folder architecture. Backend Swagger
must declare exactly one stable business tag such as `Caregivers`, `Bookings`, or
`Care Centers` on every operation. Request bodies reference names such as
`CreateBookingRequest`; successful bodies reference wrappers such as `BookingResponse` or
`BookingsPageResponse`. Reusable inner objects use semantic names such as `BookingDto`,
`MoneyDto`, or `BookingStatus`. Orval cannot reliably infer whether an ambiguously
named DTO is a request or response, so `api:validate` rejects ambiguous top-level body
names before generation.

### Localization as a source boundary

`app/shared/i18n/resources.ts` assembles the typed Vietnamese and English UI
resources through explicit imports; it contains composition and the exported
`SupportedLanguage` type, without inline translation copy. Translation modules are
grouped by portal and feature, mirroring the multi-role source organization:

```text
app/shared/i18n/
  i18n.ts                         initialization and language lifecycle
  types.d.ts                      i18next key typing
  resources.ts                    explicit vi/en composition entry point
  common-resources.ts              shared application, language and error copy
  customer/
    layout-resources.ts             Customer navigation and footer
    bookings-resources.ts           booking list copy
    booking-detail-resources.ts     booking detail copy
    care-report-resources.ts        care report copy
    booking-review-resources.ts     review modal copy
    <feature>-resources.ts          other existing Customer feature copy
  caregiver/
    layout-resources.ts             Caregiver navigation, identity and footer
    visits-resources.ts             Caregiver visits copy
```

Each resource module exports both language objects with matching key structures so
Vietnamese and English can be updated together. Portal layouts own portal-specific
shell copy; shared application copy belongs in `common-resources.ts`. Create other
portal directories only when actual translations exist. These modules contain
static data and depend only within the i18n layer; they must not import feature,
entity, route modules or `resources.ts`. The composition entry point imports the
modules directly, keeping dependencies acyclic and the public resource shape
visible. Reorganizing files must preserve the existing `translation` namespace,
translation key paths, content, `SupportedLanguage` and i18next key typing. This
organization uses the existing eager initialization without adding lazy loading or
changing language persistence.

The i18next augmentation in `types.d.ts` uses `(typeof resources)['vi']`, including
the `translation` namespace, to type translation keys and results. Dynamic keys
must use finite resource-key unions. The reserved `count` option is numeric;
`{{count, number}}` uses i18next's Intl formatter for localized display.

i18next is initialized with Vietnamese as the deterministic build/hydration
fallback; after mounting, a stored choice or supported browser language is applied.
The switch updates i18next, `<html lang>`, and browser storage.

Translation keys describe meaning (`bookings.empty.title`), not source text
(`noBookingsFound`). Both languages are changed atomically. UI components own
layout, while resources own sentences; do not split sentences into translated
fragments because grammar and word order differ. API-provided business data is kept
as data. Backend error codes should be mapped to frontend translation keys at the
feature boundary rather than displaying backend English text directly.

ESLint's local `project/no-hardcoded-ui-text` rule covers literal JSX text and common
visible/accessibility attributes. It intentionally does not guess every string in
ordinary TypeScript, so code review still checks alerts, schema validation messages,
table metadata, and third-party component props. `Intl` handles locale-aware dates,
numbers, currencies, percentages, and lists.

Contract update workflow:

1. Export OpenAPI from the backend and review the contract diff.
2. Replace `openapi/openapi.yaml`.
3. Run `pnpm api:generate`.
4. Fix feature code against generated types; never patch generated output.
5. Run `pnpm check` and commit contract plus generated output together.

### Configuration

- Node.js 22.22 or newer (`engines` in `package.json`, `.nvmrc`); React Router 8 tooling warns on older versions.
- `VITE_API_BASE_URL` is public and defaults to `/api`.
- `API_PROXY_TARGET` is read only by the Vite development server and defaults to
  `http://localhost:8080` for the local API gateway. The Vite `/api` proxy preserves
  the full `/api/v1/*` path; all browser API calls reach services through that gateway.
- Vite statically replaces browser environment values during the build. A changed
  production API prefix therefore requires a rebuild unless the deployment keeps the
  stable `/api` ingress contract.
- No token, private key, or service credential belongs in a `VITE_*` variable.
- Payments use the real PaymentService through the gateway (Đợt 1c, 2026-10-30); the former
  `pnpm dev` payment demo and its `PaymentDemo` tag were removed. `entities/payment` wraps
  the generated `Payment`, `Refund` and `RemainingInvoice` clients.
  `/customer/bookings/:id/deposit` (the initial payment, booking spec v1.0 §9.1) opens a VNPay checkout
  (`POST /payments/bookings/{bookingId}/checkout`, provider VNPAY, D16) and leaves the app
  for the returned `checkoutUrl`; the customer picks QR, ATM or card on the VNPay page.
  PaymentService `VNPAY_RETURN_URL` must point to `/customer/payments/vnpay-return`: that
  screen sends the signed query to `GET /payments/vnpay/return`, then opens
  `/customer/payments/:paymentId/success|failure`, which polls `GET /payments/{id}` while it is
  PENDING because the IPN, not the browser return, records the money. The page reads the payment status, not the
  return route: PENDING shows "confirming" (never a success mark), polling stops after 60 seconds with a check-again
  action and a link to the payments list, and a REMAINING payment is named as an invoice, not a deposit.
- The deposit page (`/customer/bookings/:id/deposit`, redesigned 2026-11-05 on `PageHeader` + `pageContainer`) shows on
  the left the person, caregiver, care address, every visit with service, price and its own address, and the price
  lines; on the right the amount paid now with its percent, the payment plan (initial payment now, the rest by
  `remainingPaymentDueAt` — or "paid in full"), the deadline countdown (the button locks once it passed) and VNPay.
- Before paying, the deposit page shows the assigned caregiver (`entities/provider/assigned-caregiver-card.tsx`, public
  caregiver profile) and the refund rules of the center booking policy (`GET /center-booking-policies/{centerId}`:
  refund percent from / under the cut-off and the share kept when the remaining balance is overdue) in
  `entities/payment/refund-policy.tsx`. The cancel dialog reads PaymentService refund-quote rule codes
  (`BEFORE_THRESHOLD`, `AFTER_THRESHOLD`, `FULL_REFUND_*`, `PAYMENT_OVERDUE`…) as words through `refundRuleLabel`;
  codes are never shown.
- BookingService leaves `depositAmount` empty: PaymentService computes the initial payment per visit. `initialPaymentOf`
  shows the booking total times the `initialPaymentPercent` BookingService fixed at creation (the center deposit
  percent, 30 % by default, for every type since 2026-11-05; 100 % when the first visit is closer than the remaining-
  balance cut-off, which only a SHIFT can be) as an estimate, and what remains; the VNPay page shows the exact amount.
- Bookings are paid in full before the first visit: PaymentService opens the remaining-balance
  invoice together with the initial payment. While a CONFIRMED booking has `remainingPaymentDueAt` and no `fullyPaidAt`,
  the booking detail states the amount and due time and opens the invoice checkout directly (the pending invoice of the
  booking is found among the customer's `GET /remaining-invoices?status=PENDING`); a paid booking shows "paid in
  full". The booking form sidebar states when the rest will be due (first visit minus the policy cut-off).
- The booking form reads `GET /payments/me/outstanding` and, while an overdue invoice exists, shows a banner linking to
  `/customer/payments` and disables submit, so the customer learns about the block before filling the form.
- The Customer booking form (booking spec v1.0, 2026-11-02) sends one booking of type SHIFT, RECURRING or CUSTOM. The
  customer picks the center, then services, then a caregiver: every caregiver of the center is listed and one who does
  not provide a chosen service (`/caregivers/search` per service) is locked with "not provided yet: …" (2026-11-05).
  SHIFT requires a caregiver and one of their shifts (`GET /caregivers/{id}/schedules`); a shift is locked once it holds
  its `maxBookings` bookings (`GET /bookings/held-schedules` → `scheduleBookingCounts`). The chosen shift is split into
  time slots per service (plan length for DAY / SHIFT, chosen hours for HOUR), slots of another booking and their
  `travelBufferMinutes` (60) are locked, and the booking sends `slots` with `careServiceId`. With several services every
  RECURRING / CUSTOM visit names its service too (`docs/2026-11-05-BOOKING_MULTISERVICE_SHIFT_SLOTS_PLAN.md`). CUSTOM lists visits with their own times and blocks
  overlapping ones before BookingService checks again. The retried submit keeps its Idempotency-Key. The sidebar shows
  the quote's initial-payment percent and amount from the center booking policy (`GET /center-booking-policies/{id}`);
  no rate is fixed in the browser.
- Booking change request v2 (2026-11-03, `BE/docs/2026-11-03-BOOKING_CHANGE_REQUEST_V2.md`): RECURRING builds an
  editable visit list from its pattern (`features/customer/booking/hooks/schedule-slots.ts`, `schedule-rule-fields`,
  `schedule-slot-list`); once edited it sends `slots` with the pattern and a pattern change no longer rebuilds it.
  CUSTOM has a collapsible quick add that appends a daily / weekly pattern, skipping overlapping visits. Switching the
  header center while the form is open moves the form to that center and clears its choices. A SHIFT booking is held at
  once (2026-11-05: the caregiver signed up for that shift, so BookingService accepts it for them and the customer pays
  straight away — the success screen offers "Pay now", the detail stepper reads request held → pay → care → done). Any
  other booking with a chosen caregiver waits in `PENDING_CAREGIVER_CONFIRMATION`: the caregiver answers in the visits tab "Needs your answer" (`/caregiver/visits?tab=respond`; `/caregiver/requests` redirects there since 2026-11-05) (accept, or decline
  with a reason — RECURRING / CUSTOM then go to the center); the manager only sees the deadline and can reject.
  `entities/booking/service-address-dialog.tsx` (customer "⋯" menu and manager detail) moves chosen visits to another
  care address (`PATCH /bookings/{id}/service-address` with `occurrenceIds`, 2026-11-05): a customer only ticks visits at
  least 24 hours away (409 `5117`), the center any visit not started; the address comes from the person's address book or
  is typed and optionally saved there (redesigned 2026-11-06: step 1 visits grouped by day, step 2 radio cards for the
  current address, each saved address of the book with a link to manage it, or another address). A visit at another address carries `serviceAddress`; the booking form also picks
  the care address from the address book (`serviceAddress` on create). Kept deposits belong to the visit caregiver
  (`/caregiver/earnings`, `GET /deposit-forfeitures`); the manager revenue panel splits them from center revenue.
- The Center Manager booking detail confirms a RECURRING / CUSTOM booking without a caregiver
  (PENDING_CAREGIVER_ASSIGNMENT) and assigns one later before the policy deadline; the customer pays only after that.
  Once paid (CONFIRMED / IN_PROGRESS) the manager also cancels a single upcoming visit (`occurrenceIds`, full refund of
  what was paid for it, B16); before payment the booking is rejected or cancelled whole. The summary shows the
  remaining-balance due time and when the customer paid in full.
- `/center-manager/statistics` adds the center's net revenue (`GET /payments/revenue`; the token decides the center,
  spec §9.3) and the center wallet statistics for the dashboard period.
- Booking aftercare (`booking-aftercare.tsx`) shows care reports and the new-complaint action only once a visit has
  taken place; the review has no preset rating; each complaint keeps its own escalation reason and error, and
  withdrawing asks for confirmation.
- The web caregiver report form keeps selected images in memory. Save or Submit first checkpoints the server draft,
  then uploads the selected batch through `POST /api/v1/care-reports/{id}/photos`. Submit runs only after the upload
  succeeds. An uncertain upload requires a fresh report read and clearing the selected batch before choosing missing
  photos. The business limit is five JPEG, PNG or WebP files up to 10 MB each. The deployment's multipart limits must
  also allow those sizes.
- `/customer/bookings` groups the nine booking statuses into tabs (all, needs action, upcoming, in care, completed,
  cancelled). BookingService filters one status per request, so the list reads the customer's newest 500 bookings
  (`fetchBookingCollection`, pages of 100) and groups, searches (code or name, diacritics ignored), sorts and pages them
  in the browser; "needs action" adds CONFIRMED bookings whose remaining-balance invoice is open
  (`GET /payments/me/outstanding`). Older `?status=` links still narrow to that status. The booking detail shows a
  lifecycle stepper (request → center confirmation → assignment → payment → care → done) with the current step's
  deadline and countdown, a sticky side column with the next action and the summary, and "Cancel booking" in a "⋯" menu.
- `/customer/payments` (account menu "Payments & refunds") has three tabs in `?tab=`: to pay (deposits of bookings
  awaiting the initial payment and open remaining-balance invoices), history (payments and every remaining-balance
  invoice) and refunds; rows name the booking code and the cared-for person from the cached booking collection. It lists remaining-balance invoices
  with a VNPay pay action (`POST /remaining-invoices/{id}/payments`), warns when an OVERDUE
  invoice blocks new bookings (`GET /payments/me/outstanding`; an unpaid balance due before the first visit becomes
  EXPIRED with its booking, never a debt), and shows the customer's
  payment history (`GET /payments`, real `refundedAmount`) and refunds (`GET /refunds`).
  PaymentService error codes map to `payment.errors.e<code>` translations.

- RECURRING / CUSTOM schedule (2026-11-11): no visit is made up front. `schedule-pattern.tsx` (days, then a time per
  chosen service, each day doing at least one) builds the visits on demand — RECURRING replaces its list, CUSTOM quick
  add appends — and the list shows one card per day with a row per service (`schedule-day-list.tsx`,
  `schedule-day-card.tsx`). `use-caregiver-busy.ts` reads the chosen caregiver's busy time
  (`GET /bookings/held-schedules`, 31-day blocks) and marks visits that overlap another booking or its travel buffer;
  BookingService's quote rejects caregiver / recipient conflicts and time off too. Caregivers accept a visit until its
  check-in window closes; inside the window a visit not accepted yet is started directly (check-in accepts it).
- Caregiver absences (2026-11-10, `BE/docs/2026-11-10-CAREGIVER_ABSENCE_AND_REFUND_REVIEW.md`): a visit nobody checked
  in to becomes CAREGIVER_MISSED, the customer is refunded in full to the wallet and BookingService opens an absence
  record (`CaregiverAbsence` tag). `entities/booking/caregiver-absence-queue.tsx` lists the pending ones of the signed-in
  role: on `/center-manager/bookings` the manager excuses one or records a violation (with a note), on
  `/caregiver/visits` the caregiver sends or edits the explanation. `/admin/caregiver-absences` (menu Operations) is the
  read-only platform list with counts and a status filter in URL search parameters. The customer's visit dialog says the
  money went to the wallet; refund previews read the `LATE_NO_REFUND` rule (cancelled inside the center's
  `lateCancelNoRefundMinutes` window, default 2 hours, no refund). The policy form edits that window (hours, at most the
  refund cut-off and 24 hours); the refund summary, center page, booking review and cancel dialog tiers read it from the
  policy instead of a fixed text.
- Wallets (2026-11-09, `BE/docs/2026-11-09-WALLET_PLAN.md`): `entities/wallet` wraps the generated `Wallet` and
  `WalletWithdrawal` clients (`walletKeys` under `['wallet']`, `walletErrorKey` for codes 6040–6052) and owns one
  `WalletDashboard` used by `/customer/wallet` (account area), `/caregiver/wallet` (account menu), `/center-manager/wallet`
  and `/admin/wallet`: balance and held amount, a period dashboard (this month / 30 days / this year, chart drawn with CSS,
  no chart library), the period ledger with balance before → after and — except the read-only platform wallet — the
  owner's withdrawal requests and the centred two-column withdrawal dialog (every field checked first, the amount is held
  on success). Since 2026-11-10 a customer / caregiver withdrawal goes to the center that produced the money: the dialog
  picks the center from `GET /wallets/me/center-balances` and caps the amount there. `entities/wallet/withdrawal-queue.tsx`
  is shared by `/center-manager/withdrawals` (customer / caregiver requests of the center, with the money the center
  holds for them) and `/admin/withdrawals` (center wallets and older requests; every request read-only): a withdrawal
  dashboard (`GET /wallet-withdrawals/statistics`), filters in URL search parameters, `?withdrawal=` opens the review —
  copyable bank details, the admin also sees the requester wallet and ledger — and the handler runs the simulated
  transfer (the request completes by itself, PaymentService notifies the requester; the notification opens
  `/<portal>/wallet`) or rejects with a reason. There is no manual approve / confirm any more. Requesters show by name
  (Identity account, or the center for a center wallet), never by ID. The center wallet links to the queue with what
  it holds for others; center and platform wallets add a movement-mix donut.
  Customer refunds of their own cancellations go to the wallet and the refund history marks them "Refunded to wallet".

- AI assistant (2026-11-09, `BE/docs/2026-11-09-AI_CHAT_AND_CERTIFICATE_AI_CHECK.md`): `features/shared/ai-chat` is a
  floating button mounted by the customer (public pages included), caregiver, center manager and admin layouts; it opens
  a panel (full screen on phones, Escape closes). AIService decides who is a guest through the public
  `GET /ai/chat/quota`, so the widget never guesses from the route. A guest gets the daily free prompts (3), no images
  and no saved history (messages stay in memory, the count updates from `remainingGuestPrompts`, then a sign-in link with
  `?next=`). Any signed-in role keeps conversations: the answer's `conversationId` is reused for follow-ups, the history
  view opens, renames (inline, with the conversation `version`; 409 `8203` asks to reload) and deletes (confirmation)
  them, and up to three JPG / PNG / WebP images — picked from a folder through the system file dialog (attach
  button or the "+" tile) or dragged onto the question box — are previewed and checked against the quota limits before
  `POST /ai/chat` (multipart: a JSON Blob part `request` plus `images`). The chat endpoints are public but AIService still
  reads the session cookie, so a 401 refreshes the session once and retries. Answers render light Markdown (paragraphs,
  lists, bold) as React text, never HTML. AIService error codes map to `aiChat.errors.e<code>`.
- Certificate review (2026-11-09): caregiver declares and uploads photos → the center manager confirms (needs at least one
  photo, 409 `4255`) → ProviderService sends the certificate to AIService in the background → the admin decides.
  `/admin/certificates` (menu Operations) lists `GET /certificates/pending-audit` (high risk first) with count cards from
  `/pending-audit/statistics` that filter by risk / AI state, a center filter, URL search parameters and
  `?certificate=<id>` for the review; the list refreshes every 10 seconds while an AI check is running.
  `entities/provider/certificate-review-dialog.tsx` (also opened from `/admin/centers/:id/caregivers`) shows the photos
  (`certificate-files.tsx`, shared with the manager screen), a declared / read-by-AI / result table per field, the AI risk
  and warnings (`certificateReview.*` copy, codes never shown), the center confirmation, "run AI again"
  (`POST /certificates/{id}/ai-check`) and approve / reject; approving without a LOW / MEDIUM AI result and every
  rejection need a reason (400 `4256`). Only admins receive the AI result; managers see where the AI check stands. A new
  or removed certificate photo, or an edit of its details, sends the certificate back to the center, so media changes
  also refresh certificate queries; the caregiver deletes a certificate only while PENDING or REJECTED (2026-11-10).

### Testing and debugging

`vitest.config.ts` is exclusively the test-runner configuration. It limits discovery
to authored app tests, uses jsdom so DOM/accessibility behavior is available, loads
`test/setup.ts`, and reuses TypeScript path aliases. It does not configure the
production bundle; React Router/Vite build behavior lives in `vite.config.ts` and
`react-router.config.ts`.

The minimum test pyramid is:

1. Pure unit tests for formatting, mapping, and permission-display helpers.
2. Feature/component tests with Testing Library and generated Faker factories.
3. Request integration tests with generated MSW handlers where network behavior
   matters.
4. Browser smoke tests for navigation, console, accessibility tree, and important
   network requests.

Generated API output is TypeScript-checked but not hand-linted as authored code.
Failures should be fixed in the OpenAPI document or Orval configuration.

### Deployment files: VPS/Docker versus Vercel

The two deployment paths share the same static `build/client` output but use
different adapters:

- Docker/VPS: the final image copies `build/client` into Nginx. `nginx.conf` serves
  static assets and uses `try_files ... /index.html` so a hard refresh on a client
  route still boots React Router. A deployment ingress must route `/api` to the backend,
  or the frontend must be built with a public absolute API URL.
- Vercel: Nginx and `nginx.conf` are not used. `react-router.config.ts` contains the
  official Vercel preset and keeps `ssr: false`; Vercel supports React Router SPA
  builds without a custom server. Configure the Vercel project root as `Code/FE-web`
  (when deploying this parent repository), keep the pnpm install/build commands, and
  set public environment values in the Vercel project before building. Test a deep
  route in Preview, not only `/`.

Do not add a broad Vercel rewrite on top of the React Router preset unless an actual
preview proves it is necessary; generic Vite SPAs need an `index.html` rewrite, while
the official React Router preset already understands the route/build structure.

### Why `openapi/` and `pnpm-workspace.yaml` exist

`openapi/` contains a reviewed snapshot of the backend's machine-readable contract.
Committing it makes backend changes diffable, generation reproducible offline, and
frontend/CI behavior independent of a live Swagger server. The backend remains the
author; clients replace the snapshot, validate it, regenerate, and commit the
contract plus output together.

`pnpm-workspace.yaml` declares the workspace root even with one package. Omitting a
`packages` list means only this root package participates today, while the file is
also the canonical place for pnpm resolution, supply-chain, and dependency build
policy. `allowBuilds` permits install scripts only for named packages such as
`esbuild` and `msw`; adding a package there grants code execution during install and
requires review. It is not evidence that this repository is already a monorepo and
does not require creating empty packages.

## Deferred decisions

- Web authentication uses IdentityService HttpOnly cookies and CSRF. Do not store
  access or refresh tokens in local storage.
- Form, table, chart, and component libraries should be chosen from real screens and
  accessibility requirements, not installed as architecture placeholders.
- A shared Web/Mobile package is deferred. Web is the MVP for Customer, Center Manager,
  and Admin, with a limited Caregiver dashboard preview; the Caregiver mobile app shares the API contract and domain language
  before sharing UI.

## Official references

- [React Router SPA mode](https://reactrouter.com/how-to/spa)
- [React Router rendering strategies](https://reactrouter.com/start/framework/rendering)
- [Vite environment variables](https://vite.dev/guide/env-and-mode)
- [TanStack Query React installation](https://tanstack.com/query/latest/docs/framework/react/installation)
- [Orval React Query client](https://orval.dev/docs/guides/react-query/)
- [Orval Faker generation](https://orval.dev/docs/guides/faker/)
- [Orval MSW generation](https://orval.dev/docs/guides/msw/)
- [Orval output configuration](https://orval.dev/docs/reference/configuration/output/)
- [Faker usage and bundle-size guidance](https://fakerjs.dev/guide/usage)
- [Vitest configuration](https://vitest.dev/config/)
- [React i18next `useTranslation`](https://react.i18next.com/latest/usetranslation-hook)
- [Vercel React Router preset](https://vercel.com/docs/frameworks/frontend/react-router)
- [pnpm workspace settings](https://pnpm.io/settings)

### 2026-11-11 — customer account area and center-manager lists

- Customer account menu (`features/customer/layout/components/account-menu.tsx`) and the account shell group their
  links (account · payments & wallet · updates); the menu shows the wallet balance (`GET /wallets/me`, read while open).
  `/customer/payments` history opens a printable invoice per successful payment (`payment-invoice-dialog.tsx`), built
  from the payment and the booking's service snapshot — no invoice endpoint. A customer's wallet chart says "refunds",
  never "income".
- `shared/ui/pagination.tsx` takes `pageSize` / `onPageSizeChange` / `totalElements`; `BentoPageHeader` (plain) puts
  actions on the title row. The dashboard period (`entities/statistics/statistics-period.ts`) adds `custom`
  (`?period=custom&from=&to=`), used by the manager statistics page (no banner, revenue first) and the admin dashboard.
- Server-paged manager lists: services (`GET /center-services/center/{id}?keyword=`) and their price plans
  (`GET /price-plans?centerOfferingId=&page=&size=`, CareCatalogService 2026-11-11), work shifts (page size, bulk open /
  close / delete over the existing single-shift endpoints, single delete), the work calendar list and time-off tabs,
  and a caregiver's absences. Absence and withdrawal queues fold visits per booking
  (`entities/booking/booking-group-card.tsx`); the manager booking history shows the latest four entries first.

### 2026-11-11 — care session attendance and customer visit reports

`BE/docs/2026-11-11-CARE_SESSION_ATTENDANCE.md`. BookingService records lateness, early leave and a location flag on
check-in (flag only, never blocks) and refuses a second open session (409 `5806`). A session the system closed, or a
finished visit the customer reported, waits as `completionReview=PENDING` and its settlement is held; the manager decides
it in the "Visits waiting for the center" queue on `/center-manager/bookings`
(`manager-session-review-queue.tsx`, shows `customerReportNote`), and the manager visit dialog shows late / early
minutes, distance and the flag. The caregiver care report is a status card plus a centred two-column dialog
(`entities/aftercare/care-report-card.tsx`, `care-report-form.tsx` `variant='dialog'`). The customer visit dialog
(`booking-occurrence-detail-dialog.tsx`) offers "the caregiver has not arrived" once a SCHEDULED / ACKNOWLEDGED visit
has started (optional note) and "this visit was not delivered properly" within 24 hours after a COMPLETED visit ended
(note of at least 10 characters) through `POST /booking-occurrences/{id}/customer-reports` (`reportVisitByCustomer`);
once sent it shows the time (`customerReportedAt`). The 24 hours are a frontend constant mirroring BookingService's
`booking.session.customer-report-window`; BookingService answers 409 `5823` / `5824` and 400 `5825`.
`BookingReasonDialog` makes the reason optional when `minLength` is 0.

### 2026-11-11 — requester names, invoice buyer, wallet balance in every account menu

- Withdrawal queues name the requester from `requesterName` / `requesterPhoneNumber`, which PaymentService reads from
  Identity `/users/batch` with its SERVICE token: a manager cannot read a customer's account (customers have no center),
  so the former per-account lookups showed "Unknown".
- The customer invoice (`payment-invoice-dialog.tsx`) takes the buyer from the session user, because BookingService
  leaves `customer` out of a customer's own booking.
- Every account menu starts its money part with `entities/wallet/wallet-balance-link.tsx` (available balance of
  `GET /wallets/me`, read while the menu is open): customer and caregiver only since the revenue change below.

### 2026-11-11 — center / platform revenue and booking settlement

`BE/docs/2026-11-11-REVENUE_AND_BOOKING_SETTLEMENT.md`. Customer money reaches the center's and the platform's own
accounts, so `/center-manager/wallet` became `/center-manager/revenue` (menu "Revenue") and `/admin/wallet` was folded
into `/admin/revenue` (the former sample revenue page and its `admin.revenuePage` copy were removed). Both render
`WalletDashboard`, which for a CENTER / PLATFORM owner shows only the period revenue (KPIs, revenue chart, movement mix,
ledger; the center keeps its "money held for others" card): no balance, withdraw action or own withdrawal requests, and
the ops account menu has no wallet card. PaymentService refuses a center withdrawal. The withdrawal queues are
unchanged. `entities/wallet/booking-settlement-card.tsx` (manager and admin booking detail) reads
`GET /wallets/bookings/{bookingId}/settlement`: paid, refunded, center service money, kept deposits, complaint
deductions, what the center received, the commission, and each visit's outcome (404 = not paid yet).

- The money sections of `/center-manager/statistics` and `/admin/dashboard` follow the same rule: the center tile is
  "received by the center" (hint: commission deducted) with a received-only chart, the platform commission tile counts
  its bookings, "held for others" sums customer and caregiver wallets only, and both link to the revenue pages.
- `DonutChart` lays out by its own width (`@container`, side by side from `@lg`), so the "money the center holds" card
  in a one-third column stacks the ring above a legend that no longer truncates.
- Withdrawal payout (2026-11-11): "Transfer" in the review dialog opens `/<center-manager|admin>/withdrawals/:id/transfer`
  (`entities/wallet/simulated-transfer-page.tsx`), a sandbox bank gateway: source account (the fixed sandbox test
  account), then a fixed sandbox OTP, both checked in the browser, then `POST /wallet-withdrawals/{id}/transfers`. The
  right column shows the payee and a VietQR code (`entities/wallet/viet-qr.ts`: EMVCo payload with NAPAS BIN, amount and
  note, CRC-16, rendered by `qrcode.react` in the browser, so the account never goes to a QR web service). Withdrawal
  forms pick the bank from that bank list; older free-text names are matched without case or diacritics, and an
  unknown bank shows no QR.
- PaymentService DB: `2026-11-10-withdrawals-by-center.sql` had not been applied on dev, so every transfer failed
  (outbox insert with a null `booking_id`, 409). Applied 2026-11-11.
- Wallet pages (every role, 2026-11-11): the ledger and the own withdrawal list always show the pager with a rows-per-page
  picker; a ledger row opens `WalletTransactionDetailDialog` (amount, balance and held before → after, center, booking
  link, payout reference — raw ledger notes are never shown) and an own request opens `WalletWithdrawalDetailDialog`
  (timeline sent → waiting / transferred / rejected, bank account, handler, reference or reason), both in
  `entities/wallet/wallet-detail-dialogs.tsx`.
- `/center-manager/bookings` (2026-11-11, menu "Lịch đặt và phân công"): the list uses the full width with a rows-per-page
  picker (`?size=`, default 10). Caregiver withdrawals, visits to confirm and caregiver absences moved from the right
  rail to compact cards above the list (`components/manager-attention-strip.tsx`, count + "Details", hidden when empty);
  "Details" opens the queue in a popup (`?queue=withdrawals|reviews|absences`) paged by BookingService (5 / 10 / 20).
  Default page sizes: services and price plans 5, work shifts and caregivers 10.

### 2026-11-11 — admin portal pass and customer center directory

- `features/admin/ui/stat-cards.tsx` (`AdminStatCards`: the first card dark, a card with `onSelect` filters the list)
  and `features/admin/data/use-center-options.ts` are shared by the admin features. Admin lists (centers, accounts,
  caregivers, absences, bookings) keep page and `?size=` in the URL and use the sized `Pagination`.
- `/admin/dashboard` has no banner: title and period filter share a row, platform money comes first.
- `/admin/centers`: count cards, status tabs, and per row a "⋯" menu — edit in a dialog, caregivers / bookings / policy
  of the center, archive (`components/archive-center-dialog.tsx`, shared with the center page).
- `/admin/bookings`: `BookingsBrowser` takes `rowAction`; the admin menu opens a booking or cancels it for the platform
  (`components/cancel-booking-dialog.tsx`). Bookings are created and changed by customers and centers only. The detail
  history shows the latest four entries first.
- `/admin/caregivers` is the caregiver directory of every center (`GET /caregivers/directory`, ADMIN: `centerId`,
  `verification`, `status`, `keyword`, ordered by center then name), grouped per center; pending profiles are approved
  or rejected on their row.
- `/admin/caregiver-absences` folds a page's absences per booking and filters by center.
- `/admin/policies` keeps the center in `?center=`. The policy form shows units inside the inputs, booking types in
  words (never SHIFT / RECURRING / CUSTOM) and a sticky save bar with "unsaved changes".
- `/admin/accounts`: the row "⋯" menu locks / unlocks / deactivates (`AccountAccess` with `menuLabel`).
  `/admin/roles`: custom roles are renamed, described, stopped (`PUT /roles/{id}`) and deleted (`DELETE /roles/{id}`,
  409 `1120` while an account holds the role).
- `/admin/profile` is two columns (identity card + tabs). `PersonalInfoPanel` takes `title`; the password panel puts
  its rules beside the fields; signed-in devices read "Chrome · Windows" through `shared/lib/user-agent.ts`.
- `/customer/centers` pages and searches on the server (`useServiceCentersPage`, `?q=`, `?page=`, `?size=`);
  ProviderService matches name and address without diacritics. Services still page in the browser over the collected
  list because price sort and category groups are computed there; caregivers were already server-paged.

### 2026-11-12 — customer stroke screening

`/customer/stroke-screening` (guarded customer layout, `features/customer/stroke-screening`) calls AIService
`POST /api/v1/ai/stroke-screening/predict` through the gateway (tag `StrokeScreening`, `predictStrokeScreening`, CUSTOMER
only; AIService forwards to its internal StrokeModelService, which the browser never calls). It is a cookie POST, so it
sends the Identity CSRF header (`writeOptions`). The form asks nine facts — sex, age (18–120 whole years), BMI (10–80,
comma or dot, with an optional height / weight calculator) and six yes / no history questions with no default answer
— and keeps "Run screening" disabled until every answer is valid, with the reason under the inputs or the button.
Choosing a family profile (`entities/care-recipient`, the booking form's list request) starts a fresh draft prefilled
with age, sex (MALE / FEMALE only) and BMI from height and weight; its chronic conditions are shown as a reference, never
turned into answers. The result names the pattern (`NEEDS_FURTHER_ASSESSMENT` peach, `LOWER_SCREENING_PATTERN` mint;
`predictedClass` is never shown), shows `modelScore` as a "model screening score" (0–1, two decimals) on a meter with the 0.5 decision threshold of
StrokeModelService marked and explained (above it → "assess further"), explicitly not a probability, the
backend `recommendation` verbatim, three translated next steps, the answers it used and, directly under it, the backend
`disclaimer`; changing an answer afterwards marks the result as outdated. Failures are a `FormAlert` at the end of the
form: 8613 / 503 / 404 (endpoint not deployed) read "not available" with a retry, 401 asks to retry after the session
refresh, 403 and 400 have no retry, a network error says it is not a result. Nothing is stored. The header shows the page
as a round icon item (name in a tooltip and for screen readers) because the floating bar (at most 1180 px) is full at
`xl`; nav links are `px-3`/`xl:px-3.5` with `gap-0.5` to make room. The account menu lists it under "Health" with its name.
