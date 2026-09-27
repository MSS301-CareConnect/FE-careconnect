# SaaS-Sentry Web instructions

Use `AGENTS.md` and `ARCHITECTURE.md` as the canonical guidance. This is React Router
Framework Mode configured as an SPA. Keep route modules thin, use TanStack Query for
remote state, and generate API code with Orval. Never hand-edit generated files.
Add tests and run the relevant pnpm quality gates before proposing completion.
Use typed vi/en i18n keys for every user-visible/accessibility string, and preserve
the generated `api/<tag>`, `contracts/<tag>`, `mocks/<tag>` contract structure.
