import React, { useState, useEffect, useMemo } from 'react'
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  AlertCircle,
  Eye,
  Layers,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react'
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage
} from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

const FABRIC_OPTIONS = [
  '100% Premium Korean Chiffon',
  'Heavyweight Matte Georgette',
  'Pure Mulberry Silk-Crepe Blend',
  '100% Pure Mulberry Silk Satin',
  '100% Organic Turkish Cotton Voile',
  'Premium Bubble Chiffon',
  'High-Density Georgette Crepe',
  'Medina Silk-Crepe Blend',
  'Textured Korean Georgette',
  'Soft Textured Chiffon'
]

const PATTERN_OPTIONS = [
  'Botanical Flora & Leaf Motif',
  'Hand-Embroidered Scallop Border',
  'Minimalist Matte Weave',
  'Persian Paisley Art',
  'Natural Crinkle Texture',
  'Smooth Solid Drape',
  'Deep Jet Solid',
  'Hand-Stitched Pearl Hem',
  'Arabesque & Floral Geometry',
  'Glossy Luster Solid',
  'French Guipure Lace Trim'
]

const SIZE_OPTIONS = [
  '185 cm × 75 cm (Maxi Coverage)',
  '180 cm × 75 cm (Standard Maxi)',
  '190 cm × 80 cm (Full Maxi)',
  '185 cm × 80 cm (Maxi Coverage)',
  '190 cm × 75 cm (Extra Maxi)'
]

const BADGE_OPTIONS = [
  '',
  'Best Seller',
  'New Arrival',
  'Premium Luxe',
  'Essential',
  'Trending'
]

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [fabricFilter, setFabricFilter] = useState('All')
  const [stockFilter, setStockFilter] = useState('All') // 'All' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [sortBy, setSortBy] = useState('newest')

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Form state
  const initialForm = {
    name: '',
    slug: '',
    sku: '',
    category: 'Chiffon Hijabs',
    category_id: '',
    fabric: '100% Premium Korean Chiffon',
    color: '',
    pattern: 'Minimalist Matte Weave',
    size: '185 cm × 75 cm (Maxi Coverage)',
    price: 499,
    compare_at_price: 699,
    stock: 25,
    low_stock_threshold: 5,
    opacity: 'Opaque (100% full coverage)',
    badge: '',
    is_active: true,
    description: '',
    image: ''
  }
  const [formData, setFormData] = useState(initialForm)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()])
      setProducts(p)
      setCategories(c)
    } catch (e) {
      console.error('Error loading products/categories:', e)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    const defaultCat = categories[0]?.name || 'Chiffon Hijabs'
    const defaultCatId = categories[0]?.id || ''
    setFormData({
      ...initialForm,
      category: defaultCat,
      category_id: defaultCatId,
      sku: `NH-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    })
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      sku: p.sku || '',
      category: p.category || categories[0]?.name || 'Chiffon Hijabs',
      category_id: p.category_id || '',
      fabric: p.fabric || '100% Premium Korean Chiffon',
      color: p.color || '',
      pattern: p.design || p.pattern || 'Plain Solid Weave',
      size: p.size || '185 cm × 75 cm (Maxi Coverage)',
      price: p.price || 0,
      compare_at_price: p.compare_at_price || p.compareAt || '',
      stock: p.stock || 0,
      low_stock_threshold: p.low_stock_threshold || 5,
      opacity: p.opacity || 'Opaque (100% full coverage)',
      badge: p.badge || '',
      is_active: p.is_active !== undefined ? p.is_active : true,
      description: p.description || '',
      image: p.image || ''
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleNameChange = (val) => {
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: editingProduct ? prev.slug : autoSlug
    }))
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const url = await uploadProductImage(file)
      setFormData(prev => ({ ...prev, image: url }))
    } catch (err) {
      alert('Failed to upload image: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!formData.name.trim()) {
      setFormError('Product name is required.')
      return
    }
    if (!formData.image) {
      setFormError('Please provide a product image.')
      return
    }

    setSaving(true)
    try {
      const matchedCat = categories.find(c => c.name.toLowerCase() === formData.category.toLowerCase())
      const payload = {
        ...formData,
        category_id: matchedCat?.id || formData.category_id,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : null,
        stock: Number(formData.stock),
        low_stock_threshold: Number(formData.low_stock_threshold),
        is_featured: Boolean(formData.badge),
        design: formData.pattern
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await addProduct(payload)
      }

      await loadData()
      setModalOpen(false)
    } catch (err) {
      setFormError(err.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      setProducts(products.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } catch (e) {
      alert('Failed to delete product: ' + e.message)
    }
  }

  const handleToggleActive = async (product) => {
    const updatedStatus = !product.is_active
    await updateProduct(product.id, { is_active: updatedStatus })
    setProducts(products.map(p => (p.id === product.id ? { ...p, is_active: updatedStatus } : p)))
  }

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Search
      const q = search.trim().toLowerCase()
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        (p.design && p.design.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))

      // Category
      const matchesCat = categoryFilter === 'All' ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
        p.categories?.some(c => c.toLowerCase() === categoryFilter.toLowerCase())

      // Fabric
      const matchesFabric = fabricFilter === 'All' ||
        p.fabric?.toLowerCase().includes(fabricFilter.toLowerCase())

      // Stock
      let matchesStock = true
      if (stockFilter === 'out_of_stock') matchesStock = p.stock === 0
      else if (stockFilter === 'low_stock') matchesStock = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
      else if (stockFilter === 'in_stock') matchesStock = p.stock > (p.low_stock_threshold || 5)

      return matchesSearch && matchesCat && matchesFabric && matchesStock
    })

    // Sort
    if (sortBy === 'price_asc') result.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price)
    else if (sortBy === 'stock_asc') result.sort((a, b) => a.stock - b.stock)
    else if (sortBy === 'stock_desc') result.sort((a, b) => b.stock - a.stock)
    else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))

    return result
  }, [products, search, categoryFilter, fabricFilter, stockFilter, sortBy])

  return (
    <div className="admin-products-page">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Hijab Products ({products.length})</h1>
          <p>Manage, add, edit, and curate 100% pure modest hijab headwear</p>
        </div>
        <div className="admin-page-actions">
          <div className="admin-view-toggles" style={{ display: 'flex', background: '#181c27', border: '1px solid #2b3142', borderRadius: 8, padding: 3 }}>
            <button
              type="button"
              className={`admin-btn-sm ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#d4af37' : 'transparent',
                color: viewMode === 'table' ? '#0f1115' : '#94a3b8',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              className={`admin-btn-sm ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#d4af37' : 'transparent',
                color: viewMode === 'grid' ? '#0f1115' : '#94a3b8',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-gold"
            onClick={openAddModal}
          >
            <Plus size={16} />
            <span>Add New Hijab</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, SKU, color, fabric, pattern..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              onClick={() => setSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="admin-filter-group">
          {/* Category Filter */}
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Fabric Filter */}
          <select
            className="admin-select"
            value={fabricFilter}
            onChange={(e) => setFabricFilter(e.target.value)}
          >
            <option value="All">All Fabrics</option>
            <option value="Chiffon">Chiffon</option>
            <option value="Georgette">Georgette</option>
            <option value="Silk">Mulberry Silk</option>
            <option value="Cotton">Turkish Cotton</option>
            <option value="Embroidered">Embroidered</option>
          </select>

          {/* Stock Filter */}
          <select
            className="admin-select"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
          >
            <option value="All">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (1–5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {/* Sort By */}
          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Main Products List / Grid */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 300 }}>
          <div className="admin-spinner" />
          <p>Loading Hijabs...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="admin-card" style={{ padding: 48, textAlign: 'center' }}>
          <Package size={48} style={{ color: '#64748b', margin: '0 auto 16px auto' }} />
          <h3 style={{ color: '#fff', marginBottom: 8 }}>No hijabs match your filter criteria</h3>
          <p style={{ color: '#94a3b8', marginBottom: 20 }}>
            Try resetting your search query or fabric filters.
          </p>
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={() => {
              setSearch('')
              setCategoryFilter('All')
              setFabricFilter('All')
              setStockFilter('All')
            }}
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category & Fabric</th>
                <th>Pattern & Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
                const isOut = p.stock === 0
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={p.image} alt={p.name} className="admin-product-thumb" />
                        <div className="admin-product-info">
                          <strong>{p.name}</strong>
                          <span>SKU: {p.sku || 'NH-GEN'} · Color: {p.color}</span>
                          {p.badge && (
                            <div style={{ marginTop: 3 }}>
                              <span className="admin-badge badge-featured">✨ {p.badge}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{p.category}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.fabric}</div>
                    </td>
                    <td>
                      <div>{p.design || p.pattern || 'Plain Solid'}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{p.size || '185cm Maxi'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#d4af37', fontSize: 14 }}>
                        {formatINR(p.price)}
                      </div>
                      {(p.compare_at_price || p.compareAt) && (
                        <del style={{ fontSize: 11, color: '#64748b' }}>
                          {formatINR(p.compare_at_price || p.compareAt)}
                        </del>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          isOut ? 'status-outofstock' : isLow ? 'status-lowstock' : 'status-instock'
                        }`}
                      >
                        {isOut ? 'Out of Stock (0)' : isLow ? `Low (${p.stock})` : `${p.stock} units`}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`admin-badge ${p.is_active ? 'status-active' : 'status-inactive'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle active state"
                      >
                        {p.is_active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => openEditModal(p)}
                          title="Edit product"
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => setDeleteConfirm(p)}
                          title="Delete product"
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
      ) : (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredProducts.map((p) => (
            <div key={p.id} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#12151e' }}>
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`admin-badge ${p.is_active ? 'status-active' : 'status-inactive'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {p.badge && <span className="admin-badge badge-featured">✨ {p.badge}</span>}
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                  <span
                    className={`admin-badge ${
                      p.stock === 0 ? 'status-outofstock' : p.stock <= 5 ? 'status-lowstock' : 'status-instock'
                    }`}
                  >
                    Stock: {p.stock}
                  </span>
                </div>
              </div>

              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, color: '#d4af37', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, marginBottom: 4 }}>
                  {p.category}
                </div>
                <h3 style={{ fontSize: 15, color: '#fff', marginBottom: 6, lineHeight: 1.2 }}>{p.name}</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                  {p.fabric} · {p.color}
                </p>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #2b3142' }}>
                  <div>
                    <strong style={{ color: '#d4af37', fontSize: 16 }}>{formatINR(p.price)}</strong>
                    {(p.compare_at_price || p.compareAt) && (
                      <del style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>
                        {formatINR(p.compare_at_price || p.compareAt)}
                      </del>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => openEditModal(p)}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger admin-btn-sm"
                      onClick={() => setDeleteConfirm(p)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="admin-modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {editingProduct ? 'Edit Hijab Product' : 'Add New Hijab Product'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="admin-modal-body">
                {formError && (
                  <div className="admin-login-alert error" style={{ marginBottom: 18 }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Image Upload */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>
                    Product Photography * (Supabase Storage bucket: product-images)
                  </label>

                  {formData.image ? (
                    <div className="admin-upload-preview">
                      <img src={formData.image} alt="Preview" />
                      <button
                        type="button"
                        className="admin-upload-remove"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="admin-upload-box" onClick={() => document.getElementById('admin-img-upload').click()}>
                      <Upload size={28} style={{ color: '#d4af37' }} />
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
                        {uploadingImage ? 'Uploading to Supabase Storage...' : 'Click to Upload High-Res Hijab Photo'}
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b' }}>
                        PNG, JPG or WebP · Drag & drop or browse device
                      </span>
                      <input
                        id="admin-img-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageFileChange}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 10 }}>
                    <input
                      type="url"
                      className="admin-input admin-input-noicon"
                      placeholder="Or paste external image URL directly..."
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      style={{ fontSize: 12.5 }}
                    />
                  </div>
                </div>

                {/* Section 2: Core Details */}
                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Hijab Product Name *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. Royal Heritage Embroidered Silk Hijab"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Category *</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%', padding: '12px 14px' }}
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-grid-3">
                  <div className="admin-form-group">
                    <label>SKU (Stock Keeping Unit) *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. NH-SLK-01"
                      value={formData.sku}
                      onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Color Shade *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. Sage Olive / Champagne Ivory"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Collection Badge</label>
                    <select
                      className="admin-select"
                      style={{ width: '100%', padding: '12px 14px' }}
                      value={formData.badge}
                      onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    >
                      {BADGE_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b ? b : 'None (Standard)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Fabric / Material Specification *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. 100% Premium Korean Chiffon"
                      list="fabric-list"
                      value={formData.fabric}
                      onChange={(e) => setFormData(prev => ({ ...prev, fabric: e.target.value }))}
                    />
                    <datalist id="fabric-list">
                      {FABRIC_OPTIONS.map(f => <option key={f} value={f} />)}
                    </datalist>
                  </div>

                  <div className="admin-form-group">
                    <label>Pattern / Design Detail *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. Botanical Flora & Leaf Motif"
                      list="pattern-list"
                      value={formData.pattern}
                      onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
                    />
                    <datalist id="pattern-list">
                      {PATTERN_OPTIONS.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>

                <div className="admin-form-grid-2">
                  <div className="admin-form-group">
                    <label>Dimensions / Coverage Length *</label>
                    <input
                      type="text"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. 185 cm × 75 cm (Maxi Coverage)"
                      list="size-list"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    />
                    <datalist id="size-list">
                      {SIZE_OPTIONS.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>

                  <div className="admin-form-group">
                    <label>Opacity & Styling Transparency</label>
                    <input
                      type="text"
                      className="admin-input admin-input-noicon"
                      placeholder="e.g. Opaque (100% full coverage)"
                      value={formData.opacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, opacity: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Section 3: Pricing & Inventory */}
                <div className="admin-form-grid-3">
                  <div className="admin-form-group">
                    <label>Selling Price (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="499"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Compare at / Strike Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input admin-input-noicon"
                      placeholder="799"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, compare_at_price: e.target.value }))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Stock Quantity in Warehouse *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      className="admin-input admin-input-noicon"
                      placeholder="30"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Product Description & Modesty Styling Notes</label>
                  <textarea
                    rows={3}
                    className="admin-textarea"
                    placeholder="Describe drape feel, breathability, styling advice, and hem detailing..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: '#d4af37' }}
                  />
                  <label htmlFor="is_active_check" style={{ color: '#fff', fontSize: 13.5, cursor: 'pointer' }}>
                    Publish Hijab in Live Customer Catalog (Active)
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
                  {saving ? 'Saving Hijab...' : editingProduct ? 'Update Hijab' : 'Create Hijab Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Product Deletion</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#f87171', fontSize: 14, marginBottom: 12 }}>
                Are you sure you want to permanently delete <strong>{deleteConfirm.name}</strong>?
              </p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                This will remove the hijab from Supabase and the active customer storefront.
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
                Delete Hijab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
