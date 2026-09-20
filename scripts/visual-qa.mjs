#!/usr/bin/env node
/**
 * Visual QA helper: captures screenshots of key screens in both apps.
 *
 *   pnpm qa:screenshots -- --app=storefront --out=./.qa
 *   pnpm qa:screenshots -- --app=admin --base=http://127.0.0.1:5174
 *
 * Requires a running dev server (pnpm dev:storefront / pnpm dev:admin) and Playwright's Chromium
 * (`pnpm exec playwright install chromium` once).
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

import { chromium } from 'playwright'

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => a.slice(2).split('=')),
)
const app = args.app ?? 'storefront'
const base = args.base ?? (app === 'admin' ? 'http://127.0.0.1:5174' : 'http://127.0.0.1:5173')
const out = path.resolve(args.out ?? '.qa')
const only = args.only ? String(args.only).split(',') : null

const viewports = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
}

/** Adds a couple of products so cart/checkout screens have content. */
async function seedCart(page) {
  await page.goto(`${base}/product/tomato-hybrid-500-g`)
  await page.getByRole('button', { name: /add tomato hybrid to cart/i }).click()
  await page.getByRole('button', { name: /increase quantity of tomato hybrid/i }).click()
  await page.goto(`${base}/product/gokul-fresh-paneer-200-g`)
  await page.getByRole('button', { name: /add gokul fresh paneer to cart/i }).click()
}

/** @type {Record<string, Array<{ name: string; path: string; viewports?: string[]; fullPage?: boolean; before?: (page: import('playwright').Page) => Promise<void> }>>} */
const plans = {
  storefront: [
    { name: 'home', path: '/', viewports: ['desktop', 'mobile'] },
    {
      name: 'category',
      path: '/category/fruits-vegetables?sub=cat_fresh-fruits&tags=deal',
      viewports: ['desktop', 'mobile'],
    },
    { name: 'search', path: '/search?q=dal' },
    {
      name: 'product',
      path: '/product/gokul-fresh-paneer-200-g',
      viewports: ['desktop', 'mobile'],
    },
    { name: 'cart', path: '/cart', viewports: ['desktop', 'mobile'], before: seedCart },
    { name: 'checkout', path: '/checkout', viewports: ['desktop', 'mobile'], before: seedCart },
    { name: 'orders', path: '/orders' },
    { name: 'orders-past', path: '/orders?tab=past' },
    {
      name: 'order-detail',
      path: '/orders',
      stay: true,
      viewports: ['desktop', 'mobile'],
      before: async (page) => {
        await page.goto(`${base}/orders`)
        await page
          .getByRole('link', { name: /track|details/i })
          .first()
          .click()
        await page.waitForURL(/\/orders\/ord_/)
      },
    },
    { name: 'profile', path: '/profile' },
    { name: 'not-found', path: '/does-not-exist' },
  ],
  admin: [
    { name: 'dashboard', path: '/', viewports: ['desktop', 'mobile'] },
    { name: 'orders', path: '/orders?status=placed,packed', viewports: ['desktop', 'mobile'] },
    { name: 'products', path: '/products' },
    { name: 'product-new', path: '/products/new' },
    { name: 'categories', path: '/categories' },
    { name: 'inventory', path: '/inventory' },
    { name: 'customers', path: '/customers' },
    { name: 'delivery', path: '/delivery' },
    { name: 'analytics', path: '/analytics', viewports: ['desktop', 'mobile'] },
    { name: 'reports', path: '/reports' },
    { name: 'settings', path: '/settings' },
  ],
}

const plan = plans[app]
if (!plan) {
  console.error(`Unknown app "${app}". Use --app=storefront or --app=admin.`)
  process.exit(1)
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
try {
  for (const shot of plan) {
    if (only && !only.includes(shot.name)) continue
    for (const vp of shot.viewports ?? ['desktop']) {
      const context = await browser.newContext({ viewport: viewports[vp], deviceScaleFactor: 1 })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
      try {
        await page.goto(`${base}/`)
        await page.waitForSelector('main', { timeout: 20_000 })
        if (shot.before) await shot.before(page)
        if (!shot.stay) await page.goto(`${base}${shot.path}`)
        // Both apps render a `<main>` only once the shell (and the mock API) are ready.
        await page.waitForSelector('main', { timeout: 20_000 })
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(800)
        // Trigger lazy images by scrolling through the page, then return to top.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 700) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(600)
        const file = path.join(out, `${app}-${shot.name}-${vp}.png`)
        await page.screenshot({ path: file, fullPage: shot.fullPage ?? true })
        console.log(`✓ ${file}${errors.length ? `  (console errors: ${errors.length})` : ''}`)
        for (const e of errors.slice(0, 3)) console.log(`    ! ${e.slice(0, 200)}`)
      } catch (error) {
        console.log(
          `✗ ${shot.name}/${vp}: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
        )
      } finally {
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
}
