# ADR 0004 — The mock backend is a real backend that happens to run in the browser

**Status:** accepted

## Context

Portfolio projects usually import JSON fixtures directly into components, which hides latency, errors, pagination and mutations — exactly the things a senior frontend has to handle.

## Decision

`@shalgam/mock-api` implements the REST API with MSW: a seeded, deterministic in-memory database (persisted to `localStorage`, versioned by `SEED_VERSION`), handlers with pagination/sorting/filtering/search, HTTP status codes, validation error envelopes, artificial latency, forced failures (`?mockError=500`) and a live-order simulator. It is loaded lazily in `main.tsx` only, and the same handlers run in Vitest through `msw/node`.

## Consequences

- Feature code is identical against the mock and a real backend; switching is two environment variables.
- Tests are integration tests by default — they exercise the query layer, the transport and the handlers.
- Bundled photography (~7 MB) lives in the package's assets and is resolved with `import.meta.glob`, so the demo works offline.
