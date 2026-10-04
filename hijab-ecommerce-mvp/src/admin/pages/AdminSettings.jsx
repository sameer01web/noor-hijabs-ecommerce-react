import React, { useState, useEffect } from 'react'
import {
  Settings,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Shield,
  UploadCloud,
  Sparkles,
  Server,
  Layers,
  Package,
  Boxes
} from 'lucide-react'
import { checkSupabaseStatus, seedCatalogToSupabase } from '../../lib/dataService'
import { useAdminAuth } from '../../context/AdminAuthContext'
import '../admin.css'

export default function AdminSettings() {
  const { adminUser, supabaseConfigured } = useAdminAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState(null)
  const [copiedSql, setCopiedSql] = useState(false)

  useEffect(() => {
    runCheck()
  }, [])

  async function runCheck() {
    setLoading(true)
    try {
      const res = await checkSupabaseStatus()
      setStatus(res)
    } catch (e) {
      console.error('Status check error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedResult(null)
    try {
      const res = await seedCatalogToSupabase()
      setSeedResult({
        success: true,
        message: `Seeded ${res.categories} categories, ${res.products} hijab products, and ${res.coupons} coupons to Supabase!`
      })
      await runCheck()
    } catch (err) {
      setSeedResult({
        success: false,
        message: err.message || 'Failed to seed to Supabase.'
      })
    } finally {
      setSeeding(false)
    }
  }

  const adminSql = `update public.profiles\nset role = 'admin'\nwhere id = '${adminUser?.id || 'YOUR-AUTH-USER-UUID'}';`

  const handleCopySql = () => {
    navigator.clipboard?.writeText(adminSql)
    setCopiedSql(true)
    setTimeout(() => setCopiedSql(false), 2000)
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h1>Backend Diagnostics & Store Settings</h1>
          <p>Supabase connection health, schema table status, RLS admin roles, and catalog synchronizer</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={runCheck}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'admin-spin' : ''} />
            <span>Re-Check Status</span>
          </button>
        </div>
      </div>

      {/* Supabase Status Banner */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: status?.configured ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: status?.configured ? '#34d399' : '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Database size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, color: '#fff', marginBottom: 2 }}>
                {status?.configured ? 'Supabase Backend Connected' : 'Running in Local / Mock Mode'}
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                {status?.configured
                  ? `Active connection to ${status.url}`
                  : 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not configured yet in .env.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`admin-badge ${status?.configured ? 'status-active' : 'status-pending'}`} style={{ padding: '6px 14px', fontSize: 13 }}>
              {status?.configured ? '● LIVE POSTGRES' : '○ PERSISTENT LOCALSTORAGE'}
            </span>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">
            <Server size={18} style={{ color: '#d4af37' }} />
            <span>Supabase PostgreSQL Tables & RLS Status</span>
          </div>
        </div>

        <div className="admin-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { name: 'public.profiles', count: status?.counts?.profiles, active: status?.tables?.profiles },
              { name: 'public.categories', count: status?.counts?.categories, active: status?.tables?.categories },
              { name: 'public.products', count: status?.counts?.products, active: status?.tables?.products },
              { name: 'public.orders', count: status?.counts?.orders, active: status?.tables?.orders },
              { name: 'public.coupons', count: status?.counts?.coupons, active: status?.tables?.coupons },
              { name: 'storage: product-images', count: status?.tables?.storage ? 'Ready' : 'Pending', active: status?.tables?.storage }
            ].map((tbl) => (
              <div
                key={tbl.name}
                style={{
                  background: '#12151e',
                  border: '1px solid #2b3142',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{tbl.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {status?.configured ? `${tbl.count ?? 0} records` : 'Local fallback'}
                  </div>
                </div>

                <div>
                  {status?.configured ? (
                    tbl.active ? (
                      <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                    ) : (
                      <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                    )
                  ) : (
                    <span style={{ fontSize: 11, color: '#64748b' }}>Offline</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Seeder to Supabase */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">
            <UploadCloud size={18} style={{ color: '#d4af37' }} />
            <span>1-Click Seed Initial Pure Hijab Catalog to Supabase</span>
          </div>
        </div>

        <div className="admin-card-body">
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 16, maxWidth: 800, lineHeight: 1.5 }}>
            This utility pushes the curated 12 pure hijab products (Korean Chiffon, Mulberry Silk, Matte Georgette, Turkish Cotton Voile), 10 hijab categories, and promotional coupons directly into your live Supabase database if they are not already present.
          </p>

          {seedResult && (
            <div
              className={`admin-login-alert ${seedResult.success ? 'status-active' : 'error'}`}
              style={{ marginBottom: 16 }}
            >
              {seedResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{seedResult.message}</span>
            </div>
          )}

          <button
            type="button"
            className="admin-btn admin-btn-gold"
            disabled={seeding || !status?.configured}
            onClick={handleSeed}
          >
            <Sparkles size={16} />
            <span>{seeding ? 'Seeding Catalog...' : 'Seed Catalog to Supabase Database'}</span>
          </button>

          {!status?.configured && (
            <span style={{ fontSize: 12, color: '#f59e0b', marginLeft: 12 }}>
              (Requires active Supabase credentials in .env)
            </span>
          )}
        </div>
      </div>

      {/* Admin Role Promotion Helper */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">
            <Shield size={18} style={{ color: '#d4af37' }} />
            <span>Promote User to Admin in Supabase SQL Editor</span>
          </div>
        </div>

        <div className="admin-card-body">
          <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 14 }}>
            In production, to promote an authenticated Supabase user account to the administrator role, run this query in your Supabase SQL Editor:
          </p>

          <div style={{ position: 'relative', background: '#0c0e14', border: '1px solid #2b3142', borderRadius: 8, padding: 16 }}>
            <pre style={{ color: '#34d399', fontSize: 13, fontFamily: 'monospace', margin: 0 }}>
              {adminSql}
            </pre>
            <button
              type="button"
              onClick={handleCopySql}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              style={{ position: 'absolute', top: 10, right: 10 }}
            >
              {copiedSql ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
