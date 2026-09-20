#!/usr/bin/env node
/**
 * Responsive audit for the storefront: for every route × viewport width it reports
 *   • horizontal page overflow and the elements that cause it,
 *   • interactive controls under the touch-target floor (40px by default, `--touch=44`; phones only),
 *   • console/page errors,
 * and stores a screenshot for visual review.
 *
 *   node scripts/responsive-audit.mjs --out=.qa/responsive
 *   node scripts/responsive-audit.mjs --widths=320,375,768 --only=home,cart --json=.qa/audit.json
 *
 * Requires a running storefront dev server (pnpm dev:storefront) and Playwright's Chromium.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright'

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => a.slice(2).split('=')),
)
const base = args.base ?? 'http://127.0.0.1:5173'
const out = path.resolve(args.out ?? '.qa/responsive')
const widths = String(args.widths ?? '320,375,414,768,1024,1440')
  .split(',')
  .map(Number)
const only = args.only ? String(args.only).split(',') : null
const touchMax = Number(args.touch ?? 40)
const heightFor = (width) => (width < 640 ? 800 : width < 1024 ? 1024 : 900)

/**
 * Adds a couple of products so cart/checkout screens have content. The page (and its
 * persisted cart) is reused across routes, so a product already in the cart is skipped.
 */
async function seedCart(page) {
  await ensureInCart(page, 'tomato-hybrid-500-g', /tomato hybrid/i, 2)
  await ensureInCart(page, 'gokul-fresh-paneer-200-g', /gokul fresh paneer/i, 1)
}

async function ensureInCart(page, slug, name, quantity) {
  await page.goto(`${base}/product/${slug}`)
  await settle(page)
  const add = page
    .getByRole('button', { name: new RegExp(`add ${name.source} to cart`, 'i') })
    .filter({ visible: true })
  if ((await add.count()) === 0) return
  await tap(add)
  for (let i = 1; i < quantity; i++) {
    await tap(
      page.getByRole('button', { name: new RegExp(`increase quantity of ${name.source}`, 'i') }),
    )
  }
}

/**
 * Clicks the first visible match after centring it: Playwright only scrolls an element to the
 * viewport edge, where a fixed bottom navigation would intercept the click on phones.
 */
async function tap(locator) {
  const target = locator.filter({ visible: true }).first()
  await target.waitFor()
  await target.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await target.click()
}

/** Waits for the shell, a (bounded) network idle and for every skeleton in `main` to clear. */
async function settle(page) {
  await page.waitForSelector('main', { timeout: 20_000 })
  // Order polling keeps the network busy, so the idle wait is bounded.
  await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {})
  await page
    .waitForFunction(() => !document.querySelector('main [aria-busy="true"]'), null, {
      timeout: 8000,
    })
    .catch(() => {})
  await page.waitForTimeout(250)
}

/**
 * @type {Array<{
 *   name: string; path: string; fullPage?: boolean;
 *   before?: (page: import('playwright').Page) => Promise<void>;
 *   after?: (page: import('playwright').Page) => Promise<void>;
 * }>}
 */
const routes = [
  { name: 'home', path: '/' },
  { name: 'category', path: '/category/fruits-vegetables?sub=cat_fresh-fruits&tags=deal' },
  { name: 'search-results', path: '/search?q=dal' },
  { name: 'search-empty', path: '/search' },
  { name: 'search-no-results', path: '/search?q=zzzzqq' },
  { name: 'product', path: '/product/gokul-fresh-paneer-200-g' },
  { name: 'cart-empty', path: '/cart' },
  { name: 'cart', path: '/cart', before: seedCart },
  { name: 'checkout', path: '/checkout', before: seedCart },
  { name: 'orders', path: '/orders' },
  { name: 'orders-past', path: '/orders?tab=past' },
  {
    name: 'order-detail',
    path: '/orders',
    after: async (page) => {
      await page
        .getByRole('link', { name: /track|details/i })
        .first()
        .click()
      await page.waitForURL(/\/orders\/ord_/)
      await settle(page)
    },
  },
  { name: 'profile', path: '/profile' },
  { name: 'not-found', path: '/does-not-exist' },
  // Overlay states (viewport screenshots only).
  {
    name: 'search-suggestions',
    path: '/',
    fullPage: false,
    after: async (page) => {
      const box = page.getByRole('combobox', { name: /search products/i }).first()
      await box.click()
      await box.fill('mil')
      await page.getByRole('listbox', { name: /search suggestions/i }).waitFor()
      await page.waitForTimeout(400)
    },
  },
  {
    name: 'location-sheet',
    path: '/',
    fullPage: false,
    after: async (page) => {
      await page.getByRole('button', { name: /delivery location/i }).click()
      await page.getByRole('dialog').waitFor()
      await page.waitForTimeout(400)
    },
  },
  {
    name: 'cart-drawer',
    path: '/',
    fullPage: false,
    before: seedCart,
    after: async (page) => {
      await page
        .getByRole('button', { name: /^cart,/i })
        .filter({ visible: true })
        .first()
        .click()
      await page.getByRole('dialog').waitFor()
      await page.waitForTimeout(400)
    },
  },
  {
    name: 'filters-sheet',
    path: '/category/fruits-vegetables',
    fullPage: false,
    after: async (page) => {
      const trigger = page.getByRole('button', { name: /^filters/i })
      if (await trigger.isVisible()) {
        await trigger.click()
        await page.getByRole('dialog').waitFor()
        await page.waitForTimeout(400)
      }
    },
  },
  {
    name: 'sort-open',
    path: '/category/fruits-vegetables',
    fullPage: false,
    after: async (page) => {
      await page.getByRole('combobox', { name: /sort products/i }).click()
      await page.getByRole('listbox').waitFor()
      await page.waitForTimeout(300)
    },
  },
  {
    name: 'address-dialog',
    path: '/checkout',
    fullPage: false,
    before: seedCart,
    after: async (page) => {
      await page.getByRole('button', { name: /add new address/i }).click()
      await page.getByRole('dialog').waitFor()
      await page.waitForTimeout(400)
    },
  },
]

/** Runs inside the page: overflow offenders + small touch targets. */
function inspect(touchMax) {
  const docWidth = document.documentElement.clientWidth
  const overflow = document.documentElement.scrollWidth - docWidth
  const describe = (el) => {
    const cls = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean).slice(0, 4).join('.')
    const text = (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 40)
    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls ? `.${cls}` : ''}${text ? ` "${text}"` : ''}`
  }
  const isClipped = (el) => {
    let p = el.parentElement
    while (p && p !== document.documentElement) {
      const ov = getComputedStyle(p).overflowX
      if (ov === 'hidden' || ov === 'auto' || ov === 'scroll' || ov === 'clip') return true
      p = p.parentElement
    }
    return false
  }
  const offenders = []
  if (overflow > 0) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const cs = getComputedStyle(el)
      if (cs.position === 'fixed' || cs.visibility === 'hidden') continue
      if ((r.right > docWidth + 1 || r.left < -1) && !isClipped(el)) {
        offenders.push({ el: describe(el), left: Math.round(r.left), right: Math.round(r.right) })
      }
    }
  }
  const selector =
    'a[href],button,[role="button"],[role="radio"],[role="checkbox"],[role="switch"],[role="tab"],[role="option"],[role="menuitem"],[role="combobox"],[role="slider"],input:not([type="hidden"]),select,textarea,summary'
  const small = []
  for (const el of document.querySelectorAll(selector)) {
    if (el.closest('[aria-hidden="true"]')) continue
    // Visually hidden skip links and dev-only tooling are not touch targets.
    if (el.classList.contains('sr-only') || el.className.includes('tsqd-')) continue
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    // Only visible-on-screen controls (skip things scrolled out of a clipped container).
    const w = Math.round(r.width)
    const h = Math.round(r.height)
    if (Math.min(w, h) < touchMax) {
      small.push({ el: describe(el), w, h })
    }
  }
  // Collapse duplicates by description.
  const dedupe = (list, key) => {
    const seen = new Map()
    for (const item of list) {
      const k = key(item)
      const cur = seen.get(k)
      if (cur) cur.count += 1
      else seen.set(k, { ...item, count: 1 })
    }
    return [...seen.values()]
  }
  return {
    docWidth,
    overflow,
    offenders: dedupe(offenders, (o) => o.el).slice(0, 12),
    small: dedupe(small, (s) => `${s.el}:${s.w}x${s.h}`),
  }
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
const report = []
try {
  for (const width of widths) {
    const mobile = width < 768
    const context = await browser.newContext({
      viewport: { width, height: heightFor(width) },
      deviceScaleFactor: 1,
      isMobile: mobile,
      hasTouch: mobile,
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
    let booted = false
    for (const route of routes) {
      if (only && !only.includes(route.name)) continue
      errors.length = 0
      const entry = { route: route.name, width, errors: [] }
      try {
        if (!booted) {
          await page.goto(`${base}/`)
          await page.waitForSelector('main', { timeout: 20_000 })
          booted = true
        }
        if (route.before) await route.before(page)
        await page.goto(`${base}${route.path}`)
        await settle(page)
        if (route.after) await route.after(page)
        if (route.fullPage !== false) {
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 900) {
              window.scrollTo(0, y)
              await new Promise((r) => setTimeout(r, 25))
            }
            window.scrollTo(0, 0)
          })
          await page.waitForTimeout(250)
        }
        const result = await page.evaluate(inspect, touchMax)
        Object.assign(entry, result)
        if (!mobile) entry.small = []
        const file = path.join(out, `${route.name}-${width}.png`)
        await page.screenshot({ path: file, fullPage: route.fullPage ?? true })
        entry.errors = [...errors]
        const flags = [
          entry.overflow > 0 ? `OVERFLOW +${entry.overflow}px` : '',
          entry.small.length ? `${entry.small.length} small targets` : '',
          entry.errors.length ? `${entry.errors.length} console errors` : '',
        ]
          .filter(Boolean)
          .join(', ')
        console.log(`${flags ? '✗' : '✓'} ${route.name}@${width}${flags ? `  ${flags}` : ''}`)
        for (const o of entry.offenders)
          console.log(`    ↳ overflow: ${o.el} [${o.left}..${o.right}]`)
        for (const s of entry.small.slice(0, 8))
          console.log(`    ↳ ${s.w}×${s.h}${s.count > 1 ? ` ×${s.count}` : ''}: ${s.el}`)
        for (const e of entry.errors.slice(0, 2)) console.log(`    ! ${e.slice(0, 160)}`)
      } catch (error) {
        entry.failed = error instanceof Error ? error.message.split('\n')[0] : String(error)
        console.log(`✗ ${route.name}@${width}: ${entry.failed}`)
        // Overlays left open would leak into the next route; a fresh load clears them.
        booted = false
      } finally {
        report.push(entry)
        // Close any open overlay before the next route.
        await page.keyboard.press('Escape').catch(() => {})
      }
    }
    await page.close()
    await context.close()
  }
} finally {
  await browser.close()
}

if (args.json) {
  await writeFile(path.resolve(args.json), JSON.stringify(report, null, 2))
  console.log(`report written to ${args.json}`)
}
const problems = report.filter(
  (r) => r.failed || r.overflow > 0 || r.small?.length || r.errors.length,
)
console.log(`\n${report.length} checks, ${problems.length} with findings, screenshots in ${out}`)
