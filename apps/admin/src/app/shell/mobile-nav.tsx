import { Drawer, DrawerContent } from '@shalgam/ui'

import { useUiStore } from '../store/ui-store'
import { AppSidebar } from './app-sidebar'

/** On small screens the sidebar becomes a left drawer opened from the navbar menu button. */
export function MobileNav() {
  const open = useUiStore((state) => state.mobileNavOpen)
  const setOpen = useUiStore((state) => state.setMobileNavOpen)
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent side="left" size="sm" className="lg:hidden" aria-label="Navigation">
        <AppSidebar inDrawer onNavigate={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
