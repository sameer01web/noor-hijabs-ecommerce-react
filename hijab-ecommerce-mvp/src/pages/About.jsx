import React from 'react'
import { Feather, ShieldCheck, Heart, Sparkles, CheckCircle2, Award, Truck, Layers, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function About() {
  return (
    <main className="wrap about-page">
      <div className="about-hero">
        <div className="eyebrow">
          <Sparkles size={13} />
          <span>OUR MODEST HERITAGE & CRAFT</span>
        </div>
        <h1>Dedicated Exclusively to the Art of the Hijab.</h1>
        <p>
          At <strong>Noor Hijabs</strong>, we believe every Muslim woman deserves headwear that honors her faith and modesty without compromising on luxury, comfort, or personal grace. We do not sell generic apparel — our passion and craft is 100% focused on perfecting the hijab.
        </p>
      </div>

      <div className="about-values-grid">
        <div className="about-value-card">
          <div className="about-value-icon">
            <Feather size={26} />
          </div>
          <h2>Finest Global Fabrics</h2>
          <p>
            From cloud-soft Korean chiffon and breathable Turkish cotton voile to pure mulberry silk satin and textured georgette, our textiles are selected for optimum airflow, lightweight feel, and non-slip longevity.
          </p>
        </div>

        <div className="about-value-card">
          <div className="about-value-icon">
            <ShieldCheck size={26} />
          </div>
          <h2>Maxi Modest Dimensions</h2>
          <p>
            Every hijab in our catalog is cut to generous proportions (180 cm to 190 cm length), ensuring full coverage, versatile chest layering, and graceful drape without bunching or weighing down.
          </p>
        </div>

        <div className="about-value-card">
          <div className="about-value-icon">
            <Award size={26} />
          </div>
          <h2>Artisan Needlework</h2>
          <p>
            Our prints range from subtle botanical florals to regal Arabesque motifs, complemented by hand-stitched pearl borders and intricate scallop embroidery for your festive occasions and celebrations.
          </p>
        </div>
      </div>

      {/* The Noor Quality Promise Box */}
      <div className="about-promise-box">
        <div className="eyebrow">THE NOOR PROMISE</div>
        <h2>Designed with Care for Every Muslimah</h2>

        <div className="promise-list">
          <div className="promise-item">
            <CheckCircle2 size={22} />
            <div>
              <strong>100% Hijabs Only — Zero Distractions</strong>
              <span>We specialize purely in modest headwear, curating textures and designs tailored to different hair types, seasons, and occasions.</span>
            </div>
          </div>

          <div className="promise-item">
            <CheckCircle2 size={22} />
            <div>
              <strong>Gentle on Hair Roots & Sensitive Scalps</strong>
              <span>Smooth, breathable weaves that minimize static friction, hair breakage, and scalp tension during long wearing hours.</span>
            </div>
          </div>

          <div className="promise-item">
            <CheckCircle2 size={22} />
            <div>
              <strong>Ethical Craftsmanship & Finished Hems</strong>
              <span>Every single hijab passes rigorous quality checks for even stitching, durable colorfast dyes, and secure borders.</span>
            </div>
          </div>
        </div>

        <div className="about-cta-container">
          <Link to="/shop" className="btn primary">
            Explore the Hijab Collection <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  )
}