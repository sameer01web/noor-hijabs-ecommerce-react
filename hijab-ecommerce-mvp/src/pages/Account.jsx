import React, { useState } from 'react'
import { User, Lock, Mail, Phone, Package, Heart, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Account() {
  const [mode, setMode] = useState('login')
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoggedIn(true)
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setEmail('')
    setPassword('')
  }

  return (
    <main className="wrap auth-page">
      {loggedIn ? (
        <div className="account-dashboard">
          <div className="account-header">
            <div className="account-avatar">
              <User size={32} />
            </div>
            <div>
              <div className="eyebrow">WELCOME BACK</div>
              <h1>{fullName || 'Fatima Zahra'}</h1>
              <p className="account-email">{email || 'fatima.zahra@example.com'}</p>
            </div>
            <button type="button" className="btn outline logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-head">
                <Package size={20} />
                <h3>Recent Orders</h3>
              </div>
              <div className="order-history-list">
                <div className="order-history-item">
                  <div>
                    <strong>Order #NH-20260920-4491</strong>
                    <p>Vintage Botanical Chiffon Hijab (Sage) × 1</p>
                    <span className="order-date">Placed on Sept 20, 2026</span>
                  </div>
                  <div className="order-status-tag delivered">Delivered</div>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-head">
                <Sparkles size={20} />
                <h3>Noor VIP Sisterhood Club</h3>
              </div>
              <p className="vip-text">You have <strong>120 Noor Reward Points</strong> available for your next hijab order.</p>
              <Link to="/shop" className="btn primary">
                Redeem on New Hijabs <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-header">
            <div className="eyebrow">NOOR BOUTIQUE ACCOUNT</div>
            <h1>{mode === 'login' ? 'Welcome to Noor Hijabs' : 'Join Our Sisterhood'}</h1>
            <p>
              {mode === 'login'
                ? 'Sign in to access your order history, delivery addresses, and saved favorite hijabs.'
                : 'Create an account for 1-click checkout, private collection drops, and exclusive rewards.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="form-field">
                <label>Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Fatima Khan"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <input
                required
                type="email"
                placeholder="e.g. fatima@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button className="btn primary full" type="submit">
              {mode === 'login' ? 'Sign In to My Account' : 'Create My Account & Get 10% Off'}
            </button>
          </form>

          {mode === 'login' && (
            <button type="button" className="text-link forgot-pass-btn">
              Forgot password?
            </button>
          )}

          <div className="auth-switch">
            {mode === 'login' ? 'New to Noor Hijabs?' : 'Already have an account?'}
            <button
              type="button"
              className="switch-btn"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}