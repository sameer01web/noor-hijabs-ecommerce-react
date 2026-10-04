import { supabase, supabaseConfigured } from './supabase'
import { products as initialProducts, categories as initialCategories } from './data'

const STORAGE_KEYS = {
  PRODUCTS: 'noor_admin_products',
  CATEGORIES: 'noor_admin_categories',
  ORDERS: 'noor_admin_orders',
  COUPONS: 'noor_admin_coupons',
  CUSTOMERS: 'noor_admin_customers'
}

// Initial mock orders for demonstration and fallback
const initialOrders = [
  {
    id: 'ord-001',
    order_number: 'NH-20260920-4491',
    user_id: 'user-001',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_RZP9812478',
    razorpay_payment_id: 'pay_RZP8871234',
    subtotal: 549,
    shipping_fee: 0,
    discount: 55,
    total: 494,
    coupon_code: 'NOOR10',
    shipping_name: 'Fatima Zahra Khan',
    shipping_phone: '+91 98765 43210',
    shipping_address_line1: 'Flat 402, Al-Noor Residency, Carter Road',
    shipping_address_line2: 'Bandra West',
    shipping_landmark: 'Near Mehboob Studio',
    shipping_city: 'Mumbai',
    shipping_state: 'Maharashtra',
    shipping_pincode: '400050',
    notes: 'Customer requested gentle perfume paper wrapping.',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-001',
        product_id: 'nh-p01',
        product_name: 'Vintage Botanical Printed Chiffon Hijab',
        sku: 'NH-CHI-01',
        unit_price: 549,
        quantity: 1,
        line_total: 549,
        fabric: '100% Premium Korean Chiffon',
        color: 'Sage & Soft Olive',
        image: '/images/vintage_printed_chiffon_hijab.png'
      }
    ]
  },
  {
    id: 'ord-002',
    order_number: 'NH-20260925-8823',
    user_id: 'user-002',
    status: 'shipped',
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_RZP9819921',
    razorpay_payment_id: 'pay_RZP8879942',
    subtotal: 1798,
    shipping_fee: 0,
    discount: 180,
    total: 1618,
    coupon_code: 'NOOR10',
    shipping_name: 'Dr. Ayesha Siddiqui',
    shipping_phone: '+91 98111 22334',
    shipping_address_line1: 'A-14, Green Park Extension',
    shipping_address_line2: 'Near AIIMS Campus',
    shipping_landmark: 'Opposite Metro Gate 2',
    shipping_city: 'New Delhi',
    shipping_state: 'Delhi',
    shipping_pincode: '110016',
    notes: 'Urgent express delivery requested for medical conference.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-002',
        product_id: 'nh-p02',
        product_name: 'Royal Heritage Embroidered Silk Hijab',
        sku: 'NH-SLK-01',
        unit_price: 999,
        quantity: 1,
        line_total: 999,
        fabric: 'Pure Mulberry Silk-Crepe Blend',
        color: 'Champagne Ivory',
        image: 'https://images.unsplash.com/photo-1584990347449-a2924344ca12?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'item-003',
        product_id: 'nh-p04',
        product_name: 'Artisan Paisley Silk-Luxe Hijab',
        sku: 'NH-SLK-02',
        unit_price: 799,
        quantity: 1,
        line_total: 799,
        fabric: 'Lustrous Silk Satin',
        color: 'Dusty Rose & Gold',
        image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80'
      }
    ]
  },
  {
    id: 'ord-003',
    order_number: 'NH-20260928-1054',
    user_id: 'user-003',
    status: 'processing',
    payment_status: 'paid',
    payment_method: 'online',
    razorpay_order_id: 'order_RZP9824412',
    razorpay_payment_id: 'pay_RZP8883391',
    subtotal: 898,
    shipping_fee: 0,
    discount: 0,
    total: 898,
    coupon_code: null,
    shipping_name: 'Zoya Merchant',
    shipping_phone: '+91 97400 55667',
    shipping_address_line1: 'Villa 12, Palm Meadows, Whitefield',
    shipping_address_line2: 'Behind Forum Value Mall',
    shipping_landmark: 'Palm Avenue Road',
    shipping_city: 'Bengaluru',
    shipping_state: 'Karnataka',
    shipping_pincode: '560066',
    notes: 'Gift pack requested for sister.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-004',
        product_id: 'nh-p03',
        product_name: 'Everyday Matte Georgette Hijab',
        sku: 'NH-GEO-01',
        unit_price: 449,
        quantity: 2,
        line_total: 898,
        fabric: 'Heavyweight Matte Georgette',
        color: 'Warm Mocha Brown',
        image: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=900&q=80'
      }
    ]
  },
  {
    id: 'ord-004',
    order_number: 'NH-20260929-3309',
    user_id: 'user-004',
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'cod',
    razorpay_order_id: null,
    razorpay_payment_id: null,
    subtotal: 399,
    shipping_fee: 79,
    discount: 0,
    total: 478,
    coupon_code: null,
    shipping_name: 'Maryam Qureshi',
    shipping_phone: '+91 98220 99881',
    shipping_address_line1: 'B-201, Rosewood Heights, Camp',
    shipping_address_line2: 'Near East Street',
    shipping_landmark: 'Opposite St. Xavier Church',
    shipping_city: 'Pune',
    shipping_state: 'Maharashtra',
    shipping_pincode: '411001',
    notes: 'Cash on delivery order. Please call before delivery.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'item-005',
        product_id: 'nh-p05',
        product_name: 'Pure Breathable Turkish Cotton Hijab',
        sku: 'NH-COT-01',
        unit_price: 399,
        quantity: 1,
        line_total: 399,
        fabric: '100% Organic Turkish Cotton Voile',
        color: 'Nude Almond Sand',
        image: 'https://images.unsplash.com/photo-1585488433560-7f9e3d9f9e0b?auto=format&fit=crop&w=900&q=80'
      }
    ]
  }
]

// Initial coupons
const initialCoupons = [
  {
    id: 'coup-001',
    code: 'NOOR10',
    discount_type: 'percent',
    discount_value: 10,
    min_order_amount: 500,
    max_discount: 300,
    usage_limit: 1000,
    used_count: 142,
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'coup-002',
    code: 'EIDLUXE',
    discount_type: 'fixed',
    discount_value: 200,
    min_order_amount: 1499,
    max_discount: 200,
    usage_limit: 500,
    used_count: 68,
    starts_at: '2026-03-01T00:00:00Z',
    expires_at: '2026-10-30T23:59:59Z',
    is_active: true,
    created_at: '2026-03-01T00:00:00Z'
  },
  {
    id: 'coup-003',
    code: 'SILK15',
    discount_type: 'percent',
    discount_value: 15,
    min_order_amount: 999,
    max_discount: 500,
    usage_limit: 300,
    used_count: 89,
    starts_at: '2026-04-01T00:00:00Z',
    expires_at: '2026-11-30T23:59:59Z',
    is_active: true,
    created_at: '2026-04-01T00:00:00Z'
  },
  {
    id: 'coup-004',
    code: 'WELCOME50',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 399,
    max_discount: 50,
    usage_limit: 2000,
    used_count: 310,
    starts_at: '2026-01-01T00:00:00Z',
    expires_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
]

// Initial customers
const initialCustomers = [
  {
    id: 'user-001',
    full_name: 'Fatima Zahra Khan',
    email: 'fatima.zahra@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    city: 'Mumbai',
    orders_count: 3,
    total_spent: 2450,
    created_at: '2026-05-12T10:30:00Z'
  },
  {
    id: 'user-002',
    full_name: 'Dr. Ayesha Siddiqui',
    email: 'dr.ayesha@hospital.org',
    phone: '+91 98111 22334',
    role: 'customer',
    city: 'New Delhi',
    orders_count: 5,
    total_spent: 6200,
    created_at: '2026-04-02T14:15:00Z'
  },
  {
    id: 'user-003',
    full_name: 'Zoya Merchant',
    email: 'zoya.m@designstudio.in',
    phone: '+91 97400 55667',
    role: 'customer',
    city: 'Bengaluru',
    orders_count: 2,
    total_spent: 1897,
    created_at: '2026-07-20T09:45:00Z'
  },
  {
    id: 'user-004',
    full_name: 'Maryam Qureshi',
    email: 'maryam.q@gmail.com',
    phone: '+91 98220 99881',
    role: 'customer',
    city: 'Pune',
    orders_count: 1,
    total_spent: 478,
    created_at: '2026-09-29T11:00:00Z'
  },
  {
    id: 'user-admin',
    full_name: 'Noor Admin / Chief Curator',
    email: 'admin@noorhijabs.com',
    phone: '+91 98920 12345',
    role: 'admin',
    city: 'Mumbai',
    orders_count: 0,
    total_spent: 0,
    created_at: '2026-01-01T00:00:00Z'
  }
]

// LocalStorage helpers
function getLocal(key, fallback) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (e) {
    console.error('LocalStorage read error:', e)
    return fallback
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch (e) {
    console.error('LocalStorage write error:', e)
  }
}

// Convert mock product format to DB schema and vice versa
function normalizeProduct(p) {
  if (!p) return null

  // Ensure category is always a pure string name
  let categoryName = 'Chiffon Hijabs'
  if (typeof p.category === 'string' && p.category.trim()) {
    categoryName = p.category.trim()
  } else if (p.category && typeof p.category.name === 'string') {
    categoryName = p.category.name.trim()
  } else if (typeof p.category_id === 'string' && p.category_id.trim()) {
    categoryName = p.category_id.trim()
  }

  // Ensure categories is always an array of pure string names
  let categoriesArr = [categoryName]
  if (Array.isArray(p.categories) && p.categories.length > 0) {
    categoriesArr = p.categories
      .map(c => (typeof c === 'string' ? c.trim() : (c?.name ? String(c.name).trim() : '')))
      .filter(Boolean)
    if (!categoriesArr.includes(categoryName)) {
      categoriesArr.unshift(categoryName)
    }
  }

  const name = typeof p.name === 'string' ? p.name : 'Noor Luxury Hijab'
  const id = p.id ? String(p.id) : `nh-${Date.now().toString(36)}`
  const slug = p.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const badge = typeof p.badge === 'string' ? p.badge : (p.is_featured ? 'Featured' : '')

  return {
    id,
    category_id: p.category_id || null,
    category: categoryName,
    categories: categoriesArr,
    name,
    slug,
    sku: p.sku || `NH-${id}`,
    description: p.description || '',
    price: Number(p.price) || 0,
    compare_at_price: p.compare_at_price != null ? Number(p.compare_at_price) : (p.compareAt != null ? Number(p.compareAt) : null),
    compareAt: p.compare_at_price != null ? Number(p.compare_at_price) : (p.compareAt != null ? Number(p.compareAt) : null),
    stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 25,
    low_stock_threshold: Number(p.low_stock_threshold) || 5,
    color: typeof p.color === 'string' ? p.color : 'Assorted',
    fabric: typeof p.fabric === 'string' ? p.fabric : '100% Premium Korean Chiffon',
    design: typeof p.design === 'string' ? p.design : (typeof p.pattern === 'string' ? p.pattern : 'Plain Solid Weave'),
    pattern: typeof p.pattern === 'string' ? p.pattern : (typeof p.design === 'string' ? p.design : 'Plain Solid Weave'),
    size: typeof p.size === 'string' ? p.size : '185 cm × 75 cm (Maxi Coverage)',
    opacity: typeof p.opacity === 'string' ? p.opacity : 'Opaque (100% coverage)',
    badge,
    is_active: p.is_active !== undefined ? Boolean(p.is_active) : true,
    is_featured: p.is_featured !== undefined ? Boolean(p.is_featured) : false,
    rating: Number(p.rating) || 4.9,
    reviews: Number(p.reviews) || 24,
    image: p.image || p.image_url || (p.product_images && p.product_images[0]?.image_url) || '/images/vintage_printed_chiffon_hijab.png',
    product_images: p.product_images || [
      {
        id: 'img-' + id,
        image_url: p.image || p.image_url || '/images/vintage_printed_chiffon_hijab.png',
        alt_text: name,
        sort_order: 0
      }
    ],
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || new Date().toISOString()
  }
}

// ----------------------------------------------------
// PRODUCT MANAGEMENT
// ----------------------------------------------------
export async function getProducts() {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug),
          product_images(id, image_url, alt_text, sort_order)
        `)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data.map(p => {
          const norm = normalizeProduct(p)
          return {
            ...norm,
            category: typeof p.category?.name === 'string' ? p.category.name : norm.category,
            image: p.product_images?.[0]?.image_url || norm.image
          }
        }).filter(Boolean)
      }
    } catch (err) {
      console.warn('Supabase fetch products fallback to local:', err)
    }
  }

  const local = getLocal(STORAGE_KEYS.PRODUCTS, null)
  if (local && Array.isArray(local) && local.length > 0) {
    return local.map(normalizeProduct).filter(Boolean)
  }

  // Seed default products
  const initial = initialProducts.map(normalizeProduct).filter(Boolean)
  setLocal(STORAGE_KEYS.PRODUCTS, initial)
  return initial
}

export async function addProduct(productData) {
  const newProduct = normalizeProduct({
    ...productData,
    id: productData.id || `nh-${Date.now().toString(36)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  if (supabaseConfigured && supabase) {
    try {
      // Find category_id if slug or name supplied
      let catId = newProduct.category_id
      if (!catId && newProduct.category) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', newProduct.category)
          .maybeSingle()
        if (cat) catId = cat.id
      }

      const dbPayload = {
        category_id: catId || null,
        name: newProduct.name,
        slug: newProduct.slug,
        sku: newProduct.sku,
        description: newProduct.description,
        price: newProduct.price,
        compare_at_price: newProduct.compare_at_price,
        stock: newProduct.stock,
        low_stock_threshold: newProduct.low_stock_threshold,
        color: newProduct.color,
        fabric: newProduct.fabric,
        is_active: newProduct.is_active,
        is_featured: newProduct.is_featured
      }

      const { data: insertedProduct, error } = await supabase
        .from('products')
        .insert(dbPayload)
        .select()
        .single()

      if (error) {
        console.error('Supabase add product error:', error)
        throw error
      }

      if (insertedProduct && newProduct.image) {
        await supabase.from('product_images').insert({
          product_id: insertedProduct.id,
          image_url: newProduct.image,
          alt_text: newProduct.name,
          sort_order: 0
        })
      }

      newProduct.id = insertedProduct.id
    } catch (err) {
      console.warn('Supabase add product failed, storing locally:', err)
    }
  }

  const list = await getProducts()
  const updatedList = [newProduct, ...list.filter(p => p.id !== newProduct.id)]
  setLocal(STORAGE_KEYS.PRODUCTS, updatedList)
  return newProduct
}

export async function updateProduct(id, updates) {
  const normalizedUpdates = {
    ...updates,
    updated_at: new Date().toISOString()
  }

  if (supabaseConfigured && supabase) {
    try {
      const dbPayload = {}
      if (updates.name !== undefined) dbPayload.name = updates.name
      if (updates.slug !== undefined) dbPayload.slug = updates.slug
      if (updates.sku !== undefined) dbPayload.sku = updates.sku
      if (updates.description !== undefined) dbPayload.description = updates.description
      if (updates.price !== undefined) dbPayload.price = updates.price
      if (updates.compare_at_price !== undefined || updates.compareAt !== undefined) {
        dbPayload.compare_at_price = updates.compare_at_price ?? updates.compareAt
      }
      if (updates.stock !== undefined) dbPayload.stock = updates.stock
      if (updates.low_stock_threshold !== undefined) dbPayload.low_stock_threshold = updates.low_stock_threshold
      if (updates.color !== undefined) dbPayload.color = updates.color
      if (updates.fabric !== undefined) dbPayload.fabric = updates.fabric
      if (updates.is_active !== undefined) dbPayload.is_active = updates.is_active
      if (updates.is_featured !== undefined) dbPayload.is_featured = updates.is_featured
      if (updates.category_id !== undefined) dbPayload.category_id = updates.category_id

      const { error } = await supabase
        .from('products')
        .update(dbPayload)
        .eq('id', id)

      if (error) throw error

      if (updates.image) {
        // Update product image
        const { data: existingImg } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', id)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (existingImg) {
          await supabase
            .from('product_images')
            .update({ image_url: updates.image, alt_text: updates.name || 'Hijab image' })
            .eq('id', existingImg.id)
        } else {
          await supabase.from('product_images').insert({
            product_id: id,
            image_url: updates.image,
            alt_text: updates.name || 'Hijab image',
            sort_order: 0
          })
        }
      }
    } catch (err) {
      console.warn('Supabase update product failed, updating locally:', err)
    }
  }

  const list = await getProducts()
  const updatedList = list.map(p => (p.id === id ? normalizeProduct({ ...p, ...normalizedUpdates }) : p))
  setLocal(STORAGE_KEYS.PRODUCTS, updatedList)
  return updatedList.find(p => p.id === id)
}

export async function deleteProduct(id) {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.warn('Supabase delete product failed, deleting locally:', err)
    }
  }

  const list = await getProducts()
  const updatedList = list.filter(p => p.id !== id)
  setLocal(STORAGE_KEYS.PRODUCTS, updatedList)
  return true
}

export async function updateProductStock(id, newStock) {
  return updateProduct(id, { stock: Math.max(0, Number(newStock) || 0) })
}

// ----------------------------------------------------
// CATEGORIES MANAGEMENT
// ----------------------------------------------------
export async function getCategories() {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (!error && data && data.length > 0) {
        return data.map((c, idx) => ({
          id: c.id || `cat-${idx}`,
          name: typeof c.name === 'string' ? c.name : 'Hijabs',
          slug: c.slug || (typeof c.name === 'string' ? c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `cat-${idx}`),
          description: c.description || '',
          image_url: c.image_url || null,
          is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
          sort_order: Number(c.sort_order) || idx + 1,
          created_at: c.created_at || new Date().toISOString()
        }))
      }
    } catch (err) {
      console.warn('Supabase get categories failed:', err)
    }
  }

  const local = getLocal(STORAGE_KEYS.CATEGORIES, null)
  if (local && Array.isArray(local) && local.length > 0) {
    return local.map((c, idx) => ({
      id: c.id || `cat-${idx}`,
      name: typeof c.name === 'string' ? c.name : (c.title || 'Hijabs'),
      slug: c.slug || c.id || `cat-${idx}`,
      description: c.description || '',
      image_url: c.image_url || null,
      is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
      sort_order: Number(c.sort_order) || idx + 1,
      created_at: c.created_at || new Date().toISOString()
    }))
  }

  const initial = initialCategories.map((c, idx) => ({
    id: c.id,
    name: c.name,
    slug: c.id,
    description: c.description || '',
    image_url: null,
    is_active: true,
    sort_order: idx + 1,
    created_at: new Date().toISOString()
  }))

  setLocal(STORAGE_KEYS.CATEGORIES, initial)
  return initial
}

export async function addCategory(categoryData) {
  const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const newCat = {
    id: categoryData.id || `cat-${Date.now().toString(36)}`,
    name: categoryData.name,
    slug,
    description: categoryData.description || '',
    image_url: categoryData.image_url || null,
    is_active: categoryData.is_active !== undefined ? Boolean(categoryData.is_active) : true,
    sort_order: Number(categoryData.sort_order) || 0,
    created_at: new Date().toISOString()
  }

  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
          image_url: newCat.image_url,
          is_active: newCat.is_active,
          sort_order: newCat.sort_order
        })
        .select()
        .single()

      if (error) throw error
      if (data) newCat.id = data.id
    } catch (err) {
      console.warn('Supabase add category failed:', err)
    }
  }

  const list = await getCategories()
  const updated = [...list, newCat]
  setLocal(STORAGE_KEYS.CATEGORIES, updated)
  return newCat
}

export async function updateCategory(id, updates) {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          slug: updates.slug,
          description: updates.description,
          image_url: updates.image_url,
          is_active: updates.is_active,
          sort_order: updates.sort_order
        })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.warn('Supabase update category failed:', err)
    }
  }

  const list = await getCategories()
  const updated = list.map(c => (c.id === id ? { ...c, ...updates } : c))
  setLocal(STORAGE_KEYS.CATEGORIES, updated)
  return updated.find(c => c.id === id)
}

export async function deleteCategory(id) {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.warn('Supabase delete category failed:', err)
    }
  }

  const list = await getCategories()
  const updated = list.filter(c => c.id !== id)
  setLocal(STORAGE_KEYS.CATEGORIES, updated)
  return true
}

// ----------------------------------------------------
// ORDERS MANAGEMENT
// ----------------------------------------------------
export async function getOrders() {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('Supabase fetch orders fallback to local:', err)
    }
  }

  const local = getLocal(STORAGE_KEYS.ORDERS, null)
  if (local && Array.isArray(local)) {
    return local
  }

  setLocal(STORAGE_KEYS.ORDERS, initialOrders)
  return initialOrders
}

export async function updateOrderStatus(orderId, newStatus) {
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`)
  }

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
    } catch (err) {
      console.warn('Supabase update order status error:', err)
    }
  }

  const list = await getOrders()
  const updated = list.map(o => (o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o))
  setLocal(STORAGE_KEYS.ORDERS, updated)
  return updated.find(o => o.id === orderId)
}

export async function updateOrderPaymentStatus(orderId, newPaymentStatus) {
  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded']
  if (!validPaymentStatuses.includes(newPaymentStatus)) {
    throw new Error(`Invalid payment status: ${newPaymentStatus}`)
  }

  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error
    } catch (err) {
      console.warn('Supabase update payment status error:', err)
    }
  }

  const list = await getOrders()
  const updated = list.map(o => (o.id === orderId ? { ...o, payment_status: newPaymentStatus, updated_at: new Date().toISOString() } : o))
  setLocal(STORAGE_KEYS.ORDERS, updated)
  return updated.find(o => o.id === orderId)
}

export async function updateOrderNotes(orderId, notes) {
  if (supabaseConfigured && supabase) {
    try {
      await supabase
        .from('orders')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', orderId)
    } catch (err) {
      console.warn('Supabase update notes error:', err)
    }
  }

  const list = await getOrders()
  const updated = list.map(o => (o.id === orderId ? { ...o, notes, updated_at: new Date().toISOString() } : o))
  setLocal(STORAGE_KEYS.ORDERS, updated)
  return updated.find(o => o.id === orderId)
}

export async function createNewOrder(orderPayload) {
  const orderNumber = 'NH-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
  const newOrder = {
    id: `ord-${Date.now().toString(36)}`,
    order_number: orderNumber,
    user_id: orderPayload.user_id || 'guest',
    status: orderPayload.status || 'pending',
    payment_status: orderPayload.payment_status || (orderPayload.payment_method === 'cod' ? 'pending' : 'paid'),
    payment_method: orderPayload.payment_method || 'online',
    razorpay_order_id: orderPayload.razorpay_order_id || null,
    razorpay_payment_id: orderPayload.razorpay_payment_id || null,
    subtotal: Number(orderPayload.subtotal) || 0,
    shipping_fee: Number(orderPayload.shipping_fee) || 0,
    discount: Number(orderPayload.discount) || 0,
    total: Number(orderPayload.total) || 0,
    coupon_code: orderPayload.coupon_code || null,
    shipping_name: orderPayload.shipping_name || '',
    shipping_phone: orderPayload.shipping_phone || '',
    shipping_address_line1: orderPayload.shipping_address_line1 || '',
    shipping_address_line2: orderPayload.shipping_address_line2 || '',
    shipping_landmark: orderPayload.shipping_landmark || '',
    shipping_city: orderPayload.shipping_city || '',
    shipping_state: orderPayload.shipping_state || '',
    shipping_pincode: orderPayload.shipping_pincode || '',
    notes: orderPayload.notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: orderPayload.items || []
  }

  const list = await getOrders()
  const updated = [newOrder, ...list]
  setLocal(STORAGE_KEYS.ORDERS, updated)
  return newOrder
}

// ----------------------------------------------------
// COUPONS MANAGEMENT
// ----------------------------------------------------
export async function getCoupons() {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        return data
      }
    } catch (err) {
      console.warn('Supabase fetch coupons failed:', err)
    }
  }

  const local = getLocal(STORAGE_KEYS.COUPONS, null)
  if (local && Array.isArray(local)) {
    return local
  }

  setLocal(STORAGE_KEYS.COUPONS, initialCoupons)
  return initialCoupons
}

export async function addCoupon(couponData) {
  const newCoupon = {
    id: couponData.id || `coup-${Date.now().toString(36)}`,
    code: couponData.code.trim().toUpperCase(),
    discount_type: couponData.discount_type || 'percent',
    discount_value: Number(couponData.discount_value) || 0,
    min_order_amount: Number(couponData.min_order_amount) || 0,
    max_discount: couponData.max_discount ? Number(couponData.max_discount) : null,
    usage_limit: couponData.usage_limit ? Number(couponData.usage_limit) : null,
    used_count: 0,
    starts_at: couponData.starts_at || new Date().toISOString(),
    expires_at: couponData.expires_at || null,
    is_active: couponData.is_active !== undefined ? Boolean(couponData.is_active) : true,
    created_at: new Date().toISOString()
  }

  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert({
          code: newCoupon.code,
          discount_type: newCoupon.discount_type,
          discount_value: newCoupon.discount_value,
          min_order_amount: newCoupon.min_order_amount,
          max_discount: newCoupon.max_discount,
          usage_limit: newCoupon.usage_limit,
          starts_at: newCoupon.starts_at,
          expires_at: newCoupon.expires_at,
          is_active: newCoupon.is_active
        })
        .select()
        .single()

      if (error) throw error
      if (data) newCoupon.id = data.id
    } catch (err) {
      console.warn('Supabase add coupon failed:', err)
    }
  }

  const list = await getCoupons()
  const updated = [newCoupon, ...list]
  setLocal(STORAGE_KEYS.COUPONS, updated)
  return newCoupon
}

export async function updateCoupon(id, updates) {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({
          code: updates.code ? updates.code.trim().toUpperCase() : undefined,
          discount_type: updates.discount_type,
          discount_value: updates.discount_value !== undefined ? Number(updates.discount_value) : undefined,
          min_order_amount: updates.min_order_amount !== undefined ? Number(updates.min_order_amount) : undefined,
          max_discount: updates.max_discount !== undefined ? (updates.max_discount ? Number(updates.max_discount) : null) : undefined,
          usage_limit: updates.usage_limit !== undefined ? (updates.usage_limit ? Number(updates.usage_limit) : null) : undefined,
          starts_at: updates.starts_at,
          expires_at: updates.expires_at,
          is_active: updates.is_active
        })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.warn('Supabase update coupon failed:', err)
    }
  }

  const list = await getCoupons()
  const updated = list.map(c => (c.id === id ? { ...c, ...updates, code: updates.code ? updates.code.trim().toUpperCase() : c.code } : c))
  setLocal(STORAGE_KEYS.COUPONS, updated)
  return updated.find(c => c.id === id)
}

export async function deleteCoupon(id) {
  if (supabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error
    } catch (err) {
      console.warn('Supabase delete coupon failed:', err)
    }
  }

  const list = await getCoupons()
  const updated = list.filter(c => c.id !== id)
  setLocal(STORAGE_KEYS.COUPONS, updated)
  return true
}

// ----------------------------------------------------
// CUSTOMERS & PROFILES MANAGEMENT
// ----------------------------------------------------
export async function getCustomers() {
  if (supabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        // Fetch order stats for each customer
        const orders = await getOrders()
        return data.map(p => {
          const userOrders = orders.filter(o => o.user_id === p.id)
          const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
          return {
            id: p.id,
            full_name: p.full_name || 'Sister in Modesty',
            email: p.email || 'customer@noorhijabs.com',
            phone: p.phone || '—',
            role: p.role || 'customer',
            city: p.city || 'India',
            orders_count: userOrders.length,
            total_spent: totalSpent,
            created_at: p.created_at
          }
        })
      }
    } catch (err) {
      console.warn('Supabase fetch profiles failed:', err)
    }
  }

  const local = getLocal(STORAGE_KEYS.CUSTOMERS, null)
  if (local && Array.isArray(local)) {
    return local
  }

  setLocal(STORAGE_KEYS.CUSTOMERS, initialCustomers)
  return initialCustomers
}

// ----------------------------------------------------
// STORAGE: PRODUCT IMAGE UPLOAD
// ----------------------------------------------------
export async function uploadProductImage(file) {
  if (!file) throw new Error('No file provided')

  if (supabaseConfigured && supabase) {
    const fileExt = file.name ? file.name.split('.').pop() : 'jpg'
    const cleanFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : `hijab_${Date.now()}.${fileExt}`
    const fileName = `${Date.now()}_${cleanFileName}`
    const filePath = `products/${fileName}`

    const { data, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Supabase product-images bucket upload error:', uploadError)
      throw new Error(`Supabase Storage upload error: ${uploadError.message}`)
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    if (urlData?.publicUrl) {
      return urlData.publicUrl
    }
  }

  // Fallback for local development when Supabase is not yet configured
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

// ----------------------------------------------------
// SUPABASE BACKEND DIAGNOSTICS & CATALOG SEEDER
// ----------------------------------------------------
export async function checkSupabaseStatus() {
  const status = {
    configured: supabaseConfigured,
    url: import.meta.env.VITE_SUPABASE_URL || 'Not provided',
    tables: {
      profiles: false,
      categories: false,
      products: false,
      product_images: false,
      orders: false,
      coupons: false,
      storage: false
    },
    counts: {
      categories: 0,
      products: 0,
      orders: 0,
      coupons: 0,
      profiles: 0
    },
    adminUser: null
  }

  if (!supabaseConfigured || !supabase) {
    return status
  }

  try {
    const [catRes, prodRes, ordRes, coupRes, profRes] = await Promise.allSettled([
      supabase.from('categories').select('id', { count: 'exact' }),
      supabase.from('products').select('id', { count: 'exact' }),
      supabase.from('orders').select('id', { count: 'exact' }),
      supabase.from('coupons').select('id', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' })
    ])

    if (catRes.status === 'fulfilled' && !catRes.value.error) {
      status.tables.categories = true
      status.counts.categories = catRes.value.count || catRes.value.data?.length || 0
    }
    if (prodRes.status === 'fulfilled' && !prodRes.value.error) {
      status.tables.products = true
      status.counts.products = prodRes.value.count || prodRes.value.data?.length || 0
    }
    if (ordRes.status === 'fulfilled' && !ordRes.value.error) {
      status.tables.orders = true
      status.counts.orders = ordRes.value.count || ordRes.value.data?.length || 0
    }
    if (coupRes.status === 'fulfilled' && !coupRes.value.error) {
      status.tables.coupons = true
      status.counts.coupons = coupRes.value.count || coupRes.value.data?.length || 0
    }
    if (profRes.status === 'fulfilled' && !profRes.value.error) {
      status.tables.profiles = true
      status.counts.profiles = profRes.value.count || profRes.value.data?.length || 0
    }

    // Check storage bucket
    const { data: buckets } = await supabase.storage.listBuckets()
    if (buckets && buckets.some(b => b.name === 'product-images')) {
      status.tables.storage = true
    }
  } catch (err) {
    console.warn('Diagnostics check error:', err)
  }

  return status
}

// 1-Click Seed Initial Pure Hijab Catalog to Supabase
export async function seedCatalogToSupabase() {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured in .env. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const results = { categories: 0, products: 0, coupons: 0 }

  // 1. Seed Categories
  for (const cat of initialCategories) {
    const slug = cat.id
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
    if (!existing) {
      await supabase.from('categories').insert({
        name: cat.name,
        slug,
        description: cat.description || ''
      })
      results.categories++
    }
  }

  // Fetch updated categories map
  const { data: dbCategories } = await supabase.from('categories').select('id, name')
  const catMap = {}
  dbCategories?.forEach(c => { catMap[c.name.toLowerCase()] = c.id })

  // 2. Seed Products
  for (const prod of initialProducts) {
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const { data: existing } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle()
    if (!existing) {
      const catId = catMap[prod.category.toLowerCase()] || null
      const { data: insertedProd, error } = await supabase
        .from('products')
        .insert({
          category_id: catId,
          name: prod.name,
          slug,
          sku: `NH-${prod.id.toUpperCase()}`,
          description: prod.description,
          price: prod.price,
          compare_at_price: prod.compareAt,
          stock: prod.stock,
          color: prod.color,
          fabric: prod.fabric,
          is_active: true,
          is_featured: prod.badge === 'Best Seller' || prod.badge === 'New Arrival'
        })
        .select()
        .single()

      if (!error && insertedProd) {
        await supabase.from('product_images').insert({
          product_id: insertedProd.id,
          image_url: prod.image,
          alt_text: prod.name,
          sort_order: 0
        })
        results.products++
      }
    }
  }

  // 3. Seed Coupons
  for (const coup of initialCoupons) {
    const { data: existing } = await supabase.from('coupons').select('id').eq('code', coup.code).maybeSingle()
    if (!existing) {
      await supabase.from('coupons').insert({
        code: coup.code,
        discount_type: coup.discount_type,
        discount_value: coup.discount_value,
        min_order_amount: coup.min_order_amount,
        max_discount: coup.max_discount,
        usage_limit: coup.usage_limit,
        is_active: coup.is_active
      })
      results.coupons++
    }
  }

  return results
}
