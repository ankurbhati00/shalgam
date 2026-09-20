<p align="center">
  <img src="packages/ui/.storybook/public/favicon.svg" width="56" height="56" alt="" />
</p>

<h1 align="center">Shalgam</h1>

<p align="center">
  A multi-product Indian quick-commerce platform powered by a shared React/TypeScript design system.<br/>
  <strong>Storefront</strong> · <strong>Admin</strong> · <strong>Shalgam UI</strong> · mock REST backend · one monorepo.
</p>

> Shalgam is a fictional grocery platform built as a senior frontend engineering portfolio project. Every product, customer, order and brand in it is invented. Payments are simulated. The interesting part is not the grocery store — it is the architecture underneath it.

---

## Contents

- [What is in the box](#what-is-in-the-box)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Monorepo structure](#monorepo-structure)
- [Applications](#applications)
- [Shalgam UI (design system)](#shalgam-ui-design-system)
- [State management](#state-management)
- [API architecture](#api-architecture)
- [Mock backend](#mock-backend)
- [Replacing the mock backend with a real one](#replacing-the-mock-backend-with-a-real-one)
- [Testing](#testing)
- [Storybook](#storybook)
- [Deployment (Vercel + GitHub Actions)](#deployment-vercel--github-actions)
- [Testing on a phone](#testing-on-a-phone)
- [Developer commands](#developer-commands)
- [Architectural decisions](#architectural-decisions)
- [Accessibility, responsiveness and performance](#accessibility-responsiveness-and-performance)
- [Imagery and licensing](#imagery-and-licensing)

## What is in the box

| Product                | Path                | What it does                                                                                                                                                                                                                       |
| ---------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Shalgam Storefront** | `apps/storefront`   | Consumer quick-commerce app: home feed, categories with URL-driven filters, search with typeahead, product details, persisted cart, checkout (addresses, slots, mock payments), live order tracking, order history, profile.       |
| **Shalgam Admin**      | `apps/admin`        | Operations console: dashboard KPIs and charts, orders (data table with bulk actions), products (CRUD with typed forms), categories, inventory and stock ledger, customers, delivery, analytics, reports with CSV export, settings. |
| **Shalgam UI**         | `packages/ui`       | The shared design system — ~60 components built on Base UI + Tailwind CSS, documented in a branded Storybook.                                                                                                                      |
| **Mock REST API**      | `packages/mock-api` | An MSW-powered backend with a seeded, persisted in-memory database, realistic latency, validation errors and a live order simulator.                                                                                               |

## Quick start

Requirements: **Node ≥ 22.12** (Node 24 LTS recommended, see `.nvmrc`) and **pnpm ≥ 10**.

```bash
pnpm install

pnpm dev:storefront   # http://localhost:5173
pnpm dev:admin        # http://localhost:5174
pnpm storybook        # http://localhost:6006

pnpm check            # typecheck + lint + test + build for every workspace
```

Both apps boot the mock backend automatically. Set `VITE_API_MOCK=false` (see each app's `.env.example`) to talk to a real API at `VITE_API_BASE_URL`.

## Architecture

```text
                    SHALGAM
                       │
          ┌────────────┴────────────┐
          │                         │
      STOREFRONT                  ADMIN
          │                         │
       Features                  Features
          │                         │
          └────────────┬────────────┘
                       │
                   SHALGAM UI
                       │
                    Base UI
                       │
                 Design Tokens

                       │
             ┌─────────┴─────────┐
             │                   │
          Zustand          TanStack Query
             │                   │
       Client State         Server State
                                 │
                              API Layer
                                 │
                                MSW
                                 │
                           Mock REST API
```

Two boundaries are enforced everywhere:

1. **Application → Feature → Shalgam UI → Base UI → Tokens.** Feature code composes Shalgam UI components; it never imports Base UI, so the primitive layer can be swapped without touching an application.
2. **Feature hook → TanStack Query → API service → API client → (MSW | real backend).** Components never call `fetch`, never import JSON, and never know whether the backend is mocked.

Packages are consumed **as TypeScript source** (`exports` point at `src/`), so there is no build step between editing a component and both apps seeing it, and type-checking flows across the workspace.

## Monorepo structure

```text
shalgam/
├── apps/
│   ├── storefront/          Consumer app (Vite + React Router 8 data mode)
│   └── admin/               Operations app (Vite + React Router 8 data mode)
├── packages/
│   ├── ui/                  @shalgam/ui — design system + Storybook
│   ├── design-tokens/       @shalgam/tokens — CSS custom properties + Tailwind @theme
│   ├── types/               @shalgam/types — domain and API contract types
│   ├── utils/               @shalgam/utils — INR/date/string helpers (Intl-based, no deps)
│   ├── api-client/          @shalgam/api-client — fetch transport, ApiError, resource services
│   ├── query/               @shalgam/query — QueryClient defaults, query-key factory, queryOptions
│   ├── mock-api/            @shalgam/mock-api — MSW handlers, seeded DB, latency/error simulation
│   ├── eslint-config/       Shared flat ESLint configs (base / react / storybook)
│   └── tsconfig/            Shared TypeScript configs
├── scripts/visual-qa.mjs    Playwright screenshot runner for both apps
├── scripts/responsive-audit.mjs  Overflow + touch-target audit of every storefront route per width
├── scripts/storefront-flows.mjs  Cart, search, checkout, orders and profile flows on phone + desktop
├── docs/adr/                Architecture decision records
├── turbo.json               Task graph (dev, build, typecheck, lint, test, storybook)
└── pnpm-workspace.yaml
```

Inside each app, code is organised by **feature**, never by file type:

```text
apps/storefront/src/
├── app/                 bootstrap, providers, router, layouts, shell (header, footer, bottom nav)
├── features/
│   ├── catalog/         api/ components/ hooks/ pages/ store/
│   ├── cart/            store/ components/ pages/ api/
│   ├── checkout/        api/ components/ pages/
│   ├── addresses/       api/ components/ schemas/
│   ├── orders/          api/ components/ pages/
│   ├── location/        api/ components/ hooks/ store/
│   ├── profile/         pages/
│   └── session/         api/
├── hooks/               cross-feature hooks (URL search-param state)
├── lib/                 api bootstrap, query client
└── test/                setup (MSW node server), render helpers, factories
```

Domain-specific components (`ProductCard`, `CartDrawer`, `OrderTracking`, `AddressForm`) live inside their feature. Only genuinely reusable, domain-agnostic components live in `@shalgam/ui`.

## Applications

### Storefront

Spacious, image-led and mobile-first. Highlights:

- **Home** — location selector with promised ETA, promo tiles, category grid, product rails (popular, buy again, deals, recommended, recently viewed).
- **Category / Search** — subcategory pills, price range, highlight filters, in-stock toggle, sorting and pagination, all in the URL (`?sub=…&tags=deal&min=50&sort=price_asc&page=2`) so listings are shareable.
- **Product** — gallery, price with MRP and discount, add-to-cart stepper, highlights, product information, frequently-bought-together and related rails; visits feed a persisted “recently viewed” list.
- **Cart** — persisted with Zustand, server-priced bill (delivery fee, free-delivery nudge, handling fee, savings).
- **Checkout** — saved addresses with add/edit (React Hook Form + Zod, server errors mapped to fields), delivery slots, mock UPI/card/COD, rider tip, notes; the place-order mutation reserves stock and invalidates product queries.
- **Orders** — active/past tabs; detail page with a **live timeline** (the mock backend advances in-flight orders as wall-clock time passes and the page polls every 5 s), bill, cancellation with confirmation, and one-click reorder that re-validates every item against the live catalogue.

### Admin

Dense, analytical and calm, sharing every token and component with the storefront. Data tables are server-driven (sorting, filtering and pagination in the URL, `rowCount` from the API) and support row selection, bulk actions, column visibility and CSV export. Forms are React Hook Form + Zod with server-side validation mapping. Charts use Recharts with the token palette. See `apps/admin/src/features/*`.

## Shalgam UI (design system)

`@shalgam/ui` wraps [Base UI](https://base-ui.com) primitives in an opinionated, token-driven API. Base UI supplies behaviour and accessibility (focus management, roving tab index, typeahead, positioning, form-field wiring); Shalgam UI supplies the visual language and a smaller surface area.

| Group       | Components                                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations | `Button`, `IconButton`, `Text`, `Heading`, `Link`, `Badge`, `Avatar`, `Separator`, `Card*`, `Container`, `Skeleton`, `Spinner`                                                                 |
| Forms       | `FormField/Label/Description/Message`, `Fieldset`, `Input`, `SearchInput`, `Textarea`, `Select`, `MultiSelect`, `Checkbox`, `Radio`, `RadioCard`, `RadioGroup`, `Switch`, `Slider`             |
| Navigation  | `Navbar`, `Sidebar*`, `Breadcrumb`, `Tabs/Tab/PillTab/TabPanel`, `Pagination`, `PageSizeSelect`, `BottomNavigation`                                                                            |
| Overlays    | `Dialog*`, `ConfirmDialog`, `Drawer*`, `Popover*`, `Tooltip`, `DropdownMenu*`, `toast` + `ToastProvider`                                                                                       |
| Data        | `Table*`, `DataTable` (+ `useDataTable`, toolbar, column toggle, selection bar, pagination, virtualisation), `StatusBadge`, `StatCard`, `Progress`, `EmptyState`, `ErrorState`, `LoadingState` |
| Commerce    | `Price`, `QuantitySelector`, `Rating`, `ProductImage`, `ProductBadge`, `OrderStatus`, `PaymentStatus`, `DeliveryStatus`, `InventoryStatus`, `OrderTimeline`                                    |

Design tokens live in `@shalgam/tokens` as CSS custom properties. Primitive scales (`brand`, `neutral`, status colours, tints, chart palette, radius, shadows, motion) are declared with Tailwind's `@theme`; semantic tokens (`--color-surface`, `--color-text-muted`, `--color-primary`, …) are defined on `:root` and re-mapped under `[data-theme="dark"]`. Components reference only semantic tokens, so theming needs no component changes. The lime brand colour is reserved for primary actions, selection and key metrics.

## State management

| Kind               | Owner                                    | Examples                                                                                                       |
| ------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Server state**   | TanStack Query via `@shalgam/query`      | products, categories, orders, customers, inventory, deliveries, analytics, reports, settings, checkout options |
| **Client state**   | Zustand, inside the feature that owns it | cart (persisted), selected location, recently viewed, admin sidebar/theme preferences                          |
| **URL state**      | React Router search params               | search query, filters, sort, page/page size, date ranges, active tab                                           |
| **Local UI state** | React state                              | dialog open flags, checkout step choices, form drafts                                                          |

Rules that are actually enforced in code: server data is never copied into Zustand (the cart stores a product _snapshot_ the server re-prices at checkout); `queryOptions` builders are defined once in `@shalgam/query` and composed by feature hooks; mutations invalidate through the hierarchical key factory (`queryKeys.orders.all`, `queryKeys.orders.detail(id)`), with optimistic updates where a rollback is cheap (address deletion, order status changes).

## API architecture

```text
useProducts(params)                 feature hook (apps/*/src/features/catalog/api)
  └─ productQueries.list(params)    queryOptions + key (packages/query)
       └─ api.catalog.listProducts  typed service (packages/api-client)
            └─ apiClient.get()      fetch transport: base URL, JSON, timeouts, ApiError
                 └─ GET /api/products?categorySlug=…&sort=…   (MSW today, real API tomorrow)
```

- `createApiClient({ baseUrl })` handles JSON, query-string serialisation (arrays as repeated keys), timeouts, abort signals from TanStack Query and error normalisation into `ApiError` (`status`, `code`, field `details`, `isRetryable`).
- Services are plain functions returning typed promises: `api.orders.create(input): Promise<Order>`.
- Contracts live in `@shalgam/types`: domain models (`Product`, `Order`, `Delivery`, …), list params, inputs, `Paginated<T>` and `ApiErrorBody`.

## Mock backend

`@shalgam/mock-api` behaves like a real backend rather than a fixture file:

- **Seeded database** — 106 products across 12 categories (39 subcategories) with bundled photography, 65 customers with Bengaluru addresses, ~650 orders over the last 90 days with realistic timelines, inventory with a stock ledger, 14 delivery partners and ~600 deliveries. Generated deterministically from a seed so the demo is stable, and persisted to `localStorage` so mutations survive a reload (re-seeded automatically when the seed version changes or after 12 hours).
- **Real REST semantics** — pagination, sorting, filtering and search on every list endpoint; 201/204/404/409/422 responses; field-level validation errors (`{ error: { code, message, details } }`).
- **Latency and failure injection** — 160–620 ms latency by default (disabled in tests); force any request to fail with `?mockError=500` or the `x-mock-error` header; `configureMockApi({ errorRate })` for chaos demos.
- **Live simulation** — in-flight orders advance through preparing → packed → out for delivery → delivered as time passes, riders get assigned, and analytics recompute from the current data.
- **One implementation, two runtimes** — the same handlers run in the browser (`setupWorker`) and in Vitest (`setupServer`).

## Replacing the mock backend with a real one

The mock is loaded lazily in `apps/*/src/main.tsx` and nowhere else:

```ts
if (USE_MOCK_API) {
  const { startMockApi } = await import('@shalgam/mock-api/browser')
  await startMockApi()
}
```

To point at a real API: set `VITE_API_MOCK=false` and `VITE_API_BASE_URL=https://api.example.com/v1`, and implement the endpoints listed in `packages/api-client/src/services/*` with the contracts in `@shalgam/types`. No feature code changes. The response shapes (`Paginated<T>`, error envelope) are documented by the handlers in `packages/mock-api/src/handlers`.

## Testing

Vitest 5 + Testing Library, with the MSW node server booted in each app's `src/test/setup.ts` so tests exercise real request/response boundaries.

| Where                 | What is covered                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/utils`      | INR formatting with lakh grouping, relative dates, string helpers                                                                                                          |
| `packages/api-client` | query-string serialisation, JSON transport, `ApiError` mapping, reconfiguration                                                                                            |
| `packages/mock-api`   | product listing/filtering/sorting, validation, forced errors, order placement and stock reservation, status transitions, analytics KPIs                                    |
| `packages/ui`         | Button semantics and loading state, DataTable sorting/selection, FormField accessibility wiring, QuantitySelector limits                                                   |
| `apps/storefront`     | cart store rules and persistence, add-to-cart stepper, cart drawer with server-priced fees, checkout validation → order placement → navigation, URL-driven listing filters |
| `apps/admin`          | orders table filtering via URL, product form validation and submission, inventory adjustment                                                                               |

```bash
pnpm test                       # everything through Turborepo
pnpm -C apps/storefront test    # one workspace
```

## Deployment (Vercel + GitHub Actions)

The storefront, the admin and the Storybook are three Vercel projects deployed from one repository by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): every push to `main` builds all three here and publishes them (`vercel build` + `vercel deploy --prebuilt --prod`), and every pull request gets preview deployments. Each project's settings live in a `vercel.json`: the storefront builds from the [repository root](vercel.json) so a plain "Import Git Repository" of this repo deploys it with no settings, while the [admin](apps/admin/vercel.json) and [Storybook](packages/ui/vercel.json) configs apply when a project's **Root Directory** is set to `apps/admin` or `packages/ui`. They pin pnpm 12, define the build command and output directory, add SPA rewrites for React Router and cache headers, and use `turbo-ignore` so a commit that does not touch a project skips its build.

Importing through the Vercel dashboard instead of the script works too: import the repository three times, name the projects `shalgam`, `shalgam-admin` and `shalgam-storybook`, leave the Root Directory empty for `shalgam` and set it for the other two. A deployment that shows `404: NOT_FOUND` almost always means the Root Directory does not match the config above.

One-time setup, from a machine with the [Vercel CLI](https://vercel.com/docs/cli) and [GitHub CLI](https://cli.github.com) logged in:

```bash
bash scripts/vercel-setup.sh
```

The script creates the projects (`shalgam` → shalgam.vercel.app for the storefront, `shalgam-admin`, `shalgam-storybook`), sets the Root Directory of the admin and Storybook projects, and stores `VERCEL_TOKEN`, `VERCEL_ORG_ID` and the three `VERCEL_PROJECT_ID_*` values as repository secrets. Until those secrets exist the workflow skips deployment with a warning instead of failing. The published apps run against the bundled mock backend (`VITE_API_MOCK` defaults to `true`), so they are fully interactive with no server; point them at a real API with `VITE_API_MOCK=false` and `VITE_API_BASE_URL` as project environment variables.

## Testing on a phone

All dev servers bind to every network interface, so a phone on the same Wi-Fi can open the apps directly. Start them (`pnpm dev`), read the **Network** URL Vite prints, and open it on the phone:

| App        | URL on the phone                                    |
| ---------- | --------------------------------------------------- |
| Storefront | `http://<your-computer-ip>:5173`                    |
| Admin      | `http://<your-computer-ip>:5174`                    |
| Storybook  | `http://<your-computer-ip>:6006` (`pnpm storybook`) |

Find the IP with `hostname -I` (Linux), `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows). If the page does not load, allow the ports through the computer's firewall (for example `sudo ufw allow 5173:5174/tcp` and `6006/tcp`).

The mock backend keeps working there: browsers refuse to register a service worker on a plain `http://` LAN address, so `startMockApi()` detects the insecure context and runs the same handlers in-page (fetch/XHR interception) instead. The data, latency and error simulation are identical; only the transport differs.

## Storybook

```bash
pnpm storybook          # dev
pnpm build-storybook    # static build in packages/ui/storybook-static
```

The Storybook is branded (custom manager theme, favicon, ordered sidebar) and organised as **Introduction → Design Principles → Architecture → Foundations (Colors, Typography, Spacing, Responsive, Radius, Shadows, Icons, Motion) → Components (Primitives, Buttons, Forms, Navigation, Overlays, Data, Commerce) → Design Tokens**. A toolbar switch flips every story between light and dark themes, a viewport toolbar previews stories at 320/375/414/768/1024/1440px, and the a11y addon runs axe on each story.

## Developer commands

| Command                                   | Description                                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                | Run every dev server (storefront 5173, admin 5174)                                                                                                                  |
| `pnpm build`                              | Production builds for both apps + static Storybook                                                                                                                  |
| `pnpm typecheck`                          | `tsc -b` across the workspace                                                                                                                                       |
| `pnpm lint`                               | ESLint (strict type-checked, jsx-a11y, react-hooks)                                                                                                                 |
| `pnpm test`                               | Vitest in every workspace                                                                                                                                           |
| `pnpm check`                              | typecheck + lint + test + build                                                                                                                                     |
| `pnpm format`                             | Prettier (with the Tailwind class sorter)                                                                                                                           |
| `pnpm qa:screenshots -- --app=storefront` | Playwright screenshots of every key screen at desktop and phone widths (needs a running dev server)                                                                 |
| `pnpm qa:responsive`                      | Storefront responsive audit: horizontal overflow (with the offending elements) and touch-target sizes at 320–1440px, plus screenshots (needs `pnpm dev:storefront`) |
| `pnpm qa:flows`                           | Functional regression of the cart, search, checkout, orders and profile flows on a phone and a desktop viewport, failing on any overflow                            |

Tooling: TypeScript 6 (strict, `noUncheckedIndexedAccess`), Vite 8, Vitest 5, ESLint 9 flat config, Prettier 3, Turborepo 2, pnpm 12, React 19, React Router 8, TanStack Query 5, TanStack Table 9, Zustand 5, React Hook Form 7, Zod 4, MSW 2, Base UI 1.0 RC, Tailwind CSS 4.

## Architectural decisions

Short records live in [`docs/adr`](docs/adr). The headlines:

1. **Packages are consumed as source, not built** — zero-cost iteration, one TypeScript program, no publish step. Tailwind scans the design-system sources through an explicit `@source` directive. ([ADR 0001](docs/adr/0001-source-packages.md))
2. **Base UI is wrapped, never used directly by apps** — Shalgam UI owns the API; Base UI owns behaviour. ([ADR 0002](docs/adr/0002-wrap-base-ui.md))
3. **Three kinds of state, three owners** — TanStack Query, Zustand, URL. No global store for server data. ([ADR 0003](docs/adr/0003-state-ownership.md))
4. **The mock backend is a backend** — a seeded, persisted database with real REST semantics, shared by dev and tests, loaded only at the bootstrap edge. ([ADR 0004](docs/adr/0004-mock-backend.md))
5. **No `packages/stores`** — client state is app-specific, so it lives with its feature; a shared package would have been architecture theatre. ([ADR 0005](docs/adr/0005-no-shared-stores-package.md))
6. **TanStack Table v9 with an explicit feature set** — `DataTable` registers exactly the features it uses (sorting, selection, visibility, pagination) for a precise `TFeatures` type and a smaller bundle. ([ADR 0006](docs/adr/0006-data-table.md))
7. **Responsive is one tree, CSS-first** — mobile-first layouts, touch targets that grow under `pointer: coarse` instead of by viewport, sticky (not fixed) action bars above the phone tab bar, and scripted overflow/touch audits. ([ADR 0007](docs/adr/0007-responsive-strategy.md))

## Accessibility, responsiveness and performance

- Every interactive component starts from the right element and ARIA pattern via Base UI; icon-only controls require an `aria-label` at the type level; dialogs trap and restore focus; tables use `aria-sort`; forms wire labels, descriptions and errors through `FormField`; status is never colour-only.
- Global focus-visible ring, skip link, `prefers-reduced-motion` handling and AA-checked contrast: dark text on lime, `brand-800` for links, and muted/subtle text at neutral-600/500 (≈7:1 and ≈4.6:1 on white).
- Storefront is designed mobile-first: bottom navigation, bottom sheets for filters, location and dialogs on phones, a filter sidebar from `lg`, sticky action bars for checkout/place-order/add-to-cart within thumb reach, and a header that keeps search as a full-width row on phones. Compact controls grow to 40–44px on touch screens via `pointer-coarse:` in the design system. Every route is verified without horizontal overflow at 320, 375, 414, 768, 1024 and 1440px (`pnpm qa:responsive`); admin tables hide low-priority columns per breakpoint and collapse the sidebar into a drawer.
- Route-level code splitting, TanStack Query caching with tuned stale times and loader prefetches, `keepPreviousData` on paginated lists, debounced search, lazy images with fixed aspect ratios, virtualised table body for large client-side datasets, pre-bundled dependencies for deterministic dev start-up.

## Imagery and licensing

Product and category photographs are from [Pexels](https://www.pexels.com) under the Pexels License and are bundled with the mock backend (`packages/mock-api/src/assets/images`). All brands are fictional. The Dribbble reference supplied for this project was used only for visual principles — no layouts, illustrations or assets were copied.
