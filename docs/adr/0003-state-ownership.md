# ADR 0003 — Server state, client state and URL state have different owners

**Status:** accepted

## Decision

| State                                                                     | Owner                                                            | Rationale                                                                |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Server data (products, orders, analytics…)                                | TanStack Query                                                   | caching, invalidation, retries, background refresh, request cancellation |
| Client intent (cart, chosen location, recently viewed, admin preferences) | Zustand stores inside the owning feature, persisted where useful | small, synchronous, no server round-trip                                 |
| Navigational state (search, filters, sort, page, date range, tab)         | React Router search params                                       | shareable, bookmarkable, back-button-aware                               |
| Transient UI (dialog open, checkout selections)                           | React `useState`                                                 | scoped to one screen                                                     |

`@shalgam/query` centralises `queryOptions` and a hierarchical key factory so every feature hook shares fetchers, keys and stale times. The cart stores a product **snapshot** (price at add-time); the server re-prices at checkout and product queries remain the source of truth for stock.

## Consequences

- No Redux-style global store; no duplicated server data.
- Table state in the admin is controlled by the URL (`useDataTable` in manual mode), so a filtered, sorted page of orders is a link.
