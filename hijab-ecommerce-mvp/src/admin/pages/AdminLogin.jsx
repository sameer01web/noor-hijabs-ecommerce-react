import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Database
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import '../admin.css'

export default function AdminLogin() {
  const { login, error: authError, supabaseConfigured } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid admin credentials or role unauthorized.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-glow-bg" />

      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <Sparkles size={12} />
            <span>STAFF & CURATION ACCESS</span>
          </div>
          <h1 className="admin-login-title">
            NOOR <span>HIJABS</span>
          </h1>
          <p className="admin-login-subtitle">
            Haute Modestie Administrative Portal
          </p>
        </div>

        {!supabaseConfigured && (
          <div className="admin-login-alert" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', marginBottom: 20 }}>
            <Database size={18} />
            <span>Supabase credentials needed in .env to connect to database.</span>
          </div>
        )}

        {(error || authError) && (
          <div className="admin-login-alert error">
            <AlertCircle size={18} />
            <span>{error || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Admin Email Address</label>
            <div className="admin-input-wrapper">
              <Mail size={16} className="admin-input-icon" />
              <input
                type="email"
                required
                className="admin-input"
                placeholder="admin@noorhijabs.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>Password</label>
            <div className="admin-input-wrapper">
              <Lock size={16} className="admin-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="admin-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Verifying Admin Permissions...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <Link to="/" className="admin-login-footer-link">
          &larr; Back to Customer Store
        </Link>
      </div>
    </div>
  )
}
