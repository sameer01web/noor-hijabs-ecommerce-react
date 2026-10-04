import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Ticket,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { useAdminAuth } from '../context/AdminAuthContext'
import { getProducts, getOrders, checkSupabaseStatus } from '../lib/dataService'
import './admin.css'

export default function AdminLayout() {
  const { adminUser, logout, supabaseConfigured } = useAdminAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const [dbStatus, setDbStatus] = useState({ configured: false })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  // Load badge notifications
  useEffect(() => {
    async function loadBadges() {
      try {
        const [prods, ords, status] = await Promise.all([
          getProducts(),
          getOrders(),
          checkSupabaseStatus()
        ])
        const low = prods.filter(p => p.stock <= (p.low_stock_threshold || 5)).length
        const pending = ords.filter(o => o.status === 'pending' || o.status === 'processing').length
        setLowStockCount(low)
        setPendingOrdersCount(pending)
        setDbStatus(status)
      } catch (e) {
        console.warn('Admin layout data load error:', e)
      }
    }
    loadBadges()
    const interval = setInterval(loadBadges, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const navLinks = [
    {
      to: '/admin',
      end: true,
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      to: '/admin/products',
      label: 'Hijab Products',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeType: 'alert'
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: Layers
    },
    {
      to: '/admin/inventory',
      label: 'Stock & Inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeType: 'alert'
    },
    {
      to: '/admin/orders',
      label: 'Customer Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeType: 'info'
    },
    {
      to: '/admin/coupons',
      label: 'Coupons & Promos',
      icon: Ticket
    },
    {
      to: '/admin/customers',
      label: 'Customers',
      icon: Users
    },
    {
      to: '/admin/settings',
      label: 'Backend & Settings',
      icon: Settings
    }
  ]

  return (
    <div className="admin-app">
      {/* Mobile Backdrop */}
      <div
        className={`admin-mobile-overlay ${mobileNavOpen ? 'active' : ''}`}
        onClick={() => setMobileNavOpen(false)}
      />

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <div className="admin-sidebar-header">
            <div className="admin-brand-logo">
              <div className="admin-brand-title">
                NOOR <span>HIJABS</span>
              </div>
              <div className="admin-brand-subtitle">Admin Portal · Haute Modestie</div>
            </div>
            <button
              type="button"
              className="admin-mobile-toggle mobile-only"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close admin navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="admin-sidebar-nav">
            <div className="admin-nav-section-title">STORE MANAGEMENT</div>
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`admin-nav-badge ${item.badgeType}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="admin-sidebar-footer">
            <div className="admin-user-card">
              <div className="admin-avatar">
                {adminUser?.full_name ? adminUser.full_name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="admin-user-info">
                <div className="admin-user-name">{adminUser?.full_name || 'Administrator'}</div>
                <span className="admin-user-role-badge">
                  Verified Admin
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="admin-main-area">
          {/* Top Bar */}
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                type="button"
                className="admin-mobile-toggle"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open sidebar"
              >
                <Menu size={22} />
              </button>

              <div className={`admin-supabase-status-pill ${dbStatus.configured ? 'connected' : 'disconnected'}`}>
                <span className="admin-status-dot" />
                <span>{dbStatus.configured ? 'Supabase Live' : 'Supabase Disconnected'}</span>
              </div>
            </div>

            <div className="admin-topbar-right">
              <Link to="/" target="_blank" className="admin-btn-store" title="Open customer storefront in new tab">
                <ExternalLink size={14} />
                <span className="admin-btn-text">View Store</span>
              </Link>

              <button
                type="button"
                className="admin-btn-logout"
                onClick={handleLogout}
                title="Sign out of admin"
              >
                <LogOut size={15} />
                <span className="admin-btn-text">Logout</span>
              </button>
            </div>
          </header>

          {/* Subroute Content View */}
          <main className="admin-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
