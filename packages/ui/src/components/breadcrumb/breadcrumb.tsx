import { ChevronRight, House } from 'lucide-react'
import { cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react'

import { cn } from '../../lib/cn'

export interface BreadcrumbItem {
  label: ReactNode
  /** Router element such as `<Link to="/orders" />`; omit for the current page. */
  render?: ReactElement<{ className?: string }>
  href?: string
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  /** Replace the first item's label with a home icon. */
  homeIcon?: boolean
  /** Collapse middle items on small screens. */
  collapse?: boolean
}

const linkClass =
  'inline-flex items-center rounded-xs text-text-muted focus-ring transition-colors hover:text-text pointer-coarse:min-h-10'

/** Path navigation for the admin. The last item is the current page (`aria-current`). */
export function Breadcrumb({
  items,
  className,
  homeIcon = false,
  collapse = true,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isMiddle = index > 0 && !isLast
          const label =
            homeIcon && index === 0 ? (
              <House
                aria-label={typeof item.label === 'string' ? item.label : 'Home'}
                className="size-4"
              />
            ) : (
              item.label
            )
          let content: ReactNode
          if (isLast) {
            content = (
              <span aria-current="page" className="font-medium text-text">
                {label}
              </span>
            )
          } else if (isValidElement(item.render)) {
            content = cloneElement(
              item.render,
              { className: cn(linkClass, item.render.props.className) },
              label,
            )
          } else {
            content = (
              <a href={item.href} className={linkClass}>
                {label}
              </a>
            )
          }
          return (
            <Fragment key={index}>
              <li className={cn('flex items-center', collapse && isMiddle && 'hidden sm:flex')}>
                {content}
              </li>
              {!isLast && (
                <li
                  aria-hidden
                  className={cn('text-text-subtle', collapse && isMiddle && 'hidden sm:block')}
                >
                  <ChevronRight className="size-3.5" />
                </li>
              )}
              {collapse && index === 0 && items.length > 2 && (
                <li aria-hidden className="text-text-subtle sm:hidden">
                  …<ChevronRight className="ml-1.5 inline size-3.5" />
                </li>
              )}
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
