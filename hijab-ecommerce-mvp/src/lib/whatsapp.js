/**
 * WhatsApp Integration Utility for Noor Hijabs
 * Handles direct WhatsApp 1-click ordering, styling consultations, and tracking updates.
 */

export function getWhatsAppNumber() {
  const envNumber = import.meta.env.VITE_WHATSAPP_NUMBER
  if (envNumber && typeof envNumber === 'string') {
    const cleaned = envNumber.replace(/\D/g, '')
    if (cleaned.length >= 10) return cleaned
  }
  return '919876543210' // Default fallback support WhatsApp number
}

/**
 * Generate WhatsApp URL with encoded message
 */
export function createWhatsAppLink(message) {
  const number = getWhatsAppNumber()
  const encodedText = encodeURIComponent(message.trim())
  return `https://wa.me/${number}?text=${encodedText}`
}

/**
 * WhatsApp URL for Product Consultation or Direct Order
 */
export function getProductWhatsAppUrl(product) {
  if (!product) return createWhatsAppLink('Hello Noor Hijabs team, I would like to inquire about your modest collection.')

  const msg = `Assalamu Alaikum / Hello Noor Hijabs! 🌸\n\nI am interested in ordering/inquiring about this hijab:\n• *Product:* ${product.name}\n• *Price:* ₹${product.price}\n• *Fabric:* ${product.fabric || 'Premium Modest Fabric'}\n• *Color/Shade:* ${product.color || 'Standard'}\n• *SKU:* ${product.sku || 'NH-PROD'}\n\nPlease confirm availability and dispatch timeline!`

  return createWhatsAppLink(msg)
}

/**
 * WhatsApp URL for Order Tracking & Updates
 */
export function getOrderWhatsAppUrl(order) {
  if (!order) return createWhatsAppLink('Hello Noor Hijabs team, I have a question regarding my order.')

  const orderNum = order.order_number || order.id || 'N/A'
  const total = order.total || order.subtotal || 0
  const name = order.shipping_name || 'Customer'

  const msg = `Assalamu Alaikum / Hello Noor Hijabs! 📦\n\nI would like an update for my order:\n• *Order Number:* ${orderNum}\n• *Customer Name:* ${name}\n• *Total Amount:* ₹${total}\n\nPlease share the shipping tracking details. JazakAllah Khair!`

  return createWhatsAppLink(msg)
}

/**
 * WhatsApp URL for Modest Styling Consultation
 */
export function getStylingWhatsAppUrl(topic = 'hijab shade & fabric matching') {
  const msg = `Assalamu Alaikum / Hello Noor Hijabs! ✨\n\nI need advice on ${topic} for an upcoming occasion. Could your modest stylist guide me on recommended pieces?`
  return createWhatsAppLink(msg)
}
