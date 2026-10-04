import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, CreditCard, Banknote, Sparkles } from 'lucide-react'
import { formatINR } from '../lib/data'
import { createNewOrder } from '../lib/dataService'

export default function Checkout({ cart, clearCart }) {
  const nav = useNavigate()
  const location = useLocation()

  const passedCoupon = location.state?.coupon || null
  const passedDiscount = location.state?.discount || 0

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping = subtotal >= 999 ? 0 : 79
  const discount = passedCoupon === 'NOOR10' ? (passedDiscount || Math.round(subtotal * 0.10)) : (passedDiscount || 0)
  const total = Math.max(0, subtotal - discount + shipping)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    paymentMethod: 'online'
  })
  const [submitting, setSubmitting] = useState(false)

  const update = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const orderPayload = {
        user_id: 'guest',
        status: 'pending',
        payment_status: form.paymentMethod === 'cod' ? 'pending' : 'paid',
        payment_method: form.paymentMethod,
        subtotal,
        shipping_fee: shipping,
        discount,
        total,
        coupon_code: passedCoupon,
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address_line1: form.address,
        shipping_landmark: form.landmark,
        shipping_city: form.city,
        shipping_state: form.state,
        shipping_pincode: form.pincode,
        notes: '',
        items: cart.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          sku: i.product.sku,
          unit_price: i.product.price,
          quantity: i.qty,
          line_total: i.product.price * i.qty,
          fabric: i.product.fabric,
          color: i.product.color,
          image: i.product.image
        }))
      }

      await createNewOrder(orderPayload)
      clearCart()
      nav('/order-success', {
        state: {
          orderDetails: {
            customerName: form.name,
            email: form.email,
            city: form.city,
            total: total,
            paymentMethod: form.paymentMethod
          }
        }
      })
    } catch (err) {
      console.error('Order creation error:', err)
      // Fallback
      clearCart()
      nav('/order-success', {
        state: {
          orderDetails: {
            customerName: form.name,
            email: form.email,
            city: form.city,
            total: total,
            paymentMethod: form.paymentMethod
          }
        }
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!cart.length) {
    return (
      <main className="wrap empty checkout-empty">
        <h2>No items in checkout</h2>
        <p>Your bag is empty. Browse our collection of pure hijabs.</p>
        <Link to="/shop" className="btn primary">
          Explore Hijabs Collection
        </Link>
      </main>
    )
  }

  return (
    <main className="wrap checkout-page">
      <div className="checkout-nav-back">
        <Link to="/cart" className="text-link">
          <ArrowLeft size={16} /> Back to Shopping Bag
        </Link>
      </div>

      <div className="shop-title">
        <div className="eyebrow">EXPRESS CHECKOUT</div>
        <h1>Complete Your Hijab Order</h1>
      </div>

      <div className="checkout-layout">
        {/* Form Column */}
        <form className="checkout-form-card" onSubmit={submit}>
          <div className="checkout-section">
            <h2>1. Contact & Delivery Details</h2>
            <div className="form-grid">
              <div className="form-field">
                <label>Full Name *</label>
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="e.g. Fatima Shaikh"
                />
              </div>

              <div className="form-field">
                <label>Mobile Number (For Delivery Updates) *</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="form-field">
                <label>Email Address (For Invoice) *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="e.g. fatima@example.com"
                />
              </div>

              <div className="form-field">
                <label>Pincode *</label>
                <input
                  required
                  name="pincode"
                  value={form.pincode}
                  onChange={update}
                  placeholder="6-digit Pincode"
                />
              </div>
            </div>

            <div className="form-field full-width">
              <label>Complete House / Flat / Street Address *</label>
              <textarea
                required
                name="address"
                value={form.address}
                onChange={update}
                placeholder="Flat/House No., Building Name, Street, Area..."
              />
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>Landmark (Optional)</label>
                <input
                  name="landmark"
                  value={form.landmark}
                  onChange={update}
                  placeholder="Near Mosque, Metro, Park..."
                />
              </div>

              <div className="form-field">
                <label>City & State *</label>
                <input
                  required
                  name="city"
                  value={form.city}
                  onChange={update}
                  placeholder="City, State"
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h2>2. Select Payment Method</h2>
            <div className="payment-method-selector">
              <label className={`payment-card ${form.paymentMethod === 'online' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={form.paymentMethod === 'online'}
                  onChange={update}
                />
                <div className="payment-card-content">
                  <div className="payment-card-title">
                    <CreditCard size={18} />
                    <strong>Online Payment (Recommended)</strong>
                    <span className="fast-tag">Fast & Instant</span>
                  </div>
                  <p>UPI (Google Pay, PhonePe, Paytm), All Credit/Debit Cards, Netbanking</p>
                </div>
              </label>

              <label className={`payment-card ${form.paymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={form.paymentMethod === 'cod'}
                  onChange={update}
                />
                <div className="payment-card-content">
                  <div className="payment-card-title">
                    <Banknote size={18} />
                    <strong>Cash on Delivery (COD)</strong>
                  </div>
                  <p>Pay in cash upon doorstep delivery. Verified OTP confirmation.</p>
                </div>
              </label>
            </div>
          </div>

          <button className="btn primary full place-order-btn" type="submit" disabled={submitting}>
            {submitting ? 'Processing Order...' : `Place Order · ${formatINR(total)}`}
          </button>

          <div className="checkout-trust-footer">
            <ShieldCheck size={16} />
            <span>Encrypted 256-bit checkout · 7-Day easy returns & exchanges</span>
          </div>
        </form>

        {/* Summary Sidebar */}
        <aside className="summary checkout-summary-card">
          <h2>Order Summary</h2>

          <div className="checkout-items-list">
            {cart.map(i => (
              <div className="checkout-mini-item" key={i.product.id}>
                <img src={i.product.image} alt={i.product.name} />
                <div className="mini-item-details">
                  <h4>{i.product.name}</h4>
                  <p>{i.product.color} · Qty: {i.qty}</p>
                </div>
                <strong>{formatINR(i.product.price * i.qty)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-breakdown">
            <div>
              <span>Subtotal</span>
              <b>{formatINR(subtotal)}</b>
            </div>

            {discount > 0 && (
              <div className="discount-line">
                <span>Coupon ({passedCoupon || 'NOOR10'})</span>
                <b>- {formatINR(discount)}</b>
              </div>
            )}

            <div>
              <span>Shipping Fee</span>
              <b>{shipping === 0 ? <span className="free-text">FREE</span> : formatINR(shipping)}</b>
            </div>

            <hr />

            <div className="total-row">
              <span>Grand Total</span>
              <strong className="grand-total">{formatINR(total)}</strong>
            </div>
          </div>

          <div className="checkout-delivery-note">
            <Truck size={16} />
            <span>Estimated Delivery: <strong>3–5 Business Days</strong></span>
          </div>
        </aside>
      </div>
    </main>
  )
}