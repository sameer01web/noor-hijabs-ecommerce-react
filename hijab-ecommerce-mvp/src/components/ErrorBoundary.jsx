import React from 'react'
import { RotateCcw, Home, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Noor Hijabs Error Boundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/shop'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          background: '#faf8f5',
          color: '#2d2422',
          fontFamily: 'inherit'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(197, 160, 89, 0.15)',
            color: '#96783c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={32} />
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#96783c',
            marginBottom: '0.5rem'
          }}>
            NOOR HAUTE MODESTIE
          </span>

          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
            color: '#1a1615'
          }}>
            Something went wrong loading this collection
          </h1>

          <p style={{
            maxWidth: 500,
            color: '#665c56',
            lineHeight: 1.6,
            marginBottom: '2rem',
            fontSize: '0.95rem'
          }}>
            We encountered a temporary hiccup while rendering this hijab selection. Please refresh or explore our full collection.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2d2422',
                color: '#fff',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              <RotateCcw size={16} /> Reload Collection
            </button>

            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#fff',
                color: '#2d2422',
                borderRadius: '8px',
                border: '1px solid #e2dad2',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              <Home size={16} /> Return to Home
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
