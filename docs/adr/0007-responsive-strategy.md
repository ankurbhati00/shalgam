# ADR 0007: Responsive strategy for the storefront

**Status:** accepted · **Date:** 2026-09-20

## Context

The storefront must work from 320px phones to 1920px desktops without forking into separate mobile and desktop applications. A first responsive audit (`scripts/responsive-audit.mjs`) found one critical defect (the listing pages overflowed the viewport by up to 447px on phones because the filter trigger was laid out as a column beside the grid), undersized touch targets on most compact controls, cramped cart rows, and primary actions that were out of thumb reach on long pages.

## Decision

1. **One tree, CSS-first presentation.** Layouts are written mobile-first with Tailwind breakpoint prefixes on the default scale (`sm` 640, `md` 768, `lg` 1024, `xl` 1280), mirrored in `breakpoints` from `@shalgam/tokens`. Separate mobile and desktop components are not created; the only duplicated markup is an action rendered both in a sticky side column (`lg+`) and in a sticky phone bar, with the inactive copy hidden by CSS so assistive technology sees one.
2. **Touch targets follow the pointer, not the viewport.** Compact sizes (`xs`, `sm`, some `md`) of Button, IconButton, QuantitySelector, Input, Select, PillTab, Checkbox, Radio, Switch, Slider and Breadcrumb grow to a 40–44px hit area under `@media (pointer: coarse)` via Tailwind's `pointer-coarse:` variant. Desktop density is untouched; a phone or tablet gets the larger targets automatically, with no props or JavaScript.
3. **Sheets and bars are the phone patterns.** Dialogs rise as bottom sheets below `sm`; filters and the location picker are bottom drawers; cart, checkout and product pages use a `position: sticky` action bar above the bottom navigation. Sticky (not fixed) keeps the bar in the document flow so it never covers content, and the bottom-navigation height is a single CSS variable (`--bottom-nav-height`) shared by the main padding, the bars and the toast viewport.
4. **JavaScript only where interaction changes.** The product page uses one `IntersectionObserver` (`useInView`) to reveal the sticky bar only while the inline price block is off-screen. No resize listeners, no viewport branching in render paths.
5. **Overflow is fixed at the source.** Flex and grid children that must shrink get `min-w-0`; long text truncates or clamps; horizontal scrolling exists only in deliberate scrollers (product rails, pill tabs). `overflow-x: hidden` on the page is not used.
6. **Verification is scripted.** `pnpm qa:responsive` measures horizontal overflow (with offending elements) and touch-target sizes per route and width; `pnpm qa:flows` runs the cart, search, checkout, orders and profile flows on phone and desktop viewports.

## Consequences

- Every listing, cart, checkout, order and profile route renders without horizontal overflow at 320, 375, 414, 768, 1024 and 1440px, and desktop layouts are visually unchanged apart from a wider sort control.
- Controls look the same in a resized desktop window; the larger touch sizes appear only on touch devices and in devtools device mode, which the Storybook "Foundations/Responsive" page explains.
- The admin inherits the coarse-pointer sizing on tablets for free, since it lives in the design system.
