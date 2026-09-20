import { Heading, Text } from '@shalgam/ui'
import { type ReactNode, useEffect } from 'react'

export interface PageHeaderProps {
  title: string
  description?: ReactNode
  /** Right-aligned actions (buttons, selects). */
  actions?: ReactNode
  /** Rendered below the title row: tabs, filter bars. */
  children?: ReactNode
}

/** Page title block. Also keeps the document title in sync. */
export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} · Shalgam Admin`
  }, [title])
  return (
    <div className="mb-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <Heading level={1} size="lg">
            {title}
          </Heading>
          {description && (
            <Text size="sm" tone="muted">
              {description}
            </Text>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
