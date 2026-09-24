import { BottomNavigation, BottomNavigationItem } from '@shalgam/ui'
import { ClipboardList, House, Search, ShoppingCart, UserRound } from 'lucide-react'
import { Link, useLocation } from 'react-router'

import { useCartCount } from '../../features/cart/store/cart-store'

export function StorefrontBottomNav() {
  const { pathname } = useLocation()
  const count = useCartCount()
  // Browsing (categories, products) belongs to Home and checkout to Cart, so a tab is
  // always highlighted wherever the shopper is.
  const tab = pathname.startsWith('/search')
    ? 'search'
    : pathname.startsWith('/cart') || pathname.startsWith('/checkout')
      ? 'cart'
      : pathname.startsWith('/orders')
        ? 'orders'
        : pathname.startsWith('/profile')
          ? 'profile'
          : pathname === '/' || pathname.startsWith('/category') || pathname.startsWith('/product')
            ? 'home'
            : null
  const isActive = (name: NonNullable<typeof tab>) => tab === name
  return (
    <BottomNavigation>
      <BottomNavigationItem
        label="Home"
        icon={<House />}
        active={isActive('home')}
        render={<Link to="/" />}
      />
      <BottomNavigationItem
        label="Search"
        icon={<Search />}
        active={isActive('search')}
        render={<Link to="/search" />}
      />
      <BottomNavigationItem
        label="Cart"
        icon={<ShoppingCart />}
        active={isActive('cart')}
        badge={count > 0 ? count : undefined}
        render={<Link to="/cart" />}
      />
      <BottomNavigationItem
        label="Orders"
        icon={<ClipboardList />}
        active={isActive('orders')}
        render={<Link to="/orders" />}
      />
      <BottomNavigationItem
        label="Profile"
        icon={<UserRound />}
        active={isActive('profile')}
        render={<Link to="/profile" />}
      />
    </BottomNavigation>
  )
}
