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
BookingService scopes that request to the manager's center. These responses do
not include revenue or time-series data. The existing admin financial charts
remain explicitly labeled previews until a financial reporting contract exists.

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
The shared site footer adapts its account links to the signed-in Customer portal.
The Customer header and in-portal home breadcrumbs point to `/customer`; the account
menu contains the profile and family profiles links and the session sign-out action.
Family profiles are reached from that menu rather than the header navigation.
Caregiver search, caregiver detail, and services under `/customer` use a public browse
layout outside the Customer portal guard. Guests see the same navigation style with
Home, Find Caregivers, Services, and Sign in; active Customers also see bookings and
their account menu. The `/customer` index, booking routes, and personal and patient
profiles remain guarded. The current backend requires an authenticated session for
caregiver search and detail, verified certificates, catalog items, center offerings,
and price plans. Guest browse routes remain reachable, but their data requests return
401 until the backend enables anonymous reads or the product requires sign-in for browsing.

The Customer header carries a center selector beside the logo, and the public `/` home
page uses the same Customer layout so the selector appears from the first visit.
`entities/care-center` lists ACTIVE centers through ProviderService's customer endpoint
`GET /v1/care-centers/public` (up to five pages of 100) and reads the chosen center's current
name through `GET /v1/care-centers/public/{centerId}`; a 404 there clears the choice. Both
endpoints still require a signed-in session. The chosen
center is a per-browser preference in `localStorage` (only its ID and name) shared through
a small external store; a dialog opens once per browser session while no center is chosen,
and any "choose a center" action reopens it. A 401 on the center list shows a sign-in step
instead of an error. Null means the platform-wide configuration.

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
wrappers and query keys. The list keeps keyword, status and page in URL search
parameters and uses backend pagination; its sidebar shows the `/users/me` identity
and the unfiltered profile count. Detail edits send the whole profile with the
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
the guarded `/api/v1/users/me` user and saves only `fullName` and `phoneNumber` through
`PUT /api/v1/users/me`; a successful response replaces the session query data. Email is
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

The Caregiver portal uses its own role guarded shell and keeps only screens backed by the API (D25,
2026-10-28): `/caregiver/visits` (the portal home) and `/caregiver/visits/:id` run assigned visits — acknowledge,
check-in, tasks, no-show report and check-out. The visit detail shows the patient snapshot before the actions, and
check-in is enabled only from 30 minutes before to 30 minutes after the start (D22, re-evaluated every 30 seconds
while the page is open); the care report states its 24-hour deadline (D27) and has no default condition; `/caregiver/schedule` ("Availability") lists availability slots,
created when the center approves a shift registration (D11). It filters all / upcoming / past / cancelled slots, marks
past slots and offers cancelling only an upcoming open slot, asking the reason in a confirmation dialog and sending the
backend version (starting and completing care happen on visits). The Center Manager `/center-manager/schedules` page
reuses `entities/provider/provider-schedule-page.tsx` read-only. `/caregiver/work-shifts`
(`caregiver-work-shifts-page.tsx`) lists the center's open shifts that have not started, shows capacity and the
registration deadline, marks shifts already registered or closed for registration, registers with an optional note per
shift, and lists the caregiver's registrations with each shift's date read through `GET /work-shifts/{id}` (the
registration carries only the shift ID). `/caregiver/profile` reads the ProviderService profile, its media, the
services the center assigned (`GET /caregivers/{id}/services`, PRV-01) and the caregiver's own time off. Pages compare
dates against a "now" fixed when they open because `react-hooks/purity` forbids `Date.now()` during render. The former sample dashboard, history, shift-detail, active-session and care-report screens were removed;
care reports and notifications return when their live flows are built.

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
- `toast.tsx` (`ToastProvider`, `useToast`): non-blocking status notifications (`aria-live="polite"`).
- `pagination.tsx` (`Pagination`): accessible pagination bar with `tabular-nums`.
- `data-table.tsx` (`DataTableShell`): responsive table wrapper with sticky header support.
- `state-panels.tsx` (`SkeletonBlock`, `TableSkeleton`, `CardGridSkeleton`, `EmptyState`, `ErrorState`, `ForbiddenState`, `OfflineBanner`): unified loading, empty, error, 403, and offline states.
- `section-card.tsx`, `language-switch.tsx`, `site-footer.tsx`, `icon.tsx`: generic layout cards, VI/EN language switcher, footer, and Material Symbols icon wrapper.

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
Time off for a caregiver is shared by the manager detail and the caregiver profile through
`entities/provider/caregiver-time-offs.tsx`, which takes the copy namespace of the portal that renders it.

`/center-manager/work-shifts` lists and creates ProviderService work shifts for the
assigned center. Its detail route edits or archives a shift and reviews registration
requests. The displayed rows come from ProviderService; no assignment or booking
data is inferred from them. Both list and detail show loading, empty, error, and
access-denied states. No Provider mutation runs from sample fixtures.

`/center-manager/schedules` reads the assigned center's ProviderService schedules.
The manager status mutation is unavailable in the current backend, so this page is
read-only; caregivers can still update their own schedules. Customer
`/customer/caregivers` reads the ProviderService
catalog; its detail route resolves a caregiver by Identity user ID and lists only
verified certificates. Shared `entities/provider` code owns gateway request wrappers,
schedule workflows, and owner scoped media upload/list/delete for centers, caregiver
profiles, and certificates. Multipart Faker factories are generated with a Blob
override in `orval.config.ts` so the generated test data matches the browser file
contract.

`/center-manager/services` manages the signed-in Center Manager's offerings and
price plans through `entities/care-catalog`. The route takes its center ID only
from `/users/me`, reads that center's offerings, and uses active master catalog
items for new offerings. Offering and price plan forms send only contract fields;
mutations use Identity CSRF headers and invalidate the related TanStack Query
cache. The backend enforces center ownership and pricing permissions. Admin's
center pricing view remains read-only.

The Center Manager booking list `/center-manager/bookings` and detail `/center-manager/bookings/:id` read
BookingService for the manager's center (list filters in URL search parameters). The detail accepts, rejects,
cancels and reassigns through `entities/booking`; the caregiver picker marks who is free for every upcoming visit
using ProviderService `/caregivers/search` with the booking's services and visit slots (M-16, Đợt 5), and the
backend checks again on save. No-show reports are decided per visit.

The Admin shell is a left sidebar plus a topbar. `admin-navigation.constants.ts` groups the
menu into Overview, Operations, Customers and System; every item opens a live screen (Đợt 5). Revenue,
quality and policy previews keep their routes but are left out of the menu until a backend exists (D26).
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
the `CatalogItemRequest` fields (name, category, optional description, status). The
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
opening time means overnight and equal times mean 24 hours. Archiving is permanent and lists read-only under the
Archived tab. Caregivers and certificates are reviewed at `/admin/centers/:id/caregivers`; each rejection asks its own
reason. `/admin/accounts` filters, searches and pages on the server (`GET /users` role, status, keyword) with counts from
`GET /users/statistics`; creating an account continues into `entities/identity/password-reset-panel.tsx`, which sends
the owner an email OTP (`/auth/forgot-password`) and lets the owner finish on `/forgot-password?email=` or the
administrator type the code the owner reads out (`/auth/reset-password`). Account details show the center and the lock
reason, lock with a required reason, and do not assign CENTER_MANAGER or CAREGIVER (they come from the center and the
caregiver flows). `/admin/roles` explains each system role and permission. Service categories are the six groups of
`entities/care-catalog/service-category.ts`; older long values read into their group without a data migration.
Profile photos and center logos use the newest image (`entities/provider/provider-avatar.ts`); uploads refresh every
cache that shows the owner (`invalidate-provider-media.ts`) and a caregiver keeps a single profile photo.
The policy and caregiver quality pages use independent, dated Admin design snapshots.
Policy deposit and payout cycle controls update a local simulation only; no values
are saved or presented as active financial rules. Quality list filters and tabs
use URL search parameters, and a selected caregiver opens a read-only sample
profile. Sample OCR, license, legal, clinical, payment and risk data are not
live verification results. Policy publication, caregiver approval/rejection,
license checking and clinical calls await backend contracts and authorization.

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
IDs, or a normalized API-error contract requires it.

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
  the generated `Payment`, `PaymentPolicy`, `Refund` and `RemainingInvoice` clients.
  `/customer/bookings/:id/deposit` opens a VNPay checkout
  (`POST /payments/bookings/{bookingId}/checkout`, provider VNPAY, D16) and leaves the app
  for the returned `checkoutUrl`; the customer picks QR, ATM or card on the VNPay page.
  PaymentService `VNPAY_RETURN_URL` must point to `/customer/payments/vnpay-return`: that
  screen sends the signed query to `GET /payments/vnpay/return`, then opens
  `/customer/payments/:paymentId/success|failure`, which polls `GET /payments/{id}` while it is
  PENDING because the IPN, not the browser return, records the money. The page reads the payment status, not the
  return route: PENDING shows "confirming" (never a success mark), polling stops after 60 seconds with a check-again
  action and a link to the payments list, and a REMAINING payment is named as an invoice, not a deposit.
- Before paying, the deposit page shows the assigned caregiver (`entities/provider/assigned-caregiver-card.tsx`, public
  caregiver profile) and the refund tiers and cooling-off of `GET /payment-policies/effective`
  (`entities/payment/refund-policy.tsx`). The cancel dialog reads PaymentService refund-quote rule codes
  (`TIER_<min>_<max>`, `COOLING_OFF`, `FULL_REFUND_*`) as words through `refundRuleLabel`; codes are never shown.
- BookingService leaves `depositAmount` empty: PaymentService computes the deposit per visit
  from the center's policy snapshot. `useDepositAmount` shows the booking total times the
  `depositPercent` of `GET /payment-policies/effective` as an estimate; the VNPay page shows
  the exact amount of the opened session.
- The booking form reads `GET /payments/me/outstanding` and, while an overdue invoice exists, shows a banner linking to
  `/customer/payments` and disables submit, so the customer learns about the block before filling the form.
- Booking aftercare (`booking-aftercare.tsx`) shows care reports and the new-complaint action only once a visit has
  taken place; the review has no preset rating; each complaint keeps its own escalation reason and error, and
  withdrawing asks for confirmation.
- `/customer/payments` (account menu "Payments & refunds") lists remaining-balance invoices
  with a VNPay pay action (`POST /remaining-invoices/{id}/payments`), warns when an OVERDUE
  invoice blocks new bookings (`GET /payments/me/outstanding`), and shows the customer's
  payment history (`GET /payments`, real `refundedAmount`) and refunds (`GET /refunds`).
  PaymentService error codes map to `payment.errors.e<code>` translations.

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
