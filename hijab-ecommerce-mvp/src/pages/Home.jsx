import React, { useState, useEffect } from 'react'
import { ArrowRight, Check, Sparkles, ShieldCheck, Truck, Feather, Heart, Star, Compass, Layers, Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products as initialProducts, categories as initialCategories, formatINR } from '../lib/data'
import { getProducts, getCategories } from '../lib/dataService'

export default function Home({ wishlist, onWishlist, onAdd }) {
  const [productList, setProductList] = useState(initialProducts)
  const [categoryList, setCategoryList] = useState(initialCategories)
  const [activeFabricTab, setActiveFabricTab] = useState('chiffon')

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [p, c] = await Promise.all([getProducts(), getCategories()])
        if (p && p.length > 0) {
          setProductList(p.filter(prod => prod.is_active !== false))
        }
        if (c && c.length > 0) {
          setCategoryList(c.filter(cat => cat.is_active !== false))
        }
      } catch (err) {
        console.warn('Home catalog load error:', err)
      }
    }
    loadHomeData()
  }, [])

  const featuredBestsellers = (productList || [])
    .filter(p => p && (
      (typeof p.badge === 'string' && p.badge.toLowerCase().includes('best')) ||
      (Array.isArray(p.categories) && p.categories.some(c => typeof c === 'string' && c.toLowerCase().includes('best'))) ||
      (typeof p.category === 'string' && p.category.toLowerCase().includes('best'))
    ))
    .slice(0, 4)

  const newArrivals = (productList || [])
    .filter(p => p && (
      (typeof p.badge === 'string' && p.badge.toLowerCase().includes('new')) ||
      (Array.isArray(p.categories) && p.categories.some(c => typeof c === 'string' && c.toLowerCase().includes('new'))) ||
      (typeof p.category === 'string' && p.category.toLowerCase().includes('new'))
    ))
    .slice(0, 4)

  const quickCategories = [
    { name: 'Printed Hijabs', tag: 'Printed Hijabs', desc: 'Artisan floral & botanical prints', count: '12+ Designs', bg: '#fbf5ed' },
    { name: 'Plain Hijabs', tag: 'Plain Hijabs', desc: 'Essential everyday solids & neutrals', count: '18+ Shades', bg: '#f5f0eb' },
    { name: 'Chiffon Hijabs', tag: 'Chiffon Hijabs', desc: 'Featherlight with effortless drape', count: 'Lightweight', bg: '#f8f4f0' },
    { name: 'Georgette Hijabs', tag: 'Georgette Hijabs', desc: 'Non-slip matte textured weave', count: 'Structured', bg: '#f4ede6' },
    { name: 'Mulberry Silk', tag: 'Silk Hijabs', desc: 'Lustrous satin & crepe occasion wear', count: 'Pure Luxury', bg: '#faf5f0' },
    { name: 'Embroidered', tag: 'Embroidered Hijabs', desc: 'Hand-beaded pearl & lace borders', count: 'Handcrafted', bg: '#f6f1ec' }
  ]

  const fabricGuides = {
    chiffon: {
      title: 'Korean Bubble Chiffon',
      subtitle: 'Featherlight Flow & Cloud-Like Softness',
      desc: 'Our Korean chiffon is specifically woven with micro-texture to prevent the slippage common with low-grade chiffons. It offers an airy, fluid drape with a natural bounce that frames the face effortlessly.',
      drape: 'Fluid & Soft',
      opacity: '85% (Semi-Opaque)',
      occasions: 'Daily Wear, Work, Casual Brunches'
    },
    georgette: {
      title: 'High-Density Matte Georgette',
      subtitle: 'Structured, Non-Slip & Wrinkle-Resistant',
      desc: 'Heavier than chiffon with a pebbled matte texture, our georgette stays firmly in place throughout the day with zero or minimal pins. Perfect for creating sharp, structured front folds.',
      drape: 'Structured & Rich',
      opacity: '100% (Fully Opaque)',
      occasions: 'Office, University, Long Outdoor Days'
    },
    silk: {
      title: 'Pure Mulberry Silk & Satin',
      subtitle: 'Hypoallergenic Luxury for Hair & Skin',
      desc: 'Crafted from high-grade silk fibers that reduce friction against hair roots, preventing breakage and frizz. Features a luminous glossy sheen on the face and a textured reverse side.',
      drape: 'Lustrous & Regal',
      opacity: '100% (Non-Sheer)',
      occasions: 'Weddings, Eid, Galas, Celebrations'
    },
    cotton: {
      title: '100% Organic Turkish Cotton Voile',
      subtitle: 'All-Day Breathability & Natural Comfort',
      desc: 'Spun from natural, unbleached Turkish cotton fibers for maximum airflow in warm climates. Softens with every wash and provides full, pin-free grip.',
      drape: 'Relaxed & Breathable',
      opacity: '100% (Full Coverage)',
      occasions: 'Hot Summer Days, Travel, Everyday Modesty'
    }
  }

  const testimonials = [
    {
      name: 'Dr. Ayesha Siddiqui',
      city: 'Mumbai',
      quote: 'The Mulberry Silk Hijab has the most breathtaking luster without being slippery. The 185cm maxi length is so generous and stays in place through 12-hour hospital shifts.',
      product: 'Royal Heritage Embroidered Silk Hijab',
      rating: 5
    },
    {
      name: 'Fatima Zahra Khan',
      city: 'Delhi',
      quote: 'Finally a brand that truly understands pure hijab fabrics! The Korean chiffon has zero static, gorgeous earthy prints, and washes beautifully without pilling.',
      product: 'Vintage Botanical Printed Chiffon Hijab',
      rating: 5
    },
    {
      name: 'Zoya Merchant',
      city: 'Bangalore',
      quote: 'The matte georgette in Warm Mocha is my absolute daily holy grail. Perfect opacity, zero pins needed, and packaging felt like opening a luxury Parisian gift.',
      product: 'Everyday Matte Georgette Hijab',
      rating: 5
    }
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap hero-content">
          <div className="eyebrow">
            <Sparkles size={13} />
            <span>NOOR HAUTE MODESTIE · 100% PURE HIJAB BOUTIQUE</span>
          </div>

          <h1>
            Modest Luxury,<br />
            <i>Tailored in Pure Grace.</i>
          </h1>

          <p>
            Curated exclusively for Muslim women seeking uncompromising quality. Discover featherlight Korean chiffon, pure mulberry silk, textured georgette, and artisan prints engineered for generous maxi coverage and all-day comfort.
          </p>

          <div className="hero-actions">
            <Link className="btn primary" to="/shop">
              Shop Hijab Collection <ArrowRight size={17} />
            </Link>
            <Link className="btn outline" to="/shop?category=Printed%20Hijabs">
              Explore Printed Hijabs
            </Link>
          </div>

          <div className="hero-badges-row">
            <div className="hero-badge-item">
              <Check size={14} /> <span>100% Pure Hijabs Only</span>
            </div>
            <div className="hero-badge-item">
              <Check size={14} /> <span>Generous 185 cm Maxi</span>
            </div>
            <div className="hero-badge-item">
              <Check size={14} /> <span>Non-Slip Textures</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-card">
            <div className="hero-card-tag">NEW COLLECTION DROP</div>
            <strong>
              Korean Chiffon.<br />
              Mulberry Silk.<br />
              Turkish Voile.
            </strong>
            <p className="hero-card-sub">Handcrafted hems with zero-slip engineering.</p>
            <Link to="/shop?category=New%20Arrivals" className="hero-card-link">
              Explore New Drops <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Benefits Ribbon */}
      <section className="benefits">
        <div className="wrap benefit-grid">
          <div>
            <Feather />
            <div>
              <b>Featherlight & Breathable</b>
              <span>Ultra-soft cooling airflow</span>
            </div>
          </div>
          <div>
            <ShieldCheck />
            <div>
              <b>100% Modest Coverage</b>
              <span>Generous 180–190 cm lengths</span>
            </div>
          </div>
          <div>
            <Truck />
            <div>
              <b>Free Delivery & COD</b>
              <span>On prepaid & COD orders &gt; ₹999</span>
            </div>
          </div>
          <div>
            <Sparkles />
            <div>
              <b>Artisan Craftsmanship</b>
              <span>Fine hem borders & pure dyes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hijab Categories Showcase */}
      <section className="section wrap category-section">
        <div className="section-head">
          <div>
            <div className="eyebrow">EXPLORE BY FABRIC & DESIGN</div>
            <h2>Shop by Hijab Style</h2>
          </div>
          <Link to="/shop" className="text-link">
            All collections <ArrowRight size={16} />
          </Link>
        </div>

        <div className="hijab-cat-grid">
          {quickCategories.map(c => (
            <Link
              key={c.name}
              to={`/shop?category=${encodeURIComponent(c.tag)}`}
              className="hijab-cat-card"
              style={{ backgroundColor: c.bg }}
            >
              <div className="cat-card-header">
                <span className="cat-count-badge">{c.count}</span>
                <span className="cat-arrow-icon"><ArrowRight size={15} /></span>
              </div>
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestselling Hijabs Grid */}
      <section className="section wrap bestsellers-section">
        <div className="section-head">
          <div>
            <div className="eyebrow">COMMUNITY FAVORITES</div>
            <h2>Bestselling Hijabs</h2>
          </div>
          <Link to="/shop?category=Best%20Sellers" className="text-link">
            View all bestsellers <ArrowRight size={16} />
          </Link>
        </div>

        <div className="product-grid">
          {featuredBestsellers.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              wishlisted={wishlist.includes(p.id)}
              onWishlist={onWishlist}
              onAdd={onAdd}
            />
          ))}
        </div>
      </section>

      {/* Interactive Fabric Standard Guide */}
      <section className="section fabric-guide-section">
        <div className="wrap">
          <div className="section-head center-head">
            <div className="eyebrow">THE NOOR QUALITY STANDARD</div>
            <h2>Know Your Hijab Fabric</h2>
            <p className="section-subtext">Every hijab style is thoughtfully calibrated for its weight, opacity, and non-slip hold.</p>
          </div>

          <div className="fabric-guide-tabs">
            <button
              className={activeFabricTab === 'chiffon' ? 'active' : ''}
              onClick={() => setActiveFabricTab('chiffon')}
            >
              Korean Chiffon
            </button>
            <button
              className={activeFabricTab === 'georgette' ? 'active' : ''}
              onClick={() => setActiveFabricTab('georgette')}
            >
              Matte Georgette
            </button>
            <button
              className={activeFabricTab === 'silk' ? 'active' : ''}
              onClick={() => setActiveFabricTab('silk')}
            >
              Mulberry Silk
            </button>
            <button
              className={activeFabricTab === 'cotton' ? 'active' : ''}
              onClick={() => setActiveFabricTab('cotton')}
            >
              Turkish Cotton
            </button>
          </div>

          <div className="fabric-guide-card">
            {(() => {
              const currentGuide = fabricGuides[activeFabricTab] || fabricGuides.chiffon
              const catParam = activeFabricTab === 'silk' ? 'Silk Hijabs' :
                activeFabricTab === 'chiffon' ? 'Chiffon Hijabs' :
                activeFabricTab === 'georgette' ? 'Georgette Hijabs' : 'Cotton Hijabs'

              return (
                <div className="guide-info">
                  <span className="guide-tag">FABRIC FOCUS</span>
                  <h3>{currentGuide.title}</h3>
                  <p className="guide-subtitle">{currentGuide.subtitle}</p>
                  <p className="guide-desc">{currentGuide.desc}</p>

                  <div className="guide-specs-row">
                    <div className="guide-spec">
                      <span className="spec-name">Drape Style</span>
                      <strong className="spec-val">{currentGuide.drape}</strong>
                    </div>
                    <div className="guide-spec">
                      <span className="spec-name">Opacity Rating</span>
                      <strong className="spec-val">{currentGuide.opacity}</strong>
                    </div>
                    <div className="guide-spec">
                      <span className="spec-name">Ideal Occasions</span>
                      <strong className="spec-val">{currentGuide.occasions}</strong>
                    </div>
                  </div>

                  <div className="guide-cta-row">
                    <Link to={`/shop?category=${encodeURIComponent(catParam)}`} className="btn primary">
                      Browse {currentGuide.title} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Editorial Drape Showcase */}
      <section className="editorial">
        <div className="wrap editorial-inner">
          <div className="editorial-text">
            <div className="eyebrow">EFFORTLESS ALL-DAY STYLING</div>
            <h2>
              Zero Slip.<br />
              Graceful Volume.<br />
              Breathable Wear.
            </h2>
            <p>
              We believe a hijab should give you peace of mind from Fajr to Isha. That is why our dimensions are calibrated to 185 cm length — providing effortless front and chest coverage with smooth pleats that do not slide or feel bulky.
            </p>
            <div className="editorial-actions">
              <Link className="btn primary" to="/shop?category=Silk%20Hijabs">
                Explore Silk & Satin
              </Link>
              <Link className="btn outline" to="/shop?category=Printed%20Hijabs">
                View Artisan Prints
              </Link>
            </div>
          </div>

          <div className="editorial-card-wrapper">
            <div className="editorial-shape">
              <span>
                100%<br />
                PURE<br />
                HIJABS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="section wrap new-arrivals-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">LATEST RELEASES</div>
              <h2>New Seasonal Drops</h2>
            </div>
            <Link to="/shop?category=New%20Arrivals" className="text-link">
              View all new drops <ArrowRight size={16} />
            </Link>
          </div>
          <div className="product-grid">
            {newArrivals.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted={wishlist.includes(p.id)}
                onWishlist={onWishlist}
                onAdd={onAdd}
              />
            ))}
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <section className="section wrap testimonials-section">
        <div className="section-head center-head">
          <div className="eyebrow">VOICES OF OUR SISTERHOOD</div>
          <h2>Loved by Muslim Women Across India</h2>
          <p className="section-subtext">Over 10,000+ hijabs delivered with 4.9-star average satisfaction.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, idx) => (
            <div className="testimonial-card" key={idx}>
              <div className="test-stars">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="test-quote">"{t.quote}"</p>
              <div className="test-author">
                <strong>{t.name}</strong>
                <span>{t.city} · Verified Customer</span>
              </div>
              <div className="test-product-tag">
                <Sparkles size={12} />
                <span>{t.product}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Promo Card */}
      <section className="newsletter">
        <div className="wrap newsletter-card">
          <div className="newsletter-badge">
            <Gift size={16} />
            <span>EXCLUSIVE WELCOME OFFER</span>
          </div>
          <h2>Claim 10% Off Your First Hijab</h2>
          <p>Join the Noor Sisterhood to receive private drop alerts, styling masterclasses, and instant discount code <strong>NOOR10</strong>.</p>
          <form onSubmit={e => e.preventDefault()} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address..."
              aria-label="Email address for discount"
              required
            />
            <button className="btn primary" type="submit">
              Get 10% Discount
            </button>
          </form>
          <div className="newsletter-terms">No spam. Only modest styling inspiration & special offers.</div>
        </div>
      </section>
    </>
  )
}