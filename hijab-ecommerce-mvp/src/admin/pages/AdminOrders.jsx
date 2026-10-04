import React, { useState, useEffect, useMemo } from 'react'
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  CreditCard,
  Banknote,
  MapPin,
  Phone,
  Mail,
  User,
  FileText,
  Printer,
  ChevronRight,
  Sparkles,
  Save
} from 'lucide-react'
import {
  getOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderNotes
} from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
]

const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'failed',
  'refunded'
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')

  // Selected Order Modal / Detail View
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await getOrders()
      setOrders(data)
    } catch (e) {
      console.error('Failed to load orders:', e)
    } finally {
      setLoading(false)
    }
  }

  const openOrderDetail = (order) => {
    setSelectedOrder(order)
    setAdminNotes(order.notes || '')
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(o => (o.id === orderId ? updated : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated)
      }
    } catch (e) {
      alert('Failed to update order status: ' + e.message)
    }
  }

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      const updated = await updateOrderPaymentStatus(orderId, newPaymentStatus)
      setOrders(orders.map(o => (o.id === orderId ? updated : o)))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated)
      }
    } catch (e) {
      alert('Failed to update payment status: ' + e.message)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedOrder) return
    setSavingNotes(true)
    try {
      const updated = await updateOrderNotes(selectedOrder.id, adminNotes)
      setOrders(orders.map(o => (o.id === selectedOrder.id ? updated : o)))
      setSelectedOrder(updated)
    } catch (e) {
      alert('Failed to save notes: ' + e.message)
    } finally {
      setSavingNotes(false)
    }
  }

  const handlePrintSlip = () => {
    window.print()
  }

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q ||
        o.order_number?.toLowerCase().includes(q) ||
        o.shipping_name?.toLowerCase().includes(q) ||
        o.shipping_phone?.toLowerCase().includes(q) ||
        o.shipping_city?.toLowerCase().includes(q) ||
        o.shipping_pincode?.includes(q)

      const matchesStatus = statusFilter === 'All' || o.status === statusFilter
      const matchesPayment = paymentFilter === 'All' || o.payment_status === paymentFilter

      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [orders, search, statusFilter, paymentFilter])

  return (
    <div className="admin-orders-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Customer Orders ({orders.length})</h1>
          <p>Track payments, update dispatch statuses, and manage fulfillment workflows</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by order #, customer name, phone, city, or pincode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Fulfillment Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s} style={{ textTransform: 'capitalize' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="admin-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="All">All Payment Statuses</option>
            {PAYMENT_STATUSES.map(p => (
              <option key={p} value={p} style={{ textTransform: 'capitalize' }}>
                Payment: {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 300 }}>
          <div className="admin-spinner" />
          <p>Loading customer orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
          <ShoppingBag size={48} style={{ color: '#64748b', margin: '0 auto 16px auto' }} />
          <h3 style={{ color: '#fff', marginBottom: 8 }}>No orders match this query</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Customer & City</th>
                <th>Items</th>
                <th>Total Paid</th>
                <th>Payment Status</th>
                <th>Fulfillment</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong style={{ color: '#d4af37', fontSize: 13.5 }}>{o.order_number}</strong>
                    {o.coupon_code && (
                      <div style={{ fontSize: 11, color: '#10b981' }}>
                        Coupon: {o.coupon_code}
                      </div>
                    )}
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: 12.5 }}>
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{o.shipping_name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {o.shipping_phone} · {o.shipping_city}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{o.items?.length || 1}</span> hijabs
                  </td>
                  <td>
                    <strong style={{ color: '#fff', fontSize: 14 }}>{formatINR(o.total)}</strong>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>
                      {o.payment_method}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge status-${o.payment_status}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      style={{ padding: '5px 8px', fontSize: 12 }}
                      value={o.status}
                      onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(st => (
                        <option key={st} value={st}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openOrderDetail(o)}
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="admin-modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <span style={{ fontSize: 12, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                  ORDER DETAILS & INVOICE
                </span>
                <h3 className="admin-modal-title" style={{ marginTop: 2 }}>
                  {selectedOrder.order_number}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={handlePrintSlip}
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              {/* Order Status Timeline Control */}
              <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Fulfillment Status:</span>
                    <strong style={{ marginLeft: 8, color: '#fff', textTransform: 'uppercase' }}>{selectedOrder.status}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Payment Status:</span>
                    <strong style={{ marginLeft: 8, color: '#d4af37', textTransform: 'uppercase' }}>{selectedOrder.payment_status}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Change Fulfillment Status:
                    </label>
                    <select
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                      Change Payment Status:
                    </label>
                    <select
                      className="admin-select"
                      style={{ width: '100%' }}
                      value={selectedOrder.payment_status}
                      onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                    >
                      {PAYMENT_STATUSES.map(p => (
                        <option key={p} value={p}>
                          Payment: {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Address */}
              <div className="admin-form-grid-2" style={{ marginBottom: 20 }}>
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d4af37', marginBottom: 10 }}>
                    <User size={16} />
                    <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer Information</strong>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                    {selectedOrder.shipping_name}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                    📞 {selectedOrder.shipping_phone}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    ✉️ {selectedOrder.email || 'customer@noorhijabs.com'}
                  </div>
                </div>

                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d4af37', marginBottom: 10 }}>
                    <MapPin size={16} />
                    <strong style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>Delivery Address</strong>
                  </div>
                  <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.4, marginBottom: 4 }}>
                    {selectedOrder.shipping_address_line1}
                    {selectedOrder.shipping_address_line2 && `, ${selectedOrder.shipping_address_line2}`}
                  </p>
                  {selectedOrder.shipping_landmark && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>
                      Landmark: {selectedOrder.shipping_landmark}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#d4af37' }}>
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}
                  </div>
                </div>
              </div>

              {/* Items Ordered List */}
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#fff', fontSize: 14, marginBottom: 10 }}>Ordered Hijabs</h4>
                <div style={{ border: '1px solid #2b3142', borderRadius: 10, overflow: 'hidden' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: '#12151e',
                        borderBottom: idx === selectedOrder.items.length - 1 ? 'none' : '1px solid #2b3142'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.product_name}
                            style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }}
                          />
                        )}
                        <div>
                          <strong style={{ color: '#fff', fontSize: 13.5 }}>{item.product_name}</strong>
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>
                            {item.color} {item.fabric && `· ${item.fabric}`} · Qty: <b>{item.quantity}</b>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: '#d4af37' }}>
                          {formatINR(item.line_total || item.unit_price * item.quantity)}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {formatINR(item.unit_price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary & Financials */}
              <div className="admin-form-grid-2" style={{ marginBottom: 20 }}>
                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 16 }}>
                  <strong style={{ color: '#fff', fontSize: 13, display: 'block', marginBottom: 8 }}>
                    Payment Information
                  </strong>
                  <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>Method: <b style={{ color: '#fff', textTransform: 'uppercase' }}>{selectedOrder.payment_method}</b></div>
                    {selectedOrder.razorpay_order_id && (
                      <div>Razorpay Order ID: <code>{selectedOrder.razorpay_order_id}</code></div>
                    )}
                    {selectedOrder.razorpay_payment_id && (
                      <div>Razorpay Payment ID: <code>{selectedOrder.razorpay_payment_id}</code></div>
                    )}
                    <div>Created: {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div style={{ background: '#12151e', border: '1px solid #2b3142', borderRadius: 10, padding: 16 }}>
                  <strong style={{ color: '#fff', fontSize: 13, display: 'block', marginBottom: 8 }}>
                    Financial Summary
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Subtotal</span>
                      <b>{formatINR(selectedOrder.subtotal)}</b>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <span>Discount ({selectedOrder.coupon_code || 'Coupon'})</span>
                        <b>- {formatINR(selectedOrder.discount)}</b>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Shipping Fee</span>
                      <b>{selectedOrder.shipping_fee === 0 ? 'FREE' : formatINR(selectedOrder.shipping_fee)}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', paddingTop: 6, borderTop: '1px solid #2b3142', fontSize: 15 }}>
                      <strong>Grand Total</strong>
                      <strong style={{ color: '#d4af37' }}>{formatINR(selectedOrder.total)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
                  Internal Admin Notes & Packaging Instructions
                </label>
                <textarea
                  rows={3}
                  className="admin-textarea"
                  placeholder="Add packaging notes, special delivery requests, or tracking number..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-gold admin-btn-sm"
                    disabled={savingNotes}
                    onClick={handleSaveNotes}
                  >
                    <Save size={13} />
                    <span>{savingNotes ? 'Saving Notes...' : 'Save Notes'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setSelectedOrder(null)}
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
