# ADR 0001 — Workspace packages are consumed as TypeScript source

**Status:** accepted

## Context

The monorepo has nine packages and two apps. The conventional approach builds each package to `dist/` and consumes the output, which means a watcher per package, stale-build bugs and duplicated type-checking.

## Decision

Every package's `package.json` `exports` points at `src/*.ts`. Vite, Vitest and Storybook compile the sources directly; `tsc -b` type-checks the whole graph as one program. Tailwind picks up design-system class names through an explicit `@source './'` in `packages/ui/src/styles.css`, and each app adds its own sources with `@source './'`.

## Consequences

- No build step between editing a component and both apps seeing it; no `turbo build` dependency for `dev`.
- Packages are not publishable as-is. If Shalgam UI ever needed to be published, a `tsdown`/`vite lib` build would be added to `packages/ui` without changing any consumer.
- Vite's dependency optimiser only pre-bundles third-party modules; the lazily imported mock backend is listed in `optimizeDeps.include` so the first dev load never hits a mid-session re-optimisation reload.
