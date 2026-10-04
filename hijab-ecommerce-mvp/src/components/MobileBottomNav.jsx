import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Sparkles, Heart, ShoppingBag, Search } from 'lucide-react'

export default function MobileBottomNav({ cartCount, wishlistCount, onOpenSearch }) {
  const location = useLocation()
  const path = location.pathname

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation Bar">
      <Link to="/" className={`bottom-nav-item ${path === '/' ? 'active' : ''}`}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link to="/shop" className={`bottom-nav-item ${path.startsWith('/shop') ? 'active' : ''}`}>
        <Sparkles size={20} />
        <span>Hijabs</span>
      </Link>

      <button
        type="button"
        className="bottom-nav-item bottom-nav-btn"
        onClick={onOpenSearch}
        aria-label="Open search"
      >
        <Search size={20} />
        <span>Search</span>
      </button>

      <Link to="/wishlist" className={`bottom-nav-item ${path === '/wishlist' ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="bottom-badge">{wishlistCount}</span>}
        </div>
        <span>Wishlist</span>
      </Link>

      <Link to="/cart" className={`bottom-nav-item ${path === '/cart' || path === '/checkout' ? 'active' : ''}`}>
        <div className="nav-icon-wrapper">
          <ShoppingBag size={20} />
          {cartCount > 0 && <span className="bottom-badge">{cartCount}</span>}
        </div>
        <span>Bag</span>
      </Link>
    </nav>
  )
}
