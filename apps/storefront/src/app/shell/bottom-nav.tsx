import { BottomNavigation, BottomNavigationItem } from '@shalgam/ui'
import { ClipboardList, House, Search, ShoppingCart, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { useCartCount } from '../../features/cart/store/cart-store'

export function StorefrontBottomNav() {
  const { pathname } = useLocation()
  const count = useCartCount()
  const isActive = (prefix: string) =>
    prefix === '/' ? pathname === '/' : pathname.startsWith(prefix)
  return (
    <BottomNavigation>
      <BottomNavigationItem
        label="Home"
        icon={<House />}
        active={isActive('/')}
        render={<Link to="/" />}
      />
      <BottomNavigationItem
        label="Search"
        icon={<Search />}
        active={isActive('/search')}
        render={<Link to="/search" />}
      />
      <BottomNavigationItem
        label="Cart"
        icon={<ShoppingCart />}
        active={isActive('/cart')}
        badge={count > 0 ? count : undefined}
        render={<Link to="/cart" />}
      />
      <BottomNavigationItem
        label="Orders"
        icon={<ClipboardList />}
        active={isActive('/orders')}
        render={<Link to="/orders" />}
      />
      <BottomNavigationItem
        label="Profile"
        icon={<UserRound />}
        active={isActive('/profile')}
        render={<Link to="/profile" />}
      />
    </BottomNavigation>
  )
}
