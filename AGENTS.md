# CareConnect Web agent guide

This file is the operational source of truth for humans and coding agents working
in this repository. Read `ARCHITECTURE.md` before changing structure or data flow.

## Product scope

- This repository is the production frontend for the CareConnect MVP.
- CareConnect is a platform connecting family members with home caregivers.
  Users can browse caregiver profiles, review qualifications, experience,
  certifications, and ratings before booking care sessions by hour or by day.
- The product is a responsive web application serving four roles: **Customer**
  (book care, view reports, rate caregivers), **Center Manager** (manage center
  caregivers, services, bookings, assignments, and center statistics),
  **Caregiver** (view assigned schedules, update task status, submit care
  reports — primarily via mobile), and **Admin** (manage centers, customers,
  global service catalog, platform policies, escalated complaints, and
  system-wide statistics).
- CareConnect backend services own business rules, authorization, persistence,
  jobs, and the authoritative OpenAPI contract. IdentityService is Spring Boot.

## Stack

- React 19 and React Router 8 in Framework Mode with SPA rendering
- Vite 8 and Tailwind CSS 4
- TanStack Query 5 for remote/server state
- Orval 8 for OpenAPI client, hook, Faker factory, and MSW handler generation
- Vitest and Testing Library
- TypeScript strict mode, ESLint flat config, Prettier, pnpm

For React Router work, also read `.agents/skills/react-router/SKILL.md` and its
Framework Mode reference. Do not apply Data or Declarative Mode patterns here.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm api:validate
pnpm api:generate
pnpm dev
pnpm test
pnpm check
```

Run `pnpm api:generate` after every `openapi/openapi.yaml` change. Before handing
off a change, run the smallest relevant check and then `pnpm check` for a complete
feature or architecture change.

## Source boundaries

```text
app/routes      URL, metadata, navigation, route loaders/actions
app/providers   root framework providers
app/features    user-facing business capabilities
app/entities    reusable domain concepts, created only when needed
app/shared      configuration, API, UI primitives, utilities, test support
```

Allowed dependency direction:

```text
routes -> features -> entities -> shared
   |          |                     ^
   +----------+---------------------+
providers --------------------------+
```

- A route module must stay thin. Move reusable rendering and workflows to a feature.
- A feature must not import another feature's internals. Promote genuinely shared
  domain concepts to `entities/` or generic code to `shared/`.
- `shared/` must never import from `features/`, `entities/`, or `routes/`.
- Do not create barrels that hide dependency cycles.
- Do not add an abstraction until there is a concrete second consumer or framework
  boundary that requires it.

## Data and API rules

- Remote state belongs in TanStack Query. Do not fetch remote data from ad-hoc
  `useEffect` calls.
- React Router loaders/actions are for URL-dependent orchestration, redirects, and
  critical prefetch; they are not a second cache.
- `openapi/openapi.yaml` is the committed frontend snapshot of the backend contract.
- Everything below `app/shared/api/generated/` is generated. Never edit it by hand.
- Every operation must have exactly one declared OpenAPI tag and a unique
  `operationId`. Request body components end in `Request`; successful response
  components end in `Response`. `pnpm api:validate` enforces this before Orval runs.
- Generated output is organized as `api/<tag>` (fetch functions/query hooks),
  `contracts/<tag>` (request/response/domain types), and `mocks/<tag>`
  (Faker factories and MSW handlers). Cross-tag types remain at the contracts root.
- Import Faker factories or MSW handlers only from tests, stories, or explicit dev
  tooling. Never import them into production route/feature code.
- `VITE_*` values are public in browser bundles. Never store secrets there.
- Authorization decisions must be enforced by the backend even when the UI hides an
  action based on role.

## Localization rules

- Vietnamese (`vi`) and English (`en`) are supported through typed i18next resources
  in `app/shared/i18n/`. A component renders copy with `t('namespace.key')`; it does
  not contain a Vietnamese or English UI literal.
- This applies to headings, buttons, empty/error/loading states, tooltips,
  placeholders, `alt`, `title`, `aria-label`, validation messages, toasts, and modal
  copy. Brand/domain data returned by the API is not translated unless the contract
  explicitly models a translation key.
- Add the key to both `resources.vi` and `resources.en` in the same change. Do not use
  an English string as a translation key.
- Organize translation resources by portal and feature under
  `app/shared/i18n/<role>/<feature>-resources.ts`. Each module exports both `vi`
  and `en` objects with matching key structures; update them together. Shared
  application copy belongs in `app/shared/i18n/common-resources.ts`; portal menu
  and footer copy belongs in that portal's `layout-resources.ts`.
- Keep `resources.ts` as the explicit composition entry point and source of
  `SupportedLanguage`, without inline translation copy. Resource modules contain
  static data, never import features/entities/routes, and never import the
  composition entry point. Preserve existing translation keys when reorganizing
  files and retain typed i18next resources. Create role folders only when needed.
- `project/no-hardcoded-ui-text` blocks literal JSX and accessibility copy. The rule
  is a guardrail, not permission to hide literals in variables; reviews must reject
  user-visible copy outside the i18n layer.
- Persisted browser preference uses `localStorage`; `vi` is the deterministic
  build/hydration fallback. Dates, currencies, percentages, and numbers use `Intl`
  with the active locale.

## Configuration file map

- `vitest.config.ts` configures test discovery, the jsdom browser-like environment,
  global setup, and path resolution. It is not a production/Vite build config.
- `nginx.conf` serves `build/client` in the Docker/VPS image and falls back unknown
  routes to `index.html`. Vercel does not read this file.
- `react-router.config.ts` selects SPA rendering and enables the official Vercel
  preset. On Vercel set the project root to this package; the preset handles the
  React Router build. Keep `/api` on a reachable backend/ingress.
- `openapi/` stores the reviewed, versioned backend contract snapshot consumed by
  Orval; it is input, not handwritten frontend DTO code.
- `pnpm-workspace.yaml` marks this package as a pnpm workspace root and centralizes
  dependency-resolution/build-script policy even though it currently has one
  package. `allowBuilds` is an explicit supply-chain allowlist; do not broaden it
  casually.

## Quality rules

- Preserve strict TypeScript; do not introduce `any` to bypass a contract.
- Add behavior-focused tests next to features. Prefer accessible queries.
- Keep a clean browser console and verify changed routes in a real browser.
- Keep loading, empty, error, and permission-denied states explicit for API screens.
- Do not manually edit `pnpm-lock.yaml`; change dependencies through pnpm.
- Do not commit `.env`, build output, coverage, or generated React Router types.
- Update `ARCHITECTURE.md` when changing a boundary, public interface, rendering
  model, API generation policy, or deployment assumption.

## AI workflow

1. Read this file and `ARCHITECTURE.md`.
2. Inspect the nearest feature and tests before editing.
3. State any assumption that changes product behavior or access control.
4. Make one coherent slice; generate rather than hand-edit API code.
5. Run relevant checks and report exact results plus any remaining risk.
