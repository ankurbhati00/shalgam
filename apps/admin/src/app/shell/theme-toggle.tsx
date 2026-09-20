import { IconButton } from '@shalgam/ui'
import { Moon, Sun } from 'lucide-react'

import { useUiStore } from '../store/ui-store'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useUiStore((state) => state.theme)
  const toggleTheme = useUiStore((state) => state.toggleTheme)
  const dark = theme === 'dark'
  return (
    <IconButton
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      icon={dark ? <Sun /> : <Moon />}
      variant="ghost"
      size="sm"
      className={className}
      onClick={toggleTheme}
    />
  )
}
