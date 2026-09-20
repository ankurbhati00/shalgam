# ADR 0006 — DataTable on TanStack Table v9 with an explicit feature set

**Status:** accepted

## Context

TanStack Table v9 replaces `useReactTable` with `useTable` and makes every feature opt-in through `tableFeatures()`. Feature-gated APIs and state only exist when registered, and the `TFeatures` generic flows through columns, rows and cells.

## Decision

`packages/ui/src/components/data-table/features.ts` registers exactly what Shalgam tables need — sorting, row selection, column visibility, pagination and a typed `columnMeta` (alignment, numeric, responsive hiding, width). `createDataTableColumnHelper<T>()` binds the helper to that feature set so admin features get precise types without threading generics. `useDataTable` supports controlled slices (URL-driven sorting/pagination in manual mode) or internal state (client-side tables), and `DataTable` renders semantic `<table>` markup with `aria-sort`, skeleton/empty/error states and optional virtualisation.

## Consequences

- Smaller bundles (no `stockFeatures`), and TypeScript errors when a feature is used without being registered.
- Adding grouping or column pinning later means extending one features object, not every table.
