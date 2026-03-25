import { useState } from 'react'

const FIELD = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 11, color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: '"DM Mono", monospace' }}>{label}</label>
    {children}
  </div>
)

const INPUT_STYLE = {
  padding: '8px 10px',
  background: '#1c1c1c',
  border: '1px solid #2a2a2a',
  borderRadius: 4,
  color: '#e8e6e0',
  fontSize: 13,
  fontFamily: 'system-ui, sans-serif',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

export default function AddListingModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    address: '', price: '', beds: '', baths: '', sqft: '',
    neighborhood: '', available_date: '', url: '', initial_note: ''
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.address.trim()) { setErr('Address is required.'); return }
    setBusy(true)
    setErr('')
    try {
      await onAdd({
        address: form.address.trim(),
        price: form.price ? parseInt(form.price) : null,
        beds: form.beds ? parseInt(form.beds) : null,
        baths: form.baths ? parseFloat(form.baths) : null,
        sqft: form.sqft ? parseInt(form.sqft) : null,
        neighborhood: form.neighborhood.trim(),
        available_date: form.available_date || null,
        url: form.url.trim(),
        status: 'new',
        notes: form.initial_note.trim()
          ? [{ author: 'You', text: form.initial_note.trim(), ts: Date.now() }]
          : [],
        votes: { P1: false, P2: false, P3: false, P4: false },
      })
      onClose()
    } catch (e) {
      setErr(e.message)
    }
    setBusy(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#141414', border: '1px solid #2a2a2a', borderRadius: 6,
        padding: '1.75rem', width: '100%', maxWidth: 500,
        maxHeight: '90vh', overflowY: 'auto',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: 16, color: '#e8e6e0', fontFamily: '"DM Mono", monospace' }}>add listing</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FIELD label="Address *">
            <input style={INPUT_STYLE} value={form.address} onChange={e => set('address', e.target.value)} placeholder="1842 York St, Cheesman Park" />
          </FIELD>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FIELD label="Monthly rent ($)">
              <input style={INPUT_STYLE} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="2800" />
            </FIELD>
            <FIELD label="Neighborhood">
              <input style={INPUT_STYLE} value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} placeholder="Capitol Hill" />
            </FIELD>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <FIELD label="Beds">
              <input style={INPUT_STYLE} type="number" value={form.beds} onChange={e => set('beds', e.target.value)} placeholder="3" />
            </FIELD>
            <FIELD label="Baths">
              <input style={INPUT_STYLE} type="number" step="0.5" value={form.baths} onChange={e => set('baths', e.target.value)} placeholder="2" />
            </FIELD>
            <FIELD label="Sq ft">
              <input style={INPUT_STYLE} type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} placeholder="1200" />
            </FIELD>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FIELD label="Available date">
              <input style={INPUT_STYLE} type="date" value={form.available_date} onChange={e => set('available_date', e.target.value)} />
            </FIELD>
            <FIELD label="Listing URL">
              <input style={INPUT_STYLE} value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://zillow.com/..." />
            </FIELD>
          </div>

          <FIELD label="First impression (optional)">
            <textarea
              style={{ ...INPUT_STYLE, minHeight: 70, resize: 'vertical', lineHeight: 1.5 }}
              value={form.initial_note}
              onChange={e => set('initial_note', e.target.value)}
              placeholder="What stood out? Things to look into..."
            />
          </FIELD>
        </div>

        {err && <div style={{ fontSize: 12, color: '#c0614a', marginTop: 12 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, color: '#666', cursor: 'pointer', fontSize: 13 }}>
            cancel
          </button>
          <button onClick={handleSave} disabled={busy} style={{
            padding: '8px 20px', background: '#4a9e6e', border: '1px solid #4a9e6e',
            borderRadius: 4, color: '#0f0f0f', cursor: busy ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: '"DM Mono", monospace', opacity: busy ? 0.6 : 1,
          }}>
            {busy ? 'saving...' : '→ save'}
          </button>
        </div>
      </div>
    </div>
  )
}
