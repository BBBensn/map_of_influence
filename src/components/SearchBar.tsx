import { useState, useRef, useEffect, useCallback } from 'react'
import { searchWikidata } from '../services/wikidata'
import type { WikidataSearchResult } from '../types/graph'

interface Props {
  onSelect: (result: WikidataSearchResult) => void
  disabled?: boolean
}

export function SearchBar({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<WikidataSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ignoreNextRef = useRef(false)

  const search = useCallback(async (q: string) => {
    if (ignoreNextRef.current) {
      ignoreNextRef.current = false
      return
    }
    if (q.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const res = await searchWikidata(q)
    setResults(res)
    setOpen(res.length > 0)
    setActiveIndex(-1)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 280)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(result: WikidataSearchResult) {
    ignoreNextRef.current = true
    setQuery(result.label)
    setOpen(false)
    setResults([])
    onSelect(result)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '480px' }}>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setOpen(true) }}
        placeholder="Search for a philosopher, thinker, movement…"
        disabled={disabled}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          color: '#f1f5f9',
          fontSize: '15px',
          fontFamily: 'Inter, system-ui, sans-serif',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onMouseOver={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.4)' }}
        onMouseOut={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
      />
      {open && (
        <ul style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#12121a',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '4px',
          margin: 0,
          listStyle: 'none',
          zIndex: 100,
          boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
        }}>
          {results.map((r, i) => (
            <li
              key={r.id}
              onMouseDown={() => handleSelect(r)}
              style={{
                padding: '10px 12px',
                borderRadius: '7px',
                cursor: 'pointer',
                background: i === activeIndex ? 'rgba(99,102,241,0.15)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 500 }}>{r.label}</div>
              {r.description && (
                <div style={{ color: '#64748b', fontSize: '12px', marginTop: '2px' }}>
                  {r.description.slice(0, 80)}{r.description.length > 80 ? '…' : ''}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
