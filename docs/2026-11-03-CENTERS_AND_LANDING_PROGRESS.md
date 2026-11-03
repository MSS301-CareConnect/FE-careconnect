# Centers directory and landing page (CR-5, CR-6) — 2026-11-03

Status: implemented, unit-tested; not yet checked in a real browser.

## CR-5 — landing page and footer

- `shared/ui/site-footer.tsx`: deep brand band (`bg-brand-900`, inverse tokens), uppercase column headings, a visible
  divider above the copyright row, the emergency line as a pill. Links and the signed-in variant unchanged; "Centers" added
  to Explore.
- `features/home/home-page.tsx`: the trust item `support` (hotline + hours, duplicated by the footer) became `refunds`
  ("Thanh toán & hoàn tiền minh bạch"). A compact photo section returns between "How it works" and the trust band:
  `public/images/care-for-families.jpg` (1600×900 JPEG, 145 KB, made with PIL from the 2.15 MB PNG), `width`/`height`,
  `loading="lazy"`, i18n alt, headline and three short points (`home.reasons*`, trimmed; `reasonsDescription` removed).
- `public/images/care-for-families-background.png` is no longer referenced and can be deleted by the owner.

## CR-6 — multi-center browsing

- Modes: "Tất cả trung tâm" (null) and a chosen center. Explicit choices go through
  `entities/care-center/use-choose-center.ts` (info toast "Đang xem trung tâm X", `shared/ui/app-toast.ts#toastInfo`).
- Header chip renders for visitors (from `sm`); a visitor's 401 shows the sign-in state, a customer's 401 keeps retry.
  The picker links "Xem tất cả trung tâm" to the directory; the null option is now named "Tất cả trung tâm".
- Routes `/customer/centers` and `/customer/centers/:centerId` (browse layout) → `features/customer/centers`.
- `fetchCenterServices` promoted to `entities/care-catalog/center-services.ts` (services page re-exports it).
- Caregiver cards show a center badge in all-centers mode; service cards there add "So sánh các trung tâm".
- i18n: `customer/centers-resources.ts` (new, composed in `resources.ts` as `customer.centers`), `customer.nav.centers`,
  `customer.centerPicker.{viewing,browseAll,compare,toast}`.
- BE: `GET /api/v1/care-centers/public[/{centerId}]` anonymous (ProviderService + ApiGateway).

## Not done / follow-up

- Services, caregiver catalog and booking policy still require a session; the center page shows sign-in hints.
- Real-browser check with a mocked API was not run.
