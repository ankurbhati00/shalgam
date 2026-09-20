import { Container, Text } from '@shalgam/ui'
import { Link } from 'react-router'

import { Logo } from './logo'

const columns = [
  {
    title: 'Shop',
    links: [
      ['Fruits & Vegetables', '/category/fruits-vegetables'],
      ['Dairy & Bread', '/category/dairy-bread'],
      ['Atta, Rice & Dal', '/category/atta-rice-dal'],
      ['Snacks & Namkeen', '/category/snacks-namkeen'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['Your orders', '/orders'],
      ['Profile & addresses', '/profile'],
      ['Cart', '/cart'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Shalgam', '/'],
      ['Careers', '/'],
      ['Help centre', '/'],
    ],
  },
] as const

export function AppFooter() {
  return (
    <footer className="mt-12 hidden border-t border-border bg-surface md:block">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <Text size="sm" tone="muted" className="max-w-xs">
            Fresh groceries delivered across Bengaluru in minutes. Fictional portfolio project —
            nothing here is real.
          </Text>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <Text as="p" size="sm" weight="semibold" className="mb-3">
              {column.title}
            </Text>
            <ul className="space-y-2">
              {column.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="rounded-xs text-sm text-text-muted focus-ring hover:text-text"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-border-subtle">
        <Container className="flex items-center justify-between py-4">
          <Text size="xs" tone="subtle">
            © 2026 Shalgam. Built as a design-system showcase.
          </Text>
          <Text size="xs" tone="subtle">
            Made in Bengaluru
          </Text>
        </Container>
      </div>
    </footer>
  )
}
