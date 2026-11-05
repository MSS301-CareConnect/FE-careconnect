# Work-shift flow rework — 2026-11-05

Center creates a shift → caregiver signs up → center approves → availability slot → families book / center assigns →
caregiver answers → check-in → check-out. Done in BE (ProviderService only) and FE web; Mobile untouched. Nothing
committed. A parallel session worked on BookingService / notifications in the same tree at the same time.

## Decisions (owner, 2026-11-05)

| #   | Decision                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Shift types MORNING / AFTERNOON / EVENING / NIGHT / FULL_DAY / CUSTOM; DAILY / WEEKLY stay readable and editable when unchanged. Mobile shows unknown codes raw until it is updated. |
| 2   | Capacity 1–50 and note ≤ 500 apply on create and when the value changes (old rows still editable).                                                                                   |
| 3   | Notifications for shift events: **deferred** (needs `NotificationType` + CHECK in BookingService).                                                                                   |
| 4   | Response deadline / decline per center-assigned visit and late check-in alert: **deferred** (BookingService).                                                                        |
| 5   | Time off overlapping an approved shift: FE warning only (availability already subtracts time off).                                                                                   |
| 6   | No new status values (mobile compatibility). Check-in window stays policy based (D22).                                                                                               |
| 7   | Repeat creation (batch API) and a history built from existing data (no audit table): done.                                                                                           |

## Backend (ProviderService)

- Effective status on every read and list filter (`util/WorkShiftStates`), `WorkShiftLifecycleScheduler` every minute
  (`PROVIDER_SHIFT_LIFECYCLE_CRON`, `-` disables): OPEN past start or deadline → CLOSED, ended → COMPLETED, pending
  sign-ups of started shifts → REJECTED with a system reason.
- Field-level codes 4309–4316, 4355–4356; create accepts DRAFT / OPEN only; PUT cannot reopen a past / expired / full
  shift nor return to DRAFT with sign-ups; started shifts are read-only.
- New: `GET /work-shifts/statistics`, `PATCH /{id}/status`, `POST /{id}/cancel` (cascade, Booking check outside the
  transaction), `POST /centers/{id}/batch`, `PATCH /{id}/registrations/review`; list filters `shiftType`, `hasVacancy`,
  `hasPending`; `pendingCount`, `cancellationReason`, `cancelledAt` on shifts; registrations filter by `status` and carry
  the shift summary and the availability slot (`scheduleId/Status/Version`).
- Sign-up blocked by an overlapping approved shift (4401) or time off (4355), checked at sign-up and approval.
- SQL: `BE/ProviderService/schema/changes/2026-11-05_work_shift_lifecycle.sql` (additive columns + one-time status
  sync; the "string"/"STRING" clean-up is commented out for the owner to decide).

## Frontend

- Shared: `Modal` `size` / `beforeClose` / `ModalColumns`, `FilterChips` counts, `NumberStepper`,
  `shared/lib/phone.ts` (also "+84 0912…" and 028 landlines), `entities/provider/work-shift.ts`, DRAFT badge, shift
  type labels in `common.status.shiftType`.
- Center Manager `/center-manager/work-shifts`: rewritten (page + components + hooks, `centerManager.workShifts` copy);
  see `ARCHITECTURE.md`. The layout now mounts the shared `Toaster`.
- Caregiver: content width 1240 px; "Open shifts" fixed (only open shifts not signed up for), no request per sign-up,
  confirm dialog with overlap / time-off warnings, withdraw an approved sign-up with a reason; visits tab "Needs your
  answer" merges booking requests and assigned visits (one badge, `/caregiver/requests` redirects); Today shows booking
  requests and open shifts on an empty day; profile has one "managed by the center" banner; certificate and time-off
  forms are dialogs; recipient gender is translated.

## Checks

- ProviderService `mvnw test`: 82 / 82 (10 new flow tests).
- FE: eslint, `tsc`, vitest 98 files / 422 tests, node tests 3 / 3, `react-router build` — all pass; prettier clean for
  every touched file (only `pnpm-lock.yaml` is flagged repo-wide, not touched here).
- Browser: headless Chrome walkthrough of both portals against a stateful mock API (session scratchpad), 23 / 23
  checks, no console errors, no horizontal scroll at 390 px. Not yet run against the live Docker stack.

## Owner actions

1. Apply the SQL change on `CARECONNECT_PROVIDER`, then rebuild / restart the ProviderService container
   (`ddl-auto: validate` needs the two new columns).
2. Run the live E2E (manager creates → caregiver signs up → approve → withdraw / cancel) with real accounts.
3. Later: shift notifications and the BookingService items deferred above; update the Mobile shift-type labels.
