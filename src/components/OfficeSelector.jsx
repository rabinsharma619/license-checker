import { lazy, Suspense, useState } from 'react'
import OfficeList from './OfficeList'

const OfficeMap = lazy(() => import('./OfficeMap'))

export default function OfficeSelector({ offices, onSelect }) {
  const [view, setView] = useState('map')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex border-b border-slate-200 bg-slate-50/60">
        <TabButton active={view === 'map'} onClick={() => setView('map')}>
          <MapIcon />
          Map
        </TabButton>
        <TabButton active={view === 'list'} onClick={() => setView('list')}>
          <ListIcon />
          List
        </TabButton>
      </div>
      {view === 'map' ? (
        <Suspense fallback={<MapFallback />}>
          <OfficeMap offices={offices} onSelect={onSelect} />
        </Suspense>
      ) : (
        <OfficeList offices={offices} onSelect={onSelect} />
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
        active
          ? 'text-red-700 border-red-600 bg-white'
          : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-white/50'
      }`}
    >
      {children}
    </button>
  )
}

function MapIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.243 1 1 0 010-1.414zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
    </svg>
  )
}

function MapFallback() {
  return (
    <div className="h-[480px] flex items-center justify-center bg-slate-50">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
    </div>
  )
}
