import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Plus,
  Boxes,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  Ticket,
  ChevronRight,
  Layers,
  DollarSign
} from 'lucide-react'
import {
  getProducts,
  getOrders,
  getCategories,
  getCustomers,
  updateOrderStatus,
  updateProductStock
} from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

export default function AdminOverview() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [restockModal, setRestockModal] = useState(null)
  const [restockAmount, setRestockAmount] = useState(20)

  useEffect(() => {
    async function loadOverview() {
      try {
        const [p, o, c, u] = await Promise.all([
          getProducts(),
          getOrders(),
          getCategories(),
          getCustomers()
        ])
        setProducts(p)
        setOrders(o)
        setCategories(c)
        setCustomers(u)
      } catch (err) {
        console.error('Error loading overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadOverview()
  }, [])

  // Metrics calculations
  const totalRevenue = orders
    .filter(o => o.payment_status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing')
  const lowStockProducts = products.filter(p => p.stock <= (p.low_stock_threshold || 5))
  const outOfStockProducts = products.filter(p => p.stock === 0)
  const activeProducts = products.filter(p => p.is_active)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / Math.max(1, orders.filter(o => o.payment_status === 'paid').length)) : 0

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(o => (o.id === orderId ? updated : o)))
    } catch (e) {
      alert('Failed to update status: ' + e.message)
    }
  }

  const handleRestockSubmit = async (e) => {
    e.preventDefault()
    if (!restockModal) return
    const newStock = restockModal.stock + Number(restockAmount)
    await updateProductStock(restockModal.id, newStock)
    setProducts(products.map(p => (p.id === restockModal.id ? { ...p, stock: newStock } : p)))
    setRestockModal(null)
  }

  if (loading) {
    return (
      <div className="admin-loading-screen" style={{ minHeight: '60vh' }}>
        <div className="admin-spinner" />
        <p>Loading Haute Modestie Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="admin-overview-page">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Dashboard Overview</h1>
          <p>Real-time analytics and performance metrics for Noor Hijabs Boutique</p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/products" className="admin-btn admin-btn-gold">
            <Plus size={16} />
            <span>Add New Hijab</span>
          </Link>
          <Link to="/admin/inventory" className="admin-btn admin-btn-secondary">
            <Boxes size={16} />
            <span>Manage Stock</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Revenue</span>
            <div className="admin-stat-icon gold">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{formatINR(totalRevenue)}</div>
          <div className="admin-stat-subtext">
            <span className="trend-up">↑ 18.4%</span>
            <span>vs last month</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Customer Orders</span>
            <div className="admin-stat-icon blue">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{totalOrders}</div>
          <div className="admin-stat-subtext">
            <span>{pendingOrders.length} orders need dispatch</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Hijab Catalog</span>
            <div className="admin-stat-icon purple">
              <Package size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{activeProducts.length} <small style={{ fontSize: 13, color: '#94a3b8' }}>/ {products.length}</small></div>
          <div className="admin-stat-subtext">
            {lowStockProducts.length > 0 ? (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                ⚠️ {lowStockProducts.length} low stock alerts
              </span>
            ) : (
              <span style={{ color: '#10b981' }}>✓ All stock healthy</span>
            )}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Registered Customers</span>
            <div className="admin-stat-icon green">
              <Users size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{customers.length}</div>
          <div className="admin-stat-subtext">
            <span>Sisterhood VIP Members</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Average Order Value</span>
            <div className="admin-stat-icon gold">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{formatINR(avgOrderValue)}</div>
          <div className="admin-stat-subtext">
            <span>Across all fulfilled orders</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="admin-grid-2col">
        {/* Left Column: Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <ShoppingBag size={18} className="gold" />
              <span>Recent Orders</span>
            </div>
            <Link to="/admin/orders" className="admin-btn admin-btn-secondary admin-btn-sm">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="admin-table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong style={{ color: '#fff', fontSize: 13 }}>{order.order_number}</strong>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <div>{order.shipping_name}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{order.shipping_city}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{order.items?.length || 1}</span> items
                    </td>
                    <td>
                      <strong style={{ color: '#d4af37' }}>{formatINR(order.total)}</strong>
                    </td>
                    <td>
                      <span className={`admin-badge status-${order.payment_status}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-select"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Low Stock Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
                <span>Low Stock Alerts</span>
              </div>
              <Link to="/admin/inventory" className="admin-btn admin-btn-secondary admin-btn-sm">
                Restock All
              </Link>
            </div>

            <div className="admin-card-body" style={{ padding: '12px 16px' }}>
              {lowStockProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  <p style={{ fontWeight: 600 }}>All hijabs well-stocked!</p>
                  <span style={{ fontSize: 12, color: '#64748b' }}>No warehouse thresholds breached.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {lowStockProducts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: '#12151e',
                        borderRadius: 8,
                        border: '1px solid #2b3142'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: 140
                            }}
                          >
                            {p.name}
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>
                            {p.color} · <strong style={{ color: p.stock === 0 ? '#ef4444' : '#f59e0b' }}>{p.stock} left</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="admin-btn admin-btn-gold admin-btn-sm"
                        onClick={() => {
                          setRestockModal(p)
                          setRestockAmount(20)
                        }}
                      >
                        + Restock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hijab Categories Quick View */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div className="admin-card-title">
                <Layers size={18} style={{ color: '#d4af37' }} />
                <span>Categories Distribution</span>
              </div>
              <Link to="/admin/categories" className="admin-btn admin-btn-secondary admin-btn-sm">
                Manage
              </Link>
            </div>

            <div className="admin-card-body" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {categories.slice(0, 5).map((cat) => {
                  const count = products.filter(
                    (p) => p.category?.toLowerCase() === cat.name?.toLowerCase() || p.categories?.includes(cat.name)
                  ).length
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 13
                      }}
                    >
                      <span style={{ color: '#fff' }}>{cat.name}</span>
                      <span
                        style={{
                          background: '#141824',
                          border: '1px solid #2b3142',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#d4af37'
                        }}
                      >
                        {count} hijabs
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restock Quick Modal */}
      {restockModal && (
        <div className="admin-modal-overlay" onClick={() => setRestockModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Restock Inventory</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setRestockModal(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleRestockSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <img
                    src={restockModal.image}
                    alt={restockModal.name}
                    style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div>
                    <strong style={{ color: '#fff', fontSize: 14 }}>{restockModal.name}</strong>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Current Stock: <b>{restockModal.stock} units</b>
                    </div>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Units to Add to Stock</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="admin-input admin-input-noicon"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setRestockModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-gold">
                  Confirm Restock ({restockModal.stock + Number(restockAmount)} total)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
