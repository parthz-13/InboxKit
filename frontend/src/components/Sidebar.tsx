import { useEffect, useRef } from 'react'
import { Activity, Zap, Wifi, User } from 'lucide-react'
import { useGridStore } from '../store/useGridStore'
import { Leaderboard } from './Leaderboard'

export function Sidebar() {
  const currentUser = useGridStore((s) => s.currentUser)
  const cooldownUntil = useGridStore((s) => s.cooldownUntil)
  const isConnected = useGridStore((s) => s.isConnected)
  const leaderboard = useGridStore((s) => s.leaderboard)
  const barRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  const myCount = leaderboard.find((e) => e.name === currentUser?.name)?.count ?? 0

  useEffect(() => {
    const animate = () => {
      const remaining = Math.max(0, cooldownUntil - Date.now())
      const pct = cooldownUntil > 0 ? (remaining / 3000) * 100 : 0
      
      if (barRef.current) {
        barRef.current.style.width = `${pct}%`
        barRef.current.style.backgroundColor = pct > 0 ? '#f43f5e' : '#10b981'
      }
      
      if (textRef.current) {
        textRef.current.innerText = remaining > 0 ? `${(remaining / 1000).toFixed(1)}s` : 'Ready'
        textRef.current.className = `font-mono text-xs font-bold ${remaining > 0 ? 'text-rose-500' : 'text-emerald-500'}`
      }
      
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [cooldownUntil])

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col gap-6 p-6 bg-white border-l border-slate-200/80 overflow-y-auto shadow-[[-2px]_0_10px_rgba(0,0,0,0.01)] font-sans">
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          Your Profile
        </p>
        
        {currentUser ? (
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform"
                style={{
                  backgroundColor: currentUser.color,
                  boxShadow: `0 4px 12px -2px ${currentUser.color}50`,
                }}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Challenger</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-600 bg-white border border-slate-200/30 px-3 py-2.5 rounded-xl">
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                Tiles Claimed
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                {myCount}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">—</p>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between uppercase tracking-widest text-[10px] font-bold text-slate-400">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            Cooldown
          </span>
          <span ref={textRef} className="font-mono">Ready</span>
        </div>
        
        <div className="h-2.5 bg-slate-100 border border-slate-200/30 rounded-full overflow-hidden">
          <div ref={barRef} className="h-full rounded-full transition-none" style={{ width: '0%' }} />
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <Leaderboard />
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5 font-medium text-slate-400">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500' : 'text-slate-400'}`} />
          Server Status
        </span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
          isConnected 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
        }`}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    </aside>
  )
}
