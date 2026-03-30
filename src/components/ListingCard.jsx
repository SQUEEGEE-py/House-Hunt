const STATUS_COLORS = {
  new:     { bg: '#1a2a1a', text: '#4a9e6e', border: '#2a3e2a' },
  tour:    { bg: '#1a2233', text: '#5b8dd9', border: '#2a3355' },
  applied: { bg: '#2a2210', text: '#c8962a', border: '#3a3010' },
  pass:    { bg: '#222',    text: '#555',    border: '#2a2a2a' },
}

const VOTERS = ['P1', 'P2', 'P3', 'P4']
const VOTER_LABELS = ['Justin', 'Jake', 'Cayden', 'Mateo']

import { useEffect } from 'react'
import './ListingCard.css'

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
    if ((listing.lat == null || !listing.neighborhood) && listing.address) {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.address)}&format=json&limit=1&addressdetails=1`, {
        headers: { 'User-Agent': 'DenverHouseHunt/1.0' }
      })
        .then(r => r.json())
        .then(data => {
          if (!data[0]) return
          const updates = {}
          if (listing.lat == null) {
            updates.lat = parseFloat(data[0].lat)
            updates.lng = parseFloat(data[0].lon)
          }
          if (!listing.neighborhood) {
            const addr = data[0].address || {}
            const hood = addr.neighbourhood || addr.suburb || addr.quarter || addr.city_district || null
            if (hood) updates.neighborhood = hood
          }
          if (Object.keys(updates).length) onUpdate(listing.id, updates)
        })
        .catch(() => {})
    }
  }, [listing.id])

  return (
    <div className="listing-card" style={{
      background: '#141414',
      border: '1px solid #1e1e1e',
      borderRadius: 6,
      fontFamily: 'system-ui, sans-serif',
      transition: 'border-color 0.15s',
      display: 'flex',
      overflow: 'hidden',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
    onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
    >
      {/* Image */}
      {listing.image_url && (
        <div className="listing-card-image" style={{ overflow: 'hidden' }}>
          <img
            src={listing.image_url}
            alt={listing.address}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.currentTarget.parentElement.style.display = 'none' }}
          />
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>

        {/* Address + price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {listing.url
              ? <a href={listing.url} target="_blank" rel="noreferrer" style={{ fontSize: 18, color: '#e8e6e0', fontWeight: 600, display: 'block', textDecoration: 'none', lineHeight: 1.3 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4a9e6e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#e8e6e0'}
                >{listing.address} ↗</a>
              : <div style={{ fontSize: 18, color: '#e8e6e0', fontWeight: 600, lineHeight: 1.3 }}>{listing.address}</div>
            }
            {listing.neighborhood && (
              <div style={{ fontSize: 13, color: '#555', fontFamily: '"DM Mono", monospace', marginTop: 3 }}>{listing.neighborhood}</div>
            )}
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 22, color: '#4a9e6e', fontFamily: '"DM Mono", monospace', fontWeight: 600 }}>
              {listing.price ? `$${listing.price.toLocaleString()}/mo` : '—'}
            </div>
            {listing.price && (
              <div style={{ fontSize: 12, color: '#444', marginTop: 3, fontFamily: '"DM Mono", monospace' }}>
                ${Math.round(listing.price / 4).toLocaleString()}/person
              </div>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
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

        {/* Star ratings */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {VOTERS.map((v) => {
            const rating = listing.ratings?.[v] ?? 0
            return (
              <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#555', fontFamily: '"DM Mono", monospace', width: 20 }}>{v}</span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => onSetRating(listing.id, v, rating === star ? null : star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px', fontSize: 18, color: star <= rating ? '#c8962a' : '#2a2a2a', lineHeight: 1, transition: 'color 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.color = star <= rating ? '#e0a830' : '#444'}
                    onMouseLeave={e => e.currentTarget.style.color = star <= rating ? '#c8962a' : '#2a2a2a'}
                  >★</button>
                ))}
              </div>
            )
          })}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 'auto' }}>
          {/* Vote buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            {VOTERS.map((v, i) => (
              <button
                key={v}
                onClick={() => onToggleVote(listing.id, v)}
                title={`${VOTER_LABELS[i]} vote`}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  border: `1px solid ${listing.votes?.[v] ? '#4a9e6e' : '#2a2a2a'}`,
                  background: listing.votes?.[v] ? '#1c2e24' : '#1a1a1a',
                  color: listing.votes?.[v] ? '#4a9e6e' : '#444',
                  fontSize: 11, cursor: 'pointer', fontFamily: '"DM Mono", monospace',
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
