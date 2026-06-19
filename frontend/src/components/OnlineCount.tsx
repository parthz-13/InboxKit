import { Users } from 'lucide-react'
import { useGridStore } from '../store/useGridStore'

export function OnlineCount() {
  const onlineCount = useGridStore((s) => s.onlineCount)
  const isConnected = useGridStore((s) => s.isConnected)

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/80 border border-slate-200 text-xs font-bold text-slate-700 font-sans">
      <Users className="w-3.5 h-3.5 text-brand-500" />
      <span>{onlineCount} online</span>
      {isConnected && (
        <span className="relative flex h-1.5 w-1.5 ml-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
      )}
    </div>
  )
}
