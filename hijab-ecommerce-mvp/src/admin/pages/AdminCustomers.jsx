import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  User,
  ShoppingBag,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  DollarSign
} from 'lucide-react'
import { getCustomers, getOrders } from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const [c, o] = await Promise.all([getCustomers(), getOrders()])
      setCustomers(c)
      setOrders(o)
    } catch (e) {
      console.error('Failed to load customers:', e)
    } finally {
      setLoading(false)
    }
  }

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return []
    return orders.filter(
      o => o.user_id === selectedCustomer.id ||
      o.shipping_phone === selectedCustomer.phone ||
      o.shipping_name?.toLowerCase() === selectedCustomer.full_name?.toLowerCase()
    )
  }, [selectedCustomer, orders])

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = search.trim().toLowerCase()
      return !q ||
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.city?.toLowerCase().includes(q)
    })
  }, [customers, search])

  return (
    <div className="admin-customers-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Customer Directory ({customers.length})</h1>
          <p>Sisterhood members, registered boutique profiles, and VIP order histories</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 250 }}>
          <div className="admin-spinner" />
          <p>Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
          <Users size={48} style={{ color: '#64748b', margin: '0 auto 16px auto' }} />
          <h3 style={{ color: '#fff', marginBottom: 8 }}>No customers match this query</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>City / Region</th>
                <th>Role</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Member Since</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="admin-avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
                        {c.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <strong style={{ color: '#fff', fontSize: 13.5 }}>{c.full_name}</strong>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#fff', fontSize: 13 }}>
                    {c.phone || '—'}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {c.city || 'India'}
                  </td>
                  <td>
                    <span
                      style={{
                        background: c.role === 'admin' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: c.role === 'admin' ? '#d4af37' : '#94a3b8',
                        border: '1px solid',
                        borderColor: c.role === 'admin' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{c.orders_count || 0}</span> orders
                  </td>
                  <td>
                    <strong style={{ color: '#d4af37' }}>{formatINR(c.total_spent || 0)}</strong>
                  </td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <Eye size={13} />
                      <span>History</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Detail & Orders History Modal */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="admin-modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="admin-avatar" style={{ width: 40, height: 40, fontSize: 16 }}>
                  {selectedCustomer.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="admin-modal-title">{selectedCustomer.full_name}</h3>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {selectedCustomer.email} · {selectedCustomer.phone}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Total Orders</div>
                  <strong style={{ fontSize: 20, color: '#fff' }}>{customerOrders.length || selectedCustomer.orders_count || 0}</strong>
                </div>
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Lifetime Spend</div>
                  <strong style={{ fontSize: 20, color: '#d4af37' }}>{formatINR(selectedCustomer.total_spent || 0)}</strong>
                </div>
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Customer Status</div>
                  <strong style={{ fontSize: 16, color: '#34d399' }}>✓ Verified Sisterhood</strong>
                </div>
              </div>

              {/* Order History */}
              <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 12 }}>Order History</h4>
              {customerOrders.length === 0 ? (
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 24, textAlign: 'center', color: '#94a3b8' }}>
                  No order records found for this profile.
                </div>
              ) : (
                <div className="admin-table-wrapper" style={{ border: '1px solid #2b3142' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong style={{ color: '#fff' }}>{o.order_number}</strong></td>
                          <td style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                          <td><span className={`admin-badge status-${o.status}`}>{o.status}</span></td>
                          <td><span className={`admin-badge status-${o.payment_status}`}>{o.payment_status}</span></td>
                          <td><strong style={{ color: '#d4af37' }}>{formatINR(o.total)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
