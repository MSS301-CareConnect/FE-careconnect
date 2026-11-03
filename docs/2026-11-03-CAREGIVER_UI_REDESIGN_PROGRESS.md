# Caregiver portal UI redesign — audit, plan, progress (2026-11-03)

Brief: redesign every `/caregiver/*` page plus the security screen the role uses. UI/UX only: API, payloads, business
rules, i18n VI/EN and existing routes stay. Mobile-first. A parallel session redesigns `/customer/*` in the same working
tree, so this work touches only caregiver files (+ the caregiver block of `routes.ts` and `i18n/resources.ts`).

## 0. Audit

Stack: React 19, React Router 8 (framework mode, SPA), Tailwind 4, TanStack Query 5, i18next (typed resources),
sonner toasts, Material Symbols icons. No form library, no motion library (CSS keyframes `cc-*` in `app.css`).

Shared kit reused read-only: `shared/ui` Drawer (side/bottom sheet), DatePicker (dd/mm/yyyy), TimeSelect (24h),
ConfirmDialog/Modal, Button, Tabs (sliding indicator), FilterChips, Skeleton, Avatar, Toaster; `shared/lib/format.ts`
pure helpers; `features/shared/auth` security API + PasswordField; `entities/*` API wrappers.

### Caregiver APIs (what the UI may do)

| Area                | Endpoint (wrapper)                                                                                                                  | Caregiver can                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Visits              | `GET /booking-occurrences` (`fetchMyOccurrences`, from/to/status, max size 100, sorted by start asc)                                | list                                                           |
| Visit               | `GET /booking-occurrences/{id}`, `POST …/acknowledge`, `POST …/no-show-reports`                                                     | view, accept ("Nhận buổi"), report customer no-show            |
| Care session        | `POST /care-sessions` (check-in), `PATCH …/end` (check-out), tasks add/update                                                       | start/finish visit, tasks                                      |
| Care report / notes | `entities/aftercare`                                                                                                                | write                                                          |
| Availability        | `GET /caregivers/me/schedules`, `PATCH /caregivers/schedules/{id}/status` (CANCELLED + reason)                                      | list, cancel                                                   |
| Work shifts         | `GET /work-shifts?centerId&status=OPEN`, `POST …/registrations`, `GET /work-shifts/registrations/me`, cancel registration (PENDING) | register, cancel                                               |
| Time off            | `GET/POST/DELETE /caregivers/{id}/time-offs`                                                                                        | add, delete                                                    |
| Profile             | `GET /caregivers/me`                                                                                                                | **read only** (`PUT /caregivers/{id}` is ADMIN/CENTER_MANAGER) |
| Account             | `PUT /users/me` (fullName, phoneNumber)                                                                                             | edit phone                                                     |
| Services            | `GET /caregivers/{id}/services`                                                                                                     | read (center assigns)                                          |
| Certificates        | list / create / update / archive, media upload per certificate                                                                      | add, delete                                                    |
| Avatar              | provider media `CAREGIVER_PROFILE` upload/delete                                                                                    | replace                                                        |
| Security            | change password, list/revoke web sessions                                                                                           | all                                                            |
| Notifications       | list, unread count, read one/all, SSE                                                                                               | all                                                            |

No API: reject a visit (only acknowledge), center contact, ratings/earnings, "preview as customer" for the caregiver's
own public card (public endpoint exists but needs the caregiver id — it does: `GET /caregivers/{id}/public`).

### Status mapping (StatusBadge tones)

- Visit (`OccurrenceStatus`): SCHEDULED → amber "Chờ nhận"; ACKNOWLEDGED → blue "Đã nhận"; IN_PROGRESS → teal "Đang
  diễn ra"; COMPLETED → green "Hoàn tất"; CANCELLED / EXPIRED → red/gray; CUSTOMER_NO_SHOW / CAREGIVER_MISSED → gray/red.
  RESERVED / PENDING_ASSIGNMENT never reach a caregiver (booking must be CONFIRMED+).
- Registration: PENDING amber, APPROVED blue, REJECTED red, CANCELLED gray; shift past deadline gray "Hết hạn".
- Availability slot: SCHEDULED (future) blue "Đang mở", past gray, CANCELLED red.
- Certificate: PENDING amber "Chờ duyệt", CENTER_VERIFIED blue "Trung tâm đã duyệt", ADMIN_VERIFIED green "Đã
  xác minh", REJECTED red; expiryDate past → red "Hết hạn", within 30 days → amber "Sắp hết hạn".

## Plan

1. Tokens (`.theme-caregiver`, `features/caregiver/layout/caregiver-theme.css`), caregiver UI kit
   (`features/caregiver/ui`), new shell: collapsible sidebar ≥1024, bottom tab bar on mobile, compact topbar with own
   account menu (VI/EN inside), route progress bar, page transition, toasts.
2. Today page (`/caregiver/today`, index redirects there) + Visits (tabs Sắp tới · Cần nhận · Đã xong · Đã hủy, day
   groups, sticky action bar on detail).
3. Work schedule (`/caregiver/schedule` = Lịch của tôi, `/caregiver/work-shifts` = Đăng ký ca,
   `/caregiver/time-off` = Ngày nghỉ) on one tabbed page.
4. Profile tabs Thông tin · Chứng chỉ · Bảo mật (`/caregiver/profile?tab=`), `/caregiver/security` redirect, bell.

Branch/commit: not done — standing owner rule is "never commit/push", and switching branches in a working tree shared
with the customer session would disrupt it. Proposed commit messages are listed at the end.

## Progress

State 2026-11-03: phases 1–4 done. `pnpm typecheck`, `eslint`, `prettier --check` clean for the caregiver files;
`vitest run` 86 files / 371 tests pass; `pnpm build` passes. Nothing committed (owner commits).

### Browser check

Playwright (installed in the session scratchpad, installed Chrome via `channel: 'chrome'`) against `pnpm dev --port 5175`
with every `/api/v1/*` call answered from fixtures, so no dev data was created or changed. Every page shot at 390 × 844
and 1440 × 900, plus the slot drawer, the time-off drawer and the notification panel: no console error, no horizontal
scroll. Fixed from the shots: topbar `backdrop-blur` made it the containing block of the bell's bottom sheet (removed;
the phone sheet is now portalled to the shell root), a whole-day time off stretched the week grid to 00:00–24:00 (it now
shades the column), item labels centred vertically in tall blocks, calendar toolbar and shift card header wrapping at
390 px. Not tested against the live backend: mutations were verified by unit tests on their payloads only.

### What changed per page

- Shell: `.theme-caregiver` tokens (same brand values as the customer theme), Be Vietnam Pro, collapsible sidebar
  (240 / 72 px, remembered in `localStorage`), bottom tab bar on phones with sliding indicator and badge of visits to
  accept, compact topbar (no repeated page title on desktop; on phones the topbar names the section and the top-level
  H1 is screen-reader only), own account menu with VI/EN, 2 px route progress bar, content-only page transition,
  sonner toasts lifted above the tab bar, `prefers-reduced-motion` respected.
- Hôm nay (`/caregiver/today`, new; `/caregiver` and login land here): greeting, next visit card (time, countdown,
  person, address + Google Maps directions, `tel:` call, allergy callout, one action by state), today's timeline,
  "Cần bạn xử lý", week stats, friendly empty state.
- Buổi chăm sóc: tabs Sắp tới · Cần nhận (badge) · Đã xong · Đã hủy, period chips on history tabs, sticky day headers,
  cards with one main action and a ⋯ menu, skeletons, "Tải thêm". Detail: allergy callout first, care profile
  (conditions, medicines with times, mobility, diet, behaviour, requirements), place + directions + copy, contacts,
  services, progress milestones, sticky action bar on phones, drawn check + toast after accept / finish.
- Lịch làm việc (one page, three routes): week/month calendar with three layers and legend, day strip + agenda on
  phones, slot drawer with "Hủy khung rảnh" (danger, reason, consequence stated); shift sign-up with 3-step strip, chips
  Ca mở · Đã đăng ký · Đã duyệt · Lịch sử, capacity bar, deadline countdown (amber < 24 h), bottom-sheet sign-up with
  note; time off moved out of the profile, add drawer with dd/mm/yyyy + 24 h pickers, "Nghỉ cả ngày", conflict warnings,
  delete with confirmation.
- Hồ sơ: round avatar with camera badge, local preview and progress, completeness bar with what is missing, ⋯ menu
  (view as customers see it, print CV); Thông tin with lock icons on centre-managed fields and inline phone edit;
  Chứng chỉ grid with review / expiry states, files drawer, delete, add drawer with drag-and-drop; Bảo mật with password
  strength + live rules, devices named from the User-Agent, this device first, "Đăng xuất tất cả thiết bị khác",
  5 shown + "Xem tất cả". `/caregiver/security` redirects to the Security tab.

### Files

New: `features/caregiver/{ui,data,today,work,profile}/**`, `features/caregiver/layout/caregiver-theme.css`,
`layout/components/caregiver-{bottom-nav,account-menu,notification-bell,route-progress}.tsx`,
`visits/components/{care-profile,visit-day-groups,visit-logistics,visit-range-filter}.tsx`,
`visits/hooks/use-visit-list.ts`, `routes/caregiver/{today,time-off,security}.tsx`,
`shared/i18n/caregiver/{ui,today,work,me}-resources.ts`, tests under each feature.
Changed: caregiver layout/sidebar/topbar/navigation, visit pages and components, `routes/caregiver/*`,
`shared/i18n/caregiver/{layout,visits,visit-detail}-resources.ts`.
Removed: `features/caregiver/provider/*` (old profile and work-shift pages and tests),
`visits/{current-position.ts,hooks/use-caregiver-visits.ts,components/visit-card.tsx}`.
Outside the caregiver folders (minimal, caregiver-only lines): `app/routes.ts` (caregiver block),
`shared/i18n/resources.ts` (caregiver block), `features/shared/auth/role-path.ts` (caregiver home `/caregiver/today`),
`features/shared/auth/portal-account-menu.test.tsx` (dropped the caregiver row; the caregiver menu is tested in its
own layout test), `docs/ARCHITECTURE.md` (caregiver paragraph). No `/customer` file, no shared component, token or
`app.css` changed. Shared kit reused read-only: Drawer, DatePicker, TimeSelect, Tabs, SegmentedControl, FilterChips,
Button, Avatar, StatusBadge, Skeleton, ConfirmDialog, LocalFilePreview, `shared/lib/format.ts`.

Dependencies: none added.

### Worth moving to the shared design system later

`OverflowMenu`, `StickyActionBar`, `SuccessCheck`, `Countdown`, `DayStrip`, `CaregiverEmpty` / `CaregiverError`
(page-level empty / error), the `cg-*` motion classes (overlap with `cc-*`), `formatPhone` / `relativeTime` /
`directionsUrl` from `caregiver-format.ts`, the User-Agent parser, and a bottom-sheet variant of the notification bell.

### Đề xuất cần backend

1. Caregiver self-edit of bio, experience, date of birth (today `PUT /caregivers/{id}` is ADMIN / CENTER_MANAGER only).
2. Decline an assigned visit with a reason (only acknowledge exists).
3. Date filter (and status list) on `GET /caregivers/me/schedules` and several statuses per request on
   `GET /booking-occurrences`, plus a descending sort for history.
4. Registration list returning the shift date/time (avoids one `GET /work-shifts/{id}` per registration).
5. Notification `refType` for the occurrence so a notification can open the visit.
6. Real upload progress (multipart endpoint has none to report; the UI shows an indeterminate bar).
7. Device name / platform stored with the web session instead of parsing the raw User-Agent.

### Proposed commit messages (owner commits)

- `feat(caregiver): new mobile-first shell, theme and UI kit`
- `feat(caregiver): today page and redesigned care visits`
- `feat(caregiver): work schedule page with calendar, shift sign-up and time off`
- `feat(caregiver): profile tabs with certificates, security and notification sheet`
