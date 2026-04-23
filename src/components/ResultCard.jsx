export default function ResultCard({ record, highlighted = false }) {
  return (
    <div
      className={`rounded-xl border bg-white shadow-sm hover:shadow-md transition-all p-4 ${
        highlighted ? 'border-green-400 ring-2 ring-green-100' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 text-base sm:text-lg leading-tight break-words">
            {record.name}
          </h3>
          <p className="font-mono text-sm text-slate-700 mt-1 tracking-wide">
            {record.licenseNumber}
          </p>
        </div>
        <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-8 8a1 1 0 01-1.42 0l-4-4a1 1 0 111.42-1.42L8 12.584l7.29-7.294a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Printed
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <Metric label="S.N." value={record.sn} />
        <Metric label="Category" value={record.category} />
        <Metric label="Office" value={record.office} />
        <Metric label="Printed" value={record.printDate} />
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div>
      <span className="text-slate-400 uppercase tracking-wide text-[10px] font-medium">{label}</span>{' '}
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  )
}
