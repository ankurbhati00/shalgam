import {
  Avatar,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  toast,
} from '@shalgam/ui'
import { humanize } from '@shalgam/utils'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { Link } from 'react-router'

import { useAdminMe } from '../../features/settings/api/queries'
import { useUiStore } from '../store/ui-store'

export function UserMenu() {
  const { data: me, isPending } = useAdminMe()
  const theme = useUiStore((state) => state.theme)
  const setTheme = useUiStore((state) => state.setTheme)

  if (isPending || !me) {
    return <Skeleton shape="circle" className="size-8" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${me.name}`}
        className="flex items-center gap-2 rounded-full py-0.5 pr-1.5 pl-0.5 focus-ring hover:bg-surface-muted"
      >
        <Avatar name={me.name} src={me.avatarUrl} size="sm" />
        <span className="hidden max-w-32 truncate text-sm font-medium text-text md:inline">
          {me.name}
        </span>
        <ChevronDown aria-hidden className="hidden size-4 text-text-subtle md:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="px-2.5 pt-2 pb-2">
          <p className="text-sm font-semibold text-text">{me.name}</p>
          <p className="truncate text-xs text-text-muted">{me.email}</p>
          <p className="mt-1 text-2xs font-semibold tracking-wider text-text-subtle uppercase">
            {humanize(me.role)}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Appearance</DropdownMenuGroupLabel>
          <DropdownMenuCheckboxItem
            checked={theme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            closeOnClick={false}
          >
            Dark theme
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Settings />} render={<Link to="/settings" />}>
          Store settings
        </DropdownMenuItem>
        <DropdownMenuItem
          icon={<LogOut />}
          onClick={() => toast.info('Demo build', 'Sign-out is not wired to a real session yet.')}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
