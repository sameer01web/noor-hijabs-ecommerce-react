import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import { products as initialProducts } from '../lib/data'
import { getProducts } from '../lib/dataService'

export default function Wishlist({ wishlist = [], onWishlist, onAdd }) {
  const [productList, setProductList] = useState(initialProducts)

  useEffect(() => {
    let isMounted = true
    async function loadCatalog() {
      try {
        const p = await getProducts()
        if (isMounted && Array.isArray(p) && p.length > 0) {
          setProductList(p.filter(prod => prod && prod.is_active !== false))
        }
      } catch (e) {
        console.warn('Wishlist catalog fetch error:', e)
      }
    }
    loadCatalog()
    return () => { isMounted = false }
  }, [])

  const safeWishlist = Array.isArray(wishlist) ? wishlist : []
  const items = productList.filter(p => p && safeWishlist.includes(p.id))

  const handleAddAllToCart = () => {
    if (!onAdd) return
    items.forEach(p => onAdd(p, 1))
  }

  return (
    <main className="wrap shop-page wishlist-page">
      <div className="shop-title">
        <div className="eyebrow">
          <Heart size={13} />
          <span>YOUR CURATED FAVORITES</span>
        </div>
        <h1>Saved Hijabs</h1>
        <p>Keep your most-loved fabrics and seasonal prints here until you're ready to order.</p>
      </div>

      {items.length > 0 ? (
        <div className="wishlist-content">
          <div className="wishlist-toolbar">
            <span className="wishlist-count-text">
              <strong>{items.length}</strong> {items.length === 1 ? 'hijab' : 'hijabs'} saved
            </span>
            <button
              type="button"
              className="btn outline add-all-btn"
              onClick={handleAddAllToCart}
            >
              <ShoppingBag size={15} /> Move All to Bag
            </button>
          </div>

          <div className="product-grid">
            {items.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted
                onWishlist={onWishlist}
                onAdd={onAdd}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="empty wishlist-empty">
          <div className="empty-icon-wrap">
            <Heart size={44} />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart icon on any hijab to save it for later or compare shades.</p>
          <Link className="btn primary" to="/shop">
            Explore All Hijabs <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </main>
  )
}