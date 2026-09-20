# ADR 0002 — Base UI is an implementation detail behind Shalgam UI

**Status:** accepted

## Context

Base UI provides unstyled, accessible primitives with excellent behaviour (focus trapping, positioning, typeahead, form-field wiring). Letting application code use it directly would spread a third-party API across dozens of feature files and make future primitive changes expensive.

## Decision

Only `packages/ui` imports `@base-ui-components/react`. Each Shalgam component exposes a smaller, opinionated API (`<Select options value onValueChange />`, `<ConfirmDialog tone="danger" />`) and applies tokens. Where Base UI's default semantics do not fit — a `Button` rendered as a router `Link` would receive `role="button"` — Shalgam UI renders the element itself so link semantics are preserved.

Validation state is deliberately _not_ delegated to Base UI's `Field` validity tracking: React Hook Form + Zod own validation in the apps and `FormField` only renders what it is told (`invalid`, message), while still using Base UI for id/aria wiring.

## Consequences

- Apps depend on ~60 stable Shalgam components; Base UI can be upgraded or replaced package-wide.
- Every Shalgam component must exist before a feature can use it, which keeps the design system honest and complete.
