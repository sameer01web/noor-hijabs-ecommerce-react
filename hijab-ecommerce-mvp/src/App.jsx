import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Header from './components/Header'
import MobileBottomNav from './components/MobileBottomNav'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Account from './pages/Account'
import Wishlist from './pages/Wishlist'
import About from './pages/About'
import OrderSuccess from './pages/OrderSuccess'
import ErrorBoundary from './components/ErrorBoundary'

// Admin Dashboard Components & Auth Guard
import { AdminAuthProvider, AdminRoute } from './context/AdminAuthContext'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/pages/AdminLogin'
import AdminOverview from './admin/pages/AdminOverview'
import AdminProducts from './admin/pages/AdminProducts'
import AdminCategories from './admin/pages/AdminCategories'
import AdminInventory from './admin/pages/AdminInventory'
import AdminOrders from './admin/pages/AdminOrders'
import AdminCoupons from './admin/pages/AdminCoupons'
import AdminCustomers from './admin/pages/AdminCustomers'
import AdminSettings from './admin/pages/AdminSettings'

import { ShieldCheck, Truck, Sparkles, Heart, MessageCircle } from 'lucide-react'
import { getStylingWhatsAppUrl } from './lib/whatsapp'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand-col">
          <div className="logo">
            NOOR <span className="logo-sub">HIJABS</span>
            <span className="logo-tag">HAUTE MODESTIE</span>
          </div>
          <p className="footer-bio">
            India's premier 100% pure hijab boutique. Dedicated exclusively to luxury Korean chiffon, pure mulberry silk, textured georgette, and artisan modest designs.
          </p>
          <div className="footer-trust-chips">
            <span>✨ 100% Pure Hijabs</span>
            <span>🌸 185cm Maxi Coverage</span>
            <span>🌿 Hypoallergenic</span>
          </div>
        </div>

        <div className="footer-col">
          <b>Hijab Collections</b>
          <Link to="/shop?category=Printed%20Hijabs">Printed Hijabs</Link>
          <Link to="/shop?category=Plain%20Hijabs">Plain Solid Hijabs</Link>
          <Link to="/shop?category=Chiffon%20Hijabs">Korean Chiffon</Link>
          <Link to="/shop?category=Georgette%20Hijabs">Matte Georgette</Link>
          <Link to="/shop?category=Silk%20Hijabs">Mulberry Silk & Satin</Link>
          <Link to="/shop?category=Cotton%20Hijabs">Turkish Cotton</Link>
          <Link to="/shop?category=Embroidered%20Hijabs">Embroidered Festive</Link>
          <Link to="/shop?category=New%20Arrivals">New Seasonal Drops</Link>
        </div>

        <div className="footer-col">
          <b>Customer Care</b>
          <Link to="/account">My Account & Orders</Link>
          <Link to="/wishlist">Saved Favorites</Link>
          <Link to="/cart">Shopping Bag</Link>
          <Link to="/about">The Noor Quality Promise</Link>
          <a href="#shipping">Shipping & 7-Day Returns</a>
          <a href={getStylingWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp Modest Help
          </a>
          <Link to="/admin/login" style={{ opacity: 0.7, fontSize: 12 }}>
            🔒 Staff & Admin Portal
          </Link>
        </div>

        <div className="footer-col footer-contact-col">
          <b>Connect with Noor</b>
          <p>Instagram · Facebook · Pinterest · YouTube</p>
          <p className="footer-contact-text">
            Need help selecting shades or fabrics for an upcoming event? Our modest stylists are here on WhatsApp.
          </p>
          <a
            href={getStylingWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-whatsapp-card"
            style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
          >
            <MessageCircle size={18} />
            <div>
              <strong>WhatsApp Support</strong>
              <span>Mon–Sat · 10 AM – 7 PM IST</span>
            </div>
          </a>
        </div>
      </div>

      <div className="footer-bottom wrap">
        <div className="footer-copy">
          © 2026 Noor Hijabs · 100% Pure Hijab Store · All Rights Reserved
        </div>
        <div className="footer-payment-icons">
          <span>UPI / GPay / PhonePe</span>
          <span>·</span>
          <span>Visa / Mastercard</span>
          <span>·</span>
          <span>Netbanking</span>
          <span>·</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('noor-cart') || '[]'))
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('noor-wishlist') || '[]'))
  const [search, setSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const location = useLocation()

  const isAdminPath = location.pathname.startsWith('/admin')

  useEffect(() => localStorage.setItem('noor-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('noor-wishlist', JSON.stringify(wishlist)), [wishlist])

  const add = (product, qty = 1) => setCart(c => {
    if ((product.stock || 0) <= 0) return c
    const maxStock = product.stock !== undefined ? product.stock : 99
    const old = c.find(x => x.product.id === product.id)
    if (old) {
      const newQty = Math.min(maxStock, old.qty + qty)
      return c.map(x => x.product.id === product.id ? { ...x, qty: newQty } : x)
    }
    return [...c, { product, qty: Math.min(maxStock, qty) }]
  })

  const qty = (id, n) => setCart(c => {
    if (n <= 0) return c.filter(x => x.product.id !== id)
    return c.map(x => {
      if (x.product.id === id) {
        const maxStock = x.product.stock !== undefined ? x.product.stock : 99
        return { ...x, qty: Math.min(maxStock, n) }
      }
      return x
    })
  })

  const remove = id => setCart(c => c.filter(x => x.product.id !== id))
  const wish = id => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])

  return (
    <AdminAuthProvider>
      <ScrollToTop />

      {/* Customer Header only when on customer routes */}
      {!isAdminPath && (
        <Header
          cartCount={cart.reduce((s, x) => s + x.qty, 0)}
          wishlistCount={wishlist.length}
          search={search}
          setSearch={setSearch}
          mobileSearchOpen={mobileSearchOpen}
          setMobileSearchOpen={setMobileSearchOpen}
        />
      )}

      <ErrorBoundary>
        <Routes>
          {/* Customer Storefront Routes */}
          <Route path="/" element={<Home wishlist={wishlist} onWishlist={wish} onAdd={add} />} />
          <Route path="/shop" element={<Shop search={search} wishlist={wishlist} onWishlist={wish} onAdd={add} />} />
          <Route path="/product/:id" element={<Product wishlist={wishlist} onWishlist={wish} onAdd={add} />} />
          <Route path="/cart" element={<Cart cart={cart} onQty={qty} onRemove={remove} />} />
          <Route path="/checkout" element={<Checkout cart={cart} clearCart={() => setCart([])} />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onWishlist={wish} onAdd={add} />} />
          <Route path="/about" element={<About />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </ErrorBoundary>

      {/* Customer Footer only when on customer routes */}
      {!isAdminPath && <Footer />}

      {/* Mobile-First Bottom Navigation Bar for Customer Storefront */}
      {!isAdminPath && (
        <MobileBottomNav
          cartCount={cart.reduce((s, x) => s + x.qty, 0)}
          wishlistCount={wishlist.length}
          onOpenSearch={() => {
            setMobileSearchOpen(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}
    </AdminAuthProvider>
  )
}