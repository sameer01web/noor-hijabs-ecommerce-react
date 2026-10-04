import React, { useState } from 'react'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Sparkles, Tag, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatINR } from '../lib/data'

export default function Cart({ cart, onQty, onRemove }) {
  const nav = useNavigate()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const freeShippingThreshold = 999
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 79

  // Calculate discount if coupon applied
  let discount = 0
  if (appliedCoupon === 'NOOR10') {
    discount = Math.round(subtotal * 0.10)
  }

  const total = Math.max(0, subtotal - discount + shipping)

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    setCouponError('')
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    if (code === 'NOOR10') {
      setAppliedCoupon('NOOR10')
      setCouponError('')
    } else {
      setCouponError('Invalid coupon code. Use "NOOR10" for 10% off.')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  return (
    <main className="wrap cart-page">
      <div className="shop-title">
        <div className="eyebrow">YOUR BOUTIQUE SELECTION</div>
        <h1>Shopping Bag</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty cart-empty">
          <div className="empty-cart-icon">
            <ShoppingBag size={48} />
          </div>
          <h2>Your shopping bag is empty</h2>
          <p>Discover our handcrafted luxury chiffons, mulberry silks, and everyday neutrals.</p>
          <Link className="btn primary" to="/shop">
            Explore Hijabs Collection <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-column">
            {/* Free Shipping Progress Indicator */}
            <div className="shipping-progress-box">
              <div className="shipping-progress-text">
                <Truck size={18} />
                {amountNeededForFreeShipping > 0 ? (
                  <span>
                    Add <strong>{formatINR(amountNeededForFreeShipping)}</strong> more to unlock <strong>FREE Express Shipping</strong>!
                  </span>
                ) : (
                  <span className="free-shipping-unlocked">
                    🎉 Congratulations! You have unlocked <strong>FREE Express Shipping</strong>.
                  </span>
                )}
              </div>
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items">
              {cart.map(i => (
                <div className="cart-item" key={i.product.id}>
                  <Link to={`/product/${i.product.id}`} className="cart-item-img-link">
                    <img src={i.product.image} alt={i.product.name} />
                  </Link>

                  <div className="cart-item-info">
                    <div className="cart-item-head">
                      <span className="cart-fabric-tag">{i.product.fabric || i.product.category}</span>
                      <Link to={`/product/${i.product.id}`}>
                        <h3>{i.product.name}</h3>
                      </Link>
                      <p className="cart-meta">
                        <span>Color: <strong>{i.product.color}</strong></span>
                        {i.product.size && <span> · Size: {i.product.size.split(' ')[0]}</span>}
                      </p>
                    </div>

                    <div className="cart-bottom">
                      <div className="cart-item-price">
                        <strong>{formatINR(i.product.price)}</strong>
                        {i.product.compareAt && (
                          <del>{formatINR(i.product.compareAt)}</del>
                        )}
                      </div>

                      <div className="cart-actions-row">
                        <div className="qty-stepper">
                          <button
                            type="button"
                            onClick={() => onQty(i.product.id, Math.max(1, i.qty - 1))}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{i.qty}</span>
                          <button
                            type="button"
                            disabled={i.qty >= (i.product.stock !== undefined ? i.product.stock : 99)}
                            onClick={() => onQty(i.product.id, i.qty + 1)}
                            aria-label="Increase quantity"
                            style={i.qty >= (i.product.stock !== undefined ? i.product.stock : 99) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => onRemove(i.product.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Assurance in Cart */}
            <div className="cart-guarantees">
              <div>
                <ShieldCheck size={18} />
                <span>100% Genuine Hijab Fabrics</span>
              </div>
              <div>
                <Truck size={18} />
                <span>Express Dispatch & Tracking</span>
              </div>
              <div>
                <Sparkles size={18} />
                <span>Finely Finished Hem Quality</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="summary cart-summary-card">
            <h2>Order Summary</h2>

            {/* Coupon Code Section */}
            <div className="coupon-section">
              {appliedCoupon ? (
                <div className="applied-coupon-box">
                  <div className="coupon-tag-info">
                    <Tag size={15} />
                    <span>Coupon <strong>{appliedCoupon}</strong> Applied (10% Off)</span>
                  </div>
                  <button type="button" className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Coupon code (try NOOR10)"
                    aria-label="Coupon code"
                  />
                  <button type="submit" className="btn outline">Apply</button>
                </form>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
            </div>

            <div className="summary-breakdown">
              <div>
                <span>Bag Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                <b>{formatINR(subtotal)}</b>
              </div>

              {discount > 0 && (
                <div className="discount-line">
                  <span>Special Promo Discount (10%)</span>
                  <b>- {formatINR(discount)}</b>
                </div>
              )}

              <div>
                <span>Estimated Shipping</span>
                <b>{shipping === 0 ? <span className="free-text">FREE</span> : formatINR(shipping)}</b>
              </div>

              <hr />

              <div className="total-row">
                <span>Grand Total</span>
                <strong className="grand-total">{formatINR(total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn primary full checkout-btn"
              onClick={() => nav('/checkout', { state: { coupon: appliedCoupon, discount } })}
            >
              Proceed to Checkout · {formatINR(total)} <ArrowRight size={17} />
            </button>

            <div className="secure-badge">
              <ShieldCheck size={14} />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>

            <div className="accepted-payments">
              <span>UPI · GPay · PhonePe · Cards · Netbanking · Cash on Delivery</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}