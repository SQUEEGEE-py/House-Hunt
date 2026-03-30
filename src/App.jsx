import { useState, useMemo } from 'react'
import { useAuth } from './lib/auth'
import { useListings } from './hooks/useListings'
import LoginScreen from './components/LoginScreen'
import ListingCard from './components/ListingCard'
import AddListingModal from './components/AddListingModal'
import NotesModal from './components/NotesModal'

const MONO = '"DM Mono", "Courier New", monospace'

export default function App() {
  const { authed, loading: authLoading, logout } = useAuth()

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#333', fontFamily: MONO, fontSize: 13 }}>loading...</span>
    </div>
  )

  if (!authed) return <LoginScreen />

  return <Dashboard onLogout={logout} />
}

function Dashboard({ onLogout }) {
  const { listings, loading, error, addListing, updateListing, deleteListing, addNote, deleteNote, editNote, toggleVote, setRating } = useListings()
  const [showAdd, setShowAdd] = useState(false)
  const [notesListingId, setNotesListingId] = useState(null)
  const notesListing = notesListingId ? listings.find(l => l.id === notesListingId) ?? null : null

  // Filters
  const [maxPrice, setMaxPrice] = useState('')
  const [minBeds, setMinBeds] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hoodFilter, setHoodFilter] = useState('')
  const [maxDist, setMaxDist] = useState(5)
  const [customDist, setCustomDist] = useState(false)
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const WASH_PARK = { lat: 39.7084, lng: -104.9631 }

  function distanceMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  const filtered = useMemo(() => {
    const result = listings.filter(l => {
      if (maxPrice && l.price > parseInt(maxPrice)) return false
      if (minBeds && l.beds < parseInt(minBeds)) return false
      if (statusFilter && l.status !== statusFilter) return false
      if (hoodFilter && !l.neighborhood?.toLowerCase().includes(hoodFilter.toLowerCase())) return false
      if (maxDist < 10 && l.lat != null && l.lng != null) {
        if (distanceMiles(l.lat, l.lng, WASH_PARK.lat, WASH_PARK.lng) > maxDist) return false
      }
      return true
    })
    result.sort((a, b) => {
      let av = a[sortField], bv = b[sortField]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'string') av = av.toLowerCase(), bv = bv.toLowerCase()
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [listings, maxPrice, minBeds, statusFilter, hoodFilter, maxDist, sortField, sortDir])

  const stats = useMemo(() => {
    const withPrice = filtered.filter(l => l.price)
    return {
      total: listings.length,
      toTour: listings.filter(l => l.status === 'tour').length,
      applied: listings.filter(l => l.status === 'applied').length,
      avgPrice: withPrice.length
        ? Math.round(withPrice.reduce((a, l) => a + l.price, 0) / withPrice.length)
        : null,
    }
  }, [listings, filtered])

  const SEL = { padding: '7px 10px', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 4, color: '#888', fontSize: 12, fontFamily: MONO, outline: 'none', cursor: 'pointer' }
  const INP = { ...SEL, minWidth: 100 }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#e8e6e0' }}>
      {/* Beta banner */}
      <div style={{ background: '#2a1f0a', borderBottom: '1px solid #3a2e10', padding: '8px 1.5rem', textAlign: 'center', fontSize: 12, color: '#c8962a', fontFamily: '"DM Mono", monospace', letterSpacing: '0.05em' }}>
        beta version — things may break and data is test data
      </div>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: '#4a9e6e', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: MONO }}>Denver House Hunt</div>
          <div style={{ fontSize: 20, color: '#e8e6e0', marginTop: 2, fontFamily: MONO }}>your listings</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowAdd(true)}
            style={{ padding: '8px 16px', background: '#4a9e6e', border: '1px solid #4a9e6e', borderRadius: 4, color: '#0f0f0f', cursor: 'pointer', fontSize: 12, fontFamily: MONO }}
          >
            + add listing
          </button>
          <button onClick={onLogout} style={{ padding: '8px 12px', background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, color: '#444', cursor: 'pointer', fontSize: 12, fontFamily: MONO }}>
            sign out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '1rem 1.5rem' }}>
        {[
          { label: 'total', value: stats.total },
          { label: 'to tour', value: stats.toTour },
          { label: 'avg rent', value: stats.avgPrice ? `$${stats.avgPrice.toLocaleString()}` : '—' },
          { label: 'applied', value: stats.applied },
        ].map(s => (
          <div key={s.label} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 4, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: MONO, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontFamily: MONO, color: '#e8e6e0' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>max rent</label>
          <select style={SEL} value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
            <option value="">any</option>
            {[2000, 2500, 3000, 3500, 4000].map(p => <option key={p} value={p}>${p.toLocaleString()}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>min beds</label>
          <select style={SEL} value={minBeds} onChange={e => setMinBeds(e.target.value)}>
            <option value="">any</option>
            {[2, 3, 4].map(b => <option key={b} value={b}>{b}+</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>status</label>
          <select style={SEL} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">all</option>
            <option value="new">new</option>
            <option value="tour">tour it</option>
            <option value="applied">applied</option>
            <option value="pass">pass</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>neighborhood</label>
          <input style={INP} placeholder="e.g. Highland" value={hoodFilter} onChange={e => setHoodFilter(e.target.value)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            from wash park {maxDist < 10 ? `≤ ${maxDist} mi` : 'any'}
          </label>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select style={SEL} value={customDist ? 'custom' : maxDist} onChange={e => {
              if (e.target.value === 'custom') { setCustomDist(true) }
              else { setCustomDist(false); setMaxDist(parseFloat(e.target.value)) }
            }}>
              {[1, 2, 3, 5, 7.5, 10].map(d => <option key={d} value={d}>{d < 10 ? `${d} mi` : 'any'}</option>)}
              <option value="custom">custom</option>
            </select>
            {customDist && <>
              <input
                type="range" min={0.5} max={10} step={0.5} value={maxDist}
                onChange={e => setMaxDist(parseFloat(e.target.value))}
                style={{ width: 80, accentColor: '#4a9e6e', cursor: 'pointer' }}
              />
              <input
                type="number" min={0.5} max={10} step={0.5} value={maxDist}
                onChange={e => {
                  const v = parseFloat(e.target.value)
                  if (!isNaN(v)) setMaxDist(Math.min(10, Math.max(0.5, v)))
                }}
                style={{ ...INP, width: 52 }}
              />
            </>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 10, color: '#444', fontFamily: MONO, letterSpacing: '0.1em', textTransform: 'uppercase' }}>sort by</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <select style={SEL} value={sortField} onChange={e => setSortField(e.target.value)}>
              <option value="created_at">date added</option>
              <option value="price">price</option>
              <option value="beds">beds</option>
              <option value="baths">baths</option>
              <option value="sqft">sqft</option>
              <option value="available_date">available date</option>
              <option value="neighborhood">neighborhood</option>
              <option value="address">address</option>
              <option value="status">status</option>
            </select>
            <button
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              style={{ padding: '7px 10px', background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, color: '#888', cursor: 'pointer', fontSize: 12, fontFamily: MONO }}
            >
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        {(maxPrice || minBeds || statusFilter || hoodFilter || maxDist !== 5 || customDist) && (
          <button onClick={() => { setMaxPrice(''); setMinBeds(''); setStatusFilter(''); setHoodFilter(''); setMaxDist(5); setCustomDist(false) }}
            style={{ padding: '7px 12px', background: 'none', border: '1px solid #2a2a2a', borderRadius: 4, color: '#555', cursor: 'pointer', fontSize: 11, fontFamily: MONO, alignSelf: 'flex-end' }}>
            clear
          </button>
        )}
      </div>

      {/* Listings */}
      <div style={{ padding: '0 1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <div style={{ fontSize: 13, color: '#444', fontFamily: MONO, padding: '2rem 0' }}>loading listings...</div>}
        {error && <div style={{ fontSize: 13, color: '#c0614a', padding: '1rem 0' }}>Error: {error}</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#333', fontFamily: MONO, fontSize: 13 }}>
            {listings.length === 0 ? 'no listings yet — add your first one' : 'no listings match your filters'}
          </div>
        )}
        {filtered.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onUpdate={updateListing}
            onDelete={deleteListing}
            onOpenNotes={l => setNotesListingId(l.id)}
            onToggleVote={toggleVote}
            onSetRating={setRating}
          />
        ))}
      </div>

      {showAdd && <AddListingModal onAdd={addListing} onClose={() => setShowAdd(false)} />}
      {notesListing && (
        <NotesModal
          listing={notesListing}
          onAddNote={addNote}
          onDeleteNote={deleteNote}
          onEditNote={editNote}
          onClose={() => setNotesListingId(null)}
        />
      )}
    </div>
  )
}
