import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export default function SuccessCelebration({ officeName, resultCount, animate, truncated, shown }) {
  const fired = useRef(false)

  useEffect(() => {
    if (!animate || fired.current) return
    fired.current = true
    const defaults = {
      origin: { y: 0.3 },
      colors: ['#dc2626', '#1d4ed8', '#10b981', '#f59e0b'],
      zIndex: 50,
    }
    confetti({ ...defaults, particleCount: 70, spread: 70, startVelocity: 35 })
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 40, spread: 90, origin: { x: 0.2, y: 0.4 } })
      confetti({ ...defaults, particleCount: 40, spread: 90, origin: { x: 0.8, y: 0.4 } })
    }, 180)
  }, [animate])

  useEffect(() => {
    fired.current = false
  }, [shown])

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 sm:p-8 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none" />
      <div className="relative">
        <svg viewBox="0 0 56 56" className="mx-auto h-16 w-16 sm:h-20 sm:w-20">
          <circle cx="28" cy="28" r="26" fill="#10b981" className="anim-circle-pop" />
          <path
            d="M15 28.5l9 9 18-18"
            stroke="white"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="anim-check-draw"
          />
        </svg>
        <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-green-900 anim-fade-up">
          Your license is ready!
        </h3>
        <p className="mt-2 text-sm sm:text-base text-green-800 anim-fade-up anim-delay-1">
          {resultCount === 1
            ? `Please collect it from the ${officeName} office.`
            : `${resultCount.toLocaleString()} matching record${resultCount === 1 ? '' : 's'} found${truncated ? ' (showing first page)' : ''} — verify the details below.`}
        </p>
      </div>
    </div>
  )
}
