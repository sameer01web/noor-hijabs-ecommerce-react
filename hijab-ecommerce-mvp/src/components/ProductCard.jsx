import React, { useState } from 'react'
import { Heart, ShoppingBag, Star, Check, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatINR } from '../lib/data'

export default function ProductCard({ product, wishlisted = false, onWishlist, onAdd }) {
  const [justAdded, setJustAdded] = useState(false)

  if (!product || typeof product !== 'object') {
    return null
  }

  const id = product.id ? String(product.id) : ''
  const name = typeof product.name === 'string' ? product.name : 'Noor Hijab'
  const image = product.image || product.image_url || '/images/vintage_printed_chiffon_hijab.png'
  const price = Number(product.price) || 0
  const compareAt = product.compareAt != null ? Number(product.compareAt) : (product.compare_at_price != null ? Number(product.compare_at_price) : null)
  const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 25
  const isOutOfStock = stock <= 0
  const isLowStock = !isOutOfStock && stock <= (Number(product.low_stock_threshold) || 5)

  const discountPercent = compareAt && compareAt > price
    ? Math.round((1 - price / compareAt) * 100)
    : 0

  const badgeText = typeof product.badge === 'string' ? product.badge : ''
  const isNewBadge = badgeText.toLowerCase().includes('new')

  // Safe category string
  const categoryText = typeof product.category === 'string'
    ? product.category
    : (product.category?.name || 'Chiffon Hijabs')

  // Safe fabric label
  let fabricLabel = categoryText
  if (typeof product.fabric === 'string' && product.fabric.trim()) {
    const parts = product.fabric.trim().split(' ')
    fabricLabel = parts[0] + (parts[1] ? ' ' + parts[1] : '')
  }

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock || !onAdd) return
    onAdd(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onWishlist && id) {
      onWishlist(id)
    }
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <Link to={`/product/${id}`} aria-label={name}>
          <img src={image} alt={name} loading="lazy" />
        </Link>

        {isOutOfStock ? (
          <span className="badge badge-out-of-stock" style={{ background: '#b91c1c', color: '#fff' }}>
            Out of Stock
          </span>
        ) : badgeText ? (
          <span className={`badge ${isNewBadge ? 'badge-new' : ''}`}>
            {badgeText}
          </span>
        ) : null}

        <button
          type="button"
          className={`heart-btn ${wishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          className={`quick-add-btn ${justAdded ? 'added' : ''} ${isOutOfStock ? 'disabled' : ''}`}
          onClick={handleQuickAdd}
          style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed', background: '#332d29' } : {}}
        >
          {isOutOfStock ? (
            <span>Sold Out</span>
          ) : justAdded ? (
            <>
              <Check size={14} /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag size={14} /> Quick Add
            </>
          )}
        </button>
      </div>

      <div className="product-info">
        <div className="product-meta-row">
          <span className="product-fabric-tag">
            {fabricLabel}
          </span>
          {isOutOfStock ? (
            <span className="low-stock-dot" style={{ color: '#ef4444' }}>Out of stock</span>
          ) : isLowStock ? (
            <span className="low-stock-dot">Only {stock} left</span>
          ) : null}
        </div>

        <Link to={`/product/${id}`} className="product-title-link">
          <h3>{name}</h3>
        </Link>

        <p className="product-color-desc">
          <span className="color-label">{product.color || 'Assorted'}</span>
          {product.design && <span className="design-label"> · {String(product.design)}</span>}
        </p>

        <div className="product-rating">
          <div className="stars">
            <Star size={12} fill="currentColor" />
          </div>
          <span className="rating-num">{Number(product.rating) || 4.9}</span>
          <span className="review-num">({Number(product.reviews) || 24})</span>
        </div>

        <div className="product-price-row">
          <strong className="current-price">{formatINR(price)}</strong>
          {compareAt && <del className="compare-price">{formatINR(compareAt)}</del>}
          {discountPercent > 0 && (
            <span className="discount-tag">{discountPercent}% OFF</span>
          )}
        </div>
      </div>
    </article>
  )
}