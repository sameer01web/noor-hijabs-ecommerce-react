import React, { useState, useEffect, useMemo } from 'react'
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  Minus,
  Plus,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Layers,
  Save
} from 'lucide-react'
import { getProducts, updateProductStock, updateProduct } from '../../lib/dataService'
import { formatINR } from '../../lib/data'
import '../admin.css'

export default function AdminInventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('All') // 'All' | 'low' | 'out' | 'healthy'
  const [editingStockMap, setEditingStockMap] = useState({})
  const [savingMap, setSavingMap] = useState({})

  useEffect(() => {
    loadInventory()
  }, [])

  async function loadInventory() {
    setLoading(true)
    try {
      const p = await getProducts()
      setProducts(p)
      const map = {}
      p.forEach(prod => { map[prod.id] = prod.stock })
      setEditingStockMap(map)
    } catch (e) {
      console.error('Failed to load inventory:', e)
    } finally {
      setLoading(false)
    }
  }

  // Stock adjustments
  const handleStockChange = (id, delta) => {
    setEditingStockMap(prev => {
      const current = prev[id] !== undefined ? prev[id] : 0
      const updated = Math.max(0, current + delta)
      return { ...prev, [id]: updated }
    })
  }

  const handleStockInput = (id, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0)
    setEditingStockMap(prev => ({ ...prev, [id]: num }))
  }

  const handleSaveSingle = async (product) => {
    const newStock = editingStockMap[product.id]
    if (newStock === undefined || newStock === product.stock) return

    setSavingMap(prev => ({ ...prev, [product.id]: true }))
    try {
      await updateProductStock(product.id, newStock)
      setProducts(products.map(p => (p.id === product.id ? { ...p, stock: newStock } : p)))
    } catch (e) {
      alert('Failed to update stock: ' + e.message)
    } finally {
      setSavingMap(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const handleQuickAdd = async (product, amount) => {
    const newStock = product.stock + amount
    setSavingMap(prev => ({ ...prev, [product.id]: true }))
    try {
      await updateProductStock(product.id, newStock)
      setProducts(products.map(p => (p.id === product.id ? { ...p, stock: newStock } : p)))
      setEditingStockMap(prev => ({ ...prev, [product.id]: newStock }))
    } catch (e) {
      alert('Failed to add stock: ' + e.message)
    } finally {
      setSavingMap(prev => ({ ...prev, [product.id]: false }))
    }
  }

  // Stats
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const totalValuation = products.reduce((sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0), 0)
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5))
  const outOfStockProducts = products.filter(p => p.stock === 0)

  // Filtered
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = search.trim().toLowerCase()
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q)

      let matchesStatus = true
      if (stockStatusFilter === 'out') matchesStatus = p.stock === 0
      else if (stockStatusFilter === 'low') matchesStatus = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
      else if (stockStatusFilter === 'healthy') matchesStatus = p.stock > (p.low_stock_threshold || 5)

      return matchesSearch && matchesStatus
    })
  }, [products, search, stockStatusFilter])

  return (
    <div className="admin-inventory-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Stock & Inventory Control</h1>
          <p>Real-time warehouse units, reorder triggers, and inline stock replenishment</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={loadInventory}
          >
            <RefreshCw size={14} />
            <span>Refresh Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Total Warehouse Units</span>
            <div className="admin-stat-icon gold">
              <Boxes size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{totalUnits.toLocaleString()}</div>
          <div className="admin-stat-subtext">
            <span>Across {products.length} hijab items</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Inventory Valuation</span>
            <div className="admin-stat-icon green">
              <Package size={18} />
            </div>
          </div>
          <div className="admin-stat-value">{formatINR(totalValuation)}</div>
          <div className="admin-stat-subtext">
            <span>At current retail pricing</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Low Stock Alerts</span>
            <div className="admin-stat-icon red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-stat-value" style={{ color: lowStockProducts.length > 0 ? '#f59e0b' : '#fff' }}>
            {lowStockProducts.length}
          </div>
          <div className="admin-stat-subtext">
            <span>Units &le; low stock threshold</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <span className="admin-stat-label">Out of Stock</span>
            <div className="admin-stat-icon red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-stat-value" style={{ color: outOfStockProducts.length > 0 ? '#ef4444' : '#fff' }}>
            {outOfStockProducts.length}
          </div>
          <div className="admin-stat-subtext">
            <span>Items needing immediate batch</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-filter-bar">
        <div className="admin-search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by SKU, product name, fabric, or color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <select
            className="admin-select"
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value)}
          >
            <option value="All">All Stock Levels</option>
            <option value="low">Low Stock (1–5)</option>
            <option value="out">Out of Stock (0)</option>
            <option value="healthy">Healthy Stock (&gt; 5)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-loading-screen" style={{ minHeight: 300 }}>
          <div className="admin-spinner" />
          <p>Checking warehouse stock...</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hijab Product</th>
                <th>SKU</th>
                <th>Fabric & Color</th>
                <th>Unit Price</th>
                <th>Threshold</th>
                <th>Current Stock</th>
                <th>Quick Adjust</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const currentVal = editingStockMap[p.id] !== undefined ? editingStockMap[p.id] : p.stock
                const isChanged = currentVal !== p.stock
                const isLow = p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)
                const isOut = p.stock === 0
                const isSaving = savingMap[p.id]

                return (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={p.image} alt={p.name} className="admin-product-thumb" />
                        <div className="admin-product-info">
                          <strong>{p.name}</strong>
                          <span>{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: 12, color: '#d4af37', background: '#12151e', padding: '2px 6px', borderRadius: 4 }}>
                        {p.sku || 'NH-GEN'}
                      </code>
                    </td>
                    <td>
                      <div style={{ color: '#fff' }}>{p.color}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.fabric}</div>
                    </td>
                    <td style={{ color: '#fff', fontWeight: 600 }}>
                      {formatINR(p.price)}
                    </td>
                    <td style={{ color: '#94a3b8' }}>
                      &le; {p.low_stock_threshold || 5} units
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          className={`admin-badge ${
                            isOut ? 'status-outofstock' : isLow ? 'status-lowstock' : 'status-instock'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="admin-stock-adjuster">
                          <button
                            type="button"
                            className="admin-stock-btn"
                            onClick={() => handleStockChange(p.id, -1)}
                            title="Decrease by 1"
                          >
                            <Minus size={12} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            className="admin-stock-val"
                            value={currentVal}
                            onChange={(e) => handleStockInput(p.id, e.target.value)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isChanged ? '#d4af37' : '#fff',
                              width: 44,
                              textAlign: 'center',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            className="admin-stock-btn"
                            onClick={() => handleStockChange(p.id, 1)}
                            title="Increase by 1"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => handleQuickAdd(p, 10)}
                            title="Add +10 batch"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            onClick={() => handleQuickAdd(p, 25)}
                            title="Add +25 batch"
                            style={{ padding: '4px 8px', fontSize: 11 }}
                          >
                            +25
                          </button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`admin-btn admin-btn-sm ${isChanged ? 'admin-btn-gold' : 'admin-btn-secondary'}`}
                        disabled={!isChanged || isSaving}
                        onClick={() => handleSaveSingle(p)}
                        style={{ opacity: isChanged ? 1 : 0.4 }}
                      >
                        <Save size={13} />
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
