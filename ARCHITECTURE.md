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

### Web authentication and portal access

IdentityService on local port 8081 owns the web session. The browser sends its
HttpOnly access and refresh cookies to the same-origin `/api` prefix. The frontend
fetches a CSRF token before login, refresh, and logout and sends it in the header
specified by `/auth/csrf`; it never stores access or refresh tokens in browser
storage. After login, `/users/me` supplies the authenticated user and roles. A 401
from `/users/me` triggers one refresh attempt and a retry; another 401 means the
session has ended. Other API failures show a retry state instead of treating the
user as signed out.

Each portal parent route wraps its layout with a TanStack Query session guard.
The guard renders children only after `/users/me` confirms an active user with the
required backend role. It redirects anonymous users to `/login` with an internal
return path and shows an access-denied state for the wrong role. The backend remains
authoritative for every data and mutation endpoint; these guards only prevent
incorrect UI access. Portal headers use the `/users/me` identity while business
screens remain labeled previews. Login routes users to the first available built-in portal in
the order ADMIN, CENTER_MANAGER, CAREGIVER, CUSTOMER. A safe return path takes
priority when it belongs to one of the user's roles. Logout clears the backend
cookies and reloads `/login` to drop the in-memory query cache.

Public customer registration uses `/users/register` to send an email OTP. The
account is created only after `/users/register/verify` succeeds; verification
does not create a web session, so the user signs in separately. The registration
screen can request `/users/register/resend-otp` after the cooldown returned by
the backend. All three mutations fetch a fresh CSRF token and use the same-origin
`/api` proxy with credentials, so registration also works when an existing web
cookie is present. The UI never persists the password or OTP.

The committed OpenAPI snapshot currently covers this reviewed IdentityService
authentication, customer registration, and current-user slice. It corrects the live Swagger's generic
`ApiResponse.result` and spurious CSRF query parameter using the backend DTOs and
the observed `/auth/csrf` response. Other IdentityService operations will be added
as their frontend features are implemented. Generated files are never hand-edited.

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
    caregiver/             caregiver-specific layout and dashboard
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

The current Caregiver routes are UI previews with a dedicated Caregiver shell;
`/caregiver` redirects there. The Caregiver layout does not import Customer features.
Until the backend session/permission contract is available, this preview has no real
role guard and contains only explicitly labeled sample data. The parent Caregiver
layout route is the future guard boundary; URL separation does not grant or enforce
authorization. Availability is ephemeral preview state. Reports, care completion,
SOS, directions, medical records, credentials and earnings require backend contracts;
unimplemented actions are disabled. Schedule navigation targets `/caregiver/schedule`;
other dashboard navigation links target existing sections rather than unfinished
screens. The Schedule feature owns its static preview fixtures and URL state for
date/month, date scope, status, patient search and list/calendar view. Its sample
reference day is 2026-09-20; the initial overview shows that day and the next day.
The displayed sample week spans September 19–25, with weekdays formatted from the
actual dates; other periods use Monday-based weeks. It does not claim an ISO week
number. Session and weekly completion counts derive from the same preview fixtures.
Accepting open sessions, requesting leave, reporting, contact and navigation actions
remain disabled until backend contracts exist. No live GPS, VNeID verification,
clinical completion, report submission or payment result is simulated.

Caregiver report (`/caregiver/shifts/:id/report`), history (`/caregiver/history`)
and profile (`/caregiver/profile`) use the same shell and portal translations.
Thin route modules compose independent `care-report`, `care-history`, and `profile`
features. `entities/care-session` owns the deterministic record metadata shared by
history and reports, plus the in-memory draft handoff from the active-session
feature. Confirming the end-care modal prepares a report and navigates; it does not
submit a report, complete a backend session, or perform a digital signature.
Actual task completion flags, custom tasks, nursing notes and measured vitals carry
over to the draft. Unknown report IDs show a not-found state unless an active-session
draft exists. Clinical content from one sample record is not reused for other history
records. The report editor and profile editor own local form state. Patient notes and
selected files are never persisted to localStorage; saved report drafts last only
for the current SPA session and profile edits last only while the page is mounted.
File previews use revocable object URLs without uploads. Profile verification,
report submission, signatures and payments await backend contracts. History filters
and pagination use URL search parameters; exports contain the filtered sample rows.
`shared/ui/section-card` provides the generic section presentation used by these
features; it has no portal or domain imports.

The Center Manager preview has its own `/center-manager` layout and translations,
with list and detail routes at `/center-manager/caregivers` and
`/center-manager/caregivers/:id`. Both screens share role-local preview fixtures in
`features/center-manager/caregivers/`; they do not import Customer or Caregiver
features. Search, filters, sort and pagination use URL parameters, while CSV export
contains the filtered sample rows. Each detail route resolves its own caregiver ID;
the extensive clinical sections from the supplied example appear only for the
matching sample person. Management mutations, credential decisions, document
downloads, notifications and shift assignment remain unavailable until the backend
contract and manager authorization are implemented. The manager layout route is
the future authorization boundary; it currently displays clearly labeled sample
data and does not establish role access by itself.

The Center Manager booking list lives at `/center-manager/bookings` and uses
role-local fixtures under `features/center-manager/booking-management/`. It is a
dated sample snapshot while the backend booking contract is unavailable. Search,
service/status/area/period filters, sorting, pagination, and the selected booking
preview are represented in URL search parameters. CSV export uses the filtered
sample rows. Assignment, cancellation, emergency creation, receipts, reports,
and the live map remain disabled until authorized backend operations exist.
The Manager detail route `/center-manager/bookings/:id` resolves the same booking
fixture by ID. The supplied clinical timeline and financial breakdown belong only
to `BK-8821`; other sample bookings show their available summary without borrowing
that patient's details. The finance example calculates a consistent discounted
total, deposit, and balance from the design numbers. GPS and payments are labeled
as sample or unavailable. The cancellation dialog cannot submit; dispatch notes
remain local drafts. The booking list links to this route and retains its quick
preview dialog.

The Admin preview has its own `/admin` layout, VI/EN menu resources, and child
routes `/admin/dashboard`, `/admin/revenue`, `/admin/customers`,
`/admin/customers/:id`, `/admin/services`, `/admin/centers`,
`/admin/policies`, `/admin/quality`, and `/admin/reviews-complaints`.
The last route is the separate Admin review and complaint workspace;
`/admin` redirects to its dashboard.
It does not import feature internals from the other roles. Both pages use distinct,
dated September 2026 design snapshots because the supplied KPI totals describe
different examples. They are not combined into a platform ledger or presented as
live data. Dashboard charts are static sample visuals. The revenue list owns its
sample transactions and URL-based search, filters, pagination, and selected-row
preview; CSV export includes the filtered sample rows. Bank reconciliation,
payout approval, invoices, live gateway status, refresh, and unimplemented Admin
menu destinations await backend contracts. The Admin parent layout is the future
authorization boundary; the preview itself does not enforce role access.
The customer list and detail use a separate role-local October 2026 design snapshot,
not the dashboard or revenue totals. List search, status/booking volume/region
filters, sorting, and pagination live in URL search parameters. Its CSV export
contains only filtered sample rows. Detail resolves the same customer fixture by
ID; patient histories, payment methods, bookings, and audit entries from the
supplied detailed example appear only for `CUST-1024`. Customer creation,
account suspension/reactivation, password resets, notifications, clinical record
access, and note persistence await a backend contract and Admin authorization.
The Admin service catalog and partner center screens use separate role-local,
dated design snapshots, not the dashboard or revenue totals. Their search,
tabs, and filters are URL search parameters; the selected service or center
opens a read-only URL-addressable preview. Center CSV export contains only
filtered sample rows. Pricing edits, catalog changes, onboarding approvals,
center suspension/reactivation, account creation, and legal verification remain
unavailable until backend contracts and Admin authorization are implemented.
The policy and caregiver quality pages use independent, dated Admin design snapshots.
Policy deposit and payout cycle controls update a local simulation only; no values
are saved or presented as active financial rules. Quality list filters and tabs
use URL search parameters, and a selected caregiver opens a read-only sample
profile. Sample OCR, license, legal, clinical, payment and risk data are not
live verification results. Policy publication, caregiver approval/rejection,
license checking and clinical calls await backend contracts and authorization.
The review and complaint workspace uses an independent illustrative design snapshot.
Tabs, search, severity/status filters and the selected complaint live in URL search
parameters. The CSAT export contains only the sample feedback shown on this page.
Complaint decisions, refunds, caregiver replacement/discipline, medical records,
SOS escalation, escrow and live review moderation require backend contracts and
Admin authorization. No sample case is treated as a real medical or payment result.

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
    dashboard-resources.ts          Caregiver dashboard copy
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

- `VITE_API_BASE_URL` is public and defaults to `/api`.
- `API_PROXY_TARGET` is read only by the Vite development server and defaults to
  `http://localhost:8081` for the local IdentityService.
- Vite statically replaces browser environment values during the build. A changed
  production API prefix therefore requires a rebuild unless the deployment keeps the
  stable `/api` ingress contract.
- No token, private key, or service credential belongs in a `VITE_*` variable.

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
