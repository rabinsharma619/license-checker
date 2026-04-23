import { useState, useEffect, useRef } from 'react'
import SearchBar from './components/SearchBar'
import ResultCard from './components/ResultCard'
import OfficeSelector from './components/OfficeSelector'
import SuccessCelebration from './components/SuccessCelebration'
import Logo from './components/Logo'
import { looksLikeLicenseNumber } from './utils/searchUtils'

export default function App() {
  const [stage, setStage] = useState('loading-manifest')
  const [offices, setOffices] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedOffice, setSelectedOffice] = useState(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [resultTotal, setResultTotal] = useState(0)
  const [truncated, setTruncated] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [celebrateKey, setCelebrateKey] = useState(0)

  const debounceRef = useRef(0)
  const reqIdRef = useRef(0)
  const lastCelebratedRef = useRef('')

  useEffect(() => {
    loadOffices()
  }, [])

  async function loadOffices() {
    try {
      setStage('loading-manifest')
      setError('')
      const res = await fetch('/api/offices')
      if (!res.ok) throw new Error(`offices: HTTP ${res.status}`)
      const data = await res.json()
      setOffices(data.offices || [])
      setTotalRecords(data.totalRecords || 0)
      setStage('pick-office')
    } catch (e) {
      setError(e.message || 'Could not reach server')
      setStage('error')
    }
  }

  function selectOffice(office) {
    setSelectedOffice(office)
    setQuery('')
    setResults(null)
    setError('')
    setStage('searching')
  }

  function backToPicker() {
    setSelectedOffice(null)
    setQuery('')
    setResults(null)
    setError('')
    setStage('pick-office')
  }

  useEffect(() => {
    if (stage !== 'searching' || !selectedOffice) return
    clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults(null)
      setSearching(false)
      return
    }

    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const id = ++reqIdRef.current
      try {
        const url = `/api/search?office=${encodeURIComponent(selectedOffice.shard)}&q=${encodeURIComponent(query)}`
        const res = await fetch(url)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (id !== reqIdRef.current) return
        setResults(data.results || [])
        setResultTotal(data.total || 0)
        setTruncated(!!data.truncated)
        setElapsedMs(data.elapsedMs || 0)
        setSearching(false)
      } catch (e) {
        if (id !== reqIdRef.current) return
        setError(e.message)
        setSearching(false)
      }
    }, 250)

    return () => clearTimeout(debounceRef.current)
  }, [query, stage, selectedOffice])

  const hasHit = Array.isArray(results) && results.length > 0
  const isLicenseQuery = looksLikeLicenseNumber(query)
  const shouldCelebrate = hasHit && isLicenseQuery

  useEffect(() => {
    if (!shouldCelebrate) return
    const key = `${selectedOffice?.shard}|${query.trim().toLowerCase()}`
    if (lastCelebratedRef.current === key) return
    lastCelebratedRef.current = key
    setCelebrateKey(k => k + 1)
  }, [shouldCelebrate, selectedOffice, query])

  return (
    <div className="min-h-screen text-slate-900">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-gradient-to-r from-red-700/95 via-red-600/95 to-blue-700/95 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5 flex items-center gap-3">
          <div className="flex-shrink-0 p-1 rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight leading-tight">
              License Print Status
            </h1>
            <p className="text-[11px] sm:text-xs text-white/80 truncate">
              Department of Transport Management · Government of Nepal
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {stage === 'loading-manifest' && <LoadingCard msg="Loading office list..." />}

        {stage === 'error' && (
          <ErrorCard
            msg={error}
            onRetry={selectedOffice ? () => selectOffice(selectedOffice) : loadOffices}
            onBack={selectedOffice ? backToPicker : null}
          />
        )}

        {stage === 'pick-office' && (
          <>
            <StepHeader current={1} total={2}>Select your license office</StepHeader>
            {totalRecords > 0 && (
              <p className="text-xs text-slate-500 -mt-2">
                {totalRecords.toLocaleString()} records across {offices.length} offices · synced from dotm.gov.np
              </p>
            )}
            <OfficeSelector offices={offices} onSelect={selectOffice} />
          </>
        )}

        {stage === 'searching' && selectedOffice && (
          <>
            <StepHeader current={2} total={2}>
              Search within {selectedOffice.displayName}
            </StepHeader>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {selectedOffice.count.toLocaleString()}
                </span>{' '}
                <span className="text-slate-600">records</span>{' '}
                <span className="text-slate-500">·</span>{' '}
                <span className="font-medium">{selectedOffice.displayName}</span>
              </span>
              <button
                onClick={backToPicker}
                className="text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
              >
                ← Change office
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <SearchBar value={query} onChange={setQuery} />
              <p className="text-xs text-slate-500 mt-2">
                Enter your full name or license number (e.g.{' '}
                <span className="font-mono">04-03-89171469</span>).
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            {query.trim() === '' ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <p className="text-slate-600">Enter your details above to check your print status.</p>
              </div>
            ) : searching ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
                <p className="mt-2 text-sm text-slate-500">Searching...</p>
              </div>
            ) : hasHit ? (
              <div className="space-y-4">
                {shouldCelebrate ? (
                  <SuccessCelebration
                    key={celebrateKey}
                    animate
                    shown={celebrateKey}
                    officeName={selectedOffice.displayName}
                    resultCount={resultTotal}
                    truncated={truncated}
                  />
                ) : (
                  <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5 text-center">
                    <p className="text-lg font-bold text-green-900">
                      {resultTotal.toLocaleString()} matching record{resultTotal === 1 ? '' : 's'} found
                    </p>
                    <p className="text-sm text-green-800 mt-1">
                      Verify the details below match yours before visiting the office.
                    </p>
                  </div>
                )}
                {elapsedMs > 0 && (
                  <p className="text-xs text-slate-400 text-right -mb-2">Searched in {elapsedMs}ms</p>
                )}
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={`${r.licenseNumber}-${r.sn}`} className="anim-card-in" style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                      <ResultCard record={r} highlighted={shouldCelebrate && i === 0} />
                    </div>
                  ))}
                </div>
              </div>
            ) : results && results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div className="mx-auto h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl">
                  ?
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-900">Not printed yet</p>
                <p className="text-sm text-slate-600 mt-1">
                  Your license has not been printed at {selectedOffice.displayName} yet. Please check again later.
                </p>
                <p className="text-xs text-slate-400 mt-3" lang="ne">
                  तपाईंको लाइसेन्स अझै छापिएको छैन। कृपया पछि पुन: जाँच गर्नुहोस्।
                </p>
              </div>
            ) : null}
          </>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-slate-500">
        Data sourced from{' '}
        <a href="https://dotm.gov.np/category/details-of-printed-licenses/" className="hover:text-red-600 underline-offset-2 hover:underline" target="_blank" rel="noreferrer">
          dotm.gov.np
        </a>{' '}
        · Search runs on our server.
      </footer>
    </div>
  )
}

function StepHeader({ current, total, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
        {current}
      </span>
      <span className="font-semibold text-slate-900">{children}</span>
      <span className="text-slate-400 text-xs ml-1">Step {current} of {total}</span>
    </div>
  )
}

function LoadingCard({ msg }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
      <p className="mt-3 text-sm text-slate-600">{msg}</p>
    </div>
  )
}

function ErrorCard({ msg, onRetry, onBack }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm">
      <p className="font-semibold">Something went wrong</p>
      <p className="mt-1">{msg}</p>
      <div className="mt-3 flex gap-2">
        {onRetry && (
          <button onClick={onRetry} className="rounded-lg bg-red-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-red-700 transition-colors">
            Retry
          </button>
        )}
        {onBack && (
          <button onClick={onBack} className="rounded-lg border border-red-300 text-red-700 px-3 py-1.5 text-xs font-medium hover:bg-red-100 transition-colors">
            Change office
          </button>
        )}
      </div>
    </div>
  )
}
