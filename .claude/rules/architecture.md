# Architecture

Follow `../../AGENTS.md` and `../../ARCHITECTURE.md` as the canonical project rules.
Keep React Router modules thin and preserve `routes -> features -> entities -> shared`.
Never hand-edit `app/shared/api/generated/`; regenerate it from OpenAPI.
