# Web verification

Run the smallest relevant set while iterating, then the complete gate for a feature
or architecture change.

```bash
pnpm api:generate   # when the contract or Orval config changed
pnpm prettier
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For browser-facing work, also verify the built or development page in an isolated
browser profile:

- expected route and visible state render;
- console has no errors or warnings;
- headings and interactive controls have accessible names;
- API requests use the expected `/api` URL and are not duplicated;
- direct navigation to a client route works through the host fallback.

