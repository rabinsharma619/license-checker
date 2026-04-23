export default function SearchBar({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2 items-stretch">
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter your name or license number"
          disabled={disabled}
          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-slate-100 disabled:text-slate-400"
          aria-label="Search name or license number"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
