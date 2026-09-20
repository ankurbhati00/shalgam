# ADR 0005 — There is no `packages/stores`

**Status:** accepted

## Context

The original brief suggested a shared `stores` package. On inspection, no client state is shared between the storefront and the admin: the cart, the selected delivery location and the shopper's recently viewed products belong to the storefront; sidebar and theme preferences belong to the admin.

## Decision

Zustand stores live inside the feature that owns them (`features/cart/store/cart-store.ts`, `features/location/store/location-store.ts`). Cross-app sharing would only apply to the _pattern_ (persist middleware, selectors), which is small enough to repeat.

## Consequences

- One fewer package with no real consumer.
- If cross-app client state ever appears (for example a shared "impersonate customer" session), a package can be introduced then, with an actual requirement behind it.
