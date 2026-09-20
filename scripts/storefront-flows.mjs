#!/usr/bin/env node
/**
 * Functional regression flows for the storefront, run on a phone and a desktop viewport:
 * cart (add → + → − → remove), search (suggest → results → sort → filter → product),
 * checkout (address → UPI → place order → confirmation → tracking), orders and profile.
 * Every step also asserts that the page has no horizontal overflow.
 *
 *   node scripts/storefront-flows.mjs                # against http://127.0.0.1:5173
 *   node scripts/storefront-flows.mjs --base=http://127.0.0.1:4173 --only=cart,search
 *
 * Exits non-zero when a flow fails and writes a screenshot of the failure to --out (.qa/flows).
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
const base = args.base ?? 'http://127.0.0.1:5173'
const out = path.resolve(args.out ?? '.qa/flows')
const only = args.only ? String(args.only).split(',') : null

const devices = {
  phone: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
}

const visible = (locator) => locator.filter({ visible: true }).first()

/**
 * Clicks the first visible match after centring it: Playwright only scrolls an element to the
 * viewport edge, where a fixed bottom navigation would intercept the click on phones.
 */
async function tap(locator) {
  const target = visible(locator)
  await target.waitFor()
  await target.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }))
  await target.click()
}

async function settle(page) {
  await page.waitForSelector('main', { timeout: 20_000 })
  await page.waitForLoadState('networkidle', { timeout: 2500 }).catch(() => {})
  await page
    .waitForFunction(() => !document.querySelector('main [aria-busy="true"]'), null, {
      timeout: 8000,
    })
    .catch(() => {})
}

async function expectNoOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 0) throw new Error(`horizontal overflow of ${overflow}px after "${label}"`)
}

async function expect(condition, message) {
  if (!(await condition)) throw new Error(message)
}

/** Waits (instead of sampling) so a render in flight does not read as a failure. */
async function shouldBeVisible(locator, message) {
  await locator.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {
    throw new Error(message)
  })
}

const flows = {
  async cart(page, device) {
    await page.goto(`${base}/product/tomato-hybrid-500-g`)
    await settle(page)
    await tap(page.getByRole('button', { name: /add tomato hybrid to cart/i }))
    const plus = visible(page.getByRole('button', { name: /increase quantity of tomato hybrid/i }))
    await plus.click()
    const output = visible(page.getByRole('status', { name: /quantity of tomato hybrid/i }))
    await expect(
      output.textContent().then((t) => t?.trim() === '2'),
      'quantity should be 2',
    )
    await tap(page.getByRole('button', { name: /decrease quantity of tomato hybrid/i }))
    await expect(
      output.textContent().then((t) => t?.trim() === '1'),
      'quantity should be 1',
    )
    await tap(page.getByRole('button', { name: /remove tomato hybrid/i }))
    await visible(page.getByRole('button', { name: /add tomato hybrid to cart/i })).waitFor()
    // Add again and open the cart the way this device does it.
    await tap(page.getByRole('button', { name: /add tomato hybrid to cart/i }))
    if (device === 'phone') {
      await page
        .getByRole('navigation', { name: 'Primary' })
        .getByRole('link', { name: 'Cart' })
        .click()
      await page.waitForURL(/\/cart$/)
      await settle(page)
      await shouldBeVisible(page.getByText('Tomato Hybrid').first(), 'cart page lists the item')
      await shouldBeVisible(
        page.getByRole('link', { name: /checkout/i }),
        'checkout action visible on the phone cart',
      )
      await expectNoOverflow(page, 'cart page')
    } else {
      await visible(page.getByRole('button', { name: /^cart,/i })).click()
      const drawer = page.getByRole('dialog', { name: /your cart/i })
      await drawer.waitFor()
      await shouldBeVisible(drawer.getByText('Tomato Hybrid'), 'drawer lists the item')
      await shouldBeVisible(drawer.getByText('To pay'), 'drawer shows the total')
      await page.keyboard.press('Escape')
    }
  },

  async search(page, device) {
    await page.goto(`${base}/`)
    await settle(page)
    const box = visible(page.getByRole('combobox', { name: /search products/i }))
    await box.click()
    await box.fill('milk')
    await page.getByRole('listbox', { name: /search suggestions/i }).waitFor()
    await expectNoOverflow(page, 'search suggestions')
    await box.press('Enter')
    await page.waitForURL(/\/search\?q=milk/)
    await settle(page)
    const grid = page.getByRole('list', { busy: false }).filter({ has: page.getByRole('link') })
    await shouldBeVisible(grid.first(), 'results grid visible')
    // Sort via the URL-backed select.
    await visible(page.getByRole('combobox', { name: /sort products/i })).click()
    await page.getByRole('option', { name: /price: low to high/i }).click()
    await page.waitForURL(/sort=price_asc/)
    await settle(page)
    // Filter: phone uses the sheet, desktop the sidebar.
    if (device === 'phone') {
      await visible(page.getByRole('button', { name: /^filters/i })).click()
      const sheet = page.getByRole('dialog', { name: /filters/i })
      await sheet.waitFor()
      await sheet.getByRole('checkbox', { name: 'On offer' }).click()
      await page.waitForURL(/tags=deal/)
      await sheet.getByRole('button', { name: /^show/i }).click()
      await sheet.waitFor({ state: 'hidden' })
    } else {
      await page
        .getByRole('complementary', { name: /filters/i })
        .getByRole('checkbox', { name: 'On offer' })
        .click()
      await page.waitForURL(/tags=deal/)
    }
    await settle(page)
    await expectNoOverflow(page, 'filtered results')
    // Open the first product from the grid.
    const productLink = visible(page.getByRole('main').getByRole('link', { name: /,/ }))
    const name = await productLink.getAttribute('aria-label')
    await productLink.click()
    await page.waitForURL(/\/product\//)
    await settle(page)
    const heading = await page.getByRole('heading', { level: 1 }).textContent()
    await expect(
      Promise.resolve(name?.startsWith(heading?.trim() ?? '\u0000')),
      `product page heading "${heading}" should match "${name}"`,
    )
    await expectNoOverflow(page, 'product page')
  },

  async checkout(page) {
    await page.goto(`${base}/product/gokul-fresh-paneer-200-g`)
    await settle(page)
    await tap(page.getByRole('button', { name: /add gokul fresh paneer to cart/i }))
    await tap(page.getByRole('button', { name: /increase quantity of gokul/i }))
    await page.goto(`${base}/checkout`)
    await settle(page)
    const addresses = page.getByRole('radiogroup', { name: /delivery address/i })
    await addresses.waitFor()
    await expect(
      addresses
        .getByRole('radio', { checked: true })
        .count()
        .then((n) => n === 1),
      'a default address is preselected',
    )
    await expect(
      page
        .getByRole('radiogroup', { name: /delivery slot/i })
        .getByRole('radio', { checked: true })
        .count()
        .then((n) => n === 1),
      'a delivery slot is preselected',
    )
    await page.getByLabel(/upi id/i).fill('ananya@okaxis')
    await expectNoOverflow(page, 'checkout')
    const placeOrder = visible(page.getByRole('button', { name: /place order/i }))
    await placeOrder.waitFor()
    await page.waitForFunction(
      (el) => el && !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
      await placeOrder.elementHandle(),
    )
    await placeOrder.click()
    await page.waitForURL(/\/orders\/.+\/confirmation$/, { timeout: 15_000 })
    await settle(page)
    await shouldBeVisible(
      page.getByRole('heading', { level: 1, name: /order placed/i }),
      'confirmation heading',
    )
    await expectNoOverflow(page, 'confirmation')
    await visible(page.getByRole('link', { name: /track order/i })).click()
    await page.waitForURL(/\/orders\/ord_/)
    await settle(page)
    await shouldBeVisible(page.getByRole('list', { name: /order progress/i }), 'tracking timeline')
    await expectNoOverflow(page, 'order tracking')
  },

  async orders(page) {
    await page.goto(`${base}/orders`)
    await settle(page)
    await visible(page.getByRole('link', { name: /track|details/i })).click()
    await page.waitForURL(/\/orders\/ord_/)
    await settle(page)
    await shouldBeVisible(page.getByRole('heading', { level: 1 }), 'order heading')
    await shouldBeVisible(page.getByText(/bill details/i), 'bill details')
    await expectNoOverflow(page, 'order detail')
    await page.goto(`${base}/orders?tab=past`)
    await settle(page)
    await expect(
      page
        .getByRole('tab', { name: /past orders/i })
        .getAttribute('aria-selected')
        .then((v) => v === 'true'),
      'past tab selected',
    )
    await expectNoOverflow(page, 'past orders')
  },

  async profile(page) {
    await page.goto(`${base}/profile`)
    await settle(page)
    await page.getByRole('button', { name: /^add$/i }).click()
    const dialog = page.getByRole('dialog', { name: /add a new address/i })
    await dialog.waitFor()
    await expectNoOverflow(page, 'address dialog')
    await dialog.getByRole('button', { name: /cancel/i }).click()
    await dialog.waitFor({ state: 'hidden' })
  },
}

await mkdir(out, { recursive: true })
const browser = await chromium.launch()
let failures = 0
try {
  for (const [device, options] of Object.entries(devices)) {
    for (const [name, flow] of Object.entries(flows)) {
      if (only && !only.includes(name)) continue
      const context = await browser.newContext({ ...options, deviceScaleFactor: 1 })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      try {
        await page.goto(`${base}/`)
        await settle(page)
        await flow(page, device)
        if (errors.length) throw new Error(`page errors: ${errors[0]}`)
        console.log(`✓ ${name} (${device})`)
      } catch (error) {
        failures += 1
        const file = path.join(out, `${name}-${device}-failure.png`)
        await page.screenshot({ path: file, fullPage: true }).catch(() => {})
        console.log(
          `✗ ${name} (${device}): ${error instanceof Error ? error.message.split('\n')[0] : String(error)}\n    screenshot: ${file}`,
        )
      } finally {
        await context.close()
      }
    }
  }
} finally {
  await browser.close()
}
console.log(failures ? `\n${failures} flow(s) failed` : '\nAll flows passed')
process.exit(failures ? 1 : 0)
