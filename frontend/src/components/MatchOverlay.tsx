import { useEffect, useState } from 'react'
import { Trophy, Medal, Home } from 'lucide-react'
import { useGridStore } from '../store/useGridStore'

interface MatchOverlayProps {
  onGoHome: () => void
}

export function MatchOverlay({ onGoHome }: MatchOverlayProps) {
  const matchOver = useGridStore((s) => s.matchOver)
  const finalLeaderboard = useGridStore((s) => s.finalLeaderboard)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!matchOver) {
      setCountdown(5)
      return
    }
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval)
          onGoHome()
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [matchOver])

  if (!matchOver) return null

  const winner = finalLeaderboard[0]
  const runnersUp = finalLeaderboard.slice(1, 5)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md font-sans">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
        <h2 className="text-3xl font-extrabold font-serif text-slate-900 mb-4 tracking-tight">Match Over!</h2>

        {winner && (
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-5 mb-6 flex flex-col items-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.05)]">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Champion</p>
              <h3 className="text-base font-bold text-slate-800 mt-0.5 flex items-center justify-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block border border-white shadow-sm"
                  style={{ backgroundColor: winner.color }}
                />
                {winner.name}
              </h3>
              <p className="text-xs text-amber-700/80 font-mono font-bold mt-0.5">
                {winner.count} tile{winner.count !== 1 ? 's' : ''} claimed
              </p>
            </div>
          </div>
        )}

        {runnersUp.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left mb-2.5 flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-slate-400" />
              Final Standings
            </p>
            <ol className="text-left space-y-2 max-h-48 overflow-y-auto pr-1">
              {runnersUp.map((entry, i) => (
                <li key={entry.name} className="flex items-center gap-2.5 text-xs py-1 border-b border-slate-50 last:border-b-0">
                  <span className="text-slate-400 font-mono font-bold w-4 text-right">{i + 2}.</span>
                  <span
                    className="w-2.5 h-2.5 rounded-md flex-shrink-0 border border-white shadow-sm"
                    style={{ backgroundColor: entry.color, boxShadow: `0 2px 4px ${entry.color}40` }}
                  />
                  <span className="flex-1 text-slate-700 font-medium truncate">{entry.name}</span>
                  <span className="text-slate-500 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{entry.count}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-semibold">
            Redirecting to home in <span className="font-mono text-slate-800">{countdown}s</span>…
          </span>
        </div>
      </div>
    </div>
  )
}
