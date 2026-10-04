import { SlidersHorizontal, Sparkles, X, Filter, Check, RotateCcw, ChevronDown } from 'lucide-react'
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { products as initialProducts, categories as initialCategories, formatINR } from '../lib/data'
import { getProducts, getCategories } from '../lib/dataService'
import ProductCard from '../components/ProductCard'

// Sort options for luxury e-commerce
const sortOptions = [
  { value: 'featured', label: 'Featured / Curated', shortLabel: 'Featured' },
  { value: 'newest', label: 'Newest Drops', shortLabel: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High', shortLabel: 'Price: Low-High' },
  { value: 'price-high', label: 'Price: High to Low', shortLabel: 'Price: High-Low' },
  { value: 'rating', label: 'Top Rated & Verified', shortLabel: 'Top Rated' }
]

// Robust category matcher for all variations (e.g. "Silk", "Silk Hijabs", "Mulberry Silk", "Plain", "Printed", etc.)
function matchesCategoryFilter(product, selectedCat) {
  if (!product) return false
  if (!selectedCat || selectedCat === 'All') return true

  const target = String(selectedCat).toLowerCase().trim()
  const prodCat = String(product.category || '').toLowerCase().trim()
  const prodName = String(product.name || '').toLowerCase().trim()
  const prodFabric = String(product.fabric || '').toLowerCase().trim()
  const prodBadge = String(product.badge || '').toLowerCase().trim()
  const prodCategories = Array.isArray(product.categories)
    ? product.categories.map(c => (typeof c === 'string' ? c.toLowerCase().trim() : (c?.name ? String(c.name).toLowerCase().trim() : ''))).filter(Boolean)
    : []

  if (target === 'new arrivals' || target === 'new' || target === 'new-arrivals') {
    return prodCategories.includes('new arrivals') || prodBadge.includes('new') || prodCat.includes('new')
  }

  if (target === 'best sellers' || target === 'bestsellers' || target === 'best-sellers') {
    return prodCategories.includes('best sellers') || prodBadge.includes('best') || prodCat.includes('best')
  }

  // Extract core word: "silk hijabs" -> "silk", "plain hijabs" -> "plain", "printed hijabs" -> "printed"
  const cleanTarget = target.replace(/ hijabs?$/, '').replace(/-hijabs?$/, '').replace(/ & satin$/, '').trim()

  if (prodCat === target || prodCat === cleanTarget || prodCat.includes(cleanTarget)) {
    return true
  }

  if (prodCategories.includes(target) || prodCategories.includes(cleanTarget) || prodCategories.some(c => c.includes(cleanTarget))) {
    return true
  }

  if (prodFabric.includes(cleanTarget) || prodName.includes(cleanTarget)) {
    return true
  }

  return false
}

export default function Shop({ search: globalSearch = '', wishlist = [], onWishlist, onAdd }) {
  const [productList, setProductList] = useState(initialProducts)
  const [categoryList, setCategoryList] = useState(initialCategories)
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('category') || 'All'

  const [category, setCategory] = useState(initialCat)
  const [sort, setSort] = useState('featured')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(1500)
  const [selectedFabric, setSelectedFabric] = useState('All')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const sortRef = useRef(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Prevent background scrolling when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileFilterOpen])

  useEffect(() => {
    let isMounted = true
    async function loadCatalog() {
      try {
        const [p, c] = await Promise.all([getProducts(), getCategories()])
        if (isMounted) {
          if (Array.isArray(p) && p.length > 0) {
            setProductList(p.filter(prod => prod && prod.is_active !== false))
          }
          if (Array.isArray(c) && c.length > 0) {
            setCategoryList(c.filter(cat => cat && cat.is_active !== false))
          }
        }
      } catch (e) {
        console.warn('Shop catalog fetch error:', e)
      }
    }
    loadCatalog()
    return () => { isMounted = false }
  }, [])

  // Sync state if URL query param changes
  useEffect(() => {
    const urlCat = searchParams.get('category')
    if (urlCat) {
      setCategory(urlCat)
    } else {
      setCategory('All')
    }
  }, [searchParams])

  const fabrics = ['All', 'Chiffon', 'Georgette', 'Cotton', 'Silk', 'Embroidered']

  const activeFilterCount = (category !== 'All' ? 1 : 0) +
    (selectedFabric !== 'All' ? 1 : 0) +
    (maxPrice < 1500 ? 1 : 0)

  const filtered = useMemo(() => {
    const safeList = Array.isArray(productList) ? productList : []
    let result = safeList.filter(p => {
      if (!p) return false

      // Category match
      const matchesCat = matchesCategoryFilter(p, category)

      // Fabric filter
      const fabricStr = String(selectedFabric || 'All').toLowerCase().trim()
      const matchesFabric = fabricStr === 'all' ||
        (typeof p.fabric === 'string' && p.fabric.toLowerCase().includes(fabricStr)) ||
        (typeof p.category === 'string' && p.category.toLowerCase().includes(fabricStr))

      // Price filter
      const matchesPrice = Number(p.price || 0) <= maxPrice

      // Search match
      const query = String(globalSearch || '').trim().toLowerCase()
      const matchesSearch = !query ||
        (typeof p.name === 'string' && p.name.toLowerCase().includes(query)) ||
        (typeof p.color === 'string' && p.color.toLowerCase().includes(query)) ||
        (typeof p.fabric === 'string' && p.fabric.toLowerCase().includes(query)) ||
        (typeof p.design === 'string' && p.design.toLowerCase().includes(query)) ||
        (typeof p.category === 'string' && p.category.toLowerCase().includes(query))

      return Boolean(matchesCat && matchesFabric && matchesPrice && matchesSearch)
    })

    if (sort === 'price-low') result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    if (sort === 'price-high') result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    if (sort === 'rating') result.sort((a, b) => (Number(b.rating) || 5) - (Number(a.rating) || 5))
    if (sort === 'newest') {
      result.sort((a, b) => {
        const aNew = (typeof a.badge === 'string' && a.badge.toLowerCase().includes('new')) ? 1 : 0
        const bNew = (typeof b.badge === 'string' && b.badge.toLowerCase().includes('new')) ? 1 : 0
        return bNew - aNew
      })
    }

    return result
  }, [productList, category, selectedFabric, maxPrice, sort, globalSearch])

  const handleCategorySelect = (catName) => {
    const targetCat = catName || 'All'
    setCategory(targetCat)
    const nextParams = new URLSearchParams(searchParams)
    if (targetCat === 'All') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', targetCat)
    }
    setSearchParams(nextParams)
  }

  const handleClearFilters = () => {
    setCategory('All')
    setSelectedFabric('All')
    setMaxPrice(1500)
    setSort('featured')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('category')
    setSearchParams(nextParams)
  }

  // Safe category check helper for button highlighting
  const isCategoryActive = (catName) => {
    if (!catName) return false
    if (catName === 'All') return category === 'All'
    const cleanCurrent = String(category || '').toLowerCase().trim()
    const cleanTarget = String(catName).toLowerCase().trim()
    if (cleanCurrent === cleanTarget) return true
    const keyword = cleanTarget.replace(/ hijabs?$/, '').replace(/-hijabs?$/, '').replace(/ & satin$/, '').trim()
    return cleanCurrent.includes(keyword) || cleanTarget.includes(cleanCurrent.replace(/ hijabs?$/, '').trim())
  }

  return (
    <main className="wrap shop-page">
      <div className="shop-title">
        <div className="eyebrow">
          <Sparkles size={13} />
          <span>HAUTE MODESTIE ARCHIVE</span>
        </div>
        <h1>The Hijab Collection</h1>
        <p>Explore luxury chiffon, pure silk, textured georgette, breathable cotton and artisan printed hijabs tailored for every occasion.</p>
      </div>

      {/* Category Scroll Tabs */}
      <div className="category-scroll-wrapper">
        <div className="category-scroll" role="tablist">
          <button
            type="button"
            className={category === 'All' ? 'selected' : ''}
            onClick={() => handleCategorySelect('All')}
          >
            All Hijabs ({productList.length})
          </button>
          {categoryList.map(c => {
            const catName = typeof c === 'string' ? c : (c?.name || 'Hijabs')
            const catKey = c?.id || c?.slug || catName
            const count = productList.filter(p => matchesCategoryFilter(p, catName)).length

            return (
              <button
                type="button"
                className={isCategoryActive(catName) ? 'selected' : ''}
                key={catKey}
                onClick={() => handleCategorySelect(catName)}
              >
                {catName} {count > 0 && <span className="cat-pill-count">{count}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toolbar for Mobile & Desktop */}
      <div className="shop-toolbar">
        <button
          type="button"
          className="mobile-filter-trigger mobile-only"
          onClick={() => setMobileFilterOpen(true)}
          aria-label="Open filter menu"
        >
          <Filter size={15} />
          <span>Filter Hijabs</span>
          {activeFilterCount > 0 && <b className="filter-count-badge">{activeFilterCount}</b>}
        </button>

        <div className="result-count desktop-only">
          Showing <strong>{filtered.length}</strong> premium hijabs
          {category !== 'All' && <span> in <em>{category}</em></span>}
          {globalSearch && <span> matching "<em>{globalSearch}</em>"</span>}
        </div>

        {/* Custom Luxury Sort Dropdown */}
        <div className="custom-sort-wrapper" ref={sortRef}>
          <button
            type="button"
            className={`custom-sort-trigger ${sortDropdownOpen ? 'open' : ''}`}
            onClick={() => setSortDropdownOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={sortDropdownOpen}
            aria-label={`Sort products: currently ${sortOptions.find(o => o.value === sort)?.label || 'Featured'}`}
          >
            <div className="sort-trigger-left">
              <SlidersHorizontal size={13} className="sort-icon" />
              <span className="sort-current-label">
                {sortOptions.find(o => o.value === sort)?.shortLabel || 'Featured'}
              </span>
            </div>
            <ChevronDown size={13} className={`sort-chevron ${sortDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {sortDropdownOpen && (
            <div className="custom-sort-menu" role="listbox">
              <div className="sort-menu-header">
                <span>SORT BY</span>
              </div>
              <div className="sort-menu-options">
                {sortOptions.map(opt => {
                  const isSelected = sort === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`sort-menu-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSort(opt.value)
                        setSortDropdownOpen(false)
                      }}
                    >
                      <span className="sort-item-indicator">
                        {isSelected ? (
                          <Check size={12} strokeWidth={2.8} />
                        ) : (
                          <span className="sort-item-dot" />
                        )}
                      </span>
                      <span className="sort-item-text">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="mobile-active-filter-chips mobile-only">
          {category !== 'All' && (
            <span className="active-chip">
              {category} <X size={12} onClick={() => handleCategorySelect('All')} />
            </span>
          )}
          {selectedFabric !== 'All' && (
            <span className="active-chip">
              {selectedFabric} <X size={12} onClick={() => setSelectedFabric('All')} />
            </span>
          )}
          {maxPrice < 1500 && (
            <span className="active-chip">
              &le; {formatINR(maxPrice)} <X size={12} onClick={() => setMaxPrice(1500)} />
            </span>
          )}
          <button type="button" className="text-clear-btn" onClick={handleClearFilters}>
            Clear All
          </button>
        </div>
      )}

      <div className="shop-layout">
        {/* Desktop Sidebar Filters */}
        <aside className="filters desktop-only">
          <div className="filter-card">
            <div className="filter-group">
              <b>Filter by Fabric</b>
              <div className="fabric-chips">
                {fabrics.map(f => (
                  <button
                    type="button"
                    key={f}
                    className={`chip ${selectedFabric === f ? 'active' : ''}`}
                    onClick={() => setSelectedFabric(f)}
                  >
                    {f === 'All' ? 'All Fabrics' : f}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <b>Price Range</b>
              <label>
                <span>Maximum Price:</span>
                <strong>{formatINR(maxPrice)}</strong>
              </label>
              <input
                type="range"
                min="349"
                max="1500"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(+e.target.value)}
                aria-label="Max price range slider"
              />
              <div className="price-labels">
                <small>₹349</small>
                <small>₹1,500</small>
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button type="button" className="clear-btn" onClick={handleClearFilters}>
                <RotateCcw size={13} /> Reset all filters
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Slide-Up Filter Modal */}
        {mobileFilterOpen && (
          <div className="mobile-filter-modal">
            <div className="mobile-filter-backdrop" onClick={() => setMobileFilterOpen(false)} />
            <div className="mobile-filter-sheet">
              {/* Native Bottom Sheet Drag Handle */}
              <div className="sheet-handle" />

              <div className="mobile-filter-header">
                <div className="filter-header-left">
                  <h3>Filter & Refine</h3>
                  <div className="filter-header-meta">
                    <span className="filter-count-text">
                      Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'hijab' : 'hijabs'}
                    </span>
                    {activeFilterCount > 0 && (
                      <span className="active-filter-badge">
                        {activeFilterCount} active
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="filter-sheet-close"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mobile-filter-body">
                {/* 1. Hijab Collections */}
                <div className="filter-section">
                  <div className="filter-section-header">
                    <div className="section-title-wrap">
                      <span className="section-gold-dot" />
                      <b>Hijab Collections</b>
                    </div>
                    {category !== 'All' && (
                      <button type="button" className="group-reset-btn" onClick={() => handleCategorySelect('All')}>
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="luxury-filter-grid">
                    <button
                      type="button"
                      className={`luxury-pill-btn ${category === 'All' ? 'active' : ''}`}
                      onClick={() => handleCategorySelect('All')}
                    >
                      <span className="pill-check-indicator">
                        {category === 'All' ? <Check size={12} strokeWidth={2.6} /> : <span className="pill-dot" />}
                      </span>
                      <span className="pill-name">All Collections</span>
                      <span className="pill-count-chip">{productList.length}</span>
                    </button>
                    {categoryList.map(c => {
                      const catName = typeof c === 'string' ? c : (c?.name || 'Hijabs')
                      const catKey = c?.id || c?.slug || catName
                      const isActive = isCategoryActive(catName)
                      const count = productList.filter(p => matchesCategoryFilter(p, catName)).length

                      // Clean, elegant boutique label without redundant "Hijabs" suffix
                      let cleanName = catName.replace(/\s+Hijabs?$/i, '').trim()
                      if (cleanName.toLowerCase() === 'plain') cleanName = 'Plain Solids'
                      if (cleanName.toLowerCase() === 'silk') cleanName = 'Mulberry Silk'
                      if (cleanName.toLowerCase() === 'premium') cleanName = 'Premium Luxe'
                      if (!cleanName) cleanName = catName

                      return (
                        <button
                          type="button"
                          key={catKey}
                          className={`luxury-pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => handleCategorySelect(catName)}
                        >
                          <span className="pill-check-indicator">
                            {isActive ? <Check size={12} strokeWidth={2.6} /> : <span className="pill-dot" />}
                          </span>
                          <span className="pill-name">{cleanName}</span>
                          {count > 0 && <span className="pill-count-chip">{count}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Fabric Type */}
                <div className="filter-section">
                  <div className="filter-section-header">
                    <div className="section-title-wrap">
                      <span className="section-gold-dot" />
                      <b>Fabric & Texture</b>
                    </div>
                    {selectedFabric !== 'All' && (
                      <button type="button" className="group-reset-btn" onClick={() => setSelectedFabric('All')}>
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="luxury-filter-grid">
                    {fabrics.map(f => {
                      const isActive = selectedFabric === f
                      const fCount = f === 'All'
                        ? productList.length
                        : productList.filter(p => {
                            const str = f.toLowerCase()
                            return (p.fabric && p.fabric.toLowerCase().includes(str)) ||
                                   (p.category && p.category.toLowerCase().includes(str))
                          }).length

                      return (
                        <button
                          type="button"
                          key={f}
                          className={`luxury-pill-btn ${isActive ? 'active' : ''}`}
                          onClick={() => setSelectedFabric(f)}
                        >
                          <span className="pill-check-indicator">
                            {isActive ? <Check size={12} strokeWidth={2.6} /> : <span className="pill-dot" />}
                          </span>
                          <span className="pill-name">{f === 'All' ? 'All Fabrics' : f}</span>
                          {fCount > 0 && <span className="pill-count-chip">{fCount}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Price Range */}
                <div className="filter-section price-section-box">
                  <div className="filter-section-header">
                    <div className="section-title-wrap">
                      <span className="section-gold-dot" />
                      <b>Price Budget</b>
                    </div>
                    <span className="price-badge-highlight">Up to {formatINR(maxPrice)}</span>
                  </div>

                  {/* Quick price presets */}
                  <div className="price-presets-row">
                    {[
                      { label: 'Under ₹599', val: 599 },
                      { label: 'Under ₹899', val: 899 },
                      { label: 'Under ₹1,299', val: 1299 },
                      { label: 'All Hijabs', val: 1500 }
                    ].map(preset => (
                      <button
                        key={preset.val}
                        type="button"
                        className={`price-preset-pill ${maxPrice === preset.val ? 'active' : ''}`}
                        onClick={() => setMaxPrice(preset.val)}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="price-slider-wrap">
                    <input
                      type="range"
                      min="349"
                      max="1500"
                      step="50"
                      value={maxPrice}
                      onChange={e => setMaxPrice(+e.target.value)}
                      className="custom-range-slider"
                      aria-label="Filter maximum price"
                    />
                    <div className="price-range-extremes">
                      <span>₹349 (Min)</span>
                      <span>₹1,500 (Max)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mobile-filter-footer">
                <button
                  type="button"
                  className="filter-footer-reset-btn"
                  onClick={handleClearFilters}
                  disabled={activeFilterCount === 0}
                >
                  <RotateCcw size={14} />
                  <span>Reset All</span>
                </button>
                <button
                  type="button"
                  className="filter-footer-apply-btn"
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <span>Show {filtered.length} {filtered.length === 1 ? 'Hijab' : 'Hijabs'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="products-area">
          {filtered.length > 0 ? (
            <div className="product-grid">
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={Array.isArray(wishlist) && wishlist.includes(p.id)}
                  onWishlist={onWishlist}
                  onAdd={onAdd}
                />
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>No hijabs match your criteria</h2>
              <p>Try clearing filters or searching for alternative fabrics like Chiffon, Mulberry Silk, or Georgette.</p>
              <button type="button" className="btn primary" onClick={handleClearFilters}>
                View All Hijabs
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}