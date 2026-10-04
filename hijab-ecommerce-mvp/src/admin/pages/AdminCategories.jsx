import React, { useState, useEffect } from 'react'
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Package,
  ArrowRight
} from 'lucide-react'
import {
  getCategories,
  getProducts,
  addCategory,
  updateCategory,
  deleteCategory
} from '../../lib/dataService'
import '../admin.css'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Form
  const initialForm = {
    name: '',
    slug: '',
    description: '',
    sort_order: 1,
    is_active: true
  }
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [c, p] = await Promise.all([getCategories(), getProducts()])
      setCategories(c)
      setProducts(p)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingCategory(null)
    setFormData({
      ...initialForm,
      sort_order: categories.length + 1
    })
    setErrorMsg('')
    setModalOpen(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      sort_order: cat.sort_order || 1,
      is_active: cat.is_active !== undefined ? cat.is_active : true
    })
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleNameChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : slug
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.name.trim()) {
      setErrorMsg('Category name is required.')
      return
    }

    setSaving(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await addCategory(formData)
      }
      await loadData()
      setModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      setCategories(categories.filter(c => c.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const handleToggleActive = async (cat) => {
    const newStatus = !cat.is_active
    await updateCategory(cat.id, { is_active: newStatus })
    setCategories(categories.map(c => (c.id === cat.id ? { ...c, is_active: newStatus } : c)))
  }

  const filteredCategories = categories.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="admin-categories-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Hijab Categories ({categories.length})</h1>
          <p>Organize collections, fabrics, seasonal drops, and store taxonomies</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-gold"
            onClick={openAddModal}
          >
            <Plus size={16} />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search categories by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 250 }}>
          <div className="admin-spinner" />
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Products Count</th>
                <th>Sort Order</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c) => {
                const count = products.filter(
                  p => p.category?.toLowerCase() === c.name.toLowerCase() || p.categories?.includes(c.name)
                ).length

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: '#141824',
                            border: '1px solid #2b3142',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#d4af37'
                          }}
                        >
                          <Layers size={16} />
                        </div>
                        <strong style={{ color: '#fff', fontSize: 14 }}>{c.name}</strong>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: '#94a3b8', background: '#12151e', padding: '2px 6px', borderRadius: 4 }}>
                        {c.slug}
                      </code>
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: 13, maxWidth: 280 }}>
                      {c.description || '—'}
                    </td>
                    <td>
                      <span
                        style={{
                          background: count > 0 ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: count > 0 ? '#d4af37' : '#64748b',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          padding: '3px 10px',
                          borderRadius: 9999,
                          fontWeight: 700,
                          fontSize: 12
                        }}
                      >
                        {count} hijabs
                      </span>
                    </td>
                    <td style={{ color: '#fff', fontWeight: 600 }}>
                      #{c.sort_order || 0}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`admin-badge ${c.is_active ? 'status-active' : 'status-inactive'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Toggle active"
                      >
                        {c.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => openEditModal(c)}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteConfirm({ ...c, count })}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
                {editingCategory ? 'Edit Category' : 'Create Hijab Category'}
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
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    className="admin-input admin-input-noicon"
                    placeholder="e.g. Medina Silk Hijabs"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Slug (URL key) *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="medina-silk-hijabs"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Sort Order Index</label>
                    <input
                      type="number"
                      min="1"
                      className="admin-input admin-input-noicon"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Category Description</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    placeholder="Short description shown in category browsing and meta details..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#d4af37' }}
                  />
                  <label htmlFor="cat_active" style={{ color: '#fff', fontSize: 13.5, cursor: 'pointer' }}>
                    Active & Visible in Store Navigation
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
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Category</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#f87171', fontSize: 14, marginBottom: 10 }}>
                Are you sure you want to delete category <strong>{deleteConfirm.name}</strong>?
              </p>
              {deleteConfirm.count > 0 && (
                <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, color: '#fbbf24', fontSize: 12.5 }}>
                  ⚠️ There are <b>{deleteConfirm.count} products</b> assigned to this category. They will remain in the database with their category cleared.
                </div>
              )}
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
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
