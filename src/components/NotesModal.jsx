import { useState } from 'react'

const ROOMMATES = ['Justin', 'Jake', 'Cayden', 'Mateo']

export default function NotesModal({ listing, onAddNote, onDeleteNote, onEditNote, onClose }) {
  const [author, setAuthor] = useState(ROOMMATES[0])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingTs, setEditingTs] = useState(null)
  const [editText, setEditText] = useState('')

  async function handleSaveEdit(ts) {
    if (!editText.trim()) return
    await onEditNote(listing.id, ts, editText.trim())
    setEditingTs(null)
    setEditText('')
  }

  async function handleAdd() {
    if (!text.trim()) return
    setBusy(true)
    await onAddNote(listing.id, author, text.trim())
    setText('')
    setBusy(false)
  }

  const INPUT = { padding: '8px 10px', background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 4, color: '#e8e6e0', fontSize: 13, outline: 'none', fontFamily: 'system-ui, sans-serif' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#141414', border: '1px solid #2a2a2a', borderRadius: 6,
        padding: '1.75rem', width: '100%', maxWidth: 440,
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 14, color: '#e8e6e0', fontFamily: '"DM Mono", monospace', marginBottom: 2 }}>notes</div>
            <div style={{ fontSize: 12, color: '#555', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{listing.address}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: '1rem' }}>
          {(!listing.notes || listing.notes.length === 0) ? (
            <div style={{ fontSize: 13, color: '#444', padding: '12px 0' }}>No notes yet. Be the first.</div>
          ) : (
            [...listing.notes].sort((a, b) => a.ts - b.ts).map((n, i) => (
              <div key={i} style={{
                padding: '10px 0',
                borderBottom: '1px solid #1e1e1e',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1c2e24', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 11, color: '#4a9e6e',
                  flexShrink: 0, fontFamily: '"DM Mono", monospace',
                }}>
                  {(n.author || 'anon').split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#4a9e6e', marginBottom: 3, fontFamily: '"DM Mono", monospace' }}>{n.author || 'anon'}</div>
                  {editingTs === n.ts ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(n.ts); if (e.key === 'Escape') setEditingTs(null) }}
                        style={{ flex: 1, padding: '4px 8px', background: '#1c1c1c', border: '1px solid #4a9e6e', borderRadius: 4, color: '#e8e6e0', fontSize: 13, outline: 'none' }}
                      />
                      <button onClick={() => handleSaveEdit(n.ts)} style={{ background: '#4a9e6e', border: 'none', borderRadius: 4, color: '#0f0f0f', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>save</button>
                      <button onClick={() => setEditingTs(null)} style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, color: '#555', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>cancel</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.5 }}>{n.text}</div>
                  )}
                </div>
                <button
                  onClick={() => { setEditingTs(n.ts); setEditText(n.text) }}
                  style={{ background: 'none', border: 'none', color: '#3a3a3a', cursor: 'pointer', fontSize: 13, padding: '0 2px', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4a9e6e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}
                >✎</button>
                <button
                  onClick={() => onDeleteNote(listing.id, n.ts)}
                  style={{ background: 'none', border: 'none', color: '#3a3a3a', cursor: 'pointer', fontSize: 14, padding: '0 2px', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#7a3a3a'}
                  onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}
                >✕</button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ ...INPUT, flexShrink: 0 }}
          >
            {ROOMMATES.map(r => <option key={r}>{r}</option>)}
          </select>
          <input
            style={{ ...INPUT, flex: 1 }}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add a note..."
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={busy || !text.trim()}
            style={{
              padding: '8px 14px', background: '#4a9e6e', border: '1px solid #4a9e6e',
              borderRadius: 4, color: '#0f0f0f', cursor: 'pointer',
              fontSize: 13, fontFamily: '"DM Mono", monospace',
              opacity: busy || !text.trim() ? 0.4 : 1,
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
