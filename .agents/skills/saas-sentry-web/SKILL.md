---
name: careconnect-web
description: Use when implementing, debugging, reviewing, testing, or generating API code in the CareConnect React Router web client, especially for route modules, feature boundaries, TanStack Query, Orval, Faker/MSW mocks, or frontend quality gates.
---

# CareConnect Web

Build changes that preserve the repository's modular boundaries and leave evidence
from the relevant quality gates.

## Workflow

1. Read `../../../AGENTS.md` and `../../../ARCHITECTURE.md` completely.
2. If the task touches routes, loaders, actions, metadata, or rendering, also read
   `../react-router/SKILL.md` and only its Framework Mode guidance.
3. Inspect the closest route, feature, generated API surface, and tests before
   selecting a boundary.
4. Keep route modules thin. Put user workflows in `app/features`, reusable domain
   presentation in `app/entities`, and generic infrastructure in `app/shared`.
5. For API changes, edit `openapi/openapi.yaml` or `orval.config.ts`, then run
   `pnpm api:validate` and `pnpm api:generate`. Never hand-edit
   `app/shared/api/generated`.
6. Keep Faker/MSW imports in test or explicit development-only code.
7. Put every user-visible/accessibility string in both typed `vi` and `en` resources;
   never bypass the hardcoded-UI-text rule.
8. Add or update a behavior-focused test and complete the applicable checks in
   `references/verification.md`.
9. Report the commands run, exact failures, assumptions, and any remaining risk.

Do not introduce a library, global state container, repository wrapper, or shared
component without a concrete requirement and consumer.
