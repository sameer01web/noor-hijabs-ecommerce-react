import React, { useState, useEffect } from 'react'
import { Heart, Minus, Plus, ShoppingBag, Star, ShieldCheck, Sparkles, Feather, Eye, Check, Truck, ArrowRight, RotateCcw, AlertTriangle, MessageCircle } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { formatINR, products as initialProducts } from '../lib/data'
import { getProducts } from '../lib/dataService'
import { getProductWhatsAppUrl } from '../lib/whatsapp'
import ProductCard from '../components/ProductCard'

export default function Product({ wishlist = [], onWishlist, onAdd }) {
  const { id } = useParams()
  const [productList, setProductList] = useState(initialProducts)
  const [qty, setQty] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function fetchCatalog() {
      try {
        const p = await getProducts()
        if (isMounted && Array.isArray(p) && p.length > 0) {
          setProductList(p.filter(prod => prod && prod.is_active !== false))
        }
      } catch (e) {
        console.warn('Product fetch error:', e)
      }
    }
    fetchCatalog()
    return () => { isMounted = false }
  }, [])

  // Find matching product or fallback safely
  const p = productList.find(x => x && (x.id === id || x.slug === id)) ||
    initialProducts.find(x => x && (x.id === id || x.slug === id)) ||
    productList[0] ||
    initialProducts[0] ||
    {}

  // Safe field extractions
  const pId = p.id ? String(p.id) : (id || 'nh-p01')
  const pName = typeof p.name === 'string' ? p.name : 'Luxury Modest Hijab'
  const pImage = p.image || p.image_url || '/images/vintage_printed_chiffon_hijab.png'
  const pCategory = typeof p.category === 'string' ? p.category : (p.category?.name || 'Chiffon Hijabs')
  const pFabric = typeof p.fabric === 'string' ? p.fabric : '100% Premium Korean Chiffon'
  const pDesign = typeof p.design === 'string' ? p.design : (typeof p.pattern === 'string' ? p.pattern : 'Plain Solid Weave')
  const pColor = typeof p.color === 'string' ? p.color : 'Assorted'
  const pSize = typeof p.size === 'string' ? p.size : '185 cm × 75 cm (Maxi Coverage)'
  const pOpacity = typeof p.opacity === 'string' ? p.opacity : 'Opaque (100% full coverage)'
  const pDesc = typeof p.description === 'string' ? p.description : 'Handcrafted luxury hijab with generous maxi coverage.'
  const pPrice = Number(p.price) || 0
  const pCompareAt = p.compare_at_price != null ? Number(p.compare_at_price) : (p.compareAt != null ? Number(p.compareAt) : null)
  const pStock = p.stock !== undefined && p.stock !== null ? Number(p.stock) : 25
  const isOutOfStock = pStock <= 0
  const isLowStock = !isOutOfStock && pStock <= (Number(p.low_stock_threshold) || 5)

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setQty(1)
  }, [id])

  const discountPercent = pCompareAt && pCompareAt > pPrice
    ? Math.round((1 - pPrice / pCompareAt) * 100)
    : 0

  const isWishlisted = Array.isArray(wishlist) && wishlist.includes(pId)

  const handleAddToCart = () => {
    if (isOutOfStock || !onAdd) return
    onAdd(p, qty)
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  // Related products from same category or fabric
  const relatedProducts = (productList || [])
    .filter(x => x && x.id !== pId && (
      (typeof x.category === 'string' && x.category === pCategory) ||
      (typeof x.fabric === 'string' && x.fabric === pFabric)
    ))
    .slice(0, 4)

  return (
    <main className="wrap product-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="crumb-sep">/</span>
        <Link to="/shop">Hijabs</Link>
        <span className="crumb-sep">/</span>
        <Link to={`/shop?category=${encodeURIComponent(pCategory)}`}>{pCategory}</Link>
        <span className="crumb-sep">/</span>
        <span className="current-crumb">{pName}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="product-detail">
        <div className="detail-image-container">
          <div className="detail-image">
            <img src={pImage} alt={pName} />
            {isOutOfStock ? (
              <span className="detail-badge" style={{ background: '#b91c1c', color: '#fff' }}>
                Out of Stock
              </span>
            ) : p.badge ? (
              <span className="detail-badge">{String(p.badge)}</span>
            ) : null}
          </div>
          <div className="detail-image-perks">
            <span>✨ Generous 185cm Maxi Length</span>
            <span>🌸 Non-Slip Tested</span>
            <span>🌿 100% Breathable</span>
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-eyebrow">
            <span className="eyebrow-text">{pCategory.toUpperCase()}</span>
            {isOutOfStock ? (
              <span className="urgent-stock-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="urgent-stock-tag">Only {pStock} left in stock</span>
            ) : null}
          </div>

          <h1>{pName}</h1>

          <div className="detail-rating-row">
            <div className="stars-cluster">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill={i < Math.floor(Number(p.rating) || 5) ? 'currentColor' : 'none'} />
              ))}
            </div>
            <b>{Number(p.rating) || 4.9}</b>
            <span className="detail-review-count">· {Number(p.reviews) || 24} verified buyer reviews</span>
          </div>

          <div className="detail-price-box">
            <div className="detail-price-numbers">
              <strong className="main-price">{formatINR(pPrice)}</strong>
              {pCompareAt && (
                <del className="strike-price">{formatINR(pCompareAt)}</del>
              )}
            </div>
            {discountPercent > 0 && (
              <span className="detail-discount-badge">Save {discountPercent}%</span>
            )}
            <span className="taxes-note">Inclusive of all taxes · Free delivery &gt; ₹999</span>
          </div>

          <p className="detail-desc">{pDesc}</p>

          {/* Hijab Specs Table */}
          <div className="hijab-spec-grid">
            <div className="spec-item">
              <span className="spec-label">Fabric / Material</span>
              <span className="spec-value">{pFabric}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Pattern / Design</span>
              <span className="spec-value">{pDesign}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Color Shade</span>
              <span className="spec-value">{pColor}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Dimensions / Coverage</span>
              <span className="spec-value">{pSize}</span>
            </div>
            {pOpacity && (
              <div className="spec-item full-width">
                <span className="spec-label">Opacity & Styling Transparency</span>
                <span className="spec-value">{pOpacity}</span>
              </div>
            )}
            <div className="spec-item full-width">
              <span className="spec-label">Dispatch Status</span>
              <span className={`spec-value ${isOutOfStock ? 'stock-urgent' : 'stock-available'}`} style={isOutOfStock ? { color: '#ef4444' } : {}}>
                {isOutOfStock
                  ? '✗ Temporarily sold out in warehouse. Restock coming soon.'
                  : `✓ Ready for immediate express dispatch (${pStock} pieces available)`}
              </span>
            </div>
          </div>

          {/* Quantity & CTA Row */}
          <div className="purchase-controls">
            <div className="purchase-top-row">
              <div className="qty-selector">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="qty-num">{isOutOfStock ? 0 : qty}</span>
                <button
                  type="button"
                  disabled={isOutOfStock || qty >= pStock}
                  onClick={() => setQty(Math.min(pStock, qty + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className={`detail-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => onWishlist && onWishlist(pId)}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              className={`btn primary add-to-bag-btn ${addedAnimation ? 'added-success' : ''} ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              style={isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed', background: '#332d29' } : {}}
            >
              {isOutOfStock ? (
                <>
                  <AlertTriangle size={18} /> Out of Stock · Sold Out
                </>
              ) : addedAnimation ? (
                <>
                  <Check size={18} /> Added to Bag!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add to Shopping Bag · {formatINR(pPrice * qty)}
                </>
              )}
            </button>
          </div>

          {/* Quick WhatsApp Inquiry Action */}
          <div style={{ marginTop: 12 }}>
            <a
              href={getProductWhatsAppUrl(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn outline whatsapp-btn"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', fontSize: 14 }}
            >
              <MessageCircle size={18} /> Inquire or Order via WhatsApp
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="product-perks-list">
            <div className="perk-row">
              <Truck size={17} />
              <div>
                <strong>Express Delivery & COD Available</strong>
                <span>Dispatched within 24 hours. Free delivery on orders over ₹999.</span>
              </div>
            </div>
            <div className="perk-row">
              <RotateCcw size={17} />
              <div>
                <strong>7-Day Easy Returns & Exchanges</strong>
                <span>Hassle-free return pickup if the color or texture does not match your preference.</span>
              </div>
            </div>
            <div className="perk-row">
              <ShieldCheck size={17} />
              <div>
                <strong>The Noor Modesty Guarantee</strong>
                <span>Tested for generous draping, hair root protection, and zero see-through opacity.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">COMPLETE YOUR LOOK</div>
              <h2>You May Also Adore</h2>
            </div>
            <Link to="/shop" className="text-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="product-grid">
            {relatedProducts.map(rp => (
              <ProductCard
                key={rp.id}
                product={rp}
                wishlisted={Array.isArray(wishlist) && wishlist.includes(rp.id)}
                onWishlist={onWishlist}
                onAdd={onAdd}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}