export default function NepalEmblem({ className = 'h-12 w-12' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Government of Nepal emblem"
    >
      <defs>
        <radialGradient id="emblemBg" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="60%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="emblemSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfdbfe" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="emblemMtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>

      {/* Outer gold ring */}
      <circle cx="32" cy="32" r="30" fill="url(#emblemBg)" stroke="#7c2d12" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="26.5" fill="url(#emblemSky)" stroke="#92400e" strokeWidth="0.8" />

      {/* Mountain (Mt. Everest stylized) */}
      <path
        d="M8 44 L20 28 L26 34 L34 18 L44 32 L50 26 L56 44 Z"
        fill="url(#emblemMtn)"
        stroke="#1e293b"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Snow caps highlights */}
      <path d="M28 26 L34 18 L38 23 L34 24 Z" fill="#ffffff" opacity="0.95" />
      <path d="M16 32 L20 28 L23 31 Z" fill="#ffffff" opacity="0.9" />

      {/* Foreground green hills */}
      <path
        d="M6 50 Q18 42 28 48 Q40 54 58 46 L58 56 L6 56 Z"
        fill="#15803d"
      />
      <path
        d="M6 53 Q20 47 32 51 Q46 55 58 50 L58 56 L6 56 Z"
        fill="#166534"
      />

      {/* Mini Nepal flag silhouette on top-right */}
      <g transform="translate(40 10)">
        <line x1="0" y1="0" x2="0" y2="14" stroke="#7c2d12" strokeWidth="1" strokeLinecap="round" />
        <path d="M0.5 1 L9 5.5 L4 5.5 L9 9 L0.5 11 Z" fill="#dc2626" stroke="#1d4ed8" strokeWidth="0.6" strokeLinejoin="round" />
      </g>

      {/* Sun rays at top */}
      <g stroke="#b45309" strokeWidth="0.8" strokeLinecap="round" opacity="0.7">
        <line x1="32" y1="3" x2="32" y2="6" />
        <line x1="20" y1="6" x2="22" y2="9" />
        <line x1="44" y1="6" x2="42" y2="9" />
      </g>

      {/* Bottom banner */}
      <path
        d="M14 50 Q32 56 50 50 L48 60 Q32 64 16 60 Z"
        fill="#dc2626"
        stroke="#7f1d1d"
        strokeWidth="0.5"
      />
      <text
        x="32"
        y="58"
        textAnchor="middle"
        fontSize="4.2"
        fontWeight="700"
        fill="#fff7ed"
        letterSpacing="0.3"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        नेपाल सरकार
      </text>
    </svg>
  )
}
