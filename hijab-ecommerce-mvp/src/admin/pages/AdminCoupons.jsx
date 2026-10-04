import React, { useState, useEffect } from 'react'
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Copy,
  AlertCircle,
  Sparkles,
  Calendar
} from 'lucide-react'
import {
  getCoupons,
  addCoupon,
  updateCoupon,
  deleteCoupon
} from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedCode, setCopiedCode] = useState(null)

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form
  const initialForm = {
    code: '',
    discount_type: 'percent', // 'percent' | 'fixed'
    discount_value: 10,
    min_order_amount: 499,
    max_discount: 300,
    usage_limit: 500,
    starts_at: new Date().toISOString().slice(0, 10),
    expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    is_active: true
  }
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    setLoading(true)
    try {
      const data = await getCoupons()
      setCoupons(data)
    } catch (err) {
      console.error('Failed to load coupons:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = (preset = null) => {
    setEditingCoupon(null)
    if (preset) {
      setFormData({
        ...initialForm,
        ...preset
      })
    } else {
      setFormData(initialForm)
    }
    setErrorMsg('')
    setModalOpen(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code || '',
      discount_type: coupon.discount_type || 'percent',
      discount_value: coupon.discount_value || 0,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount: coupon.max_discount || '',
      usage_limit: coupon.usage_limit || '',
      starts_at: coupon.starts_at ? coupon.starts_at.slice(0, 10) : '',
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 10) : '',
      is_active: coupon.is_active !== undefined ? coupon.is_active : true
    })
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.code.trim()) {
      setErrorMsg('Coupon code is required.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discount_value: Number(formData.discount_value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
      }

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload)
      } else {
        await addCoupon(payload)
      }

      await loadCoupons()
      setModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save coupon.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCoupon(id)
      setCoupons(coupons.filter(c => c.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete coupon: ' + err.message)
    }
  }

  const handleToggleActive = async (coupon) => {
    const newStatus = !coupon.is_active
    await updateCoupon(coupon.id, { is_active: newStatus })
    setCoupons(coupons.map(c => (c.id === coupon.id ? { ...c, is_active: newStatus } : c)))
  }

  const filteredCoupons = coupons.filter(c =>
    !search ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-coupons-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Coupons & Discount Codes ({coupons.length})</h1>
          <p>Create promotional offers, percentage savings, and festive Ramadan/Eid campaigns</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-gold"
            onClick={() => openAddModal()}
          >
            <Plus size={16} />
            <span>Create New Coupon</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 24 }}>
        <div
          onClick={() => openAddModal({ code: 'EID2026', discount_type: 'percent', discount_value: 15, min_order_amount: 999 })}
          style={{ background: '#181c27', border: '1px dashed #2b3142', borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
          className="admin-preset-card"
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(212, 175, 55, 0.15)', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>+ Preset: EID2026</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>15% off orders &gt; ₹999</div>
          </div>
        </div>

        <div
          onClick={() => openAddModal({ code: 'FLAT200', discount_type: 'fixed', discount_value: 200, min_order_amount: 1499 })}
          style={{ background: '#181c27', border: '1px dashed #2b3142', borderRadius: 10, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ticket size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>+ Preset: FLAT200</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Flat ₹200 off &gt; ₹1,499</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search coupons by code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 250 }}>
          <div className="admin-spinner" />
          <p>Loading coupons...</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Max. Discount</th>
                <th>Redemptions</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coup) => (
                <tr key={coup.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ color: '#d4af37', fontSize: 14, letterSpacing: 0.5 }}>
                        {coup.code}
                      </strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(coup.code)}
                        style={{ background: 'none', border: 'none', color: copiedCode === coup.code ? '#34d399' : '#64748b', cursor: 'pointer', padding: 2 }}
                        title="Copy coupon code"
                      >
                        {copiedCode === coup.code ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#fff' }}>
                      {coup.discount_type === 'percent'
                        ? `${coup.discount_value}% OFF`
                        : `${formatINR(coup.discount_value)} OFF`}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {coup.min_order_amount > 0 ? formatINR(coup.min_order_amount) : 'No Minimum'}
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {coup.max_discount ? formatINR(coup.max_discount) : 'No Cap'}
                  </td>
                  <td>
                    <div style={{ color: '#fff', fontSize: 13 }}>
                      <b>{coup.used_count || 0}</b>
                      {coup.usage_limit ? ` / ${coup.usage_limit}` : ' (Unlimited)'}
                    </div>
                  </td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>
                    {coup.expires_at ? new Date(coup.expires_at).toLocaleDateString('en-IN') : 'Never'}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coup)}
                      className={`admin-badge ${coup.is_active ? 'status-active' : 'status-inactive'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Toggle active status"
                    >
                      {coup.is_active ? '● Active' : '○ Disabled'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEditModal(coup)}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => setDeleteConfirm(coup)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingCoupon ? 'Edit Coupon' : 'Create Promotional Coupon'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                {errorMsg && (
                  <div className="admin-login-alert error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="admin-form-group">
                  <label>Coupon Code * (e.g. NOOR10, EID2026)</label>
                  <input
                    type="text"
                    required
                    className="admin-input admin-input-noicon"
                    placeholder="NOOR10"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    style={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Discount Type *</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%', padding: '12px 14px' }}
                      value={formData.discount_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label>Discount Value *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder={formData.discount_type === 'percent' ? '10' : '200'}
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Minimum Order Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input admin-input-noicon"
                      placeholder="499"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_order_amount: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Maximum Discount Cap (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input admin-input-noicon"
                      placeholder="300"
                      value={formData.max_discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Usage Limit (Max Uses)</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-input admin-input-noicon"
                      placeholder="Unlimited"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      className="admin-input admin-input-noicon"
                      value={formData.expires_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="coup_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#d4af37' }}
                  />
                  <label htmlFor="coup_active" style={{ color: '#fff', fontSize: 13.5, cursor: 'pointer' }}>
                    Active & Redeemable at Checkout
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-gold"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Coupon</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#f87171', fontSize: 14 }}>
                Are you sure you want to delete coupon <strong>{deleteConfirm.code}</strong>?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
