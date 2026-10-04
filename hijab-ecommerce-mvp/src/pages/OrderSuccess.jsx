import React from 'react'
import { CheckCircle, Truck, Package, ArrowRight, Sparkles, MessageCircle, Heart, Printer } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { formatINR } from '../lib/data'
import { getOrderWhatsAppUrl } from '../lib/whatsapp'

export default function OrderSuccess() {
  const location = useLocation()
  const orderDetails = location.state?.orderDetails || {
    customerName: 'Valued Customer',
    email: 'your email',
    city: 'your city',
    total: 998,
    paymentMethod: 'online'
  }

  const orderNumber = orderDetails.orderNumber || `NH-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${Math.floor(1000 + Math.random() * 9000)}`

  const handlePrint = () => {
    window.print()
  }

  const whatsappUrl = getOrderWhatsAppUrl({
    order_number: orderNumber,
    total: orderDetails.total,
    shipping_name: orderDetails.customerName
  })

  return (
    <main className="wrap success-page">
      <div className="success-card">
        <div className="success-icon-wrapper">
          <CheckCircle size={56} />
        </div>

        <div className="eyebrow">ORDER SUCCESSFULLY PLACED</div>
        <h1>JazakAllah Khair for Your Order!</h1>
        <p className="success-sub">
          We have received your order <strong>#{orderNumber}</strong>. A confirmation email with invoice details will be dispatched shortly.
        </p>

        <div className="order-status-timeline">
          <div className="timeline-step active">
            <div className="step-dot" />
            <span>Order Placed</span>
          </div>
          <div className="timeline-step active">
            <div className="step-dot" />
            <span>Packaging & Quality Check</span>
          </div>
          <div className="timeline-step">
            <div className="step-dot" />
            <span>Express Dispatch</span>
          </div>
          <div className="timeline-step">
            <div className="step-dot" />
            <span>Doorstep Delivery</span>
          </div>
        </div>

        <div className="success-info-box">
          <div className="info-item">
            <span>Recipient Name</span>
            <strong>{orderDetails.customerName || 'Valued Customer'}</strong>
          </div>
          <div className="info-item">
            <span>Estimated Delivery</span>
            <strong>3–5 Business Days</strong>
          </div>
          <div className="info-item">
            <span>Payment Method</span>
            <strong>{orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Prepaid'}</strong>
          </div>
          <div className="info-item">
            <span>Order Total</span>
            <strong>{formatINR(orderDetails.total || 998)}</strong>
          </div>
        </div>

        <div className="success-actions">
          <Link className="btn primary" to="/shop">
            Continue Hijab Shopping <ArrowRight size={16} />
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn outline whatsapp-btn"
          >
            <MessageCircle size={17} /> Order Updates via WhatsApp
          </a>
          <button
            type="button"
            onClick={handlePrint}
            className="btn outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>
    </main>
  )
}