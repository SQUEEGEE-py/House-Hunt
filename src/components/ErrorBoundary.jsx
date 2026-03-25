import { Component } from 'react'

const MONO = '"DM Mono", "Courier New", monospace'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0f0f0f',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: MONO, padding: '2rem',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 12, color: '#c0614a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
              something went wrong
            </div>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 24, lineHeight: 1.6 }}>
              {this.state.error.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 20px', background: 'none',
                border: '1px solid #2a2a2a', borderRadius: 4,
                color: '#666', cursor: 'pointer', fontSize: 12, fontFamily: MONO,
              }}
            >
              reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
