import { useMemo, useState } from 'react'
import { OFFICE_COORDS } from '../data/officeCoords'

export default function OfficeList({ offices, onSelect }) {
  const [filter, setFilter] = useState('')

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return offices
    return offices.filter(o =>
      o.displayName.toLowerCase().includes(q) ||
      (o.office && o.office.toLowerCase().includes(q)) ||
      (OFFICE_COORDS[o.shard]?.region || '').toLowerCase().includes(q)
    )
  }, [offices, filter])

  return (
    <div className="p-4 space-y-3">
      <div className="relative">
        <svg viewBox="0 0 20 20" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400">
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter offices (Saptari, Jhapa, Kathmandu...)"
          className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent focus:bg-white focus:outline-none transition"
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[28rem] overflow-y-auto pr-1">
        {filtered.map(o => {
          const region = OFFICE_COORDS[o.shard]?.region
          return (
            <button
              key={o.shard}
              type="button"
              onClick={() => onSelect(o)}
              className="group text-left rounded-lg border border-slate-200 bg-white hover:border-red-400 hover:bg-red-50/40 hover:shadow-sm px-3 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="font-semibold text-slate-900 text-sm truncate group-hover:text-red-700 transition-colors">
                {o.displayName}
              </div>
              {region && (
                <div className="text-[10.5px] text-slate-500 truncate mt-0.5">{region}</div>
              )}
              <div className="text-xs text-slate-600 mt-1 tabular-nums">
                {o.count.toLocaleString()} <span className="text-slate-400">records</span>
              </div>
            </button>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-6">
          No office matches &ldquo;{filter}&rdquo;
        </p>
      )}
    </div>
  )
}
