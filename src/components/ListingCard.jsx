const STATUS_COLORS = {
  new:     { bg: '#1a2a1a', text: '#4a9e6e', border: '#2a3e2a' },
  tour:    { bg: '#1a2233', text: '#5b8dd9', border: '#2a3355' },
  applied: { bg: '#2a2210', text: '#c8962a', border: '#3a3010' },
  pass:    { bg: '#222',    text: '#555',    border: '#2a2a2a' },
}

const VOTERS = ['P1', 'P2', 'P3', 'P4']
const VOTER_LABELS = ['Person 1', 'Person 2', 'Person 3', 'Person 4']

import { useEffect } from 'react'

export default function ListingCard({ listing, onUpdate, onDelete, onOpenNotes, onToggleVote, onSetRating }) {
  const sc = STATUS_COLORS[listing.status] || STATUS_COLORS.new
  const voteCount = Object.values(listing.votes || {}).filter(Boolean).length
  const lastNote = listing.notes?.length ? listing.notes[listing.notes.length - 1] : null

  useEffect(() => {
    if (!listing.image_url && listing.url) {
      fetch(`https://api.microlink.io/?url=${encodeURIComponent(listing.url)}`)
        .then(r => r.json())
        .then(data => {
          const imageUrl = data?.data?.image?.url
          if (imageUrl) onUpdate(listing.id, { image_url: imageUrl })
        })
        .catch(() => {})
    }
    if (listing.lat == null && listing.address) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.address)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'DenverHouseHunt/1.0' }
      })
        .then(r => r.json())
        .then(data => {
          if (data[0]) onUpdate(listing.id, { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
        })
        .catch(() => {})
    }
  }, [listing.id])

  return (
    <div style={{
      background: '#141414',
      border: '1px solid #1e1e1e',
      borderRadius: 6,
      padding: '1rem 1.25rem',
      fontFamily: 'system-ui, sans-serif',
      transition: 'border-color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {listing.url
            ? <a href={listing.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: '#e8e6e0', fontWeight: 500, marginBottom: 2, display: 'block', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4a9e6e'}
                onMouseLeave={e => e.currentTarget.style.color = '#e8e6e0'}
              >{listing.address} ↗</a>
            : <div style={{ fontSize: 14, color: '#e8e6e0', fontWeight: 500, marginBottom: 2 }}>{listing.address}</div>
          }
          {listing.neighborhood && (
            <div style={{ fontSize: 12, color: '#555', fontFamily: '"DM Mono", monospace' }}>{listing.neighborhood}</div>
          )}
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 15, color: '#4a9e6e', fontFamily: '"DM Mono", monospace', fontWeight: 500 }}>
            {listing.price ? `$${listing.price.toLocaleString()}/mo` : '—'}
          </div>
          {listing.price && (
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>
              ${Math.round(listing.price / 4).toLocaleString()}/person
            </div>
          )}
        </div>
      </div>

      {/* Listing image */}
      {listing.image_url && (
        <div style={{ marginBottom: 10, borderRadius: 4, overflow: 'hidden' }}>
          <img
            src={listing.image_url}
            alt={listing.address}
            style={{ width: '40%', display: 'block', borderRadius: 4 }}
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}

      {/* Star ratings */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        {VOTERS.map((v) => {
          const rating = listing.ratings?.[v] ?? 0
          return (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ fontSize: 10, color: '#444', fontFamily: '"DM Mono", monospace', width: 18 }}>{v}</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => onSetRating(listing.id, v, rating === star ? null : star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px', fontSize: 13, color: star <= rating ? '#c8962a' : '#2a2a2a', lineHeight: 1 }}
                >★</button>
              ))}
            </div>
          )
        })}
      </div>

      {/* Meta badges */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {listing.beds && <Chip>{listing.beds} bed</Chip>}
        {listing.baths && <Chip>{listing.baths} bath</Chip>}
        {listing.sqft && <Chip>{listing.sqft.toLocaleString()} sqft</Chip>}
        {listing.available_date && (
          <Chip>avail {new Date(listing.available_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Chip>
        )}
        <span style={{
          fontSize: 11, padding: '3px 8px', borderRadius: 20,
          background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
          fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em',
        }}>
          {listing.status}
        </span>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {/* Vote buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {VOTERS.map((v, i) => (
            <button
              key={v}
              onClick={() => onToggleVote(listing.id, v)}
              title={`${VOTER_LABELS[i]} vote`}
              style={{
                width: 26, height: 26, borderRadius: '50%',
                border: `1px solid ${listing.votes?.[v] ? '#4a9e6e' : '#2a2a2a'}`,
                background: listing.votes?.[v] ? '#1c2e24' : '#1a1a1a',
                color: listing.votes?.[v] ? '#4a9e6e' : '#444',
                fontSize: 10, cursor: 'pointer', fontFamily: '"DM Mono", monospace',
                transition: 'all 0.15s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: '#444', fontFamily: '"DM Mono", monospace' }}>
          {voteCount}/4 want to tour
        </span>

        {/* Last note preview */}
        {lastNote && (
          <div style={{ flex: 1, fontSize: 12, color: '#555', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
            <span style={{ color: '#3a7a55' }}>{(lastNote.author || 'anon').split(' ')[0]}:</span> {lastNote.text}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', flexShrink: 0 }}>
          <select
            value={listing.status}
            onChange={e => onUpdate(listing.id, { status: e.target.value })}
            style={{
              fontSize: 11, padding: '4px 6px', background: '#1a1a1a',
              border: '1px solid #2a2a2a', borderRadius: 4, color: '#888',
              cursor: 'pointer', fontFamily: '"DM Mono", monospace',
            }}
          >
            <option value="new">new</option>
            <option value="tour">tour it</option>
            <option value="applied">applied</option>
            <option value="pass">pass</option>
          </select>
          <ActionBtn onClick={() => onOpenNotes(listing)}>
            notes {listing.notes?.length ? `(${listing.notes.length})` : ''}
          </ActionBtn>
          {listing.url && (
            <ActionBtn onClick={() => window.open(listing.url, '_blank')} accent>
              view ↗
            </ActionBtn>
          )}
          <ActionBtn onClick={() => onDelete(listing.id)} danger>✕</ActionBtn>
        </div>
      </div>
    </div>
  )
}

function Chip({ children }) {
  return (
    <span style={{
      fontSize: 11, padding: '3px 8px', borderRadius: 20,
      background: '#1c1c1c', color: '#555', border: '1px solid #242424',
    }}>
      {children}
    </span>
  )
}

function ActionBtn({ children, onClick, accent, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, padding: '4px 10px',
        background: 'transparent',
        border: `1px solid ${danger ? '#3a1f1f' : accent ? '#1a3a2a' : '#2a2a2a'}`,
        borderRadius: 4,
        color: danger ? '#7a3a3a' : accent ? '#4a9e6e' : '#666',
        cursor: 'pointer', fontFamily: '"DM Mono", monospace',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = danger ? '#8a3a3a' : accent ? '#4a9e6e' : '#444'}
      onMouseLeave={e => e.currentTarget.style.borderColor = danger ? '#3a1f1f' : accent ? '#1a3a2a' : '#2a2a2a'}
    >
      {children}
    </button>
  )
}
