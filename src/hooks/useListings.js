import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setListings(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()

    // Real-time subscription so all roommates see updates instantly
    const channel = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        fetch()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [fetch])

  async function fetchImageUrl(url) {
    if (!url) return null
    try {
      const res = await window.fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      return data?.data?.image?.url || null
    } catch {
      return null
    }
  }

  async function addListing(listing) {
    // Sanitize text fields to prevent XSS stored in DB
    const safe = Object.fromEntries(
      Object.entries(listing).map(([k, v]) =>
        [k, typeof v === 'string' ? v.replace(/[<>]/g, '') : v]
      )
    )
    if (!safe.image_url && safe.url) {
      safe.image_url = await fetchImageUrl(safe.url)
    }
    const { error } = await supabase.from('listings').insert([safe])
    if (error) throw new Error(error.message)
  }

  async function updateListing(id, updates) {
    const safe = Object.fromEntries(
      Object.entries(updates).map(([k, v]) =>
        [k, typeof v === 'string' ? v.replace(/[<>]/g, '') : v]
      )
    )
    const { error } = await supabase.from('listings').update(safe).eq('id', id)
    if (error) throw new Error(error.message)
  }

  async function deleteListing(id) {
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async function addNote(listingId, author, text) {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return
    const safeText = text.replace(/[<>]/g, '')
    const safeAuthor = author.replace(/[<>]/g, '')
    const notes = [...(listing.notes || []), { author: safeAuthor, text: safeText, ts: Date.now() }]
    await updateListing(listingId, { notes })
  }

  async function deleteNote(listingId, ts) {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return
    const notes = (listing.notes || []).filter(n => n.ts !== ts)
    await updateListing(listingId, { notes })
  }

  async function toggleVote(listingId, person) {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return
    const votes = { ...(listing.votes || {}) }
    votes[person] = !votes[person]
    await updateListing(listingId, { votes })
  }

  async function setRating(listingId, person, stars) {
    const listing = listings.find(l => l.id === listingId)
    if (!listing) return
    const ratings = { ...(listing.ratings || { P1: null, P2: null, P3: null, P4: null }) }
    ratings[person] = stars
    await updateListing(listingId, { ratings })
  }

  return { listings, loading, error, addListing, updateListing, deleteListing, addNote, deleteNote, toggleVote, setRating, refetch: fetch }
}
