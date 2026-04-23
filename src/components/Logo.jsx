export default function Logo({ className = 'h-10 w-10' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="DoTM License Checker" role="img">
      <defs>
        <linearGradient id="logoBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="logoCheck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="3" y="10" width="42" height="28" rx="5" fill="url(#logoBody)" />
      <rect x="7" y="14" width="11" height="14" rx="2" fill="white" opacity="0.97" />
      <circle cx="12.5" cy="19" r="2.3" fill="#dc2626" opacity="0.35" />
      <rect x="9" y="23" width="7" height="1.2" rx="0.6" fill="#64748b" opacity="0.7" />
      <rect x="9" y="25.2" width="5" height="1.2" rx="0.6" fill="#64748b" opacity="0.5" />
      <rect x="21" y="15" width="18" height="1.8" rx="0.9" fill="white" opacity="0.95" />
      <rect x="21" y="18.4" width="14" height="1.8" rx="0.9" fill="white" opacity="0.75" />
      <rect x="21" y="21.8" width="16" height="1.8" rx="0.9" fill="white" opacity="0.75" />
      <rect x="7" y="30.5" width="30" height="1.3" rx="0.6" fill="white" opacity="0.5" />
      <rect x="7" y="33" width="24" height="1.3" rx="0.6" fill="white" opacity="0.4" />
      <circle cx="38" cy="37" r="7.5" fill="url(#logoCheck)" stroke="white" strokeWidth="1.8" />
      <path d="M34.3 37l2.8 2.8 4.7-4.7" stroke="white" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
