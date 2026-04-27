export default function NepalFlag({ className = 'h-10 w-8', poleHeight = 56 }) {
  return (
    <span
      className={`nepal-flag inline-flex items-end ${className}`}
      role="img"
      aria-label="Flag of Nepal"
      style={{ height: poleHeight }}
    >
      <span className="nepal-flag__pole" />
      <svg
        viewBox="0 0 100 124"
        className="nepal-flag__cloth"
        preserveAspectRatio="xMinYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nepalCrimson" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e63946" />
            <stop offset="100%" stopColor="#c81d25" />
          </linearGradient>
        </defs>
        {/* Outer blue border, formed by two stacked triangles */}
        <path
          d="M0 0 L92 56 L36 56 L92 100 L0 124 Z"
          fill="#003893"
        />
        {/* Inner crimson field */}
        <path
          d="M5 6 L80 58 L29 58 L80 96 L5 116 Z"
          fill="url(#nepalCrimson)"
        />
        {/* Crescent moon (top pennant) */}
        <g transform="translate(20 26)">
          <circle cx="9" cy="9" r="9" fill="#ffffff" />
          <circle cx="11" cy="7" r="7" fill="#c81d25" />
          {/* Moon's face rays — small dots */}
          <g fill="#ffffff" opacity="0.95">
            <circle cx="6" cy="9" r="0.8" />
          </g>
        </g>
        {/* Sun (bottom pennant) */}
        <g transform="translate(20 70)">
          <circle cx="9" cy="9" r="6" fill="#ffffff" />
          <g stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round">
            <line x1="9" y1="-1" x2="9" y2="2.5" />
            <line x1="9" y1="15.5" x2="9" y2="19" />
            <line x1="-1" y1="9" x2="2.5" y2="9" />
            <line x1="15.5" y1="9" x2="19" y2="9" />
            <line x1="2" y1="2" x2="4.5" y2="4.5" />
            <line x1="13.5" y1="13.5" x2="16" y2="16" />
            <line x1="2" y1="16" x2="4.5" y2="13.5" />
            <line x1="13.5" y1="4.5" x2="16" y2="2" />
          </g>
        </g>
      </svg>
    </span>
  )
}
