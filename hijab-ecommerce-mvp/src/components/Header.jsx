import { Heart, Search, ShoppingBag, UserRound, Menu, X, Sparkles, ChevronRight, ArrowRight, MessageCircle, Truck, ShieldCheck, Tag } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import React, { useState, useEffect } from 'react'
import { getStylingWhatsAppUrl } from '../lib/whatsapp'

export default function Header({
  cartCount,
  wishlistCount,
  search,
  setSearch,
  mobileSearchOpen,
  setMobileSearchOpen
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile drawer and search on route transition
  useEffect(() => {
    setMobileMenuOpen(false)
    if (setMobileSearchOpen) setMobileSearchOpen(false)
  }, [location.pathname, location.search])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      navigate('/shop')
      if (setMobileSearchOpen) setMobileSearchOpen(false)
    }
  }

  const navCategories = [
    { label: 'Printed Hijabs', path: '/shop?category=Printed%20Hijabs', desc: 'Artisan Floral & Botanical', count: '12+' },
    { label: 'Plain Solid Hijabs', path: '/shop?category=Plain%20Hijabs', desc: 'Essential Everyday Solids', count: '18+' },
    { label: 'Korean Chiffon', path: '/shop?category=Chiffon%20Hijabs', desc: 'Featherlight Flow & Drape', count: 'Best' },
    { label: 'Matte Georgette', path: '/shop?category=Georgette%20Hijabs', desc: 'Non-Slip Textured Weave', count: 'Matte' },
    { label: 'Mulberry Silk & Satin', path: '/shop?category=Silk%20Hijabs', desc: 'Lustrous Occasion Wear', count: 'Luxury' },
    { label: 'Embroidered Festive', path: '/shop?category=Embroidered%20Hijabs', desc: 'Hand-Beaded Pearl & Lace', count: 'Handmade' }
  ]

  return (
    <header className="header">
      {/* Top Announcement Bar */}
      <div className="announcement">
        <div className="wrap announcement-content">
          <span>✨ <strong>FREE Express Shipping</strong> on orders above ₹999</span>
          <span className="announcement-separator">·</span>
          <span>100% Pure Hijab Boutique</span>
          <span className="announcement-separator">·</span>
          <span className="announcement-pill">Code: <strong>NOOR10</strong> for 10% Off</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="nav wrap">
        <button
          type="button"
          className="icon-btn mobile-menu-btn mobile-only"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <Link to="/" className="logo">
          NOOR <span className="logo-sub">HIJABS</span>
          <span className="logo-tag">HAUTE MODESTIE</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navlinks desktop-only">
          <Link to="/" className={location.pathname === '/' ? 'active-nav' : ''}>Home</Link>
          <Link to="/shop" className={location.pathname === '/shop' && !location.search ? 'active-nav' : ''}>All Hijabs</Link>
          <Link to="/shop?category=Printed%20Hijabs" className={location.search.includes('Printed') ? 'active-nav' : ''}>Printed</Link>
          <Link to="/shop?category=Plain%20Hijabs" className={location.search.includes('Plain') ? 'active-nav' : ''}>Plain</Link>
          <Link to="/shop?category=Chiffon%20Hijabs" className={location.search.includes('Chiffon') ? 'active-nav' : ''}>Chiffon</Link>
          <Link to="/shop?category=Silk%20Hijabs" className={location.search.includes('Silk') ? 'active-nav' : ''}>Silk</Link>
          <Link to="/shop?category=New%20Arrivals" className="nav-highlight">
            <span>New Drops</span>
            <span className="sparkle-dot" />
          </Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active-nav' : ''}>Our Story</Link>
        </nav>

        {/* Action Icons */}
        <div className="actions">
          {/* Desktop Search Bar */}
          <div className="search desktop-search desktop-only">
            <Search size={15} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search fabrics, colors..."
              aria-label="Search hijabs"
            />
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            type="button"
            className="action-icon mobile-only icon-btn"
            onClick={() => setMobileSearchOpen && setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search bar"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Wishlist Link */}
          <Link to="/wishlist" className="action-icon" aria-label="View Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
          </Link>

          {/* Account Link (Desktop) */}
          <Link to="/account" className="action-icon desktop-only" aria-label="Account and Orders">
            <UserRound size={20} />
          </Link>

          {/* Shopping Bag Link */}
          <Link to="/cart" className="action-icon bag-icon-btn" aria-label="View Shopping Bag">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="action-badge pulse">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="mobile-search-bar wrap">
          <div className="mobile-search-input-wrapper">
            <Search size={16} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Search silk, chiffon, printed, floral..."
              aria-label="Search hijabs on mobile"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn primary search-submit-btn"
            onClick={() => {
              navigate('/shop')
              if (setMobileSearchOpen) setMobileSearchOpen(false)
            }}
          >
            Search
          </button>
        </div>
      )}

      {/* Luxury Mobile Slide-Over Drawer Navigation */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <div className="logo">
            NOOR <span className="logo-sub">HIJABS</span>
            <span className="logo-tag">HAUTE MODESTIE</span>
          </div>
          <button
            type="button"
            className="icon-btn close-drawer-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mobile-drawer-content">
          {/* VIP Welcome Card */}
          <div className="drawer-vip-card">
            <div className="vip-icon-box">
              <Sparkles size={16} />
            </div>
            <div className="vip-text-wrap">
              <strong>10% Off Your First Order</strong>
              <span>Use code <b className="vip-coupon-code">NOOR10</b> at checkout</span>
            </div>
          </div>

          {/* Fast Navigation Quick Links */}
          <div className="drawer-quick-highlights">
            <Link
              to="/shop?category=New%20Arrivals"
              onClick={() => setMobileMenuOpen(false)}
              className="drawer-highlight-btn new-drop-highlight"
            >
              <span className="highlight-tag">SEASON DROP</span>
              <strong>New Arrivals ✨</strong>
            </Link>
            <Link
              to="/shop?category=Best%20Sellers"
              onClick={() => setMobileMenuOpen(false)}
              className="drawer-highlight-btn bestseller-highlight"
            >
              <span className="highlight-tag">MOST LOVED</span>
              <strong>Best Sellers 👑</strong>
            </Link>
          </div>

          {/* Section 1: Hijab Collections & Fabrics */}
          <div className="drawer-section-heading">
            <span>EXPLORE BY FABRIC & STYLE</span>
          </div>

          <div className="drawer-categories-list">
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="drawer-cat-card drawer-all-card"
            >
              <div className="drawer-cat-info">
                <strong>All Hijabs Archive</strong>
                <span>Explore all pure fabrics & weaves</span>
              </div>
              <ChevronRight size={16} className="cat-arrow" />
            </Link>

            {navCategories.map(cat => (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="drawer-cat-card"
              >
                <div className="drawer-cat-info">
                  <strong>{cat.label}</strong>
                  <span>{cat.desc}</span>
                </div>
                <div className="drawer-cat-meta">
                  <span className="drawer-mini-pill">{cat.count}</span>
                  <ChevronRight size={15} className="cat-arrow" />
                </div>
              </Link>
            ))}
          </div>

          {/* Section 2: Account & Customer Care */}
          <div className="drawer-section-heading">
            <span>MY BOUTIQUE & CARE</span>
          </div>

          <div className="drawer-account-links">
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="drawer-service-link">
              <div className="service-icon-wrap"><UserRound size={16} /></div>
              <span>My Account & Order Tracking</span>
              <ChevronRight size={15} className="service-arrow" />
            </Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="drawer-service-link">
              <div className="service-icon-wrap"><Heart size={16} /></div>
              <span>Saved Wishlist</span>
              {wishlistCount > 0 && <span className="drawer-wish-count">{wishlistCount}</span>}
              <ChevronRight size={15} className="service-arrow" />
            </Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="drawer-service-link">
              <div className="service-icon-wrap"><ShieldCheck size={16} /></div>
              <span>The 100% Pure Hijab Promise</span>
              <ChevronRight size={15} className="service-arrow" />
            </Link>
          </div>

          {/* VIP WhatsApp Stylist Help Card */}
          <a
            href={getStylingWhatsAppUrl('hijab fabric guidance')}
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-whatsapp-card"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="wa-icon-box">
              <MessageCircle size={20} />
            </div>
            <div className="wa-text-box">
              <strong>Chat with Modest Stylist</strong>
              <span>Instant shade & fabric matching on WhatsApp</span>
              <small>Mon–Sat · 10 AM – 7 PM IST</small>
            </div>
          </a>
        </div>

        {/* Drawer Footer */}
        <div className="mobile-drawer-footer">
          <div className="drawer-footer-perks">
            <span>🌸 185cm Maxi Length</span>
            <span>·</span>
            <span>✨ 100% Pure Hijabs</span>
          </div>
          <div className="drawer-footer-brand">
            NOOR HAUTE MODESTIE · MUMBAI, INDIA
          </div>
        </div>
      </aside>
    </header>
  )
}