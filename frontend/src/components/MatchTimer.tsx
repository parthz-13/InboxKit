import { useEffect, useRef, useState } from 'react'
import { Timer } from 'lucide-react'
import { useGridStore } from '../store/useGridStore'

export function MatchTimer() {
  const matchEndsAt = useGridStore((s) => s.matchEndsAt)
  const matchOver = useGridStore((s) => s.matchOver)
  const [display, setDisplay] = useState('--:--')
  const [urgent, setUrgent] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!matchEndsAt || matchOver) {
      setDisplay(matchOver ? '00:00' : '--:--')
      return
    }

    const end = new Date(matchEndsAt).getTime()

    const tick = () => {
      const remaining = Math.max(0, end - Date.now())
      const totalSec = Math.ceil(remaining / 1000)
      const m = Math.floor(totalSec / 60)
      const s = totalSec % 60
      setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      setUrgent(remaining <= 60_000)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [matchEndsAt, matchOver])

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold font-mono transition-all duration-300 ${
        urgent 
          ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
          : 'bg-slate-50/80 border-slate-200 text-slate-700'
      }`}
    >
      <Timer className={`w-3.5 h-3.5 ${urgent ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
      <span>{display}</span>
    </div>
  )
}
