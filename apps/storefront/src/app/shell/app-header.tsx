import { IconButton, Navbar } from '@shalgam/ui'
import { ClipboardList, UserRound } from 'lucide-react'
import { Link } from 'react-router'

import { CartButton } from '../../features/cart/components/cart-button'
import { SearchBar } from '../../features/catalog/components/search-bar'
import { LocationSelector } from '../../features/location/components/location-selector'
import { Logo } from './logo'

export function AppHeader() {
  return (
    <Navbar
      tone="brand"
      start={
        <>
          <Logo compact className="sm:hidden" />
          <Logo className="hidden sm:inline-flex" />
          <LocationSelector />
        </>
      }
      center={
        <div className="hidden w-full max-w-xl md:block">
          <SearchBar />
        </div>
      }
      end={
        <>
          <IconButton
            aria-label="Your orders"
            icon={<ClipboardList />}
            variant="ghost"
            className="hidden text-primary-foreground hover:bg-brand-300/60 md:inline-flex"
            render={<Link to="/orders" />}
          />
          <IconButton
            aria-label="Your profile"
            icon={<UserRound />}
            variant="ghost"
            className="hidden text-primary-foreground hover:bg-brand-300/60 md:inline-flex"
            render={<Link to="/profile" />}
          />
          <CartButton />
        </>
      }
      secondary={
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>
      }
    />
  )
}
